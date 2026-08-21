import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Compass, 
  Send, 
  Globe, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  Navigation,
  Camera,
  Layers,
  ShieldCheck,
  Activity,
  Maximize2,
  Sliders,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Sun,
  Moon,
  Clock,
  MapPin,
  Flame,
  Award,
  Crosshair,
  Wifi,
  Cpu,
  Radio,
  Play,
  Pause
} from 'lucide-react';
import { TRANSLATIONS } from '../services/i18n';
import { VERIFIED_LANDSCAPE_LIBRARY, matchDestinationImage } from '../services/imageMatcher';

// 全球 4K 震撼风光轮播大图源 (全部经由 imageMatcher 权威校验，绝无货不对板)
const GLOBAL_SCENIC_CAROUSEL = [
  VERIFIED_LANDSCAPE_LIBRARY.NZ_TEKAPO_NIGHT,
  VERIFIED_LANDSCAPE_LIBRARY.JP_FUJI_PAGODA,
  VERIFIED_LANDSCAPE_LIBRARY.CH_SWISS_LAUTERBRUNNEN,
  VERIFIED_LANDSCAPE_LIBRARY.NO_LOFOTEN_AURORA,
  VERIFIED_LANDSCAPE_LIBRARY.IT_DOLOMITES_PEAKS,
  VERIFIED_LANDSCAPE_LIBRARY.CA_BANFF_MORAINE_LAKE,
  VERIFIED_LANDSCAPE_LIBRARY.JP_KYOTO_PAGODA,
  VERIFIED_LANDSCAPE_LIBRARY.GR_SANTORINI_OIA,
  VERIFIED_LANDSCAPE_LIBRARY.NZ_SOUTHERN_ALPS_HIGHWAY,
  VERIFIED_LANDSCAPE_LIBRARY.JP_TOKYO_SHIBUYA,
  VERIFIED_LANDSCAPE_LIBRARY.IS_JOKULSARLON_ICE,
  VERIFIED_LANDSCAPE_LIBRARY.CN_GUIZHOU_KARST,
  VERIFIED_LANDSCAPE_LIBRARY.NZ_MILFORD_SOUND,
  VERIFIED_LANDSCAPE_LIBRARY.JP_KYOTO_BAMBOO,
  VERIFIED_LANDSCAPE_LIBRARY.CH_MATTERHORN_PEAK,
  VERIFIED_LANDSCAPE_LIBRARY.NZ_WANAKA_ROYS_PEAK
];

