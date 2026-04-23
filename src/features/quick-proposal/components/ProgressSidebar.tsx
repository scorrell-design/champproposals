import { Check } from 'lucide-react';

interface Section {
  id: string;
  label: string;
  isComplete: boolean;
}

interface ProgressSidebarProps {
  sections: Section[];
  activeSection: string;
  onNavigate: (id: string) => void;
}

export function ProgressSidebar({ sections, activeSection, onNavigate }: ProgressSidebarProps) {
  const completedCount = sections.filter((s) => s.isComplete).length;
  const progress = Math.round((completedCount / sections.length) * 100);
  const circumference = 2 * Math.PI * 18;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="sticky top-8 w-52 shrink-0">
      <nav className="space-y-0">
        {sections.map((section, i) => {
          const isActive = section.id === activeSection;
          const isLast = i === sections.length - 1;
          const prevComplete = i > 0 && sections[i - 1].isComplete;

          return (
            <div key={section.id} className="relative">
              {/* Connecting line */}
              {!isLast && (
                <div
                  className="absolute left-[7px] top-[22px] w-px"
                  style={{
                    height: 28,
                    background: prevComplete && section.isComplete
                      ? 'var(--color-success)'
                      : 'rgba(15, 11, 46, 0.08)',
                    transition: 'background 300ms',
                  }}
                />
              )}

              <button
                onClick={() => onNavigate(section.id)}
                className="flex w-full items-center gap-3 py-2 text-left transition-colors"
              >
                {/* Node */}
                <span
                  className="relative flex h-[14px] w-[14px] flex-shrink-0 items-center justify-center rounded-full transition-all duration-250"
                  style={{
                    background: section.isComplete
                      ? 'var(--color-success)'
                      : isActive
                        ? 'var(--color-accent)'
                        : 'transparent',
                    border: section.isComplete || isActive
                      ? 'none'
                      : '1px solid rgba(15, 11, 46, 0.08)',
                    boxShadow: isActive ? '0 0 12px rgba(59, 130, 246, 0.15)' : 'none',
                  }}
                >
                  {section.isComplete && <Check className="h-2.5 w-2.5 text-white" strokeWidth={3} />}
                </span>

                {/* Label */}
                <span
                  className={`text-[13px] transition-colors ${
                    isActive
                      ? 'font-semibold text-text-primary'
                      : section.isComplete
                        ? 'text-text-secondary'
                        : 'text-text-tertiary'
                  }`}
                >
                  {section.label}
                </span>
              </button>
            </div>
          );
        })}
      </nav>

      {/* Radial progress ring */}
      <div className="mt-6 flex justify-center">
        <div className="relative h-12 w-12">
          <svg className="h-12 w-12 -rotate-90" viewBox="0 0 40 40">
            <circle
              cx="20" cy="20" r="18"
              fill="none"
              stroke="rgba(15, 11, 46, 0.08)"
              strokeWidth="2.5"
            />
            <circle
              cx="20" cy="20" r="18"
              fill="none"
              stroke="var(--color-accent)"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              style={{ transition: 'stroke-dashoffset 400ms ease-out' }}
            />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[13px] font-semibold text-text-secondary">
            {progress}%
          </span>
        </div>
      </div>
    </div>
  );
}
