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
    success: 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/60 dark:border-emerald-800/60 dark:text-emerald-300',
    warning: 'bg-amber-50 border-amber-200 text-amber-800 dark:bg-amber-950/60 dark:border-amber-800/60 dark:text-amber-300',
    danger: 'bg-rose-50 border-rose-200 text-rose-800 dark:bg-rose-950/60 dark:border-rose-800/60 dark:text-rose-300',
    info: 'bg-sky-50 border-sky-200 text-sky-800 dark:bg-sky-950/60 dark:border-sky-800/60 dark:text-sky-300',
    neutral: 'bg-slate-100 border-slate-200 text-slate-700 dark:bg-slate-800/80 dark:border-slate-700 dark:text-slate-300',
  }[variant];

  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-sans font-medium border ${variantStyles} ${className}`}
      {...rest}
    >
      {children}
    </span>
  );
};
