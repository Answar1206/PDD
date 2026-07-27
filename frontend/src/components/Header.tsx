/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { UserProfile } from '../types';

export type TabType = 'home' | 'history' | 'text' | 'pdf' | 'image' | 'video' | 'settings' | 'how-it-works';

interface HeaderProps {
  currentTab: TabType;
  onNavigate: (tab: TabType) => void;
  user: UserProfile;
  onLogout: () => void;
}

export default function Header({ currentTab, onNavigate, user, onLogout }: HeaderProps) {
  return (
    <header className="fixed top-0 w-full z-50 flex justify-between items-center px-4 md:px-8 h-16 bg-white/80 backdrop-blur-lg border-b border-black/5 text-[#300000] select-none transition-colors duration-300">

      {/* Brand Logo & Back - Left */}
      <div className="flex items-center gap-4">
        {currentTab !== 'home' && (
          <button
            onClick={() => onNavigate('home')}
            className="flex items-center justify-center w-8 h-8 rounded-full hover:bg-black/5 transition-colors text-[#300000]"
            title="Back to Home"
          >
            <span className="material-symbols-outlined text-[20px]">arrow_back</span>
          </button>
        )}

        <div
          onClick={() => onNavigate('home')}
          className="font-headline text-lg md:text-xl font-bold flex items-center gap-2 cursor-pointer hover:opacity-90 active:scale-95 transition-all text-[#300000]"
          id="logo-container"
        >
          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-gradient-to-tr from-[#800000] to-[#500000]">
            <span className="material-symbols-outlined text-xl filled-icon text-white">shield</span>
          </div>
          <span className="tracking-tight font-black text-[#300000]">FORENSIQ <span className="text-[#800000]">AI</span></span>
        </div>
      </div>

      {/* Main Navigation - Center */}
      <nav className="hidden md:flex items-center gap-6 lg:gap-10 font-sans text-[13px] font-bold uppercase tracking-wider">
        <button
          onClick={() => onNavigate('home')}
          className={`hover:text-[#800000] transition-colors relative pb-1 ${currentTab === 'home' ? 'text-[#800000]' : 'text-[#300000]/60'}`}
        >
          Home
          {currentTab === 'home' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#800000] rounded-t-full"></div>}
        </button>
        <button
          onClick={() => onNavigate('history')}
          className={`hover:text-[#800000] transition-colors relative pb-1 ${currentTab === 'history' ? 'text-[#800000]' : 'text-[#300000]/60'}`}
        >
          History
          {currentTab === 'history' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#800000] rounded-t-full"></div>}
        </button>
        <button
          onClick={() => onNavigate('how-it-works')}
          className={`hover:text-[#800000] transition-colors relative pb-1 ${currentTab === 'how-it-works' ? 'text-[#800000]' : 'text-[#300000]/60'}`}
        >
          How it works
          {currentTab === 'how-it-works' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#800000] rounded-t-full"></div>}
        </button>
        <button
          onClick={() => onNavigate('settings')}
          className={`hover:text-[#800000] transition-colors relative pb-1 ${currentTab === 'settings' ? 'text-[#800000]' : 'text-[#300000]/60'}`}
        >
          Account Details
          {currentTab === 'settings' && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#800000] rounded-t-full"></div>}
        </button>
      </nav>

      {/* Actions & Profile - Right */}
      <div className="flex items-center gap-4">
        {/* Profile Dropdown */}
        <div className="relative group cursor-pointer ml-2">
          <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-[#800000]/20 hover:border-[#800000] transition-all">
            {user.avatarUrl ? (
              <img
                src={user.avatarUrl}
                alt={user.name}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center font-bold text-xs select-none bg-[#300000] text-white">
                {user.name.split(' ').map(n => n[0]).join('')}
              </div>
            )}
          </div>

          {/* Simple logout menu on hover/click */}
          <div className="absolute right-0 mt-2 w-48 bg-white border border-black/10 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-1">
            <div className="px-3 py-2 border-b border-black/5 text-xs text-black/60 font-medium">
              Signed in as<br />
              <span className="text-[#300000] font-semibold truncate block">{user.email}</span>
            </div>
            <button
              onClick={() => onNavigate('settings')}
              className="w-full text-left px-3 py-2 text-sm text-[#300000] font-medium hover:bg-black/5 transition-colors mt-1 rounded-lg flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
              Settings
            </button>
            <button
              onClick={onLogout}
              className="w-full text-left px-3 py-2 text-sm text-red-600 font-medium hover:bg-red-50 transition-colors rounded-lg flex items-center gap-2 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">logout</span>
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
