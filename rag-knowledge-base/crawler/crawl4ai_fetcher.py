#!/usr/bin/env python3
"""
多源旅游数据采集器
从多个可靠开放 API 获取新西兰旅游信息，不包含任何手写/硬编码数据。

数据源：
 1. Wikipedia API — 新西兰地理、历史、文化、经济、人口 (全文提取)
    扩展: 60+ 页面，覆盖城市/景点/国家公园/文化/实用信息
 2. Wikivoyage API — 新西兰旅游指南（景点、交通、住宿、饮食、安全）
    扩展: 40+ 目的地页面
 3. OpenTripMap API — 兴趣点数据（景点、餐厅、自然景观等结构化数据）
 4. 新西兰DOC — 国家公园和徒步道信息 (通过 sitemap 自动发现)
 5. newzealand.com — 新西兰旅游局官网 (sitemap 自动发现 URL)

用法：
 python rag_knowledge_base/crawler/crawl4ai_fetcher.py
"""

import asyncio
import json
import os
import re
import sys
import time
import xml.etree.ElementTree as ET
from typing import Optional

PROJECT_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RAW_DIR = os.path.join(PROJECT_DIR, "rag_knowledge_base", "data", "raw")
os.makedirs(RAW_DIR, exist_ok=True)

GITHUB_USER = "ershisiqiaomingyueye19"
CONTACT_EMAIL = "wangjun1919@sjtu.edu.cn"

USER_AGENT = (
    f"TravelPlannerBot/1.0 "
    f"(https://github.com/kayu1bowl/Travel-planner-agent; {CONTACT_EMAIL})"
)
REQUEST_DELAY = 0.5
MAX_RETRIES = 3
BASE_BACKOFF = 2.0


def safe_fetch(url: str, timeout: int = 30) -> Optional[str]:
    import requests as req_lib
    headers = {
        "User-Agent": USER_AGENT,
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
    }
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            resp = req_lib.get(url, headers=headers, timeout=timeout, allow_redirects=True)
            # Print debug for non-200 responses
            if resp.status_code == 429:
                wait = BASE_BACKOFF ** attempt
                print(f"  \u23f3 429, wait {wait:.0f}s ({attempt}/{MAX_RETRIES})")
                time.sleep(wait); continue
            if resp.status_code == 301 or resp.status_code == 302 or resp.status_code == 307 or resp.status_code == 308:
                print(f"  \u21ba Redirect({resp.status_code}) to {resp.headers.get('Location','?')[:60]}")
                # Follow redirect manually
                redirect_url = resp.headers.get("Location", "")
                if redirect_url.startswith("/"):
                    from urllib.parse import urlparse
                    parsed = urlparse(url)
                    redirect_url = f"{parsed.scheme}://{parsed.netloc}{redirect_url}"
                if redirect_url:
                    resp = req_lib.get(redirect_url, headers=headers, timeout=timeout, allow_redirects=True)
                    if resp.status_code != 200:
                        return None
                    return resp.text
                return None
            if resp.status_code != 200:
                print(f"  \u26a0\ufe0f HTTP {resp.status_code} ({len(resp.text)}b)")
                return None
            return resp.text
        except req_lib.exceptions.ConnectionError as e:
            err = str(e)
            if "getaddrinfo" in err.lower() or "name or service" in err.lower():
                if attempt < MAX_RETRIES:
                    print(f"  \u26a0\ufe0f DNS fail, retry ({attempt}/{MAX_RETRIES})")
                    time.sleep(3); continue
                return None
            print(f"  \u274c ConnectionError: {err[:80]}")
            return None
        except req_lib.exceptions.Timeout:
            if attempt < MAX_RETRIES:
                print(f"  \u23f3 timeout ({attempt}/{MAX_RETRIES})")
                time.sleep(BASE_BACKOFF ** attempt); continue
            return None
        except Exception as e:
            print(f"  \u274c Exception: {str(e)[:80]}")
            if attempt < MAX_RETRIES:
                time.sleep(BASE_BACKOFF ** attempt); continue
            return None
    return None



def _resolve_via_doh(domain: str) -> Optional[str]:
    """Resolve domain via Cloudflare DoH"""
    import requests as rl
    try:
        resp = rl.get(f"https://cloudflare-dns.com/dns-query?name={domain}&type=A",
                       headers={"Accept": "application/dns-json"}, timeout=8)
        if resp.status_code == 200:
            for ans in resp.json().get("Answer", []):
                if ans.get("type") == 1:
                    return ans["data"]
    except: pass
    return None

def _resolve_via_google_doh(domain: str) -> Optional[str]:
    """Resolve domain via Google DoH"""
    import requests as rl
    try:
        resp = rl.get(f"https://dns.google/resolve?name={domain}&type=A",
                       headers={"Accept": "application/dns-json"}, timeout=8)
        if resp.status_code == 200:
            for ans in resp.json().get("Answer", []):
                if ans.get("type") == 1:
                    return ans["data"]
    except: pass
    return None

def _get_real_ip(domain: str) -> Optional[str]:
    """Try multiple DoH providers to get real IP"""
    ip = _resolve_via_doh(domain)
    return ip if ip else _resolve_via_google_doh(domain)

