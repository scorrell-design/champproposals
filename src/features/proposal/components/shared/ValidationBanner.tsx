import { AlertCircle, CheckCircle, AlertTriangle } from 'lucide-react';

type BannerType = 'error' | 'warning' | 'success';

interface ValidationBannerProps {
  type: BannerType;
  message: string;
}

const config: Record<BannerType, { border: string; glow: string; text: string; Icon: typeof AlertCircle }> = {
  error: {
    border: 'border-[rgba(220,38,38,0.3)]',
    glow: 'shadow-[0_0_16px_rgba(220,38,38,0.06)]',
    text: 'text-error',
    Icon: AlertCircle,
  },
  warning: {
    border: 'border-[rgba(217,119,6,0.3)]',
    glow: 'shadow-[0_0_16px_rgba(217,119,6,0.06)]',
    text: 'text-warning',
    Icon: AlertTriangle,
  },
  success: {
    border: 'border-[rgba(5,150,105,0.3)]',
    glow: 'shadow-[0_0_16px_rgba(5,150,105,0.06)]',
    text: 'text-success',
    Icon: CheckCircle,
  },
};

export function ValidationBanner({ type, message }: ValidationBannerProps) {
  const { border, glow, text, Icon } = config[type];

  return (
    <div className={`glass-secondary flex items-center gap-2 border ${border} ${glow} !px-4 !py-2.5`}>
      <Icon className={`h-4 w-4 flex-shrink-0 ${text}`} />
      <span className={`text-sm font-medium ${text}`}>{message}</span>
    </div>
  );
}
