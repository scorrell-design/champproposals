import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown } from 'lucide-react';

const FAQ_ITEMS = [
  {
    q: 'What is a Section 125 Cafeteria Plan?',
    a: 'An IRS provision that allows employees to pay for certain benefits with pre-tax dollars, reducing both employee and employer tax liabilities.',
  },
  {
    q: 'How do employees benefit?',
    a: 'Eligible employees see an increase in take-home pay because their taxable income is reduced, lowering their federal income, Social Security, and Medicare taxes.',
  },
  {
    q: 'How does the employer benefit?',
    a: 'Employers save 7.65% in FICA taxes on every dollar employees contribute pre-tax. For a company with 100 employees at average premiums, this can mean tens of thousands of dollars per year.',
  },
  {
    q: 'Who qualifies to participate?',
    a: 'Qualification is based on income level. Employees whose projected tax savings from pre-tax deductions are meaningful are considered qualified and positively impacted.',
  },
  {
    q: 'How long does implementation take?',
    a: 'The full process typically takes 2–3 weeks from initial setup to full payroll integration, with minimal disruption to operations.',
  },
];

export function FAQAccordion() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <div className="glass-primary">
      <h3 className="text-[18px] font-semibold text-text-primary" style={{ marginBottom: 20 }}>
        Frequently Asked Questions
      </h3>
      <div className="flex flex-col" style={{ gap: 2 }}>
        {FAQ_ITEMS.map((item, i) => (
          <div key={i}>
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between py-3.5 text-left transition-colors hover:bg-surface-glass-light rounded-lg px-2 -mx-2"
            >
              <span className="text-[15px] font-semibold text-text-primary pr-4">{item.q}</span>
              <motion.span
                animate={{ rotate: openIndex === i ? 180 : 0 }}
                transition={{ duration: 0.2 }}
                className="flex-shrink-0"
              >
                <ChevronDown size={18} className="text-text-tertiary" />
              </motion.span>
            </button>
            <AnimatePresence>
              {openIndex === i && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden"
                >
                  <p className="px-2 pb-3 text-[14px] text-text-secondary" style={{ lineHeight: 1.7 }}>
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
            {i < FAQ_ITEMS.length - 1 && (
              <div className="h-px" style={{ background: 'rgba(15, 11, 46, 0.08)' }} />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
