import { FICA_RATES, ADMIN_FEE_ANNUAL } from '@/config/fica-rates';
import { STATE_TAX_RATES } from '@/config/tax-rates';
import type { FICAInput, FICAOutput } from '../types/calculation.types';

const FEDERAL_BRACKETS_SINGLE = [
  { max: 11600, rate: 0.10 },
  { max: 47150, rate: 0.12 },
  { max: 100525, rate: 0.22 },
  { max: 191950, rate: 0.24 },
  { max: 243725, rate: 0.32 },
  { max: 609350, rate: 0.35 },
  { max: Infinity, rate: 0.37 },
];

const FEDERAL_BRACKETS_MARRIED = [
  { max: 23200, rate: 0.10 },
  { max: 94300, rate: 0.12 },
  { max: 201050, rate: 0.22 },
  { max: 383900, rate: 0.24 },
  { max: 487450, rate: 0.32 },
  { max: 731200, rate: 0.35 },
  { max: Infinity, rate: 0.37 },
];

const FEDERAL_BRACKETS_HOH = [
  { max: 16550, rate: 0.10 },
  { max: 63100, rate: 0.12 },
  { max: 100500, rate: 0.22 },
  { max: 191950, rate: 0.24 },
  { max: 243700, rate: 0.32 },
  { max: 609350, rate: 0.35 },
  { max: Infinity, rate: 0.37 },
];

export function getFederalMarginalRate(salary: number, filingStatus: 'single' | 'married' | 'hoh'): number {
  const brackets = filingStatus === 'married'
    ? FEDERAL_BRACKETS_MARRIED
    : filingStatus === 'hoh'
      ? FEDERAL_BRACKETS_HOH
      : FEDERAL_BRACKETS_SINGLE;

  for (const bracket of brackets) {
    if (salary <= bracket.max) return bracket.rate;
  }
  return 0.37;
}

export function calculateEmployeeFICA(input: FICAInput): FICAOutput {
  const ficaRate = FICA_RATES.combined;

  const employerFICASavings = input.preTaxDeductions * ficaRate;

  const stateTaxRate = STATE_TAX_RATES[input.stateCode] ?? 0;
  const federalRate = getFederalMarginalRate(input.salary, input.filingStatus);
  const combinedTaxRate = federalRate + stateTaxRate + ficaRate;
  const employeeTaxSavings = input.preTaxDeductions * combinedTaxRate;

  const netEmployeeImpact = employeeTaxSavings - input.adminFeeAnnual;

  return {
    employerFICASavings,
    employeeTaxSavings,
    netEmployeeImpact,
    isPositivelyImpacted: netEmployeeImpact > 0,
    isQualified: input.preTaxDeductions > 0 && input.salary > 0,
  };
}

export function estimatePreTaxDeductions(
  salary: number,
  tierLevel: string,
  benefits: {
    healthParticipation: number;
    healthPremiumAnnual: number;
    retirementParticipation: number;
    retirementRate: number;
    hsaParticipation: number;
    hsaAnnual: number;
  }
): number {
  let total = 0;

  const healthChance = benefits.healthParticipation / 100;
  total += benefits.healthPremiumAnnual * healthChance;

  const retirementChance = benefits.retirementParticipation / 100;
  total += salary * (benefits.retirementRate / 100) * retirementChance;

  const hsaChance = benefits.hsaParticipation / 100;
  total += benefits.hsaAnnual * hsaChance;

  if (total === 0) {
    const defaultDeductionRates: Record<string, number> = {
      entry: 0.08,
      mid: 0.10,
      senior: 0.12,
      executive: 0.14,
    };
    total = salary * (defaultDeductionRates[tierLevel] ?? 0.10);
  }

  return total;
}

export function calculateTierResult(
  tierLabel: string,
  employeeCount: number,
  avgSalary: number,
  stateDistribution: { stateCode: string; percent: number }[],
  filingDistribution: { single: number; married: number; headOfHousehold: number },
  preTaxDeduction: number,
): {
  ficaSavingsPerEmployee: number;
  netImpactPerEmployee: number;
  totalEmployerSavings: number;
  qualifiedCount: number;
  positiveCount: number;
} {
  let totalEmployerSavings = 0;
  let totalEmployeeSavings = 0;
  let qualifiedCount = 0;
  let positiveCount = 0;

  const filingStatuses: { status: 'single' | 'married' | 'hoh'; pct: number }[] = [
    { status: 'single', pct: filingDistribution.single / 100 },
    { status: 'married', pct: filingDistribution.married / 100 },
    { status: 'hoh', pct: filingDistribution.headOfHousehold / 100 },
  ];

  for (const state of stateDistribution) {
    const statePct = state.percent / 100;
    for (const filing of filingStatuses) {
      const segmentPct = statePct * filing.pct;
      const segmentCount = employeeCount * segmentPct;
      if (segmentCount < 0.01) continue;

      const result = calculateEmployeeFICA({
        salary: avgSalary,
        stateCode: state.stateCode,
        filingStatus: filing.status,
        preTaxDeductions: preTaxDeduction,
        adminFeeAnnual: ADMIN_FEE_ANNUAL,
      });

      totalEmployerSavings += result.employerFICASavings * segmentCount;
      totalEmployeeSavings += result.employeeTaxSavings * segmentCount;
      if (result.isQualified) qualifiedCount += segmentCount;
      if (result.isPositivelyImpacted) positiveCount += segmentCount;
    }
  }

  const ficaSavingsPerEmployee = employeeCount > 0 ? totalEmployerSavings / employeeCount : 0;
  const netImpactPerEmployee = employeeCount > 0
    ? (totalEmployeeSavings / employeeCount) - ADMIN_FEE_ANNUAL
    : 0;

  return {
    ficaSavingsPerEmployee,
    netImpactPerEmployee,
    totalEmployerSavings,
    qualifiedCount: Math.round(qualifiedCount),
    positiveCount: Math.round(positiveCount),
  };
}
