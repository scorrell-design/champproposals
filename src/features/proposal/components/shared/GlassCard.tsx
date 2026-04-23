import type { ReactNode } from 'react';

interface GlassCardProps {
  variant?: 'primary' | 'secondary';
  children: ReactNode;
  className?: string;
  hover?: boolean;
  selected?: boolean;
  onClick?: () => void;
}

export function GlassCard({
  variant = 'primary',
  children,
  className = '',
  hover = false,
  selected = false,
  onClick,
}: GlassCardProps) {
  const base = variant === 'primary' ? 'glass-primary' : 'glass-secondary';
  const interactive = hover ? 'glass-hover cursor-pointer' : '';
  const active = selected ? 'glass-selected' : '';
  const Tag = onClick ? 'button' : 'div';

  return (
    <Tag
      onClick={onClick}
      className={`${base} ${interactive} ${active} ${className}`}
    >
      {children}
    </Tag>
  );
}
