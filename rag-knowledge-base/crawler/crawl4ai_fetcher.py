#!/usr/bin/env python3
"""
多源旅游数据采集器
从多个可靠开放 API 获取新西兰旅游信息，不包含任何手写/硬编码数据。

数据源：
 1. Wikipedia API     — 新西兰地理、历史、文化、经济、人口 (全文提取)
 2. Wikivoyage API    — 新西兰旅游指南（景点、交通、住宿、饮食、安全）
 3. OpenTripMap API   — 兴趣点数据（景点、餐厅、自然景观等结构化数据）
 4. 新西兰DOC          — 国家公园和徒步道信息 (Department of Conservation)
 5. newzealand.com    — 新西兰旅游局官网 (通过 curl_cffi 绕过 EdgeOne WAF)

用法：
  python rag_knowledge_base/crawler/crawl4ai_fetcher.py
"""

import asyncio
import json
import os
import re
import sys
import time
from typing import Optional

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW_DIR = os.path.join(PROJECT_DIR, "rag_knowledge_base", "data", "raw")
os.makedirs(RAW_DIR, exist_ok=True)

# ===================== 配置 =====================
# ⚠️ 请修改为你的信息
GITHUB_USER = "ershisiqiaomingyueye19"
CONTACT_EMAIL = "wangjun1919@sjtu.edu.cn"

USER_AGENT = (
    f"https://github.com/kayu1bowl/Travel-planner-agent"
    f"(https://github.com/kayu1bowl/Travel-planner-agent; {CONTACT_EMAIL})"
)
REQUEST_DELAY = 0.5
MAX_RETRIES = 3
BASE_BACKOFF = 2.0


# ===================== HTTP 工具函数 =====================

def safe_fetch(url: str, timeout: int = 30) -> Optional[str]:
    """
    安全地发起 HTTP 请求并返回文本内容。
    - 使用 requests 库（修复 Windows 上 urllib 的 DNS 解析 bug）
    - User-Agent 含项目地址+邮箱（Wikipedia 官方强制要求）
    - 指数退避重试（应对 429 限流）
    """
    import requests as req_lib

    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }

    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = req_lib.get(url, headers=headers, timeout=timeout)

            if resp.status_code == 429:
                wait = BASE_BACKOFF ** attempt
                print(f"  ⏳ 429 限流，等待 {wait:.0f}s 后重试 ({attempt}/{MAX_RETRIES})")
                time.sleep(wait)
                continue

            if resp.status_code != 200:
                return None

            return resp.text

        except req_lib.exceptions.ConnectionError as e:
            err = str(e)
            if "getaddrinfo" in err.lower() or "name or service" in err.lower():
                if attempt < MAX_RETRIES:
                    print(f"  ⚠️ DNS 解析失败，等待后重试 ({attempt}/{MAX_RETRIES})")
                    time.sleep(3)
                    continue
            return None
        except req_lib.exceptions.Timeout:
            if attempt < MAX_RETRIES:
                print(f"  ⏳ 请求超时 ({attempt}/{MAX_RETRIES})")
                time.sleep(BASE_BACKOFF ** attempt)
                continue
            return None
        except Exception as e:
            if attempt < MAX_RETRIES:
                time.sleep(BASE_BACKOFF ** attempt)
                continue
            return None

    return None


# =====================================================================
# 数据源 1: Wikipedia API
# =====================================================================

WIKIPEDIA_PAGES = [
    ("New_Zealand", "01_new_zealand_wikipedia.txt"),
    ("Tourism_in_New_Zealand", "02_tourism_in_nz.txt"),
    ("Geography_of_New_Zealand", "03_geography_of_nz.txt"),
    ("Transport_in_New_Zealand", "04_transport_in_nz.txt"),
    ("New_Zealand_wine", "05_nz_wine.txt"),
    ("Cuisine_of_New_Zealand", "06_nz_cuisine.txt"),
    ("Sport_in_New_Zealand", "07_sport_in_nz.txt"),
    ("Economy_of_New_Zealand", "08_economy_of_nz.txt"),
    ("Demographics_of_New_Zealand", "09_demographics_nz.txt"),
]


def fetch_wikipedia_page(title: str) -> Optional[str]:
    """获取 Wikipedia 单页全文"""
    import urllib.parse
    params = urllib.parse.urlencode({
        "action": "query",
        "titles": title,
        "prop": "extracts",
        "explaintext": True,
        "format": "json",
        "exlimit": 1,
    })
    url = f"https://en.wikipedia.org/w/api.php?{params}"
    raw = safe_fetch(url)
    if not raw:
        return None
    try:
        data = json.loads(raw)
        for pid, page in data.get("query", {}).get("pages", {}).items():
            if pid == "-1":
                continue
            text = page.get("extract", "")
            if text:
                return f"# {title.replace('_', ' ')} — Wikipedia\n\n{text}"
    except (json.JSONDecodeError, KeyError):
        pass
    return None


