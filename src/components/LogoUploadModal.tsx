import React, { useState, useRef } from 'react';
import { X, Upload, RefreshCw, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import grandLogoDefault from '../assets/grand-logo.png';

interface LogoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const LogoUploadModal: React.FC<LogoUploadModalProps> = ({ isOpen, onClose }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const currentLogo = localStorage.getItem('grand_custom_logo') || grandLogoDefault;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!preview) return;
    setIsSaving(true);

    try {
      // 1. Save to local storage for instant persistent client-side application
      localStorage.setItem('grand_custom_logo', preview);
      
      // 2. Notify all components in the app
      window.dispatchEvent(new Event('grand-logo-changed'));

      // 3. Try to save to server if running Vite dev server
      try {
        await fetch('/api/upload-logo', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ image: preview }),
        });
      } catch (_) {}

      setSuccessMsg('Logo updated successfully!');
      setTimeout(() => {
        setSuccessMsg('');
        onClose();
      }, 1200);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSaving(false);
    }
  };

  const handleReset = () => {
    localStorage.removeItem('grand_custom_logo');
    window.dispatchEvent(new Event('grand-logo-changed'));
    setPreview(null);
    setSuccessMsg('Reset to default logo!');
    setTimeout(() => {
      setSuccessMsg('');
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#0B1528] border border-slate-700/80 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#07101C]">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">Change / Upload Grand Logo</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/80 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          <p className="text-xs text-slate-400">
            Upload your official <code className="text-amber-300 font-mono">grand-logo.png</code> file (transparent PNG recommended). It will immediately update everywhere across the Sidebar, Quotations, Invoices, and PDF exports.
          </p>

          {/* Preview Box */}
          <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl p-4 flex flex-col items-center justify-center bg-slate-900/50 transition cursor-pointer"
               onClick={() => fileInputRef.current?.click()}>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/png,image/jpeg,image/svg+xml,image/webp"
              className="hidden"
            />

            <div className="w-full h-32 rounded-lg flex items-center justify-center bg-[#07101C] p-2 border border-slate-800 relative overflow-hidden"
                 style={{ backgroundImage: 'radial-gradient(#1e293b 1px, transparent 1px)', backgroundSize: '12px 12px' }}>
              <img
                src={preview || currentLogo}
                alt="Logo Preview"
                className="max-h-full max-w-full object-contain drop-shadow"
              />
            </div>

            <div className="mt-3 flex items-center gap-2 text-xs text-amber-400 font-medium">
              <Upload className="w-4 h-4" />
              <span>{preview ? 'Click to change file' : 'Click to select grand-logo.png'}</span>
            </div>
            <span className="text-[10px] text-slate-500 mt-0.5">Supports PNG, SVG, JPG, WebP</span>
          </div>

          {successMsg && (
            <div className="flex items-center gap-2 p-2.5 bg-emerald-950/60 border border-emerald-500/30 rounded-lg text-emerald-300 text-xs font-medium justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-2">
            <button
              type="button"
              onClick={handleReset}
              className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-rose-400 hover:bg-rose-950/30 px-3 py-2 rounded-lg border border-slate-800 transition"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Default</span>
            </button>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="text-xs text-slate-400 hover:text-white px-3 py-2 rounded-lg border border-slate-800 hover:bg-slate-800/60 transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSave}
                disabled={!preview || isSaving}
                className="flex items-center gap-1.5 text-xs font-semibold bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 px-4 py-2 rounded-lg shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{isSaving ? 'Saving...' : 'Apply Logo'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
