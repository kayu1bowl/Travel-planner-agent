/**
 * Multi-Level Fallback Image Resolution Engine
 * 优先级顺序：
 *   1. Level 1: Unsplash 官方高清摄影图库 (High-Aesthetic Photography)
 *   2. Level 2: Wikimedia Commons / Wikipedia 官方开放实拍图 API (Real Geographic Landmark Photos)
 *   3. Level 3: AI 实时生成/概念渲染 (AI Generative Visuals)
 *   4. Ultimate Fallback: 本地/预设高品质分类兜底图谱
 */

// 预设高品质分类兜底图谱
const CATEGORY_FALLBACK_IMAGES = {
  food: {
    url: 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=800&auto=format&fit=crop&q=80',
    source: 'Unsplash'
  },
  landmark: {
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/57/Church_of_the_Good_Shepherd%2C_Tekapo_01.jpg/960px-Church_of_the_Good_Shepherd%2C_Tekapo_01.jpg',
    source: 'Wikimedia Commons'
  },
  nature: {
    url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=800&auto=format&fit=crop&q=80',
    source: 'Unsplash'
  },
  general: {
    url: 'https://images.unsplash.com/photo-1433086966358-54859d0ed716?w=800&auto=format&fit=crop&q=80',
    source: 'Unsplash'
  }
};

/**
 * 通过 Wikipedia / Wikimedia 官方 API 动态检索真实地标图片
 * @param {string} wikiTitle - 英文词条名称，如 "Church_of_the_Good_Shepherd,_Lake_Tekapo"
 * @returns {Promise<string|null>} 图片 URL
 */
export async function fetchWikimediaImage(wikiTitle) {
  if (!wikiTitle) return null;
  try {
    const formattedTitle = encodeURIComponent(wikiTitle.replace(/\s+/g, '_'));
    const apiUrl = `https://en.wikipedia.org/w/api.php?action=query&titles=${formattedTitle}&prop=pageimages&format=json&pithumbsize=800&origin=*`;
    const res = await fetch(apiUrl);
    if (!res.ok) return null;
    const data = await res.json();
    const pages = data?.query?.pages || {};
    for (const pageId in pages) {
      const thumb = pages[pageId]?.thumbnail?.source;
      if (thumb) return thumb;
    }
    return null;
  } catch (err) {
    console.warn('[WikimediaAPI] Image fetch fallback:', err);
    return null;
  }
}

/**
 * 获取 AI 实时生图 URL (Level 3)
 * @param {string} prompt - 英文画面提示词
 * @returns {string} 生图 URL
 */
export function getAIGenerativeImageUrl(prompt) {
  const cleanPrompt = encodeURIComponent(prompt || 'Stunning New Zealand landscape scenery with snow mountains');
  return `https://image.pollinations.ai/prompt/${cleanPrompt}?width=800&height=500&nologo=true`;
}

/**
 * 组装多级 Fallback 链条
 * @param {Object} item - 景点/美食/机位数据项
 * @returns {Object} 包含 primaryUrl, fallbacks 数组与初始来源
 */
export function resolveMultiLevelImage(item) {
  const fallbacks = [];

  // Level 1: Unsplash (默认主图)
  const primaryUrl = item.image || item.unsplashUrl || CATEGORY_FALLBACK_IMAGES.general.url;
  const primarySource = item.imageSource || 'Unsplash';

  // Level 2: Wikimedia (如果提供了 wikiUrl 或 wikiTitle)
  if (item.wikimediaUrl) {
    fallbacks.push({ url: item.wikimediaUrl, source: 'Wikimedia Commons' });
  }

  // Level 3: AI Generative Visual (如果提供了 aiPrompt)
  if (item.aiPrompt) {
    fallbacks.push({ url: getAIGenerativeImageUrl(item.aiPrompt), source: 'AI Generated' });
  }

  // Level 4: 分类兜底
  const catKey = (item.category === '地道美食' || item.category === '美食') ? 'food' : 'landmark';
  fallbacks.push({
    url: CATEGORY_FALLBACK_IMAGES[catKey].url,
    source: CATEGORY_FALLBACK_IMAGES[catKey].source
  });

  return {
    primaryUrl,
    primarySource,
    fallbacks
  };
}
