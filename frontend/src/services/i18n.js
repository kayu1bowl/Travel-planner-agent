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
  }
};
