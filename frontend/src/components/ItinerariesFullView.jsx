import React from 'react';
import { Calendar, MapPin, Clock, ArrowRight, Compass, Sparkles, CheckCircle2, ChevronRight } from 'lucide-react';

export default function ItinerariesFullView({ 
  currentData, 
  labels = {}, 
  language = 'zh', 
  onBackHome,
  onExportMarkdown 
}) {
  const days = Object.keys(currentData.dailySchedules || {}).map(Number).sort((a, b) => a - b);

  return (
    <div className="itineraries-full-view-container">
      {/* 顶部总览卡片 */}
      <div className="itineraries-header-card">
        <div className="itineraries-header-left">
          <div className="itineraries-badge">
            <Compass size={15} />
            <span>{language === 'zh' ? '全景行程总览' : 'Full Multi-Day Overview'}</span>
          </div>
          <h2 className="itineraries-main-title">{currentData.tripTitle}</h2>
          <p className="itineraries-subtitle-text">{currentData.tripSubtitle}</p>
        </div>

        <div className="itineraries-header-actions">
          <button className="back-home-btn" onClick={onBackHome}>
            {language === 'zh' ? '返回看板视图' : 'Back to Dashboard'}
          </button>
        </div>
      </div>

      {/* 多日行程瀑布流列表 */}
      <div className="itineraries-days-waterfall">
        {days.map((dayNum) => {
          const rows = currentData.dailySchedules[dayNum] || [];
          return (
            <div key={dayNum} className="bento-card itinerary-day-card">
              <div className="day-card-header">
                <div className="day-card-badge">
                  <Calendar size={14} />
                  <span>{language === 'zh' ? `第 ${dayNum} 天` : `Day ${dayNum}`}</span>
                </div>
                <span className="day-stops-count">
                  {rows.length} {language === 'zh' ? '个规划节点' : 'Stops'}
                </span>
              </div>

              {/* 每日日程路线表 */}
              <div className="schedule-table-wrapper">
                <table className="schedule-table">
                  <thead>
                    <tr>
                      <th className="col-time">{labels.tableCols?.time || "时间"}</th>
                      <th className="col-activity">{labels.tableCols?.activity || "行程活动"}</th>
                      <th className="col-location">{labels.tableCols?.location || "地点 / 区域"}</th>
                      <th className="col-details">{labels.tableCols?.details || "细节与体验"}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rows.map((item, idx) => (
                      <tr key={idx} className="schedule-row">
                        <td className="time-cell">{item.time}</td>
                        <td className="activity-cell">{item.activity}</td>
                        <td className="location-cell">
                          <span className="location-tag">
                            <MapPin size={11} className="location-pin-icon" />
                            {item.location}
                          </span>
                        </td>
                        <td className="details-cell">{item.details}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
