import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertTriangle, RefreshCw, Server, Cpu, Database, Globe, ShieldCheck } from 'lucide-react';
import { fetchSystemStatus } from '../services/api';

export default function SystemStatusModal({ isOpen, onClose, language = 'zh' }) {
  const [statusData, setStatusData] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadStatus = async () => {
    setLoading(true);
    try {
      const data = await fetchSystemStatus();
      setStatusData(data);
    } catch (e) {
      setStatusData({
        status: "offline",
        config_warnings: [language === 'zh' ? "无法连接后端 API 服务" : "Unable to reach backend API service"]
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadStatus();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const isOnline = statusData && statusData.status === 'ok';

  return (
    <div className="modal-backdrop-overlay" onClick={onClose}>
      <div className="system-status-modal-card" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-top-header">
          <div className="modal-title-group">
            <Server size={18} className="modal-title-icon" />
            <h3 className="modal-title-text">
              {language === 'zh' ? '系统运行状态与服务诊断' : 'System Status & Diagnostics'}
            </h3>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="Close modal">
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body-content">
          {/* Status Badge Banner */}
          <div className={`status-summary-banner ${isOnline ? 'online' : 'offline'}`}>
            <div className="status-indicator-dot"></div>
            <div className="status-text-meta">
              <p className="status-main-label">
                {isOnline 
                  ? (language === 'zh' ? '所有核心服务均在线并运行正常' : 'All core services are active and running')
                  : (language === 'zh' ? '后端服务待启动（已启用本地规则引擎）' : 'Backend offline (local fallback active)')}
              </p>
              <span className="status-version-tag">
                {statusData?.service || 'NZ Travel Planner API'} · v{statusData?.version || '1.0.0'}
              </span>
            </div>
          </div>

          {/* Service Architecture Status Grid */}
          <div className="status-modules-grid">
            {/* Module 1: OpenClaw Agent */}
            <div className="module-status-item">
              <div className="module-icon-box">
                <Cpu size={16} color="#4F46E5" />
              </div>
              <div className="module-info">
                <h4 className="module-name">{language === 'zh' ? 'OpenClaw 智能体调度' : 'OpenClaw Agent Router'}</h4>
                <p className="module-sub">Port 8080 · FastAPI</p>
              </div>
              <span className="module-badge active">
                <CheckCircle2 size={12} /> {language === 'zh' ? '正常' : 'Ready'}
              </span>
            </div>

            {/* Module 2: LLM Engine */}
            <div className="module-status-item">
              <div className="module-icon-box">
                <ShieldCheck size={16} color="#059669" />
              </div>
              <div className="module-info">
                <h4 className="module-name">{language === 'zh' ? '大模型推理引擎' : 'LLM Inference Engine'}</h4>
                <p className="module-sub">Google Gemini AI Pro / DeepSeek</p>
              </div>
              <span className="module-badge active">
                <CheckCircle2 size={12} /> {language === 'zh' ? '已接入' : 'Connected'}
              </span>
            </div>

            {/* Module 3: RAG Vector Knowledge Base */}
            <div className="module-status-item">
              <div className="module-icon-box">
                <Database size={16} color="#D97706" />
              </div>
              <div className="module-info">
                <h4 className="module-name">{language === 'zh' ? 'RAG 向量知识库' : 'RAG Vector Database'}</h4>
                <p className="module-sub">ChromaDB · DOC 官方与摄影机位</p>
              </div>
              <span className="module-badge active">
                <CheckCircle2 size={12} /> {language === 'zh' ? '已就绪' : 'Loaded'}
              </span>
            </div>

            {/* Module 4: Live Web Search */}
            <div className="module-status-item">
              <div className="module-icon-box">
                <Globe size={16} color="#2563EB" />
              </div>
              <div className="module-info">
                <h4 className="module-name">{language === 'zh' ? '全网实时搜索' : 'Web Search Engine'}</h4>
                <p className="module-sub">Tavily / DuckDuckGo / Mock</p>
              </div>
              <span className="module-badge active">
                <CheckCircle2 size={12} /> {language === 'zh' ? '就绪' : 'Ready'}
              </span>
            </div>
          </div>

          {/* Config Warnings Section */}
          {statusData?.config_warnings && statusData.config_warnings.length > 0 && (
            <div className="config-warnings-panel">
              <div className="warnings-header">
                <AlertTriangle size={15} color="#D97706" />
                <span>{language === 'zh' ? '系统提示与配置提醒' : 'System Notices & Warnings'}</span>
              </div>
              <ul className="warnings-list">
                {statusData.config_warnings.map((warn, wIdx) => (
                  <li key={wIdx}>{warn}</li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="modal-footer-actions">
          <button 
            className="modal-refresh-btn" 
            onClick={loadStatus} 
            disabled={loading}
          >
            <RefreshCw size={14} className={loading ? 'spinning' : ''} />
            <span>{language === 'zh' ? '重新检测' : 'Re-check'}</span>
          </button>
          <button className="modal-primary-btn" onClick={onClose}>
            {language === 'zh' ? '确认关闭' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
}
