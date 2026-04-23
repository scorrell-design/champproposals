import { calculateEmployeeFICA, calculateSavingsRange, estimatePreTaxDeductions } from '@/features/proposal/engine';
import { ADMIN_FEE_ANNUAL } from '@/config/fica-rates';
import type { ParsedEmployeeRow, ProposalResult, TierResult, PaycheckComparison } from '@/features/proposal/types/proposal.types';
import type { BenefitsConfig, SocialSecurityConfig } from '@/features/proposal/types/proposal.types';
import { payPeriodsPerYear } from '@/utils/format';
import { getFederalMarginalRate } from '@/features/proposal/engine';
import { STATE_TAX_RATES } from '@/config/tax-rates';
import { FICA_RATES } from '@/config/fica-rates';

interface AnalyzerConfig {
  benefits: BenefitsConfig;
  socialSecurity: SocialSecurityConfig;
  payrollFrequency: 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';
}

export interface EmployeeResult {
  employee: ParsedEmployeeRow;
  preTaxDeduction: number;
  employerFICASavings: number;
  employeeTaxSavings: number;
  netImpact: number;
  isPositive: boolean;
  isQualified: boolean;
}

function getTierLevel(salary: number): string {
  if (salary < 35000) return 'entry';
  if (salary < 65000) return 'mid';
  if (salary < 100000) return 'senior';
  return 'executive';
}

