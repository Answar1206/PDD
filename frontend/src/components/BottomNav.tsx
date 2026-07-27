/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';

interface BottomNavProps {
  currentTab: 'home' | 'history' | 'text' | 'pdf' | 'image' | 'video' | 'settings';
  onNavigate: (tab: 'home' | 'history' | 'text' | 'pdf' | 'image' | 'video' | 'settings') => void;
}

export default function BottomNav({ currentTab, onNavigate }: BottomNavProps) {
  return (
    <nav className="md:hidden fixed bottom-0 w-full z-50 flex items-center overflow-x-auto bg-white border-t border-outline-variant shadow-lg no-scrollbar" id="mobile-bottom-nav">
      <div className="flex w-full min-w-max justify-between px-2 py-2 gap-2">
        <button 
          onClick={() => onNavigate('history')} 
          className={`flex flex-col items-center justify-center w-full h-full space-y-1 transition-all ${
            currentTab === 'history'
              ? 'text-primary font-bold scale-105'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className={`material-symbols-outlined text-[20px] ${currentTab === 'history' ? 'filled-icon' : 'empty-icon'}`}>history</span>
          <span className="font-sans text-[9px] tracking-tight whitespace-nowrap">History</span>
        </button>

        <button 
          onClick={() => onNavigate('video')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer w-16 transition-all ${
            currentTab === 'video'
              ? 'text-primary font-bold scale-105'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className={`material-symbols-outlined text-[20px] ${currentTab === 'video' ? 'filled-icon' : 'empty-icon'}`}>movie</span>
          <span className="font-sans text-[9px] tracking-tight whitespace-nowrap">Video</span>
        </button>

        <button 
          onClick={() => onNavigate('image')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer w-16 transition-all ${
            currentTab === 'image'
              ? 'text-primary font-bold scale-105'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className={`material-symbols-outlined text-[20px] ${currentTab === 'image' ? 'filled-icon' : 'empty-icon'}`}>image</span>
          <span className="font-sans text-[9px] tracking-tight whitespace-nowrap">Image</span>
        </button>

        <button 
          onClick={() => onNavigate('text')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer w-16 transition-all ${
            currentTab === 'text'
              ? 'text-primary font-bold scale-105'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className={`material-symbols-outlined text-[20px] ${currentTab === 'text' ? 'filled-icon' : 'empty-icon'}`}>subject</span>
          <span className="font-sans text-[9px] tracking-tight whitespace-nowrap">Text</span>
        </button>

        <button 
          onClick={() => onNavigate('pdf')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer w-16 transition-all ${
            currentTab === 'pdf'
              ? 'text-primary font-bold scale-105'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className={`material-symbols-outlined text-[20px] ${currentTab === 'pdf' ? 'filled-icon' : 'empty-icon'}`}>picture_as_pdf</span>
          <span className="font-sans text-[9px] tracking-tight whitespace-nowrap">PDF</span>
        </button>

        <button 
          onClick={() => onNavigate('settings')}
          className={`flex flex-col items-center justify-center gap-1 cursor-pointer w-16 transition-all ${
            currentTab === 'settings'
              ? 'text-primary font-bold scale-105'
              : 'text-on-surface-variant hover:text-primary'
          }`}
        >
          <span className={`material-symbols-outlined text-[20px] ${currentTab === 'settings' ? 'filled-icon' : 'empty-icon'}`}>settings</span>
          <span className="font-sans text-[9px] tracking-tight whitespace-nowrap">Settings</span>
        </button>
      </div>
    </nav>
  );
}
