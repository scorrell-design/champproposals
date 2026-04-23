import { describe, it, expect } from 'vitest';
import { calculateSavingsRange } from '../range-calculator';

describe('calculateSavingsRange', () => {
  it('applies 5-factor variance for quick_proposal (-36%/+22%)', () => {
    const range = calculateSavingsRange(10000, 'quick_proposal');
    expect(range.conservative).toBe(6400);
    expect(range.projected).toBe(10000);
    expect(range.optimal).toBe(12200);
  });

  it('applies 5-factor variance for informed_analysis (-18%/+10%)', () => {
    const range = calculateSavingsRange(10000, 'informed_analysis');
    expect(range.conservative).toBe(8200);
    expect(range.projected).toBe(10000);
    expect(range.optimal).toBe(11000);
  });

  it('handles zero savings', () => {
    const range = calculateSavingsRange(0, 'quick_proposal');
    expect(range.conservative).toBe(0);
    expect(range.projected).toBe(0);
    expect(range.optimal).toBe(0);
  });

  it('rounds to whole numbers', () => {
    const range = calculateSavingsRange(1333, 'quick_proposal');
    expect(Number.isInteger(range.conservative)).toBe(true);
    expect(Number.isInteger(range.projected)).toBe(true);
    expect(Number.isInteger(range.optimal)).toBe(true);
  });

  it('maintains conservative < projected < optimal ordering', () => {
    const range = calculateSavingsRange(50000, 'quick_proposal');
    expect(range.conservative).toBeLessThan(range.projected);
    expect(range.projected).toBeLessThan(range.optimal);
  });

  it('informed_analysis has tighter range than quick_proposal', () => {
    const qp = calculateSavingsRange(10000, 'quick_proposal');
    const ia = calculateSavingsRange(10000, 'informed_analysis');
    const qpSpread = qp.optimal - qp.conservative;
    const iaSpread = ia.optimal - ia.conservative;
    expect(iaSpread).toBeLessThan(qpSpread);
  });

  it('returns 5 range factors', () => {
    const range = calculateSavingsRange(10000, 'quick_proposal');
    expect(range.factors).toBeDefined();
    expect(range.factors!.length).toBe(5);
    expect(range.factors![0].name).toBe('Benefit Participation');
    expect(range.factors![0].weight).toBe(40);
  });

  it('factor weights sum to 100', () => {
    const range = calculateSavingsRange(10000, 'quick_proposal');
    const totalWeight = range.factors!.reduce((s, f) => s + f.weight, 0);
    expect(totalWeight).toBe(100);
  });
});
