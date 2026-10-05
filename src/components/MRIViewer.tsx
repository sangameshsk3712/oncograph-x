import { useState, useRef, useEffect } from 'react';
import { PatientCase, AnatomicalPlane, ScanSequence } from '../types/oncology';
import { Eye, Layers, ZoomIn, ZoomOut, RotateCcw, Crosshair, Sparkles, Sliders } from 'lucide-react';

interface MRIViewerProps {
  patient: PatientCase;
}

export const MRIViewer = ({ patient }: MRIViewerProps) => {
  const [sliceIndex, setSliceIndex] = useState<number>(32);
  const [plane, setPlane] = useState<AnatomicalPlane>('axial');
  const [sequence, setSequence] = useState<ScanSequence>('T1-CE');
  const [showEnhancingCore, setShowEnhancingCore] = useState<boolean>(true);
  const [showEdema, setShowEdema] = useState<boolean>(true);
  const [showNecrosis, setShowNecrosis] = useState<boolean>(true);
  const [showAttentionHeatmap, setShowAttentionHeatmap] = useState<boolean>(true);
  const [contrastWindow, setContrastWindow] = useState<number>(1.0);
  const [brightness, setBrightness] = useState<number>(1.0);
  const [zoomLevel, setZoomLevel] = useState<number>(1.0);
  const [hoverCoord, setHoverCoord] = useState<{ x: number; y: number; val: number; attn: number } | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const isGBM = patient.disease.includes('Glioblastoma');

  // Draw slice on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear background
    ctx.fillStyle = '#05070d';
    ctx.fillRect(0, 0, width, height);

    ctx.save();
    ctx.translate(centerX, centerY);
    ctx.scale(zoomLevel, zoomLevel);
    ctx.translate(-centerX, -centerY);

    // Render Anatomical Background based on disease
    if (isGBM) {
      // Brain Anatomy Rendering
      // Cranium / Brain parenchyma silhouette
      const skullRadiusX = 140;
      const skullRadiusY = 170;
      
      // Skull bone
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, skullRadiusX + 8, skullRadiusY + 8, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#1c2233';
      ctx.fill();

      // Brain parenchyma
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, skullRadiusX, skullRadiusY, 0, 0, Math.PI * 2);
      const brainGrad = ctx.createRadialGradient(centerX, centerY, 20, centerX, centerY, skullRadiusY);
      brainGrad.addColorStop(0, `rgb(${35 * brightness * contrastWindow}, ${42 * brightness * contrastWindow}, ${56 * brightness * contrastWindow})`);
      brainGrad.addColorStop(0.7, `rgb(${25 * brightness * contrastWindow}, ${30 * brightness * contrastWindow}, ${42 * brightness * contrastWindow})`);
      brainGrad.addColorStop(1, `rgb(${15 * brightness * contrastWindow}, ${18 * brightness * contrastWindow}, ${25 * brightness * contrastWindow})`);
      ctx.fillStyle = brainGrad;
      ctx.fill();

      // Ventricles
      ctx.beginPath();
      ctx.ellipse(centerX - 16, centerY - 10, 10, 36, -0.2, 0, Math.PI * 2);
      ctx.ellipse(centerX + 16, centerY - 10, 10, 36, 0.2, 0, Math.PI * 2);
      ctx.fillStyle = sequence === 'T2-FLAIR' ? '#070b14' : '#111726';
      ctx.fill();

      // Cortical gyri sulci patterns
      ctx.strokeStyle = `rgba(255, 255, 255, ${0.07 * contrastWindow})`;
      ctx.lineWidth = 1.5;
      for (let i = 0; i < 7; i++) {
        ctx.beginPath();
        const angle = (i / 7) * Math.PI * 2;
        const x1 = centerX + Math.cos(angle) * (skullRadiusX - 10);
        const y1 = centerY + Math.sin(angle) * (skullRadiusY - 10);
        const x2 = centerX + Math.cos(angle) * (skullRadiusX - 45);
        const y2 = centerY + Math.sin(angle) * (skullRadiusY - 45);
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(x1 + (i % 2 === 0 ? 15 : -15), (y1 + y2) / 2, x2, y2);
        ctx.stroke();
      }

      // Tumor Center depending on slice index
      // Tumor is prominent between slice 18 and 50
      const sliceDistance = Math.abs(sliceIndex - 32);
      const tumorScale = Math.max(0.1, 1 - (sliceDistance / 24));

      if (tumorScale > 0.15) {
        // Tumor location (left temporal/frontal)
        const tumorX = centerX - 48;
        const tumorY = centerY - 15;
        const baseRadius = 38 * tumorScale;

        // 1. Peritumoral Edema (FLAIR hyperintensity)
        if (showEdema) {
          ctx.beginPath();
          ctx.ellipse(tumorX + 6, tumorY - 4, baseRadius * 1.6, baseRadius * 1.4, 0.4, 0, Math.PI * 2);
          const edemaGrad = ctx.createRadialGradient(tumorX, tumorY, baseRadius * 0.7, tumorX, tumorY, baseRadius * 1.6);
          edemaGrad.addColorStop(0, 'rgba(74, 222, 128, 0.45)');
          edemaGrad.addColorStop(0.7, 'rgba(34, 197, 94, 0.25)');
          edemaGrad.addColorStop(1, 'rgba(34, 197, 94, 0)');
          ctx.fillStyle = edemaGrad;
          ctx.fill();
        }

        // 2. Enhancing Core Rim (T1-CE ring)
        if (showEnhancingCore) {
          ctx.beginPath();
          ctx.ellipse(tumorX, tumorY, baseRadius, baseRadius * 0.9, 0.2, 0, Math.PI * 2);
          const coreGrad = ctx.createRadialGradient(tumorX, tumorY, baseRadius * 0.5, tumorX, tumorY, baseRadius);
          coreGrad.addColorStop(0, 'rgba(239, 68, 68, 0.1)');
          coreGrad.addColorStop(0.7, 'rgba(244, 63, 94, 0.75)');
          coreGrad.addColorStop(1, 'rgba(225, 29, 72, 0.85)');
          ctx.fillStyle = coreGrad;
          ctx.fill();

          ctx.strokeStyle = '#fda4af';
          ctx.lineWidth = 1.8;
          ctx.stroke();
        }

        // 3. Central Necrosis
        if (showNecrosis) {
          ctx.beginPath();
          ctx.ellipse(tumorX - 2, tumorY + 2, baseRadius * 0.48, baseRadius * 0.42, 0.1, 0, Math.PI * 2);
          ctx.fillStyle = sequence === 'T1-CE' ? 'rgba(8, 145, 178, 0.8)' : 'rgba(15, 23, 42, 0.9)';
          ctx.fill();
          ctx.strokeStyle = 'rgba(6, 182, 212, 0.6)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // 4. Cross-Attention Tensor Heatmap (Multi-Modal GNN + Codon Transformer Focus)
        if (showAttentionHeatmap) {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          // Focal hotspot where genomic mutations attend to active infiltrative margin
          const attnX = tumorX + 18;
          const attnY = tumorY - 14;
          const attnRadius = baseRadius * 0.9;
          const attnGrad = ctx.createRadialGradient(attnX, attnY, 4, attnX, attnY, attnRadius);
          attnGrad.addColorStop(0, 'rgba(245, 158, 11, 0.85)'); // Amber gold hotspot
          attnGrad.addColorStop(0.4, 'rgba(234, 88, 12, 0.5)');
          attnGrad.addColorStop(0.8, 'rgba(168, 85, 247, 0.25)'); // Purple gradient
          attnGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = attnGrad;
          ctx.beginPath();
          ctx.arc(attnX, attnY, attnRadius, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    } else {
      // Pancreatic CT / Abdominal Anatomy Rendering
      // Liver on patient right, spleen left, vertebrae posterior, aorta, pancreas anterior
      const abdomenW = 160;
      const abdomenH = 140;

      // Abdominal wall
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 10, abdomenW + 6, abdomenH + 6, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#1e293b';
      ctx.fill();

      // Peritoneal cavity
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 10, abdomenW, abdomenH, 0, 0, Math.PI * 2);
      ctx.fillStyle = `rgb(${28 * brightness}, ${35 * brightness}, ${48 * brightness})`;
      ctx.fill();

      // Liver (large wedge right side)
      ctx.beginPath();
      ctx.moveTo(centerX - abdomenW + 15, centerY + 10);
      ctx.quadraticCurveTo(centerX - 40, centerY - 80, centerX + 10, centerY - 20);
      ctx.quadraticCurveTo(centerX - 10, centerY + 60, centerX - abdomenW + 15, centerY + 10);
      ctx.fillStyle = `rgb(${45 * brightness}, ${55 * brightness}, ${72 * brightness})`;
      ctx.fill();

      // Vertebra & Spinal Canal
      ctx.beginPath();
      ctx.ellipse(centerX, centerY + 80, 24, 20, 0, 0, Math.PI * 2);
      ctx.fillStyle = '#e2e8f0';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX, centerY + 80, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#0f172a';
      ctx.fill();

      // Aorta & Vena Cava
      ctx.beginPath();
      ctx.arc(centerX - 12, centerY + 48, 8, 0, Math.PI * 2);
      ctx.fillStyle = '#dc2626';
      ctx.fill();
      ctx.beginPath();
      ctx.arc(centerX + 12, centerY + 48, 9, 0, Math.PI * 2);
      ctx.fillStyle = '#2563eb';
      ctx.fill();

      // Pancreatic Parenchyma
      ctx.beginPath();
      ctx.moveTo(centerX - 35, centerY + 20);
      ctx.quadraticCurveTo(centerX + 10, centerY + 10, centerX + 60, centerY - 15);
      ctx.quadraticCurveTo(centerX + 70, centerY - 5, centerX + 40, centerY + 30);
      ctx.quadraticCurveTo(centerX, centerY + 32, centerX - 35, centerY + 20);
      ctx.fillStyle = `rgb(${55 * brightness}, ${65 * brightness}, ${85 * brightness})`;
      ctx.fill();

      // Pancreatic Tumor (in the head/uncinate)
      const sliceDistance = Math.abs(sliceIndex - 32);
      const tumorScale = Math.max(0.1, 1 - (sliceDistance / 20));

      if (tumorScale > 0.15) {
        const tumorX = centerX - 18;
        const tumorY = centerY + 18;
        const baseRadius = 26 * tumorScale;

        // Desmoplastic Stroma & Infiltration
        if (showEdema) {
          ctx.beginPath();
          ctx.ellipse(tumorX + 4, tumorY + 2, baseRadius * 1.5, baseRadius * 1.3, -0.3, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(249, 115, 22, 0.35)'; // Orange stroma
          ctx.fill();
        }

        // Neoplastic Duct Mass
        if (showEnhancingCore) {
          ctx.beginPath();
          ctx.ellipse(tumorX, tumorY, baseRadius, baseRadius * 0.85, 0.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(239, 68, 68, 0.7)';
          ctx.fill();
          ctx.strokeStyle = '#fca5a5';
          ctx.lineWidth = 1.5;
          ctx.stroke();
        }

        // Central Cavitation / Necrosis
        if (showNecrosis) {
          ctx.beginPath();
          ctx.arc(tumorX - 2, tumorY - 1, baseRadius * 0.35, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(6, 182, 212, 0.8)';
          ctx.fill();
        }

        // Attention Heatmap
        if (showAttentionHeatmap) {
          ctx.save();
          ctx.globalCompositeOperation = 'screen';
          const attnX = tumorX + 8;
          const attnY = tumorY + 8;
          const attnGrad = ctx.createRadialGradient(attnX, attnY, 2, attnX, attnY, baseRadius * 1.2);
          attnGrad.addColorStop(0, 'rgba(234, 179, 8, 0.85)');
          attnGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.4)');
          attnGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
          ctx.fillStyle = attnGrad;
          ctx.beginPath();
          ctx.arc(attnX, attnY, baseRadius * 1.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }
    }

    // Crosshairs & Grid scale
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(centerX, 20);
    ctx.lineTo(centerX, height - 20);
    ctx.moveTo(20, centerY);
    ctx.lineTo(width - 20, centerY);
    ctx.stroke();

    // Orientation Labels
    ctx.font = '10px "JetBrains Mono", monospace';
    ctx.fillStyle = '#64748b';
    ctx.fillText('A (Anterior)', centerX - 32, 16);
    ctx.fillText('P (Posterior)', centerX - 32, height - 8);
    ctx.fillText('R', 8, centerY + 3);
    ctx.fillText('L', width - 16, centerY + 3);

    ctx.restore();
  }, [
    sliceIndex,
    plane,
    sequence,
    showEnhancingCore,
    showEdema,
    showNecrosis,
    showAttentionHeatmap,
    contrastWindow,
    brightness,
    zoomLevel,
    isGBM,
  ]);

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = Math.round(((e.clientX - rect.left) / rect.width) * canvas.width);
    const y = Math.round(((e.clientY - rect.top) / rect.height) * canvas.height);

    // Compute synthetic normalized intensity and attention weight
    const distCenter = Math.hypot(x - canvas.width / 2, y - canvas.height / 2);
    const normalizedIntensity = Math.max(0, Math.min(100, Math.round(100 - distCenter * 0.45)));
    const syntheticAttn = Math.max(0.01, +(Math.sin(x * 0.03) * Math.cos(y * 0.03) * 0.5 + 0.45).toFixed(3));

    setHoverCoord({ x, y, val: normalizedIntensity, attn: syntheticAttn });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Clinical Summary & Sequence Controls */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Volumetric 3D Tensor Viewer</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-cyan-400">{patient.tcgaBarcode}</span>
            <span aria-hidden="true">·</span>
            <span>Slice Matrix: 256×256×64</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Cross-Modal 3D Volumetric Attention Map
          </h2>
        </div>

        {/* Anatomical Planes & Sequences Segmented Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Planes */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            {(['axial', 'sagittal', 'coronal'] as AnatomicalPlane[]).map((p) => (
              <button
                key={p}
                onClick={() => setPlane(p)}
                className={`px-2.5 py-1 text-xs font-medium rounded capitalize transition-colors ${
                  plane === p ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {p}
              </button>
            ))}
          </div>

          {/* MRI/CT Sequences */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5">
            {(['T1-CE', 'T2-FLAIR', 'T1-Pre', 'ADC-Diffusion'] as ScanSequence[]).map((seq) => (
              <button
                key={seq}
                onClick={() => setSequence(seq)}
                className={`px-2.5 py-1 text-xs font-medium rounded transition-colors ${
                  sequence === seq ? 'bg-cyan-950 text-cyan-300 border border-cyan-800' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {seq}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Canvas Slice Viewer */}
        <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-3 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <span className="font-mono text-cyan-300">Slice: {sliceIndex} / 64</span>
              <span aria-hidden="true">·</span>
              <span className="capitalize">{plane} Plane</span>
            </div>
            {hoverCoord && (
              <div className="font-mono text-slate-300 flex items-center gap-3">
                <span>Coord: ({hoverCoord.x}, {hoverCoord.y}, {sliceIndex})</span>
                <span>Intensity: {hoverCoord.val}%</span>
                <span className="text-amber-400">Attn (α): {hoverCoord.attn}</span>
              </div>
            )}
          </div>

          {/* Canvas */}
          <div className="relative border border-slate-800 rounded-lg overflow-hidden bg-black shadow-2xl flex items-center justify-center">
            <canvas
              ref={canvasRef}
              width={420}
              height={420}
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setHoverCoord(null)}
              className="cursor-crosshair max-w-full h-auto"
            />

            {/* Quick Canvas Overlay Buttons */}
            <div className="absolute bottom-3 right-3 flex items-center gap-1.5 bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-lg p-1">
              <button
                onClick={() => setZoomLevel((z) => Math.min(2.0, z + 0.15))}
                className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-slate-800"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setZoomLevel((z) => Math.max(0.7, z - 0.15))}
                className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-slate-800"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => {
                  setZoomLevel(1.0);
                  setBrightness(1.0);
                  setContrastWindow(1.0);
                }}
                className="p-1.5 text-slate-300 hover:text-white rounded hover:bg-slate-800"
                title="Reset View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Interactive Scrub Slider */}
          <div className="w-full mt-4 space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-400">
              <span>Z-Axis Slice Depth (Inferior ↔ Superior)</span>
              <span className="font-mono text-cyan-400">{sliceIndex} / 64</span>
            </div>
            <input
              type="range"
              min="0"
              max="63"
              value={sliceIndex}
              onChange={(e) => setSliceIndex(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
            />
          </div>
        </div>

        {/* Right: Layer Toggles & Quantitative Volumetric Metrics */}
        <div className="lg:col-span-4 space-y-5">
          {/* Multi-Modal Overlays */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Segmentation &amp; Attention Overlays
            </h3>
            <div className="space-y-2.5">
              <label className="flex items-center justify-between text-xs cursor-pointer hover:bg-slate-800/40 p-1.5 rounded">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-rose-500/80 border border-rose-400" />
                  <span className="text-slate-200">Enhancing Tumor Core (T1-CE)</span>
                </div>
                <input
                  type="checkbox"
                  checked={showEnhancingCore}
                  onChange={(e) => setShowEnhancingCore(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer hover:bg-slate-800/40 p-1.5 rounded">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-emerald-500/80 border border-emerald-400" />
                  <span className="text-slate-200">Peritumoral Infiltrative Edema</span>
                </div>
                <input
                  type="checkbox"
                  checked={showEdema}
                  onChange={(e) => setShowEdema(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer hover:bg-slate-800/40 p-1.5 rounded">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-cyan-500/80 border border-cyan-400" />
                  <span className="text-slate-200">Necrotic Liquefactive Cavity</span>
                </div>
                <input
                  type="checkbox"
                  checked={showNecrosis}
                  onChange={(e) => setShowNecrosis(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-cyan-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between text-xs cursor-pointer hover:bg-slate-800/40 p-1.5 rounded border-t border-slate-800 pt-2">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-sm bg-gradient-to-r from-amber-400 to-purple-500" />
                  <div>
                    <span className="text-amber-300 font-medium">Cross-Modal Attention Heatmap</span>
                    <p className="text-[10px] text-slate-400">Where genomic codons query 3D voxels</p>
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={showAttentionHeatmap}
                  onChange={(e) => setShowAttentionHeatmap(e.target.checked)}
                  className="rounded bg-slate-800 border-slate-700 text-amber-500 focus:ring-0"
                />
              </label>
            </div>
          </div>

          {/* Window / Level Radiomic Sliders */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Window / Level Hounsfield Scaling
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Contrast Window (Width)</span>
                  <span className="font-mono">{contrastWindow.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="2.0"
                  step="0.05"
                  value={contrastWindow}
                  onChange={(e) => setContrastWindow(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Window Level (Brightness)</span>
                  <span className="font-mono">{brightness.toFixed(2)}x</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="1.8"
                  step="0.05"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded accent-cyan-400 cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Voxel Volumetric Quantification */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4">
            <h3 className="text-sm font-semibold text-white mb-3">
              Sub-Voxel Quantitative Radiomics
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
                <span className="text-slate-400">Total Volume</span>
                <p className="text-base font-bold font-mono text-cyan-300 mt-0.5">
                  {patient.volumetric.totalTumorVolumeCm3} cm³
                </p>
              </div>

              <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
                <span className="text-slate-400">Enhancing Rim</span>
                <p className="text-base font-bold font-mono text-rose-400 mt-0.5">
                  {patient.volumetric.enhancingMarginCm3} cm³
                </p>
              </div>

              <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
                <span className="text-slate-400">Necrotic Core</span>
                <p className="text-base font-bold font-mono text-cyan-400 mt-0.5">
                  {patient.volumetric.necroticCoreCm3} cm³
                </p>
              </div>

              <div className="p-2.5 bg-slate-950/60 rounded-lg border border-slate-800/80">
                <span className="text-slate-400">Doubling Time</span>
                <p className="text-base font-bold font-mono text-amber-400 mt-0.5">
                  {patient.volumetric.doublingTimeDays} days
                </p>
              </div>
            </div>

            <div className="mt-3 p-2.5 bg-cyan-950/30 border border-cyan-800/50 rounded-lg text-xs text-cyan-200">
              <span className="font-semibold text-cyan-300">Cross-Modal Significance:</span>{' '}
              {patient.crossAttentionFocalZone}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
