"""
智能分类器 — 基于 Qwen3-14B

流程：
  1. 采样 50~100 个片段，让 Qwen3-14B 自主发现并定义分类体系
  2. 对每个片段用 Qwen3-14B 归入最合适的类别
  3. 全由模型驱动，不硬编码分类规则

模型通过 config.load_qwen3 共享单例。
"""

import json
import re
from typing import List, Dict, Any

from rag_knowledge_base.config import load_model, CLASSIFIER_MODEL_ID


# ===================================================================
# 分类发现 Prompt
# ===================================================================

_DISCOVER_PROMPT = """你是一个新西兰旅游知识库的分类专家。请阅读下方的文本片段样本，根据内容自主设计一套分类体系。

要求：
1. 类别应该有实际意义，覆盖旅游相关内容（目的地、交通、文化、美食、户外活动等）
2. 类别数量 5~12 个，每个类别有明确的定义
3. 类别名用英文短词（如 "city", "nature", "driving", "culture", "food"）

请先认真阅读样本内容，再决定用什么类别最合理。

输出格式（只输出以下 JSON，不要包含其他任何文字）：
{{"categories": [{{"name": "类别名", "description": "类别定义"}}]}}

样本片段（title/来源/内容节选）：
{samples}
"""

_CLASSIFY_PROMPT = """你是一个快速文本分类器。将下面的文本片段归入最合适的类别。

可选类别：
{categories}

规则（必须遵守）：
- **快速判断，3秒内决定**，不要过度思考
- 如果包含多个可能，选最具体的那个
- 如果都不匹配，用 "general"
- 输出纯 JSON，不要多余文字

输出格式：
{{"category": "类别名", "reason": "简短理由"}}

标题: {title}
来源: {source}
内容: {text}
"""


# ===================================================================
# 工具：用模型生成 JSON
# ===================================================================

def _generate_json(
    tokenizer,
    model,
    prompt: str,
    max_tokens: int = 800,
    temperature: float = 0.5,
) -> str:
    """调用模型生成文本，返回原始响应"""
    messages = [{"role": "user", "content": prompt}]
    inputs = tokenizer.apply_chat_template(
        messages, tokenize=True, add_generation_prompt=True,
        return_tensors="pt"
    ).to(model.device)

    # BatchEncoding 继承 UserDict 而非 dict，不能用 isinstance(..., dict) 判断
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
    """从模型响应中提取并解析 JSON"""
    json_match = re.search(r'\{.*\}', response, re.DOTALL)
    if json_match:
        return json.loads(json_match.group())
    return None


# ===================================================================
# 纯规则快速分类（零模型，关键词匹配 fallback）
# ===================================================================

