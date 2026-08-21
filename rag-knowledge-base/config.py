"""RAG 知识库全局配置 — FAISS 版本（替换 ChromaDB）"""

import os
from pathlib import Path
from typing import Dict, List, Optional, Tuple, Any  # noqa: F401

# 项目根目录（支持环境变量覆盖，默认自动检测）
PROJECT_ROOT = Path(os.getenv("PROJECT_ROOT", str(Path(__file__).resolve().parent.parent)))

# RAG 知识库目录
BASE_DIR = Path(__file__).parent

# ===== 目录 =====
DATA_DIR = BASE_DIR / "data"
RAW_DIR = DATA_DIR / "raw"
CLEANED_DIR = DATA_DIR / "cleaned"
CHUNKS_DIR = DATA_DIR / "chunks"
# FAISS 索引和元数据存储位置
VECTOR_DIR = Path(os.getenv("VECTOR_DIR", str(BASE_DIR / "vector_db")))
# 确保目录存在
VECTOR_DIR.mkdir(parents=True, exist_ok=True)  # FAISS 索引 + 元数据存储位置

for d in [DATA_DIR, RAW_DIR, CLEANED_DIR, CHUNKS_DIR, VECTOR_DIR]:
    d.mkdir(parents=True, exist_ok=True)

# ChromaDB 目录（支持环境变量覆盖）
CHROMA_DIR = Path(os.getenv("CHROMA_DIR", str(BASE_DIR / "chroma_db")))

# ===== 构建模式（尽早应用，影响后续所有常量） =====
BUILD_MODE = os.getenv("BUILD_MODE", "balanced").lower()


def apply_build_mode():
    """根据 BUILD_MODE 一次性设置所有下游环境变量（仅当用户未显式设置时才覆盖）。

    三种模式：
      fast     → rule清洗 + 768分片 + 无分类/无精密/无重排 → 最快
      balanced → 1.5B清洗 + 512分片 + 分类+精密+重排     → 默认
      precise  → 14B清洗 + 384分片 + 分类+精密+重排     → 最准
    """
    mode = os.getenv("BUILD_MODE", "balanced").lower()
    _mode_table = {
        "fast": {
            "CLEANER_BACKEND": "rule",
            "CHUNK_SIZE": "768",
            "CHUNK_OVERLAP": "128",
            "CLEANER_THRESHOLD": "0.7",
            "CLEANER_BATCH_SIZE": "16",
            "ENABLE_AUTO_CLASSIFY": "false",
            "ENABLE_PRECISION": "false",
            "ENABLE_ADVANCED_SUMMARY": "false",
            "USE_HYDE": "false",
            "USE_BM25": "false",
            "SEMANTIC_CHUNKING": "true",
            "NUM_QUERY_VARIANTS": "1",
            "ENABLE_RERANK": "false",
        },
        "balanced": {
            "CLEANER_BACKEND": "qwen2.5",
            "CHUNK_SIZE": "512",
            "CHUNK_OVERLAP": "128",
            "CLEANER_THRESHOLD": "0.5",
            "CLEANER_BATCH_SIZE": "8",
            "ENABLE_AUTO_CLASSIFY": "true",
            "ENABLE_PRECISION": "true",
            "ENABLE_ADVANCED_SUMMARY": "true",
            "USE_HYDE": "true",
            "USE_BM25": "true",
            "SEMANTIC_CHUNKING": "true",
            "NUM_QUERY_VARIANTS": "3",
            "ENABLE_RERANK": "true",
        },
        "precise": {
            "CLEANER_BACKEND": "qwen3",
            "CHUNK_SIZE": "384",
            "CHUNK_OVERLAP": "64",
            "CLEANER_THRESHOLD": "0.3",
            "CLEANER_BATCH_SIZE": "4",
            "ENABLE_AUTO_CLASSIFY": "true",
            "ENABLE_PRECISION": "true",
            "ENABLE_ADVANCED_SUMMARY": "true",
            "USE_HYDE": "true",
            "USE_BM25": "true",
            "SEMANTIC_CHUNKING": "true",
            "NUM_QUERY_VARIANTS": "5",
            "ENABLE_RERANK": "true",
        },
    }
    if mode not in _mode_table:
        print(f"  ⚠️ 未知 BUILD_MODE={mode}，使用 balanced")
        mode = "balanced"
    overrides = _mode_table[mode]
    for key, default_val in overrides.items():
        if key not in os.environ:
            os.environ[key] = default_val
    print(f"  \U0001f3af 构建模式: {mode}")
    for k, v in sorted(overrides.items()):
        if os.environ.get(k) == v:
            print(f"    {k:30s} = {v}")


