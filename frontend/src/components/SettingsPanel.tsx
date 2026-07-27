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
  testBackendConnection: () => Promise<{ online: boolean; ready: boolean }>;
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
  
  const handleProfileSave = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateUser({
      ...user,
      name: fullName,
      email: email
    });
    alert('Investigator Profile saved successfully!');
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

        {/* Security & Subscription Section */}
        <section className="bg-white border border-outline-variant rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/3 select-none">
              <h2 className="font-headline text-base font-bold text-on-surface mb-1">Security & Subscription</h2>
              <p className="font-sans text-xs text-on-surface-variant leading-relaxed">
                Manage your account security and view your active subscription tier.
              </p>
            </div>

            <div className="w-full md:w-2/3 space-y-4">
              <div className="p-4 bg-surface-container-low/50 rounded-2xl border border-outline-variant/60 flex flex-col justify-between gap-4">
                
                {/* Subscription Plan */}
                <div className="space-y-1 text-left">
                  <label className="font-mono text-[9px] font-bold text-outline uppercase tracking-wider block">Current Plan</label>
                  <div className="font-sans text-xs font-bold text-on-surface flex items-center gap-2 mt-1">
                    <span className="material-symbols-outlined text-amber-500 text-lg">workspace_premium</span>
                    FORENSIQ Investigator Pro
                    <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full text-[10px] uppercase ml-2 tracking-wide">Active</span>
                  </div>
                </div>
                
                {/* 2FA */}
                <div className="space-y-2 text-left mt-2 border-t border-outline-variant/60 pt-4">
                  <label className="font-mono text-[9px] font-bold text-outline uppercase tracking-wider block">Two-Factor Authentication</label>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-on-surface">
                      <span className="material-symbols-outlined text-primary text-base">phonelink_lock</span>
                      <span className="font-sans text-xs font-semibold">Authenticator App</span>
                    </div>
                    <button className="bg-surface-container border border-outline-variant text-on-surface px-4 py-1.5 rounded-lg font-sans text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer">
                      Manage 2FA
                    </button>
                  </div>
                </div>

                {/* Login History */}
                <div className="space-y-2 text-left mt-2 border-t border-outline-variant/60 pt-4">
                  <label className="font-mono text-[9px] font-bold text-outline uppercase tracking-wider block">Recent Activity</label>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col text-on-surface">
                      <span className="font-sans text-xs font-semibold">Last login from Windows / Chrome</span>
                      <span className="font-sans text-[10px] text-on-surface-variant">Today at 10:45 AM • IP: 192.168.1.1</span>
                    </div>
                    <button className="text-primary hover:underline font-sans text-xs font-bold cursor-pointer">
                      View all
                    </button>
                  </div>
                </div>

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
