import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { GlassBackground } from '@/features/proposal/components/shared/GlassBackground';
import { GlassCard } from '@/features/proposal/components/shared/GlassCard';
import { DisclaimerModal } from '@/features/proposal/components/shared/DisclaimerModal';
import { FileUploadSection } from './sections/FileUploadSection';
import { ColumnMappingSection } from './sections/ColumnMappingSection';
import { ValidationReviewSection } from './sections/ValidationReviewSection';
import { IAResultsSection } from './sections/ResultsSection';
import { detectColumnMapping, validateFile, type ColumnMapping, type ValidationResult, type RecognizedField } from './engine/mini-file-validator';
import { RecognizedFieldsView } from './components/RecognizedFieldsView';
import { analyzeEmployees, type EmployeeResult } from './engine/mini-analyzer';
import { useInformedPDFGeneration } from '@/features/proposal/hooks/useInformedPDFGeneration';
import type { ParsedEmployeeRow, ProposalResult, PaycheckComparison, BenefitsConfig } from '@/features/proposal/types/proposal.types';

type Step = 'upload' | 'mapping' | 'review' | 'results';

const DEFAULT_BENEFITS: BenefitsConfig = {
  enabled: false,
  healthcare: { enabled: true, participationRate: 75, premiums: { medical: { individual: 200, family: 775 }, dental: { individual: 35, family: 85 }, vision: { individual: 15, family: 40 } } },
  retirement: { enabled: false, participationRate: 60, contributionRates: { entry: 4, mid: 6, senior: 8, executive: 10 } },
  hsa: { enabled: false, participationRate: 30, annualContribution: 1500 },
};

function stripBOM(s: string): string {
  return s.replace(/^\uFEFF/, '');
}

function normalizeColumnNames(cols: string[]): string[] {
  return cols.map((c, i) => {
    const cleaned = stripBOM(c).trim();
    return cleaned || `Column_${i + 1}`;
  });
}

function normalizeDataRow(row: Record<string, string>, originalCols: string[], normalizedCols: string[]): Record<string, string> {
  const normalized: Record<string, string> = {};
  for (let i = 0; i < originalCols.length; i++) {
    const val = row[originalCols[i]];
    normalized[normalizedCols[i]] = typeof val === 'string' ? val.trim() : (val != null ? String(val) : '');
  }
  return normalized;
}

function parseSalaryValue(raw: string | null | undefined): number {
  if (raw == null) return 0;
  const cleaned = String(raw).replace(/[,$\s]/g, '').replace(/^\((.+)\)$/, '-$1');
  const val = parseFloat(cleaned);
  return isNaN(val) ? 0 : Math.abs(val);
}

function normalizeFilingStatus(val: string): 'single' | 'married' | 'hoh' {
  const l = (val || '').toLowerCase().trim();
  if (l.includes('married') || l === 'mfj' || l === 'm') return 'married';
  if (l.includes('head') || l === 'hoh' || l === 'h') return 'hoh';
  return 'single';
}

interface InformedAnalysisPageProps {
  groupId?: string;
}