# 非 balanced 模式时提前注入环境变量，影响后续所有 os.getenv() 读取
if BUILD_MODE != "balanced":
    apply_build_mode()

# ===== 检索策略 =====
NUM_QUERY_VARIANTS = int(os.getenv("NUM_QUERY_VARIANTS", "3"))
USE_HYDE = os.getenv("USE_HYDE", "false").lower() == "true"  # 默认关闭（原实现为空壳）
USE_BM25 = os.getenv("USE_BM25", "true").lower() == "true"  # 混合检索：BM25 + Dense

# ===== 语义分片开关（默认开启） =====
# 开启时：按标题→逻辑段落分层切片，保留语义边界
# 关闭时：沿用旧的纯 token 切分
SEMANTIC_CHUNKING = os.getenv("SEMANTIC_CHUNKING", "true").lower() == "true"

# ===== 分片策略 =====
CHUNK_SIZE = int(os.getenv("CHUNK_SIZE", "512"))
CHUNK_OVERLAP = int(os.getenv("CHUNK_OVERLAP", "128"))

# ---- 通用 HuggingFace 缓存目录检测（必须在所有 model 配置之前） ----
_HF_CANDIDATE_PATHS = []
# 环境变量显式指定（最高优先级）
env_cache = os.getenv("HUGGINGFACE_HUB_CACHE", "")
if env_cache:
    _HF_CANDIDATE_PATHS.append(Path(env_cache))
env_hf_home = os.getenv("HF_HOME", "")
if env_hf_home:
    _HF_CANDIDATE_PATHS.append(Path(env_hf_home) / "hub")
# 系统默认路径
if os.name == "nt":  # Windows
    _HF_CANDIDATE_PATHS.extend([
        Path.home() / ".cache/huggingface/hub",
        Path(os.getenv("USERPROFILE", "D:/")) / ".cache/huggingface/hub",
        Path("D:/huggingface/hub"),
        Path("C:/huggingface/hub"),
        Path("C:/Users") / os.getenv("USERNAME", "") / ".cache/huggingface/hub",
        Path("D:/Users") / os.getenv("USERNAME", "10581") / ".cache/huggingface/hub",
    ])
    # 去重
    seen = set()
    unique = []
    for p in _HF_CANDIDATE_PATHS:
        s = str(p).lower()
        if s not in seen:
            seen.add(s)
            unique.append(p)
    _HF_CANDIDATE_PATHS = unique
else:  # Linux / macOS
    _HF_CANDIDATE_PATHS.extend([
        Path.home() / ".cache/huggingface/hub",
        Path("/tmp/huggingface/hub"),
    ])


def resolve_hf_cache_dir() -> str:
    """返回真实存在的 HuggingFace 缓存目录，若不存在则返回空字符串"""
    for p in _HF_CANDIDATE_PATHS:
        if p.exists() and any(p.glob("models--*")):
            return str(p)
    # 降级：目录存在但没有 models--* 也行（可能刚创建还没下载过）
    for p in _HF_CANDIDATE_PATHS:
        if p.exists():
            return str(p)
    return ""


def resolve_hf_model_path(model_id: str) -> str:
    """将 HuggingFace model ID 解析为本地缓存快照路径。
    返回快照目录的路径（字符串），若无本地缓存则返回原 model_id（触发联网下载）。"""
    if Path(model_id).exists():
        return model_id
    cache_name = "models--" + model_id.replace("/", "--")
    for cache_root in _HF_CANDIDATE_PATHS:
        model_dir = cache_root / cache_name
        if model_dir.exists():
            snapshots = model_dir / "snapshots"
            if snapshots.exists():
                snaps = sorted([s for s in snapshots.iterdir() if s.is_dir()])
                if snaps:
                    return str(snaps[-1])
            return str(model_dir)
    return model_id


