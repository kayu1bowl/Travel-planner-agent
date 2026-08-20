import React, { useState } from 'react';
import { Camera, Globe, Sparkles } from 'lucide-react';
import { resolveMultiLevelImage } from '../services/imageResolver';

function CuisineImageWithFallback({ item }) {
  const meta = resolveMultiLevelImage(item);
  const [currentSrc, setCurrentSrc] = useState(meta.primaryUrl);
  const [currentSource, setCurrentSource] = useState(meta.primarySource);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  const handleError = () => {
    if (fallbackIndex < meta.fallbacks.length) {
      const nextFallback = meta.fallbacks[fallbackIndex];
      setCurrentSrc(nextFallback.url);
      setCurrentSource(nextFallback.source);
      setFallbackIndex(prev => prev + 1);
    }
  };

  const getSourceIcon = (src) => {
    if (src?.includes('Wikimedia')) return <Globe size={9} />;
    if (src?.includes('AI')) return <Sparkles size={9} />;
    return <Camera size={9} />;
  };

  return (
    <div className="item-thumbnail-wrapper">
      <img 
        src={currentSrc} 
        alt={item.name} 
        className="item-thumb-img" 
        onError={handleError}
        loading="lazy"
      />
      {item.category && (
        <span className="item-category-tag">{item.category}</span>
      )}
      {/* 来源标注角标 */}
      <span className="image-source-badge" title={`图片数据源: ${currentSource}`}>
        {getSourceIcon(currentSource)}
        <span>{currentSource}</span>
      </span>
    </div>
  );
}

export default function MustVisitCuisineCard({ items = [], labels = {}, language = 'zh' }) {
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredItems = items.filter(item => {
    if (filterCategory === 'all') return true;
    if (filterCategory === 'food') {
      return item.category?.includes('美食') || item.category?.includes('小吃') || item.category?.toLowerCase().includes('food') || item.category?.toLowerCase().includes('cuisine');
    }
    if (filterCategory === 'landmark') {
      return !item.category?.includes('美食') && !item.category?.includes('小吃') && !item.category?.toLowerCase().includes('food');
    }
    return true;
  });

  const displayItems = filteredItems.length > 0 ? filteredItems : items;

  return (
    <div className="bento-card must-visit-cuisine-card">
      {/* 头部 Header */}
      <div className="card-top-header">
        <div className="card-title-group">
          <div className="travel-eyebrow">
            <span className="eyebrow-dot"></span>
            <span>TASTE & SIGHTS · 风物指南</span>
          </div>
          <h3 className="card-title">{labels.mustVisitTitle || "必去地标与风味美食"}</h3>
        </div>
        
        {/* 分类切换药丸 */}
        <div className="cuisine-filter-pills">
          <button 
            className={`filter-pill-btn ${filterCategory === 'all' ? 'active' : ''}`}
            onClick={() => setFilterCategory('all')}
          >
            {language === 'zh' ? '全部' : 'All'}
          </button>
          <button 
            className={`filter-pill-btn ${filterCategory === 'food' ? 'active' : ''}`}
            onClick={() => setFilterCategory('food')}
          >
            {language === 'zh' ? '🍲 美食' : 'Food'}
          </button>
          <button 
            className={`filter-pill-btn ${filterCategory === 'landmark' ? 'active' : ''}`}
            onClick={() => setFilterCategory('landmark')}
          >
            {language === 'zh' ? '🏛️ 地标' : 'Landmark'}
          </button>
        </div>
      </div>

      {/* 3 张卡片横向排版 */}
      <div className="cuisine-items-grid">
        {displayItems.map((item, idx) => (
          <div key={idx} className="cuisine-item-box">
            <CuisineImageWithFallback item={item} />

            <h4 className="item-name-title">{item.name}</h4>
            
            <p className="item-recommendation-text">
              <span className="rec-label">{labels.recommendationsLabel || (language === 'zh' ? '推荐理由: ' : 'Why Visit: ')}</span>
              {item.recommendations}
            </p>

            <div className="item-tips-row">
              <span className="tips-label">{labels.tipsLabel || (language === 'zh' ? '贴士' : 'Tips')}</span>
              <span className="tips-emojis">{item.tipsEmoji || "🍣🥢"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
