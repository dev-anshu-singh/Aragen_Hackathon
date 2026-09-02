import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import SamplePresets, { PRESET_DATA } from './components/SamplePresets';
import CsvUploader from './components/CsvUploader';
import LabEntryForm from './components/LabEntryForm';
import SummaryBanner from './components/SummaryBanner';
import SeverityFilter from './components/SeverityFilter';
import ResultCard from './components/ResultCard';
import HistoryDrawer from './components/HistoryDrawer';
import { AlertCircle, Stethoscope, Sparkles } from 'lucide-react';
import './App.css';

const API_BASE_URL = 'http://127.0.0.1:8000';

export default function App() {
  const [labs, setLabs] = useState([{ test_name: '', value: '', unit: '' }]);
  const [activePreset, setActivePreset] = useState(null);
  const [uploadedFileName, setUploadedFileName] = useState(null);
  const [results, setResults] = useState([]);
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [activeFilter, setActiveFilter] = useState('ALL');
  const [backendOnline, setBackendOnline] = useState(true);
  const [historyBatches, setHistoryBatches] = useState([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load history and latest analysis on mount
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
          // Load latest saved analysis if any
          const latestRes = await fetch(`${API_BASE_URL}/history/latest`);
          if (latestRes.ok) {
            const latestData = await latestRes.json();
            if (latestData && latestData.results && latestData.results.length > 0) {
              setResults(latestData.results);
              setSummary(latestData.summary || '');
              // Sync input table with the latest saved tests
              setLabs(latestData.results.map(r => ({
                test_name: r.test_name,
                value: r.value,
                unit: r.unit
              })));
            }
          }
        } else {
          setBackendOnline(false);
        }
      } catch (err) {
        setBackendOnline(false);
      }
    };
    checkBackendAndInit();
  }, []);

  const handleSelectPreset = (presetKey, data) => {
    setActivePreset(presetKey);
    setUploadedFileName(null);
    setLabs(JSON.parse(JSON.stringify(data)));
    setResults([]);
    setSummary('');
    setErrorMessage('');
  };

  const handleReset = () => {
    setActivePreset(null);
    setUploadedFileName(null);
    setLabs([{ test_name: '', value: '', unit: '' }]);
    setResults([]);
    setSummary('');
    setErrorMessage('');
    setActiveFilter('ALL');
  };

  const handleLabsLoaded = (newLabs, fileName) => {
    setActivePreset(null);
    setUploadedFileName(fileName);
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
    updated[index][field] = value;
    setLabs(updated);
    setActivePreset(null);
  };

  const handleAddRow = () => {
    setLabs([...labs, { test_name: '', value: '', unit: '' }]);
  };

  const handleRemoveRow = (index) => {
    if (labs.length <= 1) return;
    const updated = labs.filter((_, i) => i !== index);
    setLabs(updated);
  };

  const handleAnalyze = async () => {
    // Validate that at least one valid lab is provided
    const validLabs = labs.filter(l => l.test_name.trim() && l.value.trim());
    if (validLabs.length === 0) {
      setErrorMessage('Please enter at least one valid lab test name and value.');
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

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
    } catch (err) {
      console.error("Analysis error:", err);
      setErrorMessage(err.message || 'Failed to connect to AI analysis backend. Ensure the backend server is running on port 8000.');
    } finally {
      setIsLoading(false);
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
      <Header backendOnline={backendOnline} />

      {/* Preset Pickers & Dynamic Upload Status */}
      <SamplePresets
        onSelectPreset={handleSelectPreset}
        onReset={handleReset}
        activePreset={activePreset}
        uploadedFileName={uploadedFileName}
        uploadedCount={labs.length}
        onToggleHistory={() => setShowHistory(true)}
        historyCount={historyBatches.length}
      />

      {/* Intake Grid: CSV dropzone & Manual Table */}
      <div className="input-grid">
        <CsvUploader onLabsLoaded={handleLabsLoaded} />
        <LabEntryForm
          labs={labs}
          onUpdateLab={handleUpdateLab}
          onAddRow={handleAddRow}
          onRemoveRow={handleRemoveRow}
          onAnalyze={handleAnalyze}
          isLoading={isLoading}
        />
      </div>

      {/* Error Callout */}
      {errorMessage && (
        <div className="upload-error-banner animate-fade-in" style={{ marginBottom: '24px' }}>
          <AlertCircle size={18} />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Results Presentation */}
      {results.length > 0 && (
        <section className="results-section animate-fade-in">
          {/* Summary Banner & Metrics */}
          <SummaryBanner summary={summary} results={results} />

          {/* Severity Filter Tabs */}
          <SeverityFilter
            activeFilter={activeFilter}
            onFilterChange={setActiveFilter}
            counts={counts}
          />

          {/* Result Cards Grid */}
          <div className="results-grid">
            {filteredResults.map((res, idx) => (
              <ResultCard key={`${res.test_name}-${res.value}-${res.status}-${idx}`} result={res} index={idx} />
            ))}
          </div>
        </section>
      )}

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
