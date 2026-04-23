import { formatDollar, formatDollarCents } from '@/utils/format';
import type { ProposalResult } from '../../types/proposal.types';

interface ExecutiveSummaryProps {
  result: ProposalResult;
  payPeriodsPerYear: number;
}

export function ExecutiveSummary({ result, payPeriodsPerYear }: ExecutiveSummaryProps) {
  const monthlySavings = result.employerAnnualFICASavings / 12;
  const qualifiedPct = result.totalEmployees > 0 ? Math.round((result.qualifiedEmployees / result.totalEmployees) * 100) : 0;
  const avgEmployeeAnnual = result.avgEmployeeAnnualSavings;
  const avgPerPaycheck = avgEmployeeAnnual / payPeriodsPerYear;

  return (
    <div className="glass-primary">
      <div className="flex flex-col gap-6 md:flex-row">
        {/* Left — hero number */}
        <div className="flex-[3]">
          <p
            className="font-medium text-text-tertiary"
            style={{ fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}
          >
            Projected Annual Employer Savings
          </p>
          <p className="mt-3 font-mono text-[44px] font-bold text-accent leading-none">
            {formatDollar(result.employerAnnualFICASavings)}
          </p>
          <p className="mt-2 text-[14px] text-text-secondary">
            {formatDollar(monthlySavings)} per month starting with the first payroll cycle
          </p>
        </div>

        {/* Right — stacked KPIs */}
        <div className="flex-[2] flex flex-col justify-center divide-y" style={{ borderColor: 'rgba(15, 11, 46, 0.08)' }}>
          <KPICell
            value={`${result.qualifiedEmployees} of ${result.totalEmployees} (${qualifiedPct}%)`}
            label="meet program eligibility"
          />
          <KPICell
            value={`+${formatDollar(avgEmployeeAnnual)}/year`}
            label={`+${formatDollarCents(avgPerPaycheck)}/paycheck`}
            valueColor="text-success"
          />
        </div>
      </div>
    </div>
  );
}

function KPICell({ value, label, valueColor = 'text-text-primary' }: { value: string; label: string; valueColor?: string }) {
  return (
    <div className="py-3 first:pt-0 last:pb-0">
      <p className={`font-mono text-[22px] font-bold ${valueColor}`}>{value}</p>
      <p className="mt-0.5 text-[12px] text-text-tertiary">{label}</p>
    </div>
  );
}
