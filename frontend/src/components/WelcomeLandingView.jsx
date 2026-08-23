import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  Compass, 
  Send, 
  Globe, 
  CheckCircle2, 
  Loader2, 
  ArrowRight,
  Navigation,
  Camera,
  Layers,
  ShieldCheck,
  Activity,
  Maximize2,
  Sliders,
  ChevronRight,
  ChevronLeft,
  ChevronDown,
  Sun,
  Moon,
  Clock,
  MapPin,
  Flame,
  Award,
  Crosshair,
  Wifi,
  Cpu,
  Radio,
  Play,
  Pause
} from 'lucide-react';
import { TRANSLATIONS } from '../services/i18n';
import { VERIFIED_LANDSCAPE_LIBRARY, matchDestinationImage } from '../services/imageMatcher';
import AgentTransitionHub from './AgentTransitionHub';

// 全球精选风光轮播大图源
const GLOBAL_SCENIC_CAROUSEL = [
  VERIFIED_LANDSCAPE_LIBRARY.NZ_TEKAPO_NIGHT,
  VERIFIED_LANDSCAPE_LIBRARY.JP_FUJI_PAGODA,
  VERIFIED_LANDSCAPE_LIBRARY.CH_SWISS_LAUTERBRUNNEN,
  VERIFIED_LANDSCAPE_LIBRARY.NO_LOFOTEN_AURORA,
  VERIFIED_LANDSCAPE_LIBRARY.IT_DOLOMITES_PEAKS,
  VERIFIED_LANDSCAPE_LIBRARY.CA_BANFF_MORAINE_LAKE,
  VERIFIED_LANDSCAPE_LIBRARY.JP_KYOTO_PAGODA,
  VERIFIED_LANDSCAPE_LIBRARY.GR_SANTORINI_OIA,
  VERIFIED_LANDSCAPE_LIBRARY.NZ_SOUTHERN_ALPS_HIGHWAY,
  VERIFIED_LANDSCAPE_LIBRARY.JP_TOKYO_SHIBUYA,
  VERIFIED_LANDSCAPE_LIBRARY.IS_JOKULSARLON_ICE,
  VERIFIED_LANDSCAPE_LIBRARY.CN_GUIZHOU_KARST,
  VERIFIED_LANDSCAPE_LIBRARY.NZ_MILFORD_SOUND,
  VERIFIED_LANDSCAPE_LIBRARY.JP_KYOTO_BAMBOO,
  VERIFIED_LANDSCAPE_LIBRARY.CH_MATTERHORN_PEAK,
  VERIFIED_LANDSCAPE_LIBRARY.NZ_WANAKA_ROYS_PEAK
];

