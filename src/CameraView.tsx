import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload } from 'lucide-react';
import { useOffline } from './OfflineContext';
import { Flashcard, getFlashcards, saveFlashcards } from './storage';

interface Prediction {
  name: string;
  definition: string;
}

export const CameraView: React.FC = () => {
  const { isOnline } = useOffline();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [stream, setStream] = useState<MediaStream | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [isAddedToCards, setIsAddedToCards] = useState<boolean>(false);
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const startCamera = async () => {
    try {
      setHasPermission(null);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }

      let mediaStream: MediaStream;
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
        });
      } catch (e) {
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
      }

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => {
            console.warn('Autoplay was prevented:', error);
          });
        }
      }
      setStream(mediaStream);
      streamRef.current = mediaStream;
      setHasPermission(true);
      setUploadedImage(null);
    } catch (err) {
      console.warn('Camera access failed:', err);
      setHasPermission(false);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const analyzeImageBase64 = async (base64Image: string, hint?: string) => {
    setIsScanning(true);
    setPrediction(null);
    setIsAddedToCards(false);

    try {
      const response = await fetch('/api/vision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: base64Image, hint }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.response || 'Could not identify object.');
      }

      const data = await response.json();
      const rawText = data.response || '';

      let name = 'Unidentified Object';
      let definition = 'No definition found. Try scanning from a different angle.';

      if (rawText.includes('|')) {
        const parts = rawText.split('|');
        name = parts[0].trim();
        definition = parts.slice(1).join('|').trim();
      } else if (rawText.includes(':')) {
        const parts = rawText.split(':');
        name = parts[0].trim();
        definition = parts.slice(1).join(':').trim();
      } else {
        name = rawText.trim().split('\n')[0];
        definition = rawText.trim();
      }

      name = name.replace(/[*#_`]/g, '').trim();
      definition = definition.replace(/^[*#_`]+|[*#_`]+$/g, '').trim();

      setPrediction({ name, definition });
    } catch (error: any) {
      console.error(error);
      setPrediction({
        name: 'Scan Offline / Error',
        definition:
          error.message ||
          'Please verify you have a valid Internet connection and API credentials to analyze image features.',
      });
    } finally {
      setIsScanning(false);
    }
  };

  const capturePhoto = async () => {
    if (!videoRef.current || isScanning) return;

    const canvas = canvasRef.current;
    const video = videoRef.current;

    const width = video.videoWidth > 0 ? video.videoWidth : 640;
    const height = video.videoHeight > 0 ? video.videoHeight : 480;

    if (canvas) {
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
        try {
          const base64Image = canvas.toDataURL('image/jpeg', 0.85);
          setUploadedImage(base64Image);
          await analyzeImageBase64(base64Image);
        } catch (err) {
          console.error(err);
          setPrediction({
            name: 'Capture Error',
            definition: 'Could not retrieve frame data. Try uploading from files.',
          });
        }
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const img = new Image();
      img.onload = () => {
        // Downscale image to a max dimension of 800px to avoid 413 Payload Too Large
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
          setUploadedImage(compressedBase64);
          analyzeImageBase64(compressedBase64);
        } else {
          // Fallback if canvas fails
          setUploadedImage(reader.result as string);
          analyzeImageBase64(reader.result as string);
        }
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const triggerUploadSelect = () => {
    uploadInputRef.current?.click();
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const handleSaveToFlashcards = () => {
    if (!prediction) return;

    const cards = getFlashcards();
    const isExist = cards.some((c) => c.word.toLowerCase() === prediction.name.toLowerCase());

    if (!isExist) {
      const newCard: Flashcard = {
        id: 'flash_' + Date.now(),
        word: prediction.name,
        definition: prediction.definition,
        partOfSpeech: 'noun',
        example: `We successfully identified a ${prediction.name.toLowerCase()} in our immediate surroundings.`,
        category: 'Conversational',
        tags: ['Vision Lens', 'Objects', 'Everyday'],
        starred: false,
        dateAdded: new Date().toISOString(),
      };
      saveFlashcards([newCard, ...cards]);
    }

    setIsAddedToCards(true);
  };

  const scanSampleItem = async (type: 'apple' | 'coffee' | 'book') => {
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#0a1020';
      ctx.fillRect(0, 0, 400, 400);

      if (type === 'apple') {
        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(200, 210, 80, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = '#22c55e';
        ctx.lineWidth = 10;
        ctx.beginPath();
        ctx.moveTo(200, 130);
        ctx.quadraticCurveTo(230, 100, 240, 110);
        ctx.stroke();
      } else if (type === 'coffee') {
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(200, 200, 70, 0, Math.PI);
        ctx.fill();

        ctx.strokeStyle = '#78350f';
        ctx.lineWidth = 15;
        ctx.beginPath();
        ctx.arc(270, 200, 30, -Math.PI / 2, Math.PI / 2);
        ctx.stroke();
      } else if (type === 'book') {
        ctx.fillStyle = '#1d4ed8';
        ctx.fillRect(130, 110, 140, 180);

        ctx.fillStyle = '#f4f4f5';
        ctx.fillRect(270, 120, 10, 160);
      }

      const base64Image = canvas.toDataURL('image/jpeg');
      setUploadedImage(base64Image);
      await analyzeImageBase64(base64Image, type);
    }
  };

  const resetCapture = () => {
    setUploadedImage(null);
    setPrediction(null);
    setIsAddedToCards(false);
    startCamera();
  };

  const playAudio = (text: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.lang = 'en-US';
      window.speechSynthesis.speak(utterance);
    }
  };

  return (
    <div className="flex-1 w-full flex flex-col md:flex-row gap-6 p-4 md:p-6 overflow-hidden">
      {/* Visual Capture Panel */}
      <div
        className={`flex-1 flex flex-col justify-between border-2 rounded-2xl overflow-hidden transition-all duration-300 ${
          isDragging ? 'border-sky-400 bg-slate-900/80' : 'theme-border theme-panel'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Top Header info */}
        <div className="px-5 py-3 border-b theme-border theme-header flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-black uppercase tracking-wider text-sky-300">
              English Vision Lens
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={triggerFileSelect}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-sky-100 hover:text-white bg-sky-600 hover:bg-sky-500 border border-sky-400 rounded-lg transition cursor-pointer shadow-[0_0_10px_rgba(56,189,248,0.3)]"
            >
              <Camera className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Camera</span>
            </button>
            <button
              onClick={triggerUploadSelect}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-slate-200 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-lg transition cursor-pointer"
            >
              <Upload className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Upload</span>
            </button>
          </div>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            capture="environment"
            className="hidden"
          />
          <input
            type="file"
            ref={uploadInputRef}
            onChange={handleFileUpload}
            accept="image/*"
            className="hidden"
          />
        </div>

        {/* Viewfinder stage with Futuristic Reticle overlays */}
        <div className="flex-1 relative flex flex-col items-center justify-center p-4 overflow-hidden bg-slate-950/80 min-h-[300px]">
          {/* Glowing Viewfinder Target Corners */}
          <div className="absolute inset-6 pointer-events-none border theme-border rounded-xl z-10">
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-sky-400 rounded-tl-md"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-sky-400 rounded-tr-md"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-sky-400 rounded-bl-md"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-sky-400 rounded-br-md"></div>
          </div>

          {/* Sweeping Laser Beam */}
          {isScanning && (
            <div className="absolute left-6 right-6 h-[2px] bg-gradient-to-r from-transparent via-sky-400 to-transparent shadow-[0_0_12px_#38bdf8] animate-pulse z-20 pointer-events-none"></div>
          )}

          {uploadedImage ? (
            <img
              src={uploadedImage}
              alt="Scan capture"
              className="w-full h-full object-contain max-h-[340px] rounded-lg relative z-0"
            />
          ) : hasPermission ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover max-h-[340px] rounded-lg relative z-0"
            />
          ) : hasPermission === false ? (
            <div className="flex flex-col items-center justify-center text-center px-6 max-w-sm relative z-10">
              <span className="text-[10px] font-black uppercase tracking-widest text-sky-400 bg-slate-900 border theme-border px-3 py-1 rounded-full mb-3">
                Virtual Scan Center
              </span>
              <p className="text-sm font-bold text-slate-200">Camera permission inactive</p>
              <p className="text-xs text-slate-400 mt-1 mb-5 leading-relaxed">
                Connect your camera feed, or instantly test the Vision model using our demo mockups below:
              </p>

              {/* Interactive Demo Scan Items */}
              <div className="w-full flex flex-col gap-2 mb-4">
                <button
                  onClick={() => scanSampleItem('apple')}
                  disabled={isScanning}
                  className="w-full py-2.5 bg-slate-900/90 hover:bg-slate-800 border theme-border text-left px-4 rounded-xl text-xs font-bold text-slate-200 transition flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-black text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-500/40">FRUIT</span>
                    <span>Test Red Apple</span>
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-sky-400">
                    TRIGGER LENS
                  </span>
                </button>
                <button
                  onClick={() => scanSampleItem('coffee')}
                  disabled={isScanning}
                  className="w-full py-2.5 bg-slate-900/90 hover:bg-slate-800 border theme-border text-left px-4 rounded-xl text-xs font-bold text-slate-200 transition flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-black text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/40">DRINK</span>
                    <span>Test Espresso Cup</span>
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-sky-400">
                    TRIGGER LENS
                  </span>
                </button>
                <button
                  onClick={() => scanSampleItem('book')}
                  disabled={isScanning}
                  className="w-full py-2.5 bg-slate-900/90 hover:bg-slate-800 border theme-border text-left px-4 rounded-xl text-xs font-bold text-slate-200 transition flex items-center justify-between cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-[9px] font-mono font-black text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-500/40">OBJECT</span>
                    <span>Test Blue Book Cover</span>
                  </span>
                  <span className="text-[9px] font-mono uppercase tracking-wider text-sky-400">
                    TRIGGER LENS
                  </span>
                </button>
              </div>

              <div className="flex flex-col gap-3 mt-2 w-full max-w-[200px]">
                <button
                  onClick={triggerFileSelect}
                  className="flex justify-center items-center gap-2 px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-sky-100 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer border border-sky-400 shadow-[0_0_15px_rgba(56,189,248,0.2)] w-full"
                >
                  <Camera className="w-5 h-5" />
                  Open Camera
                </button>
                <button
                  onClick={triggerUploadSelect}
                  className="flex justify-center items-center gap-2 px-6 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer border border-slate-600 w-full"
                >
                  <Upload className="w-5 h-5" />
                  Upload Image
                </button>
              </div>
            </div>
          ) : (
            <div className="text-xs text-slate-400 animate-pulse">Connecting video device...</div>
          )}

          {isScanning && (
            <div className="absolute inset-0 bg-slate-950/80 flex flex-col items-center justify-center backdrop-blur-xs z-30">
              <div className="w-10 h-10 rounded-full border-2 border-sky-900 border-t-sky-400 animate-spin mb-3"></div>
              <p className="text-xs font-black text-sky-400 tracking-widest uppercase">
                Analyzing Object Details...
              </p>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Control Button panel */}
        <div className="p-4 border-t theme-border theme-panel-sub flex items-center justify-center gap-3">
          {uploadedImage ? (
            <button
              onClick={resetCapture}
              className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-100 font-bold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer border theme-border"
            >
              <span>Capture Fresh Image</span>
            </button>
          ) : (
            <button
              onClick={capturePhoto}
              disabled={hasPermission !== true || isScanning}
              className="flex items-center gap-2 px-8 py-3 bg-sky-500 hover:bg-sky-400 disabled:opacity-50 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all shadow-md active:scale-95 cursor-pointer"
            >
              <span>Identify Object</span>
            </button>
          )}
        </div>
      </div>

      {/* Analysis Results Panel */}
      <div className="w-full md:w-[360px] flex flex-col border theme-border theme-panel rounded-2xl overflow-hidden shrink-0 shadow-lg">
        <div className="px-5 py-3.5 border-b theme-border theme-header flex items-center justify-between">
          <span className="text-xs font-black uppercase tracking-wider text-sky-400">
            Lexicon Analysis
          </span>
        </div>

        <div className="flex-1 p-5 overflow-y-auto flex flex-col justify-between gap-6">
          {prediction ? (
            <div className="flex flex-col gap-4">
              <div className="p-4 rounded-xl bg-slate-950/70 border theme-border">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">
                    Identified Name
                  </span>
                  <button
                    onClick={() => playAudio(prediction.name)}
                    className="text-[9px] font-mono font-bold text-sky-400 hover:text-sky-300 cursor-pointer"
                  >
                    [PLAY AUDIO]
                  </button>
                </div>
                <h3 className="text-xl font-black text-white tracking-tight">{prediction.name}</h3>
              </div>

              <div className="p-4 rounded-xl bg-slate-950/70 border theme-border">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 block mb-1">
                  Grammar Definition
                </span>
                <p className="text-xs font-medium text-slate-200 leading-relaxed">
                  {prediction.definition}
                </p>
              </div>

              <div className="flex items-start gap-2 p-3.5 rounded-xl bg-slate-950/50 border theme-border text-[11px] text-slate-300">
                <p className="leading-normal">
                  Pressing save stores this vocabulary item in your interactive flashcards section.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-6 my-auto">
              <p className="text-xs font-bold text-slate-300">No Image Scanned Yet</p>
              <p className="text-[11px] text-slate-400 mt-1 max-w-[200px] leading-normal">
                Take a photo or upload an image to receive instant dictionary definitions.
              </p>
            </div>
          )}

          {prediction && (
            <div className="mt-auto">
              {isAddedToCards ? (
                <div className="w-full py-3 rounded-xl bg-slate-950/80 border border-emerald-500/50 text-center text-xs font-bold text-emerald-400 flex items-center justify-center gap-1.5">
                  <span>Added to Vocabulary!</span>
                </div>
              ) : (
                <button
                  onClick={handleSaveToFlashcards}
                  className="w-full py-3 bg-sky-500 hover:bg-sky-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-md"
                >
                  Save as Flashcard
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
