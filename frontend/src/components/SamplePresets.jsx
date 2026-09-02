import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, RotateCcw } from 'lucide-react';

export const PRESET_DATA = {
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

export default function SamplePresets({ onSelectPreset, onReset, activePreset }) {
  return (
    <div className="presets-container glass-card">
      <div className="presets-header">
        <span className="presets-title">Quick Demo Presets:</span>
        <span className="presets-hint">Load pre-validated patient panels for instant evaluation</span>
      </div>

      <div className="presets-buttons">
        <button
          type="button"
          className={`btn btn-preset ${activePreset === 'normal' ? 'active-normal' : ''}`}
          onClick={() => onSelectPreset('normal', PRESET_DATA.normal)}
        >
          <CheckCircle2 size={16} className="text-normal" />
          <span>Normal Panel (11 tests)</span>
        </button>

        <button
          type="button"
          className={`btn btn-preset ${activePreset === 'warning' ? 'active-warning' : ''}`}
          onClick={() => onSelectPreset('warning', PRESET_DATA.warning)}
        >
          <AlertTriangle size={16} className="text-warning" />
          <span>Warning Panel (8 tests)</span>
        </button>

        <button
          type="button"
          className={`btn btn-preset ${activePreset === 'critical' ? 'active-critical' : ''}`}
          onClick={() => onSelectPreset('critical', PRESET_DATA.critical)}
        >
          <AlertOctagon size={16} className="text-critical" />
          <span>Critical Panel (8 tests)</span>
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-reset"
          onClick={onReset}
          title="Clear all inputs and results"
        >
          <RotateCcw size={15} />
          <span>Clear</span>
        </button>
      </div>
    </div>
  );
}
