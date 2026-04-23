import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Info, RotateCcw } from 'lucide-react';
import { useProposalStore } from '@/features/proposal/store/proposal.store';
import { SectionCard } from '@/features/proposal/components/shared/SectionCard';
import { PercentInput } from '@/features/proposal/components/shared/PercentInput';

const BENEFIT_TABS = ['Medical', 'Dental', 'Vision', 'Retirement', 'HSA'] as const;
type BenefitTab = typeof BENEFIT_TABS[number];

const EXEMPTION_ITEMS = [
  'Certain public school teachers and state/local government employees',
  'Some religious group members (with approved Form 4029)',
  'Certain non-resident aliens on temporary visas',
  'Student employees at their schools',
];

const DEFAULT_BENEFITS_VALUES = {
  health: { participationRate: 75, premiums: { medical: { individual: 250, family: 650 }, dental: { individual: 35, family: 90 }, vision: { individual: 15, family: 35 } } },
  dental: { participationRate: 65, premiums: { individual: 35, family: 90 } },
  vision: { participationRate: 60, premiums: { individual: 15, family: 35 } },
  retirement: { participationRate: 60, contributionRates: { entry: 4, mid: 6, senior: 8, executive: 10 } },
  hsa: { participationRate: 30, annualContribution: 1500 },
};

export function BenefitsSection() {
  const { socialSecurity, benefits, setSocialSecurity, setBenefits } = useProposalStore((s) => s);
  const [activeTab, setActiveTab] = useState<BenefitTab>('Medical');
  const [showExemptionInfo, setShowExemptionInfo] = useState(false);
  const [showSocialSecurity, setShowSocialSecurity] = useState(false);

  const handleResetToDefaults = useCallback(() => {
    setBenefits({
      health: { ...benefits.health, participationRate: DEFAULT_BENEFITS_VALUES.health.participationRate, premiums: DEFAULT_BENEFITS_VALUES.health.premiums },
      dental: { ...benefits.dental, participationRate: DEFAULT_BENEFITS_VALUES.dental.participationRate, premiums: DEFAULT_BENEFITS_VALUES.dental.premiums },
      vision: { ...benefits.vision, participationRate: DEFAULT_BENEFITS_VALUES.vision.participationRate, premiums: DEFAULT_BENEFITS_VALUES.vision.premiums },
      retirement: { ...benefits.retirement, participationRate: DEFAULT_BENEFITS_VALUES.retirement.participationRate, contributionRates: DEFAULT_BENEFITS_VALUES.retirement.contributionRates },
      hsa: { ...benefits.hsa, participationRate: DEFAULT_BENEFITS_VALUES.hsa.participationRate },
    });
  }, [benefits, setBenefits]);

  return (
    <SectionCard id="benefits" title="Benefits Configuration" subtitle="Configure pre-tax benefit details for more accurate projections">
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

      {/* Benefits panel — visually disabled when toggle off */}
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

        {activeTab === 'Medical' && (
          <div className="flex items-center gap-4" style={{ maxWidth: 400 }}>
            <span className="text-[14px] font-medium text-text-primary">Participation Rate</span>
            <PercentInput value={benefits.health.participationRate} onChange={(val) => setBenefits({ health: { ...benefits.health, participationRate: val } })} />
          </div>
        )}

        {activeTab === 'Dental' && (
          <div className="flex items-center gap-4" style={{ maxWidth: 400 }}>
            <span className="text-[14px] font-medium text-text-primary">Participation Rate</span>
            <PercentInput value={benefits.dental?.participationRate ?? 65} onChange={(val) => setBenefits({ dental: { ...benefits.dental, enabled: benefits.dental?.enabled ?? false, participationRate: val, premiums: benefits.dental?.premiums ?? { individual: 35, family: 90 } } })} />
          </div>
        )}

        {activeTab === 'Vision' && (
          <div className="flex items-center gap-4" style={{ maxWidth: 400 }}>
            <span className="text-[14px] font-medium text-text-primary">Participation Rate</span>
            <PercentInput value={benefits.vision?.participationRate ?? 60} onChange={(val) => setBenefits({ vision: { ...benefits.vision, enabled: benefits.vision?.enabled ?? false, participationRate: val, premiums: benefits.vision?.premiums ?? { individual: 15, family: 35 } } })} />
          </div>
        )}

        {activeTab === 'Retirement' && (
          <div className="flex items-center gap-4" style={{ maxWidth: 400 }}>
            <span className="text-[14px] font-medium text-text-primary">Participation Rate</span>
            <PercentInput value={benefits.retirement.participationRate} onChange={(val) => setBenefits({ retirement: { ...benefits.retirement, participationRate: val } })} />
          </div>
        )}

        {activeTab === 'HSA' && (
          <div>
            <div className="flex items-center gap-4" style={{ maxWidth: 400, marginBottom: 24 }}>
              <span className="text-[14px] font-medium text-text-primary">Participation Rate</span>
              <PercentInput value={benefits.hsa.participationRate} onChange={(val) => setBenefits({ hsa: { ...benefits.hsa, participationRate: val } })} />
            </div>
            <p className="text-[12px] text-text-tertiary italic" style={{ marginTop: 8 }}>
              Savings estimate will use national average HSA contribution data.
            </p>
          </div>
        )}
      </div>

      {/* Advanced: Customize Social Security — subtle expandable */}
      <div style={{ marginTop: 24 }}>
        <button
          onClick={() => setShowSocialSecurity(!showSocialSecurity)}
          className="inline-flex items-center gap-1.5 text-[12px] text-text-tertiary hover:text-text-secondary transition-colors"
          style={{ opacity: 0.7 }}
        >
          <motion.span animate={{ rotate: showSocialSecurity ? 180 : 0 }} transition={{ duration: 0.2 }}>
            <ChevronDown size={12} className="text-current" />
          </motion.span>
          Advanced: Customize Social Security rates
        </button>

        <AnimatePresence>
          {showSocialSecurity && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="mt-3 glass-secondary !rounded-[12px]">
                <div className="text-center">
                  <p className="text-[14px] font-medium text-text-primary mb-3">
                    What percentage of your employees are exempt from paying Social Security?
                  </p>
                  <div className="flex justify-center">
                    <PercentInput value={socialSecurity.exemptPercent} onChange={(val) => setSocialSecurity({ exemptPercent: val })} />
                  </div>
                  <p className="mt-2 text-[12px] text-text-tertiary">Most companies have 0% exempt employees.</p>

                  <button
                    onClick={() => setShowExemptionInfo(!showExemptionInfo)}
                    className="mt-3 inline-flex items-center gap-1.5 text-[12px] font-medium text-accent hover:text-accent/80 transition-colors"
                  >
                    <Info size={13} className="text-current" />
                    Who qualifies for exemption?
                    <motion.span animate={{ rotate: showExemptionInfo ? 180 : 0 }} transition={{ duration: 0.2 }}>
                      <ChevronDown size={13} className="text-current" />
                    </motion.span>
                  </button>

                  <AnimatePresence>
                    {showExemptionInfo && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="glass-secondary mt-3 text-left !rounded-[12px]">
                          <ul className="space-y-2">
                            {EXEMPTION_ITEMS.map((item) => (
                              <li key={item} className="flex items-start gap-2 text-[12px] text-text-secondary">
                                <span className="mt-1.5 h-1 w-1 rounded-full bg-accent flex-shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                          <p className="mt-3 text-[11px] text-text-tertiary italic border-t border-border-glass-light pt-3">
                            This does NOT include employees who have reached the annual Social Security wage cap &mdash; they continue to pay throughout the year.
                          </p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SectionCard>
  );
}
