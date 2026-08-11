"""
文本清洗器 — 基于 CRAG (arXiv:2401.15884) 三级评估 + Decompose-then-Recompose

清洗策略（从快到慢，三级体系）：

Level 1: 规则级 (R1) — 零模型，O(1)/行
  噪声模式匹配 + 过短丢弃

Level 2: 质量评分级 (R2) — 零模型，O(1)/行
  CRAG 风格的 "Correct/Ambiguous/Incorrect" 三级评分
  Correct  (≥0.6): 直接保留
  Ambiguous (0.3~0.6): 进入 R3 用 Qwen 判断
  Incorrect (<0.3): 直接丢弃

Level 3: Qwen 智能级 (R3) — ~30ms/行
  Decompose-then-Recompose: 对长段落拆句 → 逐句判断 → 重新组合
  对短段落直接 PASS/DROP + extraction（提取有用部分而非全丢）

参考论文:
  CRAG - Corrective Retrieval Augmented Generation (arXiv:2401.15884)
  核心思想: 三级评估 + 自纠错 + 知识选择性利用
"""

import json
import os
import re
import sys
import time
from pathlib import Path
from typing import List, Optional, Tuple, Dict

# 直接加载 config，绕过 rag_knowledge_base.__init__（避免触发 llama_index 等重依赖）
_config_path = Path(__file__).parent.parent / "config.py"
if _config_path.exists():
    import importlib.util
    _spec = importlib.util.spec_from_file_location("rag_config", _config_path)
    _cfg = importlib.util.module_from_spec(_spec)
    _spec.loader.exec_module(_cfg)
    RAW_DIR = _cfg.RAW_DIR
    CLEANED_DIR = _cfg.CLEANED_DIR
else:
    from rag_knowledge_base.config import RAW_DIR, CLEANED_DIR


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
]

_BOILERPLATE = [
    r"(?i)disclaimer",
    r"(?i)while every effort",
    r"(?i)information is subject to change",
    r"(?i)last updated",
    r"(?i)all information is believed to be",
    r"(?i)prices are subject to change",
    r"(?i)we recommend checking",
]


def _is_rule_noise(para: str) -> bool:
    """R1 规则级噪声检测"""
    return any(re.match(p, para.strip()) for p in _NAV_NOISE)


def _is_boilerplate(para: str) -> bool:
    return bool(re.search('|'.join(_BOILERPLATE), para))


# ===================================================================
# Level 2: CRAG 三级质量评分 — 零模型
# ===================================================================
# 参考 CRAG 论文：Correct / Ambiguous / Incorrect 三级评估体系
# 每个段落得到三个信号的综合评分

_SIGNAL_POSITIVE = {
    "has_number": lambda t: bool(re.search(r'\d+', t)),
    "has_proper_en": lambda t: len(re.findall(r'\b[A-Z][a-z]{2,}\b', t)) >= 2,
    "has_proper_cn": lambda t: bool(re.findall(r'[\u4e00-\u9fff]{2,}(?:公园|岛|山|湖|河|镇|城|市|区|路|桥|博物馆|广场|海滩|峡湾|冰川|瀑布|温泉|国家公园|机场|港|湾|步道|营地)', t)),
    "has_actionable": lambda t: bool(re.search(r'(?i)(recommend|suggest|tip|best|top|must|essential|开|开放|门票|价格|费用|预订|电话|地址|交通|路线|距离|驾车|步行|航班|住宿|餐厅|酒店)', t)),
    "has_duration": lambda t: bool(re.search(r'\d+\s*(h|hr|min|分钟|小时|天|day|days|km|km/h|kph|NZD|\$|米|meters|公里)', t, re.I)),
    "has_travel_word": lambda t: bool(re.search(r'(?i)(drive|walk|fly|ferry|bus|train|scenic|view|coast|beach|lake|mountain|island|trail|track|road|route)', t)),
    "has_verb_phrase": lambda t: bool(re.search(r'(?i)(you can|you will|you should|you need|you must|enjoy|explore|discover|experience|visit|see|find)', t)),
}

_SIGNAL_NEGATIVE = {
    "too_short": lambda t: len(t) < 20,
    "too_long": lambda t: len(t) > 3000,
    "only_links": lambda t: len(t.split('\n')) > 3 and all('/' in l or l.startswith('-') for l in t.split('\n') if l.strip()),
    "boilerplate": lambda t: _is_boilerplate(t),
}


