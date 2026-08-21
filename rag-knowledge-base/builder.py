"""
Builder — RAG 知识库构建器（双后端：FAISS / Chroma）

后端切换（环境变量 VECTOR_BACKEND）:
  faiss   (默认) — FAISS IndexFlatIP + metadata.json
  chroma          — ChromaDB PersistentClient

Chroma 注意事项（历史 Bug 修复）:
  - 不用 delete(where={})  → 改用 delete_collection / 按 id 删除
  - Chroma 1.5+ 不允许空 metadata {}  → 传入 None 代替
  - Chroma 1.5+ 不允许空 where={}    → 删除条件必须带具体字段

流程: 清洗(R1+R2+R3/Qwen3-14B) → 文档总结(Qwen3-14B) → 分片 → 嵌入 → 智能分类(Qwen3-14B) → 向量存储
"""

import json
import os
import sys
import shutil
import uuid
from pathlib import Path
from typing import List, Optional, Dict, Any

# 动态查找项目根（向上遍历直到找到 rag_knowledge_base/ 目录）
def _find_project_root(path: Path) -> Path:
    for p in [path, *path.parents]:
        if (p / "rag_knowledge_base").is_dir():
            return p
    return path.parent  # fallback

_project_root = str(_find_project_root(Path(__file__).resolve()))
if _project_root not in sys.path:
    sys.path.insert(0, _project_root)

import numpy as np

# ── 从 config.py 加载配置（模块级常量，只加载一次） ──
from rag_knowledge_base.config import (
    VECTOR_DIR, RAW_DIR, CLEANED_DIR, CHROMA_DIR,
    EMBEDDING_MODEL, EMBED_BACKEND,
    CHUNK_SIZE, CHUNK_OVERLAP,
    VECTOR_BACKEND as _CFG_VECTOR_BACKEND,
    COLLECTION_NAME,
    SEMANTIC_CHUNKING,
    ENABLE_COUNTRY_DETECTION,
    get_vector_dir
)



# 语义分片函数已内置于本文件底部 (见 _extract_title / _extract_date / _detect_language / _semantic_split)

# 运行时配置（每次从 os.environ 重读，支持 CLI --no-qwen3 等临时覆盖）
import rag_knowledge_base.config as _cfg_module

def _cfg_str(key: str, default: str) -> str:
    return os.environ.get(key, str(getattr(_cfg_module, key, default)))

def _cleaner_backend():
    return _cfg_str("CLEANER_BACKEND", "qwen3")

def _cleaner_threshold():
    return float(_cfg_str("CLEANER_THRESHOLD", "0.5"))

def _enable_auto_classify():
    return _cfg_str("ENABLE_AUTO_CLASSIFY", "true").lower() == "true"

def _enable_advanced_summary():
    return _cfg_str("ENABLE_ADVANCED_SUMMARY", "true").lower() == "true"

def _vector_backend():
    return _cfg_str("VECTOR_BACKEND", _CFG_VECTOR_BACKEND)


# ===================================================================
# Embedding 模型
# ===================================================================

def create_embed_model():
    """创建 embedding 模型实例（单例缓存，本地优先）"""
    if hasattr(create_embed_model, "_cache"):
        return create_embed_model._cache

    # ★ 在所有 import 之前设离线环境变量，阻止一切联网
    import os as _os
    _old_offline_hf = _os.environ.get("HF_HUB_OFFLINE")
    _old_offline_tr = _os.environ.get("TRANSFORMERS_OFFLINE")
    _os.environ["HF_HUB_OFFLINE"] = "1"
    _os.environ["TRANSFORMERS_OFFLINE"] = "1"

    from llama_index.embeddings.huggingface import HuggingFaceEmbedding

    is_qwen = EMBED_BACKEND.startswith("qwen") or "qwen" in str(EMBEDDING_MODEL).lower()

    try:
        if is_qwen:
            model = HuggingFaceEmbedding(
                model_name=EMBEDDING_MODEL,
                trust_remote_code=True,
                query_instruction="为这个句子生成表示以用于检索相关文章：",
            )
            print(f"  📐 Qwen 模型已加载（本地） | instruction 前缀已启用")
        else:
            model = HuggingFaceEmbedding(
                model_name=EMBEDDING_MODEL,
                trust_remote_code=True,
            )
            print(f"  📐 BGE 模型已加载（本地）")
    except Exception as e:
        # 本地没有，放联网下载
        if _old_offline_hf is None:
            del _os.environ["HF_HUB_OFFLINE"]
        else:
            _os.environ["HF_HUB_OFFLINE"] = _old_offline_hf
        if _old_offline_tr is None:
            del _os.environ["TRANSFORMERS_OFFLINE"]
        else:
            _os.environ["TRANSFORMERS_OFFLINE"] = _old_offline_tr
        print(f"  🔍 本地缓存未找到 ({e})")
        print(f"  📡 尝试联网下载模型: {EMBEDDING_MODEL}")
        if is_qwen:
            model = HuggingFaceEmbedding(
                model_name=EMBEDDING_MODEL,
                trust_remote_code=True,
                query_instruction="为这个句子生成表示以用于检索相关文章：",
            )
            print(f"  📐 Qwen 模型已加载（联网） | instruction 前缀已启用")
        else:
            model = HuggingFaceEmbedding(
                model_name=EMBEDDING_MODEL,
                trust_remote_code=True,
            )
            print(f"  📐 BGE 模型已加载（联网）")
    else:
        if _old_offline_hf is None:
            del _os.environ["HF_HUB_OFFLINE"]
        else:
            _os.environ["HF_HUB_OFFLINE"] = _old_offline_hf
        if _old_offline_tr is None:
            del _os.environ["TRANSFORMERS_OFFLINE"]
        else:
            _os.environ["TRANSFORMERS_OFFLINE"] = _old_offline_tr

    try:
        if hasattr(model, '_model'):
            dim_fn = getattr(model._model, 'get_embedding_dimension', None) or \
                     getattr(model._model, 'get_sentence_embedding_dimension', None)
            dim = dim_fn() if dim_fn else "?"
        else:
            dim = "?"
        print(f"  📏 模型维度: {dim}")
    except:
        pass
    create_embed_model._cache = model
    return model









