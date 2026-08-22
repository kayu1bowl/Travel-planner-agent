import React from 'react';
import { Calendar, ChevronRight, Compass, Sparkles } from 'lucide-react';

export default function TripBannerCard({ 
  title, 
  subtitle,
  motto,
  onClick,
  labels = {},
  language = 'zh'
}) {
  const displayTitle = title || (language === 'zh' ? "新西兰南岛 7 天绝美自驾与风光摄影之旅" : "New Zealand South Island 7-Day Explorer");
  const displaySubtitle = subtitle || (language === 'zh' ? "7 天行程 | 基督城 · 特卡波 · 库克山 · 瓦纳卡 · 皇后镇" : "7 Days | Christchurch · Lake Tekapo · Mt Cook · Wanaka · Queenstown");
  
  const displayMotto = motto || (
    (displayTitle?.includes('东京') || displayTitle?.includes('Tokyo') || displayTitle?.includes('Japan'))
      ? (language === 'zh' ? "穿行于江户古刹幽境，沉醉于涩谷赛博霓虹" : "From ancient serene Edo shrines to cyberpunk Shibuya neon lights")
      : (language === 'zh' ? "追逐雪山冰川晨光，枕着特卡波璀璨星河入梦" : "Chasing alpine glacier sunrise, sleeping under Tekapo starry sky")
  );

  return (
    <div className="trip-banner-card editorial-banner" onClick={onClick}>
      <div className="trip-banner-left">
        <div className="calendar-icon-box">
          <Compass size={22} color="#4F46E5" className="compass-spin" />
        </div>
        <div className="trip-title-meta">
          <div className="travel-eyebrow">
            <span className="eyebrow-dot"></span>
            <span>{labels.expeditionEyebrow || (language === 'zh' ? 'EXPEDITION · 专属定制路线档案' : 'EXPEDITION · CUSTOM ROUTE PROFILE')}</span>
          </div>
          <h2 className="trip-main-title">{displayTitle}</h2>
          <p className="trip-subtitle-text">{displaySubtitle}</p>
        </div>
      </div>

      <div className="trip-banner-right-editorial">
        <div className="handwritten-motto">
          <span className="quote-mark">“</span>
          <span>{displayMotto}</span>
          <span className="quote-mark">”</span>
        </div>
        <button className="trip-arrow-btn" aria-label="View trip details">
          <ChevronRight size={20} color="#64748B" />
        </button>
      </div>
    </div>
  );
}
