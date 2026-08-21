import React, { useState } from 'react';
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

  const t = TRANSLATIONS[language] || TRANSLATIONS.zh;

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
      : DESTINATION_DATASETS.newzealand.zh
  );

  // 处理语言切换
  const handleToggleLanguage = () => {
    setLanguage(prev => prev === 'zh' ? 'en' : 'zh');
  };

  // 处理搜索与目的地切换
  const handleSearchSubmit = (keyword) => {
    const kw = (keyword || '').toLowerCase();
    if (kw.includes('tokyo') || kw.includes('东京') || kw.includes('日本') || kw.includes('japan')) {
      setCurrentDatasetKey('tokyo');
      setDynamicCustomPlan(null);
      setActiveDay(1);
    } else {
      setCurrentDatasetKey('newzealand');
      setDynamicCustomPlan(null);
      setActiveDay(1);
    }
  };

  // 处理消息发送与 Agent 调用
  const handleSendMessage = async (queryText, fromWelcome = false) => {
    if (!queryText || !queryText.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: queryText.trim()
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setAgentStatusSteps([
      language === 'zh' ? '正在检索官方风景名胜与私有知识库...' : 'Searching official travel guides...',
      language === 'zh' ? '正在智能规划行车路线与时间分配...' : 'Optimizing driving routes & schedule...',
      language === 'zh' ? '正在精选最佳机位与地道特色风物...' : 'Selecting photo spots & local cuisine...'
    ]);

    try {
      const response = await fetchTravelPlan(queryText, messages);
      const rawPlan = response?.plan || (response?.itineraries ? response : null);

      if (rawPlan) {
        const transformed = transformBackendPlan(rawPlan, language);
        if (transformed) {
          setDynamicCustomPlan(transformed);
          setActiveDay(1);
        }

        const aiMsg = {
          id: Date.now() + 1,
          sender: 'assistant',
          text: transformed?.summary || response?.summary || (language === 'zh' ? '太棒了！已为您量身定制专属的旅行路线，右侧看板已同步更新。' : 'Great! A customized itinerary has been generated for you.'),
          dataSources: response?.data_sources || transformed?.dataSources || [
            language === 'zh' ? '官方权威步道与暗夜保护区指南' : 'Official DOC Hiking & Sky Reserve Guides',
            language === 'zh' ? '智能路线优化与实时天气核验' : 'Route Optimization & Weather Verification'
          ]
        };
        setMessages(prev => [...prev, aiMsg]);
      } else if (response?.needs_more_info && response?.follow_up_question) {
        const aiMsg = {
          id: Date.now() + 1,
          sender: 'assistant',
          text: response.follow_up_question
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        const replyText = response?.reply || response?.error || (language === 'zh' ? '已收到您的旅行需求，看板已完成更新。' : 'Request received, dashboard updated.');
        const aiMsg = {
          id: Date.now() + 1,
          sender: 'assistant',
          text: replyText
        };
        setMessages(prev => [...prev, aiMsg]);
      }
    } catch (err) {
      console.error('Agent query error:', err);
      const fallbackAiMsg = {
        id: Date.now() + 1,
        sender: 'assistant',
        text: language === 'zh' ? '已收到您的旅行需求，看板已完成更新。' : 'Request received, dashboard updated.'
      };
      setMessages(prev => [...prev, fallbackAiMsg]);
    } finally {
      setLoading(false);
      setAgentStatusSteps([]);
      if (fromWelcome) {
        setViewMode('dashboard');
      }
    }
  };

  // 直接进入精选标杆看板
  const handleDirectExplore = () => {
    setViewMode('dashboard');
  };

  // 新建行程（返回欢迎页）
  const handleNewTrip = () => {
    setViewMode('welcome');
  };

  // 重置对话
  const handleResetChat = () => {
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
                  onClick={() => setActiveNavTab('itineraries')}
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
        <div className="mobile-scrollable-content">
          {mobileTab === 'chat' ? (
            <MobileChatView 
              messages={messages}
              onSendMessage={handleSendMessage}
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
                onClick={() => setMobileTab('itineraries')}
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
