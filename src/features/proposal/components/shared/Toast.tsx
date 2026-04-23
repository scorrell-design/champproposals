import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle } from 'lucide-react';

interface ToastProps {
  message: string;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
}

export function Toast({ message, visible, onDismiss, duration = 4000 }: ToastProps) {
  const [show, setShow] = useState(visible);

  useEffect(() => {
    if (visible) {
      setShow(true);
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onDismiss, 300);
      }, duration);
      return () => clearTimeout(timer);
    } else {
      setShow(false);
    }
  }, [visible, duration, onDismiss]);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.3 }}
          className="fixed bottom-8 left-1/2 z-[100] -translate-x-1/2"
        >
          <div
            className="flex items-center gap-3 px-5 py-3.5"
            style={{
              background: '#FFFFFF',
              border: '1px solid rgba(5, 150, 105, 0.3)',
              borderRadius: 14,
              boxShadow: '0 8px 32px rgba(15, 11, 46, 0.12)',
            }}
          >
            <CheckCircle size={18} style={{ color: '#059669', flexShrink: 0 }} />
            <span className="text-[14px] text-text-primary whitespace-nowrap">{message}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