# ===================================================================
# Chroma EmbeddingFunction 包装
# ===================================================================

class _ChromaEmbeddingWrapper:
    def __init__(self, embed_model):
        self.embed_model = embed_model

    def __call__(self, input):
        return [self.embed_model.get_text_embedding(t) for t in input]


# ===================================================================
# 元数据存储（FAISS 用）
# ===================================================================

# 多国兼容的元数据/索引文件路径（取决于当前国家）
_CURRENT_COUNTRY = os.environ.get("COUNTRY", "nz")

META_FILE = get_vector_dir(_CURRENT_COUNTRY) / "metadata.json"
INDEX_FILE = get_vector_dir(_CURRENT_COUNTRY) / "faiss.index"


def _save_metadata(chunks: List[Dict[str, Any]], country=None):
    ctry = country or os.environ.get("COUNTRY", "nz")
    vd = get_vector_dir(ctry)
    vd.mkdir(parents=True, exist_ok=True)
    meta_fp = vd / "metadata.json"
    with open(meta_fp, "w", encoding="utf-8") as f:
        json.dump(chunks, f, ensure_ascii=False, indent=2)
    print(f"  📝 元数据已保存: {meta_fp} ({len(chunks)} 条)")


def _load_metadata(country=None) -> List[Dict[str, Any]]:
    ctry = country or os.environ.get("COUNTRY", "nz")
    vd = get_vector_dir(ctry)
    meta_fp = vd / "metadata.json"
    if not meta_fp.exists():
        return []
    with open(meta_fp, "r", encoding="utf-8") as f:
        return json.load(f)


def _print_category_distribution(chunks):
    from collections import Counter
    cats = Counter(c.get("metadata", {}).get("category", "?") for c in chunks)
    if cats:
        print(f"\n  \U0001f3f7\ufe0f  分类分布:")
        for cat, cnt in sorted(cats.items(), key=lambda x: -x[1]):
            pct = cnt / len(chunks) * 100
            bar = "\u2588" * int(pct / 5) + "\u2591" * (20 - int(pct / 5))
            print(f"    {cat:<28s} {cnt:>4d}  ({pct:5.1f}%)  {bar}")


# ===================================================================
# 智能分类
# ===================================================================

def _run_classify(all_chunks, embed_model):
    from rag_knowledge_base.classifier import classify_chunks, discover_categories
    categories = discover_categories(all_chunks)
    return classify_chunks(all_chunks, categories=categories, embed_model=embed_model, max_workers=4)


# ===================================================================
# 向量库构建器
# ===================================================================

