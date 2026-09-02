import React, { useState, useEffect, useRef } from 'react';
import Header from './components/Header';
import SamplePresets from './components/SamplePresets';
import CsvUploader from './components/CsvUploader';
import LabEntryForm from './components/LabEntryForm';
import SummaryBanner from './components/SummaryBanner';
import SeverityFilter from './components/SeverityFilter';
import ResultCard from './components/ResultCard';
import HistoryDrawer from './components/HistoryDrawer';
import { AlertCircle, Sparkles, Loader2 } from 'lucide-react';
import './App.css';

const API_BASE_URL = 'http://127.0.0.1:8000';

export default function App() {
  const [labs, setLabs] = useState([{ test_name: '', value: '', unit: '' }]);
  const [activeDemo, setActiveDemo] = useState(null);
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [backendOnline, setBackendOnline] = useState(true);
  const [historyBatches, setHistoryBatches] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState('');

  const resultsRef = useRef(null);

  // Load history on mount
  const fetchHistory = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/history`);
      if (res.ok) {
        const data = await res.json();
        setHistoryBatches(data || []);
      }
    } catch (err) {
      console.warn("Could not load history:", err);
    }
  };

  useEffect(() => {
    const checkBackendAndInit = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/health`);
        if (res.ok) {
          setBackendOnline(true);
          fetchHistory();
        } else {
          setBackendOnline(false);
        }
      } catch (err) {
        setBackendOnline(false);
      }
    };
    checkBackendAndInit();
  }, []);

  const handleLoadDemo = (demoKey, demoData) => {
    setActiveDemo(demoKey);
    setLabs(JSON.parse(JSON.stringify(demoData)));
    setResults([]);
    setSummary('');
    setErrorMessage('');
  };

  const handleReset = () => {
    setActiveDemo(null);
    setLabs([{ test_name: '', value: '', unit: '' }]);
    setResults([]);
    setSummary('');
    setErrorMessage('');
    setActiveFilter('ALL');
  };

  const handleLabsLoaded = (newLabs, fileName) => {
    setActiveDemo(null);
    setLabs(newLabs);
    setResults([]);
    setSummary('');
    setErrorMessage('');
  };

  const handleClearHistory = async () => {
    try {
      await fetch(`${API_BASE_URL}/history`, { method: 'DELETE' });
      setHistoryBatches([]);
      setResults([]);
      setSummary('');
      setShowHistory(false);
    } catch (err) {
      console.error("Failed to clear history:", err);
    }
  };

  const handleUpdateLab = (index, field, value) => {
    const updated = [...labs];
    updated[index] = { ...updated[index], [field]: value };
    setLabs(updated);
    setActiveDemo(null);
  };

  const handleAddRow = () => {
    setLabs([...labs, { test_name: '', value: '', unit: '' }]);
  };

  const handleRemoveRow = (index) => {
    if (labs.length <= 1) {
      setLabs([{ test_name: '', value: '', unit: '' }]);
      return;
    }
    const updated = labs.filter((_, i) => i !== index);
    setLabs(updated);
  };

  const validLabCount = labs.filter(l => l.test_name.trim() && l.value.trim()).length;

  const handleAnalyze = async () => {
    const validLabs = labs.filter(l => l.test_name.trim() && l.value.trim());
    if (validLabs.length === 0) {
      setErrorMessage("Please enter or upload at least one valid lab test name and value.");
      return;
    }

    setIsLoading(true);
    setErrorMessage('');
    setAnalysisProgress('Initializing AI agent pipeline...');

    // Simulate progress updates
    const progressMessages = [
      'Connecting to MCP server...',
      'Running severity classification...',
      'Generating clinical explanations...',
      'Compiling analysis report...',
    ];
    let progressIdx = 0;
    const progressTimer = setInterval(() => {
      progressIdx = Math.min(progressIdx + 1, progressMessages.length - 1);
      setAnalysisProgress(progressMessages[progressIdx]);
    }, 2500);

    try {
      const response = await fetch(`${API_BASE_URL}/analyze_labs`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ labs: validLabs }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `Server returned error ${response.status}`);
      }

      const data = await response.json();
      setResults(data.results || []);
      setSummary(data.summary || '');
      setActiveFilter('ALL');
      setBackendOnline(true);
      fetchHistory();

      // Auto-scroll to results after a brief delay for render
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 200);
    } catch (err) {
      console.error("Analysis error:", err);
      setErrorMessage(err.message || 'Failed to connect to AI analysis backend. Ensure the backend server is running on port 8000.');
    } finally {
      clearInterval(progressTimer);
      setIsLoading(false);
      setAnalysisProgress('');
    }
  };

  // Filtered results
  const filteredResults = results.filter(r => {
    if (activeFilter === 'ALL') return true;
    return r.status === activeFilter;
  });

  const counts = {
    all: results.length,
    critical: results.filter(r => r.status === 'Critical').length,
    warning: results.filter(r => r.status === 'Warning').length,
    normal: results.filter(r => r.status === 'Normal').length,
  };

  return (
    <div className="app-container">
      {/* Header */}
      <Header
        backendOnline={backendOnline}
        onToggleHistory={() => setShowHistory(true)}
        historyCount={historyBatches.length}
      />

      {/* ─── Primary Action Bar ─── */}
      <div className="action-bar glass-card">
        <div className="action-bar-info">
          <span className="action-bar-label">
            {validLabCount > 0
              ? `${validLabCount} test${validLabCount !== 1 ? 's' : ''} ready for analysis`
              : 'Add lab tests below to begin'}
          </span>
          {activeDemo && (
            <span className="action-bar-demo-tag">Demo: {activeDemo}</span>
          )}
        </div>
        <button
          type="button"
          className="btn btn-primary btn-analyze-main"
          onClick={handleAnalyze}
          disabled={isLoading || validLabCount === 0}
        >
          {isLoading ? (
            <>
              <Loader2 className="spinner" size={18} />
              <span>Analyzing...</span>
            </>
          ) : (
            <>
              <Sparkles size={18} />
              <span>Run AI Analysis</span>
            </>
          )}
        </button>
      </div>

      {/* Loading Overlay */}
      {isLoading && (
        <div className="loading-overlay animate-fade-in">
          <div className="loading-card glass-card">
            <div className="loading-ring">
              <svg viewBox="0 0 100 100" className="progress-ring-svg">
                <circle className="ring-bg" cx="50" cy="50" r="42" />
                <circle className="ring-fg" cx="50" cy="50" r="42" />
              </svg>
              <Sparkles size={24} className="loading-center-icon" />
            </div>
            <div className="loading-text-group">
              <h3 className="loading-title">AI Agent Processing</h3>
              <p className="loading-status">{analysisProgress}</p>
              <p className="loading-sub">
                Analyzing {validLabCount} test{validLabCount !== 1 ? 's' : ''} with LangGraph + MCP pipeline
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Error Callout */}
      {errorMessage && (
        <div className="upload-error-banner animate-fade-in" style={{ marginBottom: '20px' }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Intake Grid: CSV dropzone & Manual Table */}
      <div className="input-grid">
        <CsvUploader onLabsLoaded={handleLabsLoaded} />
        <LabEntryForm
          labs={labs}
          onUpdateLab={handleUpdateLab}
          onAddRow={handleAddRow}
          onRemoveRow={handleRemoveRow}
        />
      </div>

      {/* Demo Presets — Clearly separated */}
      <SamplePresets
        onLoadDemo={handleLoadDemo}
        onReset={handleReset}
        activeDemo={activeDemo}
      />

      {/* ─── Results Section ─── */}
      <div ref={resultsRef}>
        {results.length > 0 && (
          <section className="results-section animate-fade-in">
            <SummaryBanner summary={summary} results={results} />
            <SeverityFilter
              activeFilter={activeFilter}
              onFilterChange={setActiveFilter}
              counts={counts}
            />
            <div className="results-grid">
              {filteredResults.map((res, idx) => (
                <ResultCard key={`${res.test_name}-${res.value}-${res.status}-${idx}`} result={res} index={idx} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* SQLite History Drawer */}
      <HistoryDrawer
        isOpen={showHistory}
        onClose={() => setShowHistory(false)}
        historyBatches={historyBatches}
        onClearHistory={handleClearHistory}
      />
    </div>
  );
}
