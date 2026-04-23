import { RefreshCw } from 'lucide-react';
import { useProposalStore } from '@/features/proposal/store/proposal.store';
import { SectionCard } from '@/features/proposal/components/shared/SectionCard';
import { PercentInput } from '@/features/proposal/components/shared/PercentInput';
import { TotalBadge } from '@/features/proposal/components/shared/TotalBadge';
import { DEFAULT_FILING_STATUS } from '@/config/filing-status-defaults';

export function FilingStatusSection() {
  const { filingStatus, setFilingStatus } = useProposalStore((s) => s);
  const total = filingStatus.single + filingStatus.married + filingStatus.headOfHousehold;

  const reset = () => setFilingStatus(DEFAULT_FILING_STATUS);

  return (
    <SectionCard id="filing" title="Filing Status Distribution" subtitle="Estimated filing breakdown across the workforce">
      <div className="flex flex-wrap gap-5" style={{ maxWidth: 600 }}>
        <div style={{ flex: '1 1 140px', maxWidth: 180 }}>
          <PercentInput label="Single" value={filingStatus.single} onChange={(val) => setFilingStatus({ ...filingStatus, single: val })} />
        </div>
        <div style={{ flex: '1 1 140px', maxWidth: 180 }}>
          <PercentInput label="Married" value={filingStatus.married} onChange={(val) => setFilingStatus({ ...filingStatus, married: val })} />
        </div>
        <div style={{ flex: '1 1 140px', maxWidth: 180 }}>
          <PercentInput label="Head of Household" value={filingStatus.headOfHousehold} onChange={(val) => setFilingStatus({ ...filingStatus, headOfHousehold: val })} />
        </div>
      </div>

      <div className="flex items-center gap-3" style={{ marginTop: 16 }}>
        <TotalBadge value={total} target={100} />
        <button
          onClick={reset}
          className="glass-secondary inline-flex items-center gap-1.5 !rounded-full !px-3 !py-1.5 text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          <RefreshCw size={14} className="text-current" />
          Reset to U.S. averages
        </button>
      </div>
    </SectionCard>
  );
}
