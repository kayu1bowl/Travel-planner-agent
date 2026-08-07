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
            resp = req_lib.get(url, headers=headers, timeout=timeout)
            if resp.status_code == 429:
                wait = BASE_BACKOFF ** attempt
                print(f"  \u23f3 429, wait {wait:.0f}s ({attempt}/{MAX_RETRIES})")
                time.sleep(wait); continue
            if resp.status_code != 200:
                return None
            return resp.text
        except req_lib.exceptions.ConnectionError as e:
            err = str(e)
            if "getaddrinfo" in err.lower() or "name or service" in err.lower():
                if attempt < MAX_RETRIES:
                    print(f"  \u26a0\ufe0f DNS fail, retry ({attempt}/{MAX_RETRIES})")
                    time.sleep(3); continue
                return None
            return None
        except req_lib.exceptions.Timeout:
            if attempt < MAX_RETRIES:
                print(f"  \u23f3 timeout ({attempt}/{MAX_RETRIES})")
                time.sleep(BASE_BACKOFF ** attempt); continue
            return None
        except Exception:
            if attempt < MAX_RETRIES:
                time.sleep(BASE_BACKOFF ** attempt); continue
            return None
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
]


def fetch_wikipedia_page(title: str) -> Optional[str]:
    import urllib.parse
    params = urllib.parse.urlencode({"action":"query","titles":title,"prop":"extracts","explaintext":True,"format":"json","exlimit":1})
    raw = safe_fetch(f"https://en.wikipedia.org/w/api.php?{params}")
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
    print("\n[Wikipedia] ...")
    print(f"  Target: {len(WIKIPEDIA_PAGES)} pages")
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
            raw=safe_fetch(f"https://api.opentripmap.com/0.1/en/places/radius?radius=20000&lon={lon}&lat={lat}&kinds={kinds}&limit=30&format=json&apikey=***",15)
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
        ("Wikipedia",     fetch_wikipedia_docs),
        ("Wikivoyage",    fetch_wikivoyage_docs),
        ("OpenTripMap",   fetch_opentripmap_docs),
        ("DOC",           fetch_doc_docs),
        ("newzealand.com", fetch_nzcom_docs),
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