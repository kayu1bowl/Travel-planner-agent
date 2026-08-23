export const TRANSLATIONS = {
  zh: {
    nav: {
      home: "首页探索",
      itineraries: "行程规划",
      bookings: "预订清单",
      settings: "系统偏好",
      searchPlaceholder: "搜索行程与目的地...",
      exportPlan: "导出方案",
      copied: "已复制到剪贴板",
      newTrip: "新建行程"
    },
    welcome: {
      nav: {
        planner: "智能规划",
        spatial: "时空引擎",
        vision: "影像机位",
        knowledge: "知识底座",
        gallery: "全球画廊",
        enterDashboard: "进入看板 →"
      },
      badge: "OpenClaw Agent · 智能旅行规划系统",
      heroTitle: "理想之旅，一语成行",
      heroSubtitle: "融合权威旅游指南、实时路况气象核验与专业摄影机位，让每一次出发都从容不迫。",
      inputPlaceholder: "想去哪里？比如：带父母新西兰南岛自驾7天，不想太累，想看暗夜星空与吃三文鱼...",
      generateBtn: "开始智能规划",
      generatingBtn: "AI 正在结合知识库与全网信息规划中...",
      preferencesTitle: "偏好标签",
      preferences: [
        { label: "🚗 深度自驾", tag: "自驾" },
        { label: "🌌 暗夜星空", tag: "摄影与暗夜星空" },
        { label: "📸 精选机位", tag: "专业风光机位" },
        { label: "🍜 地道风物", tag: "地道风味与美食" },
        { label: "🏔️ 冰川徒步", tag: "轻度徒步与自然" },
        { label: "👨‍👩‍👧 亲子度假", tag: "亲子家庭与轻松节奏" }
      ],
      telemetry: [
        "权威指南与私有知识底座",
        "联网路况与气象辅助核验",
        "智能时空动线规划推演",
        "避坑防雷实用出行建议"
      ],
      spatialEngine: {
        badge: "SPATIAL-TEMPORAL ROUTING ENGINE",
        title: "时空动线规划，让每一段探索清晰可循",
        subtitle: "合理拆解地理动线、行车节奏与自然采光时段，为每日行程提供清晰参考。",
        metrics: [
          { value: "安全", label: "避坑防雷提示", desc: "提示高危路段、季节风险与行车注意事项" },
          { value: "权威", label: "步道与景区指南", desc: "结合官方安全分级与建议游玩耗时" },
          { value: "推荐", label: "最佳光影时段", desc: "参考晨昏日出日落光线推荐摄影窗口" }
        ],
        cardTitle: "示范路线：南岛高山湖泊动线推演",
        cardDesc: "基督城 ➔ 特卡波湖 (SH80) ➔ 库克山冰川 ➔ 瓦纳卡 ➔ 皇后镇",
        nodes: [
          { label: "基督城 (起)", sub: "提车补给 0km" },
          { label: "特卡波湖 (暗夜)", sub: "暗夜银河 225km" },
          { label: "库克山 (冰川)", sub: "胡克谷步道 330km" },
          { label: "瓦纳卡 (湖畔)", sub: "孤独之树 510km" },
          { label: "皇后镇 (终)", sub: "峡湾与离境 650km" }
        ]
      },
      proVision: {
        badge: "PRO OPTICS & ASTROPHOTOGRAPHY",
        title: "每一处风景，都是大场面",
        subtitle: "精选专业风光摄影机位，包含推荐焦段、曝光参数与拍摄时段建议。",
        spots: [
          {
            name: "好牧羊人教堂 · 暗夜银河",
            lens: "14-24mm f/2.8",
            params: "14mm · f/2.8 · 20s · ISO 3200",
            window: "银河升起 23:30 - 03:15",
            tip: "超广角低机位仰拍，石砌教堂作为前景纳整片银河拱桥。"
          },
          {
            name: "罗伊斯山峰 · 晨光云海",
            lens: "24-70mm f/4",
            params: "35mm · f/8 · 1/200s · ISO 100",
            window: "黄金时刻 06:15 - 07:00",
            tip: "逆光拍摄山脊延伸至瓦纳卡湖，使用 CPL 偏振镜消除水面杂光。"
          },
          {
            name: "米尔福德峡湾 · 主教冠峰倒影",
            lens: "16-35mm + CPL",
            params: "16mm · f/11 · 30s · ISO 100",
            window: "蓝调时刻 07:20 - 08:00",
            tip: "利用退潮沙滩水面长曝光消除水波，捕捉倒映在冰川海水的雪山。"
          }
        ]
      },
      knowledgeMesh: {
        badge: "DUAL-ENGINE KNOWLEDGE BASE",
        title: "双引擎驱动的知识底盘体系",
        subtitle: "结合私有 RAG 向量知识库与智能体时空推理，为行程规划提供可靠的事实依据。",
        layers: [
          { 
            num: "01", 
            name: "官方步道与暗夜保护区知识底座", 
            tag: "ChromaDB 向量检索 · 事实检索",
            desc: "结构化录入新西兰环保署（DOC）等官方步道安全评级、往返耗时、季节注意事项与暗夜保护区规范，有效减少大模型生成幻觉。",
            image: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&auto=format&fit=crop&q=80"
          },
          { 
            num: "02", 
            name: "联网搜索与实时气象核验", 
            tag: "天气检索 · 交通状况参考",
            desc: "辅助核验目的地实时天气状况、日出日落时刻与道路交通指引，动态评估出行能见度与穿搭装备。",
            image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80"
          },
          { 
            num: "03", 
            name: "OpenClaw 智能体时空规划与节奏编排", 
            tag: "结构化推理 · 行程逻辑编排",
            desc: "智能权衡每日合理驾驶距离、同行人体能节奏、黄金采光窗口与餐厅营业时间，输出严谨顺路的自驾行程单。",
            image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80"
          },
          { 
            num: "04", 
            name: "Bento Grid 便士网格多维动态交互呈现层", 
            tag: "结构化信息矩阵 · 清晰直观呈现",
            desc: "将繁杂的时空路线、官方步道指南、摄影机位建议与地道风物美食转化为直观的便士网格布局，支持一键沉浸式交互。",
            image: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&auto=format&fit=crop&q=80"
          }
        ]
      },
      inspirations: {
        badge: "INSPIRATION MATRIX",
        title: "探索全球灵感画廊",
        subtitle: "点击任意精选路线，立即一键载入 AI 规划舱。",
        items: [
          { title: "🇳🇿 新西兰南岛 7 天自驾与暗夜星空", query: "计划新西兰南岛7天自驾之旅，重点特卡波暗夜星空、库克山胡克谷冰川与皇后镇美食，包含专业摄影机位", tag: "风光自驾" },
          { title: "🗼 东京 7 天动漫圣地与米其林漫游", query: "计划东京7天深度游，涵盖浅草古刹、涩谷十字路口夜景、秋叶原动漫与筑地海鲜市场美食", tag: "城市人文" },
          { title: "🇨🇭 瑞士阿尔卑斯 10 天全景列车", query: "瑞士10天黄金列车与冰川快车全景游，游览少女峰、马特洪峰与日内瓦湖", tag: "雪山列车" },
          { title: "🇨🇳 贵州 5 天喀斯特瀑布与苗寨秘境", query: "贵州5天自驾摄影游，涵盖黄果树大瀑布、荔波小七孔与西江千户苗寨", tag: "秘境探索" }
        ]
      },
      bottomCta: {
        title: "准备好开启您的梦想之旅了吗？",
        subtitle: "告诉 OpenClaw Agent 您的想法，快速为您呈现结构化定制方案。",
        startBtn: "立即开启智能规划",
        demoBtn: "直接浏览精选标杆看板 →"
      },
      carousel: {
        prevSlide: "上一张大片",
        nextSlide: "下一张大片",
        prevSpot: "上一机位",
        nextSpot: "下一机位",
        pauseAuto: "暂停自动轮播",
        resumeAuto: "恢复自动轮播",
        readyBadge: "知识底座就绪 · 智能编排中",
        loadAndPlan: "一键载入并智能规划"
      }
    },
    sidebar: {
      title: "Roam 智能向导",
      subtitle: "AI 旅行规划师",
      quickNZ: "🇳🇿 新西兰南岛7天自驾",
      quickTokyo: "🗼 东京7天金秋漫游",
      inputPlaceholder: "输入你的旅行想法或修改要求...",
      welcomeMsg: "你好！请告诉我你的旅行想法，无论是目的地、游玩天数、偏好风格还是预算，我都能为你定制高品质行程～",
      userDefaultMsg: "想规划一次 7 天新西兰南岛自驾，重点想要风光摄影、暗夜星空和特色美食。",
      aiDefaultReply: "太棒了！已结合私有知识库指南并检索即时天气与路况，以下是为您量身定制的完整行程！",
      ragStatusPill1: "🔍 检索知识库匹配相关官方步道与指南",
      ragStatusPill2: "🌐 联网核验：已同步最新天气与自驾路线建议",
      ragTokyoPill1: "🔍 检索东京秋季红叶情报与地道美食指南",
      ragTokyoPill2: "✨ 便士网格 (Bento Grid) 结构化日程排版完成",
      thinkingText: "正在结合知识库与全网信息生成行程规划...",
      aiReplyTokyo: "东京 7 天金秋漫游方案已就绪！从浅草古刹祈福到涩谷街头霓虹光影，尽享极致视觉与味蕾盛宴。",
      aiReplyNZ: "新西兰南岛 7 天方案已更新！从特卡波暗夜银河到库克山冰川轻徒步，为您呈现大片级自驾路线。"
    },
    cards: {
      dailyScheduleTitle: "每日行程路线",
      dailyTimelineEyebrow: "DAILY TIMELINE · 路线节点",
      dayPrefix: "第",
      daySuffix: "天",
      dayBtnPrefix: "Day ",
      tableCols: {
        time: "时刻",
        activity: "行程活动",
        location: "地点 / 区域",
        details: "细节与体验"
      },
      mustVisitTitle: "必去地标与风味美食",
      tasteSightsEyebrow: "TASTE & SIGHTS · 风物指南",
      allCategories: "全部",
      foodCategory: "🍲 美食",
      landmarkCategory: "🏛️ 地标",
      recommendationsLabel: "推荐理由: ",
      openHoursLabel: "建议游玩时间: ",
      pricingLabel: "门票/人均: ",
      tipsLabel: "避坑指南: ",
      spotsTitle: "摄影机位与出片指南",
      photoGuideTitle: "摄影机位与出片指南",
      visualExpeditionEyebrow: "VISUAL EXPEDITION · 摄影出片指南",
      expeditionEyebrow: "EXPEDITION · 专属定制路线档案",
      tipsPrefix: "贴士:",
      copySpotBtn: "复制机位建议",
      shareSpotBtn: "分享机位文案",
      paramsLabel: "推荐参数",
      photoTipsLabel: "拍摄建议: ",
      bestTimeLabel: "最佳机位时刻: ",
      lensLabel: "推荐焦段: ",
      weatherTitle: "当地实时天气与穿衣建议",
      tempLabel: "气温: ",
      conditionLabel: "天气状况: ",
      clothingLabel: "穿衣穿搭: ",
      packingLabel: "携带装备: ",
      allDay: "全天",
      imageSourceTitle: "图片数据源: ",
      copySuccess: "已复制到剪贴板！",
      shareSuccess: "已复制分享文案"
    }
  },
  en: {
    nav: {
      home: "Home",
      itineraries: "Itineraries",
      bookings: "Bookings",
      settings: "Settings",
      searchPlaceholder: "Search trips...",
      exportPlan: "Export Plan",
      copied: "Copied",
      newTrip: "New Trip"
    },
    welcome: {
      nav: {
        planner: "Planner",
        spatial: "Spatial Engine",
        vision: "Pro Vision",
        knowledge: "Architecture",
        gallery: "Gallery",
        enterDashboard: "Dashboard →"
      },
      badge: "OpenClaw Agent · Intelligent Travel Planner",
      heroTitle: "Your Ideal Journey, One Sentence Away",
      heroSubtitle: "Uniting verified travel guides, live weather & route checks, and curated photography spots for effortless travels.",
      inputPlaceholder: "Where would you like to go? e.g. 7-day South Island NZ road trip with parents, relaxed pace, stargazing and salmon dining...",
      generateBtn: "Start AI Planning",
      generatingBtn: "AI is Crafting Your Itinerary...",
      preferencesTitle: "Preferences",
      preferences: [
        { label: "🚗 Road Trip", tag: "Road Trip" },
        { label: "🌌 Dark Sky", tag: "Stargazing & Dark Sky" },
        { label: "📸 Pro Spots", tag: "Pro Photography Spots" },
        { label: "🍜 Gourmet", tag: "Authentic Local Cuisine" },
        { label: "🏔️ Glaciers", tag: "Light Hiking & Glaciers" },
        { label: "👨‍👩‍👧 Family", tag: "Family Friendly & Relaxed Pace" }
      ],
      telemetry: [
        "Verified Guide Knowledge Base",
        "Live Route & Weather Check",
        "Spatial-Temporal Pacing Engine",
        "Practical Travel & Safety Guide"
      ],
      spatialEngine: {
        badge: "SPATIAL-TEMPORAL ROUTING ENGINE",
        title: "Spatial-Temporal Routing for Confident Explorations",
        subtitle: "Deconstruct terrain topology, driving stamina, and golden hour windows for seamless expeditions.",
        metrics: [
          { value: "Safety", label: "Risk Guidance", desc: "Highlights mountain passes & driving precautions" },
          { value: "Official", label: "Trail & Park Sync", desc: "Aligned with verified safety grades & durations" },
          { value: "Optimal", label: "Golden Hour Match", desc: "Curated dawn, dusk & blue hour photography windows" }
        ],
        cardTitle: "Benchmark Route: Alpine Lake Topology Profile",
        cardDesc: "Christchurch ➔ Lake Tekapo (SH80) ➔ Mount Cook ➔ Wanaka ➔ Queenstown",
        nodes: [
          { label: "Christchurch (Start)", sub: "Car Pickup 0km" },
          { label: "Lake Tekapo (Dark Sky)", sub: "Milky Way 225km" },
          { label: "Mt Cook (Glacier)", sub: "Hooker Valley 330km" },
          { label: "Wanaka (Lakeside)", sub: "Lone Tree 510km" },
          { label: "Queenstown (End)", sub: "Fjord & Departure 650km" }
        ]
      },
      proVision: {
        badge: "PRO OPTICS & ASTROPHOTOGRAPHY",
        title: "Every Landscape, A Grand Stage",
        subtitle: "Curated pro photographer photo spots with recommended focal lengths and lighting windows.",
        spots: [
          {
            name: "Good Shepherd Church · Milky Way",
            lens: "14-24mm f/2.8",
            params: "14mm · f/2.8 · 20s · ISO 3200",
            window: "Milky Way Rise 23:30 - 03:15",
            tip: "Ultra-wide low angle facing stone church framed under the starry arch."
          },
          {
            name: "Roys Peak · Golden Sunrise",
            lens: "24-70mm f/4",
            params: "35mm · f/8 · 1/200s · ISO 100",
            window: "Golden Hour 06:15 - 07:00",
            tip: "Backlit ridge leading toward Lake Wanaka; use CPL to cut lake glare."
          },
          {
            name: "Milford Sound · Mitre Peak Reflection",
            lens: "16-35mm + CPL",
            params: "16mm · f/11 · 30s · ISO 100",
            window: "Blue Hour 07:20 - 08:00",
            tip: "Low tide beach long exposure smoothing tidal water to reflect snow peak."
          }
        ]
      },
      knowledgeMesh: {
        badge: "DUAL-ENGINE KNOWLEDGE BASE",
        title: "Dual-Engine Grounded Intelligence Architecture",
        subtitle: "From private RAG vector knowledge base to agentic temporal-spatial reasoning for solid factual grounding.",
        layers: [
          { 
            num: "01", 
            name: "Official Trail & Dark Sky Knowledge Base", 
            tag: "ChromaDB Vector Retrieval · Fact Grounded",
            desc: "Indexes official safety ratings, standard durations, season warnings, and Dark Sky regulations to minimize hallucinations.",
            image: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&auto=format&fit=crop&q=80"
          },
          { 
            num: "02", 
            name: "Web Search & Live Weather Verification", 
            tag: "Live Weather Check · Transit Guidance",
            desc: "Verifies mountain pass conditions, sunset & sunrise windows, and assesses visibility for high-altitude scenic roads.",
            image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80"
          },
          { 
            num: "03", 
            name: "OpenClaw Agent Spatial-Temporal Pacing", 
            tag: "Structured Reasoning · Logical Routing",
            desc: "Balances daily drive limits, family stamina pacing, golden lighting windows, and dining open hours for realistic schedules.",
            image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80"
          },
          { 
            num: "04", 
            name: "Bento Grid Multi-Dimensional Interactive Matrix", 
            tag: "Structured Data Matrix · Clear Visualization",
            desc: "Translates complex itineraries, official trail guides, master photo coordinates, and local culinary discoveries into intuitive interactive Bento modules.",
            image: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&auto=format&fit=crop&q=80"
          }
        ]
      },
      inspirations: {
        badge: "INSPIRATION MATRIX",
        title: "Explore Global Inspiration Gallery",
        subtitle: "Click any flagship itinerary to load directly into the AI Planner.",
        items: [
          { title: "🇳🇿 NZ South Island 7D Road Trip & Dark Sky", query: "Plan a 7-day NZ South Island road trip with Lake Tekapo stargazing, Mt Cook Hooker Valley glacier hike, Queenstown cuisine and photography spots", tag: "Scenic Drive" },
          { title: "🗼 Tokyo 7D Autumn Escape & Michelin Dining", query: "Plan a 7-day Tokyo trip covering Asakusa temple, Shibuya Crossing night view, Akihabara anime and Tsukiji seafood dining", tag: "Urban Culture" },
          { title: "🇨🇭 Swiss Alps 10D Panoramic Train Tour", query: "10-day Switzerland panoramic train tour visiting Jungfrau, Matterhorn and Lake Geneva", tag: "Alpine Train" },
          { title: "🇨🇳 Guizhou 5D Karst Waterfalls & Ethnic Villages", query: "5-day Guizhou self-drive photography tour covering Huangguoshu Waterfall, Libo and Miao Village", tag: "Hidden Gem" }
        ]
      },
      bottomCta: {
        title: "Ready to Begin Your Dream Journey?",
        subtitle: "Tell OpenClaw Agent your vision and get an actionable tailored master plan in seconds.",
        startBtn: "Launch AI Planner Now",
        demoBtn: "Explore Featured Demo Dashboard →"
      },
      carousel: {
        prevSlide: "Previous slide",
        nextSlide: "Next slide",
        prevSpot: "PREV SPOT",
        nextSpot: "NEXT SPOT",
        pauseAuto: "Pause autoplay",
        resumeAuto: "Resume autoplay",
        readyBadge: "KNOWLEDGE BASE · READY",
        loadAndPlan: "Load & Plan"
      }
    },
    sidebar: {
      title: "Roam Copilot",
      subtitle: "Conversational AI",
      quickNZ: "🇳🇿 NZ South Island 7D",
      quickTokyo: "🗼 Tokyo 7D Autumn",
      inputPlaceholder: "Type a message...",
      welcomeMsg: "Tell me your travel ideas! Destinations, duration, travel style or budget—I'm here to customize your perfect trip.",
      userDefaultMsg: "Planning a 7-day road trip to New Zealand South Island with photography & food.",
      aiDefaultReply: "Great! I have retrieved relevant knowledge base guides and verified live weather. Here is your tailored plan!",
      ragStatusPill1: "🔍 Retrieved relevant guides & trail standards from knowledge base",
      ragStatusPill2: "🌐 Live check: Synchronized weather and scenic highway recommendations",
      ragTokyoPill1: "🔍 Retrieved Tokyo autumn foliage & culinary guides",
      ragTokyoPill2: "✨ Bento Grid structured scheduling complete",
      thinkingText: "Retrieving knowledge base & generating itinerary...",
      aiReplyTokyo: "Tokyo Autumn Escape plan is ready! From historic Asakusa shrines to Shibuya street photography.",
      aiReplyNZ: "New Zealand South Island plan updated! From Lake Tekapo stargazing to Mount Cook glacier hikes."
    },
    cards: {
      dailyScheduleTitle: "Daily Schedule",
      dailyTimelineEyebrow: "DAILY TIMELINE · ROUTE STOPS",
      dayPrefix: "Day ",
      daySuffix: "",
      dayBtnPrefix: "Day ",
      tableCols: {
        time: "Time",
        activity: "Activity",
        location: "Location",
        details: "Details"
      },
      mustVisitTitle: "Must-Visit & Cuisine",
      tasteSightsEyebrow: "TASTE & SIGHTS · LOCAL GUIDE",
      allCategories: "All",
      foodCategory: "🍲 Food",
      landmarkCategory: "🏛️ Landmark",
      recommendationsLabel: "Recommendations: ",
      openHoursLabel: "Suggested Duration: ",
      pricingLabel: "Est. Price / Budget: ",
      tipsLabel: "Tips",
      spotsTitle: "Photography Guide & Photo Spots",
      photoGuideTitle: "Photography Guide & Photo Spots",
      visualExpeditionEyebrow: "VISUAL EXPEDITION · PHOTO GUIDE",
      expeditionEyebrow: "EXPEDITION · CUSTOM ROUTE PROFILE",
      tipsPrefix: "Tips:",
      copySpotBtn: "Copy photo spot tips",
      shareSpotBtn: "Share photo spot",
      paramsLabel: "Camera Settings",
      photoTipsLabel: "Composition Tips: ",
      bestTimeLabel: "Best Lighting Time: ",
      lensLabel: "Recommended Lens: ",
      weatherTitle: "Live Weather & Packing Guide",
      tempLabel: "Temperature: ",
      conditionLabel: "Condition: ",
      clothingLabel: "Outfit Recommendation: ",
      packingLabel: "Essential Gear: ",
      allDay: "All Day",
      imageSourceTitle: "Image Source: ",
      copySuccess: "Copied to clipboard!",
      shareSuccess: "Share text copied"
    }
  },
  ja: {
    nav: {
      home: "ホーム",
      itineraries: "旅程",
      bookings: "予約",
      settings: "設定",
      searchPlaceholder: "旅行先を検索...",
      exportPlan: "エクスポート",
      copied: "コピーしました",
      newTrip: "新しい旅"
    },
    welcome: {
      nav: {
        planner: "プランナー",
        spatial: "空間エンジン",
        vision: "プロビジョン",
        knowledge: "アーキテクチャ",
        gallery: "ギャラリー",
        enterDashboard: "ダッシュボード →"
      },
      badge: "OpenClaw Agent · スマート旅行プランナー",
      heroTitle: "理想の旅、一言で実現",
      heroSubtitle: "信頼できる旅行ガイド、リアルタイム気象・道路情報、厳選フォトスポットを統合。",
      inputPlaceholder: "どこへ行きたいですか？例：ニュージーランド南島7日間ドライブ、星空とサーモン料理...",
      generateBtn: "AIプランを作成",
      generatingBtn: "AIが旅程を作成中...",
      preferencesTitle: "嗜好タグ",
      preferences: [
        { label: "🚗 ドライブ", tag: "ドライブ" },
        { label: "🌌 星空", tag: "星空撮影" },
        { label: "📸 フォト", tag: "プロ撮影スポット" },
        { label: "🍜 グルメ", tag: "現地グルメ" },
        { label: "🏔️ ハイキング", tag: "軽登山と自然" },
        { label: "👨‍👩‍👧 家族", tag: "ファミリー向け" }
      ],
      telemetry: [
        "信頼できるガイド知識ベース",
        "リアルタイム道路・気象情報",
        "空間時間経路最適化エンジン",
        "実用的な旅行安全ガイド"
      ],
      spatialEngine: {
        badge: "SPATIAL-TEMPORAL ROUTING ENGINE",
        title: "空間時間経路計画で、旅をスムーズに",
        subtitle: "地理、運転リズム、ゴールデンアワーを最適に組み合わせた旅程。",
        metrics: [
          { value: "安全", label: "リスク案内", desc: "危険区間や季節リスクを事前警告" },
          { value: "公式", label: "トレイルガイド", desc: "公式安全等級と推奨所要時間を反映" },
          { value: "最適", label: "ゴールデンアワー", desc: "日の出・日没・ブルーアワーの撮影窓を提案" }
        ],
        cardTitle: "模範ルート：南島高山湖ルート",
        cardDesc: "クライストチャーチ ➔ テカポ湖 (SH80) ➔ マウントクック ➔ ワナカ ➔ クイーンズタウン",
        nodes: [
          { label: "クライストチャーチ (出発)", sub: "レンタカー 0km" },
          { label: "テカポ湖 (星空)", sub: "天の川 225km" },
          { label: "マウントクック (氷河)", sub: "フッカーバレー 330km" },
          { label: "ワナカ (湖畔)", sub: "孤独の木 510km" },
          { label: "クイーンズタウン (終点)", sub: "フィヨルド 650km" }
        ]
      },
      proVision: {
        badge: "PRO OPTICS & ASTROPHOTOGRAPHY",
        title: "すべての風景が絶景",
        subtitle: "厳選フォトスポットと推奨レンズ・露出設定・撮影時間を提供。",
        spots: [
          {
            name: "善き羊飼いの教会 · 天の川",
            lens: "14-24mm f/2.8",
            params: "14mm · f/2.8 · 20s · ISO 3200",
            window: "天の川 23:30 - 03:15",
            tip: "超広角ローアングルで石造教会を前景に天の川を捉える。"
          },
          {
            name: "ロイズピーク · 黄金の朝日",
            lens: "24-70mm f/4",
            params: "35mm · f/8 · 1/200s · ISO 100",
            window: "ゴールデンアワー 06:15 - 07:00",
            tip: "逆光で山稜をワナカ湖へ伸ばす構図。CPLで水面の反射を除去。"
          },
          {
            name: "ミルフォードサウンド · ミトレピーク",
            lens: "16-35mm + CPL",
            params: "16mm · f/11 · 30s · ISO 100",
            window: "ブルーアワー 07:20 - 08:00",
            tip: "干潮の砂浜で長時間露光、氷河の雪山を水面に映す。"
          }
        ]
      },
      knowledgeMesh: {
        badge: "DUAL-ENGINE KNOWLEDGE BASE",
        title: "デュアルエンジン知識基盤",
        subtitle: "プライベートRAGベクトル知識ベースとエージェント推論を統合。",
        layers: [
          { 
            num: "01", 
            name: "公式トレイル＆星空保護区知識ベース", 
            tag: "ChromaDB ベクトル検索",
            desc: "ニュージーランドDOCの公式トレイル安全評価、所要時間、季節注意事項を構造化。",
            image: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&auto=format&fit=crop&q=80"
          },
          { 
            num: "02", 
            name: "リアルタイム気象検索と道路情報", 
            tag: "天気検索 · 交通情報",
            desc: "目的地のリアルタイム天気、日の出・日没時刻、道路交通情報を補完。",
            image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80"
          },
          { 
            num: "03", 
            name: "OpenClaw エージェント時空間計画", 
            tag: "構造化推論",
            desc: "運転距離、体力、撮影窓、営業時間をバランスよく考慮。",
            image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80"
          },
          { 
            num: "04", 
            name: "Bento Grid 多次元動的表示層", 
            tag: "構造化情報マトリクス",
            desc: "複雑な旅程情報を直感的なBento Gridレイアウトで表示。",
            image: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&auto=format&fit=crop&q=80"
          }
        ]
      },
      inspirations: {
        badge: "INSPIRATION MATRIX",
        title: "世界のインスピレーションギャラリー",
        subtitle: "厳選ルートをワンクリックでロード。",
        items: [
          { title: "🇳🇿 NZ南島 7日間ドライブ＆星空", query: "ニュージーランド南島7日間ドライブ、テカポ星空、クック山氷河、クイーンズタウン美食、フォトスポット", tag: "絶景ドライブ" },
          { title: "🗼 東京 7日間アニメ聖地巡礼", query: "東京7日間、浅草寺、渋谷夜景、秋葉原アニメ、築地市場グルメ", tag: "街歩き" },
          { title: "🇨🇭 スイスアルプス 10日間", query: "スイス10日間黄金ルート、ユングフラウ、マッターホルン、ジュネーブ湖", tag: "雪山鉄道" },
          { title: "🇨🇳 貴州 5日間カルスト秘境", query: "貴州5日間ドライブ撮影旅行、黄果樹瀑布、荔波小七孔、西江千戸苗寨", tag: "秘境探検" }
        ]
      },
      bottomCta: {
        title: "夢の旅を始めましょうか？",
        subtitle: "OpenClaw Agentにアイデアを伝えるだけで、カスタマイズされた旅程を即座にご提案。",
        startBtn: "AIプランナーを起動",
        demoBtn: "デモダッシュボードを見る →"
      },
      carousel: {
        prevSlide: "前のスライド",
        nextSlide: "次のスライド",
        prevSpot: "前のスポット",
        nextSpot: "次のスポット",
        pauseAuto: "自動再生を停止",
        resumeAuto: "自動再生を再開",
        readyBadge: "知識ベース · 準備完了",
        loadAndPlan: "ロードして計画"
      }
    },
    sidebar: {
      title: "Roam コパイロット",
      subtitle: "会話型AI",
      quickNZ: "🇳🇿 NZ南島 7日",
      quickTokyo: "🗼 東京 7日秋",
      inputPlaceholder: "メッセージを入力...",
      welcomeMsg: "旅行のアイデアを教えてください！行き先、日数、スタイル、予算—完璧なプランをご提案します。",
      userDefaultMsg: "ニュージーランド南島7日間ドライブ、写真撮影とグルメが中心。",
      aiDefaultReply: "知識ベースとリアルタイム天気を確認しました。カスタマイズ旅程をご覧ください！",
      ragStatusPill1: "🔍 知識ベースから該当ガイドを検索",
      ragStatusPill2: "🌐 リアルタイム天気と道路情報を確認",
      ragTokyoPill1: "🔍 東京紅葉とグルメガイドを検索",
      ragTokyoPill2: "✨ Bento Grid構造化スケジュール完了",
      thinkingText: "知識ベースとネット情報を統合して旅程を生成中...",
      aiReplyTokyo: "東京秋の旅プラン準備完了！浅草から渋谷まで。",
      aiReplyNZ: "NZ南島プラン更新！テカポ星空からクック山氷河ハイキングまで。"
    },
    cards: {
      dailyScheduleTitle: "日別スケジュール",
      dailyTimelineEyebrow: "DAILY TIMELINE · ルート",
      dayPrefix: "",
      daySuffix: "日目",
      dayBtnPrefix: "Day ",
      tableCols: {
        time: "時間",
        activity: "アクティビティ",
        location: "場所",
        details: "詳細"
      },
      mustVisitTitle: "必見スポット＆グルメ",
      tasteSightsEyebrow: "TASTE & SIGHTS · 現地ガイド",
      allCategories: "すべて",
      foodCategory: "🍲 グルメ",
      landmarkCategory: "🏛️ 名所",
      recommendationsLabel: "おすすめ: ",
      openHoursLabel: "所要時間目安: ",
      pricingLabel: "料金/予算: ",
      tipsLabel: "ヒント",
      spotsTitle: "撮影ガイド＆フォトスポット",
      photoGuideTitle: "撮影ガイド＆フォトスポット",
      visualExpeditionEyebrow: "VISUAL EXPEDITION · 撮影ガイド",
      expeditionEyebrow: "EXPEDITION · カスタムルート",
      tipsPrefix: "ヒント:",
      copySpotBtn: "撮影情報をコピー",
      shareSpotBtn: "撮影案内を共有",
      paramsLabel: "カメラ設定",
      photoTipsLabel: "撮影のコツ: ",
      bestTimeLabel: "最適撮影時間: ",
      lensLabel: "推奨レンズ: ",
      weatherTitle: "現地天気と服装アドバイス",
      tempLabel: "気温: ",
      conditionLabel: "天候: ",
      clothingLabel: "服装: ",
      packingLabel: "持参装備: ",
      allDay: "終日",
      imageSourceTitle: "画像ソース: ",
      copySuccess: "クリップボードにコピーしました！",
      shareSuccess: "共有テキストをコピー"
    }
  },
  ko: {
    nav: {
      home: "홈",
      itineraries: "여정",
      bookings: "예약",
      settings: "설정",
      searchPlaceholder: "여행지 검색...",
      exportPlan: "내보내기",
      copied: "복사됨",
      newTrip: "새 여행"
    },
    welcome: {
      nav: {
        planner: "플래너",
        spatial: "공간 엔진",
        vision: "프로 비전",
        knowledge: "아키텍처",
        gallery: "갤러리",
        enterDashboard: "대시보드 →"
      },
      badge: "OpenClaw Agent · 스마트 여행 플래너",
      heroTitle: "이상적인 여행, 한 마디로 실현",
      heroSubtitle: "신뢰할 수 있는 여행 가이드, 실시간 날씨 및 도로 정보, 엄선된 포토 스팟을 통합합니다.",
      inputPlaceholder: "어디로 가고 싶으신가요? 예: 뉴질랜드 남섬 7일 자동차 여행, 별빛과 연어 요리...",
      generateBtn: "AI 플랜 시작",
      generatingBtn: "AI가 여행 일정을 작성 중...",
      preferencesTitle: "취향 태그",
      preferences: [
        { label: "🚗 드라이브", tag: "드라이브" },
        { label: "🌌 별빛", tag: "별빛 촬영" },
        { label: "📸 포토", tag: "프로 촬영 스팟" },
        { label: "🍜 미식", tag: "현지 미식" },
        { label: "🏔️ 하이킹", tag: "가벼운 하이킹" },
        { label: "👨‍👩‍👧 가족", tag: "가족 여행" }
      ],
      telemetry: [
        "신뢰할 수 있는 가이드 지식 베이스",
        "실시간 도로 및 기상 정보",
        "공간-시간 경로 최적화 엔진",
        "실용적인 여행 안전 가이드"
      ],
      spatialEngine: {
        badge: "SPATIAL-TEMPORAL ROUTING ENGINE",
        title: "공간-시간 경로 계획으로 여행을 더욱 매끄럽게",
        subtitle: "지리, 운전 리듬, 골든 아워를 최적으로 결합한 일정.",
        metrics: [
          { value: "안전", label: "위험 안내", desc: "위험 구간 및 계절 리스크 사전 경고" },
          { value: "공식", label: "트레일 가이드", desc: "공식 안전 등급 및 권장 소요 시간 반영" },
          { value: "최적", label: "골든 아워", desc: "일출·일몰·블루아워 촬영 시간 제안" }
        ],
        cardTitle: "표준 루트: 남섬 고산 호수 루트",
        cardDesc: "크라이스트처치 ➔ 테카포 호수 (SH80) ➔ 마운트쿡 ➔ 와나카 ➔ 퀸스타운",
        nodes: [
          { label: "크라이스트처치 (출발)", sub: "렌터카 0km" },
          { label: "테카포 호수 (별빛)", sub: "은하수 225km" },
          { label: "마운트쿡 (빙하)", sub: "후커밸리 330km" },
          { label: "와나카 (호숫가)", sub: "외로운 나무 510km" },
          { label: "퀸스타운 (종점)", sub: "피오르드 650km" }
        ]
      },
      proVision: {
        badge: "PRO OPTICS & ASTROPHOTOGRAPHY",
        title: "모든 풍경이 장관",
        subtitle: "엄선된 포토 스팟과 권장 렌즈, 노출 설정, 촬영 시간을 제공합니다.",
        spots: [
          {
            name: "선한 목자 교회 · 은하수",
            lens: "14-24mm f/2.8",
            params: "14mm · f/2.8 · 20s · ISO 3200",
            window: "은하수 23:30 - 03:15",
            tip: "초광각 로우앵글로 석조 교회를 전경에 은하수 촬영."
          },
          {
            name: "로이스 피크 · 황금 일출",
            lens: "24-70mm f/4",
            params: "35mm · f/8 · 1/200s · ISO 100",
            window: "골든 아워 06:15 - 07:00",
            tip: "역광으로 산등성이를 와나카 호수로 연결. CPL로 수면 반사 제거."
          },
          {
            name: "밀포드 사운드 · 미트레 피크",
            lens: "16-35mm + CPL",
            params: "16mm · f/11 · 30s · ISO 100",
            window: "블루 아워 07:20 - 08:00",
            tip: "썰물 때 모래사장에서 장노출, 빙하 설산을 수면에 반사."
          }
        ]
      },
      knowledgeMesh: {
        badge: "DUAL-ENGINE KNOWLEDGE BASE",
        title: "듀얼 엔진 지식 기반",
        subtitle: "프라이빗 RAG 벡터 지식 베이스와 에이전트 추론을 통합.",
        layers: [
          { 
            num: "01", 
            name: "공식 트레일 & 별빛 보호구 지식 베이스", 
            tag: "ChromaDB 벡터 검색",
            desc: "뉴질랜드 DOC 공식 트레일 안전 평가, 소요 시간, 계절 주의사항을 구조화.",
            image: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&auto=format&fit=crop&q=80"
          },
          { 
            num: "02", 
            name: "실시간 날씨 검색 및 도로 정보", 
            tag: "날씨 검색 · 교통 정보",
            desc: "목적지 실시간 날씨, 일출·일몰 시간, 도로 교통 정보 보완.",
            image: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=800&auto=format&fit=crop&q=80"
          },
          { 
            num: "03", 
            name: "OpenClaw 에이전트 시공간 계획", 
            tag: "구조화 추론",
            desc: "운전 거리, 체력, 촬영 시간, 영업 시간을 균형 있게 고려.",
            image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?w=800&auto=format&fit=crop&q=80"
          },
          { 
            num: "04", 
            name: "Bento Grid 다차원 동적 표시", 
            tag: "구조화 정보 매트릭스",
            desc: "복잡한 여정 정보를 직관적인 Bento Grid 레이아웃으로 표시.",
            image: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&auto=format&fit=crop&q=80"
          }
        ]
      },
      inspirations: {
        badge: "INSPIRATION MATRIX",
        title: "세계의 영감 갤러리",
        subtitle: "엄선된 루트를 원클릭으로 로드.",
        items: [
          { title: "🇳🇿 NZ 남섬 7일 드라이브＆별빛", query: "뉴질랜드 남섬 7일 드라이브, 테카포 별빛, 마운트쿡 빙하, 퀸스타운 미식, 포토 스팟", tag: "절경 드라이브" },
          { title: "🗼 도쿄 7일 애니메이션 성지", query: "도쿄 7일, 아사쿠사 절, 시부야 야경, 아키하바라 애니메이션, 츠키지 시장", tag: "도시 산책" },
          { title: "🇨🇭 스위스 알프스 10일", query: "스위스 10일 골든 루트, 융프라우, 마터호른, 제네바 호수", tag: "설산 기차" },
          { title: "🇨🇳 구이저우 5일 카르스트秘境", query: "구이저우 5일 드라이브 촬영 여행, 황궈수 폭포, 리보 샤오치쿵, 시장 먀오족 마을", tag: "비경 탐험" }
        ]
      },
      bottomCta: {
        title: "꿈의 여행을 시작할 준비가 되셨나요?",
        subtitle: "OpenClaw Agent에게 아이디어를 전하면 맞춤형 여정을 즉시 제안합니다.",
        startBtn: "AI 플래너 시작",
        demoBtn: "데모 대시보드 보기 →"
      },
      carousel: {
        prevSlide: "이전 슬라이드",
        nextSlide: "다음 슬라이드",
        prevSpot: "이전 스팟",
        nextSpot: "다음 스팟",
        pauseAuto: "자동 재생 중지",
        resumeAuto: "자동 재생 재개",
        readyBadge: "지식 베이스 · 준비 완료",
        loadAndPlan: "로드 & 계획"
      }
    },
    sidebar: {
      title: "Roam 코파일럿",
      subtitle: "대화형 AI",
      quickNZ: "🇳🇿 NZ 남섬 7일",
      quickTokyo: "🗼 도쿄 7일 가을",
      inputPlaceholder: "메시지 입력...",
      welcomeMsg: "여행 아이디어를 알려주세요! 목적지, 기간, 스타일, 예산—완벽한 플랜을 제안합니다.",
      userDefaultMsg: "뉴질랜드 남섬 7일 드라이브, 사진 촬영과 미식 중심.",
      aiDefaultReply: "지식 베이스와 실시간 날씨를 확인했습니다. 맞춤형 여정을 확인하세요!",
      ragStatusPill1: "🔍 지식 베이스에서 관련 가이드 검색",
      ragStatusPill2: "🌐 실시간 날씨 및 도로 정보 확인",
      ragTokyoPill1: "🔍 도쿄 단풍 및 미식 가이드 검색",
      ragTokyoPill2: "✨ Bento Grid 구조화 스케줄 완료",
      thinkingText: "지식 베이스와 네트워크 정보를 통합하여 여정 생성 중...",
      aiReplyTokyo: "도쿄 가을 여행 플랜 준비 완료! 아사쿠사에서 시부야까지.",
      aiReplyNZ: "NZ 남섬 플랜 업데이트! 테카포 별빛부터 마운트쿡 빙하 하이킹까지."
    },
    cards: {
      dailyScheduleTitle: "일별 일정",
      dailyTimelineEyebrow: "DAILY TIMELINE · 루트",
      dayPrefix: "",
      daySuffix: "일차",
      dayBtnPrefix: "Day ",
      tableCols: {
        time: "시간",
        activity: "활동",
        location: "장소",
        details: "세부사항"
      },
      mustVisitTitle: "필수 방문 & 미식",
      tasteSightsEyebrow: "TASTE & SIGHTS · 현지 가이드",
      allCategories: "전체",
      foodCategory: "🍲 미식",
      landmarkCategory: "🏛️ 명소",
      recommendationsLabel: "추천: ",
      openHoursLabel: "권장 시간: ",
      pricingLabel: "요금/예산: ",
      tipsLabel: "팁",
      spotsTitle: "촬영 가이드 & 포토 스팟",
      photoGuideTitle: "촬영 가이드 & 포토 스팟",
      visualExpeditionEyebrow: "VISUAL EXPEDITION · 촬영 가이드",
      expeditionEyebrow: "EXPEDITION · 맞춤 루트",
      tipsPrefix: "팁:",
      copySpotBtn: "촬영 정보 복사",
      shareSpotBtn: "촬영 안내 공유",
      paramsLabel: "카메라 설정",
      photoTipsLabel: "촬영 팁: ",
      bestTimeLabel: "최적 촬영 시간: ",
      lensLabel: "권장 렌즈: ",
      weatherTitle: "현지 날씨 및 복장 가이드",
      tempLabel: "기온: ",
      conditionLabel: "날씨: ",
      clothingLabel: "복장: ",
      packingLabel: "준비물: ",
      allDay: "종일",
      imageSourceTitle: "이미지 출처: ",
      copySuccess: "클립보드에 복사되었습니다!",
      shareSuccess: "공유 텍스트 복사됨"
    }
  }
};
