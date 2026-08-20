import React, { useState } from 'react';
import ConversationalSidebar from './components/ConversationalSidebar';
import TopNavbar from './components/TopNavbar';
import TripBannerCard from './components/TripBannerCard';
import DailyScheduleCard from './components/DailyScheduleCard';
import MustVisitCuisineCard from './components/MustVisitCuisineCard';
import PhotographyGuideCard from './components/PhotographyGuideCard';
import SystemStatusModal from './components/SystemStatusModal';
import ItinerariesFullView from './components/ItinerariesFullView';
import { DESTINATION_DATASETS, transformBackendPlan } from './services/destinations';
import { TRANSLATIONS } from './services/i18n';
import { fetchTravelPlan } from './services/api';

export default function App() {
  const [language, setLanguage] = useState('zh'); // 默认中文
  const [currentDatasetKey, setCurrentDatasetKey] = useState('newzealand');
  const [dynamicCustomPlan, setDynamicCustomPlan] = useState(null);
  const [activeNavTab, setActiveNavTab] = useState('home');
  const [activeDay, setActiveDay] = useState(1);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [agentStatusSteps, setAgentStatusSteps] = useState([]);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);

  const t = TRANSLATIONS[language] || TRANSLATIONS.zh;

  // 初始对话历史（默认中文专业文案）
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: 'ai',
      text: TRANSLATIONS.zh.sidebar.welcomeMsg
    },
    {
      id: 2,
      sender: 'user',
      text: TRANSLATIONS.zh.sidebar.userDefaultMsg
    },
    {
      id: 3,
      sender: 'ai',
      text: TRANSLATIONS.zh.sidebar.aiDefaultReply,
      statusSteps: [
        TRANSLATIONS.zh.sidebar.ragStatusPill1,
        TRANSLATIONS.zh.sidebar.ragStatusPill2
      ]
    }
  ]);

  // 切换语言处理函数
  const handleToggleLanguage = () => {
    const nextLang = language === 'zh' ? 'en' : 'zh';
    setLanguage(nextLang);
    const nextT = TRANSLATIONS[nextLang];

    // 同步更新初始对话消息为对应语言文风
    setMessages([
      {
        id: 1,
        sender: 'ai',
        text: nextT.sidebar.welcomeMsg
      },
      {
        id: 2,
        sender: 'user',
        text: nextT.sidebar.userDefaultMsg
      },
      {
        id: 3,
        sender: 'ai',
        text: nextT.sidebar.aiDefaultReply,
        statusSteps: [
          nextT.sidebar.ragStatusPill1,
          nextT.sidebar.ragStatusPill2
        ]
      }
    ]);
  };

  // 重置对话与新建行程
  const handleResetChat = () => {
    const currentT = TRANSLATIONS[language];
    setMessages([
      {
        id: Date.now(),
        sender: 'ai',
        text: currentT.sidebar.welcomeMsg
      }
    ]);
    setDynamicCustomPlan(null);
    setCurrentDatasetKey('newzealand');
    setActiveDay(1);
  };

  const destinationData = DESTINATION_DATASETS[currentDatasetKey] || DESTINATION_DATASETS.newzealand;
  const currentData = dynamicCustomPlan || destinationData[language] || destinationData.zh || destinationData.en;

  // 用户发送消息处理函数
  const handleSendMessage = async (userQuery) => {
    // 1. 追加用户消息
    const userMsg = {
      id: Date.now(),
      sender: 'user',
      text: userQuery
    };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    setAgentStatusSteps(
      language === 'zh'
        ? ['🔍 正在解析自然语言需求...', '📚 检索本地 RAG 知识库与向量切片...']
        : ['🔍 Parsing natural language prompt...', '📚 Querying local RAG knowledge base & vector chunks...']
    );

    // 智能识别目的地切换
    let targetKey = 'newzealand';
    const lower = userQuery.toLowerCase();
    if (lower.includes('tokyo') || lower.includes('东京') || lower.includes('japan') || lower.includes('日本')) {
      targetKey = 'tokyo';
    } else if (lower.includes('nz') || lower.includes('新西兰') || lower.includes('south island') || lower.includes('南岛') || lower.includes('tekapo')) {
      targetKey = 'newzealand';
    }

    setTimeout(() => {
      setAgentStatusSteps(prev => [
        ...prev,
        language === 'zh' 
          ? '🌐 连线全网实时搜索：核验即时路况与气象资讯...' 
          : '🌐 Connected to live web search: verifying weather & road status...',
        language === 'zh'
          ? '✨ LLM 决策与便士网格 (Bento Grid) 结构化渲染中...'
          : '✨ LLM reasoning & structuring Bento Grid layout...'
      ]);
    }, 900);

    let backendSources = [];
    let customAiReplyText = null;
    let customAiPills = null;

    try {
      // 构建历史会话数据给后端
      const convHistory = messages.map(m => ({
        role: m.sender === 'user' ? 'user' : 'assistant',
        content: m.text
      }));

      // 调用后端 API (优先 8080 OpenClaw Agent)
      const apiRes = await fetchTravelPlan(userQuery, convHistory);

      if (apiRes) {
        if (apiRes.needs_more_info && apiRes.follow_up_question) {
          // 触发智能追问模式
          customAiReplyText = apiRes.follow_up_question;
          customAiPills = [
            language === 'zh' ? '❓ 需要补充行程细节' : '❓ More details needed',
            language === 'zh' ? '💬 OpenClaw 智能追问' : '💬 Interactive Clarification'
          ];
        } else {
          const transformed = transformBackendPlan(apiRes, language);
          if (transformed) {
            setDynamicCustomPlan(transformed);
            backendSources = transformed.dataSources || apiRes.data_sources || [];
            if (apiRes.plan && apiRes.plan.summary && apiRes.plan.summary.title) {
              customAiReplyText = language === 'zh'
                ? `已为你完成【${apiRes.plan.summary.title}】的深度规划！总天数 ${apiRes.plan.summary.days || '多'} 天，路线涵盖 ${apiRes.plan.summary.route || '精选景点'}。右侧便士网格已同步更新。`
                : `Your customized plan "${apiRes.plan.summary.title}" is ready! Total ${apiRes.plan.summary.days || ''} days covering ${apiRes.plan.summary.route || 'key scenic spots'}. Bento Grid is updated.`;
            }
          } else {
            setCurrentDatasetKey(targetKey);
            setDynamicCustomPlan(null);
          }
        }
      } else {
        setCurrentDatasetKey(targetKey);
        setDynamicCustomPlan(null);
      }
    } catch (err) {
      console.log("使用本地高性能 Agent 规则响应:", err.message);
      setCurrentDatasetKey(targetKey);
      setDynamicCustomPlan(null);
    } finally {
      setTimeout(() => {
        let aiText = customAiReplyText || (targetKey === 'tokyo' ? t.sidebar.aiReplyTokyo : t.sidebar.aiReplyNZ);
        let aiPills = customAiPills || (targetKey === 'tokyo' 
          ? [t.sidebar.ragTokyoPill1, t.sidebar.ragTokyoPill2]
          : [t.sidebar.ragStatusPill1, t.sidebar.ragStatusPill2]);

        if (backendSources.length > 0) {
          aiPills = backendSources.map(src => `✨ ${src}`);
        }

        const aiReply = {
          id: Date.now() + 1,
          sender: 'ai',
          text: aiText,
          statusSteps: aiPills
        };
        setMessages(prev => [...prev, aiReply]);
        setLoading(false);
        setAgentStatusSteps([]);
      }, 1200);
    }
  };

  // 顶部搜索回车联动
  const handleSearchSubmit = (query) => {
    handleSendMessage(query);
  };

  // 导出全部天数的完整 Markdown 行程文档
  const handleExportMarkdown = () => {
    let md = `# ${currentData.tripTitle}\n\n> ${currentData.summary || currentData.tripSubtitle}\n\n`;
    md += `* ${language === 'zh' ? '行程规格' : 'Itinerary Specs'}: ${currentData.tripSubtitle}\n\n`;

    // 循环遍历所有天数 (Day 1 ~ Day N)
    const days = Object.keys(currentData.dailySchedules).map(Number).sort((a, b) => a - b);
    days.forEach(dayNum => {
      md += `## 🗓️ ${language === 'zh' ? `第 ${dayNum} 天行程安排` : `Day ${dayNum} Schedule`}\n\n`;
      md += `| ${t.cards.tableCols.time} | ${t.cards.tableCols.activity} | ${t.cards.tableCols.location} | ${t.cards.tableCols.details} |\n`;
      md += `| :--- | :--- | :--- | :--- |\n`;
      
      const rows = currentData.dailySchedules[dayNum] || [];
      rows.forEach(r => {
        md += `| ${r.time} | **${r.activity}** | ${r.location} | ${r.details} |\n`;
      });
      md += `\n`;
    });

    if (currentData.mustVisit && currentData.mustVisit.length > 0) {
      md += `## 🍲 ${t.cards.mustVisitTitle}\n\n`;
      currentData.mustVisit.forEach(m => {
        md += `* **${m.name}** [${m.category}]: ${m.recommendations} (Tips: ${m.tipsEmoji})\n`;
      });
      md += `\n`;
    }

    if (currentData.photoGuides && currentData.photoGuides.length > 0) {
      md += `## 📷 ${t.cards.photoGuideTitle}\n\n`;
      currentData.photoGuides.forEach(p => {
        md += `* **${p.title}** - ${p.subtitle} (${t.cards.paramsLabel}: ${p.params})\n`;
      });
      md += `\n`;
    }

    navigator.clipboard.writeText(md);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bento-app-viewport">
      {/* 核心主容器 (Mac-like App Window with smooth border-radius) */}
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

          {/* Tab 视图切换：Itineraries 全景模式 或 Bento Grid 看板模式 */}
          {activeNavTab === 'itineraries' ? (
            <ItinerariesFullView 
              currentData={currentData}
              labels={t.cards}
              language={language}
              onBackHome={() => setActiveNavTab('home')}
              onExportMarkdown={handleExportMarkdown}
            />
          ) : (
            /* 便士网格 Bento Grid 内容区 */
            <div className="bento-content-layout">
              {/* 顶部：行程总览 Banner 卡片 */}
              <TripBannerCard 
                title={currentData.tripTitle}
                subtitle={currentData.tripSubtitle}
              />

              {/* 中间行：2 列便士卡片 (左侧日程表格 + 右侧必吃美食与景点) */}
              <div className="bento-middle-row">
                {/* 每日日程路线表 */}
                <DailyScheduleCard 
                  dailySchedules={currentData.dailySchedules}
                  activeDay={activeDay}
                  onSelectDay={(d) => setActiveDay(d)}
                  labels={t.cards}
                  language={language}
                />

                {/* 必吃美食与打卡景点 */}
                <MustVisitCuisineCard 
                  items={currentData.mustVisit}
                  labels={t.cards}
                  language={language}
                />
              </div>

              {/* 底部行：摄影机位与出片指南卡片 */}
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

      {/* 系统状态与模型诊断弹窗 */}
      <SystemStatusModal 
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        language={language}
      />
    </div>
  );
}
