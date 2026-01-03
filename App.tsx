
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useRef } from 'react';
import { Layout, Box, Image as ImageIcon, Wand2, Layers, Plus, Trash2, Download, History, Sparkles, Shirt, Move, Maximize, RotateCcw, Zap, Cpu, ArrowRight, Globe, Scan, Camera, Aperture, Repeat, SprayCan, Triangle, Package, Menu, X, Check, MousePointer2, CameraOff, Smartphone } from 'lucide-react';
import { Button } from './components/Button';
import { FileUploader } from './components/FileUploader';
import { generateMockup, generateAsset, generateRealtimeComposite } from './services/geminiService';
import { Asset, GeneratedMockup, AppView, LoadingState, PlacedLayer } from './types';
import { useApiKey } from './hooks/useApiKey';
import ApiKeyDialog from './components/ApiKeyDialog';

// --- Intro Animation Component ---

const IntroSequence = ({ onComplete }: { onComplete: () => void }) => {
  const [phase, setPhase] = useState<'enter' | 'wait' | 'spray' | 'admire' | 'exit' | 'prism' | 'explode'>('enter');

  useEffect(() => {
    const schedule = [
      { t: 100, fn: () => setPhase('enter') },
      { t: 1800, fn: () => setPhase('wait') },
      { t: 2400, fn: () => setPhase('spray') },
      { t: 4000, fn: () => setPhase('admire') },
      { t: 5000, fn: () => setPhase('exit') },
      { t: 5600, fn: () => setPhase('prism') },
      { t: 7800, fn: () => setPhase('explode') },
      { t: 8500, fn: () => onComplete() }
    ];

    const timers = schedule.map(s => setTimeout(s.fn, s.t));
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className={`fixed inset-0 z-[100] bg-black flex items-center justify-center overflow-hidden font-sans select-none
      ${phase === 'explode' ? 'animate-[fadeOut_1s_ease-out_forwards] pointer-events-none' : ''}
    `}>
      <div className={`absolute inset-0 bg-white pointer-events-none z-50 transition-opacity duration-300 ease-out ${phase === 'explode' ? 'opacity-100' : 'opacity-0'}`}></div>
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_80%)]"></div>
      <div className="relative w-full max-w-4xl h-96 flex items-center justify-center scale-[0.6] md:scale-100">
        {(phase !== 'prism' && phase !== 'explode') && (
          <div className={`relative z-10 flex flex-col items-center transition-transform will-change-transform
             ${phase === 'enter' ? 'animate-[hopIn_1.6s_cubic-bezier(0.34,1.56,0.64,1)_forwards]' : ''}
             ${phase === 'exit' ? 'animate-[anticipateSprint_0.8s_ease-in_forwards]' : ''}
          `}>
             <div className={`w-32 h-36 bg-zinc-100 rounded-xl relative overflow-hidden shadow-2xl transition-all duration-300 border-4
                ${phase === 'spray' || phase === 'admire' || phase === 'exit' 
                  ? 'border-indigo-500 shadow-[0_0_40px_rgba(99,102,241,0.5)]' 
                  : 'border-zinc-300'}
             `}>
                <div className={`absolute top-0 left-1/2 -translate-x-1/2 w-8 h-full bg-zinc-200/50 border-x border-zinc-300/50 transition-opacity duration-200 ${phase === 'spray' || phase === 'admire' || phase === 'exit' ? 'opacity-0' : 'opacity-100'}`}></div>
                <div className="absolute top-6 left-1/2 -translate-x-1/2 w-20 h-10 bg-zinc-800 rounded-md flex items-center justify-center gap-4 overflow-hidden border border-zinc-700 shadow-inner z-20">
                   <div className={`w-2 h-2 bg-cyan-400 rounded-full transition-all duration-300 ${phase === 'spray' ? 'scale-y-10 bg-yellow-400' : 'animate-pulse'}`}></div>
                   <div className={`w-2 h-2 bg-cyan-400 rounded-full transition-all duration-300 ${phase === 'spray' ? 'scale-y-10 bg-yellow-400' : 'animate-pulse'}`}></div>
                </div>
                <div className={`absolute inset-0 bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 transition-opacity duration-500 ${phase === 'spray' || phase === 'admire' || phase === 'exit' ? 'opacity-100' : 'opacity-0'}`}></div>
                <div className={`absolute inset-0 bg-white mix-blend-overlay pointer-events-none ${phase === 'spray' ? 'animate-[flash_0.2s_ease-out]' : 'opacity-0'}`}></div>
                <div className={`absolute bottom-6 left-1/2 -translate-x-1/2 transition-all duration-500 transform z-20
                   ${phase === 'spray' || phase === 'admire' || phase === 'exit' ? 'opacity-100 scale-100 translate-y-0' : 'opacity-0 scale-50 translate-y-4'}
                `}>
                   <div className="w-10 h-10 bg-white text-indigo-600 rounded flex items-center justify-center shadow-lg">
                      <Package size={24} strokeWidth={3} />
                   </div>
                </div>
             </div>
             <div className="flex gap-10 -mt-1 z-0">
                <div className={`w-3 h-8 bg-zinc-800 rounded-b-full origin-top ${phase === 'enter' ? 'animate-[legMove_0.2s_infinite_alternate]' : ''} ${phase === 'exit' ? 'animate-[legMove_0.1s_infinite_alternate]' : ''}`}></div>
                <div className={`w-3 h-8 bg-zinc-800 rounded-b-full origin-top ${phase === 'enter' ? 'animate-[legMove_0.2s_infinite_alternate-reverse]' : ''} ${phase === 'exit' ? 'animate-[legMove_0.1s_infinite_alternate-reverse]' : ''}`}></div>
             </div>
          </div>
        )}
        {phase === 'spray' && (
          <div className="absolute z-20 animate-[swoopIn_0.4s_cubic-bezier(0.17,0.67,0.83,0.67)_forwards]" style={{ right: '22%', top: '5%' }}>
             <div className="relative animate-[shake_0.15s_infinite]">
                <SprayCan size={80} className="text-zinc-300 fill-zinc-800 rotate-[-15deg] drop-shadow-2xl" />
                <div className="absolute top-0 -left-4 w-6 h-6 bg-white rounded-full blur-md animate-ping"></div>
                <div className="absolute top-4 -left-8 w-40 h-40 pointer-events-none overflow-visible">
                   {[...Array(20)].map((_, i) => (
                      <div key={i} className="absolute w-2 h-2 bg-gradient-to-r from-indigo-400 to-purple-400 rounded-full animate-[sprayParticle_0.4s_linear_forwards]" style={{ top: Math.random() * 20, left: 0, animationDelay: `${Math.random() * 0.3}s` }} />
                   ))}
                </div>
             </div>
          </div>
        )}
        {(phase === 'prism' || phase === 'explode') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-8">
             <div className={`relative w-32 h-32 animate-[spinAppear_1.5s_cubic-bezier(0.34,1.56,0.64,1)_forwards]`}>
                <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-[0_0_50px_rgba(99,102,241,0.5)]">
                   <defs>
                      <linearGradient id="prismStroke" x1="0" y1="0" x2="1" y2="1">
                         <stop offset="0%" stopColor="#6366f1" />
                         <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                   </defs>
                   <path d="M50 10 L90 85 L10 85 Z" fill="none" stroke="url(#prismStroke)" strokeWidth="4" strokeLinejoin="round" className="animate-[drawStroke_1s_ease-out_forwards]" />
                   <path d="M50 10 L50 85 M50 50 L90 85 M50 50 L10 85" stroke="url(#prismStroke)" strokeWidth="1.5" className="opacity-40" />
                </svg>
             </div>
             <div className="text-center animate-[popIn_0.8s_cubic-bezier(0.17,0.67,0.83,0.67)_0.5s_forwards] opacity-0">
                <h1 className="text-5xl font-black text-white tracking-tighter mb-2">SKU FOUNDRY</h1>
                <p className="text-sm text-indigo-400 font-mono tracking-[0.3em] uppercase">AI Product Visualization</p>
             </div>
          </div>
        )}
      </div>
    </div>
  );
};

