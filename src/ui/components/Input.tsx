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
    <div className="flex flex-col gap-1.5 w-full font-mono text-xs">
      <label htmlFor={id} className="text-slate-200 font-semibold flex items-center justify-between">
        <span>{label}</span>
        {required && <span className="text-cyan-400 font-normal">*required</span>}
      </label>

      <input
        id={id}
        required={required}
        aria-invalid={!!errorMessage}
        aria-describedby={describedBy || undefined}
        className={`w-full px-3 py-2.5 rounded-lg bg-slate-950 border transition-all min-h-[44px] text-white focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-950 ${
          errorMessage
            ? 'border-rose-500 focus:ring-rose-500 text-rose-100'
            : 'border-slate-800 focus:border-cyan-500 focus:ring-cyan-400'
        } ${className}`}
        {...rest}
      />

      {helperText && !errorMessage && (
        <p id={helperId} className="text-slate-400 text-[11px]">
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