def safe_fetch_wikipedia(api_url: str, timeout: int = 30) -> Optional[str]:
    """4-layer fallback for Wikipedia with full diagnostics

    Strategy:
      1. Try via proxy (HTTP_PROXY env) -- works when proxy itself can reach Wiki
      2. DoH real IP without proxy -- for global VPN (TUN) users where DNS is polluted
      3. DoH real IP WITH proxy -- for local proxy users where proxy can route IPs
      4. curl_cffi direct -- last resort for WAF blocks
    """
    import requests as rl

    # Layer 1: Via proxy (HTTP_PROXY/HTTPS_PROXY set by --proxy arg)
    result = safe_fetch(api_url, timeout)
    if result: return result

    # Get real IP via DoH
    print(f"  \u26a0\ufe0f DNS pollution suspected for en.wikipedia.org")
    real_ip = _get_real_ip("en.wikipedia.org")

    # Layer 2: Try DIRECT (no proxy) with real IP + Host header
    # Works for: Global VPN (TUN mode) -- user connects to VPN globally
    if real_ip:
        direct_url = api_url.replace("https://en.wikipedia.org", f"https://{real_ip}")
        headers = {"Host": "en.wikipedia.org", "User-Agent": USER_AGENT,
                    "Accept": "application/json,*/*"}

        # Save and temporarily remove proxy env vars
        old_http = os.environ.pop("HTTP_PROXY", None)
        old_https = os.environ.pop("HTTPS_PROXY", None)
        old_h = os.environ.pop("http_proxy", None)
        old_hs = os.environ.pop("https_proxy", None)

        print(f"  Trying DoH IP {real_ip} direct (no proxy, global VPN mode)...")
        try:
            resp = rl.get(direct_url, headers=headers, timeout=timeout, allow_redirects=True)
            if resp.status_code == 200:
                text = resp.text
                if text and text.startswith("{"):
                    return text
                print(f"  \u26a0\ufe0f Response {resp.status_code}, {len(text)}b, not JSON")
            else:
                print(f"  \u26a0\ufe0f HTTP {resp.status_code}")
        except Exception as e:
            print(f"  \u274c {str(e)[:70]}")

        # Restore proxy
        if old_http: os.environ["HTTP_PROXY"] = old_http
        if old_https: os.environ["HTTPS_PROXY"] = old_https
        if old_h: os.environ["http_proxy"] = old_h
        if old_hs: os.environ["https_proxy"] = old_hs

        # Layer 3: Try WITH proxy restored + real IP + Host header
        # Works for: Local proxy (Clash/SS) -- proxy can route to any IP
        print(f"  Trying DoH IP {real_ip} WITH proxy (local proxy mode)...")
        try:
            resp = rl.get(direct_url, headers=headers, timeout=timeout, allow_redirects=True)
            if resp.status_code == 200:
                text = resp.text
                if text and text.startswith("{"):
                    return text
                print(f"  \u26a0\ufe0f Response {resp.status_code}, {len(text)}b, not JSON")
            else:
                print(f"  \u26a0\ufe0f HTTP {resp.status_code}")
        except Exception as e:
            print(f"  \u274c {str(e)[:70]}")

    # Layer 4: curl_cffi as last resort
    print(f"  Trying curl_cffi impersonate (WAF bypass)...")
    try:
        from curl_cffi import requests as curl_req
        resp = curl_req.get(api_url, headers={"User-Agent": USER_AGENT,
                            "Accept": "application/json,*/*"},
                           impersonate="chrome120", timeout=min(timeout, 25))
        if resp.status_code == 200:
            text = resp.text
            if text and text.startswith("{"):
                return text
            print(f"  \u26a0\ufe0f curl_cffi: {resp.status_code}, {len(text)}b")
        else:
            print(f"  \u26a0\ufe0f curl_cffi: HTTP {resp.status_code}")
    except ImportError:
        print(f"  \u274c curl_cffi not installed")
    except Exception as e:
        print(f"  \u274c curl_cffi: {str(e)[:70]}")

    print(f"  \u274c ALL layers failed for Wikipedia")
    return None

# =========================== WIKIPEDIA ===========================

WIKIPEDIA_PAGES = [
    ("New_Zealand", "01_new_zealand_wikipedia.txt", "reference"),
    ("Tourism_in_New_Zealand", "02_tourism_in_nz.txt", "reference"),
    ("Geography_of_New_Zealand", "03_geography_of_nz.txt", "reference"),
    ("Transport_in_New_Zealand", "04_transport_in_nz.txt", "reference"),
    ("Economy_of_New_Zealand", "08_economy_of_nz.txt", "reference"),
    ("Demographics_of_New_Zealand", "09_demographics_nz.txt", "reference"),
    ("History_of_New_Zealand", "11_history_nz.txt", "reference"),
    ("Climate_of_New_Zealand", "13_climate_nz.txt", "reference"),
    ("New_Zealand_wine", "05_nz_wine.txt", "culture"),
    ("Cuisine_of_New_Zealand", "06_nz_cuisine.txt", "culture"),
    ("Sport_in_New_Zealand", "07_sport_in_nz.txt", "culture"),
    ("Culture_of_New_Zealand", "10_culture_nz.txt", "culture"),
    ("M%C4%81ori_culture", "12_maori_culture.txt", "culture"),
    ("M%C4%81ori_language", "12b_maori_language.txt", "culture"),
    ("New_Zealand_English", "12c_nz_english.txt", "culture"),
    ("Music_of_New_Zealand", "12d_nz_music.txt", "culture"),
    ("Art_of_New_Zealand", "12e_nz_art.txt", "culture"),
    ("Public_holidays_in_New_Zealand", "12f_nz_holidays.txt", "culture"),
    ("Flora_of_New_Zealand", "14_flora_nz.txt", "nature"),
    ("Fauna_of_New_Zealand", "15_fauna_nz.txt", "nature"),
    ("Protected_areas_of_New_Zealand", "16_protected_areas.txt", "nature"),
    ("Volcanism_of_New_Zealand", "14b_volcanism.txt", "nature"),
    ("Glaciers_of_New_Zealand", "14c_glaciers.txt", "nature"),
    ("Rivers_of_New_Zealand", "14d_rivers.txt", "nature"),
    ("List_of_volcanoes_in_New_Zealand", "14e_volcanoes.txt", "nature"),
    ("Auckland", "20_auckland.txt", "city"),
    ("Wellington", "21_wellington.txt", "city"),
    ("Christchurch", "22_christchurch.txt", "city"),
    ("Hamilton_(New_Zealand)", "23_hamilton.txt", "city"),
    ("Tauranga", "24_tauranga.txt", "city"),
    ("Napier_(New_Zealand)", "25_napier.txt", "city"),
    ("Dunedin", "26_dunedin.txt", "city"),
    ("Queenstown_(New_Zealand)", "27_queenstown.txt", "city"),
    ("Rotorua", "28_rotorua.txt", "city"),
    ("Nelson_(New_Zealand)", "29_nelson.txt", "city"),
    ("Invercargill", "30_invercargill.txt", "city"),
    ("New_Plymouth", "31_new_plymouth.txt", "city"),
    ("Palmerston_North", "32_palmerston.txt", "city"),
    ("Whang%C4%81rei", "33_whangarei.txt", "city"),
    ("Gisborne_(New_Zealand)", "34_gisborne.txt", "city"),
    ("Bay_of_Islands", "40_bay_of_islands.txt", "region"),
    ("Milford_Sound", "41_milford_sound.txt", "nature"),
    ("Tongariro_National_Park", "42_tongariro_np.txt", "national-park"),
    ("Fiordland_National_Park", "43_fiordland_np.txt", "national-park"),
    ("Abel_Tasman_National_Park", "44_abel_tasman_np.txt", "national-park"),
    ("Aoraki_Mount_Cook_National_Park", "45_mt_cook_np.txt", "national-park"),
    ("Westland_Tai_Poutini_National_Park", "46_westland_np.txt", "national-park"),
    ("Mount_Aspiring_National_Park", "47_aspiring_np.txt", "national-park"),
    ("Paparoa_National_Park", "48_paparoa_np.txt", "national-park"),
    ("Whanganui_National_Park", "49_whanganui_np.txt", "national-park"),
    ("Kahurangi_National_Park", "50_kahurangi_np.txt", "national-park"),
    ("Coromandel_Peninsula", "51_coromandel.txt", "region"),
    ("Waitomo_Caves", "52_waitomo.txt", "attraction"),
    ("Kaik%C5%8Dura", "53_kaikoura.txt", "city"),
    ("Marlborough_(New_Zealand)", "54_marlborough.txt", "region"),
    ("Wanaka", "55_wanaka.txt", "city"),
    ("Stewart_Island", "56_stewart_island.txt", "region"),
    ("Waiheke_Island", "57_waiheke.txt", "region"),
    ("Taup%C5%8D", "58_taupo.txt", "city"),
    ("Hanmer_Springs", "59_hanmer.txt", "attraction"),
    ("Fox_Glacier", "60_fox_glacier.txt", "nature"),
    ("Franz_Josef_Glacier", "61_franz_josef.txt", "nature"),
    ("Visitor_visa_requirements_for_New_Zealand", "70_visa_info.txt", "travel-tips"),
    ("New_Zealand_dollar", "71_nz_currency.txt", "travel-tips"),
    ("Rail_transport_in_New_Zealand", "72_nz_rail.txt", "travel-tips"),
    ("Education_in_New_Zealand", "73_nz_education.txt", "reference"),
    ("Health_care_in_New_Zealand", "74_nz_health.txt", "reference"),
    # Driving-specific pages
    ("Driving_in_New_Zealand", "75_driving_in_nz.txt", "driving"),
    ("New_Zealand_State_Highway_network", "76_nz_state_highways.txt", "driving"),
    ("Road_safety_in_New_Zealand", "77_road_safety_nz.txt", "driving"),
    ("Speed_limits_in_New_Zealand", "78_speed_limits_nz.txt", "driving"),
    ("Vehicle_emissions_in_New_Zealand", "79_vehicle_emissions_nz.txt", "driving"),

]


