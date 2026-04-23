import { TAX_RATE_YEAR } from '@/config/tax-rates';

export function DisclaimerCard() {
  return (
    <div
      className="glass-secondary"
      style={{ borderColor: 'rgba(15, 11, 46, 0.08)' }}
    >
      <h4 className="text-[14px] font-semibold text-text-primary" style={{ marginBottom: 12 }}>
        Important Disclosures
      </h4>
      <div className="flex flex-col gap-3 text-[12px] leading-[1.6] text-text-secondary">
        <p>
          This proposal provides estimated projections based on the data provided and current federal and state tax rates as of {TAX_RATE_YEAR}. Actual results will depend on employee participation rates, workforce changes, benefit elections, and tax law modifications.
        </p>
        <p>
          Savings estimates assume all eligible employees are W-2 employees of the employer group. Independent contractors and 1099 workers are not eligible for Section 125 plans.
        </p>
        <p>
          This document is for informational purposes only and does not constitute tax, legal, or financial advice. Consult with a qualified tax professional before implementing a Section 125 Cafeteria Plan.
        </p>
        <p>
          Projected Savings represents the most likely outcome based on provided data. Actual savings may fall within the Conservative Estimate to Optimal Savings range shown above.
        </p>
      </div>
    </div>
  );
}
