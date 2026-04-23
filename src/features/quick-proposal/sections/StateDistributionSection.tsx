import { useState, useMemo, useCallback } from 'react';
import { Plus, X, RefreshCw, Globe, Trash2 } from 'lucide-react';
import { useProposalStore } from '@/features/proposal/store/proposal.store';
import { SectionCard } from '@/features/proposal/components/shared/SectionCard';
import { PercentInput } from '@/features/proposal/components/shared/PercentInput';
import { TotalBadge } from '@/features/proposal/components/shared/TotalBadge';
import { ValidationBanner } from '@/features/proposal/components/shared/ValidationBanner';
import { STATE_TAX_RATES, STATE_NAMES, ALL_STATE_CODES } from '@/config/tax-rates';

export function StateDistributionSection() {
  const { states, setStates } = useProposalStore((s) => s);
  const [search, setSearch] = useState('');

  const totalPercent = states.reduce((sum, s) => sum + s.workforcePercent, 0);

  const availableStates = useMemo(() => {
    const usedCodes = new Set(states.map((s) => s.stateCode));
    return ALL_STATE_CODES
      .filter((code) => !usedCodes.has(code))
      .filter((code) => {
        if (!search) return true;
        const q = search.toLowerCase();
        return code.toLowerCase().includes(q) || STATE_NAMES[code].toLowerCase().includes(q);
      });
  }, [states, search]);

  const addState = (code: string) => {
    const autoPercent = states.length === 0 ? 100 : 0;
    setStates([
      ...states,
      {
        stateCode: code,
        stateName: STATE_NAMES[code],
        stateTaxRate: STATE_TAX_RATES[code],
        workforcePercent: autoPercent,
      },
    ]);
    setSearch('');
  };

  const removeState = (code: string) => {
    setStates(states.filter((s) => s.stateCode !== code));
  };

  const updatePercent = (code: string, pct: number) => {
    setStates(states.map((s) => (s.stateCode === code ? { ...s, workforcePercent: pct } : s)));
  };

  const distributeEvenly = useCallback(() => {
    if (states.length === 0) return;
    const each = Math.floor(100 / states.length);
    const remainder = 100 - each * states.length;
    setStates(states.map((s, i) => ({ ...s, workforcePercent: each + (i < remainder ? 1 : 0) })));
  }, [states, setStates]);

  const addAllStates = useCallback(() => {
    const usedCodes = new Set(states.map((s) => s.stateCode));
    const remaining = ALL_STATE_CODES.filter((code) => !usedCodes.has(code));
    const newEntries = remaining.map((code) => ({
      stateCode: code,
      stateName: STATE_NAMES[code],
      stateTaxRate: STATE_TAX_RATES[code],
      workforcePercent: 0,
    }));
    setStates([...states, ...newEntries]);
  }, [states, setStates]);

  const clearAll = useCallback(() => {
    setStates([]);
  }, [setStates]);

  return (
    <SectionCard id="states" title="State Distribution" subtitle="Where do the employees work?" zIndex={10}>
      {/* Action buttons */}
      <div className="flex items-center gap-2 mb-4">
        <button
          onClick={addAllStates}
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-text-secondary hover:text-text-primary transition-colors"
          style={{ background: '#F7F8FC', border: '1px solid rgba(15, 11, 46, 0.08)' }}
        >
          <Globe size={13} />
          Add All 50 States
        </button>
        {states.length > 0 && (
          <button
            onClick={clearAll}
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[12px] font-medium text-text-tertiary hover:text-error transition-colors"
            style={{ background: '#F7F8FC', border: '1px solid rgba(15, 11, 46, 0.08)' }}
          >
            <Trash2 size={13} />
            Clear All
          </button>
        )}
      </div>

      {states.length > 0 && (
        <div className="space-y-2 mb-4">
          {states.map((state) => (
            <div key={state.stateCode} className="glass-secondary flex items-center gap-3 !rounded-[12px]">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-semibold text-text-primary">{state.stateCode}</span>
                  <span className="text-[13px] text-text-secondary">{state.stateName}</span>
                </div>
              </div>
              <PercentInput
                value={state.workforcePercent}
                onChange={(val) => updatePercent(state.stateCode, val)}
              />
              <button onClick={() => removeState(state.stateCode)} className="text-text-tertiary hover:text-error transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          ))}

          <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-3">
              <TotalBadge value={totalPercent} target={100} />
              {states.length >= 2 && (
                <button
                  onClick={distributeEvenly}
                  className="glass-secondary inline-flex items-center gap-1.5 !rounded-full !px-3 !py-1.5 text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors"
                >
                  <RefreshCw size={14} className="text-current" />
                  Distribute Evenly
                </button>
              )}
            </div>
            {states.length > 1 && Math.abs(totalPercent - 100) >= 0.5 && (
              <ValidationBanner type="warning" message="Distribution must total 100%" />
            )}
          </div>
        </div>
      )}

      {/* Add state search */}
      <div className="relative">
        <div className="glass-input flex items-center gap-2 px-3.5 py-2.5">
          <Plus className="h-4 w-4 text-text-tertiary" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search states to add..."
            className="flex-1 bg-transparent text-[14px] text-text-primary placeholder:text-text-tertiary focus:outline-none"
          />
        </div>
        {search && availableStates.length > 0 && (
          <div
            className="absolute z-50 mt-1 w-full overflow-y-auto !rounded-[12px]"
            style={{
              maxHeight: 240,
              background: '#FFFFFF',
              border: '1px solid rgba(15, 11, 46, 0.08)',
              boxShadow: '0 8px 24px rgba(15, 11, 46, 0.12)',
              padding: 0,
            }}
          >
            {availableStates.slice(0, 10).map((code) => (
              <button
                key={code}
                onClick={() => addState(code)}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-[14px] hover:bg-surface-glass-hover text-left transition-colors"
              >
                <span className="font-semibold text-text-primary">{code}</span>
                <span className="text-text-secondary">{STATE_NAMES[code]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  );
}
