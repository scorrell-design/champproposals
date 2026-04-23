import { useState, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Info } from 'lucide-react';
import { useProposalStore } from '@/features/proposal/store/proposal.store';
import { useProposalCalculation } from '@/features/proposal/hooks/useProposalCalculation';
import { GlassBackground } from '@/features/proposal/components/shared/GlassBackground';
import { DisclaimerModal } from '@/features/proposal/components/shared/DisclaimerModal';
import { ProgressSidebar } from './components/ProgressSidebar';
import { HeroSection } from './sections/HeroSection';
import { CompanyInfoSection } from './sections/CompanyInfoSection';
import { StateDistributionSection } from './sections/StateDistributionSection';
import { FilingStatusSection } from './sections/FilingStatusSection';
import { SalaryInsightsSection } from './sections/SalaryInsightsSection';
import { BenefitsSection } from './sections/BenefitsSection';
import { ResultsSection } from './sections/ResultsSection';

const DISCLAIMER_TEXT = 'This proposal is for illustrative purposes only and does not constitute a guarantee of savings. Calculations apply the full standard FICA rate (6.2% Social Security + 1.45% Medicare) and 2026 federal tax tables. Actual results may vary based on final enrollment, payroll data, and plan configuration.';

interface QuickProposalPageProps {
  groupId?: string;
}

export function QuickProposalPage({ groupId = 'demo' }: QuickProposalPageProps) {
  useProposalCalculation();
  const store = useProposalStore((s) => s);
  const [activeSection, setActiveSection] = useState('company');
  const [showResults, setShowResults] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);

  const stateTotal = store.states.reduce((s, st) => s + st.workforcePercent, 0);
  const filingTotal = store.filingStatus.single + store.filingStatus.married + store.filingStatus.headOfHousehold;
  const salaryTotal = store.tiers.reduce((s, t) => s + t.workforcePercent, 0);

  const isCompanyComplete = !!store.company.name && store.company.employeeCount > 0;
  const isStatesComplete = store.states.length > 0 && Math.abs(stateTotal - 100) < 0.5;
  const isFilingComplete = Math.abs(filingTotal - 100) < 0.5;
  const isSalaryComplete = store.tiers.length > 0 && store.tiers.every((t) => t.salaryMax > t.salaryMin) && Math.abs(salaryTotal - 100) < 0.5;
  const canGenerate = isCompanyComplete && isStatesComplete && isFilingComplete && isSalaryComplete;

  const sections = useMemo(
    () => [
      { id: 'company', label: 'Company Info', isComplete: isCompanyComplete },
      { id: 'states', label: 'States', isComplete: isStatesComplete },
      { id: 'filing', label: 'Filing Status', isComplete: isFilingComplete },
      { id: 'salary', label: 'Salary Tiers', isComplete: isSalaryComplete },
      { id: 'benefits', label: 'Benefits', isComplete: true },
      { id: 'results', label: 'Results', isComplete: showResults && store.result !== null },
    ],
    [isCompanyComplete, isStatesComplete, isFilingComplete, isSalaryComplete, showResults, store.result],
  );

  const handleNavigate = useCallback((id: string) => {
    setActiveSection(id);
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, []);

  const handleGenerateClick = useCallback(() => {
    setShowDisclaimer(true);
  }, []);

  const handleDisclaimerAccept = useCallback(() => {
    setShowDisclaimer(false);
    setShowResults(true);
    setTimeout(() => {
      document.getElementById('results')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  }, []);

  const handleDisclaimerBack = useCallback(() => {
    setShowDisclaimer(false);
  }, []);

  return (
    <GlassBackground>
      <div className="mx-auto max-w-6xl px-4 py-8">
        {/* Disclaimer Banner */}
        <div
          className="mb-6 flex items-center gap-2 rounded-lg px-4 py-2.5"
          style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.15)' }}
        >
          <Info size={15} className="flex-shrink-0 text-accent" style={{ opacity: 0.7 }} />
          <p className="text-[12px] leading-snug text-text-tertiary">{DISCLAIMER_TEXT}</p>
        </div>

        <div className="flex gap-8">
          <div className="hidden lg:block">
            <ProgressSidebar sections={sections} activeSection={activeSection} onNavigate={handleNavigate} />
          </div>
          <div className="flex-1" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <HeroSection />
            <CompanyInfoSection />
            <StateDistributionSection />
            <FilingStatusSection />
            <SalaryInsightsSection />
            <BenefitsSection />

            {/* Generate Proposal Button */}
            {!showResults && (
              <div className="glass-primary text-center">
                <button
                  onClick={handleGenerateClick}
                  disabled={!canGenerate}
                  className="inline-flex items-center gap-2 transition-all"
                  style={{
                    background: canGenerate ? '#3B82F6' : 'rgba(59, 130, 246, 0.3)',
                    color: '#FFFFFF',
                    borderRadius: 24,
                    padding: '16px 40px',
                    fontSize: 16,
                    fontWeight: 600,
                    border: 'none',
                    cursor: canGenerate ? 'pointer' : 'not-allowed',
                    opacity: canGenerate ? 1 : 0.4,
                    boxShadow: canGenerate ? '0 4px 16px rgba(59, 130, 246, 0.2)' : 'none',
                  }}
                  onMouseEnter={(e) => { if (canGenerate) e.currentTarget.style.boxShadow = '0 6px 24px rgba(59, 130, 246, 0.3)'; }}
                  onMouseLeave={(e) => { if (canGenerate) e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.2)'; }}
                >
                  Generate Proposal
                  <ArrowRight size={20} />
                </button>
                <p className="mt-4 text-[13px] text-text-tertiary">
                  {canGenerate
                    ? 'Benefits are optional. Your proposal will include them if configured.'
                    : 'Complete all required sections above to generate your proposal.'}
                </p>
              </div>
            )}

            {/* Results Section */}
            {showResults && (
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: 'easeOut' }}
              >
                <ResultsSection groupId={groupId} />
              </motion.div>
            )}
          </div>
        </div>
      </div>
      <DisclaimerModal
        open={showDisclaimer}
        onAccept={handleDisclaimerAccept}
        onGoBack={handleDisclaimerBack}
      />
    </GlassBackground>
  );
}
