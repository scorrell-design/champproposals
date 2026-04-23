import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';
import { formatDollar, formatDollarCents } from '@/utils/format';
import type { TierResult } from '../../types/proposal.types';

interface TierBreakdownTableProps {
  tiers: TierResult[];
  payPeriodsPerYear?: number;
  totalEmployees?: number;
}

export function TierBreakdownTable({ tiers, payPeriodsPerYear = 26, totalEmployees }: TierBreakdownTableProps) {
  const [expandedTier, setExpandedTier] = useState<string | null>(null);
  const total = totalEmployees ?? tiers.reduce((s, t) => s + t.employeeCount, 0);

  return (
    <div className="glass-primary overflow-hidden !p-0">
      <div className="px-6 py-4">
        <h3 className="text-[18px] font-semibold text-text-primary">Tier Breakdown</h3>
        <p className="mt-1 text-[11px] italic text-text-tertiary">Estimates based on provided data</p>
      </div>

      {/* Header */}
      <div
        className="grid gap-4 px-6 py-2.5 text-[11px] font-medium uppercase tracking-[0.05em] text-text-tertiary"
        style={{ background: '#F7F8FC', gridTemplateColumns: '1.2fr 1fr 1fr 1.2fr 1fr' }}
      >
        <div>Tier</div>
        <div className="text-right"># Employees (%)</div>
        <div className="text-right">Avg. Salary</div>
        <div className="text-right">Est. Paycheck Increase</div>
        <div className="text-right">Annual Impact</div>
      </div>

      {/* Rows */}
      {tiers.map((tier, i) => {
        const pct = total > 0 ? Math.round((tier.employeeCount / total) * 100) : 0;
        const annualImpact = tier.ficaSavingsPerEmployee;
        const paycheckIncrease = annualImpact / payPeriodsPerYear;

        return (
          <div key={tier.tier}>
            <button
              onClick={() => setExpandedTier(expandedTier === tier.tier ? null : tier.tier)}
              className="grid w-full gap-4 px-6 py-3 text-[14px] text-left transition-colors hover:bg-surface-glass-light"
              style={{
                background: i % 2 === 0 ? '#FFFFFF' : '#F7F8FC',
                gridTemplateColumns: '1.2fr 1fr 1fr 1.2fr 1fr',
              }}
            >
              <div className="flex items-center gap-2 font-medium text-text-primary">
                <motion.span animate={{ rotate: expandedTier === tier.tier ? 180 : 0 }} className="inline-block">
                  <ChevronDown className="h-3.5 w-3.5 text-text-tertiary" />
                </motion.span>
                {tier.tier}
              </div>
              <div className="text-right font-mono text-text-secondary">
                {tier.employeeCount} ({pct}%)
              </div>
              <div className="text-right font-mono text-text-secondary">{formatDollar(tier.avgSalary)}</div>
              <div className="text-right font-mono font-semibold text-accent">
                {paycheckIncrease >= 0 ? '+' : ''}{formatDollarCents(paycheckIncrease)}/paycheck
              </div>
              <div className={`text-right font-mono font-semibold ${annualImpact >= 0 ? 'text-success' : 'text-text-secondary'}`}>
                {annualImpact >= 0 ? '+' : ''}{formatDollar(annualImpact)}/year
              </div>
            </button>

            <AnimatePresence>
              {expandedTier === tier.tier && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                    <div className="px-6 py-4" style={{ background: '#F7F8FC' }}>
                    <div className="grid grid-cols-2 gap-3 text-[13px]">
                      <Row label="Avg. Pre-Tax Deduction" value={formatDollar(tier.avgPreTaxDeduction)} />
                      <Row label="Employer FICA Savings" value={formatDollar(tier.ficaSavingsPerEmployee)} />
                      <Row label="Employees in Tier" value={`${tier.employeeCount} (${pct}%)`} />
                      <Row label="Est. Per-Paycheck Increase" value={`${paycheckIncrease >= 0 ? '+' : ''}${formatDollarCents(paycheckIncrease)}`} />
                      <Row label="Pay Periods / Year" value={String(payPeriodsPerYear)} />
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-text-secondary">{label}</span>
      <span className="font-mono font-medium text-text-primary">{value}</span>
    </div>
  );
}
