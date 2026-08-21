"""
文本清洗器 — LLM Prompt 驱动三级清洗（零硬编码关键词）

设计原理：
  CRAG (arXiv:2401.15884) 提出的检索评估框架，结合 FILCO (arXiv:2309.04772) 
  的上下文过滤思想，用 LLM 替代规则关键词对文本进行质量评估。

  三级体系：
    R1: 纯结构过滤（空行、纯符号）— 非语义，仅物理层
    R2: LLM Prompt 驱动质量评分 — 按 BUILD_MODE 使用不同强度的 Prompt
    R3: LLM 批量评估 — 攒批推理

  三个构建强度：
    fast     → Qwen2.5-1.5B + 最短 Prompt（是/否判断）
    balanced → Qwen2.5-1.5B + 中等 Prompt（含具体标准）
    precise  → Qwen3-14B + 完整 Prompt（含 Few-shot 示例 + 细化标准）

  参考：
    - Yan et al. "Corrective Retrieval Augmented Generation" (arXiv:2401.15884)
    - Wang et al. "FILCO: Filtering-based Context Selection in RAG" (arXiv:2309.04772)
    - Sarthi et al. "RAPTOR: Recursive Abstractive Processing for Tree-Organized Retrieval" (arXiv:2401.18059)
"""

import json
import os
import re
import sys
import time
from pathlib import Path
from typing import List, Optional, Tuple, Dict, Any, Callable

# 直接加载 config
def _find_project_root(path: Path) -> Path:
    for p in [path, *path.parents]:
        if (p / "rag_knowledge_base").is_dir():
            return p
    return path.parent
_config_path = _find_project_root(Path(__file__).resolve()) / "rag_knowledge_base" / "config.py"
if _config_path.exists():
    import importlib.util
    _spec = importlib.util.spec_from_file_location("rag_config", _config_path)
    _cfg = importlib.util.module_from_spec(_spec)
    _spec.loader.exec_module(_cfg)
    RAW_DIR = _cfg.RAW_DIR
    CLEANED_DIR = _cfg.CLEANED_DIR
    CLEANER_BACKEND = getattr(_cfg, "CLEANER_BACKEND", "qwen3")
    CLEANER_THRESHOLD = getattr(_cfg, "CLEANER_THRESHOLD", 0.5)
    BUILD_MODE = os.environ.get("BUILD_MODE", "balanced").lower()
else:
    _project_root = str(_find_project_root(Path(__file__).resolve()))
    if _project_root not in sys.path:
        sys.path.insert(0, _project_root)
    from rag_knowledge_base.config import RAW_DIR, CLEANED_DIR, CLEANER_BACKEND, CLEANER_THRESHOLD
    BUILD_MODE = os.environ.get("BUILD_MODE", "balanced").lower()

# ===================================================================
# 三级 Prompt 模板（由 BUILD_MODE 选择，零关键词硬编码）
# ===================================================================
#
# Prompt 设计原则：
# 1. 不说"请用以下关键词判断"，而是让 LLM 用自己的语言理解能力判断
# 2. 三档强度仅通过 prompt 长度/复杂度/示例数量控制
# 3. 不预设任何具体关键词（不写 "包含 price/地址 等关键词"）
# ===================================================================

_FAST_R2_PROMPT = """你是一个文本质量评估器。快速判断下面这段文本是否包含有用的旅游信息。

输出一个数字（0.0~1.0）：
- 0.9~1.0 = 有实质旅游信息
- 0.3~0.8 = 可能有，不确定
- 0.0~0.2 = 纯噪声/导航/广告

只输出数字，不要其他文字。

文本：{text}

得分："""

_BALANCED_R2_PROMPT = """你是一个文本质量评估器。判断下面这段文本是否包含有实质内容的旅游信息。

评分标准（0.0~1.0）：
0.9~1.0 — 有实质旅行信息（地点描述、路线、费用、建议、经验等）
0.6~0.8 — 有一定信息量，但较笼统
0.3~0.5 — 可能相关但模糊
0.0~0.2 — 导航文字、广告、免责声明、空白内容

输出格式：一个数字，不要其他文字。

文本：{text}

得分："""

