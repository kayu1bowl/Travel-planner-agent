import React, { useState, useEffect } from 'react';
import { 
  X, 
  MapPin, 
  Clock, 
  Compass, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Car, 
  Camera, 
  Sparkles,
  Info
} from 'lucide-react';

export default function ActivityDetailModal({ 
  item, 
  isOpen, 
  onClose, 
  language = 'zh' 
}) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !item) return null;

  const handleCopyLocation = () => {
    const textToCopy = item.location || item.activity || (language === 'zh' ? '特色景点' : 'Scenic Spot');
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleOpenMaps = () => {
    const loc = item.location || item.activity || '';
    if (!loc) return;
    const query = encodeURIComponent(loc);
    window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
  };

  // 生成智能贴士（多目的地通用自适应）
  const getContextualTips = (activity = '', location = '') => {
    const act = (String(activity || '') + ' ' + String(location || '')).toLowerCase();
    if (act.includes('星空') || act.includes('观星') || act.includes('教堂') || act.includes('tekapo')) {
      return language === 'zh'
        ? '国际暗夜保护区核心区，夜间观星请关闭大灯使用红光手电；湖畔夜间风大温差大，建议穿戴羽绒保暖防风衣物。'
        : 'Dark Sky Reserve core area: Use red flashlights to preserve night vision. Night breeze can be very chilly, bring warm windproof gear.';
    }
    if (act.includes('徒步') || act.includes('山') || act.includes('步道') || act.includes('trail') || act.includes('peak') || act.includes('hike')) {
      return language === 'zh'
        ? '户外高山步道建议穿着防滑徒步鞋；沿途无补给点，请随身自备 1L+ 饮用水、防晒与高热量能量补给。'
        : 'Alpine hiking trails require sturdy footwear. Bring at least 1L water, sun protection, and energy snacks.';
    }
    if (act.includes('拉面') || act.includes('寿司') || act.includes('海鲜') || act.includes('美食') || act.includes('肉派') || act.includes('汉堡') || act.includes('sushi') || act.includes('dining')) {
      return language === 'zh'
        ? '当地特色高人气打卡点，高峰就餐时段可能需排队 15-30 分钟；支持主流信用卡与移动支付。'
        : 'High-popularity local culinary spot. Expect 15-30 min queues during peak hours. Cards and digital pay accepted.';
    }
    if (act.includes('寺') || act.includes('神宫') || act.includes('shrine') || act.includes('temple')) {
      return language === 'zh'
        ? '传统文化与信仰圣地，参拜时请保持肃静并遵守手水舍净手礼仪；部分殿堂内部禁止拍照摄影。'
        : 'Sacred cultural site. Please respect purification etiquette and observe photo-taking restrictions.';
    }
    if (act.includes('自驾') || act.includes('公路') || act.includes('租车') || act.includes('取车') || act.includes('drive')) {
      return language === 'zh'
        ? '请严格遵守当地交规与限速；山区路段多弯道与天气突变，全线开启车灯并保持安全跟车距离。'
        : 'Strictly observe local driving rules and speed limits. Maintain safe distance especially on mountain roads.';
    }
    return language === 'zh'
      ? '建议根据天气情况灵活调整游览节奏，尊重当地文化与自然环境保护准则（Leave No Trace）。'
      : 'Adjust sightseeing pace based on weather conditions. Follow Leave No Trace and local cultural guidelines.';
  };

  return (
    <div className="activity-modal-overlay" onClick={onClose}>
      <div className="activity-modal-container" onClick={(e) => e.stopPropagation()}>
        {/* 顶部标题栏 */}
        <div className="activity-modal-header">
          <div className="activity-modal-title-box">
            <div className="activity-modal-eyebrow">
              <span className="eyebrow-dot"></span>
              <span>{language === 'zh' ? '行程节点与地点详情' : 'STOP & ACTIVITY DETAILS'}</span>
            </div>
            <h3 className="activity-modal-title">{item.activity}</h3>
          </div>
          <button className="activity-modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* 标签元数据栏 */}
        <div className="activity-modal-meta-bar">
          <div className="modal-meta-pill time">
            <Clock size={13} />
            <span>{item.time || (language === 'zh' ? '全天' : 'All Day')}</span>
          </div>
          <div className="modal-meta-pill location" onClick={handleCopyLocation} title={language === 'zh' ? '点击复制地点' : 'Click to copy'}>
            <MapPin size={13} />
            <span>{item.location}</span>
            {copied ? <Check size={11} color="#10B981" /> : <Copy size={11} color="#94A3B8" />}
          </div>
        </div>

        {/* 内容主体 */}
        <div className="activity-modal-body">
          {/* 1. 体验与细节介绍 */}
          <div className="modal-section-card">
            <div className="modal-section-title">
              <Info size={15} color="#4F46E5" />
              <span>{language === 'zh' ? '体验与活动亮点' : 'Experience & Highlights'}</span>
            </div>
            <p className="modal-section-text">{item.details}</p>
          </div>

          {/* 2. 出行与安全贴士 */}
          <div className="modal-section-card tips-card">
            <div className="modal-section-title">
              <ShieldCheck size={15} color="#059669" />
              <span>{language === 'zh' ? '实地出行与游玩贴士' : 'Field & Safety Tips'}</span>
            </div>
            <p className="modal-section-text">{getContextualTips(item.activity, item.location)}</p>
          </div>

          {/* 3. 交通与停留建议 */}
          <div className="modal-section-grid">
            <div className="modal-mini-card">
              <div className="mini-card-label">
                <Clock size={13} color="#64748B" />
                <span>{language === 'zh' ? '建议游玩用时' : 'Suggested Duration'}</span>
              </div>
              <strong className="mini-card-val">{language === 'zh' ? '约 1.5 ~ 2.5 小时' : '1.5 ~ 2.5 Hours'}</strong>
            </div>

            <div className="modal-mini-card">
              <div className="mini-card-label">
                <Car size={13} color="#64748B" />
                <span>{language === 'zh' ? '交通自驾参考' : 'Transit Recommendation'}</span>
              </div>
              <strong className="mini-card-val">{language === 'zh' ? '自驾沿途设观景车位' : 'Scenic Overlook Parking'}</strong>
            </div>
          </div>
        </div>

        {/* 底部操作工具栏 */}
        <div className="activity-modal-footer">
          <button className="modal-footer-btn secondary" onClick={handleCopyLocation}>
            {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
            <span>{copied ? (language === 'zh' ? '已复制地点！' : 'Copied!') : (language === 'zh' ? '复制地点名' : 'Copy Location')}</span>
          </button>
          <button className="modal-footer-btn primary" onClick={handleOpenMaps}>
            <ExternalLink size={14} />
            <span>{language === 'zh' ? '在地图中查看' : 'View on Maps'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
