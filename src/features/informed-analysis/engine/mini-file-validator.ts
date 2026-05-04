export interface ColumnMapping {
  salary: string | null;
  filingStatus: string | null;
  stateCode: string | null;
  employeeName: string | null;
  employeeId: string | null;
  employmentStatus: string | null;
  hireDate: string | null;
  dob: string | null;
}

export interface RecognizedField {
  key: string;
  label: string;
  status: 'detected' | 'not_detected';
  required: boolean;
  matchedColumn?: string;
  group: 'employee_pay' | 'tax_filing' | 'benefits' | 'state_specific';
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  rowCount: number;
  columns: string[];
  suggestedMapping: ColumnMapping;
  recognizedFields: RecognizedField[];
}

const SALARY_PATTERNS = /salary|wage|pay(?!.*freq)|compensation|annual|gross|income|earnings|rate.?of.?pay|base.?pay/i;
const FILING_PATTERNS = /filing|tax.?status|marital|mar.?stat/i;
const STATE_PATTERNS = /state|work.?state|location|work.?loc/i;
const NAME_PATTERNS = /name|employee.?name|full.?name|first.?name|last.?name/i;
const ID_PATTERNS = /emp.*id|employee.?id|ee.?id|emp.?#|employee.?#|emp.?no/i;
const STATUS_PATTERNS = /employment|emp.?status|ft.?pt|full.?time|part.?time|work.?status/i;
const HIRE_DATE_PATTERNS = /hire|start.?date|date.?of.?hire|doh|orig.*hire/i;
const DOB_PATTERNS = /birth|dob|date.?of.?birth|birthday/i;

const NET_PAY_PATTERNS = /net.?pay|take.?home/i;
const FEDERAL_TAX_PATTERNS = /federal.?tax|fed.?withhold|fit|fed.?inc/i;
const FICA_PATTERNS = /fica|social.?security|ss.?tax|medicare/i;
const SSN_PATTERNS = /ssn|social.?security.?number|ss.?#/i;
const DEPARTMENT_PATTERNS = /dept|department/i;
const JOB_TITLE_PATTERNS = /title|job.?title|position/i;
const DEPENDENTS_PATTERNS = /depend|number.?of.?depend|exemptions/i;
const PAY_FREQ_PATTERNS = /pay.?freq|pay.?period|pay.?cycle|frequency/i;
const HOURS_PATTERNS = /hours|hours.?worked|regular.?hours/i;
const OVERTIME_PATTERNS = /overtime|ot.?pay|ot.?hours/i;
const BONUS_PATTERNS = /bonus|commission/i;
const HEALTH_PREMIUM_PATTERNS = /health.?ins|medical.?prem|health.?premium|insurance.?ded/i;
const RETIREMENT_PATTERNS = /401k|401\(k\)|retirement|pension|403b/i;

const WORKED_IN_STATE_PATTERNS = /worked.?in.?state|work.?state|wis/i;
const FED_2020_W4_PATTERNS = /fed.?2020|new.?w4|w4.?version|fed.?w4.?type/i;
const FED_FILING_STATUS_PATTERNS = /fed.?filing|federal.?filing|fed.?status/i;
const FED_ALLOWANCES_PATTERNS = /fed.?allow|federal.?allow|fed.?exempt/i;
const FED_EXTRA_PATTERNS = /fed.?extra|fed.?add|additional.?fed/i;
const FED_OTHER_INCOME_PATTERNS = /other.?income|fed.?other/i;
const FED_DEDUCTIONS_PATTERNS = /fed.?deduct|itemized|fed.?adj/i;
const FED_DEPENDENT_AMOUNT_PATTERNS = /depend.?amount|dep.?credit|child.?credit/i;
const FED_TWO_JOBS_PATTERNS = /two.?jobs|multiple.?jobs|2.?jobs/i;
const FED_EXEMPT_PATTERNS = /fed.?exempt|exempt.?fed|w4.?exempt/i;
const STATE_FILING_PATTERNS = /state.?filing|state.?status|state.?mar/i;
const STATE_ALLOWANCES_PATTERNS = /state.?allow|state.?exempt/i;
const STATE_EXTRA_PATTERNS = /state.?extra|state.?add|additional.?state/i;
const STATE_EXEMPT_PATTERNS = /state.?exempt|exempt.?state/i;
const LOCAL_TAX_PATTERNS = /local.?tax|city.?tax|county.?tax|municipality/i;
const HEALTH_MED_PATTERNS = /employee.?cont.*med|emp.?med|medical.?ded|major.?med/i;
const HEALTH_DEN_PATTERNS = /employee.?cont.*den|emp.?den|dental.?ded/i;
const HEALTH_VIS_PATTERNS = /employee.?cont.*vis|emp.?vis|vision.?ded/i;
const HSA_PATTERNS = /hsa|health.?sav|flexible.?spend|fsa/i;
const GROSS_WAGES_PPP_PATTERNS = /gross.?wages?.?ppp|gross.?per.?pay|per.?period.?gross/i;
const AZ_WITHHOLD_PATTERNS = /az.?withhold|arizona.?percent|az.?percent/i;
const MS_EXEMPT_PATTERNS = /ms.?exempt|mississippi.?exempt/i;
const MO_EXEMPT_PATTERNS = /mo.?exempt|missouri.?exempt/i;

