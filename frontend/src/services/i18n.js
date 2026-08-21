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
      badge: "OpenClaw Agent",
      heroTitle: "探索世界，从一句话开始",
      heroSubtitle: "AI 智能规划您的专属梦想旅程 · 融合官方权威指南、实时天气路况与专业摄影机位",
      inputPlaceholder: "想去哪里？比如：带父母新西兰南岛自驾7天，不想太累，想看暗夜星空与吃三文鱼...",
      generateBtn: "开始智能规划",
      generatingBtn: "AI 正在全网与知识库推演中...",
      preferencesTitle: "偏好标签",
      preferences: [
        { label: "🚗 深度自驾", tag: "自驾" },
        { label: "📸 风光摄影", tag: "摄影与暗夜星空" },
        { label: "🍜 特色美食", tag: "地道风味与美食" },
        { label: "🏔️ 经典徒步", tag: "轻度徒步与自然" },
        { label: "👨‍👩‍👧 亲子家庭", tag: "亲子家庭与轻松节奏" },
        { label: "✨ 奢享度假", tag: "高品质度假酒店" }
      ],
      inspirationTitle: "💡 快速灵感探索：",
      inspirations: [
        { title: "🇳🇿 新西兰南岛 7 天自驾与暗夜星空", query: "计划新西兰南岛7天自驾之旅，重点特卡波暗夜星空、库克山胡克谷冰川与皇后镇美食，包含专业摄影机位" },
        { title: "🗼 东京 7 天动漫圣地与米其林漫游", query: "计划东京7天深度游，涵盖浅草古刹、涩谷十字路口夜景、秋叶原动漫与筑地海鲜市场美食" },
        { title: "🇨🇭 瑞士阿尔卑斯 10 天全景列车", query: "瑞士10天黄金列车与冰川快车全景游，游览少女峰、马特洪峰与日内瓦湖" },
        { title: "🇨🇳 贵州 5 天喀斯特瀑布与苗寨秘境", query: "贵州5天自驾摄影游，涵盖黄果树大瀑布、荔波小七孔与西江千户苗寨" }
      ],
      trustItems: [
        { title: "🏔️ 权威指南", desc: "DOC 官方步道与交规核验" },
        { title: "🌐 实时核验", desc: "即时气象与全网路况同步" },
        { title: "📸 专业机位", desc: "黄金时刻与相机镜头参数" },
        { title: "🛡️ 避坑保障", desc: "实用地道避坑防雷贴士" }
      ],
      exploreDemoBtn: "或直接浏览精选标杆看板 →"
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
      badge: "OpenClaw Agent",
      heroTitle: "Explore the World, Starting with a Sentence",
      heroSubtitle: "AI-Powered Travel Planning · Integrated with Official DOC Guides, Real-Time Weather & Pro Photography Spots",
      inputPlaceholder: "Where do you want to go? e.g. 7-day self-drive in NZ South Island with parents, relax pace, stargazing & salmon...",
      generateBtn: "Generate AI Itinerary",
      generatingBtn: "AI is reasoning with RAG & Web Search...",
      preferencesTitle: "Style & Preference Tags",
      preferences: [
        { label: "🚗 Self-Drive", tag: "Self-drive" },
        { label: "📸 Photography", tag: "Photography & Stargazing" },
        { label: "🍜 Gourmet Food", tag: "Local Food & Dining" },
        { label: "🏔️ Light Hiking", tag: "Nature & Hiking" },
        { label: "👨‍👩‍👧 Family", tag: "Family Friendly & Relaxed" },
        { label: "✨ Luxury", tag: "Luxury Resort & Hotels" }
      ],
      inspirationTitle: "💡 Quick Inspirations:",
      inspirations: [
        { title: "🇳🇿 NZ South Island 7D Road Trip & Dark Sky", query: "Plan a 7-day NZ South Island road trip with Lake Tekapo stargazing, Mt Cook Hooker Valley glacier hike, Queenstown cuisine and photography spots" },
        { title: "🗼 Tokyo 7D Autumn Escape & Michelin Dining", query: "Plan a 7-day Tokyo trip covering Asakusa temple, Shibuya Crossing night view, Akihabara anime and Tsukiji seafood dining" },
        { title: "🇨🇭 Swiss Alps 10D Panoramic Train Tour", query: "10-day Switzerland panoramic train tour visiting Jungfrau, Matterhorn and Lake Geneva" },
        { title: "🇨🇳 Guizhou 5D Karst Waterfalls & Ethnic Villages", query: "5-day Guizhou self-drive photography tour covering Huangguoshu Waterfall, Libo and Miao Village" }
      ],
      trustItems: [
        { title: "🏔️ Official Guides", desc: "DOC Hiking & Driving Rules" },
        { title: "🌐 Live Verification", desc: "Live Weather & Highway Status" },
        { title: "📸 Pro Photo Spots", desc: "Golden Hour & Camera Settings" },
        { title: "🛡️ Smart Tips", desc: "Authentic Local Avoid-Pitfall Advice" }
      ],
      exploreDemoBtn: "Or explore featured demo dashboard →"
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
