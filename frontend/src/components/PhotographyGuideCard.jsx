import React, { useState } from 'react';
import { MoreHorizontal, Link2, Users, Check, Camera, Sparkles } from 'lucide-react';

export default function PhotographyGuideCard({ photoGuides = [], labels = {}, language = 'zh' }) {
  const [copiedId, setCopiedId] = useState(null);

  const handleCopyLink = (item) => {
    navigator.clipboard.writeText(`${item.title} - ${item.subtitle} (${labels.paramsLabel || '参数建议'}: ${item.params || '推荐广角镜头'})`);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="bento-card photo-guide-bento-card">
      {/* 头部 Header */}
      <div className="card-top-header">
        <div className="title-with-badge">
          <h3 className="card-title">{labels.photoGuideTitle || "Photography Guide & Photo Spots"}</h3>
        </div>
        <button className="icon-more-btn" aria-label="Photo guide options">
          <MoreHorizontal size={18} />
        </button>
      </div>

      {/* 3 张大卡片横向排版 */}
      <div className="photo-guides-grid">
        {photoGuides.map((guide) => (
          <div key={guide.id} className="photo-spot-box">
            {/* 封面照片 */}
            <div className="spot-photo-wrapper">
              <img src={guide.image} alt={guide.title} className="spot-photo-img" />
              {guide.params && (
                <div className="photo-params-pill">
                  <Camera size={11} />
                  <span>{guide.params}</span>
                </div>
              )}
            </div>

            {/* 标题与构图技巧 */}
            <h4 className="spot-title-text">{guide.title}</h4>
            <p className="spot-subtitle-text">{guide.subtitle}</p>

            {/* 底部 Tips 与 链接/分享 图标 */}
            <div className="spot-bottom-row">
              <div className="spot-tips-group">
                <span className="tips-label">{labels.tipsPrefix || "Tips:"}</span>
                <div className="tips-avatars-row">
                  {guide.tipsAvatars && guide.tipsAvatars.map((av, avIdx) => (
                    <span key={avIdx} className="tip-avatar-pill">{av}</span>
                  ))}
                </div>
              </div>

              <div className="spot-actions-group">
                <button 
                  className="spot-action-icon-btn" 
                  onClick={() => handleCopyLink(guide)}
                  title={labels.copySpotBtn || "复制机位建议"}
                >
                  {copiedId === guide.id ? <Check size={14} color="#10B981" /> : <Link2 size={14} />}
                </button>
                <button 
                  className="spot-action-icon-btn"
                  title={labels.shareSpotBtn || "分享机位"}
                >
                  <Users size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