function matchColumn(columns: string[], pattern: RegExp): string | null {
  const trimmed = columns.map((c) => c.trim());
  const idx = trimmed.findIndex((col) => pattern.test(col));
  return idx >= 0 ? columns[idx] : null;
}

export function detectColumnMapping(columns: string[]): ColumnMapping {
  return {
    salary: matchColumn(columns, SALARY_PATTERNS),
    filingStatus: matchColumn(columns, FILING_PATTERNS),
    stateCode: matchColumn(columns, STATE_PATTERNS),
    employeeName: matchColumn(columns, NAME_PATTERNS),
    employeeId: matchColumn(columns, ID_PATTERNS),
    employmentStatus: matchColumn(columns, STATUS_PATTERNS),
    hireDate: matchColumn(columns, HIRE_DATE_PATTERNS),
    dob: matchColumn(columns, DOB_PATTERNS),
  };
}

type FieldGroup = RecognizedField['group'];

export function detectRecognizedFields(columns: string[]): RecognizedField[] {
  const fieldDefs: { key: string; label: string; pattern: RegExp; required: boolean; group: FieldGroup }[] = [
    // Employee & Pay
    { key: 'employeeId', label: 'Employee ID', pattern: ID_PATTERNS, required: false, group: 'employee_pay' },
    { key: 'employeeName', label: 'Employee Name', pattern: NAME_PATTERNS, required: false, group: 'employee_pay' },
    { key: 'grossWagesPPP', label: 'Gross Wages Per Pay Period', pattern: GROSS_WAGES_PPP_PATTERNS, required: false, group: 'employee_pay' },
    { key: 'salary', label: 'Salary / Compensation', pattern: SALARY_PATTERNS, required: true, group: 'employee_pay' },
    { key: 'payFrequency', label: 'Pay Frequency', pattern: PAY_FREQ_PATTERNS, required: false, group: 'employee_pay' },
    { key: 'hoursWorked', label: 'Hours Worked', pattern: HOURS_PATTERNS, required: false, group: 'employee_pay' },
    { key: 'overtimePay', label: 'Overtime Pay', pattern: OVERTIME_PATTERNS, required: false, group: 'employee_pay' },
    { key: 'bonusCommission', label: 'Bonus / Commission', pattern: BONUS_PATTERNS, required: false, group: 'employee_pay' },
    { key: 'employmentStatus', label: 'Employment Status', pattern: STATUS_PATTERNS, required: false, group: 'employee_pay' },
    { key: 'hireDate', label: 'Hire Date', pattern: HIRE_DATE_PATTERNS, required: false, group: 'employee_pay' },
    { key: 'dob', label: 'Date of Birth', pattern: DOB_PATTERNS, required: false, group: 'employee_pay' },
    { key: 'department', label: 'Department', pattern: DEPARTMENT_PATTERNS, required: false, group: 'employee_pay' },
    { key: 'jobTitle', label: 'Job Title', pattern: JOB_TITLE_PATTERNS, required: false, group: 'employee_pay' },

    // Tax Filing
    { key: 'fedFilingStatus', label: 'Federal Filing Status', pattern: FED_FILING_STATUS_PATTERNS, required: false, group: 'tax_filing' },
    { key: 'filingStatus', label: 'Filing / Marital Status', pattern: FILING_PATTERNS, required: false, group: 'tax_filing' },
    { key: 'fed2020W4', label: 'Fed 2020+ W-4', pattern: FED_2020_W4_PATTERNS, required: false, group: 'tax_filing' },
    { key: 'fedAllowances', label: 'Federal Allowances', pattern: FED_ALLOWANCES_PATTERNS, required: false, group: 'tax_filing' },
    { key: 'fedExtraWithholding', label: 'Federal Extra Withholding', pattern: FED_EXTRA_PATTERNS, required: false, group: 'tax_filing' },
    { key: 'fedOtherIncome', label: 'Federal Other Income', pattern: FED_OTHER_INCOME_PATTERNS, required: false, group: 'tax_filing' },
    { key: 'fedDeductions', label: 'Federal Deductions', pattern: FED_DEDUCTIONS_PATTERNS, required: false, group: 'tax_filing' },
    { key: 'fedDependentAmount', label: 'Federal Dependent Amount', pattern: FED_DEPENDENT_AMOUNT_PATTERNS, required: false, group: 'tax_filing' },
    { key: 'fedTwoJobs', label: 'Federal Two Jobs', pattern: FED_TWO_JOBS_PATTERNS, required: false, group: 'tax_filing' },
    { key: 'fedExempt', label: 'Federal Exempt', pattern: FED_EXEMPT_PATTERNS, required: false, group: 'tax_filing' },
    { key: 'stateFilingStatus', label: 'State Filing Status', pattern: STATE_FILING_PATTERNS, required: false, group: 'tax_filing' },
    { key: 'stateAllowances', label: 'State Allowances', pattern: STATE_ALLOWANCES_PATTERNS, required: false, group: 'tax_filing' },
    { key: 'stateExtraWithholding', label: 'State Extra Withholding', pattern: STATE_EXTRA_PATTERNS, required: false, group: 'tax_filing' },
    { key: 'stateExempt', label: 'State Exempt', pattern: STATE_EXEMPT_PATTERNS, required: false, group: 'tax_filing' },
    { key: 'workedInState', label: 'Worked-In State', pattern: WORKED_IN_STATE_PATTERNS, required: false, group: 'tax_filing' },
    { key: 'localTax', label: 'Local Tax', pattern: LOCAL_TAX_PATTERNS, required: false, group: 'tax_filing' },
    { key: 'dependents', label: 'Dependents', pattern: DEPENDENTS_PATTERNS, required: false, group: 'tax_filing' },

    // Benefits
    { key: 'employeeContMajorMed', label: 'Employee Contribution — Major Medical', pattern: HEALTH_MED_PATTERNS, required: false, group: 'benefits' },
    { key: 'employeeContDen', label: 'Employee Contribution — Dental', pattern: HEALTH_DEN_PATTERNS, required: false, group: 'benefits' },
    { key: 'employeeContVis', label: 'Employee Contribution — Vision', pattern: HEALTH_VIS_PATTERNS, required: false, group: 'benefits' },
    { key: 'hsa', label: 'HSA / FSA', pattern: HSA_PATTERNS, required: false, group: 'benefits' },
    { key: 'retirement', label: '401(k) / Retirement', pattern: RETIREMENT_PATTERNS, required: false, group: 'benefits' },

    // State-Specific
    { key: 'azWithholdPercent', label: 'AZ Withholding Percent', pattern: AZ_WITHHOLD_PATTERNS, required: false, group: 'state_specific' },
    { key: 'msExemptions', label: 'MS Exemptions', pattern: MS_EXEMPT_PATTERNS, required: false, group: 'state_specific' },
    { key: 'moExemptions', label: 'MO Exemptions', pattern: MO_EXEMPT_PATTERNS, required: false, group: 'state_specific' },
  ];

  return fieldDefs.map((def) => {
    const matched = matchColumn(columns, def.pattern);
    return {
      key: def.key,
      label: def.label,
      status: matched ? 'detected' as const : 'not_detected' as const,
      required: def.required,
      matchedColumn: matched ?? undefined,
      group: def.group,
    };
  });
}

