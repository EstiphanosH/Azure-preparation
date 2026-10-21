/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { Card } from '../../components/Card.tsx';
import { Button } from '../../components/Button.tsx';
import { Badge } from '../../components/Badge.tsx';
import {
  Zap,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  TrendingUp,
  Award,
  Layers,
  Shield,
  Coins,
  ChevronRight,
  Clock,
  History,
  Trash2,
} from 'lucide-react';
import {
  getQuickQuizHistory,
  computeQuickQuizStats,
  clearQuickQuizHistory,
  QuickQuizRecord,
} from '../../../domain/quiz/quickQuizGenerator.ts';

export interface QuickQuizSectionProps {
  readonly onStartQuickQuiz: (config: { totalQuestions: number; domainId: string | null }) => void;
  readonly isStarting: boolean;
}

export const QuickQuizSection: React.FC<QuickQuizSectionProps> = ({
  onStartQuickQuiz,
  isStarting,
}) => {
  const [history, setHistory] = useState<QuickQuizRecord[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(50);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);

  useEffect(() => {
    setHistory(getQuickQuizHistory());
  }, []);

  const stats = computeQuickQuizStats(history);

  const handleLaunch = () => {
    onStartQuickQuiz({
      totalQuestions: questionCount,
      domainId: selectedDomain,
    });
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your Quick Quiz progress history?')) {
      clearQuickQuizHistory();
      setHistory([]);
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Quick Quiz Launch Card */}
      <Card className="relative overflow-hidden border-cyan-500/30 bg-gradient-to-br from-cyan-950/20 via-slate-900/60 to-blue-950/20 p-5 sm:p-6 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/60 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-cyan-500 text-slate-950 rounded-xl shadow-lg shadow-cyan-500/20">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white uppercase tracking-wider font-mono">
                  AZ-900 Quick Quiz
                </h2>
                <Badge variant="info">50 QUESTIONS</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-0.5">
                Generate a rapid benchmark across Cloud Concepts, Security & Identity, and Azure Pricing.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="neutral" className="text-[11px] font-mono">
              <Clock className="w-3 h-3 mr-1 inline" /> ~45 min target
            </Badge>
          </div>
        </div>

        {/* Domain Scope Selector Tabs */}
        <div className="mt-4 space-y-3 font-mono">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider">
              1. Select Domain Focus:
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {selectedDomain ? 'Custom Domain Focus' : 'All 3 Syllabus Domains Balanced'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setSelectedDomain(null)}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                selectedDomain === null
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-700 dark:text-cyan-300 ring-1 ring-cyan-500 font-bold'
                  : 'bg-white/60 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-0.5">
                <Layers className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
                <span>Full Exam Mix</span>
              </div>
              <p className="text-[10px] opacity-80">Balanced AZ-900 Syllabus</p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDomain('DOM-CONCEPTS')}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                selectedDomain === 'DOM-CONCEPTS'
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-700 dark:text-cyan-300 ring-1 ring-cyan-500 font-bold'
                  : 'bg-white/60 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-0.5">
                <span className="text-xs">☁️</span>
                <span>Cloud Concepts</span>
              </div>
              <p className="text-[10px] opacity-80">Shared responsibility, benefits</p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDomain('DOM-SECURITY')}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                selectedDomain === 'DOM-SECURITY'
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-700 dark:text-cyan-300 ring-1 ring-cyan-500 font-bold'
                  : 'bg-white/60 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-0.5">
                <Shield className="w-3.5 h-3.5 text-rose-500" />
                <span>Security & Identity</span>
              </div>
              <p className="text-[10px] opacity-80">Entra ID, RBAC, Defender</p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDomain('DOM-SERVICES')}
              className={`p-2.5 rounded-lg border text-left transition-all ${
                selectedDomain === 'DOM-SERVICES'
                  ? 'bg-cyan-500/20 border-cyan-500 text-cyan-700 dark:text-cyan-300 ring-1 ring-cyan-500 font-bold'
                  : 'bg-white/60 dark:bg-slate-950/60 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-0.5">
                <Coins className="w-3.5 h-3.5 text-emerald-500" />
                <span>Azure Architecture</span>
              </div>
              <p className="text-[10px] opacity-80">VMs, VNet, Storage, Pricing</p>
            </button>
          </div>

          {/* Question Count Selection */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                2. Question Count:
              </span>
              {[50, 25, 15].map((cnt) => (
                <button
                  key={cnt}
                  type="button"
                  onClick={() => setQuestionCount(cnt)}
                  className={`px-3 py-1 rounded text-xs font-bold transition-all ${
                    questionCount === cnt
                      ? 'bg-cyan-500 text-slate-950 shadow-sm'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                  }`}
                >
                  {cnt} Questions {cnt === 50 && '⭐ (Official)'}
                </button>
              ))}
            </div>

            {/* Launch CTA */}
            <Button
              onClick={handleLaunch}
              isLoading={isStarting}
              disabled={isStarting}
              className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold shadow-lg shadow-cyan-500/20"
            >
              <Zap className="w-4 h-4 fill-current" />
              <span>Launch {questionCount}-Question Quick Quiz</span>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>

      {/* Progress & Analytics Tracker Card */}
      <Card className="space-y-4 font-mono">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-cyan-600 dark:text-cyan-400" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Quick Quiz Progress & Analytics Tracker
            </h3>
          </div>

          <div className="flex items-center gap-2">
            {stats.totalCompleted > 0 && (
              <Badge
                variant={
                  stats.readinessStatus === 'EXAM_READY'
                    ? 'success'
                    : stats.readinessStatus === 'PROGRESSING'
                    ? 'warning'
                    : 'danger'
                }
              >
                {stats.readinessStatus === 'EXAM_READY'
                  ? 'AZ-900 EXAM READY (≥70%)'
                  : stats.readinessStatus === 'PROGRESSING'
                  ? 'IN PROGRESS (50–69%)'
                  : 'PRACTICE REQUIRED (<50%)'}
              </Badge>
            )}

            {history.length > 0 && (
              <button
                type="button"
                onClick={handleClearHistory}
                title="Reset Quick Quiz History"
                className="text-slate-400 hover:text-rose-500 transition-colors p-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* 4 Key Stat Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">
              COMPLETED SESSIONS
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              {stats.totalCompleted}
            </span>
            <span className="text-[10px] text-slate-400 block">
              {stats.totalQuestionsAnswered} total Qs
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">
              BEST SCORE
            </span>
            <span className={`text-lg font-bold ${stats.bestScore >= 70 ? 'text-emerald-500' : 'text-slate-900 dark:text-white'}`}>
              {stats.bestScore > 0 ? `${stats.bestScore}%` : '—'}
            </span>
            <span className="text-[10px] text-slate-400 block">
              AZ-900 Cutoff: 70%
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">
              AVERAGE SCORE
            </span>
            <span className="text-lg font-bold text-cyan-600 dark:text-cyan-400">
              {stats.averageScore > 0 ? `${stats.averageScore}%` : '—'}
            </span>
            <span className="text-[10px] text-slate-400 block">Across all quizzes</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold">
              EXAM BENCHMARK
            </span>
            <span className="text-lg font-bold text-slate-900 dark:text-white">
              700 / 1000
            </span>
            <span className="text-[10px] text-slate-400 block">Standard passing scale</span>
          </div>
        </div>

        {/* Domain-Level Mastery Breakdown */}
        <div className="space-y-2 pt-2">
          <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 block uppercase tracking-wider">
            Domain Accuracy Breakdown (Cloud Concepts, Security, Azure Pricing)
          </span>

          <div className="space-y-2.5">
            {stats.domainAverages.map((dom) => (
              <div key={dom.domainId} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 font-semibold text-slate-800 dark:text-slate-200">
                    <span>{dom.icon}</span>
                    <span>{dom.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] text-slate-500 dark:text-slate-400">
                      {dom.totalAnswered > 0 ? `${dom.totalAnswered} Qs evaluated` : 'No attempts yet'}
                    </span>
                    <span className={`font-bold ${dom.accuracy >= 70 ? 'text-emerald-500' : dom.accuracy >= 50 ? 'text-amber-500' : 'text-slate-500'}`}>
                      {dom.totalAnswered > 0 ? `${dom.accuracy}%` : '0%'}
                    </span>
                  </div>
                </div>

                <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                  <div
                    style={{ width: `${dom.accuracy}%` }}
                    className={`h-full transition-all duration-500 ${
                      dom.accuracy >= 70
                        ? 'bg-emerald-500'
                        : dom.accuracy >= 50
                        ? 'bg-amber-500'
                        : 'bg-cyan-500'
                    }`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Quick Quiz Session History */}
        {history.length > 0 && (
          <div className="pt-3 border-t border-slate-200 dark:border-slate-800 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <History className="w-3.5 h-3.5" />
                <span>Recent Quick Quiz Attempts ({history.length})</span>
              </span>
            </div>

            <div className="divide-y divide-slate-200 dark:divide-slate-800 border border-slate-200 dark:border-slate-800 rounded-lg overflow-hidden max-h-48 overflow-y-auto text-xs">
              {history.slice(0, 5).map((rec, idx) => (
                <div
                  key={`${rec.sessionId}-${idx}`}
                  className="p-2.5 flex items-center justify-between bg-white dark:bg-slate-950/40 hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 dark:text-white">
                        {rec.totalQuestions} Questions Quiz
                      </span>
                      <Badge variant={rec.score >= 70 ? 'success' : 'danger'}>
                        {rec.score >= 70 ? 'PASS' : 'REVIEW'}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-slate-400 block">
                      {rec.date} • {rec.correctCount} / {rec.totalQuestions} correct
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold ${rec.score >= 70 ? 'text-emerald-500' : 'text-rose-400'}`}>
                      {rec.score}%
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onStartQuickQuiz({ totalQuestions: rec.totalQuestions, domainId: null })}
                      className="text-[10px] py-1 px-2"
                    >
                      <RotateCcw className="w-3 h-3 mr-1 inline" /> Retake
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};
