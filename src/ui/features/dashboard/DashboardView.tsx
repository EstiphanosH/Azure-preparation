/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Card } from '../../components/Card.tsx';
import { Button } from '../../components/Button.tsx';
import { Badge } from '../../components/Badge.tsx';
import { Modal } from '../../components/Modal.tsx';
import { ReadinessGauge } from '../../components/ReadinessGauge.tsx';
import { DomainBreakdownChart, DomainScoreItem } from '../../components/DomainBreakdownChart.tsx';
import { Disclaimer } from '../../components/Disclaimer.tsx';
import { ThemeToggle } from '../../theme/ThemeContext.tsx';
import { QuickQuizSection } from './QuickQuizSection.tsx';
import {
  Play,
  Download,
  Trash2,
  LogOut,
  Activity,
  AlertCircle,
  Sliders,
  Check,
  Shield,
  Zap,
} from 'lucide-react';

export interface DashboardViewProps {
  userEmail: string;
  username: string;
  overallScore: number;
  evaluationGrade: 'READY' | 'REVIEW_REQUIRED' | 'NOT_READY';
  domainBreakdown: readonly DomainScoreItem[];
  totalAttempts: number;
  onStartQuiz: (config?: { totalQuestions?: number; domainId?: string | null }) => void;
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
  const [questionCount, setQuestionCount] = useState<number>(50);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);

  const QUESTION_OPTIONS = [10, 15, 20, 25, 30, 40, 50] as const;

  const handleStart = () => {
    const validatedCount = Math.min(60, Math.max(10, questionCount));
    onStartQuiz({ totalQuestions: validatedCount, domainId: selectedDomain });
  };

  const handleExport = () => {
    onExportData();
    setExportNotice('Candidate data package exported to download queue (JSON schema validated).');
    setTimeout(() => setExportNotice(null), 4000);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between font-mono transition-colors">
        <main className="flex-1 flex items-center justify-center p-6">
          <div role="status" aria-live="polite" className="text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-cyan-500 mx-auto" />
            <p className="text-xs text-slate-600 dark:text-slate-400">Loading candidate profile and diagnostic history...</p>
          </div>
        </main>
        <Disclaimer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between font-mono transition-colors">
      {/* Dashboard Top Header */}
      <header className="border-b border-slate-200 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur px-6 py-3.5 sticky top-0 z-30 transition-colors">
        <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-600 dark:text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <span className="font-bold text-slate-900 dark:text-white text-sm block">AZ-900 CANDIDATE DASHBOARD</span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">{userEmail} ({username})</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ThemeToggle />
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
          <div role="alert" className="p-3.5 bg-rose-50 dark:bg-rose-950/60 border border-rose-300 dark:border-rose-500/50 rounded-lg text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {exportNotice && (
          <div role="status" className="p-3 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-500/50 rounded-lg text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 shrink-0" />
            <span>{exportNotice}</span>
          </div>
        )}

        {/* FEATURE: Quick Quiz Feature & Progress Tracker */}
        <QuickQuizSection
          onStartQuickQuiz={(config) => onStartQuiz(config)}
          isStarting={isStartingQuiz}
        />

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Readiness Gauge & Quiz Configurator */}
          <div className="md:col-span-5 space-y-6">
            <ReadinessGauge score={overallScore} grade={evaluationGrade} />

            {/* Diagnostic Session Launcher */}
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                  <Sliders className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
                  <span>Custom AZ-900 Quiz Parameters</span>
                </h3>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">10–50 Questions</span>
              </div>

              {/* Question Count Selection */}
              <div className="space-y-2">
                <label className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                  Select Question Count ({questionCount} questions):
                </label>
                <div className="grid grid-cols-4 gap-2 text-xs">
                  {QUESTION_OPTIONS.map((count) => {
                    const isSelected = questionCount === count;
                    return (
                      <button
                        key={count}
                        type="button"
                        onClick={() => setQuestionCount(count)}
                        className={`px-2 py-1.5 rounded-lg border text-xs font-bold transition-all focus:outline-none focus:ring-2 focus:ring-cyan-500 ${
                          isSelected
                            ? 'bg-cyan-500 border-cyan-500 text-slate-950 shadow-sm'
                            : 'bg-slate-50 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
                        }`}
                      >
                        {count} Qs
                      </button>
                    );
                  })}
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <label htmlFor="custom-question-slider" className="text-[10px] text-slate-500 dark:text-slate-400">
                    Custom count (10–50):
                  </label>
                  <input
                    id="custom-question-slider"
                    type="range"
                    min="10"
                    max="50"
                    step="1"
                    aria-label="Custom Question Count (between 10 and 50)"
                    value={questionCount}
                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                    className="flex-1 accent-cyan-500 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
                  />
                  <span className="text-xs font-bold text-cyan-700 dark:text-cyan-400 w-6 text-right">
                    {questionCount}
                  </span>
                </div>
              </div>

              {/* Domain Scope Selector */}
              <div className="space-y-1.5">
                <label htmlFor="domain-filter-select" className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 block">
                  AZ-900 Domain Scope:
                </label>
                <select
                  id="domain-filter-select"
                  aria-label="Domain Filter Selection"
                  value={selectedDomain ?? ''}
                  onChange={(e) => setSelectedDomain(e.target.value ? e.target.value : null)}
                  className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
                >
                  <option value="">All Domains (Complete AZ-900 Benchmark)</option>
                  <option value="DOM-CONCEPTS">Domain 1: Describe Cloud Concepts (25–30%)</option>
                  <option value="DOM-SERVICES">Domain 2: Describe Azure Architecture & Services (35–40%)</option>
                  <option value="DOM-SECURITY">Domain 3: Describe Azure Management & Governance (30–35%)</option>
                </select>
              </div>

              <Button
                onClick={handleStart}
                isLoading={isStartingQuiz}
                disabled={isStartingQuiz}
                className="w-full flex items-center justify-center gap-2 mt-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Start New Diagnostic Session (AZ-900 • {questionCount} Questions)</span>
              </Button>

              <Button
                variant="outline"
                onClick={handleExport}
                className="w-full flex items-center justify-center gap-2 text-xs"
              >
                <Download className="w-4 h-4" />
                <span>Export Candidate Data (GDPR Portability)</span>
              </Button>
            </Card>
          </div>

          {/* Domain Proficiency & History */}
          <div className="md:col-span-7 space-y-6">
            <Card className="space-y-4">
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  AZ-900 Domain Mastery
                </h2>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  {totalAttempts} attempts evaluated
                </span>
              </div>

              {totalAttempts === 0 ? (
                <div className="text-center py-8 space-y-2 text-slate-500 dark:text-slate-400">
                  <p className="text-xs">No AZ-900 diagnostic sessions completed yet.</p>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    Start a 10–50 question diagnostic session to benchmark your readiness across core AZ-900 domains.
                  </p>
                </div>
              ) : (
                <DomainBreakdownChart breakdown={domainBreakdown} />
              )}
            </Card>

            {/* Candidate Privacy & Account Governance */}
            <Card className="border-rose-200 dark:border-rose-950/40 bg-rose-50/40 dark:bg-slate-900/40 space-y-3">
              <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                <Shield className="w-4 h-4" />
                <h3 className="text-xs font-bold uppercase tracking-wider">
                  Candidate Data Privacy & Account Governance
                </h3>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-relaxed">
                In compliance with GDPR and CCPA, you have the right to permanent erasure of your test sessions, scoring records, and account profile.
              </p>
              <Button
                size="sm"
                variant="danger"
                isLoading={isDeleting}
                disabled={isDeleting}
                onClick={() => setIsPurgeModalOpen(true)}
                className="flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Request Account & Data Purge</span>
              </Button>
            </Card>
          </div>
        </div>
      </main>

      {/* Real In-App Account Purge Confirmation Modal */}
      <Modal
        isOpen={isPurgeModalOpen}
        onClose={() => setIsPurgeModalOpen(false)}
        title="Confirm Irreversible Account Deletion"
      >
        <div className="space-y-4 font-mono">
          <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
            Are you sure you want to permanently delete your candidate account (<strong>{userEmail}</strong>)?
          </p>
          <div className="p-3 bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-900/60 rounded-lg text-rose-900 dark:text-rose-300 text-xs">
            This action will cascade-delete all your historical quiz sessions, readiness calculations, and stored attempts. This action cannot be undone.
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPurgeModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              isLoading={isDeleting}
              onClick={() => {
                setIsPurgeModalOpen(false);
                onDeleteAccount();
              }}
            >
              Permanently Purge Data
            </Button>
          </div>
        </div>
      </Modal>

      <Disclaimer />
    </div>
  );
};