def _crag_score(para: str) -> Tuple[float, Dict]:
    """
    CRAG 三级评分：返回 (score, signal_dict)

    score 范围及对应等级:
      0.6 ~ 1.0:  CORRECT  — 直接保留
      0.3 ~ 0.6:  AMBIGUOUS — 进入 Qwen 判断
      0.0 ~ 0.3:  INCORRECT — 直接丢弃
    """
    text = para.strip()
    if not text:
        return 0.0, {}

    signals = {}

    # 积极信号：每命中 +0.1~0.15
    pos_score = 0.0
    for name, fn in _SIGNAL_POSITIVE.items():
        if fn(text):
            signals[name] = True
            pos_score += 0.12

    # 消极信号：每命中 -0.2~0.3
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
            else:
                neg_score -= 0.2

    # 长度奖励
    length = len(text)
    if 200 <= length <= 1500:
        pos_score += 0.1
    elif 80 <= length <= 200:
        pos_score += 0.05

    # 标题行
    if text.startswith('#'):
        pos_score += 0.3

    score = 0.5 + pos_score + neg_score
    score = min(max(score, 0.0), 1.0)

    return score, signals


def _crag_level(score: float) -> str:
    """将分数映射为 CRAG 三级"""
    if score >= 0.6:
        return "CORRECT"
    elif score >= 0.3:
        return "AMBIGUOUS"
    else:
        return "INCORRECT"


# ===================================================================
# Level 3: Qwen 智能级
# ===================================================================
# 参考 CRAG 论文：
# 1. Decompose-then-Recombine — 对长文本拆句→逐句判断→重组
# 2. Knowledge Selection — 选择性提取有用部分而非全丢

_CRAG_QWEN_PROMPT = """你是一个旅游信息质量审核系统（基于CRAG架构）。

你的任务是对一段文本进行三级评估并选择性提取有用信息。

分类标准：
CORRECT: 包含具体景点介绍、交通/住宿/餐饮实用信息、文化背景、活动推荐、自驾路线、价格/开放时间等旅游数据
AMBIGUOUS: 部分有用但混有噪声/广告，或描述过于笼统
INCORRECT: 导航菜单、Cookie声明、版权信息、纯链接列表、占位文字、重复页眉页脚

输出严格的JSON格式：
{{"judgment": "CORRECT|AMBIGUOUS|INCORRECT", "reason": "一句话理由", "extraction": "提取的有用部分(仅对CORRECT和AMBIGUOUS)"}}

例1: "Back to my results"
{{"judgment": "INCORRECT", "reason": "导航按钮标签", "extraction": ""}}

例2: "Driving from Christchurch to Queenstown takes approximately 5 hours via State Highway 1 and 6, offering stunning views of Canterbury plains and Mackenzie Country."
{{"judgment": "CORRECT", "reason": "具体的自驾路线时间+沿途景观", "extraction": "Driving from Christchurch to Queenstown takes approximately 5 hours via State Highway 1 and 6, offering stunning views of Canterbury plains and Mackenzie Country."}}

例3: "Auckland is known for its beautiful harbour and vibrant culture. Book your stay now with exclusive deals!"
{{"judgment": "AMBIGUOUS", "reason": "首句有用但尾部含广告", "extraction": "Auckland is known for its beautiful harbour and vibrant culture."}}

文本: {text}
"""


def _init_qwen():
    """加载 Qwen2.5-1.5B-Instruct 用于 CRAG 三级评估"""
    try:
        from transformers import AutoModelForCausalLM, AutoTokenizer
        model_name = os.getenv("QWEN_CLEANER_MODEL", "Qwen/Qwen2.5-1.5B-Instruct")
        device = os.getenv("QWEN_DEVICE", "cpu")
        print(f"  🔍 加载 Qwen CRAG 评估器: {model_name} (device={device})")
        tokenizer = AutoTokenizer.from_pretrained(model_name, trust_remote_code=True)
        model = AutoModelForCausalLM.from_pretrained(
            model_name, trust_remote_code=True,
            torch_dtype="auto"
        ).to(device)
        return tokenizer, model
    except Exception as e:
        print(f"  ⚠️ Qwen 加载失败: {e}，回退到规则过滤")
        return None, None


