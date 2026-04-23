import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Loader2, Info, Download } from 'lucide-react';
import { useProposalStore } from '@/features/proposal/store/proposal.store';
import { usePDFGeneration } from '@/features/proposal/hooks/usePDFGeneration';
import { useProposalPersistence } from '@/features/proposal/hooks/useProposalPersistence';
import { PaycheckComparison } from '@/features/informed-analysis/components/PaycheckComparison';
import { ImplementationTimeline } from '@/features/proposal/components/results/ImplementationTimeline';
import { FAQAccordion } from '@/features/proposal/components/results/FAQAccordion';
import { DisclaimerCard } from '@/features/proposal/components/results/DisclaimerCard';
import { StickyActionBar } from '@/features/proposal/components/results/StickyActionBar';
import { Toast } from '@/features/proposal/components/shared/Toast';
import { payPeriodsPerYear, formatDollar, formatDollarCents } from '@/utils/format';
import { getFederalMarginalRate } from '@/features/proposal/engine';
import { STATE_TAX_RATES } from '@/config/tax-rates';
import { FICA_RATES, ADMIN_FEE_PER_EMPLOYEE_PER_MONTH } from '@/config/fica-rates';
import type { PaycheckComparison as PaycheckComparisonType, TierResult } from '@/features/proposal/types/proposal.types';

const DISCLAIMER_TEXT = 'This proposal is for illustrative purposes only and does not constitute a guarantee of savings. Actual results may vary based on final enrollment, payroll data, and plan configuration.';

interface ResultsSectionProps {
  groupId: string;
}

interface TierPaycheckData {
  tierResult: TierResult;
  grossPayPerPeriod: number;
  preNetPerPeriod: number;
  postNetPerPeriod: number;
  employeeNetChange: number;
  employeeNetChangeMonthly: number;
  employerSavingsPerPeriod: number;
  employerSavingsPerMonth: number;
  isPositive: boolean;
}

