import { useEffect, useRef, useCallback } from 'react';
import { useProposalStore } from '../store/proposal.store';
import { calculateTierResult, estimatePreTaxDeductions, calculateSavingsRange } from '../engine';
import { ADMIN_FEE_ANNUAL } from '@/config/fica-rates';
import type { ProposalResult, TierResult } from '../types/proposal.types';

const DEBOUNCE_MS = 800;

export function useProposalCalculation() {
  const store = useProposalStore((s) => s);
  const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const runCalculation = useCallback(() => {
    const { company, states, filingStatus, tiers, benefits } = useProposalStore.getState();

    if (!company.employeeCount || tiers.length === 0 || states.length === 0) {
      useProposalStore.getState().setResult(null);
      return;
    }

    useProposalStore.getState().setIsCalculating(true);

    const stateDistribution = states.map((s) => ({
      stateCode: s.stateCode,
      percent: s.workforcePercent,
    }));

    const tierResults: TierResult[] = [];
    let totalEmployerSavings = 0;
    let totalQualified = 0;
    let totalPositive = 0;
    let totalEmployeeSavings = 0;

    for (const tier of tiers) {
      const employeeCount = Math.round(company.employeeCount * (tier.workforcePercent / 100));
      const avgSalary = (tier.salaryMin + tier.salaryMax) / 2;

      let healthPremiumAnnual = 0;
      let retirementRate = 0;
      let hsaAnnual = 0;

      if (benefits.enabled) {
        if (benefits.healthcare.enabled) {
          const avgPremium = (benefits.healthcare.premiums.medical.individual + benefits.healthcare.premiums.medical.family) / 2;
          healthPremiumAnnual = avgPremium * 12;
        }
        if (benefits.retirement.enabled) {
          retirementRate = benefits.retirement.contributionRates[tier.level] ?? 6;
        }
        if (benefits.hsa.enabled) {
          hsaAnnual = benefits.hsa.annualContribution;
        }
      }

      const preTaxDeduction = estimatePreTaxDeductions(avgSalary, tier.level, {
        healthParticipation: benefits.enabled && benefits.healthcare.enabled ? benefits.healthcare.participationRate : 0,
        healthPremiumAnnual,
        retirementParticipation: benefits.enabled && benefits.retirement.enabled ? benefits.retirement.participationRate : 0,
        retirementRate,
        hsaParticipation: benefits.enabled && benefits.hsa.enabled ? benefits.hsa.participationRate : 0,
        hsaAnnual,
      });

      const result = calculateTierResult(
        tier.label,
        employeeCount,
        avgSalary,
        stateDistribution,
        filingStatus,
        preTaxDeduction,
      );

      tierResults.push({
        tier: tier.label,
        employeeCount,
        avgSalary,
        avgPreTaxDeduction: preTaxDeduction,
        ficaSavingsPerEmployee: result.ficaSavingsPerEmployee,
        netImpactPerEmployee: result.netImpactPerEmployee,
      });

      totalEmployerSavings += result.totalEmployerSavings;
      totalQualified += result.qualifiedCount;
      totalPositive += result.positiveCount;
      totalEmployeeSavings += result.netImpactPerEmployee * employeeCount;
    }

    const totalAdminFee = ADMIN_FEE_ANNUAL * company.employeeCount;
    const netAnnualBenefit = totalEmployerSavings - totalAdminFee;
    const avgEmployeeSavings = company.employeeCount > 0 ? totalEmployeeSavings / company.employeeCount : 0;
    const savingsRange = calculateSavingsRange(totalEmployerSavings, 'quick_proposal');

    const proposalResult: ProposalResult = {
      employerAnnualFICASavings: Math.round(totalEmployerSavings),
      avgEmployeeAnnualSavings: Math.round(avgEmployeeSavings),
      qualifiedEmployees: totalQualified,
      totalEmployees: company.employeeCount,
      positivelyImpactedCount: totalPositive,
      positivelyImpactedPercent: company.employeeCount > 0 ? Math.round((totalPositive / company.employeeCount) * 100) : 0,
      tierResults,
      savingsRange,
      netAnnualBenefit: Math.round(netAnnualBenefit),
      totalAdminFee: Math.round(totalAdminFee),
    };

    useProposalStore.getState().setResult(proposalResult);
    useProposalStore.getState().setIsCalculating(false);
  }, []);

  useEffect(() => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(runCalculation, DEBOUNCE_MS);
    return () => clearTimeout(timerRef.current);
  }, [
    store.company,
    store.states,
    store.filingStatus,
    store.tiers,
    store.benefits,
    runCalculation,
  ]);

  return { result: store.result, isCalculating: store.isCalculating };
}
