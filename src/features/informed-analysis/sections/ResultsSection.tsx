import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Info } from 'lucide-react';
import { ProposalHeaderBand } from '@/features/proposal/components/results/ProposalHeaderBand';
import { ExecutiveSummary } from '@/features/proposal/components/results/ExecutiveSummary';
import { PlainLanguageSummary } from '@/features/proposal/components/results/PlainLanguageSummary';
import { EmployerImpactBreakdown } from '@/features/proposal/components/results/EmployerImpactBreakdown';
import { SavingsSpectrum } from '@/features/proposal/components/results/SavingsSpectrum';
import { EmployeeLookup } from '../components/EmployeeLookup';
import { TierBreakdownTable } from '@/features/proposal/components/results/TierBreakdownTable';
import { SavingsFlowDiagram } from '@/features/proposal/components/results/SavingsFlowDiagram';
import { ImplementationTimeline } from '@/features/proposal/components/results/ImplementationTimeline';
import { FAQAccordion } from '@/features/proposal/components/results/FAQAccordion';
import { DisclaimerCard } from '@/features/proposal/components/results/DisclaimerCard';
import { DataSourcesSection } from '@/features/proposal/components/results/DataSourcesSection';
import { StickyActionBar } from '@/features/proposal/components/results/StickyActionBar';
import { Toast } from '@/features/proposal/components/shared/Toast';
import { payPeriodsPerYear } from '@/utils/format';
import type { ProposalResult, PaycheckComparison as PaycheckComparisonType, ParsedEmployeeRow } from '@/features/proposal/types/proposal.types';
import type { EmployeeResult } from '../engine/mini-analyzer';

const DISCLAIMER_TEXT = 'This proposal is for illustrative purposes only and does not constitute a guarantee of savings. Actual results may vary based on final enrollment, payroll data, and plan configuration.';

interface IAResultsSectionProps {
  result: ProposalResult;
  paycheckComparisons: PaycheckComparisonType[];
  companyName: string;
  payrollFrequency: string;
  employees?: ParsedEmployeeRow[];
  employeeResults?: EmployeeResult[];
  onDownloadPDF: () => void;
  onSaveDraft: () => void;
  onReset: () => void;
  isGeneratingPDF: boolean;
  isSaving: boolean;
}

export function IAResultsSection({
  result,
  paycheckComparisons,
  companyName,
  payrollFrequency,
  employees = [],
  employeeResults = [],
  onDownloadPDF,
  onSaveDraft,
  onReset,
  isGeneratingPDF,
  isSaving,
}: IAResultsSectionProps) {
  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleSave = useCallback(() => {
    onSaveDraft();
    const msg = companyName
      ? `Proposal saved to ${companyName}'s portal profile`
      : 'Proposal saved';
    setToastMessage(msg);
    setToastVisible(true);
  }, [onSaveDraft, companyName]);

  const freq = payrollFrequency as 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';
  const periods = payPeriodsPerYear(freq);

  const avgPreTax = result.tierResults.length > 0
    ? result.tierResults.reduce((s: number, t) => s + t.avgPreTaxDeduction * t.employeeCount, 0) / result.totalEmployees
    : 0;
  const usedStateCodes = [...new Set(employees.map((e) => e.stateCode))];
  const midTier = paycheckComparisons.length >= 2 ? paycheckComparisons[Math.floor(paycheckComparisons.length / 2)] : paycheckComparisons[0];

  const payCycleLabel = freq === 'weekly' ? 'Weekly' : freq === 'biweekly' ? 'Bi-weekly' : freq === 'semimonthly' ? 'Semi-monthly' : 'Monthly';

  return (
    <>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4" style={{ paddingBottom: 72 }}>
        {/* Disclaimer Banner */}
        <div
          className="flex items-center gap-2 rounded-lg px-4 py-2.5"
          style={{ background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.15)' }}
        >
          <Info size={15} className="flex-shrink-0 text-accent" style={{ opacity: 0.7 }} />
          <p className="text-[12px] leading-snug text-text-tertiary">{DISCLAIMER_TEXT}</p>
        </div>

        <ProposalHeaderBand
          companyName={companyName}
          employeeCount={result.totalEmployees}
          stateCodes={usedStateCodes}
          payCycle={payCycleLabel}
        />
        <ExecutiveSummary result={result} payPeriodsPerYear={periods} />
        <PlainLanguageSummary companyName={companyName} result={result} stateCodes={usedStateCodes} />
        <EmployerImpactBreakdown result={result} payPeriodsPerYear={periods} midTier={midTier} />
        <SavingsSpectrum range={result.savingsRange} proposalType="informed_analysis" />
        {employees.length > 0 && (
          <EmployeeLookup employees={employees} employeeResults={employeeResults} payPeriodsPerYear={periods} />
        )}
        <TierBreakdownTable tiers={result.tierResults} payPeriodsPerYear={periods} totalEmployees={result.totalEmployees} />
        <SavingsFlowDiagram
          totalPreTaxDeductions={Math.round(avgPreTax * result.totalEmployees)}
          totalFICASavings={Math.round(result.employerAnnualFICASavings)}
        />
        <ImplementationTimeline />
        <FAQAccordion />
        <DisclaimerCard />
        <DataSourcesSection />
      </motion.div>

      <StickyActionBar
        companyName={companyName}
        proposalType="informed_analysis"
        onDownloadPDF={onDownloadPDF}
        onSaveDraft={handleSave}
        onNewProposal={onReset}
        isGeneratingPDF={isGeneratingPDF}
        isSaving={isSaving}
        newProposalLabel="New Analysis"
      />

      <Toast message={toastMessage} visible={toastVisible} onDismiss={() => setToastVisible(false)} />
    </>
  );
}