// 大师级全球专业摄影机位全量库 (100% 真实机位参数与绝景大片严格对应)
const GLOBAL_MASTER_PHOTO_SPOTS = [
  {
    image: VERIFIED_LANDSCAPE_LIBRARY.NZ_TEKAPO_NIGHT.url,
    name: "特卡波湖好牧羊人教堂",
    spotType: "ASTROPHOTOGRAPHY · 暗夜星空机位",
    iso: "ISO 3200",
    shutter: "20s",
    aperture: "f/2.8",
    focal: "14mm GM",
    elevation: "710m",
    bortle: "Class 1 极暗天空",
    window: "银河升起 23:30 - 03:15",
    tip: "超广角低机位仰拍，石砌教堂作为前景容纳整片银河拱桥，避开小镇杂光。"
  },
  {
    image: VERIFIED_LANDSCAPE_LIBRARY.NZ_WANAKA_ROYS_PEAK.url,
    name: "瓦纳卡罗伊斯山峰",
    spotType: "GOLDEN HOUR · 晨光云海脊线",
    iso: "ISO 100",
    shutter: "1/200s",
    aperture: "f/8.0",
    focal: "35mm F1.4",
    elevation: "1578m",
    bortle: "日出顺逆光",
    window: "黄金时刻 06:15 - 07:00",
    tip: "逆光拍摄山脊延伸至瓦纳卡湖，使用 CPL 偏振镜消除湖面反光与杂色。"
  },
  {
    image: VERIFIED_LANDSCAPE_LIBRARY.NZ_MILFORD_SOUND.url,
    name: "米尔福德峡湾教皇冠峰",
    spotType: "BLUE HOUR · 峡湾镜面倒影",
    iso: "ISO 100",
    shutter: "30s (ND64)",
    aperture: "f/11",
    focal: "16-35mm",
    elevation: "海平面",
    bortle: "晨雾蓝调",
    window: "蓝调时刻 07:20 - 08:00",
    tip: "利用退潮沙滩水面长曝光消除水波，捕捉倒映在深色冰川海水中的教皇冠峰。"
  },
  {
    image: VERIFIED_LANDSCAPE_LIBRARY.JP_FUJI_PAGODA.url,
    name: "富士山浅间公园五重塔",
    spotType: "ICONIC VIEW · 经典雪顶和风",
    iso: "ISO 200",
    shutter: "1/60s",
    aperture: "f/5.6",
    focal: "50mm F1.8",
    elevation: "850m",
    bortle: "夕阳晚霞",
    window: "日落前 17:15 - 18:00",
    tip: "中焦段压缩忠灵塔与远方雪白富士山同框，日落前 30 分钟塔身朱红暖光最佳。"
  },
  {
    image: VERIFIED_LANDSCAPE_LIBRARY.JP_KYOTO_PAGODA.url,
    name: "京都八坂之塔古街暮色",
    spotType: "HERITAGE · 古都雅韵机位",
    iso: "ISO 400",
    shutter: "1/80s",
    aperture: "f/2.8",
    focal: "35mm F1.4",
    elevation: "55m",
    bortle: "石板路暖灯",
    window: "蓝调傍晚 18:00 - 19:00",
    tip: "清晨或傍晚沿二年坂石阶仰拍，避开拥挤游客，捕捉飞檐与石板路倒影。"
  },
  {
    image: VERIFIED_LANDSCAPE_LIBRARY.CH_MATTERHORN_PEAK.url,
    name: "采尔马特利菲尔湖倒影",
    spotType: "ALPINE REFLECTION · 黄金日照金山",
    iso: "ISO 100",
    shutter: "1/125s",
    aperture: "f/8.0",
    focal: "24mm F1.4",
    elevation: "2757m",
    bortle: "晨曦金顶",
    window: "日出金顶 05:45 - 06:20",
    tip: "清晨无风时蹲守利菲尔湖边，捕捉马特洪峰第一缕金光倒映在澄澈冰川湖中。"
  },
  {
    image: VERIFIED_LANDSCAPE_LIBRARY.NO_LOFOTEN_AURORA.url,
    name: "挪威罗弗敦雷纳村极光",
    spotType: "AURORA CHASER · 极光红木屋",
    iso: "ISO 1600",
    shutter: "8s",
    aperture: "f/1.8",
    focal: "14mm GM",
    elevation: "15m",
    bortle: "Kp 4-6 极光带",
    window: "绿光爆发 21:00 - 01:30",
    tip: "经典红色高脚渔屋作为前景暖调，大光圈广角捕捉在峡湾雪山上空起舞的极光弧。"
  },
  {
    image: VERIFIED_LANDSCAPE_LIBRARY.IT_DOLOMITES_PEAKS.url,
    name: "意大利多洛米蒂休斯高原",
    spotType: "DRAMATIC ALPS · 巨峰光影漫游",
    iso: "ISO 100",
    shutter: "1/160s",
    aperture: "f/8.0",
    focal: "70mm F2.8",
    elevation: "2000m",
    bortle: "暮色金辉",
    window: "夕阳金辉 18:30 - 19:15",
    tip: "中长焦压缩休斯高原高山木屋与直插云霄的萨索伦戈白云石巨峰空间层次。"
  },
  {
    image: VERIFIED_LANDSCAPE_LIBRARY.IS_JOKULSARLON_ICE.url,
    name: "冰岛杰古沙龙钻石黑沙滩",
    spotType: "GLACIER SEASCAPE · 远古冰晶慢门",
    iso: "ISO 100",
    shutter: "2s (ND8)",
    aperture: "f/11",
    focal: "24mm GM",
    elevation: "海平面",
    bortle: "冷冽晨光",
    window: "日出微光 07:00 - 08:30",
    tip: "贴近黑色火山沙滩上剔透的蓝色冰块，慢门雾化大西洋海浪退去时的白色拉丝水花。"
  },
  {
    image: VERIFIED_LANDSCAPE_LIBRARY.CA_BANFF_MORAINE_LAKE.url,
    name: "加拿大班夫梦莲湖十峰山",
    spotType: "GLACIAL OASIS · 绝美翡翠湖泊",
    iso: "ISO 100",
    shutter: "1/80s",
    aperture: "f/9.0",
    focal: "16-35mm",
    elevation: "1884m",
    bortle: "清晨无风",
    window: "日出晨光 06:00 - 07:15",
    tip: "攀上石堆观景台，清晨第一缕晨光洒在十峰山金顶，倒映在不可思议的绿松石色湖面。"
  },
  {
    image: VERIFIED_LANDSCAPE_LIBRARY.GR_SANTORINI_OIA.url,
    name: "希腊圣托里尼伊亚蓝顶教堂",
    spotType: "AEGEAN ROMANCE · 爱琴海蓝顶夕阳",
    iso: "ISO 100",
    shutter: "1/250s",
    aperture: "f/8.0",
    focal: "28mm F2.0",
    elevation: "120m",
    bortle: "爱琴海夕照",
    window: "日落时刻 19:30 - 20:30",
    tip: "顺着伊亚悬崖小巷捕捉三重蓝顶教堂与远方火红夕阳沉入爱琴海的永恒瞬间。"
  },
  {
    image: VERIFIED_LANDSCAPE_LIBRARY.CN_GUIZHOU_KARST.url,
    name: "中国西南秘境喀斯特峰林",
    spotType: "NATURAL KARST · 喀斯特奇观",
    iso: "ISO 100",
    shutter: "1/160s",
    aperture: "f/8.0",
    focal: "24-70mm",
    elevation: "420m",
    bortle: "晨雾绕山",
    window: "晨间 07:00 - 09:00",
    tip: "捕捉晨雾缭绕在孤峰翠竹之间的中国传统水墨意境，利用水面慢门倒影增添灵动。"
  }
];