// 全球专业摄影机位精选库 (含推荐机位参数与拍摄时段建议，支持双语)
const GLOBAL_MASTER_PHOTO_SPOTS = [
  {
    image: VERIFIED_LANDSCAPE_LIBRARY.NZ_TEKAPO_NIGHT.url,
    name: "特卡波湖好牧羊人教堂",
    name_en: "Church of the Good Shepherd, Lake Tekapo",
    spotType: "ASTROPHOTOGRAPHY · 暗夜星空机位",
    spotType_en: "ASTROPHOTOGRAPHY · Dark Sky Reserve",
    iso: "ISO 3200",
    shutter: "20s",
    aperture: "f/2.8",
    focal: "14mm GM",
    elevation: "710m",
    bortle: "Class 1 极暗天空",
    bortle_en: "Class 1 Pristine Dark Sky",
    window: "银河升起 23:30 - 03:15",
    window_en: "Milky Way Rise 23:30 - 03:15",
    tip: "超广角低机位仰拍，石砌教堂作为前景容纳整片银河拱桥，避开小镇杂光。",
    tip_en: "Ultra-wide low angle shooting upwards, framing the stone church under the complete Milky Way arch."
  },
  {
    image: VERIFIED_LANDSCAPE_LIBRARY.NZ_WANAKA_ROYS_PEAK.url,
    name: "瓦纳卡罗伊斯山峰",
    name_en: "Roys Peak Track, Lake Wanaka",
    spotType: "GOLDEN HOUR · 晨光云海脊线",
    spotType_en: "GOLDEN HOUR · Alpine Ridgeline",
    iso: "ISO 100",
    shutter: "1/200s",
    aperture: "f/8.0",
    focal: "35mm F1.4",
    elevation: "1578m",
    bortle: "日出顺逆光",
    bortle_en: "Dawn Backlight & Cloud Inversion",
    window: "黄金时刻 06:15 - 07:00",
    window_en: "Golden Hour 06:15 - 07:00",
    tip: "逆光拍摄山脊延伸至瓦纳卡湖，使用 CPL 偏振镜消除湖面反光与杂色。",
    tip_en: "Backlit ridge leading toward Lake Wanaka; use CPL to cut lake reflection and glare."
  },
  {
    image: VERIFIED_LANDSCAPE_LIBRARY.NZ_MILFORD_SOUND.url,
    name: "米尔福德峡湾主教冠峰",
    name_en: "Mitre Peak, Milford Sound",
    spotType: "BLUE HOUR · 峡湾镜面倒影",
    spotType_en: "BLUE HOUR · Fjord Mirror Reflection",
    iso: "ISO 100",
    shutter: "30s (ND64)",
    aperture: "f/11",
    focal: "16-35mm",
    elevation: "海平面",
    elevation_en: "Sea Level",
    bortle: "晨雾蓝调",
    bortle_en: "Morning Mist & Blue Hour",
    window: "蓝调时刻 07:20 - 08:00",
    window_en: "Blue Hour 07:20 - 08:00",
    tip: "利用退潮沙滩水面长曝光消除水波，捕捉倒映在深色冰川海水中的主教冠峰。",
    tip_en: "Long exposure over low-tide sandy beach to smooth water and mirror Mitre Peak in fjord waters."
  },
  {
    image: VERIFIED_LANDSCAPE_LIBRARY.JP_FUJI_PAGODA.url,
    name: "富士山浅间公园五重塔",
    name_en: "Chureito Pagoda & Mt. Fuji",
    spotType: "ICONIC VIEW · 经典雪顶和风",
    spotType_en: "ICONIC VIEW · Classic Snow Peak & Pagoda",
    iso: "ISO 200",
    shutter: "1/60s",
    aperture: "f/5.6",
    focal: "50mm F1.8",
    elevation: "850m",
    bortle: "夕阳晚霞",
    bortle_en: "Sunset Afterglow",
    window: "日落前 17:15 - 18:00",
    window_en: "Sunset 17:15 - 18:00",
    tip: "中焦段压缩忠灵塔与远方雪白富士山同框，日落前 30 分钟塔身朱红暖光最佳。",
    tip_en: "Mid-telephoto compression framing pagoda and snow-capped Mt Fuji 30 mins before sunset."
  },
  {
    image: VERIFIED_LANDSCAPE_LIBRARY.JP_KYOTO_PAGODA.url,
    name: "京都八坂之塔古街暮色",
    name_en: "Yasaka Pagoda & Ninenzaka, Kyoto",
    spotType: "HERITAGE · 古都雅韵机位",
    spotType_en: "HERITAGE · Ancient Capital Twilight",
    iso: "ISO 400",
    shutter: "1/80s",
    aperture: "f/2.8",
    focal: "35mm F1.4",
    elevation: "55m",
    bortle: "石板路暖灯",
    bortle_en: "Lantern Lit Cobblestone",
    window: "蓝调傍晚 18:00 - 19:00",
    window_en: "Blue Twilight 18:00 - 19:00",
    tip: "清晨或傍晚沿二年坂石阶仰拍，避开拥挤游客，捕捉飞檐与石板路倒影。",
    tip_en: "Upward angle along Ninenzaka slope during dusk, capturing lantern reflections on stone path."
  },
  {
    image: VERIFIED_LANDSCAPE_LIBRARY.CH_MATTERHORN_PEAK.url,
    name: "采尔马特利菲尔湖倒影",
    name_en: "Riffelsee & Matterhorn, Zermatt",
    spotType: "ALPINE REFLECTION · 黄金日照金山",
    spotType_en: "ALPINE REFLECTION · Golden Sunrise Peak",
    iso: "ISO 100",
    shutter: "1/125s",
    aperture: "f/8.0",
    focal: "24mm F1.4",
    elevation: "2757m",
    bortle: "晨曦金顶",
    bortle_en: "First Alpine Glow",
    window: "日出金顶 05:45 - 06:20",
    window_en: "Sunrise Glow 05:45 - 06:20",
    tip: "清晨无风时蹲守利菲尔湖边，捕捉马特洪峰第一缕金光倒映在澄澈冰川湖中。",
    tip_en: "Station by Riffelsee on calm mornings to capture Matterhorn's golden reflection in glacial water."
  },
  {
    image: VERIFIED_LANDSCAPE_LIBRARY.NO_LOFOTEN_AURORA.url,
    name: "挪威罗弗敦雷纳村极光",
    name_en: "Reine Village Aurora, Lofoten",
    spotType: "AURORA CHASER · 极光红木屋",
    spotType_en: "AURORA CHASER · Red Rorbuer & Aurora",
    iso: "ISO 1600",
    shutter: "8s",
    aperture: "f/1.8",
    focal: "14mm GM",
    elevation: "15m",
    bortle: "Kp 4-6 极光带",
    bortle_en: "Kp 4-6 Aurora Belt",
    window: "绿光爆发 21:00 - 01:30",
    window_en: "Aurora Activity 21:00 - 01:30",
    tip: "经典红色高脚渔屋作为前景暖调，大光圈广角捕捉在峡湾雪山上空起舞的极光弧。",
    tip_en: "Red rorbuer cabins as warm foreground with wide aperture capturing dancing aurora ribbons."
  },
  {
    image: VERIFIED_LANDSCAPE_LIBRARY.IT_DOLOMITES_PEAKS.url,
    name: "意大利多洛米蒂刀锋山 Seceda",
    name_en: "Seceda Ridgeline & Peaks, Dolomites",
    spotType: "DRAMATIC ALPS · 巨峰光影漫游",
    spotType_en: "DRAMATIC ALPS · Alpine Meadow & Peaks",
    iso: "ISO 100",
    shutter: "1/160s",
    aperture: "f/8.0",
    focal: "70mm F2.8",
    elevation: "2500m",
    bortle: "暮色金辉",
    bortle_en: "Sunset Alpine Glow",
    window: "夕阳金辉 18:30 - 19:15",
    window_en: "Golden Hour 18:30 - 19:15",
    tip: "中长焦压缩高山草甸木屋与直插云霄的白云石刀锋山巨峰空间层次。",
    tip_en: "Telephoto lens compressing alpine meadows against the dramatic Seceda cliff edge."
  },
  {
    image: VERIFIED_LANDSCAPE_LIBRARY.IS_JOKULSARLON_ICE.url,
    name: "冰岛杰古沙龙钻石黑沙滩",
    name_en: "Diamond Beach, Jokulsarlon",
    spotType: "GLACIER SEASCAPE · 远古冰晶慢门",
    spotType_en: "GLACIER SEASCAPE · Glacial Ice on Black Sand",
    iso: "ISO 100",
    shutter: "2s (ND8)",
    aperture: "f/11",
    focal: "24mm GM",
    elevation: "海平面",
    elevation_en: "Sea Level",
    bortle: "冷冽晨光",
    bortle_en: "Crisp Morning Light",
    window: "日出微光 07:00 - 08:30",
    window_en: "Sunrise Twilight 07:00 - 08:30",
    tip: "贴近黑色火山沙滩上剔透的蓝色冰块，慢门雾化大西洋海浪退去时的白色拉丝水花。",
    tip_en: "Close up to crystal ice blocks on black sand with slow shutter smoothing Atlantic waves."
  },
  {
    image: VERIFIED_LANDSCAPE_LIBRARY.CA_BANFF_MORAINE_LAKE.url,
    name: "加拿大班夫梦莲湖十峰山",
    name_en: "Moraine Lake & Ten Peaks, Banff",
    spotType: "GLACIAL OASIS · 绝美翡翠湖泊",
    spotType_en: "GLACIAL OASIS · Turquoise Lake & Peaks",
    iso: "ISO 100",
    shutter: "1/80s",
    aperture: "f/9.0",
    focal: "16-35mm",
    elevation: "1884m",
    bortle: "清晨无风",
    bortle_en: "Calm Dawn Reflections",
    window: "日出晨光 06:00 - 07:15",
    window_en: "Sunrise 06:00 - 07:15",
    tip: "攀上石堆观景台，清晨第一缕晨光洒在十峰山金顶，倒映在不可思议的绿松石色湖面。",
    tip_en: "Climb the Rockpile viewpoint at dawn as first light hits the Ten Peaks over turquoise waters."
  },
  {
    image: VERIFIED_LANDSCAPE_LIBRARY.GR_SANTORINI_OIA.url,
    name: "希腊圣托里尼伊亚蓝顶教堂",
    name_en: "Blue Dome Church, Oia, Santorini",
    spotType: "AEGEAN ROMANCE · 爱琴海蓝顶夕阳",
    spotType_en: "AEGEAN ROMANCE · Blue Domes at Sunset",
    iso: "ISO 100",
    shutter: "1/250s",
    aperture: "f/8.0",
    focal: "28mm F2.0",
    elevation: "120m",
    bortle: "爱琴海夕照",
    bortle_en: "Aegean Sunset",
    window: "日落时刻 19:30 - 20:30",
    window_en: "Sunset 19:30 - 20:30",
    tip: "顺着伊亚悬崖小巷捕捉三重蓝顶教堂与远方火红夕阳沉入爱琴海的永恒瞬间。",
    tip_en: "Walk through Oia cliff alleys framing the three blue domes against fiery Aegean sunset."
  },
  {
    image: VERIFIED_LANDSCAPE_LIBRARY.CN_GUIZHOU_KARST.url,
    name: "中国南方喀斯特峰林晚霞",
    name_en: "South China Karst Peaks & River Sunset",
    spotType: "NATURAL KARST · 喀斯特奇观",
    spotType_en: "NATURAL KARST · Limestone Marvel",
    iso: "ISO 100",
    shutter: "1/160s",
    aperture: "f/8.0",
    focal: "24-70mm GM",
    elevation: "420m",
    bortle: "晚霞水墨",
    bortle_en: "Sunset Ink Wash Painting",
    window: "夕阳晚霞 17:30 - 18:45",
    window_en: "Sunset Glow 17:30 - 18:45",
    tip: "捕捉晚霞与落日余晖映照在孤峰碧水之间的中国传统水墨意境，利用水面慢门倒影增添灵动。",
    tip_en: "Capture sunset glow illuminating dramatic limestone pinnacles and serene water reflection."
  }
];

