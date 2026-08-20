import React, { useState } from 'react';
import { Link2, Users, Check, Camera, Globe, Sparkles } from 'lucide-react';
import { resolveMultiLevelImage } from '../services/imageResolver';

function PhotoGuideImageWithFallback({ guide }) {
  const meta = resolveMultiLevelImage(guide);
  const [currentSrc, setCurrentSrc] = useState(meta.primaryUrl);
  const [currentSource, setCurrentSource] = useState(meta.primarySource);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  const handleError = () => {
    if (fallbackIndex < meta.fallbacks.length) {
      const nextFallback = meta.fallbacks[fallbackIndex];
      setCurrentSrc(nextFallback.url);
      setCurrentSource(nextFallback.source);
      setFallbackIndex(prev => prev + 1);
    }
  };

  const getSourceIcon = (src) => {
    if (src?.includes('Wikimedia')) return <Globe size={9} />;
    if (src?.includes('AI')) return <Sparkles size={9} />;
    return <Camera size={9} />;
  };

  return (
    <div className="spot-photo-wrapper">
      <img 
        src={currentSrc} 
        alt={guide.title} 
        className="spot-photo-img" 
        onError={handleError}
        loading="lazy"
      />
      {guide.params && (
        <div className="photo-params-pill">
          <Camera size={11} />
          <span>{guide.params}</span>
        </div>
      )}
      {/* 来源标注角标 */}
      <span className="image-source-badge" title={`机位图片数据源: ${currentSource}`}>
        {getSourceIcon(currentSource)}
        <span>{currentSource}</span>
      </span>
    </div>
  );
}

export default function PhotographyGuideCard({ photoGuides = [], labels = {}, language = 'zh' }) {
  const [copiedId, setCopiedId] = useState(null);
  const [sharedId, setSharedId] = useState(null);

  const handleCopyLink = (item) => {
    navigator.clipboard.writeText(`${item.title} - ${item.subtitle} (${labels.paramsLabel || '参数建议'}: ${item.params || '推荐广角镜头'})`);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = (item) => {
    const text = `📸 【${item.title}】\n✨ 构图指南: ${item.subtitle}\n⚙️ 参数建议: ${item.params || '黄金时刻'}\n来源: Roam AI 智能旅行规划`;
    if (navigator.share) {
      navigator.share({
        title: item.title,
        text: text,
      }).catch(() => {
        navigator.clipboard.writeText(text);
        setSharedId(item.id);
        setTimeout(() => setSharedId(null), 2000);
      });
    } else {
      navigator.clipboard.writeText(text);
      setSharedId(item.id);
      setTimeout(() => setSharedId(null), 2000);
    }
  };

  return (
    <div className="bento-card photo-guide-bento-card">
      {/* 头部 Header */}
      <div className="card-top-header">
        <div className="card-title-group">
          <div className="travel-eyebrow">
            <span className="eyebrow-dot"></span>
            <span>VISUAL EXPEDITION · 摄影出片指南</span>
          </div>
          <h3 className="card-title">{labels.photoGuideTitle || "摄影机位与出片指南"}</h3>
        </div>
      </div>

      {/* 3 张大卡片横向排版 */}
      <div className="photo-guides-grid">
        {photoGuides.map((guide) => (
          <div key={guide.id} className="photo-spot-box">
            <PhotoGuideImageWithFallback guide={guide} />

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
                  onClick={() => handleShare(guide)}
                  title={sharedId === guide.id ? (language === 'zh' ? '已复制分享文案' : 'Share text copied') : (labels.shareSpotBtn || "分享机位文案")}
                >
                  {sharedId === guide.id ? <Check size={14} color="#10B981" /> : <Users size={14} />}
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