# ===== Embedding 模型 =====
EMBED_BACKEND = os.getenv("EMBED_BACKEND", "bge")
EMBED_MODEL_HF_NAMES = {
    "bge": "BAAI/bge-m3",
    "bge-small": "BAAI/bge-small-zh-v1.5",
    "qwen": "Alibaba-NLP/gte-Qwen2-1.5B-instruct",
    "qwen-7b": "Alibaba-NLP/gte-Qwen2-7B-instruct",
}
EMBED_MODEL_PATH = os.getenv("EMBED_MODEL_PATH", "")
if EMBED_MODEL_PATH and Path(EMBED_MODEL_PATH).exists():
    EMBEDDING_MODEL = EMBED_MODEL_PATH
else:
    # 保留原始 model ID（如 "BAAI/bge-m3"），model_kwargs 控制本地优先
    EMBEDDING_MODEL = EMBED_MODEL_HF_NAMES.get(EMBED_BACKEND, EMBED_MODEL_HF_NAMES["bge"])

# ===== 重排 =====
RERANKER_MODEL_ENV = os.getenv("RERANKER_MODEL", "BAAI/bge-reranker-v2-m3")
RERANKER_MODEL_PATH = os.getenv("RERANKER_MODEL_PATH", "")
if RERANKER_MODEL_PATH and Path(RERANKER_MODEL_PATH).exists():
    RERANKER_MODEL = RERANKER_MODEL_PATH
else:
    # 本地优先：先找本地缓存路径
    _reranker_local = resolve_hf_model_path(RERANKER_MODEL_ENV)
    RERANKER_MODEL = _reranker_local
RERANK_TOP_K = int(os.getenv("RERANK_TOP_K", "5"))

# 向量数据库类型
# "chroma" | "faiss"
VECTOR_BACKEND = os.getenv("VECTOR_BACKEND", "faiss")

COLLECTION_NAME = os.getenv("CHROMA_COLLECTION", "travel_kb")

# ===== 多国支持 =====
# 零硬编码：国家代码完全由 LLM 模型自主识别
# 每个国家拥有独立的向量库子目录（vector_db/nz/ vector_db/jp/ ...）

CURRENT_COUNTRY = os.getenv("COUNTRY", "nz")

# 是否启用自动国家检测（默认开）
ENABLE_COUNTRY_DETECTION = os.getenv("ENABLE_COUNTRY_DETECTION", "true").lower() == "true"


def get_vector_dir(country: str = None) -> Path:
    """获取指定国家的向量库目录（每个国家独立子目录）
    
    子目录名取自 LLM 输出的 ISO 代码（小写），不设白名单。
    任何非空字符串都视为合法国家键。
    """
    c = (country or CURRENT_COUNTRY or "nz").lower().strip()
    if not c:
        c = "nz"
    sub = VECTOR_DIR / c
    sub.mkdir(parents=True, exist_ok=True)
    return sub


def get_all_country_dirs() -> List[Path]:
    """扫描 vector_db 下所有子目录，返回已有向量库的目录列表"""
    if not VECTOR_DIR.exists():
        return []
    return [child for child in VECTOR_DIR.iterdir() if child.is_dir()]


# ===== Qwen3-14B 智能模型配置 =====
# 使用 HuggingFace model ID，从默认缓存加载
# 不硬编码路径，自动检测常见系统缓存位置
# 环境变量：QWEN3_MODEL / MODEL_CACHE_DIR / MODEL_DEVICE / MODEL_DTYPE

_HF_DEFAULT_CACHE = None
_resolved_cache = resolve_hf_cache_dir()
if _resolved_cache:
    _HF_DEFAULT_CACHE = _resolved_cache

QWEN3_MODEL_ID = os.getenv("QWEN3_MODEL", "Qwen/Qwen3-14B")
MODEL_CACHE_DIR = os.getenv("MODEL_CACHE_DIR", _HF_DEFAULT_CACHE)
MODEL_DEVICE = os.getenv("MODEL_DEVICE", "cpu")
MODEL_DTYPE = os.getenv("MODEL_DTYPE", "auto")

