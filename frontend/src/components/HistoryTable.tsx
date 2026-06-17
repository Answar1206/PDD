/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useMemo } from 'react';
import { ForensicRecord, AssetType } from '../types';

interface HistoryTableProps {
  records: ForensicRecord[];
  onSelectRecord: (record: ForensicRecord) => void;
  onDeleteRecord: (id: string) => void;
  onAddMockRecord: (record: ForensicRecord) => void;
}

export default function HistoryTable({ records, onSelectRecord, onDeleteRecord, onAddMockRecord }: HistoryTableProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | AssetType>('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const itemsPerPage = 4;

  // Filter records based on selected filter pill and search query
  const filteredRecords = useMemo(() => {
    return records.filter(rec => {
      const matchesFilter = selectedFilter === 'all' || rec.type === selectedFilter;
      const cleanQuery = searchQuery.toLowerCase().trim();
      const matchesSearch = !cleanQuery || 
        rec.name.toLowerCase().includes(cleanQuery) ||
        rec.hash.toLowerCase().includes(cleanQuery) ||
        rec.verdict.toLowerCase().includes(cleanQuery);
      return matchesFilter && matchesSearch;
    });
  }, [records, selectedFilter, searchQuery]);

  // Pagination logic
  const totalPages = Math.ceil(filteredRecords.length / itemsPerPage) || 1;
  const paginatedRecords = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredRecords.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredRecords, currentPage]);

  const changePage = (p: number) => {
    if (p >= 1 && p <= totalPages) {
      setCurrentPage(p);
    }
  };

  // Export filtered rows to CSV
  const handleExportCSV = () => {
    const headers = ['File Name', 'SHA-256 Hash', 'Type', 'Verification Date', 'Score', 'Verdict', 'Status'];
    const rows = filteredRecords.map(rec => [
      rec.name,
      rec.hash,
      rec.type.toUpperCase(),
      rec.date.replace(' • ', ' '),
      `${rec.score}%`,
      rec.verdict,
      rec.status
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.map(val => `"${val}"`).join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `forensiq_export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Helper icons and colors based on Asset Type
  const getAssetTypeIcon = (type: AssetType) => {
    switch (type) {
      case 'video': return { icon: 'movie', bg: 'bg-primary-container/10', text: 'text-primary' };
      case 'image': return { icon: 'image', bg: 'bg-secondary-container/10', text: 'text-secondary' };
      case 'pdf': return { icon: 'picture_as_pdf', bg: 'bg-orange-500/10', text: 'text-amber-700' };
      case 'text': return { icon: 'description', bg: 'bg-teal-500/10', text: 'text-teal-700' };
    }
  };

  // Helper colors for score badges
  const getScoreBadge = (score: number, verdict: string) => {
    if (verdict === 'Original' || verdict === 'Human') {
      return (
        <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 font-mono text-[11px] font-bold border border-green-200 flex items-center w-fit gap-1 select-none">
          <span className="material-symbols-outlined text-sm filled-icon">verified</span>
          {score}% {verdict === 'Human' ? 'Human' : 'Original'}
        </span>
      );
    } else if (verdict === 'Altered' || verdict === 'Modified') {
      return (
        <span className="px-3 py-1 rounded-full bg-error-container/20 text-error font-mono text-[11px] font-bold border border-error/20 flex items-center w-fit gap-1 select-none">
          <span className="material-symbols-outlined text-sm filled-icon">warning</span>
          {100 - score}% {verdict}
        </span>
      );
    } else {
      // Potential
      return (
        <span className="px-3 py-1 rounded-full bg-surface-container text-on-surface-variant font-mono text-[11px] font-bold border border-outline-variant flex items-center w-fit gap-1 select-none">
          <span className="material-symbols-outlined text-sm filled-icon">pending</span>
          {score}% {verdict}
        </span>
      );
    }
  };

  // Helper for Row Dot Status Indicators
  const getStatusIndicator = (status: ForensicRecord['status']) => {
    switch (status) {
      case 'Completed':
        return (
          <span className="flex items-center gap-1.5 font-sans text-xs text-on-surface font-semibold select-none">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Completed
          </span>
        );
      case 'Review Required':
        return (
          <span className="flex items-center gap-1.5 font-sans text-xs text-on-surface font-semibold select-none">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span> Review Required
          </span>
        );
      case 'Analyzing':
        return (
          <span className="flex items-center gap-1.5 font-sans text-xs text-on-surface font-semibold select-none">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping"></span> Scanning...
          </span>
        );
    }
  };

  return (
    <div id="history-section" className="space-y-6">
      {/* Header & Search Section */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-on-surface mb-2 text-left">Analysis History</h1>
          <p className="font-sans text-sm text-on-surface-variant text-left">Review and manage your clinical forensic data logs.</p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
          <div className="relative flex-grow md:w-80">
            <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input 
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-outline-variant rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent font-sans text-sm transition-all shadow-xs" 
              placeholder="Search files, hashes, metadata..." 
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1); // Reset page on type
              }}
            />
          </div>
          <button 
            onClick={handleExportCSV}
            className="flex items-center justify-center gap-2 bg-primary text-white px-5 py-2.5 rounded-xl font-sans text-sm font-semibold hover:bg-primary-container transition-all active:scale-[0.98] shadow-md shadow-primary/15 cursor-pointer"
          >
            <span className="material-symbols-outlined text-lg">export_notes</span>
            Export CSV
          </button>
        </div>
      </div>

      {/* Filter Pills */}
      <div className="flex overflow-x-auto gap-2.5 pb-2 scrollbar-none select-none">
        <button 
          onClick={() => { setSelectedFilter('all'); setCurrentPage(1); }}
          className={`px-5 py-1.5 rounded-full font-sans text-xs font-semibold cursor-pointer whitespace-nowrap border transition-all ${
            selectedFilter === 'all'
              ? 'bg-primary text-white border-primary'
              : 'bg-white border-outline-variant text-on-surface-variant hover:border-primary'
          }`}
        >
          All Sources
        </button>

        <button 
          onClick={() => { setSelectedFilter('video'); setCurrentPage(1); }}
          className={`px-4 py-1.5 rounded-full font-sans text-xs font-semibold cursor-pointer whitespace-nowrap border transition-all flex items-center gap-1.5 ${
            selectedFilter === 'video'
              ? 'bg-primary text-white border-primary'
              : 'bg-white border-outline-variant text-on-surface-variant hover:border-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">movie</span> Video
        </button>

        <button 
          onClick={() => { setSelectedFilter('image'); setCurrentPage(1); }}
          className={`px-4 py-1.5 rounded-full font-sans text-xs font-semibold cursor-pointer whitespace-nowrap border transition-all flex items-center gap-1.5 ${
            selectedFilter === 'image'
              ? 'bg-primary text-white border-primary'
              : 'bg-white border-outline-variant text-on-surface-variant hover:border-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">image</span> Image
        </button>

        <button 
          onClick={() => { setSelectedFilter('text'); setCurrentPage(1); }}
          className={`px-4 py-1.5 rounded-full font-sans text-xs font-semibold cursor-pointer whitespace-nowrap border transition-all flex items-center gap-1.5 ${
            selectedFilter === 'text'
              ? 'bg-primary text-white border-primary'
              : 'bg-white border-outline-variant text-on-surface-variant hover:border-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">description</span> Text
        </button>

        <button 
          onClick={() => { setSelectedFilter('pdf'); setCurrentPage(1); }}
          className={`px-4 py-1.5 rounded-full font-sans text-xs font-semibold cursor-pointer whitespace-nowrap border transition-all flex items-center gap-1.5 ${
            selectedFilter === 'pdf'
              ? 'bg-primary text-white border-primary'
              : 'bg-white border-outline-variant text-on-surface-variant hover:border-primary'
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">picture_as_pdf</span> PDF Documents
        </button>
      </div>

      {/* Forensic History Logs */}
      <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-surface-container-low border-b border-outline-variant select-none">
              <tr>
                <th className="px-6 py-4 font-mono text-[10px] font-bold text-outline uppercase tracking-wider">Asset Details</th>
                <th className="px-6 py-4 font-mono text-[10px] font-bold text-outline uppercase tracking-wider">Verification Date</th>
                <th className="px-6 py-4 font-mono text-[10px] font-bold text-outline uppercase tracking-wider">Forensic Score</th>
                <th className="px-6 py-4 font-mono text-[10px] font-bold text-outline uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 font-mono text-[10px] font-bold text-outline uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/60">
              {paginatedRecords.length > 0 ? (
                paginatedRecords.map((rec) => {
                  const props = getAssetTypeIcon(rec.type);
                  return (
                    <tr 
                      key={rec.id} 
                      className="hover:bg-surface-container-low/40 transition-colors group"
                    >
                      {/* Asset details with thumbnail mock or logo */}
                      <td className="px-6 py-4.5">
                        <div className="flex items-center gap-4">
                          <div 
                            onClick={() => onSelectRecord(rec)}
                            className={`w-10 h-10 rounded-xl ${props?.bg} flex items-center justify-center ${props?.text} cursor-pointer group-hover:scale-105 transition-all`}
                          >
                            <span className="material-symbols-outlined text-lg">{props?.icon}</span>
                          </div>
                          <div className="text-left max-w-xs md:max-w-md">
                            <div 
                              onClick={() => onSelectRecord(rec)}
                              className="font-sans text-sm font-bold text-on-surface group-hover:text-primary transition-colors cursor-pointer truncate"
                            >
                              {rec.name}
                            </div>
                            <div className="font-mono text-[10px] text-outline truncate" title={rec.hash}>
                              SHA-256: {rec.hash.slice(0, 12)}...{rec.hash.slice(-8)}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-6 py-4.5 font-sans text-xs text-on-surface-variant">
                        {rec.date}
                      </td>

                      {/* Score Badge */}
                      <td className="px-6 py-4.5">
                        {getScoreBadge(rec.score, rec.verdict)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4.5">
                        {getStatusIndicator(rec.status)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4.5 text-right relative">
                        <button 
                          onClick={() => setActiveMenuId(activeMenuId === rec.id ? null : rec.id)}
                          className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant hover:text-primary transition-colors cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-sm">more_vert</span>
                        </button>

                        {/* Dropdown Menu */}
                        {activeMenuId === rec.id && (
                          <>
                            <div 
                              className="fixed inset-0 z-10 bg-transparent" 
                              onClick={() => setActiveMenuId(null)}
                            ></div>
                            <div className="absolute right-6 mt-1 w-44 bg-white border border-outline-variant rounded-xl shadow-lg z-20 p-1 text-left animate-in fade-in duration-100">
                              <button 
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onSelectRecord(rec);
                                }}
                                className="w-full text-left px-3 py-2 text-xs text-on-surface hover:bg-surface-container-low hover:text-primary rounded-lg flex items-center gap-2 font-medium cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-sm">analytics</span>
                                View Forensic Report
                              </button>
                              <button 
                                onClick={() => {
                                  setActiveMenuId(null);
                                  alert(`Downloading source hash log for metadata payload of: ${rec.name}`);
                                }}
                                className="w-full text-left px-3 py-2 text-xs text-on-surface hover:bg-surface-container-low hover:text-primary rounded-lg flex items-center gap-2 font-medium cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-sm">download</span>
                                Download Raw Evidence
                              </button>
                              <div className="my-1 border-t border-surface-container-low"></div>
                              <button 
                                onClick={() => {
                                  setActiveMenuId(null);
                                  onDeleteRecord(rec.id);
                                }}
                                className="w-full text-left px-3 py-2 text-xs text-error hover:bg-error-container/20 rounded-lg flex items-center gap-2 font-medium cursor-pointer"
                              >
                                <span className="material-symbols-outlined text-sm">delete</span>
                                Delete Scan Log
                              </button>
                            </div>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-outline font-sans text-sm select-none">
                    No forensic records match your selected parameters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="px-6 py-4.5 bg-surface-container-low flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-outline-variant select-none">
          <span className="font-sans text-xs text-on-surface-variant font-medium">
            Showing <span className="font-bold text-on-surface">{(currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-bold text-on-surface">
              {Math.min(currentPage * itemsPerPage, filteredRecords.length)}
            </span> of <span className="font-bold text-on-surface">{filteredRecords.length}</span> results
          </span>

          <div className="flex items-center gap-1.5">
            <button 
              onClick={() => changePage(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-outline-variant hover:bg-white text-on-surface-variant hover:text-primary transition-all disabled:opacity-40 disabled:hover:text-on-surface-variant disabled:hover:border-outline-variant disabled:cursor-not-allowed cursor-pointer flex items-center justify-center bg-white shadow-xs"
            >
              <span className="material-symbols-outlined text-sm">chevron_left</span>
            </button>

            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={i}
                onClick={() => changePage(i + 1)}
                className={`px-3 py-1.5 rounded-lg font-sans text-xs font-bold transition-all cursor-pointer ${
                  currentPage === i + 1
                    ? 'bg-primary text-white border border-primary shadow-sm shadow-primary/10'
                    : 'bg-white border border-outline-variant text-on-surface-variant hover:border-primary hover:text-primary'
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button 
              onClick={() => changePage(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-outline-variant hover:bg-white text-on-surface-variant hover:text-primary transition-all disabled:opacity-40 disabled:hover:text-on-surface-variant disabled:hover:border-outline-variant disabled:cursor-not-allowed cursor-pointer flex items-center justify-center bg-white shadow-xs"
            >
              <span className="material-symbols-outlined text-sm">chevron_right</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
