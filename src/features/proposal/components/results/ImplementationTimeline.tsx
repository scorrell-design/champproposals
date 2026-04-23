import { Settings, Users, TrendingUp } from 'lucide-react';

const STEPS = [
  {
    icon: Settings,
    title: 'Initial Setup',
    timeline: '2–3 business days',
    description: 'Quick 30-minute consultation and paperwork to establish your plan structure.',
  },
  {
    icon: Users,
    title: 'Employee Enrollment',
    timeline: '1–2 weeks',
    description: 'Digital enrollment process with educational resources for your team.',
  },
  {
    icon: TrendingUp,
    title: 'Full Implementation',
    timeline: 'Begin seeing savings',
    description: 'Integration with payroll systems and ongoing automated administration. Begin seeing savings immediately.',
  },
];

export function ImplementationTimeline() {
  return (
    <div className="glass-primary">
      <h3 className="text-[18px] font-semibold text-text-primary" style={{ marginBottom: 24 }}>
        Implementation Timeline
      </h3>
      <div className="relative flex flex-col gap-0 md:flex-row md:gap-0">
        {/* Connecting line */}
        <div
          className="absolute hidden md:block"
          style={{
            top: 24,
            left: '10%',
            right: '10%',
            height: 2,
            background: 'linear-gradient(90deg, rgba(59, 130, 246, 0.3), rgba(59, 130, 246, 0.1))',
          }}
        />

        {STEPS.map((step, i) => (
          <div key={step.title} className="relative flex-1 text-center" style={{ padding: '0 16px' }}>
            <div
              className="relative z-10 mx-auto flex h-12 w-12 items-center justify-center rounded-full"
              style={{
                background: '#EFF6FF',
                border: '1px solid rgba(59, 130, 246, 0.2)',
              }}
            >
              <step.icon size={24} className="text-accent" />
            </div>
            <p className="mt-3 text-[15px] font-semibold text-text-primary">{step.title}</p>
            <p className="mt-1 text-[13px] font-medium text-accent">{step.timeline}</p>
            <p className="mt-2 text-[13px] text-text-secondary leading-relaxed">{step.description}</p>
            {i < STEPS.length - 1 && (
              <div className="my-4 h-px md:hidden" style={{ background: 'rgba(15, 11, 46, 0.08)' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
