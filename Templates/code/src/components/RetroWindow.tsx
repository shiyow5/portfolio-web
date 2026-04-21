import React from 'react';
import { motion } from 'motion/react';
import { X } from 'lucide-react';

interface RetroWindowProps {
  title: string;
  children: React.ReactNode;
  onClose?: () => void;
  className?: string;
}

export const RetroWindow: React.FC<RetroWindowProps> = ({ title, children, onClose, className = "" }) => {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0.9, opacity: 0 }}
      className={`pixel-window relative flex flex-col min-w-[300px] ${className}`}
    >
      {/* Title Bar */}
      <div className="flex items-center justify-between mb-4 border-b-4 border-black pb-2 -mx-2 px-2 bg-black/10">
        <span className="font-pixel text-[12px] text-white uppercase tracking-wider">{title}</span>
        {onClose && (
          <button 
            onClick={onClose}
            className="hover:bg-red-500 p-1 transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1 overflow-auto custom-scrollbar">
        {children}
      </div>
    </motion.div>
  );
};