class KnowledgeBaseBuilder:
    def __init__(self, backend=None):
        self.embed_model = create_embed_model()
        self.embed_dim = None
        self.backend = backend if backend is not None else _vector_backend()
        try:
            test_emb = self.embed_model.get_text_embedding("test")
            self.embed_dim = len(test_emb)
            print(f"  \U0001f4cf 实际嵌入维度: {self.embed_dim}")
        except Exception as e:
            print(f"  \u26a0\ufe0f 无法获取嵌入维度: {e}")
        print(f"  \U0001f5c4\ufe0f  后端: {self.backend.upper()}")

    # ── 重置 ──
    def _reset_chroma(self):
        import chromadb
        client = chromadb.PersistentClient(path=str(CHROMA_DIR))
        try:
            client.delete_collection(COLLECTION_NAME)
            print(f"  \U0001f9f9 已删除 Chroma 集合: {COLLECTION_NAME}")
        except Exception:
            print(f"  \U0001f9f9 Chroma 集合不存在，跳过")

    def _reset_faiss(self):
        if VECTOR_DIR.exists():
            shutil.rmtree(str(VECTOR_DIR))
            print(f"  \U0001f9f9 已清除 FAISS 目录: {VECTOR_DIR}")
        VECTOR_DIR.mkdir(parents=True, exist_ok=True)

    def reset(self, country=None):
        """重置指定国家的向量库，默认重置当前国家"""
        if country:
            # 重置特定国家
            vd = get_vector_dir(country)
            if vd.exists():
                shutil.rmtree(str(vd))
                print(f"  🧹 已清除 {country.upper()} 向量库: {vd}")
            vd.mkdir(parents=True, exist_ok=True)
        elif self.backend == "chroma":
            self._reset_chroma()
        else:
            self._reset_faiss()

    # ── 清洗 ──
    def _clean_content(self, text: str) -> str:
        from rag_knowledge_base.embedding.cleaner import clean_text
        return clean_text(text, backend=_cleaner_backend(), threshold=_cleaner_threshold())

    # ── 来源名提取 ──
    @staticmethod
    def _extract_source_name(filename: str) -> str:
        _KNOWN_SOURCES = {
            "wikipedia", "wikivoyage", "doc", "nzta", "aa",
            "teara", "police", "newzealand", "opentripmap",
        }
        name_lower = filename.lower()
        for kw in _KNOWN_SOURCES:
            if kw in name_lower:
                return kw
        parts = filename.rsplit(".", 1)[0].split("_")
        for p in parts:
            if not p.isdigit():
                return p
        return "unknown"

    # ── 统一：分类 → 存储 ──
    def _deduplicate(self, chunks: List[Dict]) -> List[Dict]:
        """语义去重：cosine > 0.95 视为重复，只保留第一个"""
        if len(chunks) < 2:
            return chunks
        deduped = [chunks[0]]
        keep_emb = [self.embed_model.get_text_embedding(chunks[0]["text"])]
        dup_count = 0
        for c in chunks[1:]:
            emb = self.embed_model.get_text_embedding(c["text"])
            import numpy as np
            emb_np = np.array(emb)
            max_sim = max(
                np.dot(emb_np, np.array(e)) / (np.linalg.norm(emb_np) * np.linalg.norm(np.array(e)) or 1)
                for e in keep_emb
            )
            if max_sim < 0.95:
                deduped.append(c)
                keep_emb.append(emb)
            else:
                dup_count += 1
        if dup_count:
            print(f"  \U0001f9f0 语义去重: 移除 {dup_count} 个重复片段")
        return deduped

    def _finalize(self, all_chunks, all_vectors, label="", country=None):
        """最终处理并按国家分组存储"""
        if not all_chunks:
            print("  \u26a0\ufe0f  没有片段，跳过")
            return
        if ENABLE_COUNTRY_DETECTION:
            by_country = {}
            for c in all_chunks:
                ctry = c.get("metadata", {}).get("country", "nz")
                by_country.setdefault(ctry, []).append(c)
            print(f"  \U0001f30d 多国检测: {len(by_country)} 个国家")
        else:
            by_country = {country or os.environ.get("COUNTRY", "nz"): all_chunks}
        for ctry, chunks in by_country.items():
            ctry_name = ctry.upper()
            sep = "="*50; print(f"\n{sep}\n  \U0001f30d 构建 {ctry_name} ({ctry.upper()}) — {len(chunks)} 片段\n{sep}")
            ctry_chunks = self._deduplicate(chunks)
            if _enable_auto_classify() and ctry_chunks:
                from rag_knowledge_base.classifier import classify_chunks, discover_categories
                categories = discover_categories(ctry_chunks)
                ctry_chunks = classify_chunks(ctry_chunks, categories=categories, embed_model=self.embed_model, max_workers=4)
            else:
                for c in ctry_chunks:
                    c.setdefault("metadata", {})["category"] = "general"
            if _cfg_str("ENABLE_PRECISION", "true").lower() == "true":
                from rag_knowledge_base.precision import grade_batch, print_precision_distribution
                print(f"\n  \U0001f3af 精密等级评分 {len(ctry_chunks)} 个片段...")
                ctry_chunks = grade_batch(ctry_chunks)
                print_precision_distribution(ctry_chunks)
            print(f"  \U0001f4e1 嵌入 {len(ctry_chunks)} 个片段...")
            ctry_vectors = []
            if self.backend == "faiss":
                print(f"  \U0001f500 批量嵌入...", end=" ", flush=True)
                texts = [c["text"] for c in ctry_chunks]
                try:
                    ctry_vectors = self.embed_model.get_text_embedding_batch(texts, show_progress=True)
                    print(f"\u2713 ({len(ctry_vectors)} 向量)")
                except:
                    for c in ctry_chunks:
                        ctry_vectors.append(self.embed_model.get_text_embedding(c["text"]))
            print(f"  \U0001f4be 存储 {ctry.upper()}...")
            if self.backend == "chroma":
                self._store_chroma(ctry_chunks, country=ctry)
            else:
                self._store_faiss(ctry_chunks, ctry_vectors, country=ctry)
            print(f"\n\u2705 {ctry_name} 构建完成！片段: {len(ctry_chunks)}")
            _print_category_distribution(ctry_chunks)

    # ── Chroma 存储 ──
    def _store_chroma(self, all_chunks, country=None):
        import chromadb
        ef = _ChromaEmbeddingWrapper(self.embed_model)
        ctry = country or os.environ.get("COUNTRY", "nz")
        chroma_sub = CHROMA_DIR / ctry if country else CHROMA_DIR
        chroma_sub.mkdir(parents=True, exist_ok=True)
        client = chromadb.PersistentClient(path=str(chroma_sub))
        col_name = f"{COLLECTION_NAME}_{ctry}" if country else COLLECTION_NAME
        try:
            client.delete_collection(col_name)
        except:
            pass
        collection = client.create_collection(col_name, embedding_function=ef, metadata={"hnsw:space": "cosine"})
        batch_size = 100
        for i in range(0, len(all_chunks), batch_size):
            batch = all_chunks[i:i + batch_size]
            ids = [c["id"] for c in batch]
            texts = [c["text"] for c in batch]
            metas = [c.get("metadata", {}) or None for c in batch]
            collection.add(ids=ids, documents=texts, metadatas=metas)
            print(f"  \u2713 Chroma: {i + len(batch)}/{len(all_chunks)}")
        print(f"  \u2705 Chroma [{col_name}] 共 {collection.count()} 条")
        _save_metadata(all_chunks, country=ctry)

    # ── FAISS 存储 ──
    def _store_faiss(self, all_chunks, all_vectors, country=None):
        import faiss
        ctry = country or os.environ.get("COUNTRY", "nz")
        _save_metadata(all_chunks, country=ctry)
        if not all_vectors:
            print("  \u26a0\ufe0f  空向量列表")
            return
        vectors = np.array(all_vectors).astype(np.float32)
        dim = vectors.shape[1]
        index = faiss.IndexFlatIP(dim)
        index.add(vectors)
        vd = get_vector_dir(ctry)
        idx_fp = vd / "faiss.index"
        vd.mkdir(parents=True, exist_ok=True)
        faiss.write_index(index, str(idx_fp))
        print(f"  \u2705 FAISS 索引: {idx_fp} ({index.ntotal} 向量, {dim} 维)")

    # ── 本地构建（raw 目录） ──
    def _detect_and_tag_country(self, chunks: List[Dict], text: str, source_name: str) -> str:
        """自动检测文本所属国家，为 chunk 添加 country 元数据"""
        if not ENABLE_COUNTRY_DETECTION:
            # 强制使用当前环境指定的国家
            country = os.environ.get("COUNTRY", "nz")
            return country
        country = detect_country_single(text)
        if country == "unknown":
            country = os.environ.get("COUNTRY", "nz")
        return country

    def build_from_local(self, raw_dir=None, incremental=False):
        from llama_index.core import Document as LDocument
        from llama_index.core.node_parser import SentenceSplitter

        if raw_dir is None:
            raw_dir = RAW_DIR

        # 清洗 raw → cleaned
        from rag_knowledge_base.embedding.cleaner import batch_clean
        batch_clean(
            input_dir=raw_dir, output_dir=CLEANED_DIR,
            backend=_cleaner_backend(),
            with_summary=False,
            threshold=_cleaner_threshold(),
        )

        if not incremental:
            self.reset()

        cleaned_files = sorted(CLEANED_DIR.glob("*.txt"))
        if not cleaned_files:
            print("  \u26a0\ufe0f  无 cleaned 文件")
            return

        splitter = SentenceSplitter(
            chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP,
            separator="\n\n", paragraph_separator="\n\n",
            secondary_chunking_regex="[^,.;。！？\n]+[,.;。！？]?\n*",
        )

        existing_by_text = set()
        if incremental and META_FILE.exists():
            for c in _load_metadata():
                existing_by_text.add(c["text"][:100])

        all_chunks = _load_metadata() if incremental else []
        all_vectors = []

        for f in cleaned_files:
            try:
                text = f.read_text(encoding="utf-8").strip()
            except Exception:
                continue
            if not text:
                continue

            source_name = self._extract_source_name(f.name)
            doc_title = _extract_title_from_text(text) or f.name
            doc_date = _extract_date_from_text(text)

            # 分层语义切片（标题感知）
            if SEMANTIC_CHUNKING:
                semantic_sections = _semantic_split(text, splitter, CHUNK_SIZE)
            else:
                meta = {
                    "source": f.name,
                    "source_name": source_name,
                    "category": "general",
                    "title": doc_title,
                    "doc_type": "local",
                }
                doc = LDocument(text=text, metadata=meta)
                raw_nodes = splitter.get_nodes_from_documents([doc])
                semantic_sections = [(n.get_content(), doc_title, "") for n in raw_nodes]

            for section_text, section_title, heading_path in semantic_sections:
                if len(section_text.strip()) < 20:
                    continue
                if incremental and section_text[:100] in existing_by_text:
                    continue

                meta = {
                    "source": f.name,
                    "source_name": source_name,
                    "category": "general",
                    "title": doc_title,
                    "section_title": section_title,
                    "heading_path": heading_path,
                    "doc_type": "local",
                    "date": doc_date,
                    "language": _detect_language(section_text),
                }
                # 国家自动识别
                if ENABLE_COUNTRY_DETECTION:
                    detected = _detect_country_single(section_text)
                    if detected != "unknown":
                        meta["country"] = detected
                    else:
                        meta["country"] = os.environ.get("COUNTRY", "nz")
                else:
                    meta["country"] = os.environ.get("COUNTRY", "nz")

                all_chunks.append({
                    "id": str(uuid.uuid4()),
                    "text": section_text,
                    "metadata": dict(meta),
                })

            print(f"  \U0001f4c4 {f.name[:40]}... {len(semantic_sections)} 片段 (累计{len(all_chunks)})")

        if not all_chunks:
            print("  \u26a0\ufe0f  没有新片段")
            return

        self._finalize(all_chunks, [], label="本地")

    # ── 网络构建 ──
    def _build_from_docs(self, documents, incremental=False):
        from llama_index.core import Document as LDocument
        from llama_index.core.node_parser import SentenceSplitter

        if not incremental:
            self.reset()

        print(f"\U0001f9f9 清洗 {len(documents)} 个文档 (backend={_cleaner_backend()})...")

        splitter = SentenceSplitter(
            chunk_size=CHUNK_SIZE, chunk_overlap=CHUNK_OVERLAP,
            separator="\n\n", paragraph_separator="\n\n",
            secondary_chunking_regex="[^,.;。！？\n]+[,.;。！？]?\n*",
        )

        all_chunks = _load_metadata() if incremental else []
        all_vectors = []
        existing_by_text = set()
        if incremental:
            for c in all_chunks:
                existing_by_text.add(c["text"][:100])

        for idx, doc_dict in enumerate(documents):
            raw_text = doc_dict.get("content", "")

            cleaned = self._clean_content(raw_text)
            if len(cleaned.strip()) < 50:
                continue

            doc_title = doc_dict.get("title", "")
            doc_date = doc_dict.get("date", "") or _extract_date_from_text(cleaned)

            # 分层语义切片（标题感知）
            if SEMANTIC_CHUNKING:
                semantic_sections = _semantic_split(cleaned, splitter, CHUNK_SIZE)
            else:
                meta = {
                    "source": doc_dict.get("url", ""),
                    "source_name": doc_dict.get("source_name", "unknown"),
                    "category": "general",
                    "title": doc_title,
                    "doc_type": "web",
                }
                ldoc = LDocument(text=cleaned, metadata=meta)
                raw_nodes = splitter.get_nodes_from_documents([ldoc])
                semantic_sections = [(n.get_content(), doc_title, "") for n in raw_nodes]

            n_total = len(documents)
            pct = (idx + 1) / n_total * 100
            print(f"  \U0001f310 文档 {idx+1}/{n_total} ({pct:.0f}%) | {doc_dict.get('title', '?')[:30]} | {len(semantic_sections)} 片段 | 累计 {len(all_chunks)}", flush=True)

            for section_text, section_title, heading_path in semantic_sections:
                if len(section_text.strip()) < 20:
                    continue
                if incremental and section_text[:100] in existing_by_text:
                    continue

                meta = {
                    "source": doc_dict.get("url", ""),
                    "source_name": doc_dict.get("source_name", "unknown"),
                    "category": "general",
                    "title": doc_title,
                    "section_title": section_title,
                    "heading_path": heading_path,
                    "doc_type": "web",
                    "date": doc_date,
                    "language": _detect_language(cleaned),
                }
                # 国家自动识别
                if ENABLE_COUNTRY_DETECTION:
                    detected = _detect_country_single(section_text)
                    meta["country"] = detected if detected != "unknown" else os.environ.get("COUNTRY", "nz")
                else:
                    meta["country"] = os.environ.get("COUNTRY", "nz")

                all_chunks.append({
                    "id": str(uuid.uuid4()),
                    "text": section_text,
                    "metadata": dict(meta),
                })

        if not all_chunks:
            print("  \u26a0\ufe0f  没有新片段")
            return
        self._finalize(all_chunks, [], label="网络")

    def build_from_web(self, web_documents, incremental=False):
        self._build_from_docs(web_documents, incremental=incremental)

    def get_stats(self, country=None):
        """获取指定国家的统计信息（默认当前环境国家）"""
        ctry = country or os.environ.get("COUNTRY", "nz")
        chunks = _load_metadata(country=ctry)
        vd = get_vector_dir(ctry)
        has_index = (vd / "faiss.index").exists()
        chroma_sub = CHROMA_DIR / ctry if ctry != "nz" else CHROMA_DIR
        has_chroma = chroma_sub.exists() and (chroma_sub / "chroma.sqlite3").exists()
        if not chunks:
            total = 0
            if has_chroma:
                try:
                    import chromadb
                    client = chromadb.PersistentClient(path=str(chroma_sub))
                    col_name = f"{COLLECTION_NAME}_{ctry}" if ctry != "nz" else COLLECTION_NAME
                    for c in client.list_collections():
                        if c.name == col_name:
                            total = c.count()
                except:
                    pass
            return {"country": ctry, "total_chunks": total, "sources": [],
                    "categories": [], "countries": [],
                    "index_exists": has_index, "chroma_exists": has_chroma}
        sources = list(set(c["metadata"].get("source_name", "?") for c in chunks))
        categories = list(set(c["metadata"].get("category", "?") for c in chunks))
        countries = list(set(c["metadata"].get("country", "?") for c in chunks))
        return {
            "country": ctry,
            "total_chunks": len(chunks),
            "sources": sources,
            "categories": categories,
            "countries": countries,
            "index_exists": has_index,
            "chroma_exists": has_chroma,
        }


