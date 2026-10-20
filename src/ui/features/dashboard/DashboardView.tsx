import React from 'react';
import { Card } from '../../components/Card.tsx';
import { Button } from '../../components/Button.tsx';
import { Badge } from '../../components/Badge.tsx';
import { ReadinessGauge } from '../../components/ReadinessGauge.tsx';
import { DomainBreakdownChart, DomainScoreItem } from '../../components/DomainBreakdownChart.tsx';
import { Disclaimer } from '../../components/Disclaimer.tsx';
import { Play, Download, Trash2, LogOut, User, Activity, AlertCircle } from 'lucide-react';

export interface DashboardViewProps {
  userEmail: string;
  username: string;
  overallScore: number;
  evaluationGrade: 'READY' | 'REVIEW_REQUIRED' | 'NOT_READY';
  domainBreakdown: readonly DomainScoreItem[];
  totalAttempts: number;
  onStartQuiz: () => void;
  onExportData: () => void;
  onDeleteAccount: () => void;
  onLogout: () => void;
  isLoading: boolean;
  isStartingQuiz: boolean;
  isDeleting: boolean;
  errorMessage: string | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  userEmail,
  username,
  overallScore,
  evaluationGrade,
  domainBreakdown,
  totalAttempts,
  onStartQuiz,
  onExportData,
  onDeleteAccount,
  onLogout,
  isLoading,
  isStartingQuiz,
  isDeleting,
  errorMessage,
}) => {
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-mono">
        <main className="flex-1 flex items-center justify-center p-6">
          <div role="status" aria-live="polite" className="text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-400 mx-auto" />
            <p className="text-xs text-slate-400">Loading candidate profile and diagnostic history...</p>
          </div>
        </main>
        <Disclaimer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between font-mono">
      {/* Dashboard Top Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 px-6 py-3 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-white text-sm block">CANDIDATE DASHBOARD</span>
              <span className="text-[11px] text-slate-400">{userEmail} ({username})</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={onLogout} className="flex items-center gap-1.5">
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-6xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {errorMessage && (
          <div role="alert" className="p-3.5 bg-rose-950/60 border border-rose-500/50 rounded-lg text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Readiness Gauge */}
          <div className="md:col-span-5 space-y-6">
            <ReadinessGauge score={overallScore} grade={evaluationGrade} />

            <Card className="space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-2">
                Quick Actions
              </h3>
              <Button
                onClick={onStartQuiz}
                isLoading={isStartingQuiz}
                disabled={isStartingQuiz}
                className="w-full flex items-center justify-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start New Diagnostic Session</span>
              </Button>
              <Button
                variant="outline"
                onClick={onExportData}
                className="w-full flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Export Candidate Data (GDPR)</span>
              </Button>
            </Card>
          </div>

          {/* Domain Proficiency & History */}
          <div className="md:col-span-7 space-y-6">
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h2 className="text-sm font-bold text-white uppercase tracking-wider">
                  Knowledge Domain Mastery
                </h2>
                <span className="text-[11px] text-slate-400">
                  {totalAttempts} attempts evaluated
                </span>
              </div>

              {totalAttempts === 0 ? (
                <div className="text-center py-8 space-y-2 text-slate-400">
                  <p className="text-xs">No diagnostic sessions completed yet.</p>
                  <p className="text-[11px] text-slate-500">
                    Start a session to benchmark readiness against standard architectural objectives.
                  </p>
                </div>
              ) : (
                <DomainBreakdownChart breakdown={domainBreakdown} />
              )}
            </Card>

            {/* Account Management & Cascade */}
            <Card className="border-rose-950/40 bg-slate-900/40 space-y-3">
              <h3 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                Candidate Account Governance
              </h3>
              <p className="text-[11px] text-slate-400">
                Permanently purge candidate account, attempt history, and all stored diagnostic sessions.
              </p>
              <Button
                size="sm"
                variant="danger"
                isLoading={isDeleting}
                disabled={isDeleting}
                onClick={onDeleteAccount}
                className="flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Purge & Delete Account</span>
              </Button>
            </Card>
          </div>
        </div>
      </main>

      <Disclaimer />
    </div>
  );
};
