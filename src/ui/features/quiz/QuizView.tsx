import React from 'react';
import { QuestionCard } from '../../components/QuestionCard.tsx';
import { Disclaimer } from '../../components/Disclaimer.tsx';
import { Button } from '../../components/Button.tsx';
import { Badge } from '../../components/Badge.tsx';
import { FeatureGate } from '../../flags/FlagContext.tsx';
import { ThemeToggle } from '../../theme/ThemeContext.tsx';
import { Lightbulb, ChevronRight, CheckCircle2, ShieldCheck, HelpCircle } from 'lucide-react';

export interface QuizQuestionItem {
  id: string;
  prompt: string;
  options: readonly [string, string, string, string] | readonly string[];
  explanation: string;
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
  onFinalize: () => void;
  isFinalizing: boolean;
  activeHint: string | null;
  onRequestHint: () => void;
  isLoadingSession: boolean;
  errorMessage: string | null;
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
  onFinalize,
  isFinalizing,
  activeHint,
  onRequestHint,
  isLoadingSession,
  errorMessage,
}) => {
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
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-300">No questions available in selected session.</p>
          </div>
        </main>
        <Disclaimer />
      </div>
    );
  }

  const isLastQuestion = currentIndex >= totalQuestions - 1;
  const progressPct = Math.round(((currentIndex + 1) / totalQuestions) * 100);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between font-mono transition-colors">
      {/* Quiz Top Navigation Bar */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-6 py-3.5 sticky top-0 z-30 transition-colors">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="font-bold text-slate-900 dark:text-white text-sm">AZ-900 DIAGNOSTIC EXAM SESSION</span>
            <Badge variant="info">IN PROGRESS</Badge>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300">
              Question <span className="text-cyan-600 dark:text-cyan-400 font-bold">{currentIndex + 1}</span> of {totalQuestions}
            </div>
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
      </header>

      {/* Main Assessment Container */}
      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {errorMessage && (
          <div role="alert" className="p-3 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/50 rounded-lg text-rose-800 dark:text-rose-300 text-xs">
            {errorMessage}
          </div>
        )}

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
        {hasSubmittedCurrent && (
          <div className="flex justify-end pt-2">
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
      </main>

      <Disclaimer />
    </div>
  );
};
