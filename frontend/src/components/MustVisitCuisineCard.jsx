import React, { useState, useEffect, useRef } from 'react';
import { Camera, Globe, Sparkles } from 'lucide-react';
import { resolveMultiLevelImage, fetchWikimediaImage } from '../services/imageResolver';

function CuisineImageWithFallback({ item, language = 'zh' }) {
  const meta = resolveMultiLevelImage(item);
  const [currentSrc, setCurrentSrc] = useState(meta.primaryUrl);
  const [currentSource, setCurrentSource] = useState(meta.primarySource);
  const [fallbackIndex, setFallbackIndex] = useState(0);

  // 当外部目的地或数据项变化时，即时重置图片 URL 并自动异步嗅探全球地标实拍
  useEffect(() => {
    let isCancelled = false;
    const nextMeta = resolveMultiLevelImage(item);
    setCurrentSrc(nextMeta.primaryUrl);
    setCurrentSource(nextMeta.primarySource);
    setFallbackIndex(0);

    // 自动对全球任意地标发起开放维基实拍图检索，精准升级为真实地标实拍
    if (nextMeta.wikiSearchName) {
      fetchWikimediaImage(nextMeta.wikiSearchName).then((wikiUrl) => {
        if (!isCancelled && wikiUrl) {
          setCurrentSrc(wikiUrl);
          setCurrentSource('Wikimedia Commons');
        }
      });
    }

    return () => {
      isCancelled = true;
    };
  }, [item?.name, item?.image, item?.category]);

  const handleError = async () => {
    // 顺延至下一步 Fallback (AI Generative -> 语义地貌兜底)
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
    <div className="item-thumbnail-wrapper">
      <img 
        src={currentSrc} 
        alt={item.name} 
        className="item-thumb-img" 
        onError={handleError}
        loading="lazy"
      />
      {item.category && (
        <span className="item-category-tag">{item.category}</span>
      )}
      {/* 来源标注角标 */}
      <span className="image-source-badge" title={`${language === 'zh' ? '图片数据源: ' : 'Image Source: '}${currentSource}`}>
        {getSourceIcon(currentSource)}
        <span>{currentSource}</span>
      </span>
    </div>
  );
}

export default function MustVisitCuisineCard({ items = [], labels = {}, language = 'zh' }) {
  const [filterCategory, setFilterCategory] = useState('all');

  const filteredItems = (items || []).filter(item => {
    if (filterCategory === 'all') return true;
    const cat = (item.category || '').toLowerCase();
    const name = (item.name || '').toLowerCase();
    const rec = (item.recommendations || '').toLowerCase();

    const isFood = cat.includes('美食') || cat.includes('小吃') || cat.includes('风味') || cat.includes('food') || cat.includes('cuisine') || cat.includes('dining') || name.includes('面') || name.includes('饭') || name.includes('三文鱼') || name.includes('肉') || name.includes('堡') || name.includes('餐') || rec.includes('吃') || rec.includes('尝') || rec.includes('味') || rec.includes('salmon') || rec.includes('burger') || rec.includes('sushi') || rec.includes('dish');

    if (filterCategory === 'food') return isFood;
    if (filterCategory === 'landmark') return !isFood;
    return true;
  });

  const displayItems = filteredItems.length > 0 ? filteredItems : items;

  return (
    <div className="bento-card must-visit-cuisine-card">
      {/* 头部 Header */}
      <div className="card-top-header">
        <div className="card-title-group">
          <div className="travel-eyebrow">
            <span className="eyebrow-dot"></span>
            <span>{labels.tasteSightsEyebrow || (language === 'zh' ? 'TASTE & SIGHTS · 风物指南' : 'TASTE & SIGHTS · LOCAL GUIDE')}</span>
          </div>
          <h3 className="card-title">{labels.mustVisitTitle || (language === 'zh' ? "必去地标与风味美食" : "Must-Visit & Cuisine")}</h3>
        </div>
        
        {/* 分类切换药丸 */}
        <div className="cuisine-filter-pills">
          <button 
            className={`filter-pill-btn ${filterCategory === 'all' ? 'active' : ''}`}
            onClick={() => setFilterCategory('all')}
          >
            {labels.allCategories || (language === 'zh' ? '全部' : 'All')}
          </button>
          <button 
            className={`filter-pill-btn ${filterCategory === 'food' ? 'active' : ''}`}
            onClick={() => setFilterCategory('food')}
          >
            {labels.foodCategory || (language === 'zh' ? '🍲 美食' : '🍲 Food')}
          </button>
          <button 
            className={`filter-pill-btn ${filterCategory === 'landmark' ? 'active' : ''}`}
            onClick={() => setFilterCategory('landmark')}
          >
            {labels.landmarkCategory || (language === 'zh' ? '🏛️ 地标' : '🏛️ Landmark')}
          </button>
        </div>
      </div>

      {/* 4 张卡片网格排版 */}
      {displayItems && displayItems.length > 0 ? (
        <div className="cuisine-items-grid">
          {displayItems.map((item, idx) => {
            const rawName = item.name || '';
            const match = String(rawName).match(/^([^(（]+)(?:[(（](.*?)[)）])?$/);
            const mainName = match ? match[1].trim() : rawName;
            const subName = match && match[2] ? match[2].trim() : null;

            return (
              <div key={`${item.name || idx}-${idx}`} className="cuisine-item-box">
                <CuisineImageWithFallback item={item} language={language} />

                <h4 className="item-name-title" title={rawName}>
                  <span className="item-name-main">{mainName}</span>
                  {subName && (
                    <span className="item-name-sub">({subName})</span>
                  )}
                </h4>
                
                <p className="item-recommendation-text">
                  <span className="rec-label">{labels.recommendationsLabel || (language === 'zh' ? '推荐理由: ' : 'Why Visit: ')}</span>
                  {item.recommendations}
                </p>

                <div className="item-tips-row">
                  <span className="tips-label">{labels.tipsLabel || (language === 'zh' ? '游玩指南' : 'Guide')}</span>
                  <span className="tips-emojis">{item.tipsEmoji || "⭐ 4.9 · 必打卡"}</span>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="empty-guides-placeholder" style={{ padding: '24px', textAlign: 'center', color: '#94A3B8' }}>
          <p>{language === 'zh' ? '暂无地标与风味数据' : 'No landmark or cuisine data found'}</p>
        </div>
      )}
    </div>
  );
}
