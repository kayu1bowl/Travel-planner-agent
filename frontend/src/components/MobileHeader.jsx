import React from 'react';
import { 
  Sparkles, 
  Languages, 
  Activity, 
  Download, 
  Search,
  Compass
} from 'lucide-react';

export default function MobileHeader({
  tripTitle,
  language = 'zh',
  onToggleLanguage,
  onOpenStatusModal,
  onExportMarkdown
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

      {/* 右侧：操作区（语言切换 + 状态诊断 + 导出） */}
      <div className="mobile-header-actions">
        {/* 语言切换 */}
        <button 
          className="mobile-action-pill" 
          onClick={onToggleLanguage}
          title={language === 'zh' ? 'Switch to English' : '切换至中文'}
        >
          <Languages size={13} />
          <span>{language === 'zh' ? 'EN' : '中文'}</span>
        </button>

        {/* 系统状态 */}
        <button 
          className="mobile-icon-btn" 
          onClick={onOpenStatusModal}
          title={language === 'zh' ? '系统状态与模型诊断' : 'System Diagnostics'}
        >
          <Activity size={15} color="#10B981" />
          <span className="mobile-status-dot" />
        </button>

        {/* 导出 Markdown */}
        <button 
          className="mobile-icon-btn" 
          onClick={onExportMarkdown}
          title={language === 'zh' ? '导出行程 Markdown' : 'Export Markdown'}
        >
          <Download size={15} color="#4F46E5" />
        </button>
      </div>
    </header>
  );
}
