import { ShieldCheck } from 'lucide-react';

interface ConfidenceBadgeProps {
  level?: 'high' | 'medium';
}

export function ConfidenceBadge({ level = 'high' }: ConfidenceBadgeProps) {
  const isHigh = level === 'high';

  return (
    <span className={`glass-secondary inline-flex items-center gap-1.5 !rounded-full !px-3 !py-1 text-[12px] font-semibold
      ${isHigh
        ? 'text-success !border-[rgba(5,150,105,0.3)]'
        : 'text-warning !border-[rgba(217,119,6,0.3)]'}`}>
      <ShieldCheck className="h-3.5 w-3.5" />
      {isHigh ? 'High Confidence' : 'Medium Confidence'}
    </span>
  );
}
