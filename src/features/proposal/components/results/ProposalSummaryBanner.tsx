import { formatDollar } from '@/utils/format';

interface ProposalSummaryBannerProps {
  companyName: string;
  projectedSavings: number;
  employeeCount: number;
}

export function ProposalSummaryBanner({
  companyName,
  projectedSavings,
  employeeCount,
}: ProposalSummaryBannerProps) {
  return (
    <div className="glass-primary flex items-end justify-between">
      <div>
        <p className="metric-label">Section 125 Savings Proposal</p>
        <h2 className="mt-2 text-[28px] font-bold text-text-primary">{companyName || 'Your Company'}</h2>
        <p className="mt-1 text-[14px] text-text-secondary">{employeeCount} employees</p>
      </div>
      <div className="text-right">
        <p className="metric-label">Projected Annual Savings</p>
        <p className="mt-2 font-mono text-[36px] font-bold text-accent">{formatDollar(projectedSavings)}</p>
      </div>
    </div>
  );
}
