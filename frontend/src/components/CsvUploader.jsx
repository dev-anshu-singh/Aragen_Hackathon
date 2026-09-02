import React, { useState, useRef } from 'react';
import { UploadCloud, FileSpreadsheet, Check, AlertCircle } from 'lucide-react';

export default function CsvUploader({ onLabsLoaded }) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState('');
  const [uploadError, setUploadError] = useState('');
  const fileInputRef = useRef(null);

  const parseCsvText = (text) => {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) {
      throw new Error("CSV file is empty or missing data rows.");
    }

    const headers = lines[0].split(',').map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));
    
    // Find column indexes
    let nameIdx = headers.findIndex(h => h.includes('test') || h.includes('name'));
    let valIdx = headers.findIndex(h => h.includes('result') || h.includes('val') || h.includes('value'));
    let unitIdx = headers.findIndex(h => h.includes('unit'));

    if (nameIdx === -1) nameIdx = 0;
    if (valIdx === -1) valIdx = 1;
    if (unitIdx === -1) unitIdx = 2;

    const parsedLabs = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const cols = line.split(',').map(c => c.trim().replace(/^["']|["']$/g, ''));
      if (cols.length >= 2) {
        const test_name = cols[nameIdx] || `Test ${i}`;
        const value = cols[valIdx] !== undefined ? cols[valIdx] : '';
        const unit = (unitIdx < cols.length && cols[unitIdx]) ? cols[unitIdx] : '-';

        if (test_name.trim() && value.trim()) {
          parsedLabs.push({ test_name: test_name.trim(), value: value.trim(), unit: unit.trim() });
        }
      }
    }

    if (parsedLabs.length === 0) {
      throw new Error("Could not parse any valid lab records from CSV.");
    }

    return parsedLabs;
  };

  const handleFile = (file) => {
    if (!file) return;
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv') {
      setUploadError('Please select a valid .csv file.');
      return;
    }

    setUploadError('');
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const text = e.target.result;
        const labs = parseCsvText(text);
        onLabsLoaded(labs, file.name);
      } catch (err) {
        setUploadError(err.message || 'Error parsing CSV file');
      }
    };
    reader.onerror = () => setUploadError('Failed to read file');
    reader.readAsText(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  return (
    <div className="csv-uploader-box">
      <div
        className={`dropzone ${isDragging ? 'dropzone-active' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden-file-input"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
              e.target.value = '';
            }
          }}
        />

        <div className="dropzone-icon-circle">
          <UploadCloud className="upload-icon" size={28} />
        </div>

        <div className="dropzone-content">
          <p className="dropzone-primary-text">
            <strong>Drop CSV file here</strong> or click to browse
          </p>
          <p className="dropzone-sub-text">
            Supports columns: Test_Name, Result, Unit (e.g. Kaggle dataset format)
          </p>
        </div>

        {fileName && !uploadError && (
          <div className="file-loaded-badge">
            <FileSpreadsheet size={14} />
            <span>{fileName}</span>
            <Check size={14} className="text-normal" />
          </div>
        )}
      </div>

      {uploadError && (
        <div className="upload-error-banner animate-fade-in">
          <AlertCircle size={16} />
          <span>{uploadError}</span>
        </div>
      )}
    </div>
  );
}
