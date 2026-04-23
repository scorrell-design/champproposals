import { formatDollar } from '@/utils/format';
import type { ProposalResult } from '../../types/proposal.types';

interface PlainLanguageSummaryProps {
  companyName: string;
  result: ProposalResult;
  stateCodes: string[];
}

export function PlainLanguageSummary({ companyName, result, stateCodes }: PlainLanguageSummaryProps) {
  const stateList = [...new Set(stateCodes)].slice(0, 5).map((c) => c.toUpperCase()).join(', ');
  const monthlySavings = result.employerAnnualFICASavings / 12;

  return (
    <div className="glass-primary">
      <p
        className="mx-auto text-text-secondary"
        style={{ fontSize: 16, lineHeight: 1.8, maxWidth: 680 }}
      >
        Based on {companyName || 'your company'}&rsquo;s{' '}
        <strong className="text-text-primary">{result.totalEmployees}</strong> employees
        {stateList ? ` across ${stateList}` : ''}, this analysis projects{' '}
        <strong className="text-text-primary">{formatDollar(result.employerAnnualFICASavings)}</strong>{' '}
        in annual FICA tax savings for the company &mdash; that&rsquo;s{' '}
        <strong className="text-text-primary">{formatDollar(monthlySavings)} per month</strong>{' '}
        starting with the first payroll cycle after enrollment.{' '}
        <strong className="text-text-primary">
          {result.qualifiedEmployees} of your {result.totalEmployees} employees
        </strong>{' '}
        are projected to see an average increase of{' '}
        <strong className="text-text-primary">{formatDollar(result.avgEmployeeAnnualSavings)}</strong>{' '}
        in annual take-home pay.
      </p>
    </div>
  );
}
