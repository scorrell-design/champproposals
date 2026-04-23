import { Document, Page, View, Text, StyleSheet, Font } from '@react-pdf/renderer';
import { PDFSavingsSpectrum } from './PDFSavingsSpectrum';
import { BRAND } from './brandTokens';
import type { ProposalResult, SavingsRange } from '../../types/proposal.types';
import type { EmployeeResult } from '@/features/informed-analysis/engine/mini-analyzer';

Font.register({
  family: 'Inter',
  fonts: [
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-400-normal.ttf', fontWeight: 400 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-500-normal.ttf', fontWeight: 500 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-600-normal.ttf', fontWeight: 600 },
    { src: 'https://cdn.jsdelivr.net/fontsource/fonts/inter@latest/latin-700-normal.ttf', fontWeight: 700 },
  ],
});

const ROWS_FIRST_PAGE = 12;
const ROWS_PER_CONTINUATION = 22;

const s = StyleSheet.create({
  page: {
    paddingTop: 0,
    paddingBottom: 60,
    paddingHorizontal: 48,
    fontFamily: 'Inter',
    fontSize: 10,
    color: BRAND.ink,
    backgroundColor: BRAND.white,
  },
  headerBand: {
    marginHorizontal: -48,
    marginTop: 0,
    paddingHorizontal: 48,
    paddingVertical: 20,
    backgroundColor: BRAND.blue,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 72,
  },
  headerBrandText: {
    fontSize: 14,
    fontWeight: 700,
    color: BRAND.white,
    letterSpacing: 0.5,
  },
  headerEyebrow: {
    fontSize: 10,
    fontWeight: 500,
    color: 'rgba(255,255,255,0.8)',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  groupName: {
    fontSize: 28,
    fontWeight: 700,
    color: BRAND.blue,
    marginTop: 24,
  },
  accentBar: {
    width: 60,
    height: 3,
    backgroundColor: BRAND.blueBright,
    marginTop: 8,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 11,
    color: BRAND.muted,
  },
  censusBadge: {
    backgroundColor: BRAND.blue,
    color: BRAND.white,
    fontSize: 9,
    fontWeight: 500,
    letterSpacing: 1.2,
    textTransform: 'uppercase',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
    marginTop: 8,
    alignSelf: 'flex-start',
  },
  metaLine: {
    fontSize: 10,
    color: BRAND.muted,
    marginTop: 6,
  },
  divider: {
    height: 0.5,
    backgroundColor: BRAND.border,
    marginVertical: 14,
  },
  kpiRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
    marginBottom: 14,
  },
  kpiCard: {
    flex: 1,
    backgroundColor: BRAND.blueSoft,
    borderRadius: 6,
    padding: 12,
    borderLeft: `3 solid ${BRAND.blue}`,
  },
  kpiLabel: {
    fontSize: 9,
    color: BRAND.blue,
    textTransform: 'uppercase',
    fontWeight: 500,
    letterSpacing: 0.7,
  },
  kpiValue: {
    fontSize: 24,
    fontWeight: 600,
    color: BRAND.ink,
    marginTop: 4,
  },
  kpiSublabel: {
    fontSize: 9,
    color: BRAND.muted,
    marginTop: 2,
  },
  precisionCallout: {
    backgroundColor: BRAND.blueSoft,
    borderLeft: `3 solid ${BRAND.blue}`,
    borderRadius: 6,
    padding: 12,
    marginBottom: 14,
  },
  precisionText: {
    fontSize: 10,
    color: BRAND.ink,
    lineHeight: 1.5,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 700,
    color: BRAND.blue,
    marginBottom: 4,
  },
  sectionCaption: {
    fontSize: 9,
    color: BRAND.muted,
    marginBottom: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: BRAND.blueSoft,
    padding: 8,
    borderRadius: 4,
  },
  tableHeaderCell: {
    fontSize: 8,
    fontWeight: 500,
    color: BRAND.blue,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  tableRow: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: `0.5 solid ${BRAND.border}`,
  },
  tableRowAlt: {
    flexDirection: 'row',
    padding: 8,
    borderBottom: `0.5 solid ${BRAND.border}`,
    backgroundColor: BRAND.light,
  },
  tableCell: {
    fontSize: 9,
    color: BRAND.ink,
  },
  tableCellAccent: {
    fontSize: 9,
    fontWeight: 600,
    color: BRAND.blueBright,
  },
  summaryRow: {
    flexDirection: 'row',
    backgroundColor: BRAND.blueSoft,
    padding: 8,
    borderRadius: 4,
    marginTop: 2,
  },
  summaryCell: {
    fontSize: 9,
    fontWeight: 600,
    color: BRAND.ink,
  },
  paycheckCard: {
    border: `0.5 solid ${BRAND.border}`,
    borderRadius: 4,
    padding: 16,
    marginBottom: 12,
  },
  paycheckTopLine: {
    fontSize: 10,
    color: BRAND.ink,
    marginBottom: 10,
  },
  paycheckMeta: {
    fontSize: 10,
    color: BRAND.muted,
  },
  paycheckColumns: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 10,
  },
  paycheckCol: {
    flex: 1,
  },
  paycheckEyebrow: {
    fontSize: 8,
    fontWeight: 500,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  paycheckValue: {
    fontSize: 18,
    fontWeight: 500,
    marginBottom: 2,
  },
  paycheckCaption: {
    fontSize: 8,
    color: BRAND.muted,
  },
  paycheckStrip: {
    backgroundColor: BRAND.blueSoft,
    padding: 8,
    borderRadius: 4,
    alignItems: 'center',
  },
  paycheckStripText: {
    fontSize: 11,
    fontWeight: 500,
    color: BRAND.blue,
  },
  disclaimerSection: {
    marginTop: 20,
    paddingTop: 12,
    borderTop: `0.5 solid ${BRAND.border}`,
  },
  disclaimerTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: BRAND.blue,
    marginBottom: 6,
  },
  disclaimerText: {
    fontSize: 9,
    color: BRAND.muted,
    lineHeight: 1.5,
    marginBottom: 4,
  },
  footer: {
    position: 'absolute',
    bottom: 24,
    left: 48,
    right: 48,
    borderTop: `0.5 solid ${BRAND.border}`,
    paddingTop: 6,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 8,
    color: BRAND.muted,
  },
  footerBrand: {
    fontSize: 8,
    color: BRAND.blue,
    fontWeight: 700,
    letterSpacing: 0.5,
  },
});

