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
        enterDashboard: "进入看板 →"
      },
      badge: "OpenClaw Agent · 极智旅行规划系统",
      heroTitle: "理想之旅，一语成行",
      heroSubtitle: "融合官方权威指南、毫秒级路况气象与专业摄影机位，让每一次出发都从容不迫。",
      inputPlaceholder: "想去哪里？比如：带父母新西兰南岛自驾7天，不想太累，想看暗夜星空与吃三文鱼...",
      generateBtn: "开始智能规划",
      generatingBtn: "AI 正在全网与知识库推演中...",
      preferencesTitle: "偏好标签",
      preferences: [
        { label: "🚗 深度自驾", tag: "自驾" },
        { label: "🌌 暗夜星空", tag: "摄影与暗夜星空" },
        { label: "📸 大师机位", tag: "专业风光机位" },
        { label: "🍜 地道风物", tag: "地道风味与美食" },
        { label: "🏔️ 冰川徒步", tag: "轻度徒步与自然" },
        { label: "👨‍👩‍👧 亲子度假", tag: "亲子家庭与轻松节奏" }
      ],
      telemetry: [
        "100% DOC 官方知识库",
        "毫秒级实时气象路况",
        "Extended Thinking 深度推演",
        "避坑防雷指南"
      ],
      spatialEngine: {
        badge: "SPATIAL-TEMPORAL ROUTING ENGINE",
        title: "4D 时空推演，让每一公里都充满确定性",
        subtitle: "深度解构地形高差、行车节奏与自然采光窗口，为每一次转弯提供最优解。",
        metrics: [
          { value: "0", label: "危险盲区规避", desc: "自动避开季节性积雪与险峻陡坡" },
          { value: "1:1", label: "官方步道核验", desc: "直连 DOC 官方安全分级与耗时" },
          { value: "100%", label: "黄金采光窗口", desc: "日出日落晨昏光线精准计算" }
        ],
        cardTitle: "自驾行车流态与高差剖面推演",
        cardDesc: "基督城 ➔ 特卡波湖 (SH80) ➔ 库克山冰川 ➔ 瓦纳卡 ➔ 皇后镇"
      },
      proVision: {
        badge: "PRO OPTICS & ASTROPHOTOGRAPHY",
        title: "每一处风景，都是大场面",
        subtitle: "内置专业摄影师机位数据库，精确到焦段、曝光参数与银河起落时刻。",
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
            name: "米尔福德峡湾 · 冠峰倒影",
            lens: "16-35mm + CPL",
            params: "16mm · f/11 · 30s · ISO 100",
            window: "蓝调时刻 07:20 - 08:00",
            tip: "利用退潮沙滩水面长曝光消除水波，捕捉倒映在冰川海水的雪山。"
          }
        ]
      },
      knowledgeMesh: {
        badge: "HYPER-INTELLECT ARCHITECTURE",
        title: "双引擎驱动的知识底盘体系",
        subtitle: "从权威私有 RAG 向量库到大模型拓展思考推理，构筑不可动摇的事实基石。",
        layers: [
          { num: "04", name: "Bento Grid 便士网格可视化层", desc: "日程安排、地标风物与机位指南秒级响应呈现" },
          { num: "03", name: "Gemini 3.7 Flash 拓展深度思考", desc: "多步严密逻辑推演，权衡车程体能与游玩节奏" },
          { num: "02", name: "全网实时气象与交通路况总线", desc: "即时核验公路畅通度与高精度小时级天气预报" },
          { num: "01", name: "DOC 官方步道与暗夜保护区知识库", desc: "ChromaDB 严苛事实锚定，彻底消除幻觉" }
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
        subtitle: "告诉 OpenClaw Agent 您的想法，3 秒内为您呈现完整可落地的定制方案。",
        startBtn: "立即开启智能规划",
        demoBtn: "直接浏览精选标杆看板 →"
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
      aiDefaultReply: "太棒了！已深度检索新西兰 DOC 官方步道与暗夜保护区私有知识库，并联网核验即时路况与气象，以下是为您量身定制的完整行程！",
      ragStatusPill1: "🔍 检索 ChromaDB 知识库命中 4 条高精事实 (DOC 官方指南)",
      ragStatusPill2: "🌐 联网核验：特卡波湖天气晴朗，SH8/SH80 国道全线畅通",
      ragTokyoPill1: "🔍 检索东京秋季红叶情报与米其林美食指南",
      ragTokyoPill2: "✨ 便士网格 (Bento Grid) 结构化日程排版完成",
      thinkingText: "正在深度检索知识库与生成行程规划...",
      aiReplyTokyo: "东京 7 天金秋漫游方案已就绪！从浅草古刹祈福到涩谷街头霓虹光影，尽享极致视觉与味蕾盛宴。",
      aiReplyNZ: "新西兰南岛 7 天方案已更新！从特卡波暗夜银河到库克山冰川轻徒步，为您呈现大片级自驾路线。"
    },
    cards: {
      dailyScheduleTitle: "每日行程路线",
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
      recommendationsLabel: "推荐理由: ",
      tipsLabel: "贴士",
      photoGuideTitle: "摄影机位与出片指南",
      tipsPrefix: "Tips:",
      copySpotBtn: "复制机位建议",
      shareSpotBtn: "分享机位",
      paramsLabel: "参数建议"
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
        enterDashboard: "Dashboard →"
      },
      badge: "OpenClaw Agent · Autonomous Travel Planner",
      heroTitle: "Every Journey, A Masterpiece",
      heroSubtitle: "Empowered by Official DOC Knowledge Base, Real-Time Telemetry & Pro Photospot Matrix for effortless adventures.",
      inputPlaceholder: "Where do you want to go? e.g. 7-day self-drive in NZ South Island with parents, relax pace, stargazing & salmon...",
      generateBtn: "Generate AI Itinerary",
      generatingBtn: "AI is reasoning with RAG & Web Search...",
      preferencesTitle: "Preferences",
      preferences: [
        { label: "🚗 Self-Drive", tag: "Self-drive" },
        { label: "🌌 Dark Sky", tag: "Photography & Stargazing" },
        { label: "📸 Pro Spots", tag: "Photography spots" },
        { label: "🍜 Gourmet Food", tag: "Local Food & Dining" },
        { label: "🏔️ Glacier Hike", tag: "Nature & Hiking" },
        { label: "👨‍👩‍👧 Family Resort", tag: "Family Friendly & Relaxed" }
      ],
      telemetry: [
        "100% DOC Official Guides",
        "Live Weather & Highway Telemetry",
        "Extended Thinking Deep Reasoner",
        "Anti-Pitfall Radar"
      ],
      spatialEngine: {
        badge: "SPATIAL-TEMPORAL ROUTING ENGINE",
        title: "4D Spatial Engine for Absolute Certainty",
        subtitle: "Deconstructing elevation profiles, drive pacing, and natural lighting windows for the optimal route.",
        metrics: [
          { value: "0", label: "Blindspot Avoidance", desc: "Auto-routes away from snow blocks & steep grades" },
          { value: "1:1", label: "DOC Official Trail Sync", desc: "Directly verified safety grades & durations" },
          { value: "100%", label: "Golden Hour Match", desc: "Precise dawn, dusk & blue hour alignment" }
        ],
        cardTitle: "Drive Pacing & Elevation Profile",
        cardDesc: "Christchurch ➔ Lake Tekapo (SH80) ➔ Mount Cook ➔ Wanaka ➔ Queenstown"
      },
      proVision: {
        badge: "PRO OPTICS & ASTROPHOTOGRAPHY",
        title: "Every Landscape, A Grand Stage",
        subtitle: "Curated pro photographer photo spots with focal lengths, exposure parameters, and celestial windows.",
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
        badge: "HYPER-INTELLECT ARCHITECTURE",
        title: "Dual-Engine Grounded Intelligence",
        subtitle: "From authoritative RAG vector store to Extended Thinking reasoning for unbreakable factual ground.",
        layers: [
          { num: "04", name: "Bento Grid Visualization Matrix", desc: "Instantaneous rendering of schedules, sights & dining" },
          { num: "03", name: "Gemini 3.7 Flash Extended Thinking", desc: "Multi-step rigorous deduction balancing drive fatigue & rhythm" },
          { num: "02", name: "Live Weather & Highway Telemetry Bus", desc: "Real-time road viability checks & hourly meteorological forecast" },
          { num: "01", name: "DOC Official Trail & Dark Sky Vector Base", desc: "ChromaDB precision grounding eliminating hallucinations" }
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
      aiDefaultReply: "Great! I have retrieved our DOC private knowledge base and verified live weather. Here is your tailored plan!",
      ragStatusPill1: "🔍 ChromaDB retrieved 4 precision docs (DOC Official Guide)",
      ragStatusPill2: "🌐 Live check: Clear skies in Tekapo, SH8/SH80 highways open",
      ragTokyoPill1: "🔍 Retrieved Tokyo autumn foliage & culinary guides",
      ragTokyoPill2: "✨ Bento Grid structured scheduling complete",
      thinkingText: "Retrieving knowledge base & generating itinerary...",
      aiReplyTokyo: "Tokyo Autumn Escape plan is ready! From historic Asakusa shrines to Shibuya street photography.",
      aiReplyNZ: "New Zealand South Island plan updated! From Lake Tekapo stargazing to Mount Cook glacier hikes."
    },
    cards: {
      dailyScheduleTitle: "Daily Schedule",
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
      recommendationsLabel: "Recommendations: ",
      tipsLabel: "Tips",
      photoGuideTitle: "Photography Guide & Photo Spots",
      tipsPrefix: "Tips:",
      copySpotBtn: "Copy photo spot tips",
      shareSpotBtn: "Share photo spot",
      paramsLabel: "Camera Settings"
    }
  }
};