def fetch_wikipedia_docs() -> list:
    """采集所有 Wikipedia 页面"""
    print("\n[Wikipedia] 采集 Wikipedia 数据...")
    docs = []
    for title, filename in WIKIPEDIA_PAGES:
        print(f"  📄 {title}...", end=" ", flush=True)
        text = fetch_wikipedia_page(title)
        if text and len(text) > 200:
            path = os.path.join(RAW_DIR, filename)
            with open(path, "w", encoding="utf-8") as f:
                f.write(text)
            docs.append({
                "content": text,
                "url": f"https://en.wikipedia.org/wiki/{title}",
                "source_name": "wikipedia",
                "category": "reference",
                "title": title.replace("_", " "),
            })
            print(f"✅ {len(text)} chars")
        else:
            print("❌ 失败")
        time.sleep(REQUEST_DELAY)
    return docs


# =====================================================================
# 数据源 2: Wikivoyage API
# =====================================================================

WIKIVOYAGE_PAGES = [
    ("New_Zealand", "10_wikivoyage_nz.txt"),
    ("North_Island", "11_wikivoyage_north_island.txt"),
    ("South_Island", "12_wikivoyage_south_island.txt"),
    ("Auckland", "13_wikivoyage_auckland.txt"),
    ("Wellington", "14_wikivoyage_wellington.txt"),
    ("Christchurch", "15_wikivoyage_christchurch.txt"),
    ("Queenstown_(New_Zealand)", "16_wikivoyage_queenstown.txt"),
    ("Rotorua", "17_wikivoyage_rotorua.txt"),
    ("Fiordland_National_Park", "18_wikivoyage_fiordland.txt"),
    ("Tongariro_National_Park", "19_wikivoyage_tongariro.txt"),
    ("Abel_Tasman_National_Park", "20_wikivoyage_abel_tasman.txt"),
    ("Aoraki_Mount_Cook_National_Park", "21_wikivoyage_mt_cook.txt"),
    ("Milford_Sound", "22_wikivoyage_milford_sound.txt"),
    ("Bay_of_Islands", "23_wikivoyage_bay_of_islands.txt"),
    ("Marlborough_(New_Zealand)", "24_wikivoyage_marlborough.txt"),
    ("Dunedin", "25_wikivoyage_dunedin.txt"),
    ("Napier_(New_Zealand)", "26_wikivoyage_napier.txt"),
    ("Hamilton_(New_Zealand)", "27_wikivoyage_hamilton.txt"),
    ("Tauranga", "28_wikivoyage_tauranga.txt"),
    ("Waitomo", "29_wikivoyage_waitomo.txt"),
    ("Kaikoura", "30_wikivoyage_kaikoura.txt"),
    ("Wanaka", "31_wikivoyage_wanaka.txt"),
]


def fetch_wikivoyage_page(title: str) -> Optional[str]:
    """获取 Wikivoyage 单页全文"""
    import urllib.parse
    params = urllib.parse.urlencode({
        "action": "query",
        "titles": title,
        "prop": "extracts",
        "explaintext": True,
        "format": "json",
        "exlimit": 1,
    })
    url = f"https://en.wikivoyage.org/w/api.php?{params}"
    raw = safe_fetch(url)
    if not raw:
        return None
    try:
        data = json.loads(raw)
        for pid, page in data.get("query", {}).get("pages", {}).items():
            if pid == "-1":
                continue
            text = page.get("extract", "")
            if text:
                return f"# {title.replace('_', ' ')} — Wikivoyage\n\n{text}"
    except (json.JSONDecodeError, KeyError):
        pass
    return None


def fetch_wikivoyage_docs() -> list:
    """采集所有 Wikivoyage 页面"""
    print("\n[Wikivoyage] 采集 Wikivoyage 旅游指南...")
    docs = []
    for title, filename in WIKIVOYAGE_PAGES:
        print(f"  📄 {title}...", end=" ", flush=True)
        text = fetch_wikivoyage_page(title)
        if text and len(text) > 200:
            path = os.path.join(RAW_DIR, filename)
            with open(path, "w", encoding="utf-8") as f:
                f.write(text)
            docs.append({
                "content": text,
                "url": f"https://en.wikivoyage.org/wiki/{title}",
                "source_name": "wikivoyage",
                "category": "travel-guide",
                "title": title.replace("_", " "),
            })
            print(f"✅ {len(text)} chars")
        else:
            print("❌ 失败")
        time.sleep(REQUEST_DELAY)
    return docs


