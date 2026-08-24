#!/usr/bin/env python3
"""
社交平台中文游记采集器

补充 crawl4ai_fetcher.py 的英文官方数据，从中文社交平台获取真实游记体验。

数据源（三层可用性）:
  ✅ Layer 1 — 马蜂窝 (mafengwo.cn)
      新西兰目的地页 + 游记/攻略列表，公开可爬
      包含：真实用户游记、行程规划、费用、评价
  ✅ Layer 2 — 穷游 (qyer.com)
      新西兰目的地页 + 行程助手/锦囊，公开可爬
      包含：实用攻略、签证、交通、住宿、景点评价
  ⚠️ Layer 3 — 小红书
      直接爬取几乎不可行（WAF + 登录墙 + 设备指纹）
      提供 3 种替代方案：
        A. 手动导入 markdown（最推荐）
        B. mock 模式（开发测试用，生成风格逼真的伪游记）
        C. 付费 API 代理预留

数据流: 采集/导入 → data/raw/（与 builder.py 整合）
文件格式: {编号}_{平台}_{目的地/主题}.txt
  首行 # 标题
  后接正文（metadata 写入文件名前缀）

用法:
  # 爬取马蜂窝新西兰游记
  python rag_knowledge_base/crawler/social_fetcher.py --source mafengwo

  # 爬取穷游新西兰攻略
  python rag_knowledge_base/crawler/social_fetcher.py --source qyer

  # 全量采集（马蜂窝 + 穷游）
  python rag_knowledge_base/crawler/social_fetcher.py --source all

  # 导入已保存的小红书 markdown 文件
  python rag_knowledge_base/crawler/social_fetcher.py --source xiaohongshu --mode import --input-dir ./xhs_saved/

  # Mock 模式（生成伪游记用于开发测试）
  python rag_knowledge_base/crawler/social_fetcher.py --source xiaohongshu --mode mock --count 10
"""

import asyncio
import json
import os
import re
import sys
import time
import hashlib
import random
from pathlib import Path
from typing import Optional, List, Dict, Any
from datetime import datetime, timedelta

# ── 路径（动态检测项目根目录） ──
def _find_project_root(path: Path) -> Path:
    for p in [path, *path.parents]:
        if (p / "rag_knowledge_base").is_dir():
            return p
    return path.parent
PROJECT_DIR = _find_project_root(Path(__file__).resolve())
RAW_DIR = PROJECT_DIR / "rag_knowledge_base" / "data" / "raw"
RAW_DIR.mkdir(parents=True, exist_ok=True)

USER_AGENT = (
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
    "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36"
)
REQUEST_DELAY = 1.0       # 礼貌间隔
MAX_RETRIES = 3

# ── 计数器：保证文件名编号不重叠 ──
def _next_seq() -> int:
    """自动续接已有文件的编号"""
    existing = list(RAW_DIR.glob("*.txt"))
    nums = []
    for f in existing:
        m = re.match(r"(\d+)", f.stem)
        if m:
            nums.append(int(m.group(1)))
    return (max(nums) + 1) if nums else 60  # 从 60 起（前 59+ 预留给 crawl4ai）


# ===================================================================
# 工具函数
# ===================================================================

def _safe_write(fname: str, content: str) -> str:
    """写入 raw 目录并返回完整路径"""
    path = RAW_DIR / fname
    path.write_text(content, encoding="utf-8")
    print(f"  💾 {fname}  ({len(content)} chars)")
    return str(path)


def _fetch(url: str, timeout: int = 20) -> Optional[str]:
    """通用 HTTP GET，带重试"""
    import requests as rl
    headers = {"User-Agent": USER_AGENT, "Accept": "text/html,*/*"}
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = rl.get(url, headers=headers, timeout=timeout)
            if resp.status_code == 200:
                return resp.text
            print(f"  ⚠️ HTTP {resp.status_code} ({attempt}/{MAX_RETRIES})")
            time.sleep(REQUEST_DELAY * attempt)
        except Exception as e:
            print(f"  ⚠️ {str(e)[:60]} ({attempt}/{MAX_RETRIES})")
            time.sleep(REQUEST_DELAY * attempt)
    return None


