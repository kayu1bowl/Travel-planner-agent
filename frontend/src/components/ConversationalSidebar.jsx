import React, { useState, useRef, useEffect } from 'react';
import { Send, MoreHorizontal, Sparkles, Database, Globe, CheckCircle2, Loader2, Compass, Bot, Trash2, Copy, Check, Activity } from 'lucide-react';

export default function ConversationalSidebar({ 
  messages = [], 
  onSendMessage, 
  onResetChat,
  onOpenStatusModal,
  loading = false,
  agentStatusSteps = [],
  labels = {},
  language = 'zh'
}) {
  const [inputText, setInputText] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [copied, setCopied] = useState(false);
  const messagesEndRef = useRef(null);
  const menuRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, agentStatusSteps]);

  // 点击外部关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!inputText.trim() || loading) return;
    onSendMessage(inputText.trim());
    setInputText('');
  };

  const handleQuickPrompt = (prompt) => {
    if (loading) return;
    onSendMessage(prompt);
  };

  const handleCopyChat = () => {
    const text = messages.map(m => `【${m.sender === 'user' ? '用户' : 'AI 向导'}】\n${m.text}`).join('\n\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => {
      setCopied(false);
      setShowMenu(false);
    }, 1500);
  };

  const handleClear = () => {
    setShowMenu(false);
    if (onResetChat) onResetChat();
  };

  return (
    <aside className="conversational-sidebar">
      {/* 顶部个人资料 Header */}
      <div className="sidebar-header">
        <div className="user-profile-box">
          <div className="avatar-wrapper">
            <div className="bot-avatar-icon-box">
              <Bot size={22} className="bot-icon-svg" />
            </div>
            <span className="online-status-dot"></span>
          </div>
          <div className="user-meta">
            <h3 className="user-name">{labels.title || 'Roam Copilot'}</h3>
            <p className="user-role">{labels.subtitle || 'Conversational AI'}</p>
          </div>
        </div>

        {/* 菜单下拉锚点 */}
        <div className="more-menu-container" ref={menuRef}>
          <button 
            className="icon-more-btn" 
            onClick={() => setShowMenu(!showMenu)}
            aria-label="Conversation options"
            title={language === 'zh' ? '更多会话操作' : 'Conversation options'}
          >
            <MoreHorizontal size={18} />
          </button>

          {showMenu && (
            <div className="action-dropdown-menu">
              <button className="dropdown-menu-item" onClick={handleClear}>
                <Trash2 size={14} color="#EF4444" />
                <span>{language === 'zh' ? '清空并新建对话' : 'Clear & New Chat'}</span>
              </button>
              <button className="dropdown-menu-item" onClick={handleCopyChat}>
                {copied ? <Check size={14} color="#10B981" /> : <Copy size={14} />}
                <span>{copied ? (language === 'zh' ? '已复制对话！' : 'Copied!') : (language === 'zh' ? '复制对话记录' : 'Copy Chat Log')}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* 快捷灵感推荐 Chips */}
      <div className="quick-prompts-bar">
        <button 
          className="quick-chip"
          onClick={() => handleQuickPrompt(language === 'zh' ? "计划新西兰南岛 7 天自驾与风光摄影，推荐暗夜星空与特色美食" : "Planning a 7-day trip to New Zealand South Island with photography & food.")}
        >
          {labels.quickNZ || "🇳🇿 新西兰南岛7天"}
        </button>
        <button 
          className="quick-chip"
          onClick={() => handleQuickPrompt(language === 'zh' ? "规划东京 7 天秋季漫游，包含地道美食、神社古迹与街头摄影" : "Planning a 7-day trip to Tokyo in October with food, shrines and street photography.")}
        >
          {labels.quickTokyo || "🗼 东京7天秋季之旅"}
        </button>
      </div>

      {/* 对话流 Feed */}
      <div className="chat-messages-feed">
        {messages.map((msg) => (
          <div key={msg.id} className={`message-bubble-wrapper ${msg.sender}`}>
            <div className="message-bubble">
              <div className="message-content-text">{msg.text}</div>

              {/* RAG 引用信源展示 */}
              {msg.sources && msg.sources.length > 0 && (
                <div className="rag-sources-box">
                  <div className="sources-title">
                    <Database size={12} />
                    <span>{language === 'zh' ? '知识库与搜索信源' : 'Knowledge & Search Sources'}</span>
                  </div>
                  <div className="source-tags-list">
                    {msg.sources.map((src, idx) => (
                      <span key={idx} className="source-tag-item">
                        <Globe size={10} />
                        <span>{src}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* 思考状态与步骤展示 */}
        {loading && (
          <div className="message-bubble-wrapper assistant">
            <div className="message-bubble thinking-bubble">
              <div className="thinking-header">
                <Loader2 size={16} className="spin-animate" />
                <span>{language === 'zh' ? 'AI 正在检索知识库并规划行程...' : 'AI is researching & planning...'}</span>
              </div>
              {agentStatusSteps && agentStatusSteps.length > 0 && (
                <div className="agent-steps-list">
                  {agentStatusSteps.map((step, idx) => (
                    <div key={idx} className="agent-step-item">
                      <CheckCircle2 size={12} className="step-check-icon" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 底部输入栏 */}
      <form className="sidebar-input-form" onSubmit={handleSubmit}>
        <div className="input-field-wrapper">
          <input
            type="text"
            className="chat-text-input"
            placeholder={labels.inputPlaceholder || "输入你的旅行想法或修改要求..."}
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={loading}
          />
          <button 
            type="submit" 
            className="send-action-btn" 
            disabled={!inputText.trim() || loading}
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
      </form>
    </aside>
  );
}