# =====================================================================
# 数据源 3: OpenTripMap（需要 OPENTRIPMAP_API_KEY 环境变量）
# =====================================================================

OPENTRIPMAP_REGIONS = [
    ("Auckland", -36.85, 174.76),
    ("Wellington", -41.29, 174.78),
    ("Christchurch", -43.53, 172.64),
    ("Queenstown", -45.03, 168.66),
    ("Rotorua", -38.14, 176.25),
    ("Dunedin", -45.87, 170.50),
    ("Nelson", -41.28, 173.28),
    ("Tauranga", -37.69, 176.17),
]

KINDS_MAPPING = {
    "interesting_places": "50_opentripmap_places.txt",
    "natural": "51_opentripmap_nature.txt",
    "cultural": "52_opentripmap_culture.txt",
    "architecture": "53_opentripmap_architecture.txt",
    "amusements": "54_opentripmap_amusements.txt",
}


def fetch_opentripmap_docs() -> list:
    """采集 OpenTripMap 兴趣点数据"""
    api_key = os.environ.get("OPENTRIPMAP_API_KEY", "")
    if not api_key:
        print("\n[OpenTripMap] ⚠️ 未设置 OPENTRIPMAP_API_KEY，跳过")
        return []

    print("\n[OpenTripMap] 采集兴趣点数据...")
    docs = []
    for label, lat, lon in OPENTRIPMAP_REGIONS:
        print(f"  🌍 {label}...")
        for kinds, filename in KINDS_MAPPING.items():
            url = (
                f"https://api.opentripmap.com/0.1/en/places/radius"
                f"?radius=20000&lon={lon}&lat={lat}"
                f"&kinds={kinds}&limit=30&format=json&apikey={api_key}"
            )
            raw = safe_fetch(url, timeout=15)
            if not raw:
                time.sleep(REQUEST_DELAY)
                continue
            try:
                places = json.loads(raw)
                if not isinstance(places, list) or not places:
                    time.sleep(REQUEST_DELAY)
                    continue
                lines = [f"# OpenTripMap {kinds} — {label}", ""]
                for p in places:
                    name = p.get("name", "")
                    kinds_str = p.get("kinds", "")
                    if name:
                        lines.append(f"- {name} ({kinds_str})")
                content = "\n".join(lines)
                path = os.path.join(RAW_DIR, f"opentripmap_{label.lower()}_{filename}")
                with open(path, "w", encoding="utf-8") as f:
                    f.write(content)
                docs.append({
                    "content": content,
                    "url": f"https://opentripmap.io/en/places?lat={lat}&lon={lon}",
                    "source_name": "opentripmap",
                    "category": f"poi-{kinds}",
                    "title": f"OpenTripMap {kinds} — {label}",
                })
                print(f"  ✅ {kinds}: {len(places)} 个")
            except json.JSONDecodeError:
                pass
            time.sleep(REQUEST_DELAY)
    return docs


# =====================================================================
# 数据源 4: DOC — 新西兰保护部（网页抓取）
# =====================================================================

DOC_PLACES = [
    ("fiordland/places/fiordland-national-park", "Fiordland National Park"),
    ("central-north-island/places/tongariro-national-park", "Tongariro National Park"),
    ("nelson-tasman/places/abel-tasman-national-park", "Abel Tasman National Park"),
    ("west-coast/places/westland-tai-poutini-national-park", "Westland Tai Poutini National Park"),
    ("nelson-tasman/places/nelson-lakes-national-park", "Nelson Lakes National Park"),
    ("nelson-tasman/places/kahurangi-national-park", "Kahurangi National Park"),
    ("west-coast/places/paparoa-national-park", "Paparoa National Park"),
    ("otago/places/mount-aspiring-national-park", "Mount Aspiring National Park"),
    ("manawatu-whanganui/places/whanganui-national-park", "Whanganui National Park"),
    ("canterbury/places/aoraki-mount-cook", "Aoraki Mount Cook National Park"),
]