# ===================================================================
# 马蜂窝采集器
# ===================================================================
# 马蜂窝目的地页面: https://www.mafengwo.cn/travel-scenic-spot/mafengwo/{id}.html
# 游记列表: https://www.mafengwo.cn/gonglve/ziyouxing/{dest_id}/1-0-0-0.html
# 游记详情: https://www.mafengwo.cn/i/{note_id}.html

_MAFENGWO_DESTINATIONS = [
    # (目的地ID或搜索词, 地名, 中文名)
    ("10065", "auckland", "奥克兰"),
    ("10066", "wellington", "惠灵顿"),
    ("10067", "christchurch", "基督城"),
    ("10069", "queenstown", "皇后镇"),
    ("10080", "rotorua", "罗托鲁瓦"),
    ("10070", "dunedin", "但尼丁"),
    ("11090", "taupo", "陶波"),
    ("11091", "wanaka", "瓦纳卡"),
    ("11093", "tekapo", "特卡波湖"),
    ("11364", "milford_sound", "米尔福德峡湾"),
    ("11094", "fox_glacier", "福克斯冰川"),
    ("11095", "nelson", "尼尔森"),
    ("11096", "abel_tasman", "阿贝尔塔斯曼"),
    ("11097", "kaikoura", "凯库拉"),
    ("11574", "bay_of_islands", "岛屿湾"),
    ("11575", "tongariro", "汤加里罗"),
]


def _fetch_mafengwo_notes(dest_id: str, dest_name_cn: str) -> List[Dict]:
    """采集马蜂窝指定目的地的游记列表"""
    print(f"  📍 {dest_name_cn}...", end=" ", flush=True)
    notes = []
    # 搜索接口（马蜂窝开放游记搜索）
    search_url = (
        f"https://www.mafengwo.cn/search/q.php?"
        f"q={dest_name_cn}新西兰游记&p=1&t=notes&kt=1"
    )
    html = _fetch(search_url)
    if not html:
        print("❌ 无响应")
        return notes

    # 游记列表页面更可靠
    list_url = f"https://www.mafengwo.cn/gonglve/ziyouxing/{dest_id}/"
    html = _fetch(list_url)
    if not html:
        print("❌ 列表页无响应")
        return notes

    # 从列表页提取游记标题和链接
    # 马蜂窝的游记卡片格式: <a class="title" href="/i/12345.html">标题</a>
    titles = re.findall(r'href="(/i/\d+\.html)"[^>]*>([^<]+)', html)

    if not titles:
        print(f"⚠️ 未找到游记（{dest_name_cn}）")
        return notes

    limit = min(len(titles), 5)  # 每个目的地最多取 5 篇
    for href, title in titles[:limit]:
        title = title.strip()
        note_url = f"https://www.mafengwo.cn{href}"
        notes.append({
            "title": f"【马蜂窝·{dest_name_cn}】{title}",
            "url": note_url,
            "source": "mafengwo",
            "dest": dest_name_cn,
        })

    print(f"✅ {len(titles)} 篇")
    return notes


def _fetch_mafengwo_detail(note: Dict) -> Optional[str]:
    """获取马蜂窝游记正文"""
    html = _fetch(note["url"])
    if not html:
        return None

    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html, "html.parser")

    # 移除干扰元素
    for sel in ["script", "style", "noscript", ".comment", ".related",
                 ".ad", ".footer", ".header", "nav", "iframe"]:
        for e in soup.select(sel):
            e.decompose()

    # 马蜂窝游记正文：_j_content 或 .ctd_content
    content_div = (
        soup.select_one("._j_content")
        or soup.select_one(".ctd_content")
        or soup.select_one(".content")
        or soup.select_one("article")
    )

    if not content_div:
        return None

    text = content_div.get_text("\n", strip=True)
    lines = [l.strip() for l in text.split("\n") if l.strip() and len(l.strip()) > 5]
    if len(lines) < 3:
        return None

    body = "\n\n".join(lines)
    # 加标题和元信息
    header = (
        f"# {note['title']}\n"
        f"来源: {note['url']}\n"
        f"平台: 马蜂窝 | 目的地: {note['dest']}\n\n"
    )
    return header + body