# ===== CPU 推理加速配置（不降配置 = 不改模型/不量化/不减精度） =====
# IPEX (Intel Extension for PyTorch): 在 Intel CPU 上自动启用 oneDNN 算子
# 融合、间接访问 KV Cache、融合 ROPE/RMSNorm，加速 1.5~3x
# Qwen3-14B 在 IPEX 官方验证列表中 ✅
# 非 Intel CPU 或未安装 ipex 则自动跳过（无副作用）
ENABLE_IPEX = os.getenv("ENABLE_IPEX", "true").lower() == "true"

# CPU 线程数：0=自动检测物理核心数，也可手动指定（如 OMP_NUM_THREADS=8）
CPU_NUM_THREADS = int(os.getenv("CPU_NUM_THREADS", "0"))

# Warmup 预热：模型加载后跑一次空推理，触发图编译和缓存填充
ENABLE_WARMUP = os.getenv("ENABLE_WARMUP", "true").lower() == "true"
WARMUP_MAX_NEW_TOKENS = int(os.getenv("WARMUP_MAX_NEW_TOKENS", "8"))

# ===== 智能分类器配置 =====
ENABLE_AUTO_CLASSIFY = os.getenv("ENABLE_AUTO_CLASSIFY", "true").lower() == "true"
ENABLE_ADVANCED_SUMMARY = os.getenv("ENABLE_ADVANCED_SUMMARY", "true").lower() == "true"
ENABLE_PRECISION = os.getenv("ENABLE_PRECISION", "true").lower() == "true"
ENABLE_RERANK = os.getenv("ENABLE_RERANK", "true").lower() == "true"

# ===== 清洗配置 =====
CLEANER_BACKEND = os.getenv("CLEANER_BACKEND", "qwen2.5")  # rule | qwen3 | qwen2.5
# 清洗用模型 ID（根据后端自动决定默认值）
if CLEANER_BACKEND == "qwen2.5":
    _DEFAULT_MODEL_ID = "Qwen/Qwen2.5-1.5B-Instruct"
else:
    _DEFAULT_MODEL_ID = os.getenv("QWEN3_MODEL", "Qwen/Qwen3-14B")
CLEANER_MODEL_ID = os.getenv("CLEANER_MODEL_ID", _DEFAULT_MODEL_ID)
CLEANER_THRESHOLD = float(os.getenv("CLEANER_THRESHOLD", "0.5"))

# ===== 分类器配置 =====
# 分类用模型 ID（可选，默认与清洗用相同模型）
CLASSIFIER_MODEL_ID = os.getenv("CLASSIFIER_MODEL_ID", CLEANER_MODEL_ID or "")
if not CLASSIFIER_MODEL_ID:
    CLASSIFIER_MODEL_ID = CLEANER_MODEL_ID

# ===================================================================
# 通用模型加载器（全局单例，支持任意模型 ID）
# ===================================================================

_load_model_cache = {}  # {model_id: [tokenizer, model, tried_before]}


def _find_local_model_dir(model_id: str) -> Optional[str]:
    """找到指定模型的本地缓存目录，返回快照路径或 None"""
    cache_name = "models--" + model_id.replace("/", "--")
    
    # 1. 如果 MODEL_CACHE_DIR 已设，先找它
    if MODEL_CACHE_DIR:
        model_dir = Path(MODEL_CACHE_DIR) / cache_name
        if model_dir.exists():
            snapshots = model_dir / "snapshots"
            if snapshots.exists():
                snaps = sorted([s for s in snapshots.iterdir() if s.is_dir()])
                if snaps:
                    return str(snaps[-1])
            return str(model_dir)

    # 2. 扫描所有候选缓存根目录
    for cache_root in _HF_CANDIDATE_PATHS:
        model_dir = cache_root / cache_name
        if model_dir.exists():
            snapshots = model_dir / "snapshots"
            if snapshots.exists():
                snaps = sorted([s for s in snapshots.iterdir() if s.is_dir()])
                if snaps:
                    return str(snaps[-1])
            return str(model_dir)

    return None


