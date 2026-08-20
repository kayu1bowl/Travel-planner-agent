import React from 'react';
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Compass, 
  Sparkles, 
  ArrowLeft, 
  Navigation,
  Download,
  Share2
} from 'lucide-react';

export default function ItinerariesFullView({ 
  currentData, 
  labels = {}, 
  language = 'zh', 
  onBackHome,
  onExportMarkdown 
}) {
  const days = Object.keys(currentData.dailySchedules || {}).map(Number).sort((a, b) => a - b);
  const totalStops = days.reduce((acc, d) => acc + (currentData.dailySchedules[d]?.length || 0), 0);

  return (
    <div className="itineraries-full-view-container">
      {/* 顶部总览 Header Banner */}
      <div className="itineraries-header-card">
        <div className="itineraries-header-left">
          <div className="itineraries-badge">
            <Compass size={14} className="badge-icon-spin" />
            <span>{language === 'zh' ? '全景行程与路线节点' : 'Full Multi-Day Route Flow'}</span>
          </div>
          <h2 className="itineraries-main-title">{currentData.tripTitle}</h2>
          <p className="itineraries-subtitle-text">{currentData.tripSubtitle}</p>
        </div>

        <div className="itineraries-header-actions">
          <div className="itineraries-stats-pill">
            <span className="stats-number">{days.length}</span>
            <span className="stats-unit">{language === 'zh' ? '天全景' : 'Days'}</span>
            <span className="stats-divider">/</span>
            <span className="stats-number">{totalStops}</span>
            <span className="stats-unit">{language === 'zh' ? '个节点' : 'Stops'}</span>
          </div>
        </div>
      </div>

      {/* 多日行程瀑布流列表 */}
      <div className="itineraries-days-waterfall">
        {days.map((dayNum) => {
          const rows = currentData.dailySchedules[dayNum] || [];
          return (
            <div key={dayNum} className="itinerary-day-card">
              {/* Day 标题栏 */}
              <div className="day-card-header">
                <div className="day-card-badge">
                  <Calendar size={14} />
                  <span>{language === 'zh' ? `第 ${dayNum} 天` : `Day ${dayNum}`}</span>
                </div>
                <div className="day-card-meta">
                  <span className="day-stops-count">
                    {rows.length} {language === 'zh' ? '个精选节点' : 'Stops'}
                  </span>
                </div>
              </div>

              {/* 现代网格排版结构 */}
              <div className="timeline-table-container">
                <div className="timeline-table-header">
                  <div className="th-col th-time">{labels.tableCols?.time || (language === 'zh' ? '时刻' : 'Time')}</div>
                  <div className="th-col th-activity">{labels.tableCols?.activity || (language === 'zh' ? '行程活动' : 'Activity')}</div>
                  <div className="th-col th-location">{labels.tableCols?.location || (language === 'zh' ? '地点 / 区域' : 'Location')}</div>
                  <div className="th-col th-details">{labels.tableCols?.details || (language === 'zh' ? '细节与体验' : 'Experience Details')}</div>
                </div>

                <div className="timeline-rows-list">
                  {rows.map((item, idx) => (
                    <div key={idx} className="timeline-row-item">
                      {/* 1. 时刻胶囊 */}
                      <div className="td-col td-time">
                        <div className="time-pill">
                          <Clock size={11} className="time-clock-icon" />
                          <span className="time-val">{item.time}</span>
                        </div>
                      </div>

                      {/* 2. 行程活动 */}
                      <div className="td-col td-activity">
                        <span className="activity-title-text">{item.activity}</span>
                      </div>

                      {/* 3. 地点徽章 */}
                      <div className="td-col td-location">
                        <div className="location-chip">
                          <MapPin size={12} className="location-chip-pin" />
                          <span className="location-chip-name">{item.location}</span>
                        </div>
                      </div>

                      {/* 4. 细节与体验 */}
                      <div className="td-col td-details">
                        <p className="details-paragraph">{item.details}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