def fetch_mafengwo(max_notes: int = 80) -> List[str]:
    """采集马蜂窝新西兰游记"""
    seq = _next_seq()
    saved = []
    all_notes = []

    print(f"\n📕 马蜂窝新西兰游记采集")
    print(f"   目标: {len(_MAFENGWO_DESTINATIONS)} 个目的地, 上限 {max_notes} 篇")
    print(f"   起始编号: {seq}")

    for dest_id, dest_en, dest_cn in _MAFENGWO_DESTINATIONS:
        notes = _fetch_mafengwo_notes(dest_id, dest_cn)
        all_notes.extend(notes)
        if len(all_notes) >= max_notes:
            break
        time.sleep(REQUEST_DELAY)

    all_notes = all_notes[:max_notes]
    print(f"\n  共收集 {len(all_notes)} 篇游记链接，开始抓取正文...")

    for i, note in enumerate(all_notes):
        content = _fetch_mafengwo_detail(note)
        if content:
            fname = f"{seq + i:02d}_mafengwo_{note['dest']}.txt"
            _safe_write(fname, content)
            saved.append(fname)
        time.sleep(REQUEST_DELAY * 1.5)

    print(f"\n  📊 马蜂窝: {len(saved)}/{len(all_notes)} 篇成功")
    return saved


# ===================================================================
# 穷游采集器
# ===================================================================
# 穷游目的地: https://place.qyer.com/{dest}/travel-notes/
# 游记详情: https://www.qyer.com/note/{note_id}/

_QYER_DESTINATIONS = [
    ("auckland", "奥克兰"),
    ("wellington", "惠灵顿"),
    ("christchurch", "基督城"),
    ("queenstown", "皇后镇"),
    ("rotorua", "罗托鲁瓦"),
    ("dunedin", "但尼丁"),
    ("taupo", "陶波"),
    ("wanaka", "瓦纳卡"),
    ("lake-tekapo", "特卡波湖"),
    ("milford-sound", "米尔福德峡湾"),
    ("fox-glacier", "福克斯冰川"),
    ("nelson", "尼尔森"),
    ("kaikoura", "凯库拉"),
    ("bay-of-islands", "岛屿湾"),
    ("tongariro-national-park", "汤加里罗国家公园"),
]


def _fetch_qyer_notes(dest_en: str, dest_cn: str) -> List[Dict]:
    """采集穷游指定目的地的游记"""
    print(f"  📍 {dest_cn}...", end=" ", flush=True)
    notes = []

    list_url = f"https://place.qyer.com/{dest_en}/travel-notes/"
    html = _fetch(list_url)
    if not html:
        print("❌ 无响应")
        return notes

    # 穷游游记列表格式
    titles = re.findall(r'href="(https?://www\.qyer\.com/note/\d+/)"[^>]*>([^<]+)', html)

    if not titles:
        # 尝试另一种格式
        titles = re.findall(r'href="(/u/\d+/notes/\d+/)"[^>]*>([^<]+)', html)
        titles = [(f"https://www.qyer.com{href}", title) for href, title in titles]

    if not titles:
        print("⚠️ 未找到游记")
        return notes

    limit = min(len(titles), 5)
    for href, title in titles[:limit]:
        title = re.sub(r'\s+', ' ', title).strip()
        notes.append({
            "title": f"【穷游·{dest_cn}】{title}",
            "url": href,
            "source": "qyer",
            "dest": dest_cn,
        })

    print(f"✅ {len(titles)} 篇")
    return notes


