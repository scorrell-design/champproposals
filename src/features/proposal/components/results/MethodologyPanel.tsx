import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { formatDollar } from '@/utils/format';
import type { RangeFactor } from '../../types/proposal.types';

interface MethodologyPanelProps {
  factors: RangeFactor[];
  conservative: number;
  optimal: number;
  onClose: () => void;
}

export function MethodologyPanel({ factors, conservative, optimal, onClose }: MethodologyPanelProps) {
  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100]"
        style={{ background: 'rgba(0, 0, 0, 0.4)' }}
        onClick={onClose}
      />

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, x: 40 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 40 }}
        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
        className="fixed right-0 top-0 z-[101] flex h-full w-full max-w-xl flex-col overflow-y-auto"
        style={{
          background: '#FFFFFF',
          borderLeft: '1px solid rgba(15, 11, 46, 0.08)',
          boxShadow: '-8px 0 32px rgba(15, 11, 46, 0.1)',
        }}
      >
        <div className="flex items-center justify-between border-b border-border-glass-light px-6 py-5">
          <h2 className="text-[18px] font-semibold text-text-primary">How We Calculate Your Savings Range</h2>
          <button onClick={onClose} className="text-text-tertiary hover:text-text-primary transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 px-6 py-6 space-y-6">
          <p className="text-[14px] leading-relaxed text-text-secondary">
            Your projected savings are based on the data you provided. Real-world outcomes vary based on five factors. Here&rsquo;s how each one affects your range:
          </p>

          {factors.map((factor) => {
            const maxAbs = Math.max(Math.abs(factor.conservativeImpact), Math.abs(factor.optimalImpact));
            const leftPct = maxAbs > 0 ? (Math.abs(factor.conservativeImpact) / maxAbs) * 50 : 0;
            const rightPct = maxAbs > 0 ? (Math.abs(factor.optimalImpact) / maxAbs) * 50 : 0;

            return (
              <div key={factor.name} className="glass-secondary !rounded-[14px]">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[15px] font-semibold text-text-primary">{factor.name}</p>
                  <span
                    className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[12px] font-medium text-text-tertiary"
                    style={{ background: '#F7F8FC' }}
                  >
                    {factor.weight}%
                  </span>
                </div>
                <p className="text-[14px] text-text-secondary mb-4">{factor.description}</p>

                {/* Impact bar */}
                <div className="relative h-6 rounded-full overflow-hidden" style={{ background: '#F7F8FC' }}>
                  <div className="absolute inset-y-0 left-1/2 w-px" style={{ background: 'rgba(15, 11, 46, 0.08)' }} />
                  {/* Conservative (left of center) */}
                  <div
                    className="absolute inset-y-0 rounded-l-full"
                    style={{
                      right: '50%',
                      width: `${leftPct}%`,
                      background: 'rgba(148, 163, 184, 0.4)',
                    }}
                  />
                  {/* Optimal (right of center) */}
                  <div
                    className="absolute inset-y-0 rounded-r-full"
                    style={{
                      left: '50%',
                      width: `${rightPct}%`,
                      background: 'rgba(59, 130, 246, 0.25)',
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-1.5">
                  <span className="text-[11px] text-text-tertiary">-{formatDollar(Math.abs(factor.conservativeImpact))}</span>
                  <span className="text-[11px] text-text-tertiary">$0</span>
                  <span className="text-[11px] text-text-tertiary">+{formatDollar(factor.optimalImpact)}</span>
                </div>
              </div>
            );
          })}

          {/* Summary */}
          <div className="glass-primary !rounded-[14px]">
            <p className="text-[16px] font-semibold text-text-primary">
              Combined Range: {formatDollar(conservative)} to {formatDollar(optimal)}
            </p>
          </div>

          <p className="text-[12px] italic text-text-tertiary leading-relaxed">
            This range is an estimate based on industry benchmarks and statistical modeling.
            Actual results will depend on your specific workforce dynamics. Projected Savings represents the most likely outcome.
          </p>
        </div>
      </motion.div>
    </>
  );
}