_PRECISE_R2_PROMPT = """你是一个专业的旅行文本质量评估专家。请仔细评估以下文本是否包含有价值的旅行信息。

评估维度：
1. 信息密度 — 是否包含具体的事实性内容（地名、路线、费用、时间等）
2. 实用性 — 是否能帮助读者规划或了解旅行
3. 完整性 — 是否有上下文，还是孤立片段

评分标准（0.0~1.0）：
0.95~1.0 — 高质量旅行信息：具体的地点+体验+实用建议
0.8~0.94 — 良好旅行信息：有实质内容，可能缺少细节
0.6~0.79 — 有一定信息但较笼统
0.4~0.59 — 边界情况：可能有少量有用信息混在噪声中
0.1~0.39 — 大多是噪声/广告/导航不相关内容
0.0~0.09 — 纯噪声

示例：
文本："今天去了Queenstown，风景太美了！" → 0.55（情感>信息）
文本："从Queenstown到Milford Sound约4小时车程，建议早上6点出发" → 0.95
文本："back to my results cookies privacy" → 0.05

只输出数字，不要解释。

文本：{text}

得分："""

# R3 批量评估 Prompt（三档）
_FAST_R3_PROMPT = """你是一个文本分类器。判断每段文本是否包含有用的旅游信息。

对每段输出一行：
[N] CORRECT — 有旅游信息
[N] INCORRECT — 无实质内容

文本：
{items}

逐行输出："""

_BALANCED_R3_PROMPT = """你是一个旅行文本筛选系统。每段文本带编号，判断是否包含实质旅游信息。

规则：
- CORRECT = 有具体旅游信息，值得保留
- INCORRECT = 无实质内容、导航、广告、噪声

对每段输出一行（严格格式）：
[N] CORRECT
[N] INCORRECT

不需要解释。

文本：
{items}

逐行输出："""

_PRECISE_R3_PROMPT = """你是一个专业的旅行文本筛选系统。下面有多段文本，每段有编号。请逐段判断是否包含有价值的旅行信息。

判断准则：
CORRECT — 符合以下任一：
  · 描述旅行目的地/景点/路线/交通
  · 包含实用建议/费用/时间/经验分享
  · 有具体地理或事实信息
  · 有效的行程规划内容

INCORRECT — 以下情况丢弃：
  · 纯导航/菜单/广告/促销
  · 法律声明/cookie通知
  · 空白或极短无意义文本
  · 纯情感抒发无事实信息

输出格式（每行一个，严格遵循）：
[N] CORRECT
[N] INCORRECT

示例：
[1] CORRECT
[2] INCORRECT

文本：
{items}

逐行输出："""


def _get_r2_prompt() -> str:
    """根据 BUILD_MODE 返回 R2 Prompt 模板"""
    mode = os.environ.get("BUILD_MODE", "balanced").lower()
    if mode == "fast":
        return _FAST_R2_PROMPT
    elif mode == "precise":
        return _PRECISE_R2_PROMPT
    return _BALANCED_R2_PROMPT


def _get_r3_prompt() -> str:
    """根据 BUILD_MODE 返回 R3 批量 Prompt 模板"""
    mode = os.environ.get("BUILD_MODE", "balanced").lower()
    if mode == "fast":
        return _FAST_R3_PROMPT
    elif mode == "precise":
        return _PRECISE_R3_PROMPT
    return _BALANCED_R3_PROMPT


# ===================================================================
# Level 1: 纯结构过滤（非语义，仅物理层）
# ===================================================================

def _is_structural_noise(para: str) -> bool:
    """R1 结构级过滤 — 仅检测纯物理特征，不涉及语义"""
    stripped = para.strip()
    if not stripped:
        return True
    # 标题行保留
    if stripped.startswith('#'):
        return False
    # 纯符号行
    if re.match(r'^[\s\-–—*•·■●◦✓✕✗✘☐☑☒\+=\\/|_~]+$', stripped):
        return True
    if re.match(r'^[0-9\s/\-+\|·■●]+$', stripped):
        return True
    return False


# ===================================================================
# Level 2: LLM Prompt 驱动质量评分（R2）
# ===================================================================

