import React from 'react';
import { MoreHorizontal, Clock, MapPin, Compass } from 'lucide-react';

export default function DailyScheduleCard({ 
  dailySchedules = {}, 
  activeDay = 1, 
  onSelectDay,
  labels = {},
  language = 'zh'
}) {
  const availableDays = Object.keys(dailySchedules).map(Number).sort((a, b) => a - b);
  const currentDay = availableDays.includes(activeDay) ? activeDay : (availableDays[0] || 1);
  const currentRows = dailySchedules[currentDay] || dailySchedules[availableDays[0]] || [];
  const cols = labels.tableCols || {
    time: "时刻",
    activity: "行程活动",
    location: "地点 / 区域",
    details: "细节与体验"
  };

  return (
    <div className="bento-card daily-schedule-card">
      {/* 头部 Header */}
      <div className="card-top-header schedule-header-flex">
        <div className="title-section">
          <div className="travel-eyebrow">
            <span className="eyebrow-dot"></span>
            <span>DAILY TIMELINE · 路线节点</span>
          </div>
          <div className="title-row-with-badge">
            <h3 className="card-title">{labels.dailyScheduleTitle || '每日行程路线'}</h3>
            <span className="current-day-badge">
              {language === 'zh' ? `第 ${currentDay} 天` : `Day ${currentDay}`}
            </span>
          </div>
        </div>

        <div className="header-right-tools">
          {/* 天数切换药丸 Pills */}
          {availableDays.length > 1 && (
            <div className="day-pills-selector">
              {availableDays.map((d) => (
                <button
                  key={d}
                  className={`day-pill-btn ${currentDay === d ? 'active' : ''}`}
                  onClick={() => onSelectDay && onSelectDay(d)}
                >
                  <span className="day-num-prefix">D{d < 10 ? `0${d}` : d}</span>
                  <span className="day-label-text">{language === 'zh' ? `第${d}天` : `Day ${d}`}</span>
                </button>
              ))}
            </div>
          )}

          <button className="icon-more-btn" aria-label="Schedule options">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>

      {/* 日程标准表格 */}
      <div className="schedule-table-wrapper">
        <table className="bento-schedule-table">
          <thead>
            <tr>
              <th style={{ width: '15%' }}>{cols.time}</th>
              <th style={{ width: '29%' }}>{cols.activity}</th>
              <th style={{ width: '24%' }}>{cols.location}</th>
              <th style={{ width: '32%' }}>{cols.details}</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map((row, idx) => (
              <tr key={idx} className="bento-schedule-row">
                <td className="time-cell">
                  <div className="time-pill">
                    <span className="time-dot">●</span>
                    <span className="time-val">{row.time}</span>
                  </div>
                </td>
                <td className="activity-cell">
                  <span className="activity-title-text">{row.activity}</span>
                </td>
                <td className="location-cell">
                  <div className="location-chip">
                    <MapPin size={11} className="location-chip-pin" />
                    <span className="location-chip-name">{row.location}</span>
                  </div>
                </td>
                <td className="details-cell">
                  <span className="details-text">{row.details}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
