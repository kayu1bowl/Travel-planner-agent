import urllib.request
import urllib.parse
import json
import re
from concurrent.futures import ThreadPoolExecutor
from typing import Optional, Dict, List

# 内存缓存，避免重复网络调用
_IMAGE_SEARCH_CACHE: Dict[str, Dict[str, str]] = {}

def clean_spot_query(raw_name: str) -> str:
    """提取地标与美食的核心实体名，提高维基检索命中率"""
    if not raw_name:
        return ""
    clean = re.sub(r'[\(（【\[].*?[\)）】\]]', '', str(raw_name))
    clean = re.sub(r'^(抵达|前往|游览|打卡|漫步|体验|观赏|俯瞰|深度游览|\d+[\.\、\s]*)', '', clean)
    clean = re.sub(r'(晨雾光影|蓝调时刻|日落金山|全景夜景|远景|特上极握寿司套餐|极品海鲜丼与寿司|天然足汤|与大汤沼天然足汤|与红砖仓库群|水雾光影|光影|全景|之旅|散策|巡礼)', '', clean)
    return clean.strip()


def universal_search_single_image(spot_name: str, category: str = 'landmark', destination: str = '') -> Dict[str, str]:
    """
    通用开放域真实图像检索算法（免 API-Key、全球覆盖、自动回退）
    
    层级流水线：
      Tier 1: Wikipedia REST Summary API (支持 zh/en/ja 等语言真实地标百科词条大图)
      Tier 2: Wikimedia Commons 开放实时搜索 API (海量高分辨率自然摄影库)
      Tier 3: AI Real-Time Generative On-Demand Rendering (Pollinations 8K 概念生成)
    """
    clean = clean_spot_query(spot_name)
    if not clean:
        clean = clean_spot_query(destination) or "Scenic View"

    cache_key = f"{clean}_{category}"
    if cache_key in _IMAGE_SEARCH_CACHE:
        return _IMAGE_SEARCH_CACHE[cache_key]

    headers = {
        'User-Agent': 'RoamAITravelPlanner/2.0 (universal-image-engine@roamai.com)'
    }

    # 1. 尝试 Wikipedia REST Summary API (针对东亚与全球著名景点极速直出实拍原图)
    lang_order = ['zh', 'en', 'ja']
    for lang in lang_order:
        try:
            encoded = urllib.parse.quote(clean)
            url = f"https://{lang}.wikipedia.org/api/rest_v1/page/summary/{encoded}"
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=2.5) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode('utf-8'))
                    img_url = data.get('originalimage', {}).get('source') or data.get('thumbnail', {}).get('source')
                    if img_url and not img_url.endswith('.svg'):
                        result = {
                            "url": img_url,
                            "source": f"Wikipedia ({lang.upper()})"
                        }
                        _IMAGE_SEARCH_CACHE[cache_key] = result
                        return result
        except Exception:
            pass

    # 2. 尝试 Wikimedia Commons 开放搜索 API (针对细分景点、小镇与自然景观)
    try:
        search_terms = [clean, f"{clean} {destination}".strip()]
        for term in search_terms:
            encoded = urllib.parse.quote(term)
            url = f"https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrsearch={encoded}&gsrlimit=3&prop=pageimages&pithumbsize=1200&format=json"
            req = urllib.request.Request(url, headers=headers)
            with urllib.request.urlopen(req, timeout=2.5) as resp:
                if resp.status == 200:
                    data = json.loads(resp.read().decode('utf-8'))
                    pages = data.get('query', {}).get('pages', {})
                    for pid, pdata in pages.items():
                        thumb = pdata.get('thumbnail', {}).get('source')
                        if thumb and not thumb.endswith('.svg'):
                            result = {
                                "url": thumb,
                                "source": "Wikimedia Commons"
                            }
                            _IMAGE_SEARCH_CACHE[cache_key] = result
                            return result
    except Exception:
        pass

    # 3. 兜底层：AI 实时高精渲染 (Pollinations 8K Generative Engine)
    is_food = any(k in category or k in clean for k in ['美食', '餐饮', '料理', '吃', 'food', 'cuisine', 'dish', 'curry', 'sushi', 'bbq', 'noodle', 'melon'])
    dest_prompt = f"in {destination}" if destination else ""
    
    if is_food:
        prompt = f"Mouthwatering authentic delicacy {clean} {dest_prompt}, master chef gourmet food photography, 8k resolution, cinematic restaurant warm light, appetizing presentation"
    else:
        prompt = f"Breathtaking travel photograph of {clean} {dest_prompt}, iconic scenery, golden hour sunlight, National Geographic style, ultra-high definition 8k"

    # 计算确定性 Seed 避免闪烁
    seed = abs(hash(clean)) % 1000000
    gen_url = f"https://image.pollinations.ai/prompt/{urllib.parse.quote(prompt)}?width=900&height=560&nologo=true&seed={seed}"
    result = {
        "url": gen_url,
        "source": "AI Real-time Generative"
    }
    _IMAGE_SEARCH_CACHE[cache_key] = result
    return result


def batch_resolve_images(items: List[dict], destination: str = '') -> List[dict]:
    """并发为地标/美食/机位列表批量检索真实的实拍图"""
    if not items:
        return []

    def _resolve(item):
        name = item.get("name") or item.get("location") or item.get("title") or ""
        cat = item.get("category") or ("photo" if "camera_params" in item or "composition_tips" in item else "landmark")
        # 实时检索真实 Web 图像
        img_res = universal_search_single_image(name, cat, destination)
        item["image"] = img_res["url"]
        item["imageSource"] = img_res["source"]
        return item

    with ThreadPoolExecutor(max_workers=6) as executor:
        resolved_items = list(executor.map(_resolve, items))
    return resolved_items
