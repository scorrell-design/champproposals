import { describe, it, expect } from 'vitest';
import { getMinimumDeductionForPositiveImpact, getMinimumSalaryThreshold } from '../threshold-calculator';

describe('getMinimumDeductionForPositiveImpact', () => {
  it('returns a positive number for a typical state', () => {
    const minDeduction = getMinimumDeductionForPositiveImpact('TX', 'single');
    expect(minDeduction).toBeGreaterThan(0);
    expect(minDeduction).toBeLessThan(5000);
  });

  it('returns lower minimum for high-tax states', () => {
    const texas = getMinimumDeductionForPositiveImpact('TX', 'single');
    const california = getMinimumDeductionForPositiveImpact('CA', 'single');
    expect(california).toBeLessThan(texas);
  });

  it('returns higher minimum when SS exempt (smaller combined rate)', () => {
    const withSS = getMinimumDeductionForPositiveImpact('TX', 'single', false);
    const withoutSS = getMinimumDeductionForPositiveImpact('TX', 'single', true);
    expect(withoutSS).toBeGreaterThan(withSS);
  });
});

describe('getMinimumSalaryThreshold', () => {
  it('returns a positive number', () => {
    const threshold = getMinimumSalaryThreshold('TX', 'single');
    expect(threshold).toBeGreaterThan(0);
  });

  it('returns lower threshold for high-tax states', () => {
    const texas = getMinimumSalaryThreshold('TX', 'single');
    const california = getMinimumSalaryThreshold('CA', 'single');
    expect(california).toBeLessThan(texas);
  });

  it('returns lower threshold with higher deduction rate', () => {
    const low = getMinimumSalaryThreshold('TX', 'single', 0.05);
    const high = getMinimumSalaryThreshold('TX', 'single', 0.15);
    expect(high).toBeLessThan(low);
  });
});
