/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { QuestionCard } from '../../components/QuestionCard.tsx';
import { Disclaimer } from '../../components/Disclaimer.tsx';
import { Button } from '../../components/Button.tsx';
import { Badge } from '../../components/Badge.tsx';
import { FeatureGate } from '../../flags/FlagContext.tsx';
import { ThemeToggle } from '../../theme/ThemeContext.tsx';
import {
  Lightbulb,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  Bookmark,
  Grid,
  Zap,
  HelpCircle,
  Clock,
} from 'lucide-react';

export interface QuizQuestionItem {
  id: string;
  prompt: string;
  options: readonly [string, string, string, string] | readonly string[];
  explanation: string;
  domainId?: string;
  domainTitle?: string;
}

export interface QuizViewProps {
  currentQuestion: QuizQuestionItem | null;
  currentIndex: number;
  totalQuestions: number;
  selectedIndex: number | null;
  onSelectOption: (idx: number) => void;
  onSubmitAttempt: () => void;
  isSubmitting: boolean;
  hasSubmittedCurrent: boolean;
  isCurrentCorrect: boolean | null;
  onNextQuestion: () => void;
  onPreviousQuestion?: () => void;
  onFinalize: () => void;
  isFinalizing: boolean;
  activeHint: string | null;
  onRequestHint: () => void;
  isLoadingSession: boolean;
  errorMessage: string | null;
  answeredIndices?: readonly number[];
  flaggedIndices?: readonly number[];
  onJumpToQuestion?: (idx: number) => void;
  onToggleFlag?: () => void;
  isCurrentFlagged?: boolean;
}

