export const DESTINATION_DATASETS = {
  newzealand: {
    zh: {
      tripTitle: "新西兰南岛 7 天绝美自驾与风光摄影之旅",
      tripSubtitle: "7 天行程 | 基督城 · 特卡波 · 库克山 · 瓦纳卡 · 皇后镇",
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
        ]
      },
      mustVisit: [
        {
          name: "库克山高山三文鱼 (Alpine Salmon)",
          image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=80",
          recommendations: "高海拔冰川冷水滋养，肉质紧致肥美、现切极鲜刺身。",
          tipsEmoji: "🍣🏔️",
          category: "地道美食"
        },
        {
          name: "好牧羊人教堂 (Good Shepherd)",
          image: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&auto=format&fit=crop&q=80",
          recommendations: "世界顶级暗夜星空保护区地标，石砌教堂与苍穹银河交相辉映。",
          tipsEmoji: "🌌⛪",
          category: "经典地标"
        },
        {
          name: "皇后镇 Fergburger 大汉堡",
          image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&auto=format&fit=crop&q=80",
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
          image: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&auto=format&fit=crop&q=80",
          tipsAvatars: ["🌌", "📷"],
          params: "14-24mm f/2.8 · 20s · ISO 3200"
        },
        {
          id: 2,
          title: "2. 罗伊斯峰山脊晨光俯瞰",
          subtitle: "黄金时刻逆光拍摄山脊蜿蜒延伸至瓦纳卡湖的绝美层次",
          image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80",
          tipsAvatars: ["🌅", "🏔️"],
          params: "24-70mm f/8 · 1/200s · ISO 100"
        },
        {
          id: 3,
          title: "3. 米尔福德峡湾教冠峰水面倒影",
          subtitle: "利用潮汐滩涂水面与 CPL 偏振镜，消除杂光捕获巍峨雪山倒影",
          image: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&auto=format&fit=crop&q=80",
          tipsAvatars: ["🌊", "🚢"],
          params: "16-35mm + CPL · 30s · ISO 100"
        }
      ]
    },
    en: {
      tripTitle: "New Zealand South Island Explorer",
      tripSubtitle: "7 Days | Oct 15-21, 2026",
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
          image: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&auto=format&fit=crop&q=80",
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
          image: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&auto=format&fit=crop&q=80",
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
      tripSubtitle: "7 天行程 | 浅草 · 涩谷 · 新宿 · 筑地 · 银座",
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
        ]
      },
      mustVisit: [
        {
          name: "筑地场外市场 (Tsukiji Market)",
          image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=80",
          recommendations: "东京美食厨房，现切海胆刺身与日式烤串极具风味。",
          tipsEmoji: "🍣🥢",
          category: "地道风味"
        },
        {
          name: "涩谷十字路口 (Shibuya Crossing)",
          image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=80",
          recommendations: "世界级地标，感受霓虹光影与人潮汹涌的赛博都市魅力。",
          tipsEmoji: "🚦✨",
          category: "经典地标"
        },
        {
          name: "三鹰之森吉卜力美术馆",
          image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80",
          recommendations: "宫崎骏动画的童话城堡，屋顶巨型机械兵与手稿原画必看。",
          tipsEmoji: "🎭🍃",
          category: "人文艺术"
        }
      ],
      photoGuides: [
        {
          id: 1,
          title: "1. 涩谷十字路口高空俯瞰",
          subtitle: "高角度俯拍，利用慢速快门捕捉穿梭不息的都市人潮流光",
          image: "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=80",
          tipsAvatars: ["🚦", "🏙️"],
          params: "24mm f/2.8 · 1/15s 慢门 · ISO 400"
        },
        {
          id: 2,
          title: "2. 浅草寺雷门框架构图",
          subtitle: "以雷门标志性红色大灯笼为画框前景，对称透视拍摄正殿",
          image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80",
          tipsAvatars: ["⛩️", "🏮"],
          params: "16-35mm f/8 · 1/250s · ISO 100"
        },
        {
          id: 3,
          title: "3. 东京铁塔经典街景透视",
          subtitle: "利用笔直街道作为视觉引导线，中焦大光圈虚化路面车灯光斑",
          image: "https://images.unsplash.com/photo-1536098561742-ca998e48cbcc?w=800&auto=format&fit=crop&q=80",
          tipsAvatars: ["🗼", "🚗"],
          params: "50mm f/1.8 · 1/60s 夜景 · ISO 800"
        }
      ]
    },
    en: {
      tripTitle: "Tokyo Autumn Escape",
      tripSubtitle: "7 Days | Oct 15-21, 2026",
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
        ]
      },
      mustVisit: [
        {
          name: "Tsukiji Outer Market",
          image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=80",
          recommendations: "Sushi & array of authentic seafood.",
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
          image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80",
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
          image: "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80",
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
 * 将后端返回的 TravelPlanResponse 动态转换为前端 Bento Grid 卡片所需的数据结构
 */
export function transformBackendPlan(apiPlan, language = 'zh') {
  if (!apiPlan || !apiPlan.itineraries || apiPlan.itineraries.length === 0) {
    return null;
  }

  const dailySchedules = {};
  apiPlan.itineraries.forEach((itin) => {
    const dayNum = itin.day || 1;
    dailySchedules[dayNum] = [
      {
        time: "09:00",
        activity: itin.morning || (language === 'zh' ? "上午景点探索" : "Morning Exploration"),
        location: itin.theme || (language === 'zh' ? "核心观光区" : "Scenic Area"),
        details: itin.transport ? `${language === 'zh' ? '交通: ' : 'Transport: '}${itin.transport}` : (language === 'zh' ? "特色观光与人文漫步" : "Sightseeing & Walk")
      },
      {
        time: "14:00",
        activity: itin.afternoon || (language === 'zh' ? "下午深度体验" : "Afternoon Experience"),
        location: itin.theme || (language === 'zh' ? "地标体验区" : "Landmark"),
        details: itin.tips ? `${language === 'zh' ? '贴士: ' : 'Tips: '}${itin.tips}` : (language === 'zh' ? "深度自然探索" : "Nature Exploration")
      },
      {
        time: "19:00",
        activity: itin.evening || (language === 'zh' ? "晚间特色美食与夜景" : "Evening Dining & Skyline"),
        location: language === 'zh' ? "特色风味街区 / 观景台" : "Local Cuisine & Skyline",
        details: language === 'zh' ? "打卡特色餐饮，观赏都市夜景" : "Sample local dining and enjoy views"
      }
    ];
  });

  const mustVisit = (apiPlan.must_visit_spots || []).map((spot) => ({
    name: spot.name,
    image: spot.image || "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&auto=format&fit=crop&q=80",
    recommendations: spot.highlight || (language === 'zh' ? "当地必打卡体验" : "Top recommended experience"),
    tipsEmoji: (spot.category?.includes("美食") || spot.category?.includes("小吃") || spot.category?.toLowerCase().includes("food")) ? "🍲🥢" : "🏛️✨",
    category: spot.category || (language === 'zh' ? "经典地标" : "Landmark")
  }));

  const photoGuides = (apiPlan.photo_guides || []).map((photo, idx) => ({
    id: idx + 1,
    title: `${idx + 1}. ${photo.location}`,
    subtitle: photo.composition_tips || (language === 'zh' ? "经典机位与构图指南" : "Composition & Lighting guide"),
    image: photo.image || "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80",
    tipsAvatars: ["📷", "🌅"],
    params: photo.best_time ? `${language === 'zh' ? '最佳时段: ' : 'Best time: '}${photo.best_time}` : (photo.outfit_color || "14-24mm f/2.8")
  }));

  const dayCount = Object.keys(dailySchedules).length;

  return {
    tripTitle: apiPlan.title || (language === 'zh' ? "定制智能旅行规划" : "Custom Travel Plan"),
    tripSubtitle: `${dayCount} ${language === 'zh' ? '天定制行程' : 'Days Plan'} | ${apiPlan.summary ? apiPlan.summary.slice(0, 36) + '...' : ''}`,
    summary: apiPlan.summary || "",
    dailySchedules,
    mustVisit: mustVisit.length > 0 ? mustVisit : undefined,
    photoGuides: photoGuides.length > 0 ? photoGuides : undefined,
    dataSources: apiPlan.data_sources || []
  };
}