def _fetch_doc_text(region_and_place: str) -> Optional[str]:
    """从 DOC 官网抓取页面纯文本"""
    from bs4 import BeautifulSoup
    import requests as req_lib

    url = f"https://www.doc.govt.nz/parks-and-recreation/places-to-go/{region_and_place}/"
    try:
        resp = req_lib.get(url, headers={"User-Agent": USER_AGENT}, timeout=20)
        if resp.status_code != 200:
            return None
        soup = BeautifulSoup(resp.text, "html.parser")
        for sel in ["script", "style", "noscript", "nav", "footer", "header", ".cookie"]:
            for el in soup.select(sel):
                el.decompose()
        main = soup.find("main") or soup.find("article") or soup.find("body")
        if not main:
            return None
        text = main.get_text(separator="\n", strip=True)
        lines = [l.strip() for l in text.split("\n") if l.strip() and len(l.strip()) > 3]
        return "\n\n".join(lines)
    except Exception:
        return None


def fetch_doc_docs() -> list:
    """采集 DOC 国家公园信息"""
    print("\n[DOC] 采集新西兰保护部数据...")
    docs = []
    for place, name in DOC_PLACES:
        print(f"  📄 {name[:40]}...", end=" ", flush=True)
        text = _fetch_doc_text(place)
        if text and len(text) > 50:
            safe_name = place.replace("/", "_").replace("-", "_")
            filename = f"60_doc_{safe_name}.txt"
            path = os.path.join(RAW_DIR, filename)
            full = f"# {name} — DOC New Zealand\n\nURL: https://www.doc.govt.nz/parks-and-recreation/places-to-go/{place}/\n\n{text}"
            with open(path, "w", encoding="utf-8") as f:
                f.write(full)
            docs.append({
                "content": full,
                "url": f"https://www.doc.govt.nz/parks-and-recreation/places-to-go/{place}/",
                "source_name": "doc",
                "category": "national-park",
                "title": name,
            })
            print(f"✅ {len(text)} chars")
        else:
            print("❌ 失败")
        time.sleep(REQUEST_DELAY)
    return docs


# =====================================================================
# 数据源 5: newzealand.com（curl_cffi 绕过 EdgeOne WAF）
# =====================================================================

NZCOM_PAGES = [
    ("auckland", "city"), ("wellington", "city"), ("christchurch", "city"),
    ("queenstown", "city"), ("rotorua", "city"), ("dunedin", "city"),
    ("tauranga", "city"), ("nelson", "city"), ("wanaka", "city"),
    ("taupo", "city"), ("napier", "city"), ("hamilton", "city"),
    ("new-plymouth", "city"), ("gisborne", "city"), ("invercargill", "city"),
    ("picton", "city"),
    ("fiordland", "national-park"),
    ("tongariro-national-park", "national-park"),
    ("abel-tasman-national-park", "national-park"),
    ("whanganui-national-park", "national-park"),
    ("north-island", "region"), ("south-island", "region"),
    ("travel-guide", "travel-tips"), ("getting-around", "travel-tips"),
    ("getting-here", "travel-tips"), ("visas-and-immigration", "travel-tips"),
    ("accommodation", "travel-tips"), ("working-holiday", "travel-tips"),
    ("trips-and-driving-itineraries", "travel-tips"),
    ("travel-times-and-distances-calculator", "travel-tips"),
    ("adventure", "activities"), ("walking-and-hiking", "activities"),
    ("maori-culture", "culture"), ("food-and-wine", "culture"),
    ("nature-and-wildlife", "nature"), ("beaches-and-coast", "nature"),
    ("national-parks", "nature"), ("lakes", "nature"),
    ("glaciers", "nature"), ("alpine", "nature"),
    ("stargazing", "nature"), ("volcanic-and-geothermal", "nature"),
    ("winter-activities", "activities"), ("cycling", "activities"),
    ("events", "activities"), ("scenic-flights", "activities"),
    ("water-activities", "activities"), ("boat-cruises", "activities"),
    ("camping", "activities"), ("luxury", "activities"),
    ("tours", "activities"), ("family-friendly", "activities"),
    ("hot-pools-and-health-spas", "activities"),
    ("film-in-new-zealand", "culture"), ("home-of-middle-earth", "culture"),
    ("arts-and-culture", "culture"),
    ("feature/11-must-do-north-island-experiences", "feature"),
    ("feature/11-must-do-kiwi-experiences-in-the-south-island", "feature"),
    ("feature/new-zealands-ultimate-bucket-list", "feature"),
    ("feature/top-things-to-see-and-do-in-new-zealand", "feature"),
    ("feature/discover-summer-in-new-zealand", "season"),
    ("feature/discover-autumn-in-new-zealand", "season"),
    ("feature/discover-winter-in-new-zealand", "season"),
    ("feature/discover-spring-in-new-zealand", "season"),
    ("feature/tiaki-care-for-new-zealand", "culture"),
    ("feature/new-zealands-hidden-gems", "feature"),
    ("feature/new-zealands-unique-islands", "feature"),
    ("feature/inclusive-tourism", "travel-tips"),
    ("other-islands", "region"),
]