def _auto_set_num_threads():
    """自动设置 CPU 线程数（不覆盖用户已有的 OMP_NUM_THREADS / MKL_NUM_THREADS）
    
    策略：取物理核心数（避开超线程），不超过 32 避免调度争抢。
    """
    n = CPU_NUM_THREADS
    if n > 0:
        # 用户显式指定
        import torch
        torch.set_num_threads(n)
        return n
    if "OMP_NUM_THREADS" in os.environ:
        return int(os.environ["OMP_NUM_THREADS"])
    if "MKL_NUM_THREADS" in os.environ:
        n = int(os.environ["MKL_NUM_THREADS"])
        import torch
        torch.set_num_threads(n)
        return n
    # 自动检测物理核心数
    try:
        cpu_count = os.cpu_count() or 4
        # Linux 下尝试读取物理核心数（跳过超线程）
        try:
            with open("/proc/cpuinfo") as f:
                cores = set()
                for line in f:
                    if "cpu cores" in line:
                        cores.add(int(line.split(":")[1].strip()))
                if cores:
                    cpu_count = sum(cores)  # single socket
        except (OSError, IOError):
            pass
        # 上限 32 线程避免调度开销
        n = min(cpu_count, 32)
        import torch
        torch.set_num_threads(n)
        return n
    except Exception:
        return 4


def _parse_dtype(dtype_or_str):
    """将字符串 dtype 解析为 torch.dtype 对象。
    
    IPEX 需要 torch.dtype 类型，不能传字符串。
    如果已经是 torch.dtype 则原样返回。
    """
    import torch
    if isinstance(dtype_or_str, torch.dtype):
        return dtype_or_str
    if not isinstance(dtype_or_str, str):
        return torch.bfloat16  # fallback 安全值
    _DTYPE_MAP = {
        "float32": torch.float32, "float": torch.float32, "fp32": torch.float32,
        "float16": torch.float16, "fp16": torch.float16,
        "bfloat16": torch.bfloat16, "bf16": torch.bfloat16,
    }
    return _DTYPE_MAP.get(dtype_or_str.lower().strip(), torch.bfloat16)


def _apply_ipex_optimize(model, label: str = ""):
    """在 Intel CPU 上应用 IPEX LLM 优化（自动跳过非 Intel 或未安装 IPEX）。
    
    IPEX ipex.llm.optimize() 集成了：
    - oneDNN 线性算子融合 + 定制 kernel
    - 间接访问 KV Cache（IAKV），消除 KV reorder
    - 融合 ROPE / RMSNorm
    - BF16/INT8 计算（当 MODEL_DTYPE 允许时）
    
    如果未安装 IPEX 或不在 Intel CPU，自动静默跳过。
    """
    if not ENABLE_IPEX:
        return model
    tag = f" ({label})" if label else ""
    try:
        import intel_extension_for_pytorch as ipex  # noqa: F401
        import torch
        if hasattr(torch, "xpu") and torch.xpu.is_available():
            print(f"  🚀 IPEX (XPU) 可用，设备非 CPU 模式{tag}")
            return model
        # 将字符串 dtype 转为 torch.dtype 对象
        ipex_dtype = _parse_dtype(MODEL_DTYPE)
        model = ipex.llm.optimize(
            model,
            dtype=ipex_dtype,
            inplace=True,
        )
        print(f"  🚀 IPEX ipex.llm.optimize({ipex_dtype}) 已应用 {tag}")
        return model
    except ImportError:
        pass  # 没装 ipex，静默跳过
    except Exception as e:
        print(f"  ⚠️ IPEX 优化跳过: {e}{tag}")
    return model


def _warmup_model(model, tokenizer, label: str = ""):
    """模型预热：加载后跑一次最短推理，触发图编译/注意力 kernel 选择。
    
    减少首次推理冷启动开销（10~30% 加速首次之后的所有调用）。
    使用一个极短的 prompt + 生成极少的 token。
    """
    if not ENABLE_WARMUP:
        return
    tag = f" ({label})" if label else ""
    try:
        print(f"  🔥 模型预热{tag}...", end=" ", flush=True)
        import torch
        warmup_prompt = "a"
        warmup_inputs = tokenizer(warmup_prompt, return_tensors="pt").to(model.device)
        _ = model.generate(
            **warmup_inputs,
            max_new_tokens=WARMUP_MAX_NEW_TOKENS,
            do_sample=False,
            use_cache=True,
        )
        torch.cuda.empty_cache() if hasattr(torch, "cuda") and torch.cuda.is_available() else None
        print(f"✅{tag}")
    except Exception as e:
        print(f"跳过{tag}: {e}")