def fetch_wikipedia_page(title: str) -> Optional[str]:
    import urllib.parse
    params = urllib.parse.urlencode({"action":"query","titles":title,"prop":"extracts","explaintext":True,"format":"json","exlimit":1})
    raw = safe_fetch_wikipedia(f"https://en.wikipedia.org/w/api.php?{params}")
    if not raw: return None
    try:
        data = json.loads(raw)
        for pid, page in data.get("query",{}).get("pages",{}).items():
            if pid == "-1": continue
            text = page.get("extract","")
            if text:
                d = title.replace("_"," ").replace("%C4%81","ā").replace("%C5%8D","ō").replace("%C4%93","ē")
                return f"# {d} - Wikipedia\n\n{text}"
    except: pass
    return None


def fetch_wikipedia_docs() -> list:
    print("\n[Wikipedia] 快速连通性检查...")
    import urllib.parse
    # 只试1次5秒超时检查连通性
    test_url = f"https://en.wikipedia.org/w/api.php?{urllib.parse.urlencode({'action':'query','titles':'New_Zealand','prop':'extracts','explaintext':True,'format':'json','exlimit':1})}"
    test_result = safe_fetch_wikipedia(test_url, timeout=5)
    if not test_result:
        print(" ⚠️ Wikipedia 不可达(GFW阻断),跳过整个源")
        print(" 💡 如需 Wikipedia 数据,开启代理: set HTTP_PROXY=http://127.0.0.1:7890")
        return []
    print(f" ✅ Wikipedia 可达! 开始爬取 {len(WIKIPEDIA_PAGES)} 页...")
    docs=[]
    for title,fname,cat in WIKIPEDIA_PAGES:
        print(f"  {title[:42].replace('_',' ')}...",end=" ",flush=True)
        text=fetch_wikipedia_page(title)
        if text and len(text)>200:
            with open(os.path.join(RAW_DIR,fname),"w",encoding="utf-8") as f: f.write(text)
            ut=title.replace("%C4%81","ā").replace("%C5%8D","ō").replace("%C4%93","ē")
            docs.append({"content":text,"url":f"https://en.wikipedia.org/wiki/{ut}","source_name":"wikipedia","category":cat,"title":title.replace("_"," ")})
            print(f"\u2705 {len(text)}c")
        else: print("\u274c")
        time.sleep(REQUEST_DELAY)
    return docs


# =========================== WIKIVOYAGE ===========================

WIKIVOYAGE_PAGES = [
    ("New_Zealand","100_wikivoyage_nz.txt","reference"),
    ("North_Island","101_wikivoyage_north_island.txt","region"),
    ("South_Island","102_wikivoyage_south_island.txt","region"),
    ("Auckland","110_wikivoyage_auckland.txt","city"),
    ("Wellington","111_wikivoyage_wellington.txt","city"),
    ("Rotorua","112_wikivoyage_rotorua.txt","city"),
    ("Hamilton_(New_Zealand)","113_wikivoyage_hamilton.txt","city"),
    ("Tauranga","114_wikivoyage_tauranga.txt","city"),
    ("Napier_(New_Zealand)","115_wikivoyage_napier.txt","city"),
    ("New_Plymouth","116_wikivoyage_newplymouth.txt","city"),
    ("Palmerston_North","117_wikivoyage_palmerston.txt","city"),
    ("Whangarei","118_wikivoyage_whangarei.txt","city"),
    ("Gisborne_(New_Zealand)","119_wikivoyage_gisborne.txt","city"),
    ("Waitomo","120_wikivoyage_waitomo.txt","attraction"),
    ("Taupo","121_wikivoyage_taupo.txt","city"),
    ("Bay_of_Islands","122_wikivoyage_bay_of_islands.txt","region"),
    ("Coromandel_Peninsula","123_wikivoyage_coromandel.txt","region"),
    ("Waikato","124_wikivoyage_waikato.txt","region"),
    ("East_Coast_(New_Zealand)","125_wikivoyage_east_coast.txt","region"),
    ("Lake_Taupo","126_wikivoyage_lake_taupo.txt","nature"),
    ("Tongariro_National_Park","127_wikivoyage_tongariro.txt","national-park"),
    ("Whanganui_National_Park","128_wikivoyage_whanganui.txt","national-park"),
    ("Egmont_National_Park","129_wikivoyage_egmont.txt","national-park"),
    ("Christchurch","140_wikivoyage_christchurch.txt","city"),
    ("Queenstown_(New_Zealand)","141_wikivoyage_queenstown.txt","city"),
    ("Dunedin","142_wikivoyage_dunedin.txt","city"),
    ("Nelson_(New_Zealand)","143_wikivoyage_nelson.txt","city"),
    ("Wanaka","144_wikivoyage_wanaka.txt","city"),
    ("Invercargill","145_wikivoyage_invercargill.txt","city"),
    ("Kaikoura","146_wikivoyage_kaikoura.txt","city"),
    ("Marlborough_(New_Zealand)","147_wikivoyage_marlborough.txt","region"),
    ("Fiordland_National_Park","148_wikivoyage_fiordland.txt","national-park"),
    ("Abel_Tasman_National_Park","149_wikivoyage_abel_tasman.txt","national-park"),
    ("Aoraki_Mount_Cook_National_Park","150_wikivoyage_mt_cook.txt","national-park"),
    ("Westland_National_Park","151_wikivoyage_westland.txt","national-park"),
    ("Nelson_Lakes_National_Park","152_wikivoyage_nelson_lakes.txt","national-park"),
    ("Mount_Aspiring_National_Park","153_wikivoyage_aspiring.txt","national-park"),
    ("Paparoa_National_Park","154_wikivoyage_paparoa.txt","national-park"),
    ("Stewart_Island","155_wikivoyage_stewart.txt","region"),
    ("Milford_Sound","156_wikivoyage_milford.txt","nature"),
    ("Fox_and_Franz_Josef_Glaciers","157_wikivoyage_glaciers.txt","nature"),
    ("Catlins","158_wikivoyage_catlins.txt","region"),
    ("West_Coast_(New_Zealand)","159_wikivoyage_west_coast.txt","region"),
    ("Canterbury_(New_Zealand)","160_wikivoyage_canterbury.txt","region"),
    ("Otago","161_wikivoyage_otago.txt","region"),
    ("Banks_Peninsula","162_wikivoyage_banks.txt","region"),
]


