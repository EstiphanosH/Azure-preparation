import React, { useEffect } from 'react';
import { CheckCircle2, XCircle } from 'lucide-react';
import { Button } from './Button.tsx';

/**
 * Accessible QuestionCard Component
 * A11y Notes:
 * - Formatted as role="radiogroup" with accessible prompt label
 * - Each option has role="radio" with aria-checked state
 * - Keyboard shortcuts: 1-4 key presses automatically select corresponding options
 * - Feedback is announced via aria-live="polite"
 */
export interface QuestionCardProps {
  questionId: string;
  prompt: string;
  options: readonly [string, string, string, string] | readonly string[];
  selectedIndex: number | null;
  onSelectOption: (index: number) => void;
  onSubmitAttempt: () => void;
  isSubmitting?: boolean;
  hasSubmitted?: boolean;
  isCorrect?: boolean | null;
  explanation?: string | null;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({
  questionId,
  prompt,
  options,
  selectedIndex,
  onSelectOption,
  onSubmitAttempt,
  isSubmitting = false,
  hasSubmitted = false,
  isCorrect = null,
  explanation = null,
}) => {
  const promptId = `prompt-${questionId}`;

  // Keyboard shortcut support: numbers 1, 2, 3, 4 select options
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (hasSubmitted || isSubmitting) return;

      if (e.key === '1') onSelectOption(0);
      else if (e.key === '2') onSelectOption(1);
      else if (e.key === '3') onSelectOption(2);
      else if (e.key === '4') onSelectOption(3);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hasSubmitted, isSubmitting, onSelectOption]);

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-md dark:shadow-xl space-y-5 font-mono text-xs transition-colors">
      {/* Prompt Heading */}
      <div className="border-b border-slate-200 dark:border-slate-800 pb-3">
        <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-bold uppercase tracking-wider block mb-1">
          DIAGNOSTIC QUESTION {questionId}
        </span>
        <h2 id={promptId} className="text-sm md:text-base font-bold text-slate-900 dark:text-white leading-relaxed">
          {prompt}
        </h2>
      </div>

      {/* Options Radio Group */}
      <div
        role="radiogroup"
        aria-labelledby={promptId}
        className="space-y-2.5"
      >
        {options.map((optionText, idx) => {
          const isSelected = selectedIndex === idx;
          const optionId = `opt-${questionId}-${idx}`;

          return (
            <div
              key={idx}
              id={optionId}
              role="radio"
              aria-checked={isSelected}
              tabIndex={hasSubmitted ? -1 : 0}
              onClick={() => {
                if (!hasSubmitted && !isSubmitting) onSelectOption(idx);
              }}
              onKeyDown={(e) => {
                if (hasSubmitted || isSubmitting) return;
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onSelectOption(idx);
                }
              }}
              className={`flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 min-h-[48px] ${
                isSelected
                  ? 'bg-cyan-50 dark:bg-cyan-950/60 border-cyan-500 dark:border-cyan-400 text-slate-900 dark:text-white font-semibold shadow-sm'
                  : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
              } ${hasSubmitted ? 'cursor-default opacity-90' : ''}`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0 border ${
                    isSelected
                      ? 'bg-cyan-500 border-cyan-500 text-slate-950'
                      : 'bg-slate-200 dark:bg-slate-900 border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-400'
                  }`}
                >
                  {idx + 1}
                </span>
                <span className="leading-snug">{optionText}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Footer */}
      {!hasSubmitted ? (
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:inline">
            Press <kbd className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200">1-4</kbd> to select option
          </span>
          <Button
            onClick={onSubmitAttempt}
            disabled={selectedIndex === null || isSubmitting}
            isLoading={isSubmitting}
            className="w-full sm:w-auto"
          >
            Submit Answer
          </Button>
        </div>
      ) : (
        <div
          role="status"
          aria-live="polite"
          className={`p-4 rounded-lg border space-y-2 ${
            isCorrect
              ? 'bg-emerald-50 dark:bg-emerald-950/50 border-emerald-300 dark:border-emerald-500/50 text-emerald-900 dark:text-emerald-200'
              : 'bg-rose-50 dark:bg-rose-950/50 border-rose-300 dark:border-rose-500/50 text-rose-900 dark:text-rose-200'
          }`}
        >
          <div className="flex items-center gap-2 font-bold text-sm">
            {isCorrect ? (
              <>
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Correct! Diagnostic Criteria Verified</span>
              </>
            ) : (
              <>
                <XCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
                <span>Incorrect Selection</span>
              </>
            )}
          </div>
          {explanation && (
            <p className="text-xs leading-relaxed text-slate-700 dark:text-slate-300 pt-1">
              <strong>Technical Explanation:</strong> {explanation}
            </p>
          )}
        </div>
      )}
    </div>
  );
};
