import React from 'react';
import { CheckCircle2, AlertTriangle, AlertOctagon, RotateCcw, FileSpreadsheet, History } from 'lucide-react';

export default function SamplePresets({
  onSelectCategory,
  onReset,
  activeCategory,
  panelCounts = { normal: 0, warning: 0, critical: 0 },
  onToggleHistory,
  historyCount = 0
}) {
  return (
    <div className="presets-container glass-card">
      <div className="presets-header">
        <span className="presets-title">Lab Test Categories:</span>
        <span className="presets-hint">Select a category to manage, or drop a CSV file to load lab tests</span>
      </div>

      <div className="presets-buttons">
        <button
          type="button"
          className={`btn btn-preset ${activeCategory === 'normal' ? 'active-normal' : ''}`}
          onClick={() => onSelectCategory('normal')}
        >
          <CheckCircle2 size={16} className="text-normal" />
          <span>Normal</span>
          {panelCounts.normal > 0 && (
            <span className="filter-count-badge badge-normal" style={{ marginLeft: '4px' }}>
              {panelCounts.normal}
            </span>
          )}
        </button>

        <button
          type="button"
          className={`btn btn-preset ${activeCategory === 'warning' ? 'active-warning' : ''}`}
          onClick={() => onSelectCategory('warning')}
        >
          <AlertTriangle size={16} className="text-warning" />
          <span>Warning</span>
          {panelCounts.warning > 0 && (
            <span className="filter-count-badge badge-warning" style={{ marginLeft: '4px' }}>
              {panelCounts.warning}
            </span>
          )}
        </button>

        <button
          type="button"
          className={`btn btn-preset ${activeCategory === 'critical' ? 'active-critical' : ''}`}
          onClick={() => onSelectCategory('critical')}
        >
          <AlertOctagon size={16} className="text-critical" />
          <span>Critical</span>
          {panelCounts.critical > 0 && (
            <span className="filter-count-badge badge-critical" style={{ marginLeft: '4px' }}>
              {panelCounts.critical}
            </span>
          )}
        </button>

        <button
          type="button"
          className="btn btn-secondary btn-reset"
          onClick={onReset}
          title="Clear current category queue and results"
        >
          <RotateCcw size={15} />
          <span>Clear</span>
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