# ===================================================================
# 便捷入口
# ===================================================================

async def build_kb_from_network(incremental=False, backend=None, country=None):
    from rag_knowledge_base.crawler.crawl4ai_fetcher import fetch_all_sources
    if country:
        os.environ["COUNTRY"] = country
    _bn = backend or _vector_backend()
    print(f"\U0001f310 网络抓取 \u2192 清洗({_cleaner_backend()}) \u2192 分片 \u2192 {EMBED_BACKEND.upper()}嵌入 \u2192 {_bn.upper()}")
    if country:
        print(f"  \U0001f30d 国家: {country.upper()}")
    docs = await fetch_all_sources()
    if not docs:
        print("\u274c 未抓取到内容")
        return
    KnowledgeBaseBuilder(backend=backend)._build_from_docs(docs, incremental=incremental)


def build_kb_from_local(raw_dir=None, incremental=False, backend=None, country=None):
    if country:
        os.environ["COUNTRY"] = country
    KnowledgeBaseBuilder(backend=backend).build_from_local(raw_dir, incremental=incremental)


def kb_stats(backend=None, country=None):
    if country:
        os.environ["COUNTRY"] = country
        ctry = country
    else:
        ctry = os.environ.get("COUNTRY", "nz")
    builder = KnowledgeBaseBuilder(backend=backend)
    stats = builder.get_stats(country=ctry)
    print(f"\n\U0001f4ca {stats.get('country','nz').upper()} 知识库:")
    print(f"  总片段: {stats['total_chunks']}")
    print(f"  来源: {', '.join(stats['sources'])}")
    print(f"  分类: {', '.join(stats['categories'])}")
    if stats.get("countries"):
        print(f"  检测到的国家: {', '.join(stats['countries'])}")
    if stats.get("index_exists"):
        print("  \u2705 FAISS 索引存在")
    if stats.get("chroma_exists"):
        print("  \u2705 Chroma 集合存在")
    if not stats.get("index_exists") and not stats.get("chroma_exists"):
        print("  \u26a0\ufe0f  向量库为空，请先构建")


