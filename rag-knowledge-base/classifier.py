"""
智能分类器 — LLM Prompt 驱动分类（零硬编码关键词）

设计原理：
  不使用任何硬编码的关键词规则、正则匹配或预设分类体系。
  分类体系由模型根据数据样本自主发现，分类时也由模型自主判断。

  参考：
  - LLM 零样本分类能力 (Brown et al., 2020, GPT-3)
  - "Large Language Models are Zero-Shot Reasoners" (Kojima et al., arXiv:2205.11916)
  - 用 Prompt 工程替代人工预设分类体系

  fallback 链:
    分类发现: Qwen 调用 → fallback "general"
    分类执行: Qwen 逐条分类 → fallback "general"
"""

import json
import os
import re
from typing import List, Dict, Any

from rag_knowledge_base.config import load_model, CLASSIFIER_MODEL_ID

_BUILD_MODE = os.environ.get("BUILD_MODE", "balanced").lower()

# ===================================================================
# 分类发现 Prompt（三档强度）
# ===================================================================

_FAST_DISCOVER_PROMPT = """阅读以下旅行文本样本，给出 5~10 个分类，用英文短词。

只输出 JSON：
{{"categories": [{{"name": "分类名", "description": "简短定义"}}]}}

样本：
{samples}"""

_BALANCED_DISCOVER_PROMPT = """你是一个旅行知识库的分类专家。阅读下方文本片段样本，自主设计一套分类体系。

要求：
1. 类别要覆盖旅行相关的内容维度（不是按国家分）
2. 5~12 个类别，每个类别有明确定义
3. 类别名用英文短词

示例类别维度（仅供参考，不要照搬，根据数据自行决定）：
- 目的地/景点类的描述
- 交通与路线
- 住宿与餐饮
- 文化与活动
- 实用信息
- ……

先阅读样本，再决定最适合的分类体系。

只输出以下 JSON，不要其他文字：
{{"categories": [{{"name": "类别名", "description": "类别定义"}}]}}

样本片段：
{samples}"""

_PRECISE_DISCOVER_PROMPT = """你是一个专业的旅行知识库分类体系设计师。阅读下方提供的文本片段样本，根据内容的实际分布，自主构建一套覆盖性强、区分度高的分类体系。

设计原则：
1. **数据驱动** — 分类应反映样本中的实际内容，而非预设模板
2. **互斥性** — 每个类别应尽量互斥，减少"似乎都能放"的情况
3. **覆盖性** — 类别应能覆盖样本中至少 90% 的内容
4. **实用性** — 分类应有助于后续检索和过滤

类别数量：5~12 个。
类别命名：英文短词，简洁明确。

思考步骤（不要输出，只用于指导思考）：
a) 先扫描样本涉及的主题
b) 识别自然聚集的内容群组
c) 为每个群组赋予标签和定义

只输出以下 JSON：
{{"categories": [{{"name": "类别名", "description": "类别定义"}}]}}

样本片段（标题/来源/内容节选）：
{samples}"""

# ===================================================================
# 分类执行 Prompt（三档）
# ===================================================================

_FAST_CLASSIFY_PROMPT = """将下面这段文本归入最合适的类别。

可选类别：{categories}

输出 JSON：{{"category": "类别名", "reason": "简短理由"}}

文本：{text}"""

_BALANCED_CLASSIFY_PROMPT = """你是一个快速文本分类器。将下面的文本片段归入最合适的类别。

可选类别：
{categories}

规则：
- 快速判断，不要过度思考
- 如含多个可能，选最具体的
- 都不匹配用 "general"
- 输出纯 JSON

输出格式：
{{"category": "类别名", "reason": "简短理由"}}

标题: {title}
来源: {source}
内容: {text}"""

_PRECISE_CLASSIFY_PROMPT = """你是一个专业的旅行文本分类器。请仔细阅读文本和可选类别，选择最合适的分类。

可选类别（名称 + 定义）：
{categories}

分类规则（按优先级）：
1. **内容主导** — 根据文本的实际内容，而非标题或来源
2. **最具体原则** — 如果多个类别都沾边，选最具体贴切的那个
3. **否决不匹配** — 如果文本明显不属于任何类别，用 "general"
4. **快速判断** — 每段 5 秒内做出决定，不要过度纠结

输出 JSON：
{{"category": "类别名", "reason": "为什么归入这个类别（一句话）"}}

标题: {title}
来源: {source}
文本内容: {text}"""


def _get_discover_prompt() -> str:
    mode = os.environ.get("BUILD_MODE", "balanced").lower()
    if mode == "fast":
        return _FAST_DISCOVER_PROMPT
    elif mode == "precise":
        return _PRECISE_DISCOVER_PROMPT
    return _BALANCED_DISCOVER_PROMPT


def _get_classify_prompt() -> str:
    mode = os.environ.get("BUILD_MODE", "balanced").lower()
    if mode == "fast":
        return _FAST_CLASSIFY_PROMPT
    elif mode == "precise":
        return _PRECISE_CLASSIFY_PROMPT
    return _BALANCED_CLASSIFY_PROMPT


# ===================================================================
# 工具函数
# ===================================================================

