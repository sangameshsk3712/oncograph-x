import { useState } from 'react';
import { PatientCase } from '../types/oncology';
import { ActiveTab } from './Header';
import { Activity, Dna, FileText, Brain, Sparkles, AlertTriangle, ArrowRight, Upload, CheckCircle2, MessageSquare, Send } from 'lucide-react';

interface WorkstationProps {
  patient: PatientCase;
  setActiveTab: (tab: ActiveTab) => void;
  onCustomPatientUpload: (customCase: PatientCase) => void;
}

export const Workstation = ({ patient, setActiveTab, onCustomPatientUpload }: WorkstationProps) => {
  const [aiAnalysis, setAiAnalysis] = useState<any>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [chatMessage, setChatMessage] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<{ sender: 'user' | 'ai'; text: string }[]>([]);
  const [isChatting, setIsChatting] = useState<boolean>(false);
  const [showUploadModal, setShowUploadModal] = useState<boolean>(false);

  // Upload Form state
  const [uploadBarcode, setUploadBarcode] = useState<string>('PATIENT-CUSTOM-01');
  const [uploadDisease, setUploadDisease] = useState<'Glioblastoma Multiforme (GBM)' | 'Pancreatic Ductal Adenocarcinoma (PAAD)'>('Glioblastoma Multiforme (GBM)');
  const [uploadSubtype, setUploadSubtype] = useState<string>('Mesenchymal / NF1-Mutated');
  const [uploadDriverGene, setUploadDriverGene] = useState<string>('NF1 (p.R440*)');

  // Trigger Gemini Deep Multi-Modal Analysis
  const runAiAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const res = await fetch('/api/analyze-case', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientId: patient.id,
          disease: patient.disease,
          tumorSubtype: patient.tumorSubtype,
          mutations: patient.mutations,
          volumetricMetrics: patient.volumetric,
          currentRegimen: patient.primaryTherapy,
        }),
      });
      const data = await res.json();
      if (data.analysis) {
        setAiAnalysis(data.analysis);
      }
    } catch (err) {
      console.error('Error fetching analysis:', err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Tumor Board Chat with Gemini
  const handleSendChat = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim() || isChatting) return;

    const userMsg = chatMessage.trim();
    setChatMessage('');
    const newHistory = [...chatHistory, { sender: 'user' as const, text: userMsg }];
    setChatHistory(newHistory);
    setIsChatting(true);

    try {
      const res = await fetch('/api/chat-tumor-board', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          question: userMsg,
          patientContext: patient,
          history: newHistory,
        }),
      });
      const data = await res.json();
      setChatHistory([...newHistory, { sender: 'ai' as const, text: data.reply || 'Consultation processed.' }]);
    } catch (err) {
      setChatHistory([...newHistory, { sender: 'ai' as const, text: 'Unable to communicate with Tumor Board Copilot.' }]);
    } finally {
      setIsChatting(false);
    }
  };

  const handleCustomUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newCustomCase: PatientCase = {
      id: `custom-${Date.now()}`,
      tcgaBarcode: uploadBarcode,
      disease: uploadDisease,
      tumorSubtype: uploadSubtype,
      age: 62,
      gender: 'Male',
      karnofskyScore: 80,
      primaryTherapy: 'Standard of Care Protocol (Radiation + Alkylating Agent)',
      clinicalSummary: `Doctor-uploaded multi-modal case with confirmed ${uploadDriverGene} driver and volumetric enhancement.`,
      dnaSequenceSnippet: 'ATGGCGCCCAGCGCCCTCGGCTGAGGT...[Novel Ingested Reads]...AAGCTGCGCAACTACCTG',
      crossAttentionFocalZone: 'Interface of contrast hyperperfusion and necrotic boundary',
      volumetric: {
        totalTumorVolumeCm3: 44.5,
        enhancingMarginCm3: 21.0,
        necroticCoreCm3: 11.2,
        peritumoralEdemaCm3: 12.3,
        doublingTimeDays: 28.0,
        perfusionKtrans: 0.22,
        apparentDiffusionCoefficient: 0.95,
      },
      mutations: [
        {
          gene: uploadDriverGene.split(' ')[0],
          variant: uploadDriverGene,
          vaf: 0.58,
          codonChange: 'Somatic Alteration',
          functionalImpact: 'Activating Oncogene',
          pathogenicityScore: 0.96,
          resistanceAssociated: true,
          resistanceMechanism: 'Downstream MAPK / PI3K reactivation under monotherapy',
        },
      ],
      clones: [
        {
          id: 'clone-custom-1',
          name: 'Primary Neoplastic Trunk',
          color: '#38bdf8',
          driverMutations: [uploadDriverGene],
          initialFrequency: 0.78,
          projectedFrequencies: [
            { day: 0, frequency: 0.78 },
            { day: 30, frequency: 0.60 },
            { day: 90, frequency: 0.35 },
            { day: 180, frequency: 0.15 },
            { day: 270, frequency: 0.08 },
            { day: 360, frequency: 0.04 },
          ],
          resistanceProfile: [
            { drug: 'First-Line Therapy', sensitivity: 'Sensitive', ic50ShiftFold: 1.0 },
          ],
        },
        {
          id: 'clone-custom-2',
          name: 'Emergent Resistance Subclone (Bypass Loop)',
          color: '#f43f5e',
          driverMutations: ['Secondary Resistance Allele'],
          initialFrequency: 0.22,
          projectedFrequencies: [
            { day: 0, frequency: 0.22 },
            { day: 30, frequency: 0.40 },
            { day: 90, frequency: 0.65 },
            { day: 180, frequency: 0.85 },
            { day: 270, frequency: 0.92 },
            { day: 360, frequency: 0.96 },
          ],
          emergentMutations: [
            { day: 90, mutation: 'Bypass Kinase Amplification', description: 'Resistance emergence' },
          ],
          resistanceProfile: [
            { drug: 'First-Line Therapy', sensitivity: 'Resistant', ic50ShiftFold: 8.5 },
            { drug: 'Predicted Dual Inhibitor', sensitivity: 'Sensitive', ic50ShiftFold: 0.9 },
          ],
        },
      ],
    };

    onCustomPatientUpload(newCustomCase);
    setShowUploadModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Patient Master Banner */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-1">
            <span className="font-mono text-cyan-400 font-bold">{patient.tcgaBarcode}</span>
            <span aria-hidden="true">·</span>
            <span>{patient.disease}</span>
            <span aria-hidden="true">·</span>
            <span>{patient.age}y / {patient.gender}</span>
            <span aria-hidden="true">·</span>
            <span>Karnofsky PS: {patient.karnofskyScore}%</span>
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">{patient.tumorSubtype}</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-3xl leading-relaxed">{patient.clinicalSummary}</p>
        </div>

        <div className="flex items-center gap-2 w-full lg:w-auto">
          <button
            onClick={() => setShowUploadModal(true)}
            className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2 rounded-lg border border-slate-700 transition-colors"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Upload Patient Files</span>
          </button>

          <button
            onClick={runAiAnalysis}
            disabled={isAnalyzing}
            className="flex items-center gap-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-all shadow-md shadow-cyan-900/30"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isAnalyzing ? 'Evaluating Case...' : 'AI Tumor Board Analysis'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Genomic Alterations & Volumetric Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Somatic Driver Mutations */}
        <div className="lg:col-span-7 bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Dna className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold text-white">Somatic Genomic Drivers &amp; Variant Allele Frequency</h3>
            </div>
            <span className="text-xs text-slate-400 font-mono">Whole-Exome NGS</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-mono">
                  <th className="py-2 pr-3">Gene</th>
                  <th className="py-2 px-3">Variant</th>
                  <th className="py-2 px-3">VAF (%)</th>
                  <th className="py-2 px-3">Functional Impact</th>
                  <th className="py-2 pl-3 text-right">Escape Association</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {patient.mutations.map((m) => (
                  <tr key={m.gene} className="hover:bg-slate-800/30">
                    <td className="py-2.5 pr-3 font-bold text-cyan-300 font-sans">{m.gene}</td>
                    <td className="py-2.5 px-3 text-slate-300">{m.variant}</td>
                    <td className="py-2.5 px-3 font-bold text-white">{(m.vaf * 100).toFixed(0)}%</td>
                    <td className="py-2.5 px-3 text-slate-400 font-sans text-[11px]">{m.functionalImpact}</td>
                    <td className="py-2.5 pl-3 text-right">
                      {m.resistanceAssociated ? (
                        <span className="text-rose-400 font-sans font-medium text-[11px] inline-flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          Escape Driver
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-sans text-[11px]">Primary Trunk</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* FASTA Snippet */}
          <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 space-y-1">
            <span className="text-[10px] text-slate-400 font-mono uppercase">Target Exon Sequence Excerpt:</span>
            <p className="text-[11px] font-mono text-cyan-300 truncate">{patient.dnaSequenceSnippet}</p>
          </div>
        </div>

        {/* Right: Volumetric Quick Glance & Navigation CTAs */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-semibold text-white">3D Volumetric Imaging Correlates</h3>
              </div>
              <button
                onClick={() => setActiveTab('mri_viewer')}
                className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
              >
                <span>Open Multi-Slice</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400">Total Volume</span>
                <p className="text-lg font-bold font-mono text-cyan-300 mt-0.5">{patient.volumetric.totalTumorVolumeCm3} cm³</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400">Enhancing Rim</span>
                <p className="text-lg font-bold font-mono text-rose-400 mt-0.5">{patient.volumetric.enhancingMarginCm3} cm³</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400">Peritumoral Edema</span>
                <p className="text-lg font-bold font-mono text-emerald-400 mt-0.5">{patient.volumetric.peritumoralEdemaCm3} cm³</p>
              </div>
              <div className="p-3 bg-slate-950 rounded-lg border border-slate-800">
                <span className="text-slate-400">Doubling Time</span>
                <p className="text-lg font-bold font-mono text-amber-400 mt-0.5">{patient.volumetric.doublingTimeDays} days</p>
              </div>
            </div>

            <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-lg text-xs space-y-1">
              <span className="font-semibold text-cyan-300">Cross-Attention Focus:</span>
              <p className="text-slate-300">{patient.crossAttentionFocalZone}</p>
            </div>
          </div>

          {/* Quick CTA to Clonal Simulator */}
          <div
            onClick={() => setActiveTab('clonal_tracker')}
            className="bg-gradient-to-r from-cyan-950/40 to-slate-900 border border-cyan-800/40 hover:border-cyan-500 rounded-xl p-4 flex items-center justify-between cursor-pointer transition-all group"
          >
            <div>
              <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                <Dna className="w-3.5 h-3.5 text-cyan-400" />
                Forecast Clonal Mutation Drift (360 Days)
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Simulate drug resistance escape and test preemptive combination regimens.
              </p>
            </div>
            <ArrowRight className="w-4 h-4 text-cyan-400 group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </div>

      {/* AI Molecular Tumor Board Analysis Card */}
      {aiAnalysis && (
        <div className="bg-slate-900/80 border border-cyan-500/40 rounded-xl p-5 space-y-4 shadow-xl shadow-cyan-950/20">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white">AI Molecular Tumor Board Recommendation</h3>
            </div>
            <span className="text-[10px] font-mono text-cyan-400 bg-cyan-950 border border-cyan-800 px-2 py-0.5 rounded">
              Gemini 3.8 Flash Powered
            </span>
          </div>

          <p className="text-xs text-slate-200 leading-relaxed font-medium">{aiAnalysis.summary}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
              <span className="font-semibold text-rose-300">Clonal Escape Risk &amp; Timeline:</span>
              <p className="text-slate-300 leading-relaxed">{aiAnalysis.clonalEscapeRisk}</p>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-1">
              <span className="font-semibold text-cyan-300">Multi-Modal Mechanistic Pathway:</span>
              <p className="text-slate-300 leading-relaxed">{aiAnalysis.mechanisticPathway}</p>
            </div>
          </div>

          {aiAnalysis.suggestedCombinations && (
            <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-lg text-xs space-y-2">
              <span className="font-semibold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Actionable Multi-Target Preemptive Recommendations:
              </span>
              <ul className="list-disc pl-5 space-y-1 text-slate-300">
                {aiAnalysis.suggestedCombinations.map((combo: string, i: number) => (
                  <li key={i}>{combo}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Interactive Oncologist Tumor Board Chat */}
      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Ask OncoGraph-X Tumor Board Copilot</h3>
          </div>
          <span className="text-xs text-slate-400">Contextual Clinical Inquiry</span>
        </div>

        {/* Quick prompt templates */}
        <div className="flex flex-wrap gap-2 text-xs">
          {[
            'Why did the model predict resistance to standard therapy?',
            'What secondary mutation is most prone to emerge?',
            'What is the synthetic lethality strategy here?',
          ].map((promptText) => (
            <button
              key={promptText}
              onClick={() => setChatMessage(promptText)}
              className="text-[11px] bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 hover:border-slate-700 px-2.5 py-1 rounded transition-colors text-left"
            >
              {promptText}
            </button>
          ))}
        </div>

        {/* Chat message history */}
        {chatHistory.length > 0 && (
          <div className="space-y-3 max-h-60 overflow-y-auto pr-2 text-xs">
            {chatHistory.map((item, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-lg leading-relaxed ${
                  item.sender === 'user'
                    ? 'bg-cyan-950/40 text-cyan-100 border border-cyan-800/50 ml-6'
                    : 'bg-slate-950 text-slate-200 border border-slate-800 mr-6'
                }`}
              >
                <span className="text-[10px] font-mono font-bold block mb-1 text-slate-400">
                  {item.sender === 'user' ? 'Oncologist' : 'OncoGraph-X Copilot (Gemini)'}
                </span>
                <p className="whitespace-pre-line">{item.text}</p>
              </div>
            ))}
          </div>
        )}

        {/* Chat Input */}
        <form onSubmit={handleSendChat} className="flex gap-2">
          <input
            type="text"
            value={chatMessage}
            onChange={(e) => setChatMessage(e.target.value)}
            placeholder="Ask a scientific or clinical question about this patient case..."
            className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <button
            type="submit"
            disabled={isChatting || !chatMessage.trim()}
            className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-white text-xs px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1.5 font-medium"
          >
            <Send className="w-3.5 h-3.5" />
            <span>{isChatting ? 'Consulting...' : 'Ask Copilot'}</span>
          </button>
        </form>
      </div>

      {/* Upload Custom Patient Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Upload className="w-4 h-4 text-cyan-400" />
                Upload Custom Patient Multi-Modal Package
              </h3>
              <button
                onClick={() => setShowUploadModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCustomUploadSubmit} className="space-y-4 text-xs">
              <div>
                <label className="text-slate-300 font-medium block mb-1">Patient ID / Barcode:</label>
                <input
                  type="text"
                  value={uploadBarcode}
                  onChange={(e) => setUploadBarcode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Target Malignancy:</label>
                <select
                  value={uploadDisease}
                  onChange={(e) => setUploadDisease(e.target.value as any)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-white"
                >
                  <option value="Glioblastoma Multiforme (GBM)">Glioblastoma Multiforme (GBM)</option>
                  <option value="Pancreatic Ductal Adenocarcinoma (PAAD)">Pancreatic Ductal Adenocarcinoma (PAAD)</option>
                </select>
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Histopathological Subtype:</label>
                <input
                  type="text"
                  value={uploadSubtype}
                  onChange={(e) => setUploadSubtype(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-white"
                  required
                />
              </div>

              <div>
                <label className="text-slate-300 font-medium block mb-1">Primary Somatic Driver Mutation:</label>
                <input
                  type="text"
                  value={uploadDriverGene}
                  onChange={(e) => setUploadDriverGene(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-white"
                  required
                />
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded text-[11px] text-slate-400 space-y-1">
                <span>Multi-Modal Pipeline Emulation:</span>
                <p>Accepts 3D NIfTI (.nii.gz) files &amp; somatic VCF files. Our server automatically constructs the GNN topology and 3D voxel patches.</p>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowUploadModal(false)}
                  className="px-3 py-1.5 rounded text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-cyan-600 hover:bg-cyan-500 text-white font-medium px-4 py-1.5 rounded transition-colors"
                >
                  Ingest &amp; Analyze Case
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
