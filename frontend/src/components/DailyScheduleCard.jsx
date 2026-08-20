import React from 'react';
import { MoreHorizontal, Clock, MapPin } from 'lucide-react';

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
    time: "Time",
    activity: "Activity",
    location: "Location",
    details: "Details"
  };

  return (
    <div className="bento-card daily-schedule-card">
      {/* 头部 Header */}
      <div className="card-top-header schedule-header-flex">
        <div className="title-section">
          <h3 className="card-title">{labels.dailyScheduleTitle || '每日行程路线'}</h3>
          <span className="current-day-badge">
            {language === 'zh' ? `第 ${currentDay} 天` : `Day ${currentDay}`}
          </span>
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
                  {language === 'zh' ? `第${d}天` : `Day ${d}`}
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
              <th style={{ width: '14%' }}>{cols.time}</th>
              <th style={{ width: '30%' }}>{cols.activity}</th>
              <th style={{ width: '24%' }}>{cols.location}</th>
              <th style={{ width: '32%' }}>{cols.details}</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.map((row, idx) => (
              <tr key={idx} className="bento-schedule-row">
                <td className="time-cell">
                  <div className="time-pill">
                    <Clock size={10} className="time-clock-icon" />
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
