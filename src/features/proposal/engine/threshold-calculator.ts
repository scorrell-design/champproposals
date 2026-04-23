import { FICA_RATES, ADMIN_FEE_ANNUAL } from '@/config/fica-rates';
import { STATE_TAX_RATES } from '@/config/tax-rates';
import { getFederalMarginalRate } from './fica-calculator';

/**
 * Calculates the minimum pre-tax deduction needed for an employee
 * to see a net positive impact (tax savings > admin fee).
 */
export function getMinimumDeductionForPositiveImpact(
  stateCode: string,
  filingStatus: 'single' | 'married' | 'hoh',
  socialSecurityExempt: boolean = false,
  salary: number = 50000,
): number {
  const ssRate = socialSecurityExempt ? 0 : FICA_RATES.socialSecurity;
  const ficaRate = ssRate + FICA_RATES.medicare;
  const stateTaxRate = STATE_TAX_RATES[stateCode] ?? 0;
  const federalRate = getFederalMarginalRate(salary, filingStatus);
  const combinedRate = federalRate + stateTaxRate + ficaRate;

  if (combinedRate <= 0) return Infinity;
  return ADMIN_FEE_ANNUAL / combinedRate;
}

/**
 * Calculates the minimum salary at which a given deduction rate
 * yields a positive impact after admin fees.
 */
export function getMinimumSalaryThreshold(
  stateCode: string,
  filingStatus: 'single' | 'married' | 'hoh',
  deductionRateOfSalary: number = 0.10,
  socialSecurityExempt: boolean = false,
): number {
  const ssRate = socialSecurityExempt ? 0 : FICA_RATES.socialSecurity;
  const ficaRate = ssRate + FICA_RATES.medicare;
  const stateTaxRate = STATE_TAX_RATES[stateCode] ?? 0;
  const federalRate = getFederalMarginalRate(30000, filingStatus);
  const combinedRate = federalRate + stateTaxRate + ficaRate;

  if (combinedRate * deductionRateOfSalary <= 0) return Infinity;
  return ADMIN_FEE_ANNUAL / (combinedRate * deductionRateOfSalary);
}
