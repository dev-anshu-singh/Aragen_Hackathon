import React from 'react';
import { AlertOctagon, AlertTriangle, CheckCircle2, ShieldAlert, BarChart3 } from 'lucide-react';

export default function SummaryBanner({ summary, results = [] }) {
  const criticalCount = results.filter(r => r.status === 'Critical').length;
  const warningCount = results.filter(r => r.status === 'Warning').length;
  const normalCount = results.filter(r => r.status === 'Normal').length;

  return (
    <div className="summary-section animate-fade-in">
      {criticalCount > 0 && (
        <div className="critical-alert-banner">
          <div className="alert-icon-wrap">
            <ShieldAlert size={26} className="text-critical" />
          </div>
          <div className="alert-content">
            <h3>Urgent Clinical Attention Required</h3>
            <p>
              {criticalCount} critical laboratory finding(s) detected that may require immediate physician consultation, emergency department referral, or acute intervention.
            </p>
          </div>
        </div>
      )}

      <div className="metrics-grid">
        <div className="metric-card glass-card">
          <div className="metric-header">
            <span className="metric-label">Total Analyzed</span>
            <BarChart3 size={18} className="text-muted" />
          </div>
          <div className="metric-value">{results.length}</div>
          <div className="metric-sub">Tests Evaluated</div>
        </div>

        <div className="metric-card metric-critical glass-card">
          <div className="metric-header">
            <span className="metric-label">Critical Alerts</span>
            <AlertOctagon size={18} className="text-critical" />
          </div>
          <div className="metric-value text-critical">{criticalCount}</div>
          <div className="metric-sub">Immediate action recommended</div>
        </div>

        <div className="metric-card metric-warning glass-card">
          <div className="metric-header">
            <span className="metric-label">Warning / Abnormal</span>
            <AlertTriangle size={18} className="text-warning" />
          </div>
          <div className="metric-value text-warning">{warningCount}</div>
          <div className="metric-sub">Requires follow-up care</div>
        </div>

        <div className="metric-card metric-normal glass-card">
          <div className="metric-header">
            <span className="metric-label">Normal Limits</span>
            <CheckCircle2 size={18} className="text-normal" />
          </div>
          <div className="metric-value text-normal">{normalCount}</div>
          <div className="metric-sub">Within reference range</div>
        </div>
      </div>
    </div>
  );
}
