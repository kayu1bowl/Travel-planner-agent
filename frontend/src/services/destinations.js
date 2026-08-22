import { matchDestinationImage } from './imageMatcher';

export const DESTINATION_DATASETS = {
  newzealand: {
    zh: {
      tripTitle: "新西兰南岛 7 天绝美自驾与风光摄影之旅",
      tripSubtitle: "7 天行程 | 基督城 · 特卡波 · 库克山 · 瓦纳卡 · 皇后镇",
      motto: "追逐雪山冰川晨光，枕着特卡波璀璨星河入梦",
      summary: "贯穿特卡波湖、库克山、瓦纳卡与皇后镇的经典风光摄影与自驾路线，深度融合 DOC 官方暗夜星空与高山步道指南。",
      dailySchedules: {
        1: [
          { time: "09:30", activity: "基督城机场取车 & 补给采购", location: "基督城", details: "提四驱 SUV，超市采购户外高热量补给与高山自驾防寒物资" },
          { time: "13:00", activity: "SH8 景观公路自驾", location: "费尔利 ➔ 特卡波", details: "途径 Fairlie 烘焙工坊品尝荣获金奖的手工现烤热肉派" },
          { time: "16:30", activity: "特卡波湖畔度假屋入住", location: "特卡波湖", details: "入住湖畔木屋，漫步欣赏蒂芙尼蓝冰川湖景与雪山倒影" },
          { time: "22:00", activity: "好牧羊人教堂暗夜观星", location: "好牧羊人教堂", details: "国际暗夜保护区核心区，肉眼观赏南十字星与横跨苍穹的银河拱桥" }
        ],
        2: [
          { time: "09:00", activity: "约翰山天文台咖啡馆日出", location: "约翰山 (Mt John)", details: "360 度俯瞰特卡波湖全景，品尝高山特调 Flat White 小白咖啡" },
          { time: "12:30", activity: "普卡基湖高山三文鱼赏味", location: "普卡基湖畔", details: "品尝来自库克山纯净冰川融水滋养的极鲜三文鱼厚切刺身" },
          { time: "15:00", activity: "胡克谷冰川步道轻徒步", location: "库克山国家公园", details: "穿行三座标志性吊桥，直达终点万年冰川漂浮融湖" },
          { time: "19:30", activity: "赫米蒂奇雪山星空晚宴", location: "赫米蒂奇酒店", details: "远眺奥拉基库克山终年积雪顶峰，享用高山特色牛排晚餐" }
        ],
        3: [
          { time: "08:30", activity: "塔斯曼冰川直升机漫游", location: "塔斯曼冰川", details: "搭乘观光直升机俯瞰冰瀑裂隙，体验蓝冰健行" },
          { time: "13:00", activity: "林迪斯隘口高山公路自驾", location: "Lindis Pass (1040m)", details: "穿越金色高山草甸垭口，领略中土世界苍茫地貌" },
          { time: "17:30", activity: "瓦纳卡孤独之树落日摄影", location: "瓦纳卡湖", details: "在湖畔长焦捕捉孤独之树与高山粉霞倒影的绝美瞬间" }
        ],
        4: [
          { time: "06:30", activity: "罗伊斯峰山脊晨光徒步", location: "Roys Peak 步道", details: "登顶俯瞰瓦纳卡湖与南阿尔卑斯山脉晨曦破晓" },
          { time: "14:00", activity: "皇冠山脉公路自驾", location: "箭镇 (Arrowtown)", details: "探访十九世纪淘金古镇，漫步金秋白金汉老街" },
          { time: "18:00", activity: "天际缆车观景晚宴", location: "皇后镇", details: "搭乘天际缆车俯瞰瓦卡蒂普湖与卓越山脉璀璨夜景" }
        ],
        5: [
          { time: "07:30", activity: "米尔福德观光公路穿越", location: "镜湖 & 荷马隧道", details: "穿行古老温带雨林与穿山峡谷隧道，感受峡湾磅礴" },
          { time: "13:00", activity: "米尔福德峡湾游船巡礼", location: "米尔福德峡湾", details: "近距离仰望主教冠峰，驶入斯特林瀑布水雾感受峡湾生命力" },
          { time: "19:30", activity: "Fergburger 皇后镇大汉堡", location: "皇后镇商业街", details: "打卡全球知名的手打多汁厚牛排汉堡，搭配特制蒜香酱" }
        ],
        6: [
          { time: "09:00", activity: "TSS 厄恩斯劳号蒸汽船巡游", location: "瓦卡蒂普湖", details: "搭乘百年燃煤蒸汽船前往瓦尔特峰高地牧场，享用英式湖畔下午茶" },
          { time: "13:30", activity: "格伦诺基“中土公路”自驾", location: "格伦诺基 (Glenorchy)", details: "沿湖岸行驶至指环王取景地，拍摄经典红色木屋与雪山倒影" },
          { time: "16:30", activity: "天堂镇原始山毛榉森林探幽", location: "天堂镇 (Paradise)", details: "穿行雪山环抱的高山峡谷与原始溪流，感受中土自然纯粹" },
          { time: "20:00", activity: "皇后镇湖畔精酿与夜景漫步", location: "皇后镇码头", details: "品尝新西兰本土精酿啤酒与深海炸鱼薯条，漫步湖畔璀璨夜色" }
        ],
        7: [
          { time: "09:30", activity: "卡瓦劳大桥世界蹦极发源地", location: "卡瓦劳峡谷", details: "观摩世界首座商业蹦极跳台，感受碧绿激流与峡谷风光" },
          { time: "12:00", activity: "吉布斯顿酒庄黑皮诺品鉴", location: "Gibbston Valley", details: "品尝新西兰享誉全球的 Pinot Noir 红葡萄酒与高山奶酪拼盘" },
          { time: "15:30", activity: "机场还车 & 购买麦卢卡蜂蜜", location: "皇后镇机场", details: "办理四驱车还车手续，选购当地优质蜂胶与羊毛工艺品伴手礼" },
          { time: "18:00", activity: "满载美好回忆踏上返程航班", location: "机场离境", details: "结束 7 天震撼自驾与风光摄影之旅，启航返程" }
        ]
      },
      mustVisit: [
        {
          name: "库克山高山三文鱼 (Alpine Salmon)",
          image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=80",
          imageSource: "Unsplash",
          aiPrompt: "Fresh Alpine salmon sashimi plate near snowy mountains of Lake Pukaki New Zealand, gourmet food photography",
          wikiTitle: "Lake_Pukaki",
          recommendations: "高海拔冰川冷水滋养，肉质紧致肥美、现切极鲜刺身。",
          tipsEmoji: "🍣🏔️",
          category: "地道美食"
        },
        {
          name: "好牧羊人教堂 (Good Shepherd)",
          image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
          imageSource: "Unsplash",
          aiPrompt: "Church of the Good Shepherd Lake Tekapo at night with bright Milky Way galaxy arch in starry sky, landscape photography",
          wikiTitle: "Church_of_the_Good_Shepherd,_Lake_Tekapo",
          recommendations: "世界顶级暗夜星空保护区地标，石砌教堂与苍穹银河交相辉映。",
          tipsEmoji: "🌌⛪",
          category: "经典地标"
        },
        {
          name: "皇后镇 Fergburger 大汉堡",
          image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80",
          imageSource: "Unsplash",
          aiPrompt: "Giant gourmet prime beef burger with juicy cheese and crispy lettuce on wooden board, Queenstown restaurant style",
          wikiTitle: "Fergburger",
          recommendations: "被 CNN 誉为全球最佳汉堡，排队虽长但肉香四溢、汁水极其丰盈。",
          tipsEmoji: "🍔🔥",
          category: "地道美食"
        }
      ],
      photoGuides: [
        {
          id: 1,
          title: "1. 好牧羊人教堂暗夜星空",
          subtitle: "超广角低机位仰拍，将石砌教堂作为前景纳整片银河拱桥",
          image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
          imageSource: "Unsplash",
          wikimediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Church_of_the_Good_Shepherd%2C_Tekapo_01.jpg/960px-Church_of_the_Good_Shepherd%2C_Tekapo_01.jpg",
          aiPrompt: "Church of Good Shepherd Tekapo night sky starry milky way long exposure wide angle",
          tipsAvatars: ["🌌", "📷"],
          params: "14-24mm f/2.8 · 20s · ISO 3200"
        },
        {
          id: 2,
          title: "2. 罗伊斯峰山脊晨光俯瞰",
          subtitle: "黄金时刻逆光拍摄山脊蜿蜒延伸至瓦纳卡湖的绝美层次",
          image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80",
          imageSource: "Unsplash",
          wikimediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Roys_Peak_Track_Wanaka.jpg/960px-Roys_Peak_Track_Wanaka.jpg",
          aiPrompt: "Roys Peak trail sunrise overlooking Lake Wanaka New Zealand golden hour mountain ridge",
          tipsAvatars: ["🌅", "🏔️"],
          params: "24-70mm f/8 · 1/200s · ISO 100"
        },
        {
          id: 3,
          title: "3. 米尔福德峡湾主教冠峰水面倒影",
          subtitle: "利用潮汐滩涂水面与 CPL 偏振镜，消除杂光捕获巍峨雪山倒影",
          image: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&auto=format&fit=crop&q=80",
          imageSource: "Unsplash",
          wikimediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/e/e1/Mitre_Peak_Milford_Sound.jpg/960px-Mitre_Peak_Milford_Sound.jpg",
          aiPrompt: "Milford Sound Mitre Peak reflection in pristine calm fjord water with waterfall morning mist",
          tipsAvatars: ["🌊", "🚢"],
          params: "16-35mm + CPL · 30s · ISO 100"
        }
      ]
    },
    en: {
      tripTitle: "New Zealand South Island Explorer",
      tripSubtitle: "7 Days Itinerary | Christchurch · Tekapo · Mt Cook · Wanaka · Queenstown",
      motto: "Chasing alpine glacier sunrise, sleeping under Tekapo starry sky",
      summary: "A bespoke road trip & landscape photography expedition covering Lake Tekapo, Mt Cook, Wanaka, and Queenstown, grounded in official DOC guides.",
      dailySchedules: {
        1: [
          { time: "09:30", activity: "Airport Car Pickup & Groceries", location: "Christchurch", details: "Pick up 4WD SUV, stock supplies at supermarket" },
          { time: "13:00", activity: "Scenic Drive along SH8", location: "Fairlie ➔ Tekapo", details: "Sample traditional handmade meat pie in Fairlie" },
          { time: "16:30", activity: "Lake Tekapo Lakeside Check-in", location: "Lake Tekapo", details: "Check into lakeside lodge, enjoy turquoise lake view" },
          { time: "22:00", activity: "Church Stargazing Session", location: "Good Shepherd Church", details: "Dark sky reserve, southern cross & milky way core" }
        ],
        2: [
          { time: "09:00", activity: "Astro Café Sunrise & Coffee", location: "Mt John", details: "Panoramic view of milky-blue Lake Tekapo with Flat White" },
          { time: "12:30", activity: "Alpine Salmon Lunch", location: "Lake Pukaki", details: "Fresh glacial salmon sashimi by Lake Pukaki" },
          { time: "15:00", activity: "Hooker Valley Glacier Hike", location: "Mt Cook National Park", details: "Three suspension bridges to terminal glacier lake" },
          { time: "19:30", activity: "Stargazing & Alpine Dinner", location: "Hermitage Mt Cook", details: "Overlook Aoraki snow peaks under starry sky" }
        ],
        3: [
          { time: "08:30", activity: "Tasman Glacier Heli-Hike", location: "Tasman Glacier", details: "Scenic helicopter flight with glacier ice walking" },
          { time: "13:00", activity: "Drive via Lindis Pass", location: "Lindis Pass (1040m)", details: "Dramatic tussock mountain pass with scenic lookout" },
          { time: "17:30", activity: "That Wanaka Tree Sunset", location: "Lake Wanaka", details: "Classic lone tree sunset with alpine mountain backdrop" }
        ],
        4: [
          { time: "06:30", activity: "Roys Peak Ridge Hike", location: "Roys Peak Track", details: "Overlook Lake Wanaka during golden morning light" },
          { time: "14:00", activity: "Crown Range Road Drive", location: "Arrowtown", details: "Historic gold mining town, autumn golden leaves" },
          { time: "18:00", activity: "Skyline Gondola & Dinner", location: "Queenstown", details: "Panoramic view of Lake Wakatipu & Remarkables" }
        ],
        5: [
          { time: "07:30", activity: "Milford Road Scenic Drive", location: "Mirror Lakes & Homer", details: "Pass ancient temperate rainforest & Homer Tunnel" },
          { time: "13:00", activity: "Milford Sound Nature Cruise", location: "Milford Sound", details: "Mitre Peak, Stirling Falls & fjord fur seals" },
          { time: "19:30", activity: "Fergburger Queenstown", location: "Shotover Street", details: "World-famous gourmet beef burger with aioli" }
        ],
        6: [
          { time: "09:00", activity: "TSS Earnslaw Steamship Cruise", location: "Lake Wakatipu", details: "Historic steamship voyage to Walter Peak High Country Farm with afternoon tea" },
          { time: "13:30", activity: "Glenorchy Road Scenic Drive", location: "Glenorchy", details: "Drive along lakefront, iconic red boat shed photo spot & LOTR scenery" },
          { time: "16:30", activity: "Paradise Beech Forest Walk", location: "Paradise", details: "Ancient beech forest, dramatic alpine valley & pristine mountain rivers" },
          { time: "20:00", activity: "Lakeside Craft Beer & Dinner", location: "Queenstown Pier", details: "Sample local craft ales & fish and chips by the evening lakefront" }
        ],
        7: [
          { time: "09:30", activity: "Kawarau Bridge Bungy Centre", location: "Kawarau Gorge", details: "Visit the world's birthplace of commercial bungy jumping" },
          { time: "12:00", activity: "Gibbston Valley Wine Tasting", location: "Gibbston Valley", details: "Award-winning Pinot Noir wine flight with artisan cheese platter" },
          { time: "15:30", activity: "Car Return & Souvenir Shopping", location: "Queenstown Airport", details: "Drop off rental SUV, pick up Manuka honey & alpaca wool gifts" },
          { time: "18:00", activity: "Departure Flight Home", location: "Airport Departure", details: "Board flight home with unforgettable South Island memories" }
        ]
      },
      mustVisit: [
        {
          name: "Mount Cook Alpine Salmon",
          image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=80",
          recommendations: "Fresh glacial water salmon sashimi.",
          tipsEmoji: "🍣🏔️",
          category: "Cuisine"
        },
        {
          name: "Church of Good Shepherd",
          image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
          recommendations: "Iconic Dark Sky reserve & stone church.",
          tipsEmoji: "🌌⛪",
          category: "Landmark"
        },
        {
          name: "Fergburger Queenstown",
          image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80",
          recommendations: "CNN top rated burger in the world.",
          tipsEmoji: "🍔🔥",
          category: "Cuisine"
        }
      ],
      photoGuides: [
        {
          id: 1,
          title: "1. Church of Good Shepherd",
          subtitle: "Night astro angle, capturing Milky Way core",
          image: "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&auto=format&fit=crop&q=80",
          tipsAvatars: ["🌌", "📷"],
          params: "14-24mm f/2.8 · 20s · ISO 3200"
        },
        {
          id: 2,
          title: "2. Roys Peak Track",
          subtitle: "Elevated mountain ridge, golden hour light",
          image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80",
          tipsAvatars: ["🌅", "🏔️"],
          params: "24-70mm f/8 · 1/200s · ISO 100"
        },
        {
          id: 3,
          title: "3. Mitre Peak Milford Sound",
          subtitle: "Leading water reflections using tidal pools",
          image: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&auto=format&fit=crop&q=80",
          tipsAvatars: ["🌊", "🚢"],
          params: "16-35mm + CPL · 30s · ISO 100"
        }
      ]
    }
  },
  tokyo: {
    zh: {
      tripTitle: "东京 7 天金秋漫游与地道赏味之旅",
      tripSubtitle: "7 天行程 | 浅草 · 涩谷 · 新宿 · 筑地 · 银座 · 镰仓 · 吉祥寺",
      motto: "穿行于江户古刹幽境，沉醉于涩谷赛博霓虹",
      summary: "穿梭于传统江户神社古风与现代赛博朋克霓虹街景之间，打卡米其林拉面、筑地海鲜与宫崎骏童话圣地。",
      dailySchedules: {
        1: [
          { time: "10:00", activity: "新宿御苑金秋红叶漫步", location: "新宿", details: "漫步日式传统回游式庭园，欣赏绚烂银杏与枫叶红层" },
          { time: "13:30", activity: "回忆横丁地道猪排饭与荞麦面", location: "回忆横丁", details: "探访复古怀旧昭和小巷，品尝地道香浓炸猪排与手工荞麦面" },
          { time: "18:00", activity: "六本木之丘森大厦夜景展望", location: "六本木", details: "登顶 52 楼高空展望台，360 度俯瞰璀璨东京铁塔与都市落日天际线" }
        ],
        2: [
          { time: "09:00", activity: "浅草寺祈福与仲见世商店街", location: "浅草", details: "探访东京最古老寺庙，穿行传统商店街品尝人形烧与浓郁抹茶" },
          { time: "12:30", activity: "一兰拉面地道豚骨午餐", location: "一兰拉面 (Asakusa)", details: "体验经典一人一格味集中座位，品尝浓郁手工熬制豚骨拉面" },
          { time: "15:00", activity: "明治神宫参拜与原宿竹下通", location: "原宿 / 表参道", details: "漫步古树参天的清幽神道，随后前往潮流聚集地打卡" }
        ],
        3: [
          { time: "08:30", activity: "筑地场外市场美食巡游", location: "筑地", details: "品尝现切蓝鳍金枪鱼大腹刺身、A5 和牛烤串与松软厚蛋烧" },
          { time: "13:00", activity: "银座艺术画廊与旗舰店探索", location: "银座", details: "漫步世界知名商圈，登顶 Ginza Six 屋顶空中花园小憩" },
          { time: "19:00", activity: "涩谷十字路口与 Shibuya Sky", location: "涩谷", details: "在世界最繁忙十字路口感受都市脉搏，俯瞰 neon 霓虹人潮" }
        ],
        4: [
          { time: "09:00", activity: "镰仓高校前灌篮高手海景平交道", location: "镰仓 (Kamakura)", details: "在经典路口捕捉复古江之电列车驶过湘南海岸的电影画面" },
          { time: "13:00", activity: "江之岛海蜡烛灯塔与海鲜盖饭", location: "江之岛", details: "登岛远眺相模湾与富士山轮廓，品尝现捞生吻仔鱼与烤海螺" },
          { time: "17:30", activity: "镰仓小町通老街风味散步", location: "小町通", details: "漫步古色古香街道，品尝抹茶冰淇淋、紫薯炸肉饼与传统和菓子" }
        ],
        5: [
          { time: "09:30", activity: "三鹰之森吉卜力美术馆童话巡礼", location: "三鹰市", details: "探访宫崎骏动画世界，打卡巨型机械兵与珍贵原稿手绘" },
          { time: "13:30", activity: "井之头恩赐公园天鹅船漫游", location: "吉祥寺", details: "在绿意盎然的天然湖泊上泛舟，漫步林荫步道与咖啡店" },
          { time: "18:30", activity: "吉祥寺口琴横丁炭火居酒屋", location: "口琴横丁", details: "体验地道昭和风情小酒馆，品尝炭火现烤鸡肉串与纯米大吟酿" }
        ],
        6: [
          { time: "10:00", activity: "上野恩赐公园与国立西洋美术馆", location: "上野", details: "漫步文化胜地，欣赏莫奈《睡莲》与柯布西耶世界文化遗产建筑" },
          { time: "14:00", activity: "秋叶原动漫手办与电气街探索", location: "秋叶原", details: "探访手办圣地与复古中古店，感受二次元文化的独特魅力" },
          { time: "18:30", activity: "阿美横町热闹市集与特色小吃", location: "阿美横町", details: "体验接地气的市井活力，品尝铁板海鲜与地道居酒屋" }
        ],
        7: [
          { time: "09:30", activity: "皇居外苑二重桥与楠木正成像", location: "皇居", details: "漫步标志性黑松草坪，观赏古老石桥与江户古城遗迹" },
          { time: "12:30", activity: "丸之内东京站地下街经典拉面", location: "东京车站", details: "打卡百年文艺复兴红砖车站，品尝东京拉面街高分浓汤面" },
          { time: "16:00", activity: "羽田/成田机场免税采购与返程", location: "机场离境", details: "购买东京香蕉蛋糕与伴手礼，结束充实东京 7 天金秋漫游" }
        ]
      },
      mustVisit: [
        {
          name: "筑地场外市场 (Tsukiji Market)",
          image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
          imageSource: "Unsplash",
          wikimediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/Tsukiji_outer_market_2018.jpg/960px-Tsukiji_outer_market_2018.jpg",
          aiPrompt: "Tsukiji outer market Tokyo seafood sushi stall gourmet culinary",
          wikiTitle: "Tsukiji_outer_market",
          recommendations: "东京美食厨房，现切海胆刺身、玉子烧与日式烤串极具风味。",
          tipsEmoji: "🍣🥢",
          category: "地道美食"
        },
        {
          name: "涩谷十字路口 (Shibuya Crossing)",
          image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=80",
          imageSource: "Unsplash",
          wikimediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Shibuya_Crossing_%28236173203%29.jpeg/960px-Shibuya_Crossing_%28236173203%29.jpeg",
          aiPrompt: "Shibuya Crossing Tokyo night neon cyberpunk crowd photography",
          wikiTitle: "Shibuya",
          recommendations: "世界级地标，感受霓虹光影与人潮汹涌的赛博都市魅力。",
          tipsEmoji: "🚦✨",
          category: "经典地标"
        },
        {
          name: "三鹰之森吉卜力美术馆",
          image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
          imageSource: "Unsplash",
          wikimediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/7/77/Ghibli_Museum_Mitaka_Tokyo.jpg/960px-Ghibli_Museum_Mitaka_Tokyo.jpg",
          aiPrompt: "Ghibli Museum rooftop robot statue anime Miyazaki wonderland Tokyo",
          wikiTitle: "Ghibli_Museum",
          recommendations: "宫崎骏动画的童话城堡，屋顶巨型机械兵与手稿原画必看。",
          tipsEmoji: "🎭🍃",
          category: "经典地标"
        }
      ],
      photoGuides: [
        {
          id: 1,
          title: "1. 涩谷十字路口高空俯瞰",
          subtitle: "高角度俯拍，利用慢速快门捕捉穿梭不息的都市人潮流光",
          image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=80",
          imageSource: "Unsplash",
          wikimediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/4/4b/Shibuya_Crossing_%28236173203%29.jpeg/960px-Shibuya_Crossing_%28236173203%29.jpeg",
          aiPrompt: "Shibuya Crossing aerial slow shutter motion blur neon light trails",
          tipsAvatars: ["🚦", "🏙️"],
          params: "24mm f/2.8 · 1/15s 慢门 · ISO 400"
        },
        {
          id: 2,
          title: "2. 浅草寺雷门框架构图",
          subtitle: "以雷门标志性红色大灯笼为画框前景，对称透视拍摄正殿",
          image: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=800&auto=format&fit=crop&q=80",
          imageSource: "Unsplash",
          wikimediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/6/6b/Sensoji_Temple_Kaminarimon_gate.jpg/960px-Sensoji_Temple_Kaminarimon_gate.jpg",
          aiPrompt: "Senso-ji Temple Asakusa giant red lantern gate frame traditional Tokyo",
          tipsAvatars: ["⛩️", "🏮"],
          params: "16-35mm f/8 · 1/250s · ISO 100"
        },
        {
          id: 3,
          title: "3. 东京铁塔经典街景透视",
          subtitle: "利用笔直街道作为视觉引导线，中焦大光圈虚化路面车灯光斑",
          image: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800&auto=format&fit=crop&q=80",
          imageSource: "Unsplash",
          wikimediaUrl: "https://upload.wikimedia.org/wikipedia/commons/thumb/3/37/Tokyo_Tower_and_around_Skyscrapers.jpg/960px-Tokyo_Tower_and_around_Skyscrapers.jpg",
          aiPrompt: "Tokyo Tower night view street perspective glowing red beacon",
          tipsAvatars: ["🗼", "🚗"],
          params: "50mm f/1.8 · 1/60s 夜景 · ISO 800"
        }
      ]
    },
    en: {
      tripTitle: "Tokyo Autumn Escape",
      tripSubtitle: "7 Days Itinerary | Asakusa · Shibuya · Shinjuku · Tsukiji · Ginza · Kamakura · Kichijoji",
      motto: "From ancient serene Edo shrines to cyberpunk Shibuya neon lights",
      summary: "Experience the vibrant blend of traditional culture, modern neon landmarks, and world-class culinary highlights across Tokyo.",
      dailySchedules: {
        1: [
          { time: "10:00", activity: "Shinjuku Gyoen Autumn Walk", location: "Shinjuku", details: "Traditional gardens with vibrant maple leaves" },
          { time: "13:30", activity: "Katsudon & Soba Lunch", location: "Omoide Yokocho", details: "Retro alleyway authentic comfort dishes" },
          { time: "18:00", activity: "Tokyo City View Observatory", location: "Roppongi Hills", details: "Panoramic sunset & night skyline view" }
        ],
        2: [
          { time: "09:00", activity: "Explore Senso-ji Temple", location: "Asakusa", details: "Historic landmarks & Nakamise shopping street" },
          { time: "12:30", activity: "Ramen Lunch", location: "Ichiran Ramen", details: "Famous tonkotsu broth & custom ramen booth" },
          { time: "15:00", activity: "Meiji Shrine Visit", location: "Harajuku", details: "Serene sacred forest walk & Takeshita Street" }
        ],
        3: [
          { time: "08:30", activity: "Tsukiji Outer Market Food Tour", location: "Tsukiji", details: "Fresh sushi, wagyu skewers & tamagoyaki" },
          { time: "13:00", activity: "Ginza Luxury & Art Galleries", location: "Ginza", details: "Flagship stores & Ginza Six rooftop garden" },
          { time: "19:00", activity: "Shibuya Crossing & Sky Deck", location: "Shibuya", details: "World's busiest crossing with Shibuya Sky views" }
        ],
        4: [
          { time: "09:00", activity: "Kamakura Coastal Railroad Walk", location: "Kamakura", details: "Classic Enoden train ocean view crossing" },
          { time: "13:00", activity: "Enoshima Island Lighthouse & Seafood", location: "Enoshima", details: "Panoramic Sagami Bay views and fresh seafood bowl" },
          { time: "17:30", activity: "Komachi-dori Street Stroll", location: "Kamakura Old Town", details: "Historic shopping street with matcha snacks" }
        ],
        5: [
          { time: "09:30", activity: "Ghibli Museum Animation Tour", location: "Mitaka", details: "Whimsical animation art & giant rooftop robot" },
          { time: "13:30", activity: "Inokashira Park Swan Boats", location: "Kichijoji", details: "Scenic lakeside walk and leafy park stroll" },
          { time: "18:30", activity: "Harmonica Yokocho Izakaya", location: "Kichijoji Alley", details: "Authentic retro yakitori skewers and sake" }
        ],
        6: [
          { time: "10:00", activity: "Ueno Park & National Museum of Western Art", location: "Ueno", details: "Le Corbusier heritage architecture & Monet art" },
          { time: "14:00", activity: "Akihabara Electric Town Tour", location: "Akihabara", details: "Anime collectibles, retro gaming & tech culture" },
          { time: "18:30", activity: "Ameyoko Market Food Stalls", location: "Ameyoko", details: "Bustling street market with teppan seafood" }
        ],
        7: [
          { time: "09:30", activity: "Imperial Palace Nijubashi Bridge", location: "Imperial Palace", details: "Historic stone bridge & ancient pine gardens" },
          { time: "12:30", activity: "Tokyo Station Ramen Street", location: "Tokyo Station", details: "Iconic red-brick station & gourmet ramen" },
          { time: "16:00", activity: "Airport Souvenirs & Flight Home", location: "Airport Departure", details: "Tokyo Banana gifts & departure flight" }
        ]
      },
      mustVisit: [
        {
          name: "Tsukiji Outer Market",
          image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80",
          recommendations: "Sushi, wagyu skewers & array of authentic seafood.",
          tipsEmoji: "🍣🥢",
          category: "Cuisine"
        },
        {
          name: "Shibuya Crossing",
          image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=80",
          recommendations: "Iconic scramble crossing & neon lights.",
          tipsEmoji: "🚦✨",
          category: "Landmark"
        },
        {
          name: "Ghibli Museum",
          image: "https://images.unsplash.com/photo-1578632767115-351597cf2477?w=800&auto=format&fit=crop&q=80",
          recommendations: "Whimsical animation & rooftop robot.",
          tipsEmoji: "🎭🍃",
          category: "Landmark"
        }
      ],
      photoGuides: [
        {
          id: 1,
          title: "1. Shibuya Crossing",
          subtitle: "Elevated angle, capturing urban movement",
          image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=80",
          tipsAvatars: ["🚦", "🏙️"],
          params: "24mm f/2.8 · 1/15s motion blur · ISO 400"
        },
        {
          id: 2,
          title: "2. Senso-ji Temple",
          subtitle: "Frame landmark with gate structure",
          image: "https://images.unsplash.com/photo-1492571350019-22de08371fd3?w=800&auto=format&fit=crop&q=80",
          tipsAvatars: ["⛩️", "🏮"],
          params: "16-35mm f/8 · 1/250s · ISO 100"
        },
        {
          id: 3,
          title: "3. Tokyo Tower",
          subtitle: "Leading lines using classic streets",
          image: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800&auto=format&fit=crop&q=80",
          tipsAvatars: ["🗼", "🚗"],
          params: "50mm f/1.8 · 1/60s night · ISO 800"
        }
      ]
    }
  }
};

