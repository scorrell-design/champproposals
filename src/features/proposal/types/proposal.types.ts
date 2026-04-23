export interface CompanyInfo {
  name: string;
  employeeCount: number;
  payrollFrequency: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';
}

export interface StateDistribution {
  stateCode: string;
  stateName: string;
  stateTaxRate: number;
  workforcePercent: number;
}

export interface FilingStatusDistribution {
  single: number;
  married: number;
  headOfHousehold: number;
}

export interface SalaryTier {
  level: 'entry' | 'mid' | 'senior' | 'executive';
  label: string;
  salaryMin: number;
  salaryMax: number;
  workforcePercent: number;
  includePartTime?: boolean;
  partTimeCount?: number;
  partTimeAvgHours?: number;
}

export interface SocialSecurityConfig {
  exemptPercent: number;
}

export interface BenefitsConfig {
  enabled: boolean;
  health: {
    enabled: boolean;
    participationRate: number;
    premiums: {
      medical: { individual: number; family: number };
      dental: { individual: number; family: number };
      vision: { individual: number; family: number };
    };
  };
  retirement: {
    enabled: boolean;
    participationRate: number;
    contributionRates: {
      entry: number;
      mid: number;
      senior: number;
      executive: number;
    };
  };
  hsa: {
    enabled: boolean;
    participationRate: number;
    annualContribution: number;
  };
  dental: {
    enabled: boolean;
    participationRate: number;
    premiums: { individual: number; family: number };
  };
  vision: {
    enabled: boolean;
    participationRate: number;
    premiums: { individual: number; family: number };
  };
}

export type IndustryPreset =
  | 'education' | 'finance' | 'healthcare' | 'manufacturing'
  | 'restaurant' | 'retail' | 'technology' | 'custom';

export interface QuickProposalInputs {
  company: CompanyInfo;
  states: StateDistribution[];
  filingStatus: FilingStatusDistribution;
  industry: IndustryPreset | null;
  tierCount: 2 | 3 | 4 | 5;
  tiers: SalaryTier[];
  socialSecurity: SocialSecurityConfig;
  benefits: BenefitsConfig;
}

export interface InformedAnalysisInputs {
  company: CompanyInfo;
  fileId: string;
  columnMapping: Record<string, string>;
  employeeRows: ParsedEmployeeRow[];
  socialSecurity: SocialSecurityConfig;
  benefits: BenefitsConfig;
}

export interface ParsedEmployeeRow {
  employeeId: string;
  name: string;
  salary: number;
  filingStatus: 'single' | 'married' | 'hoh';
  stateCode: string;
  employmentStatus: 'full_time' | 'part_time';
  hireDate?: string;
  dob?: string;
}

export interface ProposalResult {
  employerAnnualFICASavings: number;
  avgEmployeeAnnualSavings: number;
  qualifiedEmployees: number;
  totalEmployees: number;
  positivelyImpactedCount: number;
  positivelyImpactedPercent: number;
  tierResults: TierResult[];
  savingsRange: SavingsRange;
  netAnnualBenefit: number;
  totalAdminFee: number;
}

export interface TierResult {
  tier: string;
  employeeCount: number;
  avgSalary: number;
  avgPreTaxDeduction: number;
  ficaSavingsPerEmployee: number;
  netImpactPerEmployee: number;
}

export interface RangeFactor {
  name: string;
  description: string;
  conservativeImpact: number;
  optimalImpact: number;
  weight: number;
}

export interface SavingsRange {
  conservative: number;
  projected: number;
  optimal: number;
  factors?: RangeFactor[];
}

export interface PaycheckComparison {
  tier: string;
  grossPay: number;
  before: {
    federalTax: number;
    stateTax: number;
    fica: number;
    postTaxDeductions: number;
    netPay: number;
  };
  withPlan: {
    preTaxDeduction: number;
    federalTax: number;
    stateTax: number;
    fica: number;
    postTaxDeductions: number;
    netPay: number;
  };
  perPaycheckIncrease: number;
  annualIncrease: number;
}