// 全球灵感画廊：经由语义匹配引擎绑定的 8 大真实目的地大片
const GLOBAL_INSPIRATIONS_LIST = [
  {
    tag: "风光自驾",
    title: "新西兰南岛 7 天自驾与暗夜星空",
    query: "计划新西兰南岛7天自驾之旅，重点特卡波暗夜星空、库克山胡克谷冰川与皇后镇美食，包含专业摄影机位",
    img: VERIFIED_LANDSCAPE_LIBRARY.NZ_TEKAPO_NIGHT.url
  },
  {
    tag: "城市人文",
    title: "东京 7 天动漫圣地与米其林漫游",
    query: "计划东京7天深度游，涵盖浅草古刹、涩谷十字路口夜景、秋叶原动漫与筑地海鲜市场美食",
    img: VERIFIED_LANDSCAPE_LIBRARY.JP_TOKYO_SHIBUYA.url
  },
  {
    tag: "雪山列车",
    title: "瑞士阿尔卑斯 10 天全景列车",
    query: "瑞士10天黄金列车与冰川快车全景游，游览少女峰、马特洪峰与日内瓦湖",
    img: VERIFIED_LANDSCAPE_LIBRARY.CH_SWISS_LAUTERBRUNNEN.url
  },
  {
    tag: "极光秘境",
    title: "挪威罗弗敦 6 天峡湾极光追猎",
    query: "计划挪威罗弗敦群岛6天冬季追光之旅，包含雷纳小镇红色木屋摄影、峡湾雪山巡航与帝王蟹盛宴",
    img: VERIFIED_LANDSCAPE_LIBRARY.NO_LOFOTEN_AURORA.url
  },
  {
    tag: "高山徒步",
    title: "意大利多洛米蒂 8 天徒步自驾",
    query: "意大利多洛米蒂山脉8天自驾轻徒步，重点刀锋山Seceda、三峰山与休斯高原高山木屋",
    img: VERIFIED_LANDSCAPE_LIBRARY.IT_DOLOMITES_PEAKS.url
  },
  {
    tag: "古都雅韵",
    title: "京都奈良 5 天风雅茶道之旅",
    query: "京都奈良5天漫步，探访伏见稻荷大社、岚山竹林、清水寺与奈良公园小鹿互动",
    img: VERIFIED_LANDSCAPE_LIBRARY.JP_KYOTO_PAGODA.url
  },
  {
    tag: "落基国家公园",
    title: "加拿大班夫贾斯珀 7 天自驾",
    query: "加拿大阿尔伯塔省7天自驾，深度探索班夫国家公园、路易斯湖、冰原大道与梦莲湖日出机位",
    img: VERIFIED_LANDSCAPE_LIBRARY.CA_BANFF_MORAINE_LAKE.url
  },
  {
    tag: "海岛浪漫",
    title: "希腊圣托里尼与米克诺斯 6 天",
    query: "希腊爱琴海双岛6天度假，打卡伊亚小镇蓝顶教堂日落、白沙滩与悬崖无边泳池酒店",
    img: VERIFIED_LANDSCAPE_LIBRARY.GR_SANTORINI_OIA.url
  }
];

