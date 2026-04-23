import { motion } from 'framer-motion';
import { formatDollar } from '@/utils/format';
import { PROPOSAL_LABELS } from '@/config/language';
import type { ProposalResult } from '../../types/proposal.types';

interface KPICardsProps {
  result: ProposalResult;
}

export function KPICards({ result }: KPICardsProps) {
  const cards = [
    {
      label: PROPOSAL_LABELS.EMPLOYER_SAVINGS,
      value: result.employerAnnualFICASavings,
      format: formatDollar,
      valueColor: 'text-accent',
    },
    {
      label: PROPOSAL_LABELS.AVG_EMPLOYEE_SAVINGS,
      value: result.avgEmployeeAnnualSavings,
      format: formatDollar,
      valueColor: 'text-text-primary',
    },
    {
      label: PROPOSAL_LABELS.POSITIVE_IMPACT,
      value: result.positivelyImpactedCount,
      format: (n: number) => `${n} employees (${result.positivelyImpactedPercent}%)`,
      valueColor: 'text-success',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.08 }}
          className="glass-primary"
        >
          <p className="metric-label">{card.label}</p>
          <motion.p
            key={card.value}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-2 font-mono text-[32px] font-bold ${card.valueColor}`}
          >
            {card.format(card.value)}
          </motion.p>
        </motion.div>
      ))}
    </div>
  );
}
