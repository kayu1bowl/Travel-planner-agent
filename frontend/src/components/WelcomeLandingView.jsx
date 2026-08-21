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
  Radio
} from 'lucide-react';
import { TRANSLATIONS } from '../services/i18n';

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
  const [activePhotoSpotIndex, setActivePhotoSpotIndex] = useState(0);
  const [heroSlideIndex, setHeroSlideIndex] = useState(0);
  const inputRef = useRef(null);

  const t = TRANSLATIONS[language]?.welcome || TRANSLATIONS.zh.welcome;

  // Hero 全屏 4K 背景多大片轮播图源 (无缝交叉淡入淡出)
  const heroBackgrounds = [
    {
      url: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1920&auto=format&fit=crop&q=85",
      title: "Lake Tekapo Dark Sky Reserve",
      location: "新西兰特卡波湖 · 国际暗夜星空保护区"
    },
    {
      url: "https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&auto=format&fit=crop&q=85",
      title: "Southern Alps Scenic Highway",
      location: "新西兰南岛 8 号国道 · 纵贯南阿尔卑斯山脉"
    },
    {
      url: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1920&auto=format&fit=crop&q=85",
      title: "Milford Sound Fiordland",
      location: "米尔福德峡湾 · 世界自然遗产地"
    },
    {
      url: "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1920&auto=format&fit=crop&q=85",
      title: "Swiss Alps Panoramic Railway",
      location: "瑞士阿尔卑斯 · 冰川快车全景路线"
    }
  ];

  // 摄影机位图源与取景预设 (全屏覆盖)
  const photoSpotsData = [
    {
      image: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1920&auto=format&fit=crop&q=85",
      name: "好牧羊人教堂 · 暗夜银河拱桥",
      spotType: "ASTROPHOTOGRAPHY HUD 01",
      iso: "ISO 3200",
      shutter: "20s",
      aperture: "f/2.8",
      focal: "14mm GM",
      elevation: "710m",
      bortle: "Class 1 (极黑)",
      window: "银河升起 23:30 - 03:15",
      tip: "超广角低机位仰拍，石砌教堂作为前景纳整片银河拱桥，避开小镇杂光。"
    },
    {
      image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1920&auto=format&fit=crop&q=85",
      name: "罗伊斯山峰 · 晨光云海脊线",
      spotType: "GOLDEN HOUR HUD 02",
      iso: "ISO 100",
      shutter: "1/200s",
      aperture: "f/8.0",
      focal: "35mm F1.4",
      elevation: "1578m",
      bortle: "日出逆光",
      window: "黄金时刻 06:15 - 07:00",
      tip: "逆光拍摄山脊延伸至瓦纳卡湖，使用 CPL 偏振镜消除湖面反光与杂色。"
    },
    {
      image: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1920&auto=format&fit=crop&q=85",
      name: "米尔福德峡湾 · 冠峰镜面倒影",
      spotType: "BLUE HOUR HUD 03",
      iso: "ISO 100",
      shutter: "30s (ND64)",
      aperture: "f/11",
      focal: "16-35mm + CPL",
      elevation: "海平面",
      bortle: "晨雾蓝调",
      window: "蓝调时刻 07:20 - 08:00",
      tip: "利用退潮沙滩水面长曝光消除水波，捕捉倒映在深色海水中的教皇冠峰。"
    }
  ];

  // 灵感卡片全屏高清背景
  const inspirationImages = [
    "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1200&auto=format&fit=crop&q=85",
    "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=1200&auto=format&fit=crop&q=85",
    "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=1200&auto=format&fit=crop&q=85",
    "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=1200&auto=format&fit=crop&q=85"
  ];

  // 自动轮播 Hero 背景大片 (每 6 秒平滑切换)
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlideIndex(prev => (prev + 1) % heroBackgrounds.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroBackgrounds.length]);

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
          STAGE 1: 100vw × 100vh 全屏流媒体 Hero 主屏 (Cinematic Carousel Stage)
          ========================================================================= */}
      <section id="stage-hero" className="fullbleed-stage hero-stage">
        {/* 多张 4K 风光大片平滑交叉淡入淡出轮播背景 */}
        <div className="hero-carousel-container">
          {heroBackgrounds.map((bg, idx) => (
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

        {/* 轮播图指示器与机位信息 */}
        <div className="hero-slide-meta">
          <div className="hero-slide-pills">
            {heroBackgrounds.map((_, idx) => (
              <button 
                key={idx}
                className={`slide-indicator-pill ${heroSlideIndex === idx ? 'active' : ''}`}
                onClick={() => setHeroSlideIndex(idx)}
              />
            ))}
          </div>
          <div className="hero-slide-desc">
            <MapPin size={13} color="#10B981" />
            <span>{heroBackgrounds[heroSlideIndex]?.location}</span>
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

              {/* 快捷偏好标签 */}
              <div className="capsule-tags-row">
                <span className="capsule-tags-label">{t.preferencesTitle}:</span>
                <div className="capsule-tags-group">
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
          style={{ backgroundImage: `url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1920&auto=format&fit=crop&q=85')` }}
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

            {/* 右侧：3 大数字化指标 */}
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
          ========================================================================= */}
      <section id="stage-vision" className="fullbleed-stage vision-stage">
        {/* 全屏摄影大片背景 (随机位点击无缝切换) */}
        <div 
          className="stage-fullscreen-bg"
          style={{ backgroundImage: `url('${photoSpotsData[activePhotoSpotIndex]?.image}')` }}
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

        <div className="stage-content-container z-relative">
          <div className="stage-headline-block">
            <div className="stage-tag-badge">
              <Camera size={14} color="#3B82F6" />
              <span>{t.proVision.badge}</span>
            </div>
            <h2 className="stage-giant-title">{t.proVision.title}</h2>
            <p className="stage-giant-subtitle">{t.proVision.subtitle}</p>
          </div>

          {/* 交互式机位切换选择器 */}
          <div className="vision-spots-selector">
            {t.proVision.spots.map((spot, idx) => (
              <button
                key={idx}
                className={`vision-spot-capsule ${activePhotoSpotIndex === idx ? 'active' : ''}`}
                onClick={() => setActivePhotoSpotIndex(idx)}
              >
                <span className="capsule-num">0{idx + 1}</span>
                <span className="capsule-title">{spot.name}</span>
              </button>
            ))}
          </div>

          {/* HUD 参数仪表板 */}
          <div className="vision-hud-dashboard">
            <div className="hud-top-telemetry">
              <div className="hud-lens-badge">
                <Camera size={14} color="#60A5FA" />
                <span>{photoSpotsData[activePhotoSpotIndex]?.spotType}</span>
              </div>

              <div className="hud-optical-strip">
                <div className="optical-item">
                  <span className="opt-label">FOCAL</span>
                  <span className="opt-val">{photoSpotsData[activePhotoSpotIndex]?.focal}</span>
                </div>
                <div className="optical-divider"></div>
                <div className="optical-item">
                  <span className="opt-label">APERTURE</span>
                  <span className="opt-val">{photoSpotsData[activePhotoSpotIndex]?.aperture}</span>
                </div>
                <div className="optical-divider"></div>
                <div className="optical-item">
                  <span className="opt-label">SHUTTER</span>
                  <span className="opt-val">{photoSpotsData[activePhotoSpotIndex]?.shutter}</span>
                </div>
                <div className="optical-divider"></div>
                <div className="optical-item highlight">
                  <span className="opt-label">ISO</span>
                  <span className="opt-val">{photoSpotsData[activePhotoSpotIndex]?.iso}</span>
                </div>
              </div>
            </div>

            <div className="hud-bottom-tip-card">
              <div className="tip-window-tag">
                <Clock size={13} color="#F59E0B" />
                <span>{t.proVision.spots[activePhotoSpotIndex]?.window}</span>
              </div>
              <div className="tip-text-content">
                {t.proVision.spots[activePhotoSpotIndex]?.tip}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          STAGE 4: 100vw × 100vh 澎湃OS 级知识架构全屏舞台 (Architecture Stage)
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

          {/* 4 层悬浮透光科技底座 */}
          <div className="architecture-layers-deck">
            {t.knowledgeMesh.layers.map((layer, idx) => (
              <div key={idx} className="architecture-layer-plaque">
                <div className="layer-num-hex">{layer.num}</div>
                <div className="layer-content-main">
                  <h3 className="layer-main-title">{layer.name}</h3>
                  <p className="layer-main-desc">{layer.desc}</p>
                </div>
                <div className="layer-live-status">
                  <div className="status-indicator-dot"></div>
                  <span>ACTIVE KERNEL</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          STAGE 5: 100vw × 100vh 全球灵感全景画廊 (Inspiration Matrix Stage)
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

          {/* 全屏展开式 4 大目的地大片卡片 */}
          <div className="inspirations-full-grid">
            {t.inspirations.items.map((item, idx) => (
              <div 
                key={idx} 
                className="inspiration-fullscreen-card"
                onClick={() => handleSelectInspiration(item)}
              >
                <div 
                  className="card-bg-layer"
                  style={{ backgroundImage: `url('${inspirationImages[idx % inspirationImages.length]}')` }}
                />
                <div className="card-gradient-layer"></div>
                <div className="card-meta-box">
                  <span className="card-tag">{item.tag}</span>
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
          <span>DOC Official Knowledge Base Verified · Extended Thinking Enabled</span>
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
