import React, { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Search, 
  Globe, 
  CheckCircle2, 
  Loader2,
  Compass
} from 'lucide-react';

export default function MobileChatView({
  messages = [],
  onSendMessage,
  loading = false,
  agentStatusSteps = [],
  labels = {},
  language = 'zh'
}) {
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const quickPrompts = [
    { id: 'nz', label: language === 'zh' ? '🇳🇿 新西兰南岛 7 天' : '🇳🇿 New Zealand 7-Day', query: '我想规划一次 7 天新西兰南岛自驾，重点风光摄影、暗夜星空和特色美食。' },
    { id: 'tokyo', label: language === 'zh' ? '🗼 东京 7 天秋季摄影' : '🗼 Tokyo 7-Day Photo', query: '帮我规划东京 7 天秋天深度自驾与街头胶片摄影之旅。' },
    { id: 'lake', label: language === 'zh' ? '🌌 特卡波湖观星指南' : '🌌 Lake Tekapo Stargazing', query: '我想了解特卡波湖暗夜星空和好牧羊人教堂的最佳拍摄机位与参数。' },
    { id: 'food', label: language === 'zh' ? '🍣 库克山高山三文鱼' : '🍣 Alpine Salmon Tasting', query: '推荐新西兰南岛沿途必吃特色美食与普卡基湖高山三文鱼。' }
  ];

  const handleSend = () => {
    if (!inputValue.trim() || loading) return;
    onSendMessage(inputValue.trim());
    setInputValue('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleQuickClick = (q) => {
    if (loading) return;
    onSendMessage(q);
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, agentStatusSteps]);

  return (
    <div className="mobile-chat-view-container">
      {/* 快捷灵感 Tag 胶囊列表 */}
      <div className="mobile-chat-quick-tags">
        {quickPrompts.map((p) => (
          <button
            key={p.id}
            className="mobile-quick-tag-btn"
            onClick={() => handleQuickClick(p.query)}
            disabled={loading}
          >
            {p.label}
          </button>
        ))}
      </div>

      {/* 消息滚动流 */}
      <div className="mobile-chat-messages-scroll">
        {messages.map((msg) => (
          <div key={msg.id} className={`mobile-msg-row ${msg.sender}`}>
            <div className="mobile-msg-avatar">
              {msg.sender === 'assistant' ? (
                <div className="bot-avatar-box">
                  <Bot size={15} color="#FFFFFF" />
                </div>
              ) : (
                <div className="user-avatar-box">
                  <User size={15} color="#FFFFFF" />
                </div>
              )}
            </div>

            <div className="mobile-msg-bubble">
              <p className="mobile-msg-text">{msg.text}</p>

              {/* 如果是包含数据源与知识库的回答 */}
              {msg.dataSources && msg.dataSources.length > 0 && (
                <div className="mobile-msg-sources">
                  {msg.dataSources.map((ds, idx) => (
                    <span key={idx} className="mobile-source-badge">
                      <Search size={10} />
                      <span>{ds}</span>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}

        {/* 思考中与智能体步骤动效 */}
        {loading && (
          <div className="mobile-msg-row assistant">
            <div className="mobile-msg-avatar">
              <div className="bot-avatar-box pulse-spin">
                <Sparkles size={15} color="#FFFFFF" />
              </div>
            </div>
            <div className="mobile-msg-bubble thinking">
              <div className="thinking-row">
                <Loader2 size={14} className="spin-loader" />
                <span>{language === 'zh' ? 'AI 正在为您精心规划路线...' : 'AI is customizing your itinerary...'}</span>
              </div>

              {agentStatusSteps && agentStatusSteps.length > 0 && (
                <div className="agent-steps-progress">
                  {agentStatusSteps.map((step, idx) => (
                    <div key={idx} className="step-progress-item">
                      <CheckCircle2 size={11} color="#10B981" />
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

      {/* 底部固定输入框 */}
      <div className="mobile-chat-input-bar">
        <div className="mobile-input-inner">
          <input 
            type="text"
            className="mobile-chat-input-field"
            placeholder={language === 'zh' ? '输入你的旅行需求或修改要求...' : 'Ask or customize your itinerary...'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button 
            className="mobile-chat-send-btn" 
            onClick={handleSend}
            disabled={!inputValue.trim() || loading}
            aria-label="Send"
          >
            <Send size={15} />
          </button>
        </div>
      </div>
    </div>
  );
}