# ===================================================================
# CLI 入口
# ===================================================================

if __name__ == "__main__":
    import asyncio
    import argparse

    # ═══ 第一步：预解析 --build-mode 和 --country，在 import config 前注入环境变量 ═══
    # （config.py 在 import 时就读 BUILD_MODE / COUNTRY 了）
    _early_parser = argparse.ArgumentParser(description="RAG 知识库构建器", add_help=False)
    _early_parser.add_argument("--build-mode", choices=["fast", "balanced", "precise"], default=None,
                               help="构建模式: fast(最快/rule) balanced(均衡/1.5B) precise(最准/14B)")
    _early_parser.add_argument("--country", default=None,
                               help="指定国家（自动检测后仍可强制指定，如 nz/jp/fr）")
    _early_parser.add_argument("--backend", choices=["chroma", "faiss"], default=None,
                               help="向量后端（默认 config.VECTOR_BACKEND）")
    _early_parser.add_argument("--no-qwen3", action="store_true",
                               help="跳过 Qwen3-14B，使用纯规则清洗（快速测试用）")
    _early_parser.add_argument("--no-classify", action="store_true",
                               help="跳过智能分类，全部归为 general")
    _early_parser.add_argument("--no-summary", action="store_true",
                               help="跳过文档级智能总结")
    _early_args, _remaining_argv = _early_parser.parse_known_args()

    if _early_args.build_mode:
        os.environ["BUILD_MODE"] = _early_args.build_mode
    if _early_args.country:
        os.environ["COUNTRY"] = _early_args.country
    if _early_args.backend:
        os.environ["VECTOR_BACKEND"] = _early_args.backend
    if _early_args.no_qwen3:
        os.environ["CLEANER_BACKEND"] = "rule"
    if _early_args.no_summary:
        os.environ["ENABLE_ADVANCED_SUMMARY"] = "false"
    if _early_args.no_classify:
        os.environ["ENABLE_AUTO_CLASSIFY"] = "false"

    # ═══ 第二步：正式 parser（忽略已被预解析的参数） ═══
    import argparse as _argparse
    parser = _argparse.ArgumentParser(
        description="RAG 知识库构建器（双后端）",
        # 不认已在预解析中处理过的参数，避免冲突
        conflict_handler='resolve',
    )
    parser.add_argument("--mode", choices=["local", "network", "stats"], default="local",
                        help="构建模式: local=本地raw文件 | network=网络抓取 | stats=查看统计")
    parser.add_argument("--incremental", action="store_true",
                        help="增量模式，不清空已有数据")
    parser.add_argument("--raw-dir", default=None,
                        help="raw 数据目录（仅 local 模式，默认 config.RAW_DIR）")
    parser.add_argument("--build-mode", choices=["fast", "balanced", "precise"], default=None,
                        help="构建模式: fast(最快/rule) balanced(均衡/1.5B) precise(最准/14B)")
    parser.add_argument("--backend", choices=["chroma", "faiss"], default=None,
                        help="向量后端（默认 config.VECTOR_BACKEND）")
    parser.add_argument("--no-qwen3", action="store_true",
                        help="跳过 Qwen3-14B，使用纯规则清洗（快速测试用）")
    parser.add_argument("--no-classify", action="store_true",
                        help="跳过智能分类，全部归为 general")
    parser.add_argument("--no-summary", action="store_true",
                        help="跳过文档级智能总结")
    parser.add_argument("--country", default=None,
                        help="指定国家（自动检测后仍可强制指定，如 nz/jp/fr）")
    args = parser.parse_args(_remaining_argv)

    # ═══ 第三步：再次应用（保险覆盖） ═══
    if args.build_mode:
        os.environ["BUILD_MODE"] = args.build_mode
    if args.country:
        os.environ["COUNTRY"] = args.country
    if args.backend:
        os.environ["VECTOR_BACKEND"] = args.backend
    if args.no_qwen3:
        os.environ["CLEANER_BACKEND"] = "rule"
    if args.no_summary:
        os.environ["ENABLE_ADVANCED_SUMMARY"] = "false"
    if args.no_classify:
        os.environ["ENABLE_AUTO_CLASSIFY"] = "false"

    _be = args.backend or _vector_backend()

    print("\n" + "=" * 60)
    print("  \U0001f5fa\ufe0f  NZ Travel RAG 知识库构建器")
    print(f"  模式: {args.mode} | 后端: {_be.upper()}")
    print(f"  清洗: {_cleaner_backend()}")
    print(f"  文档总结: {_enable_advanced_summary()}")
    print(f"  智能分类: {_enable_auto_classify()}")
    print("=" * 60 + "\n")

    if args.mode == "network":
        asyncio.run(build_kb_from_network(incremental=args.incremental, backend=_be))
    elif args.mode == "local":
        build_kb_from_local(raw_dir=args.raw_dir, incremental=args.incremental, backend=_be)
    elif args.mode == "stats":
        kb_stats(backend=_be)


