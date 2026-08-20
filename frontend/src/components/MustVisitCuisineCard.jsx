import React, { useState } from 'react';
import { MoreHorizontal, Star, MapPin, Utensils, Filter } from 'lucide-react';

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
        <h3 className="card-title">{labels.mustVisitTitle || "Must-Visit & Cuisine"}</h3>
        
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
            <div className="item-thumbnail-wrapper">
              <img src={item.image} alt={item.name} className="item-thumb-img" />
              {item.category && (
                <span className="item-category-tag">{item.category}</span>
              )}
            </div>

            <h4 className="item-name-title">{item.name}</h4>
            
            <p className="item-recommendation-text">
              <span className="rec-label">{labels.recommendationsLabel || "Recommendations: "}</span>
              {item.recommendations}
            </p>

            <div className="item-tips-row">
              <span className="tips-label">{labels.tipsLabel || "Tips"}</span>
              <span className="tips-emojis">{item.tipsEmoji || "🍣🥢"}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