def load_model(model_id: str, label: str = "") -> tuple:
    """加载任意 HuggingFace 模型（全局单例 per model_id，本地优先）
    
    加载后自动：
    1. 自动设置 CPU 线程数（物理核心数，上限 32）
    2. 在 Intel CPU 上应用 IPEX ipex.llm.optimize()（~1.5~3x 加速）
    3. 跑一次极短推理预热（减少首次冷启动开销）
    
    返回 (tokenizer, model) 或 (None, None)
    """
    if model_id in _load_model_cache:
        cache_entry = _load_model_cache[model_id]
        if cache_entry[2]:  # tried_before
            return cache_entry[0], cache_entry[1]
    
    # 标记已尝试
    if model_id not in _load_model_cache:
        _load_model_cache[model_id] = [None, None, False]
    
    from transformers import AutoModelForCausalLM, AutoTokenizer
    device = MODEL_DEVICE
    tag = f" ({label})" if label else ""

    # ===== 0. CPU 线程数自动配置 =====
    n_threads = _auto_set_num_threads()
    if n_threads:
        print(f"  🧵 CPU 线程数: {n_threads}{tag}")

    # ===== 策略 1: 直接本地快照路径加载 =====
    local_path = _find_local_model_dir(model_id)
    if local_path:
        print(f"  🔍 找到本地模型快照: {local_path}{tag}")
        try:
            tokenizer = AutoTokenizer.from_pretrained(
                local_path, trust_remote_code=True)
            model = AutoModelForCausalLM.from_pretrained(
                local_path, trust_remote_code=True,
                torch_dtype=MODEL_DTYPE).to(device)
            model = _apply_ipex_optimize(model, label)
            model.eval()
            _warmup_model(model, tokenizer, label)
            _load_model_cache[model_id] = [tokenizer, model, True]
            print(f"  ✅ 本地模型加载成功: {model_id}{tag}")
            return tokenizer, model
        except Exception as e:
            print(f"  ⚠️ 本地快照加载失败 ({e})，继续尝试...")

    # ===== 策略 2: model_id + local_files_only =====
    cache_dir = MODEL_CACHE_DIR or None
    print(f"  🔍 检查本地模型缓存: {model_id}{tag}")
    try:
        tokenizer = AutoTokenizer.from_pretrained(
            model_id, cache_dir=cache_dir,
            trust_remote_code=True, local_files_only=True)
        model = AutoModelForCausalLM.from_pretrained(
            model_id, cache_dir=cache_dir,
            trust_remote_code=True, local_files_only=True,
            torch_dtype=MODEL_DTYPE).to(device)
        model = _apply_ipex_optimize(model, label)
        model.eval()
        _warmup_model(model, tokenizer, label)
        _load_model_cache[model_id] = [tokenizer, model, True]
        print(f"  ✅ 本地模型加载成功: {model_id}{tag}")
        return tokenizer, model
    except EnvironmentError:
        print(f"  📡 本地缓存未找到，尝试从 HuggingFace Hub 下载...")
    except Exception as e:
        print(f"  📡 本地缓存加载失败 ({e})，尝试联网下载...")

    # ===== 策略 3: 联网下载 =====
    try:
        tokenizer = AutoTokenizer.from_pretrained(
            model_id, cache_dir=cache_dir, trust_remote_code=True)
        model = AutoModelForCausalLM.from_pretrained(
            model_id, cache_dir=cache_dir,
            trust_remote_code=True,
            torch_dtype=MODEL_DTYPE).to(device)
        model = _apply_ipex_optimize(model, label)
        model.eval()
        _warmup_model(model, tokenizer, label)
        _load_model_cache[model_id] = [tokenizer, model, True]
        print(f"  ✅ 模型下载并加载成功: {model_id}{tag}")
        return tokenizer, model
    except Exception as e:
        print(f"  ⚠️ 模型不可用: {e}，本次运行不再尝试")
        _load_model_cache[model_id] = [None, None, True]
        return None, None


def load_qwen3(label: str = "") -> tuple:
    """兼容旧接口：加载默认清洗模型（由 CLEANER_MODEL_ID 或 QWEN3_MODEL_ID 决定）"""
    model_id = CLEANER_MODEL_ID or QWEN3_MODEL_ID
    return load_model(model_id, label)