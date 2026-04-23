import { useCallback } from 'react';

interface PercentInputProps {
  value: number;
  onChange: (value: number) => void;
  max?: number;
  min?: number;
  placeholder?: string;
  disabled?: boolean;
  label?: string;
}

export function PercentInput({
  value,
  onChange,
  max = 100,
  min = 0,
  placeholder = '0',
  disabled = false,
  label,
}: PercentInputProps) {
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
      <div className="relative inline-flex items-center" style={{ maxWidth: 80 }}>
        <input
          type="number"
          value={value || ''}
          onChange={handleChange}
          placeholder={placeholder}
          disabled={disabled}
          min={min}
          max={max}
          step={1}
          className="glass-input w-full py-2 pl-3 pr-7 text-right font-mono text-[15px] font-semibold
                     disabled:opacity-40"
        />
        <span className="pointer-events-none absolute right-2.5 text-[13px] text-text-tertiary">%</span>
      </div>
    </div>
  );
}
