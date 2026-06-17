/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { UserProfile } from '../types';

interface SettingsPanelProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  onDeleteAccount: () => void;
  backendUrl: string;
  setBackendUrl: (url: string) => void;
  backendOnline: boolean;
  testBackendConnection: (customUrl?: string) => Promise<boolean>;
}

export default function SettingsPanel({ 
  user, 
  onUpdateUser, 
  onDeleteAccount,
  backendUrl,
  setBackendUrl,
  backendOnline,
  testBackendConnection
}: SettingsPanelProps) {
  const [fullName, setFullName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [sensitivity, setSensitivity] = useState(85);
  const [temporalThreshold, setTemporalThreshold] = useState(42);
  const [autoSave, setAutoSave] = useState(false);
  const [advancedMetadata, setAdvancedMetadata] = useState(true);
  
  const [apiKeyVisible, setApiKeyVisible] = useState(false);
  const [apiKey, setApiKey] = useState('fsq_prod_live_83b27ae8c19fb2e998a12dc');
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [quota, setQuota] = useState(4512);

  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name: fullName,
      email: email
    });
    alert('Investigator Profile saved successfully!');
  };

  const handleRegenerateKey = () => {
    setIsRegenerating(true);
    setTimeout(() => {
      const generated = 'fsq_prod_live_' + Array.from({length: 24}, () => Math.floor(Math.random()*16).toString(16)).join('');
      setApiKey(generated);
      setIsRegenerating(false);
      setQuota(0); // Reset quota on key regeneration!
      alert('New production API keys provisioned successfully. Quota metrics reset.');
    }, 1200);
  };

  return (
    <div id="settings-section" className="space-y-6 text-left animate-in fade-in duration-300">
      
      {/* Settings Title Header */}
      <div>
        <h1 className="font-headline text-2xl md:text-3xl font-extrabold text-on-surface">Settings</h1>
        <p className="font-sans text-sm text-on-surface-variant">Configure your forensic analysis engine and account preferences.</p>
      </div>

      <div className="max-w-4xl space-y-6">
        
        {/* Profile Section */}
        <section className="bg-white border border-outline-variant rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 select-none">
              <h2 className="font-headline text-base font-bold text-on-surface mb-1">Profile</h2>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Manage your public identity and contact information within the platform.
              </p>
            </div>
            
            <div className="w-full md:w-2/3 space-y-5">
              
              {/* Profile Card Header with avatar */}
              <div className="flex items-center gap-4 p-4 bg-surface-container-low/50 rounded-2xl border border-outline-variant/60">
                <div className="relative group select-none">
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.name} 
                      className="h-16 w-16 rounded-xl object-cover border-2 border-primary-fixed"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-xl bg-primary-container text-white flex items-center justify-center font-bold text-lg select-none">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </div>
                  )}
                  <button 
                    type="button"
                    onClick={() => alert("Profile image adjustments must be requested via administrative channels.")}
                    className="absolute -bottom-1 -right-1 bg-primary text-white p-1 rounded-full shadow-md hover:scale-110 transition-transform flex items-center justify-center"
                    title="Edit profile photo"
                  >
                    <span className="material-symbols-outlined text-xs">edit</span>
                  </button>
                </div>
                
                <div className="text-left">
                  <h3 className="font-headline text-sm font-extrabold text-on-surface">{user.name}</h3>
                  <p className="font-mono text-[10px] text-outline-variant font-bold uppercase tracking-wider mt-0.5">{user.role}</p>
                </div>
              </div>

              {/* Form editing profile */}
              <form onSubmit={handleProfileSave} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="font-mono text-[10px] font-bold text-on-surface-variant block uppercase tracking-wider">Full Name</label>
                    <input 
                      className="w-full bg-white border border-outline-variant/60 rounded-xl px-4 py-2.5 font-sans text-xs font-semibold focus:ring-2 focus:ring-primary/10 transition-all outline-none" 
                      type="text" 
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-mono text-[10px] font-bold text-on-surface-variant block uppercase tracking-wider">Email Address</label>
                    <input 
                      className="w-full bg-white border border-outline-variant/60 rounded-xl px-4 py-2.5 font-sans text-xs font-semibold focus:ring-2 focus:ring-primary/10 transition-all outline-none" 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex justify-start">
                  <button 
                    type="submit"
                    className="bg-primary hover:bg-primary-container text-white px-5 py-2 rounded-xl font-sans text-xs font-bold transition-all active:scale-[0.98] cursor-pointer shadow-xs"
                  >
                    Save Changes
                  </button>
                </div>
              </form>
            </div>
          </div>
        </section>

        {/* Analysis Engine preferences Section */}
        <section className="bg-white border border-outline-variant rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 select-none">
              <h2 className="font-headline text-base font-bold text-on-surface mb-1">Analysis Engine</h2>
              <p className="font-sans text-xs text-[11px] text-on-surface-variant leading-relaxed">
                Calibrate the sensitivity of neural networks and detection heuristics.
              </p>
            </div>

            <div className="w-full md:w-2/3 space-y-6">
              {/* Sliders */}
              <div className="space-y-5">
                {/* Sensitivity Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center select-none">
                    <label className="font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Detection Sensitivity</label>
                    <span className="font-mono text-xs font-extrabold text-primary">{sensitivity}%</span>
                  </div>
                  <input 
                    className="w-full h-1 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary" 
                    max="100" 
                    min="0" 
                    type="range" 
                    value={sensitivity}
                    onChange={(e) => setSensitivity(Number(e.target.value))}
                  />
                  <p className="text-[10px] text-outline italic leading-normal select-none">
                    Higher sensitivity may increase false positives but ensures higher recall for deepfake artifacts.
                  </p>
                </div>

                {/* Temporal Threshold Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between items-center select-none">
                    <label className="font-mono text-[10px] font-bold text-on-surface-variant uppercase tracking-wider">Temporal Coherence Threshold</label>
                    <span className="font-mono text-xs font-extrabold text-primary">{(temporalThreshold / 100).toFixed(2)}ms</span>
                  </div>
                  <input 
                    className="w-full h-1 bg-outline-variant rounded-lg appearance-none cursor-pointer accent-primary" 
                    max="100" 
                    min="0" 
                    type="range" 
                    value={temporalThreshold}
                    onChange={(e) => setTemporalThreshold(Number(e.target.value))}
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-4 pt-4 border-t border-outline-variant/60 select-none">
                {/* Auto Save Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-start text-left">
                    <span className="font-sans text-xs font-black text-on-surface">Auto-save Analysis Results</span>
                    <span className="font-sans text-[10px] text-on-surface-variant">Automatically archive all completed scans to secure storage.</span>
                  </div>
                  <button 
                    onClick={() => setAutoSave(!autoSave)}
                    className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center cursor-pointer ${autoSave ? 'bg-primary' : 'bg-outline-variant/50'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-xs ${autoSave ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </button>
                </div>

                {/* Advanced Metadata Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex flex-col items-start text-left">
                    <span className="font-sans text-xs font-black text-on-surface">Advanced Metadata Extraction</span>
                    <span className="font-sans text-[10px] text-on-surface-variant">Extract GPS, camera serials, and original codec headers.</span>
                  </div>
                  <button 
                    onClick={() => setAdvancedMetadata(!advancedMetadata)}
                    className={`w-11 h-6 rounded-full p-1 transition-colors flex items-center cursor-pointer ${advancedMetadata ? 'bg-primary' : 'bg-outline-variant/50'}`}
                  >
                    <div className={`w-4 h-4 bg-white rounded-full transition-transform shadow-xs ${advancedMetadata ? 'translate-x-5' : 'translate-x-0'}`}></div>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Backend Connection Section */}
        <section className="bg-white border border-outline-variant rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 select-none">
              <h2 className="font-headline text-base font-bold text-on-surface mb-1">Backend Connection</h2>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Connect and authenticate with your local or cloud FORENSIQ AI analysis server.
              </p>
            </div>

            <div className="w-full md:w-2/3 space-y-4">
              <div className="flex items-center gap-3.5 p-3.5 bg-surface-container-low/50 rounded-2xl border border-outline-variant/60">
                <div className="flex items-center gap-2 select-none">
                  <span className={`inline-block w-2.5 h-2.5 rounded-full ${backendOnline ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></span>
                  <span className={`font-mono text-[10px] font-bold uppercase tracking-wider ${backendOnline ? 'text-green-600' : 'text-red-500'}`}>
                    {backendOnline ? '● Online' : '● Offline'}
                  </span>
                </div>
              </div>

              <div className="space-y-3.5">
                <div className="space-y-1">
                  <label className="font-mono text-[10px] font-bold text-on-surface-variant block uppercase tracking-wider">Backend API Server URL</label>
                  <div className="flex gap-2">
                    <input 
                      className="w-full bg-white border border-outline-variant/60 rounded-xl px-4 py-2.5 font-sans text-xs font-semibold focus:ring-2 focus:ring-primary/10 transition-all outline-none truncate" 
                      type="text" 
                      value={backendUrl}
                      onChange={(e) => {
                        const url = e.target.value;
                        setBackendUrl(url);
                        localStorage.setItem('forensiq_backend_url', url);
                      }}
                      placeholder="http://localhost:5001"
                    />
                    <button 
                      type="button"
                      onClick={() => testBackendConnection()}
                      className="bg-primary hover:bg-primary-container text-white px-5 py-2.5 rounded-xl font-sans text-xs font-bold transition-all active:scale-[0.98] cursor-pointer shadow-xs whitespace-nowrap"
                    >
                      Test Connection
                    </button>
                  </div>
                </div>
              </div>

              {/* Setup Guide instructions inside Settings */}
              <div className="p-4 bg-[#F0F9FF] border border-[#BAE6FD] rounded-xl text-xs text-[#0369A1] leading-relaxed space-y-2 select-text">
                <h4 className="font-extrabold uppercase tracking-wider flex items-center gap-1.5 text-[#0369A1]">
                  <span className="material-symbols-outlined text-sm">info</span>
                  How to start FORENSIQ AI:
                </h4>
                <ol className="list-decimal pl-5 space-y-1 font-medium">
                  <li>Open terminal</li>
                  <li>Type: <code>python launcher.py</code></li>
                  <li>Wait for 'Backend ONLINE' message</li>
                  <li>Open <code>http://localhost:3000</code></li>
                  <li>See green dot = ready!</li>
                </ol>
              </div>
            </div>
          </div>
        </section>

        {/* API Access Section */}
        <section className="bg-white border border-outline-variant rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 select-none">
              <h2 className="font-headline text-base font-bold text-on-surface mb-1">API Access</h2>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Connect your forensic pipeline to external automated workflows.
              </p>
            </div>

            <div className="w-full md:w-2/3 space-y-4">
              <div className="p-4 bg-surface-container-low/50 rounded-2xl border border-outline-variant/60 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="space-y-1 text-left overflow-hidden w-full sm:w-auto">
                  <label className="font-mono text-[9px] font-bold text-outline uppercase tracking-wider block">Production API Key</label>
                  <div className="font-mono text-xs font-semibold text-on-surface flex items-center gap-2 select-text">
                    {apiKeyVisible ? (
                      <span className="font-mono tracking-wide">{apiKey}</span>
                    ) : (
                      <span className="font-mono tracking-widest text-outline">••••••••••••••••••••••••••••••••</span>
                    )}
                    <button 
                      onClick={() => setApiKeyVisible(!apiKeyVisible)}
                      type="button" 
                      className="text-primary hover:bg-surface-container p-1 rounded-sm transition-colors cursor-pointer flex items-center justify-center"
                    >
                      <span className="material-symbols-outlined text-base">
                        {apiKeyVisible ? 'visibility_off' : 'visibility'}
                      </span>
                    </button>
                  </div>
                </div>

                <button 
                  onClick={handleRegenerateKey}
                  disabled={isRegenerating}
                  className="bg-primary text-white px-4 py-2 rounded-xl font-sans text-xs font-bold hover:bg-primary-container transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50 select-none shadow-xs text-center"
                >
                  <span className={`material-symbols-outlined text-[16px] ${isRegenerating ? 'animate-spin' : ''}`}>refresh</span>
                  {isRegenerating ? 'REGENERATING...' : 'REGENERATE'}
                </button>
              </div>

              {/* API Notice block */}
              <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-xl border border-amber-200">
                <span className="material-symbols-outlined text-amber-600 text-[18px]">info</span>
                <p className="font-sans text-[11px] text-amber-800 font-bold select-none text-left">
                  Monthly API quota: {quota.toLocaleString()} / 10,000 requests used.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Danger Zone Section */}
        <section className="border border-error/30 rounded-2xl bg-error-container/5 overflow-hidden">
          <div className="px-6 py-4 border-b border-error/20 bg-error-container/15 select-none text-left">
            <h3 className="font-headline text-sm font-extrabold text-error uppercase tracking-wider">Danger Zone</h3>
          </div>
          
          <div className="p-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="space-y-1 text-left">
              <h4 className="font-sans text-sm font-black text-on-surface">Delete Account</h4>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Permanently remove all data, case history, and API keys. This action is irreversible.
              </p>
            </div>
            
            <button 
              onClick={() => {
                if (confirm("Are you absolutely sure you want to delete your investigator account? All persistent scan vaults will be wiped.")) {
                  onDeleteAccount();
                }
              }}
              className="w-full md:w-auto px-6 py-2.5 bg-error text-white rounded-xl font-sans text-xs font-bold hover:bg-red-700 hover:scale-[0.99] active:scale-[0.97] transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm shadow-error/10"
            >
              <span className="material-symbols-outlined text-sm">delete_forever</span>
              DELETE ACCOUNT
            </button>
          </div>
        </section>

      </div>
    </div>
  );
}
