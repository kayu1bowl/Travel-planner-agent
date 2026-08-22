import React, { useState, useEffect, useRef } from 'react';
import { 
  Sparkles, 
  CheckCircle2, 
  Compass, 
  MapPin, 
  Clock, 
  Camera, 
  Utensils, 
  Cpu, 
  Layers, 
  Loader2, 
  ArrowRight,
  ShieldCheck,
  Zap
} from 'lucide-react';

/**
 * OpenClaw Agent 智能推演全景转场中心 (Agent Transition Hub)
 * 提供从欢迎页/聊天框 到 Bento 看板的平滑沉浸式过渡、4阶段卡片流水线与动态实时进度
 */
export default function AgentTransitionHub({
  isVisible = false,
  userQuery = '',
  language = 'zh',
  onTransitionEnd
}) {
  const [progress, setProgress] = useState(15);
  const [activeStage, setActiveStage] = useState(0); // 0, 1, 2, 3
  const [terminalLogs, setTerminalLogs] = useState([]);
  const [isFinishing, setIsFinishing] = useState(false);
  const timerRef = useRef([]);

  const stages = [
    {
      id: 1,
      icon: Compass,
      name: language === 'zh' ? '路线架构师' : 'Route Architect',
      role: language === 'zh' ? 'Stage 1: 宏观骨架' : 'Stage 1: Skeleton',
      desc: language === 'zh' ? '识别目的地与天数，构建城市跃迁与主题大纲' : 'Identify destination & days, building route skeleton',
      metric: language === 'zh' ? '宏观动线构思' : 'Macro Route'
    },
    {
      id: 2,
      icon: Clock,
      name: language === 'zh' ? '动线精算师' : 'Timeline Detailer',
      role: language === 'zh' ? 'Stage 2: 时空动线' : 'Stage 2: Daily Timeline',
      desc: language === 'zh' ? '精细化每日早中晚游玩节奏，核算自驾与JR交通耗时' : 'Refining daily schedules & precise travel time',
      metric: language === 'zh' ? '时空节奏精算' : 'Transport Optimization'
    },
    {
      id: 3,
      icon: Utensils,
      name: language === 'zh' ? '风物摄影官' : 'Experience Curator',
      role: language === 'zh' ? 'Stage 3: 美食摄影' : 'Stage 3: Taste & Photo',
      desc: language === 'zh' ? '甄选当地口碑必吃老店，匹配专业摄影焦段与黄金光影' : 'Curating authentic specialties & photo parameters',
      metric: language === 'zh' ? '口碑风物甄选' : 'Photo Guides'
    },
    {
      id: 4,
      icon: Camera,
      name: language === 'zh' ? '视觉解析引擎' : 'Visual Grounder',
      role: language === 'zh' ? 'Stage 4: 视觉装配' : 'Stage 4: Visual Grounding',
      desc: language === 'zh' ? '动态检索维基全球实拍图，生成 8K 概念画卷并渲染看板' : 'Matching Wikimedia photography & 8k generative visual',
      metric: language === 'zh' ? 'Bento 看板装配' : 'Bento Assembly'
    }
  ];

  // 动态推进进度与日志流
  useEffect(() => {
    if (!isVisible) {
      setProgress(15);
      setActiveStage(0);
      setTerminalLogs([]);
      setIsFinishing(false);
      return;
    }

    const queryClean = userQuery || (language === 'zh' ? '定制旅行计划' : 'Customized Itinerary');
    const logsPool = [
      language === 'zh' ? `[OpenClaw Pipeline] 接收到需求：“${queryClean}”` : `[OpenClaw Pipeline] Query received: "${queryClean}"`,
      language === 'zh' ? '[Route Architect] 正在解析地理坐标系与天数约束...' : '[Route Architect] Resolving geographic constraints...',
      language === 'zh' ? '[RAG & Web Search] 匹配私有知识库与全网实时资讯...' : '[RAG & Search] Querying private database & live search...',
      language === 'zh' ? '[Timeline Detailer] 正在计算各节点最优行车耗时与避坑规则...' : '[Timeline Detailer] Optimizing daily driving duration...',
      language === 'zh' ? '[Experience Curator] 正在挖掘当地老字号必吃与黄金出片机位...' : '[Experience Curator] Curating top-rated food & photo spots...',
      language === 'zh' ? '[Visual Grounder] 并发嗅探维基官方实拍并装配 Bento 看板...' : '[Visual Grounder] Grounding verified photos & building Bento...'
    ];

    setTerminalLogs([logsPool[0], logsPool[1]]);

    // 阶段 1 推进 (~2.5s)
    const t1 = setTimeout(() => {
      setProgress(38);
      setActiveStage(1);
      setTerminalLogs(prev => [...prev, logsPool[2], logsPool[3]]);
    }, 2500);

    // 阶段 2 推进 (~5.5s)
    const t2 = setTimeout(() => {
      setProgress(68);
      setActiveStage(2);
      setTerminalLogs(prev => [...prev, logsPool[4]]);
    }, 5500);

    // 阶段 3 推进 (~8.5s)
    const t3 = setTimeout(() => {
      setProgress(90);
      setActiveStage(3);
      setTerminalLogs(prev => [...prev, logsPool[5]]);
    }, 8500);

    timerRef.current = [t1, t2, t3];

    return () => {
      timerRef.current.forEach(t => clearTimeout(t));
    };
  }, [isVisible, userQuery, language]);

  if (!isVisible) return null;

  return (
    <div className={`agent-transition-hub-overlay ${isFinishing ? 'fade-out' : 'fade-in'}`}>
      {/* 背景动态流光光晕 */}
      <div className="hub-ambient-glow glow-1" />
      <div className="hub-ambient-glow glow-2" />

      <div className="agent-transition-hub-card">
        {/* 顶部标题区 */}
        <div className="hub-header-section">
          <div className="hub-agent-badge">
            <span className="hub-badge-dot" />
            <Cpu size={14} />
            <span>OpenClaw Multi-Agent Intelligence</span>
          </div>

          <h2 className="hub-main-title">
            {language === 'zh' ? 'AI 正在智能规划您的专属行程' : 'AI is Crafting Your Travel Masterpiece'}
          </h2>
          
          <p className="hub-user-query-tag">
            <MapPin size={13} className="query-pin-icon" />
            <span>“{userQuery || (language === 'zh' ? '正在推演行程方案...' : 'Synthesizing travel plan...')}”</span>
          </p>
        </div>

        {/* 4 阶段子 Agent 流水线卡片矩阵 */}
        <div className="hub-stages-grid">
          {stages.map((stg, idx) => {
            const IconComponent = stg.icon;
            const isCompleted = activeStage > idx;
            const isActive = activeStage === idx;
            const isPending = activeStage < idx;

            return (
              <div 
                key={stg.id} 
                className={`hub-stage-card ${isCompleted ? 'completed' : ''} ${isActive ? 'active' : ''} ${isPending ? 'pending' : ''}`}
              >
                <div className="stage-card-top">
                  <div className="stage-icon-box">
                    <IconComponent size={18} />
                  </div>
                  <div className="stage-status-indicator">
                    {isCompleted ? (
                      <span className="status-tag tag-done">
                        <CheckCircle2 size={12} />
                        <span>{language === 'zh' ? '已就绪' : 'Ready'}</span>
                      </span>
                    ) : isActive ? (
                      <span className="status-tag tag-active">
                        <Loader2 size={12} className="spin-animate" />
                        <span>{language === 'zh' ? '推演中' : 'Running'}</span>
                      </span>
                    ) : (
                      <span className="status-tag tag-pending">
                        <span>{language === 'zh' ? '就绪中' : 'Queued'}</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="stage-card-body">
                  <div className="stage-role-label">{stg.role}</div>
                  <h4 className="stage-name-title">{stg.name}</h4>
                  <p className="stage-desc-text">{stg.desc}</p>
                </div>

                <div className="stage-card-footer">
                  <span className="stage-metric-badge">{stg.metric}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* 动态流光进度条区 */}
        <div className="hub-progress-section">
          <div className="progress-info-row">
            <div className="progress-status-left">
              <Zap size={14} className="zap-icon-pulse" />
              <span className="progress-stage-label">
                {activeStage === 0 && (language === 'zh' ? 'Step 1/4: 构思宏观路线与城市跃迁...' : 'Step 1/4: Designing Route Skeleton...')}
                {activeStage === 1 && (language === 'zh' ? 'Step 2/4: 精细化每日上午/下午时空动线...' : 'Step 2/4: Refining Daily Timelines & Transport...')}
                {activeStage === 2 && (language === 'zh' ? 'Step 3/4: 甄选当地特色美食与出片机位...' : 'Step 3/4: Curating Delicacies & Photo Spots...')}
                {activeStage === 3 && (language === 'zh' ? 'Step 4/4: 动态匹配实拍图并装配 Bento 看板...' : 'Step 4/4: Grounding Photos & Assembling Bento...')}
              </span>
            </div>
            <div className="progress-percent-number">{progress}%</div>
          </div>

          <div className="hub-progress-track">
            <div 
              className="hub-progress-fill" 
              style={{ width: `${progress}%` }}
            >
              <div className="progress-shimmer-beam" />
            </div>
          </div>
        </div>

        {/* 底部实时终端日志滚动栏 */}
        <div className="hub-terminal-box">
          <div className="terminal-header">
            <div className="terminal-dots">
              <span className="dot dot-r" />
              <span className="dot dot-y" />
              <span className="dot dot-g" />
            </div>
            <span className="terminal-title">Agent Execution Stream</span>
          </div>
          <div className="terminal-body-feed">
            {terminalLogs.map((log, lIdx) => (
              <div key={lIdx} className="terminal-log-row animate-fade-in">
                <span className="terminal-prompt-symbol">›</span>
                <span className="terminal-log-text">{log}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
