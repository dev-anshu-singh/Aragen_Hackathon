import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, RotateCcw, FlaskConical } from 'lucide-react';

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