/**
 * 智能拆解并提取每日特定时段的精准地点/地标名称，杜绝整天长标题重复灌入各个时段
 */
export function extractSlotLocation(themeStr = "", actStr = "", slotIndex = 0, defaultLoc = "核心地标区") {
  const cleanTheme = String(themeStr || "")
    .replace(/^(Day\s*\d+|第\s*\d+\s*天)[:：\s]*/i, "")
    .trim();

  // 按路线分隔符切分 (➔, ->, >, 、, —, - 等)
  const parts = cleanTheme
    .split(/[\s>➔\-—→~～、]+/)
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.match(/^(Day\s*\d+|第\s*\d+\s*天)$/i));

  // 1. 如果标题切分出 3 段及以上 (如：抵达东京 ➔ 新宿御苑漫步 ➔ 六本木之丘夜景)
  if (parts.length >= 3) {
    const raw = parts[slotIndex] || parts[parts.length - 1];
    return raw.replace(/^(抵达|前往|漫步|游览|打卡|登顶|品尝)/, '').trim() || raw;
  }
  
  // 2. 如果切分出 2 段
  if (parts.length === 2) {
    if (slotIndex === 0) return parts[0].replace(/^(抵达|前往)/, '').trim() || parts[0];
    if (slotIndex === 1) return parts[1].replace(/^(漫步|游览|打卡)/, '').trim() || parts[1];
    return parts[1];
  }

  // 3. 从具体活动文本中提取关键词地点
  const cleanAct = String(actStr || "").trim();
  const matchedSpot = cleanAct.match(/(?:抵达|前往|游览|漫步|打卡|登顶|探索|入住|在)\s*([^,，。；;\n\r（(]{2,10}?)(?:(?:机场|火车站|公园|景区|湖|大桥|古镇|古城|寺|塔|山|街|大厦|观景台|村|草原|峡湾|博物馆|美术馆)|(?=[,，。；;\n\r（(]))/);
  if (matchedSpot && matchedSpot[1]) {
    return matchedSpot[1].trim();
  }

  if (parts.length === 1 && parts[0].length <= 12) {
    return parts[0];
  }

  const defaultSlots = ["上午游览区", "午后核心景区", "傍晚特色风味区"];
  return defaultSlots[slotIndex] || defaultLoc;
}

/**
 * 将后端返回的数据动态转换为前端 Bento Grid 卡片所需的数据结构
 * 兼容 OpenClaw Agent 规范 (plan.summary + plan.daily_plan) 与原生 TravelPlanResponse (itineraries)
 */
export function transformBackendPlan(apiData, language = 'zh') {
  if (!apiData) return null;

  // 兼容 openclaw_agent 的 plan 包装、data 包装或顶层响应
  const plan = apiData.plan || apiData.data || apiData;

  // 辅助函数：根据目的地名称智能生成引言 Motto
  const generateMotto = (destText = '') => {
    const text = String(destText).toLowerCase();
    if (text.includes('东京') || text.includes('tokyo') || text.includes('日本') || text.includes('japan')) {
      return language === 'zh' ? "穿行于江户古刹幽境，沉醉于涩谷赛博霓虹" : "From ancient serene Edo shrines to cyberpunk Shibuya neon lights";
    }
    if (text.includes('京都') || text.includes('kyoto') || text.includes('奈良')) {
      return language === 'zh' ? "漫步二年坂暮色石阶，细品千年古都风雅茶韵" : "Strolling ancient Kyoto alleys and timeless Zen gardens";
    }
    if (text.includes('瑞士') || text.includes('swiss') || text.includes('阿尔卑斯') || text.includes('采尔马特')) {
      return language === 'zh' ? "穿行于阿尔卑斯金色山口，仰望马特洪峰日照金顶" : "Gliding through alpine peaks under the golden Matterhorn sunrise";
    }
    if (text.includes('贵州') || text.includes('喀斯特') || text.includes('黄果树') || text.includes('苗寨')) {
      return language === 'zh' ? "纵情喀斯特飞瀑秘境，沉醉万家苗寨璀璨星灯" : "Exploring emerald karst waterfalls and glowing ethnic mountain villages";
    }
    if (text.includes('冰岛') || text.includes('iceland') || text.includes('极光') || text.includes('挪威')) {
      return language === 'zh' ? "逐光冰火交融之境，定格极地黑沙滩上的远古蓝冰" : "Chasing auroras over ancient black sands and glacial wonderlands";
    }
    if (text.includes('新西兰') || text.includes('南岛') || text.includes('tekapo') || text.includes('特卡波')) {
      return language === 'zh' ? "追逐雪山冰川晨光，枕着特卡波璀璨星河入梦" : "Chasing alpine glacier sunrise, sleeping under Tekapo starry sky";
    }
    return language === 'zh' ? "跨越山海奔赴理想，让每一段探索都自成诗篇" : "Journey beyond boundaries into unforgettable bespoke adventures";
  };

  // 1. 如果是 OpenClaw Agent 规范结构 (daily_plan)
  if (plan.daily_plan && Array.isArray(plan.daily_plan) && plan.daily_plan.length > 0) {
    const dailySchedules = {};
    const extractedLocations = [];

    plan.daily_plan.forEach((dp, idx) => {
      const dayNum = Number(dp.day) || (idx + 1);
      const title = String(dp.title || `Day ${dayNum}`).replace(/^(Day\s*\d+|第\s*\d+\s*天)[:：\s]*/i, '').trim();
      const content = String(dp.content || "");
      
      const sentences = content
        .split(/[。；;\n\r]+/)
        .map(s => s.trim())
        .filter(s => s.length > 0);

      const locParts = title.split(/[\s>➔\-—→~～]+/);
      const loc1 = (locParts[0] && locParts[0].trim().length > 1) ? locParts[0].trim() : (title || (language === 'zh' ? "核心观光区" : "Scenic Spot"));
      const loc2 = (locParts[1] && locParts[1].trim().length > 1) ? locParts[1].trim() : loc1;
      if (loc1) extractedLocations.push(loc1);
      if (loc2 && loc2 !== loc1) extractedLocations.push(loc2);

      const morningAct = sentences[0] || (language === 'zh' ? "上午景点游览与出发" : "Morning Departure & Sightseeing");
      const morningDetail = sentences[1] || (language === 'zh' ? "探索当地地标与自然人文景观" : "Explore local landmarks and scenic nature");

      const afternoonAct = sentences[2] || (sentences[1] ? `${sentences[1]}` : (language === 'zh' ? "下午深度漫游体验" : "Afternoon In-depth Exploration"));
      const tipDetail = plan.tips && Array.isArray(plan.tips) && plan.tips.length > 0
        ? `${language === 'zh' ? '贴士: ' : 'Tips: '}${plan.tips[(dayNum - 1) % plan.tips.length]}`
        : (sentences[3] || (language === 'zh' ? "打卡特色风景与沉浸式体验" : "Scenic highlights & immersive experience"));

      const eveningAct = sentences[4] || sentences[3] || (language === 'zh' ? "傍晚日落拍摄与特色风味晚宴" : "Sunset, Local Dining & Leisure");
      const eveningDetail = sentences[5] || (language === 'zh' ? "品尝地道风味料理，观赏城市/小镇夜景与星空" : "Sample authentic cuisine and enjoy night atmosphere");

      dailySchedules[dayNum] = [
        {
          time: "09:00",
          activity: morningAct,
          location: loc1,
          details: morningDetail
        },
        {
          time: "14:00",
          activity: afternoonAct,
          location: loc2,
          details: tipDetail
        },
        {
          time: "19:00",
          activity: eveningAct,
          location: language === 'zh' ? "特色餐厅 / 观景点" : "Local Dining / Viewpoint",
          details: eveningDetail
        }
      ];
    });

    const summaryObj = (typeof plan.summary === 'object' && plan.summary) ? plan.summary : {};
    const tripTitle = summaryObj.title || plan.title || (language === 'zh' ? "定制智能旅行规划" : "Custom Travel Plan");
    const dayCount = summaryObj.days || Object.keys(dailySchedules).length;
    const routeText = summaryObj.route ? ` | ${summaryObj.route}` : '';
    const budgetText = summaryObj.budget ? ` · ${summaryObj.budget}` : '';

    // 智能提取与合成必去地标与美食
    const sampleLocs = Array.from(new Set(extractedLocations.filter(l => l && l.length > 1))).slice(0, 3);
    const mustVisit = sampleLocs.length >= 2 ? [
      {
        name: sampleLocs[0],
        image: matchDestinationImage(sampleLocs[0], 'nature').url,
        recommendations: language === 'zh' ? `必访经典核心地标，尽享代表性自然与人文风光。` : `Must-visit hallmark landmark with iconic sightseeing.`,
        tipsEmoji: "🏛️✨",
        category: language === 'zh' ? "经典地标" : "Landmark"
      },
      {
        name: language === 'zh' ? `${sampleLocs[1]} 地道风味餐饮` : `${sampleLocs[1]} Local Gourmet Dining`,
        image: matchDestinationImage(sampleLocs[1], 'food').url,
        recommendations: language === 'zh' ? `精选当地高分特色美食名店，品尝原汁原味地道风味。` : `Top-rated culinary experience featuring authentic local ingredients.`,
        tipsEmoji: "🍲🥢",
        category: language === 'zh' ? "地道美食" : "Cuisine"
      },
      {
        name: sampleLocs[2] || (language === 'zh' ? "高空观景台 / 历史街区" : "Skyline Observatory / Historic Alley"),
        image: matchDestinationImage(sampleLocs[2] || tripTitle, 'nature').url,
        recommendations: language === 'zh' ? `全景观赏与人文漫步绝佳机位，摄影与休闲皆宜。` : `Panoramic vistas and atmospheric cultural stroll.`,
        tipsEmoji: "🌅📷",
        category: language === 'zh' ? "经典地标" : "Landmark"
      }
    ] : (Array.isArray(plan.tips) && plan.tips.length > 0 ? plan.tips.slice(0, 3).map((tip, idx) => {
      const match = matchDestinationImage(tripTitle + ' ' + tip, idx === 1 ? 'food' : 'nature');
      return {
        name: idx === 1 ? (language === 'zh' ? "精选地道特色美食" : "Local Cuisine & Dining") : `${language === 'zh' ? '核心地标体验' : 'Top Highlight'} ${idx + 1}`,
        image: match.url,
        recommendations: tip,
        tipsEmoji: idx === 1 ? "🍲🥢" : "🏛️✨",
        category: idx === 1 ? (language === 'zh' ? "地道美食" : "Cuisine") : (language === 'zh' ? "经典地标" : "Landmark")
      };
    }) : [
      {
        name: sampleLocs[0] || (language === 'zh' ? "核心景观区" : "Top Scenic Landmark"),
        image: matchDestinationImage(tripTitle, 'nature').url,
        recommendations: language === 'zh' ? "精选核心地标，感受目的地独特风貌。" : "Selected scenic highlight.",
        tipsEmoji: "🏛️✨",
        category: language === 'zh' ? "经典地标" : "Landmark"
      },
      {
        name: language === 'zh' ? "地道风味品鉴" : "Local Cuisine Experience",
        image: matchDestinationImage(tripTitle, 'food').url,
        recommendations: language === 'zh' ? "品尝当地特色美食与风味小吃。" : "Taste authentic local culinary specialties.",
        tipsEmoji: "🍲🥢",
        category: language === 'zh' ? "地道美食" : "Cuisine"
      }
    ]);

    // 智能合成 3 个精选摄影机位建议
    const photoGuides = [
      {
        id: 1,
        title: language === 'zh' ? `1. ${sampleLocs[0] || '核心地标'} 黄金时刻全景` : `1. ${sampleLocs[0] || 'Landmark'} Golden Hour Panorama`,
        subtitle: language === 'zh' ? "广角顺光构图，捕捉晨曦/黄昏时分绝佳光影层次" : "Wide angle composition capturing dramatic dawn/dusk lighting",
        image: matchDestinationImage(sampleLocs[0] || tripTitle, 'photo').url,
        tipsAvatars: ["🌅", "📷"],
        params: language === 'zh' ? "广角镜头 · 晨昏黄金时刻" : "Wide Angle · Golden Hour"
      },
      {
        id: 2,
        title: language === 'zh' ? `2. ${sampleLocs[1] || '特色景观'} 光影与倒影机位` : `2. ${sampleLocs[1] || 'Scenic Spot'} Motion & Reflection`,
        subtitle: language === 'zh' ? "配合偏振镜或慢速快门，消除水面反光打造丝滑质感" : "Use CPL or slow shutter to smooth reflections",
        image: matchDestinationImage(sampleLocs[1] || tripTitle, 'photo').url,
        tipsAvatars: ["🌊", "✨"],
        params: language === 'zh' ? "标准变焦 · 顺逆光皆宜" : "Standard Zoom · CPL Recommended"
      },
      {
        id: 3,
        title: language === 'zh' ? `3. ${sampleLocs[2] || '夜景机位'} 蓝调时刻与璀璨夜色` : `3. ${sampleLocs[2] || 'Night Spot'} Blue Hour & Night Lights`,
        subtitle: language === 'zh' ? "大光圈虚化背景灯斑，突出主体地标与都市/星空光泽" : "Wide aperture capturing glowing lights and night sky",
        image: matchDestinationImage(sampleLocs[2] || tripTitle, 'photo').url,
        tipsAvatars: ["🌌", "🏙️"],
        params: language === 'zh' ? "大光圈镜头 · 蓝调时刻" : "Fast Prime · Blue Hour"
      }
    ];

    const summaryText = summaryObj.route 
      ? `${language === 'zh' ? '推荐路线: ' : 'Route: '}${summaryObj.route}。${language === 'zh' ? '预算参考: ' : 'Budget: '}${summaryObj.budget || (language === 'zh' ? '适中' : 'Moderate')}。` 
      : (Array.isArray(plan.tips) ? plan.tips.join('；') : (typeof plan.summary === 'string' ? plan.summary : ''));

    return {
      tripTitle,
      tripSubtitle: `${dayCount} ${language === 'zh' ? '天定制行程' : 'Days Plan'}${routeText}${budgetText}`,
      motto: generateMotto(tripTitle + ' ' + (summaryObj.route || '')),
      summary: summaryText,
      dailySchedules,
      mustVisit,
      photoGuides,
      dataSources: plan.data_sources || [
        language === 'zh' ? "权威旅行指南与知识底座" : "Travel Guides & Knowledge Base",
        language === 'zh' ? "实时路况与气象辅助核验" : "Live Route & Weather Check"
      ]
    };
  }

  // 2. 如果是 TravelPlanResponse 规范结构 (itineraries)
  if (plan.itineraries && Array.isArray(plan.itineraries) && plan.itineraries.length > 0) {
    const dailySchedules = {};
    plan.itineraries.forEach((itin, idx) => {
      const dayNum = Number(itin.day) || (idx + 1);
      const locMorning = extractSlotLocation(itin.theme, itin.morning, 0, language === 'zh' ? "上午观光区" : "Morning Area");
      const locAfternoon = extractSlotLocation(itin.theme, itin.afternoon, 1, language === 'zh' ? "午后核心景区" : "Afternoon Area");
      const locEvening = extractSlotLocation(itin.theme, itin.evening, 2, language === 'zh' ? "傍晚风味街区" : "Evening Dining Area");

      dailySchedules[dayNum] = [
        {
          time: "09:00",
          activity: itin.morning || (language === 'zh' ? "上午景点探索" : "Morning Exploration"),
          location: locMorning,
          details: itin.transport ? `${language === 'zh' ? '交通: ' : 'Transport: '}${itin.transport}` : (language === 'zh' ? "特色观光与人文漫步" : "Sightseeing & Walk")
        },
        {
          time: "14:00",
          activity: itin.afternoon || (language === 'zh' ? "下午深度体验" : "Afternoon Experience"),
          location: locAfternoon,
          details: itin.tips ? `${language === 'zh' ? '贴士: ' : 'Tips: '}${itin.tips}` : (language === 'zh' ? "深度自然探索" : "Nature Exploration")
        },
        {
          time: "19:00",
          activity: itin.evening || (language === 'zh' ? "晚间特色美食与夜景" : "Evening Dining & Skyline"),
          location: locEvening,
          details: language === 'zh' ? "打卡特色餐饮，观赏都市夜景" : "Sample local dining and enjoy views"
        }
      ];
    });

    const mustVisit = (plan.must_visit_spots || []).map((spot, idx) => {
      const isFood = (spot.category?.includes("美食") || spot.category?.includes("小吃") || spot.category?.toLowerCase().includes("food") || spot.category?.toLowerCase().includes("cuisine"));
      const fallbackImg = matchDestinationImage(spot.name || '', isFood ? 'food' : 'nature', idx).url;
      return {
        name: spot.name || (isFood ? (language === 'zh' ? "特色风味小吃" : "Local Dish") : (language === 'zh' ? "核心地标" : "Landmark")),
        image: spot.image || fallbackImg,
        recommendations: spot.highlight || (language === 'zh' ? "当地必打卡体验" : "Top recommended experience"),
        tipsEmoji: isFood ? "🍲🥢" : "🏛️✨",
        category: spot.category || (isFood ? (language === 'zh' ? "地道美食" : "Cuisine") : (language === 'zh' ? "经典地标" : "Landmark"))
      };
    });

    const photoGuides = (plan.photo_guides || []).map((photo, idx) => {
      const photoMeta = matchDestinationImage(photo.location || '', 'photo', idx);
      const fallbackImg = photoMeta.url;
      const cameraParam = photo.camera_params || photo.params || photo.outfit_color;
      let displayParams = "";
      if (cameraParam && photo.best_time) {
        displayParams = `${cameraParam} · ${photo.best_time}`;
      } else if (cameraParam) {
        displayParams = cameraParam;
      } else if (photo.best_time) {
        displayParams = `${language === 'zh' ? '推荐时段: ' : 'Time: '}${photo.best_time}`;
      } else if (photoMeta.focal && photoMeta.aperture) {
        displayParams = `${photoMeta.focal} ${photoMeta.aperture} · ${photoMeta.shutter || '黄金时刻'}`;
      } else {
        displayParams = language === 'zh' ? "推荐广角镜头 · 黄金时段" : "Wide Angle · Golden Hour";
      }

      return {
        id: idx + 1,
        title: `${idx + 1}. ${photo.location || (language === 'zh' ? '风光机位' : 'Photo Spot')}`,
        subtitle: photo.composition_tips || (language === 'zh' ? "经典机位与构图指南" : "Composition & Lighting guide"),
        image: photo.image || fallbackImg,
        tipsAvatars: ["📷", "🌅"],
        params: displayParams
      };
    });

    const dayCount = Object.keys(dailySchedules).length;
    const summaryText = typeof plan.summary === 'object' 
      ? (plan.summary?.route || plan.summary?.title || '') 
      : String(plan.summary || '');

    return {
      tripTitle: plan.title || (typeof plan.summary === 'object' ? plan.summary?.title : '') || (language === 'zh' ? "定制智能旅行规划" : "Custom Travel Plan"),
      tripSubtitle: `${dayCount} ${language === 'zh' ? '天定制行程' : 'Days Plan'}${summaryText ? ' | ' + summaryText.slice(0, 36) + '...' : ''}`,
      motto: generateMotto(plan.title + ' ' + summaryText),
      summary: summaryText,
      dailySchedules,
      mustVisit: mustVisit.length > 0 ? mustVisit : undefined,
      photoGuides: photoGuides.length > 0 ? photoGuides : undefined,
      dataSources: plan.data_sources || [
        language === 'zh' ? "私有知识库与权威旅游指南" : "Private Knowledge Base & Travel Guides",
        language === 'zh' ? "全网旅行搜索引擎" : "Web Search Engine"
      ]
    };
  }

  // 3. 兜底容错：如果是纯文本或 raw_markdown
  if (typeof plan === 'string' || plan.raw_markdown || plan.summary) {
    const rawText = String(plan.raw_markdown || plan.summary || plan);
    const dayMatches = rawText.match(/(?:Day|第)\s*(\d+|[一二三四五六七八九十]+)\s*[天日\s:：\-—]+([^\n]+)/gi) || [];
    const dailySchedules = {};
    
    if (dayMatches.length > 0) {
      dayMatches.slice(0, 7).forEach((m, idx) => {
        const dayNum = idx + 1;
        const line = m.replace(/^(Day|第)\s*(\d+|[一二三四五六七八九十]+)\s*[天日\s:：\-—]*/i, '').trim();
        dailySchedules[dayNum] = [
          { time: "09:00", activity: line || (language === 'zh' ? "上午观光" : "Morning Sightseeing"), location: line.split(/[\s>➔\-—]+/)[0] || "精选节点", details: "探索核心风光与地标" },
          { time: "14:00", activity: language === 'zh' ? "下午深度体验" : "Afternoon Tour", location: line.split(/[\s>➔\-—]+/)[1] || "特色街区", details: "漫步特色景点与人文体验" },
          { time: "19:00", activity: language === 'zh' ? "晚间特色美食" : "Evening Dining", location: "当地美食街", details: "品尝特色风味料理" }
        ];
      });
    } else {
      dailySchedules[1] = [
        { time: "09:00", activity: language === 'zh' ? "抵达与探索" : "Arrival & Sightseeing", location: "核心地标", details: rawText.slice(0, 100) },
        { time: "14:00", activity: language === 'zh' ? "下午漫步" : "Afternoon Tour", location: "风景区", details: "感受当地自然与人文特色" },
        { time: "19:00", activity: language === 'zh' ? "特色晚宴" : "Evening Dining", location: "美食餐厅", details: "品尝当地特色风味" }
      ];
    }

    const tripTitle = language === 'zh' ? "定制智能旅行规划" : "Custom Travel Plan";
    return {
      tripTitle,
      tripSubtitle: `${Object.keys(dailySchedules).length} ${language === 'zh' ? '天定制行程' : 'Days Plan'}`,
      motto: generateMotto(tripTitle),
      summary: rawText.slice(0, 150),
      dailySchedules,
      mustVisit: [
        {
          name: language === 'zh' ? "核心景观地标" : "Scenic Highlight",
          image: matchDestinationImage(tripTitle, 'nature').url,
          recommendations: language === 'zh' ? "当地代表性必游体验" : "Must-visit landmark experience",
          tipsEmoji: "🏛️✨",
          category: language === 'zh' ? "经典地标" : "Landmark"
        }
      ],
      photoGuides: [
        {
          id: 1,
          title: language === 'zh' ? "1. 核心地标黄金时刻机位" : "1. Landmark Golden Hour Spot",
          subtitle: language === 'zh' ? "广角顺光构图，捕捉晨昏光影" : "Wide angle composition",
          image: matchDestinationImage(tripTitle, 'photo').url,
          tipsAvatars: ["🌅", "📷"],
          params: language === 'zh' ? "广角镜头 · 黄金时刻" : "Wide Angle · Golden Hour"
        }
      ],
      dataSources: [
        language === 'zh' ? "权威旅行指南与智能知识底座" : "Travel Guides & AI Knowledge Base"
      ]
    };
  }

  return null;
}

/**
 * 客户端智能离线兜底推演规划器（保障即使网络离线也能瞬间呈现 100% 完整的旅行规划看板）
 */
export function generateClientFallbackPlan(query = "", language = "zh") {
  const q = String(query).toLowerCase().trim();

  // 意图前置判定：功能问询、问候引导与自我介绍
  const capabilityTriggers = [
    "你好", "您好", "hi", "hello", "嗨", "在吗", "早上好", "下午好", "晚上好",
    "你能干什么", "你能做什么", "你能帮我", "你可以做什么", "你是谁", "介绍一下自己", "介绍一下", "功能", "怎么用", "如何使用", "what can you do", "who are you", "help", "帮助"
  ];
  if (capabilityTriggers.some(t => q === t || (q.length <= 15 && q.includes(t)))) {
    return {
      needs_more_info: true,
      follow_up_question: language === 'zh'
        ? `您好！我是您的 **Roam AI 智能旅行规划师与向导** ✈️\n\n我可以为您提供全方位、专业且高品质的全球深度旅行规划与实时咨询服务：\n\n✨ **核心功能亮点：**\n1. 🗺️ **全球全域路线规划**：覆盖新疆、西藏、云南、日本、法国、冰岛、瑞士及全球任意目的地，支持自驾、徒步、亲子、蜜月等多主题。\n2. ⏱️ **每日精密时空动线**：生成包含早中晚节点、交通耗时、避坑贴士的 Timeline 路线看板。\n3. 📸 **专业级摄影出片指南**：提供精确到机位坐标、最佳光线时刻（黄金/蓝调时刻）、镜头焦段与曝光参数推荐。\n4. 🍜 **地道风物美食甄选**：挖掘真正当地口碑必吃榜，告别千篇一律的游客陷阱。\n5. 🎫 **预订清单与行前核验**：一键生成机票/租车/门票/特许通行证 CheckList 并支持全屏打钩管理。\n\n💡 **您可以直接这样问我：**\n- *“新疆赛里木湖和伊犁 5 天自驾，想要拍摄雪山草甸”*\n- *“我想去日本自驾游玩 5 人，告诉我详细安排”*\n- *“计划巴黎 5 天深度艺术与美食自由行”*\n- *“冰岛 7 天冬季追极光与蓝冰洞探险”*`
        : `Hello! I am your **Roam AI Travel Planner & Guide** ✈️\n\nI can craft high-quality personalized travel itineraries across the globe:\n- 🗺️ Global Itinerary Planning (Xinjiang, Japan, Paris, Iceland, Switzerland, etc.)\n- ⏱️ Detailed Daily Timelines with transport & tips\n- 📸 Photography Guides with camera settings & focal length\n- 🍜 Authentic Cuisine & Must-Visit Sights\n- 🎫 Booking Checklists & Permit Verification\n\nTry asking: *"5-day road trip to Japan with friends"* or *"Xinjiang Sayram Lake & Ili 5-day photo tour"*!`
    };
  }

  // 1. 长三角 / 江南水乡 / 莫干山 / 苏杭 / 乌镇 / 千岛湖 / 周末家庭休闲度假
  if (/长三角|江南|莫干山|西湖|乌镇|西塘|千岛湖|安吉|苏杭|苏州|杭州|太湖/i.test(q)) {
    const isWeekend = /周末|双休|两天|2天|2日/i.test(q);
    const daysCount = isWeekend ? 2 : 3;
    const rawDelta = {
      title: language === "zh" ? `长三角 ${daysCount} 天江南水乡与莫干山竹海家庭休闲度假之旅` : `Yangtze River Delta ${daysCount}-Day Scenic Family Getaway`,
      summary: language === "zh"
        ? "专为家庭休闲度假定制的江南诗意动线：乘摇橹船穿行西溪湿地芦苇水道，住进莫干山竹海温泉美宿，打卡乌镇水阁夜色与正宗地道本帮美食。"
        : "Curated bespoke family leisure journey exploring Xixi Wetland, Moganshan bamboo forest retreats, and scenic Wuzhen water town.",
      data_sources: [
        language === "zh" ? "江浙沪文旅官方休闲度假指南" : "Jiangnan Tourism Official Guides",
        language === "zh" ? "长三角自驾路况与民宿精选库" : "Yangtze Delta Roadtrip & Resort Database"
      ],
      itineraries: [
        {
          day: 1,
          theme: language === "zh" ? "杭州西溪国家湿地 ➔ 龙井茶园漫步 ➔ 西湖晚霞与地道杭帮菜" : "Hangzhou Xixi Wetland ➔ Longjing Tea Plantation",
          morning: language === "zh" ? "抵达杭州，前往西溪国家湿地公园乘传统木船摇橹，穿行芦苇水道感受负氧离子清新空气与水乡野趣。" : "Arrive in Hangzhou, cruise through peaceful reed waterways on traditional wooden boats.",
          afternoon: language === "zh" ? "前往西湖龙井村，漫步万亩翠绿茶园，体验手工制茶文化与冲泡明前西湖龙井。" : "Stroll picturesque Longjing tea terraces and learn artisanal tea brewing.",
          evening: language === "zh" ? "漫步西湖断桥或南山路，品尝正宗杭州名菜西湖醋鱼、龙井虾仁、东坡肉与叫花鸡。" : "Walk along West Lake lakeside, enjoying authentic Dongpo pork and Longjing shrimp.",
          transport: language === "zh" ? "高铁抵达杭州东站打车 / 自驾约 30 分钟" : "High-speed rail to Hangzhou East / 30 min drive",
          tips: language === "zh" ? "西溪湿地摇橹船推荐在周家村码头登船，水流平缓老少皆宜。" : "Board wooden boats at Zhoujiacun dock for calm scenic rides."
        },
        {
          day: 2,
          theme: language === "zh" ? "莫干山国家级度假区 ➔ 剑池飞瀑 ➔ 庾村欧式复古小镇 ➔ 竹海私汤" : "Moganshan Bamboo Sea ➔ Yucun Heritage Village",
          morning: language === "zh" ? "驱车前往莫干山风景区，漫步万亩翠竹林海，打卡剑池清凉飞瀑与民国避暑官邸。" : "Drive to Moganshan alpine resort, exploring cool waterfalls and lush bamboo valleys.",
          afternoon: language === "zh" ? "探访莫干山脚下庾村文化市集，打卡民国风情车站、布罗蓝咖啡馆与文艺书店。" : "Explore vintage Yucun village market, artisanal cafés and bookshops.",
          evening: language === "zh" ? "入住莫干山精品竹海民宿，享用竹林地道土鸡煲、清蒸太湖白鱼与笋干炖肉，享受私汤星空之夜。" : "Stay at boutique hillside villa with soothing private hot springs and farm-fresh feast.",
          transport: language === "zh" ? "自驾景观公路约 1.5 小时" : "Scenic drive ~1.5 hours",
          tips: language === "zh" ? "莫干山盘山路弯多坡陡，家庭自驾请减速慢行，建议提前预订景区接驳车。" : "Winding mountain roads; keep safe speed on descents."
        },
        {
          day: 3,
          theme: language === "zh" ? "乌镇西栅水乡 ➔ 木心美术馆 ➔ 水阁摇橹船 ➔ 满载温馨返程" : "Wuzhen Water Town ➔ Muxin Museum ➔ Departure",
          morning: language === "zh" ? "前往江南第一古镇乌镇西栅，打卡草木本色染坊、昭明书院与木心美术馆。" : "Visit ancient canal town Wuzhen, exploring dye workshops and Muxin Art Museum.",
          afternoon: language === "zh" ? "乘坐特色木制摇橹船穿行水阁人家，品尝乌镇定胜糕、三白酒与红烧羊肉。" : "Glide through tranquil stone bridges on traditional boats sampling local delicacies.",
          evening: language === "zh" ? "选购乌镇姑嫂饼与杭白菊特产伴手礼，驱车或乘高铁踏上返程。" : "Shop for artisanal chrysanthemum tea gifts and head home with fond memories.",
          transport: language === "zh" ? "自驾约 1 小时 / 嘉兴高铁返程" : "Drive ~1h / High speed rail home",
          tips: language === "zh" ? "乌镇西栅石桥较多，带婴儿车家庭可选择沿河平缓游步道。" : "Many historic steps in water town; barrier-free lakeside paths available."
        }
      ].slice(0, daysCount),
      must_visit_spots: [
        {
          name: language === "zh" ? "杭州西溪国家湿地公园" : "Hangzhou Xixi National Wetland Park",
          category: "经典地标",
          highlight: language === "zh" ? "独具特色的江南水网湿地，家庭摇橹船穿梭芦苇水道与水阁。" : "Scenic natural wetland reserve with family wooden boat rides through lush reeds."
        },
        {
          name: language === "zh" ? "莫干山翠竹林海与庾村市集" : "Moganshan Bamboo Forest & Yucun Market",
          category: "经典地标",
          highlight: language === "zh" ? "世界级避暑胜地，欧式民国复古风情与万亩负氧离子竹海。" : "World-renowned alpine retreat with vintage village vibes and refreshing air."
        },
        {
          name: language === "zh" ? "乌镇西栅水乡与木心美术馆" : "Wuzhen Historic Water Town & Muxin Museum",
          category: "经典地标",
          highlight: language === "zh" ? "江南最美水乡古镇，临河古建水阁与璀璨夜景。" : "China's premier historic water town with glowing riverside night lantern views."
        },
        {
          name: language === "zh" ? "江南正宗东坡肉与千岛湖浓汤鱼头" : "Authentic Dongpo Pork & Qiandao Fish Soup",
          category: "地道美食",
          highlight: language === "zh" ? "软糯红亮入口即化，高汤奶白鲜美浓郁滋补。" : "Melt-in-your-mouth slow-braised pork belly and rich organic lake fish broth."
        }
      ],
      photo_guides: [
        {
          location: language === "zh" ? "莫干山庾村复古钟楼广场" : "Moganshan Yucun Clock Tower Square",
          best_time: language === "zh" ? "清晨 07:30 - 09:00" : "07:30 - 09:00 Morning",
          composition_tips: language === "zh" ? "以民国风黄色复古钟楼与法桐树荫为背景，拍摄欧式文艺风家庭度假大片。" : "Frame yellow clock tower under vintage plane trees for chic family portraits.",
          camera_params: language === "zh" ? "24-70mm f/4 · 1/200s · ISO 100" : "24-70mm f/4 · 1/200s · ISO 100",
          outfit_color: language === "zh" ? "浅色棉麻休闲装 / 亲子同色系" : "Light Linen / Family Matching Tones"
        },
        {
          location: language === "zh" ? "乌镇西栅安渡坊水阁倒影" : "Wuzhen Ancient Water Pavilion Reflection",
          best_time: language === "zh" ? "傍晚蓝调时刻 18:30 - 19:45" : "18:30 - 19:45 Blue Hour",
          composition_tips: language === "zh" ? "广角捕捉临河水阁暖黄色灯笼亮起瞬间，水面如镜倒映古石桥与摇橹船。" : "Wide angle catching warm lantern glows reflecting off tranquil historic canals.",
          camera_params: language === "zh" ? "16-35mm f/8 · 2s (慢门) · ISO 100" : "16-35mm f/8 · 2s · ISO 100",
          outfit_color: language === "zh" ? "新中式旗袍 / 优雅素雅风衣" : "Neo-Chinese / Classic Trench Coats"
        }
      ]
    };
    return transformBackendPlan(rawDelta, language);
  }
  
  if (q.includes("新疆") || q.includes("赛里木湖") || q.includes("伊犁") || q.includes("独库") || q.includes("那拉提") || q.includes("禾木") || q.includes("喀纳斯")) {
    const rawXinjiang = {
      title: language === "zh" ? "新疆伊犁与赛里木湖 5 天深度自驾风光之旅" : "Xinjiang Ili & Sayram Lake 5-Day Scenic Roadtrip",
      summary: language === "zh" 
        ? "贯穿赛里木湖、果子沟大桥、那拉提空中草原与独库公路北段，领略大西洋最后一滴眼泪的纯净与天山雪山草原壮景。" 
        : "5-day scenic drive through Sayram Lake, Guozigou Bridge, Nalati Grassland, and Duku Highway.",
      data_sources: [
        language === "zh" ? "新疆文旅官方自驾路况指南" : "Xinjiang Official Tourism Guides",
        language === "zh" ? "全网即时气象与摄影机位数据库" : "Live Weather & Photography Database"
      ],
      itineraries: [
        {
          day: 1,
          theme: language === "zh" ? "抵达伊宁 ➔ 六星街手风琴与蓝色民居" : "Arrive in Yining ➔ Liuxing Street",
          morning: language === "zh" ? "抵达伊宁机场/车站，提取 4WD SUV 自驾车辆，采购沿途干粮与保暖衣物。" : "Arrive in Yining, pick up 4WD rental SUV and gather road trip supplies.",
          afternoon: language === "zh" ? "漫步六星街与喀赞其民俗区，欣赏天蓝色维吾尔族特色庭院与手风琴博物馆。" : "Stroll colorful Liuxing Street and Kazanqi folk culture district.",
          evening: language === "zh" ? "打卡特色丝路风味餐厅，品尝现烤羊肉串、手工酸奶冰淇淋与烤包子。" : "Dine at local Uyghur restaurant featuring fresh lamb kebabs and ice cream.",
          transport: language === "zh" ? "市区自驾 20km (约 30 分钟)" : "City driving 20km (~30 min)",
          tips: language === "zh" ? "初到新疆注意温差，伊宁日落较晚（约 21:30），可充分安排晚间行程。" : "Large day/night temperature difference; sunset is late around 21:30."
        },
        {
          day: 2,
          theme: language === "zh" ? "赛里木湖 ➔ 大西洋最后一滴眼泪全景环湖" : "Sayram Lake ➔ Full Perimeter Scenic Loop",
          morning: language === "zh" ? "由伊宁出发沿连霍高速北上，经果子沟驶入赛里木湖东门，办理自驾通行许可。" : "Drive north via G30 expressway to Sayram Lake East Gate for vehicle permit.",
          afternoon: language === "zh" ? "顺时针环湖 90 公里，依次停靠月亮湾、点将台、克勒涌珠天鹅停歇点与松树头。" : "90km perimeter scenic loop visiting Moon Bay, Dianjiangtai, and Swan Haven.",
          evening: language === "zh" ? "在西海草原欣赏雪山连峰与金色日落倒影，晚间入住湖畔星空营地或特色毡房。" : "Sunset reflection over Western Sea grassland; stay at lakeside stargazing lodge.",
          transport: language === "zh" ? "高速+环湖自驾 160km (约 3 小时)" : "Scenic loop drive 160km (~3h)",
          tips: language === "zh" ? "湖面海拔约 2070 米，紫外线强且湖风强劲，请备足防风冲锋衣与高倍防晒。" : "Altitude 2070m with strong winds; bring windproof jackets and sun protection."
        },
        {
          day: 3,
          theme: language === "zh" ? "果子沟特大桥 ➔ 薰衣草庄园 ➔ 特克斯八卦城" : "Guozigou Bridge ➔ Lavender Farm ➔ Tekes Bagua City",
          morning: language === "zh" ? "清晨在松树头拍摄赛里木湖晨曦，随后驶出南门前往果子沟大桥观景台。" : "Sunrise over lake from Songshutou, then scenic lookouts of Guozigou Bridge.",
          afternoon: language === "zh" ? "穿越霍城万亩薰衣草花田（6-7月花季），随后前往无红绿灯的特克斯八卦城。" : "Drive past Huocheng lavender fields to mysterious Bagua ancient city.",
          evening: language === "zh" ? "登临八卦城太极坛全景观览城市中轴，夜市品尝地道伊犁马肠子与手工面肺子。" : "Panoramic view of Bagua octagonal layout and taste local night market dishes.",
          transport: language === "zh" ? "景观公路自驾 220km (约 4 小时)" : "Scenic highway drive 220km (~4h)",
          tips: language === "zh" ? "果子沟大桥沿途山路弯道较多，行车请严格保持车距。" : "Winding mountain highway; keep safe following distance."
        },
        {
          day: 4,
          theme: language === "zh" ? "那拉提草原 ➔ 空中草原与雪山云杉林海" : "Nalati Grassland ➔ Aerial Meadow & Alpine Forest",
          morning: language === "zh" ? "沿巩乃斯河谷驱车前往那拉提景区，换乘观光车或自驾进入核心空中草原。" : "Drive along Kunges River Valley to Nalati World Natural Heritage site.",
          afternoon: language === "zh" ? "徒步或骑马漫游天界台与游牧人家，近距离拍摄雪山连峰下的哈萨克牧群。" : "Trek to Tianjietai plateau view with grazing Kazakh sheep and horses.",
          evening: language === "zh" ? "在哈萨克毡房体验传统迎宾奶茶与手抓羊肉，欣赏冬不拉弹唱晚会。" : "Traditional Kazakh welcoming dinner with Dombra musical performance.",
          transport: language === "zh" ? "草原景观路 150km (约 2.5 小时)" : "Grassland scenic road 150km (~2.5h)",
          tips: language === "zh" ? "空中草原海拔起伏较大，骑马体验请认准景区正规马队并佩戴头盔。" : "Use official guided equestrian stations with safety helmets."
        },
        {
          day: 5,
          theme: language === "zh" ? "独库公路北段精华 ➔ 乔尔玛烈士陵园 ➔ 返程" : "Duku Highway North ➔ Qiaorma Memorial ➔ Departure",
          morning: language === "zh" ? "沿独库公路翻越哈希勒根达坂（海拔 3390 米），观赏一天经历四季的冰雪与峡谷奇观。" : "Drive iconic Duku Highway crossing Hashilegen Pass (3390m).",
          afternoon: language === "zh" ? "抵达乔尔玛缅怀筑路先烈，随后沿景观大道返程前往机场办理还车手续。" : "Visit Qiaorma Monument and return vehicle at airport terminal.",
          evening: language === "zh" ? "满载新疆大美风光回忆与特产伴手礼，踏上返程航班。" : "Depart with unforgettable memories and local artisanal gifts.",
          transport: language === "zh" ? "高山公路 180km (约 3.5 小时)" : "Mountain pass drive 180km (~3.5h)",
          tips: language === "zh" ? "独库公路每年 6-10 月通车，遇雨雪天气可能临时交通管制，请提前核验路况。" : "Duku pass is seasonal (Jun-Oct); monitor real-time weather and pass status."
        }
      ],
      must_visit_spots: [
        {
          name: language === "zh" ? "赛里木湖 (Sayram Lake)" : "Sayram Lake",
          category: "经典地标",
          highlight: language === "zh" ? "大西洋最后一滴眼泪，纯净如镜的深蓝高山湖泊与雪山倒影。" : "Pristine alpine deep blue lake framed by snow-capped peaks."
        },
        {
          name: language === "zh" ? "新疆大盘鸡与现烤包子" : "Xinjiang Big Plate Chicken & Baked Buns",
          category: "地道美食",
          highlight: language === "zh" ? "浓郁香辣沙糯土豆配皮带面，外酥里嫩爆汁羊肉烤包子。" : "Savory spiced chicken with hand-pulled noodles and juicy crispy lamb buns."
        },
        {
          name: language === "zh" ? "果子沟大桥 (Guozigou Bridge)" : "Guozigou Bridge",
          category: "经典地标",
          highlight: language === "zh" ? "天山峡谷中的双塔斜拉巨桥，被誉为伊犁第一壮丽景致。" : "Majestic cable-stayed bridge soaring over lush Tianshan pine valleys."
        },
        {
          name: language === "zh" ? "那拉提空中草原 (Nalati Meadow)" : "Nalati Sky Meadow",
          category: "经典地标",
          highlight: language === "zh" ? "高山之巅的立体草原画卷，哈萨克牧民炊烟与森林绿毯。" : "High altitude undulating alpine pasture with Kazakh pastoral camps."
        }
      ],
      photo_guides: [
        {
          location: language === "zh" ? "赛里木湖克勒涌珠日出机位" : "Sayram Lake Keleyongzhu Sunrise",
          best_time: language === "zh" ? "清晨 06:30 - 07:40" : "06:30 - 07:40 Dawn",
          composition_tips: language === "zh" ? "长焦 70-200mm 顺光拍摄晨曦金光浸染雪山冰峰，低角度纳入岸边清澈波光。" : "Telephoto 70-200mm catching golden alpine light with crystal water.",
          camera_params: language === "zh" ? "ISO 100 · f/8.0 · 1/250s · CPL 偏振镜" : "ISO 100 · f/8.0 · 1/250s · CPL",
          outfit_color: language === "zh" ? "红/白/驼色冲锋衣或长裙" : "Red / White / Camel Outerwear"
        },
        {
          location: language === "zh" ? "果子沟大桥南观景台全景" : "Guozigou Bridge South Viewpoint",
          best_time: language === "zh" ? "傍晚 19:30 - 21:00" : "19:30 - 21:00 Golden Hour",
          composition_tips: language === "zh" ? "超广角 16-35mm 构图，利用公路曲线引导视线延伸至峡谷大桥主体。" : "Ultra-wide 16-35mm using road curve leading to bridge tower.",
          camera_params: language === "zh" ? "ISO 100 · f/11 · 1/60s · 三脚架" : "ISO 100 · f/11 · 1/60s · Tripod",
          outfit_color: language === "zh" ? "户外工装亮色系" : "Bright Outdoor Gear"
        },
        {
          location: language === "zh" ? "那拉提游牧人家晨雾光影" : "Nalati Nomadic Camp Morning Mist",
          best_time: language === "zh" ? "晨间 07:00 - 08:30" : "07:00 - 08:30 Morning Mist",
          composition_tips: language === "zh" ? "侧逆光捕捉阳光穿透云杉林与炊烟形成的丁达尔光束，中焦抓拍奔跑骏马。" : "Side-backlight capturing Tyndall beams through pines and yurts.",
          camera_params: language === "zh" ? "ISO 200 · f/4.0 · 1/500s · 连续对焦" : "ISO 200 · f/4.0 · 1/500s · AF-C",
          outfit_color: language === "zh" ? "民族刺绣或浅色系披肩" : "Ethnic Shawl / Light Colors"
        }
      ]
    };
    return transformBackendPlan(rawXinjiang, language);
  }

  // 默认根据关键词智能清洗提取目的地与天数，生成通用高保真方案
  const isWeekend = /周末|双休|两天|2天|2日/i.test(q);
  const is3Days = /3天|3日|三天|小长假/i.test(q);
  const is7Days = /7天|7日|七天|一周|国庆/i.test(q);
  const daysCount = isWeekend ? 2 : (is3Days ? 3 : (is7Days ? 7 : 5));

  let cleanStr = query
    .replace(/^(帮我|请帮我|给我|麻烦|我想|我们想|计划|打算|准备)?\s*(规划|制定|设计|安排|生成|推荐|出一份|出一个|写一个)?\s*(一个|一份|下)?/gi, '')
    .replace(/(的路线|的方案|的行程|的攻略|攻略|方案|行程|旅游|旅行|自由行|自驾游|自驾|休闲游|度假|玩玩|游玩|怎么玩|怎么安排|有什么推荐|详细安排|带娃|亲子|家庭)?$/gi, '')
    .replace(/(周末|小长假|五一|十一|国庆|暑期|寒假|亲子|家庭|情侣|毕业|闺蜜|自驾|休闲|深度|徒步|摄影|\d+人|\d+天|\d+日)/gi, '')
    .replace(/[，,。？?！!的个一份]/g, '')
    .trim();

  const destName = cleanStr.length >= 2 ? cleanStr.slice(0, 10) : (language === "zh" ? "精选胜地" : "Destination");
  const rawGeneric = {
    title: language === "zh" ? `${destName} ${daysCount} 天深度风光与人文探索之旅` : `${destName} ${daysCount}-Day Bespoke Travel Itinerary`,
    summary: language === "zh" 
      ? `深度串联【${destName}】代表性自然风光、地标历史古迹与地道风味名店，专为品质旅行与摄影爱好者量身定制。`
      : `Comprehensive ${daysCount}-day bespoke journey featuring hallmark attractions, scenic photography, and local culinary gems in ${destName}.`,
    data_sources: [
      language === "zh" ? "全球权威旅游指南数据库" : "Global Travel Guides Database",
      language === "zh" ? "高精度时空动线与摄影算法" : "Spatial Route Optimization & Photo Guides"
    ],
    itineraries: [
      {
        day: 1,
        theme: language === "zh" ? `抵达【${destName}】 ➔ 核心地标初遇与夜景漫步` : `Arrival in ${destName} ➔ Hallmark Landmarks`,
        morning: language === "zh" ? "抵达目的地，办理入住手续与行程休整，了解当地公共交通或自驾动线。" : "Arrival, check in to hotel, refresh and review transit routes.",
        afternoon: language === "zh" ? "前往市中心历史文化街区，打卡代表性城市地标与建筑风光。" : "Visit central heritage district and iconic architectural landmarks.",
        evening: language === "zh" ? "品尝当地特色欢迎晚宴，欣赏城市/小镇璀璨夜景与街头风情。" : "Enjoy authentic welcome dinner and explore glowing night skyline.",
        transport: language === "zh" ? "市内轨道/出租车 15km (约 25 分钟)" : "City transit 15km (~25 min)",
        tips: language === "zh" ? "初到目的地注意根据当地时差调整作息，提前备好当地货币与乘车码。" : "Adjust to local time zone and keep transit pass handy."
      },
      {
        day: 2,
        theme: language === "zh" ? `核心风景名胜 ➔ 深度自然/艺术探索` : `Top Scenic Highlight ➔ In-depth Nature/Arts`,
        morning: language === "zh" ? "清晨避开人流前往核心自然风景区或艺术博物馆，享受宁静观览时光。" : "Early departure to main scenic park or national museum.",
        afternoon: language === "zh" ? "体验当地代表性观景步道或乘船/索道全景漫游，全方位领略风光。" : "Experience signature scenic trail, boat cruise, or cable car panoramas.",
        evening: language === "zh" ? "在观景餐厅享用特色料理，拍摄夕阳晚霞与蓝调时刻。" : "Dine with panoramic sunset views and capture blue hour light.",
        transport: language === "zh" ? "自驾/专线巴士 40km (约 45 分钟)" : "Scenic route 40km (~45 min)",
        tips: language === "zh" ? "建议提前在官网实名预约门票以走快速通道入园。" : "Pre-book timed tickets online for fast-track entry."
      },
      {
        day: 3,
        theme: language === "zh" ? `周边秘境探幽 ➔ 黄金摄影机位巡礼` : `Hidden Gems ➔ Golden Hour Photo Expedition`,
        morning: language === "zh" ? "前往周边小众原生态自然地貌或特色古村落，感受远离喧嚣的原生风情。" : "Explore surrounding countryside, historic village, or pristine landscape.",
        afternoon: language === "zh" ? "漫步特色手工艺街区或轻户外徒步，体验当地手作与原产地农贸风物。" : "Stroll artisan quarter or light trek; sample organic local harvest.",
        evening: language === "zh" ? "打卡当地高评分老字号餐厅，品尝正宗招牌名菜与特色甜品。" : "Savor time-honored heritage cuisine and signature desserts.",
        transport: language === "zh" ? "城际自驾/列车 60km (约 1 小时)" : "Intercity drive/train 60km (~1h)",
        tips: language === "zh" ? "户外区域紫外线充足，请备好遮阳帽与充足饮用水。" : "Pack sun protection and hydration for outdoor trails."
      },
      {
        day: 4,
        theme: language === "zh" ? `人文风土漫游 ➔ 地道市集与下午茶` : `Cultural Immersion ➔ Local Market & Cafe Break`,
        morning: language === "zh" ? "探访历史古迹、宫殿或地标大教堂，聆听专业语音导览了解历史变迁。" : "Tour historic castle, temple, or cathedral with audio guide.",
        afternoon: language === "zh" ? "在特色景观咖啡厅享用悠闲下午茶，选购当地特色手工艺纪念品与特产。" : "Enjoy scenic coffee break and browse local artisanal crafts.",
        evening: language === "zh" ? "体验特色夜市、音乐会或温泉水疗，洗去旅途疲惫。" : "Experience evening market, concert, or thermal spa relaxation.",
        transport: language === "zh" ? "公共交通 20km (约 30 分钟)" : "Public transit 20km (~30 min)",
        tips: language === "zh" ? "购买伴手礼可多比较几家，部分手工艺品支持退税服务。" : "Check tax refund eligibility on craft souvenirs."
      },
      {
        day: 5,
        theme: language === "zh" ? `景观晨光留影 ➔ 伴手礼采买 ➔ 顺利返程` : `Morning Farewell ➔ Souvenirs & Departure`,
        morning: language === "zh" ? "清晨漫步湖畔或观景台拍摄最后一组告别纪念大片，享用元气早餐。" : "Morning stroll for farewell photo memories and hearty breakfast.",
        afternoon: language === "zh" ? "办理退房，前往机场/车站办理行李托运与安检手续。" : "Check out and transfer to airport/station for departure.",
        evening: language === "zh" ? "满载美好回忆与照片素材，顺利抵达温馨家园。" : "Safe return home filled with unforgettable travel stories.",
        transport: language === "zh" ? "机场专线/出租车 30km (约 40 分钟)" : "Airport transfer 30km (~40 min)",
        tips: language === "zh" ? "建议提前 2-3 小时抵达机场办理值机退税与登机手续。" : "Arrive at airport 2-3 hours prior to departure."
      }
    ],
    must_visit_spots: [
      {
        name: language === "zh" ? `【${destName}】核心风景名胜区` : `${destName} Hallmark Scenic Area`,
        category: "经典地标",
        highlight: language === "zh" ? "不可错过的代表性地标胜境，汇聚当地自然与人文精粹。" : "Must-see iconic landmark representing the essence of the destination."
      },
      {
        name: language === "zh" ? `当地传统老字号招牌风味` : `Authentic Local Cuisine Specialty`,
        category: "地道美食",
        highlight: language === "zh" ? "精选当地高评分老店，品尝原汁原味地道风味与特色小吃。" : "Top-rated culinary experience featuring authentic local ingredients."
      },
      {
        name: language === "zh" ? `历史文化街区 / 全景观景台` : `Historic District / Panoramic Lookout`,
        category: "经典地标",
        highlight: language === "zh" ? "俯瞰城市与山海全景绝佳机位，摄影与休闲漫步皆宜。" : "Panoramic vista point offering stunning perspective for photography."
      }
    ],
    photo_guides: [
      {
        location: language === "zh" ? `${destName} 核心地标黄金时刻全景` : `${destName} Landmark Golden Hour`,
        best_time: language === "zh" ? "晨曦 06:30 - 07:30 / 傍晚 18:00 - 19:30" : "Dawn 06:30 / Dusk 18:30",
        composition_tips: language === "zh" ? "广角顺光构图，利用前景线条引导视线，捕捉晨昏冷暖交织的层次感。" : "Wide angle composition with leading lines capturing golden lighting.",
        camera_params: language === "zh" ? "广角镜头 16-35mm · ISO 100 · f/8.0" : "16-35mm · ISO 100 · f/8.0",
        outfit_color: language === "zh" ? "白色/亮色与背景形成对比" : "Bright contrasting colors"
      },
      {
        location: language === "zh" ? `${destName} 水系/山脊光影倒影机位` : `${destName} Reflection & Silhouette`,
        best_time: language === "zh" ? "午后斜阳 16:30 - 18:00" : "Afternoon Light 16:30 - 18:00",
        composition_tips: language === "zh" ? "配合偏振镜或慢门消除水面反光，对称构图突显倒影纯粹质感。" : "Use CPL filter to control reflections with symmetric framing.",
        camera_params: language === "zh" ? "标准变焦 24-70mm · ISO 100 · f/11" : "24-70mm · ISO 100 · f/11",
        outfit_color: language === "zh" ? "大地色或户外风" : "Earth tones / Outdoor gear"
      }
    ]
  };
  rawGeneric.itineraries = rawGeneric.itineraries.slice(0, daysCount);
  return transformBackendPlan(rawGeneric, language);
}
