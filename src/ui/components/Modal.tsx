import React, { useEffect, useRef, ReactNode } from 'react';
import { X } from 'lucide-react';
import { Button } from './Button.tsx';

/**
 * Accessible Modal Dialog Component
 * A11y Notes:
 * - role="dialog" with aria-modal="true"
 * - aria-labelledby links dialog to title
 * - Escape key dismisses modal
 * - Focus automatically shifted to dialog container upon open
 */
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);
  const titleId = `modal-title-${title.toLowerCase().replace(/\s+/g, '-')}`;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown);
      modalRef.current?.focus();
    }

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-xl p-6 shadow-2xl focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <h2 id={titleId} className="text-base font-bold text-white tracking-tight">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-400"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="text-xs text-slate-300 space-y-4">{children}</div>
      </div>
    </div>
  );
};
