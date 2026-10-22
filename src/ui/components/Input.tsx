import React, { InputHTMLAttributes } from 'react';

/**
 * Accessible Input Component
 * A11y Notes:
 * - Direct label to input linking via htmlFor and id
 * - aria-invalid="true" flagged when errorMessage is provided
 * - aria-describedby links to error paragraph for screen reader announcement
 * - 44px minimum tap target and high-contrast outline focus ring
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  id: string;
  label: string;
  errorMessage?: string;
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  id,
  label,
  errorMessage,
  helperText,
  className = '',
  required,
  ...rest
}) => {
  const errorId = `${id}-error`;
  const helperId = `${id}-helper`;

  const describedBy = [
    errorMessage ? errorId : null,
    helperText ? helperId : null,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className="flex flex-col gap-1.5 w-full font-sans text-xs">
      <label htmlFor={id} className="text-slate-800 dark:text-slate-200 font-semibold flex items-center justify-between">
        <span>{label}</span>
        {required && <span className="text-sky-700 dark:text-sky-300 font-normal">*required</span>}
      </label>

      <input
        id={id}
        required={required}
        aria-invalid={!!errorMessage}
        aria-describedby={describedBy || undefined}
        className={`w-full px-3 py-2.5 rounded-lg bg-white dark:bg-slate-950 border transition-all min-h-[44px] text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-white dark:focus:ring-offset-slate-950 ${
          errorMessage
            ? 'border-rose-500 focus:ring-rose-500 text-rose-900 dark:text-rose-100'
            : 'border-slate-300 dark:border-slate-800 focus:border-sky-500 focus:ring-sky-500'
        } ${className}`}
        {...rest}
      />

      {helperText && !errorMessage && (
        <p id={helperId} className="text-slate-500 dark:text-slate-400 text-[11px]">
          {helperText}
        </p>
      )}

      {errorMessage && (
        <p id={errorId} role="alert" className="text-rose-400 text-[11px] font-semibold">
          {errorMessage}
        </p>
      )}
    </div>
  );
};