export function validateFile(
  columns: string[],
  data: Record<string, string>[],
  mapping: ColumnMapping,
): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!mapping.salary) errors.push('No salary column detected. Please map a salary column.');
  if (!mapping.stateCode) warnings.push('No state column found. A default state will be used.');
  if (!mapping.filingStatus) warnings.push('No filing status column found. National averages will be applied.');

  const workedInState = matchColumn(columns, WORKED_IN_STATE_PATTERNS);
  if (!workedInState && mapping.stateCode) {
    warnings.push('WorkedInState column not found. Using State column as fallback.');
  }

  if (data.length === 0) errors.push('File contains no data rows.');
  if (data.length > 10000) warnings.push('Large file detected. Processing may take a moment.');

  if (mapping.salary) {
    let validCount = 0;
    let invalidCount = 0;
    data.forEach((row) => {
      const raw = row[mapping.salary!];
      const cleaned = String(raw ?? '').replace(/[,$\s]/g, '').replace(/^\((.+)\)$/, '-$1');
      const val = parseFloat(cleaned);
      if (isNaN(val) || val <= 0) {
        invalidCount++;
      } else {
        validCount++;
      }
    });
    if (invalidCount > 0) {
      warnings.push(`${invalidCount} row(s) have invalid or missing salary values and will be excluded.`);
    }
    if (validCount === 0 && data.length > 0) {
      errors.push(`No valid salary values found in the "${mapping.salary}" column. Please verify the correct column is mapped.`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    rowCount: data.length,
    columns,
    suggestedMapping: mapping,
    recognizedFields: detectRecognizedFields(columns),
  };
}
