import { useState, useCallback } from 'react';
import { saveProposal } from '../api/proposal.api';
import { useProposalStore } from '../store/proposal.store';
import type { SaveProposalRequest } from '../types/api.types';

export function useProposalPersistence(groupId: string) {
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedId, setLastSavedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const save = useCallback(async (pdfBlob?: Blob) => {
    const state = useProposalStore.getState();
    if (!state.result) return;

    setIsSaving(true);
    setError(null);

    try {
      const request: SaveProposalRequest = {
        type: 'quick_proposal',
        companyName: state.company.name,
        employeeCount: state.company.employeeCount,
        generatedAt: new Date().toISOString(),
        projectedSavings: state.result.savingsRange.projected,
        conservativeEstimate: state.result.savingsRange.conservative,
        optimalSavings: state.result.savingsRange.optimal,
        qualifiedEmployees: state.result.qualifiedEmployees,
        positivelyImpactedEmployees: state.result.positivelyImpactedCount,
        positivelyImpactedPercent: state.result.positivelyImpactedPercent,
        avgEmployeeSavings: state.result.avgEmployeeAnnualSavings,
        tierBreakdown: state.result.tierResults,
        inputSnapshot: {
          company: state.company,
          states: state.states,
          filingStatus: state.filingStatus,
          industry: state.industry,
          tierCount: state.tierCount,
          tiers: state.tiers,
          socialSecurity: state.socialSecurity,
          benefits: state.benefits,
        },
        pdfBlob,
      };

      const response = await saveProposal(groupId, request);
      setLastSavedId(response.proposalId);
      return response;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save proposal');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [groupId]);

  return { save, isSaving, lastSavedId, error };
}
