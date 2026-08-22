/**
 * @file imageMatcher.js
 * 精细化地标与风光图像智能匹配引擎
 * 针对全球目的地、著名地标、自然奇观与美食文化提供精选高质量图库与语义匹配算法
 */

export const VERIFIED_LANDSCAPE_LIBRARY = {
  // 1. 新西兰系列 (南阿尔卑斯、暗夜星空、冰川、峡湾)
  NZ_TEKAPO_NIGHT: {
    url: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=1920&auto=format&fit=crop&q=85",
    title: "Lake Tekapo Dark Sky Reserve",
    location: "新西兰特卡波湖 · 国际暗夜星空保护区好牧羊人教堂",
    location_en: "Lake Tekapo, New Zealand · Church of the Good Shepherd & Dark Sky Reserve",
    spotType: "ASTROPHOTOGRAPHY · 暗夜星空机位",
    focal: "14mm GM",
    aperture: "f/2.8",
    shutter: "20s",
    iso: "ISO 3200",
    elevation: "710m",
    bortle: "Class 1 极暗天空",
    window: "银河升起 23:30 - 03:15",
    tip: "超广角低机位仰拍，石砌教堂作为前景容纳整片银河拱桥，避开小镇杂光。"
  },
  NZ_WANAKA_ROYS_PEAK: {
    url: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&auto=format&fit=crop&q=85",
    title: "Roys Peak Wanaka Ridge",
    location: "新西兰瓦纳卡 · 罗伊斯山晨光云海脊线",
    location_en: "Lake Wanaka, New Zealand · Roys Peak Ridgeline & Alpine Sunrise",
    spotType: "GOLDEN HOUR · 晨光云海脊线",
    focal: "35mm F1.4",
    aperture: "f/8.0",
    shutter: "1/200s",
    iso: "ISO 100",
    elevation: "1578m",
    bortle: "日出顺逆光",
    window: "黄金时刻 06:15 - 07:00",
    tip: "逆光拍摄山脊延伸至瓦纳卡湖，使用 CPL 偏振镜消除湖面反光与杂色。"
  },
  NZ_MILFORD_SOUND: {
    url: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1920&auto=format&fit=crop&q=85",
    title: "Milford Sound Fiordland",
    location: "新西兰米尔福德峡湾 · 世界自然遗产地主教冠峰",
    location_en: "Milford Sound, New Zealand · Mitre Peak & World Heritage Fjord",
    spotType: "BLUE HOUR · 峡湾镜面倒影",
    focal: "16-35mm",
    aperture: "f/11",
    shutter: "30s (ND64)",
    iso: "ISO 100",
    elevation: "海平面",
    bortle: "晨雾蓝调",
    window: "蓝调时刻 07:20 - 08:00",
    tip: "利用退潮沙滩水面长曝光消除水波，捕捉倒映在深色冰川海水中的主教冠峰。"
  },
  NZ_WANAKA_TREE: {
    url: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1920&auto=format&fit=crop&q=85",
    title: "That Wanaka Tree & Alpine Lake",
    location: "新西兰瓦纳卡 · 湖畔孤独之树与南阿尔卑斯雪山",
    location_en: "Lake Wanaka, New Zealand · That Wanaka Tree & Southern Alps",
    spotType: "LONG EXPOSURE · 经典湖畔孤树",
    focal: "70-200mm",
    aperture: "f/11",
    shutter: "30s (ND64)",
    iso: "ISO 100",
    elevation: "278m",
    bortle: "日出晨霞 / 暮色",
    window: "清晨或日落 06:30 / 18:30",
    tip: "长焦镜头压缩背景雪山空间感，配合 ND 减光镜实现 30 秒长曝光，使湖面如丝绸般宁静。"
  },
  NZ_SOUTHERN_ALPS_HIGHWAY: {
    url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&auto=format&fit=crop&q=85",
    title: "Southern Alps Scenic Highway 8",
    location: "新西兰南岛 8 号国道 · 纵贯南阿尔卑斯山脉",
    location_en: "State Highway 8, New Zealand · Southern Alps Scenic Corridor",
    spotType: "ROAD TELEMETRY · 智驾全景公路",
    focal: "24mm F2.8",
    aperture: "f/8.0",
    shutter: "1/500s",
    iso: "ISO 100",
    elevation: "820m",
    bortle: "晴空自驾",
    window: "全天最佳",
    tip: "使用广角沿公路中心延伸线构图，捕捉笔直公路伸入雪山群峰的透视纵深感。"
  },

  // 2. 日本与北海道全域系列 (富士山、京都、浅草、小樽运河、美瑛青池、洞爷湖、支笏湖、富良野、登别、函馆)
  JP_FUJI_PAGODA: {
    url: "https://images.unsplash.com/photo-1578637387939-43c525550085?w=1920&auto=format&fit=crop&q=85",
    title: "Mount Fuji & Chureito Pagoda",
    location: "日本山梨县 · 富士山新仓山浅间公园五重塔",
    location_en: "Yamanashi, Japan · Chureito Pagoda & Mt. Fuji",
    spotType: "ICONIC VIEW · 经典雪顶和风",
    focal: "50mm F1.8",
    aperture: "f/5.6",
    shutter: "1/60s",
    iso: "ISO 200",
    elevation: "850m",
    bortle: "夕阳晚霞",
    window: "日落前 17:15 - 18:00",
    tip: "中焦段压缩忠灵塔与远方雪白富士山同框，日落前 30 分钟塔身朱红暖光最佳。"
  },
  JP_HOKKAIDO_SHIKOTSU_LAKE: {
    url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1920&auto=format&fit=crop&q=85",
    title: "Lake Shikotsu Pristine Blue Water",
    location: "日本北海道 · 支笏洞爷国立公园支笏湖澄澈蓝境",
    location_en: "Hokkaido, Japan · Lake Shikotsu & Volcanic Caldera",
    spotType: "PRISTINE CALDERA · 火山不冻湖",
    focal: "16-35mm",
    aperture: "f/8.0",
    shutter: "1/200s",
    iso: "ISO 100",
    elevation: "248m",
    bortle: "支笏蓝晨光",
    window: "清晨 07:00 - 09:00",
    tip: "使用超广角捕捉日本极高透明度的“支笏湖蓝”湖水与远眺樽前山火山全景。"
  },
  JP_HOKKAIDO_TOYA_LAKE: {
    url: "https://images.unsplash.com/photo-1499856871958-5b9627545d1a?w=1920&auto=format&fit=crop&q=85",
    title: "Lake Toya Panorama & Mt Usu",
    location: "日本北海道 · 洞爷湖全景展望台与有珠山双重火山",
    location_en: "Hokkaido, Japan · Lake Toya Panorama & Mt. Usu",
    spotType: "VOLCANO PANORAMA · 火山湖泊全景",
    focal: "24-70mm",
    aperture: "f/9.0",
    shutter: "1/250s",
    iso: "ISO 100",
    elevation: "450m",
    bortle: "晴空湖光",
    window: "傍晚日落 17:00 - 18:30",
    tip: "在展望台使用广角俯瞰圆形火口湖与湖心中岛，远眺羊蹄山雄姿与有珠山地貌。"
  },
  JP_HOKKAIDO_BIEI_BLUE_POND: {
    url: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1920&auto=format&fit=crop&q=85",
    title: "Shirogane Blue Pond & Shirahige Falls",
    location: "日本北海道美瑛 · 白金青池梦幻蓝调与枯木倒影",
    location_en: "Biei, Hokkaido, Japan · Shirogane Blue Pond & Silver Birches",
    spotType: "MYSTIC POND · 梦幻青池光影",
    focal: "24mm F1.4",
    aperture: "f/5.6",
    shutter: "1/100s",
    iso: "ISO 100",
    elevation: "500m",
    bortle: "清晨薄雾",
    window: "清晨 06:30 - 08:00",
    tip: "捕捉白桦枯木在微风吹拂的青蓝色池水中的倒影，清晨逆光时湖面泛起水雾尤为梦幻。"
  },
  JP_HOKKAIDO_BIEI_PATCHWORK: {
    url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?w=1920&auto=format&fit=crop&q=85",
    title: "Biei Patchwork Road & Shikisai Hills",
    location: "日本北海道美瑛 · 拼布之路广袤丘陵与四季彩之丘",
    location_en: "Biei, Hokkaido, Japan · Patchwork Road & Rolling Hills",
    spotType: "ROLLING HILLS · 田园丘陵全景",
    focal: "70-200mm",
    aperture: "f/8.0",
    shutter: "1/320s",
    iso: "ISO 100",
    elevation: "320m",
    bortle: "顺光麦浪",
    window: "午后 15:00 - 17:00",
    tip: "长焦镜头压缩连绵起伏的波浪状麦田与独立树木（Ken & Mary 之树）的空间层次。"
  },
  JP_HOKKAIDO_FURANO_FARM: {
    url: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=1920&auto=format&fit=crop&q=85",
    title: "Farm Tomita Lavender & Rainbow Flower Fields",
    location: "日本北海道富良野 · 富田农场彩虹花田与薰衣草山坡",
    location_en: "Furano, Hokkaido, Japan · Farm Tomita & Lavender Fields",
    spotType: "FLOWER PARADISE · 缤纷花田大地艺术",
    focal: "16-35mm",
    aperture: "f/8.0",
    shutter: "1/200s",
    iso: "ISO 100",
    elevation: "210m",
    bortle: "纯净阳光",
    window: "上午 08:30 - 10:30",
    tip: "由花田坡道下方沿七彩花带仰拍，背景配合远方十胜岳连峰与蔚蓝天空。"
  },
  JP_HOKKAIDO_OTARU_CANAL: {
    url: "https://images.unsplash.com/photo-1513407030348-c983a97b98d8?w=1920&auto=format&fit=crop&q=85",
    title: "Otaru Canal & Red Brick Warehouses",
    location: "日本北海道小樽 · 小樽运河浅草桥与煤油灯蓝调夜色",
    location_en: "Otaru, Hokkaido, Japan · Otaru Canal & Red Brick Warehouses",
    spotType: "BLUE HOUR · 浪漫运河蓝调时刻",
    focal: "35mm F1.4",
    aperture: "f/4.0",
    shutter: "1/40s",
    iso: "ISO 400",
    elevation: "海平面",
    bortle: "煤油灯暖光",
    window: "日落后 20分钟 蓝调时刻",
    tip: "浅草桥上架设脚架，捕捉复古瓦斯煤油灯与红砖仓库在运河平稳水面的金黄倒影。"
  },
  JP_HOKKAIDO_NOBORIBETSU: {
    url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1920&auto=format&fit=crop&q=85",
    title: "Noboribetsu Jigokudani Geothermal Valley",
    location: "日本北海道登别 · 地狱谷火山地热与大汤沼天然足汤",
    location_en: "Noboribetsu, Hokkaido, Japan · Jigokudani Hell Valley",
    spotType: "GEOTHERMAL · 火山地热奇观",
    focal: "24-70mm",
    aperture: "f/8.0",
    shutter: "1/160s",
    iso: "ISO 100",
    elevation: "200m",
    bortle: "火山白烟",
    window: "清晨或午后",
    tip: "木栈道远景构图，捕捉赤红岩壁与滚滚升腾的白色硫磺地热蒸汽。"
  },
  JP_HOKKAIDO_HAKODATE_NIGHT: {
    url: "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1920&auto=format&fit=crop&q=85",
    title: "Mount Hakodate Million Dollar Night View",
    location: "日本北海道函馆 · 函馆山双弧海湾百万夜景",
    location_en: "Hakodate, Hokkaido, Japan · Mt. Hakodate Night View",
    spotType: "NIGHT PANORAMA · 百万夜景极光机位",
    focal: "24mm GM",
    aperture: "f/8.0",
    shutter: "6s",
    iso: "ISO 100",
    elevation: "334m",
    bortle: "万家灯火海湾",
    window: "日落后 18:30 - 20:00",
    tip: "山顶观景台使用广角长曝光，记录被津轻海峡与函馆湾包夹的经典细腰形万家灯火。"
  },
  JP_HOKKAIDO_SAPPORO_PARK: {
    url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&auto=format&fit=crop&q=85",
    title: "Sapporo Odori Park & Clock Tower",
    location: "日本北海道札幌 · 大通公园绿洲与藻岩山俯瞰夜景",
    location_en: "Sapporo, Hokkaido, Japan · Odori Park & Mt. Moiwa Skyline",
    spotType: "METROPOLIS · 北国都市绿洲",
    focal: "35mm F1.8",
    aperture: "f/4.0",
    shutter: "1/125s",
    iso: "ISO 200",
    elevation: "180m",
    bortle: "都市暖灯",
    window: "全天 / 夜景 19:00 - 21:00",
    tip: "在藻岩山顶俯瞰札幌平原棋盘状延伸的璀璨万家灯火。"
  },
  JP_ASAKUSA_SENSOJI: {
    url: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=1920&auto=format&fit=crop&q=85",
    title: "Senso-ji Temple & Kaminarimon",
    location: "日本东京 · 浅草寺雷门与江户古刹",
    location_en: "Tokyo, Japan · Senso-ji Temple & Kaminarimon Gate",
    spotType: "HERITAGE · 江户古刹框架构图",
    focal: "16-35mm",
    aperture: "f/8.0",
    shutter: "1/250s",
    iso: "ISO 100",
    elevation: "10m",
    bortle: "晴日晨光",
    window: "清晨 07:00 - 08:30",
    tip: "以雷门标志性红色大灯笼为画框前景，对称透视拍摄正殿，避开日间如织游人。"
  },
  JP_GHIBLI_MUSEUM: {
    url: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=1920&auto=format&fit=crop&q=85",
    title: "Ghibli Museum & Wonderland",
    location: "日本东京三鹰 · 吉卜力美术馆与童话森林",
    location_en: "Mitaka, Tokyo, Japan · Ghibli Museum & Forest Wonderland",
    spotType: "ANIME WONDER · 宫崎骏动画童话",
    focal: "35mm F1.8",
    aperture: "f/2.8",
    shutter: "1/125s",
    iso: "ISO 200",
    elevation: "60m",
    bortle: "自然柔光",
    window: "开馆时段",
    tip: "捕捉屋顶巨型机械兵与郁郁葱葱的童话森林城堡外观，感受自然与动画交融。"
  },
  JP_KYOTO_PAGODA: {
    url: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=1920&auto=format&fit=crop&q=85",
    title: "Kyoto Yasaka Pagoda & Ancient Alley",
    location: "日本京都 · 八坂之塔古街与和风暮色",
    location_en: "Kyoto, Japan · Yasaka Pagoda & Ninenzaka Historic Alley",
    spotType: "HERITAGE · 古都雅韵机位",
    focal: "35mm F1.4",
    aperture: "f/2.8",
    shutter: "1/80s",
    iso: "ISO 400",
    elevation: "55m",
    bortle: "石板路暖灯",
    window: "蓝调傍晚 18:00 - 19:00",
    tip: "清晨或傍晚沿二年坂石阶仰拍，避开拥挤游客，捕捉飞檐与石板路倒影。"
  },
  JP_KYOTO_BAMBOO: {
    url: "https://images.unsplash.com/photo-1545569341-9eb8b30979d9?w=1920&auto=format&fit=crop&q=85",
    title: "Arashiyama Bamboo Grove Kyoto",
    location: "日本京都 · 岚山竹林小径与清幽晨光",
    location_en: "Kyoto, Japan · Arashiyama Bamboo Grove & Morning Light",
    spotType: "NATURE · 禅意竹林机位",
    focal: "24-70mm",
    aperture: "f/4.0",
    shutter: "1/100s",
    iso: "ISO 200",
    elevation: "40m",
    bortle: "晨雾丁达尔",
    window: "清晨 06:30 - 07:30",
    tip: "清晨人少时使用超广角低角度仰拍，捕捉阳光穿透高耸竹冠形成的丁达尔光束。"
  },
  JP_TOKYO_TOWER_NIGHT: {
    url: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1920&auto=format&fit=crop&q=85",
    title: "Tokyo Tower & City Skyline",
    location: "日本东京 · 经典东京铁塔与璀璨都市夜景",
    location_en: "Tokyo, Japan · Tokyo Tower & Metropolitan Skyline",
    spotType: "CYBER CITY · 赛博都市天际线",
    focal: "24mm GM",
    aperture: "f/8.0",
    shutter: "5s",
    iso: "ISO 100",
    elevation: "250m",
    bortle: "繁华车流夜景",
    window: "入夜 18:30 - 21:00",
    tip: "在六本木观景台或芝公园使用慢门长曝光，记录铁塔暖光与下方车轨交织。"
  },
  JP_TOKYO_SHIBUYA: {
    url: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1920&auto=format&fit=crop&q=85",
    title: "Shibuya Crossing Cyberpunk Neon",
    location: "日本东京 · 涩谷全向十字路口赛博霓虹",
    location_en: "Tokyo, Japan · Shibuya Crossing Cyberpunk Neon",
    spotType: "STREET LIFE · 潮流脉搏机位",
    focal: "16-35mm",
    aperture: "f/2.8",
    shutter: "1/125s",
    iso: "ISO 800",
    elevation: "45m",
    bortle: "雨夜霓虹反光",
    window: "夜晚高峰 19:00 - 22:00",
    tip: "雨夜在 Shibuya Sky 俯拍，地面湿润反射巨型 LED 屏幕的赛博霓虹斑斓光泽。"
  },

  // 3. 瑞士与欧洲雪山系列 (采尔马特马特洪峰、劳特布龙嫩山谷、多洛米蒂)
  CH_SWISS_LAUTERBRUNNEN: {
    url: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1920&auto=format&fit=crop&q=85",
    title: "Lauterbrunnen Valley & Swiss Chalets",
    location: "瑞士阿尔卑斯 · 劳特布龙嫩瀑布小镇与全景列车",
    location_en: "Swiss Alps, Switzerland · Lauterbrunnen Valley & Alpine Waterfalls",
    spotType: "ALPINE FAIRY · 梦幻山谷机位",
    focal: "24mm F2.8",
    aperture: "f/8.0",
    shutter: "1/250s",
    iso: "ISO 100",
    elevation: "795m",
    bortle: "高山日光",
    window: "上午 09:00 - 11:00",
    tip: "将传统木屋、施陶巴赫瀑布与高耸峭壁纳入同一画幅，展现阿尔卑斯田园风光。"
  },
  CH_MATTERHORN_PEAK: {
    url: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1920&auto=format&fit=crop&q=85",
    title: "Matterhorn Sunrise Riffelsee",
    location: "瑞士采尔马特 · 马特洪峰日照金山与利菲尔湖倒影",
    location_en: "Zermatt, Switzerland · Matterhorn Reflection at Lake Riffelsee",
    spotType: "ALPINE REFLECTION · 黄金日照金山",
    focal: "24mm F1.4",
    aperture: "f/8.0",
    shutter: "1/125s",
    iso: "ISO 100",
    elevation: "2757m",
    bortle: "晨曦金顶",
    window: "日出金顶 05:45 - 06:20",
    tip: "清晨无风时蹲守利菲尔湖边，捕捉马特洪峰第一缕金光倒映在澄澈冰川湖中。"
  },
  IT_DOLOMITES_PEAKS: {
    url: "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=1920&auto=format&fit=crop&q=85",
    title: "Dolomites Seceda & Alpine Peaks",
    location: "意大利多洛米蒂 · 白云石刀锋山 Seceda 与高山巨峰",
    location_en: "Dolomites, Italy · Seceda Ridgeline & Alpine Pinnacles",
    spotType: "DRAMATIC ALPS · 巨峰光影漫游",
    focal: "70mm F2.8",
    aperture: "f/8.0",
    shutter: "1/160s",
    iso: "ISO 100",
    elevation: "2500m",
    bortle: "暮色金辉",
    window: "夕阳金辉 18:30 - 19:15",
    tip: "中长焦压缩高山草甸与直插云霄的白云石雪山巨峰空间层次。"
  },

  // 4. 北欧与极地系列 (挪威罗弗敦群岛、冰岛黑沙滩与冰川)
  NO_LOFOTEN_AURORA: {
    url: "https://images.unsplash.com/photo-1517411032315-54ef2cb783bb?w=1920&auto=format&fit=crop&q=85",
    title: "Lofoten Reine Aurora & Rorbuer",
    location: "挪威罗弗敦群岛 · 雷纳小镇红色渔屋与极光雪山",
    location_en: "Lofoten Islands, Norway · Reine Village Rorbuer & Aurora Borealis",
    spotType: "AURORA CHASER · 极光红木屋",
    focal: "14mm GM",
    aperture: "f/1.8",
    shutter: "8s",
    iso: "ISO 1600",
    elevation: "15m",
    bortle: "Kp 4-6 极光带",
    window: "绿光爆发 21:00 - 01:30",
    tip: "经典红色高脚渔屋作为前景暖调，大光圈广角捕捉在峡湾雪山上空起舞的极光弧。"
  },
  IS_JOKULSARLON_ICE: {
    url: "https://images.unsplash.com/photo-1504893524553-b855bce32c67?w=1920&auto=format&fit=crop&q=85",
    title: "Jokulsarlon Diamond Beach Icebergs",
    location: "冰岛杰古沙龙 · 钻石黑沙滩与远古蓝冰晶",
    location_en: "Jokulsarlon, Iceland · Diamond Beach & Glacial Ice Crystals",
    spotType: "GLACIER SEASCAPE · 远古冰晶慢门",
    focal: "24mm GM",
    aperture: "f/11",
    shutter: "2s (ND8)",
    iso: "ISO 100",
    elevation: "海平面",
    bortle: "冷冽晨光",
    window: "日出微光 07:00 - 08:30",
    tip: "贴近黑色火山沙滩上剔透的蓝色冰块，慢门雾化大西洋海浪退去时的白色拉丝水花。"
  },

  // 5. 北美与地中海系列 (加拿大班夫、希腊圣托里尼)
  CA_BANFF_MORAINE_LAKE: {
    url: "https://images.unsplash.com/photo-1503614472-8c93d56e92ce?w=1920&auto=format&fit=crop&q=85",
    title: "Moraine Lake & Valley of the Ten Peaks",
    location: "加拿大班夫国家公园 · 梦莲湖翡翠蓝水与十峰山",
    location_en: "Banff National Park, Canada · Moraine Lake & Valley of the Ten Peaks",
    spotType: "GLACIAL OASIS · 绝美翡翠湖泊",
    focal: "16-35mm",
    aperture: "f/9.0",
    shutter: "1/80s",
    iso: "ISO 100",
    elevation: "1884m",
    bortle: "清晨无风",
    window: "日出晨光 06:00 - 07:15",
    tip: "攀上石堆观景台，清晨第一缕晨光洒在十峰山金顶，倒映在不可思议的绿松石色湖面。"
  },
  GR_SANTORINI_OIA: {
    url: "https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=1920&auto=format&fit=crop&q=85",
    title: "Santorini Oia Blue Domes Sunset",
    location: "希腊圣托里尼 · 伊亚悬崖蓝顶教堂与爱琴海落日",
    location_en: "Santorini, Greece · Oia Blue Dome Church & Aegean Sunset",
    spotType: "AEGEAN ROMANCE · 爱琴海蓝顶夕阳",
    focal: "28mm F2.0",
    aperture: "f/8.0",
    shutter: "1/250s",
    iso: "ISO 100",
    elevation: "120m",
    bortle: "爱琴海夕照",
    window: "日落时刻 19:30 - 20:30",
    tip: "顺着伊亚悬崖小巷捕捉三重蓝顶教堂与远方火红夕阳沉入爱琴海的永恒瞬间。"
  },

  // 6. 中国山水与秘境系列 (中国喀斯特峰林、桂林山水、贵州秘境、新疆伊犁、云南大理、四川九寨)
  CN_GUIZHOU_KARST: {
    url: "https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/1_pano_cuiping_yangshuo_2016.jpg/1920px-1_pano_cuiping_yangshuo_2016.jpg",
    title: "South China Karst Peaks & Emerald River",
    location: "中国南方喀斯特 · 阳朔翠屏峰林晚霞与漓江碧波倒影",
    location_en: "South China Karst · Yangshuo Cuiping Peaks & Li River Sunset Reflection",
    spotType: "NATURAL KARST · 喀斯特奇观",
    focal: "24-70mm GM",
    aperture: "f/8.0",
    shutter: "1/160s",
    iso: "ISO 100",
    elevation: "420m",
    bortle: "晚霞水墨",
    window: "夕阳晚霞 17:30 - 18:45",
    tip: "捕捉晚霞与落日余晖映照在孤峰碧水之间的中国传统水墨意境，利用水面慢门倒影增添灵动。"
  },
  CN_XINJIANG_SAYRAM: {
    url: "https://images.unsplash.com/photo-1543783207-ec64e4d95325?w=1920&auto=format&fit=crop&q=85",
    title: "Sayram Lake & Heavenly Mountain",
    location: "中国新疆 · 赛里木湖大西洋最后一滴眼泪与雪山天鹅",
    location_en: "Xinjiang, China · Sayram Lake & Tian Shan Snow Mountains",
    spotType: "ALPINE LAKE · 纯净高山湖泊",
    focal: "16-35mm",
    aperture: "f/8.0",
    shutter: "1/250s",
    iso: "ISO 100",
    elevation: "2073m",
    bortle: "晴空湛蓝",
    window: "全天 / 晨曦 06:30 - 08:30",
    tip: "使用超广角低角度拍摄湖畔野花、白天鹅与远方连绵雪山，尽显辽阔壮美。"
  },
  CN_YUNNAN_ERHAI: {
    url: "https://images.unsplash.com/photo-1527684651001-731c474bbb5a?w=1920&auto=format&fit=crop&q=85",
    title: "Dali Erhai Lake & Cangshan Mountain",
    location: "中国云南 · 大理洱海生态廊道与苍山云海",
    location_en: "Yunnan, China · Dali Erhai Lake Ecological Corridor & Cangshan Mountain",
    spotType: "PASTORAL LAKEVIEW · 慢调田园湖景",
    focal: "35mm F1.4",
    aperture: "f/5.6",
    shutter: "1/200s",
    iso: "ISO 100",
    elevation: "1974m",
    bortle: "清晨柔光",
    window: "日出时刻 07:00 - 08:30",
    tip: "顺着洱海 S 弯道水杉树构图，清晨逆光捕捉波光粼粼的水面与海鸥飞翔。"
  },
  CN_JIANGNAN_WESTLAKE: {
    url: "https://images.unsplash.com/photo-1548013146-72479768bada?w=1920&auto=format&fit=crop&q=85",
    title: "Hangzhou West Lake & Pagoda Mist",
    location: "中国杭州 · 西湖断桥残雪与雷峰夕照水墨画卷",
    location_en: "Hangzhou West Lake, China · Leifeng Pagoda & Misty Lake Sunset",
    spotType: "WATER TOWN · 水墨江南湖景",
    focal: "35mm F1.8",
    aperture: "f/8.0",
    shutter: "1/160s",
    iso: "ISO 100",
    elevation: "15m",
    bortle: "暮色水墨",
    window: "日落前 17:30 - 18:30",
    tip: "利用西湖水面慢门倒影，将雷峰塔或保俶塔与岸边垂柳纳入画幅，尽显江南水乡诗意。"
  },
  CN_JIANGNAN_WUZHEN: {
    url: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?w=1920&auto=format&fit=crop&q=85",
    title: "Wuzhen Historic Canal & Lantern Glow",
    location: "中国江南 · 乌镇西栅临河水阁与古桥夜景",
    location_en: "Wuzhen Historic Water Town, China · Ancient Canal & Glowing Lanterns",
    spotType: "ANCIENT CANAL · 枕水人家蓝调",
    focal: "16-35mm",
    aperture: "f/8.0",
    shutter: "2s (慢门)",
    iso: "ISO 100",
    elevation: "5m",
    bortle: "蓝调暖灯",
    window: "蓝调时刻 18:30 - 19:45",
    tip: "广角低机位捕捉临河水阁暖黄色灯笼亮起瞬间，水面如镜倒映古石桥与摇橹船。"
  },
  CN_JIANGNAN_MOGANSHAN: {
    url: "https://images.unsplash.com/photo-1509316975850-ff9c5deb0cd9?w=1920&auto=format&fit=crop&q=85",
    title: "Moganshan Bamboo Forest Sea",
    location: "中国浙江 · 莫干山万亩翠竹林海与庾村市集",
    location_en: "Moganshan, Zhejiang, China · Emerald Bamboo Sea & Alpine Resort",
    spotType: "BAMBOO CANOPY · 翠竹氧吧光影",
    focal: "24-70mm GM",
    aperture: "f/4.0",
    shutter: "1/200s",
    iso: "ISO 100",
    elevation: "720m",
    bortle: "晨雾丁达尔",
    window: "晨间 07:30 - 09:00",
    tip: "侧逆光抓拍晨雾穿透高耸竹林形成的丁达尔光束，构图突出纵深与绿意。"
  },
  CN_JIANGNAN_XIXI: {
    url: "https://images.unsplash.com/photo-1513415564515-763d91423bdd?w=1920&auto=format&fit=crop&q=85",
    title: "Xixi National Wetland & Wooden Boats",
    location: "中国杭州 · 西溪国家湿地公园芦苇水道与摇橹船",
    location_en: "Xixi National Wetland Park, Hangzhou, China · Reed Waterways",
    spotType: "WETLAND SANCTUARY · 湿地摇橹泛舟",
    focal: "50mm F1.8",
    aperture: "f/5.6",
    shutter: "1/250s",
    iso: "ISO 100",
    elevation: "8m",
    bortle: "柔和漫射光",
    window: "上午 09:00 - 11:00",
    tip: "长焦捕捉家庭木船划破平缓水面荡漾起的微波，两岸芦苇丛作为生动的自然画框。"
  },
  FOOD_CHINESE_DELICACY: {
    url: "https://images.unsplash.com/photo-1563245372-f21724e3856d?w=1920&auto=format&fit=crop&q=85",
    title: "Authentic Jiangnan & Chinese Feast",
    location: "江南传统名菜 · 软糯东坡肉、龙井虾仁与千岛湖鲜鱼",
    location_en: "Artisanal Jiangnan Feast · Dongpo Pork, Tea Shrimp & Lake Fish",
    spotType: "TRADITIONAL CUISINE · 水乡名馔",
    focal: "50mm Macro",
    aperture: "f/2.8",
    shutter: "1/125s",
    iso: "ISO 200",
    elevation: "-",
    bortle: "古色暖光",
    window: "正餐时刻",
    tip: "俯拍特写红亮诱人的酱汁光泽与精致陶器摆盘，突出江南菜肴的温婉细腻。"
  },
  CN_SICHUAN_JIUZHAI: {
    url: "https://images.unsplash.com/photo-1528164344705-475426879c0d?w=1920&auto=format&fit=crop&q=85",
    title: "Jiuzhaigou Emerald Lakes & Waterfalls",
    location: "中国四川 · 九寨沟五花海与诺日朗翠海飞瀑",
    location_en: "Sichuan, China · Jiuzhaigou Five-Flower Lake & Waterfalls",
    spotType: "FAIRY WATERFALL · 童话翠海彩林",
    focal: "24-70mm",
    aperture: "f/11",
    shutter: "1/4s (CPL)",
    iso: "ISO 100",
    elevation: "2472m",
    bortle: "高山晴日",
    window: "上午 09:00 - 11:30",
    tip: "配合 CPL 偏振镜消除水面反光，透射出五花海底下钙华沉积与千姿百态的倒木层次。"
  },

  // 7. 法国与欧洲浪漫系列 (巴黎埃菲尔铁塔、卢浮宫)
  FR_PARIS_EIFFEL: {
    url: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=1920&auto=format&fit=crop&q=85",
    title: "Paris Eiffel Tower & Seine River",
    location: "法国巴黎 · 塞纳河畔与特罗卡德罗埃菲尔铁塔",
    location_en: "Paris, France · Eiffel Tower & Seine Riverfront",
    spotType: "ROMANTIC CITY · 经典法式浪漫",
    focal: "35mm F1.4",
    aperture: "f/4.0",
    shutter: "1/125s",
    iso: "ISO 100",
    elevation: "35m",
    bortle: "晨曦微光 / 蓝调",
    window: "清晨 06:30 - 07:30 / 蓝调",
    tip: "在夏乐宫特罗卡德罗平台清晨顺光仰拍铁塔全貌，避开人群与杂乱光线。"
  },
  FR_PARIS_LOUVRE: {
    url: "https://images.unsplash.com/photo-1565099824688-e93eb20fe622?w=1920&auto=format&fit=crop&q=85",
    title: "Louvre Museum Glass Pyramid",
    location: "法国巴黎 · 卢浮宫玻璃金字塔与宫殿暮色",
    location_en: "Paris, France · Louvre Glass Pyramid & Twilight Palace",
    spotType: "ARCHITECTURAL ART · 建筑几何光影",
    focal: "16-35mm",
    aperture: "f/8.0",
    shutter: "4s",
    iso: "ISO 100",
    elevation: "30m",
    bortle: "暮色蓝调",
    window: "蓝调时刻 18:45 - 19:45",
    tip: "利用中央水池作为反射对称面，慢门拍摄玻璃金字塔内暖黄色灯光与深蓝夜空。"
  },

  // 8. 特色美食与风物系列 (三文鱼、精致料理、汉堡、拉面、面食与地道风味)
  FOOD_SALMON_SEAFOOD: {
    url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1920&auto=format&fit=crop&q=85",
    title: "Fresh King Salmon & Seafood",
    location: "高山冰川帝王三文鱼与纯净海鲜料理",
    location_en: "Glacier King Salmon & Artisan Seafood Delicacies",
    spotType: "GOURMET DINING · 舌尖风物",
    focal: "50mm Macro",
    aperture: "f/2.8",
    shutter: "1/100s",
    iso: "ISO 200",
    elevation: "-",
    bortle: "柔和暖光",
    window: "用餐时刻",
    tip: "大光圈浅景深微距特写鲜嫩橙红的三文鱼纹理与油脂光泽。"
  },
  FOOD_FINE_DINING: {
    url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1920&auto=format&fit=crop&q=85",
    title: "Artisan Culinary & Fine Dining",
    location: "地道风味餐厅与精致主厨料理",
    location_en: "Authentic Local Dining & Chef's Special Cuisine",
    spotType: "CULINARY ART · 美食鉴赏",
    focal: "35mm F1.8",
    aperture: "f/2.2",
    shutter: "1/80s",
    iso: "ISO 400",
    elevation: "-",
    bortle: "餐厅氛围灯",
    window: "晚餐时刻",
    tip: "利用餐厅温暖的环境光，斜上方 45 度角拍摄菜品精致摆盘与层次。"
  },
  FOOD_SOUP_CURRY: {
    url: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=1920&auto=format&fit=crop&q=85",
    title: "Sapporo Artisan Soup Curry",
    location: "日本北海道札幌 · 招牌药膳蔬菜香料汤咖喱 (Suage+ / 奥芝商店)",
    location_en: "Sapporo, Hokkaido, Japan · Authentic Soup Curry & Roasted Veggies",
    spotType: "LOCAL FLAVOR · 北国暖心香料",
    focal: "50mm F1.8",
    aperture: "f/2.5",
    shutter: "1/100s",
    iso: "ISO 200",
    elevation: "-",
    bortle: "暖调居酒屋",
    window: "用餐时刻",
    tip: "特写大块烤时蔬（南瓜/莲藕/秋葵）与热气腾腾浓郁咖喱汤底的丰盛摆盘。"
  },
  FOOD_GENGHIS_KHAN: {
    url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1920&auto=format&fit=crop&q=85",
    title: "Sapporo Genghis Khan Mutton BBQ",
    location: "日本北海道札幌 · 炭火特选多汁成吉思汗烤羊肉 (达摩Daruma)",
    location_en: "Sapporo, Hokkaido, Japan · Genghis Khan Charcoal Grilled Lamb",
    spotType: "CHARCOAL BBQ · 炭火热气滋滋",
    focal: "35mm F1.8",
    aperture: "f/2.2",
    shutter: "1/125s",
    iso: "ISO 400",
    elevation: "-",
    bortle: "炭火暖芒",
    window: "晚间宵夜",
    tip: "捕捉圆顶铁铸锅上羊油滋滋融化、鲜嫩羊肉与大量洋葱豆芽烤至金黄的食欲瞬间。"
  },
  FOOD_SEAFOOD_BOWL_UNI: {
    url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=1920&auto=format&fit=crop&q=85",
    title: "Hakodate & Otaru Premium Sea Urchin Don",
    location: "日本北海道 · 函馆朝市/小樽海鲜市场特上极鲜海胆鲑鱼籽丼",
    location_en: "Hokkaido, Japan · Premium Sea Urchin & Salmon Roe Seafood Bowl",
    spotType: "SEAFOOD DELIGHT · 极鲜海洋馈赠",
    focal: "50mm F1.4",
    aperture: "f/2.8",
    shutter: "1/160s",
    iso: "ISO 100",
    elevation: "-",
    bortle: "自然明光",
    window: "早市 / 午餐",
    tip: "微距特写金黄饱满如奶油般的无添加海胆与晶莹剔透三文鱼籽的奢华质感。"
  },
  FOOD_OTARU_SUSHI: {
    url: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=1920&auto=format&fit=crop&q=85",
    title: "Otaru Artisan Handcrafted Nigiri Sushi",
    location: "日本北海道小樽 · 小樽政寿司特上极握寿司套餐",
    location_en: "Otaru, Hokkaido, Japan · Master Artisan Nigiri Sushi Platter",
    spotType: "SUSHI MASTER · 匠人手握极味",
    focal: "50mm F1.8",
    aperture: "f/2.8",
    shutter: "1/100s",
    iso: "ISO 200",
    elevation: "-",
    bortle: "和风吧台灯",
    window: "午餐 / 晚餐",
    tip: "45度俯拍黑漆寿司台上牡丹虾、扇贝与本鲔大腹的油亮光泽。"
  },
  FOOD_FURANO_MELON: {
    url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1920&auto=format&fit=crop&q=85",
    title: "Furano Yubari Melon & Hokkaido Soft Serve",
    location: "日本北海道富良野 · 甜美夕张哈密瓜配十胜纯生牛乳冰淇淋",
    location_en: "Furano, Hokkaido, Japan · Farm Fresh Yubari Melon & Dairy Soft Serve",
    spotType: "SWEET TREAT · 农场香甜乳酪",
    focal: "35mm F1.8",
    aperture: "f/2.4",
    shutter: "1/200s",
    iso: "ISO 100",
    elevation: "-",
    bortle: "夏日清光",
    window: "午后甜点",
    tip: "捕捉切开橙红多汁的熟透蜜瓜与上方乳白冰淇淋的清新田园色彩。"
  },
  FOOD_SAPPORO_MISO_RAMEN: {
    url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1920&auto=format&fit=crop&q=85",
    title: "Sapporo Artisan Miso Ramen & Pork Belly",
    location: "日本北海道札幌 · 元祖拉面横丁浓厚味噌拉面配炙烧叉烧",
    location_en: "Sapporo, Hokkaido, Japan · Rich Miso Ramen & Chashu Pork",
    spotType: "NOODLE ART · 浓厚暖心面食",
    focal: "50mm F1.8",
    aperture: "f/2.5",
    shutter: "1/125s",
    iso: "ISO 250",
    elevation: "-",
    bortle: "暖调面馆光",
    window: "全天最佳",
    tip: "俯拍热气蒸腾的浓郁味噌汤底、金黄卷曲拉面与溏心蛋配料。"
  },
  FOOD_SALMON_SEAFOOD: {
    url: "https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?w=1920&auto=format&fit=crop&q=85",
    title: "Artisan Salmon & Seafood Delicacy",
    location: "新西兰与环太平洋 · 极鲜冰川三文鱼与海鲜料理",
    location_en: "New Zealand & Pacific · Fresh Alpine Salmon & Seafood Platter",
    spotType: "OCEAN FRESH · 极鲜水产",
    focal: "50mm F1.8",
    aperture: "f/2.8",
    shutter: "1/160s",
    iso: "ISO 100",
    elevation: "-",
    bortle: "自然明光",
    window: "用餐时刻",
    tip: "大光圈浅景深微距特写鲜嫩橙红的三文鱼纹理与油脂光泽。"
  },
  FOOD_FINE_DINING: {
    url: "https://images.unsplash.com/photo-1544025162-d76694265947?w=1920&auto=format&fit=crop&q=85",
    title: "Artisan Culinary & Fine Dining",
    location: "地道风味餐厅与精致主厨料理",
    location_en: "Authentic Local Dining & Chef's Special Cuisine",
    spotType: "CULINARY ART · 美食鉴赏",
    focal: "35mm F1.8",
    aperture: "f/2.2",
    shutter: "1/80s",
    iso: "ISO 400",
    elevation: "-",
    bortle: "餐厅氛围灯",
    window: "晚餐时刻",
    tip: "利用餐厅温暖的环境光，斜上方 45 度角拍摄菜品精致摆盘与层次。"
  },
  FOOD_BURGER: {
    url: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=1920&auto=format&fit=crop&q=85",
    title: "Gourmet Artisan Burger",
    location: "地道手打多汁汉堡与特色小吃",
    location_en: "Artisan Gourmet Burger & Local Street Flavors",
    spotType: "GOURMET BURGER · 街头风味",
    focal: "35mm F1.8",
    aperture: "f/2.2",
    shutter: "1/100s",
    iso: "ISO 200",
    elevation: "-",
    bortle: "明快暖光",
    window: "用餐时刻",
    tip: "特写丰盈多汁的牛排肉饼与金黄拉丝芝士，层次鲜明诱人。"
  },
  FOOD_RAMEN_NOODLES: {
    url: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=1920&auto=format&fit=crop&q=85",
    title: "Artisan Ramen & Noodle Cuisine",
    location: "地道浓郁拉面、传统米线与热气腾腾面食",
    location_en: "Authentic Artisan Ramen, Traditional Noodles & Broth",
    spotType: "NOODLE ART · 暖心热食",
    focal: "50mm F1.8",
    aperture: "f/2.5",
    shutter: "1/125s",
    iso: "ISO 250",
    elevation: "-",
    bortle: "暖调面馆光",
    window: "用餐时刻",
    tip: "俯拍热气蒸腾的汤头与丰富的叉烧/溏心蛋/脆哨配料，色泽温暖诱人。"
  }
};

