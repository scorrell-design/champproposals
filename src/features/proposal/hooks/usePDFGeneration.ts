import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { createElement } from 'react';
import { ProposalPDF } from '../components/pdf/ProposalPDF';
import { useProposalStore } from '../store/proposal.store';

export function usePDFGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = useCallback(async (): Promise<Blob | null> => {
    const state = useProposalStore.getState();
    if (!state.result) return null;

    setIsGenerating(true);
    try {
      const doc = createElement(ProposalPDF, {
        company: state.company,
        result: state.result,
        proposalType: 'quick_proposal',
      });
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await pdf(doc as any).toBlob();
      return blob;
    } catch (err) {
      console.error('PDF generation failed:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const downloadPDF = useCallback(async () => {
    try {
      const state = useProposalStore.getState();
      const blob = await generatePDF();
      if (!blob) return null;

      const companySlug = state.company.name.replace(/\s+/g, '_') || 'Company';
      const date = new Date().toISOString().split('T')[0];
      const filename = `${companySlug}_Section125_Proposal_${date}.pdf`;

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      return blob;
    } catch (err) {
      console.error('PDF download failed:', err);
      return null;
    }
  }, [generatePDF]);

  return { generatePDF, downloadPDF, isGenerating };
}
