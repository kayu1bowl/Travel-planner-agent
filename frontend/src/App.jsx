import React, { useState, useEffect, useRef } from 'react';
import WelcomeLandingView from './components/WelcomeLandingView';
import ConversationalSidebar from './components/ConversationalSidebar';
import TopNavbar from './components/TopNavbar';
import TripBannerCard from './components/TripBannerCard';
import DailyScheduleCard from './components/DailyScheduleCard';
import MustVisitCuisineCard from './components/MustVisitCuisineCard';
import PhotographyGuideCard from './components/PhotographyGuideCard';
import ItinerariesFullView from './components/ItinerariesFullView';
import BookingsFullView from './components/BookingsFullView';
import MobileHeader from './components/MobileHeader';
import MobileNavBar from './components/MobileNavBar';
import MobileChatView from './components/MobileChatView';
import { DESTINATION_DATASETS, transformBackendPlan } from './services/destinations';
import { TRANSLATIONS } from './services/i18n';
import { fetchTravelPlan } from './services/api';

export default function App() {
  const [viewMode, setViewMode] = useState('welcome'); // 'welcome' | 'dashboard'
  const [language, setLanguage] = useState('zh'); // 默认中文
  const [currentDatasetKey, setCurrentDatasetKey] = useState('newzealand');
  const [dynamicCustomPlan, setDynamicCustomPlan] = useState(null);
  const [activeNavTab, setActiveNavTab] = useState('home');
  const [mobileTab, setMobileTab] = useState('home'); // 'chat' | 'home' | 'itineraries' | 'bookings'
  const [activeDay, setActiveDay] = useState(1);
  const [loading, setLoading] = useState(false);
  const [agentStatusSteps, setAgentStatusSteps] = useState([]);
  const activeRequestIdRef = useRef(0);

  const t = TRANSLATIONS[language] || TRANSLATIONS.zh;

  // 同步 HTML 根节点的 lang 属性（提升 a11y、翻译与无障碍阅读器兼容性）
  useEffect(() => {
    document.documentElement.lang = language === 'zh' ? 'zh-CN' : 'en';
  }, [language]);

  // 初始对话历史
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: TRANSLATIONS.zh.sidebar.welcomeMsg
    }
  ]);

  // 获取当前生效的数据集
  const currentData = dynamicCustomPlan || (
    DESTINATION_DATASETS[currentDatasetKey] 
      ? (DESTINATION_DATASETS[currentDatasetKey][language] || DESTINATION_DATASETS[currentDatasetKey].zh)
      : (DESTINATION_DATASETS.newzealand[language] || DESTINATION_DATASETS.newzealand.zh)
  );

  // 处理语言切换
  const handleToggleLanguage = () => {
    setLanguage(prev => {
      const nextLang = prev === 'zh' ? 'en' : 'zh';
      setMessages(oldMsgs => {
        if (oldMsgs.length === 1 && oldMsgs[0].sender === 'assistant') {
          return [{
            id: oldMsgs[0].id,
            sender: 'assistant',
            text: TRANSLATIONS[nextLang].sidebar.welcomeMsg
          }];
        }
        return oldMsgs;
      });
      return nextLang;
    });
  };

  // 处理搜索与目的地切换（支持预设切换及任意目的地 AI 定制）
  const handleSearchSubmit = (keyword) => {
    if (!keyword || !keyword.trim()) return;
    const kw = keyword.trim().toLowerCase();
    if (kw.includes('tokyo') || kw.includes('东京') || kw.includes('日本') || kw.includes('japan')) {
      setCurrentDatasetKey('tokyo');
      setDynamicCustomPlan(null);
      setActiveDay(1);
      setActiveNavTab('home');
    } else if (kw.includes('newzealand') || kw.includes('新西兰') || kw.includes('nz') || kw.includes('特卡波') || kw.includes('皇后镇')) {
      setCurrentDatasetKey('newzealand');
      setDynamicCustomPlan(null);
      setActiveDay(1);
      setActiveNavTab('home');
    } else {
      // 任意其他全球目的地，自动触发 AI Agent 智能规划
      setActiveNavTab('home');
      handleSendMessage(language === 'zh' ? `我想规划去${keyword.trim()}的深度旅行，请提供详细定制行程、美食与摄影机位` : `Plan a comprehensive customized travel itinerary for ${keyword.trim()} with cuisine and photo spots`);
    }
  };

  // 处理消息发送与 Agent 调用
  const handleSendMessage = async (queryText, fromWelcome = false) => {
    if (!queryText || !queryText.trim()) return;

    const currentReqId = Date.now();
    activeRequestIdRef.current = currentReqId;

    const userMsg = {
      id: currentReqId,
      sender: 'user',
      text: queryText.trim()
    };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setLoading(true);
    
    // 初始化 OpenClaw 4 阶段 Agent 动态进度
    const multiSteps = language === 'zh' ? [
      '🚀 [1/4] 路线架构 Agent：正在构思宏观骨架与城市跃迁动线...',
      '⏱️ [2/4] 动线精算 Agent：正在深入细化每日时空节奏与交通耗时...',
      '🍜 [3/4] 风物摄影 Agent：正在甄选当地口碑必吃与黄金机位参数...',
      '📸 [4/4] 视觉解析 Agent：正在动态检索全球地标实拍与渲染看板...'
    ] : [
      '🚀 [1/4] Route Architect: Designing macro city route & theme...',
      '⏱️ [2/4] Timeline Detailer: Crafting daily morning/afternoon schedules...',
      '🍜 [3/4] Experience Curator: Scouting authentic delicacies & photo spots...',
      '📸 [4/4] Visual Grounder: Matching global verified photography...'
    ];

    setAgentStatusSteps([multiSteps[0]]);

    const stepTimers = [
      setTimeout(() => {
        if (activeRequestIdRef.current === currentReqId) {
          setAgentStatusSteps([multiSteps[0], multiSteps[1]]);
        }
      }, 2500),
      setTimeout(() => {
        if (activeRequestIdRef.current === currentReqId) {
          setAgentStatusSteps([multiSteps[0], multiSteps[1], multiSteps[2]]);
        }
      }, 5500),
      setTimeout(() => {
        if (activeRequestIdRef.current === currentReqId) {
          setAgentStatusSteps(multiSteps);
        }
      }, 9500)
    ];

    let shouldSwitchToDashboard = fromWelcome;

    try {
      const response = await fetchTravelPlan(queryText, updatedMessages);
      stepTimers.forEach(t => clearTimeout(t));

      if (response?.isCancelled || activeRequestIdRef.current !== currentReqId) {
        return;
      }

      // 1. 优先处理日常对话、功能问询与向导问候 (needs_more_info)
      if (response?.needs_more_info && response?.follow_up_question) {
        const aiMsg = {
          id: Date.now() + 1,
          sender: 'assistant',
          text: response.follow_up_question,
          isGuide: true,
          dataSources: [
            language === 'zh' ? 'Roam AI 智能向导服务' : 'Roam AI Guide Service'
          ]
        };
        setMessages(prev => [...prev, aiMsg]);
        return;
      }

      // 2. 严格校验是否存在有效的结构化行程数据 (杜绝空数组误判)
      const hasItineraries = Array.isArray(response?.itineraries) && response.itineraries.length > 0;
      const hasPlanDaily = Array.isArray(response?.plan?.daily_plan) && response.plan.daily_plan.length > 0;
      const hasPlanItineraries = Array.isArray(response?.plan?.itineraries) && response.plan.itineraries.length > 0;

      const rawPlan = (hasItineraries || hasPlanDaily || hasPlanItineraries) ? (response?.plan || response) : null;

      if (rawPlan) {
        const transformed = transformBackendPlan(rawPlan, language);
        if (transformed) {
          setDynamicCustomPlan(transformed);
          setActiveDay(1);
        }

        const summaryText = typeof transformed?.summary === 'string' && transformed.summary
          ? transformed.summary
          : (typeof response?.summary === 'string' && response.summary
              ? response.summary
              : (language === 'zh' ? '太棒了！已为您量身定制专属的旅行路线，右侧看板已同步更新。' : 'Great! A customized itinerary has been generated for you.'));

        const aiMsg = {
          id: Date.now() + 1,
          sender: 'assistant',
          text: summaryText,
          dataSources: response?.data_sources || transformed?.dataSources || [
            language === 'zh' ? '权威旅游指南与私有知识库' : 'Travel Guides & Knowledge Base',
            language === 'zh' ? '实时路况与气象辅助核验' : 'Route Optimization & Weather Verification'
          ]
        };
        setMessages(prev => [...prev, aiMsg]);
        shouldSwitchToDashboard = true;
      } else {
        const replyText = response?.error || response?.detail || response?.reply || (language === 'zh' ? '未能解析出结构化行程，请告诉我您想去的目的地或游玩天数，我们马上开始规划！' : 'Please provide your travel destination or preferred days to begin planning!');
        const aiMsg = {
          id: Date.now() + 1,
          sender: 'assistant',
          text: replyText
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err) {
      if (activeRequestIdRef.current !== currentReqId) return;
      console.error('Agent query error:', err);
      const errorMsg = language === 'zh'
        ? '⚠️ 未能连接到后端规划服务（端口 8080/8000 离线或响应超时）。请确保后端已启动（如运行 python -m openclaw_agent.api.server 或 python backend/main.py）后重试。'
        : '⚠️ Unable to connect to travel planning backend. Please ensure the backend server is running and try again.';
      const fallbackAiMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: errorMsg
      };
      setMessages(prev => [...prev, fallbackAiMsg]);
      shouldSwitchToDashboard = true;
    } finally {
      if (activeRequestIdRef.current === currentReqId) {
        setLoading(false);
        setAgentStatusSteps([]);
        if (shouldSwitchToDashboard) {
          setViewMode('dashboard');
        }
      }
    }
  };

  // 直接进入精选标杆看板
  const handleDirectExplore = () => {
    setViewMode('dashboard');
  };

  // 新建行程（清空自定义规划并返回欢迎页）
  const handleNewTrip = () => {
    setDynamicCustomPlan(null);
    setActiveDay(1);
    setViewMode('welcome');
  };

  // 重置对话（同步重置当前定制数据至精选基准）
  const handleResetChat = () => {
    setDynamicCustomPlan(null);
    setActiveDay(1);
    setMessages([
      {
        id: Date.now(),
        sender: 'assistant',
        text: t.sidebar.welcomeMsg
      }
    ]);
  };

  // 如果处于欢迎引导模式，优先渲染欢迎页
  if (viewMode === 'welcome') {
    return (
      <WelcomeLandingView 
        language={language}
        onToggleLanguage={handleToggleLanguage}
        onStartPlanning={(q) => handleSendMessage(q, true)}
        onDirectExplore={handleDirectExplore}
        isGenerating={loading}
        generatingSteps={agentStatusSteps}
      />
    );
  }

  return (
    <div className="bento-app-viewport">
      {/* =========================================================================
          1. 桌面端 / 横屏模式布局 (Desktop Landscape View)
          ========================================================================= */}
      <div className="desktop-landscape-view">
        <div className="bento-main-container">
          {/* 左侧：无门槛自然语言交互面板 (Conversational Sidebar) */}
          <ConversationalSidebar 
            messages={messages}
            onSendMessage={(q) => handleSendMessage(q, false)}
            onResetChat={handleResetChat}
            loading={loading}
            agentStatusSteps={agentStatusSteps}
            labels={t.sidebar}
            language={language}
          />

          {/* 右侧主画布：便士网格 (Bento Grid Workspace) */}
          <main className="bento-grid-workspace">
            {/* 顶部导航与搜索栏 */}
            <TopNavbar 
              activeTab={activeNavTab}
              onTabChange={(tab) => setActiveNavTab(tab)}
              onSearchSubmit={handleSearchSubmit}
              language={language}
              onToggleLanguage={handleToggleLanguage}
              onNewTrip={handleNewTrip}
              labels={t.nav}
            />

            {/* Tab 视图切换 */}
            {activeNavTab === 'itineraries' ? (
              <ItinerariesFullView 
                currentData={currentData}
                labels={t.cards}
                language={language}
              />
            ) : activeNavTab === 'bookings' ? (
              <BookingsFullView 
                currentData={currentData}
                language={language}
              />
            ) : (
              /* 便士网格 Bento Grid 内容区 */
              <div className="bento-content-layout">
                <TripBannerCard 
                  title={currentData.tripTitle}
                  subtitle={currentData.tripSubtitle}
                  motto={currentData.motto}
                  onClick={() => setActiveNavTab('itineraries')}
                  labels={t.cards}
                  language={language}
                />

                <div className="bento-middle-row">
                  <DailyScheduleCard 
                    dailySchedules={currentData.dailySchedules}
                    activeDay={activeDay}
                    onSelectDay={(d) => setActiveDay(d)}
                    labels={t.cards}
                    language={language}
                  />

                  <MustVisitCuisineCard 
                    items={currentData.mustVisit}
                    labels={t.cards}
                    language={language}
                  />
                </div>

                <div className="bento-bottom-row">
                  <PhotographyGuideCard 
                    photoGuides={currentData.photoGuides}
                    labels={t.cards}
                    language={language}
                  />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* =========================================================================
          2. 移动端 / 竖屏模式布局 (Mobile Portrait View)
          ========================================================================= */}
      <div className="mobile-portrait-view">
        {/* 顶部紧凑状态栏 */}
        <MobileHeader 
          tripTitle={currentData.tripTitle}
          language={language}
          onToggleLanguage={handleToggleLanguage}
        />

        {/* 移动端中间滚动内容区 */}
        <div className={`mobile-scrollable-content ${mobileTab === 'chat' ? 'chat-mode' : ''}`}>
          {mobileTab === 'chat' ? (
            <MobileChatView 
              messages={messages}
              onSendMessage={handleSendMessage}
              onResetChat={handleResetChat}
              loading={loading}
              agentStatusSteps={agentStatusSteps}
              labels={t.sidebar}
              language={language}
            />
          ) : mobileTab === 'itineraries' ? (
            <ItinerariesFullView 
              currentData={currentData}
              labels={t.cards}
              language={language}
            />
          ) : mobileTab === 'bookings' ? (
            <BookingsFullView 
              currentData={currentData}
              language={language}
            />
          ) : (
            /* 移动端单列卡片探索看板 */
            <div className="mobile-bento-cards-stack">
              <TripBannerCard 
                title={currentData.tripTitle}
                subtitle={currentData.tripSubtitle}
                motto={currentData.motto}
                onClick={() => setMobileTab('itineraries')}
                labels={t.cards}
                language={language}
              />

              <DailyScheduleCard 
                dailySchedules={currentData.dailySchedules}
                activeDay={activeDay}
                onSelectDay={(d) => setActiveDay(d)}
                labels={t.cards}
                language={language}
              />

              <MustVisitCuisineCard 
                items={currentData.mustVisit}
                labels={t.cards}
                language={language}
              />

              <PhotographyGuideCard 
                photoGuides={currentData.photoGuides}
                labels={t.cards}
                language={language}
              />
            </div>
          )}
        </div>

        {/* 底部固定触控导航栏 */}
        <MobileNavBar 
          activeTab={mobileTab}
          onSelectTab={(tab) => setMobileTab(tab)}
          language={language}
        />
      </div>
    </div>
  );
}
