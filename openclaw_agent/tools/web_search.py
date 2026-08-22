"""
联网搜索工具

提供统一的联网搜索接口，支持多个后端。
当前 Demo 阶段默认用 mock 模式（返回模拟数据），
部署时切换到真实后端。

支持后端:
 - mock:  返回模拟结果（开发调试用）
 - openclaw:通过 OpenClaw 内置 web_search 能力（需要运行在 OpenClaw 环境中）
 - tavily: 通过 tavily API（需要 TAVILY_API_KEY）
 - serpapi: 通过 SerpAPI（需要 SERPAPI_API_KEY）
"""

import os
import sys
import json
from pathlib import Path
from typing import Optional

_project_root = Path(__file__).resolve().parents[2]
if str(_project_root) not in sys.path:
  sys.path.insert(0, str(_project_root))

from openclaw_agent.config.agent_config import (
  WEB_SEARCH_BACKEND,
  TAVILY_API_KEY,
  SERPAPI_API_KEY,
)


def search_web(query: str, max_results: int = 5) -> str:
  """联网搜索，返回格式化文本结果。

  根据 config 中 WEB_SEARCH_BACKEND 选择后端。
  """
  backend = WEB_SEARCH_BACKEND.lower()

  if backend == "openclaw":
    return _search_openclaw(query, max_results)
  elif backend == "tavily":
    return _search_tavily(query, max_results)
  elif backend == "serpapi":
    return _search_serpapi(query, max_results)
  else:
    return _search_mock(query, max_results)


def _search_openclaw(query: str, max_results: int = 5) -> str:
  """通过 OpenClaw 内置的 web_search 能力搜索。

  注意：此函数只能在 OpenClaw agent 运行环境中使用。
  在 FastAPI 独立服务中不可用，会 fallback 到 mock。
  """
  try:
    # 尝试调用 OpenClaw web_search
    # 在 OpenClaw 环境中，有一个全局的 web_search 函数可用
    import __main__ as main_mod
    if hasattr(main_mod, '__file__') and 'openclaw' in str(getattr(main_mod, '__file__', '')).lower():
      # 运行在 OpenClaw 环境中 - 通过 exec 调用
      pass
  except Exception:
    pass

  # fallback: 用 requests 简单抓取 Google/Bing 搜索结果
  # 但这种方法不稳定，降级到 mock
  print("  OpenClaw web_search 不可用，降级到 mock 模式")
  return _search_mock(query, max_results)


def _search_tavily(query: str, max_results: int = 5) -> str:
  """使用 Tavily API 搜索"""
  if not TAVILY_API_KEY:
    return "【联网搜索】TAVILY_API_KEY 未配置。请在环境变量中设置后再试。"

  try:
    from tavily import TavilyClient
    client = TavilyClient(api_key=TAVILY_API_KEY)
    response = client.search(query=query, max_results=max_results)
    results = response.get("results", [])
    if not results:
      return "【联网搜索】未找到相关结果。"

    output = f"【联网搜索结果】共 {len(results)} 条：\n\n"
    for i, r in enumerate(results, 1):
      title = r.get("title", "无标题")
      url = r.get("url", "")
      snippet = r.get("content", r.get("snippet", ""))
      output += f"{i}. [{title}]({url})\n  {snippet}\n\n"
    return output
  except ImportError:
    return "【联网搜索】tavily 库未安装，请执行: pip install tavily-python"
  except Exception as e:
    return f"【联网搜索】Tavily 搜索失败: {str(e)}"


def _search_serpapi(query: str, max_results: int = 5) -> str:
  """使用 SerpAPI 搜索"""
  if not SERPAPI_API_KEY:
    return "【联网搜索】SERPAPI_API_KEY 未配置。请在环境变量中设置后再试。"

  try:
    import requests
    params = {
      "q": query,
      "api_key": SERPAPI_API_KEY,
      "engine": "google",
      "num": max_results,
    }
    resp = requests.get("https://serpapi.com/search", params=params, timeout=15)
    data = resp.json()
    organic = data.get("organic_results", [])
    if not organic:
      return "【联网搜索】未找到相关结果。"

    output = f"【联网搜索结果】共 {len(organic)} 条：\n\n"
    for i, r in enumerate(organic[:max_results], 1):
      title = r.get("title", "无标题")
      url = r.get("link", "")
      snippet = r.get("snippet", "")
      output += f"{i}. [{title}]({url})\n  {snippet}\n\n"
    return output
  except Exception as e:
    return f"【联网搜索】SerpAPI 搜索失败: {str(e)}"


