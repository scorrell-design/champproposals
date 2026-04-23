import { motion, AnimatePresence } from 'framer-motion';
import { AlertCircle } from 'lucide-react';

interface DisclaimerModalProps {
  open: boolean;
  onAccept: () => void;
  onGoBack: () => void;
}

export function DisclaimerModal({ open, onAccept, onGoBack }: DisclaimerModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[80]"
            style={{ background: 'rgba(0, 0, 0, 0.5)' }}
          />

          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.97 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-[90] flex items-center justify-center p-4"
          >
            <div
              className="w-full text-center"
              style={{
                maxWidth: 520,
                background: '#FFFFFF',
                border: '1px solid rgba(15, 11, 46, 0.08)',
                borderRadius: 22,
                padding: 32,
                boxShadow: '0 16px 48px rgba(15, 11, 46, 0.15)',
              }}
            >
              <AlertCircle size={28} style={{ color: '#D97706', margin: '0 auto' }} />

              <h2
                className="text-[20px] font-semibold text-text-primary"
                style={{ marginTop: 16 }}
              >
                Before You View This Proposal
              </h2>

              <div
                className="text-[14px] text-text-secondary text-left"
                style={{ marginTop: 16, lineHeight: 1.7 }}
              >
                <p>
                  The following proposal contains{' '}
                  <span className="font-semibold text-text-primary">projected estimates</span>{' '}
                  based on the data you provided and current federal and state tax rates.
                  These figures are not guaranteed and may vary based on actual employee
                  participation, workforce changes, benefit elections, and future tax law
                  modifications.
                </p>
                <p style={{ marginTop: 12 }}>
                  This proposal is intended for{' '}
                  <span className="font-semibold text-text-primary">
                    informational and planning purposes only
                  </span>{' '}
                  and does not constitute tax, legal, or financial advice. We recommend
                  consulting with a qualified tax professional before making plan decisions.
                </p>
              </div>

              <div
                className="mx-auto flex flex-col items-center"
                style={{ marginTop: 24, gap: 12, maxWidth: 360 }}
              >
                <button
                  onClick={onAccept}
                  className="w-full transition-all"
                  style={{
                    background: '#3B82F6',
                    color: '#FFFFFF',
                    borderRadius: 24,
                    padding: '14px 24px',
                    fontSize: 16,
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.boxShadow = '0 4px 16px rgba(59, 130, 246, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  I Understand — View Proposal
                </button>
                <button
                  onClick={onGoBack}
                  className="text-[14px] text-text-tertiary hover:text-text-secondary hover:underline transition-colors"
                >
                  Go Back
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
