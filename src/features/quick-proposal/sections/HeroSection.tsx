import { motion } from 'framer-motion';
import { Users, FileText, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { GlassCard } from '@/features/proposal/components/shared/GlassCard';

export function HeroSection() {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mx-auto max-w-[720px]"
    >
      <div className="glass-primary text-center" style={{ padding: 32 }}>
        <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-text-tertiary">
          Section 125 Proposal Tool
        </p>

        <h1 className="mt-3 text-[44px] font-bold leading-tight text-text-primary">
          Quick Estimate
        </h1>

        <p className="mx-auto mt-4 max-w-[560px] text-[15px] leading-relaxed text-text-secondary">
          Section 125 Cafeteria Plan proposal builder for health insurance brokers.
          Complete the sections below to generate a comprehensive benefits analysis.
        </p>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <GlassCard variant="secondary" className="text-left !rounded-[16px]">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: '#EFF6FF' }}>
                <Users className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-text-primary">For Employees</p>
                <p className="mt-0.5 text-[14px] text-text-secondary">Lower federal, state, and FICA tax obligations</p>
              </div>
            </div>
          </GlassCard>
          <GlassCard variant="secondary" className="text-left !rounded-[16px]">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-full" style={{ background: '#EFF6FF' }}>
                <FileText className="h-4 w-4 text-accent" />
              </div>
              <div>
                <p className="text-[15px] font-semibold text-text-primary">For Employers</p>
                <p className="mt-0.5 text-[14px] text-text-secondary">7.65% FICA savings on all pre-tax deductions</p>
              </div>
            </div>
          </GlassCard>
        </div>

        <div className="mt-6 flex justify-center">
          <button
            onClick={() => document.getElementById('company')?.scrollIntoView({ behavior: 'smooth' })}
            className="btn-accent flex items-center gap-2 whitespace-nowrap"
          >
            Build Your Proposal
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>

        <button
          onClick={() => navigate('/informed-analysis')}
          className="mt-4 text-[13px] font-medium text-text-tertiary hover:text-accent transition-colors"
        >
          Need higher accuracy? Try Informed Analysis with actual payroll data →
        </button>

        <p className="mt-6 text-[12px] italic text-text-tertiary">
          This tool generates estimated projections based on the data you provide. Results are not guaranteed and should be used for informational and planning purposes only.
        </p>
      </div>
    </motion.div>
  );
}
