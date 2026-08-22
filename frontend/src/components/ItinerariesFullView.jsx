import React, { useState } from 'react';
import { 
  Compass, 
  MapPin, 
  ChevronRight, 
  Calendar, 
  Clock, 
  Info,
  Sparkles
} from 'lucide-react';
import ActivityDetailModal from './ActivityDetailModal';

export default function ItinerariesFullView({ 
  currentData = {}, 
  labels = {}, 
  language = 'zh'
}) {
  const safeData = currentData || {};
  const schedules = safeData.dailySchedules || {};
  const days = Object.keys(schedules).map(Number).sort((a, b) => a - b);
  const totalStops = days.reduce((acc, d) => acc + (schedules[d]?.length || 0), 0);
  const [selectedActivity, setSelectedActivity] = useState(null);

  return (
    <div className="itineraries-full-view-container">
      {/* 顶部总览 Header Banner */}
      <div className="itineraries-header-card">
        <div className="itineraries-header-left">
          <div className="itineraries-badge">
            <Compass size={14} className="badge-icon-spin" />
            <span>{language === 'zh' ? '全景行程与路线节点' : 'Full Multi-Day Route Flow'}</span>
          </div>
          <h2 className="itineraries-main-title">{safeData.tripTitle || (language === 'zh' ? '定制全景旅行规划' : 'Custom Travel Plan')}</h2>
          <p className="itineraries-subtitle-text">{safeData.tripSubtitle || ''}</p>
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
        {days.length > 0 ? (
          days.map((dayNum) => {
            const rows = schedules[dayNum] || [];
            return (
              <div key={dayNum} className="itinerary-day-card">
                {/* Day 标题栏 */}
                <div className="day-card-header">
                  <div className="day-title-box">
                    <span className="day-badge-primary">
                      {language === 'zh' ? `第 ${dayNum} 天` : `Day ${dayNum}`}
                    </span>
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
                      <div 
                        key={idx} 
                        className="timeline-row-item clickable-timeline-row"
                        onClick={() => setSelectedActivity({ ...item, day: dayNum })}
                        title={language === 'zh' ? '点击查看该节点与地点详情' : 'Click to view stop details'}
                      >
                        {/* 1. 时刻胶囊 */}
                        <div className="td-col td-time">
                          <div className="time-pill">
                            <span className="time-dot">●</span>
                            <span className="time-val">{item.time || '--:--'}</span>
                          </div>
                        </div>

                        {/* 2. 行程活动 */}
                        <div className="td-col td-activity">
                          <span className="activity-title-text">{item.activity || (language === 'zh' ? '自由行程' : 'Free schedule')}</span>
                        </div>

                        {/* 3. 地点徽章 */}
                        <div className="td-col td-location">
                          <div className="location-chip">
                            <MapPin size={12} className="location-chip-pin" />
                            <span className="location-chip-name">{item.location || (language === 'zh' ? '目的地' : 'Destination')}</span>
                          </div>
                        </div>

                        {/* 4. 细节与体验 */}
                        <div className="td-col td-details">
                          <div className="details-cell-inner">
                            <p className="details-paragraph">{item.details || (language === 'zh' ? '体验当地风土人情与景观' : 'Local experience & sightseeing')}</p>
                            <ChevronRight size={13} className="details-row-arrow" />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="empty-guides-placeholder" style={{ padding: '40px', textAlign: 'center', color: '#94A3B8' }}>
            <p>{language === 'zh' ? '暂无全景行程明细数据' : 'No itinerary details found'}</p>
          </div>
        )}
      </div>

      {/* 行程节点详情弹窗 */}
      <ActivityDetailModal 
        item={selectedActivity}
        isOpen={Boolean(selectedActivity)}
        onClose={() => setSelectedActivity(null)}
        language={language}
      />
    </div>
  );
}
