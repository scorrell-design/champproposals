import { describe, it, expect } from 'vitest';
import { calculateEmployeeFICA, getFederalMarginalRate, estimatePreTaxDeductions } from '../fica-calculator';

describe('getFederalMarginalRate', () => {
  it('returns 10% for low-income single filer', () => {
    expect(getFederalMarginalRate(10000, 'single')).toBe(0.10);
  });

  it('returns 12% for $30k single filer', () => {
    expect(getFederalMarginalRate(30000, 'single')).toBe(0.12);
  });

  it('returns 22% for $80k single filer', () => {
    expect(getFederalMarginalRate(80000, 'single')).toBe(0.22);
  });

  it('returns 12% for $80k married filer (lower bracket)', () => {
    expect(getFederalMarginalRate(80000, 'married')).toBe(0.12);
  });

  it('returns 12% for $50k head of household', () => {
    expect(getFederalMarginalRate(50000, 'hoh')).toBe(0.12);
  });

  it('returns 37% for very high income', () => {
    expect(getFederalMarginalRate(1000000, 'single')).toBe(0.37);
  });
});

describe('calculateEmployeeFICA', () => {
  it('calculates positive impact for a typical employee', () => {
    const result = calculateEmployeeFICA({
      salary: 60000,
      stateCode: 'TX',
      filingStatus: 'single',
      preTaxDeductions: 5000,
      socialSecurityExempt: false,
      adminFeeAnnual: 420,
    });

    expect(result.employerFICASavings).toBeGreaterThan(0);
    expect(result.employeeTaxSavings).toBeGreaterThan(0);
    expect(result.isQualified).toBe(true);
  });

  it('returns zero employer savings with zero deductions', () => {
    const result = calculateEmployeeFICA({
      salary: 60000,
      stateCode: 'TX',
      filingStatus: 'single',
      preTaxDeductions: 0,
      socialSecurityExempt: false,
      adminFeeAnnual: 420,
    });

    expect(result.employerFICASavings).toBe(0);
    expect(result.employeeTaxSavings).toBe(0);
    expect(result.netEmployeeImpact).toBe(-420);
    expect(result.isPositivelyImpacted).toBe(false);
  });

  it('reduces employer FICA savings when SS exempt', () => {
    const withSS = calculateEmployeeFICA({
      salary: 60000,
      stateCode: 'TX',
      filingStatus: 'single',
      preTaxDeductions: 5000,
      socialSecurityExempt: false,
      adminFeeAnnual: 420,
    });

    const withoutSS = calculateEmployeeFICA({
      salary: 60000,
      stateCode: 'TX',
      filingStatus: 'single',
      preTaxDeductions: 5000,
      socialSecurityExempt: true,
      adminFeeAnnual: 420,
    });

    expect(withSS.employerFICASavings).toBeGreaterThan(withoutSS.employerFICASavings);
  });

  it('produces higher employee savings in high-tax states', () => {
    const texas = calculateEmployeeFICA({
      salary: 60000,
      stateCode: 'TX',
      filingStatus: 'single',
      preTaxDeductions: 5000,
      socialSecurityExempt: false,
      adminFeeAnnual: 420,
    });

    const california = calculateEmployeeFICA({
      salary: 60000,
      stateCode: 'CA',
      filingStatus: 'single',
      preTaxDeductions: 5000,
      socialSecurityExempt: false,
      adminFeeAnnual: 420,
    });

    expect(california.employeeTaxSavings).toBeGreaterThan(texas.employeeTaxSavings);
    // Employer FICA savings should be the same (FICA doesn't vary by state)
    expect(california.employerFICASavings).toBe(texas.employerFICASavings);
  });

  it('correctly calculates employer FICA at 7.65%', () => {
    const result = calculateEmployeeFICA({
      salary: 100000,
      stateCode: 'TX',
      filingStatus: 'single',
      preTaxDeductions: 10000,
      socialSecurityExempt: false,
      adminFeeAnnual: 420,
    });

    expect(result.employerFICASavings).toBeCloseTo(10000 * 0.0765, 0);
  });

  it('handles zero salary gracefully', () => {
    const result = calculateEmployeeFICA({
      salary: 0,
      stateCode: 'TX',
      filingStatus: 'single',
      preTaxDeductions: 0,
      socialSecurityExempt: false,
      adminFeeAnnual: 420,
    });

    expect(result.employerFICASavings).toBe(0);
    expect(result.isQualified).toBe(false);
  });
});

describe('estimatePreTaxDeductions', () => {
  it('returns default deduction when no benefits configured', () => {
    const deduction = estimatePreTaxDeductions(60000, 'mid', {
      healthParticipation: 0,
      healthPremiumAnnual: 0,
      retirementParticipation: 0,
      retirementRate: 0,
      hsaParticipation: 0,
      hsaAnnual: 0,
    });

    expect(deduction).toBe(60000 * 0.10);
  });

  it('includes health premium when participation > 0', () => {
    const deduction = estimatePreTaxDeductions(60000, 'mid', {
      healthParticipation: 100,
      healthPremiumAnnual: 6000,
      retirementParticipation: 0,
      retirementRate: 0,
      hsaParticipation: 0,
      hsaAnnual: 0,
    });

    expect(deduction).toBe(6000);
  });

  it('scales deduction by participation rate', () => {
    const full = estimatePreTaxDeductions(60000, 'mid', {
      healthParticipation: 100,
      healthPremiumAnnual: 6000,
      retirementParticipation: 0,
      retirementRate: 0,
      hsaParticipation: 0,
      hsaAnnual: 0,
    });

    const half = estimatePreTaxDeductions(60000, 'mid', {
      healthParticipation: 50,
      healthPremiumAnnual: 6000,
      retirementParticipation: 0,
      retirementRate: 0,
      hsaParticipation: 0,
      hsaAnnual: 0,
    });

    expect(half).toBe(full / 2);
  });
});
