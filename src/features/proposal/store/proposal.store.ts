import { create } from 'zustand';
import type {
  CompanyInfo,
  StateDistribution,
  FilingStatusDistribution,
  SalaryTier,
  BenefitsConfig,
  IndustryPreset,
  ProposalResult,
} from '../types/proposal.types';
import { DEFAULT_FILING_STATUS } from '@/config/filing-status-defaults';

const DEFAULT_BENEFITS: BenefitsConfig = {
  enabled: false,
  healthcare: {
    enabled: true,
    medical: { participationRate: 75, premiums: { individual: 200, family: 775 } },
    dental: { participationRate: 75, premiums: { individual: 35, family: 85 } },
    vision: { participationRate: 75, premiums: { individual: 15, family: 40 } },
  },
  retirement: {
    enabled: false,
    participationRate: 60,
    contributionRates: { entry: 4, mid: 6, senior: 8, executive: 10 },
  },
  hsa: {
    enabled: false,
    participationRate: 30,
    annualContribution: 1500,
  },
};

export interface ProposalState {
  company: CompanyInfo;
  states: StateDistribution[];
  filingStatus: FilingStatusDistribution;
  industry: IndustryPreset | null;
  tierCount: 2 | 3 | 4 | 5;
  tiers: SalaryTier[];
  benefits: BenefitsConfig;
  result: ProposalResult | null;
  isCalculating: boolean;

  setCompany: (company: Partial<CompanyInfo>) => void;
  setStates: (states: StateDistribution[]) => void;
  setFilingStatus: (fs: FilingStatusDistribution) => void;
  setIndustry: (preset: IndustryPreset) => void;
  setTierCount: (count: 2 | 3 | 4 | 5) => void;
  setTiers: (tiers: SalaryTier[]) => void;
  updateTier: (index: number, tier: Partial<SalaryTier>) => void;
  setBenefits: (benefits: Partial<BenefitsConfig>) => void;
  setResult: (result: ProposalResult | null) => void;
  setIsCalculating: (val: boolean) => void;
  resetAll: () => void;
}

const INITIAL_COMPANY: CompanyInfo = {
  name: '',
  employeeCount: 0,
  payrollFrequency: 'biweekly',
};

export const useProposalStore = create<ProposalState>((set) => ({
  company: INITIAL_COMPANY,
  states: [],
  filingStatus: DEFAULT_FILING_STATUS,
  industry: null,
  tierCount: 4,
  tiers: [],
  benefits: DEFAULT_BENEFITS,
  result: null,
  isCalculating: false,

  setCompany: (company) =>
    set((s) => ({ company: { ...s.company, ...company } })),

  setStates: (states) => set({ states }),

  setFilingStatus: (filingStatus) => set({ filingStatus }),

  setIndustry: (preset) => set({ industry: preset }),

  setTierCount: (tierCount) => set({ tierCount }),

  setTiers: (tiers) => set({ tiers }),

  updateTier: (index, updates) =>
    set((s) => {
      const tiers = [...s.tiers];
      tiers[index] = { ...tiers[index], ...updates };
      return { tiers };
    }),

  setBenefits: (updates) =>
    set((s) => ({ benefits: { ...s.benefits, ...updates } })),

  setResult: (result) => set({ result }),

  setIsCalculating: (isCalculating) => set({ isCalculating }),

  resetAll: () =>
    set({
      company: INITIAL_COMPANY,
      states: [],
      filingStatus: DEFAULT_FILING_STATUS,
      industry: null,
      tierCount: 4,
      tiers: [],
      benefits: DEFAULT_BENEFITS,
      result: null,
      isCalculating: false,
    }),
}));
