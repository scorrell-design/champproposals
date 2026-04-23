import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
  Download,
  Plus,
  Minus,
} from 'lucide-react';
import { useProposalStore } from '@/features/proposal/store/proposal.store';
import { usePDFGeneration } from '@/features/proposal/hooks/usePDFGeneration';
import { formatDollar, formatDollarCents, payPeriodsPerYear } from '@/utils/format';
import { getFederalMarginalRate } from '@/features/proposal/engine';
import { STATE_TAX_RATES } from '@/config/tax-rates';
import { FICA_RATES, ADMIN_FEE_ANNUAL } from '@/config/fica-rates';
import type { TierResult } from '@/features/proposal/types/proposal.types';
import champLogo from '@/assets/champ-logo.png';

const ACCENT = '#3B82F6';
const ACCENT_HOVER = '#2563EB';
const PAGE_BG = '#0F0B2E';
const CARD = '#FFFFFF';
const CARD_BORDER = '1px solid rgba(15, 11, 46, 0.04)';
const CARD_SHADOW = '0 1px 2px rgba(15, 11, 46, 0.06), 0 8px 24px rgba(15, 11, 46, 0.08)';
const BTN_SHADOW = '0 4px 14px rgba(59, 130, 246, 0.3)';
const BTN_SHADOW_HOVER = '0 6px 20px rgba(59, 130, 246, 0.4)';
const INK = '#0F0B2E';
const TEXT_SEC = '#4A4560';
const TEXT_MUTED = '#8A85A0';
const ON_DARK = '#FFFFFF';
const ON_DARK_MUTED = 'rgba(255, 255, 255, 0.72)';
const SUCCESS = '#10B981';
const ERROR = '#EF4444';
const PILL = 999;
const FONT = '"Inter", system-ui, -apple-system, sans-serif';
const FONT_MONO = '"DM Mono", "SF Mono", monospace';

const DISCLAIMER_TEXT =
  'This proposal is for illustrative purposes only and does not constitute a guarantee of savings. Calculations apply the full standard FICA rate (6.2% Social Security + 1.45% Medicare) and 2026 federal tax tables. Actual results may vary based on final enrollment, payroll data, and plan configuration.';

const KEY_BENEFITS = [
  'Data-Driven Oversight',
  'Reduced HR Burden',
  'Compliance Confidence',
  'Payroll Tax Savings',
  'Improved Productivity',
  'Potential Claims Reduction',
  'Lower Renewal Rates',
  'Employee Retention',
  'Automated Administration',
];

const VALUE_PROPS = [
  { title: 'Cash Indemnity', body: 'Provide cash benefits that offset high deductibles and out-of-pocket expenses.' },
  { title: 'Tax Savings', body: 'Create capital for reinvestment\u2014turn employee benefits into measurable company savings.' },
  { title: 'Health & Wellbeing', body: 'Deliver next-gen programs that enhance employee health, happiness, and family wellness.' },
  { title: 'Plan Unlock', body: 'Empower employees to understand and navigate their major medical plan\u2014driving smarter utilization and fewer unnecessary claims.' },
  { title: 'Plan Clarity', body: 'Finally\u2014a tool that explains major-medical benefits in plain English and guides smarter care decisions.' },
  { title: 'Payroll Optimization', body: 'Reduce corporate payroll and potentially lower workers\u2019 comp premiums through strategic plan design.' },
  { title: 'Hospital Savings', body: 'Unlock access to free or discounted hospital care under 501(r) programs\u2014reducing member bills and employer claim costs.' },
  { title: 'Zero-Cost Care', body: 'Eliminate unnecessary claims with $0-cost virtual care and prescriptions\u2014driving down medical utilization and helping stabilize future renewal premiums.' },
];

const FAQ_ITEMS = [
  {
    q: 'How do employees benefit?',
    a: 'Eligible employees see an increase in take-home pay because their taxable income is reduced, lowering their federal income, Social Security, and Medicare taxes.',
  },
  {
    q: 'How does the employer benefit?',
    a: 'Employers save on FICA taxes (Social Security and Medicare) for every dollar that employees contribute pre-tax. This can result in significant payroll tax savings.',
  },
  {
    q: 'Who is qualified to participate?',
    a: 'Qualification is typically determined by factors such as filing status, income level, and number of dependents. Eligible employees are those who qualify and also would see a positive impact on their net pay.',
  },
  {
    q: 'How long does implementation take?',
    a: 'The entire process typically takes 2-3 weeks from initial setup to full implementation, with minimal disruption to your operations.',
  },
];

