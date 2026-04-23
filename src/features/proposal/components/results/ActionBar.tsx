import { useState } from 'react';
import { Download, Save, Send, Loader2 } from 'lucide-react';
import { ShareProposalModal } from './ShareProposalModal';

interface ActionBarProps {
  onDownloadPDF: () => void;
  onSaveDraft: () => void;
  onNewProposal: () => void;
  isGeneratingPDF: boolean;
  isSaving: boolean;
  companyName?: string;
  proposalType?: 'quick_proposal' | 'informed_analysis';
  newProposalLabel?: string;
}

export function ActionBar({
  onDownloadPDF,
  onSaveDraft,
  onNewProposal,
  isGeneratingPDF,
  isSaving,
  companyName = '',
  proposalType = 'quick_proposal',
  newProposalLabel = 'Start New Proposal',
}: ActionBarProps) {
  const [showShare, setShowShare] = useState(false);

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={onDownloadPDF}
          disabled={isGeneratingPDF}
          className="btn-accent inline-flex items-center gap-2 disabled:opacity-50"
        >
          {isGeneratingPDF ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
          Download PDF Proposal
        </button>

        <button
          onClick={() => setShowShare(true)}
          className="inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[14px] font-medium transition-all"
          style={{
            background: '#EFF6FF',
            border: '1px solid rgba(59, 130, 246, 0.3)',
            color: '#2E8BE8',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 0 16px rgba(59, 130, 246, 0.1)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
        >
          <Send size={18} />
          Send to Client
        </button>

        <button
          onClick={onSaveDraft}
          disabled={isSaving}
          className="btn-glass inline-flex items-center gap-2 disabled:opacity-50"
        >
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Proposal
        </button>

        <button
          onClick={onNewProposal}
          className="text-[14px] font-medium text-text-tertiary hover:text-text-secondary hover:underline transition-colors"
        >
          {newProposalLabel}
        </button>
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
