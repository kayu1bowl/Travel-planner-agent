"""
文本清洗器 — CRAG 三级评估 + 批量 R3 智能筛选

清洗策略（从快到慢，三级体系）：

Level 1 (R1): 规则级 — 零模型，模式匹配噪声过滤
Level 2 (R2): 质量评分级 — 零模型，CRAG 三级评分 (Correct/Ambiguous/Incorrect)
              含丰富的新西兰旅游专用信号，大幅减少 R3 调用
Level 3 (R3): Qwen3-14B 智能级 — 攒批评估，一次推理处理多行

可选模式：
  - backend="rule":  仅 R1+R2（快速，适合大批量预处理）
  - backend="qwen3": R1+R2+R3（完整三级，默认）

模型从 HuggingFace 默认缓存加载，通过环境变量控制：
  QWEN3_MODEL / MODEL_CACHE_DIR / MODEL_DEVICE / MODEL_DTYPE

运行时调优环境变量：
  CLEANER_THRESHOLD  — R2→R3 阈值默认0.5，调高=更少R3
  CLEANER_BATCH_SIZE — R3 批大小默认8，调小=更快反馈
  CLEANER_PARALLEL   — 多文件并行数默认2，调大=更快批量

参考论文: CRAG - Corrective Retrieval Augmented Generation (arXiv:2401.15884)
"""

import json
import os
import re
import sys
import time
from pathlib import Path
from typing import List, Optional, Tuple, Dict, Any, Callable

# 直接加载 config，绕过 rag_knowledge_base.__init__
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
else:
    _project_root = str(_find_project_root(Path(__file__).resolve()))
    if _project_root not in sys.path:
        sys.path.insert(0, _project_root)
    from rag_knowledge_base.config import RAW_DIR, CLEANED_DIR, CLEANER_BACKEND, CLEANER_THRESHOLD


# ===================================================================
# Level 1: 规则级过滤 — 零模型，纯模式匹配
# ===================================================================

_NAV_NOISE = [
    r"(?i)^back to my results$",
    r"(?i)^long.arrow.right$",
    r"(?i)^image information$",
    r"(?i)^find experiences and deals$",
    r"(?i)^learn more about",
    r"(?i)^read more$",
    r"(?i)^view all$",
    r"(?i)^share this$",
    r"(?i)^save this$",
    r"(?i)^print this$",
    r"(?i)^email this$",
    r"(?i)^follow us$",
    r"(?i)^subscribe$",
    r"(?i)^newsletter$",
    r"(?i)^cookie",
    r"(?i)^privacy policy$",
    r"(?i)^terms of use$",
    r"(?i)^all rights reserved$",
    r"^[\s\-–—*•·■●◦✓✕✗✘☐☑☒\+]+$",
    r"^[0-9\s/\-+\|·■●]+$",
    r"^\s*$",
    # 英文导航片段
    r"(?i)^(menu|navigation|breadcrumb|skip to)",
    r"(?i)^loading\.\.\.$",
    r"(?i)^more (options|results|information)",
    r"(?i)^powered by",
    r"(?i)^©",
    # 页眉页脚
    r"(?i)^page \d+",
    r"(?i)^\d+ of \d+$",
    # 广告/促销信号
    r"(?i)^((limited|special|exclusive)\s+)?(time|offer|deal|sale|discount|save|book now)(\s+(today|now|online))?!?$",
    r"(?i)^click (here|now|this link|to learn|for more)",
    r"(?i)^sign up|^subscribe|^register|^join now",
    r"(?i)^(call|text|email|visit) (us|today|now)",
]

_BOILERPLATE = [
    r"(?i)disclaimer",
    r"(?i)while every effort",
    r"(?i)information is subject to change",
    r"(?i)last updated",
    r"(?i)all information is believed to be",
    r"(?i)prices are subject to change",
    r"(?i)we recommend checking",
    r"(?i)this website uses",
    r"(?i)by using our site",
    r"(?i)we use cookies",
]