export const QuizView: React.FC<QuizViewProps> = ({
  currentQuestion,
  currentIndex,
  totalQuestions,
  selectedIndex,
  onSelectOption,
  onSubmitAttempt,
  isSubmitting,
  hasSubmittedCurrent,
  isCurrentCorrect,
  onNextQuestion,
  onPreviousQuestion,
  onFinalize,
  isFinalizing,
  activeHint,
  onRequestHint,
  isLoadingSession,
  errorMessage,
  answeredIndices = [],
  flaggedIndices = [],
  onJumpToQuestion,
  onToggleFlag,
  isCurrentFlagged = false,
}) => {
  const [showQuestionGrid, setShowQuestionGrid] = useState(false);

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between font-mono transition-colors">
        <main className="flex-1 flex items-center justify-center p-6">
          <div role="status" aria-live="polite" className="text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mx-auto" />
            <p className="text-xs text-slate-600 dark:text-slate-400">Loading diagnostic question stream...</p>
          </div>
        </main>
        <Disclaimer />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between font-mono transition-colors">
        <main className="flex-1 flex items-center justify-center p-6">
          <div className="max-w-md text-center p-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl space-y-3 shadow-md">
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-300">
              No questions available in selected session.
            </p>
          </div>
        </main>
        <Disclaimer />
      </div>
    );
  }

  const isLastQuestion = currentIndex >= totalQuestions - 1;
  const progressPct = Math.round(((currentIndex + 1) / totalQuestions) * 100);
  const answeredCount = answeredIndices.length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between font-mono transition-colors">
      {/* Quiz Top Navigation Bar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-4 sm:px-6 py-3.5 sticky top-0 z-30 transition-colors">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-cyan-600 dark:text-cyan-400 fill-current" />
              <span className="font-bold text-slate-900 dark:text-white text-xs sm:text-sm">
                AZ-900 DIAGNOSTIC EXAM SESSION
              </span>
            </div>
            <Badge variant="info">
              {totalQuestions === 50 ? '50-Q QUICK QUIZ' : 'IN PROGRESS'}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            {/* Quick Progress Indicator */}
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span>
                Question <span className="text-cyan-600 dark:text-cyan-400 font-bold">{currentIndex + 1}</span> of {totalQuestions}
              </span>
              <span className="hidden sm:inline text-slate-400">
                ({answeredCount}/{totalQuestions} answered)
              </span>
            </div>

            {/* Toggle 50-Question Navigator Grid */}
            {onJumpToQuestion && (
              <button
                type="button"
                onClick={() => setShowQuestionGrid(!showQuestionGrid)}
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                  showQuestionGrid
                    ? 'bg-cyan-500 text-slate-950 border-cyan-500 font-bold'
                    : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
                title="Toggle Question Navigator Grid (1-50)"
              >
                <Grid className="w-3.5 h-3.5" />
                <span className="text-[11px] hidden sm:inline">Navigator</span>
              </button>
            )}

            <ThemeToggle />
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-4xl mx-auto mt-2 h-1 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
          <div
            style={{ width: `${progressPct}%` }}
            className="h-full bg-cyan-500 transition-all duration-300"
          />
        </div>

        {/* Interactive 50-Question Matrix Drawer */}
        {showQuestionGrid && onJumpToQuestion && (
          <div className="max-w-4xl mx-auto mt-3 p-3 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
              <span className="font-bold uppercase tracking-wider">
                Question Matrix ({answeredCount} answered • {flaggedIndices.length} flagged)
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-cyan-500" /> Current</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Answered</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Flagged</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400" /> Unanswered</span>
              </div>
            </div>

            <div className="grid grid-cols-10 sm:grid-cols-15 md:grid-cols-25 gap-1.5 pt-1">
              {Array.from({ length: totalQuestions }).map((_, idx) => {
                const isCurrent = idx === currentIndex;
                const isAnswered = answeredIndices.includes(idx);
                const isFlagged = flaggedIndices.includes(idx);

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => {
                      onJumpToQuestion(idx);
                      setShowQuestionGrid(false);
                    }}
                    className={`h-7 rounded text-[11px] font-bold transition-all border ${
                      isCurrent
                        ? 'bg-cyan-500 text-slate-950 border-cyan-400 ring-2 ring-cyan-400 font-extrabold'
                        : isFlagged
                        ? 'bg-amber-500/20 border-amber-500 text-amber-600 dark:text-amber-400'
                        : isAnswered
                        ? 'bg-emerald-500/20 border-emerald-500/60 text-emerald-700 dark:text-emerald-400'
                        : 'bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:border-slate-400'
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </header>

      {/* Main Assessment Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-5">
        {errorMessage && (
          <div
            role="alert"
            className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/50 rounded-lg text-rose-800 dark:text-rose-300 text-xs"
          >
            {errorMessage}
          </div>
        )}

        {/* Question Header Meta & Flag Button */}
        <div className="flex items-center justify-between text-xs">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-700 dark:text-cyan-400 font-semibold text-[11px]">
              {currentQuestion.domainTitle || 'AZ-900 Core Domain'}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              ID: {currentQuestion.id}
            </span>
          </div>

          {onToggleFlag && (
            <button
              type="button"
              onClick={onToggleFlag}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-colors ${
                isCurrentFlagged
                  ? 'bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-300'
                  : 'border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isCurrentFlagged ? 'fill-current' : ''}`} />
              <span>{isCurrentFlagged ? 'Flagged for Review' : 'Flag Question'}</span>
            </button>
          )}
        </div>

        <QuestionCard
          questionId={currentQuestion.id}
          prompt={currentQuestion.prompt}
          options={currentQuestion.options}
          selectedIndex={selectedIndex}
          onSelectOption={onSelectOption}
          onSubmitAttempt={onSubmitAttempt}
          isSubmitting={isSubmitting}
          hasSubmitted={hasSubmittedCurrent}
          isCorrect={isCurrentCorrect}
          explanation={currentQuestion.explanation}
        />

        {/* Feature-Gated Hint Ladder */}
        <FeatureGate flag="ff_progressive_hint_ladder">
          <div className="bg-slate-100 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3 transition-colors">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-500 dark:text-amber-400 shrink-0" />
              <span className="text-xs text-slate-700 dark:text-slate-300">
                {activeHint ? `Hint: ${activeHint}` : 'Need architectural clarification?'}
              </span>
            </div>
            {!activeHint && (
              <Button size="sm" variant="outline" onClick={onRequestHint}>
                Request Hint (-5 pts)
              </Button>
            )}
          </div>
        </FeatureGate>

        {/* Navigation / Finalize Bar */}
        <div className="flex items-center justify-between pt-2">
          {onPreviousQuestion && currentIndex > 0 ? (
            <Button
              variant="outline"
              size="sm"
              onClick={onPreviousQuestion}
              className="flex items-center gap-1.5 text-xs"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </Button>
          ) : (
            <div />
          )}

          {hasSubmittedCurrent && (
            <div>
              {!isLastQuestion ? (
                <Button onClick={onNextQuestion} className="flex items-center gap-2">
                  <span>Next Question</span>
                  <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button
                  onClick={onFinalize}
                  variant="primary"
                  isLoading={isFinalizing}
                  disabled={isFinalizing}
                  className="flex items-center gap-2"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finalize & Score Session ({totalQuestions} Qs)</span>
                </Button>
              )}
            </div>
          )}
        </div>
      </main>

      <Disclaimer />
    </div>
  );
};