# ===================================================================
# 语义分片 & 元数据增强工具（原 semantic_chunker.py，合并至此）
# ===================================================================


def _extract_title_from_text(text: str) -> str:
    """从文本首部提取标题（# 标题行 或 首行非空）"""
    for line in text.split("\n")[:10]:
        stripped = line.strip()
        if stripped.startswith("# "):
            return stripped[2:].strip()
        if stripped.startswith("## "):
            return stripped[3:].strip()
    for line in text.split("\n")[:3]:
        stripped = line.strip()
        if stripped and len(stripped) < 100 and not stripped.startswith("http"):
            return stripped
    return ""


def _extract_date_from_text(text: str) -> str:
    """从文本中提取日期（YYYY-MM-DD / YYYY年MM月DD日 等）"""
    import re
    m = re.search(r"^date:\s*(\d{4}[.-]\d{1,2}[.-]\d{1,2})", text, re.MULTILINE)
    if m:
        return m.group(1)
    m = re.search(r"(\d{4})-(\d{2})-(\d{2})", text)
    if m:
        return m.group(0)
    m = re.search(r"(\d{4})年(\d{1,2})月(\d{1,2})日", text)
    if m:
        return f"{m.group(1)}-{m.group(2).zfill(2)}-{m.group(3).zfill(2)}"
    return ""



