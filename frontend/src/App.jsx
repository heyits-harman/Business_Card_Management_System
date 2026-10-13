import React, { useState } from 'react';
import Header from './components/Header';
import CardUploader from './components/CardUploader';
import TerminalPanel from './components/TerminalPanel';
import ReviewForm from './components/ReviewForm';
import DatabaseInspector from './components/DatabaseInspector';
import Toast from './components/Toast';
import logo from './assests/Golden-Terry-Towels.png';

import { scanCardImages, saveContactRecord, downloadExcelFile } from './services/api';

export default function App() {
  const [extractedData, setExtractedData] = useState(null);
  const [processedBy, setProcessedBy] = useState(null);
  const [scanDuplicateInfo, setScanDuplicateInfo] = useState(null);
  const [duplicateError, setDuplicateError] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [logs, setLogs] = useState([
    { text: 'System ready. Select business card images to process.', type: 'info', timestamp: new Date().toLocaleTimeString() }
  ]);
  const [savedRecords, setSavedRecords] = useState([]);
  const [toast, setToast] = useState(null);

  const addLog = (text, type = 'info') => {
    setLogs((prev) => [
      ...prev,
      { text, type, timestamp: new Date().toLocaleTimeString() }
    ]);
  };

  const showToast = (message, type = 'success', code = null) => {
    setToast({ message, type, code });
    setTimeout(() => {
      setToast(null);
    }, 5000);
  };

  // Handle Scanning Stage
  const handleScan = async (files) => {
    setIsScanning(true);
    setScanDuplicateInfo(null);
    setDuplicateError(null);
    addLog(`Scanning ${files.length} file(s)...`, 'info');
    
    try {
      const response = await scanCardImages(files);

      if (response.success) {
        setExtractedData(response.data);
        setProcessedBy(response.processed_by);

        if (response.is_duplicate) {
          setScanDuplicateInfo({
            isDuplicate: true,
            duplicateInfo: response.duplicate_info
          });
          addLog(`Duplicate Notice: ${response.duplicate_info}`, 'warning');
          showToast(response.duplicate_info, 'warning', 'DUPLICATE_WARNING');
        } else {
          addLog(`Extraction complete via ${response.processed_by}`, 'success');
          showToast(`Card parsed via ${response.processed_by}.`, 'success');
        }

        setTimeout(() => {
          document.getElementById('review')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        throw new Error(response.error || 'Extraction failed');
      }
    } catch (err) {
      addLog(`Scan Error: ${err.message}`, 'error');
      showToast(err.message, 'error', err.code || 'SCAN_FAILED');
    } finally {
      setIsScanning(false);
    }
  };

  // Handle Save Stage
  const handleSave = async (payload) => {
    setIsSaving(true);
    setDuplicateError(null);
    addLog('Saving record to database...', 'info');

    try {
      const response = await saveContactRecord(payload);
      if (response.success) {
        setScanDuplicateInfo(null);
        addLog(`Record saved to database. Assigned to: ${payload.assigned_to || 'Unassigned'}`, 'success');
        showToast('Lead successfully saved and assigned!', 'success');
        setSavedRecords((prev) => [payload, ...prev]);
      } else {
        throw new Error(response.error || 'Save failed');
      }
    } catch (err) {
      if (err.code === 'DUPLICATE_CARD') {
        setDuplicateError(err.message);
        addLog(`Duplicate Error: ${err.message}`, 'warning');
        showToast(err.message, 'warning', 'DUPLICATE_CARD');
      } else {
        addLog(`Save Error: ${err.message}`, 'error');
        showToast(err.message, 'error', err.code || 'SAVE_FAILED');
      }
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Download Excel
  const handleDownloadExcel = async () => {
    try {
      addLog('Downloading Excel database...', 'info');
      await downloadExcelFile();
      addLog('Excel file downloaded.', 'success');
      showToast('Excel file downloaded.', 'success');
    } catch (err) {
      addLog(`Download Error: ${err.message}`, 'error');
      showToast(err.message, 'error', 'DOWNLOAD_FAILED');
    }
  };

  return (
    <div className="min-h-screen bg-paper text-obsidian flex flex-col font-sans">
      
      {/* Top Header */}
      <Header
        onDownloadExcel={handleDownloadExcel}
        totalSavedCount={savedRecords.length}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-5xl mx-auto px-6 py-10 w-full space-y-12">
        
        {/* Upper Grid: Ingestion & Live Execution Logs */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7">
            <CardUploader onScan={handleScan} isScanning={isScanning} />
          </div>
          
          <div className="lg:col-span-5">
            <TerminalPanel
              logs={logs}
              onClear={() => setLogs([])}
            />
          </div>
        </div>

        {/* Verification & Review Form */}
        <div className="w-full">
          <ReviewForm
            initialData={extractedData}
            processedBy={processedBy}
            scanDuplicateInfo={scanDuplicateInfo}
            duplicateError={duplicateError}
            onSave={handleSave}
            isSaving={isSaving}
          />
        </div>

        {/* Database Records Table */}
        <div className="w-full">
          <DatabaseInspector
            savedRecords={savedRecords}
            onDownloadExcel={handleDownloadExcel}
          />
        </div>

      </main>

      {/* Toast Alert Banner */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Minimalist Footer */}
      <footer className="border-t border-hairline py-8 bg-paper text-stone text-xs font-mono">
        <div className="max-w-5xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <img src={logo} alt="Golden Terry Towels Logo" className="h-6 w-auto object-contain" />
            <span className="text-slate">|</span>
            <span>Business Card System</span>
          </div>

          <div>
            Local OCR + Gemini Vision AI
          </div>
        </div>
      </footer>

    </div>
  );
}
