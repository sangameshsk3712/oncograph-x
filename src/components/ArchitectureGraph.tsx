import { useState } from 'react';
import { NOVEL_ARCHITECTURE_NODES } from '../data/clinicalDatasets';
import { ArchitectureNode } from '../types/oncology';
import { Network, Cpu, ArrowDown, Activity, Sparkles, Sliders, ChevronRight } from 'lucide-react';

export const ArchitectureGraph = () => {
  const [selectedNode, setSelectedNode] = useState<ArchitectureNode>(NOVEL_ARCHITECTURE_NODES[3]); // Default to Cross-Modal Bridge
  const [lambdaClonal, setLambdaClonal] = useState<number>(0.5);
  const [lambdaAlign, setLambdaAlign] = useState<number>(0.3);
  const [lambdaVol, setLambdaVol] = useState<number>(0.2);

  // Compute synthetic dynamic multi-task loss based on weights
  const syntheticLoss = (
    lambdaClonal * 0.084 +
    lambdaAlign * 0.126 +
    lambdaVol * 0.042
  ).toFixed(4);

  const getBranchBadge = (branch: ArchitectureNode['branch']) => {
    switch (branch) {
      case 'imaging':
        return 'text-sky-400 bg-sky-950/60 border-sky-800';
      case 'genomic_graph':
        return 'text-emerald-400 bg-emerald-950/60 border-emerald-800';
      case 'sequence_transformer':
        return 'text-indigo-400 bg-indigo-950/60 border-indigo-800';
      case 'cross_attention':
        return 'text-amber-400 bg-amber-950/60 border-amber-800';
      case 'loss_function':
        return 'text-rose-400 bg-rose-950/60 border-rose-800';
      case 'output':
        return 'text-cyan-400 bg-cyan-950/60 border-cyan-800';
    }
  };

  return (
    <div className="space-y-8">
      {/* Overview Header */}
      <div className="border-b border-slate-800/80 pb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span>Novel Neural Architecture</span>
            <span aria-hidden="true">·</span>
            <span>Computational Oncology Breakthrough</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-cyan-400">Bi-Directional CAM-Bridge</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight mt-0.5">
            Multi-Modal Graph-Transformer Network Topology
          </h2>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-lg">
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span>Total Parameters: <strong className="text-white font-mono">48.5M</strong> (Low-Compute Optimized)</span>
        </div>
      </div>

      {/* Main Architecture Visual Pipeline Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Computational Graph Diagram */}
        <div className="lg:col-span-7 space-y-4">
          <div className="text-xs text-slate-400 font-medium flex items-center justify-between">
            <span>Interactive Computation Graph (Click any module to inspect mathematics)</span>
            <span className="text-slate-500 font-mono">Input: MRI/CT [3D] + VCF/FASTA + STRING-PPI</span>
          </div>

          {/* Level 1: Input Modalities (3 parallel encoders) */}
          <div className="grid grid-cols-3 gap-3">
            {/* 3D Imaging Branch */}
            <div
              onClick={() => setSelectedNode(NOVEL_ARCHITECTURE_NODES[0])}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                selectedNode.id === 'node-3d-voxel'
                  ? 'bg-sky-950/40 border-sky-400 ring-1 ring-sky-400/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="text-[11px] font-mono text-sky-400 mb-1">Branch A: Volumetric</div>
              <h4 className="text-xs font-semibold text-white">3D Swin-Voxel Encoder</h4>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">[Batch, 64, 512]</p>
            </div>

            {/* Protein-Protein Interaction Graph Branch */}
            <div
              onClick={() => setSelectedNode(NOVEL_ARCHITECTURE_NODES[1])}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                selectedNode.id === 'node-genomic-gnn'
                  ? 'bg-emerald-950/40 border-emerald-400 ring-1 ring-emerald-400/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="text-[11px] font-mono text-emerald-400 mb-1">Branch B: Molecular PPI</div>
              <h4 className="text-xs font-semibold text-white">GATv2 Graph Net</h4>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">[Batch, 128, 512]</p>
            </div>

            {/* Codon Sequence Transformer Branch */}
            <div
              onClick={() => setSelectedNode(NOVEL_ARCHITECTURE_NODES[2])}
              className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                selectedNode.id === 'node-sequence-trans'
                  ? 'bg-indigo-950/40 border-indigo-400 ring-1 ring-indigo-400/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="text-[11px] font-mono text-indigo-400 mb-1">Branch C: DNA/RNA Codons</div>
              <h4 className="text-xs font-semibold text-white">RoPE Codon Transformer</h4>
              <p className="text-[10px] text-slate-400 mt-1 font-mono">[Batch, 256, 512]</p>
            </div>
          </div>

          {/* Fusion Arrows */}
          <div className="flex justify-around text-slate-600 py-1">
            <ArrowDown className="w-4 h-4 text-sky-400/60" />
            <ArrowDown className="w-4 h-4 text-emerald-400/60" />
            <ArrowDown className="w-4 h-4 text-indigo-400/60" />
          </div>

          {/* Level 2: The Core Innovation: Bi-directional Cross-Attention Multi-Modal Bridge */}
          <div
            onClick={() => setSelectedNode(NOVEL_ARCHITECTURE_NODES[3])}
            className={`p-5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
              selectedNode.id === 'node-cross-modal-bridge'
                ? 'bg-amber-950/30 border-amber-400 ring-2 ring-amber-400/30'
                : 'bg-slate-900/80 border-amber-500/40 hover:border-amber-400'
            }`}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-300">
                Core Innovation · Cross-Attention Bridge (CAM-Bridge)
              </span>
              <span className="text-[10px] font-mono bg-amber-950 text-amber-300 border border-amber-800 px-2 py-0.5 rounded">
                Queries: 3D Voxel · Keys/Values: PPI + Codons
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Maps 3D microenvironmental imaging voxels directly to molecular protein interaction nodes and genetic codon sequences, learning which spatial tumor sub-regions foster resistant clones.
            </p>
            <div className="mt-3 flex items-center gap-4 text-xs font-mono text-slate-400">
              <span>Tensor Output: [B, 64, 512]</span>
              <span>·</span>
              <span>8-Head Cross Attention</span>
            </div>
          </div>

          {/* Arrow */}
          <div className="flex justify-center text-slate-600 py-1">
            <ArrowDown className="w-4 h-4 text-amber-400/60" />
          </div>

          {/* Level 3: Custom Loss Function & Joint Forecasting Head */}
          <div className="grid grid-cols-2 gap-3">
            <div
              onClick={() => setSelectedNode(NOVEL_ARCHITECTURE_NODES[4])}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedNode.id === 'node-loss-function'
                  ? 'bg-rose-950/40 border-rose-400 ring-1 ring-rose-400/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="text-[11px] font-mono text-rose-400 mb-1">Custom Objective</div>
              <h4 className="text-xs font-semibold text-white">Clonal Evolutionary Loss (CEL)</h4>
              <p className="text-[10px] text-slate-400 mt-1">Multi-task Earth Mover Distance + InfoNCE</p>
            </div>

            <div
              onClick={() => setSelectedNode(NOVEL_ARCHITECTURE_NODES[5])}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedNode.id === 'node-prediction-head'
                  ? 'bg-cyan-950/40 border-cyan-400 ring-1 ring-cyan-400/40'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className="text-[11px] font-mono text-cyan-400 mb-1">Clinical Forecaster</div>
              <h4 className="text-xs font-semibold text-white">Clonal Trajectory Head</h4>
              <p className="text-[10px] text-slate-400 mt-1">Day 0–360 VAF &amp; IC50 Shift Output</p>
            </div>
          </div>

          {/* Live Loss Hyperparameter Explorer */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 mt-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold text-white flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                Live Loss Function Weight Playground
              </h4>
              <span className="text-xs font-mono text-cyan-300">
                L_total = {syntheticLoss}
              </span>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400 w-44">λ1 (Clonal Drift W1):</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={lambdaClonal}
                  onChange={(e) => setLambdaClonal(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 accent-rose-400 cursor-pointer"
                />
                <span className="font-mono text-slate-300 w-10 text-right">{lambdaClonal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400 w-44">λ2 (Contrastive InfoNCE):</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={lambdaAlign}
                  onChange={(e) => setLambdaAlign(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 accent-amber-400 cursor-pointer"
                />
                <span className="font-mono text-slate-300 w-10 text-right">{lambdaAlign.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between gap-4">
                <span className="text-slate-400 w-44">λ3 (Volumetric 3D Dice):</span>
                <input
                  type="range"
                  min="0.1"
                  max="1.0"
                  step="0.05"
                  value={lambdaVol}
                  onChange={(e) => setLambdaVol(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 accent-sky-400 cursor-pointer"
                />
                <span className="font-mono text-slate-300 w-10 text-right">{lambdaVol.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Selected Node Deep Mathematical Specification */}
        <div className="lg:col-span-5 bg-slate-900/70 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <span className={`text-[11px] font-mono px-2 py-0.5 rounded border ${getBranchBadge(selectedNode.branch)}`}>
              {selectedNode.branch.toUpperCase().replace('_', ' ')}
            </span>
            <span className="text-xs text-slate-400 font-mono">{selectedNode.parameters}</span>
          </div>

          <div>
            <h3 className="text-base font-bold text-white tracking-tight">{selectedNode.title}</h3>
            <p className="text-xs text-slate-300 mt-1.5 leading-relaxed">{selectedNode.description}</p>
          </div>

          {/* Mathematical Equation Block */}
          <div className="bg-slate-950 border border-slate-800 rounded-lg p-3.5 space-y-1">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider">
              Mathematical Formulation
            </span>
            <div className="font-mono text-xs text-cyan-300 overflow-x-auto py-1">
              {selectedNode.mathEquation}
            </div>
          </div>

          {/* Tensor Dimensions */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg">
              <span className="text-slate-400 text-[11px]">Tensor Dimension</span>
              <p className="font-mono text-white mt-0.5">{selectedNode.tensorShape}</p>
            </div>
            <div className="p-2.5 bg-slate-950/60 border border-slate-800 rounded-lg">
              <span className="text-slate-400 text-[11px]">Optimization Target</span>
              <p className="font-mono text-emerald-400 mt-0.5">AdamW (lr=2e-4)</p>
            </div>
          </div>

          {/* Why Standard AI Fails / Novel Innovation */}
          <div className="p-3.5 bg-cyan-950/20 border border-cyan-800/40 rounded-lg text-xs space-y-1">
            <span className="font-semibold text-cyan-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              Novel Scientific Contribution (ISEF 1st Place Edge)
            </span>
            <p className="text-slate-300 leading-relaxed">{selectedNode.novelAspect}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
