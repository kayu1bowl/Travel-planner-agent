import React, { useState } from 'react';
import { 
  CheckCircle2, 
  Circle, 
  Calendar, 
  MapPin, 
  DollarSign, 
  AlertTriangle, 
  ExternalLink, 
  Copy, 
  Check, 
  Car, 
  Hotel, 
  Ticket, 
  ShieldCheck, 
  Compass,
  ArrowRight
} from 'lucide-react';

export default function BookingsFullView({ 
  currentData, 
  language = 'zh', 
  onBackHome 
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  // 默认精选预订待办数据集（根据目的地智能适配）
  const defaultBookings = [
    {
      id: 'b1',
      category: 'transport',
      title: language === 'zh' ? '4WD SUV 高山四驱自驾租车 (含零起赔全险)' : '4WD SUV Rental with Zero-Excess Comprehensive Cover',
      vendor: language === 'zh' ? '基督城机场取车 ➔ 皇后镇机场还车' : 'Pickup: Christchurch Airport ➔ Dropoff: Queenstown',
      urgency: 'high',
      urgencyLabel: language === 'zh' ? '🔥 旺季紧俏 (需提前30天)' : '🔥 High Demand (30 days in advance)',
      price: 'NZD $680 ~ $850',
      status: 'pending',
      tips: language === 'zh' ? '南岛 SH8/SH80 公路偶有暗冰，DOC 官方建议务必选配四驱及防滑雪链。' : '4WD is strongly recommended for South Island alpine passes.'
    },
    {
      id: 'b2',
      category: 'lodging',
      title: language === 'zh' ? '特卡波湖畔星空独栋度假木屋' : 'Lake Tekapo Lakeside Stargazing Chalet',
      vendor: language === 'zh' ? '特卡波湖核心景区 · 步行5分钟至好牧羊人教堂' : 'Lake Tekapo Central · 5-min walk to Church',
      urgency: 'high',
      urgencyLabel: language === 'zh' ? '🔥 极易售罄 (需提前45天)' : '🔥 Fast Selling (45 days in advance)',
      price: 'NZD $280 / 晚',
      status: 'confirmed',
      tips: language === 'zh' ? '国际暗夜保护区核心区，带私人观星天窗与壁炉。' : 'Located inside Dark Sky Reserve with stargazing skylight.'
    },
    {
      id: 'b3',
      category: 'tours',
      title: language === 'zh' ? '约翰山天文台夜间中文深度观星体验团' : 'Mt John Observatory Summit Stargazing Tour',
      vendor: language === 'zh' ? 'Dark Sky Project 官方特许天文向导' : 'Dark Sky Project Official Astro Tour',
      urgency: 'medium',
      urgencyLabel: language === 'zh' ? '⚡ 建议提前20天预约' : '⚡ Book 20 days ahead',
      price: 'NZD $175 / 人',
      status: 'pending',
      tips: language === 'zh' ? '使用 16 英寸高倍率科研望远镜观测麦哲伦星云与南十字星。' : 'Professional research telescopes for southern deep sky objects.'
    },
    {
      id: 'b4',
      category: 'lodging',
      title: language === 'zh' ? '库克山赫米蒂奇雪山全景高级房' : 'The Hermitage Hotel Aoraki Mt Cook',
      vendor: language === 'zh' ? '奥拉基库克山国家公园内唯一高星酒店' : 'Aoraki / Mt Cook National Park Alpine View',
      urgency: 'high',
      urgencyLabel: language === 'zh' ? '🔥 房量极少 (需提前60天)' : '🔥 Limited Availability (60 days ahead)',
      price: 'NZD $420 / 晚',
      status: 'confirmed',
      tips: language === 'zh' ? '直面库克山终年积雪峰顶，晨曦破晓日照金山最佳观赏点。' : 'Direct alpine view of Aoraki peak during sunrise.'
    },
    {
      id: 'b5',
      category: 'tours',
      title: language === 'zh' ? '塔斯曼冰川直升机漫游与高山蓝冰徒步' : 'Tasman Glacier Heli-Hike Experience',
      vendor: language === 'zh' ? 'The Helicopter Line 官方直升机向导' : 'The Helicopter Line Glacial Guides',
      urgency: 'medium',
      urgencyLabel: language === 'zh' ? '⚡ 天气敏感项目 (建议留备选日)' : '⚡ Weather dependent activity',
      price: 'NZD $585 / 人',
      status: 'pending',
      tips: language === 'zh' ? '直升机降落塔斯曼冰川中段，穿戴专业冰爪穿行万年冰洞。' : 'Helicopter scenic flight landing on ancient blue ice caves.'
    },
    {
      id: 'b6',
      category: 'tours',
      title: language === 'zh' ? '米尔福德峡湾自然探索游船 (含特色午餐)' : 'Milford Sound Nature Cruise with Gourmet Lunch',
      vendor: language === 'zh' ? 'RealNZ 峡湾探索号豪华双体船' : 'RealNZ Nature Cruise Vessel',
      urgency: 'medium',
      urgencyLabel: language === 'zh' ? '⚡ 建议提前15天预约' : '⚡ Book 15 days ahead',
      price: 'NZD $149 / 人',
      status: 'pending',
      tips: language === 'zh' ? '驶入斯特林瀑布水雾近距离观赏峡湾海豹与野生海豚。' : 'Cruise under Stirling Falls with fjord wildlife viewing.'
    },
    {
      id: 'b7',
      category: 'permits',
      title: language === 'zh' ? 'DOC 新西兰自然保护部步道与国家公园通行许可' : 'DOC National Park Trail & Conservation Pass',
      vendor: language === 'zh' ? 'Department of Conservation 官方核发' : 'Department of Conservation (DOC)',
      urgency: 'low',
      urgencyLabel: language === 'zh' ? '🟢 行前在线申请即可' : '🟢 Online permit available anytime',
      price: 'NZD $35 / 人',
      status: 'confirmed',
      tips: language === 'zh' ? '进入胡克谷步道与罗伊斯峰步道需遵循无痕山林准则。' : 'Follow Leave No Trace guidelines across all alpine tracks.'
    }
  ];

  const [bookingItems, setBookingItems] = useState(defaultBookings);

  const toggleStatus = (id) => {
    setBookingItems(prev => prev.map(item => {
      if (item.id === id) {
        return {
          ...item,
          status: item.status === 'confirmed' ? 'pending' : 'confirmed'
        };
      }
      return item;
    }));
  };

  const handleCopyTip = (item) => {
    const text = `📋 【预订备忘】${item.title}\n📍 服务方: ${item.vendor}\n💰 预估费用: ${item.price}\n⚠️ 提示: ${item.tips}`;
    navigator.clipboard.writeText(text);
    setCopiedId(item.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredItems = bookingItems.filter(item => {
    if (activeCategory === 'all') return true;
    return item.category === activeCategory;
  });

  const confirmedCount = bookingItems.filter(i => i.status === 'confirmed').length;

  return (
    <div className="bookings-full-view-container">
      {/* 顶部总览卡片 */}
      <div className="bookings-header-card">
        <div className="bookings-header-left">
          <div className="bookings-badge">
            <Ticket size={15} />
            <span>{language === 'zh' ? '旅行预订与履约清单' : 'Bookings & Travel Vouchers'}</span>
          </div>
          <h2 className="bookings-main-title">{currentData.tripTitle}</h2>
          <p className="bookings-subtitle-text">
            {language === 'zh' 
              ? '汇集全程交通租车、雪山湖畔住宿、观星直升机门票与 DOC 官方许可' 
              : 'Consolidated rentals, alpine chalets, tours, and official DOC permits'}
          </p>
        </div>

        <div className="bookings-header-right">
          {/* 预算与履约进度小看板 */}
          <div className="bookings-stats-box">
            <div className="stat-pill">
              <span className="stat-label">{language === 'zh' ? '预估总预算' : 'Est. Budget'}</span>
              <strong className="stat-value">~ NZD $2,450</strong>
            </div>
            <div className="stat-pill">
              <span className="stat-label">{language === 'zh' ? '履约进度' : 'Progress'}</span>
              <strong className="stat-value text-indigo">{confirmedCount} / {bookingItems.length} {language === 'zh' ? '已确认' : 'Done'}</strong>
            </div>
          </div>

          <button className="back-home-btn" onClick={onBackHome}>
            {language === 'zh' ? '返回看板视图' : 'Back to Dashboard'}
          </button>
        </div>
      </div>

      {/* 分类切换药丸 */}
      <div className="bookings-category-pills">
        <button 
          className={`booking-cat-btn ${activeCategory === 'all' ? 'active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          {language === 'zh' ? '全部待办' : 'All Items'} ({bookingItems.length})
        </button>
        <button 
          className={`booking-cat-btn ${activeCategory === 'transport' ? 'active' : ''}`}
          onClick={() => setActiveCategory('transport')}
        >
          <Car size={13} /> {language === 'zh' ? '交通租车' : 'Transport'}
        </button>
        <button 
          className={`booking-cat-btn ${activeCategory === 'lodging' ? 'active' : ''}`}
          onClick={() => setActiveCategory('lodging')}
        >
          <Hotel size={13} /> {language === 'zh' ? '酒店住宿' : 'Lodging'}
        </button>
        <button 
          className={`booking-cat-btn ${activeCategory === 'tours' ? 'active' : ''}`}
          onClick={() => setActiveCategory('tours')}
        >
          <Ticket size={13} /> {language === 'zh' ? '项目门票' : 'Tours & Activities'}
        </button>
        <button 
          className={`booking-cat-btn ${activeCategory === 'permits' ? 'active' : ''}`}
          onClick={() => setActiveCategory('permits')}
        >
          <ShieldCheck size={13} /> {language === 'zh' ? '官方许可' : 'DOC Permits'}
        </button>
      </div>

      {/* 预订卡片列表 */}
      <div className="bookings-items-grid">
        {filteredItems.map((item) => (
          <div key={item.id} className={`booking-item-card ${item.status === 'confirmed' ? 'confirmed' : 'pending'}`}>
            <div className="booking-card-top">
              {/* Checkbox 状态切换 */}
              <button 
                className={`booking-check-btn ${item.status}`} 
                onClick={() => toggleStatus(item.id)}
                title={item.status === 'confirmed' ? (language === 'zh' ? '标记为待预订' : 'Mark as pending') : (language === 'zh' ? '标记为已确认' : 'Mark as confirmed')}
              >
                {item.status === 'confirmed' ? (
                  <CheckCircle2 size={20} color="#10B981" />
                ) : (
                  <Circle size={20} color="#94A3B8" />
                )}
              </button>

              <div className="booking-info-main">
                <div className="booking-title-row">
                  <h3 className="booking-title-text">{item.title}</h3>
                  <span className={`booking-urgency-badge ${item.urgency}`}>
                    {item.urgencyLabel}
                  </span>
                </div>

                <div className="booking-vendor-row">
                  <MapPin size={13} className="vendor-icon" />
                  <span>{item.vendor}</span>
                </div>

                <p className="booking-tips-desc">{item.tips}</p>
              </div>

              {/* 价格与操作栏 */}
              <div className="booking-price-col">
                <div className="price-tag-box">
                  <span className="price-label">{language === 'zh' ? '参考价' : 'Est. Price'}</span>
                  <strong className="price-num">{item.price}</strong>
                </div>

                <button 
                  className="booking-action-btn"
                  onClick={() => handleCopyTip(item)}
                  title={language === 'zh' ? '复制预订备忘' : 'Copy Voucher'}
                >
                  {copiedId === item.id ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                  <span>{copiedId === item.id ? (language === 'zh' ? '已复制' : 'Copied') : (language === 'zh' ? '复制备忘' : 'Copy')}</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