// 全球灵感画廊：经由语义匹配精选的 8 大热门目的地大片 (全量双语支持)
const GLOBAL_INSPIRATIONS_LIST = [
  {
    tag_zh: "风光自驾",
    tag_en: "Scenic Roadtrip",
    title_zh: "新西兰南岛 7 天自驾与暗夜星空",
    title_en: "NZ South Island 7-Day Astro & Alpine",
    query_zh: "计划新西兰南岛7天自驾之旅，重点特卡波暗夜星空、库克山胡克谷冰川与皇后镇美食，包含专业摄影机位",
    query_en: "Plan a 7-day New Zealand South Island road trip focusing on Tekapo stargazing, Mt Cook hiking, and photography spots",
    img: VERIFIED_LANDSCAPE_LIBRARY.NZ_TEKAPO_NIGHT.url
  },
  {
    tag_zh: "城市人文",
    tag_en: "Urban Culture",
    title_zh: "东京 7 天动漫圣地与米其林漫游",
    title_en: "Tokyo 7-Day Autumn Culture & Cuisine",
    query_zh: "计划东京7天深度游，涵盖浅草古刹、涩谷十字路口夜景、秋叶原动漫与筑地海鲜市场美食",
    query_en: "Plan a 7-day Tokyo trip covering Asakusa, Shibuya crossing, Ghibli museum, and Tsukiji market dining",
    img: VERIFIED_LANDSCAPE_LIBRARY.JP_TOKYO_SHIBUYA.url
  },
  {
    tag_zh: "雪山列车",
    tag_en: "Panoramic Rail",
    title_zh: "瑞士阿尔卑斯 10 天全景列车",
    title_en: "Swiss Alps 10-Day Panoramic Rail Journey",
    query_zh: "瑞士10天黄金列车与冰川快车全景游，游览少女峰、马特洪峰与日内瓦湖",
    query_en: "10-day Swiss Alps scenic rail journey covering Jungfrau, Matterhorn, and Lake Geneva",
    img: VERIFIED_LANDSCAPE_LIBRARY.CH_SWISS_LAUTERBRUNNEN.url
  },
  {
    tag_zh: "极光秘境",
    tag_en: "Aurora Chasing",
    title_zh: "挪威罗弗敦 6 天峡湾极光追猎",
    title_en: "Norway Lofoten 6-Day Fjord Aurora Quest",
    query_zh: "计划挪威罗弗敦群岛6天冬季追光之旅，包含雷纳小镇红色木屋摄影、峡湾雪山巡航与帝王蟹盛宴",
    query_en: "6-day Norway Lofoten winter aurora expedition with Reine fishing cabins and fjord cruises",
    img: VERIFIED_LANDSCAPE_LIBRARY.NO_LOFOTEN_AURORA.url
  },
  {
    tag_zh: "高山徒步",
    tag_en: "Alpine Hike",
    title_zh: "意大利多洛米蒂 8 天徒步自驾",
    title_en: "Italy Dolomites 8-Day Alpine Hiking",
    query_zh: "意大利多洛米蒂山脉8天自驾轻徒步，重点刀锋山Seceda、三峰山与休斯高原高山木屋",
    query_en: "8-day Dolomites road trip and scenic hikes around Seceda and Tre Cime di Lavaredo",
    img: VERIFIED_LANDSCAPE_LIBRARY.IT_DOLOMITES_PEAKS.url
  },
  {
    tag_zh: "古都雅韵",
    tag_en: "Zen Heritage",
    title_zh: "京都奈良 5 天风雅茶道之旅",
    title_en: "Kyoto & Nara 5-Day Cultural & Zen Tour",
    query_zh: "京都奈良5天漫步，探访伏见稻荷大社、岚山竹林、清水寺与奈良公园小鹿互动",
    query_en: "5-day Kyoto and Nara tour with Fushimi Inari, Arashiyama bamboo grove, and traditional tea ceremony",
    img: VERIFIED_LANDSCAPE_LIBRARY.JP_KYOTO_PAGODA.url
  },
  {
    tag_zh: "国家公园",
    tag_en: "National Parks",
    title_zh: "加拿大班夫贾斯珀 7 天自驾",
    title_en: "Canadian Rockies 7-Day Banff & Jasper Roadtrip",
    query_zh: "加拿大阿尔伯塔省7天自驾，深度探索班夫国家公园、路易斯湖、冰原大道与梦莲湖日出机位",
    query_en: "7-day Canadian Rockies road trip covering Banff, Lake Louise, Icefields Parkway, and Moraine Lake",
    img: VERIFIED_LANDSCAPE_LIBRARY.CA_BANFF_MORAINE_LAKE.url
  },
  {
    tag_zh: "海岛度假",
    tag_en: "Island Escape",
    title_zh: "希腊圣托里尼与米克诺斯 6 天",
    title_en: "Greece Santorini & Mykonos 6-Day Escape",
    query_zh: "希腊爱琴海双岛6天度假，打卡伊亚小镇蓝顶教堂日落、白沙滩与悬崖无边泳池酒店",
    query_en: "6-day Greek islands escape in Santorini and Mykonos with Oia sunsets and cliffside resorts",
    img: VERIFIED_LANDSCAPE_LIBRARY.GR_SANTORINI_OIA.url
  }
];

