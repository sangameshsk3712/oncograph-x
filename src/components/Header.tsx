import { Dna, Brain, Network, Activity, BarChart3, Binary, Download, Award, Sparkles, Lock, Github } from 'lucide-react';
import { PatientCase } from '../types/oncology';

export type ActiveTab = 
  | 'workstation' 
  | 'mri_viewer' 
  | 'architecture' 
  | 'clonal_tracker' 
  | 'benchmark' 
  | 'pipeline' 
  | 'federated_learning'
  | 'code_colab' 
  | 'isef_defense';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  selectedPatient: PatientCase;
  setSelectedPatientId: (id: string) => void;
  patientCases: PatientCase[];
  onOpenVerification?: () => void;
  onOpenGitHubPublish?: () => void;
}

export const Header = ({
  activeTab,
  setActiveTab,
  selectedPatient,
  setSelectedPatientId,
  patientCases,
  onOpenVerification,
  onOpenGitHubPublish,
}: HeaderProps) => {
  const navItems = [
    { id: 'workstation', label: 'Patient Case', icon: Brain },
    { id: 'mri_viewer', label: '3D Voxel Multi-Slice', icon: Activity },
    { id: 'architecture', label: 'Novel Architecture', icon: Network },
    { id: 'clonal_tracker', label: 'Clonal Mutation Sim', icon: Dna },
    { id: 'benchmark', label: 'SOTA Benchmark & Ablation', icon: BarChart3 },
    { id: 'pipeline', label: 'Novel Pipeline & Imputation', icon: Binary },
    { id: 'federated_learning', label: 'Federated Node (ZK-HIPAA)', icon: Lock },
    { id: 'code_colab', label: 'PyTorch / Colab', icon: Download },
    { id: 'isef_defense', label: 'ISEF Research Deck', icon: Award },
  ] as const;

  return (
    <header className="border-b border-slate-800/80 bg-slate-950/90 backdrop-blur-md sticky top-0 z-50">
      {/* Top Bar: Identity, Patient Switcher & Clinical Context */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-cyan-950/80 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Network className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-semibold tracking-tight text-white">
                OncoGraph-X
              </h1>
              <span className="text-xs text-cyan-400 font-mono">v1.4 Multi-Modal</span>
              <span className="text-slate-600">·</span>
              <span className="text-xs text-slate-400">ISEF Grand Award Project Architecture</span>
            </div>
            <p className="text-xs text-slate-400">
              Genomic Graph Neural Network + 3D Volumetric Cross-Attention Transformer
            </p>
          </div>
        </div>

        {/* Patient / Disease Case Selector */}
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 w-full md:w-auto">
            <span className="text-xs text-slate-400 font-medium">Cohort Case:</span>
            <select
              value={selectedPatient.id}
              onChange={(e) => setSelectedPatientId(e.target.value)}
              className="bg-transparent text-xs text-cyan-300 font-medium focus:outline-none cursor-pointer"
            >
              {patientCases.map((c) => (
                <option key={c.id} value={c.id} className="bg-slate-900 text-white">
                  {c.tcgaBarcode} ({c.disease.includes('Glioblastoma') ? 'GBM' : 'PAAD'} · {c.tumorSubtype.split('/')[0].trim()})
                </option>
              ))}
            </select>
          </div>

          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-400 border-l border-slate-800 pl-3">
            <span>TCGA Verified</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-emerald-400">3D NIfTI + VCF</span>
          </div>

          {onOpenVerification && (
            <button
              onClick={onOpenVerification}
              className="flex items-center gap-1.5 bg-emerald-950/70 hover:bg-emerald-900/80 border border-emerald-500/40 text-emerald-300 text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              <span>Blueprint Checklist</span>
              <span className="bg-emerald-500 text-slate-950 px-1 rounded text-[10px] font-bold">100%</span>
            </button>
          )}

          {onOpenGitHubPublish && (
            <button
              onClick={onOpenGitHubPublish}
              className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-700 hover:border-cyan-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors whitespace-nowrap"
            >
              <Github className="w-3.5 h-3.5 text-cyan-400" />
              <span>Publish to GitHub</span>
            </button>
          )}
        </div>
      </div>

      {/* Primary Tab Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex overflow-x-auto no-scrollbar gap-1 border-t border-slate-800/40">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${
                isActive
                  ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`} />
              {item.label}
              {item.id === 'architecture' && (
                <span className="text-[10px] text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded border border-cyan-800">
                  Novel
                </span>
              )}
            </button>
          );
        })}
      </div>
    </header>
  );
};
