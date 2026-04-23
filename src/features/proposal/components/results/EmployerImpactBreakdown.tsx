import { formatDollar, formatDollarCents } from '@/utils/format';
import type { ProposalResult, PaycheckComparison } from '../../types/proposal.types';

interface EmployerImpactBreakdownProps {
  result: ProposalResult;
  payPeriodsPerYear: number;
  midTier?: PaycheckComparison;
}

export function EmployerImpactBreakdown({ result, payPeriodsPerYear, midTier }: EmployerImpactBreakdownProps) {
  const monthlySavings = result.employerAnnualFICASavings / 12;
  const perEmployeeMonthly = result.totalEmployees > 0 ? monthlySavings / result.totalEmployees : 0;
  const qualifiedPct = result.totalEmployees > 0 ? Math.round((result.qualifiedEmployees / result.totalEmployees) * 100) : 0;
  const belowThreshold = result.totalEmployees - result.qualifiedEmployees;
  const belowPct = result.totalEmployees > 0 ? Math.round((belowThreshold / result.totalEmployees) * 100) : 0;

  return (
    <div className="glass-primary !p-0 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-3">
        {/* Column 1 — Employer Savings */}
        <div className="p-6" style={{ borderRight: '1px solid rgba(15, 11, 46, 0.08)' }}>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-accent-muted" style={{ marginBottom: 16 }}>
            For the Company
          </p>
          <Metric label="Annual FICA Savings" value={formatDollar(result.employerAnnualFICASavings)} size={24} color="text-accent" />
          <Metric label="Monthly FICA Savings" value={formatDollar(monthlySavings)} size={18} />
          <Metric label="Per-Employee Monthly Savings" value={formatDollar(perEmployeeMonthly)} size={15} muted />
        </div>

        {/* Column 2 — Employee Eligibility */}
        <div className="p-6" style={{ borderRight: '1px solid rgba(15, 11, 46, 0.08)' }}>
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-accent-muted" style={{ marginBottom: 16 }}>
            For Your Employees
          </p>
          <div style={{ marginBottom: 12 }}>
            <p className="font-mono text-[20px] font-bold text-text-primary">
              {result.qualifiedEmployees} ({qualifiedPct}%)
            </p>
            <p className="text-[12px] text-text-tertiary">Qualified Employees</p>
          </div>
          <div style={{ marginBottom: 12 }}>
            <p className="font-mono text-[20px] font-bold text-success">
              {result.positivelyImpactedCount} ({result.positivelyImpactedPercent}%)
            </p>
            <p className="text-[12px] text-text-tertiary">Positively Impacted</p>
          </div>
          {belowThreshold > 0 && (
            <div style={{ marginBottom: 12 }}>
              <p className="font-mono text-[15px] text-text-tertiary">
                {belowThreshold} ({belowPct}%)
              </p>
              <p className="text-[12px] text-text-tertiary">Below Threshold</p>
            </div>
          )}
          <p className="text-[12px] italic text-text-tertiary" style={{ marginTop: 8, lineHeight: 1.5 }}>
            Below-threshold employees earn below the minimum income where plan savings are meaningful.
          </p>
        </div>

        {/* Column 3 — Example Paycheck Impact */}
        <div className="p-6">
          <p className="text-[11px] font-medium uppercase tracking-[0.1em] text-accent-muted" style={{ marginBottom: 16 }}>
            Example Paycheck Impact
          </p>
          {midTier ? (
            <>
              <p className="text-[12px] text-text-tertiary" style={{ marginBottom: 12 }}>
                {midTier.tier} Employee
              </p>
              <div style={{ marginBottom: 8 }}>
                <p className="text-[12px] text-text-tertiary">Current:</p>
                <p className="font-mono text-[16px] text-text-secondary">
                  {formatDollarCents(midTier.before.netPay)}/paycheck
                </p>
              </div>
              <div style={{ marginBottom: 8 }}>
                <p className="text-[12px] text-text-tertiary">With Section 125 Plan:</p>
                <p className="font-mono text-[16px] text-text-primary">
                  {formatDollarCents(midTier.withPlan.netPay)}/paycheck
                </p>
              </div>
              <p className="font-mono text-[18px] font-bold text-accent">
                +{formatDollarCents(midTier.perPaycheckIncrease)}/paycheck
              </p>
              <p className="mt-1 font-mono text-[14px] text-success">
                +{formatDollarCents(midTier.annualIncrease)}/year
              </p>
              <p className="mt-2 text-[12px] text-text-tertiary">
                ${Math.round(midTier.grossPay * payPeriodsPerYear).toLocaleString()} salary · {midTier.tier}
              </p>
            </>
          ) : (
            <p className="text-[13px] text-text-tertiary">No tier data available</p>
          )}
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value, size, color = 'text-text-primary', muted }: { label: string; value: string; size: number; color?: string; muted?: boolean }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <p className={`font-mono font-bold ${muted ? 'text-text-secondary' : color}`} style={{ fontSize: size }}>
        {value}
      </p>
      <p className="text-[12px] text-text-tertiary">{label}</p>
    </div>
  );
}
