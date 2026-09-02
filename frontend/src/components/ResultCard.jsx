import React from 'react';
import { 
  AlertOctagon, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowRight, 
  Stethoscope, 
  HelpCircle,
  FileText
} from 'lucide-react';

export default function ResultCard({ result, index }) {
  const { test_name, value, unit, status, reference_range, explanation, next_step } = result;

  const getStatusDetails = () => {
    switch (status) {
      case 'Critical':
        return {
          icon: <AlertOctagon size={16} className="text-critical" />,
          badgeClass: 'badge-critical',
          cardClass: 'card-critical',
          accentColor: 'var(--critical-base)'
        };
      case 'Warning':
        return {
          icon: <AlertTriangle size={16} className="text-warning" />,
          badgeClass: 'badge-warning',
          cardClass: 'card-warning',
          accentColor: 'var(--warning-base)'
        };
      case 'Normal':
      default:
        return {
          icon: <CheckCircle2 size={16} className="text-normal" />,
          badgeClass: 'badge-normal',
          cardClass: 'card-normal',
          accentColor: 'var(--normal-base)'
        };
    }
  };

  const details = getStatusDetails();

  return (
    <div className={`result-card glass-card ${details.cardClass} animate-fade-in`}>
      {/* Top Header Row */}
      <div className="card-top-header">
        <div className="test-ident">
          <span className="test-rank">#{index + 1}</span>
          <h3 className="test-title">{test_name}</h3>
        </div>

        <div className={`badge ${details.badgeClass}`}>
          {details.icon}
          <span>{status}</span>
        </div>
      </div>

      {/* Numerical / Value Metric Row */}
      <div className="card-metrics-row">
        <div className="metric-box observed-box">
          <span className="metric-box-label">Observed Value</span>
          <div className="metric-box-value">
            <span className="value-number">{value}</span>
            <span className="value-unit">{unit}</span>
          </div>
        </div>

        <div className="metric-box ref-box">
          <span className="metric-box-label">Reference Range</span>
          <div className="ref-range-value">
            {reference_range}
          </div>
        </div>
      </div>

      {/* Explainable AI Clinical Insights */}
      <div className="explanation-section">
        <div className="section-subtitle">
          <FileText size={15} className="text-cyan" />
          <span>Explainable AI Clinical Insights</span>
        </div>
        <p className="explanation-text">
          {explanation}
        </p>
      </div>

      {/* Recommended Next Step Box */}
      <div className="next-step-box">
        <div className="next-step-header">
          <Stethoscope size={16} className="next-step-icon" />
          <span className="next-step-label">Recommended Next Step</span>
        </div>
        <p className="next-step-content">
          {next_step}
        </p>
      </div>
    </div>
  );
}
