import { describe, it, expect } from 'vitest';
import {
  CompanyInfoSchema,
  StateDistributionSchema,
  FilingStatusSchema,
  SalaryTierSchema,
  SalaryTiersSchema,
} from '../validation';

describe('CompanyInfoSchema', () => {
  it('accepts valid company info', () => {
    const result = CompanyInfoSchema.safeParse({
      name: 'Acme Corp',
      employeeCount: 150,
      payrollFrequency: 'biweekly',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty company name', () => {
    const result = CompanyInfoSchema.safeParse({
      name: '',
      employeeCount: 150,
      payrollFrequency: 'biweekly',
    });
    expect(result.success).toBe(false);
  });

  it('rejects zero employees', () => {
    const result = CompanyInfoSchema.safeParse({
      name: 'Acme Corp',
      employeeCount: 0,
      payrollFrequency: 'biweekly',
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid payroll frequency', () => {
    const result = CompanyInfoSchema.safeParse({
      name: 'Acme Corp',
      employeeCount: 150,
      payrollFrequency: 'daily',
    });
    expect(result.success).toBe(false);
  });
});

describe('StateDistributionSchema', () => {
  it('accepts distribution totaling 100%', () => {
    const result = StateDistributionSchema.safeParse([
      { stateCode: 'TX', stateName: 'Texas', stateTaxRate: 0, workforcePercent: 60 },
      { stateCode: 'CA', stateName: 'California', stateTaxRate: 0.093, workforcePercent: 40 },
    ]);
    expect(result.success).toBe(true);
  });

  it('rejects distribution not totaling 100%', () => {
    const result = StateDistributionSchema.safeParse([
      { stateCode: 'TX', stateName: 'Texas', stateTaxRate: 0, workforcePercent: 60 },
      { stateCode: 'CA', stateName: 'California', stateTaxRate: 0.093, workforcePercent: 30 },
    ]);
    expect(result.success).toBe(false);
  });

  it('accepts empty array (valid, handled upstream)', () => {
    const result = StateDistributionSchema.safeParse([]);
    expect(result.success).toBe(true);
  });

  it('accepts single state at 100%', () => {
    const result = StateDistributionSchema.safeParse([
      { stateCode: 'NY', stateName: 'New York', stateTaxRate: 0.109, workforcePercent: 100 },
    ]);
    expect(result.success).toBe(true);
  });
});

describe('FilingStatusSchema', () => {
  it('accepts valid filing distribution', () => {
    const result = FilingStatusSchema.safeParse({
      single: 48,
      married: 38,
      headOfHousehold: 14,
    });
    expect(result.success).toBe(true);
  });

  it('rejects distribution not totaling 100%', () => {
    const result = FilingStatusSchema.safeParse({
      single: 50,
      married: 30,
      headOfHousehold: 10,
    });
    expect(result.success).toBe(false);
  });

  it('rejects negative values', () => {
    const result = FilingStatusSchema.safeParse({
      single: -10,
      married: 80,
      headOfHousehold: 30,
    });
    expect(result.success).toBe(false);
  });
});

describe('SalaryTierSchema', () => {
  it('accepts valid tier', () => {
    const result = SalaryTierSchema.safeParse({
      level: 'mid',
      label: 'Mid-Level',
      salaryMin: 40000,
      salaryMax: 70000,
      workforcePercent: 35,
    });
    expect(result.success).toBe(true);
  });

  it('rejects max < min', () => {
    const result = SalaryTierSchema.safeParse({
      level: 'mid',
      label: 'Mid-Level',
      salaryMin: 70000,
      salaryMax: 40000,
      workforcePercent: 35,
    });
    expect(result.success).toBe(false);
  });

  it('rejects invalid tier level', () => {
    const result = SalaryTierSchema.safeParse({
      level: 'intern',
      label: 'Intern',
      salaryMin: 20000,
      salaryMax: 30000,
      workforcePercent: 10,
    });
    expect(result.success).toBe(false);
  });
});

describe('SalaryTiersSchema', () => {
  it('accepts tiers totaling 100%', () => {
    const result = SalaryTiersSchema.safeParse([
      { level: 'entry', label: 'Entry', salaryMin: 25000, salaryMax: 40000, workforcePercent: 40 },
      { level: 'mid', label: 'Mid', salaryMin: 40000, salaryMax: 60000, workforcePercent: 35 },
      { level: 'senior', label: 'Senior', salaryMin: 60000, salaryMax: 90000, workforcePercent: 25 },
    ]);
    expect(result.success).toBe(true);
  });

  it('rejects tiers not totaling 100%', () => {
    const result = SalaryTiersSchema.safeParse([
      { level: 'entry', label: 'Entry', salaryMin: 25000, salaryMax: 40000, workforcePercent: 50 },
      { level: 'mid', label: 'Mid', salaryMin: 40000, salaryMax: 60000, workforcePercent: 30 },
    ]);
    expect(result.success).toBe(false);
  });
});