def _fetch_qyer_detail(note: Dict) -> Optional[str]:
    """获取穷游游记正文"""
    html = _fetch(note["url"])
    if not html:
        return None

    from bs4 import BeautifulSoup
    soup = BeautifulSoup(html, "html.parser")

    for sel in ["script", "style", "noscript", ".comment", ".related",
                 ".ad", ".footer", ".header", "nav", "iframe",
                 ".side", ".related-travel-notes"]:
        for e in soup.select(sel):
            e.decompose()

    # 穷游正文容器
    content_div = (
        soup.select_one("article")
        or soup.select_one(".note-content")
        or soup.select_one(".post-content")
        or soup.select_one(".content")
        or soup.select_one("#content")
    )

    if not content_div:
        return None

    text = content_div.get_text("\n", strip=True)
    lines = [l.strip() for l in text.split("\n") if l.strip() and len(l.strip()) > 5]
    if len(lines) < 3:
        return None

    body = "\n\n".join(lines)
    header = (
        f"# {note['title']}\n"
        f"来源: {note['url']}\n"
        f"平台: 穷游 | 目的地: {note['dest']}\n\n"
    )
    return header + body


def fetch_qyer(max_notes: int = 80) -> List[str]:
    """采集穷游新西兰游记"""
    seq = _next_seq()
    saved = []
    all_notes = []

    print(f"\n📗 穷游新西兰游记采集")
    print(f"   目标: {len(_QYER_DESTINATIONS)} 个目的地, 上限 {max_notes} 篇")
    print(f"   起始编号: {seq}")

    for dest_en, dest_cn in _QYER_DESTINATIONS:
        notes = _fetch_qyer_notes(dest_en, dest_cn)
        all_notes.extend(notes)
        if len(all_notes) >= max_notes:
            break
        time.sleep(REQUEST_DELAY)

    all_notes = all_notes[:max_notes]
    print(f"\n  共收集 {len(all_notes)} 篇游记链接，开始抓取正文...")

    for i, note in enumerate(all_notes):
        content = _fetch_qyer_detail(note)
        if content:
            fname = f"{seq + i:02d}_qyer_{note['dest']}.txt"
            _safe_write(fname, content)
            saved.append(fname)
        time.sleep(REQUEST_DELAY * 1.5)

    print(f"\n  📊 穷游: {len(saved)}/{len(all_notes)} 篇成功")
    return saved


# ===================================================================
# 小红书 — 手动导入模式
# ===================================================================
# 小红书直接爬取不可行（理由详见模块文档）。
# 替代方案：
#   A. 手动导入 markdown/txt 文件（最推荐）
#   B. Mock 模式（开发测试用）
#   C. 付费 API 代理（预留）

# ── A. 手动导入 ──