_RULE_CLASSIFIERS = [
    ("driving", [
        r'(?i)(自驾|驾驶|开车|租车|car rental|self.?drive|road trip|SH\d|国道|公路|导航|route|drive)',
        r'(?i)(驾照|驾照翻译|国际驾照|driver.?license|右舵|have?your right|traffic rule|交通规则)',
        r'(?i)(加油|petrol|gas|fuel|充电|charging|parking|停车|toll|收费)',
        r'(?i)(车程|公里|km/h|km|车速|速度限|限速)',
    ]),
    ("food", [
        r'(?i)(美食|餐厅|饭店|café|cafe|restaurant|吃|food|dining|eat|menu|菜单)',
        r'(?i)(菜|dish|cuisine|chef|cook|bake|grill|BBQ|烤肉|火锅|hotpot)',
        r'(?i)(咖啡|coffee|茶|tea|酒|wine|beer|brew|bar|pub)',
        r'(?i)(推荐.*(餐厅|菜|店|馆)|(餐厅|菜|店|馆).*推荐)',
    ]),
    ("accommodation", [
        r'(?i)(住宿|酒店|hotel|民宿|motel|lodge|hostel|B&B|bnb|度假村|resort)',
        r'(?i)(房|room|床位|bed|cabin|hut|小屋|营位|campsite|campground)',
        r'(?i)(住|stay|入住|check.?in|book|预订|booking.com|accommodation)',
        r'(?i)(自由露营|freedom camping|self.?contained|motorhome|RV|房车)',
    ]),
    ("nature", [
        r'(?i)(国家公园|national park|自然|nature|scenic|风景|view|lookout|观景)',
        r'(?i)(湖|lake|tekapo|wanaka|wakatipu|taupo|pukaki|havéa)',
        r'(?i)(山|mountain|mount|alpine|peak|volcano|冰川|glacier|fjord|峡湾|fiord)',
        r'(?i)(海滩|beach|coast|coastal|bay|港湾|harbour|island|岛)',
        r'(?i)(徒步|hiking|walk|track|trail|tramp|步道|adventure|户外|outdoor)',
        r'(?i)(温泉|hot spring|geyser|间歇泉|地热|geothermal|毛利|maori|culture)',
        r'(?i)(星空|stars|night sky|暗夜|dark sky|观星|astronomy|天文)',
    ]),
    ("transportation", [
        r'(?i)(航班|flight|airline|airport|机场|航空|飞机|plane|fly)',
        r'(?i)(轮渡|ferry|船|boat|cruise|游轮|interisland|bluebridge)',
        r'(?i)(公交|bus|shuttle|intercity|客车|大巴|coach|train|铁路|rail)',
        r'(?i)(交通|transport|public transport|通勤|commute)',
    ]),
    ("city", [
        r'(?i)(奥克兰|auckland|皇后镇|queenstown|基督城|christchurch|惠灵顿|wellington)',
        r'(?i)(但尼丁|dunedin|罗托鲁瓦|rotorua|napier|尼尔森|nelson|皮克顿|picton)',
        r'(?i)(市中心|city centre|downtown|cbd|urban|town|city guide|城市)',
        r'(?i)(博物馆|museum|gallery|美术馆|剧院|theatre|历史|history|heritage)',
    ]),
    ("visa", [
        r'(?i)(签证|visa|护照|passport|immigration|移民|入境|entry|customs|海关)',
        r'(?i)(NZeTA|nzeta|电子旅行|电子签|eta)',
        r'(?i)(海关申报|customs declaration|检疫|biosecurity|quarantine)',
    ]),
    ("weather", [
        r'(?i)(天气|weather|气候|climate|季节|season|温度|temperature|下雨|rain)',
        r'(?i)(夏季|冬季|春秋|12月|1月|2月|月份|month|温度|度|celsius)',
        r'(?i)(风暴|storm|台风|typhoon|wind|风|snow|雪|雨|rainfall)',
    ]),
    ("itinerary", [
        r'(?i)(Day\s*\d|第[一二三四五六七天\d]天|D\d|行程|itinerary|计划|plan)',
        r'(?i)(天\s*晚|天\s*日|日\s*游|days|周|week|路线|route)',
        r'(?i)(推荐路线|推荐行程|经典|行程安排|travel plan|trip planner)',
    ]),
    ("photography", [
        r'(?i)(摄影|photography|拍照|photo|相机|camera|镜头|lens)',
        r'(?i)(机位|拍摄|拍|shot|sunrise|日出|sunset|日落|golden hour|黄金时刻)',
        r'(?i)(调色|滤镜|filter|edit|后期|post.?process|三脚架|tripod)',
    ]),
    ("safety", [
        r'(?i)(安全|safety|danger|危险|warning|警告|caution|小心|注意|emergency)',
        r'(?i)(报警|police|急救|ambulance|医院|hospital|保险|insurance)',
        r'(?i)(道路安全|road safety|事故|accident|救援|rescue|search and rescue)',
        r'(?i)(安全驾驶|安全第一|注意安全|防盗|theft)',
    ]),
]


def _quick_rule_category(text: str) -> str:
    """基于关键词匹配的纯规则快速分类，零模型调用"""
    scores = {}
    for cat, patterns in _RULE_CLASSIFIERS:
        hit = 0
        for p in patterns:
            matches = re.findall(p, text)
            hit += len(matches)
        if hit > 0:
            scores[cat] = hit
    if not scores:
        return "general"
    # 按命中数取最高
    best = max(scores, key=scores.get)
    return best


def _rule_discover_categories(chunks: List[Dict[str, Any]]) -> List[str]:
    """用关键词扫描所有 chunk，返回实际匹配到的分类列表"""
    active = set()
    for c in chunks:
        cat = _quick_rule_category(c.get("text", ""))
        if cat != "general":
            active.add(cat)
    if not active:
        return ["general"]
    # 与 _RULE_CLASSIFIERS 顺序一致排序
    ordered = [c for c, _ in _RULE_CLASSIFIERS if c in active]
    if not ordered:
        return ["general"]
    return ordered


# ===================================================================
# 分类发现
# ===================================================================