def fetch_wikivoyage_page(title: str) -> Optional[str]:
    import urllib.parse
    params = urllib.parse.urlencode({"action":"query","titles":title,"prop":"extracts","explaintext":True,"format":"json","exlimit":1})
    raw = safe_fetch(f"https://en.wikivoyage.org/w/api.php?{params}")
    if not raw: return None
    try:
        data = json.loads(raw)
        for pid, page in data.get("query",{}).get("pages",{}).items():
            if pid=="-1": continue
            text = page.get("extract","")
            if text: return f"# {title.replace('_',' ')} - Wikivoyage\n\n{text}"
    except: pass
    return None


def fetch_wikivoyage_docs() -> list:
    print("\n[Wikivoyage] ...")
    print(f"  Target: {len(WIKIVOYAGE_PAGES)} pages")
    docs=[]
    for title,fname,cat in WIKIVOYAGE_PAGES:
        print(f"  {title[:42].replace('_',' ')}...",end=" ",flush=True)
        text=fetch_wikivoyage_page(title)
        if text and len(text)>200:
            with open(os.path.join(RAW_DIR,fname),"w",encoding="utf-8") as f: f.write(text)
            docs.append({"content":text,"url":f"https://en.wikivoyage.org/wiki/{title}","source_name":"wikivoyage","category":cat,"title":title.replace("_"," ")})
            print(f"\u2705 {len(text)}c")
        else: print("\u274c")
        time.sleep(REQUEST_DELAY)
    return docs


# =========================== OPENTRIPMAP ===========================

OPENTRIPMAP_REGIONS = [
    ("Auckland",-36.85,174.76),("Wellington",-41.29,174.78),("Christchurch",-43.53,172.64),
    ("Queenstown",-45.03,168.66),("Rotorua",-38.14,176.25),("Dunedin",-45.87,170.50),
    ("Nelson",-41.28,173.28),("Tauranga",-37.69,176.17),
]
KINDS_MAP = {"interesting_places":"50_opentripmap_places.txt","natural":"51_opentripmap_nature.txt","cultural":"52_opentripmap_culture.txt","architecture":"53_opentripmap_architecture.txt","amusements":"54_opentripmap_amusements.txt"}


def fetch_opentripmap_docs() -> list:
    ak = os.environ.get("OPENTRIPMAP_API_KEY","")
    if not ak: print("\n[OpenTripMap] SKIP (no API key)"); return []
    print("\n[OpenTripMap] ..."); docs=[]
    for label,lat,lon in OPENTRIPMAP_REGIONS:
        print(f"  {label}...")
        for kinds,fname in KINDS_MAP.items():
            raw=safe_fetch(f"https://api.opentripmap.com/0.1/en/places/radius?radius=20000&lon={lon}&lat={lat}&kinds={kinds}&limit=30&format=json&apikey={ak}",15)
            time.sleep(REQUEST_DELAY)
            if not raw: continue
            try:
                places=json.loads(raw)
                if not isinstance(places,list) or not places: continue
                lines=[f"# OpenTripMap {kinds} - {label}",""]
                for p in places:
                    n=p.get("name","")
                    if n: lines.append(f"- {n} ({p.get('kinds','')})")
                content="\n".join(lines)
                with open(os.path.join(RAW_DIR,f"opentripmap_{label.lower()}_{fname}"),"w",encoding="utf-8") as f: f.write(content)
                docs.append({"content":content,"url":f"https://opentripmap.io/en/places?lat={lat}&lon={lon}","source_name":"opentripmap","category":f"poi-{kinds}","title":f"OpenTripMap {kinds} - {label}"})
                print(f"    {kinds}: {len(places)}")
            except: pass
    return docs


# =========================== DOC ===========================

DOC_KNOWN = [
    ("fiordland/places/fiordland-national-park","Fiordland National Park"),
    ("central-north-island/places/tongariro-national-park","Tongariro National Park"),
    ("nelson-tasman/places/abel-tasman-national-park","Abel Tasman National Park"),
    ("west-coast/places/westland-tai-poutini-national-park","Westland Tai Poutini National Park"),
    ("nelson-tasman/places/nelson-lakes-national-park","Nelson Lakes National Park"),
    ("nelson-tasman/places/kahurangi-national-park","Kahurangi National Park"),
    ("west-coast/places/paparoa-national-park","Paparoa National Park"),
    ("otago/places/mount-aspiring-national-park","Mount Aspiring National Park"),
    ("manawatu-whanganui/places/whanganui-national-park","Whanganui National Park"),
    ("canterbury/places/aoraki-mount-cook","Aoraki Mount Cook National Park"),
]


def _fetch_xml(url: str, tmo: int = 20) -> Optional[ET.Element]:
    raw = safe_fetch(url, timeout=tmo)
    if not raw: return None
    try: return ET.fromstring(raw)
    except: return None