def import_xiaohongshu(input_dir: str) -> List[str]:
    """从指定目录导入已保存的小红书笔记（.md / .txt）"""
    seq = _next_seq()
    saved = []
    input_path = Path(input_dir)

    if not input_path.exists():
        print(f"\n  ❌ 目录不存在: {input_dir}")
        return saved
    if not input_path.is_dir():
        print(f"\n  ❌ 不是目录: {input_dir}")
        return saved

    files = sorted(input_path.glob("*.md")) + sorted(input_path.glob("*.txt"))
    # 排除 crawl4ai 等已有数据
    files = [f for f in files if not re.match(r"\d{2}_", f.stem)]

    if not files:
        print(f"\n  ⚠️ {input_dir} 中没有 .md 或 .txt 文件")
        print(f"  请将小红书笔记保存为 markdown 文件放入此目录后重试")
        return saved

    print(f"\n📕 小红书笔记导入: {len(files)} 个文件")

    for i, fpath in enumerate(files):
        try:
            content = fpath.read_text(encoding="utf-8")
        except Exception:
            try:
                content = fpath.read_text(encoding="gbk")
            except Exception as e:
                print(f"  ⚠️ {fpath.name}: 读取失败 ({e})")
                continue

        if len(content) < 50:
            print(f"  ⚠️ {fpath.name}: 内容过短 ({len(content)} chars)")
            continue

        # 提取标题（文件名或首行 #）
        title = fpath.stem
        if content.startswith("# "):
            title = content.split("\n")[0].lstrip("# ").strip()

        # 加元信息头
        header = (
            f"# 📕 小红书 — {title}\n"
            f"来源: 手动导入 ({fpath.name})\n"
            f"平台: 小红书 | 导入时间: {datetime.now().strftime('%Y-%m-%d')}\n"
            f"⚠️ 内容来自用户手动保存，可能存在格式丢失\n\n"
        )
        if not content.startswith("# "):
            content = header + content

        fname = f"{seq + i:02d}_xiaohongshu_{title[:20].replace('/', '_')}.txt"
        _safe_write(fname, content)
        saved.append(fname)

    print(f"\n  📊 导入: {len(saved)}/{len(files)} 篇成功")
    return saved


# ── B. Mock 模式（仅用于开发测试，非真实数据） ──

_MOCK_NZ_PLACES = [
    "皇后镇", "基督城", "奥克兰", "但尼丁", "惠灵顿",
    "特卡波湖", "瓦纳卡", "罗托鲁瓦", "凯库拉", "福克斯冰川",
    "米尔福德峡湾", "汤加里罗", "尼尔森", "阿贝尔塔斯曼", "库克山",
]

_MOCK_TITLES = [
    "新西兰{}三日深度游，不看后悔的攻略",
    "{}旅游避坑指南！这些坑我替你踩过了",
    "此生必去{}！附详细行程和费用",
    "{}自由行攻略 | 交通住宿美食全攻略",
    "{}拍照攻略 | 这些机位太绝了",
    "新西兰自驾游 | 在{}的完美一天",
    "人均5k玩转{} | 穷游攻略",
    "{}徒步路线推荐 | 风景绝了",
    "{}美食探店 | 这几家店一定要去",
    "冬季{}旅游攻略 | 雪景美到窒息",
]

