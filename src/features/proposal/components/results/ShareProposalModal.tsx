import { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Copy, ExternalLink, Eye, EyeOff, CheckCircle } from 'lucide-react';
import { Toast } from '../shared/Toast';

interface ShareProposalModalProps {
  open: boolean;
  onClose: () => void;
  companyName: string;
  proposalType: 'quick_proposal' | 'informed_analysis';
}

function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function randomChars(n: number): string {
  return Array.from({ length: n }, () => 'abcdefghijklmnopqrstuvwxyz0123456789'[Math.floor(Math.random() * 36)]).join('');
}

export function ShareProposalModal({ open, onClose, companyName, proposalType }: ShareProposalModalProps) {
  const year = new Date().getFullYear();
  const firstWord = companyName.split(/\s+/)[0] || 'Company';

  const [proposalUrl] = useState(
    () => `https://portal.example.com/proposals/${slugify(companyName || 'company')}-${randomChars(6)}`
  );
  const [password] = useState(
    () => `${firstWord}$${year}!${randomChars(4)}`
  );

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [sending, setSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);

  const proposalLabel = proposalType === 'quick_proposal'
    ? `Quick Proposal — ${companyName || 'Company'}`
    : `Informed Analysis — ${companyName || 'Company'}`;

  const emailBody = useMemo(() => {
    return `Subject: Benefits Proposal — ${companyName || 'Company'}

Hi,

I'm sharing your Section 125 Cafeteria Plan benefits proposal for ${companyName || 'Company'}. This analysis shows the projected tax savings for your organization and employees.

You can view your proposal using the secure link below:

Proposal Link: ${proposalUrl}
Access Password: ${password}

Documents included:
• ${proposalLabel}

This proposal is for informational purposes only and represents projected estimates based on the data provided. Please review and let me know if you have any questions.

Best regards,
The Champion Health Team`;
  }, [companyName, proposalUrl, password, proposalLabel]);

  const [editableEmail, setEditableEmail] = useState(emailBody);

  useEffect(() => {
    setEditableEmail(emailBody);
  }, [emailBody]);

  const copyToClipboard = useCallback((text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  }, []);

  const handleSend = useCallback(() => {
    if (!email.trim()) return;
    setSending(true);
    setTimeout(() => {
      setSending(false);
      setSendSuccess(true);
      setToastMsg(`Email sent to ${email.split(',')[0].trim()}`);
      setToastVisible(true);
      setTimeout(() => {
        setSendSuccess(false);
        onClose();
      }, 2000);
    }, 800);
  }, [email, onClose]);

  if (!open) return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[80]"
              style={{ background: 'rgba(0, 0, 0, 0.5)' }}
              onClick={onClose}
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-0 z-[90] flex items-center justify-center p-4"
            >
              <div
                className="relative w-full overflow-y-auto"
                style={{
                  maxWidth: 640,
                  maxHeight: '90vh',
                  background: '#FFFFFF',
                  border: '1px solid rgba(15, 11, 46, 0.08)',
                  borderRadius: 22,
                  padding: 32,
                  boxShadow: '0 16px 48px rgba(15, 11, 46, 0.15)',
                }}
                onClick={(e) => e.stopPropagation()}
              >
                {/* Close */}
                <button
                  onClick={onClose}
                  className="absolute top-4 right-4 flex h-8 w-8 items-center justify-center rounded-full text-text-tertiary hover:text-text-primary hover:bg-surface-glass-light transition-colors"
                >
                  <X size={18} />
                </button>

                <h2 className="text-[20px] font-semibold text-text-primary" style={{ marginBottom: 24 }}>
                  Share Proposal
                </h2>

                {/* Section 1: Proposal Access Link */}
                <div className="glass-secondary" style={{ marginBottom: 20 }}>
                  <p className="text-text-tertiary" style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                    Proposal Link
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      readOnly
                      value={proposalUrl}
                      className="glass-input flex-1 px-3 py-2 text-[13px] font-mono text-text-secondary"
                    />
                    <CopyBtn onClick={() => copyToClipboard(proposalUrl, 'url')} copied={copiedField === 'url'} />
                    <button
                      onClick={() => window.open(proposalUrl, '_blank')}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-glass-light transition-colors"
                    >
                      <ExternalLink size={16} />
                    </button>
                  </div>

                  <p className="text-text-tertiary mt-4" style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                    Access Password
                  </p>
                  <div className="flex items-center gap-2">
                    <div className="glass-input relative flex-1 flex items-center px-3 py-2">
                      <span className="flex-1 text-[13px] font-mono text-text-secondary">
                        {showPassword ? password : '••••••••••••'}
                      </span>
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="text-text-tertiary hover:text-text-primary transition-colors"
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <CopyBtn onClick={() => copyToClipboard(password, 'pw')} copied={copiedField === 'pw'} />
                  </div>
                  <button
                    onClick={() => {}}
                    className="mt-2 text-[12px] text-text-tertiary hover:text-text-secondary transition-colors"
                  >
                    Regenerate Password
                  </button>
                </div>

                {/* Divider */}
                <div className="glass-divider" style={{ margin: '20px 0' }} />

                {/* Section 2: Email Draft */}
                <div style={{ marginBottom: 24 }}>
                  <p className="text-text-tertiary" style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                    Send To
                  </p>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter recipient email address"
                    className="glass-input w-full px-3.5 py-2.5 text-[14px]"
                  />

                  <p className="text-text-tertiary mt-4" style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                    Include in Email
                  </p>
                  <label className="flex items-center gap-2 text-[14px] text-text-secondary cursor-pointer">
                    <input type="checkbox" defaultChecked className="accent-accent h-4 w-4 rounded" />
                    {proposalLabel}
                  </label>

                  <p className="text-text-tertiary mt-4" style={{ fontSize: 12, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                    Email Preview
                  </p>
                  <textarea
                    value={editableEmail}
                    onChange={(e) => setEditableEmail(e.target.value)}
                    className="glass-input w-full px-3.5 py-3 text-[14px] text-text-primary leading-[1.6]"
                    rows={14}
                    style={{ resize: 'vertical', minHeight: 200 }}
                  />
                </div>

                {/* Section 3: Actions */}
                <div className="flex items-center justify-end gap-3">
                  <button
                    onClick={onClose}
                    className="text-[14px] font-medium text-text-tertiary hover:text-text-secondary transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => copyToClipboard(editableEmail, 'email')}
                    className="btn-glass inline-flex items-center gap-2 relative"
                  >
                    <Copy size={16} />
                    {copiedField === 'email' ? 'Copied!' : 'Copy Email'}
                  </button>
                  <button
                    onClick={handleSend}
                    disabled={!email.trim() || sending}
                    className="inline-flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                    style={{
                      background: '#3B82F6',
                      color: '#FFFFFF',
                      borderRadius: 24,
                      padding: '10px 24px',
                      fontSize: 14,
                      fontWeight: 600,
                      border: 'none',
                    }}
                  >
                    {sendSuccess ? (
                      <>
                        <CheckCircle size={16} />
                        Sent!
                      </>
                    ) : (
                      'Send Email'
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <Toast
        message={toastMsg}
        visible={toastVisible}
        onDismiss={() => setToastVisible(false)}
      />
    </>
  );
}

function CopyBtn({ onClick, copied }: { onClick: () => void; copied: boolean }) {
  return (
    <button
      onClick={onClick}
      className="relative flex h-9 w-9 items-center justify-center rounded-lg text-text-tertiary hover:text-text-primary hover:bg-surface-glass-light transition-colors"
    >
      {copied ? <CheckCircle size={16} style={{ color: '#059669' }} /> : <Copy size={16} />}
      {copied && (
        <span
          className="absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md px-2 py-1 text-[11px] font-medium"
          style={{ background: 'rgba(5, 150, 105, 0.15)', color: '#059669' }}
        >
          Copied!
        </span>
      )}
    </button>
  );
}