def _discover_doc_urls(maxu: int = 25) -> list:
    print("\n  Discovering DOC sitemap...")
    root = _fetch_xml("https://www.doc.govt.nz/sitemap.xml", 25)
    if root is None: return None
    ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
    subs = [l.text for l in root.iter(f"{ns}loc") if l.text and "places-to-go" in l.text and l.text.endswith(".xml")]
    found = []
    for su in subs[:5]:
        sub = _fetch_xml(su, 20)
        if sub is None: continue
        for l in sub.iter(f"{ns}loc"):
            u = l.text or ""
            if "/places-to-go/" not in u: continue
            p = u.split("/places-to-go/")[1].strip("/")
            if p and len(p) < 60 and "/" in p:
                n = p.split("/")[-1].replace("-"," ").title()
                found.append((p,n))
                if len(found) >= maxu: break
        if len(found) >= maxu: break
    if len(found) < 5: return None
    print(f"  Found {len(found)} pages")
    return found


def _fetch_doc_text(rp: str) -> Optional[str]:
    from bs4 import BeautifulSoup
    import requests as rl
    url = f"https://www.doc.govt.nz/parks-and-recreation/places-to-go/{rp}/"
    try:
        resp = rl.get(url, headers={"User-Agent":USER_AGENT}, timeout=20)
        if resp.status_code != 200: return None
        soup = BeautifulSoup(resp.text, "html.parser")
        for s in ["script","style","noscript","nav","footer","header",".cookie"]:
            for e in soup.select(s): e.decompose()
        m = soup.find("main") or soup.find("article") or soup.find("body")
        if not m: return None
        t = m.get_text(separator="\n", strip=True)
        ls = [l.strip() for l in t.split("\n") if l.strip() and len(l.strip()) > 3]
        return "\n\n".join(ls)
    except: return None


def fetch_doc_docs() -> list:
    print("\n[DOC] ...")
    disc = _discover_doc_urls(25)
    places = disc if disc else DOC_KNOWN
    print(f"  Target: {len(places)} pages")
    docs=[]; ok=0
    for path,name in places:
        print(f"  {name[:40]}...",end=" ",flush=True)
        text = _fetch_doc_text(path)
        if text and len(text) > 50:
            sn = path.replace("/","_").replace("-","_")
            fp = os.path.join(RAW_DIR, f"60_doc_{sn}.txt")
            full = f"# {name} - DOC New Zealand\n\nURL: https://www.doc.govt.nz/parks-and-recreation/places-to-go/{path}/\n\n{text}"
            with open(fp,"w",encoding="utf-8") as f: f.write(full)
            docs.append({"content":full,"url":f"https://www.doc.govt.nz/parks-and-recreation/places-to-go/{path}/","source_name":"doc","category":"national-park","title":name})
            print(f"\u2705 {len(text)}c"); ok+=1
        else: print("\u274c")
        time.sleep(REQUEST_DELAY)
    print(f"  DOC: {ok}/{len(places)}")
    return docs


# =========================== NEWZEALAND.COM ===========================

NZCOM_EXCLUDE = ["/plan/business/","/plan/booking/","/my-account/","/login","/register","/search","/api/","/assets/","/sitemap/","/404","/500","/error","/int/plan/","/int/consent/","/int/terms/","/int/privacy/"]


def _discover_nzcom_urls(max_urls: int = 300) -> list:
    from curl_cffi import requests
    headers = {"User-Agent":USER_AGENT,"Accept":"text/xml,*/*;q=0.8"}
    disc = set()
    print("\n  Discovering NZ sitemap...")
    try:
        resp = requests.get("https://www.newzealand.com/int/sitemap.xml", impersonate="chrome120", headers=headers, timeout=25)
        if resp.status_code != 200: return None
    except: return None
    root = ET.fromstring(resp.text)
    ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
    subs = [l.text for l in root.iter(f"{ns}loc") if l.text and l.text.endswith(".xml") and "SiteTree" in l.text]
    print(f"  {len(subs)} sub-sitemaps")
    for su in subs:
        if len(disc) >= max_urls: break
        try:
            sub = requests.get(su, impersonate="chrome120", headers=headers, timeout=20)
            if sub.status_code != 200: continue
        except: continue
        try:
            sr = ET.fromstring(sub.text)
            for el in sr.iter(f"{ns}loc"):
                loc = el.text
                if not loc or "/int/" not in loc: continue
                p = loc.split("/int/")[1].strip("/")
                fp = f"/{p}/"
                if any(e in fp for e in NZCOM_EXCLUDE): continue
                if len(p) < 5 or re.match(r'^[0-9a-f\-]{20,}$', p): continue
                disc.add(p)
                if len(disc) >= max_urls: break
        except: continue
    print(f"  Found {len(disc)} urls")
    return sorted(disc)


def _cat_nzcom(path: str) -> str:
    p = path.lower()
    if "feature/" in p:
        if any(s in p for s in ["summer","winter","spring","autumn","season"]): return "season"
        return "feature"
    if p in ("north-island","south-island","other-islands"): return "region"
    if any(x in p for x in ["national-park","fiordland","tongariro","abel-tasman","mount-cook","whanganui"]): return "national-park"
    if any(x in p for x in ["travel-guide","getting-","visas","accommodation","working","itineraries","travel-times","map"]): return "travel-tips"
    if any(x in p for x in ["adventure","walking","hiking","cycling","events","scenic-flights","water","boat","camping","luxury","tours","family","hot-pools","winter","ski"]): return "activities"
    if any(x in p for x in ["maori","m\u0101ori","food","wine","film","middle-earth","arts","culture","heritage"]): return "culture"
    if any(x in p for x in ["nature","beaches","lakes","glaciers","alpine","stargazing","volcanic","geothermal","gardens"]): return "nature"
    return "city"


