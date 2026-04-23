import { useProposalStore } from '@/features/proposal/store/proposal.store';
import { SectionCard } from '@/features/proposal/components/shared/SectionCard';
import { SegmentedControl } from '@/features/proposal/components/shared/SegmentedControl';

const PAYROLL_OPTIONS = [
  { value: 'weekly' as const, label: 'Weekly' },
  { value: 'biweekly' as const, label: 'Biweekly' },
  { value: 'semimonthly' as const, label: 'Semi-monthly' },
  { value: 'monthly' as const, label: 'Monthly' },
];

export function CompanyInfoSection() {
  const { company, setCompany } = useProposalStore((s) => s);

  return (
    <SectionCard id="company" title="Company Information" subtitle="Basic details about the employer group">
      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: 24 }}>
        <div className="flex flex-col" style={{ gap: 8 }}>
          <label className="text-[14px] font-medium text-text-secondary">Company Name</label>
          <input
            type="text"
            value={company.name}
            onChange={(e) => setCompany({ name: e.target.value })}
            placeholder="Enter company name"
            className="glass-input px-3.5 py-2.5 text-[15px]"
          />
        </div>

        <div className="flex flex-col" style={{ gap: 8 }}>
          <label className="text-[14px] font-medium text-text-secondary">Number of Employees</label>
          <input
            type="number"
            value={company.employeeCount || ''}
            onChange={(e) => setCompany({ employeeCount: parseInt(e.target.value) || 0 })}
            placeholder="e.g., 150"
            min={1}
            className="glass-input px-3.5 py-2.5 text-[15px] font-mono"
            style={{ maxWidth: 180 }}
          />
        </div>
      </div>

      <div className="flex flex-col" style={{ marginTop: 24, gap: 8 }}>
        <label className="text-[14px] font-medium text-text-secondary">Payroll Frequency</label>
        <SegmentedControl
          options={PAYROLL_OPTIONS}
          value={company.payrollFrequency}
          onChange={(val) => setCompany({ payrollFrequency: val })}
        />
      </div>
    </SectionCard>
  );
}
