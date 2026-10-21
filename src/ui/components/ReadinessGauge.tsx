import React from 'react';
import { Badge } from './Badge.tsx';

/**
 * Accessible ReadinessGauge Component
 * A11y Notes:
 * - Uses role="meter" with aria-valuenow, aria-valuemin, aria-valuemax, aria-valuetext
 * - Explicit textual description accompanying the numerical score
 */
export interface ReadinessGaugeProps {
  score: number;
  grade: 'READY' | 'REVIEW_REQUIRED' | 'NOT_READY';
}

export const ReadinessGauge: React.FC<ReadinessGaugeProps> = ({ score, grade }) => {
  const gradeDetails = {
    READY: {
      label: 'Exam Ready (70%+ & All Domains ≥60%)',
      badgeVariant: 'success' as const,
      colorClass: 'text-emerald-600 dark:text-emerald-400',
      description: 'Candidate demonstrates strong architectural knowledge across all diagnostic domains.',
    },
    REVIEW_REQUIRED: {
      label: 'Targeted Review Required (50%-69%)',
      badgeVariant: 'warning' as const,
      colorClass: 'text-amber-600 dark:text-amber-400',
      description: 'Foundational concepts established; specific domains require remediation.',
    },
    NOT_READY: {
      label: 'Foundational Gap (<50%)',
      badgeVariant: 'danger' as const,
      colorClass: 'text-rose-600 dark:text-rose-400',
      description: 'Significant architecture review and practice scenarios recommended.',
    },
  }[grade];

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-md dark:shadow-xl flex flex-col items-center text-center font-mono space-y-4 transition-colors">
      <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
        Aggregate Readiness Assessment
      </span>

      {/* Meter element with ARIA semantics */}
      <div
        role="meter"
        aria-label="Overall Diagnostic Readiness Score"
        aria-valuenow={score}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuetext={`${score}% — ${gradeDetails.label}`}
        className="relative flex items-center justify-center"
      >
        <div className="w-32 h-32 rounded-full border-4 border-slate-200 dark:border-slate-800 flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-950 shadow-inner">
          <span className={`text-4xl font-extrabold ${gradeDetails.colorClass}`}>
            {score}%
          </span>
          <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase font-semibold">
            Score
          </span>
        </div>
      </div>

      <div className="space-y-1.5">
        <Badge variant={gradeDetails.badgeVariant}>
          {grade}
        </Badge>
        <p className="text-xs text-slate-800 dark:text-slate-200 font-semibold pt-1">
          {gradeDetails.label}
        </p>
        <p className="text-[11px] text-slate-600 dark:text-slate-400 max-w-xs leading-relaxed">
          {gradeDetails.description}
        </p>
      </div>
    </div>
  );
};
