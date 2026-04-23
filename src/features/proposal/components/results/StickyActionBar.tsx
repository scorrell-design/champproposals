import { useState } from 'react';
import { Download, Send, Save, Loader2 } from 'lucide-react';
import { ShareProposalModal } from './ShareProposalModal';

interface StickyActionBarProps {
  companyName: string;
  proposalType: 'quick_proposal' | 'informed_analysis';
  onDownloadPDF: () => void;
  onSaveDraft: () => void;
  onNewProposal: () => void;
  isGeneratingPDF: boolean;
  isSaving: boolean;
  newProposalLabel?: string;
}

export function StickyActionBar({
  companyName,
  proposalType,
  onDownloadPDF,
  onSaveDraft,
  onNewProposal,
  isGeneratingPDF,
  isSaving,
  newProposalLabel = 'New Analysis',
}: StickyActionBarProps) {
  const [showShare, setShowShare] = useState(false);

  return (
    <>
      <div
        className="fixed bottom-0 left-0 right-0 z-50"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderTop: '1px solid rgba(15, 11, 46, 0.08)',
        }}
      >
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
          <p className="hidden text-[14px] text-text-secondary sm:block">
            Proposal for {companyName || 'Your Company'}
          </p>
          <div className="flex items-center gap-3">
            <button
              onClick={onDownloadPDF}
              disabled={isGeneratingPDF}
              className="btn-accent inline-flex items-center gap-2 !py-2 !px-4 text-[13px] disabled:opacity-50"
            >
              {isGeneratingPDF ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
              Download PDF
            </button>
            <button
              onClick={() => setShowShare(true)}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-[13px] font-medium transition-all"
              style={{
                background: '#EFF6FF',
                border: '1px solid rgba(59, 130, 246, 0.3)',
                color: '#2E8BE8',
              }}
            >
              <Send size={16} />
              Send to Client
            </button>
            <button
              onClick={onSaveDraft}
              disabled={isSaving}
              className="btn-glass inline-flex items-center gap-2 !py-2 !px-4 text-[13px] disabled:opacity-50"
            >
              {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save Proposal
            </button>
            <button
              onClick={onNewProposal}
              className="text-[13px] font-medium text-text-tertiary hover:text-text-secondary transition-colors"
            >
              {newProposalLabel}
            </button>
          </div>
        </div>
      </div>

      <ShareProposalModal
        open={showShare}
        onClose={() => setShowShare(false)}
        companyName={companyName}
        proposalType={proposalType}
      />
    </>
  );
}
