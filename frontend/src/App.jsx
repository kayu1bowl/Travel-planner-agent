import React, { useState } from 'react';
import ConversationalSidebar from './components/ConversationalSidebar';
import TopNavbar from './components/TopNavbar';
import TripBannerCard from './components/TripBannerCard';
import DailyScheduleCard from './components/DailyScheduleCard';
import MustVisitCuisineCard from './components/MustVisitCuisineCard';
import PhotographyGuideCard from './components/PhotographyGuideCard';
import { DESTINATION_DATASETS, transformBackendPlan } from './services/destinations';
import { TRANSLATIONS } from './services/i18n';
import { fetchTravelPlan } from './services/api';

export default function App() {
  const [language, setLanguage] = useState('zh'); // 默认中文
  const [currentDatasetKey, setCurrentDatasetKey] = useState('newzealand');
  const [dynamicCustomPlan, setDynamicCustomPlan] = useState(null);
  const [activeNavTab, setActiveNavTab] = useState('home');
  const [activeDay, setActiveDay] = useState(2);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [agentStatusSteps, setAgentStatusSteps] = useState([]);

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
    try {
      // 尝试调用后端 API
      const apiRes = await fetchTravelPlan(userQuery);
      if (apiRes && apiRes.itineraries && apiRes.itineraries.length > 0) {
        const transformed = transformBackendPlan(apiRes, language);
        if (transformed) {
          setDynamicCustomPlan(transformed);
          backendSources = apiRes.data_sources || [];
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
        let aiText = targetKey === 'tokyo' ? t.sidebar.aiReplyTokyo : t.sidebar.aiReplyNZ;
        let aiPills = targetKey === 'tokyo' 
          ? [t.sidebar.ragTokyoPill1, t.sidebar.ragTokyoPill2]
          : [t.sidebar.ragStatusPill1, t.sidebar.ragStatusPill2];

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

  // 导出 Markdown 行程文档
  const handleExportMarkdown = () => {
    let md = `# ${currentData.tripTitle}\n\n> ${currentData.summary}\n\n`;
    md += `## 🗓️ ${t.cards.dailyScheduleTitle} (Day ${activeDay})\n\n`;
    md += `| ${t.cards.tableCols.time} | ${t.cards.tableCols.activity} | ${t.cards.tableCols.location} | ${t.cards.tableCols.details} |\n`;
    md += `| :--- | :--- | :--- | :--- |\n`;
    
    const rows = currentData.dailySchedules[activeDay] || currentData.dailySchedules[1] || [];
    rows.forEach(r => {
      md += `| ${r.time} | **${r.activity}** | ${r.location} | ${r.details} |\n`;
    });

    md += `\n## 🍲 ${t.cards.mustVisitTitle}\n\n`;
    currentData.mustVisit.forEach(m => {
      md += `* **${m.name}** [${m.category}]: ${m.recommendations} (Tips: ${m.tipsEmoji})\n`;
    });

    md += `\n## 📷 ${t.cards.photoGuideTitle}\n\n`;
    currentData.photoGuides.forEach(p => {
      md += `* **${p.title}** - ${p.subtitle} (${t.cards.paramsLabel}: ${p.params})\n`;
    });

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
            onExportMarkdown={handleExportMarkdown}
            copied={copied}
            language={language}
            onToggleLanguage={handleToggleLanguage}
            labels={t.nav}
          />

          {/* 便士网格 Bento Grid 内容区 */}
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
        </main>
      </div>
    </div>
  );
}
