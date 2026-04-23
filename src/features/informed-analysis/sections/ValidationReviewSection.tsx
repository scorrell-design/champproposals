import { SectionCard } from '@/features/proposal/components/shared/SectionCard';
import type { ParsedEmployeeRow } from '@/features/proposal/types/proposal.types';

interface ValidationReviewSectionProps {
  employees: ParsedEmployeeRow[];
}

export function ValidationReviewSection({ employees }: ValidationReviewSectionProps) {
  const preview = employees.slice(0, 10);

  return (
    <SectionCard id="review" title="Data Review" subtitle={`${employees.length} employees parsed — showing first ${preview.length}`}>
      <div className="overflow-x-auto">
        <table className="w-full text-[13px]">
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(15, 11, 46, 0.08)' }}>
              <th className="py-2 pr-4 text-left metric-label !text-[11px]">Name</th>
              <th className="py-2 pr-4 text-right metric-label !text-[11px]">Salary</th>
              <th className="py-2 pr-4 text-left metric-label !text-[11px]">State</th>
              <th className="py-2 pr-4 text-left metric-label !text-[11px]">Filing</th>
              <th className="py-2 text-left metric-label !text-[11px]">Status</th>
            </tr>
          </thead>
          <tbody>
            {preview.map((emp) => (
              <tr key={emp.employeeId} style={{ borderBottom: '1px solid rgba(15, 11, 46, 0.08)' }}>
                <td className="py-2 pr-4 font-medium text-text-primary">{emp.name}</td>
                <td className="py-2 pr-4 text-right font-mono text-text-secondary">${emp.salary.toLocaleString()}</td>
                <td className="py-2 pr-4 text-text-secondary">{emp.stateCode}</td>
                <td className="py-2 pr-4 text-text-secondary">{emp.filingStatus}</td>
                <td className="py-2 text-text-secondary">{emp.employmentStatus}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {employees.length > 10 && (
        <p className="mt-3 text-[12px] text-text-tertiary">...and {employees.length - 10} more employees</p>
      )}
    </SectionCard>
  );
}
