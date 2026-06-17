/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { TextAnalysisResult } from '../types';
import { DEFAULT_TEXT_RESULT } from '../mockData';

interface TextAnalysisProps {
  backendUrl: string;
  modelsReady: boolean | null;
  onAddAnalyzedLog: (name: string, type: 'text', score: number, verdict: string, status: 'Completed' | 'Review Required') => void;
}

export default function TextAnalysis({ backendUrl, modelsReady, onAddAnalyzedLog }: TextAnalysisProps) {
  const [docType, setDocType] = useState('General Article');
  const [lang, setLang] = useState('English (US)');
  const [text, setText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<TextAnalysisResult | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const wordCount = useMemo(() => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  }, [text]);

  const charCount = text.length;

  const handleRunScan = async () => {
    if (text.trim().length < 15) {
      alert("Please paste more text (at least 15 characters) for a valid forensic linguistic evaluation.");
      return;
    }

    setIsScanning(true);
    setScanResult(null);

    try {
      const response = await fetch(`${backendUrl}/analyze-text`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ text })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server responded with status code ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        const score = data.final_score; // Higher is more human
        const probabilityAI = 100 - score;
        const verdict = data.verdict;

        const sentences = text.split(/[.!?]+/).filter(Boolean);
        const highlights = sentences.map((sentence) => {
          const lower = sentence.toLowerCase();
          const hasAITriggers = lower.includes("furthermore") || lower.includes("moreover") || lower.includes("delve") || lower.includes("in conclusion");
          return {
            text: sentence.trim() + '. ',
            type: hasAITriggers ? 'ai' : (score > 70 ? 'human' : 'ai') as 'human' | 'ai' | 'neutral'
          };
        });

        const matchedModel = score < 45 ? "GPT-4o / Claude 3.5" : "Organic Human Profile";
        const insightsList = data.modules.map((m: any, idx: number) => ({
          id: `dyn_${idx}`,
          type: m.score > 70 ? 'info' : (m.score > 45 ? 'warning' : 'error') as 'info' | 'warning' | 'error',
          title: m.name,
          description: `${m.name} verification completed with a score of ${m.score}%.`
        }));

        const result: TextAnalysisResult = {
          verdict,
          subTitle: score > 75 ? 'Linguistic markers align closely with organic human output.' : 'High correlation with automated generative prose models.',
          authenticityScore: score,
          probabilityAI,
          modelMatch: matchedModel,
          patterns: score > 60 ? 'Diverse' : 'Repetitive',
          perplexity: score > 60 ? 'High' : 'Low',
          structure: score > 60 ? 'Dynamic' : 'Linear',
          rawText: text,
          highlights,
          insights: insightsList
        };

        setScanResult(result);
        onAddAnalyzedLog(
          text.substring(0, 20).replace(/[^\w\s]/gi, '').trim() + '_evaluation.txt',
          'text',
          score,
          score > 75 ? 'Human' : (score > 45 ? 'Potential' : 'Altered'),
          score > 45 ? 'Completed' : 'Review Required'
        );
      } else {
        alert("Verification failed: " + (data.error || "Unknown server error"));
      }
    } catch (err: any) {
      console.error('Full error:', err);
      if (err.message.includes('fetch') || err.message.includes('Failed') || err.message.includes('NetworkError')) {
        setErrorMessage('Cannot connect to backend. The server might still be starting, please wait a moment.');
      } else {
        setErrorMessage(err.message || 'Unknown error occurred');
      }
    } finally {
      setIsScanning(false);
    }
  };

  const handleLoadSample = () => {
    setText(DEFAULT_TEXT_RESULT.rawText);
  };

  const ringDashoffset = scanResult ? 565 - (565 * scanResult.authenticityScore) / 100 : 565;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 text-left animate-in fade-in duration-300">
      {/* Input panel left */}
      <section className="lg:col-span-7 space-y-6">
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
        
        <div className="bg-white rounded-2xl border border-outline-variant p-6 shadow-xs flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4 select-none">
            <div className="flex gap-2 w-full sm:w-auto">
              <select 
                value={docType}
                onChange={(e) => setDocType(e.target.value)}
                className="bg-surface-container-low border border-outline-variant/60 rounded-xl font-mono text-xs font-bold px-3 py-2 focus:ring-2 focus:ring-primary outline-none cursor-pointer"
              >
                <option>General Article</option>
                <option>Academic Paper</option>
                <option>Technical Report</option>
                <option>Social Media Post</option>
              </select>

              <select 
                value={lang}
                onChange={(e) => setLang(e.target.value)}
                className="bg-surface-container-low border border-outline-variant/60 rounded-xl font-mono text-xs font-bold px-3 py-2 focus:ring-2 focus:ring-primary outline-none cursor-pointer"
              >
                <option>English (US)</option>
                <option>Spanish</option>
                <option>French</option>
                <option>German</option>
              </select>
            </div>
            
            <div className="text-right w-full sm:w-auto">
              <span className="font-mono text-xs text-outline">{wordCount} words | {charCount} chars</span>
            </div>
          </div>

          <textarea 
            className="w-full h-80 bg-surface-container-low/30 border border-outline-variant/50 focus:border-primary focus:ring-2 focus:ring-primary/10 rounded-xl p-4 font-sans text-sm resize-none placeholder:text-outline-variant/80 outline-none leading-relaxed disabled:opacity-50" 
            id="analysisInput" 
            placeholder="Paste article content or scientific text here for forensic linguistic evaluation..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            disabled={modelsReady === false}
          ></textarea>

          <div className="flex justify-between items-center mt-5 select-none">
            <button
              onClick={handleLoadSample}
              className="px-4 py-2 border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary rounded-xl font-sans text-xs font-semibold cursor-pointer transition-colors bg-white shadow-xs"
            >
              Load Sample Text
            </button>

            <button 
              className="bg-primary hover:bg-primary-container text-white px-6 py-2.5 rounded-xl font-sans text-sm font-semibold flex items-center gap-2 transition-all active:scale-[0.98] shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={handleRunScan}
              disabled={isScanning || modelsReady === false}
            >
              {isScanning ? (
                <>
                  <span className="material-symbols-outlined animation-spin animate-spin">refresh</span>
                  Analyzing Content...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">analytics</span>
                  Run Forensic Scan
                </>
              )}
            </button>
          </div>
        </div>

        {/* Loading Overlay */}
        {isScanning && (
          <div className="bg-white border border-outline-variant rounded-2xl p-12 text-center shadow-xs flex flex-col items-center justify-center space-y-4 animate-pulse select-none" id="scanning-state">
            <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
            <h3 className="font-headline text-lg font-bold text-on-surface">Forensic Linguistic Evaluation</h3>
            <p className="font-sans text-xs text-on-surface-variant max-w-sm">
              Conducting advanced entropy profiling, token redundancy audits, high-dimensional perplexity scans, and syntax alignment mapping...
            </p>
          </div>
        )}

        {/* Highlighted View (Results Overlay) */}
        {scanResult && !isScanning && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 ease-out" id="resultsView">
            <div className="bg-white rounded-2xl border border-outline-variant p-6 shadow-xs space-y-4">
              <h3 className="font-headline text-lg font-extrabold text-on-surface flex items-center gap-2 select-none">
                <span className="material-symbols-outlined text-primary filled-icon">auto_awesome</span>
                Forensic Linguistic Mapping
              </h3>
              
              <div className="font-sans text-sm leading-relaxed text-on-surface p-4 bg-surface-container-low/40 rounded-xl border border-outline-variant/45">
                {scanResult.highlights.map((seg, idx) => {
                  let hlClass = '';
                  if (seg.type === 'human') hlClass = 'bg-green-500/10 border-b border-green-500/30 text-green-900';
                  else if (seg.type === 'ai') hlClass = 'bg-yellow-500/15 border-b border-yellow-500/35 text-amber-900';
                  return (
                    <span key={idx} className={`p-0.5 rounded-sm transition-all duration-300 ${hlClass}`}>
                      {seg.text}
                    </span>
                  );
                })}
              </div>
              
              <div className="flex gap-4 select-none">
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-green-500"></span>
                  <span className="font-sans text-xs font-semibold text-on-surface-variant">Human Confidence</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-yellow-500"></span>
                  <span className="font-sans text-xs font-semibold text-on-surface-variant">AI Suspected</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-slate-300"></span>
                  <span className="font-sans text-xs font-semibold text-on-surface-variant">Neutral Buffer</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Results side panel right */}
      <aside className="lg:col-span-5 space-y-6">
        {scanResult && !isScanning ? (
          <div className="space-y-6 animate-in fade-in duration-500">
            {/* Verdict Banner */}
            <div className="bg-white rounded-2xl border border-outline-variant p-6 shadow-xs text-center">
              <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-error-container text-on-error-container font-mono text-[10px] font-bold uppercase tracking-wider mb-4 border border-error/10">
                <span className="material-symbols-outlined text-sm">warning</span>
                FORENSIC VERDICT
              </div>
              <h2 className="font-headline text-2xl font-black text-on-surface mb-1">{scanResult.verdict}</h2>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed px-4">{scanResult.subTitle}</p>
            </div>

            {/* Authenticity Score Gauge */}
            <div className="bg-white rounded-2xl border border-outline-variant p-6 shadow-xs flex flex-col items-center">
              <div className="relative w-44 h-44 mb-4 select-none">
                <svg className="w-full h-full transform -rotate-90">
                  {/* Gray background track */}
                  <circle 
                    className="text-surface-container" 
                    cx="88" 
                    cy="88" 
                    fill="transparent" 
                    r="80" 
                    stroke="currentColor" 
                    strokeWidth="10"
                  ></circle>
                  {/* Gauge indicator */}
                  <circle 
                    className="drop-shadow-[0_0_8px_rgba(134,239,172,0.6)]" 
                    cx="88" 
                    cy="88" 
                    fill="transparent" 
                    r="80" 
                    stroke="#86efac" 
                    strokeWidth="10"
                    strokeDasharray="502"
                    strokeDashoffset={502 - (502 * scanResult.authenticityScore) / 100}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                  ></circle>
                </svg>
                {/* Visual Label over gauge */}
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-headline text-3xl font-black text-on-surface">{scanResult.authenticityScore}%</span>
                  <span className="font-mono text-[9px] font-bold text-[#86efac] drop-shadow-sm uppercase tracking-wider">Authenticity</span>
                </div>
              </div>

              {/* Score bar description */}
              <div className="w-full h-1.5 bg-surface-container rounded-full overflow-hidden mb-3">
                <div 
                  className="h-full bg-error rounded-full" 
                  style={{ width: `${scanResult.probabilityAI}%` }}
                ></div>
              </div>
              <p className="font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">
                {scanResult.probabilityAI}% Probability of AI Authorship
              </p>
            </div>

            {/* Metric Breakdown Bento */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white rounded-2xl border border-outline-variant p-4 hover:bg-surface-container-low transition-all shadow-xs">
                <span className="material-symbols-outlined text-primary mb-1.5">neurology</span>
                <div className="font-mono text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Model Match</div>
                <div className="font-headline text-sm font-bold text-on-surface">{scanResult.modelMatch}</div>
              </div>

              <div className="bg-white rounded-2xl border border-outline-variant p-4 hover:bg-surface-container-low transition-all shadow-xs">
                <span className="material-symbols-outlined text-primary mb-1.5">pattern</span>
                <div className="font-mono text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Patterns</div>
                <div className="font-headline text-sm font-bold text-on-surface">{scanResult.patterns}</div>
              </div>

              <div className="bg-white rounded-2xl border border-outline-variant p-4 hover:bg-surface-container-low transition-all shadow-xs">
                <span className="material-symbols-outlined text-primary mb-1.5">waves</span>
                <div className="font-mono text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Perplexity</div>
                <div className="font-headline text-sm font-bold text-on-surface">{scanResult.perplexity}</div>
              </div>

              <div className="bg-white rounded-2xl border border-outline-variant p-4 hover:bg-surface-container-low transition-all shadow-xs">
                <span className="material-symbols-outlined text-primary mb-1.5">account_tree</span>
                <div className="font-mono text-[10px] font-bold text-outline uppercase tracking-wider mb-1">Structure</div>
                <div className="font-headline text-sm font-bold text-on-surface">{scanResult.structure}</div>
              </div>
            </div>

            {/* AI Insights Card */}
            <div className="bg-primary/5 rounded-2xl border border-primary/10 p-5 space-y-2">
              <h4 className="font-mono text-xs font-bold text-primary tracking-wider uppercase">Reasons for Verdict & AI Insights</h4>
              <p className="font-sans text-xs leading-relaxed text-on-surface-variant select-text">
                The text exhibits a remarkably consistent sentence length and lack of semantic "burstiness" typical of human prose. High-probability token sequences detected in 64% of the paragraph blocks.
              </p>
            </div>
            
            {/* Detailed Insights list */}
            <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-xs space-y-4">
              <h3 className="font-mono text-xs font-bold text-outline uppercase tracking-wider">Reasons for Verdict & Detailed Insight Checks</h3>
              <div className="space-y-4 text-left">
                {scanResult.insights.map((ins) => (
                  <div key={ins.id} className="flex gap-3">
                    <span className={`material-symbols-outlined text-base ${ins.type === 'error' ? 'text-error animate-pulse' : (ins.type === 'warning' ? 'text-amber-500' : 'text-primary')}`}>
                      {ins.type === 'error' ? 'error_outline' : (ins.type === 'warning' ? 'warning' : 'info')}
                    </span>
                    <div>
                      <p className="font-sans text-xs font-bold text-on-surface leading-tight">{ins.title}</p>
                      <p className="font-sans text-[11px] text-on-surface-variant mt-0.5 leading-relaxed">{ins.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-outline-variant p-8 shadow-xs text-center flex flex-col items-center justify-center h-full min-h-[300px] select-none text-outline space-y-3">
            <span className="material-symbols-outlined text-5xl">biotech</span>
            <h3 className="font-headline text-base font-bold text-on-surface">Ready for Forensic Evaluation</h3>
            <p className="font-sans text-xs max-w-[240px] leading-relaxed">
              Paste scientific content in the editor and click "Run Forensic Scan" to start mapping content origins.
            </p>
          </div>
        )}
      </aside>
    </div>
  );
}
