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
    success: 'bg-emerald-100 border-emerald-300 text-emerald-800 dark:bg-emerald-950/70 dark:border-emerald-500/50 dark:text-emerald-300',
    warning: 'bg-amber-100 border-amber-300 text-amber-800 dark:bg-amber-950/70 dark:border-amber-500/50 dark:text-amber-300',
    danger: 'bg-rose-100 border-rose-300 text-rose-800 dark:bg-rose-950/70 dark:border-rose-500/50 dark:text-rose-300',
    info: 'bg-cyan-100 border-cyan-300 text-cyan-800 dark:bg-cyan-950/70 dark:border-cyan-500/50 dark:text-cyan-300',
    neutral: 'bg-slate-200 border-slate-300 text-slate-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300',
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