def _is_rule_noise(para: str) -> bool:
    """R1 规则级噪声检测"""
    return any(re.match(p, para.strip()) for p in _NAV_NOISE)


def _is_boilerplate(para: str) -> bool:
    return bool(re.search('|'.join(_BOILERPLATE), para))


# ===================================================================
# Level 2: CRAG 三级质量评分 — 零模型，加强版信号
# ===================================================================

# 新西兰主要城镇/城市（行首识别用）
_NZ_PLACES = [
    "Auckland", "Wellington", "Christchurch", "Queenstown", "Rotorua",
    "Hamilton", "Tauranga", "Dunedin", "Napier", "Hastings",
    "New Plymouth", "Whangarei", "Invercargill", "Nelson", "Blenheim",
    "Timaru", "Palmerston North", "Gisborne", "Whanganui", "Taupo",
    "Picton", "Kaikoura", "Wanaka", "Franz Josef", "Fox Glacier",
    "Mount Cook", "Tekapo", "Waitomo", "Coromandel", "Bay of Islands",
    "Paihia", "Waitangi", "Russell", "Kerikeri", "Matamata",
    "Hobbiton", "Tongariro", "Abel Tasman", "Milford Sound", "Doubtful Sound",
    "Stewart Island", "Waiheke", "Rangitoto", "White Island", "Lake Taupo",
    "Lake Wanaka", "Lake Wakatipu", "Lake Tekapo", "Mackenzie", "Canterbury",
    "Otago", "Fiordland", "Marlborough", "Waikato", "Northland",
    "Bay of Plenty", "Hawke", "Manawatu", "Wairarapa", "West Coast",
    "Aoraki", "Tasman", "Hokitika", "Greymouth", "Oamaru",
    "Gore", "Te Anau", "Murchison", "Motueka", "Kaikoura",
]

# 新西兰常见毛利语/特有词汇
_NZ_WORDS = [
    "iwi", "hapu", "whanau", "marae", "tangata whenua",
    "kiwi", "kaka", "pukeko", "tui", "kea",
    "DOC", "NZTA", "SH\d", "State Highway",
    "Great Walk", "Great Walks",
    "Department of Conservation",
    "Freedom Camping", "self-contained",
    "kiwifruit", "pavlova", "lamington",
    "bach", "crib", "tramping", "tramp",
    "four-wheel drive", "4WD",
    "hut", "huts", "backcountry",
    "sanctuary", "pest-free", "predator-free",
    "Māori", "Maori",
]

# 中文新西兰地名关键词
_NZ_CN_KEYWORDS = [
    "新西兰", "奥克兰", "惠灵顿", "基督城", "皇后镇",
    "罗托鲁瓦", "但尼丁", "尼尔森", "皮克顿",
    "库克山", "特卡波", "福克斯冰川", "弗朗兹约瑟夫",
    "米尔福德", "神奇峡湾", "阿贝尔塔斯曼",
    "霍比屯", "玛塔玛塔", "怀托摩",
    "北岛", "南岛", "斯图尔特岛",
    "凯库拉", "瓦纳卡", "瓦卡蒂普",
    "汤加里罗", "峡湾", "国家公园",
    "步道", "徒步", "营地", "自驾",
]

# 构建行首地名正则
_PLACE_START_PATTERN = r"^(?:" + "|".join(_NZ_PLACES) + r")\b"