def discover_categories(chunks: List[Dict[str, Any]]) -> List[str]:
    """让 Qwen3-14B 阅读数据样本，自主发现并定义分类体系

    fallback 链: Qwen3 发现 → 失败则纯规则关键词发现
    """
    if not chunks:
        return ["general"]

    tokenizer, model = load_model(CLASSIFIER_MODEL_ID, "分类器")
    if tokenizer is None:
        print("  ⚠️ Qwen3 模型不可用，使用纯规则关键词分类")
        cats = _rule_discover_categories(chunks)
        print(f"  🏷️  规则引擎发现分类: {cats}")
        return cats

    # 采样最多 100 个片段，覆盖不同来源
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

    prompt = _DISCOVER_PROMPT.format(samples="\n".join(sample_lines))

    # 第 1 次尝试
    response = _generate_json(tokenizer, model, prompt, max_tokens=800, temperature=0.5)
    print(f"  📝 分类器发现原始响应(前150字): {response[:150]}")

    result = _extract_json(response)
    if result:
        cats = result.get("categories", [])
        names = [c["name"] if isinstance(c, dict) else c for c in cats]
        if names:
            print(f"  🏷️  Qwen3 自主发现分类: {names}")
            return names

    # 第 2 次尝试：强制简化
    print(f"  ⚠️ 首次分类发现解析失败，重试（严格模式）...")
    retry_prompt = prompt + "\n\n【重要】请只输出 JSON 对象，不要写任何解释。"
    response = _generate_json(tokenizer, model, retry_prompt, max_tokens=600, temperature=0.3)
    result = _extract_json(response)
    if result:
        cats = result.get("categories", [])
        names = [c["name"] if isinstance(c, dict) else c for c in cats]
        if names:
            print(f"  🏷️  Qwen3 自主发现分类: {names}")
            return names

    print(f"  ⚠️ 分类发现失败，使用默认分类。原始响应: {response[:200]}")
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
    """对每个片段逐一分类

    fallback 链: Qwen3 逐条分类 → 纯规则关键词分类 → 统一设为 general
    带实时进度输出。
    """
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
        # fallback: 纯规则关键词分类
        print(f"  ⚠️ LLM 不可用，使用纯规则关键词分类 ({total} 条)")
        cat_counts = {cat: 0 for cat in categories}
        cat_counts.setdefault("general", 0)
        for c in chunks:
            text = c.get("text", "")
            cat = _quick_rule_category(text)
            # 确保 cat 在 categories 中
            if cat not in cat_counts:
                cat = "general"
            cat_counts[cat] = cat_counts.get(cat, 0) + 1
            c.setdefault("metadata", {})["category"] = cat
        # 打印分布
        top_cats = sorted(cat_counts.items(), key=lambda x: -x[1])[:5]
        cat_summary = " ".join(f"{k}={v}" for k, v in top_cats)
        print(f"  🏷️  规则分类完成: {total} 条 | {cat_summary}")
        return chunks

    cat_list = "\n".join(f"- {cat}" for cat in categories)
    cat_counts = {cat: 0 for cat in categories}
    if "general" not in cat_counts:
        cat_counts["general"] = 0

    import time as _time
    _start = _time.time()

    for i, c in enumerate(chunks):
        meta = c.get("metadata", {})
        text = c.get("text", "")[:600]  # 减小输入
        prompt = _CLASSIFY_PROMPT.format(
            categories=cat_list,
            title=meta.get("title", ""),
            source=meta.get("source_name", ""),
            text=text,
        )
        try:
            response = _generate_json(tokenizer, model, prompt, max_tokens=64, temperature=0.3)

            json_match = re.search(r'\{.*\}', response, re.DOTALL)
            if json_match:
                result = json.loads(json_match.group())
                cat = result.get("category", "general")
            else:
                # 回退：从文字中匹配
                for cat in categories:
                    if cat.lower() in response.lower():
                        break
                else:
                    cat = "general"

            if cat not in cat_counts:
                cat = "general"
            cat_counts[cat] = cat_counts.get(cat, 0) + 1
            c.setdefault("metadata", {})["category"] = cat

        except Exception:
            c.setdefault("metadata", {})["category"] = "general"
            cat_counts["general"] = cat_counts.get("general", 0) + 1

        # 实时进度：每 20 条或最后一条
        elapsed = _time.time() - _start
        speed = (i + 1) / elapsed if elapsed > 0 else 0
        if (i + 1) % 20 == 0 or i == total - 1:
            progress_pct = (i + 1) / total * 100
            top_cats = sorted(cat_counts.items(), key=lambda x: -x[1])[:5]
            cat_summary = " ".join(f"{k}={v}" for k, v in top_cats)
            print(f"  🏷️  分类进度: {i+1}/{total} ({progress_pct:.0f}%) | "
                  f"{speed:.1f}条/秒 | {cat_summary}", flush=True)

    elapsed = _time.time() - _start
    top_cats = sorted(cat_counts.items(), key=lambda x: -x[1])[:5]
    cat_summary = " ".join(f"{k}={v}" for k, v in top_cats)
    print(f"  🏷️  分类完成: {total} 条 | 耗时 {elapsed:.0f}s | {cat_summary}")

    return chunks