import React, { useState, useRef, useEffect } from 'react';
import { Send, MoreHorizontal, Sparkles, Database, Globe, CheckCircle2, Loader2, Compass, Bot } from 'lucide-react';

export default function ConversationalSidebar({ 
  messages = [], 
  onSendMessage, 
  onResetChat,
  loading = false,
  agentStatusSteps = [],
  labels = {},
  language = 'zh'
}) {
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading, agentStatusSteps]);

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

        <button 
          className="icon-more-btn" 
          onClick={onResetChat}
          aria-label="Reset chat"
          title={language === 'zh' ? '清空对话历史 / 新建行程' : 'Reset Chat / New Trip'}
        >
          <MoreHorizontal size={18} />
        </button>
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
        {messages.map((msg, idx) => (
          <div key={idx} className={`chat-message-row ${msg.sender}`}>
            {msg.sender === 'ai' && (
              <div className="ai-badge-circle">
                <Bot size={13} />
              </div>
            )}

            <div className={`message-bubble ${msg.sender}`}>
              <p>{msg.text}</p>

              {/* AI 消息附带的动态状态胶囊 */}
              {msg.statusSteps && msg.statusSteps.length > 0 && (
                <div className="agent-status-pills">
                  {msg.statusSteps.map((step, sIdx) => (
                    <div key={sIdx} className="status-micro-pill">
                      <Sparkles size={11} color="#4F46E5" />
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* 正在生成中的思考微动效 */}
        {loading && (
          <div className="chat-message-row ai">
            <div className="ai-badge-circle">
              <Bot size={13} />
            </div>
            <div className="message-bubble ai loading-bubble">
              <div className="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
              </div>
              <span className="loading-hint-text">
                {agentStatusSteps.length > 0 ? agentStatusSteps[agentStatusSteps.length - 1] : "正在检索知识库与生成规划..."}
              </span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* 底部自然语言输入框 */}
      <div className="sidebar-bottom-input-container">
        <form onSubmit={handleSubmit} className="pill-input-form">
          <input
            type="text"
            className="pill-text-input"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={labels.inputPlaceholder || "Type a message..."}
            disabled={loading}
          />
          <button 
            type="submit" 
            className="pill-send-btn"
            disabled={!inputText.trim() || loading}
            aria-label="Send message"
          >
            {loading ? (
              <Loader2 size={16} className="spin-icon" />
            ) : (
              <Send size={15} />
            )}
          </button>
        </form>
      </div>
    </aside>
  );
}
