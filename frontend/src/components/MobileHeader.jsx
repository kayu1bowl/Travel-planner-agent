import React from 'react';
import { Sparkles, Languages } from 'lucide-react';

export default function MobileHeader({
  tripTitle,
  language = 'zh',
  nextLangLabel,
  onToggleLanguage
}) {
  return (
    <header className="mobile-top-header">
      {/* 左侧：App 品牌与 Logo */}
      <div className="mobile-brand-section">
        <div className="mobile-brand-icon">
          <Sparkles size={16} color="#FFFFFF" />
        </div>
        <div className="mobile-brand-text">
          <h1 className="mobile-app-name">Roam AI</h1>
          <span className="mobile-app-tag">{language === 'zh' ? '智能旅行向导' : 'Travel Copilot'}</span>
        </div>
      </div>

      {/* 右侧：操作区（语言切换） */}
      <div className="mobile-header-actions">
        {/* 语言切换 */}
        <button 
          className="mobile-action-pill" 
          onClick={onToggleLanguage}
          title={'切换语言 / Switch Language'}
        >
          <Languages size={13} />
          <span>{nextLangLabel}</span>
        </button>
      </div>
    </header>
  );
}
