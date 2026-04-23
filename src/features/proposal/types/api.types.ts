import type { TierResult, QuickProposalInputs, InformedAnalysisInputs } from './proposal.types';

export interface SaveProposalRequest {
  type: 'quick_proposal' | 'informed_analysis';
  companyName: string;
  employeeCount: number;
  generatedAt: string;
  projectedSavings: number;
  conservativeEstimate: number;
  optimalSavings: number;
  qualifiedEmployees: number;
  positivelyImpactedEmployees: number;
  positivelyImpactedPercent: number;
  avgEmployeeSavings: number;
  tierBreakdown: TierResult[];
  inputSnapshot: QuickProposalInputs | InformedAnalysisInputs;
  pdfBlob?: Blob;
}

export interface SaveProposalResponse {
  proposalId: string;
  savedAt: string;
  downloadUrl: string;
}

export interface GetGroupProposalsResponse {
  proposals: {
    proposalId: string;
    type: 'quick_proposal' | 'informed_analysis';
    companyName: string;
    generatedAt: string;
    projectedSavings: number;
    downloadUrl: string;
  }[];
}

export interface UploadCensusFileRequest {
  file: File;
  originalFileName: string;
}

export interface UploadCensusFileResponse {
  fileId: string;
  storedAt: string;
  downloadUrl: string;
}

export interface GetGroupRFCResponse {
  rfcId: string;
  status: 'pending' | 'submitted' | 'broker_approved' | 'admin_approved';
  companyName: string;
  fein: string;
  sicCode: string;
  effectiveDate: string;
  eligibility: {
    waitingPeriod: string;
    eligibleClasses: string;
    hoursPerWeek: number;
  };
  contacts: {
    primary: { name: string; email: string; phone: string };
    billing?: { name: string; email: string; phone: string };
  };
  payroll: {
    frequency: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';
    provider: string;
  };
  agentOfRecord: {
    name: string;
    agency: string;
    npn: string;
  };
}
