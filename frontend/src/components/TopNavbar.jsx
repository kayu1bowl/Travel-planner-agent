import React from 'react';
import { Home, BookOpen, Plane, Settings, Search, Bell, Copy, Check, Languages } from 'lucide-react';

export default function TopNavbar({ 
  activeTab = 'home', 
  onTabChange, 
  onSearch, 
  onExportMarkdown,
  copied = false,
  language = 'zh',
  onToggleLanguage,
  labels = {}
}) {
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
          onClick={() => onTabChange && onTabChange('settings')}
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
            placeholder={labels.searchPlaceholder || "Search trips..."} 
            onChange={(e) => onSearch && onSearch(e.target.value)}
          />
        </div>

        {/* 导出 Markdown 快捷按钮 */}
        {onExportMarkdown && (
          <button 
            className="navbar-export-btn"
            onClick={onExportMarkdown}
            title={language === 'zh' ? '一键复制 Markdown 行程方案' : 'Copy Markdown Itinerary'}
          >
            {copied ? <Check size={15} color="#10B981" /> : <Copy size={15} />}
            <span>{copied ? labels.copied || '已复制' : labels.exportPlan || '导出方案'}</span>
          </button>
        )}

        {/* 通知铃铛 */}
        <button className="navbar-bell-btn" aria-label="Notifications">
          <Bell size={17} />
          <span className="bell-badge-dot"></span>
        </button>
      </div>
    </header>
  );
}

