export function GlassBackground({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen noise-overlay" style={{ background: '#F7F8FC' }}>
      {/* Subtle ambient blobs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden="true">
        <div
          className="absolute"
          style={{
            top: '-10%',
            left: '-5%',
            width: '60%',
            height: '55%',
            background: 'radial-gradient(ellipse at center, rgba(46, 139, 232, 0.06) 0%, transparent 70%)',
            filter: 'blur(160px)',
          }}
        />
        <div
          className="absolute"
          style={{
            bottom: '-15%',
            right: '-10%',
            width: '55%',
            height: '60%',
            background: 'radial-gradient(ellipse at center, rgba(255, 107, 53, 0.04) 0%, transparent 70%)',
            filter: 'blur(180px)',
          }}
        />
        <div
          className="absolute"
          style={{
            top: '30%',
            right: '5%',
            width: '35%',
            height: '40%',
            background: 'radial-gradient(ellipse at center, rgba(30, 90, 158, 0.04) 0%, transparent 70%)',
            filter: 'blur(140px)',
          }}
        />
      </div>

      {/* Content layer */}
      <div className="relative" style={{ zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
}
