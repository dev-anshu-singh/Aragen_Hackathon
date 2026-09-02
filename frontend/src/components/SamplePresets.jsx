import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, RotateCcw, History, Sparkles } from 'lucide-react';

export const DEMO_PRESETS = {
  normal: [
    { test_name: "Hemoglobin", value: "14.2", unit: "g/dL" },
    { test_name: "Glucose", value: "88", unit: "mg/dL" },
    { test_name: "HbA1c", value: "5.1", unit: "%" },
    { test_name: "TSH", value: "2.1", unit: "mU/L" },
    { test_name: "Free T4", value: "1.25", unit: "ng/dL" },
    { test_name: "Insulin", value: "8.5", unit: "mU/L" },
    { test_name: "Ferritin", value: "65", unit: "ug/L" },
    { test_name: "WBC", value: "6.8", unit: "10^3/uL" },
    { test_name: "Platelets", value: "240", unit: "10^3/uL" },
    { test_name: "Protein (Strip)", value: "Negatif", unit: "-" },
    { test_name: "Glucose (Strip)", value: "Normal", unit: "-" }
  ],
  warning: [
    { test_name: "Hemoglobin", value: "11.2", unit: "g/dL" },
    { test_name: "HbA1c", value: "6.2", unit: "%" },
    { test_name: "TSH", value: "5.8", unit: "mU/L" },
    { test_name: "Glucose", value: "115", unit: "mg/dL" },
    { test_name: "Ferritin", value: "175", unit: "ug/L" },
    { test_name: "WBC", value: "12.5", unit: "10^3/uL" },
    { test_name: "Protein (Strip)", value: "1+", unit: "-" },
    { test_name: "Platelets", value: "135", unit: "10^3/uL" }
  ],
  critical: [
    { test_name: "Hemoglobin", value: "5.8", unit: "g/dL" },
    { test_name: "Glucose", value: "480", unit: "mg/dL" },
    { test_name: "Platelets", value: "22", unit: "10^3/uL" },
    { test_name: "TSH", value: "16.5", unit: "mU/L" },
    { test_name: "WBC", value: "35.0", unit: "10^3/uL" },
    { test_name: "Protein (Strip)", value: "3+", unit: "-" },
    { test_name: "Free T4", value: "0.25", unit: "ng/dL" },
    { test_name: "HbA1c", value: "11.5", unit: "%" }
  ]
};

export default function SamplePresets({
  onLoadDemo,
  onReset,
  activeDemo,
  onToggleHistory,
  historyCount = 0
}) {
  return (
    <div className="presets-container glass-card">
      <div className="presets-header">
        <span className="presets-title">Quick Demo Panels:</span>
        <span className="presets-hint">Load pre-built test panels for demo, or drop your own CSV below</span>
      </div>

      <div className="presets-buttons">
        <button
          type="button"
          className={`btn btn-preset ${activeDemo === 'normal' ? 'active-normal' : ''}`}
          onClick={() => onLoadDemo('normal', DEMO_PRESETS.normal)}
        >
          <CheckCircle2 size={16} className="text-normal" />
          <span>Normal Demo</span>
        </button>

        <button
          type="button"
          className={`btn btn-preset ${activeDemo === 'warning' ? 'active-warning' : ''}`}
          onClick={() => onLoadDemo('warning', DEMO_PRESETS.warning)}
        >
          <AlertTriangle size={16} className="text-warning" />
          <span>Warning Demo</span>
        </button>

        <button
          type="button"
          className={`btn btn-preset ${activeDemo === 'critical' ? 'active-critical' : ''}`}
          onClick={() => onLoadDemo('critical', DEMO_PRESETS.critical)}
        >
          <AlertOctagon size={16} className="text-critical" />
          <span>Critical Demo</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-reset"
          onClick={onReset}
          title="Clear queue and results"
        >
          <RotateCcw size={15} />
          <span>Clear Queue</span>
        </button>

        {historyCount > 0 && (
          <button
            type="button"
            className="btn btn-secondary"
            onClick={onToggleHistory}
            style={{ marginLeft: 'auto' }}
            title="View saved analyses in SQLite database"
          >
            <History size={15} className="text-muted" />
            <span>DB History ({historyCount})</span>
          </button>
        )}
      </div>
    </div>
  );
}


