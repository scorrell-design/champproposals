import { useState, useCallback } from 'react';
import { Info, RotateCcw } from 'lucide-react';
import { useProposalStore } from '@/features/proposal/store/proposal.store';
import { SectionCard } from '@/features/proposal/components/shared/SectionCard';
import { DollarInput } from '@/features/proposal/components/shared/DollarInput';
import { PercentInput } from '@/features/proposal/components/shared/PercentInput';

const BENEFIT_TABS = ['Healthcare', 'Retirement', 'HSA'] as const;
type BenefitTab = typeof BENEFIT_TABS[number];

const DISCLAIMER_TEXT = 'This proposal is for illustrative purposes only and does not constitute a guarantee of savings. Calculations apply the full standard FICA rate (6.2% Social Security + 1.45% Medicare) and 2026 federal tax tables. Actual results may vary based on final enrollment, payroll data, and plan configuration.';

export function BenefitsSection() {
  const { benefits, setBenefits } = useProposalStore((s) => s);
  const [activeTab, setActiveTab] = useState<BenefitTab>('Healthcare');

  const handleResetToDefaults = useCallback(() => {
    setBenefits({
      healthcare: {
        ...benefits.healthcare,
        medical: { participationRate: 75, premiums: { individual: 200, family: 775 } },
        dental: { participationRate: 75, premiums: { individual: 35, family: 85 } },
        vision: { participationRate: 75, premiums: { individual: 15, family: 40 } },
      },
      retirement: {
        ...benefits.retirement,
        participationRate: 60,
        contributionRates: { entry: 4, mid: 6, senior: 8, executive: 10 },
      },
      hsa: { ...benefits.hsa, participationRate: 30 },
    });
  }, [benefits, setBenefits]);

  const updateBenefitField = useCallback(
    (
      type: 'medical' | 'dental' | 'vision',
      field: 'participationRate' | 'individual' | 'family',
      val: number,
    ) => {
      const current = benefits.healthcare[type];
      const updated =
        field === 'participationRate'
          ? { ...current, participationRate: val }
          : { ...current, premiums: { ...current.premiums, [field]: val } };
      setBenefits({
        healthcare: { ...benefits.healthcare, [type]: updated },
      });
    },
    [benefits.healthcare, setBenefits],
  );

  return (
    <SectionCard id="benefits" title="Benefits Configuration" subtitle="Configure pre-tax benefit details for more accurate projections">
      {/* Disclaimer Banner */}
      <div
        className="mb-6 flex items-start gap-2 rounded-lg px-4 py-2.5"
        style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.15)' }}
      >
        <Info size={15} className="flex-shrink-0 text-accent mt-0.5" style={{ opacity: 0.7 }} />
        <p className="text-[12px] leading-snug text-text-tertiary">{DISCLAIMER_TEXT}</p>
      </div>

      {/* US Average preset indicator + Reset button */}
      <div className="flex items-center justify-between mb-4">
        <span
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-medium text-text-secondary"
          style={{ background: '#EFF6FF', border: '1px solid rgba(59, 130, 246, 0.2)' }}
        >
          <Info size={13} className="text-accent" />
          Using preset values based on U.S. national averages
        </span>
        <button
          onClick={handleResetToDefaults}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-text-secondary hover:text-text-primary transition-colors"
          style={{ background: '#F7F8FC', border: '1px solid rgba(15, 11, 46, 0.08)' }}
        >
          <RotateCcw size={13} />
          Reset to Industry Average
        </button>
      </div>

      {/* Benefits Master Toggle */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => setBenefits({ enabled: !benefits.enabled })}
          className="relative h-6 w-11 rounded-full transition-colors flex-shrink-0"
          style={{ background: benefits.enabled ? 'var(--color-accent)' : 'rgba(15, 11, 46, 0.08)' }}
        >
          <span
            className="absolute left-0 top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform"
            style={{ transform: benefits.enabled ? 'translateX(22px)' : 'translateX(2px)' }}
          />
        </button>
        <span className="text-[14px] font-medium text-text-secondary">
          Include benefits in calculation
        </span>
      </div>

      {!benefits.enabled && (
        <p className="text-[13px] text-text-tertiary" style={{ marginTop: 12 }}>
          Proposal will use FICA savings only. Toggle on to include benefits for a more detailed estimate.
        </p>
      )}

      {/* Benefits panel */}
      <div
        style={{
          marginTop: 24,
          opacity: benefits.enabled ? 1 : 0.3,
          pointerEvents: benefits.enabled ? 'auto' : 'none',
          transition: 'opacity 300ms',
        }}
      >
        {/* Tab Navigation */}
        <div className="glass-secondary inline-flex !p-1 !rounded-[14px] flex-wrap" style={{ marginBottom: 24 }}>
          {BENEFIT_TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`rounded-[10px] px-4 py-1.5 text-[14px] font-medium transition-all
                ${activeTab === tab
                  ? 'bg-white text-text-primary shadow-sm'
                  : 'text-text-secondary hover:text-text-primary'}`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Healthcare Tab — 4-column grid with per-benefit participation */}
        {activeTab === 'Healthcare' && (
          <div className="glass-secondary !rounded-[14px]" style={{ padding: 24 }}>
            {/* Column headers */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 100px 140px 140px',
                gap: '0 24px',
                marginBottom: 12,
              }}
            >
              <div />
              <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-text-tertiary text-center">Participation</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-text-tertiary text-center">Individual</p>
              <p className="text-[11px] font-semibold uppercase tracking-[0.5px] text-text-tertiary text-center">Family</p>
            </div>

            {/* Rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Medical */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 140px 140px', gap: '0 24px', alignItems: 'center' }}>
                <p className="text-[14px] font-medium text-text-primary">Medical</p>
                <PercentInput
                  value={benefits.healthcare.medical.participationRate}
                  onChange={(val) => updateBenefitField('medical', 'participationRate', val)}
                />
                <DollarInput
                  value={benefits.healthcare.medical.premiums.individual}
                  onChange={(val) => updateBenefitField('medical', 'individual', val)}
                  max={5000}
                  maxWidth={140}
                />
                <DollarInput
                  value={benefits.healthcare.medical.premiums.family}
                  onChange={(val) => updateBenefitField('medical', 'family', val)}
                  max={10000}
                  maxWidth={140}
                />
              </div>

              {/* Dental */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 140px 140px', gap: '0 24px', alignItems: 'center' }}>
                <p className="text-[14px] font-medium text-text-primary">Dental</p>
                <PercentInput
                  value={benefits.healthcare.dental.participationRate}
                  onChange={(val) => updateBenefitField('dental', 'participationRate', val)}
                />
                <DollarInput
                  value={benefits.healthcare.dental.premiums.individual}
                  onChange={(val) => updateBenefitField('dental', 'individual', val)}
                  max={1000}
                  maxWidth={140}
                />
                <DollarInput
                  value={benefits.healthcare.dental.premiums.family}
                  onChange={(val) => updateBenefitField('dental', 'family', val)}
                  max={2000}
                  maxWidth={140}
                />
              </div>

              {/* Vision */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 100px 140px 140px', gap: '0 24px', alignItems: 'center' }}>
                <p className="text-[14px] font-medium text-text-primary">Vision</p>
                <PercentInput
                  value={benefits.healthcare.vision.participationRate}
                  onChange={(val) => updateBenefitField('vision', 'participationRate', val)}
                />
                <DollarInput
                  value={benefits.healthcare.vision.premiums.individual}
                  onChange={(val) => updateBenefitField('vision', 'individual', val)}
                  max={500}
                  maxWidth={140}
                />
                <DollarInput
                  value={benefits.healthcare.vision.premiums.family}
                  onChange={(val) => updateBenefitField('vision', 'family', val)}
                  max={1000}
                  maxWidth={140}
                />
              </div>
            </div>

            <p className="text-[11px] text-text-tertiary" style={{ marginTop: 16 }}>Monthly premium per employee</p>
          </div>
        )}

        {/* Retirement Tab — 4 tier contribution rates */}
        {activeTab === 'Retirement' && (
          <div>
            <div className="flex items-center gap-4 mb-6" style={{ maxWidth: 400 }}>
              <span className="text-[14px] font-medium text-text-primary">Participation Rate</span>
              <PercentInput
                value={benefits.retirement.participationRate}
                onChange={(val) => setBenefits({ retirement: { ...benefits.retirement, participationRate: val } })}
              />
            </div>

            <div className="glass-secondary !rounded-[14px]">
              <p className="text-[13px] font-semibold text-text-primary mb-4">Contribution Rate by Tier</p>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <PercentInput
                  label="Entry"
                  value={benefits.retirement.contributionRates.entry}
                  onChange={(val) => setBenefits({ retirement: { ...benefits.retirement, contributionRates: { ...benefits.retirement.contributionRates, entry: val } } })}
                />
                <PercentInput
                  label="Mid"
                  value={benefits.retirement.contributionRates.mid}
                  onChange={(val) => setBenefits({ retirement: { ...benefits.retirement, contributionRates: { ...benefits.retirement.contributionRates, mid: val } } })}
                />
                <PercentInput
                  label="Senior"
                  value={benefits.retirement.contributionRates.senior}
                  onChange={(val) => setBenefits({ retirement: { ...benefits.retirement, contributionRates: { ...benefits.retirement.contributionRates, senior: val } } })}
                />
                <PercentInput
                  label="Executive"
                  value={benefits.retirement.contributionRates.executive}
                  onChange={(val) => setBenefits({ retirement: { ...benefits.retirement, contributionRates: { ...benefits.retirement.contributionRates, executive: val } } })}
                />
              </div>
            </div>
          </div>
        )}

        {/* HSA Tab */}
        {activeTab === 'HSA' && (
          <div>
            <div className="flex items-center gap-4" style={{ maxWidth: 400, marginBottom: 24 }}>
              <span className="text-[14px] font-medium text-text-primary">Participation Rate</span>
              <PercentInput
                value={benefits.hsa.participationRate}
                onChange={(val) => setBenefits({ hsa: { ...benefits.hsa, participationRate: val } })}
              />
            </div>
            <p className="text-[12px] text-text-tertiary italic" style={{ marginTop: 8 }}>
              Savings estimate will use national average HSA contribution data.
            </p>
          </div>
        )}
      </div>
    </SectionCard>
  );
}
