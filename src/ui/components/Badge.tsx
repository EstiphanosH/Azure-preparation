import React, { HTMLAttributes } from 'react';

/**
 * Accessible Badge Component
 * A11y Notes:
 * - Color is never the sole indicator of state (always accompanied by text label)
 * - Minimum 4.5:1 contrast ratio against dark theme background
 */
export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
}

export const Badge: React.FC<BadgeProps> = ({
  variant = 'neutral',
  children,
  className = '',
  ...rest
}) => {
  const variantStyles = {
    success: 'bg-emerald-950/70 border-emerald-500/50 text-emerald-300',
    warning: 'bg-amber-950/70 border-amber-500/50 text-amber-300',
    danger: 'bg-rose-950/70 border-rose-500/50 text-rose-300',
    info: 'bg-cyan-950/70 border-cyan-500/50 text-cyan-300',
    neutral: 'bg-slate-800 border-slate-700 text-slate-300',
  }[variant];

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-mono font-bold border ${variantStyles} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
};
