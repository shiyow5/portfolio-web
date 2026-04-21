import type { ReactNode } from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

interface RetroWindowProps {
  title: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

export function RetroWindow({ title, children, onClose, className = '' }: RetroWindowProps) {
  return (
    <motion.div
      initial={{ scale: 0.94, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.94, opacity: 0 }}
      transition={{ duration: 0.18 }}
      className={`pixel-border bg-surface-container-lowest flex flex-col min-w-[300px] max-h-[85vh] ${className}`}
    >
      <div className="flex items-center justify-between border-b-4 border-tertiary bg-tertiary-container px-4 py-2">
        <span className="font-black text-sm uppercase tracking-widest text-on-tertiary-container">
          {title}
        </span>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close window"
            className="text-tertiary hover:text-error p-1 transition-colors"
          >
            <X size={18} />
          </button>
        )}
      </div>
      <div className="flex-1 overflow-auto p-6">{children}</div>
    </motion.div>
  );
}
