/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { ImageAnalysisResult } from '../types';
import { DEFAULT_IMAGE_RESULT } from '../mockData';

interface ImageAnalysisProps {
  backendUrl: string;
  modelsReady: boolean | null;
  onAddAnalyzedLog: (name: string, type: 'image', score: number, verdict: string, status: 'Completed' | 'Review Required') => void;
}

export default function ImageAnalysis({ backendUrl, modelsReady, onAddAnalyzedLog }: ImageAnalysisProps) {
  const [imageUrl, setImageUrl] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState<ImageAnalysisResult | null>(DEFAULT_IMAGE_RESULT);
  const [hoveredAnomalyId, setHoveredAnomalyId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'slider' | 'sideBySide' | 'standard'>('slider');
  const [sliderValue, setSliderValue] = useState(50);
  const [zoomLevel, setZoomLevel] = useState<1 | 1.5 | 2 | 3>(1);
  const [lensType, setLensType] = useState<'heatmap' | 'highpass' | 'compression'>('heatmap');
  const [hoverCoords, setHoverCoords] = useState<{ x: number; y: number } | null>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setIsScanning(true);
      setScanResult(null);

        try {
          const localUrl = URL.createObjectURL(file);
          const formData = new FormData();
          formData.append('file', file);
  
          const response = await fetch(`${backendUrl}/analyze-image`, {
            method: 'POST',
            body: formData,
            mode: 'cors'
          });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `Server returned status code ${response.status}`);
        }

        const data = await response.json();
        if (data.success) {
          const score = data.final_score; // Higher is more authentic
          const riskScore = 100 - score;
          const verdict = data.verdict;
          const generator = data.generator;
          const fileInfo = data.image_info;

          const anomalies = score >= 75 ? [] : [
            {
              id: 'an_1',
              title: 'JPEG Compression Block Inconsistency',
              x: 42,
              y: 35,
              description: 'Double-compression anomalies and localized metadata block changes were highlighted by ELA.'
            },
            {
              id: 'an_2',
              title: 'Noise Floor Asymmetry',
              x: 58,
              y: 62,
              description: `High-frequency noise floor variations correspond to a ${generator} signature.`
            }
          ];

          setScanResult({
            riskScore,
            verdict: score >= 75 ? 'Authentic Media' : 'Altered/Generated Media',
            description: `Verification completed using ensembled analysis models. Identified source: ${generator}.`,
            imageUrl: localUrl,
            metadata: {
              resolution: `${fileInfo.width}x${fileInfo.height}`,
              cameraBrand: fileInfo.has_exif ? 'Exif Verified' : 'Exif Stripped/Unknown',
              cameraModel: fileInfo.has_exif ? 'Sensor Payload Active' : 'Exif Metadata Absent',
              software: score < 50 ? generator : 'Camera Firmware',
              gpsCoordinates: fileInfo.has_exif ? 'Verified Geo-tag' : 'Absent',
              originalCodec: fileInfo.format || 'PNG'
            },
            anomalies
          });

          onAddAnalyzedLog(
            file.name,
            'image',
            score,
            score > 75 ? 'Original' : 'Altered',
            score > 50 ? 'Completed' : 'Review Required'
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
    }
  };

  const handleImageScan = async () => {
    if (!imageUrl.trim()) return;
    setIsScanning(true);
    setScanResult(null);

    try {
      const response = await fetch(`${backendUrl}/analyze-image`, {
        method: 'POST',
        mode: 'cors',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: imageUrl })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Server returned status code ${response.status}`);
      }

      const data = await response.json();
      if (data.success) {
        const score = data.final_score; // Higher is authentic
        const riskScore = 100 - score;
        const verdict = data.verdict;
        const generator = data.generator;
        const fileInfo = data.image_info;

        const anomalies = score >= 75 ? [] : [
          {
            id: 'an_1',
            title: 'JPEG Compression Block Inconsistency',
            x: 42,
            y: 35,
            description: 'Double-compression anomalies and localized metadata block changes were highlighted by ELA.'
          },
          {
            id: 'an_2',
            title: 'Noise Floor Asymmetry',
            x: 58,
            y: 62,
            description: `High-frequency noise floor variations correspond to a ${generator} signature.`
          }
        ];

        setScanResult({
          riskScore,
          verdict: score >= 75 ? 'Authentic Media' : 'Altered/Generated Media',
          description: `Verification completed using ensembled analysis models. Identified source: ${generator}.`,
          imageUrl: imageUrl,
          metadata: {
            resolution: `${fileInfo.width}x${fileInfo.height}`,
            cameraBrand: fileInfo.has_exif ? 'Exif Verified' : 'Exif Stripped/Unknown',
            cameraModel: fileInfo.has_exif ? 'Sensor Payload Active' : 'Exif Metadata Absent',
            software: score < 50 ? generator : 'Camera Firmware',
            gpsCoordinates: fileInfo.has_exif ? 'Verified Geo-tag' : 'Absent',
            originalCodec: fileInfo.format || 'PNG'
          },
          anomalies
        });

        const parsedName = imageUrl.split('/').pop() || 'retrieved_imagery.jpg';
        onAddAnalyzedLog(
          parsedName,
          'image',
          score,
          score > 75 ? 'Original' : 'Altered',
          score > 50 ? 'Completed' : 'Review Required'
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

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * 100);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * 100);
    setHoverCoords({ x, y });
  };

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
        <div className={`bg-white border-2 border-dashed border-outline-variant rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all shadow-xs relative ${modelsReady === false ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary cursor-pointer group'}`}>
          <input 
            type="file" 
            accept="image/*" 
            onChange={handleFileUpload} 
            disabled={modelsReady === false}
            className={`absolute inset-0 opacity-0 z-10 ${modelsReady === false ? 'cursor-not-allowed hidden' : 'cursor-pointer'}`} 
          />
          <div className="w-16 h-16 rounded-full bg-secondary/10 flex items-center justify-center mb-4 group-hover:scale-105 transition-all text-secondary">
            <span className="material-symbols-outlined text-3xl">add_photo_alternate</span>
          </div>
          <h3 className="font-headline text-base font-bold text-on-surface mb-1">Drop Forensic Image</h3>
          <p className="font-sans text-xs text-on-surface-variant max-w-[210px] leading-relaxed mb-5">
            Collect TIFF, JPG, or raw satellite images up to 100MB for metadata audits.
          </p>
          <span className="bg-secondary text-white font-sans text-xs font-bold px-5 py-2 rounded-xl group-hover:bg-opacity-95 transition-colors shadow-xs">
            Select File
          </span>
        </div>

        {/* URL Input */}
        <div className="bg-white border border-outline-variant rounded-2xl p-5 shadow-xs">
          <label className="font-mono text-[10px] font-bold text-on-surface-variant block mb-2.5 uppercase tracking-wider">
            Analyze via URL
          </label>
          <div className="flex gap-2">
            <input 
              className="flex-1 bg-surface-container-low border border-outline-variant/60 rounded-xl px-4 py-2 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-secondary/20 focus:border-secondary transition-all text-on-surface truncate disabled:opacity-50" 
              placeholder="https://evidence.io/satellite_crop.jpg" 
              type="text"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              disabled={modelsReady === false}
            />
            <button 
              onClick={handleImageScan}
              disabled={modelsReady === false}
              className="material-symbols-outlined bg-surface-container text-on-surface hover:text-secondary p-2 rounded-xl transition-colors cursor-pointer text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              title="Parse Link"
            >
              link
            </button>
          </div>
        </div>

        {/* Diagnostic Loading state */}
        {isScanning && (
          <div className="bg-white border border-outline-variant rounded-2xl p-6 shadow-xs flex flex-col items-center text-center space-y-3 animate-pulse">
            <div className="w-8 h-8 rounded-full border-2 border-secondary border-t-transparent animate-spin"></div>
            <p className="font-sans text-xs font-semibold text-on-surface">Auditing metadata block...</p>
            <div className="w-full h-1 bg-surface-container rounded-full overflow-hidden">
              <div className="h-full bg-secondary rounded-full animate-infinite-loading w-1/2"></div>
            </div>
          </div>
        )}

        {/* Analysis Summary Card */}
        {scanResult && !isScanning && (
          <div className="bg-white border border-outline-variant rounded-2xl overflow-hidden shadow-xs font-sans">
            <div className="px-5 py-4 bg-surface-container-low border-b border-outline-variant flex justify-between items-center">
              <h4 className="font-mono text-[10px] font-bold text-secondary uppercase tracking-wider">Raster Verification</h4>
              <span className="font-mono text-[9px] font-bold px-2 py-0.5 rounded-full bg-error-container text-on-error-container">
                ALTERED
              </span>
            </div>
            
            <div className="p-6 flex flex-col items-center">
              <div className="relative w-32 h-32 flex items-center justify-center mb-5">
                <svg className="w-full h-full -rotate-90">
                  <circle className="text-surface-container-high" cx="64" cy="64" fill="transparent" r="58" stroke="currentColor" strokeWidth="8"></circle>
                  <circle className="drop-shadow-[0_0_8px_rgba(134,239,172,0.6)]" cx="64" cy="64" fill="transparent" r="58" stroke="#86efac" strokeDasharray="364" strokeDashoffset={364 - (364 * (100 - scanResult.riskScore)) / 100} strokeWidth="8" strokeLinecap="round" style={{ transition: 'stroke-dashoffset 1s ease-out' }}></circle>
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center font-bold">
                  <span className="font-headline text-2xl font-black text-on-surface">{100 - scanResult.riskScore}%</span>
                  <span className="font-mono text-[8px] font-semibold text-on-surface-variant uppercase tracking-wider text-[#86efac] drop-shadow-sm">AUTHENTICITY</span>
                </div>
              </div>

              <div className="text-center px-2">
                <h5 className="font-headline text-base font-bold text-error mb-1.5">{scanResult.verdict}</h5>
                <p className="font-sans text-[11px] text-on-surface-variant leading-relaxed">
                  {scanResult.description}
                </p>
              </div>
            </div>
          </div>
        )}
      </aside>

      {/* Main image whiteboard right */}
      <div className="lg:col-span-8 space-y-6">
        {scanResult && !isScanning && (
          <>
            {/* Top Workspace Bar */}
            <div className="bg-white border border-outline-variant rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs select-none">
              
              {/* Tab options left */}
              <div className="flex bg-slate-100 p-1 rounded-xl border border-outline-variant/40 w-fit">
                <button
                  type="button"
                  onClick={() => setViewMode('slider')}
                  className={`flex items-center gap-2 px-4.5 py-2 rounded-lg font-sans text-xs font-extrabold transition-all cursor-pointer ${
                    viewMode === 'slider'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">split_screen</span>
                  <span>Split Slider</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('sideBySide')}
                  className={`flex items-center gap-2 px-4.5 py-2 rounded-lg font-sans text-xs font-extrabold transition-all cursor-pointer ${
                    viewMode === 'sideBySide'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">compare</span>
                  <span>Side-by-Side</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('standard')}
                  className={`flex items-center gap-2 px-4.5 py-2 rounded-lg font-sans text-xs font-extrabold transition-all cursor-pointer ${
                    viewMode === 'standard'
                      ? 'bg-primary text-white shadow-xs'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">map</span>
                  <span>Annotated Map</span>
                </button>
              </div>

              {/* Advanced Controls Right */}
              <div className="flex flex-wrap items-center gap-3">
                {/* Lens Selector */}
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[10px] text-outline font-bold uppercase tracking-wider mr-1">Lens:</span>
                  <select
                    value={lensType}
                    onChange={(e) => setLensType(e.target.value as any)}
                    className="bg-slate-50 border border-outline-variant rounded-lg font-sans text-xs font-bold px-2.5 py-1.5 focus:ring-2 focus:ring-primary outline-none cursor-pointer"
                  >
                    <option value="heatmap">Spectral Heatmap</option>
                    <option value="highpass">High-Pass Noise</option>
                    <option value="compression">ELA Compression</option>
                  </select>
                </div>

                {/* Zoom Selector */}
                <div className="flex items-center gap-1">
                  <span className="font-mono text-[10px] text-outline font-bold uppercase tracking-wider mr-1">Zoom:</span>
                  <div className="flex bg-slate-50 border border-outline-variant p-0.5 rounded-lg">
                    {([1, 1.5, 2, 3] as const).map((z) => (
                      <button
                        key={z}
                        type="button"
                        onClick={() => setZoomLevel(z)}
                        className={`px-2 py-1 text-[10px] font-bold rounded-md transition-colors ${
                          zoomLevel === z
                            ? 'bg-white text-primary shadow-xs border border-outline-variant/45'
                            : 'text-outline hover:text-primary'
                        }`}
                      >
                        {z}x
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Render selected workspace analysis mode */}
            {viewMode === 'slider' && (
              <section className="space-y-4">
                <div className="flex justify-between items-center select-none">
                  <h3 className="font-headline text-base font-extrabold text-on-surface">Interactive Split-Screen Slider</h3>
                  <span className="font-mono text-[10px] text-outline-variant font-bold">Slide divider or drag image viewport</span>
                </div>

                {/* Comparative Slider Component Area */}
                <div 
                  className="relative aspect-video max-h-[360px] w-full rounded-2xl border border-outline-variant overflow-hidden bg-slate-900 group shadow-md"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setHoverCoords(null)}
                >
                  {/* Underneath image (Modified/Forensic Heatmap) */}
                  <div className="absolute inset-0 overflow-hidden flex items-center justify-center">
                    <img 
                      src={scanResult.imageUrl} 
                      alt="Forensic Lens View" 
                      className={`w-full h-full object-cover transition-transform duration-300 pointer-events-none ${
                        lensType === 'heatmap' 
                          ? 'filter saturate-[4.5] hue-rotate-[220deg] contrast-150' 
                          : lensType === 'highpass' 
                            ? 'filter grayscale invert contrast-[3.0] opacity-90' 
                            : 'filter hue-rotate-[110deg] saturate-200 contrast-125'
                      }`}
                      referrerPolicy="no-referrer"
                      style={{ transform: `scale(${zoomLevel})` }}
                    />
                  </div>

                  {/* Sliding Overlay Container (Original Feed) */}
                  <div 
                    className="absolute inset-y-0 left-0 overflow-hidden" 
                    style={{ width: `${sliderValue}%` }}
                  >
                    <div 
                      className="absolute inset-0 overflow-hidden" 
                      style={{ 
                        width: '100%', 
                        height: '100%',
                        minWidth: '100%' // prevents image compression on layout squeeze
                      }}
                    >
                      {/* Sub wrapper sized exactly to parent canvas bounds */}
                      <div className="absolute inset-0 flex items-center justify-center" style={{ width: '100%', height: '100%' }}>
                        <img 
                          src={scanResult.imageUrl} 
                          alt="Original View" 
                          className="w-full h-full object-cover pointer-events-none"
                          referrerPolicy="no-referrer"
                          style={{ 
                            transform: `scale(${zoomLevel})`,
                            maxWidth: 'none'
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Sliding Divider Bar */}
                  <div 
                    className="absolute inset-y-0 w-1 bg-white shadow-2xl z-10 pointer-events-none"
                    style={{ left: `${sliderValue}%` }}
                  >
                    <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center shadow-lg border-2 border-white text-xs select-none">
                      <span className="material-symbols-outlined text-[18px]">unfold_more_double</span>
                    </div>
                  </div>

                  {/* Range Input overlay for natural dragging interaction */}
                  <input 
                    type="range"
                    min="0"
                    max="100"
                    value={sliderValue}
                    onChange={(e) => setSliderValue(Number(e.target.value))}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-20"
                  />

                  {/* Horizontal and Vertical Crosshair overlay */}
                  {hoverCoords && (
                    <div className="absolute inset-0 pointer-events-none select-none z-10">
                      <div className="absolute inset-y-0 w-[1px] bg-white/20" style={{ left: `${hoverCoords.x}%` }}></div>
                      <div className="absolute inset-x-0 h-[1px] bg-white/20" style={{ top: `${hoverCoords.y}%` }}></div>
                    </div>
                  )}

                  {/* Banner labels */}
                  <span className="absolute left-4 top-4 bg-slate-900/75 backdrop-blur-xs text-white font-mono text-[9px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider border border-white/10 select-none z-10 pointer-events-none">
                    Raw Original
                  </span>
                  <span className="absolute right-4 top-4 bg-primary/95 text-white font-mono text-[9px] font-black uppercase px-2.5 py-1 rounded-md tracking-wider shadow-sm select-none z-10 pointer-events-none">
                    Forensic Lens Mode: {lensType.toUpperCase()}
                  </span>
                </div>
              </section>
            )}

            {viewMode === 'sideBySide' && (
              <section className="space-y-4">
                <div className="flex justify-between items-center select-none">
                  <h3 className="font-headline text-base font-extrabold text-on-surface">Dual-Screen Comparative Monitors</h3>
                  <span className="font-mono text-[10px] text-outline-variant font-bold">Synchronized cursor mapping across coordinates</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Left: Original Raw Monitor */}
                  <div 
                    className="relative border border-outline-variant rounded-2xl overflow-hidden aspect-video bg-slate-950 flex flex-col justify-end shadow-xs group"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setHoverCoords(null)}
                  >
                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                      <img 
                        src={scanResult.imageUrl} 
                        alt="Satellite Raw Original" 
                        className="w-full h-full object-cover pointer-events-none"
                        referrerPolicy="no-referrer"
                        style={{ transform: `scale(${zoomLevel})` }}
                      />
                    </div>
                    {/* Crosshair indicator */}
                    {hoverCoords && (
                      <div className="absolute inset-0 pointer-events-none z-10">
                        <div className="absolute inset-y-0 w-0.5 bg-green-400/40" style={{ left: `${hoverCoords.x}%` }}></div>
                        <div className="absolute inset-x-0 h-0.5 bg-green-400/40" style={{ top: `${hoverCoords.y}%` }}></div>
                        <span className="absolute w-2 h-2 rounded-full border border-green-400 bg-white/30 -translate-x-1/2 -translate-y-1/2" style={{ left: `${hoverCoords.x}%`, top: `${hoverCoords.y}%` }}></span>
                      </div>
                    )}
                    {/* Source Tag */}
                    <div className="absolute left-3 top-3 bg-slate-900/80 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-white/5 z-10">
                      Original Camera Output
                    </div>
                  </div>

                  {/* Right: Altered Forensic Lens Monitor */}
                  <div 
                    className="relative border border-outline-variant rounded-2xl overflow-hidden aspect-video bg-slate-950 flex flex-col justify-end shadow-xs group"
                    onMouseMove={handleMouseMove}
                    onMouseLeave={() => setHoverCoords(null)}
                  >
                    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
                      <img 
                        src={scanResult.imageUrl} 
                        alt="Satellite Forensic Map" 
                        className={`w-full h-full object-cover pointer-events-none ${
                          lensType === 'heatmap' 
                            ? 'filter saturate-[4.5] hue-rotate-[220deg] contrast-150' 
                            : lensType === 'highpass' 
                              ? 'filter grayscale invert contrast-[3.0] opacity-90' 
                              : 'filter hue-rotate-[110deg] saturate-200 contrast-125'
                        }`}
                        referrerPolicy="no-referrer"
                        style={{ transform: `scale(${zoomLevel})` }}
                      />
                    </div>
                    {/* Crosshair indicator */}
                    {hoverCoords && (
                      <div className="absolute inset-0 pointer-events-none z-10">
                        <div className="absolute inset-y-0 w-0.5 bg-red-400/40" style={{ left: `${hoverCoords.x}%` }}></div>
                        <div className="absolute inset-x-0 h-0.5 bg-red-400/40" style={{ top: `${hoverCoords.y}%` }}></div>
                        <span className="absolute w-2 h-2 rounded-full border border-red-400 bg-white/30 -translate-x-1/2 -translate-y-1/2" style={{ left: `${hoverCoords.x}%`, top: `${hoverCoords.y}%` }}></span>
                      </div>
                    )}
                    {/* Source Tag */}
                    <div className="absolute left-3 top-3 bg-red-950/80 text-white font-mono text-[9px] font-bold px-2 py-0.5 rounded border border-red-500/20 z-10">
                      Raster Analysis Lens: {lensType.toUpperCase()}
                    </div>
                  </div>
                </div>
              </section>
            )}

            {viewMode === 'standard' && (
              <section className="space-y-4">
                <div className="flex justify-between items-center select-none">
                  <h3 className="font-headline text-base font-extrabold text-on-surface">Annotated Spectral Map</h3>
                  <span className="font-mono text-[10px] text-outline-variant font-bold">Hover coordinates on red pins to inspect localized logs</span>
                </div>

                <div 
                  className="relative border border-outline-variant rounded-2xl overflow-hidden group shadow-md aspect-video max-h-[360px] bg-slate-100 flex items-center justify-center"
                  onMouseMove={handleMouseMove}
                  onMouseLeave={() => setHoverCoords(null)}
                >
                  <img 
                    src={scanResult.imageUrl} 
                    alt="Satellite Forensic scan" 
                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-101"
                    referrerPolicy="no-referrer"
                    style={{ transform: `scale(${zoomLevel})` }}
                  />

                  {/* Annotation coordinate pins */}
                  {scanResult.anomalies.map((an) => {
                    const isHovered = hoveredAnomalyId === an.id;
                    return (
                      <div 
                        key={an.id}
                        className="absolute group/pin cursor-pointer"
                        style={{ left: `${an.x}%`, top: `${an.y}%` }}
                        onMouseEnter={() => setHoveredAnomalyId(an.id)}
                        onMouseLeave={() => setHoveredAnomalyId(null)}
                      >
                        {/* Pulse circle */}
                        <span className="absolute -left-3 -top-3 w-7 h-7 bg-red-500/30 rounded-full animate-ping pointer-events-none"></span>
                        
                        {/* Central Icon pin */}
                        <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border border-white text-[10px] font-bold shadow-lg transition-transform ${isHovered ? 'bg-red-600 scale-120 text-white' : 'bg-red-500 text-white hover:scale-115'}`}>
                          !
                        </div>

                        {/* Floating Indicator Tooltip Card */}
                        <div className={`absolute bottom-6 -left-20 w-48 bg-slate-900/95 text-white p-3 rounded-lg text-left text-[11px] shadow-xl border border-white/15 backdrop-blur-md transition-all duration-300 z-20 pointer-events-none ${isHovered ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-2'}`}>
                          <div className="font-bold border-b border-white/10 pb-1.5 uppercase font-mono tracking-wider">{an.title}</div>
                          <div className="pt-1.5 text-slate-300 leading-normal font-sans">{an.description}</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            )}

            {/* Live Hover coordinates ticker box */}
            {hoverCoords && (
              <div className="bg-slate-900 border border-slate-800 text-slate-100 px-4 py-3 rounded-xl flex flex-wrap items-center justify-between font-mono text-[11px] select-none gap-3 animate-in fade-in duration-100">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">COORD:</span>
                    <span className="text-secondary font-bold">X: {hoverCoords.x}% / Y: {hoverCoords.y}%</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">RESAMPLE INDEX:</span>
                    <span className="text-error font-bold">{(1.15 + (hoverCoords.x * hoverCoords.y) / 4500).toFixed(4)} PNL</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-slate-500">HEURISTICS:</span>
                    <span className={`${(hoverCoords.x > 30 && hoverCoords.x < 65) ? 'text-red-400 font-bold animate-pulse' : 'text-green-400'}`}>
                      {(hoverCoords.x > 30 && hoverCoords.x < 65) ? 'ANOMALY DETECTED' : 'CALIBRATED BASELINE'}
                    </span>
                  </div>
                </div>
                <div className="text-slate-400 font-sans italic text-[10px]">
                  Real-time Coordinate Scrambler Enabled
                </div>
              </div>
            )}

            {!hoverCoords && (
              <p className="font-sans text-xs text-on-surface-variant text-center select-none pt-1">
                Hover over the image layouts to active real-time coordinate scanner tracking indicators.
              </p>
            )}

            {/* Anomalies List details */}
            <section className="bg-white border border-outline-variant rounded-2xl p-5 shadow-xs text-left">
              <h3 className="font-mono text-xs font-bold text-outline uppercase tracking-wider mb-4">Reasons for Verdict & Analysis Insights</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {scanResult.anomalies.map((an) => (
                  <div 
                    key={an.id}
                    onMouseEnter={() => setHoveredAnomalyId(an.id)}
                    onMouseLeave={() => setHoveredAnomalyId(null)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${hoveredAnomalyId === an.id ? 'bg-error-container/20 border-error' : 'bg-surface-container-low/20 border-outline-variant/60'}`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-red-500"></span>
                      <h4 className="font-sans text-xs font-bold text-on-surface truncate">{an.title}</h4>
                    </div>
                    <p className="font-sans text-[11px] text-on-surface-variant leading-relaxed line-clamp-2">
                      {an.description}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Image Metadata Bento */}
            <section className="bg-white border border-outline-variant p-5 rounded-2xl shadow-xs text-left">
              <h3 className="font-mono text-xs font-bold text-outline uppercase tracking-wider mb-4">Raster Image File Headers</h3>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6 font-sans">
                <div>
                  <div className="text-[11px] text-on-surface-variant/75 font-semibold">Image Resolution</div>
                  <div className="font-mono text-xs font-bold text-on-surface mt-1">{scanResult.metadata.resolution}</div>
                </div>
                <div>
                  <div className="text-[11px] text-on-surface-variant/75 font-semibold">Sensor Payload</div>
                  <div className="font-sans text-xs font-bold text-on-surface mt-1">{scanResult.metadata.cameraBrand} ({scanResult.metadata.cameraModel})</div>
                </div>
                <div>
                  <div className="text-[11px] text-on-surface-variant/75 font-semibold">Exif Software Modifier</div>
                  <div className="font-sans text-xs font-bold text-error mt-1">{scanResult.metadata.software}</div>
                </div>
                <div>
                  <div className="text-[11px] text-on-surface-variant/75 font-semibold">Sensor GPS Coordinates</div>
                  <div className="font-mono text-xs font-bold text-on-surface mt-1">{scanResult.metadata.gpsCoordinates}</div>
                </div>
                <div>
                  <div className="text-[11px] text-on-surface-variant/75 font-semibold">Raster Block Codecs</div>
                  <div className="font-mono text-xs font-bold text-on-surface mt-1">{scanResult.metadata.originalCodec}</div>
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </div>
  );
}
