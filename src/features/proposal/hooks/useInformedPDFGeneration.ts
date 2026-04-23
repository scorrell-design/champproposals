import { useState, useCallback } from 'react';
import { pdf } from '@react-pdf/renderer';
import { createElement } from 'react';
import { InformedAnalysisPDF } from '../components/pdf/InformedAnalysisPDF';
import type { InformedAnalysisPDFProps } from '../components/pdf/InformedAnalysisPDF';

export function useInformedPDFGeneration() {
  const [isGenerating, setIsGenerating] = useState(false);

  const generatePDF = useCallback(async (props: InformedAnalysisPDFProps): Promise<Blob | null> => {
    setIsGenerating(true);
    try {
      const doc = createElement(InformedAnalysisPDF, props);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const blob = await pdf(doc as any).toBlob();
      return blob;
    } catch (err) {
      console.error('Informed Analysis PDF generation failed:', err);
      return null;
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const downloadPDF = useCallback(async (props: InformedAnalysisPDFProps) => {
    try {
      const blob = await generatePDF(props);
      if (!blob) return null;

      const slug = props.groupName.replace(/\s+/g, '_') || 'Company';
      const date = new Date().toISOString().split('T')[0];
      const filename = `${slug}_InformedAnalysis_${date}.pdf`;

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
      console.error('Informed Analysis PDF download failed:', err);
      return null;
    }
  }, [generatePDF]);

  return { generatePDF, downloadPDF, isGenerating };
}
