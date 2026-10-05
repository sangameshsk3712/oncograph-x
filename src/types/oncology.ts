export type DiseaseType = 'Glioblastoma Multiforme (GBM)' | 'Pancreatic Ductal Adenocarcinoma (PAAD)';

export type AnatomicalPlane = 'axial' | 'sagittal' | 'coronal';
export type ScanSequence = 'T1-CE' | 'T2-FLAIR' | 'T1-Pre' | 'ADC-Diffusion';

export interface SomaticMutation {
  gene: string;
  variant: string;
  vaf: number; // Variant Allele Frequency (0 to 1)
  codonChange: string;
  functionalImpact: 'Activating Oncogene' | 'Loss of Function' | 'Dominant Negative' | 'Structural Inversion';
  pathogenicityScore: number; // 0 to 1
  resistanceAssociated: boolean;
  resistanceMechanism?: string;
}

export interface ClonalSubpopulation {
  id: string;
  name: string;
  color: string;
  driverMutations: string[];
  initialFrequency: number;
  projectedFrequencies: { day: number; frequency: number }[];
  resistanceProfile: {
    drug: string;
    sensitivity: 'Sensitive' | 'Partial Response' | 'Resistant';
    ic50ShiftFold: number;
  }[];
  emergentMutations?: { day: number; mutation: string; description: string }[];
}

export interface VolumetricMetrics {
  totalTumorVolumeCm3: number;
  enhancingMarginCm3: number;
  necroticCoreCm3: number;
  peritumoralEdemaCm3: number;
  doublingTimeDays: number;
  perfusionKtrans: number; // Vascular permeability constant
  apparentDiffusionCoefficient: number; // Cellular density marker
}

export interface PatientCase {
  id: string;
  tcgaBarcode: string;
  disease: DiseaseType;
  tumorSubtype: string;
  age: number;
  gender: 'Male' | 'Female';
  karnofskyScore: number;
  primaryTherapy: string;
  mutations: SomaticMutation[];
  volumetric: VolumetricMetrics;
  clones: ClonalSubpopulation[];
  clinicalSummary: string;
  dnaSequenceSnippet: string;
  crossAttentionFocalZone: string;
}

export interface BenchmarkModel {
  name: string;
  type: string;
  modality: 'Imaging Only' | 'Genomic Only' | 'Late Fusion' | 'OncoGraph-X Novel';
  f1Score: number;
  aucRoc: number;
  mutationDriftMse: number;
  recurrenceLeadTimeMonths: number;
  gflops: number;
  parametersMillions: number;
  inferenceLatencyMs: number;
  isNovelArchitecture?: boolean;
}

export interface ArchitectureNode {
  id: string;
  title: string;
  branch: 'imaging' | 'genomic_graph' | 'sequence_transformer' | 'cross_attention' | 'loss_function' | 'output';
  tensorShape: string;
  description: string;
  mathEquation: string;
  novelAspect: string;
  parameters: string;
}