def _fetch_nzcom_page_impl(path: str) -> Optional[str]:
    """爬取单页 newzealand.com 内容"""
    from bs4 import BeautifulSoup
    from curl_cffi import requests

    url = f"https://www.newzealand.com/int/{path}/"
    headers = {
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
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
    """爬取 newzealand.com - sitemap 自动发现所有内容页"""
    print("\n[newzealand.com] 发现并爬取...")

    urls = _discover_nzcom_urls(max_urls=300)

    if urls is None:
        print("  \u26a0\ufe0f sitemap fail, using seeds...")
        SEED = [
            "auckland","wellington","christchurch","queenstown",
            "rotorua","dunedin","north-island","south-island",
            "travel-guide","getting-around","visas-and-immigration",
            "adventure","walking-and-hiking","maori-culture",
            "nature-and-wildlife","national-parks",
            "feature/top-things-to-see-and-do-in-new-zealand",
        ]
        urls = list(SEED)

    print(f"  Plan: {len(urls)} pages")
    docs = []; ok = 0
    for path in urls:
        name = path.replace("feature/","").replace("/","-")
        cat = _cat_nzcom(path)
        print(f"  {name}...", end=" ", flush=True)

        content = _fetch_nzcom_page_impl(path)
        if content:
            fname = f"newzealand_{name}.txt"
            fp = os.path.join(RAW_DIR, fname)
            with open(fp, "w", encoding="utf-8") as f:
                f.write(content)
            docs.append({
                "content": content,
                "url": f"https://www.newzealand.com/int/{path}/",
                "source_name": "newzealand.com",
                "category": cat,
                "title": name,
            })
            print(f"\u2705 {len(content)}c")
            ok += 1
        else:
            print("\u274c")

        time.sleep(0.5)

    print(f"  newzealand.com: {ok}/{len(urls)}")
    return docs






def safe_fetch_html(url: str, timeout: int = 25) -> Optional[str]:
    """Generic HTML fetch with curl_cffi fallback for WAF-protected sites"""
    result = safe_fetch(url, timeout)
    if result and len(result) > 200:
        return result
    try:
        from curl_cffi import requests as curl_req
        resp = curl_req.get(url, impersonate="chrome120",
            headers={"User-Agent": USER_AGENT, "Accept": "text/html,*/*",
                      "Accept-Language": "en-US,en;q=0.9", "Upgrade-Insecure-Requests": "1"},
            timeout=timeout)
        if resp.status_code == 200:
            return resp.text
    except: pass
    return None

# =====================================================================
# Source 6: AA New Zealand - Driving Guides
# =====================================================================

# AA driving sections for sitemap-style discovery
_AA_BASE = "https://www.aa.co.nz"
_AA_TRAVEL_SECTIONS = [
    "travel/driving", "travel/overseas-drivers", "travel/road-code",
    "travel/buying-a-car", "travel/car-safety", "travel/motoring",
    "travel/vehicle-licensing",
    "travel/breakdowns", "travel/fuel",
    "travel/insurance", "travel/campervan-and-motorhomes",
    "travel/trailers-and-towing",
    "travel/vehicle-importing",
    "travel/maps-and-directions", "travel/road-closures",
    "travel/road-trips", "travel/touring-guides",
    "travel/accommodation", "travel/travel-safety",
]

def _discover_aa_travel_pages(max_pages=50):
    """Discover AA travel pages via crawling their site structure"""
    from bs4 import BeautifulSoup
    import requests as rl
    found = set(_AA_TRAVEL_SECTIONS)
    try:
        resp = rl.get(f"{_AA_BASE}/travel/", headers={"User-Agent": USER_AGENT}, timeout=15)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, "html.parser")
            for a in soup.find_all("a", href=True):
                href = a["href"]
                if "/travel/" in href and "#" not in href:
                    if href.startswith("/"):
                        path = href.lstrip("/")
                    elif href.startswith(_AA_BASE):
                        path = href.replace(_AA_BASE, "").lstrip("/")
                    else: continue
                    if path and len(path) < 60 and "/travel/" in path:
                        found.add(path)
    except: pass
    found = sorted(found)[:max_pages]
    return [(p, p.replace("/","_").replace("-","_")[:40], p.split("/")[-1].replace("-"," ").title())
            for p in found]

def _fetch_aa_page(path: str) -> Optional[str]:
    """Fetch an AA page"""
    from bs4 import BeautifulSoup
    url = f"{_AA_BASE}/{path}/" if not path.endswith("/") else f"{_AA_BASE}/{path}"
    html = safe_fetch_html(url, timeout=20)
    if not html: return None
    soup = BeautifulSoup(html, "html.parser")
    for sel in ["script","style","noscript","nav","footer","header",
                ".cookie",".newsletter",".advert",".share",".sidebar"]:
        for e in soup.select(sel): e.decompose()
    main = soup.find("main") or soup.find("article") or soup.find(attrs={"role":"main"}) or soup.find("body")
    if not main: return None
    text = main.get_text(separator="\n", strip=True)
    lines = [l.strip() for l in text.split("\n") if l.strip() and len(l.strip()) > 4]
    clean = "\n\n".join(lines)
    if len(clean) < 100: return None
    return f"# AA New Zealand - {path}\n\nURL: {url}\n\n{clean}"

def fetch_aa_docs() -> list:
    """AA网站已改版,/travel/全部404,跳过(NZTA已覆盖官方驾驶信息)"""
    print("\n[AA New Zealand] ⚠️  已跳过(网站改版,travel路径404)")
    return []


# =====================================================================
# Source 7: NZ Transport Agency (NZTA) - Official Road Rules
# =====================================================================

# 50 NZTA driving-related sections (discovered dynamically via sitemap + known sections)
NZTA_SITEMAP_SECTIONS = [
    "roads-and-rail", "safety", "driver-licences",
    "driver-licences/visitors-and-new-residents",
    "driver-licences/overseas-visitors", "driver-licences/new-residents",
    "driver-licences/renewing", "driver-licences/applying",
    "driver-licences/restricted-licence", "driver-licences/full-licence",
    "driver-licences/learner-licence", "driver-licences/temporary-visa",
    "driver-licences/international-driving-permit",
    "roads-and-rail/toll-roads", "roads-and-rail/state-highways",
    "roads-and-rail/road-closures", "roads-and-rail/roadworks",
    "roads-and-rail/weight-and-dimensions", "roads-and-rail/rail-network",
    "safety/driving-safely", "safety/driving-safely/speed",
    "safety/driving-safely/alcohol-and-drugs",
    "safety/driving-safely/driver-fatigue",
    "safety/driving-safely/weather", "safety/driving-safely/rest-stops",
    "safety/driving-safely/mobile-phones",
    "safety/driving-safely/seatbelts-and-restraints",
    "safety/driving-safely/child-restraints",
    "safety/driving-safely/intersections",
    "safety/driving-safely/roundabouts",
    "safety/driving-safely/merging", "safety/driving-safely/passing",
    "safety/driving-safely/overtaking",
    "safety/driving-safely/head-on-crashes",
    "safety/driving-safely/loss-of-control",
    "safety/driving-safely/road-user-behaviour",
    "safety/driving-safely/cycling-safety",
    "safety/driving-safely/motorcycle-safety",
    "safety/driving-safely/truck-and-heavy-vehicle",
    "safety/driving-safely/pedestrian-safety",
    "safety/young-drivers", "safety/older-drivers",
    "safety/community-partnerships", "safety/campaigns",
]

