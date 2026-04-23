import type { SalaryTier, IndustryPreset } from '@/features/proposal/types/proposal.types';

export type IndustryIconKey = 'graduation-cap' | 'landmark' | 'heart-pulse' | 'factory' | 'utensils-crossed' | 'shopping-bag' | 'monitor' | 'settings';

interface IndustryConfig {
  label: string;
  icon: IndustryIconKey;
  tiers: SalaryTier[];
}

export const INDUSTRY_PRESETS: Record<IndustryPreset, IndustryConfig> = {
  education: {
    label: 'Education',
    icon: 'graduation-cap',
    tiers: [
      { level: 'entry', label: 'Entry Level', salaryMin: 28000, salaryMax: 40000, workforcePercent: 35 },
      { level: 'mid', label: 'Mid', salaryMin: 40000, salaryMax: 60000, workforcePercent: 40 },
      { level: 'senior', label: 'Senior', salaryMin: 60000, salaryMax: 85000, workforcePercent: 20 },
      { level: 'executive', label: 'Executive', salaryMin: 85000, salaryMax: 120000, workforcePercent: 5 },
    ],
  },
  finance: {
    label: 'Finance',
    icon: 'landmark',
    tiers: [
      { level: 'entry', label: 'Entry Level', salaryMin: 35000, salaryMax: 50000, workforcePercent: 25 },
      { level: 'mid', label: 'Mid', salaryMin: 50000, salaryMax: 80000, workforcePercent: 35 },
      { level: 'senior', label: 'Senior', salaryMin: 80000, salaryMax: 130000, workforcePercent: 30 },
      { level: 'executive', label: 'Executive', salaryMin: 130000, salaryMax: 250000, workforcePercent: 10 },
    ],
  },
  healthcare: {
    label: 'Healthcare',
    icon: 'heart-pulse',
    tiers: [
      { level: 'entry', label: 'Entry Level', salaryMin: 25000, salaryMax: 38000, workforcePercent: 30 },
      { level: 'mid', label: 'Mid', salaryMin: 38000, salaryMax: 65000, workforcePercent: 35 },
      { level: 'senior', label: 'Senior', salaryMin: 65000, salaryMax: 100000, workforcePercent: 25 },
      { level: 'executive', label: 'Executive', salaryMin: 100000, salaryMax: 200000, workforcePercent: 10 },
    ],
  },
  manufacturing: {
    label: 'Manufacturing',
    icon: 'factory',
    tiers: [
      { level: 'entry', label: 'Entry Level', salaryMin: 28000, salaryMax: 40000, workforcePercent: 35 },
      { level: 'mid', label: 'Mid', salaryMin: 40000, salaryMax: 60000, workforcePercent: 40 },
      { level: 'senior', label: 'Senior', salaryMin: 60000, salaryMax: 90000, workforcePercent: 20 },
      { level: 'executive', label: 'Executive', salaryMin: 90000, salaryMax: 150000, workforcePercent: 5 },
    ],
  },
  restaurant: {
    label: 'Restaurant',
    icon: 'utensils-crossed',
    tiers: [
      { level: 'entry', label: 'Entry Level', salaryMin: 20000, salaryMax: 30000, workforcePercent: 50 },
      { level: 'mid', label: 'Mid', salaryMin: 30000, salaryMax: 45000, workforcePercent: 30 },
      { level: 'senior', label: 'Senior', salaryMin: 45000, salaryMax: 65000, workforcePercent: 15 },
      { level: 'executive', label: 'Executive', salaryMin: 65000, salaryMax: 100000, workforcePercent: 5 },
    ],
  },
  retail: {
    label: 'Retail',
    icon: 'shopping-bag',
    tiers: [
      { level: 'entry', label: 'Entry Level', salaryMin: 22000, salaryMax: 32000, workforcePercent: 45 },
      { level: 'mid', label: 'Mid', salaryMin: 32000, salaryMax: 50000, workforcePercent: 35 },
      { level: 'senior', label: 'Senior', salaryMin: 50000, salaryMax: 75000, workforcePercent: 15 },
      { level: 'executive', label: 'Executive', salaryMin: 75000, salaryMax: 120000, workforcePercent: 5 },
    ],
  },
  technology: {
    label: 'Technology',
    icon: 'monitor',
    tiers: [
      { level: 'entry', label: 'Entry Level', salaryMin: 45000, salaryMax: 70000, workforcePercent: 20 },
      { level: 'mid', label: 'Mid', salaryMin: 70000, salaryMax: 110000, workforcePercent: 35 },
      { level: 'senior', label: 'Senior', salaryMin: 110000, salaryMax: 160000, workforcePercent: 30 },
      { level: 'executive', label: 'Executive', salaryMin: 160000, salaryMax: 300000, workforcePercent: 15 },
    ],
  },
  custom: {
    label: 'Custom',
    icon: 'settings',
    tiers: [
      { level: 'entry', label: 'Entry Level', salaryMin: 0, salaryMax: 0, workforcePercent: 0 },
      { level: 'mid', label: 'Mid-Level', salaryMin: 0, salaryMax: 0, workforcePercent: 0 },
      { level: 'senior', label: 'Senior', salaryMin: 0, salaryMax: 0, workforcePercent: 0 },
      { level: 'executive', label: 'Executive', salaryMin: 0, salaryMax: 0, workforcePercent: 0 },
    ],
  },
};
