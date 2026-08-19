import React from 'react';
import { MoreHorizontal, Star, MapPin, Utensils } from 'lucide-react';

export default function MustVisitCuisineCard({ items = [], labels = {}, language = 'zh' }) {
  return (
    <div className="bento-card must-visit-cuisine-card">
      {/* 头部 Header */}
      <div className="card-top-header">
        <h3 className="card-title">{labels.mustVisitTitle || "Must-Visit & Cuisine"}</h3>
        <button className="icon-more-btn" aria-label="Must visit options">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* 3 张卡片横向排版 */}
      <div className="cuisine-items-grid">
        {items.map((item, idx) => (
          <div key={idx} className="cuisine-item-box">
            <div className="item-thumbnail-wrapper">
              <img src={item.image} alt={item.name} className="item-thumb-img" />
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
