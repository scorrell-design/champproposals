import { motion } from 'framer-motion';
import { ArrowDown } from 'lucide-react';
import { formatDollar } from '@/utils/format';

interface SavingsFlowDiagramProps {
  totalPreTaxDeductions: number;
  totalFICASavings: number;
}

export function SavingsFlowDiagram({
  totalPreTaxDeductions,
  totalFICASavings,
}: SavingsFlowDiagramProps) {
  return (
    <div className="glass-primary">
      <h3 className="text-[18px] font-semibold text-text-primary mb-5">How Savings Flow</h3>

      <div className="mx-auto flex flex-col items-center gap-0" style={{ maxWidth: 520 }}>
        <FlowStep
          label="Total Annual Pre-Tax Deductions"
          value={formatDollar(totalPreTaxDeductions)}
          valueClass="text-text-primary"
          delay={0}
        />
        <Connector />
        <FlowStep
          label="× 7.65% FICA Rate (Social Security 6.2% + Medicare 1.45%)"
          value=""
          valueClass="text-text-secondary"
          delay={0.1}
          isFormula
        />
        <Connector />
        <FlowStep
          label="= Employer Annual FICA Savings"
          value={formatDollar(totalFICASavings)}
          valueClass="text-accent"
          delay={0.2}
          accent
        />
      </div>
    </div>
  );
}

function FlowStep({
  label,
  value,
  valueClass,
  delay,
  isFormula,
  accent,
}: {
  label: string;
  value: string;
  valueClass: string;
  delay: number;
  isFormula?: boolean;
  accent?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
      className="glass-secondary w-full"
      style={accent ? { borderLeft: '2px solid var(--color-accent)', boxShadow: '0 0 16px rgba(59, 130, 246, 0.06)' } : {}}
    >
      {value && <p className={`font-mono text-[20px] font-bold ${valueClass}`}>{value}</p>}
      <p className={`${isFormula ? '' : 'mt-1'} text-[13px] text-text-secondary`}>{label}</p>
    </motion.div>
  );
}

function Connector() {
  return (
    <div className="flex flex-col items-center py-1">
      <div className="h-4 w-px" style={{ background: 'rgba(15, 11, 46, 0.08)' }} />
      <ArrowDown className="h-3 w-3 text-text-tertiary" />
    </div>
  );
}