_SIGNAL_POSITIVE = {
    "has_number": lambda t: bool(re.search(r'\d+', t)),
    "starts_with_place": lambda t: bool(re.match(_PLACE_START_PATTERN, t.strip())),
    "has_proper_en": lambda t: len(re.findall(r'\b[A-Z][a-z]{2,}\b', t)) >= 2,
    "has_proper_cn": lambda t: bool(re.findall(r'[\u4e00-\u9fff]{2,}(?:公园|岛|山|湖|河|镇|城|市|区|路|桥|博物馆|广场|海滩|峡湾|冰川|瀑布|温泉|国家公园|机场|港|湾|步道|营地)', t)),
    "has_nz_word": lambda t: any(re.search(r'\b' + w.replace(' ', r'\s+') + r'\b', t, re.I)
                                  for w in _NZ_WORDS if re.match(r'[A-Za-z]', w)),
    "has_nz_cn": lambda t: any(w in t for w in _NZ_CN_KEYWORDS),
    "has_actionable": lambda t: bool(re.search(
        r'(?i)(recommend|suggest|tip|best|top|must|essential|'
        r'开|开放|门票|价格|费用|预订|电话|地址|交通|路线|距离|'
        r'驾车|步行|航班|住宿|餐厅|酒店|攻略|游记|推荐)', t)),
    "has_duration": lambda t: bool(re.search(
        r'\d+\s*(h|hr|min|分钟|小时|天|day|days|km|km/h|kph|'
        r'NZD|\$|米|meters|公里|公里/小时)', t, re.I)),
    "has_travel_word": lambda t: bool(re.search(
        r'(?i)(drive|walk|fly|ferry|bus|train|scenic|view|'
        r'coast|beach|lake|mountain|island|trail|track|road|route|'
        r'visit|tour|trip|journey|flight|accommodation|hotel)', t)),
    "has_verb_phrase": lambda t: bool(re.search(
        r'(?i)(you can|you will|you should|you need|you must|'
        r'enjoy|explore|discover|experience|visit|see|find|'
        r'located|situated|offers|features|provides)', t)),
    "has_direction": lambda t: bool(re.search(
        r'(?i)(north of|south of|east of|west of|'
        r'between|along|near|next to|opposite|'
        r'in the heart|minutes from|km from|drive from)', t)),
    "has_list_marker": lambda t: bool(re.match(
        r'\s*(?:\d+[\.\)]\s|[-*•·]\s|•\s)', t)),
    "has_geography": lambda t: bool(re.search(
        r'(?i)(coast|harbour|harbor|peninsula|isthmus|'
        r'bay|beach|cliff|valley|ridge|peak|volcano|'
        r'glacier|fjord|fiord|waterfall|hot spring|geyser)', t)),
}

_SIGNAL_NEGATIVE = {
    "too_short": lambda t: len(t) < 20,
    "too_long": lambda t: len(t) > 3000,
    "only_links": lambda t: len(t.split('\n')) > 3 and all(
        '/' in l or l.startswith('-') for l in t.split('\n') if l.strip()),
    "boilerplate": lambda t: _is_boilerplate(t),
    "too_many_caps": lambda t: len(re.findall(r'\b[A-Z]{3,}\b', t)) > 5,
    "all_short_lines": lambda t: len(t.split('\n')) > 5 and all(
        len(l.strip()) < 10 for l in t.split('\n') if l.strip()),
}


def _crag_score(para: str) -> Tuple[float, Dict]:
    """CRAG 三级评分：返回 (score, signal_dict)"""
    text = para.strip()
    if not text:
        return 0.0, {}
    signals = {}
    pos_score = 0.0
    pos_count = 0
    for name, fn in _SIGNAL_POSITIVE.items():
        if fn(text):
            signals[name] = True
            pos_score += 0.12
            pos_count += 1
    # 高分奖金：小幅补贴，避免通用词广告绕过R3
    if pos_count >= 5:
        pos_score += 0.08
    elif pos_count >= 4:
        pos_score += 0.05

    neg_score = 0.0
    for name, fn in _SIGNAL_NEGATIVE.items():
        if fn(text):
            signals[name] = True
            if name == "too_short":
                neg_score -= 0.3
            elif name == "too_long":
                neg_score -= 0.1
            elif name == "boilerplate":
                neg_score -= 0.25
            elif name == "too_many_caps":
                neg_score -= 0.2
            elif name == "all_short_lines":
                neg_score -= 0.25
            else:
                neg_score -= 0.2

    length = len(text)
    if 200 <= length <= 1500:
        pos_score += 0.1
    elif 80 <= length <= 200:
        pos_score += 0.05
    if text.startswith('#'):
        pos_score += 0.3

    score = 0.5 + pos_score + neg_score
    score = min(max(score, 0.0), 1.0)
    return score, signals


