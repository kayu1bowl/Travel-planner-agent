"""
精密等级评分器 — 为知识库分片标注内容精细度（4 级：high / medium / low / uncertain）

设计原则：
  - 纯规则（R1 级别），零模型调用，零延迟
  - 完全独立于现有 category（分类）和 CRAG 清洗逻辑
  - 不修改、不删除任何数据，只在 metadata['precision'] 写入新字段

等级定义：
  high      — 含事实数据：价格、地址、电话、开放时间、距离、路线、URL、坐标
  medium    — 有细节的个人经验：店名/菜名/活动名、建议、对比、具体描述
  low       — 泛泛而谈：模糊态度、无具体信息、极短评论
  uncertain — 无法判断（兜底）

用法:
  from rag_knowledge_base.precision import grade_chunk_precision
  grade = grade_chunk_precision("从奥克兰自驾约3小时...")
  # → "high"
"""

import re
from typing import Dict, Any, List, Optional

# ===================================================================
# 精密信号定义（positive → 加分，negative → 降级）
# ===================================================================

# ── HIGH 信号：含实体事实数据 ──

_HIGH_PATTERNS = [
    # 价格
    r'(?i)\$\s*\d+',                    # $120, $ 50
    r'(?i)\d+\s*NZD',                   # 200NZD
    r'(?i)\d+\s*(美元|人民币|纽币)',     # 200纽币
    r'(?i)票价|门票.*\d+|价格.*\d+',    # 票价50、价格200
    r'(?i)人均.*\d+',                   # 人均800

    # 联系电话
    r'(?i)电话[：:]?\s*[\d\-+\s]{6,}',  # 电话 021-1234567
    r'(?i)手机[：:]?\s*[\d\-+\s]{6,}',

    # 地址
    r'(?i)地址[：:]?\s*\w+',            # 地址：123 Queen St
    r'(?i)位于\s*\w+',                  # 位于奥克兰市中心

    # 开放时间
    r'(?i)(开放|营业)时间[：:]',
    r'(?i)(周一|周二|周三|周四|周五|周六|周日|周[一二三四五六日]).*(至|到|~)\s*\d',
    r'(?i)\d{1,2}[：:]\d{2}\s*[~至]\s*\d{1,2}[：:]\d{2}',  # 09:00~17:00
    r'(?i)(am|pm)\s*[~至]\s*(am|pm)',

    # 距离 / 驾车时间
    r'\d+\s*公[里尺]',
    r'\d+\s*km',
    r'(?i)\d+\s*(分钟|小时|min|hr|h)\s*(车程|路程|步行|驾车)',
    r'(?i)\d+\s*(分钟|小时)([,，]|$)',  # ≈45分钟
    r'(?i)约\s*\d+\s*(分钟|小时)',       # 约45分钟, 约3小时
    r'(?i)驾车\s*\d+',                  # 驾车3小时
    r'(?i)步行\s*\d+',                  # 步行15分钟
    r'(?i)车程\s*\d+',                 # 车程3小时

    # 路线
    r'(?i)(SH\d|1号公路|6号公路|国道)',           # SH6, 1号公路
    r'(?i)从.*到.*(约|大概|大约)\s*\d+',
    r'(?i)(导航|自驾|路线|经.*转.*到)',

    # 日期/时间
    r'(?i)\d{4}年\d{1,2}月',
    r'(?i)(夏季|冬季|春秋|12月|1月|2月).*\d+',
    r'(?i)预订.*(码|号|网站|链接)',

    # URL / 网站
    r'(?i)https?://\S+',
    r'(?i)bookme|intercity|greatsights|realnz',

    # 具体数字 + 单位
    r'(?i)\d+[\.\d]*(米|层|平方|人|位|间|晚|天|个|公里每小时|km/h)',
]

# ── MEDIUM 信号：有细节的个人经验 ──

