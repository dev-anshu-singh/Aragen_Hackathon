import React from 'react';
import { Plus, Trash2, Beaker } from 'lucide-react';

const COMMON_TESTS = [
  { name: "Hemoglobin", unit: "g/dL" },
  { name: "Glucose", unit: "mg/dL" },
  { name: "HbA1c", unit: "%" },
  { name: "TSH", unit: "mU/L" },
  { name: "Free T4", unit: "ng/dL" },
  { name: "Insulin", unit: "mU/L" },
  { name: "Ferritin", unit: "ug/L" },
  { name: "WBC", unit: "10^3/uL" },
  { name: "Platelets", unit: "10^3/uL" },
  { name: "Total IgE", unit: "KU/L" },
  { name: "Protein (Strip)", unit: "-" },
  { name: "Glucose (Strip)", unit: "-" },
  { name: "Bilirubin (Strip)", unit: "-" },
  { name: "Nitrit (Strip)", unit: "-" }
];

export default function LabEntryForm({
  labs,
  onUpdateLab,
  onAddRow,
  onRemoveRow,
}) {
  const handleTestNameChange = (index, value) => {
    onUpdateLab(index, 'test_name', value);
    // Auto-fill unit if test matches known test
    const matched = COMMON_TESTS.find(t => t.name.toLowerCase() === value.trim().toLowerCase());
    if (matched && !labs[index].unit) {
      onUpdateLab(index, 'unit', matched.unit);
    }
  };

  return (
    <div className="lab-entry-section glass-card">
      <div className="section-header">
        <div className="section-title-group">
          <Beaker className="section-icon" size={20} />
          <h2>Lab Results Queue</h2>
          <span className="queue-count-pill">{labs.length} {labs.length === 1 ? 'test' : 'tests'}</span>
        </div>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={onAddRow}
        >
          <Plus size={16} />
          <span>Add Row</span>
        </button>
      </div>

      <div className="table-responsive">
        <table className="lab-input-table">
          <thead>
            <tr>
              <th style={{ width: '40%' }}>Test Name</th>
              <th style={{ width: '30%' }}>Observed Value / Result</th>
              <th style={{ width: '20%' }}>Unit</th>
              <th style={{ width: '10%', textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {labs.map((lab, idx) => (
              <tr key={idx} className="lab-input-row animate-fade-in">
                <td>
                  <div className="input-with-datalist">
                    <input
                      type="text"
                      list="common-tests-list"
                      className="form-control"
                      placeholder="e.g. Hemoglobin, Glucose..."
                      value={lab.test_name}
                      onChange={(e) => handleTestNameChange(idx, e.target.value)}
                    />
                  </div>
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. 7.2 or 2+ or Negatif"
                    value={lab.value}
                    onChange={(e) => onUpdateLab(idx, 'value', e.target.value)}
                  />
                </td>
                <td>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="e.g. g/dL, mg/dL, -"
                    value={lab.unit}
                    onChange={(e) => onUpdateLab(idx, 'unit', e.target.value)}
                  />
                </td>
                <td style={{ textAlign: 'center' }}>
                  <button
                    type="button"
                    className="btn-icon-danger"
                    onClick={() => onRemoveRow(idx)}
                    disabled={labs.length <= 1}
                    title="Remove row"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <datalist id="common-tests-list">
        {COMMON_TESTS.map((t, idx) => (
          <option key={idx} value={t.name}>{t.name} ({t.unit})</option>
        ))}
      </datalist>

      <div className="form-footer-hint">
        <span>💡 Accepts numeric values (14.2) or qualitative strip results (Negatif, 1+, 2+)</span>
      </div>
    </div>
  );
}
