import { z } from 'zod/v4';

export const CompanyInfoSchema = z.object({
  name: z.string().min(1, 'Company name is required'),
  employeeCount: z.number().min(1, 'At least 1 employee required'),
  payrollFrequency: z.enum(['weekly', 'biweekly', 'semimonthly', 'monthly']),
});

export const StateDistributionSchema = z.array(
  z.object({
    stateCode: z.string().length(2),
    stateName: z.string(),
    stateTaxRate: z.number(),
    workforcePercent: z.number().min(0).max(100),
  })
).refine(
  (states) => {
    if (states.length === 0) return true;
    const total = states.reduce((sum, s) => sum + s.workforcePercent, 0);
    return Math.abs(total - 100) < 0.5;
  },
  { message: 'State distribution must total exactly 100%' }
);

export const FilingStatusSchema = z.object({
  single: z.number().min(0).max(100),
  married: z.number().min(0).max(100),
  headOfHousehold: z.number().min(0).max(100),
}).refine(
  (fs) => Math.abs(fs.single + fs.married + fs.headOfHousehold - 100) < 0.5,
  { message: 'Filing status percentages must total 100%' }
);

export const SalaryTierSchema = z.object({
  level: z.enum(['entry', 'mid', 'senior', 'executive']),
  label: z.string(),
  salaryMin: z.number().min(0),
  salaryMax: z.number().min(0),
  workforcePercent: z.number().min(0).max(100),
}).refine(
  (tier) => tier.salaryMax > tier.salaryMin,
  { message: 'Max salary must be greater than min salary' }
);

export const SalaryTiersSchema = z.array(SalaryTierSchema).refine(
  (tiers) => {
    if (tiers.length === 0) return true;
    const total = tiers.reduce((sum, t) => sum + t.workforcePercent, 0);
    return Math.abs(total - 100) < 0.5;
  },
  { message: 'Tier workforce percentages must total 100%' }
);
