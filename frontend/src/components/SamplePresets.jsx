import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, RotateCcw, FlaskConical } from 'lucide-react';

export const DEMO_PRESETS = {
  normal: [
    { test_name: "Hemoglobin", value: "14.5", unit: "g/dL" },
    { test_name: "Glucose", value: "85", unit: "mg/dL" },
    { test_name: "WBC", value: "7.0", unit: "10^3/uL" }
  ],
  warning: [
    { test_name: "TSH", value: "5.5", unit: "mU/L" },
    { test_name: "Glucose", value: "112", unit: "mg/dL" },
    { test_name: "Platelets", value: "130", unit: "10^3/uL" }
  ],
  critical: [
    { test_name: "Hemoglobin", value: "6.0", unit: "g/dL" },
    { test_name: "Glucose", value: "450", unit: "mg/dL" },
    { test_name: "Platelets", value: "30", unit: "10^3/uL" }
  ]
};

export default function SamplePresets({
  onLoadDemo,
  onReset,
  activeDemo,
}) {
  return (
    <div className="demo-presets-section">
      <div className="demo-presets-label">
        <FlaskConical size={14} className="text-muted" />
        <span>Pre-built Test Cases</span>
        <span className="demo-presets-hint">— Load sample lab panels for quick demo</span>
      </div>

      <div className="demo-presets-row">
        <button
          type="button"
          className={`btn btn-preset btn-preset-sm ${activeDemo === 'normal' ? 'active-normal' : ''}`}
          onClick={() => onLoadDemo('normal', DEMO_PRESETS.normal)}
        >
          <CheckCircle2 size={14} className="text-normal" />
          <span>Normal Panel</span>
          <span className="preset-count">{DEMO_PRESETS.normal.length}</span>
        </button>

        <button
          type="button"
          className={`btn btn-preset btn-preset-sm ${activeDemo === 'warning' ? 'active-warning' : ''}`}
          onClick={() => onLoadDemo('warning', DEMO_PRESETS.warning)}
        >
          <AlertTriangle size={14} className="text-warning" />
          <span>Warning Panel</span>
          <span className="preset-count">{DEMO_PRESETS.warning.length}</span>
        </button>

        <button
          type="button"
          className={`btn btn-preset btn-preset-sm ${activeDemo === 'critical' ? 'active-critical' : ''}`}
          onClick={() => onLoadDemo('critical', DEMO_PRESETS.critical)}
        >
          <AlertOctagon size={14} className="text-critical" />
          <span>Critical Panel</span>
          <span className="preset-count">{DEMO_PRESETS.critical.length}</span>
        </button>

        <button
          type="button"
          className="btn btn-ghost btn-preset-sm"
          onClick={onReset}
          title="Clear queue and results"
        >
          <RotateCcw size={14} />
          <span>Clear All</span>
        </button>
      </div>
    </div>
  );
}
