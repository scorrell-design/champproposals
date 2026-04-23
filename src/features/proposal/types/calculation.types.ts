export interface FICAInput {
  salary: number;
  stateCode: string;
  filingStatus: 'single' | 'married' | 'hoh';
  preTaxDeductions: number;
  adminFeeAnnual: number;
}

export interface FICAOutput {
  employerFICASavings: number;
  employeeTaxSavings: number;
  netEmployeeImpact: number;
  isPositivelyImpacted: boolean;
  isQualified: boolean;
}

export interface TierCalculationInput {
  tier: {
    level: string;
    label: string;
    salaryMin: number;
    salaryMax: number;
    workforcePercent: number;
  };
  totalEmployees: number;
  stateDistribution: { stateCode: string; percent: number }[];
  filingDistribution: { single: number; married: number; headOfHousehold: number };
  benefitsDeductionPerEmployee: number;
  adminFeeAnnual: number;
}

export interface AggregatedResult {
  totalEmployerSavings: number;
  totalEmployeeSavings: number;
  totalQualified: number;
  totalPositivelyImpacted: number;
  avgEmployeeSavings: number;
}
