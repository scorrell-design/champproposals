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

export function detectRecognizedFields(columns: string[]): RecognizedField[] {
  const fieldDefs: { key: string; label: string; pattern: RegExp; required: boolean }[] = [
    { key: 'salary', label: 'Gross Pay / Salary / Compensation', pattern: SALARY_PATTERNS, required: true },
    { key: 'employeeName', label: 'Employee Name', pattern: NAME_PATTERNS, required: false },
    { key: 'stateCode', label: 'State', pattern: STATE_PATTERNS, required: false },
    { key: 'netPay', label: 'Net Pay', pattern: NET_PAY_PATTERNS, required: false },
    { key: 'federalTax', label: 'Federal Tax Withholding', pattern: FEDERAL_TAX_PATTERNS, required: false },
    { key: 'fica', label: 'FICA', pattern: FICA_PATTERNS, required: false },
    { key: 'ssn', label: 'SSN', pattern: SSN_PATTERNS, required: false },
    { key: 'dob', label: 'Date of Birth', pattern: DOB_PATTERNS, required: false },
    { key: 'hireDate', label: 'Hire Date', pattern: HIRE_DATE_PATTERNS, required: false },
    { key: 'department', label: 'Department', pattern: DEPARTMENT_PATTERNS, required: false },
    { key: 'jobTitle', label: 'Job Title', pattern: JOB_TITLE_PATTERNS, required: false },
    { key: 'filingStatus', label: 'Marital Status / Filing Status', pattern: FILING_PATTERNS, required: false },
    { key: 'dependents', label: 'Number of Dependents', pattern: DEPENDENTS_PATTERNS, required: false },
    { key: 'payFrequency', label: 'Pay Frequency', pattern: PAY_FREQ_PATTERNS, required: false },
    { key: 'hoursWorked', label: 'Hours Worked', pattern: HOURS_PATTERNS, required: false },
    { key: 'overtimePay', label: 'Overtime Pay', pattern: OVERTIME_PATTERNS, required: false },
    { key: 'bonusCommission', label: 'Bonus / Commission', pattern: BONUS_PATTERNS, required: false },
    { key: 'healthPremium', label: 'Health Insurance Premium', pattern: HEALTH_PREMIUM_PATTERNS, required: false },
    { key: 'retirement', label: '401(k) Contribution', pattern: RETIREMENT_PATTERNS, required: false },
  ];

  return fieldDefs.map((def) => {
    const matched = matchColumn(columns, def.pattern);
    return {
      key: def.key,
      label: def.label,
      status: matched ? 'detected' as const : 'not_detected' as const,
      required: def.required,
      matchedColumn: matched ?? undefined,
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
