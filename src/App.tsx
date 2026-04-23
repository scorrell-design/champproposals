import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import { QuickProposalPage } from './features/quick-proposal/QuickProposalPage';
import { InformedAnalysisPage } from './features/informed-analysis/InformedAnalysisPage';
import champLogo from './assets/champ-logo.png';

function NavHeader() {
  return (
    <header className="relative z-20 bg-white" style={{ borderBottom: '1px solid rgba(15, 11, 46, 0.08)' }}>
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link to="/" className="flex items-center gap-2.5">
          <img src={champLogo} alt="Champion Health" className="h-9" />
        </Link>
        <nav className="flex gap-1">
          {[
            { to: '/quick-proposal', label: 'Quick Proposal' },
            { to: '/informed-analysis', label: 'Informed Analysis' },
          ].map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="rounded-full px-3 py-1.5 text-[14px] font-medium text-text-tertiary hover:text-text-primary hover:bg-surface-glass-light transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen" style={{ background: '#F7F8FC' }}>
        <Routes>
          <Route path="/" element={<Navigate to="/quick-proposal" replace />} />
          <Route path="/quick-proposal" element={<><NavHeader /><QuickProposalPage /></>} />
          <Route path="/informed-analysis" element={<><NavHeader /><InformedAnalysisPage /></>} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}