def _generate_json(tokenizer, model, prompt: str, max_tokens: int = 800, temperature: float = 0.5) -> str:
    messages = [{"role": "user", "content": prompt}]
    inputs = tokenizer.apply_chat_template(
        messages, tokenize=True, add_generation_prompt=True,
        return_tensors="pt"
    ).to(model.device)
    try:
        input_ids = inputs["input_ids"]
    except (TypeError, KeyError):
        input_ids = inputs
    outputs = model.generate(
        **inputs, max_new_tokens=max_tokens,
        do_sample=True, temperature=temperature, top_p=0.9,
        use_cache=True,
    )
    response = tokenizer.decode(
        outputs[0][input_ids.shape[1]:], skip_special_tokens=True
    ).strip()
    return response


def _extract_json(response: str):
    json_match = re.search(r'\{.*\}', response, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass
    return None


# ===================================================================
# 分类发现
# ===================================================================

def discover_categories(chunks: List[Dict[str, Any]]) -> List[str]:
    """让 LLM 阅读数据样本，自主发现并定义分类体系"""
    if not chunks:
        return ["general"]

    tokenizer, model = load_model(CLASSIFIER_MODEL_ID, "分类器")
    if tokenizer is None:
        print("  ⚠️ LLM 不可用，使用 'general' 作为唯一分类")
        return ["general"]

    sample_size = min(100, len(chunks))
    sources_seen = set()
    samples = []
    for c in chunks:
        src = c.get("metadata", {}).get("source_name", "?")
        if src not in sources_seen or len(samples) < sample_size:
            sources_seen.add(src)
            samples.append(c)
        if len(samples) >= sample_size:
            break

    sample_lines = []
    for i, c in enumerate(samples, 1):
        meta = c.get("metadata", {})
        text = c.get("text", "")[:400]
        sample_lines.append(
            f"[样本 {i}]\n"
            f"  标题: {meta.get('title', '?')}\n"
            f"  来源: {meta.get('source_name', '?')}\n"
            f"  内容: {text}\n"
        )

    prompt = _get_discover_prompt().format(samples="\n".join(sample_lines))

    for attempt in range(2):
        temp = 0.5 if attempt == 0 else 0.3
        response = _generate_json(tokenizer, model, prompt, max_tokens=800, temperature=temp)
        result = _extract_json(response)
        if result:
            cats = result.get("categories", [])
            names = [c["name"] if isinstance(c, dict) else c for c in cats]
            if names:
                print(f"  🏷️  LLM 自主发现分类: {names}")
                return names
        print(f"  ⚠️ 第{attempt+1}次分类发现解析失败，重试...")

    print(f"  ⚠️ 分类发现失败，使用默认分类")
    return ["general"]


# ===================================================================
# 分类执行
# ===================================================================

def classify_chunks(
    chunks: List[Dict[str, Any]],
    categories: List[str],
    embed_model=None,
    max_workers: int = 4,
) -> List[Dict[str, Any]]:
    """对每个片段逐一用 LLM 分类"""
    if not chunks:
        return chunks

    total = len(chunks)

    # 默认分类快速路径
    if categories == ["general"]:
        for c in chunks:
            c.setdefault("metadata", {})["category"] = "general"
        print(f"  🏷️  分类: 全部设为 general ({total} 条)")
        return chunks

    tokenizer, model = load_model(CLASSIFIER_MODEL_ID, "分类器")
    if tokenizer is None:
        print(f"  ⚠️ LLM 不可用，全部设为 general ({total} 条)")
        for c in chunks:
            c.setdefault("metadata", {})["category"] = "general"
        return chunks

    cat_list = "\n".join(f"- {cat}" for cat in categories)
    cat_counts = {cat: 0 for cat in categories}
    if "general" not in cat_counts:
        cat_counts["general"] = 0

    prompt_template = _get_classify_prompt()

    import time as _time
    _start = _time.time()

    for i, c in enumerate(chunks):
        meta = c.get("metadata", {})
        text = c.get("text", "")[:600]
        prompt = prompt_template.format(
            categories=cat_list,
            title=meta.get("title", ""),
            source=meta.get("source_name", ""),
            text=text,
        )
        try:
            response = _generate_json(tokenizer, model, prompt, max_tokens=64, temperature=0.3)
            result = _extract_json(response)
            cat = result.get("category", "general") if result else "general"
            if cat not in cat_counts:
                cat = "general"
            cat_counts[cat] = cat_counts.get(cat, 0) + 1
            c.setdefault("metadata", {})["category"] = cat
        except Exception:
            c.setdefault("metadata", {})["category"] = "general"
            cat_counts["general"] = cat_counts.get("general", 0) + 1

        if (i + 1) % 20 == 0 or i == total - 1:
            elapsed = _time.time() - _start
            speed = (i + 1) / elapsed if elapsed > 0 else 0
            top_cats = sorted(cat_counts.items(), key=lambda x: -x[1])[:5]
            cat_summary = " ".join(f"{k}={v}" for k, v in top_cats)
            print(f"  🏷️  分类进度: {i+1}/{total} ({((i+1)/total*100):.0f}%) | "
                  f"{speed:.1f}条/秒 | {cat_summary}", flush=True)

    elapsed = _time.time() - _start
    top_cats = sorted(cat_counts.items(), key=lambda x: -x[1])[:5]
    cat_summary = " ".join(f"{k}={v}" for k, v in top_cats)
    print(f"  🏷️  分类完成: {total} 条 | 耗时 {elapsed:.0f}s | {cat_summary}")
    return chunks