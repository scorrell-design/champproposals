import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Info, ShieldCheck } from 'lucide-react';
import { formatDollar } from '@/utils/format';
import { PROPOSAL_LABELS } from '@/config/language';
import type { SavingsRange } from '../../types/proposal.types';

interface SavingsSpectrumProps {
  range: SavingsRange;
  proposalType: 'quick_proposal' | 'informed_analysis';
}

export function SavingsSpectrum({ range, proposalType }: SavingsSpectrumProps) {
  const [showPopover, setShowPopover] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const isQP = proposalType === 'quick_proposal';

  useEffect(() => {
    if (!showPopover) return;
    function handleClick(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node) && buttonRef.current && !buttonRef.current.contains(e.target as Node)) {
        setShowPopover(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showPopover]);

  return (
    <div className="glass-primary">
      {/* Header */}
      <div className="flex items-center gap-3 mb-2">
        <h3 className="text-[18px] font-semibold text-text-primary">Your Savings Outlook</h3>
        <div className="relative">
          <button
            ref={buttonRef}
            onClick={() => setShowPopover(!showPopover)}
            className="flex h-7 w-7 items-center justify-center rounded-full transition-colors hover:bg-surface-glass-hover"
            style={{ border: '1px solid rgba(59, 130, 246, 0.3)' }}
            title="How we calculate your savings range"
          >
            <Info size={16} className="text-accent" />
          </button>
          <AnimatePresence>
            {showPopover && (
              <motion.div
                ref={popoverRef}
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 4 }}
                transition={{ duration: 0.15 }}
                className="absolute left-0 top-full z-50 mt-2 w-80"
                style={{
                  background: '#FFFFFF',
                  border: '1px solid rgba(15, 11, 46, 0.08)',
                  borderRadius: 12,
                  padding: 14,
                  boxShadow: '0 8px 24px rgba(15, 11, 46, 0.12)',
                }}
              >
                <p className="text-[13px] leading-[1.6] text-text-secondary">
                  Savings ranges are estimated based on the salary distribution entered above. Conservative, Projected, and Optimal scenarios reflect different enrollment and participation assumptions.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        {!isQP && (
          <span className="glass-secondary inline-flex items-center gap-1.5 !rounded-full !px-3 !py-1 text-[12px] font-semibold text-success !border-[rgba(5,150,105,0.3)]">
            <ShieldCheck className="h-3.5 w-3.5" />
            High Confidence &mdash; Based on Actual Payroll Data
          </span>
        )}
      </div>

      {isQP && (
        <p className="text-[13px] text-text-tertiary mb-6">
          Based on estimated data. Use Informed Analysis with actual payroll data for a tighter range.
        </p>
      )}
      {!isQP && <div className="mb-6" />}

      {/* Spectrum Bar */}
      <div className="relative mb-8">
        <div className="flex h-12 w-full overflow-hidden rounded-[14px]">
          <div
            className="h-full"
            style={{
              width: isQP ? '25%' : '17.5%',
              background: 'linear-gradient(90deg, rgba(15, 11, 46, 0.08), #E8E0D4)',
            }}
          />
          <div
            className="h-full"
            style={{
              width: isQP ? '50%' : '65%',
              background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.25), rgba(59, 130, 246, 0.12))',
            }}
          />
          <div
            className="h-full"
            style={{
              width: isQP ? '25%' : '17.5%',
              background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.2), rgba(59, 130, 246, 0.1))',
            }}
          />
        </div>

        {/* Vertical marker */}
        <div
          className="absolute top-0 flex flex-col items-center"
          style={{ left: '50%', transform: 'translateX(-50%)' }}
        >
          <div className="h-12 w-0.5" style={{ background: '#0F0B2E' }} />
          <div className="mt-[-2px] h-2 w-2 rotate-45" style={{ background: '#0F0B2E' }} />
        </div>
      </div>

      {/* Value Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass-secondary text-center">
          <p className="font-mono text-[18px] font-bold text-text-secondary">{formatDollar(range.conservative)}</p>
          <p className="mt-1 text-[12px] text-text-tertiary">{PROPOSAL_LABELS.RANGE_LOW}</p>
          <p className="mt-0.5 text-[11px] text-text-tertiary">If participation is lower than expected</p>
        </div>
        <div className="glass-secondary text-center !border-accent-border" style={{ boxShadow: '0 0 24px rgba(59, 130, 246, 0.06)' }}>
          <p className="font-mono text-[22px] font-bold text-accent">{formatDollar(range.projected)}</p>
          <p className="mt-1 text-[12px] text-accent-muted">{PROPOSAL_LABELS.RANGE_MID}</p>
          <p className="mt-0.5 text-[11px] text-text-tertiary">Based on your inputs</p>
        </div>
        <div className="glass-secondary text-center">
          <p className="font-mono text-[18px] font-bold text-secondary">{formatDollar(range.optimal)}</p>
          <p className="mt-1 text-[12px] text-text-tertiary">{PROPOSAL_LABELS.RANGE_HIGH}</p>
          <p className="mt-0.5 text-[11px] text-text-tertiary">With maximum enrollment &amp; participation</p>
        </div>
      </div>
    </div>
  );
}
