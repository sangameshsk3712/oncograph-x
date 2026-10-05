/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { PATIENT_CASES } from './data/clinicalDatasets';
import { PatientCase } from './types/oncology';
import { Header, ActiveTab } from './components/Header';
import { Workstation } from './components/Workstation';
import { MRIViewer } from './components/MRIViewer';
import { ArchitectureGraph } from './components/ArchitectureGraph';
import { ClonalEvolutionTracker } from './components/ClonalEvolutionTracker';
import { SOTABenchmark } from './components/SOTABenchmark';
import { PipelineSandbox } from './components/PipelineSandbox';
import { FederatedNodeView } from './components/FederatedNodeView';
import { ColabExporter } from './components/ColabExporter';
import { ISEFDeck } from './components/ISEFDeck';
import { BlueprintVerificationModal } from './components/BlueprintVerificationModal';
import { GitHubPublishModal } from './components/GitHubPublishModal';

export default function App() {
  const [patientCases, setPatientCases] = useState<PatientCase[]>(PATIENT_CASES);
  const [selectedPatientId, setSelectedPatientId] = useState<string>(PATIENT_CASES[0].id);
  const [activeTab, setActiveTab] = useState<ActiveTab>('workstation');
  const [isVerificationOpen, setIsVerificationOpen] = useState<boolean>(false);
  const [isGitHubOpen, setIsGitHubOpen] = useState<boolean>(false);

  const selectedPatient = patientCases.find((p) => p.id === selectedPatientId) || patientCases[0];

  const handleCustomPatientUpload = (customCase: PatientCase) => {
    setPatientCases((prev) => [customCase, ...prev]);
    setSelectedPatientId(customCase.id);
    setActiveTab('workstation');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col bg-grid-subtle">
      {/* Header and Global Navigation */}
      <Header
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        selectedPatient={selectedPatient}
        setSelectedPatientId={setSelectedPatientId}
        patientCases={patientCases}
        onOpenVerification={() => setIsVerificationOpen(true)}
        onOpenGitHubPublish={() => setIsGitHubOpen(true)}
      />

      {/* Blueprint Verification Modal */}
      <BlueprintVerificationModal
        isOpen={isVerificationOpen}
        onClose={() => setIsVerificationOpen(false)}
        setActiveTab={setActiveTab}
      />

      {/* GitHub 1-Click Publishing Modal */}
      <GitHubPublishModal
        isOpen={isGitHubOpen}
        onClose={() => setIsGitHubOpen(false)}
      />

      {/* Main Scientific Canvas */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'workstation' && (
          <Workstation
            patient={selectedPatient}
            setActiveTab={setActiveTab}
            onCustomPatientUpload={handleCustomPatientUpload}
          />
        )}

        {activeTab === 'mri_viewer' && (
          <MRIViewer patient={selectedPatient} />
        )}

        {activeTab === 'architecture' && (
          <ArchitectureGraph />
        )}

        {activeTab === 'clonal_tracker' && (
          <ClonalEvolutionTracker patient={selectedPatient} />
        )}

        {activeTab === 'benchmark' && (
          <SOTABenchmark />
        )}

        {activeTab === 'pipeline' && (
          <PipelineSandbox />
        )}

        {activeTab === 'federated_learning' && (
          <FederatedNodeView />
        )}

        {activeTab === 'code_colab' && (
          <ColabExporter />
        )}

        {activeTab === 'isef_defense' && (
          <ISEFDeck />
        )}
      </main>

      {/* Domain-Native Academic / Clinical Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-4 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-medium">OncoGraph-X Multi-Modal Research Platform</span>
            <span aria-hidden="true">·</span>
            <span>TCGA Clinical Cohort Repository</span>
          </div>

          <div className="flex items-center gap-3 text-[11px] text-slate-400">
            <span>Open Source PyTorch 2.4</span>
            <span aria-hidden="true">·</span>
            <span>Glioblastoma &amp; Pancreatic Cancer Project</span>
            <span aria-hidden="true">·</span>
            <span className="font-mono text-cyan-400">ISEF Grand Award Project Plan</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
