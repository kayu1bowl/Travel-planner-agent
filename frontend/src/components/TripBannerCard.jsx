import React from 'react';
import { Calendar, ChevronRight, Compass, Sparkles } from 'lucide-react';

export default function TripBannerCard({ 
  title = "新西兰南岛 7 天绝美自驾与风光摄影之旅", 
  subtitle = "7 天行程 | 基督城 · 特卡波 · 库克山 · 瓦纳卡 · 皇后镇",
  onClick 
}) {
  return (
    <div className="trip-banner-card editorial-banner" onClick={onClick}>
      <div className="trip-banner-left">
        <div className="calendar-icon-box">
          <Compass size={22} color="#4F46E5" className="compass-spin" />
        </div>
        <div className="trip-title-meta">
          <div className="travel-eyebrow">
            <span className="eyebrow-dot"></span>
            <span>EXPEDITION · 独家定制路线档案</span>
          </div>
          <h2 className="trip-main-title">{title}</h2>
          <p className="trip-subtitle-text">{subtitle}</p>
        </div>
      </div>

      <div className="trip-banner-right-editorial">
        <div className="handwritten-motto">
          <span className="quote-mark">“</span>
          <span>追逐雪山冰川晨光，枕着特卡波璀璨星河入梦</span>
          <span className="quote-mark">”</span>
        </div>
        <button className="trip-arrow-btn" aria-label="View trip details">
          <ChevronRight size={20} color="#64748B" />
        </button>
      </div>
    </div>
  );
}