def _detect_country_single(text: str) -> str:
    """LLM 驱动国家识别：由模型自动判断文本所述国家，零硬编码。

    流程：
      1. ENABLE_COUNTRY_DETECTION=False → 返回环境变量 COUNTRY（默认 nz）
      2. True → 调用清洗模型（Qwen3-14B / Qwen2.5-1.5B）做一次极短推理，
                模型凭自身知识识别国家
    """
    if not ENABLE_COUNTRY_DETECTION:
        return os.environ.get("COUNTRY", "nz")
    try:
        from rag_knowledge_base.config import load_model
        model_id = os.environ.get("CLEANER_MODEL_ID",
                     os.environ.get("QWEN3_MODEL", "Qwen/Qwen3-14B"))
        tokenizer, model = load_model(model_id, "国家识别")
        if tokenizer is not None and model is not None:
            prompt = (
                "你是一个旅游文本国家识别专家。"
                "根据文本内容判断其所述国家，输出 ISO 3166-1 二位字母代码（小写）。"
                "只输出代码，不要任何其他文字。\n\n"
                f"文本：\n{text[:2000]}\n\n"
                "这个文本关于哪个国家？"
            )
            messages = [{"role": "user", "content": prompt}]
            inputs = tokenizer.apply_chat_template(
                messages, tokenize=True, add_generation_prompt=True,
                return_tensors="pt"
            ).to(model.device)
            outputs = model.generate(
                **inputs, max_new_tokens=8,
                do_sample=False, temperature=0.1, use_cache=True,
            )
            response = tokenizer.decode(
                outputs[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True
            ).strip().lower()
            # 模型输出的是一个 2 位 ISO 代码，直接使用
            if response and len(response) <= 3 and response.isalpha():
                return response
    except Exception:
        pass
    return os.environ.get("COUNTRY", "nz")

def _detect_language(text: str) -> str:
    """简单中英文检测（基于字符比例）"""
    if not text:
        return "unknown"
    cjk = sum(1 for c in text if '\u4e00' <= c <= '\u9fff' or '\u3400' <= c <= '\u4dbf')
    total = len(text.strip())
    if total == 0:
        return "unknown"
    ratio = cjk / total
    if ratio > 0.05:
        return "zh"
    return "en"


def _semantic_split(
    text: str,
    fallback_splitter,
    max_chunk_size: int,
):
    """
    分层语义切片：先按标题分大节，再按段落分小节，最后 token 回退。

    返回 List[(text, section_title, heading_path)]:
      - text: 切片文本
      - section_title: 该片段所属的章节标题
      - heading_path: 完整的标题路径
    """
    import re
    from llama_index.core import Document as LDocument

    heading_pattern = re.compile(r"^(#{1,4})\s+(.+)$", re.MULTILINE)

    # 第一步：按 Markdown 标题分大节
    sections = []
    headings_found = []
    for m in heading_pattern.finditer(text):
        headings_found.append((m.start(), m.group(1), m.group(2).strip()))

    if not headings_found:
        # 没有标题，尝试按 Day/X/Part 分节
        day_pattern = re.compile(
            r"^\*{0,2}\s*(?:Day|D|第[\d一二三四五六七八九十]+[天日]|行程|Part)\s*[\d:：]*(.*)$",
            re.MULTILINE | re.IGNORECASE,
        )
        day_matches = []
        for m in day_pattern.finditer(text):
            tail = m.group(1).strip()[:40]
            label = f"Day {len(day_matches) + 1}" + (f": {tail}" if tail else "")
            day_matches.append((m.start(), "##", label))
        if day_matches:
            headings_found = day_matches

    if headings_found:
        for i, (pos, _level, title) in enumerate(headings_found):
            end_pos = (
                headings_found[i + 1][0]
                if i + 1 < len(headings_found)
                else len(text)
            )
            section_text = text[pos:end_pos].strip()
            if section_text and len(section_text) >= 20:
                sections.append((section_text, title, title))
    else:
        # 没有层级结构，按空行分逻辑段落
        paragraphs = re.split(r"\n{2,}", text)
        current = []
        current_len = 0
        for para in paragraphs:
            para = para.strip()
            if not para:
                continue
            para_len = len(para)
            if current_len + para_len > max_chunk_size and current:
                combined = "\n\n".join(current)
                sections.append((combined, "", ""))
                current = [para]
                current_len = para_len
            else:
                current.append(para)
                current_len += para_len
        if current:
            combined = "\n\n".join(current)
            if combined.strip():
                sections.append((combined, "", ""))

    # 第二步：超长 section 内部再按段落细分
    final_sections = []
    for sec_text, sec_title, heading_path in sections:
        if len(sec_text) <= max_chunk_size * 4:
            final_sections.append((sec_text, sec_title, heading_path))
        else:
            sub_paras = re.split(r"\n{2,}", sec_text)
            sub_buffer = []
            sub_len = 0
            for para in sub_paras:
                para = para.strip()
                if not para:
                    continue
                para_len = len(para)
                if sub_len + para_len > max_chunk_size and sub_buffer:
                    combined = "\n\n".join(sub_buffer)
                    final_sections.append((combined, sec_title, heading_path))
                    sub_buffer = [para]
                    sub_len = para_len
                else:
                    sub_buffer.append(para)
                    sub_len += para_len
            if sub_buffer:
                combined = "\n\n".join(sub_buffer)
                final_sections.append((combined, sec_title, heading_path))

    # 第三步：降级 — 用 fallback_splitter
    if not final_sections:
        meta = {"dummy": True}
        doc = LDocument(text=text, metadata=meta)
        nodes = fallback_splitter.get_nodes_from_documents([doc])
        final_sections = [(n.get_content(), "", "") for n in nodes]

    return final_sections