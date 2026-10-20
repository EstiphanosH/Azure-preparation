import React from 'react';
import { Card } from '../../components/Card.tsx';
import { Button } from '../../components/Button.tsx';
import { Badge } from '../../components/Badge.tsx';
import { ReadinessGauge } from '../../components/ReadinessGauge.tsx';
import { DomainBreakdownChart, DomainScoreItem } from '../../components/DomainBreakdownChart.tsx';
import { Disclaimer } from '../../components/Disclaimer.tsx';
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
}) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-mono">
        <main className="flex-1 flex items-center justify-center p-6">
          <div role="status" aria-live="polite" className="text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400 mx-auto" />
            <p className="text-xs text-slate-400">Computing candidate readiness assessment...</p>
          </div>
        </main>
        <Disclaimer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-mono">
      <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-3 sticky top-0 z-30">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-cyan-400" />
            <span className="font-bold text-white text-sm">DIAGNOSTIC OUTCOME & SCORE REPORT</span>
          </div>
          <Badge variant="success">RESOLVED</Badge>
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
              <h2 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                Session Performance Summary
              </h2>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">TOTAL QUESTIONS</span>
                  <span className="text-base font-bold text-white">{totalQuestions}</span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800">
                  <span className="text-slate-400 text-[10px] block">CORRECT RESPONSES</span>
                  <span className="text-base font-bold text-emerald-400">{correctCount}</span>
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
