import type { SavingsRange, RangeFactor } from '../types/proposal.types';

export function calculateSavingsRange(
  projectedSavings: number,
  proposalType: 'quick_proposal' | 'informed_analysis'
): SavingsRange {
  const isQP = proposalType === 'quick_proposal';

  const participationDown = isQP ? -0.15 : -0.08;
  const participationUp   = isQP ?  0.10 :  0.05;
  const turnoverDown      = isQP ? -0.08 : -0.05;
  const turnoverUp        = isQP ?  0.03 :  0.02;
  const salaryDown        = isQP ? -0.06 : -0.02;
  const salaryUp          = isQP ?  0.04 :  0.01;
  const filingDown        = isQP ? -0.04 : -0.02;
  const filingUp          = isQP ?  0.03 :  0.01;
  const electionDown      = isQP ? -0.03 : -0.01;
  const electionUp        = isQP ?  0.02 :  0.01;

  const totalDown = participationDown + turnoverDown + salaryDown + filingDown + electionDown;
  const totalUp   = participationUp + turnoverUp + salaryUp + filingUp + electionUp;

  const conservative = Math.round(projectedSavings * (1 + totalDown));
  const optimal      = Math.round(projectedSavings * (1 + totalUp));

  const factors: RangeFactor[] = [
    {
      name: 'Benefit Participation',
      description: isQP
        ? 'Actual employee enrollment rates may differ from estimates. New plans typically see 55-70% participation in year one, growing over time.'
        : 'Actual enrollment may vary slightly from current rates. Established plans typically maintain 70-85% participation.',
      conservativeImpact: Math.round(projectedSavings * participationDown),
      optimalImpact: Math.round(projectedSavings * participationUp),
      weight: 40,
    },
    {
      name: 'Employee Turnover',
      description: 'Headcount changes, new hire waiting periods, and terminations affect the number of active participants throughout the year.',
      conservativeImpact: Math.round(projectedSavings * turnoverDown),
      optimalImpact: Math.round(projectedSavings * turnoverUp),
      weight: 25,
    },
    {
      name: 'Salary Distribution',
      description: isQP
        ? 'Salary estimates are based on tier midpoints. Actual salaries within each tier may cluster higher or lower.'
        : 'Minor variance from promotions, raises, and new hires shifting the salary distribution.',
      conservativeImpact: Math.round(projectedSavings * salaryDown),
      optimalImpact: Math.round(projectedSavings * salaryUp),
      weight: 15,
    },
    {
      name: 'Filing Status Changes',
      description: 'Marriage, divorce, and dependents change employee tax brackets throughout the year, shifting individual savings amounts.',
      conservativeImpact: Math.round(projectedSavings * filingDown),
      optimalImpact: Math.round(projectedSavings * filingUp),
      weight: 12,
    },
    {
      name: 'Benefit Election Changes',
      description: 'Employees may change coverage levels (individual vs. family) during open enrollment or qualifying life events.',
      conservativeImpact: Math.round(projectedSavings * electionDown),
      optimalImpact: Math.round(projectedSavings * electionUp),
      weight: 8,
    },
  ];

  return { conservative, projected: Math.round(projectedSavings), optimal, factors };
}
