import { SectionCard } from '@/features/proposal/components/shared/SectionCard';
import { ValidationBanner } from '@/features/proposal/components/shared/ValidationBanner';
import type { ColumnMapping, ValidationResult } from '../engine/mini-file-validator';

interface ColumnMappingSectionProps {
  columns: string[];
  mapping: ColumnMapping;
  validation: ValidationResult;
  onUpdateMapping: (field: keyof ColumnMapping, column: string | null) => void;
  onConfirm: () => void;
}

const FIELD_LABELS: Record<keyof ColumnMapping, { label: string; required: boolean }> = {
  salary: { label: 'Salary / Compensation', required: true },
  filingStatus: { label: 'Filing Status', required: false },
  stateCode: { label: 'State', required: false },
  employeeName: { label: 'Employee Name', required: false },
  employeeId: { label: 'Employee ID', required: false },
  employmentStatus: { label: 'Employment Status', required: false },
  hireDate: { label: 'Hire Date', required: false },
  dob: { label: 'Date of Birth', required: false },
};

export function ColumnMappingSection({ columns, mapping, validation, onUpdateMapping, onConfirm }: ColumnMappingSectionProps) {
  return (
    <SectionCard id="mapping" title="Column Mapping" subtitle="Verify that columns are mapped correctly">
      {validation.errors.map((err) => (
        <div key={err} className="mb-2"><ValidationBanner type="error" message={err} /></div>
      ))}
      {validation.warnings.map((warn) => (
        <div key={warn} className="mb-2"><ValidationBanner type="warning" message={warn} /></div>
      ))}

      <div className="space-y-3 mt-4">
        {(Object.keys(FIELD_LABELS) as (keyof ColumnMapping)[]).map((field) => {
          const { label, required } = FIELD_LABELS[field];
          return (
            <div key={field} className="flex items-center gap-4">
              <div className="w-44 text-[14px]">
                <span className="font-medium text-text-primary">{label}</span>
                {required && <span className="text-error ml-1">*</span>}
              </div>
              <select
                value={mapping[field] ?? ''}
                onChange={(e) => onUpdateMapping(field, e.target.value || null)}
                className="glass-input flex-1 px-3.5 py-2.5 text-[14px]"
              >
                <option value="">— Not mapped —</option>
                {columns.map((col) => <option key={col} value={col}>{col}</option>)}
              </select>
            </div>
          );
        })}
      </div>

      <div style={{ marginTop: 24 }}>
        <button
          onClick={onConfirm}
          disabled={!validation.isValid}
          className="btn-accent disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Confirm Mapping &amp; Generate Proposal
        </button>
        {!validation.isValid && !mapping.salary && (
          <p className="mt-3 text-[13px] text-warning">
            Map the salary/compensation column to continue.
          </p>
        )}
        {validation.isValid && (
          <p className="mt-3 text-[13px] text-text-tertiary">
            Optional columns (filing status, state, employment status) enhance accuracy if mapped.
          </p>
        )}
      </div>
    </SectionCard>
  );
}