export function InformedAnalysisPage({ groupId: _groupId = 'demo' }: InformedAnalysisPageProps) {
  const navigate = useNavigate();
  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [rawData, setRawData] = useState<Record<string, string>[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [mapping, setMapping] = useState<ColumnMapping>({ salary: null, filingStatus: null, stateCode: null, employeeName: null, employeeId: null, employmentStatus: null, hireDate: null, dob: null });
  const [validation, setValidation] = useState<ValidationResult | null>(null);
  const [employees, setEmployees] = useState<ParsedEmployeeRow[]>([]);
  const [result, setResult] = useState<ProposalResult | null>(null);
  const [paycheckComparisons, setPaycheckComparisons] = useState<PaycheckComparison[]>([]);
  const [employeeResults, setEmployeeResults] = useState<EmployeeResult[]>([]);
  const [recognizedFields, setRecognizedFields] = useState<RecognizedField[]>([]);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [payrollFreq, setPayrollFreq] = useState<'weekly' | 'biweekly' | 'semimonthly' | 'monthly'>('biweekly');

  const { downloadPDF: downloadInformedPDF, isGenerating: isGeneratingPDF } = useInformedPDFGeneration();

  const rawDataRef = useRef<Record<string, string>[]>([]);
  const mappingRef = useRef<ColumnMapping>(mapping);
  const payrollFreqRef = useRef(payrollFreq);

  const parseFile = useCallback(async (f: File) => {
    const ext = f.name.split('.').pop()?.toLowerCase();
    if (ext === 'csv') {
      return new Promise<{ columns: string[]; data: Record<string, string>[] }>((resolve) => {
        Papa.parse(f, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (h: string) => stripBOM(h).trim(),
          complete: (r) => {
            const cols = r.meta.fields ?? [];
            const data = (r.data as Record<string, string>[]).map((row) => {
              const clean: Record<string, string> = {};
              for (const key of cols) {
                clean[key] = typeof row[key] === 'string' ? row[key].trim() : (row[key] != null ? String(row[key]) : '');
              }
              return clean;
            });
            resolve({ columns: cols, data });
          },
        });
      });
    }
    const buffer = await f.arrayBuffer();
    const wb = XLSX.read(buffer);
    const ws = wb.Sheets[wb.SheetNames[0]];
    const json = XLSX.utils.sheet_to_json<Record<string, string>>(ws, { raw: false });
    if (json.length === 0) return { columns: [], data: [] };
    const origCols = Object.keys(json[0]);
    const normCols = normalizeColumnNames(origCols);
    const data = json.map((row) => normalizeDataRow(row, origCols, normCols));
    return { columns: normCols, data };
  }, []);

  const detectPayrollFrequency = useCallback((data: Record<string, string>[], cols: string[]): 'weekly' | 'biweekly' | 'semimonthly' | 'monthly' => {
    const freqCol = cols.find((c) => /pay.?freq|pay.?period|pay.?cycle|frequency/i.test(c));
    if (freqCol) {
      const sample = (data[0]?.[freqCol] || '').toLowerCase();
      if (sample.includes('week') && !sample.includes('bi')) return 'weekly';
      if (sample.includes('semi')) return 'semimonthly';
      if (sample.includes('month') && !sample.includes('semi')) return 'monthly';
    }
    return 'biweekly';
  }, []);

  const handleFileSelected = useCallback(async (selectedFile: File) => {
    setFile(selectedFile);
    const { columns: cols, data } = await parseFile(selectedFile);
    setColumns(cols);
    setRawData(data);
    rawDataRef.current = data;
    const suggested = detectColumnMapping(cols);
    setMapping(suggested);
    mappingRef.current = suggested;
    const freq = detectPayrollFrequency(data, cols);
    setPayrollFreq(freq);
    payrollFreqRef.current = freq;
    const v = validateFile(cols, data, suggested);
    setValidation(v);
    setRecognizedFields(v.recognizedFields);
    setStep('mapping');
  }, [parseFile, detectPayrollFrequency]);

  const handleUpdateMapping = useCallback((field: keyof ColumnMapping, column: string | null) => {
    const m = { ...mapping, [field]: column };
    setMapping(m);
    mappingRef.current = m;
    setValidation(validateFile(columns, rawData, m));
  }, [mapping, columns, rawData]);

  const handleConfirmMapping = useCallback(() => {
    setShowDisclaimer(true);
  }, []);

  const handleDisclaimerAccept = useCallback(() => {
    setShowDisclaimer(false);
    const currentData = rawDataRef.current;
    const currentMapping = mappingRef.current;
    const currentFreq = payrollFreqRef.current;

    const parsed: ParsedEmployeeRow[] = currentData.map((row, i) => ({
      employeeId: currentMapping.employeeId ? (row[currentMapping.employeeId] || String(i + 1)) : String(i + 1),
      name: currentMapping.employeeName ? (row[currentMapping.employeeName] || `Employee ${i + 1}`) : `Employee ${i + 1}`,
      salary: parseSalaryValue(currentMapping.salary ? row[currentMapping.salary] : null),
      filingStatus: currentMapping.filingStatus ? normalizeFilingStatus(row[currentMapping.filingStatus]) : 'single',
      stateCode: currentMapping.stateCode ? (row[currentMapping.stateCode] || 'TX').toUpperCase().trim().substring(0, 2) : 'TX',
      employmentStatus: currentMapping.employmentStatus ? (row[currentMapping.employmentStatus]?.toLowerCase().includes('part') ? 'part_time' as const : 'full_time' as const) : 'full_time' as const,
      hireDate: currentMapping.hireDate ? row[currentMapping.hireDate] : undefined,
      dob: currentMapping.dob ? row[currentMapping.dob] : undefined,
    })).filter((emp) => emp.salary > 0);

    setEmployees(parsed);
    const { result: r, paycheckComparisons: c, employeeResults: er } = analyzeEmployees(parsed, { benefits: DEFAULT_BENEFITS, payrollFrequency: currentFreq });
    setResult(r);
    setPaycheckComparisons(c);
    setEmployeeResults(er);
    setStep('results');
    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 50);
  }, []);

  const handleDisclaimerBack = useCallback(() => {
    setShowDisclaimer(false);
  }, []);

  const handleReset = useCallback(() => {
    setStep('upload'); setFile(null); setRawData([]); setColumns([]); setResult(null); setEmployees([]); setPaycheckComparisons([]); setEmployeeResults([]); setRecognizedFields([]); setShowDisclaimer(false);
    rawDataRef.current = []; mappingRef.current = mapping;
  }, []);

  return (
    <GlassBackground>
      <div className="mx-auto max-w-5xl px-4 py-8 space-y-6">
        {/* Hero */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mx-auto max-w-[720px]">
          <div className="glass-primary text-center">
            <p className="text-[12px] font-semibold uppercase tracking-[0.15em] text-text-tertiary">Section 125 Proposal Tool</p>
            <h1 className="mt-3 text-[44px] font-bold text-text-primary">Informed Analysis</h1>
            <p className="mx-auto mt-4 max-w-[560px] text-[15px] leading-relaxed text-text-secondary">
              Upload your census or payroll file for a high-accuracy, employee-level savings analysis with paycheck comparison views.
            </p>
            <p className="mx-auto mt-3 max-w-[560px] text-[13px] italic text-text-tertiary">
              Analysis results are projections based on uploaded payroll data and current tax rates. Actual savings will vary based on employee participation, turnover, and benefit elections. This is not a guarantee of savings.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <GlassCard variant="secondary" className="inline-flex items-center gap-2 !rounded-full !px-4 !py-2 text-[13px] font-medium text-text-secondary">
                <BarChart3 className="h-3.5 w-3.5 text-accent" />
                Data-driven — Higher accuracy
              </GlassCard>
              <button
                onClick={() => navigate('/quick-proposal')}
                className="inline-flex items-center gap-2 rounded-full border border-border-glass-light px-4 py-2 text-[13px] font-medium text-text-tertiary hover:text-text-secondary hover:bg-surface-glass-light transition-colors"
              >
                <Zap className="h-3.5 w-3.5" />
                No file? Use Quick Proposal
              </button>
            </div>
          </div>
        </motion.div>

        {(step === 'upload' || step === 'mapping') && <FileUploadSection onFileSelected={handleFileSelected} currentFile={file} />}
        {step === 'mapping' && validation && recognizedFields.length > 0 && (
          <RecognizedFieldsView
            recognizedFields={recognizedFields}
            rowCount={validation.rowCount}
            fileName={file?.name ?? 'file'}
          />
        )}
        {step === 'mapping' && validation && <ColumnMappingSection columns={columns} mapping={mapping} validation={validation} onUpdateMapping={handleUpdateMapping} onConfirm={handleConfirmMapping} />}
        {step === 'review' && <ValidationReviewSection employees={employees} />}
        {step === 'results' && result && <IAResultsSection result={result} paycheckComparisons={paycheckComparisons} companyName={file?.name.replace(/\.[^.]+$/, '') ?? 'Company'} payrollFrequency={payrollFreq} employees={employees} employeeResults={employeeResults} onDownloadPDF={() => downloadInformedPDF({ groupName: file?.name.replace(/\.[^.]+$/, '') ?? 'Company', result, employeeResults, payrollFrequency: payrollFreq })} onSaveDraft={() => {}} onReset={handleReset} isGeneratingPDF={isGeneratingPDF} isSaving={false} />}
      </div>
      <DisclaimerModal
        open={showDisclaimer}
        onAccept={handleDisclaimerAccept}
        onGoBack={handleDisclaimerBack}
      />
    </GlassBackground>
  );
}