def _discover_nzta_pages(max_pages=80):
    """Discover NZTA driving-related pages via sitemap + known sections"""
    from bs4 import BeautifulSoup
    print("  Discovering NZTA sitemap...")
    found = []
    import requests as rl
    try:
        resp = rl.get("https://www.nzta.govt.nz/sitemap.xml",
                       headers={"User-Agent": USER_AGENT}, timeout=15)
        if resp.status_code == 200:
            root = ET.fromstring(resp.text)
            ns = "{http://www.sitemaps.org/schemas/sitemap/0.9}"
            subs = [l.text for l in root.iter(f"{ns}loc") if l.text]
            for su in subs[:20]:
                try:
                    sub = rl.get(su, headers={"User-Agent": USER_AGENT}, timeout=15)
                    if sub.status_code != 200: continue
                    sr = ET.fromstring(sub.text)
                    for l in sr.iter(f"{ns}loc"):
                        u = l.text or ""
                        if any(kw in u.lower() for kw in ["driv", "road", "safety", "licen",
                                                           "speed", "alcohol", "weather",
                                                           "cycle", "crash", "tunnel"]):
                            if u not in found:
                                found.append(u)
                            if len(found) >= max_pages: break
                except: pass
                if len(found) >= max_pages: break
            print(f"  Sitemap found: {len(found)} NZTA pages")
    except: pass
    base_url = "https://www.nzta.govt.nz"
    for section in NZTA_SITEMAP_SECTIONS:
        if len(found) >= max_pages: break
        url = f"{base_url}/{section}/"
        if url not in found:
            found.append(url)
    return found[:max_pages]

def _fetch_nzta_page(url: str) -> Optional[str]:
    """Fetch an NZTA page using curl_cffi to bypass Incapsula WAF"""
    from bs4 import BeautifulSoup
    headers = {"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml,*/*"}
    try:
        # NZTA uses Incapsula WAF — need curl_cffi like newzealand.com
        from curl_cffi import requests as curl_req
        try:
            resp = curl_req.get(url, impersonate="chrome120", headers=headers, timeout=25)
        except:
            import requests as rl
            resp = rl.get(url, headers=headers, timeout=20)
        if resp.status_code != 200: return None
        soup = BeautifulSoup(resp.text, "html.parser")
        for sel in ["script","style","noscript","nav","footer","header",
                    ".cookie",".share",".sidebar",".related"]:
            for e in soup.select(sel): e.decompose()
        main = soup.find("main") or soup.find("article") or soup.find(attrs={"role":"main"}) or soup.find("body")
        if not main: return None
        text = main.get_text(separator="\n", strip=True)
        text_lines = [l.strip() for l in text.split("\n") if l.strip() and len(l.strip()) > 4]
        clean = "\n\n".join(text_lines)
        if len(clean) < 100: return None
        return f"# NZTA - {url}\n\n{clean}"
    except: return None

def fetch_nzta_docs() -> list:
    """Scrape NZ Transport Agency - official road rules (80+ pages)"""
    print("\n[NZ Transport Agency] ...")
    urls = _discover_nzta_pages(80)
    print(f"  Target: {len(urls)} pages")
    docs = []
    for url in urls:
        path = url.replace("https://www.nzta.govt.nz/", "").rstrip("/").replace("/", "_")
        name = path[:45] if len(path) > 45 else path
        print(f"  {name}...", end=" ", flush=True)
        text = _fetch_nzta_page(url)
        if text and len(text) > 200:
            fname = f"nzta_{path[:40]}.txt"
            with open(os.path.join(RAW_DIR, fname), "w", encoding="utf-8") as f: f.write(text)
            title = f"NZTA - {path.replace('_',' ').title()}"
            docs.append({"content":text, "url":url, "source_name":"nzta",
                         "category":"driving", "title":title})
            print(f"\u2705 {len(text)}c")
        else: print("\u274c")
        time.sleep(REQUEST_DELAY)
    print(f"  NZTA: {len(docs)}/{len(urls)} OK")
    return docs


# =====================================================================
# Source 8: newzealand.com - Driving/Transport pages (seed)
# =====================================================================

NZCOM_DRIVING_SEEDS = [
    "feature/driving-in-new-zealand",
    "feature/road-trips",
    "feature/scenic-road-trips",
    "feature/campervan-motorhome-travel",
    "getting-around",
    "getting-around/rental-cars",
    "feature/summer-road-trips",
    "feature/winter-driving",
]


# =====================================================================
# Source 9: Te Ara - Transport section
# =====================================================================

def _fetch_teara_topic(topic_slug: str) -> Optional[str]:
    """Fetch a Te Ara encyclopedia topic"""
    from bs4 import BeautifulSoup
    url = f"https://teara.govt.nz/en/{topic_slug}"
    raw = safe_fetch_html(url, timeout=20)
    if not raw: return None
    soup = BeautifulSoup(raw, "html.parser")
    for sel in ["script","style","noscript","nav","footer","header",
                ".cookie",".share","#left-nav"]:
        for e in soup.select(sel): e.decompose()
    main = soup.find("main") or soup.find("article") or soup.find(attrs={"role":"main"}) or soup.find("body")
    if not main: return None
    text = main.get_text(separator="\n", strip=True)
    lines = [l.strip() for l in text.split("\n") if l.strip() and len(l.strip()) > 4]
    clean = "\n\n".join(lines)
    if len(clean) < 100: return None
    return f"# {topic_slug} - Te Ara Encyclopedia\n\nURL: {url}\n\n{clean}"

def _discover_teara_topics(max_topics=200):
    """Discover all Te Ara topics from the A-Z index"""
    from bs4 import BeautifulSoup
    import requests as rl
    found = set()
    print("  Discovering Te Ara topics...")
    for url in ["https://teara.govt.nz/en/subjects", "https://teara.govt.nz/en"]:
        try:
            resp = rl.get(url, headers={"User-Agent": USER_AGENT}, timeout=20)
            if resp.status_code == 200:
                soup = BeautifulSoup(resp.text, "html.parser")
                for a in soup.select("a[href*='/en/']"):
                    parts = a["href"].lstrip("/").split("/")
                    if len(parts) >= 2 and parts[0] == "en" and parts[1]:
                        slug = parts[1]
                        if slug not in ("subjects","about","contact","search","feedback"):
                            found.add(slug)
        except: pass
    print(f"  Found {len(found)} Te Ara topics")
    return sorted(found)[:max_topics]