export default function WelcomeLandingView({
  language,
  onToggleLanguage,
  onStartPlanning,
  onDirectExplore,
  isGenerating,
  generatingSteps
}) {
  const [inputText, setInputText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  
  // 影像机位当前索引与自动播放状态
  const [activePhotoSpotIndex, setActivePhotoSpotIndex] = useState(0);
  const [isVisionAutoPlaying, setIsVisionAutoPlaying] = useState(true);

  // 随机起始大片索引，每次进入页面都是新风景
  const [heroSlideIndex, setHeroSlideIndex] = useState(() => Math.floor(Math.random() * GLOBAL_SCENIC_CAROUSEL.length));
  const inputRef = useRef(null);

  const t = TRANSLATIONS[language]?.welcome || TRANSLATIONS.zh.welcome;

  // 1. 自动无限轮播 Hero 背景大片 (每 5 秒平滑切换，永无止境)
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlideIndex(prev => (prev + 1) % GLOBAL_SCENIC_CAROUSEL.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // 2. 自动无限轮播影像机位大片 (每 5 秒平滑切换，支持暂停/播放)
  useEffect(() => {
    if (!isVisionAutoPlaying) return;
    const visionTimer = setInterval(() => {
      setActivePhotoSpotIndex(prev => (prev + 1) % GLOBAL_MASTER_PHOTO_SPOTS.length);
    }, 5000);
    return () => clearInterval(visionTimer);
  }, [isVisionAutoPlaying]);

  // 手动切换 Hero 上一张/下一张
  const handlePrevHeroSlide = () => {
    setHeroSlideIndex(prev => (prev - 1 + GLOBAL_SCENIC_CAROUSEL.length) % GLOBAL_SCENIC_CAROUSEL.length);
  };

  const handleNextHeroSlide = () => {
    setHeroSlideIndex(prev => (prev + 1) % GLOBAL_SCENIC_CAROUSEL.length);
  };

  // 手动切换摄影机位 上一张/下一张
  const handlePrevVisionSpot = () => {
    setActivePhotoSpotIndex(prev => (prev - 1 + GLOBAL_MASTER_PHOTO_SPOTS.length) % GLOBAL_MASTER_PHOTO_SPOTS.length);
  };

  const handleNextVisionSpot = () => {
    setActivePhotoSpotIndex(prev => (prev + 1) % GLOBAL_MASTER_PHOTO_SPOTS.length);
  };

  // 点击偏好标签追加到输入框
  const handleToggleTag = (tagObj) => {
    const isSelected = selectedTags.includes(tagObj.tag);
    let newTags;
    if (isSelected) {
      newTags = selectedTags.filter(t => t !== tagObj.tag);
    } else {
      newTags = [...selectedTags, tagObj.tag];
    }
    setSelectedTags(newTags);

    if (!isSelected && !inputText.includes(tagObj.tag)) {
      const separator = inputText.trim().length > 0 ? '，' : '';
      setInputText(prev => `${prev.trim()}${separator}希望包含${tagObj.tag}`);
    }
  };

  // 点击灵感示例一键载入
  const handleSelectInspiration = (insp) => {
    setInputText(insp.query);
    if (inputRef.current) {
      inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      inputRef.current.focus();
    }
  };

  // 提交规划需求
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isGenerating) return;
    onStartPlanning(inputText.trim());
  };

  // 页面锚点平滑滚动
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const currentSpot = GLOBAL_MASTER_PHOTO_SPOTS[activePhotoSpotIndex] || GLOBAL_MASTER_PHOTO_SPOTS[0];

  return (
    <div className="fullbleed-welcome-root">
      {/* 顶部高透钛金悬浮导航栏 (100% 满屏贯穿) */}
      <header className="fullbleed-header">
        <div className="fullbleed-nav-inner">
          <div className="fullbleed-logo-group" onClick={() => scrollToSection('stage-hero')}>
            <div className="fullbleed-logo-icon">
              <Compass size={22} color="#10B981" strokeWidth={2.4} />
            </div>
            <div className="fullbleed-brand">
              <span className="fullbleed-brand-name">Roam AI</span>
              <span className="fullbleed-agent-pill">OpenClaw Agent</span>
            </div>
          </div>

          {/* 全局特色锚点导航 */}
          <nav className="fullbleed-nav-links">
            <button onClick={() => scrollToSection('stage-hero')} className="fullbleed-nav-anchor">
              {t.nav.planner}
            </button>
            <button onClick={() => scrollToSection('stage-spatial')} className="fullbleed-nav-anchor">
              {t.nav.spatial}
            </button>
            <button onClick={() => scrollToSection('stage-vision')} className="fullbleed-nav-anchor">
              {t.nav.vision}
            </button>
            <button onClick={() => scrollToSection('stage-knowledge')} className="fullbleed-nav-anchor">
              {t.nav.knowledge}
            </button>
            <button onClick={() => scrollToSection('stage-inspirations')} className="fullbleed-nav-anchor">
              {language === 'zh' ? '全球画廊' : 'Gallery'}
            </button>
          </nav>

          <div className="fullbleed-header-actions">
            {/* 语言切换 */}
            <button 
              className="fullbleed-lang-btn"
              onClick={onToggleLanguage}
              title={language === 'zh' ? 'Switch to English' : '切换为中文'}
            >
              <Globe size={15} color="#94A3B8" />
              <span>{language === 'zh' ? 'EN' : '中文'}</span>
            </button>

            {/* 进入看板 */}
            <button 
              className="fullbleed-enter-btn"
              onClick={onDirectExplore}
            >
              <span>{t.nav.enterDashboard}</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          STAGE 1: 100vw × 100vh 全屏流媒体 Hero 主屏 (海量 Unsplash 4K 大片无限轮播)
          ========================================================================= */}
      <section id="stage-hero" className="fullbleed-stage hero-stage">
        {/* 全球大片无限平滑交叉淡入淡出轮播背景 */}
        <div className="hero-carousel-container">
          {GLOBAL_SCENIC_CAROUSEL.map((bg, idx) => (
            <div 
              key={idx} 
              className={`hero-carousel-slide ${heroSlideIndex === idx ? 'active' : ''}`}
              style={{ backgroundImage: `url(${bg.url})` }}
            >
              <div className="slide-overlay-gradient"></div>
            </div>
          ))}
        </div>

        {/* 动态暗角与流光光效 */}
        <div className="hero-vignette"></div>

        {/* 左右手动切换大片微控钮 */}
        <button 
          className="hero-carousel-arrow arrow-left"
          onClick={handlePrevHeroSlide}
          title="上一张大片"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          className="hero-carousel-arrow arrow-right"
          onClick={handleNextHeroSlide}
          title="下一张大片"
        >
          <ChevronRight size={24} />
        </button>

        {/* 轮播图指示器与机位信息 (展示当前地标与流转进度) */}
        <div className="hero-slide-meta">
          <div className="hero-slide-counter">
            <span className="counter-curr">{String(heroSlideIndex + 1).padStart(2, '0')}</span>
            <span className="counter-divider">/</span>
            <span className="counter-total">{String(GLOBAL_SCENIC_CAROUSEL.length).padStart(2, '0')}</span>
          </div>
          <div className="hero-slide-desc">
            <MapPin size={13} color="#10B981" />
            <span>{GLOBAL_SCENIC_CAROUSEL[heroSlideIndex]?.location}</span>
            <span className="photo-source-badge">📸 Unsplash</span>
          </div>
        </div>

        {/* Hero 主体内容 (居中极智指令舱) */}
        <div className="hero-stage-content">
          <div className="hero-badge-capsule">
            <Sparkles size={14} color="#10B981" className="animate-pulse" />
            <span>{t.badge}</span>
          </div>

          <h1 className="hero-giant-title">
            {t.heroTitle}
          </h1>
          <p className="hero-giant-subtitle">
            {t.heroSubtitle}
          </p>

          {/* 悬浮磨砂智能指令舱 */}
          <div className="hero-floating-capsule">
            <form onSubmit={handleSubmit} className="capsule-form">
              {/* 输入框在上 */}
              <div className="capsule-textarea-wrap">
                <textarea
                  ref={inputRef}
                  className="capsule-textarea"
                  rows={3}
                  placeholder={t.inputPlaceholder}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  disabled={isGenerating}
                />
              </div>

              {/* 快捷偏好小框紧随输入框下方，完全居中排列，不显示“标签”二字 */}
              <div className="capsule-chips-centered">
                {t.preferences.map((tagObj, idx) => {
                  const active = selectedTags.includes(tagObj.tag);
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`capsule-tag-chip ${active ? 'active' : ''}`}
                      onClick={() => handleToggleTag(tagObj)}
                      disabled={isGenerating}
                    >
                      {tagObj.label}
                    </button>
                  );
                })}
              </div>

              {/* 卡片底栏操作区 */}
              <div className="capsule-action-footer">
                <div className="capsule-hint-text">
                  {language === 'zh' ? '💡 支持自由输入全球任意国家、天数、同行偏好与自驾预算' : '💡 Feel free to input any global destination, duration or travel style'}
                </div>

                <button
                  type="submit"
                  className={`capsule-primary-btn ${isGenerating ? 'generating' : ''}`}
                  disabled={!inputText.trim() || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-white" />
                      <span>{t.generatingBtn}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} color="#FFFFFF" />
                      <span>{t.generateBtn}</span>
                      <ArrowRight size={16} color="#FFFFFF" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* 实时遥测数据引力带 */}
          <div className="hero-telemetry-strip">
            {t.telemetry.map((item, idx) => (
              <div key={idx} className="telemetry-pill">
                <div className="telemetry-live-dot"></div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 向下滚动提示 */}
        <button className="hero-scroll-indicator" onClick={() => scrollToSection('stage-spatial')}>
          <span>EXPLORE FEATURES</span>
          <ChevronDown size={18} className="animate-bounce" />
        </button>
      </section>

      {/* =========================================================================
          STAGE 2: 100vw × 100vh 4D 时空路线推演全屏舞台 (Spatial Routing Stage)
          ========================================================================= */}
      <section id="stage-spatial" className="fullbleed-stage spatial-stage">
        {/* 全屏拟真自驾公路背景大片 */}
        <div 
          className="stage-fullscreen-bg"
          style={{ backgroundImage: `url('${VERIFIED_LANDSCAPE_LIBRARY.NZ_SOUTHERN_ALPS_HIGHWAY.url}')` }}
        >
          <div className="stage-overlay-darken"></div>
        </div>

        <div className="stage-content-container">
          <div className="stage-headline-block">
            <div className="stage-tag-badge">
              <Navigation size={14} color="#10B981" />
              <span>{t.spatialEngine.badge}</span>
            </div>
            <h2 className="stage-giant-title">{t.spatialEngine.title}</h2>
            <p className="stage-giant-subtitle">{t.spatialEngine.subtitle}</p>
          </div>

          {/* 理想智驾级 4D 时空推演全景大卡片 */}
          <div className="spatial-panoramic-matrix">
            {/* 左侧：动态公路流态与高差剖面 */}
            <div className="spatial-route-viewport">
              <div className="spatial-hud-top">
                <div className="spatial-live-badge">
                  <Activity size={13} color="#10B981" />
                  <span>AUTONOMOUS SPATIAL TELEMETRY</span>
                </div>
                <div className="spatial-route-title">{t.spatialEngine.cardTitle}</div>
                <div className="spatial-route-sub">{t.spatialEngine.cardDesc}</div>
              </div>

              {/* 拟真动态航点进度条 */}
              <div className="spatial-interactive-timeline">
                <div className="timeline-node active">
                  <span className="node-pulse"></span>
                  <span className="node-label">基督城 (起)</span>
                  <span className="node-sub">提车补给 0km</span>
                </div>
                <div className="timeline-connector active"></div>
                <div className="timeline-node active">
                  <span className="node-pulse"></span>
                  <span className="node-label">特卡波湖 (暗夜)</span>
                  <span className="node-sub">暗夜银河 225km</span>
                </div>
                <div className="timeline-connector active"></div>
                <div className="timeline-node active">
                  <span className="node-pulse"></span>
                  <span className="node-label">库克山 (冰川)</span>
                  <span className="node-sub">胡克谷步道 330km</span>
                </div>
                <div className="timeline-connector"></div>
                <div className="timeline-node">
                  <span className="node-pulse inactive"></span>
                  <span className="node-label">皇后镇 (终)</span>
                  <span className="node-sub">高山跳伞 650km</span>
                </div>
              </div>
            </div>

            {/* 右侧：3 大真实数字化指标 */}
            <div className="spatial-metrics-deck">
              {t.spatialEngine.metrics.map((m, idx) => (
                <div key={idx} className="spatial-deck-card">
                  <div className="deck-num-row">
                    <span className="deck-num">{m.value}</span>
                    <span className="deck-label">{m.label}</span>
                  </div>
                  <div className="deck-desc">{m.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          STAGE 3: 100vw × 100vh 大疆级 Pro 影像 HUD 全屏舞台 (Pro Vision Stage)
          (大片自动轮播 + 靠侧HUD参数排版，中央视野全透)
          ========================================================================= */}
      <section id="stage-vision" className="fullbleed-stage vision-stage">
        {/* 全屏摄影大片背景 (全量机位自动轮播或点击切换，真实景观 100% 严丝合缝) */}
        <div 
          className="stage-fullscreen-bg"
          style={{ backgroundImage: `url('${currentSpot.image}')` }}
        >
          <div className="stage-overlay-vignette"></div>
        </div>

        {/* 视口全屏相机 HUD 取景器线框与准星 */}
        <div className="viewport-camera-hud">
          {/* 四角取景器瞄准框 */}
          <div className="hud-corner top-left"></div>
          <div className="hud-corner top-right"></div>
          <div className="hud-corner bottom-left"></div>
          <div className="hud-corner bottom-right"></div>

          {/* 九宫格构图参考线 */}
          <div className="hud-grid-line h-1"></div>
          <div className="hud-grid-line h-2"></div>
          <div className="hud-grid-line v-1"></div>
          <div className="hud-grid-line v-2"></div>

          {/* 中心红点对焦准星 */}
          <div className="hud-center-crosshair">
            <Crosshair size={28} color="rgba(239, 68, 68, 0.85)" />
          </div>
        </div>

        {/* 顶部标题与机位快速滑动条 */}
        <div className="stage-content-container z-relative vision-top-container">
          <div className="stage-headline-block vision-headline-block">
            <div className="stage-tag-badge">
              <Camera size={14} color="#3B82F6" />
              <span>{t.proVision.badge}</span>
            </div>
            <h2 className="stage-giant-title">{t.proVision.title}</h2>
            <p className="stage-giant-subtitle">{t.proVision.subtitle}</p>
          </div>

          {/* 交互式机位快速切换胶囊条 */}
          <div className="vision-spots-scroll-bar">
            {GLOBAL_MASTER_PHOTO_SPOTS.map((spot, idx) => (
              <button
                key={idx}
                className={`vision-spot-capsule ${activePhotoSpotIndex === idx ? 'active' : ''}`}
                onClick={() => {
                  setActivePhotoSpotIndex(idx);
                  setIsVisionAutoPlaying(false);
                }}
              >
                <span className="capsule-num">0{idx + 1}</span>
                <span className="capsule-title">{spot.name}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 靠左侧停靠的精细相机 HUD 悬浮参数控制板 (中央画面全透空出) */}
        <aside className="vision-sidebar-hud-panel">
          <div className="sidebar-hud-header">
            <div className="hud-lens-tag">
              <Camera size={14} color="#60A5FA" />
              <span>{currentSpot.spotType}</span>
            </div>
            
            <div className="hud-header-right-badges">
              <span className="hud-source-badge">📸 Unsplash</span>
              {/* 自动播放/暂停开关 */}
              <button 
                className="hud-play-toggle-btn"
                onClick={() => setIsVisionAutoPlaying(!isVisionAutoPlaying)}
                title={isVisionAutoPlaying ? "暂停自动轮播" : "恢复自动轮播"}
              >
                {isVisionAutoPlaying ? (
                  <>
                    <Pause size={12} color="#10B981" />
                    <span className="play-state-text">AUTO</span>
                  </>
                ) : (
                  <>
                    <Play size={12} color="#94A3B8" />
                    <span className="play-state-text">PAUSED</span>
                  </>
                )}
              </button>
            </div>
          </div>

          <h3 className="hud-spot-title">{currentSpot.name}</h3>

          {/* 镜头与曝光参数矩阵 */}
          <div className="hud-optical-grid-box">
            <div className="opt-grid-item">
              <span className="opt-label">FOCAL LENS</span>
              <span className="opt-val">{currentSpot.focal}</span>
            </div>
            <div className="opt-grid-item">
              <span className="opt-label">APERTURE</span>
              <span className="opt-val">{currentSpot.aperture}</span>
            </div>
            <div className="opt-grid-item">
              <span className="opt-label">SHUTTER</span>
              <span className="opt-val">{currentSpot.shutter}</span>
            </div>
            <div className="opt-grid-item highlight">
              <span className="opt-label">ISO SPEED</span>
              <span className="opt-val">{currentSpot.iso}</span>
            </div>
            <div className="opt-grid-item">
              <span className="opt-label">ELEVATION</span>
              <span className="opt-val">{currentSpot.elevation}</span>
            </div>
            <div className="opt-grid-item highlight">
              <span className="opt-label">SKY / LIGHT</span>
              <span className="opt-val">{currentSpot.bortle}</span>
            </div>
          </div>

          {/* 采光/银河时间窗与构图建议 */}
          <div className="hud-tip-card-inner">
            <div className="tip-window-tag">
              <Clock size={13} color="#F59E0B" />
              <span>{currentSpot.window}</span>
            </div>
            <div className="tip-text-content">
              {currentSpot.tip}
            </div>
          </div>

          {/* 左右手动换机位微钮 */}
          <div className="hud-manual-nav-row">
            <button className="hud-nav-btn" onClick={handlePrevVisionSpot}>
              <ChevronLeft size={16} />
              <span>PREV SPOT</span>
            </button>
            <div className="hud-spot-counter">
              {String(activePhotoSpotIndex + 1).padStart(2, '0')} / {String(GLOBAL_MASTER_PHOTO_SPOTS.length).padStart(2, '0')}
            </div>
            <button className="hud-nav-btn" onClick={handleNextVisionSpot}>
              <span>NEXT SPOT</span>
              <ChevronRight size={16} />
            </button>
          </div>
        </aside>
      </section>

      {/* =========================================================================
          STAGE 4: 100vw × 100vh 知识架构全屏舞台 (Architecture Stage)
          ========================================================================= */}
      <section id="stage-knowledge" className="fullbleed-stage architecture-stage">
        {/* 全屏深空神经网络科技背景 */}
        <div className="architecture-grid-bg"></div>

        <div className="stage-content-container z-relative">
          <div className="stage-headline-block">
            <div className="stage-tag-badge">
              <Layers size={14} color="#10B981" />
              <span>{t.knowledgeMesh.badge}</span>
            </div>
            <h2 className="stage-giant-title">{t.knowledgeMesh.title}</h2>
            <p className="stage-giant-subtitle">{t.knowledgeMesh.subtitle}</p>
          </div>

          {/* 4 大生动图文科技展示卡片 (2x2 全景矩阵，配有独立特色插图与真实技术解构) */}
          <div className="architecture-illustrated-grid">
            {t.knowledgeMesh.layers.map((layer, idx) => (
              <div key={idx} className="architecture-showcase-card">
                {/* 独立科技视觉插图区 */}
                <div 
                  className="showcase-card-visual"
                  style={{ backgroundImage: `url('${layer.image}')` }}
                >
                  <div className="visual-vignette-overlay"></div>
                  <div className="visual-top-badge">
                    <span className="visual-layer-num">LAYER {layer.num}</span>
                    <div className="visual-live-dot"></div>
                  </div>
                </div>

                {/* 详细文字解构区 */}
                <div className="showcase-card-body">
                  <div className="card-sub-tag">
                    <ShieldCheck size={13} color="#10B981" />
                    <span>{layer.tag}</span>
                  </div>
                  <h3 className="card-heading-title">{layer.name}</h3>
                  <p className="card-detail-desc">{layer.desc}</p>
                  
                  <div className="card-status-bar">
                    <div className="status-indicator-dot"></div>
                    <span className="status-label">ACTIVE KERNEL · 100% OPERATIONAL</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          STAGE 5: 100vw × 100vh 全球灵感全景画廊 (海量 8 大全球目的地大片矩阵)
          ========================================================================= */}
      <section id="stage-inspirations" className="fullbleed-stage inspirations-stage">
        <div className="stage-content-container z-relative">
          <div className="stage-headline-block">
            <div className="stage-tag-badge">
              <Sparkles size={14} color="#F59E0B" />
              <span>{t.inspirations.badge}</span>
            </div>
            <h2 className="stage-giant-title">{t.inspirations.title}</h2>
            <p className="stage-giant-subtitle">{t.inspirations.subtitle}</p>
          </div>

          {/* 全屏展开式 8 大目的地大片网格 (100% 景观一致与真地标对应) */}
          <div className="inspirations-full-grid">
            {GLOBAL_INSPIRATIONS_LIST.map((item, idx) => (
              <div 
                key={idx} 
                className="inspiration-fullscreen-card"
                onClick={() => handleSelectInspiration(item)}
              >
                <div 
                  className="card-bg-layer"
                  style={{ backgroundImage: `url('${item.img}')` }}
                />
                <div className="card-gradient-layer"></div>
                <div className="card-meta-box">
                  <div className="card-top-tag-row">
                    <span className="card-tag">{item.tag}</span>
                    <span className="card-source-tag">📸 Unsplash</span>
                  </div>
                  <h3 className="card-title">{item.title}</h3>
                  <p className="card-desc">{item.query}</p>
                  <div className="card-cta-row">
                    <span>{language === 'zh' ? '一键载入并智能规划' : 'Load & Plan'}</span>
                    <ArrowRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          STAGE 6: 终极启程行动舞台 (Grand Finale Footer Stage)
          ========================================================================= */}
      <footer className="fullbleed-stage finale-stage">
        <div className="finale-vignette-overlay"></div>

        <div className="finale-content-box">
          <h2 className="finale-title">{t.bottomCta.title}</h2>
          <p className="finale-subtitle">{t.bottomCta.subtitle}</p>
          
          <div className="finale-btn-group">
            <button 
              className="finale-launch-btn"
              onClick={() => {
                if (inputRef.current) {
                  inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  inputRef.current.focus();
                }
              }}
            >
              <Sparkles size={18} color="#FFFFFF" />
              <span>{t.bottomCta.startBtn}</span>
              <ArrowRight size={16} color="#FFFFFF" />
            </button>

            <button 
              className="finale-demo-btn"
              onClick={onDirectExplore}
            >
              <span>{t.bottomCta.demoBtn}</span>
            </button>
          </div>
        </div>

        <div className="fullbleed-bottom-credits">
          <span>© 2026 Roam AI Travel Planner · OpenClaw Agent Intelligence</span>
          <span>Photos & Imagery via Unsplash Free License · DOC Official Knowledge Base Verified · Extended Thinking Enabled</span>
        </div>
      </footer>

      {/* 生成中动态推理弹窗 / 进度遮罩 */}
      {isGenerating && (
        <div className="welcome-generating-overlay">
          <div className="welcome-generating-modal">
            <div className="generating-icon-pulse">
              <Sparkles size={32} color="#10B981" className="animate-spin" />
            </div>
            <h3 className="generating-title">
              {language === 'zh' ? 'AI 正在智能规划您的专属行程' : 'AI is Crafting Your Travel Plan'}
            </h3>
            <p className="generating-subtitle">
              {language === 'zh' ? 'OpenClaw Agent 拓展思考多维推理中...' : 'OpenClaw Agent Reasoning with Extended Thinking...'}
            </p>

            <div className="generating-steps-list">
              {(generatingSteps && generatingSteps.length > 0 ? generatingSteps : [
                language === 'zh' ? '正在检索官方风景名胜与私有知识库...' : 'Retrieving official travel & trail guides...',
                language === 'zh' ? '正在智能规划行车路线与时间分配...' : 'Optimizing driving routes & daily schedule...',
                language === 'zh' ? '正在精选最佳出片机位与地道特色风物...' : 'Selecting photo spots & local cuisine...'
              ]).map((stepText, sIdx) => (
                <div key={sIdx} className="generating-step-item">
                  <CheckCircle2 size={16} color="#10B981" className="flex-shrink-0 animate-pulse" />
                  <span>{stepText}</span>
                </div>
              ))}
            </div>

            <div className="generating-bar-track">
              <div className="generating-bar-fill"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