const fmt = (n: number) => `$${Math.round(n).toLocaleString('en-US')}`;
const fmtCents = (n: number) => `$${n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const COL_W = {
  emp: '16%',
  filing: '12%',
  salary: '18%',
  currentNet: '18%',
  projectedNet: '18%',
  savings: '18%',
};

function TableHeaderRow() {
  return (
    <View style={s.tableHeader}>
      <Text style={[s.tableHeaderCell, { width: COL_W.emp }]}>Employee</Text>
      <Text style={[s.tableHeaderCell, { width: COL_W.filing }]}>Filing</Text>
      <Text style={[s.tableHeaderCell, { width: COL_W.salary, textAlign: 'right' }]}>Annual Salary</Text>
      <Text style={[s.tableHeaderCell, { width: COL_W.currentNet, textAlign: 'right' }]}>Current Net (Annual)</Text>
      <Text style={[s.tableHeaderCell, { width: COL_W.projectedNet, textAlign: 'right' }]}>Projected Net (Annual)</Text>
      <Text style={[s.tableHeaderCell, { width: COL_W.savings, textAlign: 'right' }]}>Annual Savings</Text>
    </View>
  );
}

export interface InformedAnalysisPDFProps {
  groupName: string;
  result: ProposalResult;
  employeeResults: EmployeeResult[];
  payrollFrequency: string;
}

export function InformedAnalysisPDF({ groupName, result, employeeResults, payrollFrequency }: InformedAnalysisPDFProps) {
  const date = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const currentYear = new Date().getFullYear();
  const totalCombinedSavings = result.employerAnnualFICASavings + (result.avgEmployeeAnnualSavings * result.totalEmployees);

  const freq = payrollFrequency as 'weekly' | 'biweekly' | 'semimonthly' | 'monthly';
  const periodsMap: Record<string, number> = { weekly: 52, biweekly: 26, semimonthly: 24, monthly: 12 };
  const periods = periodsMap[freq] || 26;

  const employeeRows = employeeResults.map((er, i) => {
    const salary = er.employee.salary;
    const filing = er.employee.filingStatus === 'hoh' ? 'HoH' : er.employee.filingStatus === 'married' ? 'Married' : 'Single';
    const currentAnnualNet = salary - (salary * 0.30);
    const projectedAnnualNet = currentAnnualNet + er.netImpact;
    return {
      label: `Employee ${i + 1}`,
      filing,
      salary,
      currentAnnualNet,
      projectedAnnualNet,
      annualSavings: er.netImpact,
    };
  });

  const totalSalary = employeeRows.reduce((s, r) => s + r.salary, 0);
  const totalCurrentNet = employeeRows.reduce((s, r) => s + r.currentAnnualNet, 0);
  const totalProjectedNet = employeeRows.reduce((s, r) => s + r.projectedAnnualNet, 0);
  const totalSavings = employeeRows.reduce((s, r) => s + r.annualSavings, 0);

  const sampleIndices = selectSampleIndices(employeeRows.length);
  const sampleLetters = ['A', 'B', 'C', 'D', 'E'];
  const samples = sampleIndices.map((idx, si) => {
    const row = employeeRows[idx];
    return {
      letter: sampleLetters[si] || String.fromCharCode(65 + si),
      ...row,
      perPaycheckBefore: row.currentAnnualNet / periods,
      perPaycheckAfter: row.projectedAnnualNet / periods,
    };
  });

  const firstPageRows = employeeRows.slice(0, ROWS_FIRST_PAGE);
  const remainingRows = employeeRows.slice(ROWS_FIRST_PAGE);
  const continuationChunks: typeof employeeRows[] = [];
  for (let i = 0; i < remainingRows.length; i += ROWS_PER_CONTINUATION) {
    continuationChunks.push(remainingRows.slice(i, i + ROWS_PER_CONTINUATION));
  }
  const isTableContinued = remainingRows.length > 0;

  return (
    <Document>
      {/* PAGE 1 — Header + KPIs + start of employee table */}
      <Page size="LETTER" style={s.page}>
        <View style={s.headerBand}>
          <Text style={s.headerBrandText}>Champion Health, Inc.</Text>
          <Text style={s.headerEyebrow}>Informed Analysis</Text>
        </View>

        <Text style={s.groupName}>{groupName || 'Company'}</Text>
        <View style={s.accentBar} />
        <Text style={s.subtitle}>Section 125 Cafeteria Plan — Census-Based Tax Savings Analysis</Text>
        <Text style={s.censusBadge}>CENSUS-BASED</Text>
        <Text style={s.metaLine}>{date} · {result.totalEmployees} employees · Based on uploaded census data</Text>

        <View style={s.divider} />

        <View style={s.kpiRow}>
          <View style={s.kpiCard}>
            <Text style={s.kpiLabel}>Total Combined Annual Savings</Text>
            <Text style={s.kpiValue}>{fmt(totalCombinedSavings)}</Text>
            <Text style={s.kpiSublabel}>Employer FICA + Employee tax savings</Text>
          </View>
          <View style={s.kpiCard}>
            <Text style={s.kpiLabel}>Employer FICA Savings</Text>
            <Text style={s.kpiValue}>{fmt(result.employerAnnualFICASavings)}</Text>
            <Text style={s.kpiSublabel}>Annual employer-side savings</Text>
          </View>
          <View style={s.kpiCard}>
            <Text style={s.kpiLabel}>Avg. Employee Annual Savings</Text>
            <Text style={s.kpiValue}>{fmt(result.avgEmployeeAnnualSavings)}</Text>
            <Text style={s.kpiSublabel}>Per participating employee</Text>
          </View>
        </View>

        <View style={s.precisionCallout}>
          <Text style={s.precisionText}>
            This analysis uses your actual census data. Results are calculated per-employee and reflect precise savings projections within 1% accuracy, rather than the estimated ranges shown in Quick Proposal outputs.
          </Text>
        </View>

        <PDFSavingsSpectrum range={result.savingsRange} proposalType="informed_analysis" />

        <View style={s.divider} />

        <Text style={s.sectionTitle}>Employee-Level Breakdown</Text>
        <Text style={s.sectionCaption}>Employee identifiers anonymized. Data based on uploaded census.</Text>

        <TableHeaderRow />
        {firstPageRows.map((row, i) => (
          <View key={i} style={i % 2 === 1 ? s.tableRowAlt : s.tableRow}>
            <Text style={[s.tableCell, { width: COL_W.emp, fontWeight: 600 }]}>{row.label}</Text>
            <Text style={[s.tableCell, { width: COL_W.filing }]}>{row.filing}</Text>
            <Text style={[s.tableCell, { width: COL_W.salary, textAlign: 'right' }]}>{fmt(row.salary)}</Text>
            <Text style={[s.tableCell, { width: COL_W.currentNet, textAlign: 'right' }]}>{fmt(row.currentAnnualNet)}</Text>
            <Text style={[s.tableCell, { width: COL_W.projectedNet, textAlign: 'right' }]}>{fmt(row.projectedAnnualNet)}</Text>
            <Text style={[s.tableCellAccent, { width: COL_W.savings, textAlign: 'right' }]}>{fmt(row.annualSavings)}</Text>
          </View>
        ))}

        {!isTableContinued && (
          <View style={s.summaryRow}>
            <Text style={[s.summaryCell, { width: COL_W.emp }]}>Total ({result.totalEmployees})</Text>
            <Text style={[s.summaryCell, { width: COL_W.filing }]} />
            <Text style={[s.summaryCell, { width: COL_W.salary, textAlign: 'right' }]}>{fmt(totalSalary)}</Text>
            <Text style={[s.summaryCell, { width: COL_W.currentNet, textAlign: 'right' }]}>{fmt(totalCurrentNet)}</Text>
            <Text style={[s.summaryCell, { width: COL_W.projectedNet, textAlign: 'right' }]}>{fmt(totalProjectedNet)}</Text>
            <Text style={[s.summaryCell, { width: COL_W.savings, textAlign: 'right' }]}>{fmt(totalSavings)}</Text>
          </View>
        )}

        <View style={s.footer} fixed>
          <Text style={s.footerText}>Section 125 Informed Analysis · Generated {date}</Text>
          <Text style={s.footerBrand}>Champion Health, Inc.</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>

      {/* CONTINUATION PAGES */}
      {continuationChunks.map((chunk, ci) => {
        const isLastChunk = ci === continuationChunks.length - 1;
        const baseIndex = ROWS_FIRST_PAGE + ci * ROWS_PER_CONTINUATION;
        return (
          <Page key={`table-cont-${ci}`} size="LETTER" style={s.page}>
            <View style={s.headerBand}>
              <Text style={s.headerBrandText}>Champion Health, Inc.</Text>
              <Text style={s.headerEyebrow}>Informed Analysis</Text>
            </View>

            <Text style={[s.sectionTitle, { marginTop: 20 }]}>Employee-Level Breakdown (continued)</Text>
            <TableHeaderRow />
            {chunk.map((row, i) => {
              const globalIdx = baseIndex + i;
              return (
                <View key={globalIdx} style={globalIdx % 2 === 1 ? s.tableRowAlt : s.tableRow}>
                  <Text style={[s.tableCell, { width: COL_W.emp, fontWeight: 600 }]}>{row.label}</Text>
                  <Text style={[s.tableCell, { width: COL_W.filing }]}>{row.filing}</Text>
                  <Text style={[s.tableCell, { width: COL_W.salary, textAlign: 'right' }]}>{fmt(row.salary)}</Text>
                  <Text style={[s.tableCell, { width: COL_W.currentNet, textAlign: 'right' }]}>{fmt(row.currentAnnualNet)}</Text>
                  <Text style={[s.tableCell, { width: COL_W.projectedNet, textAlign: 'right' }]}>{fmt(row.projectedAnnualNet)}</Text>
                  <Text style={[s.tableCellAccent, { width: COL_W.savings, textAlign: 'right' }]}>{fmt(row.annualSavings)}</Text>
                </View>
              );
            })}

            {isLastChunk && (
              <View style={s.summaryRow}>
                <Text style={[s.summaryCell, { width: COL_W.emp }]}>Total ({result.totalEmployees})</Text>
                <Text style={[s.summaryCell, { width: COL_W.filing }]} />
                <Text style={[s.summaryCell, { width: COL_W.salary, textAlign: 'right' }]}>{fmt(totalSalary)}</Text>
                <Text style={[s.summaryCell, { width: COL_W.currentNet, textAlign: 'right' }]}>{fmt(totalCurrentNet)}</Text>
                <Text style={[s.summaryCell, { width: COL_W.projectedNet, textAlign: 'right' }]}>{fmt(totalProjectedNet)}</Text>
                <Text style={[s.summaryCell, { width: COL_W.savings, textAlign: 'right' }]}>{fmt(totalSavings)}</Text>
              </View>
            )}

            <View style={s.footer} fixed>
              <Text style={s.footerText}>Section 125 Informed Analysis · Generated {date}</Text>
              <Text style={s.footerBrand}>Champion Health, Inc.</Text>
              <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
            </View>
          </Page>
        );
      })}

      {/* PAYCHECK COMPARISON PAGE */}
      <Page size="LETTER" style={s.page}>
        <View style={s.headerBand}>
          <Text style={s.headerBrandText}>Champion Health, Inc.</Text>
          <Text style={s.headerEyebrow}>Informed Analysis</Text>
        </View>

        <Text style={[s.sectionTitle, { marginTop: 20 }]}>Paycheck Comparison — Sample Employees</Text>
        <Text style={s.sectionCaption}>
          Representative sample of {samples.length} employees across salary tiers showing before/after Section 125 impact.
        </Text>

        {samples.map((sample) => (
          <View key={sample.letter} style={s.paycheckCard}>
            <Text style={s.paycheckTopLine}>
              Employee {sample.letter}
              <Text style={s.paycheckMeta}> · {sample.filing} · {fmt(sample.salary)} salary</Text>
            </Text>
            <View style={s.paycheckColumns}>
              <View style={s.paycheckCol}>
                <Text style={[s.paycheckEyebrow, { color: BRAND.muted }]}>CURRENT</Text>
                <Text style={[s.paycheckValue, { color: BRAND.ink }]}>{fmtCents(sample.perPaycheckBefore)}</Text>
                <Text style={s.paycheckCaption}>per paycheck</Text>
              </View>
              <View style={s.paycheckCol}>
                <Text style={[s.paycheckEyebrow, { color: BRAND.blue }]}>WITH SECTION 125 PLAN</Text>
                <Text style={[s.paycheckValue, { color: BRAND.blue, fontWeight: 600 }]}>{fmtCents(sample.perPaycheckAfter)}</Text>
                <Text style={s.paycheckCaption}>per paycheck</Text>
              </View>
            </View>
            <View style={s.paycheckStrip}>
              <Text style={s.paycheckStripText}>+{fmt(sample.annualSavings)} annual savings</Text>
            </View>
          </View>
        ))}

        <View style={s.footer} fixed>
          <Text style={s.footerText}>Section 125 Informed Analysis · Generated {date}</Text>
          <Text style={s.footerBrand}>Champion Health, Inc.</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>

      {/* DISCLOSURES PAGE */}
      <Page size="LETTER" style={s.page}>
        <View style={s.headerBand}>
          <Text style={s.headerBrandText}>Champion Health, Inc.</Text>
          <Text style={s.headerEyebrow}>Informed Analysis</Text>
        </View>

        <View style={[s.disclaimerSection, { marginTop: 20, borderTop: 'none', paddingTop: 0 }]}>
          <Text style={s.disclaimerTitle}>Important Disclosures</Text>
          <Text style={s.disclaimerText}>
            This analysis uses census data provided by or on behalf of the employer group. Calculations reflect federal and state tax rates as of {currentYear}.
          </Text>
          <Text style={s.disclaimerText}>
            Informed Analysis calculations are based on actual employee data and are accurate to within 1% of realized savings, assuming no changes to workforce composition, salary, or benefit elections between analysis and plan implementation.
          </Text>
          <Text style={s.disclaimerText}>
            Savings estimates assume all listed employees are W-2 employees of the employer group. Independent contractors and 1099 workers are not eligible for Section 125 plans.
          </Text>
          <Text style={s.disclaimerText}>
            Section 125 plan availability, design requirements, and tax treatment may vary by state. Consult state-specific regulations before implementation.
          </Text>
          <Text style={s.disclaimerText}>
            Employee identifiers in this document have been anonymized. No personally identifiable information is included in this output.
          </Text>
          <Text style={s.disclaimerText}>
            This document is for informational purposes only and does not constitute tax, legal, or financial advice. Consult with a qualified tax professional before implementing a Section 125 Cafeteria Plan.
          </Text>
        </View>

        <View style={s.footer} fixed>
          <Text style={s.footerText}>Section 125 Informed Analysis · Generated {date}</Text>
          <Text style={s.footerBrand}>Champion Health, Inc.</Text>
          <Text style={s.footerText} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
        </View>
      </Page>
    </Document>
  );
}

function selectSampleIndices(total: number): number[] {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i);
  const indices = [0, total - 1];
  const step = (total - 1) / 4;
  for (let i = 1; i <= 3; i++) {
    indices.push(Math.round(step * i));
  }
  return [...new Set(indices)].sort((a, b) => a - b).slice(0, 5);
}
