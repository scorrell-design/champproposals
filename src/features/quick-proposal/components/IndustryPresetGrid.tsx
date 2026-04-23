import { GraduationCap, Landmark, HeartPulse, Factory, UtensilsCrossed, ShoppingBag, Monitor, Settings } from 'lucide-react';
import { INDUSTRY_PRESETS, type IndustryIconKey } from '@/config/industry-presets';
import { GlassCard } from '@/features/proposal/components/shared/GlassCard';
import type { IndustryPreset } from '@/features/proposal/types/proposal.types';

const ICON_MAP: Record<IndustryIconKey, React.ComponentType<{ size?: number; className?: string }>> = {
  'graduation-cap': GraduationCap,
  'landmark': Landmark,
  'heart-pulse': HeartPulse,
  'factory': Factory,
  'utensils-crossed': UtensilsCrossed,
  'shopping-bag': ShoppingBag,
  'monitor': Monitor,
  'settings': Settings,
};

interface IndustryPresetGridProps {
  selected: IndustryPreset | null;
  onSelect: (preset: IndustryPreset) => void;
}

const PRESET_KEYS = Object.keys(INDUSTRY_PRESETS) as IndustryPreset[];

export function IndustryPresetGrid({ selected, onSelect }: IndustryPresetGridProps) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {PRESET_KEYS.map((key) => {
        const preset = INDUSTRY_PRESETS[key];
        const Icon = ICON_MAP[preset.icon];
        return (
          <GlassCard
            key={key}
            variant="secondary"
            hover
            selected={selected === key}
            onClick={() => onSelect(key)}
            className="flex flex-col items-center gap-2 text-center !rounded-[16px]"
          >
            <Icon size={28} className="text-current opacity-60" />
            <span className={`text-[14px] font-medium ${selected === key ? 'text-text-primary' : 'text-text-secondary'}`}>
              {preset.label}
            </span>
          </GlassCard>
        );
      })}
    </div>
  );
}
