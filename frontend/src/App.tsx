/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile, ForensicRecord, AssetType } from './types';
import { INITIAL_RECORDS } from './mockData';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import BottomNav from './components/BottomNav';
import Registration from './components/Registration';
import Home from './components/Home';
import HistoryTable from './components/HistoryTable';
import TextAnalysis from './components/TextAnalysis';
import PDFAnalysis from './components/PDFAnalysis';
import ImageAnalysis from './components/ImageAnalysis';
import VideoAnalysis from './components/VideoAnalysis';
import SettingsPanel from './components/SettingsPanel';
import HowItWorks from './components/HowItWorks';
import { TabType } from './components/Header';

export default function App() {
  const HF_BACKEND = import.meta.env.VITE_BACKEND_URL || "https://forensiq-ai-backend.hf.space";
  const DEFAULT_URL = HF_BACKEND;
  const [backendUrl, setBackendUrl] = useState<string>(
    localStorage.getItem('forensiq_backend_url') || DEFAULT_URL
  );
  const [backendOnline, setBackendOnline] = useState<boolean | null>(null);
  const [modelsReady, setModelsReady] = useState<boolean | null>(null);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [showGuide, setShowGuide] = useState<boolean>(false);

  const testBackendConnection = async () => {
    const HF_BACKEND = import.meta.env.VITE_BACKEND_URL || "https://forensiq-ai-backend.hf.space";
    const candidates = [
      HF_BACKEND,
      "http://localhost:5000",
      localStorage.getItem("forensiq_backend_url") || ""
    ].filter(u => u && u.length > 5)

    for (const candidate of candidates) {
      try {
        const res = await fetch(candidate + `/status?t=${Date.now()}`, {
          method: "GET",
          mode: "cors",
          cache: "no-store"
        })
        if (res.status >= 200 && res.status < 500) {
          const data = await res.json().catch(() => ({}));
          setBackendUrl(candidate)
          setBackendOnline(true)
          setModelsReady(data.models_ready === true)
          localStorage.setItem("forensiq_backend_url", candidate)
          console.log("Backend connected at:", candidate, "Models Ready:", data.models_ready)
          return { online: true, ready: data.models_ready === true }
        }
      } catch (err: any) {
        console.log("Failed:", candidate, err.message)
      }
    }

    setBackendOnline(false)
    setModelsReady(null)
    return { online: false, ready: false }
  };

  React.useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    
    const poll = async () => {
      const status = await testBackendConnection();
      if (!status.online) {
        timer = setTimeout(poll, 5000);
      } else if (!status.ready) {
        timer = setTimeout(poll, 2000);
      } else {
        timer = setTimeout(poll, 15000);
      }
    };
    
    poll();
    
    return () => clearTimeout(timer);
  }, []);

  React.useEffect(() => {
    const keepAlive = setInterval(async () => {
        try {
            await fetch(backendUrl + "/wake")
            console.log("Keep-alive ping sent")
        } catch(e) {}
    }, 25 * 60 * 1000)
    
    return () => clearInterval(keepAlive)
  }, [backendUrl])

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserProfile>({
    name: 'Dr. Elias Vance',
    email: 'e.vance@forensiq.ai',
    role: 'Chief Forensic Investigator',
    avatarUrl: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCAKWBJ-aLddn7E--oDjjwzZLYy7-QNSDxUJQHAT7nPkN7FshuuU1sIQRGTn8Q0N6cbd2xFAyE-ZT2KUSAbj3TTIBYi6h2ZyFP3kMP196kNPxeBREpM6PgSzVSJ0sGzVjGAovb0OXyB2ToPatpNdsWINOAnQ7S7ozshCCJCzoEmmFjZfjkn7lzmSE1jQQtsp8BcMK--hqqX5EHlbRoPPA4JbsH7Gc77EN_MWVOgPcdnxiwpLggsC9sdGLkhQDmUpqw_rcNW6MGCqSo'
  });

  const [currentTab, setCurrentTab] = useState<TabType>('home');
  const [records, setRecords] = useState<ForensicRecord[]>(INITIAL_RECORDS);

  const storageUsedGB = 7.2;
  const storageMaxGB = 10;

  // Handles adding newly scanned mock/real entries to Dashboard Analysis History
  const handleAddAnalyzedLog = (
    name: string, 
    type: AssetType, 
    score: number, 
    verdict: string, 
    status: 'Completed' | 'Review Required'
  ) => {
    const randomHash = Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
    const newRecord: ForensicRecord = {
      id: 'rec_' + Date.now(),
      name,
      hash: randomHash,
      type,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) + ' • ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false }),
      score,
      verdict: verdict as ForensicRecord['verdict'],
      status,
      anomaliesCount: verdict === 'Original' ? 0 : 3
    };

    setRecords(prev => [newRecord, ...prev]);
  };

  const handleDeleteRecord = (id: string) => {
    setRecords(prev => prev.filter(r => r.id !== id));
  };

  const handleSelectRecord = (record: ForensicRecord) => {
    // Navigate straight to analysis workspace under correct asset subtab
    setCurrentTab(record.type as any);
  };

  const handleRegisterSuccess = (profile: UserProfile) => {
    // If customized details was provided, update context
    setUser({
      ...profile,
      role: profile.role || 'Forensic Investigator',
      avatarUrl: profile.avatarUrl || '' // default
    });
    setIsAuthenticated(true);
    setCurrentTab('home');
  };

  const handleMockSignIn = () => {
    setIsAuthenticated(true);
    setCurrentTab('home');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  // Switch to Registration screen if unauthenticated
  if (!isAuthenticated) {
    return (
      <Registration 
        backendUrl={backendUrl}
        onRegisterSuccess={handleRegisterSuccess}
        onMockSignIn={handleMockSignIn}
      />
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans select-none transition-colors duration-300 bg-[#edebe6]`} id="forensiq-app-frame">


      <div className="bg-white border-b border-outline-variant px-4 py-2 flex items-center gap-4 text-xs z-50 relative shadow-sm">
        <div className="flex items-center gap-2">
          <div className={`w-2.5 h-2.5 rounded-full ${backendOnline ? (modelsReady ? 'bg-green-500' : 'bg-yellow-500') : 'bg-red-500'} shadow-sm`}></div>
          <span className="font-bold text-on-surface-variant uppercase tracking-wider text-[10px]">
            {backendOnline ? (modelsReady ? 'Ready to analyze' : 'Warming up AI models...') : 'Connecting...'}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <input 
            type="text" 
            value={backendUrl}
            onChange={(e) => setBackendUrl(e.target.value)}
            className="border border-outline-variant rounded-md px-2 py-1 w-56 text-xs focus:outline-none focus:border-primary font-mono text-on-surface bg-surface-container-low"
            placeholder="http://localhost:5000"
          />
          <button 
            onClick={() => {
              localStorage.setItem("forensiq_backend_url", backendUrl);
              testBackendConnection();
            }}
            className="bg-primary hover:bg-primary-container text-white px-3 py-1.5 rounded-md font-bold transition-colors cursor-pointer text-xs"
          >
            Connect
          </button>
        </div>
      </div>

      <div className="pt-2">
        {/* Universal Top AppBar */}
        <Header 
          currentTab={currentTab}
          onNavigate={setCurrentTab}
          user={user}
          onLogout={handleLogout}
        />
      </div>
      <div className="flex flex-1 pb-16 md:pb-0 pt-16" id="main-frame-split">
        {/* Content body wrapper with margin spacing */}
        <main className={`flex-1 w-full ${currentTab === 'home' ? 'p-0' : 'p-4 sm:p-6 max-w-7xl mx-auto'}`}>
          {currentTab === 'home' && (
            <Home onNavigate={setCurrentTab} />
          )}

          {currentTab === 'how-it-works' && (
            <HowItWorks />
          )}

          {currentTab === 'dashboard' && (
            <HistoryTable 
              records={records}
              onSelectRecord={handleSelectRecord}
              onDeleteRecord={handleDeleteRecord}
              onAddMockRecord={(rec) => setRecords(prev => [rec, ...prev])}
            />
          )}

          {currentTab === 'text' && <TextAnalysis backendUrl={backendUrl} modelsReady={modelsReady} onAddAnalyzedLog={handleAddAnalyzedLog} />}
          {currentTab === 'pdf' && <PDFAnalysis backendUrl={backendUrl} modelsReady={modelsReady} onAddAnalyzedLog={handleAddAnalyzedLog} />}
          {currentTab === 'image' && <ImageAnalysis backendUrl={backendUrl} modelsReady={modelsReady} onAddAnalyzedLog={handleAddAnalyzedLog} />}
          {currentTab === 'video' && <VideoAnalysis backendUrl={backendUrl} modelsReady={modelsReady} onAddAnalyzedLog={handleAddAnalyzedLog} />}

          {currentTab === 'settings' && (
            <SettingsPanel 
              user={user}
              onUpdateUser={setUser}
              onDeleteAccount={handleLogout}
              backendUrl={backendUrl}
              setBackendUrl={setBackendUrl}
              backendOnline={backendOnline}
              testBackendConnection={testBackendConnection}
            />
          )}
        </main>
      </div>
    </div>
  );
}