def _qwen_evaluate(para: str, tokenizer, model) -> Tuple[str, str]:
    """
    CRAG 三级 Qwen 评估
    Returns: (judgment, extraction)
      judgment: "CORRECT" | "AMBIGUOUS" | "INCORRECT"
      extraction: 提取的有用文本（CORRECT/AMBIGUOUS才有）
    """
    if tokenizer is None or model is None:
        score, _ = _crag_score(para)
        return _crag_level(score), para if score >= 0.3 else ""

    prompt = _CRAG_QWEN_PROMPT.format(text=para[:600])
    try:
        messages = [{"role": "user", "content": prompt}]
        inputs = tokenizer.apply_chat_template(
            messages, tokenize=True, add_generation_prompt=True,
            return_tensors="pt"
        ).to(model.device)

        outputs = model.generate(
            inputs, max_new_tokens=120,  # 需要更多 token 输出 extraction
            do_sample=False, temperature=0.05,
        )
        response = tokenizer.decode(
            outputs[0][inputs.shape[1]:], skip_special_tokens=True
        ).strip()

        # 解析 JSON
        try:
            # 找到 JSON 部分（不依赖整段是 JSON）
            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
                judgment = result.get("judgment", "AMBIGUOUS")
                extraction = result.get("extraction", para)
                return judgment, extraction
        except (json.JSONDecodeError, KeyError):
            pass

        # 后备：关键词匹配
        if "CORRECT" in response:
            return "CORRECT", para
        elif "INCORRECT" in response:
            return "INCORRECT", ""
        return "AMBIGUOUS", para

    except Exception:
        score, _ = _crag_score(para)
        return _crag_level(score), para if score >= 0.3 else ""


def _decompose_recompose(para: str, tokenizer, model) -> Optional[str]:
    """
    CRAG Decompose-then-Recompose:
    对长段落（>300字）拆分为句子，逐句评估，只重组高质量句子

    这解决了"一段话前半有用后半是广告"的问题
    """
    text = para.strip()
    if len(text) < 300:
        return None  # 短段落不用拆

    # 拆句（中英文句号、感叹号、问号、换行）
    sentences = re.split(r'(?<=[。！？.!?\n])\s*', text)
    if len(sentences) <= 1:
        return None  # 单句不用拆

    kept = []
    for sent in sentences:
        sent = sent.strip()
        if not sent or len(sent) < 5:
            continue

        # 规则快速过
        if _is_rule_noise(sent):
            continue

        score, _ = _crag_score(sent)

        if score >= 0.6:  # CORRECT
            kept.append(sent)
        elif score >= 0.3:  # AMBIGUOUS → Qwen 判断
            judgment, extraction = _qwen_evaluate(sent, tokenizer, model)
            if judgment != "INCORRECT" and extraction:
                kept.append(extraction)

    if not kept:
        return ""  # 全部丢弃
    if len(kept) == len(sentences):
        return None  # 全部保留，不需要重组

    return " ".join(kept) if kept else None


# ===================================================================
# 主清洗流程
# ===================================================================


