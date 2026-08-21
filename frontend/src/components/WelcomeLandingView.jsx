import React, { useState, useRef } from 'react';
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
  Sun,
  Moon,
  Clock,
  MapPin,
  Flame,
  Award
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
  const inputRef = useRef(null);

  const t = TRANSLATIONS[language]?.welcome || TRANSLATIONS.zh.welcome;

  // 摄影机位图源与取景预设
  const photoSpotsData = [
    {
      image: "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=1200&auto=format&fit=crop&q=80",
      alt: "Good Shepherd Church Lake Tekapo",
      overlayTag: "ASTRO VIEWPORT 01",
      iso: "ISO 3200",
      shutter: "20s",
      aperture: "f/2.8",
      focal: "14mm"
    },
    {
      image: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&auto=format&fit=crop&q=80",
      alt: "Roys Peak Lake Wanaka",
      overlayTag: "GOLDEN HOUR 02",
      iso: "ISO 100",
      shutter: "1/200s",
      aperture: "f/8.0",
      focal: "35mm"
    },
    {
      image: "https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=1200&auto=format&fit=crop&q=80",
      alt: "Milford Sound Mitre Peak",
      overlayTag: "BLUE HOUR 03",
      iso: "ISO 100",
      shutter: "30s",
      aperture: "f/11",
      focal: "16mm"
    }
  ];

  // 灵感卡片专属超清背景
  const inspirationImages = [
    "https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1503899036084-c55cdd92da26?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1530122037265-a5f1f91d3b99?w=800&auto=format&fit=crop&q=80",
    "https://images.unsplash.com/photo-1542051841857-5f90071e7989?w=800&auto=format&fit=crop&q=80"
  ];

  // 点击偏好标签时追加到输入框或切换高亮
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

  // 点击灵感示例胶囊
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

  // 锚点平滑滚动
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="flagship-welcome-root">
      {/* 顶部高透钛金磨砂导航栏 */}
      <header className="flagship-header">
        <div className="flagship-nav-inner">
          <div className="flagship-logo-group" onClick={() => scrollToSection('hero-section')}>
            <div className="flagship-logo-icon">
              <Compass size={20} color="#10B981" strokeWidth={2.4} />
            </div>
            <div className="flagship-brand">
              <span className="flagship-brand-name">Roam AI</span>
              <span className="flagship-agent-pill">OpenClaw Agent</span>
            </div>
          </div>

          {/* 页面锚点快速导览 */}
          <nav className="flagship-nav-links">
            <button onClick={() => scrollToSection('hero-section')} className="nav-anchor-link">
              {t.nav.planner}
            </button>
            <button onClick={() => scrollToSection('spatial-section')} className="nav-anchor-link">
              {t.nav.spatial}
            </button>
            <button onClick={() => scrollToSection('vision-section')} className="nav-anchor-link">
              {t.nav.vision}
            </button>
            <button onClick={() => scrollToSection('knowledge-section')} className="nav-anchor-link">
              {t.nav.knowledge}
            </button>
          </nav>

          <div className="flagship-header-actions">
            {/* 语言切换 */}
            <button 
              className="flagship-lang-btn"
              onClick={onToggleLanguage}
              title={language === 'zh' ? 'Switch to English' : '切换为中文'}
            >
              <Globe size={14} color="#94A3B8" />
              <span>{language === 'zh' ? 'EN' : '中文'}</span>
            </button>

            {/* 进入看板 */}
            <button 
              className="flagship-enter-btn"
              onClick={onDirectExplore}
            >
              <span>{t.nav.enterDashboard}</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          SECTION 1: 沉浸式临场感主屏 (Cinematic Ambient Hero)
          ========================================================================= */}
      <section id="hero-section" className="flagship-hero-section">
        {/* 动态氛围光影与网格背景 */}
        <div className="hero-ambient-glow glow-top"></div>
        <div className="hero-ambient-glow glow-right"></div>
        <div className="hero-grid-pattern"></div>

        <div className="hero-content-wrapper">
          {/* AI 旗舰徽标 */}
          <div className="hero-badge-pill">
            <Sparkles size={14} color="#10B981" className="animate-pulse" />
            <span>{t.badge}</span>
          </div>

          {/* 工业美学大标题与副标题 */}
          <h1 className="hero-master-title">
            {t.heroTitle}
          </h1>
          <p className="hero-master-subtitle">
            {t.heroSubtitle}
          </p>

          {/* 核心智能指令舱 (Floating Command Capsule) */}
          <div className="hero-command-capsule">
            <form onSubmit={handleSubmit} className="capsule-form">
              <div className="capsule-textarea-box">
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
              <div className="capsule-preferences-bar">
                <span className="capsule-pref-label">{t.preferencesTitle}:</span>
                <div className="capsule-pref-chips">
                  {t.preferences.map((tagObj, idx) => {
                    const active = selectedTags.includes(tagObj.tag);
                    return (
                      <button
                        key={idx}
                        type="button"
                        className={`capsule-chip ${active ? 'active' : ''}`}
                        onClick={() => handleToggleTag(tagObj)}
                        disabled={isGenerating}
                      >
                        {tagObj.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* 指令舱底栏 */}
              <div className="capsule-footer-bar">
                <div className="capsule-hint">
                  {language === 'zh' ? '💡 支持自由输入全球任意国家、天数、同行偏好与自驾预算' : '💡 Feel free to input any global destination, days, style or budget'}
                </div>

                <button
                  type="submit"
                  className={`capsule-submit-cta ${isGenerating ? 'generating' : ''}`}
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

          {/* 实时遥测数据引力带 (Telemetry Ticker) */}
          <div className="hero-telemetry-row">
            {t.telemetry.map((item, idx) => (
              <div key={idx} className="telemetry-item">
                <div className="telemetry-dot"></div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: 4D 时空路线推演引擎 (Spatial-Temporal Autonomous Routing)
          ========================================================================= */}
      <section id="spatial-section" className="flagship-feature-section spatial-bg">
        <div className="section-header-block">
          <div className="section-category-tag">
            <Navigation size={13} color="#10B981" />
            <span>{t.spatialEngine.badge}</span>
          </div>
          <h2 className="section-headline">{t.spatialEngine.title}</h2>
          <p className="section-subheadline">{t.spatialEngine.subtitle}</p>
        </div>

        <div className="spatial-dashboard-card">
          {/* 左侧：4D 路线推演动态可视化 */}
          <div className="spatial-visual-col">
            <div className="spatial-map-visual">
              {/* 高画质拟真自驾公路背景 */}
              <img 
                src="https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=1200&auto=format&fit=crop&q=80" 
                alt="Highway scenic drive" 
                className="spatial-route-img"
              />
              <div className="spatial-route-overlay">
                <div className="spatial-telemetry-hud">
                  <div className="hud-badge">
                    <Activity size={12} color="#10B981" />
                    <span>REAL-TIME PACING SIMULATOR</span>
                  </div>
                  <div className="hud-route-name">{t.spatialEngine.cardTitle}</div>
                  <div className="hud-route-path">{t.spatialEngine.cardDesc}</div>
                </div>

                {/* 动态路线航点进度条 */}
                <div className="spatial-timeline-scrubber">
                  <div className="scrubber-waypoint active">
                    <span className="wp-dot"></span>
                    <span className="wp-label">基督城 (起)</span>
                  </div>
                  <div className="scrubber-line"></div>
                  <div className="scrubber-waypoint active">
                    <span className="wp-dot"></span>
                    <span className="wp-label">特卡波湖 (暗夜)</span>
                  </div>
                  <div className="scrubber-line"></div>
                  <div className="scrubber-waypoint active">
                    <span className="wp-dot"></span>
                    <span className="wp-label">库克山 (冰川)</span>
                  </div>
                  <div className="scrubber-line"></div>
                  <div className="scrubber-waypoint">
                    <span className="wp-dot"></span>
                    <span className="wp-label">皇后镇 (终)</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 右侧：关键参数指标 */}
          <div className="spatial-metrics-col">
            {t.spatialEngine.metrics.map((m, idx) => (
              <div key={idx} className="spatial-metric-box">
                <div className="metric-value-row">
                  <span className="metric-number">{m.value}</span>
                  <span className="metric-label">{m.label}</span>
                </div>
                <div className="metric-desc">{m.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: 大师级星空与风光影像系统 (Pro Optics & Viewfinder HUD)
          ========================================================================= */}
      <section id="vision-section" className="flagship-feature-section vision-bg">
        <div className="section-header-block">
          <div className="section-category-tag">
            <Camera size={13} color="#3B82F6" />
            <span>{t.proVision.badge}</span>
          </div>
          <h2 className="section-headline">{t.proVision.title}</h2>
          <p className="section-subheadline">{t.proVision.subtitle}</p>
        </div>

        <div className="vision-viewfinder-matrix">
          {/* 取景器交互式机位切换器 */}
          <div className="vision-tabs-bar">
            {t.proVision.spots.map((spot, idx) => (
              <button
                key={idx}
                className={`vision-spot-tab ${activePhotoSpotIndex === idx ? 'active' : ''}`}
                onClick={() => setActivePhotoSpotIndex(idx)}
              >
                <span className="tab-idx">0{idx + 1}</span>
                <span className="tab-name">{spot.name}</span>
              </button>
            ))}
          </div>

          {/* 大疆级相机 HUD 取景器主视窗 */}
          <div className="viewfinder-main-frame">
            <img 
              src={photoSpotsData[activePhotoSpotIndex]?.image} 
              alt={photoSpotsData[activePhotoSpotIndex]?.alt}
              className="viewfinder-photo" 
            />

            {/* HUD 界面准星与构图线 */}
            <div className="hud-overlay-grid">
              <div className="hud-crosshair-center"></div>
              <div className="hud-third-line h-line1"></div>
              <div className="hud-third-line h-line2"></div>
              <div className="hud-third-line v-line1"></div>
              <div className="hud-third-line v-line2"></div>

              {/* HUD 顶部曝光参数 */}
              <div className="hud-top-dials">
                <div className="hud-lens-tag">
                  <Camera size={12} color="#FFFFFF" />
                  <span>{photoSpotsData[activePhotoSpotIndex]?.overlayTag}</span>
                </div>
                <div className="hud-params-strip">
                  <span className="hud-param">{photoSpotsData[activePhotoSpotIndex]?.focal}</span>
                  <span className="hud-divider">|</span>
                  <span className="hud-param">{photoSpotsData[activePhotoSpotIndex]?.aperture}</span>
                  <span className="hud-divider">|</span>
                  <span className="hud-param">{photoSpotsData[activePhotoSpotIndex]?.shutter}</span>
                  <span className="hud-divider">|</span>
                  <span className="hud-param highlight">{photoSpotsData[activePhotoSpotIndex]?.iso}</span>
                </div>
              </div>

              {/* HUD 底部专家贴士与窗口 */}
              <div className="hud-bottom-info">
                <div className="hud-window-tag">
                  <Clock size={12} color="#F59E0B" />
                  <span>{t.proVision.spots[activePhotoSpotIndex]?.window}</span>
                </div>
                <div className="hud-tip-text">
                  {t.proVision.spots[activePhotoSpotIndex]?.tip}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: OpenClaw 全球知识底盘架构 (Hyper-Intellect Architecture)
          ========================================================================= */}
      <section id="knowledge-section" className="flagship-feature-section architecture-bg">
        <div className="section-header-block">
          <div className="section-category-tag">
            <Layers size={13} color="#10B981" />
            <span>{t.knowledgeMesh.badge}</span>
          </div>
          <h2 className="section-headline">{t.knowledgeMesh.title}</h2>
          <p className="section-subheadline">{t.knowledgeMesh.subtitle}</p>
        </div>

        <div className="knowledge-stack-layout">
          {t.knowledgeMesh.layers.map((layer, idx) => (
            <div key={idx} className="knowledge-layer-card">
              <div className="layer-num-badge">{layer.num}</div>
              <div className="layer-body">
                <h3 className="layer-title">{layer.name}</h3>
                <p className="layer-desc">{layer.desc}</p>
              </div>
              <div className="layer-status-pill">
                <CheckCircle2 size={14} color="#10B981" />
                <span>ONLINE</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: 灵感全景画廊 (Inspiration Matrix)
          ========================================================================= */}
      <section className="flagship-feature-section inspirations-bg">
        <div className="section-header-block">
          <div className="section-category-tag">
            <Sparkles size={13} color="#F59E0B" />
            <span>{t.inspirations.badge}</span>
          </div>
          <h2 className="section-headline">{t.inspirations.title}</h2>
          <p className="section-subheadline">{t.inspirations.subtitle}</p>
        </div>

        <div className="inspirations-matrix-grid">
          {t.inspirations.items.map((item, idx) => (
            <div 
              key={idx} 
              className="inspiration-master-card"
              onClick={() => handleSelectInspiration(item)}
            >
              <img 
                src={inspirationImages[idx % inspirationImages.length]} 
                alt={item.title} 
                className="insp-bg-img"
              />
              <div className="insp-card-gradient"></div>
              <div className="insp-card-content">
                <span className="insp-tag-badge">{item.tag}</span>
                <h3 className="insp-title">{item.title}</h3>
                <p className="insp-query-preview">{item.query}</p>
                <div className="insp-action-btn">
                  <span>{language === 'zh' ? '导入并智能规划' : 'Load & Plan'}</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: 底部旗舰号召行动栏 (Grand Action Footer)
          ========================================================================= */}
      <footer className="flagship-grand-footer">
        <div className="footer-callout-box">
          <h2 className="footer-title">{t.bottomCta.title}</h2>
          <p className="footer-subtitle">{t.bottomCta.subtitle}</p>
          
          <div className="footer-actions-row">
            <button 
              className="footer-start-cta"
              onClick={() => {
                if (inputRef.current) {
                  inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  inputRef.current.focus();
                }
              }}
            >
              <Sparkles size={16} color="#FFFFFF" />
              <span>{t.bottomCta.startBtn}</span>
            </button>

            <button 
              className="footer-demo-link"
              onClick={onDirectExplore}
            >
              <span>{t.bottomCta.demoBtn}</span>
            </button>
          </div>
        </div>

        <div className="footer-bottom-bar">
          <span>© 2026 Roam AI Travel Planner · OpenClaw Agent Intelligence</span>
          <span>DOC Official Knowledge Base Verified · Extended Thinking Enabled</span>
        </div>
      </footer>

      {/* 生成中动态推理弹窗 / 进度遮罩 */}
      {isGenerating && (
        <div className="welcome-generating-overlay">
          <div className="welcome-generating-modal">
            <div className="generating-header">
              <div className="generating-icon-pulse">
                <Sparkles size={28} color="#10B981" className="animate-spin" />
              </div>
              <h3 className="generating-title">
                {language === 'zh' ? 'AI 正在智能规划您的专属行程' : 'AI is Crafting Your Travel Plan'}
              </h3>
              <p className="generating-subtitle">
                {language === 'zh' ? 'OpenClaw Agent 拓展思考多维推理中...' : 'OpenClaw Agent Reasoning with Extended Thinking...'}
              </p>
            </div>

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
