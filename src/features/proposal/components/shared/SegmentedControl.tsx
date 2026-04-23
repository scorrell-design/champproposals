import { useState, useRef, useEffect } from 'react';

interface Option<T extends string> {
  value: T;
  label: string;
}

interface SegmentedControlProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sliderStyle, setSliderStyle] = useState({ left: 0, width: 0 });

  useEffect(() => {
    if (!containerRef.current) return;
    const idx = options.findIndex((o) => o.value === value);
    const buttons = containerRef.current.querySelectorAll('button');
    if (buttons[idx]) {
      const btn = buttons[idx] as HTMLButtonElement;
      setSliderStyle({ left: btn.offsetLeft, width: btn.offsetWidth });
    }
  }, [value, options]);

  return (
    <div
      ref={containerRef}
      className="glass-secondary relative inline-flex !p-1 !rounded-[14px]"
    >
      <div
        className="absolute top-1 rounded-[10px] transition-all duration-200 ease-out"
        style={{
          left: sliderStyle.left,
          width: sliderStyle.width,
          height: 'calc(100% - 8px)',
          background: '#FFFFFF',
          boxShadow: '0 2px 8px rgba(15, 11, 46, 0.08)',
        }}
      />
      {options.map((opt) => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          className={`relative z-10 rounded-[10px] px-4 py-1.5 text-sm font-medium transition-colors
            ${value === opt.value ? 'text-text-primary' : 'text-text-secondary hover:text-text-primary'}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
