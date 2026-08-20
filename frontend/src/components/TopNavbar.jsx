import React from 'react';
import { Home, BookOpen, Plane, Settings, Search, Bell, Copy, Check, Languages } from 'lucide-react';

export default function TopNavbar({ 
  activeTab = 'home', 
  onTabChange, 
  onSearch, 
  onSearchSubmit,
  onOpenStatusModal,
  onExportMarkdown,
  copied = false,
  language = 'zh',
  onToggleLanguage,
  labels = {}
}) {
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.target.value.trim()) {
      if (onSearchSubmit) {
        onSearchSubmit(e.target.value.trim());
      }
    }
  };

  return (
    <header className="bento-top-navbar">
      {/* 左侧导航 Tabs */}
      <nav className="navbar-tabs-group">
        <button 
          className={`nav-tab-btn ${activeTab === 'home' ? 'active' : ''}`}
          onClick={() => onTabChange && onTabChange('home')}
        >
          <Home size={16} />
          <span>{labels.home || 'Home'}</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'itineraries' ? 'active' : ''}`}
          onClick={() => onTabChange && onTabChange('itineraries')}
        >
          <BookOpen size={16} />
          <span>{labels.itineraries || 'Itineraries'}</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => onTabChange && onTabChange('bookings')}
        >
          <Plane size={16} />
          <span>{labels.bookings || 'Bookings'}</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => {
            if (onTabChange) onTabChange('settings');
            if (onOpenStatusModal) onOpenStatusModal();
          }}
          title={language === 'zh' ? '查看系统状态与模型配置' : 'System Status & Settings'}
        >
          <Settings size={16} />
          <span>{labels.settings || 'Settings'}</span>
        </button>
      </nav>

      {/* 右侧搜索与动作控件 */}
      <div className="navbar-controls-group">
        {/* 中英文切换按钮 */}
        <button 
          className="navbar-lang-btn"
          onClick={onToggleLanguage}
          title={language === 'zh' ? 'Switch to English' : '切换为中文'}
        >
          <Languages size={15} color="#4F46E5" />
          <span className="lang-text">
            {language === 'zh' ? '中文' : 'EN'}
          </span>
        </button>

        {/* 搜索框 */}
        <div className="search-pill-wrapper">
          <Search size={15} color="#94A3B8" />
          <input 
            type="text" 
            className="navbar-search-input" 
            placeholder={labels.searchPlaceholder || "Search trips (Press Enter)..."} 
            onChange={(e) => onSearch && onSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* 导出 Markdown 快捷按钮 */}
        {onExportMarkdown && (
          <button 
            className="navbar-export-btn"
            onClick={onExportMarkdown}
            title={language === 'zh' ? '一键导出全部天数的完整 Markdown 行程方案' : 'Copy Full Markdown Itinerary'}
          >
            {copied ? <Check size={15} color="#10B981" /> : <Copy size={15} />}
            <span>{copied ? labels.copied || '已复制' : labels.exportPlan || '导出方案'}</span>
          </button>
        )}

        {/* 通知铃铛 (查看后端状态) */}
        <button 
          className="navbar-bell-btn" 
          onClick={onOpenStatusModal}
          aria-label="Notifications"
          title={language === 'zh' ? '系统运行状态诊断' : 'System Diagnostics'}
        >
          <Bell size={17} />
          <span className="bell-badge-dot"></span>
        </button>
      </div>
    </header>
  );
}

