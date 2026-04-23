import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { formatDollar, formatDollarCents } from '@/utils/format';
import { getFederalMarginalRate, estimatePreTaxDeductions } from '@/features/proposal/engine';
import { STATE_TAX_RATES, STATE_NAMES } from '@/config/tax-rates';
import { FICA_RATES } from '@/config/fica-rates';
import type { ParsedEmployeeRow } from '@/features/proposal/types/proposal.types';
import type { EmployeeResult } from '../engine/mini-analyzer';

interface EmployeeLookupProps {
  employees: ParsedEmployeeRow[];
  employeeResults?: EmployeeResult[];
  payPeriodsPerYear: number;
}

export function EmployeeLookup({ employees, employeeResults, payPeriodsPerYear }: EmployeeLookupProps) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return employees.slice(0, 8);
    const q = search.toLowerCase();
    return employees.filter((e) => e.name.toLowerCase().includes(q)).slice(0, 20);
  }, [employees, search]);

  const emp = useMemo(
    () => employees.find((e) => e.employeeId === selectedId) ?? null,
    [employees, selectedId],
  );

  const empResult = useMemo(
    () => employeeResults?.find((r) => r.employee.employeeId === selectedId) ?? null,
    [employeeResults, selectedId],
  );

  const calc = useMemo(() => {
    if (!emp) return null;
    const gross = emp.salary / payPeriodsPerYear;
    const fedRate = getFederalMarginalRate(emp.salary, emp.filingStatus);
    const stateRate = STATE_TAX_RATES[emp.stateCode] ?? 0;
    const ficaRate = FICA_RATES.combined;

    const tierLevel = emp.salary < 35000 ? 'entry' : emp.salary < 65000 ? 'mid' : emp.salary < 100000 ? 'senior' : 'executive';
    const annualPreTax = empResult?.preTaxDeduction ?? estimatePreTaxDeductions(emp.salary, tierLevel, {
      healthParticipation: 0, healthPremiumAnnual: 0,
      retirementParticipation: 0, retirementRate: 0,
      hsaParticipation: 0, hsaAnnual: 0,
    });
    const preTaxPer = annualPreTax / payPeriodsPerYear;

    const fedBefore = gross * fedRate;
    const stateBefore = gross * stateRate;
    const ficaBefore = gross * ficaRate;
    const netBefore = gross - fedBefore - stateBefore - ficaBefore;

    const taxableAfter = gross - preTaxPer;
    const fedAfter = taxableAfter * fedRate;
    const stateAfter = taxableAfter * stateRate;
    const ficaAfter = taxableAfter * ficaRate;
    const netAfter = taxableAfter - fedAfter - stateAfter - ficaAfter;

    const increase = netAfter - netBefore;
    return {
      gross, preTaxPer,
      fedBefore, stateBefore, ficaBefore, netBefore,
      fedAfter, stateAfter, ficaAfter, netAfter,
      increase, annualIncrease: increase * payPeriodsPerYear,
      fedSaved: fedBefore - fedAfter, stateSaved: stateBefore - stateAfter, ficaSaved: ficaBefore - ficaAfter,
    };
  }, [emp, empResult, payPeriodsPerYear]);

  const filingLabel = emp?.filingStatus === 'married' ? 'Married' : emp?.filingStatus === 'hoh' ? 'Head of Household' : 'Single';

  return (
    <div className="glass-primary">
      <h3 className="text-[18px] font-semibold text-text-primary">Individual Employee Impact</h3>
      <p className="mt-1 text-[14px] text-text-secondary" style={{ marginBottom: 16 }}>
        Select an employee to view their specific paycheck impact
      </p>

      {/* Search */}
      <div className="relative" style={{ maxWidth: 400, marginBottom: 20 }}>
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-tertiary" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by employee name..."
          className="glass-input w-full py-2.5 pl-9 pr-3 text-[14px]"
        />
      </div>

      {!emp && (
        <div className="flex flex-wrap gap-2">
          {filtered.map((e) => (
            <button
              key={e.employeeId}
              onClick={() => { setSelectedId(e.employeeId); setSearch(''); }}
              className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-text-secondary transition-colors hover:bg-surface-glass-light"
              style={{ background: '#F7F8FC', border: '1px solid rgba(15, 11, 46, 0.08)' }}
            >
              {e.name}
            </button>
          ))}
          {employees.length > filtered.length && (
            <span className="self-center text-[12px] text-text-tertiary">
              +{employees.length - filtered.length} more
            </span>
          )}
        </div>
      )}

      {emp && calc && (
        <div>
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => setSelectedId(null)}
              className="text-[13px] text-text-tertiary hover:text-text-secondary transition-colors"
            >
              ← Back to list
            </button>
            <span className="text-[16px] font-semibold text-text-primary">{emp.name}</span>
            <span className="text-[13px] text-text-tertiary">
              {formatDollar(emp.salary)} · {filingLabel} · {STATE_NAMES[emp.stateCode] || emp.stateCode}
            </span>
          </div>

          {/* Increase badge */}
          <div
            className="glass-secondary text-center !border-accent-border mb-4"
            style={{ boxShadow: '0 0 24px rgba(59, 130, 246, 0.08)', maxWidth: 340, margin: '0 auto 20px' }}
          >
            <p className="font-mono text-[28px] font-bold text-accent">
              +{formatDollarCents(calc.increase)}
            </p>
            <p className="mt-1 text-[14px] font-bold text-accent">per paycheck</p>
            <p className="mt-0.5 text-[12px] text-text-tertiary">
              ({formatDollarCents(calc.annualIncrease)} more per year)
            </p>
          </div>

          {/* Side by side */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="glass-secondary" style={{ opacity: 0.8 }}>
              <p className="metric-label mb-3">Current Paycheck</p>
              <Line label="Gross Pay" value={calc.gross} />
              <Line label="Federal Tax" value={-calc.fedBefore} dim />
              <Line label="State Tax" value={-calc.stateBefore} dim />
              <Line label="FICA" value={-calc.ficaBefore} dim />
              <div className="glass-divider my-2" />
              <Line label="Net Pay" value={calc.netBefore} bold />
            </div>
            <div className="glass-secondary !border-accent-border/30">
              <p className="metric-label mb-3 text-accent-muted">With Section 125 Plan</p>
              <Line label="Gross Pay" value={calc.gross} />
              <div className="rounded-md px-2 py-0.5 -mx-2" style={{ background: 'rgba(217, 119, 6, 0.06)' }}>
                <Line label="Pre-Tax Benefit Deduction" value={-calc.preTaxPer} accent />
              </div>
              <Line label="Federal Tax" value={-calc.fedAfter} dim saved={calc.fedSaved} />
              <Line label="State Tax" value={-calc.stateAfter} dim saved={calc.stateSaved} />
              <Line label="FICA" value={-calc.ficaAfter} dim saved={calc.ficaSaved} />
              <div className="glass-divider my-2" />
              <div className="rounded-md px-2 py-0.5 -mx-2" style={{ background: 'rgba(59, 130, 246, 0.06)' }}>
                <Line label="Section 125 Benefit" value={calc.increase} accent />
              </div>
              <Line label="Net Pay" value={calc.netAfter} bold green />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Line({ label, value, bold, dim, accent, green, saved }: {
  label: string; value: number; bold?: boolean; dim?: boolean; accent?: boolean; green?: boolean; saved?: number;
}) {
  return (
    <div className={`flex items-center justify-between py-1 ${bold ? 'text-[14px]' : 'text-[13px]'}`}>
      <span className={accent ? 'text-accent font-medium' : 'text-text-secondary'}>{label}</span>
      <span className="flex items-center gap-2">
        <span className={`font-mono ${bold ? `font-bold ${green ? 'text-success' : 'text-text-primary'}` : dim ? 'text-text-tertiary' : accent ? 'font-medium text-accent' : 'text-text-secondary'}`}>
          {formatDollarCents(value)}
        </span>
        {saved !== undefined && saved > 0.01 && (
          <span className="text-[11px] text-success font-medium">↓ saves {formatDollarCents(saved)}</span>
        )}
      </span>
    </div>
  );
}