export function ResultsSection({ groupId }: ResultsSectionProps) {
  const { result, isCalculating, company, resetAll, states, filingStatus, tiers } = useProposalStore((s) => s);
  const { downloadPDF, isGenerating } = usePDFGeneration();
  const { save, isSaving } = useProposalPersistence(groupId);
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleSave = useCallback(async () => {
    try {
      await save();
    } catch {
      /* handled in hook */
    }
    const msg = company.name
      ? `Proposal saved to ${company.name}'s portal profile`
      : 'Proposal saved';
    setToastMessage(msg);
    setToastVisible(true);
  }, [save, company.name]);

  const periods = result ? payPeriodsPerYear(company.payrollFrequency) : 26;

  const weightedFiling: 'single' | 'married' | 'hoh' = useMemo(() => {
    if (filingStatus.married >= filingStatus.single && filingStatus.married >= filingStatus.headOfHousehold) return 'married';
    if (filingStatus.headOfHousehold > filingStatus.single) return 'hoh';
    return 'single';
  }, [filingStatus]);

  const weightedStateRate = useMemo(() => {
    if (states.length === 0) return 0.05;
    return states.reduce((s, st) => s + (STATE_TAX_RATES[st.stateCode] ?? 0) * (st.workforcePercent / 100), 0);
  }, [states]);

  const tierPaycheckData = useMemo<TierPaycheckData[]>(() => {
    if (!result || result.tierResults.length === 0) return [];

    return result.tierResults.map((tr) => {
      const grossPay = tr.avgSalary / periods;
      const preTaxPerPay = tr.avgPreTaxDeduction / periods;
      const federalRate = getFederalMarginalRate(tr.avgSalary, weightedFiling);
      const ficaRate = FICA_RATES.combined;

      const fedBefore = grossPay * federalRate;
      const stateBefore = grossPay * weightedStateRate;
      const ficaBefore = grossPay * ficaRate;
      const netBefore = grossPay - fedBefore - stateBefore - ficaBefore;

      const taxableAfter = grossPay - preTaxPerPay;
      const fedAfter = taxableAfter * federalRate;
      const stateAfter = taxableAfter * weightedStateRate;
      const ficaAfter = taxableAfter * ficaRate;
      const netAfter = taxableAfter - fedAfter - stateAfter - ficaAfter;

      const increase = netAfter - netBefore;

      return {
        tierResult: tr,
        grossPayPerPeriod: Math.round(grossPay * 100) / 100,
        preNetPerPeriod: Math.round(netBefore * 100) / 100,
        postNetPerPeriod: Math.round(netAfter * 100) / 100,
        employeeNetChange: Math.round(increase * 100) / 100,
        employeeNetChangeMonthly: Math.round((increase * periods / 12) * 100) / 100,
        employerSavingsPerPeriod: Math.round((tr.ficaSavingsPerEmployee / periods) * 100) / 100,
        employerSavingsPerMonth: Math.round((tr.ficaSavingsPerEmployee / 12) * 100) / 100,
        isPositive: increase > 0,
      };
    });
  }, [result, periods, weightedFiling, weightedStateRate]);

  const avgPaycheckComparison = useMemo<PaycheckComparisonType | undefined>(() => {
    if (!result || result.tierResults.length === 0) return undefined;
    const totalWeight = tiers.reduce((s, t) => s + t.workforcePercent, 0);
    if (totalWeight === 0) return undefined;

    const weightedSalary = tiers.reduce((s, t, i) => {
      const tierResult = result.tierResults[i];
      return s + (tierResult ? tierResult.avgSalary : 0) * (t.workforcePercent / totalWeight);
    }, 0);
    const weightedPreTax = tiers.reduce((s, t, i) => {
      const tierResult = result.tierResults[i];
      return s + (tierResult ? tierResult.avgPreTaxDeduction : 0) * (t.workforcePercent / totalWeight);
    }, 0);

    const grossPay = weightedSalary / periods;
    const preTaxPerPay = weightedPreTax / periods;
    const federalRate = getFederalMarginalRate(weightedSalary, weightedFiling);
    const ficaRate = FICA_RATES.combined;

    const fedBefore = grossPay * federalRate;
    const stateBefore = grossPay * weightedStateRate;
    const ficaBefore = grossPay * ficaRate;
    const netBefore = grossPay - fedBefore - stateBefore - ficaBefore;

    const taxableAfter = grossPay - preTaxPerPay;
    const fedAfter = taxableAfter * federalRate;
    const stateAfter = taxableAfter * weightedStateRate;
    const ficaAfter = taxableAfter * ficaRate;
    const netAfter = taxableAfter - fedAfter - stateAfter - ficaAfter;

    const increase = netAfter - netBefore;

    return {
      tier: 'Average Employee',
      grossPay: Math.round(grossPay * 100) / 100,
      before: {
        federalTax: Math.round(fedBefore * 100) / 100,
        stateTax: Math.round(stateBefore * 100) / 100,
        fica: Math.round(ficaBefore * 100) / 100,
        postTaxDeductions: 0,
        netPay: Math.round(netBefore * 100) / 100,
      },
      withPlan: {
        preTaxDeduction: Math.round(preTaxPerPay * 100) / 100,
        federalTax: Math.round(fedAfter * 100) / 100,
        stateTax: Math.round(stateAfter * 100) / 100,
        fica: Math.round(ficaAfter * 100) / 100,
        postTaxDeductions: 0,
        netPay: Math.round(netAfter * 100) / 100,
      },
      perPaycheckIncrease: Math.round(increase * 100) / 100,
      annualIncrease: Math.round(increase * periods * 100) / 100,
    };
  }, [result, periods, weightedFiling, weightedStateRate, tiers]);

  if (isCalculating) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-5 w-5 animate-spin text-accent" />
        <span className="ml-2 text-[14px] text-text-secondary">Calculating savings...</span>
      </div>
    );
  }

  if (!result) {
    return (
      <div id="results" className="glass-secondary !border-dashed !border-border-glass-light p-12 text-center">
        <p className="text-[14px] text-text-tertiary">
          Complete the sections above to see your savings projection.
        </p>
      </div>
    );
  }

  const netPayReducedCount = result.qualifiedEmployees - result.positivelyImpactedCount;
  const totalPositiveEmployeeSavings = result.avgEmployeeAnnualSavings * result.positivelyImpactedCount;
  const avgPreTax = result.tierResults.length > 0
    ? result.tierResults.reduce((s: number, t) => s + t.avgPreTaxDeduction * t.employeeCount, 0) / result.totalEmployees
    : 0;
  const avgPreTaxMonthly = avgPreTax / 12;
  const adminFeeMonthly = ADMIN_FEE_PER_EMPLOYEE_PER_MONTH;
  const totalMonthlyACH = avgPreTaxMonthly + adminFeeMonthly;
  const payCycleLabel = company.payrollFrequency === 'weekly' ? 'Weekly' : company.payrollFrequency === 'biweekly' ? 'Bi-weekly' : company.payrollFrequency === 'semimonthly' ? 'Semi-monthly' : 'Monthly';

  return (
    <>
      <motion.div id="results" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-5" style={{ paddingBottom: 72 }}>
        {/* Disclaimer Banner */}
        <div
          className="flex items-center gap-2 rounded-lg px-4 py-2.5"
          style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.15)' }}
        >
          <Info size={15} className="flex-shrink-0 text-accent" style={{ opacity: 0.7 }} />
          <p className="text-[12px] leading-snug text-text-tertiary">{DISCLAIMER_TEXT}</p>
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 1 — CONGRATULATIONS HEADER
        ═══════════════════════════════════════════════ */}
        <div
          className="overflow-hidden rounded-[18px]"
          style={{
            background: 'linear-gradient(135deg, #2E8BE8 0%, #1E5A9E 100%)',
            border: '1px solid rgba(59, 130, 246, 0.3)',
          }}
        >
          <div className="px-8 py-10">
            <p className="text-[13px] font-semibold uppercase tracking-[0.15em] text-white" style={{ opacity: 0.8 }}>
              Section 125 Cafeteria Plan
            </p>
            <h1 className="mt-3 text-[32px] font-bold leading-tight text-white">
              Congratulations {company.name || 'Your Company'}!
              <br />
              <span style={{ color: '#F7F8FC' }}>Your Customized Proposal is Ready</span>
            </h1>
            <p className="mt-3 text-[14px]" style={{ color: 'rgba(255,255,255,0.75)' }}>
              Prepared {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} &middot; {payCycleLabel} Pay Cycle
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 2 — SUMMARY STAT CARDS (top row)
        ═══════════════════════════════════════════════ */}
        <div className="glass-primary !p-0 overflow-hidden">
          {/* Total Employees — full-width */}
          <div className="text-center py-5 px-6" style={{ borderBottom: '1px solid rgba(15, 11, 46, 0.08)' }}>
            <p className="font-mono text-[36px] font-bold text-text-primary">{result.totalEmployees}</p>
            <p className="mt-1 text-[13px] font-medium text-text-secondary">Total Employees</p>
          </div>

          {/* 3-column stat row */}
          <div className="grid grid-cols-3">
            <div className="text-center py-5 px-4" style={{ borderRight: '1px solid rgba(15, 11, 46, 0.08)' }}>
              <p className="font-mono text-[28px] font-bold text-success">{result.positivelyImpactedCount}</p>
              <p className="mt-1 text-[12px] text-text-secondary">
                Net Pay <strong className="text-success">Increased</strong> Employees
              </p>
            </div>
            <div className="text-center py-5 px-4" style={{ borderRight: '1px solid rgba(15, 11, 46, 0.08)' }}>
              <p className="font-mono text-[28px] font-bold text-text-secondary">{netPayReducedCount > 0 ? netPayReducedCount : 0}</p>
              <p className="mt-1 text-[12px] text-text-secondary">
                Net Pay <strong className="text-error">Reduced</strong> Employees
              </p>
            </div>
            <div className="text-center py-5 px-4">
              <p className="font-mono text-[28px] font-bold text-text-primary">{result.qualifiedEmployees}</p>
              <p className="mt-1 text-[12px] text-text-secondary">Total Eligible Employees</p>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 3 — POTENTIAL ANNUAL SAVINGS
        ═══════════════════════════════════════════════ */}
        <div className="glass-primary">
          <h3 className="text-[18px] font-semibold text-text-primary mb-5">Potential Annual Savings</h3>

          <div className="grid grid-cols-3 gap-4 mb-5">
            <div
              className="rounded-[14px] p-5 text-center"
              style={{ background: 'rgba(59, 130, 246, 0.04)', border: '1px solid rgba(59, 130, 246, 0.15)' }}
            >
              <p className="font-mono text-[24px] font-bold text-accent">{formatDollar(result.employerAnnualFICASavings)}</p>
              <p className="mt-2 text-[12px] font-medium text-text-secondary">
                Net Employer Savings
              </p>
              <p className="text-[11px] text-text-tertiary">(Total Eligible Employees)</p>
            </div>
            <div
              className="rounded-[14px] p-5 text-center"
              style={{ background: '#F7F8FC', border: '1px solid rgba(15, 11, 46, 0.08)' }}
            >
              <p className="font-mono text-[24px] font-bold text-text-primary">{formatDollar(result.employerAnnualFICASavings / 12)}</p>
              <p className="mt-2 text-[12px] font-medium text-text-secondary">
                Monthly Employer Savings
              </p>
              <p className="text-[11px] text-text-tertiary">({formatDollar(result.employerAnnualFICASavings / 12 / result.totalEmployees)} per employee)</p>
            </div>
            <div
              className="rounded-[14px] p-5 text-center"
              style={{ background: 'rgba(5, 150, 105, 0.06)', border: '1px solid rgba(5, 150, 105, 0.15)' }}
            >
              <p className="font-mono text-[24px] font-bold text-success">{formatDollar(result.avgEmployeeAnnualSavings)}</p>
              <p className="mt-2 text-[12px] font-medium text-text-secondary">
                Avg. Employee Annual Pay Increase
              </p>
              <p className="text-[11px] text-text-tertiary">(Per eligible employee)</p>
            </div>
          </div>

          {/* Aggregated bar */}
          <div
            className="rounded-[14px] py-5 px-6 text-center"
            style={{ background: 'rgba(217, 119, 6, 0.05)', border: '1px solid rgba(217, 119, 6, 0.15)' }}
          >
            <p className="font-mono text-[28px] font-bold text-text-primary">{formatDollar(totalPositiveEmployeeSavings)}</p>
            <p className="mt-1 text-[13px] text-text-secondary">
              Aggregated Annual Employee Pay Increase <span className="text-text-tertiary">(Net Pay Increased Employees Only)</span>
            </p>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 4 — TIER BREAKDOWN (Employee Breakdown style)
        ═══════════════════════════════════════════════ */}
        <div className="glass-primary overflow-hidden !p-0">
          <div className="px-6 py-4">
            <h3 className="text-[18px] font-semibold text-text-primary">Tier Breakdown</h3>
            <p className="mt-0.5 text-[12px] text-text-tertiary">Estimated per-paycheck impact by salary tier</p>
          </div>

          {/* Table Header */}
          <div
            className="grid gap-4 px-6 py-2.5 text-[11px] font-semibold uppercase tracking-[0.05em] text-text-tertiary"
            style={{ background: '#F7F8FC', gridTemplateColumns: '1.5fr 1fr 1fr 1fr' }}
          >
            <div>Tier</div>
            <div className="text-right">Avg. Gross Pay</div>
            <div className="text-right">Pre-Plan Net</div>
            <div className="text-right">Post-Plan Net</div>
          </div>

          {/* Table Rows */}
          {tierPaycheckData.map((td, i) => (
            <div
              key={td.tierResult.tier}
              className="grid gap-4 px-6 py-3.5 text-[14px] items-center"
              style={{
                background: i % 2 === 0 ? '#FFFFFF' : '#F7F8FC',
                gridTemplateColumns: '1.5fr 1fr 1fr 1fr',
              }}
            >
              <div>
                <p className="font-semibold text-text-primary">{td.tierResult.tier}</p>
                <p className="text-[11px] text-text-tertiary">{td.tierResult.employeeCount} employees</p>
              </div>
              <div className="text-right font-mono text-text-secondary">{formatDollarCents(td.grossPayPerPeriod)}</div>
              <div className="text-right font-mono text-text-secondary">{formatDollarCents(td.preNetPerPeriod)}</div>
              <div className="text-right">
                <span
                  className="inline-block rounded-full px-3 py-1 font-mono font-semibold text-[13px]"
                  style={{
                    background: td.isPositive ? 'rgba(5, 150, 105, 0.1)' : 'rgba(220, 38, 38, 0.08)',
                    color: td.isPositive ? '#059669' : '#DC2626',
                  }}
                >
                  {formatDollarCents(td.postNetPerPeriod)}
                </span>
              </div>
            </div>
          ))}

          {/* Pagination-style footer */}
          <div className="px-6 py-3 text-[12px] text-text-tertiary" style={{ borderTop: '1px solid rgba(15, 11, 46, 0.08)' }}>
            Showing <strong className="text-text-secondary">1–{tierPaycheckData.length}</strong> of <strong className="text-text-secondary">{tierPaycheckData.length}</strong> tiers
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 5 — EMPLOYER BREAKDOWN
        ═══════════════════════════════════════════════ */}
        <div
          className="overflow-hidden rounded-[18px]"
          style={{ border: '1px solid rgba(59, 130, 246, 0.2)' }}
        >
          <div className="px-6 py-4" style={{ background: 'rgba(59, 130, 246, 0.03)' }}>
            <h3 className="text-[18px] font-semibold text-text-primary">Employer Breakdown</h3>
          </div>

          {/* Table Header */}
          <div
            className="grid gap-3 px-6 py-2.5 text-[10px] font-semibold uppercase tracking-[0.05em] text-text-tertiary"
            style={{ background: '#F7F8FC', gridTemplateColumns: '1.3fr 1fr 1fr 1fr 1fr' }}
          >
            <div>Tier</div>
            <div className="text-right">Employee Net Take Home Pay Change</div>
            <div className="text-right">Employee Net Take Home Pay Change Per Month</div>
            <div className="text-right">Employer Net Savings Per Pay Period</div>
            <div className="text-right">Employer Net Savings Per Month</div>
          </div>

          {/* Table Rows */}
          {tierPaycheckData.map((td, i) => {
            const changeColor = td.employeeNetChange > 0.01 ? 'text-success' : td.employeeNetChange < -0.01 ? 'text-error' : 'text-warning';
            const changeBg = td.employeeNetChange > 0.01
              ? 'rgba(5, 150, 105, 0.06)'
              : td.employeeNetChange < -0.01
                ? 'rgba(220, 38, 38, 0.06)'
                : 'rgba(217, 119, 6, 0.06)';

            return (
              <div
                key={td.tierResult.tier}
                className="grid gap-3 px-6 py-3.5 text-[14px] items-center"
                style={{
                  background: i % 2 === 0 ? '#FFFFFF' : '#F7F8FC',
                  gridTemplateColumns: '1.3fr 1fr 1fr 1fr 1fr',
                }}
              >
                <div className="font-semibold text-text-primary">{td.tierResult.tier}</div>
                <div className="text-right font-mono" style={{ background: changeBg, borderRadius: 6, padding: '2px 8px' }}>
                  <span className={changeColor}>{formatDollarCents(td.employeeNetChange)}</span>
                </div>
                <div className="text-right font-mono" style={{ background: changeBg, borderRadius: 6, padding: '2px 8px' }}>
                  <span className={changeColor}>{formatDollarCents(td.employeeNetChangeMonthly)}</span>
                </div>
                <div className="text-right font-mono text-text-secondary">{formatDollarCents(td.employerSavingsPerPeriod)}</div>
                <div className="text-right font-mono text-text-secondary">{formatDollarCents(td.employerSavingsPerMonth)}</div>
              </div>
            );
          })}
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 6 — PAYCHECK COMPARISON
        ═══════════════════════════════════════════════ */}
        {avgPaycheckComparison && (
          <PaycheckComparison tiers={[avgPaycheckComparison]} payrollFrequency={payCycleLabel} />
        )}

        {/* ═══════════════════════════════════════════════
            SECTION 7 — HOW THE MATH WORKS
        ═══════════════════════════════════════════════ */}
        <div
          className="overflow-hidden rounded-[18px]"
          style={{
            background: '#FFFFFF',
            border: '1px solid rgba(59, 130, 246, 0.15)',
          }}
        >
          <div className="px-8 py-6">
            <h3 className="text-[22px] font-bold text-text-primary mb-5">How the Math Works</h3>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {/* Left — explanation */}
              <div className="text-[14px] leading-[1.8] text-text-secondary space-y-4">
                <p>
                  The Section 125 Cafeteria Plan works by converting eligible benefit premiums to pre-tax deductions
                  from each employee&rsquo;s paycheck. This reduces the employee&rsquo;s taxable income, which in
                  turn lowers their federal, state, and FICA tax withholdings.
                </p>
                <p>
                  The employer also benefits from this arrangement because FICA taxes (7.65%) are calculated on
                  taxable wages. When employee wages are reduced by pre-tax deductions, the employer&rsquo;s
                  matching FICA obligation decreases proportionally.
                </p>
                <p>
                  The plan generates a total payroll tax savings to the employer of{' '}
                  <strong className="text-accent">{formatDollar(result.employerAnnualFICASavings / 12)}</strong>{' '}
                  monthly ({formatDollar(avgPreTax * result.totalEmployees)} employee pre-tax &times; 7.65%).
                </p>
              </div>

              {/* Right — math breakdown */}
              <div className="flex flex-col items-center justify-center gap-3">
                <MathBlock
                  value={formatDollar(Math.round(avgPreTaxMonthly))}
                  suffix="/ employee / month"
                  label="Employee Pre-Tax Contribution"
                  sublabel={`Average pre-tax deduction across all tiers`}
                />
                <span className="text-[20px] font-bold text-text-tertiary">+</span>
                <MathBlock
                  value={`$${adminFeeMonthly}`}
                  suffix="/ employee / month"
                  label="Employer Administration Fee"
                />
                <span className="text-[20px] font-bold text-text-tertiary">=</span>
                <MathBlock
                  value={formatDollar(Math.round(totalMonthlyACH))}
                  suffix="/ employee / month"
                  label={`Total Monthly Cost from ${company.name || 'Employer'}`}
                  accent
                />
              </div>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 8 — SAVINGS OUTLOOK (range)
        ═══════════════════════════════════════════════ */}
        <div className="glass-primary">
          <h3 className="text-[18px] font-semibold text-text-primary mb-5">Savings Outlook</h3>
          <div className="grid grid-cols-3 gap-3">
            <div className="glass-secondary text-center">
              <p className="font-mono text-[18px] font-bold text-text-secondary">{formatDollar(result.savingsRange.conservative)}</p>
              <p className="mt-1 text-[12px] text-text-tertiary">Conservative</p>
              <p className="mt-0.5 text-[11px] text-text-tertiary">If participation is lower than expected</p>
            </div>
            <div className="glass-secondary text-center !border-accent-border" style={{ boxShadow: '0 0 24px rgba(59, 130, 246, 0.06)' }}>
              <p className="font-mono text-[22px] font-bold text-accent">{formatDollar(result.savingsRange.projected)}</p>
              <p className="mt-1 text-[12px] text-accent-muted">Projected Savings</p>
              <p className="mt-0.5 text-[11px] text-text-tertiary">Based on your inputs</p>
            </div>
            <div className="glass-secondary text-center">
              <p className="font-mono text-[18px] font-bold text-secondary">{formatDollar(result.savingsRange.optimal)}</p>
              <p className="mt-1 text-[12px] text-text-tertiary">Optimal</p>
              <p className="mt-0.5 text-[11px] text-text-tertiary">With maximum enrollment</p>
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════════════
            SECTION 9+ — IMPLEMENTATION, FAQ, DISCLAIMERS
        ═══════════════════════════════════════════════ */}
        <ImplementationTimeline />
        <FAQAccordion />
        <DisclaimerCard />

        {/* Tax note */}
        <div className="glass-secondary">
          <p className="text-[12px] leading-[1.6] text-text-tertiary">
            Tax calculations in this proposal are based on 2026 federal and state tax rates and may be subject to change.
          </p>
        </div>
      </motion.div>

      <StickyActionBar
        companyName={company.name}
        proposalType="quick_proposal"
        onDownloadPDF={downloadPDF}
        onSaveDraft={handleSave}
        onNewProposal={resetAll}
        isGeneratingPDF={isGenerating}
        isSaving={isSaving}
        newProposalLabel="New Proposal"
      />

      <Toast message={toastMessage} visible={toastVisible} onDismiss={() => setToastVisible(false)} />
    </>
  );
}

function MathBlock({ value, suffix, label, sublabel, accent }: {
  value: string;
  suffix: string;
  label: string;
  sublabel?: string;
  accent?: boolean;
}) {
  return (
    <div
      className="w-full rounded-[14px] px-5 py-4"
      style={{
        background: accent ? 'rgba(59, 130, 246, 0.05)' : '#F7F8FC',
        border: accent ? '1px solid rgba(59, 130, 246, 0.2)' : '1px solid rgba(15, 11, 46, 0.08)',
      }}
    >
      <p className={`font-mono text-[24px] font-bold ${accent ? 'text-accent' : 'text-text-primary'}`}>
        {value} <span className="text-[13px] font-normal text-text-tertiary">{suffix}</span>
      </p>
      <p className={`mt-1 text-[13px] font-semibold ${accent ? 'text-accent-muted' : 'text-text-secondary'}`}>{label}</p>
      {sublabel && <p className="mt-0.5 text-[11px] text-text-tertiary">{sublabel}</p>}
    </div>
  );
}