def _fetch_nzcom_page(path: str) -> Optional[str]:
    """爬取单页 newzealand.com 内容"""
    from bs4 import BeautifulSoup
    from curl_cffi import requests

    url = f"https://www.newzealand.com/int/{path}/"
    headers = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        "Sec-Ch-Ua": '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"',
        "Sec-Ch-Ua-Mobile": "?0",
        "Sec-Ch-Ua-Platform": '"Windows"',
        "Upgrade-Insecure-Requests": "1",
    }

    try:
        resp = requests.get(url, impersonate="chrome120", headers=headers, timeout=25)
        if resp.status_code != 200:
            return None
        html = resp.text
        if "Security Verification" in html[:1000]:
            return None

        soup = BeautifulSoup(html, "html.parser")
        for sel in ["script", "style", "noscript", "nav", "footer", "header",
                      ".cookie-banner", ".newsletter", "[class*=social]", "[class*=share]"]:
            for el in soup.select(sel):
                el.decompose()

        main = (soup.find("main") or soup.find("article")
                or soup.find(attrs={"role": "main"}) or soup.find("body"))
        if not main:
            return None

        text = main.get_text(separator="\n", strip=True)
        lines = [l.strip() for l in text.split("\n") if l.strip() and len(l.strip()) > 4]
        clean = "\n\n".join(lines)
        if len(clean) < 150:
            return None
        return f"# {url}\n\n{clean}"
    except Exception:
        return None


def fetch_nzcom_docs() -> list:
    """爬取 newzealand.com 全部页面"""
    print("\n[newzealand.com] 爬取新西兰旅游局官网...")
    docs = []
    for path, category in NZCOM_PAGES:
        name = path.replace("feature/", "").replace("/", "-")
        print(f"  📄 {name}...", end=" ", flush=True)
        content = _fetch_nzcom_page(path)
        if content:
            filename = f"newzealand_{name}.txt"
            filepath = os.path.join(RAW_DIR, filename)
            with open(filepath, "w", encoding="utf-8") as f:
                f.write(content)
            docs.append({
                "content": content,
                "url": f"https://www.newzealand.com/int/{path}/",
                "source_name": "newzealand.com",
                "category": category,
                "title": name,
            })
            print(f"✅ {len(content)} chars")
        else:
            print("❌")
        time.sleep(0.5)
    print(f"  ✅ newzealand.com: {len(docs)} 个")
    return docs


# =====================================================================
# fetch_all_sources — 异步统一入口（供 builder.py 导入）
# =====================================================================

async def fetch_all_sources() -> list:
    """
    采集所有数据源，返回文档列表。
    每个文档格式: {content, url, source_name, category, title}
    """
    print("=" * 50)
    print("  🗺️  新西兰旅游数据采集器")
    print("  数据全部来自开放 API，无硬编码内容")
    print("=" * 50)

    all_docs = []
    loop = asyncio.get_event_loop()

    sources = [
        ("Wikipedia",     fetch_wikipedia_docs),
        ("Wikivoyage",    fetch_wikivoyage_docs),
        ("OpenTripMap",   fetch_opentripmap_docs),
        ("DOC",           fetch_doc_docs),
        ("newzealand.com", fetch_nzcom_docs),
    ]

    for label, func in sources:
        try:
            docs = await loop.run_in_executor(None, func)
            all_docs.extend(docs)
            await asyncio.sleep(REQUEST_DELAY)
        except Exception as e:
            print(f"  ⚠️ [{label}] 异常: {e}")

    print(f"\n{'=' * 50}")
    print(f"  采集完成! 共 {len(all_docs)} 个文档")
    print(f"{'=' * 50}")
    return all_docs


# =====================================================================
# CLI 入口
# =====================================================================

if __name__ == "__main__":
    import argparse
    parser = argparse.ArgumentParser(
        description="新西兰旅游数据采集器 — 从开放 API 获取真实数据"
    )
    parser.add_argument("--sources", default="all",
                        choices=["all", "wiki", "opentrip", "doc", "nzcom"],
                        help="数据源选择")
    parser.add_argument("--delay", type=float, default=0.5)
    args = parser.parse_args()

    REQUEST_DELAY = args.delay

    docs = asyncio.run(fetch_all_sources())
    print(f"\n共采集 {len(docs)} 个文档")