interface ResultsSectionProps {
  groupId: string;
}

interface TierPaycheckProfile {
  tierResult: TierResult;
  annualSalary: number;
  filingStatus: string;
  dependents: number;
  stateCode: string;
  grossPayPerPeriod: number;
  preTaxPerPeriod: number;
  fedBefore: number;
  stateBefore: number;
  ficaBefore: number;
  netBefore: number;
  fedAfter: number;
  stateAfter: number;
  ficaAfter: number;
  champBenefit: number;
  netAfter: number;
  delta: number;
  deltaPercent: number;
  annualIncrease: number;
  totalTaxSavings: number;
}

export function ResultsSection({ groupId: _groupId }: ResultsSectionProps) {
  const { result, isCalculating, company, states, filingStatus, tiers } = useProposalStore((s) => s);
  const { downloadPDF, isGenerating } = usePDFGeneration();

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

  const primaryState = useMemo(() => {
    if (states.length === 0) return 'TX';
    return states.reduce((best, s) => (s.workforcePercent > best.workforcePercent ? s : best), states[0]).stateCode;
  }, [states]);

  const filingLabel = useMemo(() => {
    if (weightedFiling === 'married') return 'Married Filing Jointly';
    if (weightedFiling === 'hoh') return 'Head of Household';
    return 'Single';
  }, [weightedFiling]);

  const tierProfiles = useMemo<TierPaycheckProfile[]>(() => {
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
      const adminPerPay = ADMIN_FEE_ANNUAL / periods;
      const champBenefit = preTaxPerPay - adminPerPay;
      const netAfter = grossPay - preTaxPerPay - fedAfter - stateAfter - ficaAfter;

      const delta = netAfter - netBefore;
      const deltaPercent = netBefore > 0 ? (delta / netBefore) * 100 : 0;
      const fedSaved = fedBefore - fedAfter;
      const stateSaved = stateBefore - stateAfter;
      const ficaSaved = ficaBefore - ficaAfter;
      const totalTaxSavings = (fedSaved + stateSaved + ficaSaved) * periods;

      return {
        tierResult: tr,
        annualSalary: tr.avgSalary,
        filingStatus: filingLabel,
        dependents: weightedFiling === 'single' ? 0 : weightedFiling === 'hoh' ? 1 : 2,
        stateCode: primaryState,
        grossPayPerPeriod: round2(grossPay),
        preTaxPerPeriod: round2(preTaxPerPay),
        fedBefore: round2(fedBefore),
        stateBefore: round2(stateBefore),
        ficaBefore: round2(ficaBefore),
        netBefore: round2(netBefore),
        fedAfter: round2(fedAfter),
        stateAfter: round2(stateAfter),
        ficaAfter: round2(ficaAfter),
        champBenefit: round2(champBenefit),
        netAfter: round2(netAfter),
        delta: round2(delta),
        deltaPercent: Math.round(deltaPercent * 100) / 100,
        annualIncrease: round2(delta * periods),
        totalTaxSavings: round2(totalTaxSavings),
      };
    });
  }, [result, periods, weightedFiling, weightedStateRate, primaryState, filingLabel]);

  const benefittingProfile = useMemo(() => {
    if (tierProfiles.length < 2) return tierProfiles[0] ?? null;
    return tierProfiles[1];
  }, [tierProfiles]);

  const nonBenefittingProfile = useMemo(() => {
    const negative = tierProfiles.filter((p) => p.delta < 0);
    if (negative.length === 0) return null;
    return negative.reduce((worst, p) => (p.delta < worst.delta ? p : worst), negative[0]);
  }, [tierProfiles]);

  const [paycheckOpen, setPaycheckOpen] = useState(true);
  const [detailedOpen, setDetailedOpen] = useState(false);
  const [activePaycheckTab, setActivePaycheckTab] = useState<'benefitting' | 'non-benefitting'>('benefitting');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const handleDownloadPDF = useCallback(async () => {
    await downloadPDF();
  }, [downloadPDF]);

  if (isCalculating) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="h-5 w-5 animate-spin rounded-full border-2 border-t-transparent" style={{ borderColor: ACCENT, borderTopColor: 'transparent' }} />
        <span className="ml-2 text-[14px]" style={{ color: TEXT_MUTED }}>Calculating savings...</span>
      </div>
    );
  }

  if (!result) {
    return (
      <div id="results" className="p-12 text-center rounded-2xl" style={{ background: CARD, border: CARD_BORDER, boxShadow: CARD_SHADOW }}>
        <p className="text-[14px]" style={{ color: TEXT_MUTED }}>
          Complete the sections above to see your savings projection.
        </p>
      </div>
    );
  }

  const participationRate = result.totalEmployees > 0
    ? Math.round((result.positivelyImpactedCount / result.totalEmployees) * 100)
    : 0;
  const perEmployeeBenefit = result.positivelyImpactedCount > 0
    ? Math.round(result.avgEmployeeAnnualSavings)
    : 0;

  return (
    <div id="results" style={{ background: PAGE_BG, borderRadius: 24, overflow: 'hidden', fontFamily: FONT }}>
      {/* B1 — Sticky Header */}
      <div
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 50,
          height: 72,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 32px',
          background: '#1A1548',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <ShieldCheck size={22} style={{ color: ACCENT }} />
          <span style={{ fontWeight: 600, fontSize: 18, color: ON_DARK }}>The CHAMP Plan</span>
        </div>
        <button
          style={{
            background: ACCENT,
            color: ON_DARK,
            borderRadius: PILL,
            padding: '8px 24px',
            fontWeight: 600,
            fontSize: 14,
            border: 'none',
            cursor: 'pointer',
            boxShadow: BTN_SHADOW,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = ACCENT_HOVER; e.currentTarget.style.boxShadow = BTN_SHADOW_HOVER; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = ACCENT; e.currentTarget.style.boxShadow = BTN_SHADOW; }}
        >
          Contact Us
        </button>
      </div>

      <div style={{ padding: '0 32px 48px', maxWidth: 1040, margin: '0 auto' }}>
        {/* B2 — Hero */}
        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <img src={champLogo} alt="Champion Health, Inc." style={{ maxHeight: 96, margin: '0 auto' }} />
          <h1 style={{ fontWeight: 800, fontSize: 36, letterSpacing: '-0.02em', color: ON_DARK, marginTop: 24 }}>
            Your Customized CHAMP Proposal
          </h1>
          <div style={{ width: 120, height: 2, background: ACCENT, margin: '12px auto 0' }} />
          <span
            style={{
              display: 'inline-block',
              marginTop: 16,
              background: ACCENT,
              color: ON_DARK,
              fontWeight: 600,
              fontSize: 12,
              padding: '4px 14px',
              borderRadius: PILL,
            }}
          >
            AI-Generated
          </span>
        </div>

        {/* B3 — KPI Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 24, marginTop: 48 }}>
          <KPICard
            label="Anticipated Employee Participation Rate"
            value={`${participationRate}%`}
            caption="estimated voluntary participation among eligible employees based on internal modeling assumptions and historical participation patterns"
          />
          <KPICard
            label="Annual Company Savings"
            value={formatDollar(result.netAnnualBenefit)}
            caption="estimated total employer payroll tax savings"
          />
          <KPICard
            label="Per Employee Benefit"
            value={formatDollar(perEmployeeBenefit)}
            caption="average annual take-home pay increase per qualified employee"
          />
        </div>

        {/* B4 — Key Benefits */}
        <div style={{ marginTop: 56, textAlign: 'center' }}>
          <h2 style={{ fontWeight: 800, fontSize: 20, letterSpacing: '-0.02em', color: ON_DARK }}>Key Benefits</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: 12, marginTop: 24 }}>
            {KEY_BENEFITS.map((b) => (
              <span
                key={b}
                style={{
                  background: CARD,
                  border: `1px solid rgba(59, 130, 246, 0.2)`,
                  borderRadius: PILL,
                  padding: '10px 20px',
                  fontSize: 14,
                  fontWeight: 500,
                  color: INK,
                  boxShadow: CARD_SHADOW,
                }}
              >
                {b}
              </span>
            ))}
          </div>
        </div>

        {/* B5 — How We Calculate */}
        <WhiteCard style={{ marginTop: 56 }}>
          <h2 style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', color: INK, textAlign: 'center' }}>How We Calculate</h2>
          <p style={{ fontSize: 15, lineHeight: 1.65, color: TEXT_SEC, textAlign: 'center', maxWidth: 820, margin: '16px auto 0' }}>
            Our sample illustration tool combines industry-standard wages, national W-4 filing patterns, and average U.S. household statistics to create realistic employee populations by industry. With minimal inputs, we can quickly estimate a hypothetical assessment as to the feasibility of implementing the CHAMP plan. For accurate assessments a more detailed analysis needs to be provided.
          </p>
        </WhiteCard>

        {/* B6 — Paycheck Comparison */}
        <WhiteCard style={{ marginTop: 32 }}>
          <CollapsibleHeader title="Paycheck Comparison" open={paycheckOpen} onToggle={() => setPaycheckOpen(!paycheckOpen)} />
          <AnimatePresence initial={false}>
            {paycheckOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ marginTop: 20 }}>
                  {/* Tab switcher */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                    <PillTab
                      label="Benefitting Employee Example"
                      active={activePaycheckTab === 'benefitting'}
                      onClick={() => setActivePaycheckTab('benefitting')}
                    />
                    <PillTab
                      label="Non-Benefiting Employee Example"
                      active={activePaycheckTab === 'non-benefitting'}
                      onClick={() => setActivePaycheckTab('non-benefitting')}
                    />
                  </div>

                  {activePaycheckTab === 'benefitting' && benefittingProfile && (
                    <PaycheckTab profile={benefittingProfile} positive periods={periods} />
                  )}

                  {activePaycheckTab === 'non-benefitting' && (
                    nonBenefittingProfile ? (
                      <PaycheckTab profile={nonBenefittingProfile} positive={false} periods={periods} />
                    ) : (
                      <p style={{ color: TEXT_MUTED, fontSize: 14, fontStyle: 'italic', textAlign: 'center', padding: '32px 0' }}>
                        No employees are projected to see a net decrease under this plan configuration.
                      </p>
                    )
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </WhiteCard>

        {/* B7 — Detailed Analysis */}
        <WhiteCard style={{ marginTop: 32 }}>
          <CollapsibleHeader title="Detailed Analysis" open={detailedOpen} onToggle={() => setDetailedOpen(!detailedOpen)} />
          <AnimatePresence initial={false}>
            {detailedOpen && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                style={{ overflow: 'hidden' }}
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginTop: 20 }}>
                  {/* Employee Eligibility */}
                  <div style={{ background: '#F7F8FC', border: CARD_BORDER, borderRadius: 16, padding: 24 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.01em', color: INK, textAlign: 'center' }}>Employee Eligibility</h3>
                    <div style={{ width: 60, height: 2, background: ACCENT, margin: '8px auto 20px' }} />
                    <StatRow label="Total Eligible Employees" value={String(result.totalEmployees)} />
                    <StatRow label="Eligible Employees" value={String(result.qualifiedEmployees)} />
                    <StatRow label="Employees with positive net take-home pay" value={String(result.positivelyImpactedCount)} />
                    <StatRow label="Participation rate of eligible employees" value={`${participationRate}%`} />
                  </div>

                  {/* Financial Impact */}
                  <div style={{ background: '#F7F8FC', border: CARD_BORDER, borderRadius: 16, padding: 24 }}>
                    <h3 style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.01em', color: INK, textAlign: 'center' }}>Financial Impact</h3>
                    <div style={{ width: 60, height: 2, background: ACCENT, margin: '8px auto 20px' }} />
                    <StatRow label="Employer Annual Savings (Net of Fees):" value={formatDollar(result.netAnnualBenefit)} />
                    <StatRow label="Monthly Per Employee:" value={formatDollar(Math.round(result.netAnnualBenefit / result.totalEmployees / 12))} />
                  </div>
                </div>

                {/* Statistically Significant notice */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginTop: 20,
                    padding: '14px 20px',
                    background: '#F7F8FC',
                    border: CARD_BORDER,
                    borderRadius: 12,
                  }}
                >
                  <CheckCircle2 size={20} style={{ color: SUCCESS, flexShrink: 0 }} />
                  <p style={{ fontSize: 14, color: INK }}>
                    <strong>Statistically Significant:</strong>{' '}
                    <span style={{ color: TEXT_SEC }}>
                      This analysis is based on a sample size of {result.totalEmployees} employees, which provides a statistically significant result.
                    </span>
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </WhiteCard>

        {/* B8 — Value Proposition */}
        <div style={{ marginTop: 56, textAlign: 'center' }}>
          <h2 style={{ fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em', color: ON_DARK }}>Value Proposition</h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 20,
              marginTop: 32,
              textAlign: 'left',
            }}
          >
            {VALUE_PROPS.map((vp, i) => (
              <div
                key={i}
                style={{
                  background: CARD,
                  border: CARD_BORDER,
                  boxShadow: CARD_SHADOW,
                  borderRadius: 16,
                  padding: 24,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      background: ACCENT,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: 16,
                      color: ON_DARK,
                      flexShrink: 0,
                    }}
                  >
                    {i + 1}
                  </div>
                  <span style={{ fontWeight: 700, fontSize: 16, color: INK }}>{vp.title}</span>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.5, color: TEXT_SEC, marginTop: 12 }}>{vp.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* B9 — FAQ */}
        <div style={{ marginTop: 56 }}>
          <h2 style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', color: ON_DARK, textAlign: 'center', marginBottom: 24 }}>
            Frequently Asked Questions
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {FAQ_ITEMS.map((item, i) => (
              <div
                key={i}
                style={{
                  background: CARD,
                  border: CARD_BORDER,
                  boxShadow: CARD_SHADOW,
                  borderRadius: 12,
                  overflow: 'hidden',
                }}
              >
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: 16, color: ACCENT }}>{item.q}</span>
                  <motion.span animate={{ rotate: faqOpen === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                    <ChevronDown size={18} style={{ color: ACCENT }} />
                  </motion.span>
                </button>
                <AnimatePresence initial={false}>
                  {faqOpen === i && (
                    <motion.div
                      initial={{ height: 0 }}
                      animate={{ height: 'auto' }}
                      exit={{ height: 0 }}
                      transition={{ duration: 0.2 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <p style={{ padding: '0 20px 16px', fontSize: 15, lineHeight: 1.6, color: TEXT_SEC }}>
                        {item.a}
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>

        {/* B10 — CTA Block */}
        <WhiteCard style={{ marginTop: 56, textAlign: 'center' }}>
          <h2 style={{ fontWeight: 800, fontSize: 24, letterSpacing: '-0.02em', color: ACCENT }}>
            Ready to boost employee satisfaction and reduce tax liability?
          </h2>
          <p style={{ fontSize: 16, color: TEXT_SEC, marginTop: 12 }}>
            Our dedicated team will guide you through every step of the implementation process.
          </p>
        </WhiteCard>

        {/* B11 — Disclaimer */}
        <WhiteCard style={{ marginTop: 32, textAlign: 'center' }}>
          <h3 style={{ fontWeight: 700, fontSize: 18, letterSpacing: '-0.01em', color: INK }}>Disclaimer</h3>
          <p style={{ fontSize: 13, lineHeight: 1.6, color: TEXT_MUTED, marginTop: 12 }}>
            {DISCLAIMER_TEXT}
          </p>
        </WhiteCard>

        {/* B12 — Download Button */}
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
          <button
            onClick={handleDownloadPDF}
            disabled={isGenerating}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              background: ACCENT,
              color: ON_DARK,
              fontWeight: 600,
              fontSize: 16,
              padding: '14px 32px',
              borderRadius: PILL,
              border: 'none',
              cursor: isGenerating ? 'wait' : 'pointer',
              opacity: isGenerating ? 0.6 : 1,
              boxShadow: BTN_SHADOW,
            }}
            onMouseEnter={(e) => { if (!isGenerating) { e.currentTarget.style.background = ACCENT_HOVER; e.currentTarget.style.boxShadow = BTN_SHADOW_HOVER; } }}
            onMouseLeave={(e) => { if (!isGenerating) { e.currentTarget.style.background = ACCENT; e.currentTarget.style.boxShadow = BTN_SHADOW; } }}
          >
            <Download size={18} />
            {isGenerating ? 'Generating...' : 'Download Full Proposal'}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Helper components ─────────────────────────────────────────── */

function KPICard({ label, value, caption }: { label: string; value: string; caption: string }) {
  return (
    <div
      style={{
        background: CARD,
        border: CARD_BORDER,
        boxShadow: CARD_SHADOW,
        borderRadius: 16,
        borderLeft: `4px solid ${ACCENT}`,
        padding: '32px 24px',
        textAlign: 'center',
      }}
    >
      <p style={{ fontWeight: 600, fontSize: 16, color: TEXT_SEC }}>{label}</p>
      <p style={{ fontWeight: 700, fontSize: 56, color: INK, marginTop: 8, lineHeight: 1 }}>{value}</p>
      <p style={{ fontSize: 13, color: TEXT_MUTED, marginTop: 12, lineHeight: 1.5 }}>{caption}</p>
    </div>
  );
}

function WhiteCard({ children, style }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        background: CARD,
        border: CARD_BORDER,
        boxShadow: CARD_SHADOW,
        borderRadius: 16,
        padding: 32,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function CollapsibleHeader({ title, open, onToggle }: { title: string; open: boolean; onToggle: () => void }) {
  return (
    <button
      onClick={onToggle}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
      }}
    >
      <h2 style={{ fontWeight: 800, fontSize: 22, letterSpacing: '-0.02em', color: INK }}>{title}</h2>
      {open ? <Minus size={20} style={{ color: TEXT_MUTED }} /> : <Plus size={20} style={{ color: TEXT_MUTED }} />}
    </button>
  );
}

function PillTab({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 20px',
        borderRadius: PILL,
        fontWeight: 600,
        fontSize: 14,
        border: active ? 'none' : `1px solid rgba(15, 11, 46, 0.14)`,
        background: active ? ACCENT : 'transparent',
        color: active ? ON_DARK : TEXT_SEC,
        cursor: 'pointer',
        transition: 'all 200ms',
      }}
    >
      {label}
    </button>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(15, 11, 46, 0.06)' }}>
      <span style={{ fontSize: 14, color: TEXT_SEC }}>{label}</span>
      <span style={{ fontWeight: 700, fontSize: 18, color: INK }}>{value}</span>
    </div>
  );
}

function PaycheckTab({ profile, positive, periods }: { profile: TierPaycheckProfile; positive: boolean; periods: number }) {
  const deltaColor = positive ? SUCCESS : ERROR;
  const sign = positive ? '+' : '';
  const fedSaved = profile.fedBefore - profile.fedAfter;
  const stateSaved = profile.stateBefore - profile.stateAfter;
  const ficaSaved = profile.ficaBefore - profile.ficaAfter;
  const totalTaxSavingsAnnual = (fedSaved + stateSaved + ficaSaved) * periods;
  const increasePct = profile.netBefore > 0 ? ((profile.delta / profile.netBefore) * 100) : 0;

  return (
    <div>
      {/* Employee Profile bar */}
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em', color: INK }}>Employee Profile</h3>
        <div style={{ width: 60, height: 2, background: ACCENT, margin: '6px auto 16px' }} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap' }}>
          <ProfileStat label="Annual Salary" value={formatDollar(profile.annualSalary)} />
          <ProfileStat label="Filing Status" value={profile.filingStatus} />
          <ProfileStat label="Dependents" value={String(profile.dependents)} />
          <ProfileStat label="State" value={profile.stateCode} />
        </div>
      </div>

      {/* Two-column paycheck comparison */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        {/* Current Paycheck */}
        <div style={{ background: '#F7F8FC', border: CARD_BORDER, borderRadius: 12, padding: 20 }}>
          <p style={{ fontWeight: 600, fontSize: 14, color: TEXT_SEC, marginBottom: 16 }}>Current Paycheck (Bi-weekly)</p>
          <PaySection label="Earnings">
            <PayRow label="Gross Pay" value={profile.grossPayPerPeriod} />
          </PaySection>
          <PaySection label="Deductions">
            <PayRow label="Pre-Tax Deductions" value={0} />
          </PaySection>
          <PaySection label="Taxes">
            <PayRow label="Federal Withholding" value={-profile.fedBefore} muted />
            <PayRow label="State Withholding" value={-profile.stateBefore} muted />
            <PayRow label="FICA (7.65%)" value={-profile.ficaBefore} muted />
          </PaySection>
          <div style={{ height: 1, background: 'rgba(15, 11, 46, 0.1)', margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: INK }}>Net Pay</span>
            <span style={{ fontWeight: 700, fontSize: 16, color: INK, fontFamily: FONT_MONO }}>{formatDollarCents(profile.netBefore)}</span>
          </div>
        </div>

        {/* Paycheck with CHAMP */}
        <div style={{ background: '#F7F8FC', border: `1px solid rgba(59, 130, 246, 0.2)`, borderRadius: 12, padding: 20 }}>
          <p style={{ fontWeight: 600, fontSize: 14, color: ACCENT, marginBottom: 16 }}>Paycheck with CHAMP</p>
          <PaySection label="Earnings">
            <PayRow label="Gross Pay" value={profile.grossPayPerPeriod} />
          </PaySection>
          <PaySection label="Deductions">
            <PayRow label="Pre-Tax Benefit Deduction" value={-profile.preTaxPerPeriod} accent />
          </PaySection>
          <PaySection label="Taxes">
            <PayRow label="Federal Withholding" value={-profile.fedAfter} muted />
            <PayRow label="State Withholding" value={-profile.stateAfter} muted />
            <PayRow label="FICA (7.65%)" value={-profile.ficaAfter} muted />
          </PaySection>
          <PaySection label="CHAMP Benefit" accent>
            <PayRow label="CHAMP Benefit" value={profile.champBenefit} accent />
          </PaySection>
          <div style={{ height: 1, background: 'rgba(59, 130, 246, 0.2)', margin: '12px 0' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 700, fontSize: 14, color: INK }}>Net Pay</span>
            <span style={{ fontWeight: 700, fontSize: 16, color: INK, fontFamily: FONT_MONO }}>{formatDollarCents(profile.netAfter)}</span>
          </div>
          <p style={{ fontSize: 13, fontWeight: 600, color: deltaColor, marginTop: 8, textAlign: 'right' }}>
            {sign}{formatDollarCents(profile.delta)} ({sign}{Math.abs(profile.deltaPercent).toFixed(1)}%)
          </p>
        </div>
      </div>

      {/* Annual Impact Summary */}
      <div style={{ textAlign: 'center', marginTop: 24, background: '#F7F8FC', border: CARD_BORDER, borderRadius: 12, padding: 20 }}>
        <h3 style={{ fontWeight: 700, fontSize: 16, letterSpacing: '-0.01em', color: INK }}>Annual Impact Summary</h3>
        <div style={{ width: 60, height: 2, background: ACCENT, margin: '6px auto 16px' }} />
        <div style={{ display: 'flex', justifyContent: 'center', gap: 48, flexWrap: 'wrap' }}>
          <div>
            <p style={{ fontWeight: 700, fontSize: 22, color: INK, fontFamily: FONT_MONO }}>
              {formatDollarCents(profile.annualIncrease)}
            </p>
            <p style={{ fontSize: 12, color: TEXT_MUTED }}>Annual Take-Home Increase</p>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 22, color: INK, fontFamily: FONT_MONO }}>
              {formatDollarCents(totalTaxSavingsAnnual)}
            </p>
            <p style={{ fontSize: 12, color: TEXT_MUTED }}>Total Tax Savings</p>
          </div>
          <div>
            <p style={{ fontWeight: 700, fontSize: 22, color: ACCENT, fontFamily: FONT_MONO }}>
              {sign}{Math.abs(increasePct).toFixed(1)}%
            </p>
            <p style={{ fontSize: 12, color: TEXT_MUTED }}>Increase Percentage</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileStat({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 12, color: TEXT_MUTED }}>{label}</p>
      <p style={{ fontWeight: 600, fontSize: 15, color: INK, marginTop: 2 }}>{value}</p>
    </div>
  );
}

function PaySection({ label, children, accent }: { label: string; children: React.ReactNode; accent?: boolean }) {
  return (
    <div style={{ marginTop: 12 }}>
      <p style={{ fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: accent ? ACCENT : TEXT_MUTED, marginBottom: 4 }}>{label}</p>
      {children}
    </div>
  );
}

function PayRow({ label, value, muted, accent }: { label: string; value: number; muted?: boolean; accent?: boolean }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: 13 }}>
      <span style={{ color: accent ? ACCENT : TEXT_SEC }}>{label}</span>
      <span style={{ fontFamily: FONT_MONO, color: accent ? ACCENT : muted ? TEXT_MUTED : INK }}>
        {value < 0 ? `(${formatDollarCents(Math.abs(value))})` : formatDollarCents(value)}
      </span>
    </div>
  );
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}
