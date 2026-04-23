import { FICA_RATES, ADMIN_FEE_ANNUAL } from '@/config/fica-rates';
import { STATE_TAX_RATES } from '@/config/tax-rates';
import { getFederalMarginalRate } from './fica-calculator';

export function getMinimumDeductionForPositiveImpact(
  stateCode: string,
  filingStatus: 'single' | 'married' | 'hoh',
  salary: number = 50000,
): number {
  const ficaRate = FICA_RATES.combined;
  const stateTaxRate = STATE_TAX_RATES[stateCode] ?? 0;
  const federalRate = getFederalMarginalRate(salary, filingStatus);
  const combinedRate = federalRate + stateTaxRate + ficaRate;

  if (combinedRate <= 0) return Infinity;
  return ADMIN_FEE_ANNUAL / combinedRate;
}

export function getMinimumSalaryThreshold(
  stateCode: string,
  filingStatus: 'single' | 'married' | 'hoh',
  deductionRateOfSalary: number = 0.10,
): number {
  const ficaRate = FICA_RATES.combined;
  const stateTaxRate = STATE_TAX_RATES[stateCode] ?? 0;
  const federalRate = getFederalMarginalRate(30000, filingStatus);
  const combinedRate = federalRate + stateTaxRate + ficaRate;

  if (combinedRate * deductionRateOfSalary <= 0) return Infinity;
  return ADMIN_FEE_ANNUAL / (combinedRate * deductionRateOfSalary);
}