// --- UI Components ---

const NavButton = ({ icon, label, active, onClick, number }: { icon: React.ReactNode, label: string, active: boolean, onClick: () => void, number?: number }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 group
      ${active ? 'bg-indigo-500/10 text-white border-l-2 border-indigo-500' : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-200'}`}
  >
    <span className={`${active ? 'text-indigo-400' : 'text-zinc-600 group-hover:text-zinc-400'} transition-colors`}>
      {icon}
    </span>
    <span className="font-medium text-sm tracking-wide flex-1 text-left">{label}</span>
    {number !== undefined && (
      <span className={`text-xs font-bold font-mono px-1.5 py-0.5 rounded min-w-[1.5rem] text-center transition-colors ${active ? 'bg-indigo-500 text-white' : 'bg-zinc-800 text-zinc-500'}`}>
        {number}
      </span>
    )}
  </button>
);

const WorkflowStepper = ({ currentView, onViewChange }: { currentView: AppView, onViewChange: (view: AppView) => void }) => {
  const steps = [
    { id: 'assets', label: 'Upload Assets', number: 1 },
    { id: 'studio', label: 'Design Mockup', number: 2 },
    { id: 'gallery', label: 'Download Result', number: 3 },
  ];

  const viewOrder = ['assets', 'studio', 'gallery'];
  const currentIndex = viewOrder.indexOf(currentView);
  const progress = currentIndex === -1 ? 0 : Math.max(0, (currentIndex / (steps.length - 1)) * 100);

  return (
    <div className="w-full max-w-2xl mx-auto mb-12 hidden md:block animate-fade-in px-4">
      <div className="relative">
         <div className="absolute top-1/2 left-0 right-0 h-1 bg-zinc-800 -translate-y-1/2 rounded-full"></div>
         <div className="absolute top-1/2 left-0 h-1 bg-gradient-to-r from-indigo-600 to-purple-600 -translate-y-1/2 rounded-full transition-all duration-500 ease-out" style={{ width: `${progress}%` }}></div>
         <div className="relative flex justify-between w-full">
            {steps.map((step, index) => {
               const isCompleted = currentIndex > index;
               const isCurrent = currentIndex === index;
               return (
                  <button key={step.id} onClick={() => onViewChange(step.id as AppView)} className={`group flex flex-col items-center focus:outline-none relative z-10 cursor-pointer`}>
                     <div className={`w-10 h-10 rounded-full flex items-center justify-center border-[3px] transition-all duration-300 bg-zinc-950 ${isCurrent ? 'border-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.5)] scale-110' : isCompleted ? 'border-indigo-600 bg-indigo-600 text-white' : 'border-zinc-800 text-zinc-600 group-hover:border-zinc-600 group-hover:text-zinc-400'}`}>
                        {isCompleted ? <Check size={18} strokeWidth={3} /> : <span className="text-sm font-bold font-mono">{step.number}</span>}
                     </div>
                     <span className={`absolute top-14 text-xs font-medium tracking-wider transition-all duration-300 whitespace-nowrap ${isCurrent ? 'text-indigo-400 opacity-100 transform translate-y-0' : isCompleted ? 'text-zinc-400 opacity-80' : 'text-zinc-600 opacity-60 group-hover:opacity-100'}`}>
                        {step.label}
                     </span>
                  </button>
               )
            })}
         </div>
      </div>
    </div>
  )
};

const AssetSection = ({ title, icon, type, assets, onAdd, onRemove, validateApiKey, onApiError }: { title: string, icon: React.ReactNode, type: 'logo' | 'product', assets: Asset[], onAdd: (a: Asset) => void, onRemove: (id: string) => void, validateApiKey: () => Promise<boolean>, onApiError: (e: any) => void }) => {
  const [mode, setMode] = useState<'upload' | 'generate'>('upload');
  const [genPrompt, setGenPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!genPrompt) return;
    if (!(await validateApiKey())) return;
    setIsGenerating(true);
    try {
      const b64 = await generateAsset(genPrompt, type);
      onAdd({ id: Math.random().toString(36).substring(7), type, name: `AI Generated ${type}`, data: b64, mimeType: 'image/png' });
      setGenPrompt('');
    } catch (e: any) {
      onApiError(e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="glass-panel p-6 rounded-2xl h-full flex flex-col">
      <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">{icon} {title}</h2>
          <span className="text-xs bg-zinc-800 px-2 py-1 rounded text-zinc-400">{assets.length} items</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6 overflow-y-auto max-h-[400px] pr-2">
          {assets.map(asset => (
            <div key={asset.id} className="relative group aspect-square bg-zinc-900 rounded-lg overflow-hidden border border-zinc-700">
                <img src={asset.data} className="w-full h-full object-contain p-2" alt={asset.name} />
                <button onClick={() => onRemove(asset.id)} className="absolute top-1 right-1 p-1 bg-red-500/80 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 size={12} />
                </button>
            </div>
          ))}
          {assets.length === 0 && (
            <div className="col-span-2 sm:col-span-3 flex flex-col items-center justify-center h-32 text-zinc-500 border border-dashed border-zinc-800 rounded-lg">
              <p className="text-sm">No {type}s yet</p>
            </div>
          )}
      </div>
      <div className="mt-auto pt-4 border-t border-zinc-800">
        <div className="flex gap-4 mb-4">
           <button onClick={() => setMode('upload')} className={`text-sm font-medium pb-1 border-b-2 transition-colors ${mode === 'upload' ? 'border-indigo-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>Upload</button>
           <button onClick={() => setMode('generate')} className={`text-sm font-medium pb-1 border-b-2 transition-colors ${mode === 'generate' ? 'border-indigo-500 text-white' : 'border-transparent text-zinc-500 hover:text-zinc-300'}`}>Generate with AI</button>
        </div>
        {mode === 'upload' ? (
           <FileUploader label={`Upload ${type}`} onFileSelect={(f) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                onAdd({ id: Math.random().toString(36).substring(7), type, name: f.name, data: e.target?.result as string, mimeType: f.type });
              };
              reader.readAsDataURL(f);
           }} />
        ) : (
           <div className="space-y-3">
              <textarea value={genPrompt} onChange={(e) => setGenPrompt(e.target.value)} placeholder={`Describe the ${type}...`} className="w-full bg-zinc-900 border border-zinc-700 rounded-lg p-3 text-base text-white focus:ring-2 focus:ring-indigo-500 resize-none h-24 placeholder:text-zinc-600" />
              <Button onClick={handleGenerate} isLoading={isGenerating} disabled={!genPrompt} className="w-full" icon={<Sparkles size={16} />}>Generate {type}</Button>
           </div>
        )}
      </div>
    </div>
  );
};

// --- App Component ---

export default function App() {
  const [showIntro, setShowIntro] = useState(true);
  const [view, setView] = useState<AppView>('dashboard');
  const [assets, setAssets] = useState<Asset[]>([]);
  const [generatedMockups, setGeneratedMockups] = useState<GeneratedMockup[]>([]);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedMockup, setSelectedMockup] = useState<GeneratedMockup | null>(null);

  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [placedLogos, setPlacedLogos] = useState<PlacedLayer[]>([]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState<LoadingState>({ isGenerating: false, message: '' });

  const { showApiKeyDialog, setShowApiKeyDialog, validateApiKey, handleApiKeyDialogContinue } = useApiKey();

  const handleApiError = (error: any) => {
    const errorMessage = error instanceof Error ? error.message : String(error);
    let shouldOpenDialog = false;
    if (errorMessage.includes('Requested entity was not found')) {
      shouldOpenDialog = true;
    } else if (
      errorMessage.includes('API_KEY_INVALID') ||
      errorMessage.includes('API key not valid') ||
      errorMessage.includes('PERMISSION_DENIED') || 
      errorMessage.includes('403')
    ) {
      shouldOpenDialog = true;
    }
    if (shouldOpenDialog) setShowApiKeyDialog(true);
    else alert(`Operation failed: ${errorMessage}`);
  };

  // State for Dragging
  const canvasRef = useRef<HTMLDivElement>(null);
  const [draggedItem, setDraggedItem] = useState<{ uid: string, startX: number, startY: number, initX: number, initY: number } | null>(null);

  // AR Try-On States
  const videoRef = useRef<HTMLVideoElement>(null);
  const tryOnCanvasRef = useRef<HTMLCanvasElement>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [activeTryOnMockupId, setActiveTryOnMockupId] = useState<string | null>(null);
  const [tryOnPlacement, setTryOnPlacement] = useState<{ x: number, y: number, scale: number }>({ x: 50, y: 50, scale: 0.8 });

  useEffect(() => {
    const timer = setTimeout(() => setShowIntro(false), 9000);
    return () => clearTimeout(timer);
  }, []);

  const addLogoToCanvas = (assetId: string) => {
    const newLayer: PlacedLayer = {
      uid: Math.random().toString(36).substr(2, 9),
      assetId,
      x: 50,
      y: 50,
      scale: 1,
      rotation: 0
    };
    setPlacedLogos(prev => [...prev, newLayer]);
  };

  const removeLogoFromCanvas = (uid: string, e?: React.MouseEvent | React.TouchEvent) => {
    e?.stopPropagation();
    setPlacedLogos(prev => prev.filter(l => l.uid !== uid));
  };

  const handleStart = (clientX: number, clientY: number, layer: PlacedLayer) => {
    setDraggedItem({ uid: layer.uid, startX: clientX, startY: clientY, initX: layer.x, initY: layer.y });
  };

  const handleMouseDown = (e: React.MouseEvent, layer: PlacedLayer) => { e.preventDefault(); e.stopPropagation(); handleStart(e.clientX, e.clientY, layer); };
  const handleTouchStart = (e: React.TouchEvent, layer: PlacedLayer) => { e.stopPropagation(); const touch = e.touches[0]; handleStart(touch.clientX, touch.clientY, layer); };

  const handleWheel = (e: React.WheelEvent, layerId: string) => {
     e.stopPropagation();
     const delta = e.deltaY > 0 ? -0.1 : 0.1;
     setPlacedLogos(prev => prev.map(l => {
        if (l.uid !== layerId) return l;
        const newScale = Math.max(0.1, Math.min(5.0, l.scale + delta));
        return { ...l, scale: newScale };
     }));
  };

  useEffect(() => {
    const handleMove = (clientX: number, clientY: number) => {
      if (!draggedItem || !canvasRef.current) return;
      const rect = canvasRef.current.getBoundingClientRect();
      const deltaXPercent = ((clientX - draggedItem.startX) / rect.width) * 100;
      const deltaYPercent = ((clientY - draggedItem.startY) / rect.height) * 100;
      setPlacedLogos(prev => prev.map(l => {
        if (l.uid !== draggedItem.uid) return l;
        return { ...l, x: Math.max(0, Math.min(100, draggedItem.initX + deltaXPercent)), y: Math.max(0, Math.min(100, draggedItem.initY + deltaYPercent)) };
      }));
    };
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onMouseUp = () => setDraggedItem(null);
    const onTouchMove = (e: TouchEvent) => { if (draggedItem) { e.preventDefault(); handleMove(e.touches[0].clientX, e.touches[0].clientY); } };
    const onTouchEnd = () => setDraggedItem(null);

    if (draggedItem) {
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      window.addEventListener('touchmove', onTouchMove, { passive: false });
      window.addEventListener('touchend', onTouchEnd);
    }
    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
    };
  }, [draggedItem]);

  const handleGenerate = async () => {
    if (!selectedProductId) return;
    const product = assets.find(a => a.id === selectedProductId);
    if (!product) return;
    const layers = placedLogos.map(layer => {
        const asset = assets.find(a => a.id === layer.assetId);
        return asset ? { asset, placement: layer } : null;
    }).filter(Boolean) as { asset: Asset, placement: PlacedLayer }[];

    if (!(await validateApiKey())) return;
    setLoading({ isGenerating: true, message: 'Simulating physical interactions...' });
    try {
      const resultImage = await generateMockup(product, layers, prompt);
      const newMockup: GeneratedMockup = { id: Math.random().toString(36).substring(7), imageUrl: resultImage, prompt, createdAt: Date.now(), layers: placedLogos, productId: selectedProductId };
      setGeneratedMockups(prev => [newMockup, ...prev]);
      setView('gallery');
    } catch (e: any) { handleApiError(e); } finally { setLoading({ isGenerating: false, message: '' }); }
  };

  // --- AR Try-On Logic ---

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' }, audio: false });
      setCameraStream(stream);
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (e) {
      console.error("Camera access denied", e);
      alert("Could not access camera. Please check permissions.");
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
  };

  const handleCaptureTryOn = async () => {
    if (!videoRef.current || !activeTryOnMockupId) return;
    if (!(await validateApiKey())) return;

    const mockup = generatedMockups.find(m => m.id === activeTryOnMockupId);
    if (!mockup) return;

    setLoading({ isGenerating: true, message: 'Processing spatial composite...' });
    
    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Draw background video frame
      ctx.drawImage(videoRef.current, 0, 0);

      // Draw the overlay
      const overlayImg = new Image();
      overlayImg.src = mockup.imageUrl;
      await new Promise(r => overlayImg.onload = r);

      const ow = canvas.width * tryOnPlacement.scale;
      const oh = (overlayImg.height / overlayImg.width) * ow;
      const ox = (tryOnPlacement.x / 100) * canvas.width - ow / 2;
      const oy = (tryOnPlacement.y / 100) * canvas.height - oh / 2;
      
      ctx.drawImage(overlayImg, ox, oy, ow, oh);
      const compositeBase64 = canvas.toDataURL('image/png');

      const result = await generateRealtimeComposite(compositeBase64, "Make this AR mockup look like a real photo integrated into the user's environment.");
      
      const newEntry: GeneratedMockup = {
        id: Math.random().toString(36).substring(7),
        imageUrl: result,
        prompt: "AR Try-on result",
        createdAt: Date.now(),
        isARResult: true
      };
      setGeneratedMockups(prev => [newEntry, ...prev]);
      setView('gallery');
      stopCamera();
    } catch (e) { handleApiError(e); } finally { setLoading({ isGenerating: false, message: '' }); }
  };

  if (showIntro) return <IntroSequence onComplete={() => setShowIntro(false)} />;

  return (
    <div className="min-h-screen bg-black text-zinc-100 font-sans flex overflow-hidden relative">
      {showApiKeyDialog && <ApiKeyDialog onContinue={handleApiKeyDialogContinue} />}

      {/* Sidebar Navigation */}
      <aside className="w-64 border-r border-zinc-800 bg-zinc-950/50 hidden md:flex flex-col z-50">
        <div className="h-16 border-b border-zinc-800 flex items-center px-6">
          <Package className="text-indigo-500 mr-2" />
          <span className="font-bold text-lg tracking-tight">SKU FOUNDRY</span>
        </div>
        <div className="p-4 space-y-2 flex-1">
          <NavButton icon={<Layout size={18} />} label="Dashboard" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <NavButton icon={<Box size={18} />} label="Assets" active={view === 'assets'} number={assets.length} onClick={() => setView('assets')} />
          <NavButton icon={<Wand2 size={18} />} label="Studio" active={view === 'studio'} onClick={() => setView('studio')} />
          <NavButton icon={<Scan size={18} />} label="AR Try-On" active={view === 'try-on'} onClick={() => setView('try-on')} />
          <NavButton icon={<ImageIcon size={18} />} label="Gallery" active={view === 'gallery'} number={generatedMockups.length} onClick={() => setView('gallery')} />
        </div>
        <div className="p-4 border-t border-zinc-800">
          <div className="p-4 rounded-lg bg-zinc-900/50 border border-zinc-800 text-center">
             <Button size="sm" variant="outline" className="w-full text-xs">Documentation</Button>
          </div>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 h-16 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 z-[60]">
        <div className="flex items-center">
          <Package className="text-indigo-500 mr-2" />
          <span className="font-bold text-lg">SKU FOUNDRY</span>
        </div>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-zinc-400 hover:text-white">
          {isMobileMenuOpen ? <X /> : <Menu />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-16 z-[55] bg-black/95 backdrop-blur-xl p-4 animate-fade-in flex flex-col">
          <div className="space-y-2">
            <NavButton icon={<Layout size={18} />} label="Dashboard" active={view === 'dashboard'} onClick={() => { setView('dashboard'); setIsMobileMenuOpen(false); }} />
            <NavButton icon={<Box size={18} />} label="Assets" active={view === 'assets'} onClick={() => { setView('assets'); setIsMobileMenuOpen(false); }} />
            <NavButton icon={<Wand2 size={18} />} label="Studio" active={view === 'studio'} onClick={() => { setView('studio'); setIsMobileMenuOpen(false); }} />
            <NavButton icon={<Scan size={18} />} label="AR Try-On" active={view === 'try-on'} onClick={() => { setView('try-on'); setIsMobileMenuOpen(false); }} />
            <NavButton icon={<ImageIcon size={18} />} label="Gallery" active={view === 'gallery'} onClick={() => { setView('gallery'); setIsMobileMenuOpen(false); }} />
          </div>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedMockup && (
        <div className="fixed inset-0 z-[100] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in" onClick={() => setSelectedMockup(null)}>
          <div className="relative max-w-6xl w-full h-full flex flex-col items-center justify-center" onClick={e => e.stopPropagation()}>
            <button onClick={() => setSelectedMockup(null)} className="absolute top-4 right-4 md:top-0 md:-right-12 p-2 bg-zinc-800 text-white rounded-full hover:bg-zinc-700 transition-colors z-50 border border-zinc-700"><X size={24} /></button>
            <div className="relative w-full flex-1 flex items-center justify-center overflow-hidden rounded-lg">
              <img src={selectedMockup.imageUrl} alt="Full size preview" className="max-w-full max-h-[85vh] object-contain shadow-2xl" />
            </div>
            <div className="mt-4 bg-zinc-900/90 backdrop-blur border border-zinc-700 px-6 py-3 rounded-full flex items-center gap-4">
               <p className="text-sm text-zinc-300 max-w-[200px] md:max-w-md truncate">{selectedMockup.prompt || "Generated Mockup"}</p>
               <div className="h-4 w-px bg-zinc-700"></div>
               <a href={selectedMockup.imageUrl} download={`mockup-${selectedMockup.id}.png`} className="text-indigo-400 hover:text-indigo-300 text-sm font-medium flex items-center gap-2">
                 <Download size={16} /> Download
               </a>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative pt-16 md:pt-0">
        <div className="sticky top-0 z-40 h-16 bg-black/80 backdrop-blur-md border-b border-zinc-800 flex items-center justify-between px-8">
           <div className="text-sm text-zinc-400 breadcrumbs">
              <span className="opacity-50">App</span> <span className="mx-2">/</span> <span className="text-white capitalize">{view}</span>
           </div>
        </div>

        <div className="max-w-6xl mx-auto p-6 md:p-12">
           {view === 'dashboard' && (
              <div className="animate-fade-in space-y-8">
                 <div className="text-center py-12">
                    <h1 className="text-4xl md:text-6xl font-black mb-6 text-white leading-tight">
                       Future-Proof Your <br/>
                       <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-500">Brand Visuals</span>
                    </h1>
                    <p className="text-zinc-400 text-lg max-w-2xl mx-auto mb-10">
                       Professional AI compositing for merchandise, product photography, and AR experiences. Zero physical prototypes required.
                    </p>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center">
                        <Button size="lg" onClick={() => setView('assets')} icon={<ArrowRight size={20} />}>Build Assets</Button>
                        <Button size="lg" variant="secondary" onClick={() => setView('try-on')} icon={<Scan size={20} />}>AR Try-On</Button>
                    </div>
                 </div>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                       { icon: <Box className="text-indigo-400" />, title: 'Asset Forge', desc: 'Create or upload logos and blank product bases.' },
                       { icon: <Wand2 className="text-purple-400" />, title: 'Spatial Rendering', desc: 'Advanced AI mapping for realistic materials.' },
                       { icon: <Scan className="text-pink-400" />, title: 'AR Experience', desc: 'Try your designs in real-time camera environments.' }
                    ].map((feat, i) => (
                       <div key={i} className="p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 hover:border-indigo-500/30 transition-colors">
                          <div className="mb-4 p-3 bg-zinc-900 w-fit rounded-lg">{feat.icon}</div>
                          <h3 className="text-xl font-bold mb-2">{feat.title}</h3>
                          <p className="text-zinc-500">{feat.desc}</p>
                       </div>
                    ))}
                 </div>
              </div>
           )}

           {view === 'assets' && (
              <div className="animate-fade-in">
                <WorkflowStepper currentView="assets" onViewChange={setView} />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <AssetSection title="Product Bases" icon={<Box size={20} />} type="product" assets={assets.filter(a => a.type === 'product')} onAdd={(a) => setAssets(prev => [...prev, a])} onRemove={(id) => setAssets(prev => prev.filter(a => a.id !== id))} validateApiKey={validateApiKey} onApiError={handleApiError} />
                  <AssetSection title="Graphics & Logos" icon={<Layers size={20} />} type="logo" assets={assets.filter(a => a.type === 'logo')} onAdd={(a) => setAssets(prev => [...prev, a])} onRemove={(id) => setAssets(prev => prev.filter(a => a.id !== id))} validateApiKey={validateApiKey} onApiError={handleApiError} />
                </div>
                <div className="mt-8 flex justify-end">
                   <Button onClick={() => setView('studio')} disabled={assets.filter(a => a.type === 'product').length === 0} icon={<ArrowRight size={16} />}>Continue to Studio</Button>
                </div>
              </div>
           )}

           {view === 'studio' && (
             <div className="animate-fade-in flex flex-col-reverse lg:flex-row gap-6 h-[calc(100vh-16rem)]">
                <div className="w-full lg:w-80 flex flex-col gap-6 glass-panel p-6 rounded-2xl overflow-y-auto">
                   <div>
                      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Base Canvas</h3>
                      <div className="grid grid-cols-3 gap-2">
                         {assets.filter(a => a.type === 'product').map(a => (
                            <div key={a.id} onClick={() => setSelectedProductId(a.id)} className={`aspect-square rounded-lg border-2 cursor-pointer p-1 transition-all ${selectedProductId === a.id ? 'border-indigo-500 bg-indigo-500/10' : 'border-zinc-800 bg-zinc-900'}`}><img src={a.data} className="w-full h-full object-contain" /></div>
                         ))}
                      </div>
                   </div>
                   <div>
                      <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4">Overlay Assets</h3>
                      <div className="grid grid-cols-3 gap-2">
                         {assets.filter(a => a.type === 'logo').map(a => (
                            <div key={a.id} onClick={() => addLogoToCanvas(a.id)} className="relative aspect-square rounded-lg border border-zinc-800 cursor-pointer p-1 bg-zinc-900 hover:border-zinc-600 transition-colors">
                               <img src={a.data} className="w-full h-full object-contain" />
                               {placedLogos.filter(l => l.assetId === a.id).length > 0 && <div className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-[10px] rounded-full flex items-center justify-center font-bold">{placedLogos.filter(l => l.assetId === a.id).length}</div>}
                            </div>
                         ))}
                      </div>
                   </div>
                   <textarea className="bg-zinc-900 border border-zinc-800 rounded-lg p-3 text-sm h-24 resize-none focus:ring-1 focus:ring-indigo-500 outline-none" placeholder="Rendering instructions (e.g. blend into cotton texture)" value={prompt} onChange={e => setPrompt(e.target.value)} />
                   <Button onClick={handleGenerate} isLoading={loading.isGenerating} disabled={!selectedProductId || placedLogos.length === 0} className="w-full" size="lg" icon={<Sparkles size={18} />}>Render Reality</Button>
                </div>
                <div ref={canvasRef} className="flex-1 glass-panel rounded-2xl relative bg-[radial-gradient(#1e1b4b_1px,transparent_1px)] bg-[size:20px_20px] overflow-hidden flex items-center justify-center min-h-[400px]">
                   {loading.isGenerating && (
                      <div className="absolute inset-0 z-50 bg-black/70 backdrop-blur-sm flex flex-col items-center justify-center">
                         <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                         <p className="text-indigo-400 animate-pulse font-mono text-sm">{loading.message}</p>
                      </div>
                   )}
                   {selectedProductId ? (
                      <div className="relative w-full h-full p-12">
                         <img src={assets.find(a => a.id === selectedProductId)?.data} className="w-full h-full object-contain select-none pointer-events-none" draggable={false} />
                         {placedLogos.map((layer) => (
                           <div key={layer.uid} className={`absolute cursor-move group ${draggedItem?.uid === layer.uid ? 'z-50' : 'z-10'}`} style={{ left: `${layer.x}%`, top: `${layer.y}%`, transform: `translate(-50%, -50%) scale(${layer.scale}) rotate(${layer.rotation}deg)`, width: '20%', aspectRatio: '1/1' }} onMouseDown={e => handleMouseDown(e, layer)} onTouchStart={e => handleTouchStart(e, layer)} onWheel={e => handleWheel(e, layer.uid)}>
                              <div className="absolute -inset-2 border border-indigo-500 opacity-0 group-hover:opacity-50 rounded-lg transition-opacity pointer-events-none"></div>
                              <button onClick={e => removeLogoFromCanvas(layer.uid, e)} className="absolute -top-3 -right-3 p-1 bg-red-600 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"><X size={10} /></button>
                              <img src={assets.find(a => a.id === layer.assetId)?.data} className="w-full h-full object-contain" draggable={false} />
                           </div>
                         ))}
                      </div>
                   ) : (
                      <div className="text-zinc-600 flex flex-col items-center"><Shirt size={48} className="mb-4 opacity-10" /><p>Canvas Ready. Select base to start.</p></div>
                   )}
                </div>
             </div>
           )}

           {view === 'try-on' && (
              <div className="animate-fade-in flex flex-col lg:flex-row gap-8 min-h-[500px]">
                 <div className="w-full lg:w-72 space-y-6">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Scan size={20} className="text-indigo-400" /> AR Setup</h2>
                    <p className="text-sm text-zinc-400 leading-relaxed">Select a previously generated mockup or a product base to project onto your camera feed.</p>
                    
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-2">
                       <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Mockups</h3>
                       <div className="grid grid-cols-2 gap-2">
                          {generatedMockups.map(m => (
                             <div key={m.id} onClick={() => setActiveTryOnMockupId(m.id)} className={`aspect-square rounded border-2 cursor-pointer bg-zinc-900 overflow-hidden ${activeTryOnMockupId === m.id ? 'border-indigo-500' : 'border-zinc-800'}`}>
                                <img src={m.imageUrl} className="w-full h-full object-cover" />
                             </div>
                          ))}
                       </div>
                    </div>

                    {!cameraStream ? (
                       <Button variant="primary" className="w-full" onClick={startCamera} icon={<Camera size={18}/>}>Enable Camera</Button>
                    ) : (
                       <Button variant="danger" className="w-full" onClick={stopCamera} icon={<CameraOff size={18}/>}>Stop Camera</Button>
                    )}
                 </div>

                 <div className="flex-1 bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800 relative min-h-[400px]">
                    {loading.isGenerating && (
                       <div className="absolute inset-0 z-[100] bg-black/80 flex flex-col items-center justify-center p-8 text-center">
                          <div className="w-16 h-16 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                          <h3 className="text-xl font-bold text-indigo-400 mb-2">Generating Reality</h3>
                          <p className="text-zinc-500 max-w-xs">{loading.message}</p>
                       </div>
                    )}

                    {!cameraStream ? (
                       <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-700 bg-zinc-950/50">
                          <Smartphone size={64} className="mb-6 opacity-20" />
                          <p className="text-lg font-medium">Camera Feed Offline</p>
                          <p className="text-sm">Start your camera to begin the AR experience</p>
                       </div>
                    ) : (
                       <div className="relative w-full h-full flex items-center justify-center">
                          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                          
                          {activeTryOnMockupId && (
                             <div 
                                className="absolute cursor-move select-none"
                                style={{
                                   left: `${tryOnPlacement.x}%`,
                                   top: `${tryOnPlacement.y}%`,
                                   width: `${tryOnPlacement.scale * 100}%`,
                                   transform: `translate(-50%, -50%)`,
                                }}
                                onMouseDown={(e) => {
                                   const rect = e.currentTarget.parentElement?.getBoundingClientRect();
                                   if (!rect) return;
                                   const startX = e.clientX;
                                   const startY = e.clientY;
                                   const initX = tryOnPlacement.x;
                                   const initY = tryOnPlacement.y;

                                   const onMove = (me: MouseEvent) => {
                                      const dx = ((me.clientX - startX) / rect.width) * 100;
                                      const dy = ((me.clientY - startY) / rect.height) * 100;
                                      setTryOnPlacement(prev => ({ ...prev, x: initX + dx, y: initY + dy }));
                                   };
                                   const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
                                   window.addEventListener('mousemove', onMove);
                                   window.addEventListener('mouseup', onUp);
                                }}
                                onWheel={(e) => {
                                   const delta = e.deltaY > 0 ? -0.05 : 0.05;
                                   setTryOnPlacement(prev => ({ ...prev, scale: Math.max(0.1, Math.min(2.0, prev.scale + delta)) }));
                                }}
                             >
                                <img src={generatedMockups.find(m => m.id === activeTryOnMockupId)?.imageUrl} className="w-full h-full object-contain pointer-events-none drop-shadow-2xl" />
                             </div>
                          )}

                          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-6 bg-black/40 backdrop-blur-md px-8 py-4 rounded-full border border-white/10">
                             <Button onClick={handleCaptureTryOn} disabled={!activeTryOnMockupId} size="lg" className="rounded-full w-16 h-16 p-0" icon={<Aperture size={32} />} />
                          </div>
                       </div>
                    )}
                 </div>
              </div>
           )}

           {view === 'gallery' && (
              <div className="animate-fade-in">
                 <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-bold">Design Archive</h2>
                    <Button variant="outline" onClick={() => setView('studio')} icon={<Plus size={16}/>}>New Concept</Button>
                 </div>
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {generatedMockups.map(mockup => (
                       <div key={mockup.id} className="group glass-panel rounded-2xl overflow-hidden border border-zinc-800 hover:border-indigo-500/50 transition-colors">
                          <div className="aspect-[4/5] bg-zinc-900 relative overflow-hidden">
                             <img src={mockup.imageUrl} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                             <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-6 gap-3">
                                <div className="flex gap-2">
                                  <Button size="sm" variant="secondary" icon={<Maximize size={16}/>} onClick={() => setSelectedMockup(mockup)}>Inspect</Button>
                                  <Button size="sm" variant="primary" icon={<Scan size={16}/>} onClick={() => { setActiveTryOnMockupId(mockup.id); setView('try-on'); }}>AR Try-on</Button>
                                </div>
                             </div>
                             {mockup.isARResult && <div className="absolute top-4 left-4 px-2 py-1 bg-indigo-500 text-white text-[10px] font-bold rounded-md flex items-center gap-1 shadow-lg shadow-indigo-500/50"><Scan size={10} /> AR PROCESSED</div>}
                          </div>
                          <div className="p-4">
                             <p className="text-[10px] text-zinc-500 font-mono mb-2 uppercase tracking-widest">{new Date(mockup.createdAt).toLocaleDateString()}</p>
                             <p className="text-sm text-zinc-300 line-clamp-1 italic">"{mockup.prompt || "Visual study"}"</p>
                          </div>
                       </div>
                    ))}
                    {generatedMockups.length === 0 && (
                       <div className="col-span-full py-32 text-center glass-panel rounded-3xl flex flex-col items-center">
                          <div className="p-6 bg-zinc-900 rounded-full mb-6 border border-zinc-800"><ImageIcon size={48} className="text-zinc-700" /></div>
                          <h3 className="text-xl font-bold text-zinc-300 mb-2">Archive Empty</h3>
                          <p className="text-zinc-500 mb-8 max-w-sm">No visualizations have been generated yet. Head to the studio to forge your first mockup.</p>
                          <Button size="lg" onClick={() => setView('studio')}>Open Studio</Button>
                       </div>
                    )}
                 </div>
              </div>
           )}
        </div>
      </main>
    </div>
  );
}
