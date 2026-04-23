import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useProposalStore } from '@/features/proposal/store/proposal.store';
import { SectionCard } from '@/features/proposal/components/shared/SectionCard';
import { DollarInput } from '@/features/proposal/components/shared/DollarInput';
import { PercentInput } from '@/features/proposal/components/shared/PercentInput';
import { TotalBadge } from '@/features/proposal/components/shared/TotalBadge';
import { IndustryPresetGrid } from '../components/IndustryPresetGrid';
import { INDUSTRY_PRESETS } from '@/config/industry-presets';
import type { IndustryPreset, SalaryTier } from '@/features/proposal/types/proposal.types';

const TIER_LEVELS: SalaryTier['level'][] = ['entry', 'mid', 'senior', 'executive'];
const TIER_LABELS: Record<string, string> = {
  entry: 'Entry Level',
  mid: 'Mid-Level',
  senior: 'Senior',
  executive: 'Executive',
};

function build4Tiers(sourceTiers: SalaryTier[], existingTiers: SalaryTier[]): SalaryTier[] {
  return Array.from({ length: 4 }, (_, i) => {
    if (i < sourceTiers.length) return sourceTiers[i];
    if (i < existingTiers.length) return existingTiers[i];
    const level = TIER_LEVELS[i] ?? 'executive';
    return { level, label: TIER_LABELS[level] ?? `Tier ${i + 1}`, salaryMin: 0, salaryMax: 0, workforcePercent: 0 };
  });
}

export function SalaryInsightsSection() {
  const { industry, tiers, setIndustry, setTierCount, setTiers, updateTier } = useProposalStore((s) => s);
  const [presetBanner, setPresetBanner] = useState<string | null>(null);

  const handleIndustrySelect = useCallback((preset: IndustryPreset) => {
    setIndustry(preset);
    if (preset !== 'custom') {
      const presetData = INDUSTRY_PRESETS[preset];
      const fourTiers = build4Tiers(presetData.tiers, tiers);
      setTiers(fourTiers);
      setTierCount(4);
      setPresetBanner(presetData.label);
    } else {
      const emptyTiers = build4Tiers([], tiers);
      setTiers(emptyTiers);
      setTierCount(4);
      setPresetBanner(null);
    }
  }, [setIndustry, setTiers, setTierCount, tiers]);

  const totalPercent = tiers.reduce((sum, t) => sum + t.workforcePercent, 0);

  return (
    <SectionCard id="salary" title="Salary Insights" subtitle="Choose an industry preset or customize salary tiers">
      <div className="mb-6">
        <label className="text-[13px] font-medium text-text-secondary mb-2 block">Industry Preset</label>
        <IndustryPresetGrid selected={industry} onSelect={handleIndustrySelect} />
      </div>

      {/* Industry Preset Reveal Banner */}
      <AnimatePresence>
        {presetBanner && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div
              className="glass-secondary mb-6 flex items-center justify-between !rounded-[12px]"
              style={{ borderColor: 'rgba(217, 119, 6, 0.2)' }}
            >
              <p className="text-[13px] text-text-secondary">
                These values were loaded from the <span className="font-semibold text-text-primary">{presetBanner}</span> preset. Edit any row to customize.
              </p>
              <button onClick={() => setPresetBanner(null)} className="text-text-tertiary hover:text-text-secondary transition-colors ml-3 flex-shrink-0">
                <X size={16} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {tiers.length > 0 && (
        <div className="space-y-4">
          {tiers.map((tier, i) => (
              <div key={i} className="glass-secondary !rounded-[14px] p-4">
                <div className="flex items-center gap-2 mb-4">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                  <span className="text-[15px] font-semibold text-text-primary">{tier.label}</span>
                </div>

                <div className="grid grid-cols-3 gap-4 items-end">
                  <DollarInput label="Min Salary" value={tier.salaryMin} onChange={(val) => updateTier(i, { salaryMin: val })} max={500000} />
                  <DollarInput label="Max Salary" value={tier.salaryMax} onChange={(val) => updateTier(i, { salaryMax: val })} max={500000} />
                  <PercentInput label="Workforce %" value={tier.workforcePercent} onChange={(val) => updateTier(i, { workforcePercent: val })} />
                </div>
              </div>
          ))}
          <TotalBadge value={totalPercent} target={100} label="Workforce Total" />
        </div>
      )}
    </SectionCard>
  );
}