_MOCK_BODIES = [
    """这次去新西兰决定得很突然，但没想到体验这么好！分享几个我觉得超重要的点：

**交通**
自驾是最方便的。我们在租租车上租的车，全险大概200NZD/天。南岛的路况比想象中好，但是山路多，晚上千万别开。建议买全险，碎石路真不是开玩笑的。

**住宿**
强烈推荐住民宿！比酒店性价比高太多了，而且能自己做饭（新西兰超市的牛排又便宜又好吃）。Airbnb上订的话建议提前两周，热门的地方临时订会贵很多。

**吃饭**
中餐主要集中在皇后镇和基督城，价格偏贵。想吃便宜的可以去Countdown买食材自己煮。新西兰的奶制品和牛羊肉真的太棒了，超市买来自己煎比餐厅划算10倍。

**拍照**
推荐清晨和黄昏出去拍，光线最温柔。带个三脚架拍星空绝了，新西兰的银河真的肉眼可见。

**Tips**
- 防晒！防晒！防晒！臭氧层空洞不是开玩笑的
- 驱蚊水必备，沙蝇真的很毒
- 信用卡基本通用，不用换太多现金
- 下载离线地图，很多地方没信号""",

    """终于去了心心念念的新西兰{}！分享一下我的保姆级攻略~

**Day 1** 抵达+市区闲逛
中午到，取车后先去酒店放行李。下午在市区随便走走，感受一下小镇的氛围。推荐去湖边散步，水清到可以看到底。

**Day 2** 主景点打卡
早上8点出发，建议早去避开旅行团。门票提前在网上买可以便宜10%。整个景区逛下来大概需要4-5小时，一定要穿舒服的鞋子！中午可以自带干粮，景区里的又贵又难吃。

**Day 3** 周边探索+返程
去了附近的一个小众景点，开车大概40分钟。人很少，风景完全不输主景点！强烈推荐大家多留一天去周边逛逛。

**关于费用（一个人）**
- 机票：往返4000RMB（提前两个月买的）
- 住宿：3晚民宿 1800RMB
- 租车+油费：4天 2000RMB
- 吃饭+门票：1500RMB
- 总计：约9300RMB""",

    """刚从新西兰回来，热乎乎的攻略来啦！这次主要是在{}玩，总体评价：⭐⭐⭐⭐⭐

**先说结论**
如果时间有限只能选一个地方，我选这里。风景、体验、物价综合起来性价比最高。

**行前准备**
- 签证：提前一个月申请电子签，大概5个工作日出签
- 衣服：温差特别大，白天20度晚上可能只有5度，洋葱式穿衣法安排上
- 保险：一定要买！新西兰医疗很贵

**在{}我觉得最值得做的几件事：**
1. 徒步！这里的步道维护得特别好，而且都有清晰的标识
2. 去当地cafe喝flat white，新西兰的咖啡文化真的很强
3. 参加一个local tour，导游会讲很多自己玩发现不了的故事
4. 晚上出去看星星，光污染很少

**避坑：**
- 不要在景区门口买纪念品，镇上便宜一半
- 网红餐厅不一定好吃，谷歌评分4.3以上的基本不踩雷
- 雨季（5-8月）很多户外活动会取消，出发前查好天气""",

    """来{}之前做了不少功课，但实际体验还是有很多意外收获。

**关于天气**
新西兰的天气预报真的不太准😂 看着晴天结果突然下雨，建议随时带伞和冲锋衣。不过雨后的彩虹真的很美，弥补了淋雨的怨念。

**关于路况**
从{}到周边的路大部分是双向单车道，超车要小心。有些观景台在路的左边，开右边会不太习惯。建议租自动挡，手动挡在山路开太累了。

**特别喜欢{}的几个点：**
湖水的颜色真的和照片一样！！不是一个滤镜能调出来的蓝。中午太阳直射的时候最漂亮，那种tiffany蓝真的绝了。

**吃饭推荐**
推荐一家本地的fish and chips店，Google评分4.6，量大实惠，两个人点一份就够了。老板是local，特别热情，还会推荐附近好玩的地方。

**消费**
比我想象中便宜。咖啡4-5NZD、汉堡15-20NZD、motel 120-180NZD/晚。主要开销在活动和交通上。""",
]


def _generate_mock_note(idx: int) -> str:
    """生成一篇逼真的伪游记（仅用于开发测试）"""
    place = random.choice(_MOCK_NZ_PLACES)
    title_template = random.choice(_MOCK_TITLES)
    title = title_template.format(place)
    body = random.choice(_MOCK_BODIES).format(place)

    date = (datetime.now() - timedelta(days=random.randint(3, 180))).strftime("%Y-%m-%d")
    author = random.choice(["旅行的小明", "背包客小陈", "爱拍照的Mia", "大胃王leo", "慢生活家", "kay旅行日记"])

    return (
        f"# 📕 小红书 — {title}\n"
        f"来源: [mock] 麦麦旅行攻略\n"
        f"平台: 小红书 | 作者: {author} | 日期: {date}\n"
        f"目的地: {place}\n"
        f"⚠️ 此内容为模拟生成，仅供开发测试\n\n"
        f"{body}\n"
    )


def generate_mock_notes(count: int = 10) -> List[str]:
    """生成 mock 小红书笔记（开发测试用）"""
    seq = _next_seq()
    saved = []

    print(f"\n🎭 Mock 小红书笔记生成: {count} 篇")
    print(f"   ⚠️ 仅用于开发和测试，不包含真实数据")
    print(f"   起始编号: {seq}")

    for i in range(count):
        content = _generate_mock_note(i)
        place = random.choice(_MOCK_NZ_PLACES)
        fname = f"{seq + i:02d}_xiaohongshu_mock_{place}_{i:02d}.txt"
        _safe_write(fname, content)
        saved.append(fname)

    print(f"\n  📊 模拟生成: {len(saved)} 篇")
    print(f"  ⚠️ 注意：mock 数据不含真实信息，请不要用于正式知识库\n")
    return saved


