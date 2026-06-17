/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { UserProfile } from '../types';

interface RegistrationProps {
  backendUrl: string;
  onRegisterSuccess: (user: UserProfile) => void;
  onMockSignIn: () => void;
}

export default function Registration({ backendUrl, onRegisterSuccess, onMockSignIn }: RegistrationProps) {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<'register' | 'login'>('register');
  
  // OTP flow states
  const [otpStep, setOtpStep] = useState<'form' | 'verify'>('form');
  const [otpValue, setOtpValue] = useState('');
  
  // Mock Google One Tap State
  const [showMockOneTap, setShowMockOneTap] = useState(false);

  // Show the mock One Tap shortly after mount to simulate real behavior
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowMockOneTap(true);
    }, 1000);
    return () => clearTimeout(timer);
  }, []);

  const handleMockGoogleSelect = () => {
    setShowMockOneTap(false);
    const mockGoogleEmail = 'investigator@gmail.com';
    setEmail(mockGoogleEmail);
    setFullName('Investigator');
    onRegisterSuccess({
      name: 'Investigator',
      email: mockGoogleEmail,
      role: 'Forensic Investigator',
      avatarUrl: ''
    });
  };

  // Password strength score evaluation (0 to 4)
  const getPasswordStrength = (val: string) => {
    if (!val) return { score: 0, label: 'Minimum 8 characters', color: 'text-outline', barCount: 0 };
    let score = 1;
    if (val.length > 5) score = 2;
    if (val.length >= 8 && /[A-Z]/.test(val) && /[0-9]/.test(val)) score = 3;
    if (val.length >= 10 && /[!@#$%^&*]/.test(val)) score = 4;

    switch (score) {
      case 1:
        return { score, label: 'Weak', color: 'text-error', barCount: 1, barClass: 'bg-error' };
      case 2:
        return { score, label: 'Fair', color: 'text-orange-500', barCount: 2, barClass: 'bg-orange-500' };
      case 3:
        return { score, label: 'Good', color: 'text-secondary', barCount: 3, barClass: 'bg-secondary' };
      case 4:
        return { score, label: 'Clinical Security Grade', color: 'text-primary', barCount: 4, barClass: 'bg-primary' };
      default:
        return { score: 0, label: 'Minimum 8 characters', color: 'text-outline', barCount: 0 };
    }
  };

  const strength = getPasswordStrength(password);

  const requestOtp = async (targetEmail: string) => {
    setErrorText('');
    setIsLoading(true);

    try {
      const res = await fetch(`${backendUrl}/auth/request-otp`, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail.trim() })
      });
      const data = await res.json();
      
      if (data.success) {
        setOtpStep('verify');
      } else {
        setErrorText(data.error || 'Failed to send OTP.');
      }
    } catch (err) {
      setErrorText('Could not connect to backend to request OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (mode === 'register' && !fullName.trim()) {
      setErrorText('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorText('Please enter a valid investigator email address.');
      return;
    }
    if (password.length < 8) {
      setErrorText('Password must be at least 8 characters long.');
      return;
    }
    if (mode === 'register' && !agreeTerms) {
      setErrorText('You must agree to the Terms of Service and Privacy Policy to register.');
      return;
    }

    onRegisterSuccess({
      name: fullName.trim() || email.split('@')[0],
      email: email.trim(),
      role: 'Forensic Investigator',
      avatarUrl: ''
    });
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpValue.trim()) {
      setErrorText('Please enter the 6-digit OTP code.');
      return;
    }

    setErrorText('');
    setIsLoading(true);

    try {
      const res = await fetch(`${backendUrl}/auth/verify-otp`, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), otp: otpValue.trim() })
      });
      const data = await res.json();
      
      if (data.success) {
        // Successful login/register
        onRegisterSuccess({
          name: fullName.trim(),
          email: email.trim(),
          role: 'Forensic Investigator',
          avatarUrl: '' // No custom avatar - default back to letters
        });
      } else {
        setErrorText(data.error || 'Invalid OTP code.');
      }
    } catch (err) {
      setErrorText('Could not connect to backend to verify OTP.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUpClick = () => {
    // If they click the manual button, just show the mock One Tap again
    setShowMockOneTap(true);
  };

  return (
    <div className="h-screen bg-[#edebe6] flex flex-col lg:flex-row overflow-hidden relative font-sans text-[#300000]" id="registration-page">
      {/* 
        LEFT SECTION: Huge Typography 
      */}
      <div className="w-full lg:w-1/2 flex items-center justify-center lg:justify-start p-6 lg:pl-20 xl:pl-32 z-10 pt-8 lg:pt-0">
        <div className="max-w-2xl relative z-10 flex flex-col items-center lg:items-start w-full">
          <h1 className="flex flex-col items-center lg:items-start text-center lg:text-left text-[12vw] sm:text-[10vw] lg:text-[7vw] xl:text-[90px] font-black leading-[0.9] tracking-tighter uppercase mb-6" style={{ fontFamily: 'Inter, sans-serif' }}>
            <span className="block text-[#300000] pb-2 drop-shadow-sm">FORENSIQ</span>
            <span className="block text-[#800000] mt-1 tracking-[0.2em] relative lg:left-0 text-center w-full drop-shadow-sm">AI</span>
          </h1>
          <p className="text-lg md:text-xl text-[#300000]/70 font-medium max-w-md mt-6 border-l-4 border-[#800000] pl-4">
            Scientific Evidence Verification at Scale. Enter the clinical environment for deep-media analysis.
          </p>
        </div>
      </div>

      {/* 
        RIGHT SECTION: 3D Slices and Login Form 
      */}
      <div className="w-full lg:w-1/2 relative h-full flex items-center justify-center p-4 lg:p-8 z-10">
        
        {/* 
          --- BACKGROUND SLICES ---
        */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none perspective-[1000px] opacity-[0.4]">
          {/* Slice 1: Bottom (Light Grey) */}
          <div className="absolute top-[20%] left-[10%] w-[150%] h-[80%] bg-gradient-to-br from-[#f0f0f0] to-[#e0e0e0] rounded-[60px] opacity-90 transform -rotate-12 -skew-x-12 scale-110 shadow-2xl origin-center transition-transform duration-1000 border border-black/5">
             <div className="absolute top-10 left-20 text-[#300000]/10 text-[100px] font-black italic tracking-tighter">INTEGRITY</div>
          </div>
          
          {/* Slice 2: Middle (Warmer Grey) */}
          <div className="absolute top-[10%] left-[15%] w-[150%] h-[80%] bg-gradient-to-br from-[#ebebeb] via-[#e6e6e6] to-[#dfdfdf] rounded-[60px] opacity-95 transform -rotate-6 -skew-x-6 scale-105 shadow-xl origin-center border border-black/5 transition-transform duration-1000 delay-100">
             <div className="absolute bottom-20 right-[40%] text-[#300000]/10 text-[120px] font-black uppercase">SECURITY</div>
          </div>
          
          {/* Slice 3: Top (Maroon Accent) */}
          <div className="absolute top-[-5%] left-[25%] w-[150%] h-[80%] bg-gradient-to-tr from-[#800000] via-[#500000] to-[#300000] rounded-[60px] opacity-90 transform rotate-3 skew-x-3 scale-100 shadow-[0_30px_60px_rgba(0,0,0,0.1)] origin-center border border-black/10 transition-transform duration-1000 delay-200">
             <div className="absolute top-1/3 left-10 text-white/20 text-6xl font-black tracking-widest uppercase">Analysis Mode</div>
          </div>
        </div>

        {/* 
          --- FOREGROUND LOGIN FORM ---
        */}
        <div className="relative z-20 w-full max-w-[420px] bg-white border border-[#800000]/20 rounded-[32px] p-6 lg:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.1)]">
          <div className="mb-6">
            <h2 className="font-headline text-3xl text-[#300000] font-extrabold mb-2 text-left">
              {mode === 'register' ? 'Create Account' : 'Welcome Back'}
            </h2>
            <p className="font-sans text-sm text-[#300000]/60 text-left">
              {mode === 'register' ? 'Start your forensic analysis journey today.' : 'Sign in to access your forensic workspace.'}
            </p>
          </div>

          {/* Error Message */}
          {errorText && (
            <div className="mb-6 p-3 bg-red-100 text-red-700 border border-red-200 rounded-xl text-sm font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">error</span>
              <span>{errorText}</span>
            </div>
          )}

          {otpStep === 'form' ? (
            <>
              {/* Social Signup */}
              <button 
                type="button"
                onClick={handleGoogleSignUpClick}
                className="w-full flex items-center justify-center gap-3 py-3.5 px-4 border border-[#300000]/20 rounded-xl font-sans text-sm font-bold text-[#300000] bg-white hover:bg-black/5 transition-all active:scale-[0.98] cursor-pointer shadow-sm"
              >
                <svg className="w-5 h-5 bg-transparent rounded-full p-0.5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
                </svg>
                Continue with Google
              </button>

              <div className="relative flex items-center my-6">
                <div className="flex-grow border-t border-[#300000]/10"></div>
                <span className="flex-shrink mx-4 font-mono text-[10px] text-[#300000]/40 uppercase tracking-widest bg-transparent">
                  OR {mode === 'register' ? 'REGISTER' : 'LOGIN'} VIA EMAIL
                </span>
                <div className="flex-grow border-t border-[#300000]/10"></div>
              </div>

              {/* Registration Form */}
              <form className="space-y-4" onSubmit={handleSubmit}>
                {mode === 'register' && (
                  <div>
                    <label className="block font-sans text-[11px] font-bold text-[#300000]/60 mb-1.5 uppercase tracking-wider" htmlFor="full_name">Full Name</label>
                    <input 
                      className="w-full h-12 px-4 rounded-xl border border-black/10 bg-white text-[#300000] placeholder-black/20 focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/20 outline-none transition-all font-sans text-sm shadow-sm" 
                      id="full_name" 
                      placeholder="Investigator Name" 
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                )}

                <div>
                  <label className="block font-sans text-[11px] font-bold text-[#300000]/60 mb-1.5 uppercase tracking-wider" htmlFor="email">Email Address</label>
                  <input 
                    className="w-full h-12 px-4 rounded-xl border border-black/10 bg-white text-[#300000] placeholder-black/20 focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/20 outline-none transition-all font-sans text-sm shadow-sm" 
                    id="email" 
                    placeholder="name@agency.gov" 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div>
                  <label className="block font-sans text-[11px] font-bold text-[#300000]/60 mb-1.5 uppercase tracking-wider" htmlFor="password">Password</label>
                  <input 
                    className="w-full h-12 px-4 rounded-xl border border-black/10 bg-white text-[#300000] placeholder-black/20 focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/20 outline-none transition-all font-sans text-sm shadow-sm" 
                    id="password" 
                    placeholder="••••••••" 
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                  />
                  {mode === 'register' && password && (
                    <div className="mt-2 flex items-center justify-between">
                      <div className="flex gap-1 flex-grow mr-4">
                        {[...Array(4)].map((_, i) => (
                          <div 
                            key={i} 
                            className={`h-1 flex-grow rounded-full transition-colors duration-300 ${i < getPasswordStrength(password).barCount ? getPasswordStrength(password).barClass : 'bg-black/10'}`}
                          ></div>
                        ))}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${getPasswordStrength(password).color}`}>
                        {getPasswordStrength(password).label}
                      </span>
                    </div>
                  )}
                </div>

                {mode === 'register' && (
                  <div className="flex items-start gap-3 pt-2">
                    <div className="flex items-center h-5">
                      <input 
                        id="terms" 
                        type="checkbox" 
                        className="w-4 h-4 rounded border-black/20 bg-white text-[#800000] focus:ring-[#800000]/50" 
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        disabled={isLoading}
                      />
                    </div>
                    <label htmlFor="terms" className="text-xs text-[#300000]/60 leading-relaxed cursor-pointer select-none">
                      I agree to the <a href="#" className="text-[#800000] font-medium hover:underline">Terms of Service</a> and <a href="#" className="text-[#800000] font-medium hover:underline">Privacy Policy</a>.
                    </label>
                  </div>
                )}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className={`w-full h-12 mt-4 text-white font-sans text-sm font-bold rounded-xl transition-all shadow-lg shadow-[#800000]/20 flex items-center justify-center gap-2 ${isLoading ? 'bg-black/10 text-black/50 cursor-not-allowed' : 'bg-gradient-to-r from-[#800000] to-[#500000] hover:opacity-90 active:scale-[0.98] cursor-pointer'}`}
                >
                  {isLoading ? (
                    <>
                      <span className="material-symbols-outlined animate-spin text-lg">autorenew</span>
                      Processing...
                    </>
                  ) : (
                    mode === 'register' ? 'Create Account' : 'Sign In'
                  )}
                </button>
              </form>

              <p className="text-center font-sans text-sm text-[#300000]/50 mt-6">
                {mode === 'register' ? 'Already have an account?' : "Don't have an account?"}
                <button 
                  type="button"
                  onClick={() => { setMode(mode === 'register' ? 'login' : 'register'); setErrorText(''); }}
                  className="ml-2 text-[#800000] font-bold hover:underline transition-all cursor-pointer"
                >
                  {mode === 'register' ? 'Sign In' : 'Register'}
                </button>
              </p>
            </>
          ) : (
            <div className="space-y-6 animate-in slide-in-from-right duration-300">
              <div className="bg-black/5 border border-black/10 p-5 rounded-2xl text-center backdrop-blur-md">
                <span className="material-symbols-outlined text-4xl text-[#800000] mb-3 block">mark_email_read</span>
                <p className="font-sans text-sm font-medium text-[#300000]">We sent a 6-digit code to</p>
                <p className="font-mono text-base font-bold text-[#800000] mt-1 mb-2">{email}</p>
                <p className="font-sans text-xs text-[#300000]/60">Please check your inbox and enter the code below.</p>
              </div>

              <form className="space-y-5" onSubmit={handleVerifyOtp}>
                <div>
                  <label className="block font-sans text-[11px] font-bold text-[#300000]/60 mb-1.5 uppercase tracking-wider text-center" htmlFor="otp_code">Verification Code</label>
                  <input 
                    className="w-full h-14 px-4 rounded-xl border border-black/20 bg-white text-[#300000] placeholder-black/10 focus:border-[#800000] focus:ring-2 focus:ring-[#800000]/20 outline-none transition-all font-mono text-2xl text-center tracking-[0.5em] shadow-sm" 
                    id="otp_code" 
                    placeholder="000000" 
                    type="text"
                    maxLength={6}
                    value={otpValue}
                    onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ''))}
                    disabled={isLoading}
                    autoComplete="one-time-code"
                    autoFocus
                  />
                </div>

                <button 
                  type="submit"
                  disabled={isLoading || otpValue.length !== 6}
                  className={`w-full h-12 text-white font-sans text-sm font-bold rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 ${(isLoading || otpValue.length !== 6) ? 'bg-black/10 text-black/40 cursor-not-allowed shadow-none' : 'bg-gradient-to-r from-[#800000] to-[#500000] hover:opacity-90 active:scale-[0.98] cursor-pointer shadow-[#800000]/20'}`}
                >
                  {isLoading ? 'Verifying...' : 'Verify & Sign In'}
                </button>
              </form>

              <button 
                onClick={() => { setOtpStep('form'); setErrorText(''); setOtpValue(''); }}
                className="w-full text-center text-xs text-[#300000]/50 hover:text-[#800000] transition-colors cursor-pointer font-bold"
              >
                Go back
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mock Google One Tap UI */}
      {showMockOneTap && otpStep !== 'verify' && (
        <div className="fixed top-4 right-4 md:top-6 md:right-6 w-96 bg-white rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.1)] overflow-hidden z-50 animate-in slide-in-from-top-4 fade-in duration-500 border border-black/10 select-none font-sans text-[#300000]">
          <div className="flex items-center justify-between p-4 border-b border-black/5">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
              </svg>
              <span className="text-[15px] text-[#300000] font-medium">Sign in to forensiq-ai with google.com</span>
            </div>
            <button 
              onClick={() => setShowMockOneTap(false)}
              className="text-black/40 hover:text-black p-1 rounded-full hover:bg-black/5 transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">close</span>
            </button>
          </div>
          
          <div className="p-5">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#800000] to-[#500000] flex items-center justify-center text-white font-bold text-lg shadow-inner">
                I
              </div>
              <div className="flex flex-col">
                <span className="text-[15px] text-[#300000] font-bold leading-tight">Investigator Account</span>
                <span className="text-[13px] text-[#300000]/60 leading-tight mt-0.5">investigator@gmail.com</span>
              </div>
            </div>
            
            <button 
              onClick={handleMockGoogleSelect}
              className="w-full h-10 bg-[#1a73e8] hover:bg-[#1b66c9] active:bg-[#174ea6] text-white rounded-full font-medium text-[14px] transition-colors cursor-pointer shadow-md"
            >
              Continue as Investigator
            </button>
            
            <p className="mt-4 text-[12px] text-[#300000]/50 leading-relaxed pr-2">
              To continue, google.com will share your name, email address, and profile picture with this site. See this site's <a href="#" className="text-[#1a73e8] hover:underline">privacy policy</a> and <a href="#" className="text-[#1a73e8] hover:underline">Terms of Service</a>.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
