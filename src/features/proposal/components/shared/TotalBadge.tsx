import { Check } from 'lucide-react';

interface TotalBadgeProps {
  value: number;
  target: number;
  label?: string;
  suffix?: string;
}

export function TotalBadge({ value, target, label = 'Total', suffix = '%' }: TotalBadgeProps) {
  const isValid = Math.abs(value - target) < 0.5;

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold
        ${isValid
          ? 'border-[rgba(5,150,105,0.3)] text-success bg-[rgba(5,150,105,0.08)]'
          : 'border-[rgba(217,119,6,0.3)] text-warning bg-[rgba(217,119,6,0.08)]'}`}
    >
      {label}: {Math.round(value)}{suffix}
      {isValid && <Check size={14} className="text-current" />}
    </span>
  );
}
