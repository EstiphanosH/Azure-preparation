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
  AlertCircle,
  Timer,
} from 'lucide-react';
import { ExamTimer } from './ExamTimer.tsx';

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
  isTimed?: boolean;
  timeLimitSeconds?: number;
  onTimeExpired?: () => void;
  onTimeUpdate?: (elapsed: number, remaining: number) => void;
  examMode?: 'timed_exam' | 'practice';
  timeExpiredNotice?: boolean;
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
  isTimed = false,
  timeLimitSeconds,
  onTimeExpired,
  onTimeUpdate,
  examMode = 'practice',
  timeExpiredNotice = false,
}) => {
  const [showQuestionGrid, setShowQuestionGrid] = useState(false);

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col justify-between font-sans antialiased transition-colors">
        <main className="flex-1 flex items-center justify-center p-6">
          <div role="status" aria-live="polite" className="text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-600 mx-auto" />
            <p className="text-xs text-slate-600 dark:text-slate-400">Loading diagnostic question stream...</p>
          </div>
        </main>
        <Disclaimer />
      </div>
    );
  }

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col justify-between font-sans antialiased transition-colors">
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col justify-between font-sans antialiased transition-colors">
      {/* Quiz Top Navigation Bar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-4 sm:px-6 py-3.5 sticky top-0 z-30 transition-colors">
        <div className="max-w-4xl mx-auto flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-sky-700 dark:text-sky-300 fill-current" />
              <span className="font-display font-bold text-slate-900 dark:text-white text-xs sm:text-sm tracking-tight">
                {examMode === 'timed_exam' ? 'AZ-900 TIMED EXAM SIMULATION' : 'AZ-900 DIAGNOSTIC EXAM SESSION'}
              </span>
            </div>
            <Badge variant={examMode === 'timed_exam' ? 'danger' : 'info'}>
              {examMode === 'timed_exam'
                ? 'TIMED EXAM'
                : totalQuestions === 50
                ? '50-Q QUICK QUIZ'
                : 'IN PROGRESS'}
            </Badge>
          </div>

          <div className="flex items-center gap-3">
            {/* Live Exam Countdown Timer */}
            {isTimed && timeLimitSeconds && onTimeExpired && (
              <ExamTimer
                initialSeconds={timeLimitSeconds}
                onTimeExpired={onTimeExpired}
                totalQuestions={totalQuestions}
                answeredCount={answeredCount}
                onTimeUpdate={onTimeUpdate}
              />
            )}

            {/* Quick Progress Indicator */}
            <div className="text-xs font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
              <span>
                Question <span className="text-sky-700 dark:text-sky-300 font-bold font-mono tabular-nums">{currentIndex + 1}</span> of <span className="font-mono tabular-nums">{totalQuestions}</span>
              </span>
              <span className="hidden sm:inline text-slate-400 font-mono text-[11px]">
                ({answeredCount}/{totalQuestions} answered)
              </span>
            </div>

            {/* Toggle Question Navigator Grid */}
            {onJumpToQuestion && (
              <button
                type="button"
                onClick={() => setShowQuestionGrid(!showQuestionGrid)}
                className={`p-1.5 rounded-lg border text-xs flex items-center gap-1 transition-colors ${
                  showQuestionGrid
                    ? 'bg-sky-600 text-white border-sky-600 font-semibold shadow-sm'
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
            className="h-full bg-sky-600 transition-all duration-300"
          />
        </div>

        {/* Mobile Interactive Question Matrix Drawer */}
        {showQuestionGrid && onJumpToQuestion && (
          <div className="lg:hidden max-w-4xl mx-auto mt-3 p-3 bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2 text-xs">
            <div className="flex items-center justify-between text-[11px] text-slate-600 dark:text-slate-400">
              <span className="font-semibold uppercase tracking-wider">
                Question Matrix ({answeredCount} answered • {flaggedIndices.length} flagged)
              </span>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-sky-600" /> Current</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" /> Answered</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500" /> Flagged</span>
                <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-slate-400" /> Unanswered</span>
              </div>
            </div>

            <div className="grid grid-cols-10 sm:grid-cols-15 gap-1.5 pt-1">
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
                    className={`h-7 rounded text-[11px] font-mono tabular-nums font-semibold transition-all border ${
                      isCurrent
                        ? 'bg-sky-600 text-white border-sky-500 ring-2 ring-sky-500/40 font-bold'
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

      {/* Main Assessment Layout Container with Desktop Sidebar */}
      <div className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 lg:flex lg:gap-8 items-start">
        {/* Desktop Exam Companion Sidebar */}
        <aside
          aria-label="Exam Session Navigator"
          className="hidden lg:flex flex-col gap-4 w-72 xl:w-80 shrink-0 sticky top-24"
        >
          {/* Session Overview Card */}
          <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="font-display font-bold text-xs uppercase tracking-wider text-slate-900 dark:text-white">
                Exam Navigation
              </span>
              <span className="text-[11px] font-mono text-sky-700 dark:text-sky-300 font-bold">
                {progressPct}% Complete
              </span>
            </div>

            {/* Pacing & Answered Counter Pills */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/50">
                <span className="block text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400">
                  {answeredCount}
                </span>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-500 font-medium">Answered</span>
              </div>
              <div className="p-2 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/50">
                <span className="block text-xs font-bold font-mono text-amber-700 dark:text-amber-400">
                  {flaggedIndices.length}
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-500 font-medium">Flagged</span>
              </div>
              <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/60">
                <span className="block text-xs font-bold font-mono text-slate-700 dark:text-slate-300">
                  {totalQuestions - answeredCount}
                </span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Pending</span>
              </div>
            </div>

            {/* Live Question Matrix (1 to totalQuestions) */}
            {onJumpToQuestion && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="font-semibold uppercase tracking-wider">Question Matrix</span>
                  <span className="font-mono text-[10px]">1 – {totalQuestions}</span>
                </div>
                <div className="grid grid-cols-5 gap-1.5 max-h-64 overflow-y-auto pr-1">
                  {Array.from({ length: totalQuestions }).map((_, idx) => {
                    const isCurrent = idx === currentIndex;
                    const isAnswered = answeredIndices.includes(idx);
                    const isFlagged = flaggedIndices.includes(idx);

                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => onJumpToQuestion(idx)}
                        className={`h-7 rounded text-[11px] font-mono tabular-nums font-semibold transition-all border ${
                          isCurrent
                            ? 'bg-sky-600 text-white border-sky-500 ring-2 ring-sky-500/40 font-bold'
                            : isFlagged
                            ? 'bg-amber-500/20 border-amber-500 text-amber-700 dark:text-amber-400'
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

            {/* Keyboard Shortcuts Hint */}
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800/80 text-[10px] text-slate-500 dark:text-slate-400 space-y-1">
              <div className="font-semibold text-slate-700 dark:text-slate-300">Keyboard Shortcuts:</div>
              <div className="flex items-center justify-between font-mono">
                <span>Select option:</span>
                <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px]">1 – 4</kbd>
              </div>
              <div className="flex items-center justify-between font-mono">
                <span>Submit answer:</span>
                <kbd className="px-1 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[9px]">Enter</kbd>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Assessment Container */}
        <main className="flex-1 min-w-0 space-y-5">
        {timeExpiredNotice && (
          <div
            role="alert"
            data-testid="time-expired-alert"
            className="p-3.5 bg-rose-50 dark:bg-rose-950/80 border-2 border-rose-500 rounded-xl text-rose-900 dark:text-rose-200 text-xs flex items-center gap-3 shadow-md animate-pulse"
          >
            <AlertCircle className="w-5 h-5 text-rose-600 dark:text-rose-400 shrink-0" />
            <div>
              <span className="font-bold block uppercase tracking-wide">Exam Time Expired</span>
              <span>The scheduled time limit has elapsed. Submitting all answered questions for formal scoring...</span>
            </div>
          </div>
        )}

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
            <span className="px-2 py-0.5 rounded bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 text-sky-800 dark:text-sky-300 font-semibold text-[11px]">
              {currentQuestion.domainTitle || 'AZ-900 Core Domain'}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
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
      </div>

      <Disclaimer />
    </div>
  );
};