def _llm_score(text: str, tokenizer, model) -> float:
    """用 LLM 评估单段文本质量，返回 0~1 分数
    无模型时使用纯物理结构降级（字符长度，不涉及语义关键词）
    """
    if tokenizer is None or model is None:
        # 降级：纯长度判断（唯一的结构特征，不涉及语义关键词）
        t = text.strip()
        if len(t) < 15:
            return 0.1
        if len(t) >= 200:
            return 0.7
        if len(t) >= 50:
            return 0.6
        return 0.4

    prompt = _get_r2_prompt().format(text=text[:2000])
    try:
        messages = [{"role": "user", "content": prompt}]
        inputs = tokenizer.apply_chat_template(
            messages, tokenize=True, add_generation_prompt=True,
            return_tensors="pt"
        ).to(model.device)
        outputs = model.generate(
            **inputs, max_new_tokens=8,
            do_sample=False, use_cache=True,
        )
        response = tokenizer.decode(
            outputs[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True
        ).strip()
        # 解析数字
        score = float(re.search(r'[\d.]+', response).group()) if re.search(r'[\d.]+', response) else 0.5
        return min(max(score, 0.0), 1.0)
    except Exception:
        return 0.5


def _llm_level(score: float) -> str:
    """将 LLM 分数映射为 CORRECT/AMBIGUOUS/INCORRECT"""
    if score >= 0.6:
        return "CORRECT"
    elif score >= 0.3:
        return "AMBIGUOUS"
    else:
        return "INCORRECT"


# ===================================================================
# Level 3: 批量 LLM 评估（R3）
# ===================================================================

from rag_knowledge_base.config import load_model, CLEANER_MODEL_ID, QWEN3_MODEL_ID


def _batch_r3_evaluate(
    batch_items: List[Tuple[int, str]],
    tokenizer,
    model,
) -> List[Tuple[str, str, bool]]:
    """用 LLM 批量评估 AMBIGUOUS 行"""
    if tokenizer is None or model is None or not batch_items:
        return [("AMBIGUOUS", t, True) for _, t in batch_items]

    prompt_template = _get_r3_prompt()
    lines = []
    for idx, stripped in batch_items:
        text = stripped[:300]
        lines.append(f"[{idx}] {text}")

    items_text = "\n---\n".join(lines)
    prompt = prompt_template.format(items=items_text)
    max_new_tokens = min(300, 8 * len(batch_items) + 32)

    try:
        messages = [{"role": "user", "content": prompt}]
        inputs = tokenizer.apply_chat_template(
            messages, tokenize=True, add_generation_prompt=True,
            return_tensors="pt"
        ).to(model.device)
        outputs = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            do_sample=False,
            use_cache=True,
        )
        response = tokenizer.decode(
            outputs[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True
        ).strip()

        results = {}
        for line in response.split('\n'):
            line = line.strip()
            if not line:
                continue
            m = re.match(r'\[?(\d+)\]?[:\.]?\s*(CORRECT|INCORRECT)\b', line, re.I)
            if m:
                idx = int(m.group(1))
                is_correct = m.group(2).upper() == "CORRECT"
                if idx in [it[0] for it in batch_items]:
                    orig_text = ""
                    for batch_idx, batch_stripped in batch_items:
                        if batch_idx == idx:
                            orig_text = batch_stripped
                            break
                    results[idx] = (is_correct, orig_text)

        final = []
        for orig_idx, stripped in batch_items:
            if orig_idx in results:
                is_correct, output_text = results[orig_idx]
                final.append(("CORRECT" if is_correct else "INCORRECT", output_text, is_correct))
            else:
                final.append(("AMBIGUOUS", stripped, True))
        return final

    except Exception:
        return [("AMBIGUOUS", t, True) for _, t in batch_items]


# ===================================================================
# 主清洗流程
# ===================================================================

_RUNTIME_DEFAULTS = {
    "threshold": float(os.environ.get("CLEANER_THRESHOLD", "0.5")),
    "batch_size": int(os.environ.get("CLEANER_BATCH_SIZE", "8")),
    "backend": os.environ.get("CLEANER_BACKEND", "") or CLEANER_BACKEND,
    "model_id": os.environ.get("CLEANER_MODEL_ID", "") or CLEANER_MODEL_ID or QWEN3_MODEL_ID,
}


def clean_text(
    text: str,
    backend: Optional[str] = None,
    use_qwen: bool = True,
    threshold: Optional[float] = None,
    file_label: str = "",
    batch_size: Optional[int] = None,
    model_id: Optional[str] = None,
) -> str:
    """
    基于 LLM 驱动的文本清洗主流程（零硬编码关键词）

    流程：
      R1: 结构过滤（纯物理特征）
      R2: LLM Prompt 驱动质量评分（by BUILD_MODE）
      R3: LLM 批量评估模糊片段
    """
    import time as _time
    if backend is None:
        try:
            backend = CLEANER_BACKEND
        except Exception:
            backend = "qwen3"
    if not use_qwen:
        backend = "rule"

    if threshold is None:
        threshold = _RUNTIME_DEFAULTS["threshold"]
    if batch_size is None:
        batch_size = _RUNTIME_DEFAULTS["batch_size"]

    lines = text.split('\n')
    cleaned = []
    total_lines = len(lines)
    stats = {
        "total": 0, "title": 0,
        "r1_noise": 0, "r2_incorrect": 0,
        "r3_keep": 0, "r3_drop": 0,
        "kept": 0, "r3_batches": 0,
    }

    tokenizer, model = None, None
    if backend in ("qwen3", "qwen2.5"):
        if model_id is None:
            model_id = _RUNTIME_DEFAULTS["model_id"]
        tokenizer, model = load_model(model_id, "清洗器")

    _last_report = _time.time()
    _start_time = _time.time()
    _qwen_call_count = 0
    _prefix = f" [{file_label}]" if file_label else ""

    # R3 攒批缓存
    r3_batch = []
    _last_r3_flush = _time.time()
    _max_r3_wait = 60

    def _flush_r3_batch():
        nonlocal r3_batch
        if not r3_batch:
            return
        stats["r3_batches"] += 1
        nonlocal _qwen_call_count
        _qwen_call_count += 1
        bsz = len(r3_batch)
        print(f"  🤖 R3批推理: {bsz} 行...", end=" ", flush=True)
        _t0 = _time.time()
        results = _batch_r3_evaluate(r3_batch, tokenizer, model)
        _t1 = _time.time()
        batch_speed = bsz / (_t1 - _t0 + 0.001)
        print(f"({_t1-_t0:.1f}s, {batch_speed:.1f}行/秒)")
        for (orig_idx, stripped), (judgment, output_text, kept) in zip(r3_batch, results):
            if kept:
                cleaned.append(output_text if output_text else stripped)
                stats["r3_keep"] += 1
                stats["kept"] += 1
            else:
                stats["r3_drop"] += 1
        r3_batch = []

    for idx, line in enumerate(lines):
        stats["total"] += 1
        stripped = line.strip()
        if not stripped:
            continue

        # 保留标题
        if stripped.startswith('#'):
            cleaned.append(line)
            stats["title"] += 1
            stats["kept"] += 1
            continue

        # R1: 结构噪声（纯物理过滤，不涉及语义）
        if _is_structural_noise(stripped):
            stats["r1_noise"] += 1
            continue
        if len(stripped) < 15:
            stats["r1_noise"] += 1
            continue

        # R2: LLM 评分
        score = _llm_score(stripped, tokenizer, model) if backend in ("qwen3", "qwen2.5") else 0.5
        level = _llm_level(score)

        if level == "CORRECT":
            cleaned.append(stripped)
            stats["kept"] += 1
            continue
        elif level == "INCORRECT":
            stats["r2_incorrect"] += 1
            continue

        # AMBIGUOUS → 攒入 R3 批
        if backend in ("qwen3", "qwen2.5") and tokenizer is not None:
            r3_batch.append((idx, stripped))
            now = _time.time()
            if len(r3_batch) >= batch_size or (len(r3_batch) > 0 and now - _last_r3_flush >= _max_r3_wait):
                _flush_r3_batch()
                _last_r3_flush = _time.time()
        else:
            # rule 后端：用 LLM 评分（或 fallback 0.5）直接决定
            if score >= threshold:
                cleaned.append(stripped)
                stats["kept"] += 1
            else:
                stats["r2_incorrect"] += 1

        # 实时进度
        now = _time.time()
        if (idx + 1) < total_lines and ((idx + 1) % 10 == 0 or (now - _last_report) >= 5.0):
            _last_report = now
            pct = (idx + 1) / total_lines * 100
            elapsed = now - _start_time
            speed = (idx + 1) / elapsed if elapsed > 0 else 0
            print(f"  ⏳ 清洗进度{_prefix}: {idx+1}/{total_lines} 行 ({pct:.0f}%) | "
                  f"{speed:.1f}行/秒 | R3调{_qwen_call_count}次 | "
                  f"⏳R3待flush({len(r3_batch)})", flush=True)

    _flush_r3_batch()

    result = '\n'.join(cleaned)

    if stats["total"] > 0:
        elapsed = _time.time() - _start_time
        kept_pct = stats["kept"] / stats["total"] * 100
        print(f"  📊 LLM清洗{_prefix}: {stats['total']}行→{stats['kept']}行({kept_pct:.0f}%) "
              f"R1结构过滤{stats['r1_noise']} R2低质{stats['r2_incorrect']} "
              f"R3保留{stats['r3_keep']} R3丢弃{stats['r3_drop']}"
              + (f" R3批{stats['r3_batches']}" if stats['r3_batches'] else "")
              + f" | 耗时{elapsed:.0f}s")

    return result


def clean_file(
    filepath: Path,
    output_dir: Optional[Path] = None,
    backend: Optional[str] = None,
    threshold: Optional[float] = None,
) -> Optional[str]:
    if output_dir is None:
        output_dir = CLEANED_DIR
    try:
        raw = filepath.read_text(encoding="utf-8")
    except Exception as e:
        print(f"  ❌ 读取失败: {filepath.name} — {e}")
        return None
    cleaned = clean_text(raw, backend=backend, threshold=threshold, file_label=filepath.name[:40])
    out = output_dir / filepath.name
    out.write_text(cleaned, encoding="utf-8")
    return str(out)


def _batch_clean_worker(args):
    input_dir_str, output_dir_str, backend, threshold, fname = args
    input_dir = Path(input_dir_str)
    output_dir = Path(output_dir_str)
    filepath = input_dir / fname
    try:
        raw = filepath.read_text(encoding="utf-8")
    except Exception:
        return (fname, "读取失败", 0)
    label = fname[:40]
    cleaned = clean_text(raw, backend=backend, threshold=threshold, file_label=label)
    out = output_dir / fname
    out.write_text(cleaned, encoding="utf-8")
    return (fname, "OK", len(raw))


def batch_clean(
    input_dir: Optional[Path] = None,
    output_dir: Optional[Path] = None,
    backend: Optional[str] = None,
    with_summary: bool = False,
    threshold: Optional[float] = None,
    parallel: int = 2,
) -> int:
    if input_dir is None:
        input_dir = RAW_DIR
    elif not isinstance(input_dir, Path):
        input_dir = Path(input_dir)
    if output_dir is None:
        output_dir = CLEANED_DIR
    elif not isinstance(output_dir, Path):
        output_dir = Path(output_dir)
    if backend is None:
        try:
            backend = CLEANER_BACKEND
        except Exception:
            backend = "qwen3"
    if threshold is None:
        threshold = _RUNTIME_DEFAULTS["threshold"]
    parallel = int(os.environ.get("CLEANER_PARALLEL", str(parallel)))

    output_dir.mkdir(parents=True, exist_ok=True)
    files = sorted(input_dir.glob("*.txt"))
    if not files:
        print(f"  ⚠️ raw 目录为空: {input_dir}")
        return 0

    mode = os.environ.get("BUILD_MODE", "balanced")
    print(f"\n🧹 LLM Prompt 驱动清洗: {len(files)} 个文件 "
          f"(backend={backend}, BUILD_MODE={mode}, "
          f"batch_size={_RUNTIME_DEFAULTS['batch_size']}, parallel={parallel})")

    import time as _ctime
    _cstart = _ctime.time()

    count = 0
    for fi, f in enumerate(files):
        try:
            raw = f.read_text(encoding="utf-8")
        except Exception:
            print(f"  ❌ {f.name}: 读取失败")
            continue
        cleaned = clean_text(raw, backend=backend, threshold=threshold, file_label=f.name[:40])
        out = output_dir / f.name
        out.write_text(cleaned, encoding="utf-8")
        count += 1
        if count % 10 == 0 or fi == len(files) - 1:
            elapsed = _ctime.time() - _cstart
            fps = (fi + 1) / elapsed if elapsed > 0 else 0
            print(f"  📁 文件 {fi+1}/{len(files)} | 已完成 {count} 个 | {fps:.2f}文件/秒")

    raw_size = sum(f.stat().st_size for f in files)
    cleaned_files = sorted(output_dir.glob("*.txt"))
    cleaned_size = sum(f.stat().st_size for f in cleaned_files)
    raw_kb = raw_size / 1024
    clean_kb = cleaned_size / 1024
    ratio = cleaned_size / raw_size * 100 if raw_size > 0 else 0
    print(f"\n📊 汇总: {count}/{len(files)} 个 | "
          f"{raw_kb:.0f}KB → {clean_kb:.0f}KB ({ratio:.0f}%)")
    return count


if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser(description="LLM Prompt 驱动文本清洗器")
    p.add_argument("--backend", choices=["rule", "qwen3"], default=None)
    p.add_argument("--threshold", type=float, default=None)
    p.add_argument("--batch-size", type=int, default=None)
    p.add_argument("--parallel", type=int, default=2)
    p.add_argument("--file", type=str, default=None)
    args = p.parse_args()

    if args.file:
        clean_file(Path(args.file), backend=args.backend, threshold=args.threshold)
    else:
        batch_clean(backend=args.backend, threshold=args.threshold, parallel=args.parallel)