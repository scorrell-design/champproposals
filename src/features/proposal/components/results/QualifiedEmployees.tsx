import { motion } from 'framer-motion';
import { CheckCircle, TrendingUp } from 'lucide-react';
import { PROPOSAL_LABELS } from '@/config/language';

interface QualifiedEmployeesProps {
  qualified: number;
  total: number;
  positivelyImpacted: number;
  positivelyImpactedPercent: number;
}

export function QualifiedEmployees({
  qualified,
  total,
  positivelyImpacted,
  positivelyImpactedPercent,
}: QualifiedEmployeesProps) {
  const qualifiedPercent = total > 0 ? Math.round((qualified / total) * 100) : 0;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      <motion.div
        initial={{ opacity: 0, x: -8 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-secondary flex items-start gap-3"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: '#EFF6FF' }}>
          <CheckCircle className="h-5 w-5 text-success" />
        </div>
        <div>
          <p className="metric-label">{PROPOSAL_LABELS.QUALIFIED}</p>
          <p className="mt-1 text-[20px] font-semibold text-text-primary">
            {qualified} of {total} <span className="text-[15px] font-normal text-text-secondary">({qualifiedPercent}%)</span>
          </p>
          <p className="mt-0.5 text-[13px] text-text-secondary">
            meet the income threshold for plan savings
          </p>
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, x: 8 }}
        animate={{ opacity: 1, x: 0 }}
        className="glass-secondary flex items-start gap-3"
      >
        <div className="flex h-10 w-10 items-center justify-center rounded-full" style={{ background: '#EFF6FF' }}>
          <TrendingUp className="h-5 w-5 text-success" />
        </div>
        <div>
          <p className="metric-label">{PROPOSAL_LABELS.POSITIVE_IMPACT}</p>
          <p className="mt-1 text-[20px] font-semibold text-success">
            {positivelyImpacted} <span className="text-[15px] font-normal text-text-secondary">({positivelyImpactedPercent}%)</span>
          </p>
          <p className="mt-0.5 text-[13px] text-text-secondary">
            will see increased take-home pay
          </p>
        </div>
      </motion.div>
    </div>
  );
}
