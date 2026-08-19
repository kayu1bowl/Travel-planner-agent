import React from 'react';
import { Calendar, ChevronRight, Sparkles } from 'lucide-react';

export default function TripBannerCard({ 
  title = "New Zealand South Island Explorer", 
  subtitle = "7 Days | Oct 15-21, 2026",
  onClick 
}) {
  return (
    <div className="trip-banner-card" onClick={onClick}>
      <div className="trip-banner-left">
        <div className="calendar-icon-box">
          <Calendar size={20} color="#4F46E5" />
        </div>
        <div className="trip-title-meta">
          <h2 className="trip-main-title">{title}</h2>
          <p className="trip-subtitle-text">{subtitle}</p>
        </div>
      </div>

      <button className="trip-arrow-btn" aria-label="View trip details">
        <ChevronRight size={20} color="#64748B" />
      </button>
    </div>
  );
}
