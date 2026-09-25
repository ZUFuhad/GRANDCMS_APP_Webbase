import React, { useState } from 'react';
import { Sparkles, Image as ImageIcon } from 'lucide-react';

export const AIDesignGenerator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [generated, setGenerated] = useState(false);

  const handleGenerate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;
    setGenerated(true);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl sm:text-2xl font-black text-white">AI Booth & Exhibition Design Generator</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-0.5">
          Generate visual concepts for brand activations, stalls, and exhibition booths.
        </p>
      </div>

      <div className="bg-[#0B192C] rounded-2xl p-6 shadow-xl border border-slate-800 space-y-4 text-slate-200">
        <form onSubmit={handleGenerate} className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Design Prompt / Concept</label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. Luxurious wooden exhibition stall with neon branding and product display shelves for a corporate trade show..."
              rows={3}
              className="w-full p-3 bg-[#07101C] border border-slate-700 rounded-xl text-xs text-white"
              required
            />
          </div>
          <button
            type="submit"
            className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            Generate Concept Preview
          </button>
        </form>

        {generated && (
          <div className="p-6 bg-[#07101C] text-white rounded-2xl text-center space-y-3 border border-slate-800 animate-fade-in">
            <div className="w-16 h-16 bg-amber-500/20 text-amber-400 rounded-2xl mx-auto flex items-center justify-center">
              <ImageIcon className="w-8 h-8" />
            </div>
            <h4 className="font-bold text-sm">Concept Render Generated Successfully!</h4>
            <p className="text-xs text-slate-300 max-w-md mx-auto">
              "{prompt}" — Ready for client proposal presentation.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
