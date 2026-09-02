import React from 'react';
import { History, X, Trash2, Calendar, AlertOctagon, AlertTriangle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function HistoryDrawer({
  isOpen,
  onClose,
  historyBatches = [],
  onLoadBatch,
  onClearHistory
}) {
  if (!isOpen) return null;

  const formatDate = (isoString) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleString();
    } catch {
      return isoString;
    }
  };

  return (
    <div className="history-modal-backdrop animate-fade-in" onClick={onClose}>
      <div className="history-modal glass-card" onClick={(e) => e.stopPropagation()}>
        <div className="history-header">
          <div className="history-title-group">
            <History size={20} className="text-normal" />
            <h3>Persistent SQLite Analysis History</h3>
          </div>
          <div className="history-header-actions">
            {historyBatches.length > 0 && (
              <button
                type="button"
                className="btn btn-sm btn-secondary"
                onClick={onClearHistory}
                title="Clear all saved analyses in SQLite"
              >
                <Trash2 size={14} className="text-critical" />
                <span>Clear DB</span>
              </button>
            )}
            <button
              type="button"
              className="btn btn-sm btn-icon"
              onClick={onClose}
              title="Close history modal"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="history-body">
          {historyBatches.length === 0 ? (
            <div className="history-empty">
              <p>No past analyses recorded in SQLite database yet.</p>
              <span className="text-muted">Run an analysis above to persist your clinical results.</span>
            </div>
          ) : (
            <div className="history-list">
              {historyBatches.map((batch, idx) => (
                <div key={batch.batch_id || idx} className="history-item glass-card">
                  <div className="history-item-top">
                    <div className="history-date">
                      <Calendar size={14} className="text-muted" />
                      <span>{formatDate(batch.created_at)}</span>
                    </div>
                    <span className="history-total-tag">{batch.total_count} Tests Evaluated</span>
                  </div>

                  <div className="history-item-summary">
                    <span className="summary-pill pill-critical">
                      <AlertOctagon size={12} /> {batch.critical_count} Critical
                    </span>
                    <span className="summary-pill pill-warning">
                      <AlertTriangle size={12} /> {batch.warning_count} Warning
                    </span>
                    <span className="summary-pill pill-normal">
                      <CheckCircle2 size={12} /> {batch.normal_count} Normal
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
