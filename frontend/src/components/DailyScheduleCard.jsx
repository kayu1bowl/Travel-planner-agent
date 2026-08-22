import React, { useState } from 'react';
import { MapPin, ChevronRight } from 'lucide-react';
import ActivityDetailModal from './ActivityDetailModal';

export default function DailyScheduleCard({ 
  dailySchedules = {}, 
  activeDay = 1, 
  onSelectDay,
  labels = {},
  language = 'zh'
}) {
  const availableDays = Object.keys(dailySchedules || {}).map(Number).sort((a, b) => a - b);
  const currentDay = availableDays.includes(activeDay) ? activeDay : (availableDays[0] || 1);
  const currentRows = (dailySchedules && dailySchedules[currentDay]) || (dailySchedules && dailySchedules[availableDays[0]]) || [];
  const [selectedActivity, setSelectedActivity] = useState(null);

  const cols = labels.tableCols || {
    time: language === 'zh' ? "时刻" : "Time",
    activity: language === 'zh' ? "行程活动" : "Activity",
    location: language === 'zh' ? "地点 / 区域" : "Location",
    details: language === 'zh' ? "细节与体验" : "Experience Details"
  };

  return (
    <div className="bento-card daily-schedule-card">
      {/* 头部 Header: 严格统一两行制标题 + 右侧天数切换器 */}
      <div className="card-top-header">
        <div className="card-title-group">
          <div className="travel-eyebrow">
            <span className="eyebrow-dot"></span>
            <span>{labels.dailyTimelineEyebrow || (language === 'zh' ? 'DAILY TIMELINE · 路线节点' : 'DAILY TIMELINE · ROUTE STOPS')}</span>
          </div>
          <h3 className="card-title">{labels.dailyScheduleTitle || '每日行程路线'}</h3>
        </div>

        {/* 右侧：天数选择胶囊 (居中靠右对齐) */}
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
      </div>

      {/* 日程标准表格 */}
      <div className="schedule-table-wrapper">
        <table className="bento-schedule-table">
          <thead>
            <tr>
              <th style={{ width: '12%' }}>{cols.time}</th>
              <th style={{ width: '38%' }}>{cols.activity}</th>
              <th style={{ width: '22%' }}>{cols.location}</th>
              <th style={{ width: '28%' }}>{cols.details}</th>
            </tr>
          </thead>
          <tbody>
            {currentRows.length > 0 ? (
              currentRows.map((row, idx) => (
                <tr 
                  key={idx} 
                  className="bento-schedule-row clickable-row"
                  onClick={() => setSelectedActivity({ ...row, day: currentDay })}
                  title={language === 'zh' ? '点击查看该节点与地点详情' : 'Click to view stop details'}
                >
                  <td className="time-cell">
                    <div className="time-pill">
                      <span className="time-dot">●</span>
                      <span className="time-val">{row.time || '--:--'}</span>
                    </div>
                  </td>
                  <td className="activity-cell">
                    <span className="activity-title-text" title={row.activity}>{row.activity || (language === 'zh' ? '自由行程' : 'Free schedule')}</span>
                  </td>
                  <td className="location-cell">
                    <div className="location-chip" title={row.location}>
                      <MapPin size={11} className="location-chip-pin" />
                      <span className="location-chip-name">{row.location || (language === 'zh' ? '目的地' : 'Destination')}</span>
                    </div>
                  </td>
                  <td className="details-cell">
                    <div className="details-cell-inner" title={row.details}>
                      <span className="details-text">{row.details || (language === 'zh' ? '体验当地风土人情与景观' : 'Sightseeing and local discovery')}</span>
                      <ChevronRight size={13} className="details-row-arrow" />
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: 'center', padding: '32px', color: '#94A3B8' }}>
                  {language === 'zh' ? '暂无当日行程明细，正在为您生成...' : 'No itinerary stops recorded for this day'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
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