export function analyzeEmployees(
  employees: ParsedEmployeeRow[],
  config: AnalyzerConfig,
): { result: ProposalResult; employeeResults: EmployeeResult[]; paycheckComparisons: PaycheckComparison[] } {
  const employeeResults: EmployeeResult[] = employees.map((emp) => {
    const ssExempt = Math.random() < (config.socialSecurity.exemptPercent / 100);
    const tierLevel = getTierLevel(emp.salary);

    let healthPremiumAnnual = 0;
    let retirementRate = 0;
    let hsaAnnual = 0;

    if (config.benefits.enabled) {
      if (config.benefits.health.enabled) {
        const premium = (config.benefits.health.premiums.medical.individual + config.benefits.health.premiums.medical.family) / 2;
        healthPremiumAnnual = premium * 12;
      }
      if (config.benefits.retirement.enabled) {
        retirementRate = 6;
      }
      if (config.benefits.hsa.enabled) {
        hsaAnnual = config.benefits.hsa.annualContribution;
      }
    }

    const preTaxDeduction = estimatePreTaxDeductions(emp.salary, tierLevel, {
      healthParticipation: config.benefits.enabled && config.benefits.health.enabled ? config.benefits.health.participationRate : 0,
      healthPremiumAnnual,
      retirementParticipation: config.benefits.enabled && config.benefits.retirement.enabled ? config.benefits.retirement.participationRate : 0,
      retirementRate,
      hsaParticipation: config.benefits.enabled && config.benefits.hsa.enabled ? config.benefits.hsa.participationRate : 0,
      hsaAnnual,
    });

    const result = calculateEmployeeFICA({
      salary: emp.salary,
      stateCode: emp.stateCode,
      filingStatus: emp.filingStatus,
      preTaxDeductions: preTaxDeduction,
      socialSecurityExempt: ssExempt,
      adminFeeAnnual: ADMIN_FEE_ANNUAL,
    });

    return {
      employee: emp,
      preTaxDeduction,
      employerFICASavings: result.employerFICASavings,
      employeeTaxSavings: result.employeeTaxSavings,
      netImpact: result.netEmployeeImpact,
      isPositive: result.isPositivelyImpacted,
      isQualified: result.isQualified,
    };
  });

  const totalEmployerSavings = employeeResults.reduce((s, r) => s + r.employerFICASavings, 0);
  const totalEmployeeSavings = employeeResults.reduce((s, r) => s + r.netImpact, 0);
  const qualifiedCount = employeeResults.filter((r) => r.isQualified).length;
  const positiveCount = employeeResults.filter((r) => r.isPositive).length;

  const salaryBuckets = bucketBySalary(employeeResults);
  const tierResults: TierResult[] = salaryBuckets.map((bucket) => ({
    tier: bucket.label,
    employeeCount: bucket.employees.length,
    avgSalary: avg(bucket.employees.map((e) => e.employee.salary)),
    avgPreTaxDeduction: avg(bucket.employees.map((e) => e.preTaxDeduction)),
    ficaSavingsPerEmployee: avg(bucket.employees.map((e) => e.employerFICASavings)),
    netImpactPerEmployee: avg(bucket.employees.map((e) => e.netImpact)),
  }));

  const savingsRange = calculateSavingsRange(totalEmployerSavings, 'informed_analysis');
  const avgEmployeeSavings = employees.length > 0 ? totalEmployeeSavings / employees.length : 0;

  const periods = payPeriodsPerYear(config.payrollFrequency);

  const paycheckComparisons: PaycheckComparison[] = tierResults.map((tier) => {
    const grossPay = tier.avgSalary / periods;
    const preTaxPerPay = tier.avgPreTaxDeduction / periods;

    const bucket = salaryBuckets.find((b) => b.label === tier.tier);
    const dominantState = bucket ? getMostCommonState(bucket.employees) : 'TX';
    const dominantFiling = bucket ? getMostCommonFiling(bucket.employees) : 'single' as const;

    const federalRate = getFederalMarginalRate(tier.avgSalary, dominantFiling);
    const stateRate = STATE_TAX_RATES[dominantState] ?? 0.05;
    const ficaRate = FICA_RATES.combined;

    const fedTaxBefore = grossPay * federalRate;
    const stateTaxBefore = grossPay * stateRate;
    const ficaBefore = grossPay * ficaRate;

    const taxableAfter = grossPay - preTaxPerPay;
    const fedTaxAfter = taxableAfter * federalRate;
    const stateTaxAfter = taxableAfter * stateRate;
    const ficaAfter = taxableAfter * ficaRate;

    const adminPerPay = ADMIN_FEE_ANNUAL / periods;
    const netBefore = grossPay - fedTaxBefore - stateTaxBefore - ficaBefore;
    const netAfter = grossPay - preTaxPerPay - fedTaxAfter - stateTaxAfter - ficaAfter - adminPerPay;

    const increase = netAfter - netBefore;

    return {
      tier: tier.tier,
      grossPay: Math.round(grossPay * 100) / 100,
      before: {
        federalTax: Math.round(fedTaxBefore * 100) / 100,
        stateTax: Math.round(stateTaxBefore * 100) / 100,
        fica: Math.round(ficaBefore * 100) / 100,
        postTaxDeductions: 0,
        netPay: Math.round(netBefore * 100) / 100,
      },
      withPlan: {
        preTaxDeduction: Math.round(preTaxPerPay * 100) / 100,
        federalTax: Math.round(fedTaxAfter * 100) / 100,
        stateTax: Math.round(stateTaxAfter * 100) / 100,
        fica: Math.round(ficaAfter * 100) / 100,
        postTaxDeductions: Math.round(adminPerPay * 100) / 100,
        netPay: Math.round(netAfter * 100) / 100,
      },
      perPaycheckIncrease: Math.round(increase * 100) / 100,
      annualIncrease: Math.round(increase * periods * 100) / 100,
    };
  });

  return {
    result: {
      employerAnnualFICASavings: Math.round(totalEmployerSavings),
      avgEmployeeAnnualSavings: Math.round(avgEmployeeSavings),
      qualifiedEmployees: qualifiedCount,
      totalEmployees: employees.length,
      positivelyImpactedCount: positiveCount,
      positivelyImpactedPercent: employees.length > 0 ? Math.round((positiveCount / employees.length) * 100) : 0,
      tierResults,
      savingsRange,
      netAnnualBenefit: Math.round(totalEmployerSavings - ADMIN_FEE_ANNUAL * employees.length),
      totalAdminFee: Math.round(ADMIN_FEE_ANNUAL * employees.length),
    },
    employeeResults,
    paycheckComparisons,
  };
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

interface SalaryBucket {
  label: string;
  employees: EmployeeResult[];
}

function bucketBySalary(results: EmployeeResult[]): SalaryBucket[] {
  const sorted = [...results].sort((a, b) => a.employee.salary - b.employee.salary);
  if (sorted.length <= 4) {
    return sorted.map((r) => ({ label: r.employee.name || 'Employee', employees: [r] }));
  }

  const quarterSize = Math.ceil(sorted.length / 4);
  return [
    { label: 'Entry / Part-Time', employees: sorted.slice(0, quarterSize) },
    { label: 'Mid-Level', employees: sorted.slice(quarterSize, quarterSize * 2) },
    { label: 'Senior', employees: sorted.slice(quarterSize * 2, quarterSize * 3) },
    { label: 'Executive', employees: sorted.slice(quarterSize * 3) },
  ].filter((b) => b.employees.length > 0);
}

function getMostCommonState(employees: EmployeeResult[]): string {
  const counts: Record<string, number> = {};
  for (const e of employees) {
    const st = e.employee.stateCode;
    counts[st] = (counts[st] || 0) + 1;
  }
  let best = 'TX';
  let bestCount = 0;
  for (const [st, c] of Object.entries(counts)) {
    if (c > bestCount) { best = st; bestCount = c; }
  }
  return best;
}

function getMostCommonFiling(employees: EmployeeResult[]): 'single' | 'married' | 'hoh' {
  const counts: Record<string, number> = { single: 0, married: 0, hoh: 0 };
  for (const e of employees) {
    counts[e.employee.filingStatus] = (counts[e.employee.filingStatus] || 0) + 1;
  }
  if (counts.married >= counts.single && counts.married >= counts.hoh) return 'married';
  if (counts.hoh > counts.single) return 'hoh';
  return 'single';
}
