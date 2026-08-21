import React, { useState } from 'react';
import { 
  Sparkles, 
  Compass, 
  Send, 
  MapPin, 
  Globe, 
  ArrowRight, 
  ShieldCheck, 
  Camera, 
  Layers, 
  CheckCircle2, 
  Loader2 
} from 'lucide-react';
import { TRANSLATIONS } from '../services/i18n';

export default function WelcomeLandingView({
  language,
  onToggleLanguage,
  onStartPlanning,
  onDirectExplore,
  isGenerating,
  generatingSteps,
  currentDestination,
  onSelectDestination
}) {
  const [inputText, setInputText] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const t = TRANSLATIONS[language]?.welcome || TRANSLATIONS.zh.welcome;

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

    // 如果输入框内还没有该标签关键词，自动智能追加
    if (!isSelected && !inputText.includes(tagObj.tag)) {
      const separator = inputText.trim().length > 0 ? '，' : '';
      setInputText(prev => `${prev.trim()}${separator}希望包含${tagObj.tag}`);
    }
  };

  // 点击灵感示例胶囊
  const handleSelectInspiration = (insp) => {
    setInputText(insp.query);
  };

  // 提交规划需求
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (!inputText.trim() || isGenerating) return;
    onStartPlanning(inputText.trim());
  };

  return (
    <div className="welcome-landing-wrapper">
      {/* 顶部极简导航 */}
      <header className="welcome-header">
        <div className="welcome-logo-group">
          <div className="welcome-logo-icon">
            <Compass size={22} className="logo-spin-subtle text-emerald-400" />
          </div>
          <div className="welcome-brand">
            <span className="welcome-brand-name">Roam AI</span>
            <span className="welcome-brand-badge">Travel Agent</span>
          </div>
        </div>

        <div className="welcome-header-actions">
          {/* 快捷目的地选择 */}
          <div className="welcome-dest-pills">
            <button 
              className={`welcome-dest-btn ${currentDestination === 'newzealand' ? 'active' : ''}`}
              onClick={() => onSelectDestination('newzealand')}
            >
              🇳🇿 {language === 'zh' ? '新西兰南岛' : 'New Zealand'}
            </button>
            <button 
              className={`welcome-dest-btn ${currentDestination === 'tokyo' ? 'active' : ''}`}
              onClick={() => onSelectDestination('tokyo')}
            >
              🗼 {language === 'zh' ? '日本东京' : 'Tokyo'}
            </button>
          </div>

          {/* 语言切换 */}
          <button 
            className="welcome-lang-btn"
            onClick={onToggleLanguage}
            title={language === 'zh' ? 'Switch to English' : '切换为中文'}
          >
            <Globe size={16} />
            <span>{language === 'zh' ? 'EN' : '中文'}</span>
          </button>

          {/* 直接进入看板 */}
          <button 
            className="welcome-explore-top-btn"
            onClick={onDirectExplore}
          >
            <span>{language === 'zh' ? '浏览精选看板' : 'Explore Dashboard'}</span>
            <ArrowRight size={15} />
          </button>
        </div>
      </header>

      {/* 主体 Hero 内容区 */}
      <main className="welcome-main-container">
        {/* AI 模型标识微标 */}
        <div className="welcome-ai-badge">
          <Sparkles size={14} className="text-teal-300 animate-pulse" />
          <span>{t.badge}</span>
        </div>

        {/* 主大标题与副标题 */}
        <h1 className="welcome-hero-title">
          {t.heroTitle}
        </h1>
        <p className="welcome-hero-subtitle">
          {t.heroSubtitle}
        </p>

        {/* 核心 AI 对话规划卡片 */}
        <div className="welcome-input-card">
          <form onSubmit={handleSubmit} className="welcome-form">
            <div className="welcome-textarea-container">
              <textarea
                className="welcome-textarea"
                rows={3}
                placeholder={t.inputPlaceholder}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    handleSubmit(e);
                  }
                }}
                disabled={isGenerating}
              />
            </div>

            {/* 偏好标签栏 */}
            <div className="welcome-tags-bar">
              <span className="welcome-tags-label">{t.preferencesTitle}:</span>
              <div className="welcome-tags-list">
                {t.preferences.map((tagObj, idx) => {
                  const active = selectedTags.includes(tagObj.tag);
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`welcome-preference-chip ${active ? 'active' : ''}`}
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
            <div className="welcome-card-footer">
              <div className="welcome-hint-text">
                {language === 'zh' ? '💡 支持自由输入天数、随行人群、摄影喜好或自驾预算' : '💡 Feel free to include days, budget, companion or photography style'}
              </div>

              <button
                type="submit"
                className={`welcome-submit-btn ${isGenerating ? 'generating' : ''}`}
                disabled={!inputText.trim() || isGenerating}
              >
                {isGenerating ? (
                  <>
                    <Loader2 size={18} className="animate-spin text-white" />
                    <span>{t.generatingBtn}</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={18} className="text-white" />
                    <span>{t.generateBtn}</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* 灵感探索快速选择 */}
        <div className="welcome-inspirations-section">
          <div className="welcome-section-header">
            <span>{t.inspirationTitle}</span>
          </div>
          <div className="welcome-inspirations-grid">
            {t.inspirations.map((insp, idx) => (
              <div 
                key={idx} 
                className="welcome-inspiration-card"
                onClick={() => handleSelectInspiration(insp)}
                role="button"
                tabIndex={0}
              >
                <div className="welcome-insp-title">{insp.title}</div>
                <div className="welcome-insp-preview">{insp.query.slice(0, 48)}...</div>
              </div>
            ))}
          </div>
        </div>

        {/* 权威与信任背书 */}
        <div className="welcome-trust-row">
          {t.trustItems.map((item, idx) => (
            <div key={idx} className="welcome-trust-card">
              <div className="welcome-trust-title">{item.title}</div>
              <div className="welcome-trust-desc">{item.desc}</div>
            </div>
          ))}
        </div>

        {/* 底部一键进入预置标杆看板 */}
        <div className="welcome-bottom-direct">
          <button 
            type="button"
            className="welcome-direct-link-btn"
            onClick={onDirectExplore}
          >
            {t.exploreDemoBtn}
          </button>
        </div>
      </main>

      {/* 生成中动态推理弹窗 / 进度遮罩 */}
      {isGenerating && (
        <div className="welcome-generating-overlay">
          <div className="welcome-generating-modal">
            <div className="generating-header">
              <div className="generating-icon-pulse">
                <Sparkles size={28} className="text-teal-400 animate-spin" />
              </div>
              <h3 className="generating-title">
                {language === 'zh' ? 'AI 正在智能规划您的专属行程' : 'AI is Crafting Your Travel Plan'}
              </h3>
              <p className="generating-subtitle">
                {language === 'zh' ? 'Google Gemini 3.7 Flash 拓展思考推理中...' : 'Powered by Gemini 3.7 Flash with Extended Thinking'}
              </p>
            </div>

            <div className="generating-steps-list">
              {(generatingSteps && generatingSteps.length > 0 ? generatingSteps : [
                language === 'zh' ? '正在检索官方风景名胜与私有知识库...' : 'Retrieving official travel & trail guides...',
                language === 'zh' ? '正在智能规划行车路线与时间分配...' : 'Optimizing driving routes & daily schedule...',
                language === 'zh' ? '正在精选最佳出片机位与地道特色风物...' : 'Selecting photo spots & local cuisine...'
              ]).map((stepText, sIdx) => (
                <div key={sIdx} className="generating-step-item">
                  <CheckCircle2 size={16} className="text-emerald-400 flex-shrink-0 animate-pulse" />
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