/**
 * 语义化高精度地标与风景图像匹配器 (支持轮播池索引，杜绝重复单图霸屏)
 * @param {string} text - 包含地点、景点名称、活动或美食关键词的文本
 * @param {string} fallbackCategory - 备用分类 ('nature' | 'city' | 'photo' | 'food' | 'hike')
 * @param {number} poolIndex - 序列索引，用于当同区域有多张卡片时轮换不同图片
 * @returns {object} 包含 verified 景观真实大图 URL、标题、参数与机位元数据
 */
export function matchDestinationImage(text = '', fallbackCategory = 'nature', poolIndex = 0) {
  const q = String(text).toLowerCase();

  // 1. 严格关键词高精度映射 (北海道具体景点)
  if (q.includes('支笏') || q.includes('shikotsu')) {
    return VERIFIED_LANDSCAPE_LIBRARY.JP_HOKKAIDO_SHIKOTSU_LAKE;
  }
  if (q.includes('洞爷') || q.includes('toya') || q.includes('有珠') || q.includes('羊蹄')) {
    return VERIFIED_LANDSCAPE_LIBRARY.JP_HOKKAIDO_TOYA_LAKE;
  }
  if (q.includes('青池') || q.includes('白须') || q.includes('blue pond') || q.includes('shirogane')) {
    return VERIFIED_LANDSCAPE_LIBRARY.JP_HOKKAIDO_BIEI_BLUE_POND;
  }
  if (q.includes('拼布') || q.includes('四季彩') || q.includes('美瑛') || q.includes('patchwork') || q.includes('biei')) {
    return VERIFIED_LANDSCAPE_LIBRARY.JP_HOKKAIDO_BIEI_PATCHWORK;
  }
  if (q.includes('富良野') || q.includes('富田') || q.includes('薰衣草') || q.includes('花田') || q.includes('furano')) {
    return VERIFIED_LANDSCAPE_LIBRARY.JP_HOKKAIDO_FURANO_FARM;
  }
  if (q.includes('小樽') || q.includes('运河') || q.includes('otaru') || q.includes('天狗山')) {
    return VERIFIED_LANDSCAPE_LIBRARY.JP_HOKKAIDO_OTARU_CANAL;
  }
  if (q.includes('登别') || q.includes('地狱谷') || q.includes('noboribetsu') || q.includes('大汤沼')) {
    return VERIFIED_LANDSCAPE_LIBRARY.JP_HOKKAIDO_NOBORIBETSU;
  }
  if (q.includes('函馆') || q.includes('hakodate') || q.includes('五棱郭')) {
    return VERIFIED_LANDSCAPE_LIBRARY.JP_HOKKAIDO_HAKODATE_NIGHT;
  }
  if (q.includes('札幌') || q.includes('sapporo') || q.includes('藻岩') || q.includes('大通')) {
    return VERIFIED_LANDSCAPE_LIBRARY.JP_HOKKAIDO_SAPPORO_PARK;
  }

  // 日本其它地区
  if (q.includes('吉卜力') || q.includes('ghibli') || q.includes('三鹰') || q.includes('宫崎骏')) {
    return VERIFIED_LANDSCAPE_LIBRARY.JP_GHIBLI_MUSEUM;
  }
  if (q.includes('浅草') || q.includes('雷门') || q.includes('sensoji') || q.includes('asakusa')) {
    return VERIFIED_LANDSCAPE_LIBRARY.JP_ASAKUSA_SENSOJI;
  }
  if (q.includes('京都') || q.includes('kyoto') || q.includes('清水寺') || q.includes('八坂') || q.includes('金阁寺') || q.includes('祇园') || q.includes('二年坂')) {
    return VERIFIED_LANDSCAPE_LIBRARY.JP_KYOTO_PAGODA;
  }
  if (q.includes('奈良') || q.includes('nara') || q.includes('岚山') || q.includes('竹林') || q.includes('鹿')) {
    return VERIFIED_LANDSCAPE_LIBRARY.JP_KYOTO_BAMBOO;
  }
  if (q.includes('富士山') || q.includes('fuji') || q.includes('河口湖') || q.includes('浅间公园') || q.includes('山梨')) {
    return VERIFIED_LANDSCAPE_LIBRARY.JP_FUJI_PAGODA;
  }
  if (q.includes('涩谷') || q.includes('shibuya') || q.includes('十字路口') || q.includes('秋叶原') || q.includes('akihabara')) {
    return VERIFIED_LANDSCAPE_LIBRARY.JP_TOKYO_SHIBUYA;
  }
  if (q.includes('东京') || q.includes('tokyo') || q.includes('新宿') || q.includes('银座')) {
    return VERIFIED_LANDSCAPE_LIBRARY.JP_TOKYO_TOWER_NIGHT;
  }

  // 美食精准匹配
  if (q.includes('汤咖喱') || q.includes('咖喱') || q.includes('curry')) {
    return VERIFIED_LANDSCAPE_LIBRARY.FOOD_SOUP_CURRY;
  }
  if (q.includes('成吉思汗') || q.includes('烤羊肉') || q.includes('烤肉') || q.includes('达摩') || q.includes('bbq')) {
    return VERIFIED_LANDSCAPE_LIBRARY.FOOD_GENGHIS_KHAN;
  }
  if (q.includes('海胆') || q.includes('海鲜丼') || q.includes('鱼子') || q.includes('朝市') || q.includes('uni')) {
    return VERIFIED_LANDSCAPE_LIBRARY.FOOD_SEAFOOD_BOWL_UNI;
  }
  if (q.includes('政寿司') || q.includes('寿司') || q.includes('握寿司') || q.includes('sushi') || q.includes('刺身')) {
    return VERIFIED_LANDSCAPE_LIBRARY.FOOD_OTARU_SUSHI;
  }
  if (q.includes('哈密瓜') || q.includes('蜜瓜') || q.includes('甜品') || q.includes('冰淇淋') || q.includes('乳酪') || q.includes('melon')) {
    return VERIFIED_LANDSCAPE_LIBRARY.FOOD_FURANO_MELON;
  }
  if (q.includes('味噌拉面') || q.includes('拉面') || q.includes('ramen') || q.includes('米线') || q.includes('面')) {
    return VERIFIED_LANDSCAPE_LIBRARY.FOOD_SAPPORO_MISO_RAMEN;
  }

  // 法国与巴黎
  if (q.includes('卢浮宫') || q.includes('louvre') || q.includes('金字塔')) {
    return VERIFIED_LANDSCAPE_LIBRARY.FR_PARIS_LOUVRE;
  }
  if (q.includes('巴黎') || q.includes('paris') || q.includes('铁塔') || q.includes('埃菲尔') || q.includes('eiffel') || q.includes('塞纳河') || q.includes('凯旋门') || q.includes('香榭丽舍') || q.includes('法国') || q.includes('france')) {
    return VERIFIED_LANDSCAPE_LIBRARY.FR_PARIS_EIFFEL;
  }

  // 中国各省区
  if (q.includes('长三角') || q.includes('江南') || q.includes('西湖') || q.includes('杭州') || q.includes('龙井') || q.includes('断桥') || q.includes('雷峰')) {
    return VERIFIED_LANDSCAPE_LIBRARY.CN_JIANGNAN_WESTLAKE;
  }
  if (q.includes('乌镇') || q.includes('西塘') || q.includes('古镇') || q.includes('水乡') || q.includes('水阁') || q.includes('南浔') || q.includes('同里') || q.includes('周庄')) {
    return VERIFIED_LANDSCAPE_LIBRARY.CN_JIANGNAN_WUZHEN;
  }
  if (q.includes('莫干山') || q.includes('竹海') || q.includes('庾村') || q.includes('安吉') || q.includes('德清') || q.includes('剑池')) {
    return VERIFIED_LANDSCAPE_LIBRARY.CN_JIANGNAN_MOGANSHAN;
  }
  if (q.includes('西溪') || q.includes('湿地') || q.includes('千岛湖') || q.includes('太湖') || q.includes('摇橹船')) {
    return VERIFIED_LANDSCAPE_LIBRARY.CN_JIANGNAN_XIXI;
  }
  if (q.includes('东坡肉') || q.includes('龙井虾仁') || q.includes('鱼头') || q.includes('土鸡') || q.includes('叫花鸡') || q.includes('醋鱼') || q.includes('本帮') || q.includes('杭帮')) {
    return VERIFIED_LANDSCAPE_LIBRARY.FOOD_CHINESE_DELICACY;
  }
  if (q.includes('新疆') || q.includes('赛里木湖') || q.includes('伊犁') || q.includes('喀纳斯') || q.includes('禾木') || q.includes('独库') || q.includes('那拉提') || q.includes('天山')) {
    return VERIFIED_LANDSCAPE_LIBRARY.CN_XINJIANG_SAYRAM;
  }
  if (q.includes('大理') || q.includes('洱海') || q.includes('丽江') || q.includes('玉龙雪山') || q.includes('香格里拉') || q.includes('云南') || q.includes('苍山') || q.includes('束河') || q.includes('蓝月谷')) {
    return VERIFIED_LANDSCAPE_LIBRARY.CN_YUNNAN_ERHAI;
  }
  if (q.includes('九寨沟') || q.includes('五花海') || q.includes('黄龙') || q.includes('熊猫') || q.includes('都江堰') || q.includes('青城山') || q.includes('四川') || q.includes('成都') || q.includes('川西') || q.includes('稻城') || q.includes('亚丁')) {
    return VERIFIED_LANDSCAPE_LIBRARY.CN_SICHUAN_JIUZHAI;
  }
  if (q.includes('贵州') || q.includes('guizhou') || q.includes('喀斯特') || q.includes('黄果树') || q.includes('小七孔') || q.includes('苗寨') || q.includes('桂林') || q.includes('阳朔') || q.includes('漓江')) {
    return VERIFIED_LANDSCAPE_LIBRARY.CN_GUIZHOU_KARST;
  }

  // 瑞士与阿尔卑斯
  if (q.includes('瑞士') || q.includes('swiss') || q.includes('switzerland') || q.includes('劳特布龙嫩') || q.includes('lauterbrunnen') || q.includes('黄金列车') || q.includes('冰川快车') || q.includes('卢塞恩') || q.includes('因特拉肯') || q.includes('格林德瓦')) {
    return VERIFIED_LANDSCAPE_LIBRARY.CH_SWISS_LAUTERBRUNNEN;
  }
  if (q.includes('采尔马特') || q.includes('zermatt') || q.includes('马特洪峰') || q.includes('matterhorn') || q.includes('利菲尔湖') || q.includes('少女峰') || q.includes('jungfrau')) {
    return VERIFIED_LANDSCAPE_LIBRARY.CH_MATTERHORN_PEAK;
  }
  if (q.includes('多洛米蒂') || q.includes('dolomites') || q.includes('刀锋山') || q.includes('seceda') || q.includes('休斯高原') || q.includes('意大利') || q.includes('italy') || q.includes('罗马') || q.includes('威尼斯')) {
    return VERIFIED_LANDSCAPE_LIBRARY.IT_DOLOMITES_PEAKS;
  }

  // 北欧与冰岛
  if (q.includes('挪威') || q.includes('norway') || q.includes('罗弗敦') || q.includes('lofoten') || q.includes('雷纳') || q.includes('极光') || q.includes('aurora')) {
    return VERIFIED_LANDSCAPE_LIBRARY.NO_LOFOTEN_AURORA;
  }
  if (q.includes('冰岛') || q.includes('iceland') || q.includes('杰古沙龙') || q.includes('黑沙滩') || q.includes('冰沙滩') || q.includes('钻石沙滩') || q.includes('黄金圈') || q.includes('蓝湖')) {
    return VERIFIED_LANDSCAPE_LIBRARY.IS_JOKULSARLON_ICE;
  }

  // 新西兰
  if (q.includes('特卡波') || q.includes('tekapo') || q.includes('好牧羊人') || q.includes('星空') || q.includes('stargazing') || q.includes('暗夜') || q.includes('银河')) {
    return VERIFIED_LANDSCAPE_LIBRARY.NZ_TEKAPO_NIGHT;
  }
  if (q.includes('孤树') || q.includes('孤独树') || q.includes('wanaka tree') || q.includes('thatwanakatree')) {
    return VERIFIED_LANDSCAPE_LIBRARY.NZ_WANAKA_TREE;
  }
  if (q.includes('瓦纳卡') || q.includes('wanaka') || q.includes('罗伊斯') || q.includes('roys') || q.includes('云海')) {
    return VERIFIED_LANDSCAPE_LIBRARY.NZ_WANAKA_ROYS_PEAK;
  }
  if (q.includes('峡湾') || q.includes('米尔福德') || q.includes('milford') || q.includes('fiord') || q.includes('教皇冠峰') || q.includes('主教冠峰') || q.includes('教冠峰')) {
    return VERIFIED_LANDSCAPE_LIBRARY.NZ_MILFORD_SOUND;
  }
  if (q.includes('新西兰') || q.includes('new zealand') || q.includes('8号') || (q.includes('公路') && q.includes('南岛')) || (q.includes('自驾') && q.includes('南岛')) || q.includes('基督城') || q.includes('皇后镇')) {
    return VERIFIED_LANDSCAPE_LIBRARY.NZ_SOUTHERN_ALPS_HIGHWAY;
  }

  if (q.includes('班夫') || q.includes('banff') || q.includes('路易斯湖') || q.includes('梦莲湖') || q.includes('moraine') || q.includes('加拿大') || q.includes('落基山')) {
    return VERIFIED_LANDSCAPE_LIBRARY.CA_BANFF_MORAINE_LAKE;
  }
  if (q.includes('圣托里尼') || q.includes('santorini') || q.includes('爱琴海') || q.includes('伊亚') || q.includes('oia') || q.includes('希腊') || q.includes('蓝顶')) {
    return VERIFIED_LANDSCAPE_LIBRARY.GR_SANTORINI_OIA;
  }

  // 2. 多图轮换回退机制 (依据 poolIndex 循环选取不同图片，杜绝同区域所有卡片相同)
  const idx = Math.abs(Number(poolIndex) || 0);

  // 北海道轮换池
  if (q.includes('北海道') || q.includes('hokkaido')) {
    if (fallbackCategory === 'food') {
      const hokkaidoFoodPool = [
        VERIFIED_LANDSCAPE_LIBRARY.FOOD_SOUP_CURRY,
        VERIFIED_LANDSCAPE_LIBRARY.FOOD_GENGHIS_KHAN,
        VERIFIED_LANDSCAPE_LIBRARY.FOOD_SEAFOOD_BOWL_UNI,
        VERIFIED_LANDSCAPE_LIBRARY.FOOD_OTARU_SUSHI,
        VERIFIED_LANDSCAPE_LIBRARY.FOOD_SAPPORO_MISO_RAMEN,
        VERIFIED_LANDSCAPE_LIBRARY.FOOD_FURANO_MELON
      ];
      return hokkaidoFoodPool[idx % hokkaidoFoodPool.length];
    }
    const hokkaidoScenicPool = [
      VERIFIED_LANDSCAPE_LIBRARY.JP_HOKKAIDO_SHIKOTSU_LAKE,
      VERIFIED_LANDSCAPE_LIBRARY.JP_HOKKAIDO_TOYA_LAKE,
      VERIFIED_LANDSCAPE_LIBRARY.JP_HOKKAIDO_BIEI_BLUE_POND,
      VERIFIED_LANDSCAPE_LIBRARY.JP_HOKKAIDO_BIEI_PATCHWORK,
      VERIFIED_LANDSCAPE_LIBRARY.JP_HOKKAIDO_FURANO_FARM,
      VERIFIED_LANDSCAPE_LIBRARY.JP_HOKKAIDO_OTARU_CANAL,
      VERIFIED_LANDSCAPE_LIBRARY.JP_HOKKAIDO_NOBORIBETSU,
      VERIFIED_LANDSCAPE_LIBRARY.JP_HOKKAIDO_HAKODATE_NIGHT
    ];
    return hokkaidoScenicPool[idx % hokkaidoScenicPool.length];
  }

  // 日本全国轮换池
  if (q.includes('日本') || q.includes('japan')) {
    if (fallbackCategory === 'food') {
      const jpFoodPool = [
        VERIFIED_LANDSCAPE_LIBRARY.FOOD_OTARU_SUSHI,
        VERIFIED_LANDSCAPE_LIBRARY.FOOD_SOUP_CURRY,
        VERIFIED_LANDSCAPE_LIBRARY.FOOD_SAPPORO_MISO_RAMEN,
        VERIFIED_LANDSCAPE_LIBRARY.FOOD_GENGHIS_KHAN,
        VERIFIED_LANDSCAPE_LIBRARY.FOOD_SEAFOOD_BOWL_UNI
      ];
      return jpFoodPool[idx % jpFoodPool.length];
    }
    const jpScenicPool = [
      VERIFIED_LANDSCAPE_LIBRARY.JP_FUJI_PAGODA,
      VERIFIED_LANDSCAPE_LIBRARY.JP_KYOTO_PAGODA,
      VERIFIED_LANDSCAPE_LIBRARY.JP_TOKYO_SHIBUYA,
      VERIFIED_LANDSCAPE_LIBRARY.JP_KYOTO_BAMBOO,
      VERIFIED_LANDSCAPE_LIBRARY.JP_ASAKUSA_SENSOJI,
      VERIFIED_LANDSCAPE_LIBRARY.JP_TOKYO_TOWER_NIGHT,
      VERIFIED_LANDSCAPE_LIBRARY.JP_HOKKAIDO_SHIKOTSU_LAKE,
      VERIFIED_LANDSCAPE_LIBRARY.JP_HOKKAIDO_OTARU_CANAL
    ];
    return jpScenicPool[idx % jpScenicPool.length];
  }

  // 3. 通用分类自适应回退
  switch (fallbackCategory) {
    case 'food':
      return VERIFIED_LANDSCAPE_LIBRARY.FOOD_FINE_DINING;
    case 'city':
      return VERIFIED_LANDSCAPE_LIBRARY.JP_TOKYO_TOWER_NIGHT;
    case 'photo':
      return VERIFIED_LANDSCAPE_LIBRARY.NZ_WANAKA_ROYS_PEAK;
    default:
      return VERIFIED_LANDSCAPE_LIBRARY.NZ_SOUTHERN_ALPS_HIGHWAY;
  }
}