def _crag_level(score: float) -> str:
    if score >= 0.6:
        return "CORRECT"
    elif score >= 0.3:
        return "AMBIGUOUS"
    else:
        return "INCORRECT"


# ===================================================================
# Level 3: Qwen3-14B 批量评估 — 简化输出格式
# ===================================================================

from rag_knowledge_base.config import load_model, load_qwen3, CLEANER_MODEL_ID, QWEN3_MODEL_ID

# 新版批量 prompt：编号+简化输出，编号匹配消除错位
# 分类 prompt（用于14B，只输出 CORRECT/INCORRECT）
_BATCH_CLASSIFY_PROMPT = """你是一个旅游文本分类器。下面有多段文本，每段有编号，请快速判断每段是否包含实际新西兰旅游信息。

对每段，只输出（严格按此格式，一行一个）：
[N] CORRECT   — 包含旅游信息
[N] INCORRECT — 纯噪声

规则：
- **每行输出 [编号] + CORRECT/INCORRECT**，不要多余文字
- 输出顺序不需要和输入一致，但编号必须正确
- 快速判断，每段3秒内决定

输入文本：
{items}

逐行输出：
"""


# 完整 JSON 输出 prompt（用于1.5B，输出 judgement + 提取文本）
_BATCH_R3_PROMPT = """你是一个旅游文本提取筛选系统。下面有多段文本，每段有编号。请判断每段是否包含实际新西兰旅游信息，如果包含则提取有用内容，如果只有噪声则标记丢弃。

对每段，输出一行 JSON（严格一行一个）：
{{"idx": 编号, "judgment": "CORRECT|INCORRECT", "output": "保留的有用文本（噪声则空字符串）"}}

规则：
- CORRECT = 有实际旅游信息 → output 写去除噪声后的文本
- INCORRECT = 纯噪声 → output 写 ""
- 快速判断，每段3秒内决定
- 输出纯 JSON，不要多余文字

输入文本：
{items}

逐行输出：
"""


