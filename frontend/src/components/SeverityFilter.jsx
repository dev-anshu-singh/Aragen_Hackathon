import React from 'react';
import { Filter, AlertOctagon, AlertTriangle, CheckCircle2, ListFilter } from 'lucide-react';

export default function SeverityFilter({ activeFilter, onFilterChange, counts }) {
  return (
    <div className="filter-bar glass-card">
      <div className="filter-title">
        <ListFilter size={18} className="text-muted" />
        <span>Filter Severity:</span>
      </div>

      <div className="filter-buttons">
        <button
          type="button"
          className={`filter-btn ${activeFilter === 'ALL' ? 'active' : ''}`}
          onClick={() => onFilterChange('ALL')}
        >
          <span>All Results</span>
          <span className="filter-count-badge">{counts.all}</span>
        </button>

        <button
          type="button"
          className={`filter-btn filter-critical ${activeFilter === 'Critical' ? 'active' : ''}`}
          onClick={() => onFilterChange('Critical')}
        >
          <AlertOctagon size={14} className="text-critical" />
          <span>Critical</span>
          <span className="filter-count-badge badge-critical">{counts.critical}</span>
        </button>

        <button
          type="button"
          className={`filter-btn filter-warning ${activeFilter === 'Warning' ? 'active' : ''}`}
          onClick={() => onFilterChange('Warning')}
        >
          <AlertTriangle size={14} className="text-warning" />
          <span>Warning</span>
          <span className="filter-count-badge badge-warning">{counts.warning}</span>
        </button>

        <button
          type="button"
          className={`filter-btn filter-normal ${activeFilter === 'Normal' ? 'active' : ''}`}
          onClick={() => onFilterChange('Normal')}
        >
          <CheckCircle2 size={14} className="text-normal" />
          <span>Normal</span>
          <span className="filter-count-badge badge-normal">{counts.normal}</span>
        </button>
      </div>
    </div>
  );
}
