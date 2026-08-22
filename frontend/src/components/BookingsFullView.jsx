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
  currentData = {}, 
  language = 'zh', 
  onBackHome 
}) {
  const [copiedId, setCopiedId] = useState(null);
  const [activeCategory, setActiveCategory] = useState('all');

  // 根据当前目的地标题和数据动态生成预订待办数据集
  const getDestinationBookings = (title = '', data = {}) => {
    const t = String(title).toLowerCase();
    
    if (t.includes('东京') || t.includes('tokyo') || t.includes('日本') || t.includes('japan')) {
      return {
        budget: language === 'zh' ? '~ JPY ¥168,000 (约 ¥8,200 人民币)' : '~ JPY ¥168,000 (~ $1,150 USD)',
        subtitle: language === 'zh' 
          ? '汇集日本交通周游券、东京高空/温泉酒店、涩谷Sky/吉卜力门票与入境申报' 
          : 'Consolidated JR Passes, city hotel bookings, Shibuya Sky tickets, and museum reservations',
        items: [
          {
            id: 'tb1',
            category: 'transport',
            title: language === 'zh' ? 'JR 全日本铁路通票 7 日券 / Suica 西瓜卡' : 'JR Whole Japan Rail Pass 7-Day / Welcome Suica',
            vendor: language === 'zh' ? '成田/羽田机场 JR 服务中心现场兑换' : 'Narita/Haneda Airport JR East Travel Center',
            urgency: 'high',
            urgencyLabel: language === 'zh' ? '📌 建议行前准备' : '📌 Pre-departure Recommended',
            price: 'JPY ¥50,000',
            status: 'confirmed',
            tips: language === 'zh' ? '含新干线与成田特快 N\'EX 畅坐，支持绑定 Apple Wallet 手机刷卡进出站。' : 'Covers Shinkansen bullet trains and N\'EX airport express.'
          },
          {
            id: 'tb2',
            category: 'lodging',
            title: language === 'zh' ? '涩谷/新宿核心商圈高空夜景全景客房' : 'Shibuya / Shinjuku Skyline Panoramic Hotel',
            vendor: language === 'zh' ? '涩谷站直连 · 步行3分钟至十字路口' : 'Direct connection to Shibuya Station',
            urgency: 'high',
            urgencyLabel: language === 'zh' ? '📌 建议提前预订 (约30天)' : '📌 Book Ahead (~30 days)',
            price: 'JPY ¥28,000 / 晚',
            status: 'confirmed',
            tips: language === 'zh' ? '俯瞰涩谷繁华霓虹夜景与东京铁塔远景，下楼即是百货商圈。' : 'Overlooks neon crossing and city towers with direct shopping access.'
          },
          {
            id: 'tb3',
            category: 'tours',
            title: language === 'zh' ? 'Shibuya Sky 涩谷全景露天展望台黄昏场次门票' : 'Shibuya Sky Rooftop Observatory Sunset Ticket',
            vendor: language === 'zh' ? 'Shibuya Scramble Square 官方预约通道' : 'Shibuya Scramble Square Official Ticketing',
            urgency: 'high',
            urgencyLabel: language === 'zh' ? '⚡ 热门时段建议提前预约' : '⚡ Popular Sunset Slot Booking',
            price: 'JPY ¥2,200 / 人',
            status: 'pending',
            tips: language === 'zh' ? '建议预约日落前 40 分钟入场，捕捉黄金日落至赛博霓虹蓝调全景。' : 'Book 40 min before sunset to capture golden hour transitions.'
          },
          {
            id: 'tb4',
            category: 'tours',
            title: language === 'zh' ? '三鹰之森吉卜力美术馆官方实名预约门票' : 'Ghibli Museum Mitaka Official Reserved Ticket',
            vendor: language === 'zh' ? '罗森 Lawson 票务系统 / 官方海外预约' : 'Lawson Ticket / Overseas Official Portal',
            urgency: 'high',
            urgencyLabel: language === 'zh' ? '📌 需关注官方预约开放日' : '📌 Advance Reservation Required',
            price: 'JPY ¥1,000 / 人',
            status: 'pending',
            tips: language === 'zh' ? '现场不设现场售票，入馆需核验护照与实名预约凭证。' : 'No onsite ticket sales. Valid passport required for entry verification.'
          },
          {
            id: 'tb5',
            category: 'lodging',
            title: language === 'zh' ? '镰仓/江之岛海景日式温泉旅馆 (含怀石料理)' : 'Kamakura Enoshima Ocean View Onsen Ryokan',
            vendor: language === 'zh' ? '相模湾沿岸 · 远眺富士山与湘南海岸' : 'Sagami Bay Oceanfront with Mt Fuji Views',
            urgency: 'medium',
            urgencyLabel: language === 'zh' ? '⚡ 建议提前20天预订' : '⚡ Book 20 days ahead',
            price: 'JPY ¥38,000 / 晚',
            status: 'pending',
            tips: language === 'zh' ? '包含主厨精制当季海鲜一泊二食，私汤风吕可观赏江之岛日落。' : 'Includes Kaiseki seasonal dining and private ocean-view onsen.'
          },
          {
            id: 'tb6',
            category: 'permits',
            title: language === 'zh' ? 'Visit Japan Web 电子入境与海关申报' : 'Visit Japan Web Fast-Track Immigration QR',
            vendor: language === 'zh' ? '日本数位厅官方入境检疫系统' : 'Digital Agency of Japan Official',
            urgency: 'low',
            urgencyLabel: language === 'zh' ? '🟢 登机前在线填报即可' : '🟢 Free online pre-registration',
            price: 'FREE / 免费',
            status: 'confirmed',
            tips: language === 'zh' ? '提前填报生成入境与海关 QR Code，免去纸质填表可走快速通道通关。' : 'Generate QR code before departure for fast-track immigration.'
          }
        ]
      };
    }

    if (t.includes('巴黎') || t.includes('paris') || t.includes('法国') || t.includes('france')) {
      return {
        budget: language === 'zh' ? '~ EUR €1,950 (约 ¥15,200 人民币)' : '~ EUR €1,950 (~ $2,100 USD)',
        subtitle: language === 'zh'
          ? '汇集巴黎博物馆通票、卢浮宫实名预约、塞纳河游船、玛黑区精品酒店与申根旅行险'
          : 'Consolidated Paris Museum Pass, Louvre reservations, Seine cruise, and hotel bookings',
        items: [
          {
            id: 'pb1',
            category: 'tours',
            title: language === 'zh' ? '巴黎博物馆通票 Paris Museum Pass (4日通票) + 卢浮宫实名预约' : 'Paris Museum Pass 4-Day with Louvre Reservation',
            vendor: language === 'zh' ? 'Paris Museum Pass 官方 + 卢浮宫预约系统' : 'Official Paris Museum Pass & Louvre Portal',
            urgency: 'high',
            urgencyLabel: language === 'zh' ? '📌 需提前 15-30 天预约' : '📌 Book 15-30 Days Ahead',
            price: 'EUR €70 / 人',
            status: 'confirmed',
            tips: language === 'zh' ? '含卢浮宫、奥赛博物馆、橘园、凯旋门登顶与凡尔赛宫免排队门票。' : 'Includes Louvre, Orsay, Orangerie, Arc de Triomphe, and Versailles.'
          },
          {
            id: 'pb2',
            category: 'lodging',
            title: language === 'zh' ? '塞纳河左岸 / 玛黑区法式复古精品酒店' : 'Left Bank / Le Marais Boutique Hotel',
            vendor: language === 'zh' ? '圣日耳曼核心区 · 步行可达卢浮宫与巴黎圣母院' : 'Saint-Germain Central Location',
            urgency: 'high',
            urgencyLabel: language === 'zh' ? '📌 建议提前预订 (约30天)' : '📌 Book Ahead (~30 days)',
            price: 'EUR €210 / 晚',
            status: 'confirmed',
            tips: language === 'zh' ? '法式阳台客房可俯瞰巴黎经典屋顶街景，下楼即是咖啡馆。' : 'Classic Parisian balcony overlooking streetscape.'
          },
          {
            id: 'pb3',
            category: 'transport',
            title: language === 'zh' ? '巴黎地铁 Navigo Easy 周卡 / RER 机场与凡尔赛联票' : 'Paris Metro Navigo Pass & RER Combo',
            vendor: language === 'zh' ? '戴高乐机场 RATP 服务中心' : 'CDG Airport RATP Service Center',
            urgency: 'high',
            urgencyLabel: language === 'zh' ? '📌 抵法现场或线上充值' : '📌 Airport Pickup or Mobile App',
            price: 'EUR €35 / 人',
            status: 'confirmed',
            tips: language === 'zh' ? '无限次搭乘 1-5 区地铁、轻轨、RER 郊铁前往凡尔赛宫与机场。' : 'Unlimited travel zones 1-5 including Versailles and airports.'
          },
          {
            id: 'pb4',
            category: 'tours',
            title: language === 'zh' ? '塞纳河日落游船巡礼 (含香槟/法式轻食)' : 'Seine River Sunset Cruise with Champagne',
            vendor: language === 'zh' ? 'Bateaux Parisiens 夏乐宫码头登船' : 'Bateaux Parisiens Eiffel Tower Pier',
            urgency: 'medium',
            urgencyLabel: language === 'zh' ? '⚡ 建议预约黄昏场次' : '⚡ Sunset Slot Recommended',
            price: 'EUR €25 / 人',
            status: 'pending',
            tips: language === 'zh' ? '推荐 18:30-19:30 登船，恰好观赏埃菲尔铁塔整点闪灯与夕阳塞纳河。' : 'Board at dusk to catch Eiffel Tower hourly sparkle.'
          }
        ]
      };
    }

    if (t.includes('冰岛') || t.includes('iceland') || t.includes('极光') || t.includes('雷克雅未克')) {
      return {
        budget: language === 'zh' ? '~ ISK 360,000 (约 ¥18,500 人民币)' : '~ ISK 360,000 (~ $2,600 USD)',
        subtitle: language === 'zh'
          ? '汇集冰岛四驱越野租车、蓝湖地热温泉、卡特拉蓝冰洞探秘与极光木屋'
          : 'Consolidated 4x4 rentals, Blue Lagoon spa, Katla ice cave tours, and aurora cabins',
        items: [
          {
            id: 'ib1',
            category: 'transport',
            title: language === 'zh' ? '4WD 越野 SUV 租车 (含碎石险、防沙暴险与零起赔全险)' : '4x4 SUV Rental with Gravel, Sand & Ash Cover',
            vendor: language === 'zh' ? '凯夫拉维克机场取还车' : 'Keflavik International Airport',
            urgency: 'high',
            urgencyLabel: language === 'zh' ? '📌 冰岛自驾必备' : '📌 Essential for Iceland Ring Road',
            price: 'ISK 110,000',
            status: 'confirmed',
            tips: language === 'zh' ? '非夏季天气多变，必须租用 4WD 四驱车型并购买沙尘碎石险。' : '4WD is mandatory for winter driving and gravel roads.'
          },
          {
            id: 'ib2',
            category: 'tours',
            title: language === 'zh' ? '蓝湖地热温泉 (Blue Lagoon) Comfort 舒适门票套餐' : 'Blue Lagoon Geothermal Spa Comfort Package',
            vendor: language === 'zh' ? 'Blue Lagoon Iceland 官方预约通道' : 'Blue Lagoon Official Portal',
            urgency: 'high',
            urgencyLabel: language === 'zh' ? '📌 需提前 30 天实名抢订' : '📌 High Demand, Book 30 Days Ahead',
            price: 'ISK 14,900 / 人',
            status: 'confirmed',
            tips: language === 'zh' ? '含硅泥面膜护理、饮品一杯与毛巾，建议安排在抵离机场当天。' : 'Includes silica mud mask, drink, and towel.'
          },
          {
            id: 'ib3',
            category: 'tours',
            title: language === 'zh' ? '卡特拉火山天然蓝冰洞超级吉普探险' : 'Katla Ice Cave Super Jeep Guided Tour',
            vendor: language === 'zh' ? '维克小镇集结 · 认证专业高山向导' : 'Vik Town Base · Certified Glacier Guides',
            urgency: 'medium',
            urgencyLabel: language === 'zh' ? '⚡ 需持证向导带领' : '⚡ Guided Glacier Tour Only',
            price: 'ISK 24,000 / 人',
            status: 'pending',
            tips: language === 'zh' ? '提供专业头盔与防滑冰爪，乘大脚超级吉普车深入火山黑冰与蓝冰腹地。' : 'Includes crampons and helmets with super jeep transit.'
          },
          {
            id: 'ib4',
            category: 'lodging',
            title: language === 'zh' ? '维克 / 杰古沙龙原野全景极光玻璃木屋' : 'Vik / Glacier Lagoon Aurora View Chalet',
            vendor: language === 'zh' ? '大西洋沿岸无光害原野' : 'Dark Sky Coastal Wilderness Location',
            urgency: 'high',
            urgencyLabel: language === 'zh' ? '📌 极光季热门房型' : '📌 Peak Aurora Season Demand',
            price: 'ISK 38,000 / 晚',
            status: 'confirmed',
            tips: language === 'zh' ? '远离城镇灯光干扰，客房配备极光唤醒服务与全景大玻璃窗。' : 'Zero light pollution with automated aurora wake-up alarm.'
          }
        ]
      };
    }

    if (t.includes('新疆') || t.includes('赛里木湖') || t.includes('伊犁') || t.includes('喀纳斯') || t.includes('禾木')) {
      return {
        budget: language === 'zh' ? '~ ¥7,800 - ¥11,000 人民币/人' : '~ $1,100 - $1,600 USD / person',
        subtitle: language === 'zh'
          ? '汇集新疆自驾四驱越野、赛里木湖自驾通行票、禾木图瓦木屋与喀纳斯景区票'
          : 'Consolidated Xinjiang 4WD rentals, Sayram Lake vehicle passes, and Hemu cabins',
        items: [
          {
            id: 'xb1',
            category: 'transport',
            title: language === 'zh' ? '硬派四驱 SUV 自驾租车 (乌鲁木齐/伊宁机场取还)' : 'Rugged 4WD SUV Rental for Xinjiang Passes',
            vendor: language === 'zh' ? '乌鲁木齐地窝堡机场取车' : 'Urumqi Airport Pickup',
            urgency: 'high',
            urgencyLabel: language === 'zh' ? '📌 独库/高山路况推荐' : '📌 Recommended for Mountain Passes',
            price: '¥480 / 天',
            status: 'confirmed',
            tips: language === 'zh' ? '适应独库公路与喀纳斯盘山公路，建议选配双向行车记录仪与全险。' : 'Suitable for Duku Highway and mountain curves.'
          },
          {
            id: 'xb2',
            category: 'tours',
            title: language === 'zh' ? '赛里木湖景区自驾车入园通行证 + 门票' : 'Sayram Lake Self-Drive Vehicle Pass & Entry',
            vendor: language === 'zh' ? '赛里木湖官方微信实名预约' : 'Sayram Lake Official Reservation',
            urgency: 'high',
            urgencyLabel: language === 'zh' ? '📌 旺季自驾配额有限' : '📌 Limited Self-Drive Quota',
            price: '¥145 / 车+人',
            status: 'confirmed',
            tips: language === 'zh' ? '持有自驾通行证可随车环湖 90 公里，自由停靠雪山天鹅观景点。' : 'Allows full 90km perimeter scenic lake loop.'
          },
          {
            id: 'xb3',
            category: 'lodging',
            title: language === 'zh' ? '禾木村老村观景百年图瓦传统原木木屋' : 'Hemu Old Village Traditional Tuva Wooden Cabin',
            vendor: language === 'zh' ? '禾木河畔 · 步行10分钟至哈登观景台' : 'Hemu Riverside near Hadeng Platform',
            urgency: 'high',
            urgencyLabel: language === 'zh' ? '📌 旺季需提前 20 天预订' : '📌 Book 20 Days Ahead in Peak Season',
            price: '¥780 / 晚',
            status: 'confirmed',
            tips: language === 'zh' ? '清晨出门即享炊烟晨雾，夜间推窗即是壮丽璀璨银河。' : 'Direct sunrise mist view and starry night sky.'
          }
        ]
      };
    }

    if (t.includes('云南') || t.includes('大理') || t.includes('丽江') || t.includes('洱海') || t.includes('香格里拉')) {
      return {
        budget: language === 'zh' ? '~ ¥5,500 - ¥8,000 人民币/人' : '~ $800 - $1,200 USD / person',
        subtitle: language === 'zh'
          ? '汇集大理洱海海景客栈、玉龙雪山冰川大索道实名票、丽江古城庭院与高品质接送'
          : 'Consolidated Erhai boutique inns, Jade Dragon Snow Mountain cableway, and Lijiang courtyard stays',
        items: [
          {
            id: 'yb1',
            category: 'tours',
            title: language === 'zh' ? '玉龙雪山冰川公园大索道 (4680m) + 蓝月谷景区联票' : 'Jade Dragon Snow Mountain Cableway (4680m) & Blue Moon Valley',
            vendor: language === 'zh' ? '丽江玉龙雪山官方实名抢票通道' : 'Jade Dragon Official Timed Entry',
            urgency: 'high',
            urgencyLabel: language === 'zh' ? '⚡ 需提前一天 20:00 抢票' : '⚡ High Demand Daily Quota',
            price: '¥140 / 人',
            status: 'confirmed',
            tips: language === 'zh' ? '包含海拔 4506 米至 4680 米冰川公园索道往返，登顶请自备便携氧气瓶。' : 'Includes Glacier Cableway transit. Carry oxygen canisters.'
          },
          {
            id: 'yb2',
            category: 'lodging',
            title: language === 'zh' ? '大理洱海海西 S 弯一线海景生态度假美宿' : 'Dali Erhai Lakefront Panoramic Boutique Inn',
            vendor: language === 'zh' ? '磻溪村 S 弯核心区 · 露台直面苍山洱海' : 'Panxi S-Curve Lakefront Location',
            urgency: 'high',
            urgencyLabel: language === 'zh' ? '📌 建议提前 15 天预订' : '📌 Book 15 Days Ahead',
            price: '¥650 / 晚',
            status: 'confirmed',
            tips: language === 'zh' ? '下楼即是生态廊道，清晨可在客房露台欣赏洱海日出与红嘴鸥。' : 'Direct access to eco-trail with sunrise view over lake.'
          }
        ]
      };
    }

    if (t.includes('四川') || t.includes('九寨沟') || t.includes('成都') || t.includes('都江堰') || t.includes('黄龙')) {
      return {
        budget: language === 'zh' ? '~ ¥5,000 - ¥7,500 人民币/人' : '~ $750 - $1,100 USD / person',
        subtitle: language === 'zh'
          ? '汇集成都大熊猫基地门票、九寨沟风景名胜区套票、川青高铁票与特色温泉酒店'
          : 'Consolidated Chengdu Panda Base, Jiuzhaigou National Park passes, and high-speed rail tickets',
        items: [
          {
            id: 'sc1',
            category: 'tours',
            title: language === 'zh' ? '九寨沟国家级自然保护区门票 + 观光车票 (全日票)' : 'Jiuzhaigou National Park Entry & Sightseeing Bus Pass',
            vendor: language === 'zh' ? '阿坝旅游网官方实名预约平台' : 'Aba Tourism Official Ticketing Platform',
            urgency: 'high',
            urgencyLabel: language === 'zh' ? '📌 旺季每日限流建议提早订' : '📌 Peak Season Timed Quota',
            price: '¥280 / 人',
            status: 'confirmed',
            tips: language === 'zh' ? '实名制刷二代身份证直接入园，建议早上 07:30 开园即入园。' : 'Direct ID/Passport entry at gates. Arrive 07:30.'
          },
          {
            id: 'sc2',
            category: 'tours',
            title: language === 'zh' ? '成都大熊猫繁育研究基地上午场门票' : 'Chengdu Giant Panda Breeding Base Morning Ticket',
            vendor: language === 'zh' ? '成都大熊猫繁育研究基地官方平台' : 'Chengdu Panda Base Official',
            urgency: 'medium',
            urgencyLabel: language === 'zh' ? '⚡ 建议预订 07:30-12:00 场次' : '⚡ Morning Slot Recommended',
            price: '¥55 / 人',
            status: 'confirmed',
            tips: language === 'zh' ? '上午大熊猫在户外吃竹子活动最活跃，正午多数进室内睡觉。' : 'Pandas are most active feeding in the morning.'
          }
        ]
      };
    }

    if (t.includes('新西兰') || t.includes('zealand') || t.includes('特卡波') || t.includes('皇后镇') || t.includes('基督城')) {
      return {
        budget: language === 'zh' ? '~ NZD $2,450 (约 ¥10,800 人民币)' : '~ NZD $2,450 (~ $1,500 USD)',
        subtitle: language === 'zh' 
          ? '汇集全程交通租车、雪山湖畔住宿、观星直升机项目与 DOC 官方许可' 
          : 'Consolidated rentals, alpine chalets, tours, and official DOC permits',
        items: [
          {
            id: 'b1',
            category: 'transport',
            title: language === 'zh' ? '4WD SUV 高山四驱自驾租车 (含零起赔全险)' : '4WD SUV Rental with Zero-Excess Comprehensive Cover',
            vendor: language === 'zh' ? '基督城机场取车 ➔ 皇后镇机场还车' : 'Pickup: Christchurch Airport ➔ Dropoff: Queenstown',
            urgency: 'high',
            urgencyLabel: language === 'zh' ? '📌 旺季建议提早预订' : '📌 High Demand (~30 days ahead)',
            price: 'NZD $720',
            status: 'pending',
            tips: language === 'zh' ? '南岛 SH8/SH80 公路偶有暗冰，DOC 官方建议务必选配四驱及防滑雪链。' : '4WD is strongly recommended for South Island alpine passes.'
          },
          {
            id: 'b2',
            category: 'lodging',
            title: language === 'zh' ? '特卡波湖畔星空独栋度假木屋' : 'Lake Tekapo Lakeside Stargazing Chalet',
            vendor: language === 'zh' ? '特卡波湖核心景区 · 步行5分钟至好牧羊人教堂' : 'Lake Tekapo Central · 5-min walk to Church',
            urgency: 'high',
            urgencyLabel: language === 'zh' ? '📌 建议提前预订 (约45天)' : '📌 Advance Booking (~45 days ahead)',
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
            urgencyLabel: language === 'zh' ? '📌 建议提早规划 (约60天)' : '📌 Advance Planning (~60 days ahead)',
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
        ]
      };
    }

    // 针对任意 AI 定制目的地（冰岛/挪威/贵州/加拿大/巴黎等）的自适应动态预订推演
    const cleanDest = title.replace(/[🇳🇿🗼🧭⛰️🇫🇷🇨🇭🇮🇸🇳🇴🇨🇦\s]/g, '').slice(0, 10) || (language === 'zh' ? '目的地' : 'Destination');
    return {
      budget: language === 'zh' ? '~ 约 ¥12,000 - ¥18,000 人民币/人' : '~ $1,800 - $2,500 USD / person',
      subtitle: language === 'zh'
        ? `基于 AI 定制行程生成的【${cleanDest}】全程交通租车、景观住宿、核心门票与出行凭证清单`
        : `Consolidated rentals, boutique accommodations, top activities, and travel permits for ${cleanDest}`,
      items: [
        {
          id: 'custom_b1',
          category: 'transport',
          title: language === 'zh' ? `${cleanDest} 当地自驾租车 / 专属包车服务` : `${cleanDest} Vehicle Rental / Transit Pass`,
          vendor: language === 'zh' ? '目的地机场取还车 · 建议含全险' : 'Airport Pickup & Dropoff with full insurance',
          urgency: 'high',
          urgencyLabel: language === 'zh' ? '📌 建议提前预订' : '📌 Advance Booking',
          price: language === 'zh' ? '约 ¥450 / 天' : '~ $65 / day',
          status: 'confirmed',
          tips: language === 'zh' ? '请准备国际驾照翻译件及全额保障车险，提前查询当地路况。' : 'Ensure valid driver license translation and check route conditions.'
        },
        {
          id: 'custom_b2',
          category: 'lodging',
          title: language === 'zh' ? `${cleanDest} 核心景区/市中心景观特色酒店` : `${cleanDest} Scenic Boutique Hotel / Resort`,
          vendor: language === 'zh' ? '黄金地段 · 步行便捷至打卡节点' : 'Prime Location with sightseeing access',
          urgency: 'high',
          urgencyLabel: language === 'zh' ? '📌 建议提前预订 (约30天)' : '📌 Book Ahead (~30 days)',
          price: language === 'zh' ? '约 ¥680 / 晚' : '~ $110 / night',
          status: 'confirmed',
          tips: language === 'zh' ? '精选高评分景观房，支持免费取消，方便根据天气调整。' : 'Selected scenic room with flexible cancellation.'
        },
        {
          id: 'custom_b3',
          category: 'tours',
          title: language === 'zh' ? `${cleanDest} 核心地标门票 / 深度体验向导预约` : `${cleanDest} Hallmark Landmark Ticket & Tour`,
          vendor: language === 'zh' ? '官方预约通道 / 景区快速通道' : 'Official Ticketing & Fast Track Pass',
          urgency: 'medium',
          urgencyLabel: language === 'zh' ? '⚡ 热门项目需预约' : '⚡ Timed Entry Reservation',
          price: language === 'zh' ? '约 ¥220 / 人' : '~ $35 / person',
          status: 'pending',
          tips: language === 'zh' ? '提前预约特定黄金时段或夕阳场次，避开高峰人流排队。' : 'Book golden hour slots to avoid peak crowd lines.'
        },
        {
          id: 'custom_b4',
          category: 'permits',
          title: language === 'zh' ? '目的地签证/入境许可与境外紧急医疗旅行险' : 'Travel Visa, Entry Declaration & Medical Insurance',
          vendor: language === 'zh' ? '官方领事在线系统 / 知名保险机构' : 'Official Immigration Portal & Allianz',
          urgency: 'high',
          urgencyLabel: language === 'zh' ? '📌 行前必备凭证' : '📌 Required Document',
          price: language === 'zh' ? '约 ¥350 / 人' : '~ $50 / person',
          status: 'confirmed',
          tips: language === 'zh' ? '请核验护照有效期大于6个月，并备存电子与纸质凭单。' : 'Ensure passport validity >6 months and carry printed backup copies.'
        }
      ]
    };
  };

  const bookingConfig = getDestinationBookings(currentData.tripTitle || '', currentData);
  const [bookingItems, setBookingItems] = useState(bookingConfig.items);

  // 当外部数据集或标题切换时，同步更新预订清单项
  React.useEffect(() => {
    const nextConfig = getDestinationBookings(currentData.tripTitle || '', currentData);
    setBookingItems(nextConfig.items);
  }, [currentData.tripTitle, language]);

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
    const text = language === 'zh'
      ? `📋 【预订备忘】${item.title}\n📍 服务方: ${item.vendor}\n💰 预估费用: ${item.price}\n⚠️ 提示: ${item.tips}`
      : `📋 [Booking Checklist] ${item.title}\n📍 Vendor: ${item.vendor}\n💰 Est. Cost: ${item.price}\n⚠️ Tips: ${item.tips}`;
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
            <span>{language === 'zh' ? '旅行出行与预订备忘清单' : 'Travel Bookings & Checklist'}</span>
          </div>
          <h2 className="bookings-main-title">{currentData.tripTitle}</h2>
          <p className="bookings-subtitle-text">
            {bookingConfig.subtitle}
          </p>
        </div>

        <div className="bookings-header-right">
          {/* 预算与准备进度小看板 */}
          <div className="bookings-stats-box">
            <div className="stat-pill">
              <span className="stat-label">{language === 'zh' ? '预估总预算' : 'Est. Budget'}</span>
              <strong className="stat-value">{bookingConfig.budget}</strong>
            </div>
            <div className="stat-pill">
              <span className="stat-label">{language === 'zh' ? '准备进度' : 'Checklist'}</span>
              <strong className="stat-value text-indigo">{confirmedCount} / {bookingItems.length} {language === 'zh' ? '项已就绪' : 'Ready'}</strong>
            </div>
          </div>
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
                title={item.status === 'confirmed' ? (language === 'zh' ? '标记为未勾选' : 'Mark as pending') : (language === 'zh' ? '标记为已就绪' : 'Mark as ready')}
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
                  <span className="price-label">{language === 'zh' ? '预估参考' : 'Est. Price'}</span>
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
