import React, { useState, useRef, useEffect } from 'react';
import { 
  Camera, 
  X, 
  RefreshCw, 
  Check, 
  AlertCircle, 
  Upload, 
  Sparkles, 
  Link as LinkIcon,
  CheckCircle2,
  Palette,
  Image as ImageIcon
} from 'lucide-react';
import { 
  uploadImage, 
  generateSvgPlaceholder,
  SAMPLE_PRODUCT_IMAGES, 
  SAMPLE_SHOP_LOGOS, 
  SAMPLE_SHOP_BANNERS 
} from '../../lib/imageUpload';

interface MediaCaptureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (mediaUrl: string) => void;
  title?: string;
  aspectRatio?: 'square' | 'banner';
  category?: string; // Optional context: 'logo' | 'banner' | 'product' | 'qr'
}

export const MediaCaptureModal: React.FC<MediaCaptureModalProps> = ({
  isOpen,
  onClose,
  onCapture,
  title = 'Select or Upload Photo',
  aspectRatio = 'square',
  category = 'product'
}) => {
  const [mode, setMode] = useState<'url' | 'presets' | 'svg' | 'upload' | 'camera'>('url');
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState<boolean>(false);
  
  // Custom URL and SVG Generator inputs
  const [customUrlInput, setCustomUrlInput] = useState<string>('');
  const [svgLabel, setSvgLabel] = useState<string>('');
  const [svgColor, setSvgColor] = useState<'emerald' | 'blue' | 'amber' | 'purple' | 'rose' | 'slate'>('emerald');
  const [sourceLabel, setSourceLabel] = useState<string>('Web Link');

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      resetState();
      return;
    }

    if (mode === 'camera' && !capturedPreview) {
      startCamera();
    }

    return () => {
      stopCamera();
    };
  }, [isOpen, mode, facingMode, capturedPreview]);

  const resetState = () => {
    setCapturedPreview(null);
    setCameraError(null);
    setCustomUrlInput('');
    setSvgLabel('');
  };

  const startCamera = async () => {
    setIsInitializing(true);
    setCameraError(null);
    stopCamera();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: facingMode,
          width: { ideal: 1280 },
          height: { ideal: aspectRatio === 'banner' ? 720 : 1280 }
        },
        audio: false
      });

      setCameraStream(stream);
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err: any) {
      console.warn('Camera access error:', err);
      let errorMsg = 'Could not access camera.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        errorMsg = 'Camera permission denied. Please choose file or web link mode.';
        setMode('upload');
      } else {
        errorMsg = err.message || 'Unable to open camera stream.';
        setMode('upload');
      }
      setCameraError(errorMsg);
    } finally {
      setIsInitializing(false);
    }
  };

  const stopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const flipCamera = () => {
    setFacingMode(prev => (prev === 'environment' ? 'user' : 'environment'));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const res = await uploadImage(file);
      if (res.success && res.url) {
        setCapturedPreview(res.url);
        setSourceLabel('Optimized Image');
      }
    } catch (err) {
      console.error(err);
    }
  };

  const takeSnapshot = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const width = video.videoWidth || 640;
    const height = video.videoHeight || 480;

    canvas.width = width;
    canvas.height = height;
    context.drawImage(video, 0, 0, width, height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    stopCamera();
    setCapturedPreview(dataUrl);
    setSourceLabel('Camera Capture');
  };

  const handleSelectPreset = (url: string) => {
    setCapturedPreview(url);
    setSourceLabel('Curated Preset');
  };

  const handleApplyCustomUrl = () => {
    if (!customUrlInput.trim()) return;
    setCapturedPreview(customUrlInput.trim());
    setSourceLabel('Direct Web URL');
  };

  const handleGenerateSvg = () => {
    const label = svgLabel.trim() || (category === 'logo' ? 'My Shop' : 'Product');
    const svgDataUri = generateSvgPlaceholder(label, category, svgColor);
    setCapturedPreview(svgDataUri);
    setSourceLabel('Auto-Generated Vector');
  };

  const handleRetake = () => {
    resetState();
    if (mode === 'camera') {
      startCamera();
    }
  };

  const handleConfirm = () => {
    if (capturedPreview) {
      onCapture(capturedPreview);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div id="media-capture-modal-backdrop" className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4 animate-in fade-in">
      <div id="media-capture-dialog" className="bg-white rounded-3xl shadow-2xl border border-slate-200 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-900 text-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-white text-sm">{title}</h3>
              <p className="text-[10px] text-slate-300">Direct Web Links, Curated Presets, SVG Graphics, or Device Photos</p>
            </div>
          </div>
          <button
            id="close-media-modal-btn"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switchers */}
        {!capturedPreview && (
          <div className="flex flex-wrap border-b border-slate-200 bg-slate-100/80 p-1.5 mx-4 mt-3 rounded-2xl gap-1">
            <button
              id="switch-url-mode-btn"
              onClick={() => {
                stopCamera();
                setMode('url');
              }}
              className={`flex-1 min-w-[70px] flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-xl transition ${
                mode === 'url'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5 text-blue-600" />
              <span>Web Link</span>
            </button>

            <button
              id="switch-presets-mode-btn"
              onClick={() => {
                stopCamera();
                setMode('presets');
              }}
              className={`flex-1 min-w-[70px] flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-xl transition ${
                mode === 'presets'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Presets</span>
            </button>

            <button
              id="switch-svg-mode-btn"
              onClick={() => {
                stopCamera();
                setMode('svg');
              }}
              className={`flex-1 min-w-[70px] flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-xl transition ${
                mode === 'svg'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5 text-purple-600" />
              <span>Auto SVG</span>
            </button>

            <button
              id="switch-upload-mode-btn"
              onClick={() => {
                stopCamera();
                setMode('upload');
              }}
              className={`flex-1 min-w-[70px] flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-xl transition ${
                mode === 'upload'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" />
              <span>File</span>
            </button>

            <button
              id="switch-camera-mode-btn"
              onClick={() => {
                setMode('camera');
                setCameraError(null);
              }}
              className={`flex-1 min-w-[70px] flex items-center justify-center gap-1 py-1.5 text-xs font-bold rounded-xl transition ${
                mode === 'camera'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Camera className="w-3.5 h-3.5 text-rose-500" />
              <span>Camera</span>
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-5 flex-1 flex flex-col items-center justify-center min-h-[280px] overflow-y-auto">
          
          {cameraError && !capturedPreview && (
            <div className="w-full mb-3 p-3 bg-amber-50 border border-amber-200 text-amber-800 rounded-2xl text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{cameraError}</span>
            </div>
          )}

          {capturedPreview ? (
            /* Preview State */
            <div className="w-full flex flex-col items-center space-y-3">
              <div className={`relative overflow-hidden rounded-2xl bg-slate-900 w-full ${aspectRatio === 'banner' ? 'aspect-21/9' : 'aspect-square max-w-xs'} flex items-center justify-center shadow-md border border-slate-200`}>
                <img
                  src={capturedPreview}
                  alt="Captured Preview"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="text-center space-y-1">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Source: {sourceLabel}</span>
                </div>
                <p className="text-[10px] text-slate-400 font-mono truncate max-w-sm">
                  {capturedPreview.startsWith('data:') ? 'Vector / Embedded Data URI' : capturedPreview}
                </p>
              </div>
            </div>
          ) : mode === 'url' ? (
            /* Direct URL input */
            <div className="w-full space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Enter Image Web Link (URL)</label>
                <p className="text-[11px] text-slate-500">Provide direct public image link (Unsplash, CDN, or any hosted web photo)</p>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  value={customUrlInput}
                  onChange={(e) => setCustomUrlInput(e.target.value)}
                  className="flex-1 p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600 font-medium"
                />
                <button
                  type="button"
                  onClick={handleApplyCustomUrl}
                  disabled={!customUrlInput.trim()}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition disabled:opacity-40"
                >
                  Apply Link
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-[11px] text-slate-600 space-y-1">
                <span className="font-bold text-slate-900 block">Quick Suggestions:</span>
                <p className="text-slate-500">You can copy-paste any free image link from Unsplash, Wikimedia Commons, or your own hosting.</p>
              </div>
            </div>
          ) : mode === 'presets' ? (
            /* Curated Presets Library */
            <div className="w-full space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Select Curated High-Res Photo:</span>
                <span className="text-[10px] text-slate-400 font-medium">1-Click Apply</span>
              </div>
              <div className="grid grid-cols-3 gap-2.5 max-h-[260px] overflow-y-auto pr-1">
                {(aspectRatio === 'banner' ? SAMPLE_SHOP_BANNERS : category === 'logo' ? SAMPLE_SHOP_LOGOS : SAMPLE_PRODUCT_IMAGES.map(p => p.url)).map((imgUrl, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSelectPreset(imgUrl)}
                    className="group relative aspect-square rounded-2xl overflow-hidden border border-slate-200 hover:border-emerald-600 hover:shadow-md transition bg-slate-100"
                  >
                    <img src={imgUrl} alt={`Preset ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                    <div className="absolute inset-0 bg-slate-950/10 group-hover:bg-transparent transition" />
                  </button>
                ))}
              </div>
            </div>
          ) : mode === 'svg' ? (
            /* Auto-generated SVG Generator */
            <div className="w-full space-y-3">
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-700">Generate Custom Vector Badge / Placeholder</label>
                <p className="text-[11px] text-slate-500">Auto-generates lightweight SVG graphic without external network calls</p>
              </div>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Enter Title / Brand Name (e.g. Basmati Rice, Fresh Kirana)"
                  value={svgLabel}
                  onChange={(e) => setSvgLabel(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:bg-white focus:outline-none focus:border-emerald-600"
                />

                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-600">Color Theme:</span>
                  {(['emerald', 'blue', 'amber', 'purple', 'rose', 'slate'] as const).map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setSvgColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition ${
                        svgColor === c ? 'border-slate-900 scale-110' : 'border-transparent'
                      } ${
                        c === 'emerald' ? 'bg-emerald-500' :
                        c === 'blue' ? 'bg-blue-500' :
                        c === 'amber' ? 'bg-amber-500' :
                        c === 'purple' ? 'bg-purple-500' :
                        c === 'rose' ? 'bg-rose-500' : 'bg-slate-600'
                      }`}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  onClick={handleGenerateSvg}
                  className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl transition flex items-center justify-center gap-2 mt-2 shadow-xs"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Generate SVG Graphic</span>
                </button>
              </div>
            </div>
          ) : mode === 'upload' ? (
            /* Local File Picker */
            <div className="w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-200 hover:border-emerald-500 rounded-3xl bg-slate-50/70 hover:bg-emerald-50/30 transition text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="gallery-file-input"
              />
              <div className="w-14 h-14 rounded-2xl bg-emerald-100/70 text-emerald-700 flex items-center justify-center mb-2 shadow-2xs">
                <Upload className="w-7 h-7" />
              </div>
              <h4 className="text-xs font-bold text-slate-800">Select Image from Device</h4>
              <p className="text-[11px] text-slate-500 mt-0.5 mb-4 max-w-xs">
                Optimized instantly in your browser without external storage services.
              </p>
              
              <button
                id="browse-device-files-btn"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-2"
              >
                <Upload className="w-4 h-4 text-emerald-400" />
                <span>Browse Local Files</span>
              </button>
            </div>
          ) : (
            /* Camera Live View */
            <div className="w-full flex flex-col items-center">
              <div className={`relative overflow-hidden rounded-2xl bg-black w-full ${aspectRatio === 'banner' ? 'aspect-16/9' : 'aspect-square max-w-xs'} flex items-center justify-center shadow-lg border-2 border-slate-800`}>
                {isInitializing && (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-slate-900 text-white gap-2">
                    <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
                    <span className="text-xs font-medium">Opening Camera...</span>
                  </div>
                )}
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover"
                />
                
                <button
                  id="flip-camera-btn"
                  onClick={flipCamera}
                  title="Switch Camera"
                  className="absolute top-3 right-3 p-2 rounded-full bg-black/60 text-white hover:bg-black/80 transition"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="mt-3 flex items-center gap-4">
                <button
                  id="shutter-capture-btn"
                  onClick={takeSnapshot}
                  disabled={isInitializing || !cameraStream}
                  className="w-14 h-14 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center shadow-lg active:scale-95 transition disabled:opacity-50"
                >
                  <div className="w-10 h-10 rounded-full border-2 border-white flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-white" />
                  </div>
                </button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50">
          <button
            id="cancel-media-btn"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-200 rounded-xl transition"
          >
            Cancel
          </button>

          {capturedPreview && (
            <div className="flex items-center gap-2">
              <button
                id="retake-media-btn"
                onClick={handleRetake}
                className="px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-xl transition"
              >
                Change
              </button>
              <button
                id="apply-media-btn"
                onClick={handleConfirm}
                className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition flex items-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Use This Image</span>
              </button>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