# ===================================================================
# 主入口
# ===================================================================

def fetch_social(sources: str = "all", run_build: bool = False, **kwargs) -> List[str]:
    """统一入口"""
    all_saved = []

    if sources in ("all", "mafengwo"):
        all_saved.extend(fetch_mafengwo(max_notes=kwargs.get("max_notes", 80)))

    if sources in ("all", "qyer"):
        all_saved.extend(fetch_qyer(max_notes=kwargs.get("max_notes", 80)))

    if sources in ("xiaohongshu",):
        mode = kwargs.get("mode", "import")
        if mode == "mock":
            count = kwargs.get("count", 10)
            all_saved.extend(generate_mock_notes(count))
        elif mode == "import":
            input_dir = kwargs.get("input_dir", "")
            if not input_dir:
                print("\n  ❌ --input-dir 必填 (import 模式)")
                print("  用法: --source xiaohongshu --mode import --input-dir ./xhs_saved/")
            else:
                all_saved.extend(import_xiaohongshu(input_dir))
        else:
            print(f"\n  ❌ 未知 xiaohongshu mode: {mode}")

    total = sum(1 for f in RAW_DIR.glob("*.txt"))
    print(f"\n{'='*50}")
    print(f"  ✅ 社交平台数据采集完成")
    print(f"  本次新增: {len(all_saved)} 个文件")
    print(f"  raw 目录总计: {total} 个文件")
    print(f"{'='*50}")

    # 可选：自动触发 KB 构建
    if run_build:
        print(f"\n  🔄 触发知识库构建（增量模式）...")
        try:
            sys.path.insert(0, str(PROJECT_DIR))
            from rag_knowledge_base.builder import build_kb_from_local
            build_kb_from_local(incremental=True)
        except Exception as e:
            print(f"  ⚠️ 知识库构建失败: {e}")

    return all_saved


if __name__ == "__main__":
    import argparse

    parser = argparse.ArgumentParser(
        description="社交平台中文游记采集器",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
示例:
  # 爬取马蜂窝新西兰游记
  python %(prog)s --source mafengwo

  # 爬取穷游新西兰游记
  python %(prog)s --source qyer

  # 全量采集（马蜂窝 + 穷游）
  python %(prog)s --source all

  # 导入已保存的小红书 markdown 文件
  python %(prog)s --source xiaohongshu --mode import --input-dir ./xhs_saved/

  # 生成 mock 数据（开发测试用）
  python %(prog)s --source xiaohongshu --mode mock --count 10

  # 采集 + 自动构建知识库
  python %(prog)s --source all --build
        """,
    )
    parser.add_argument("--source", default="all",
                        choices=["all", "mafengwo", "qyer", "xiaohongshu"],
                        help="数据源")
    parser.add_argument("--mode", default="import",
                        choices=["import", "mock", "crawl"],
                        help="小红书模式: import=手动导入, mock=模拟生成")
    parser.add_argument("--input-dir", default="",
                        help="小红书手动导入的目录路径")
    parser.add_argument("--count", type=int, default=10,
                        help="mock 生成数量或每源上限")
    parser.add_argument("--max-notes", type=int, default=80,
                        help="每源最大笔记数")
    parser.add_argument("--build", action="store_true",
                        help="采集后自动构建知识库（增量模式）")
    args = parser.parse_args()

    fetch_social(
        sources=args.source,
        mode=args.mode,
        input_dir=args.input_dir,
        count=args.count,
        max_notes=args.max_notes,
        run_build=args.build,
    )