def clean_text(
    text: str,
    use_qwen: bool = True,
    threshold: float = 0.5,
) -> str:
    """
    基于 CRAG 的文本清洗主流程

    1. 规则级 R1: 噪声模式 + 模板声明
    2. 评分级 R2: CRAG 三级评分 (Correct/Ambiguous/Incorrect)
    3. Qwen 级 R3 (可选):
       - 短模糊段: Qwen 直接判断 + extraction
       - 长模糊段: Decompose-then-Recompose
       - Incorrect 段: 直接丢弃
    """
    lines = text.split('\n')
    cleaned = []
    stats = {
        "total": 0, "title": 0,
        "r1_noise": 0, "r2_incorrect": 0,
        "r3_ambiguous_keep": 0, "r3_ambiguous_drop": 0,
        "r3_decompose": 0, "kept": 0,
    }

    tokenizer, model = None, None
    if use_qwen:
        tokenizer, model = _init_qwen()

    for line in lines:
        stats["total"] += 1
        stripped = line.strip()

        if not stripped:
            continue

        # === 保留标题 ===
        if stripped.startswith('#'):
            cleaned.append(line)
            stats["title"] += 1
            stats["kept"] += 1
            continue

        # === R1: 规则噪声 ===
        if _is_rule_noise(stripped):
            stats["r1_noise"] += 1
            continue

        if len(stripped) < 15:
            stats["r1_noise"] += 1
            continue

        # === R2: CRAG 三级评分 ===
        score, signals = _crag_score(stripped)
        level = _crag_level(score)

        if level == "CORRECT":
            cleaned.append(stripped)
            stats["kept"] += 1
            continue

        elif level == "INCORRECT":
            stats["r2_incorrect"] += 1
            continue

        # === R3: Ambiguous — 用 Qwen 智能判断 ===
        # 长段落：Decompose-then-Recompose
        if use_qwen and tokenizer is not None and len(stripped) > 300:
            result = _decompose_recompose(stripped, tokenizer, model)
            if result is not None:
                stats["r3_decompose"] += 1
                if result.strip():
                    cleaned.append(result)
                    stats["kept"] += 1
                continue

        # 短段落：Qwen 直接判断 + extraction
        if use_qwen and tokenizer is not None:
            judgment, extraction = _qwen_evaluate(stripped, tokenizer, model)
            if judgment == "CORRECT":
                cleaned.append(extraction or stripped)
                stats["r3_ambiguous_keep"] += 1
                stats["kept"] += 1
            elif judgment == "AMBIGUOUS" and extraction:
                cleaned.append(extraction)
                stats["r3_ambiguous_keep"] += 1
                stats["kept"] += 1
            else:
                stats["r3_ambiguous_drop"] += 1
        else:
            # 没有 Qwen：Ambiguous 按照阈值决策
            if score >= threshold:
                cleaned.append(stripped)
                stats["kept"] += 1
            else:
                stats["r3_ambiguous_drop"] += 1

    result = '\n'.join(cleaned)

    if stats["total"] > 0:
        kept_pct = stats["kept"] / stats["total"] * 100
        print(f"  📊 CRAG 清洗: {stats['total']}行→{stats['kept']}行({kept_pct:.0f}%) "
              f"R1噪声{stats['r1_noise']} R2低质{stats['r2_incorrect']} "
              f"R3保留{stats['r3_ambiguous_keep']} R3丢弃{stats['r3_ambiguous_drop']}"
              + (f" 拆句{stats['r3_decompose']}" if stats['r3_decompose'] else ""))

    return result


def clean_file(
    filepath: Path,
    output_dir: Optional[Path] = None,
    use_qwen: bool = True,
    threshold: float = 0.5,
) -> Optional[str]:
    """清洗单个文件"""
    if output_dir is None:
        output_dir = CLEANED_DIR
    try:
        raw = filepath.read_text(encoding="utf-8")
    except Exception as e:
        print(f"  ❌ 读取失败: {filepath.name} — {e}")
        return None
    cleaned = clean_text(raw, use_qwen=use_qwen, threshold=threshold)
    out = output_dir / filepath.name
    out.write_text(cleaned, encoding="utf-8")
    return str(out)


def batch_clean(
    input_dir: Optional[Path] = None,
    output_dir: Optional[Path] = None,
    use_qwen: bool = True,
    threshold: float = 0.5,
) -> int:
    """批量清洗所有 raw 文件"""
    if input_dir is None:
        input_dir = RAW_DIR
    if output_dir is None:
        output_dir = CLEANED_DIR
    output_dir.mkdir(parents=True, exist_ok=True)

    files = sorted(input_dir.glob("*.txt"))
    if not files:
        print(f"  ⚠️ raw 目录为空: {input_dir}")
        return 0

    print(f"\n🧹 CRAG 批量清洗: {len(files)} 个文件 "
          f"(Qwen={use_qwen}, threshold={threshold})")

    count = 0
    for f in files:
        print(f"  {f.name[:55]}...", end=" ", flush=True)
        if clean_file(f, output_dir, use_qwen=use_qwen, threshold=threshold):
            count += 1
        else:
            print()

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
    p.add_argument("--qwen", action="store_true", default=True,
                   help="启用 Qwen CRAG 评估")
    p.add_argument("--no-qwen", action="store_false", dest="qwen",
                   help="禁用 Qwen，仅用规则")
    p.add_argument("--threshold", type=float, default=0.5,
                   help="阈值 (0~1), 默认 0.5")
    p.add_argument("--file", type=str, default=None,
                   help="清洗单个文件，不传则批量")
    args = p.parse_args()

    if args.file:
        clean_file(Path(args.file), use_qwen=args.qwen, threshold=args.threshold)
    else:
        batch_clean(use_qwen=args.qwen, threshold=args.threshold)