_MEDIUM_PATTERNS = [
    # 具体店名/地名/活动名
    r'(?i)(推荐|去了|吃过|住过|到过).*(餐厅|酒店|民宿|咖啡馆|咖啡馆|酒吧|超市|店|馆|公园|步道|山|湖|河|海滩|岛)',
    r'(?i)(名字|叫|取名).*(餐厅|酒店|民宿|咖啡馆|店)',

    # 具体菜名/活动
    r'(?i)(点了|吃了|喝了|玩了|去了|体验).*\w{2,}',

    # 对比
    r'(?i)(比|不如|胜于|优于|超过|不如|更(好|差|便宜|贵|推荐|喜欢|值得))',

    # 具体建议
    r'(?i)(强烈|非常|特别|个人|真心).*(推荐|建议|提醒|tips|提醒|注意)',
    r'(?i)(一定|千万|务必).*(要|不要|记得|注意|提前|带)',
    r'(?i)(建议|最好|推荐).*(提前|带|买|订|预约|准备|穿)',

    # 具体花费拆分
    r'(?i)(机票|住宿|租车|油费|门票|吃饭|交通).*[：:]?\s*\d+',
    r'(?i)共计|总计|合计.*\d+',

    # 具体描述
    r'(?i)味道|口感|景色|风景|环境|服务|氛围|装修',

    # 具体事物/品牌/特产
    r'(?i)(flat white|long black|flatwhite|澳白|馥芮白|拿铁|卡布奇诺)',
    r'(?i)(新西兰|当地|本地).*(特色|特产|品牌|牌子|豆子|咖啡|酒|蜂蜜|奶|肉|水果)',
    r'(?i)尤其|特别是|尤其是|最(喜欢|推荐|值得|满意|棒|好)',

    # 经验教训
    r'(?i)(踩坑|避坑|教训|千万别|后悔|血的教训)',
    r'(?i)(幸亏|还好|幸好|没想到).*(带|买|订|提前|准备)',

    # 拍照信息
    r'(?i)机位|拍摄|拍照|摄影|相机|镜头|三脚架|滤镜|调色',
    r'(?i)日出|日落|星空|银河|晚霞|云海|光线',

    # 多层结构信号（行程表头 → 结构化信息）
    r'(?i)(Day\s*\d+|第[一二三四五六七天]天|D\d+)',
    r'(?i)行程.*(天|日|晚|周)',

    # 推荐 + 具体信息
    r'(?i)推荐.{4,}',  # 推荐 + 至少4个字的具体内容
    r'(?i)(名字|叫|店名|餐厅|饭店).{3,}',
]

# ── LOW 信号：模糊、泛泛而谈 ──

_LOW_FULL_MATCH = [
    r'^(?:\s*(不错|好看|很美|开心|好玩|值得|漂亮|还行|一般|挺好的|有意思|棒|赞|难受|累|辛苦))+$',
    r'^\s*\d+\s*$',
]

_LOW_PATTERNS = [
    r'(?i)(好美|好漂亮|太美了|绝了|美哭了|美到窒息)',
    r'(?i)(开心|快乐|幸福|满足|好玩|有趣)',
    r'(?i)(但\s*$|就是\s*$|然后\s*$|结果\s*$)',
    r'(?i)放(图|照片|视频)\s*\d*',      # 只有图片说明
]

# ── NEGATIVE 信号：降级用的噪声特征 ──

_NEGATIVE_SHORT = 30       # 低于 30 字直接 low
_NEGATIVE_NOUN_INFO = 0.15  # 专有名词占比低于此 → low


def _count_proper_ratio(text: str) -> float:
    """计算专有名词/中文实词的占比——高意味着信息密度大"""
    chinese_chars = len(re.findall(r'[\u4e00-\u9fff]', text))
    if chinese_chars == 0:
        return 0.0
    # 数字相关的字符
    num_chars = len(re.findall(r'[\d\.\$%]', text))
    return (chinese_chars + num_chars) / max(len(text), 1)