export default function WelcomeLandingView({
  language,
  nextLangLabel,
  onToggleLanguage,
  onStartPlanning,
  onDirectExplore,
  isGenerating,
  generatingSteps
}) {
  const [inputText, setInputText] = useState('');
  const [submittedQuery, setSubmittedQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  
  // 影像机位当前索引与自动播放状态
  const [activePhotoSpotIndex, setActivePhotoSpotIndex] = useState(0);
  const [isVisionAutoPlaying, setIsVisionAutoPlaying] = useState(true);

  // 随机起始大片索引，每次进入页面都是新风景
  const [heroSlideIndex, setHeroSlideIndex] = useState(() => Math.floor(Math.random() * GLOBAL_SCENIC_CAROUSEL.length));
  const inputRef = useRef(null);

  const t = TRANSLATIONS[language]?.welcome || TRANSLATIONS.zh.welcome;

  // 1. 自动无限轮播 Hero 背景大片 (每 7 秒平滑切换，停留时长增加 2 秒)
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroSlideIndex(prev => (prev + 1) % GLOBAL_SCENIC_CAROUSEL.length);
    }, 7000);
    return () => clearInterval(timer);
  }, []);

  // 2. 自动无限轮播影像机位大片 (默认每 7 秒平滑持续轮播)
  useEffect(() => {
    const visionTimer = setInterval(() => {
      setActivePhotoSpotIndex(prev => (prev + 1) % GLOBAL_MASTER_PHOTO_SPOTS.length);
    }, 7000);
    return () => clearInterval(visionTimer);
  }, []);

  // 3. DJI 级滚动锁定视差监听：精准屏幕对齐，进入视口即时跟随放大，到达顶部满屏后文字浮现，双向完全跟随
  useEffect(() => {
    const pinnedStageIds = ['stage-spatial', 'stage-vision', 'stage-knowledge'];
    const stages = pinnedStageIds.map(id => document.getElementById(id)).filter(Boolean);

    let animationFrameId = null;

    const calculateScrollPhases = () => {
      const windowHeight = window.innerHeight;

      stages.forEach(stage => {
        const rect = stage.getBoundingClientRect();
        const totalScrollable = stage.offsetHeight - windowHeight;
        if (totalScrollable <= 0) return;

        let expandP = 0;
        let contentP = 0;

        if (rect.top > 0) {
          // 阶段 1: 当 Section 从屏幕底部滑入视口 (rect.top 从 windowHeight 递减到 0)
          // 图片立即从底部居中小卡片同步跟随放大，到达视口顶部 (rect.top = 0) 时刚好 100% 满屏
          expandP = Math.max(0, Math.min(1, (windowHeight - rect.top) / (windowHeight * 0.95)));
          contentP = 0;
        } else {
          // 阶段 2: 到达顶部吸顶锁定 (rect.top <= 0)
          // 背景保持 100% 满屏锁定，文字与卡片随着继续滚动从下方平滑浮现
          expandP = 1;
          const scrollInsideSticky = -rect.top;
          contentP = Math.max(0, Math.min(1, scrollInsideSticky / (totalScrollable * 0.55)));
        }

        stage.style.setProperty('--expand-p', expandP.toFixed(4));
        stage.style.setProperty('--content-p', contentP.toFixed(4));
      });
    };

    const handleScroll = () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      animationFrameId = requestAnimationFrame(calculateScrollPhases);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    calculateScrollPhases();

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };  }, []);

  // 手动切换 Hero 上一张/下一张
  const handlePrevHeroSlide = () => {
    setHeroSlideIndex(prev => (prev - 1 + GLOBAL_SCENIC_CAROUSEL.length) % GLOBAL_SCENIC_CAROUSEL.length);
  };

  const handleNextHeroSlide = () => {
    setHeroSlideIndex(prev => (prev + 1) % GLOBAL_SCENIC_CAROUSEL.length);
  };

  // 手动切换摄影机位 上一张/下一张
  const handlePrevVisionSpot = () => {
    setActivePhotoSpotIndex(prev => (prev - 1 + GLOBAL_MASTER_PHOTO_SPOTS.length) % GLOBAL_MASTER_PHOTO_SPOTS.length);
  };

  const handleNextVisionSpot = () => {
    setActivePhotoSpotIndex(prev => (prev + 1) % GLOBAL_MASTER_PHOTO_SPOTS.length);
  };

  // 点击偏好标签追加到输入框
  const handleToggleTag = (tagObj) => {
    const isSelected = selectedTags.includes(tagObj.tag);
    let newTags;
    if (isSelected) {
      newTags = selectedTags.filter(t => t !== tagObj.tag);
    } else {
      newTags = [...selectedTags, tagObj.tag];
    }
    setSelectedTags(newTags);

    if (!isSelected && !inputText.includes(tagObj.tag)) {
      const separator = inputText.trim().length > 0 ? (language === 'zh' ? '，' : ', ') : '';
      const tagText = language === 'zh' ? `希望包含${tagObj.tag}` : `Include ${tagObj.tag}`;
      setInputText(prev => `${prev.trim()}${separator}${tagText}`);
    }
  };

  // 点击灵感示例一键载入
  const handleSelectInspiration = (insp) => {
    const q = language === 'zh' ? (insp.query_zh || insp.query) : (insp.query_en || insp.query || insp.query_zh);
    setInputText(q);
    if (inputRef.current) {
      inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      inputRef.current.focus();
    }
  };

  // 提交规划需求
  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    const q = inputText.trim();
    if (!q || isGenerating) return;
    setSubmittedQuery(q);
    onStartPlanning(q);
  };

  // 页面锚点平滑滚动
  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const currentSpot = GLOBAL_MASTER_PHOTO_SPOTS[activePhotoSpotIndex] || GLOBAL_MASTER_PHOTO_SPOTS[0];

  return (
    <div className="fullbleed-welcome-root">
      {/* 顶部高透钛金悬浮导航栏 (100% 满屏贯穿) */}
      <header className="fullbleed-header">
        <div className="fullbleed-nav-inner">
          <div className="fullbleed-logo-group" onClick={() => scrollToSection('stage-hero')}>
            <div className="fullbleed-logo-icon">
              <Compass size={22} color="#10B981" strokeWidth={2.4} />
            </div>
            <div className="fullbleed-brand">
              <span className="fullbleed-brand-name">Roam AI</span>
              <span className="fullbleed-agent-pill">OpenClaw Agent</span>
            </div>
          </div>

          {/* 全局特色锚点导航 */}
          <nav className="fullbleed-nav-links">
            <button onClick={() => scrollToSection('stage-hero')} className="fullbleed-nav-anchor">
              {t.nav.planner}
            </button>
            <button onClick={() => scrollToSection('stage-spatial')} className="fullbleed-nav-anchor">
              {t.nav.spatial}
            </button>
            <button onClick={() => scrollToSection('stage-vision')} className="fullbleed-nav-anchor">
              {t.nav.vision}
            </button>
            <button onClick={() => scrollToSection('stage-knowledge')} className="fullbleed-nav-anchor">
              {t.nav.knowledge}
            </button>
            <button onClick={() => scrollToSection('stage-inspirations')} className="fullbleed-nav-anchor">
              {t.nav.gallery || (language === 'zh' ? '全球画廊' : 'Gallery')}
            </button>
          </nav>

          <div className="fullbleed-header-actions">
            {/* 语言切换 */}
            <button 
              className="fullbleed-lang-btn"
              onClick={onToggleLanguage}
              title={'切换语言 / Switch Language'}
            >
              <Globe size={15} color="#94A3B8" />
              <span>{nextLangLabel}</span>
            </button>

            {/* 进入看板 */}
            <button 
              className="fullbleed-enter-btn"
              onClick={onDirectExplore}
            >
              <span>{t.nav.enterDashboard}</span>
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          STAGE 1: 100vw × 100vh 全屏流媒体 Hero 主屏 (海量 Unsplash 4K 大片无限轮播)
          ========================================================================= */}
      <section id="stage-hero" className="fullbleed-stage hero-stage is-inview">
        {/* 全球大片无限平滑交叉淡入淡出轮播背景 */}
        <div className="stage-curtain-bg">
          <div className="hero-carousel-container">
            {GLOBAL_SCENIC_CAROUSEL.map((bg, idx) => (
              <div 
                key={idx} 
                className={`hero-carousel-slide ${heroSlideIndex === idx ? 'active' : ''}`}
                style={{ backgroundImage: `url(${bg.url})` }}
              >
                <div className="slide-overlay-gradient"></div>
              </div>
            ))}
          </div>
          <div className="hero-vignette"></div>
        </div>

        {/* 左右手动切换大片微控钮 */}
        <button 
          className="hero-carousel-arrow arrow-left"
          onClick={handlePrevHeroSlide}
          title={t.carousel?.prevSlide || (language === 'zh' ? '上一张大片' : 'Previous slide')}
          aria-label="Previous slide"
        >
          <ChevronLeft size={24} />
        </button>
        <button 
          className="hero-carousel-arrow arrow-right"
          onClick={handleNextHeroSlide}
          title={t.carousel?.nextSlide || (language === 'zh' ? '下一张大片' : 'Next slide')}
          aria-label="Next slide"
        >
          <ChevronRight size={24} />
        </button>

        {/* 轮播图地标位置信息 */}
        <div className="hero-slide-meta">
          <div className="hero-slide-desc">
            <MapPin size={13} color="#10B981" />
            <span>
              {language === 'zh'
                ? GLOBAL_SCENIC_CAROUSEL[heroSlideIndex]?.location
                : (GLOBAL_SCENIC_CAROUSEL[heroSlideIndex]?.location_en || GLOBAL_SCENIC_CAROUSEL[heroSlideIndex]?.location)}
            </span>
          </div>
        </div>

        {/* Hero 主体内容 (居中极智指令舱) */}
        <div className="hero-stage-content">
          <div className="hero-badge-capsule">
            <Sparkles size={14} color="#10B981" className="animate-pulse" />
            <span>{t.badge}</span>
          </div>

          <h1 className="hero-giant-title">
            {t.heroTitle}
          </h1>
          <p className="hero-giant-subtitle">
            {t.heroSubtitle}
          </p>

          {/* 悬浮磨砂智能指令舱 */}
          <div className="hero-floating-capsule">
            <form onSubmit={handleSubmit} className="capsule-form">
              {/* 输入框在上 */}
              <div className="capsule-textarea-wrap">
                <textarea
                  ref={inputRef}
                  className="capsule-textarea"
                  rows={3}
                  placeholder={t.inputPlaceholder}
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey || !e.shiftKey)) {
                      e.preventDefault();
                      handleSubmit(e);
                    }
                  }}
                  disabled={isGenerating}
                />
              </div>

              {/* 快捷偏好小框紧随输入框下方，完全居中排列，不显示“标签”二字 */}
              <div className="capsule-chips-centered">
                {t.preferences.map((tagObj, idx) => {
                  const active = selectedTags.includes(tagObj.tag);
                  return (
                    <button
                      key={idx}
                      type="button"
                      className={`capsule-tag-chip ${active ? 'active' : ''}`}
                      onClick={() => handleToggleTag(tagObj)}
                      disabled={isGenerating}
                    >
                      {tagObj.label}
                    </button>
                  );
                })}
              </div>

              {/* 卡片底栏操作区 */}
              <div className="capsule-action-footer">
                <div className="capsule-hint-text">
                  {language === 'zh' ? '💡 支持自由输入全球任意国家、天数、同行偏好与自驾预算' : '💡 Feel free to input any global destination, duration or travel style'}
                </div>

                <button
                  type="submit"
                  className={`capsule-primary-btn ${isGenerating ? 'generating' : ''}`}
                  disabled={!inputText.trim() || isGenerating}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 size={18} className="animate-spin text-white" />
                      <span>{t.generatingBtn}</span>
                    </>
                  ) : (
                    <>
                      <Sparkles size={18} color="#FFFFFF" />
                      <span>{t.generateBtn}</span>
                      <ArrowRight size={16} color="#FFFFFF" />
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>

          {/* 特性胶囊栏 */}
          <div className="hero-telemetry-strip">
            {t.telemetry.map((item, idx) => (
              <div key={idx} className="telemetry-pill">
                <div className="telemetry-live-dot"></div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 向下滚动提示 */}
        <button className="hero-scroll-indicator" onClick={() => scrollToSection('stage-spatial')}>
          <span>EXPLORE FEATURES</span>
          <ChevronDown size={18} className="animate-bounce" />
        </button>
      </section>

      {/* =========================================================================
          STAGE 2: 100vw × 100vh 时空路线推演全屏舞台 (Spatial Routing Stage)
          ========================================================================= */}
      <section id="stage-spatial" className="dji-pinned-stage spatial-stage">
        <div className="dji-sticky-viewport">
          {/* 背景大片：从底部居中小卡片放大至全屏 */}
          <div className="dji-expanding-bg-wrap">
            <div className="dji-expanding-bg-card">
              <div 
                className="stage-fullscreen-bg"
                style={{ backgroundImage: `url('${VERIFIED_LANDSCAPE_LIBRARY.NZ_SOUTHERN_ALPS_HIGHWAY.url}')` }}
              >
                <div className="stage-overlay-darken"></div>
              </div>
            </div>
          </div>

          {/* 内容层：背景全屏后从下方浮现 */}
          <div className="dji-floating-content-layer">
            <div className="stage-headline-block">
              <div className="stage-tag-badge">
                <Navigation size={14} color="#10B981" />
                <span>{t.spatialEngine.badge}</span>
              </div>
              <h2 className="stage-giant-title">{t.spatialEngine.title}</h2>
              <p className="stage-giant-subtitle">{t.spatialEngine.subtitle}</p>
            </div>

            {/* 时空动线推演全景卡片 */}
            <div className="spatial-panoramic-matrix">
              {/* 左侧：动态公路流态与高差剖面 */}
              <div className="spatial-route-viewport">
                <div className="spatial-hud-top">
                  <div className="spatial-live-badge">
                    <Activity size={13} color="#10B981" />
                    <span>SPATIAL ROUTE & TIMELINE FLOW</span>
                  </div>
                  <div className="spatial-route-title">{t.spatialEngine.cardTitle}</div>
                  <div className="spatial-route-sub">{t.spatialEngine.cardDesc}</div>
                </div>

                {/* 拟真动态航点进度条 */}
                <div className="spatial-interactive-timeline">
                  {(t.spatialEngine?.nodes || [
                    { label: "基督城 (起)", sub: "提车补给 0km" },
                    { label: "特卡波湖 (暗夜)", sub: "暗夜银河 225km" },
                    { label: "库克山 (冰川)", sub: "胡克谷步道 330km" },
                    { label: "瓦纳卡 (湖畔)", sub: "孤独之树 510km" },
                    { label: "皇后镇 (终)", sub: "峡湾与离境 650km" }
                  ]).map((node, nIdx, arr) => (
                    <React.Fragment key={nIdx}>
                      <div className={`timeline-node ${nIdx < 3 ? 'active' : ''}`}>
                        <span className={`node-pulse ${nIdx >= 3 ? 'inactive' : ''}`}></span>
                        <span className="node-label">{node.label}</span>
                        <span className="node-sub">{node.sub}</span>
                      </div>
                      {nIdx < arr.length - 1 && (
                        <div className={`timeline-connector ${nIdx < 2 ? 'active' : ''}`}></div>
                      )}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* 右侧：3 大真实数字化指标 */}
              <div className="spatial-metrics-deck">
                {t.spatialEngine.metrics.map((m, idx) => (
                  <div key={idx} className="spatial-deck-card">
                    <div className="deck-num-row">
                      <span className="deck-num">{m.value}</span>
                      <span className="deck-label">{m.label}</span>
                    </div>
                    <div className="deck-desc">{m.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          STAGE 3: 100vw × 100vh Pro 风光摄影机位全屏舞台 (Pro Vision Stage)
          (大片自动轮播 + 靠右下角HUD参数排版，中央视野全透)
          ========================================================================= */}
      <section id="stage-vision" className="dji-pinned-stage vision-stage">
        <div className="dji-sticky-viewport">
          {/* 背景大片：从底部居中小卡片放大至全屏 */}
          <div className="dji-expanding-bg-wrap">
            <div className="dji-expanding-bg-card">
              <div className="vision-carousel-container">
                {GLOBAL_MASTER_PHOTO_SPOTS.map((spot, idx) => (
                  <div 
                    key={idx}
                    className={`vision-carousel-slide ${activePhotoSpotIndex === idx ? 'active' : ''}`}
                    style={{ backgroundImage: `url('${spot.image}')` }}
                  >
                    <div className="stage-overlay-vignette"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 视口全屏相机 HUD 取景器线框与准星 (随 content-p 同步淡入) */}
          <div className="viewport-camera-hud">
            <div className="hud-corner top-left"></div>
            <div className="hud-corner top-right"></div>
            <div className="hud-corner bottom-left"></div>
            <div className="hud-corner bottom-right"></div>
            <div className="hud-grid-line h-1"></div>
            <div className="hud-grid-line h-2"></div>
            <div className="hud-grid-line v-1"></div>
            <div className="hud-grid-line v-2"></div>
            <div className="hud-center-crosshair">
              <Crosshair size={28} color="rgba(239, 68, 68, 0.85)" />
            </div>
          </div>

          {/* 内容浮动主层：顶部标题与右下角 HUD 控制板统一同步浮现 */}
          <div className="dji-floating-content-layer vision-floating-content-layer">
            <div className="stage-headline-block vision-headline-block">
              <div className="stage-tag-badge">
                <Camera size={14} color="#3B82F6" />
                <span>{t.proVision.badge}</span>
              </div>
              <h2 className="stage-giant-title">{t.proVision.title}</h2>
              <p className="stage-giant-subtitle">{t.proVision.subtitle}</p>
            </div>

            {/* 靠右下角停靠的精细相机 HUD 悬浮参数控制板 */}
            <aside className="vision-sidebar-hud-panel">
              <div className="sidebar-hud-header">
                <div className="hud-lens-tag">
                  <Camera size={14} color="#60A5FA" />
                  <span>{language === 'zh' ? currentSpot.spotType : (currentSpot.spotType_en || currentSpot.spotType)}</span>
                </div>
              </div>

              <h3 className="hud-spot-title">{language === 'zh' ? currentSpot.name : (currentSpot.name_en || currentSpot.name)}</h3>

              {/* 镜头与曝光参数矩阵 */}
              <div className="hud-optical-grid-box">
                <div className="opt-grid-item">
                  <span className="opt-label">FOCAL LENS</span>
                  <span className="opt-val">{currentSpot.focal}</span>
                </div>
                <div className="opt-grid-item">
                  <span className="opt-label">APERTURE</span>
                  <span className="opt-val">{currentSpot.aperture}</span>
                </div>
                <div className="opt-grid-item">
                  <span className="opt-label">SHUTTER</span>
                  <span className="opt-val">{currentSpot.shutter}</span>
                </div>
                <div className="opt-grid-item highlight">
                  <span className="opt-label">ISO SPEED</span>
                  <span className="opt-val">{currentSpot.iso}</span>
                </div>
                <div className="opt-grid-item">
                  <span className="opt-label">ELEVATION</span>
                  <span className="opt-val">{language === 'zh' ? currentSpot.elevation : (currentSpot.elevation_en || currentSpot.elevation)}</span>
                </div>
                <div className="opt-grid-item highlight">
                  <span className="opt-label">SKY / LIGHT</span>
                  <span className="opt-val">{language === 'zh' ? currentSpot.bortle : (currentSpot.bortle_en || currentSpot.bortle)}</span>
                </div>
              </div>

              {/* 采光/银河时间窗与构图建议 */}
              <div className="hud-tip-card-inner">
                <div className="tip-window-tag">
                  <Clock size={13} color="#F59E0B" />
                  <span>{language === 'zh' ? currentSpot.window : (currentSpot.window_en || currentSpot.window)}</span>
                </div>
                <div className="tip-text-content">
                  {language === 'zh' ? currentSpot.tip : (currentSpot.tip_en || currentSpot.tip)}
                </div>
              </div>

              {/* 左右手动换机位微钮 */}
              <div className="hud-manual-nav-row">
                <button className="hud-nav-btn" onClick={handlePrevVisionSpot}>
                  <ChevronLeft size={16} />
                  <span>{t.carousel?.prevSpot || (language === 'zh' ? '上一机位' : 'PREV SPOT')}</span>
                </button>
                <div className="hud-spot-counter">
                  {String(activePhotoSpotIndex + 1).padStart(2, '0')} / {String(GLOBAL_MASTER_PHOTO_SPOTS.length).padStart(2, '0')}
                </div>
                <button className="hud-nav-btn" onClick={handleNextVisionSpot}>
                  <span>{t.carousel?.nextSpot || (language === 'zh' ? '下一机位' : 'NEXT SPOT')}</span>
                  <ChevronRight size={16} />
                </button>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* =========================================================================
          STAGE 4: 100vw × 100vh 知识架构全屏舞台 (Architecture Stage)
          ========================================================================= */}
      <section id="stage-knowledge" className="dji-pinned-stage architecture-stage">
        <div className="dji-sticky-viewport">
          {/* 背景大片：从底部居中小卡片放大至全屏 */}
          <div className="dji-expanding-bg-wrap">
            <div className="dji-expanding-bg-card">
              <div className="architecture-grid-bg"></div>
            </div>
          </div>

          {/* 内容层：背景全屏后从下方浮现 */}
          <div className="dji-floating-content-layer">
            <div className="stage-headline-block">
              <div className="stage-tag-badge">
                <Layers size={14} color="#10B981" />
                <span>{t.knowledgeMesh.badge}</span>
              </div>
              <h2 className="stage-giant-title">{t.knowledgeMesh.title}</h2>
              <p className="stage-giant-subtitle">{t.knowledgeMesh.subtitle}</p>
            </div>

            {/* 4 大生动图文科技展示卡片 (2x2 全景矩阵) */}
            <div className="architecture-illustrated-grid">
              {t.knowledgeMesh.layers.map((layer, idx) => (
                <div key={idx} className="architecture-showcase-card">
                  <div 
                    className="showcase-card-visual"
                    style={{ backgroundImage: `url('${layer.image}')` }}
                  >
                    <div className="visual-vignette-overlay"></div>
                    <div className="visual-top-badge">
                      <span className="visual-layer-num">LAYER {layer.num}</span>
                      <div className="visual-live-dot"></div>
                    </div>
                  </div>

                  <div className="showcase-card-body">
                    <div className="card-sub-tag">
                      <ShieldCheck size={13} color="#10B981" />
                      <span>{layer.tag}</span>
                    </div>
                    <h3 className="card-heading-title">{layer.name}</h3>
                    <p className="card-detail-desc">{layer.desc}</p>
                    
                    <div className="card-status-bar">
                      <div className="status-indicator-dot"></div>
                      <span className="status-label">{t.carousel?.readyBadge || (language === 'zh' ? '知识底座就绪 · 智能编排中' : 'KNOWLEDGE BASE · READY')}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          STAGE 5: 100vw × 100vh 全球灵感全景画廊 (8 大精选全球目的地大片矩阵)
          ========================================================================= */}
      <section id="stage-inspirations" className="fullbleed-stage inspirations-stage">
        <div className="stage-content-container z-relative">
          <div className="stage-headline-block">
            <div className="stage-tag-badge">
              <Sparkles size={14} color="#F59E0B" />
              <span>{t.inspirations.badge}</span>
            </div>
            <h2 className="stage-giant-title">{t.inspirations.title}</h2>
            <p className="stage-giant-subtitle">{t.inspirations.subtitle}</p>
          </div>

          {/* 全屏展开式 8 大目的地大片网格 */}
          <div className="inspirations-full-grid">
            {GLOBAL_INSPIRATIONS_LIST.map((item, idx) => {
              const cardTag = language === 'zh' ? (item.tag_zh || item.tag) : (item.tag_en || item.tag);
              const cardTitle = language === 'zh' ? (item.title_zh || item.title) : (item.title_en || item.title);
              const cardDesc = language === 'zh' ? (item.query_zh || item.query) : (item.query_en || item.query);

              return (
                <div 
                  key={idx} 
                  className="inspiration-fullscreen-card"
                  onClick={() => handleSelectInspiration(item)}
                >
                  <div 
                    className="card-bg-layer"
                    style={{ backgroundImage: `url('${item.img}')` }}
                  />
                  <div className="card-gradient-layer"></div>
                  <div className="card-meta-box">
                    <span className="card-tag">{cardTag}</span>
                    <h3 className="card-title">{cardTitle}</h3>
                    <p className="card-desc">{cardDesc}</p>
                    <div className="card-cta-row">
                      <span>{t.carousel?.loadAndPlan || (language === 'zh' ? '一键载入并智能规划' : 'Load & Plan')}</span>
                      <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          STAGE 6: 终极启程行动舞台 (Grand Finale Footer Stage)
          ========================================================================= */}
      <footer className="fullbleed-stage finale-stage">
        <div className="finale-vignette-overlay"></div>

        <div className="finale-content-box">
          <h2 className="finale-title">{t.bottomCta.title}</h2>
          <p className="finale-subtitle">{t.bottomCta.subtitle}</p>
          
          <div className="finale-btn-group">
            <button 
              className="finale-launch-btn"
              onClick={() => {
                if (inputRef.current) {
                  inputRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  inputRef.current.focus();
                }
              }}
            >
              <Sparkles size={18} color="#FFFFFF" />
              <span>{t.bottomCta.startBtn}</span>
              <ArrowRight size={16} color="#FFFFFF" />
            </button>

            <button 
              className="finale-demo-btn"
              onClick={onDirectExplore}
            >
              <span>{t.bottomCta.demoBtn}</span>
            </button>
          </div>
        </div>

        <div className="fullbleed-bottom-credits">
          <span>© 2026 Roam AI Travel Planner · OpenClaw Agent Intelligence</span>
          <span>{language === 'zh' ? '本站风光影像精选自 Unsplash 等高品质开源图库 · 示范路线融合官方指南与知识底座，全球目的地支持 AI 智能定制' : 'Scenic imagery curated via Unsplash · Benchmark routes grounded in verified guides, global destinations powered by AI agent'}</span>
        </div>
      </footer>

      {/* 全新 OpenClaw Agent 全景智能推演转场中心 (Fluid Agent Transition Hub) */}
      <AgentTransitionHub 
        isVisible={isGenerating}
        userQuery={submittedQuery || inputText}
        language={language}
      />
    </div>
  );
}
