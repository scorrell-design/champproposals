interface PreparedBySectionProps {
  brokerName?: string;
  brokerEmail?: string;
}

export function PreparedBySection({ brokerName, brokerEmail }: PreparedBySectionProps) {
  if (!brokerName?.trim()) return null;

  return (
    <div
      className="glass-secondary"
      style={{ borderLeft: '3px solid rgba(59, 130, 246, 0.5)' }}
    >
      <p
        className="text-text-tertiary"
        style={{ fontSize: 11, fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}
      >
        Prepared By
      </p>
      <p className="text-[16px] font-semibold text-text-primary">{brokerName.trim()}</p>
      {brokerEmail?.trim() && (
        <a
          href={`mailto:${brokerEmail.trim()}`}
          className="mt-1 inline-block text-[14px] text-accent hover:underline"
        >
          {brokerEmail.trim()}
        </a>
      )}
      <p className="mt-3 text-[13px] italic text-text-tertiary">
        Have questions about this proposal? Contact your benefits advisor directly.
      </p>
    </div>
  );
}