def grade_chunk_precision(
    chunk_text: str,
    metadata: Optional[Dict[str, Any]] = None,
) -> str:
    """对单个知识库分片进行精密等级评分（纯规则，零模型）

    返回: "high" | "medium" | "low" | "uncertain"

    Args:
        chunk_text: 分片文本
        metadata: 可选的元数据（用于 source/category 等辅助判断）

    Returns:
        精密等级字符串
    """
    text = chunk_text.strip()
    if not text:
        return "uncertain"

    # ── 阶段 0: 空文本 ──
    if not text:
        return "uncertain"

    # ── 阶段 1: 全量匹配（纯情感词） ──
    if any(re.match(p, text) for p in _LOW_FULL_MATCH):
        return "low"

    # ── 阶段 2: HIGH 信号检测（先于长度判断，短而有实料的也能评 high） ──
    high_hits = sum(1 for p in _HIGH_PATTERNS if re.search(p, text))
    if high_hits >= 2:
        return "high"
    single_strong = any(re.search(p, text) for p in [
        r'(?i)\$\s*\d+',
        r'(?i)电话[：:]?\s*[\d\-+\s]{6,}',
        r'(?i)地址[：:]?\s*\w+',
        r'(?i)https?://\S+',
        r'(?i)(开放|营业)时间[：:]',
    ])
    if single_strong:
        return "high"

    # ── 阶段 3: 短文本检测（移到信号检测之后） ──
    if len(text) < _NEGATIVE_SHORT:
        # 但如果有 high/medium 信号则覆盖
        medium_hits = sum(1 for p in _MEDIUM_PATTERNS if re.search(p, text))
        if high_hits >= 1 or medium_hits >= 1:
            pass  # 继续后续判断
        else:
            return "low"

    # ── 阶段 4: LOW 信号过滤 ──
    low_hits = sum(1 for p in _LOW_PATTERNS if re.search(p, text))
    if low_hits >= 2:
        # 检查是否有 medium 信号抵消
        medium_hits = sum(1 for p in _MEDIUM_PATTERNS if re.search(p, text))
        if medium_hits == 0 and high_hits == 0:
            return "low"

    # ── 阶段 5: 信息密度检查 ──
    info_density = _count_proper_ratio(text)
    if info_density < _NEGATIVE_NOUN_INFO and low_hits > 0 and high_hits == 0:
        return "low"

    # ── 阶段 6: MEDIUM 信号检测 ──
    medium_hits = sum(1 for p in _MEDIUM_PATTERNS if re.search(p, text))
    if medium_hits >= 2:
        return "medium"
    if medium_hits >= 1 and len(text) >= 80:
        return "medium"
    if medium_hits >= 1 and len(text) >= 40:
        # 短而结构化（如行程标题）也能 medium
        return "medium"

    # ── 阶段 7: 长篇无任何信号 ──
    if len(text) >= 200:
        return "medium"

    # ── 兜底 ──
    return "uncertain"


def grade_batch(
    chunks: List[Dict[str, Any]],
) -> List[Dict[str, Any]]:
    """批量标注精密等级，在 metadata 中添加 'precision' 字段

    Args:
        chunks: 分片列表，每个分片为 {"text": str, "metadata": dict, "id": str}

    Returns:
        添加了 metadata['precision'] 的分片列表
    """
    for chunk in chunks:
        text = chunk.get("text", "")
        meta = chunk.setdefault("metadata", {})
        # 不覆盖已有 precision
        if "precision" in meta:
            continue
        meta["precision"] = grade_chunk_precision(text, meta)
    return chunks


def print_precision_distribution(chunks: List[Dict[str, Any]]):
    """打印精密等级分布"""
    from collections import Counter
    precisions = Counter(
        c.get("metadata", {}).get("precision", "uncertain")
        for c in chunks
    )
    if not precisions:
        return
    total = len(chunks)
    print(f"\n  🎯 精密等级分布:")
    for level in ["high", "medium", "low", "uncertain"]:
        cnt = precisions.get(level, 0)
        pct = cnt / total * 100
        bar = "█" * int(pct / 5) + "░" * (20 - int(pct / 5))
        print(f"    {level:<12s} {cnt:>4d}  ({pct:5.1f}%)  {bar}")


if __name__ == "__main__":
    # 简单自测
    test_cases = [
        ("从这里开车到皇后镇约45分钟，沿途风景很好", "high"),
        ("电话：021-1234567，地址：123 Queen St, Auckland", "high"),
        ("这家店真的很不错", "low"),
        ("推荐大家去皇后镇的Fergburger，味道很不错，价格也合理", "medium"),
        ("今天天气很好，很开心", "low"),
        ("从奥克兰到基督城大约3小时车程，票价200NZD/人，电话预约", "high"),
        ("Day 1: 抵达皇后镇 → 湖边散步\nDay 2: Milford Sound一日游", "medium"),
    ]
    print(f"{'='*60}")
    print(f"  🧪 精密等级评分器 - 自测")
    print(f"{'='*60}")
    all_ok = True
    for text, expected in test_cases:
        result = grade_chunk_precision(text)
        status = "✅" if result == expected else "❌"
        if result != expected:
            all_ok = False
        print(f"  {status}  {result:<10s} (期待 {expected})  |  {text[:50]}...")
    print(f"{'='*60}")
    print(f"  {'全部通过!' if all_ok else '有误判!'}")