def _batch_r3_evaluate(
    batch_items: List[Tuple[int, str]],  # [(行号索引, stripped_text), ...]
    tokenizer,
    model,
) -> List[Tuple[str, str, bool]]:  # [(judgment, output_text, is_kept)]
    """
    批量评估一组 AMBIGUOUS 行。
    根据模型大小自动选择策略：
      14B: 纯分类 [N] CORRECT/INCORRECT（节省 token）
      1.5B: 完整 JSON（模型小，生成成本低）
    """
    if tokenizer is None or model is None or not batch_items:
        return [(_crag_level(_crag_score(t)[0]), t, _crag_score(t)[0] >= 0.3)
                for _, t in batch_items]

    # 根据模型大小自动选择策略：14B 用纯分类省 token，小模型用完整 JSON
    model_name = getattr(model, "_name_or_path", "").lower()
    use_classification = "14b" in model_name  # 14B慢→纯分类省token; 1.5B快→JSON提取更准

    # 构造批量 prompt
    lines = []
    for idx, stripped in batch_items:
        text = stripped[:300]  # 每行截短
        lines.append(f"[{idx}] {text}")

    items_text = "\n---\n".join(lines)

    # 根据策略选择模板和 token 预算
    if use_classification:
        prompt = _BATCH_CLASSIFY_PROMPT.format(total=len(batch_items), items=items_text)
        max_new_tokens = min(300, 8 * len(batch_items) + 32)
    else:
        prompt = _BATCH_R3_PROMPT.format(total=len(batch_items), items=items_text)
        max_new_tokens = min(600, 40 * len(batch_items) + 80)

    try:
        messages = [{"role": "user", "content": prompt}]
        inputs = tokenizer.apply_chat_template(
            messages, tokenize=True, add_generation_prompt=True,
            return_tensors="pt"
        ).to(model.device)

        # 根据策略选择生成的 token 数
        outputs = model.generate(
            **inputs,
            max_new_tokens=max_new_tokens,
            do_sample=False,
        )
        response = tokenizer.decode(
            outputs[0][inputs["input_ids"].shape[1]:], skip_special_tokens=True
        ).strip()

        # 解析输出：严格用 [N] CORRECT/INCORRECT 格式匹配
        # 支持 [N] CORRECT、[N]INCORRECT、N:CORRECT 等变体
        results = {}
        for line in response.split('\n'):
            line = line.strip()
            if not line:
                continue
            if use_classification:
                # [N] CORRECT/INCORRECT 格式
                m = re.match(r'\[?(\d+)\]?[:\.]?\s*(CORRECT|INCORRECT)\b', line, re.I)
                if m:
                    idx = int(m.group(1))
                    is_correct = m.group(2).upper() == "CORRECT"
                    if idx in [it[0] for it in batch_items]:
                        # 找到原始文本
                        orig_text = ""
                        for batch_idx, batch_stripped in batch_items:
                            if batch_idx == idx:
                                orig_text = batch_stripped
                                break
                        results[idx] = (is_correct, orig_text)  # 分类模式保留原文
            else:
                # JSON 格式（用于 1.5B）
                json_match = re.search(r'\{.*\}', line, re.DOTALL)
                if json_match:
                    try:
                        result = json.loads(json_match.group())
                        idx = result.get("idx")
                        if idx is not None and idx in [it[0] for it in batch_items]:
                            judgment = result.get("judgment", "INCORRECT").upper()
                            output_str = result.get("output", "")
                            is_correct = judgment == "CORRECT" and bool(output_str)
                            results[idx] = (is_correct, output_str)  # JSON模式用提取文本
                    except (json.JSONDecodeError, Exception):
                        continue

        # 填结果（缺失项回退R2）
        final = []
        for orig_idx, stripped in batch_items:
            if orig_idx in results:
                is_correct, output_text = results[orig_idx]
                final.append(("CORRECT" if is_correct else "INCORRECT", output_text, is_correct))
            else:
                score, _ = _crag_score(stripped)
                final.append((_crag_level(score), stripped, score >= 0.3))

        return final

    except Exception:
        return [(_crag_level(_crag_score(t)[0]), t, _crag_score(t)[0] >= 0.3)
                for _, t in batch_items]

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
    基于 CRAG 的文本清洗主流程

    参数:
      backend: "rule" | "qwen3" | "qwen2.5" | None (从 config 读取)
      threshold: R2→R3 阈值（默认0.5，环境变量 CLEANER_THRESHOLD）
      file_label: 当前文件名（用于实时进度显示）
      batch_size: R3 批量大小（默认8，环境变量 CLEANER_BATCH_SIZE）
      model_id: 模型 ID，默认从 CLEANER_MODEL_ID 或 QWEN3_MODEL_ID 读取
    """
    import time as _time
    # 确定后端
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
        "kept": 0,
        "r3_batches": 0,
    }

    tokenizer, model = None, None
    if backend == "qwen3" or backend == "qwen2.5":
        if model_id is None:
            model_id = _RUNTIME_DEFAULTS["model_id"]
        tokenizer, model = load_model(model_id, "清洗器")

    _last_report = _time.time()
    _start_time = _time.time()
    _qwen_call_count = 0
    _prefix = f" [{file_label}]" if file_label else ""

    # R3 攒批缓存
    r3_batch = []  # [(行号索引, stripped_text)]
    _last_r3_flush = _time.time()
    _max_r3_wait = 60  # 最长等待 60 秒自动 flush

    def _flush_r3_batch():
        """处理攒批的 R3 行（含时间触发）"""
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

        # R1: 规则噪声
        if _is_rule_noise(stripped):
            stats["r1_noise"] += 1
            continue
        if len(stripped) < 15:
            stats["r1_noise"] += 1
            continue

        # R2: CRAG 三级评分
        score, signals = _crag_score(stripped)
        level = _crag_level(score)

        if level == "CORRECT":
            cleaned.append(stripped)
            stats["kept"] += 1
            continue
        elif level == "INCORRECT":
            stats["r2_incorrect"] += 1
            continue

        # AMBIGUOUS → 攒入 R3 批
        if (backend == "qwen3" or backend == "qwen2.5") and tokenizer is not None:
            r3_batch.append((idx, stripped))
            now = _time.time()
            if len(r3_batch) >= batch_size or (len(r3_batch) > 0 and now - _last_r3_flush >= _max_r3_wait):
                _flush_r3_batch()
                _last_r3_flush = _time.time()
        else:
            if score >= threshold:
                cleaned.append(stripped)
                stats["kept"] += 1
            else:
                stats["r3_drop"] += 1

        # ⏱ 实时进度输出：每 10 行或每 5 秒刷新一次
        now = _time.time()
        if (idx + 1) < total_lines and ((idx + 1) % 10 == 0 or (now - _last_report) >= 5.0):
            _last_report = now
            pct = (idx + 1) / total_lines * 100
            elapsed = now - _start_time
            speed = (idx + 1) / elapsed if elapsed > 0 else 0
            print(f"  ⏳ 清洗进度{_prefix}: {idx+1}/{total_lines} 行 ({pct:.0f}%) | "
                  f"{speed:.1f}行/秒 | R3调{_qwen_call_count}次 | "
                  f"⏳R3待flush({len(r3_batch)})", flush=True)

    # 处理剩余的 R3 批
    _flush_r3_batch()

    result = '\n'.join(cleaned)

    if stats["total"] > 0:
        elapsed = _time.time() - _start_time
        kept_pct = stats["kept"] / stats["total"] * 100
        print(f"  📊 CRAG 清洗{_prefix}: {stats['total']}行→{stats['kept']}行({kept_pct:.0f}%) "
              f"R1噪声{stats['r1_noise']} R2低质{stats['r2_incorrect']} "
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
    """清洗单个文件"""
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
    """并行 worker：清洗单个文件"""
    input_dir_str, output_dir_str, backend, threshold, rel_path = args
    input_dir = Path(input_dir_str)
    output_dir = Path(output_dir_str)
    filepath = input_dir / rel_path
    flat_name = rel_path.replace("/", "_").replace("\\", "_")
    try:
        raw = filepath.read_text(encoding="utf-8")
    except Exception:
        return (rel_path, "读取失败", 0)
    label = flat_name[:40]
    cleaned = clean_text(raw, backend=backend, threshold=threshold, file_label=label)
    out = output_dir / flat_name
    out.write_text(cleaned, encoding="utf-8")
    return (flat_name, "OK", len(raw))


def batch_clean(
    input_dir: Optional[Path] = None,
    output_dir: Optional[Path] = None,
    backend: Optional[str] = None,
    with_summary: bool = False,
    threshold: Optional[float] = None,
    parallel: int = 2,
) -> int:
    """批量清洗所有 raw 文件（支持多文件并行）

    参数:
      with_summary: 保留兼容，已禁用
      threshold: R2→R3 阈值
      parallel: 并行文件数（默认2，环境变量 CLEANER_PARALLEL）
    """
    if input_dir is None:
        input_dir = RAW_DIR
    if output_dir is None:
        output_dir = CLEANED_DIR
    if backend is None:
        try:
            backend = CLEANER_BACKEND
        except Exception:
            backend = "qwen3"
    if threshold is None:
        threshold = _RUNTIME_DEFAULTS["threshold"]
    parallel = int(os.environ.get("CLEANER_PARALLEL", str(parallel)))

    output_dir.mkdir(parents=True, exist_ok=True)
    files = sorted(input_dir.rglob("*.txt"))
    if not files:
        print(f"  ⚠️ raw 目录为空: {input_dir}")
        return 0

    print(f"\n🧹 CRAG 批量清洗: {len(files)} 个文件 "
          f"(backend={backend}, threshold={threshold}, "
          f"batch_size={_RUNTIME_DEFAULTS['batch_size']}, parallel={parallel})")
    print(f"  ℹ️  不做文档级总结，仅做行级 CRAG 筛选")

    import time as _ctime
    _cstart = _ctime.time()

    if parallel > 1 and len(files) > 1 and backend not in ("qwen3", "qwen2.5"):
        # 并行模式（仅 rule 后端，qwen 模型加载子进程会 OOM）
        from concurrent.futures import ProcessPoolExecutor, as_completed

        args_list = [
            (str(input_dir), str(output_dir), backend, threshold, str(f.relative_to(input_dir)))
            for f in files
        ]
        count = 0
        total_raw = 0
        with ProcessPoolExecutor(max_workers=parallel) as executor:
            futures = {executor.submit(_batch_clean_worker, args): args for args in args_list}
            for i, future in enumerate(as_completed(futures)):
                try:
                    result = future.result()
                    fname, status, raw_len = result
                    if status == "OK":
                        count += 1
                        total_raw += raw_len
                    else:
                        print(f"  ❌ {fname}: {status}")
                except Exception as e:
                    print(f"  ❌ 并行任务异常: {e}")
                if (i + 1) % 5 == 0 or i == len(files) - 1:
                    elapsed = _ctime.time() - _cstart
                    fps = (i + 1) / elapsed if elapsed > 0 else 0
                    print(f"  📁 文件进度: {i+1}/{len(files)} | {fps:.2f}文件/秒")
    else:
        # 串行模式（qwen3 或 parallel=1）
        if parallel > 1 and (backend == "qwen3" or backend == "qwen2.5"):
            print(f"  ℹ️  后端=qwen3/qwen2.5，禁用并行（单进程加载模型）")
        count = 0
        for fi, f in enumerate(files):
            try:
                raw = f.read_text(encoding="utf-8")
            except Exception:
                print(f"  ❌ {f.name}: 读取失败")
                continue

            flat_name = str(f.relative_to(input_dir)).replace("/", "_").replace("\\", "_")
            cleaned = clean_text(raw, backend=backend, threshold=threshold, file_label=flat_name[:40])
            out = output_dir / flat_name
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
    p = argparse.ArgumentParser(description="CRAG 文本清洗器")
    p.add_argument("--backend", choices=["rule", "qwen3"], default=None,
                   help="清洗后端（默认从 config 读取）")
    p.add_argument("--threshold", type=float, default=None,
                   help=f"R2→R3 阈值（默认 {_RUNTIME_DEFAULTS['threshold']}，环境变量 CLEANER_THRESHOLD）")
    p.add_argument("--batch-size", type=int, default=None,
                   help=f"R3 批量大小（默认 {_RUNTIME_DEFAULTS['batch_size']}，环境变量 CLEANER_BATCH_SIZE）")
    p.add_argument("--parallel", type=int, default=2,
                   help="并行文件数（默认 2，环境变量 CLEANER_PARALLEL）")
    p.add_argument("--file", type=str, default=None,
                   help="清洗单个文件，不传则批量")
    args = p.parse_args()

    if args.file:
        clean_file(Path(args.file), backend=args.backend, threshold=args.threshold)
    else:
        batch_clean(backend=args.backend, threshold=args.threshold, parallel=args.parallel)