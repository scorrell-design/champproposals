import { useState } from 'react';
import { CheckCircle, AlertCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import type { RecognizedField } from '../engine/mini-file-validator';

interface RecognizedFieldsViewProps {
  recognizedFields: RecognizedField[];
  rowCount: number;
  fileName: string;
  companyName?: string;
}

const GROUP_META: { key: RecognizedField['group']; label: string; collapsible: boolean }[] = [
  { key: 'employee_pay', label: 'Employee & Pay', collapsible: false },
  { key: 'tax_filing', label: 'Tax Filing', collapsible: true },
  { key: 'benefits', label: 'Benefits', collapsible: true },
  { key: 'state_specific', label: 'State-Specific', collapsible: true },
];

export function RecognizedFieldsView({ recognizedFields, rowCount, fileName, companyName }: RecognizedFieldsViewProps) {
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({
    tax_filing: false,
    benefits: false,
    state_specific: false,
  });

  const detectedFields = recognizedFields.filter((f) => f.status === 'detected');
  const hasRequiredMissing = recognizedFields.some((f) => f.required && f.status === 'not_detected');

  const fileExt = fileName.split('.').pop()?.toLowerCase();
  const fileType = fileExt === 'csv' ? 'CSV' : fileExt === 'xlsx' || fileExt === 'xls' ? 'Excel Census' : 'Data File';

  const grouped = GROUP_META.map((g) => ({
    ...g,
    fields: recognizedFields.filter((f) => f.group === g.key),
  }));

  const stateSpecificGroup = grouped.find((g) => g.key === 'state_specific');
  const hideStateSpecific =
    stateSpecificGroup != null && stateSpecificGroup.fields.every((f) => f.status === 'not_detected');

  const toggleGroup = (key: string) => {
    setExpandedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="glass-primary">
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Left: Recognized Fields */}
        <div>
          <p
            className="font-medium text-text-tertiary"
            style={{ fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}
          >
            Recognized Fields
          </p>
          <div className="mt-4 flex flex-col" style={{ gap: 20 }}>
            {grouped.map((group) => {
              if (group.key === 'state_specific' && hideStateSpecific) return null;

              const isExpanded = !group.collapsible || expandedGroups[group.key];
              const detectedCount = group.fields.filter((f) => f.status === 'detected').length;

              return (
                <div key={group.key}>
                  {group.collapsible ? (
                    <button
                      onClick={() => toggleGroup(group.key)}
                      className="flex w-full items-center gap-1.5 text-[13px] font-semibold text-text-secondary hover:text-text-primary transition-colors"
                    >
                      {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      {group.label}
                      <span className="text-[11px] font-normal text-text-tertiary">
                        ({detectedCount}/{group.fields.length})
                      </span>
                    </button>
                  ) : (
                    <p className="text-[13px] font-semibold text-text-secondary">
                      {group.label}
                      <span className="ml-1.5 text-[11px] font-normal text-text-tertiary">
                        ({detectedCount}/{group.fields.length})
                      </span>
                    </p>
                  )}
                  {isExpanded && (
                    <div className="mt-2 flex flex-col" style={{ gap: 10 }}>
                      {group.fields.map((field) => (
                        <FieldRow key={field.key} field={field} />
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right: Group Summary */}
        <div>
          <p
            className="font-medium text-text-tertiary"
            style={{ fontSize: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}
          >
            Group Summary
          </p>
          <div className="mt-4 flex flex-col" style={{ gap: 16 }}>
            <SummaryRow label="Company Name" value={companyName || fileName.replace(/\.[^.]+$/, '')} />
            <SummaryRow label="Employees Detected" value={String(rowCount)} />
            <SummaryRow label="Pay Cycle" value="Bi-weekly" />
            <SummaryRow label="File Type" value={fileType} />
            <SummaryRow label="Fields Detected" value={`${detectedFields.length} of ${recognizedFields.length}`} />
          </div>
        </div>
      </div>

      {/* Status message */}
      <div style={{ marginTop: 24 }}>
        {hasRequiredMissing ? (
          <p className="text-[13px] font-medium" style={{ color: '#DC2626' }}>
            A required field is missing. Map the salary/compensation column to continue.
          </p>
        ) : (
          <p className="text-[13px] text-text-secondary">
            All required fields detected. {detectedFields.length > 3 ? 'Strong data coverage for high-accuracy analysis.' : 'Map optional columns above for enhanced accuracy.'}
          </p>
        )}
      </div>
    </div>
  );
}

function FieldRow({ field }: { field: RecognizedField }) {
  if (field.status === 'detected') {
    return (
      <div className="flex items-center gap-2.5">
        <CheckCircle size={16} style={{ color: '#059669', flexShrink: 0 }} />
        <span className="text-[14px] text-text-primary">{field.label}</span>
        <span className="text-[12px] text-text-secondary">detected</span>
      </div>
    );
  }

  if (field.required) {
    return (
      <div className="flex items-center gap-2.5">
        <XCircle size={16} style={{ color: '#DC2626', flexShrink: 0 }} />
        <span className="text-[14px] text-text-primary">{field.label}</span>
        <span className="text-[12px]" style={{ color: '#DC2626' }}>not detected (required)</span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2.5">
      <AlertCircle size={16} style={{ color: '#D97706', flexShrink: 0 }} />
      <span className="text-[14px] text-text-primary">{field.label}</span>
        <span className="text-[12px]" style={{ color: '#D97706' }}>not detected (optional)</span>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[12px] text-text-tertiary">{label}</p>
      <p className="mt-0.5 text-[15px] font-semibold text-text-primary">{value}</p>
    </div>
  );
}
