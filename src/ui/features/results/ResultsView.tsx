import React from 'react';
import { Card } from '../../components/Card.tsx';
import { Button } from '../../components/Button.tsx';
import { Badge } from '../../components/Badge.tsx';
import { ReadinessGauge } from '../../components/ReadinessGauge.tsx';
import { DomainBreakdownChart, DomainScoreItem } from '../../components/DomainBreakdownChart.tsx';
import { Disclaimer } from '../../components/Disclaimer.tsx';
import { ThemeToggle } from '../../theme/ThemeContext.tsx';
import { Award, ArrowRight, RotateCcw } from 'lucide-react';

export interface ResultsViewProps {
  score: number;
  grade: 'READY' | 'REVIEW_REQUIRED' | 'NOT_READY';
  sessionId: string;
  totalQuestions: number;
  correctCount: number;
  domainBreakdown: readonly DomainScoreItem[];
  onReturnDashboard: () => void;
  onRetakeQuiz: () => void;
  isLoading?: boolean;
  timeTakenSeconds?: number;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  score,
  grade,
  sessionId,
  totalQuestions,
  correctCount,
  domainBreakdown,
  onReturnDashboard,
  onRetakeQuiz,
  isLoading = false,
  timeTakenSeconds,
}) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col justify-between font-sans antialiased transition-colors">
        <main className="flex-1 flex items-center justify-center p-6">
          <div role="status" aria-live="polite" className="text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-600 mx-auto" />
            <p className="text-xs text-slate-600 dark:text-slate-400">Computing candidate readiness assessment...</p>
          </div>
        </main>
        <Disclaimer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col justify-between font-sans antialiased transition-colors">
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-6 py-3.5 sticky top-0 z-30 transition-colors">
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-sky-700 dark:text-sky-300" />
            <span className="font-display font-bold text-slate-900 dark:text-white text-sm tracking-tight">AZ-900: DIAGNOSTIC OUTCOME & SCORE REPORT</span>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="success">RESOLVED</Badge>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl mx-auto w-full p-4 sm:p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Readiness Meter */}
          <div className="md:col-span-5">
            <ReadinessGauge score={score} grade={grade} />
          </div>

          {/* Detailed Statistics & Domain Chart */}
          <div className="md:col-span-7 space-y-6">
            <Card className="space-y-4">
              <h2 className="font-display text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider border-b border-slate-200 dark:border-slate-800 pb-2">
                Session Performance Summary
              </h2>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-slate-50 dark:bg-slate-950/70 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] block font-semibold uppercase tracking-wider">TOTAL QUESTIONS</span>
                  <span className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-white">{totalQuestions}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/70 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] block font-semibold uppercase tracking-wider">CORRECT RESPONSES</span>
                  <span className="text-base font-bold font-mono tabular-nums text-emerald-600 dark:text-emerald-400">{correctCount}</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/70 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] block font-semibold uppercase tracking-wider">ACCURACY RATE</span>
                  <span className="text-base font-bold font-mono tabular-nums text-sky-700 dark:text-sky-300">{score}%</span>
                </div>
                <div className="bg-slate-50 dark:bg-slate-950/70 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] block font-semibold uppercase tracking-wider">TIME SPENT</span>
                  <span className="text-base font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                    {typeof timeTakenSeconds === 'number' && timeTakenSeconds > 0
                      ? `${Math.floor(timeTakenSeconds / 60)}m ${timeTakenSeconds % 60}s`
                      : 'Untimed'}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <DomainBreakdownChart breakdown={domainBreakdown} />
              </div>
            </Card>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <Button variant="outline" onClick={onRetakeQuiz} className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4" />
                <span>Retake Diagnostic</span>
              </Button>
              <Button onClick={onReturnDashboard} className="flex items-center gap-2">
                <span>View Candidate Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Disclaimer />
    </div>
  );
};
