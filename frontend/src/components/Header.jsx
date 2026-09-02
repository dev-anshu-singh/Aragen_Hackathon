import React from 'react';
import { Activity, ShieldCheck, Sparkles, Cpu } from 'lucide-react';

export default function Header({ backendOnline = true }) {
  return (
    <header className="app-header glass-card">
      <div className="header-left">
        <div className="logo-badge">
          <Activity className="logo-icon" size={26} />
        </div>
        <div className="title-group">
          <div className="title-row">
            <h1>Clinical Lab Results Analyzer</h1>
            <span className="version-tag">v1.0</span>
          </div>
          <p className="subtitle">
            Explainable AI • Severity Routing • Automated Clinical Insights
          </p>
        </div>
      </div>

      <div className="header-right">
        <div className="tech-pills">
          <div className="tech-pill">
            <Cpu size={14} />
            <span>FastMCP</span>
          </div>
          <div className="tech-pill">
            <Sparkles size={14} />
            <span>LangGraph Agent</span>
          </div>
        </div>

        <div className={`status-indicator ${backendOnline ? 'online' : 'offline'}`}>
          <span className="pulse-dot"></span>
          <span className="status-text">{backendOnline ? 'AI Backend Online' : 'Backend Connecting...'}</span>
        </div>
      </div>
    </header>
  );
}
