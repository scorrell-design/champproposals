import { motion } from 'framer-motion';

interface SectionCardProps {
  id: string;
  title: string;
  subtitle?: string;
  status?: 'active' | 'complete' | 'incomplete';
  zIndex?: number;
  children: React.ReactNode;
}

export function SectionCard({
  id,
  title,
  subtitle,
  status = 'incomplete',
  zIndex,
  children,
}: SectionCardProps) {
  const dotColor = status === 'active'
    ? 'bg-accent'
    : status === 'complete'
      ? 'bg-success'
      : 'bg-champ-border';

  return (
    <motion.section
      id={id}
      initial={{ opacity: 0, y: 8 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="glass-primary"
      style={zIndex ? { position: 'relative', zIndex } : undefined}
    >
      <div className="flex items-start gap-3" style={{ marginBottom: subtitle ? 0 : 20 }}>
        <div className={`mt-2 h-1.5 w-1.5 rounded-full flex-shrink-0 ${dotColor}`} />
        <div>
          <h2 className="text-[20px] font-semibold text-text-primary">{title}</h2>
          {subtitle && <p className="text-[14px] text-text-secondary" style={{ marginTop: 6, marginBottom: 20 }}>{subtitle}</p>}
        </div>
      </div>
      {children}
    </motion.section>
  );
}
