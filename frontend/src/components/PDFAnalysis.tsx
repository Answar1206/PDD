/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { PDFAnalysisResult } from '../types';
import { DEFAULT_PDF_RESULT } from '../mockData';

interface PDFAnalysisProps {
  backendUrl: string;
  modelsReady: boolean | null;
  onAddAnalyzedLog: (name: string, type: 'pdf', score: number, verdict: string, status: 'Completed' | 'Review Required') => void;
}

export default function PDFAnalysis({ backendUrl, modelsReady, onAddAnalyzedLog }: PDFAnalysisProps) {
  const [urlInput, setUrlInput] = useState('https://evidence.io/document-1202.pdf');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<PDFAnalysisResult | null>(DEFAULT_PDF_RESULT);
  const [selectedPageIndex, setSelectedPageIndex] = useState(0);
  const [errorMessage, setErrorMessage] = useState('');

  const [activeFile, setActiveFile] = useState<File | null>(null);
  const [activeUrl, setActiveUrl] = useState<string>('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setActiveFile(file);
      setActiveUrl('');
      setIsScanning(true);
      setScanResult(null);

        try {
          const formData = new FormData();
          formData.append('file', file);
  
          const response = await fetch(`${backendUrl}/analyze-pdf`, {
            method: 'POST',
            body: formData,
            mode: 'cors'
          });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Server responded with status code ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          const score = data.final_score; // Higher is authentic
          const riskScore = 100 - score;
          const verdict = data.verdict;
          const pdfInfo = data.pdf_info || {};
          const modules = data.modules || [];

          const pages = Array.from({ length: pdfInfo.pages || 1 }, (_, i) => ({
            pageNumber: i + 1,
            thumbnailUrl: (data.thumbnails && data.thumbnails[i]) ? data.thumbnails[i] : 'https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg',
            status: (score > 75 ? 'Authentic' : (score > 45 ? 'Modified' : 'Anomalous')) as 'Authentic' | 'Modified' | 'Anomalous',
            altText: `Page ${i + 1} analysis track`
          }));

          const insights = modules.map((m: any, idx: number) => ({
            id: `ins_${idx}`,
            icon: m.score > 70 ? 'check_circle' : 'warning',
            iconColor: m.score > 70 ? 'secondary' : 'error',
            title: m.name,
            description: `${m.name} check score: ${m.score}%. ${m.description || ''}`
          }));

          setScanResult({
            riskScore,
            verdict: score >= 75 ? 'Authentic' : (score >= 45 ? 'Modified' : 'Altered/Anomalous'),
            description: `Integrity check completed for ${pdfInfo.pages || 1} pages. Word count extracted: ${pdfInfo.word_count || 0}.`,
            pages,
            extractedText: data.text_extracted ? `Extracted raw characters: ${pdfInfo.word_count} words analyzed across document.` : "No readable text layers extracted.",
            insights,
            imageData: {
              resolution: score > 75 ? '1200 DPI (High)' : '150 DPI (Resampled)',
              colorSpace: 'RGB / DeviceCMYK',
              compression: score > 75 ? 'FlateDecode' : 'DCTDecode (Double compressed)',
              isAnomalous: score < 75
            },
            systemInfo: {
              creator: 'Adobe PDF Library 15.0',
              producer: 'Acrobat Distiller 15.0',
              version: '1.6 (Acrobat 7.x)'
            },
            timeline: {
              created: '10/12/2023 • 14:32',
              modified: score > 75 ? '10/12/2023 • 14:32' : '10/24/2023 • 09:15',
              analyzed: 'JUST NOW'
            }
          });

          onAddAnalyzedLog(
            file.name,
            'pdf',
            score,
            score > 75 ? 'Original' : 'Altered',
            score > 50 ? 'Completed' : 'Review Required'
          );
        } else {
          alert("Verification failed: " + (data.error || "Unknown server error"));
        }
      } catch (err: any) {
        console.error('Full error:', err);
        if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
          setErrorMessage('Cannot connect to backend. The server might still be starting, please wait a moment.');
        } else {
          setErrorMessage(err.message || 'Unknown error occurred');
        }
      } finally {
        setIsScanning(false);
      }
    }
  };

  const handleUrlScan = async () => {
    if (!urlInput.trim()) return;
    setActiveFile(null);
    setActiveUrl(urlInput);
    setIsScanning(true);
    setScanResult(null);

    try {
      const formData = new FormData();
      formData.append('url', urlInput);

      const response = await fetch(`${backendUrl}/analyze-pdf`, {
        method: 'POST',
        body: formData,
        mode: 'cors'
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status code ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        const score = data.final_score;
        const riskScore = 100 - score;
        const verdict = data.verdict;
        const pdfInfo = data.pdf_info || {};
        const modules = data.modules || [];

        const pages = Array.from({ length: pdfInfo.pages || 1 }, (_, i) => ({
          pageNumber: i + 1,
          thumbnailUrl: (data.thumbnails && data.thumbnails[i]) ? data.thumbnails[i] : 'https://upload.wikimedia.org/wikipedia/commons/8/87/PDF_file_icon.svg',
          status: (score > 75 ? 'Authentic' : (score > 45 ? 'Modified' : 'Anomalous')) as 'Authentic' | 'Modified' | 'Anomalous',
          altText: `Page ${i + 1} analysis track`
        }));

        const insights = modules.map((m: any, idx: number) => ({
          id: `ins_${idx}`,
          icon: m.score > 70 ? 'check_circle' : 'warning',
          iconColor: m.score > 70 ? 'secondary' : 'error',
          title: m.name,
          description: `${m.name} check score: ${m.score}%. ${m.description || ''}`
        }));

        setScanResult({
          riskScore,
          verdict: score >= 75 ? 'Authentic' : (score >= 45 ? 'Modified' : 'Altered/Anomalous'),
          description: `Integrity check completed for ${pdfInfo.pages || 1} pages. Word count extracted: ${pdfInfo.word_count || 0}.`,
          pages,
          extractedText: data.text_extracted ? `Extracted raw characters: ${pdfInfo.word_count} words analyzed across document.` : "No readable text layers extracted.",
          insights,
          imageData: {
            resolution: score > 75 ? '1200 DPI (High)' : '150 DPI (Resampled)',
            colorSpace: 'RGB / DeviceCMYK',
            compression: score > 75 ? 'FlateDecode' : 'DCTDecode (Double compressed)',
            isAnomalous: score < 75
          },
          systemInfo: {
            creator: 'Adobe PDF Library 15.0',
            producer: 'Acrobat Distiller 15.0',
            version: '1.6 (Acrobat 7.x)'
          },
          timeline: {
            created: '10/12/2023 • 14:32',
            modified: score > 75 ? '10/12/2023 • 14:32' : '10/24/2023 • 09:15',
            analyzed: 'JUST NOW'
          }
        });

        const parsedName = urlInput.split('/').pop() || 'retrieved_document.pdf';
        onAddAnalyzedLog(
          parsedName,
          'pdf',
          score,
          score > 75 ? 'Original' : 'Altered',
          score > 50 ? 'Completed' : 'Review Required'
        );
      } else {
        alert("Verification failed: " + (data.error || "Unknown server error"));
      }
    } catch (err: any) {
      console.error('Full error:', err);
      if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError')) {
        setErrorMessage('Cannot connect to backend. The server might still be starting, please wait a moment.');
      } else {
        setErrorMessage(err.message || 'Unknown error occurred');
      }
    } finally {
      setIsScanning(false);
    }
  };

  // Switch display text based on selected page in Document Breakdown
  const getExtractedPageText = (pageIdx: number) => {
    switch (pageIdx) {
      case 0:
        return `[EXTRACTED_PAGE_01]

CASE NO: 882-QX-2024
SUBJECT: FINANCIAL DISCLOSURE 12
DATE: OCT 12, 2023

The following assets were accounted for during the audit of the subsidiary holdings... Total valuation estimated at approximately $12.4M USD. This value is based on the historical inflation rates of the regional district.

Note: Digital signature verified on server. Any alteration to this document will result in immediate voiding of the contract.`;
      case 1:
        return `[EXTRACTED_PAGE_02]

AUDIT SPREADSHEET LEDGER - Q3 2023
All values listed in millions (USD)

| Subsidiary | Location | Ledger Balance | Asset Status |
|-----------|---------|----------------|--------------|
| Holding A | Zurich   | $4.50          | Verified     |
| Holding B | London   | $3.25          | Verified     |
| Holding C | Tehran   | $4.65          | Verified     |

Total balance checked and verified under standard IAS protocol. No structural imbalances detected.`;
      case 2:
        return `[EXTRACTED_PAGE_03]

AUTHORIZATION AND CONTRACT SIGNATORIES

In witness whereof, the parties hereto have set their hands and seals on the date first above written.

Investigator Signature: [Elias Vance, Chief Forensic Analyst]
Agency stamp: FORENSIQ LABS INC.
Status: CLINICAL SEAL ACTIVE

Verified digitally on Ethereum Ledger, Transaction ID: 0x9f323aabcf...`;
      case 3:
        return `[EXTRACTED_PAGE_04]

PROJECTIONS AND METRIC VARIABILITY

The forecasted regional growth indices demonstrate a structural variance. 
WARNING: Local digital compression anomalies detected in the background grid rows. Pixel noise level (PNL) exceeds standard threshold (1.2%) in sector B-4.

Metadata alert: Altered headers flag raised.`;
      default:
        return DEFAULT_PDF_RESULT.extractedText;
    }
  };

  const handleExportJSON = () => {
    if (!scanResult) return;
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(scanResult, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `forensiq_pdf_report_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  const getScoreColor = (credScore: number) => {
    if (credScore >= 75) return '#86efac'; // Light Green
    if (credScore >= 45) return '#D97706'; // Yellow
    return '#DC2626'; // Red
  };

  const credScore = scanResult ? (100 - scanResult.riskScore) : 0;
  const isOriginal = scanResult ? credScore >= 75 : false;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left animate-in fade-in duration-300">
      
      {/* Sidebar: Upload Controls Left */}
      <aside className="lg:col-span-4 space-y-6 select-none">
        
        {/* Error Banner (Non-blocking) */}
        {errorMessage && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 shadow-xs text-left animate-in fade-in">
            <div className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-red-600">error</span>
              <div className="flex-1">
                <p className="text-xs text-red-800 whitespace-pre-line font-medium leading-relaxed">
                  {errorMessage}
                </p>
                
              </div>
            </div>
          </div>
        )}

        {/* Warming Up Banner */}
        {modelsReady === false && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-2xl p-4 shadow-xs text-left animate-in fade-in">
            <div className="flex gap-3 items-start">
              <span className="material-symbols-outlined text-yellow-600">hourglass_empty</span>
              <div className="flex-1">
                <p className="text-xs text-yellow-800 font-medium">
                  AI models are currently warming up. Analysis will be available shortly...
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Zone */}
        {!activeFile && !activeUrl && !isScanning && (
          <div className={`bg-white border-2 border-dashed border-outline-variant rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all shadow-xs relative ${modelsReady === false ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary cursor-pointer group'}`}>
            <input 
              type="file" 
              accept=".pdf" 
              onChange={handleFileUpload} 
              disabled={modelsReady === false}
              className={`absolute inset-0 opacity-0 z-10 ${modelsReady === false ? 'cursor-not-allowed hidden' : 'cursor-pointer'}`} 
            />
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-all text-primary">
              <span className="material-symbols-outlined text-3xl">upload_file</span>
            </div>
            <h3 className="font-headline text-base font-bold text-on-surface mb-1">Drop Forensic PDF</h3>
            <p className="font-sans text-xs text-on-surface-variant max-w-[210px] leading-relaxed mb-5">
              Drag and drop document files up to 100MB for deep clinical scan.
            </p>
            <span className="bg-primary text-white font-sans text-xs font-bold px-5 py-2 rounded-xl group-hover:bg-primary-container transition-colors shadow-xs">
              Select File
            </span>
          </div>
        )}

        {/* URL Input */}
        {!activeFile && !activeUrl && !isScanning && (
          <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-xs">
            <label className="font-mono text-[10px] font-bold text-on-surface-variant block mb-2.5 uppercase tracking-wider">
              Analyze via URL
            </label>
            <div className="flex gap-2">
              <input 
                className="flex-1 bg-surface-container-low border border-outline-variant/60 rounded-xl px-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-on-surface truncate disabled:opacity-50" 
                placeholder="https://evidence.io/document-1202.pdf" 
                type="text"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                disabled={modelsReady === false}
              />
              <button 
                onClick={handleUrlScan}
                disabled={modelsReady === false}
                className="material-symbols-outlined bg-surface-container text-on-surface hover:text-primary p-2 rounded-xl transition-colors cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                title="Parse Link"
              >
                link
              </button>
            </div>
          </div>
        )}

        {/* Active File/URL Preview Card */}
        {(activeFile || activeUrl || isScanning) && (
          <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-xs flex flex-col gap-3 font-sans">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-10 h-10 min-w-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                  <span className="material-symbols-outlined text-xl">{activeFile ? 'picture_as_pdf' : 'link'}</span>
                </div>
                <div className="text-left overflow-hidden">
                  <h4 className="text-sm font-bold text-on-surface truncate" title={activeFile ? activeFile.name : activeUrl}>
                    {activeFile ? activeFile.name : (activeUrl.split('/').pop() || 'Document URL')}
                  </h4>
                  {activeFile && (
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[11px] text-on-surface-variant/80 font-medium">
                        {(activeFile.size / 1024 / 1024).toFixed(1)} MB
                      </span>
                      <span className="bg-slate-100 text-slate-700 text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase">
                        {activeFile.name.substring(activeFile.name.lastIndexOf('.') + 1)}
                      </span>
                    </div>
                  )}
                  {isScanning && (
                    <p className="text-[11px] text-primary font-semibold mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>
                      Scanning...
                    </p>
                  )}
                  {!isScanning && (
                    <p className="text-[11px] text-green-600 font-semibold mt-1 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                      Analysis Complete
                    </p>
                  )}
                </div>
              </div>
              {!isScanning && (
                <button 
                  onClick={() => {
                    setActiveFile(null);
                    setActiveUrl('');
                    setScanResult(null);
                    setUrlInput('');
                  }}
                  className="w-8 h-8 min-w-8 rounded-full hover:bg-slate-100 flex items-center justify-center text-on-surface-variant/70 hover:text-error transition-all cursor-pointer"
                  title="Remove file"
                >
                  <span className="material-symbols-outlined text-lg">close</span>
                </button>
              )}
            </div>
            {!isScanning && (
                <button 
                  onClick={() => {
                    setActiveFile(null);
                    setActiveUrl('');
                    setScanResult(null);
                    setUrlInput('');
                  }}
                  className="w-full mt-2 bg-slate-100 hover:bg-slate-200 text-on-surface font-sans text-xs font-bold py-2.5 px-4 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 border border-outline-variant"
                >
                  <span className="material-symbols-outlined text-sm">cached</span>
                  <span>Analyze Another Document</span>
                </button>
            )}
          </div>
        )}

        {/* Progressing state */}
        {isScanning && (
          <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-xs flex flex-col items-center text-center space-y-3 animate-pulse">
            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin"></div>
            <p className="font-sans text-xs font-semibold text-on-surface">Inspecting binary layers...</p>
            <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-primary rounded-full animate-infinite-loading w-1/2"></div>
            </div>
          </div>
        )}

        {/* Analysis Summary Card / Integrity Indicator */}
        {scanResult && !isScanning && (
          <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-xs animate-in font-sans">
            <div className="px-5 py-4 bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
              <h4 className="font-mono text-[10px] font-bold text-primary uppercase tracking-wider">Integrity Analysis</h4>
              <span className={`font-mono text-[9px] font-bold px-2 py-0.5 rounded-full ${isOriginal ? 'bg-green-100 text-green-700' : 'bg-error-container text-on-error-container'}`}>
                {isOriginal ? 'ORIGINAL' : 'ALERT'}
              </span>
            </div>
            
            <div className="p-6 flex flex-col items-center">
              <div className="relative w-32 h-32 flex items-center justify-center mb-5">
                {/* Gauge */}
                <svg className="w-full h-full -rotate-90">
                  <circle 
                    className="text-surface-container-high" 
                    cx="64" 
                    cy="64" 
                    fill="transparent" 
                    r="58" 
                    stroke="currentColor" 
                    strokeWidth="8"
                  ></circle>
                  <circle 
                    cx="64" 
                    cy="64" 
                    fill="transparent" 
                    r="58" 
                    stroke={getScoreColor(credScore)} 
                    strokeDasharray="364" 
                    strokeDashoffset={364 - (364 * credScore) / 100} 
                    strokeWidth="8"
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                    className={isOriginal ? 'drop-shadow-[0_0_8px_rgba(134,239,172,0.6)]' : ''}
                  ></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-headline text-2xl font-black text-on-surface">{credScore}%</span>
                  <span className="font-mono text-[8px] font-semibold text-on-surface-variant uppercase tracking-wider drop-shadow-sm" style={{ color: getScoreColor(credScore) }}>AUTHENTICITY</span>
                </div>
              </div>

              <div className="text-center px-2">
                <h5 className={`font-headline text-base font-bold mb-1.5 ${isOriginal ? 'text-green-600' : 'text-error'}`}>{scanResult.verdict}</h5>
                <p className="font-sans text-[11px] text-on-surface-variant leading-relaxed">
                  {scanResult.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main Breakdown Section Right */}
      <div className="lg:col-span-8 space-y-8">
        
        {/* Document Breakdown Grid */}
        {scanResult && !isScanning && (
          <section className="space-y-4">
            <div className="flex items-center justify-between mb-1 select-none">
              <h3 className="font-headline text-lg font-extrabold text-on-surface">Document Breakdown</h3>
              <span className="font-mono text-[10px] font-bold bg-surface-container-high text-primary px-3 py-1 rounded-full uppercase tracking-wider">
                {scanResult.pages.length} Pages Detected
              </span>
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4" id="pdf-thumbnails-grid">
              {scanResult.pages.map((page, idx) => {
                const isAnomalous = page.status === 'Anomalous' || page.status === 'Modified';
                return (
                  <div 
                    key={page.pageNumber}
                    onClick={() => setSelectedPageIndex(idx)}
                    className={`bg-white border-2 rounded-2xl overflow-hidden group cursor-pointer transition-all hover:shadow-md relative ${
                      selectedPageIndex === idx 
                        ? 'border-primary ring-2 ring-primary/10 scale-102' 
                        : (isAnomalous ? 'border-error/20 hover:border-error' : 'border-outline-variant hover:border-primary')
                    }`}
                  >
                    {/* Diagnostic Badge Overlay over Thumbnail */}
                    <div className="absolute top-2.5 right-2.5 z-10 select-none">
                      {isAnomalous ? (
                        <span className="material-symbols-outlined text-error bg-white rounded-full p-0.5 text-base shadow-xs" title="Anomalous structure">warning</span>
                      ) : (
                        <span className="material-symbols-outlined text-primary bg-white rounded-full p-0.5 text-base shadow-xs filled-icon" title="Authentic layers">check_circle</span>
                      )}
                    </div>
                    
                    <div className="aspect-[3/4] bg-surface-container-low relative flex items-center justify-center p-2">
                      <img 
                        src={page.thumbnailUrl} 
                        alt={page.altText} 
                        className={`w-full h-full object-contain transition-opacity ${page.thumbnailUrl.includes('PDF_file_icon') ? 'opacity-50 group-hover:opacity-75 p-6' : 'opacity-85 group-hover:opacity-100'}`}
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    
                    <div className="p-3 bg-white border-t border-outline-variant/60 flex justify-between items-center select-none">
                      <span className="font-sans text-xs font-bold text-on-surface-variant">Page {page.pageNumber.toString().padStart(2, '0')}</span>
                      <span className={`font-mono text-[9px] font-black uppercase ${isAnomalous ? 'text-error' : 'text-on-surface-variant/75'}`}>
                        {page.status}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Extracted Text Forensic Section */}
        {scanResult && !isScanning && (
          <section className="bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-xs">
            <div className="px-6 py-4 border-b border-outline-variant flex justify-between items-center select-none">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">analytics</span>
                <h3 className="font-headline text-sm font-black text-on-surface">Extracted Text Analysis</h3>
              </div>
              
              <button 
                onClick={handleExportJSON}
                className="font-mono text-xs font-bold text-primary flex items-center gap-1.5 hover:underline cursor-pointer"
              >
                <span className="material-symbols-outlined text-sm">download</span> EXPORT JSON
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-outline-variant/60">
              
              {/* Raw Content Left */}
              <div className="p-5">
                <h4 className="font-mono text-[10px] font-bold text-on-surface-variant mb-3 flex items-center gap-2.5 select-none uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm">subject</span> Raw Text Content
                </h4>
                
                <div className="font-mono text-xs text-on-surface-variant bg-surface-container-low/50 p-4 border border-outline-variant/30 rounded-xl h-64 overflow-y-auto leading-relaxed select-text">
                  {/* Highlight text inside raw content preview */}
                  {selectedPageIndex === 0 ? (
                    <>
                      [EXTRACTED_PAGE_01]<br/><br/>
                      CASE NO: 882-QX-2024<br/>
                      SUBJECT: FINANCIAL DISCLOSURE 12<br/>
                      DATE: OCT 12, 2023<br/><br/>
                      The following assets were accounted for during the audit of the <mark className="bg-error/25 text-error px-1 rounded-sm font-bold uppercase select-all">subsidiary holdings</mark>... Total valuation estimated at approximately $12.4M USD. This value is based on the <mark className="bg-error/25 text-error px-1 rounded-sm font-bold uppercase select-all">historical inflation</mark> rates of the regional district.<br/><br/>
                      Note: Digital signature verified on server. Any alteration to this document will result in immediate voiding of the contract.
                    </>
                  ) : (
                    <div className="whitespace-pre-wrap select-all">
                      {getExtractedPageText(selectedPageIndex)}
                    </div>
                  )}
                </div>
              </div>

              {/* AI Insights Right */}
              <div className="p-5 bg-surface-container-low/10">
                <h4 className="font-mono text-[10px] font-bold text-on-surface-variant mb-3 flex items-center gap-2.5 select-none uppercase tracking-wider">
                  <span className="material-symbols-outlined text-sm">psychology</span> Reasons for Verdict & Linguistic Insights
                </h4>

                <ul className="space-y-4">
                  {scanResult.insights.map((ins) => (
                    <li key={ins.id} className="flex gap-3">
                      <span 
                        className={`material-symbols-outlined text-lg ${
                          ins.iconColor === 'error' ? 'text-error animate-pulse' : (ins.iconColor === 'secondary' ? 'text-secondary' : 'text-primary')
                        }`}
                      >
                        {ins.icon}
                      </span>
                      <div className="text-left">
                        <p className="font-sans text-xs font-bold text-on-surface leading-tight">{ins.title}</p>
                        <p className="font-sans text-[11px] text-on-surface-variant mt-1 leading-relaxed">{ins.description}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>
        )}

        {/* Technical Metadata Bento */}
        {scanResult && !isScanning && (
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6 select-text">
            
            {/* Image Data */}
            <div className="bg-white border border-outline-variant p-5 rounded-2xl shadow-xs text-left font-sans">
              <h4 className="font-mono text-[10px] font-bold text-on-surface-variant mb-3.5 uppercase tracking-wider">Image Data</h4>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant/75 font-semibold">RESOLUTION</span>
                  <span className="font-mono font-bold text-on-surface">{scanResult.imageData.resolution}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant/75 font-semibold">COLOR SPACE</span>
                  <span className="font-mono font-bold text-on-surface">{scanResult.imageData.colorSpace}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant/75 font-semibold">COMPRESSION</span>
                  <span className="font-mono font-bold text-error bg-error-container/40 px-2 py-0.5 rounded-sm">
                    {scanResult.imageData.compression}
                  </span>
                </div>
              </div>
            </div>

            {/* System Info */}
            <div className="bg-white border border-outline-variant p-5 rounded-2xl shadow-xs text-left font-sans">
              <h4 className="font-mono text-[10px] font-bold text-on-surface-variant mb-3.5 uppercase tracking-wider">System Info</h4>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant/75 font-semibold">CREATOR</span>
                  <span className="font-sans font-bold text-on-surface truncate max-w-[130px]" title={scanResult.systemInfo.creator}>
                    {scanResult.systemInfo.creator}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant/75 font-semibold">PRODUCER</span>
                  <span className="font-sans font-bold text-on-surface truncate max-w-[130px]" title={scanResult.systemInfo.producer}>
                    {scanResult.systemInfo.producer}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant/75 font-semibold">VERSION</span>
                  <span className="font-mono font-bold text-on-surface">{scanResult.systemInfo.version}</span>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white border border-outline-variant p-5 rounded-2xl shadow-xs text-left font-sans">
              <h4 className="font-mono text-[10px] font-bold text-on-surface-variant mb-3.5 uppercase tracking-wider">Timeline</h4>
              <div className="space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant/75 font-semibold">CREATED</span>
                  <span className="font-mono font-bold text-on-surface">{scanResult.timeline.created}</span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant/75 font-semibold">MODIFIED</span>
                  <span className="font-mono font-bold text-error bg-error-container/40 px-2 py-0.5 rounded-sm">
                    {scanResult.timeline.modified}
                  </span>
                </div>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-on-surface-variant/75 font-semibold">ANALYZED</span>
                  <span className="font-mono font-bold text-primary font-black uppercase">{scanResult.timeline.analyzed}</span>
                </div>
              </div>
            </div>
            
          </section>
        )}
      </div>
    </div>
  );
}