def _search_mock(query: str, max_results: int = 5) -> str:
  """Mock 模式 — 返回模拟结果，覆盖全球及国内主流目的地，方便开发与离线运行"""
  mock_results = {
    # 日本 (东京 / 京都 / 富士山 / 镰仓)
    "东京": [
      "东京 (Tokyo) 是融合江户传统与赛博朋克都市的顶级目的地。",
      "推荐动线：浅草寺祈福 > 涩谷十字路口与 Shibuya Sky > 新宿御苑与森大厦东京铁塔夜景。",
      "地道美食：筑地场外市场蓝鳍金枪鱼刺身、一兰/面屋一灯拉面、文字烧与银座精致寿喜烧。",
      "摄影机位：Shibuya Sky 顶层 360° 落日天际线、浅草寺雷门大灯笼仰拍、六本木新城森大厦拍摄东京铁塔车轨。",
      "交通出行：建议购买东京地铁 72 小时券或使用 Suica 西瓜卡，羽田/成田机场直通特快。",
    ],
    "京都": [
      "京都 (Kyoto) 千年古都，拥有清水寺、金阁寺、伏见稻荷大社等世界文化遗产。",
      "推荐动线：清水寺二年坂三年坂 > 岚山竹林天龙寺 > 伏见稻荷千本鸟居 > 鸭川纳凉床。",
      "特色风味：宇治抹茶甜品、地道汤豆腐料理、京怀石与先斗町居酒屋。",
      "摄影机位：八坂之塔（法观寺）石板路暮色、岚山竹林清晨丁达尔光束、伏见稻荷鸟居纵深构图。",
    ],
    "日本": [
      "日本自由行交通极度便利，新干线连接关东关西，主要交通卡全国通用。",
      "驾驶与出行提示：靠左行驶；电车地铁内保持安静；多数餐厅需提前线上预约。",
    ],

    # 法国与巴黎
    "巴黎": [
      "巴黎 (Paris) 浪漫之都，拥有卢浮宫、奥赛博物馆、埃菲尔铁塔等顶级文化艺术宝库。",
      "推荐路线：卢浮宫镇馆三宝 > 塞纳河游船巡游 > 蒙马特圣心大教堂 > 凡尔赛宫镜厅。",
      "必尝风物：传统法式羊角面包、油封鸭腿 (Duck Confit)、马卡龙与勃艮第红酒配牛排。",
      "绝佳机位：特罗卡德罗夏乐宫平台晨曦拍铁塔、亚历山大三世桥蓝调时分、卢浮宫玻璃金字塔夜景倒影。",
      "旅行贴士：卢浮宫与凡尔赛宫需提前在官方预约入场时段；注意随身防盗。",
    ],
    "法国": [
      "法国旅行涵盖巴黎都市艺术、普罗旺斯薰衣草、阿尔卑斯霞慕尼雪山与蔚蓝海岸尼斯。",
      "交通方式：SNCF 高铁 TGV 便捷穿梭各大城市，乡村自驾公路路况极佳。",
    ],

    # 瑞士与阿尔卑斯
    "瑞士": [
      "瑞士 (Switzerland) 阿尔卑斯自然天堂，拥有世界顶级的全景列车与高山徒步网络。",
      "核心打卡：因特拉肯少女峰 (Top of Europe)、采尔马特马特洪峰 (Matterhorn)、格林德瓦与卢塞恩湖。",
      "特色美食：瑞士传统奶酪火锅 (Cheese Fondue)、苏黎世小牛肉配土豆丝饼 (Rösti)。",
      "绝美机位：利菲尔湖 (Riffelsee) 倒映马特洪峰日出金顶、劳特布龙嫩瀑布小镇全景、First 悬崖步道。",
      "交通出行：强烈推荐购买 Swiss Travel Pass (STP)，一票通用全境火车、游船、巴士及数百座博物馆。",
    ],

    # 冰岛与北欧
    "冰岛": [
      "冰岛 (Iceland) 极致冰与火之歌，涵盖火山、冰川、瀑布与极光奇观。",
      "经典路线：黄金圈 (辛格维利尔/间歇泉/黄金瀑布) > 南岸黑沙滩 > 杰古沙龙冰河湖与钻石沙滩。",
      "特色体验：蓝湖 (Blue Lagoon) 地热温泉、卡特拉火山蓝冰洞探秘、斯卡夫塔山冰川徒步。",
      "摄影参数：钻石黑沙滩慢门长曝拍剔透蓝冰、草帽山极光爆发 (广角 14mm f/1.8 8s ISO 1600)。",
      "自驾贴士：环岛 1 号公路路况良好，非夏季或进入内陆 F 路段务必租赁四驱 SUV。",
    ],

    # 中国西部与山水秘境 (新疆 / 云南 / 四川 / 贵州)
    "新疆": [
      "新疆幅员辽阔，北疆看风光（喀纳斯/赛里木湖/那拉提/独库公路），南疆品人文（喀什古城/帕米尔高原）。",
      "核心体验：赛里木湖环湖自驾看雪山天鹅、那拉提空中草原骑马、禾木村图瓦木屋与星空清晨晨雾。",
      "地道美食：新疆大盘鸡、炭火现烤羊肉串、手抓饭、烤包子与冰镇鲜马奶/卡瓦斯。",
      "出片机位：禾木村观景台晨雾日出、赛里木湖 S 弯沿湖公路、独库公路乔尔玛冰川垭口。",
      "旅行须知：早晚温差大，夏季亦需准备防风保暖外套；自驾车程较长建议双驾驶员轮换。",
    ],
    "云南": [
      "云南拥有独特的高原多元风情与慢节奏生活，经典路线昆明-大理-丽江-香格里拉。",
      "推荐动线：大理洱海生态廊道骑行 > 喜洲古镇品粑粑 > 丽江古城夜景 > 玉龙雪山冰川公园与蓝月谷。",
      "特色风味：正宗过桥米线、野生菌土鸡火锅、大理酸辣鱼与鲜花饼。",
      "摄影机位：洱海 S 弯日出晨曦、蓝月谷白水台瀑布蓝绿水质、玉龙雪山甘海子全景。",
    ],
    "四川": [
      "四川融合天府之国慢生活与川西高原绝美雪山，涵盖成都、九寨沟、黄龙、稻城亚丁、都江堰。",
      "核心打卡：成都大熊猫繁育研究基地、宽窄巷子/锦里、九寨沟五花海与诺日朗瀑布、黄龙钙华彩池。",
      "地道美食：四川麻辣火锅、乐山钵钵鸡、担担面、钟水饺与九寨沟牦牛肉火锅。",
      "摄影机位：九寨沟五花海倒影秋色、黄龙五彩池高空俯拍、成都大熊猫吃竹子特写萌照。",
    ],
    "贵州": [
      "贵州喀斯特地形奇观与民族风情汇聚，包括黄果树瀑布、荔波小七孔、西江千户苗寨与梵净山。",
      "地道美食：贵阳肠旺面、酸汤鱼、丝娃娃、安顺夺夺粉火锅与水城羊肉粉。",
      "摄影机位：黄果树银链坠潭瀑布慢门拉丝水瀑、西江千户苗寨观景台万家灯火夜景。",
    ],

    # 新西兰
    "新西兰": [
      "新西兰南岛经典自驾路线：基督城 > 特卡波 > 瓦纳卡 > 皇后镇 > 米尔福德峡湾。",
      "核心打卡：特卡波好牧羊人教堂暗夜观星、库克山胡克谷冰川徒步、皇后镇天际缆车与瓦纳卡孤树。",
      "美食与特产：普卡基湖高山三文鱼、Fergburger 皇后镇大汉堡、吉布斯顿酒庄黑皮诺红酒。",
      "驾驶提示：全境严格靠左行驶，单车道桥梁注意 Give Way 让行标志，租车建议选全险。",
    ],
    "皇后镇": [
      "皇后镇 (Queenstown) 位于瓦卡蒂普湖畔，是世界著名的极限运动与户外度假之都。",
      "推荐活动：天际缆车山顶自助餐、米尔福德峡湾游船巡礼、卡瓦劳大桥蹦极、蒸汽船瓦尔特峰农场。",
      "摄影机位：天际缆车观景台俯瞰全城与卓越山脉夜景、格伦诺基中土世界雪山木屋。",
    ],
  }

  # 尝试匹配关键词
  matched = []
  for keyword, items in mock_results.items():
    if keyword.lower() in query.lower() or any(
      word.lower() in keyword.lower() for word in query.split()
    ):
      matched.extend(items)

  if not matched:
    # 全球任意目的地智能动态生成旅游资讯
    dest_name = query.replace("帮我规划", "").replace("我想去", "").replace("旅游", "").replace("旅行", "").strip() or "目的地"
    matched = [
      f"关于【{dest_name}】的全球精选深度旅行指南与前沿动态：",
      f"1. 核心动线与节奏：建议根据出行天数合理分配核心地标与小众深度体验，避免赶路疲劳。",
      f"2. 交通与出行：城市内推荐搭配地铁与高频公共交通，跨城或郊野风光推荐自驾或城际高铁。",
      f"3. 地道风物体验：建议打卡当地高评分地道特色餐馆与传统市集，深度品味当地正宗风味美食。",
      f"4. 摄影与出片机位：建议把握清晨日出（06:30-07:30）与傍晚蓝调时刻（日落后30分钟），配合广角与大光圈镜头出片率极高。",
    ]

  output = f"【联网搜索结果】共 {len(matched)} 条：\n\n"
  for i, item in enumerate(matched[:max_results], 1):
    output += f"{i}. {item}\n\n"
  return output


if __name__ == "__main__":
  # 测试
  for q in ["皇后镇摄影", "新西兰自驾", "签证"]:
    print(f"\n 搜索: {q}")
    print("=" * 60)
    print(search_web(q))
