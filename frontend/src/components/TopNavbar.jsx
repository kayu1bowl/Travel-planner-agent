import React from 'react';
import { Home, BookOpen, Plane, Search, Languages, Sparkles } from 'lucide-react';

export default function TopNavbar({ 
  activeTab = 'home', 
  onTabChange, 
  onSearch, 
  onSearchSubmit,
  language = 'zh',
  nextLangLabel,
  onToggleLanguage,
  onNewTrip,
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
          <span>{labels.home || (language === 'zh' ? '首页探索' : 'Home')}</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'itineraries' ? 'active' : ''}`}
          onClick={() => onTabChange && onTabChange('itineraries')}
        >
          <BookOpen size={16} />
          <span>{labels.itineraries || (language === 'zh' ? '行程规划' : 'Itineraries')}</span>
        </button>

        <button 
          className={`nav-tab-btn ${activeTab === 'bookings' ? 'active' : ''}`}
          onClick={() => onTabChange && onTabChange('bookings')}
        >
          <Plane size={16} />
          <span>{labels.bookings || (language === 'zh' ? '预订清单' : 'Bookings')}</span>
        </button>
      </nav>

      {/* 右侧搜索与语言控件 */}
      <div className="navbar-controls-group">
        {/* 搜索框 */}
        <div className="search-pill-wrapper">
          <Search size={15} color="#94A3B8" />
          <input 
            type="text" 
            className="navbar-search-input" 
            placeholder={labels.searchPlaceholder || (language === 'zh' ? "搜索行程与目的地 (回车确认)..." : "Search trips...")} 
            onChange={(e) => onSearch && onSearch(e.target.value)}
            onKeyDown={handleKeyDown}
          />
        </div>

        {/* 新建行程按钮 */}
        {onNewTrip && (
          <button
            type="button"
            className="navbar-new-trip-btn"
            onClick={onNewTrip}
            title={language === 'zh' ? '开启新的旅行规划' : 'Start a new trip plan'}
          >
            <Sparkles size={14} color="#4F46E5" />
            <span>{labels.newTrip || (language === 'zh' ? '新建行程' : 'New Trip')}</span>
          </button>
        )}

        {/* 中英文切换按钮 */}
        <button 
          type="button"
          className="navbar-lang-btn"
          onClick={onToggleLanguage}
          title={'切换语言 / Switch Language'}
        >
          <Languages size={15} color="#4F46E5" />
          <span className="lang-text">
            {nextLangLabel}
          </span>
        </button>
      </div>
    </header>
  );
}
