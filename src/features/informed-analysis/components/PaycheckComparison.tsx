import { useState } from 'react';
import { motion } from 'framer-motion';
import { formatDollarCents } from '@/utils/format';
import type { PaycheckComparison as PaycheckComparisonType } from '@/features/proposal/types/proposal.types';

interface PaycheckComparisonProps {
  tiers: PaycheckComparisonType[];
  payrollFrequency: string;
}

export function PaycheckComparison({ tiers, payrollFrequency }: PaycheckComparisonProps) {
  const [activeTier, setActiveTier] = useState(0);
  const tier = tiers[activeTier];
  if (!tier) return null;

  const fedSaved = tier.before.federalTax - tier.withPlan.federalTax;
  const stateSaved = tier.before.stateTax - tier.withPlan.stateTax;
  const ficaSaved = tier.before.fica - tier.withPlan.fica;
  const totalTaxSaved = fedSaved + stateSaved + ficaSaved;
  const pctIncrease = tier.before.netPay > 0 ? ((tier.perPaycheckIncrease / tier.before.netPay) * 100).toFixed(2) : '0';

  return (
    <div id="paycheck-comparison" className="glass-primary !p-0 overflow-hidden">
      <div className="px-6 py-4">
        <h3 className="text-[18px] font-semibold text-text-primary">Paycheck Comparison</h3>
        <p className="text-[13px] text-text-secondary mt-0.5">
          {tiers.length === 1 ? 'Example employee paycheck breakdown' : `Per ${payrollFrequency} paycheck breakdown by tier`}
        </p>
      </div>

      {/* Tier switcher */}
      {tiers.length > 1 && (
        <div className="flex gap-1 px-6 py-2 overflow-x-auto" style={{ background: '#F7F8FC' }}>
          {tiers.map((t, i) => (
            <button
              key={t.tier}
              onClick={() => setActiveTier(i)}
              className={`whitespace-nowrap rounded-full px-4 py-1.5 text-[13px] font-medium transition-all
                ${i === activeTier
                  ? 'bg-white text-text-primary shadow-sm'
                  : 'text-text-tertiary hover:text-text-secondary'}`}
            >
              {t.tier}: <span className="font-mono text-accent">+{formatDollarCents(t.perPaycheckIncrease)}</span>
            </button>
          ))}
        </div>
      )}

      <div className="p-6">
        {/* Side-by-side paycheck cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Current */}
          <div className="glass-secondary" style={{ opacity: 0.8 }}>
            <p className="metric-label mb-3">Current Paycheck</p>
            <SectionLabel>Earnings</SectionLabel>
            <PayLine label="Gross Pay" value={tier.grossPay} />
            <SectionLabel>Taxes</SectionLabel>
            <PayLine label="Federal Withholding" value={-tier.before.federalTax} dim />
            <PayLine label="FICA (7.65%)" value={-tier.before.fica} dim />
            <PayLine label="State Withholding" value={-tier.before.stateTax} dim />
            <div className="my-2" style={{ height: 1, background: 'rgba(59, 130, 246, 0.15)' }} />
            <SectionLabel>Net Pay</SectionLabel>
            <PayLine label="Net Pay" value={tier.before.netPay} bold size={18} />
          </div>

          {/* With Section 125 Plan */}
          <div className="glass-secondary !border-accent-border/30">
            <p className="metric-label mb-3 text-accent-muted">Paycheck with Section 125 Plan</p>
            <SectionLabel>Earnings</SectionLabel>
            <PayLine label="Gross Pay" value={tier.grossPay} />
            <SectionLabel accent>Section 125 Plan</SectionLabel>
            <div className="rounded-md px-2 py-0.5 -mx-2" style={{ background: 'rgba(217, 119, 6, 0.06)' }}>
              <PayLine label="Pre-Tax Benefit Deduction" value={-tier.withPlan.preTaxDeduction} accent />
            </div>
            <SectionLabel>Taxes</SectionLabel>
            <PayLine label="Federal Withholding" value={-tier.withPlan.federalTax} dim saved={fedSaved} />
            <PayLine label="FICA" value={-tier.withPlan.fica} dim saved={ficaSaved} />
            <PayLine label="State Withholding" value={-tier.withPlan.stateTax} dim saved={stateSaved} />
            <div className="my-2" style={{ height: 1, background: 'rgba(59, 130, 246, 0.15)' }} />
            <div className="rounded-md px-2 py-1 -mx-2" style={{ background: 'rgba(59, 130, 246, 0.06)' }}>
              <PayLine label="Section 125 Benefit" value={tier.perPaycheckIncrease} accent />
            </div>
            <SectionLabel>Net Pay</SectionLabel>
            <div className="rounded-md px-2 py-1 -mx-2" style={{ background: 'rgba(5, 150, 105, 0.06)' }}>
              <PayLine label="Net Pay" value={tier.withPlan.netPay} bold green size={18} />
            </div>
          </div>
        </div>

        {/* Increase badge */}
        <motion.div
          key={activeTier}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="mt-5 glass-secondary text-center !border-accent-border"
          style={{ boxShadow: '0 0 24px rgba(59, 130, 246, 0.08)' }}
        >
          <p className="font-mono text-[22px] font-bold text-accent">
            +{formatDollarCents(tier.perPaycheckIncrease)} per paycheck
          </p>
          <p className="mt-0.5 text-[13px] text-text-secondary">additional take-home pay</p>
          <p className="mt-0.5 text-[12px] text-text-tertiary">
            ({formatDollarCents(tier.annualIncrease)} more per year)
          </p>
        </motion.div>

        {/* Annual impact bar */}
        <div
          className="mt-4 grid grid-cols-3 gap-4 rounded-[14px] px-4 py-3 text-center"
          style={{ background: '#F7F8FC', border: '1px solid rgba(15, 11, 46, 0.08)' }}
        >
          <div>
            <p className="font-mono text-[20px] font-bold text-accent">{formatDollarCents(tier.annualIncrease)}</p>
            <p className="text-[11px] text-text-tertiary">Annual Take-Home Increase</p>
          </div>
          <div>
            <p className="font-mono text-[20px] font-bold text-text-primary">{formatDollarCents(totalTaxSaved * 26)}</p>
            <p className="text-[11px] text-text-tertiary">Total Tax Savings</p>
          </div>
          <div>
            <p className="font-mono text-[20px] font-bold text-accent">+{pctIncrease}%</p>
            <p className="text-[11px] text-text-tertiary">Increase Percentage</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionLabel({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <p
      className={`mt-2 mb-1 text-[11px] font-medium uppercase tracking-[0.05em] ${accent ? 'text-accent-muted' : 'text-text-tertiary'}`}
    >
      {children}
    </p>
  );
}

function PayLine({ label, value, bold, dim, accent, green, saved, size }: {
  label: string; value: number; bold?: boolean; dim?: boolean; accent?: boolean; green?: boolean; saved?: number; size?: number;
}) {
  return (
    <div className="flex items-center justify-between py-1" style={{ fontSize: size || (bold ? 14 : 13) }}>
      <span className={accent ? 'text-accent font-medium' : 'text-text-secondary'}>{label}</span>
      <span className="flex items-center gap-2">
        <span className={`font-mono ${bold ? `font-bold ${green ? 'text-success' : 'text-text-primary'}` : dim ? 'text-text-tertiary' : accent ? 'font-medium text-accent' : 'text-text-secondary'}`}>
          {formatDollarCents(value)}
        </span>
        {saved !== undefined && saved > 0.01 && (
          <span className="text-[11px] text-success font-medium whitespace-nowrap">↓ saves {formatDollarCents(saved)}</span>
        )}
      </span>
    </div>
  );
}
