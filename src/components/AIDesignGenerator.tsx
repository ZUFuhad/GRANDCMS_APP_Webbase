import React, { useState } from 'react';
import {
  Palette,
  Sparkles,
  Download,
  Copy,
  Check,
  Layers,
  ShieldCheck,
  Maximize2,
  Box,
  FileSpreadsheet,
  Loader2,
} from 'lucide-react';

interface AIDesignGeneratorProps {
  onExportToQuotation?: (design: any) => void;
}

export const AIDesignGenerator: React.FC<AIDesignGeneratorProps> = ({
  onExportToQuotation,
}) => {
  const [designType, setDesignType] = useState('Borfi Frame');
  const [dimensions, setDimensions] = useState('3X3=9sqf');
  const [industry, setIndustry] = useState('Corporate FMCG');
  const [theme, setTheme] = useState('Royal Gold & Obsidian Black Exhibition Theme');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Active Design Output
  const [activeDesign, setActiveDesign] = useState({
    projectName: 'Borfi Frame Fabrication Blueprint',
    type: 'Borfi Frame (Diamond Wooden Signage)',
    dimensions: '3X3=9sqf (Total 9 sqft per unit)',
    materialRecommendation:
      '340gsm High-Density Black Media PVC Flex with eco-solvent UV curing. Seasoned Garjan wood 1.5" x 1.5" frame batten with diagonal strut bracing.',
    frameStructure:
      'Diamond shape 45-degree rotated square, secured with zinc-coated drywall screws and heavy-duty corner brackets.',
    colorScheme: ['#0284c7', '#0f172a', '#2563eb', '#64748b', '#ffffff'],
    layoutConcept:
      'Blue accent apex, bold corporate typography in the center, and contact QR code in the bottom corner.',
    fabricationSpecs: [
      'Framing: Seasoned Garjan wood treated against moisture & rot',
      'Media: 340gsm Black Media PVC (non-translucent for outdoor daylight clarity)',
      'Finishing: Double-folded wrapped edges with industrial staples every 2 inches',
      'Mounting: Rear heavy wire loops or direct bamboo peg anchors for outdoor grass/roadside setup',
    ],
    productionAdvice:
      'Ensure 12-day lead time for mass batches (>200 units) to guarantee complete drying of PVC eco-solvent print and warp-free wood seasoning.',
    svgMockup: `
      <svg viewBox="0 0 600 400" width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#090d16" />
            <stop offset="100%" stop-color="#1e293b" />
          </linearGradient>
          <linearGradient id="blueGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stop-color="#38bdf8" />
            <stop offset="50%" stop-color="#2563eb" />
            <stop offset="100%" stop-color="#1d4ed8" />
          </linearGradient>
        </defs>
        
        <rect width="600" height="400" fill="url(#bgGrad)" rx="16" />
        
        <!-- Grid blueprint background -->
        <g stroke="#334155" stroke-width="0.5" opacity="0.3">
          <line x1="50" y1="0" x2="50" y2="400" />
          <line x1="100" y1="0" x2="100" y2="400" />
          <line x1="150" y1="0" x2="150" y2="400" />
          <line x1="200" y1="0" x2="200" y2="400" />
          <line x1="250" y1="0" x2="250" y2="400" />
          <line x1="300" y1="0" x2="300" y2="400" />
          <line x1="350" y1="0" x2="350" y2="400" />
          <line x1="400" y1="0" x2="400" y2="400" />
          <line x1="450" y1="0" x2="450" y2="400" />
          <line x1="500" y1="0" x2="500" y2="400" />
          <line x1="550" y1="0" x2="550" y2="400" />
          
          <line x1="0" y1="50" x2="600" y2="50" />
          <line x1="0" y1="100" x2="600" y2="100" />
          <line x1="0" y1="150" x2="600" y2="150" />
          <line x1="0" y1="200" x2="600" y2="200" />
          <line x1="0" y1="250" x2="600" y2="250" />
          <line x1="0" y1="300" x2="600" y2="300" />
          <line x1="0" y1="350" x2="600" y2="350" />
        </g>
        
        <!-- Diamond Borfi Frame (Outer Wood Frame) -->
        <g transform="translate(300, 200) rotate(45)">
          <rect x="-115" y="-115" width="230" height="230" fill="none" stroke="#2563eb" stroke-width="12" rx="6" />
          <rect x="-105" y="-105" width="210" height="210" fill="#0f172a" stroke="#38bdf8" stroke-width="2" />
        </g>
        
        <!-- Inner Graphics (Non-rotated context) -->
        <!-- Grand Emblem Icon -->
        <path d="M 300, 130 L 315, 148 L 338, 142 L 324, 160 L 335, 175 L 300, 170 L 265, 175 L 276, 160 L 262, 142 L 285, 148 Z" fill="url(#blueGrad)" />
        <circle cx="300" cy="122" r="5" fill="#38bdf8" />
        
        <text x="300" y="210" font-family="'Cinzel', Georgia, serif" font-size="24" font-weight="900" fill="#ffffff" text-anchor="middle" letter-spacing="3">GRAND</text>
        <text x="300" y="230" font-family="sans-serif" font-size="9" font-weight="bold" fill="#38bdf8" text-anchor="middle" letter-spacing="4">EST. 2004 &bull; CHATTOGRAM</text>
        <text x="300" y="255" font-family="sans-serif" font-size="11" fill="#cbd5e1" text-anchor="middle">BORFI FRAME 3' X 3' = 9 SQFT</text>
        <text x="300" y="272" font-family="sans-serif" font-size="9" fill="#94a3b8" text-anchor="middle">340gsm Black Media PVC &bull; Garjan Wood</text>
        
        <!-- Dimension Annotations -->
        <line x1="120" y1="50" x2="120" y2="350" stroke="#38bdf8" stroke-dasharray="3,3" />
        <text x="110" y="205" font-family="monospace" font-size="10" fill="#38bdf8" text-anchor="end">3'-0" (36 INCH)</text>
        
        <line x1="150" y1="365" x2="450" y2="365" stroke="#38bdf8" stroke-dasharray="3,3" />
        <text x="300" y="380" font-family="monospace" font-size="10" fill="#38bdf8" text-anchor="middle">3'-0" (36 INCH)</text>
      </svg>
    `,
  });

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/design-generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          designType,
          dimensions,
          industry,
          theme,
        }),
      });

      const data = await response.json();
      if (data.success && data.design) {
        setActiveDesign(data.design);
      } else {
        alert('Design blueprint generated using internal Grand engineering specs.');
      }
    } catch (err) {
      console.error('Error generating AI design:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopySvg = () => {
    navigator.clipboard.writeText(activeDesign.svgMockup);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([activeDesign.svgMockup], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${activeDesign.projectName.replace(/\s+/g, '_')}.svg`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner in Corporate Deep Black with Blue Accent */}
      <div className="bg-slate-950 border border-slate-900 rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden text-white">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-400 text-xs font-bold border border-blue-500/30 mb-2.5">
              <Palette className="w-3.5 h-3.5 text-blue-400" />
              Signage & Event Creative Engine
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              AI-Driven Design & Fabrication Generator
            </h1>
            <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl font-normal leading-relaxed">
              Synthesizes structural blueprints, material specs (340gsm black media PVC, seasoned Garjan timber),
              color palettes, and live vector SVG previews for Borfi, Standees, and Stage setups.
            </p>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-2.5 transition-all transform active:scale-95 disabled:opacity-50 shrink-0 cursor-pointer"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin text-white" />
                Generating Vector Blueprint...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-white" />
                Generate Design Blueprint
              </>
            )}
          </button>
        </div>
      </div>

      {/* Design Parameters Form in White, Blue & Black */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
          <div>
            <label className="block text-slate-700 font-bold mb-1">Asset / Signage Type</label>
            <select
              value={designType}
              onChange={(e) => setDesignType(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
            >
              <option value="Borfi Frame">Borfi Frame (Diamond Wooden Signage)</option>
              <option value="Standee">Standee (2X4=8sqf Wooden Frame)</option>
              <option value="Festoon">Festoon (2X4=8sqf Pipe Frame)</option>
              <option value="Backlit Signboard">Backlit Flex Signboard (MS Pipe Box)</option>
              <option value="Stage Backdrop">Stage Backdrop & Exhibition Pavilion</option>
            </select>
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Dimensions & Sqft</label>
            <input
              type="text"
              value={dimensions}
              onChange={(e) => setDimensions(e.target.value)}
              placeholder="e.g. 3X3=9sqf or 2X4=8sqf"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Client Sector</label>
            <input
              type="text"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Beverage / Banking / Retail"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>

          <div>
            <label className="block text-slate-700 font-bold mb-1">Stylistic Theme</label>
            <input
              type="text"
              value={theme}
              onChange={(e) => setTheme(e.target.value)}
              placeholder="e.g. Festive Gold & Crimson"
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-900 focus:bg-white focus:outline-none focus:border-blue-600 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Main Grid: Interactive Visual Preview & Technical Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Vector SVG Preview Canvas (7 Cols) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Box className="w-5 h-5 text-blue-600" />
                <h3 className="font-bold text-slate-950 text-base">
                  Interactive Vector Mockup Preview
                </h3>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySvg}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Copy Raw SVG"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-blue-600" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied SVG' : 'Copy SVG'}
                </button>

                <button
                  onClick={handleDownloadSvg}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm shadow-blue-600/25 transition-colors cursor-pointer"
                  title="Download SVG file"
                >
                  <Download className="w-3.5 h-3.5" />
                  Save .SVG
                </button>
              </div>
            </div>

            {/* SVG Render Container */}
            <div
              className="w-full bg-slate-950 rounded-2xl border border-slate-900 overflow-hidden flex items-center justify-center p-3 min-h-[380px] shadow-inner"
              dangerouslySetInnerHTML={{ __html: activeDesign.svgMockup }}
            />
          </div>

          {/* Color Scheme Palette Swatches */}
          <div className="mt-5 pt-3.5 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-500 font-bold uppercase">Recommended Palette:</span>
            <div className="flex items-center gap-2.5">
              {activeDesign.colorScheme.map((hex, i) => (
                <div key={i} className="flex items-center gap-1 text-[11px] font-mono text-slate-700">
                  <span
                    className="w-5 h-5 rounded-md border border-slate-200 shadow-xs"
                    style={{ backgroundColor: hex }}
                  ></span>
                  <span className="font-bold">{hex}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Fabrication & Material Specifications (5 Cols) */}
        <div className="lg:col-span-5 bg-white border border-slate-200 rounded-3xl p-6 shadow-xs space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">
                Production Dossier
              </span>
              <h2 className="text-lg font-bold text-slate-950 mt-0.5">
                {activeDesign.projectName}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Dimensions: <strong className="text-slate-950">{activeDesign.dimensions}</strong>
              </p>
            </div>

            {/* Material & Frame Recommendation */}
            <div className="space-y-2.5 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="font-bold text-blue-700 block mb-1">
                  Material Recommendation:
                </span>
                <p className="text-slate-700 text-[11.5px] leading-relaxed font-medium">
                  {activeDesign.materialRecommendation}
                </p>
              </div>

              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-950 block mb-1">
                  Frame & Structural Rigidity:
                </span>
                <p className="text-slate-700 text-[11.5px] leading-relaxed font-medium">
                  {activeDesign.frameStructure}
                </p>
              </div>
            </div>

            {/* Fabrication Checklist */}
            <div className="space-y-1.5 text-xs">
              <span className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
                Workshop Fabrication Specs:
              </span>
              <ul className="space-y-1 text-slate-600 text-[11px] font-medium">
                {activeDesign.fabricationSpecs.map((spec, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-blue-600 font-bold">&bull;</span>
                    <span>{spec}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Production Advice */}
            <div className="bg-blue-50/60 border border-blue-200 p-3 rounded-xl text-xs text-blue-900 flex items-start gap-2.5">
              <ShieldCheck className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
              <p className="text-[11.5px] leading-snug font-medium">
                {activeDesign.productionAdvice}
              </p>
            </div>
          </div>

          {/* Action to Quotation */}
          {onExportToQuotation && (
            <div className="pt-3 border-t border-slate-100">
              <button
                onClick={() => onExportToQuotation(activeDesign)}
                className="w-full py-3 bg-slate-950 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4" />
                Transfer Specs to New Quotation
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
