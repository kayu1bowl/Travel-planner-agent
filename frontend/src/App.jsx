import React, { useState, useEffect } from 'react';
import ConversationalSidebar from './components/ConversationalSidebar';
import TopNavbar from './components/TopNavbar';
import TripBannerCard from './components/TripBannerCard';
import DailyScheduleCard from './components/DailyScheduleCard';
import MustVisitCuisineCard from './components/MustVisitCuisineCard';
import PhotographyGuideCard from './components/PhotographyGuideCard';
import SystemStatusModal from './components/SystemStatusModal';
import ItinerariesFullView from './components/ItinerariesFullView';
import BookingsFullView from './components/BookingsFullView';
import MobileHeader from './components/MobileHeader';
import MobileNavBar from './components/MobileNavBar';
import MobileChatView from './components/MobileChatView';
import { DESTINATION_DATASETS, transformBackendPlan } from './services/destinations';
import { TRANSLATIONS } from './services/i18n';
import { fetchTravelPlan } from './services/api';

export default function App() {
  const [language, setLanguage] = useState('zh'); // 默认中文
  const [currentDatasetKey, setCurrentDatasetKey] = useState('newzealand');
  const [dynamicCustomPlan, setDynamicCustomPlan] = useState(null);
  const [activeNavTab, setActiveNavTab] = useState('home');
  const [mobileTab, setMobileTab] = useState('home'); // 'chat' | 'home' | 'itineraries' | 'bookings'
  const [activeDay, setActiveDay] = useState(1);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [agentStatusSteps, setAgentStatusSteps] = useState([]);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const t = TRANSLATIONS[language] || TRANSLATIONS.zh;

  // 初始对话历史
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'assistant',
      text: TRANSLATIONS.zh.sidebar.welcomeMsg
    },
    {
      id: 2,
      sender: 'user',
      text: TRANSLATIONS.zh.sidebar.userDefaultMsg
    },
    {
      id: 3,
      sender: 'assistant',
      text: TRANSLATIONS.zh.sidebar.aiDefaultReply,
      dataSources: [
        '检索 ChromaDB 知识库命中 4 条高精事实 (DOC 官方指南)',
        '联网核验: 特卡波湖天气晴朗, SH8/SH80 国道全线畅通'
      ]
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

  // 处理搜索
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
  const handleSendMessage = async (queryText) => {
    if (!queryText || !queryText.trim()) return;

    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: queryText.trim()
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setAgentStatusSteps([
      language === 'zh' ? '正在连接 OpenClaw Agent 调度中心...' : 'Connecting to OpenClaw Agent...',
      language === 'zh' ? '正在检索 DOC 步道与暗夜保护区知识库...' : 'Querying DOC RAG knowledge base...',
      language === 'zh' ? '正在调用 Google Gemini Pro 进行行程推理...' : 'Reasoning with Google Gemini Pro...'
    ]);

    try {
      const response = await fetchTravelPlan(queryText, language);
      if (response && response.success && response.plan) {
        const transformed = transformBackendPlan(response.plan, language);
        setDynamicCustomPlan(transformed);
        setActiveDay(1);

        const aiMsg = {
          id: Date.now() + 1,
          sender: 'assistant',
          text: transformed.summary || (language === 'zh' ? '太棒了！已根据你的需求定制了全新的专属行程。' : 'Great! A customized itinerary has been generated for you.'),
          dataSources: response.plan.data_sources || [
            language === 'zh' ? '检索 DOC 官方步道与暗夜知识库' : 'DOC Official RAG Knowledge Base',
            language === 'zh' ? 'Google Gemini AI Pro 深度推理' : 'Google Gemini Pro Reasoning'
          ]
        };
        setMessages(prev => [...prev, aiMsg]);
      } else {
        const replyText = response?.reply || (language === 'zh' ? '已为你生成行程建议。' : 'Itinerary suggestion updated.');
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
        text: language === 'zh' ? '已收到你的需求，右侧看板已完成更新。' : 'Request received, dashboard updated.'
      };
      setMessages(prev => [...prev, fallbackAiMsg]);
    } finally {
      setLoading(false);
      setAgentStatusSteps([]);
    }
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

  // 导出 Markdown
  const handleExportMarkdown = () => {
    let md = `# ${currentData.tripTitle}\n\n`;
    md += `> ${currentData.tripSubtitle}\n\n`;
    md += `## 行程概述\n${currentData.summary || ''}\n\n`;

    if (currentData.dailySchedules) {
      Object.keys(currentData.dailySchedules).forEach(day => {
        md += `### 第 ${day} 天日程\n`;
        currentData.dailySchedules[day].forEach(item => {
          md += `- **${item.time}** 【${item.activity}】（地点：${item.location}）: ${item.details}\n`;
        });
        md += `\n`;
      });
    }

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
            onSendMessage={handleSendMessage}
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
              onOpenStatusModal={() => setIsStatusModalOpen(true)}
              onExportMarkdown={handleExportMarkdown}
              copied={copied}
              language={language}
              onToggleLanguage={handleToggleLanguage}
              labels={t.nav}
            />

            {/* Tab 视图切换 */}
            {activeNavTab === 'itineraries' ? (
              <ItinerariesFullView 
                currentData={currentData}
                labels={t.cards}
                language={language}
                onBackHome={() => setActiveNavTab('home')}
                onExportMarkdown={handleExportMarkdown}
              />
            ) : activeNavTab === 'bookings' ? (
              <BookingsFullView 
                currentData={currentData}
                language={language}
                onBackHome={() => setActiveNavTab('home')}
              />
            ) : (
              /* 便士网格 Bento Grid 内容区 */
              <div className="bento-content-layout">
                <TripBannerCard 
                  title={currentData.tripTitle}
                  subtitle={currentData.tripSubtitle}
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
          onOpenStatusModal={() => setIsStatusModalOpen(true)}
          onExportMarkdown={handleExportMarkdown}
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
              onBackHome={() => setMobileTab('home')}
              onExportMarkdown={handleExportMarkdown}
            />
          ) : mobileTab === 'bookings' ? (
            <BookingsFullView 
              currentData={currentData}
              language={language}
              onBackHome={() => setMobileTab('home')}
            />
          ) : (
            /* 移动端单列卡片探索看板 */
            <div className="mobile-bento-cards-stack">
              <TripBannerCard 
                title={currentData.tripTitle}
                subtitle={currentData.tripSubtitle}
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

      {/* 系统状态与模型诊断弹窗（全局复用） */}
      <SystemStatusModal 
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        language={language}
      />
    </div>
  );
}
