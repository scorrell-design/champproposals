import { useCallback } from 'react';

interface DollarInputProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
  maxWidth?: number;
}

export function DollarInput({
  value,
  onChange,
  max = 999999,
  min = 0,
  placeholder = '0',
  disabled = false,
  label,
  maxWidth = 140,
}: DollarInputProps) {
  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const raw = e.target.value;
      if (raw === '') { onChange(0); return; }
      const num = parseFloat(raw);
      if (!isNaN(num)) onChange(Math.min(max, Math.max(min, num)));
    },
    [onChange, max, min],
  );

  return (
    <div className="flex flex-col" style={{ gap: 8 }}>
      {label && (
        <label className="text-[14px] font-medium text-text-secondary">{label}</label>
      )}
      <div className="relative inline-flex items-center" style={{ maxWidth }}>
        <span className="pointer-events-none absolute left-3 text-[13px] text-text-tertiary">$</span>
        <input
          type="number"
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          className="glass-input w-full py-2 pl-8 pr-3 text-right font-mono text-[15px] font-semibold
                     disabled:opacity-40"
        />
      </div>
    </div>
  );
}
