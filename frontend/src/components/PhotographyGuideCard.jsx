import React, { useState, useEffect, useRef } from 'react';
import { Link2, Users, Check, Camera, Globe, Sparkles } from 'lucide-react';
import { resolveMultiLevelImage, fetchWikimediaImage } from '../services/imageResolver';

function PhotoGuideImageWithFallback({ guide, language = 'zh' }) {
  const meta = resolveMultiLevelImage(guide);
  const [currentSrc, setCurrentSrc] = useState(meta.primaryUrl);
  const [currentSource, setCurrentSource] = useState(meta.primarySource);
  const [fallbackIndex, setFallbackIndex] = useState(0);
  const triedWikiRef = useRef(false);

  // 当外部目的地或机位数据变化时，即刻重置图片 URL 与数据源角标并异步检索实拍
  useEffect(() => {
    let isCancelled = false;
    const nextMeta = resolveMultiLevelImage(guide);
    setCurrentSrc(nextMeta.primaryUrl);
    setCurrentSource(nextMeta.primarySource);
    setFallbackIndex(0);
    triedWikiRef.current = false;

    const spotName = guide?.location || guide?.title || nextMeta.wikiSearchName;
    if (spotName) {
      fetchWikimediaImage(spotName).then((wikiUrl) => {
        if (!isCancelled && wikiUrl) {
          setCurrentSrc(wikiUrl);
          setCurrentSource('Wikimedia Commons');
        }
      });
    }

    return () => {
      isCancelled = true;
    };
  }, [guide?.title, guide?.location, guide?.image, guide?.id]);

  const handleError = async () => {
    // Level 2 动态维基百科官方实拍图检索 (如果配置了 wikiTitle 且尚未尝试)
    if (guide?.wikiTitle && !triedWikiRef.current) {
      triedWikiRef.current = true;
      try {
        const wikiUrl = await fetchWikimediaImage(guide.wikiTitle);
        if (wikiUrl) {
          setCurrentSrc(wikiUrl);
          setCurrentSource('Wikimedia Commons');
          return;
        }
      } catch (e) {
        // 维基检索异常时无缝顺延至后续兜底
      }
    }

    // 顺延至 Level 3 (AI Generative) 或 Level 4 (Category Fallback)
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
      <span className="image-source-badge" title={`${language === 'zh' ? '机位图片数据源: ' : 'Spot Image Source: '}${currentSource}`}>
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
    const paramLabel = labels.paramsLabel || (language === 'zh' ? '参数建议' : 'Camera Settings');
    const defaultParams = language === 'zh' ? '推荐广角镜头' : 'Wide Angle Lens';
    navigator.clipboard.writeText(`${item.title} - ${item.subtitle} (${paramLabel}: ${item.params || defaultParams})`);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleShare = (item) => {
    const text = language === 'zh'
      ? `📸 【${item.title}】\n✨ 构图指南: ${item.subtitle}\n⚙️ 参数建议: ${item.params || '黄金时刻'}\n来源: Roam AI 智能旅行规划`
      : `📸 【${item.title}】\n✨ Composition: ${item.subtitle}\n⚙️ Settings: ${item.params || 'Golden Hour'}\nSource: Roam AI Travel Planner`;
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

  const title = labels.photoGuideTitle || labels.spotsTitle || (language === 'zh' ? "摄影机位与出片指南" : "Photography Guide & Photo Spots");

  return (
    <div className="bento-card photo-guide-bento-card">
      {/* 头部 Header */}
      <div className="card-top-header">
        <div className="card-title-group">
          <div className="travel-eyebrow">
            <span className="eyebrow-dot"></span>
            <span>{labels.visualExpeditionEyebrow || (language === 'zh' ? 'VISUAL EXPEDITION · 摄影出片指南' : 'VISUAL EXPEDITION · PHOTO GUIDE')}</span>
          </div>
          <h3 className="card-title">{title}</h3>
        </div>
      </div>

      {/* 3 张大卡片横向排版 */}
      {photoGuides && photoGuides.length > 0 ? (
        <div className="photo-guides-grid">
          {photoGuides.map((guide, idx) => (
            <div key={`${guide.title || guide.id || idx}-${idx}`} className="photo-spot-box">
              <PhotoGuideImageWithFallback guide={guide} language={language} />


              {/* 标题与构图技巧 */}
              <h4 className="spot-title-text">{guide.title}</h4>
              <p className="spot-subtitle-text">{guide.subtitle}</p>

              {/* 底部 Tips 与 链接/分享 图标 */}
              <div className="spot-bottom-row">
                <div className="spot-tips-group">
                  <span className="tips-label">{labels.tipsPrefix || labels.tipsLabel || (language === 'zh' ? '贴士:' : 'Tips:')}</span>
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
                    title={labels.copySpotBtn || (language === 'zh' ? "复制机位建议" : "Copy photo spot")}
                  >
                    {copiedId === guide.id ? <Check size={14} color="#10B981" /> : <Link2 size={14} />}
                  </button>
                  <button 
                    className="spot-action-icon-btn" 
                    onClick={() => handleShare(guide)}
                    title={sharedId === guide.id ? (language === 'zh' ? '已复制分享文案' : 'Share text copied') : (labels.shareSpotBtn || (language === 'zh' ? "分享机位文案" : "Share spot"))}
                  >
                    {sharedId === guide.id ? <Check size={14} color="#10B981" /> : <Users size={14} />}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-guides-placeholder" style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>
          <Camera size={28} style={{ margin: '0 auto 8px', opacity: 0.6 }} />
          <p>{language === 'zh' ? '正在智能匹配该目的地的黄金机位与曝光参数...' : 'Curating best photography spots & optical parameters...'}</p>
        </div>
      )}
    </div>
  );
}
