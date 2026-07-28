/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface SidebarProps {
  currentTab: 'history' | 'text' | 'pdf' | 'image' | 'video' | 'settings';
  onNavigate: (tab: 'history' | 'text' | 'pdf' | 'image' | 'video' | 'settings') => void;
  storageUsedGB: number;
  storageMaxGB: number;
}

export default function Sidebar({ currentTab, onNavigate, storageUsedGB, storageMaxGB }: SidebarProps) {
  const percentage = Math.min(100, Math.round((storageUsedGB / storageMaxGB) * 100));

  return (
    <aside className="hidden md:flex fixed left-0 top-16 bottom-0 w-64 bg-white border-r border-outline-variant flex-col p-6 gap-6 select-none" id="desktop-sidebar">
      <nav className="flex flex-col gap-1.5 flex-1">
        <button
          onClick={() => onNavigate('video')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-sans font-medium text-sm cursor-pointer text-left ${
            currentTab === 'video'
              ? 'bg-surface-container text-primary font-bold shadow-xs'
              : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
          }`}
        >
          <span className={`material-symbols-outlined text-xl ${currentTab === 'video' ? 'filled-icon' : 'empty-icon'}`}>movie</span>
          <span>Video Analysis</span>
        </button>

        <button
          onClick={() => onNavigate('image')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-sans font-medium text-sm cursor-pointer text-left ${
            currentTab === 'image'
              ? 'bg-surface-container text-primary font-bold shadow-xs'
              : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
          }`}
        >
          <span className={`material-symbols-outlined text-xl ${currentTab === 'image' ? 'filled-icon' : 'empty-icon'}`}>image</span>
          <span>Image Analysis</span>
        </button>

        <button
          onClick={() => onNavigate('pdf')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-sans font-medium text-sm cursor-pointer text-left ${
            currentTab === 'pdf'
              ? 'bg-surface-container text-primary font-bold shadow-xs'
              : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
          }`}
        >
          <span className={`material-symbols-outlined text-xl ${currentTab === 'pdf' ? 'filled-icon' : 'empty-icon'}`}>picture_as_pdf</span>
          <span>PDF Documents</span>
        </button>

        <button
          onClick={() => onNavigate('text')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-sans font-medium text-sm cursor-pointer text-left ${
            currentTab === 'text'
              ? 'bg-surface-container text-primary font-bold shadow-xs'
              : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
          }`}
        >
          <span className={`material-symbols-outlined text-xl ${currentTab === 'text' ? 'filled-icon' : 'empty-icon'}`}>subject</span>
          <span>Text Analysis</span>
        </button>

        <button
          onClick={() => onNavigate('history')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-sans font-medium text-sm cursor-pointer text-left ${
            currentTab === 'history'
              ? 'bg-surface-container text-primary font-bold shadow-xs'
              : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
          }`}
        >
          <span className={`material-symbols-outlined text-xl ${currentTab === 'history' ? 'filled-icon' : 'empty-icon'}`}>history</span>
          <span>History</span>
        </button>

        <button
          onClick={() => onNavigate('settings')}
          className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-sans font-medium text-sm cursor-pointer text-left ${
            currentTab === 'settings'
              ? 'bg-surface-container text-primary font-bold shadow-xs'
              : 'text-on-surface-variant hover:bg-surface-container-low hover:text-primary'
          }`}
        >
          <span className={`material-symbols-outlined text-xl ${currentTab === 'settings' ? 'filled-icon' : 'empty-icon'}`}>settings</span>
          <span>Settings</span>
        </button>
      </nav>

      {/* Storage usage element at the bottom */}
      <div className="p-4 bg-surface-container-low border border-outline-variant/60 rounded-xl" id="sidebar-storage">
        <div className="flex justify-between items-center mb-1.5">
          <span className="font-mono text-[10px] font-bold text-outline uppercase tracking-wider">Storage Status</span>
          <span className="font-mono text-[10px] font-bold text-primary">{percentage}%</span>
        </div>
        <div className="h-1.5 w-full bg-outline-variant/30 rounded-full overflow-hidden">
          <div 
            className="h-full bg-primary rounded-full transition-all duration-500" 
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
        <div className="mt-1.5 font-sans text-xs text-on-surface-variant text-right font-medium">
          {storageUsedGB.toFixed(1)} GB / {storageMaxGB} GB
        </div>
      </div>
    </aside>
  );
}
