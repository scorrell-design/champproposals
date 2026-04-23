export const FICA_RATES = {
  socialSecurity: 0.062,
  medicare: 0.0145,
  combined: 0.0765,
  socialSecurityWageCap: 168600,
} as const;

export const ADMIN_FEE_PER_EMPLOYEE_PER_MONTH = 35;
export const ADMIN_FEE_ANNUAL = ADMIN_FEE_PER_EMPLOYEE_PER_MONTH * 12;
