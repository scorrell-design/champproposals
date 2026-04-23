interface PillOption<T extends string> {
  value: T;
  label: string;
}

interface QuickSelectPillsProps<T extends string> {
  options: PillOption<T>[];
  value: T | null;
  onChange: (value: T) => void;
  label?: string;
}

export function QuickSelectPills<T extends string>({
  options,
  value,
  onChange,
  label,
}: QuickSelectPillsProps<T>) {
  return (
    <div className="flex flex-col gap-2">
      {label && (
        <label className="text-[13px] font-medium text-text-secondary">{label}</label>
      )}
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all duration-200
              ${
                value === opt.value
                  ? 'border-accent-border bg-accent-glow text-text-primary'
                  : 'border-border-glass-light bg-surface-glass-light text-text-secondary hover:bg-surface-glass-hover hover:border-border-glass-hover'
              }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