def fetch_teara_docs() -> list:
    """Scrape Te Ara Encyclopedia - auto-discover (200+ topics)"""
    print("\n[Te Ara Encyclopedia] ...")
    # Te Ara uses Cloudflare — discovery may fail, fallback to known topics
    KNOWN_TEARA_TOPICS = [
        "new-zealand-brief-history", "economy", "peoples", "nz-people",
        "maori", "maori-new-zealanders", "travel-and-tourism", "tourism",
        "natural-environment", "climate", "plants-animals-fungi",
        "south-island-regions", "north-island-regions",
        "auckland", "wellington", "canterbury-region",
        "transport", "roads-and-travel",
    ]
    try:
        topics = _discover_teara_topics(200)
        if not topics:
            raise ValueError("discovery returned empty")
    except Exception as e:
        print(f"  ⚠️ Discovery failed ({str(e)[:30]}), using {len(KNOWN_TEARA_TOPICS)} known topics")
        topics = list(KNOWN_TEARA_TOPICS)
    print(f"  Target: {len(topics)} topics")
    docs = []
    for slug in topics:
        title = slug.replace("-", " ").title()
        print(f"  {title[:42]}...", end=" ", flush=True)
        text = _fetch_teara_topic(slug)
        if text and len(text) > 200:
            fname = f"teara_{slug[:35]}.txt"
            with open(os.path.join(RAW_DIR, fname), "w", encoding="utf-8") as f: f.write(text)
            docs.append({"content":text,"url":f"https://teara.govt.nz/en/{slug}",
                         "source_name":"teara","category":"reference","title":f"Te Ara - {title}"})
            print(f"\u2705 {len(text)}c")
        else: print("\u274c")
        time.sleep(REQUEST_DELAY)
    print(f"  Te Ara: {len(docs)}/{len(topics)} OK")
    return docs


# =====================================================================
# Source 10: Safe driving tips (NZ Police / general)
# =====================================================================



# =====================================================================
# Source 10: NZ Police — Driving and Road Safety
# =====================================================================
# NOTE: Police website restructured in 2025!
# Old: /advice/driving/ (404)
# New: /advice-services/driving-and-road-safety/

_POLICE_DRIVING_TOPICS = [
    "being-safe-road-rules-and-reasons",
    "how-police-enforce-speed-limits",
    "personal-safety-your-vehicle",
    "fleeing-driver",
    "commercial-vehicle-safety-team-cvst",
]

def _discover_police_driving_pages(max_pages=30):
    from bs4 import BeautifulSoup
    import requests as rl
    base_url = "https://www.police.govt.nz/advice-services/driving-and-road-safety"
    found = [f"{base_url}/{t}/" for t in _POLICE_DRIVING_TOPICS]
    # Try to discover more from the listing page
    try:
        resp = rl.get(base_url, headers={"User-Agent": USER_AGENT}, timeout=15)
        if resp.status_code == 200:
            soup = BeautifulSoup(resp.text, "html.parser")
            for a in soup.find_all("a", href=True):
                href = a["href"]
                if "/advice-services/driving-and-road-safety/" in href and "#" not in href:
                    full = href if href.startswith("http") else f"https://www.police.govt.nz{href}"
                    if full not in found: found.append(full)
    except: pass
    print(f"  Police driving: {len(found)} pages found")
    return found[:max_pages]

def _fetch_police_page(url: str) -> Optional[str]:
    from bs4 import BeautifulSoup
    import requests as rl
    try:
        resp = rl.get(url, headers={"User-Agent": USER_AGENT, "Accept": "text/html,*/*"}, timeout=20)
        if resp.status_code != 200: return None
        soup = BeautifulSoup(resp.text, "html.parser")
        for sel in ["script","style","noscript","nav","footer","header",".cookie"]:
            for e in soup.select(sel): e.decompose()
        main = soup.find("main") or soup.find("article") or soup.find("body")
        if not main: return None
        text = main.get_text(separator="\n", strip=True)
        text_lines = [l.strip() for l in text.split("\n") if l.strip() and len(l.strip()) > 4]
        clean = "\n\n".join(text_lines)
        if len(clean) < 100: return None
        return f"# NZ Police - {url}\n\n{clean}"
    except: return None

def fetch_police_docs() -> list:
    """Scrape NZ Police - driving safety pages (restructured URL)"""
    print("\n[NZ Police] ...")
    urls = _discover_police_driving_pages(30)
    print(f"  Target: {len(urls)} pages")
    docs = []
    for url in urls:
        safe_name = url.replace("https://www.police.govt.nz/advice-services/", "")\
                      .rstrip("/").replace("/","_")[:35]
        print(f"  {safe_name}...", end=" ", flush=True)
        text = _fetch_police_page(url)
        if text and len(text) > 200:
            fname = f"police_driving_{safe_name}.txt"
            with open(os.path.join(RAW_DIR, fname), "w", encoding="utf-8") as f: f.write(text)
            docs.append({"content":text, "url":url, "source_name":"police",
                         "category":"driving", "title":f"Police - {safe_name.replace('_',' ')}"})
            print(f"\u2705 {len(text)}c")
        else: print("\u274c")
        time.sleep(REQUEST_DELAY)
    print(f"  Police: {len(docs)}/{len(urls)} OK")
    return docs

# =====================================================================
# fetch_all_sources — 异步统一入口
# =====================================================================

async def fetch_all_sources() -> list:
    """采集所有数据源，返回文档列表"""
    print("=" * 50)
    print("  \U0001f5fa\ufe0f  NZ Travel Data Collector")
    print("  All data from public APIs, no hardcoded content")
    print("=" * 50)

    all_docs = []
    loop = asyncio.get_event_loop()

    sources = [
        ("Wikipedia",      fetch_wikipedia_docs),
        ("Wikivoyage",     fetch_wikivoyage_docs),
        ("OpenTripMap",    fetch_opentripmap_docs),
        ("DOC",            fetch_doc_docs),
        ("newzealand.com", fetch_nzcom_docs),
        ("AA NZ",          fetch_aa_docs),
        ("NZTA",           fetch_nzta_docs),
        ("Te Ara",         fetch_teara_docs),
        ("NZ Police",      fetch_police_docs),
    ]

    for label, func in sources:
        try:
            d = await loop.run_in_executor(None, func)
            all_docs.extend(d)
            await asyncio.sleep(REQUEST_DELAY)
        except Exception as e:
            print(f"  [{label}] error: {e}")

    print(f"\n{'=' * 50}")
    print(f"  Done! {len(all_docs)} documents total")
    print(f"{'=' * 50}")
    return all_docs


# =====================================================================
# CLI
# =====================================================================

if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser(description="NZ Travel Data Collector")
    p.add_argument("--sources", default="all", choices=["all","wiki","opentrip","doc","nzcom"])
    p.add_argument("--delay", type=float, default=0.5)
    args = p.parse_args()
    REQUEST_DELAY = args.delay
    docs = asyncio.run(fetch_all_sources())
    print(f"\nTotal: {len(docs)} documents")