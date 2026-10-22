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
  Building2,
  BookOpen,
} from 'lucide-react';
import {
  getQuickQuizHistory,
  computeQuickQuizStats,
  clearQuickQuizHistory,
  QuickQuizRecord,
} from '../../../domain/quiz/quickQuizGenerator.ts';
import {
  PRESET_SCENARIO_QUIZZES,
  PresetQuiz,
} from '../../../domain/quiz/presetQuizzes.ts';

export interface QuickQuizSectionProps {
  readonly onStartQuickQuiz: (config: {
    totalQuestions: number;
    domainId: string | null;
    isTimed?: boolean;
    timeLimitMinutes?: number;
    examMode?: 'timed_exam' | 'practice';
  }) => void;
  readonly isStarting: boolean;
  readonly activeSection?: 'all' | 'quick' | 'scenarios' | 'analytics';
}

export const QuickQuizSection: React.FC<QuickQuizSectionProps> = ({
  onStartQuickQuiz,
  isStarting,
  activeSection = 'all',
}) => {
  const [history, setHistory] = useState<QuickQuizRecord[]>([]);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [questionCount, setQuestionCount] = useState<number>(50);
  const [isTimed, setIsTimed] = useState<boolean>(false);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number>(45);
  const [showHistoryModal, setShowHistoryModal] = useState<boolean>(false);
  const [selectedScenarioCategory, setSelectedScenarioCategory] = useState<string>('all');

  const filteredPresetQuizzes = PRESET_SCENARIO_QUIZZES.filter((quiz) => {
    if (selectedScenarioCategory === 'all') return true;
    return quiz.domainId === selectedScenarioCategory;
  });

  useEffect(() => {
    setHistory(getQuickQuizHistory());
  }, []);

  // Adjust default time limit when question count changes
  useEffect(() => {
    if (questionCount === 50) setTimeLimitMinutes(45);
    else if (questionCount === 30) setTimeLimitMinutes(30);
    else if (questionCount === 25) setTimeLimitMinutes(25);
    else if (questionCount === 15) setTimeLimitMinutes(15);
  }, [questionCount]);

  const stats = computeQuickQuizStats(history);

  const handleLaunch = () => {
    if (isTimed) {
      onStartQuickQuiz({
        totalQuestions: questionCount,
        domainId: selectedDomain,
        isTimed: true,
        timeLimitMinutes,
        examMode: 'timed_exam',
      });
    } else {
      onStartQuickQuiz({
        totalQuestions: questionCount,
        domainId: selectedDomain,
      });
    }
  };

  const handleClearHistory = () => {
    if (window.confirm('Are you sure you want to clear your Quick Quiz progress history?')) {
      clearQuickQuizHistory();
      setHistory([]);
    }
  };

  return (
    <div className="space-y-6 font-sans">
      {/* Hero Quick Quiz Launch Card */}
      {(activeSection === 'all' || activeSection === 'quick') && (
        <Card className="relative overflow-hidden border-slate-200/90 dark:border-slate-800 bg-white dark:bg-slate-900/90 p-5 sm:p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200/80 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-sky-600 text-white rounded-xl shadow-xs">
              <Zap className="w-5 h-5 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm sm:text-base font-bold font-display text-slate-900 dark:text-white uppercase tracking-wider">
                  AZ-900 Quick Quiz
                </h2>
                <Badge variant="info">50 QUESTIONS</Badge>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
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
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider font-mono">
              1. Select Domain Focus:
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
              {selectedDomain ? 'Custom Domain Focus' : 'All 3 Syllabus Domains Balanced'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 text-xs">
            <button
              type="button"
              onClick={() => setSelectedDomain(null)}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedDomain === null
                  ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-500 text-sky-900 dark:text-sky-200 ring-1 ring-sky-500 font-bold'
                  : 'bg-slate-50/70 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-0.5 font-display">
                <Layers className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
                <span>Full Exam Mix</span>
              </div>
              <p className="text-[10px] opacity-80 font-sans">Balanced AZ-900 Syllabus</p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDomain('DOM-CONCEPTS')}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedDomain === 'DOM-CONCEPTS'
                  ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-500 text-sky-900 dark:text-sky-200 ring-1 ring-sky-500 font-bold'
                  : 'bg-slate-50/70 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-0.5 font-display">
                <span className="text-xs">☁️</span>
                <span>Cloud Concepts</span>
              </div>
              <p className="text-[10px] opacity-80 font-sans">Shared responsibility, benefits</p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDomain('DOM-SECURITY')}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedDomain === 'DOM-SECURITY'
                  ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-500 text-sky-900 dark:text-sky-200 ring-1 ring-sky-500 font-bold'
                  : 'bg-slate-50/70 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-0.5 font-display">
                <Shield className="w-3.5 h-3.5 text-rose-500" />
                <span>Security & Identity</span>
              </div>
              <p className="text-[10px] opacity-80 font-sans">Entra ID, RBAC, Defender</p>
            </button>

            <button
              type="button"
              onClick={() => setSelectedDomain('DOM-SERVICES')}
              className={`p-3 rounded-lg border text-left transition-all ${
                selectedDomain === 'DOM-SERVICES'
                  ? 'bg-sky-50 dark:bg-sky-950/50 border-sky-500 text-sky-900 dark:text-sky-200 ring-1 ring-sky-500 font-bold'
                  : 'bg-slate-50/70 dark:bg-slate-950/70 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold mb-0.5 font-display">
                <Coins className="w-3.5 h-3.5 text-emerald-500" />
                <span>Azure Architecture</span>
              </div>
              <p className="text-[10px] opacity-80 font-sans">VMs, VNet, Storage, Pricing</p>
            </button>
          </div>

          {/* Question Count & Exam Mode Controls */}
          <div className="pt-2 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              {/* Question Count Selection */}
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300 font-mono">
                  2. Question Count:
                </span>
                {[50, 30, 25, 15].map((cnt) => (
                  <button
                    key={cnt}
                    type="button"
                    onClick={() => setQuestionCount(cnt)}
                    className={`px-3 py-1 rounded text-xs font-semibold transition-all ${
                      questionCount === cnt
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                    }`}
                  >
                    {cnt} Questions {cnt === 50 && '⭐ (Official)'}
                  </button>
                ))}
              </div>

              {/* Mode Toggle (Timed Exam vs Practice) */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
                <button
                  type="button"
                  onClick={() => setIsTimed(true)}
                  className={`px-3 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                    isTimed
                      ? 'bg-rose-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Clock className="w-3.5 h-3.5" />
                  <span>Timed Exam Mode</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsTimed(false)}
                  className={`px-3 py-1 rounded text-[11px] font-semibold flex items-center gap-1.5 transition-all ${
                    !isTimed
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                  }`}
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Practice Mode</span>
                </button>
              </div>
            </div>

            {/* Timed Exam Parameter Strip */}
            {isTimed && (
              <div className="flex flex-wrap items-center justify-between gap-3 p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800 text-xs font-mono">
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-slate-700 dark:text-slate-300">
                    3. Countdown Time Limit:
                  </span>
                  {[15, 25, 30, 45, 60].map((mins) => (
                    <button
                      key={mins}
                      type="button"
                      onClick={() => setTimeLimitMinutes(mins)}
                      className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition-all ${
                        timeLimitMinutes === mins
                          ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-950 shadow-sm'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                      }`}
                    >
                      {mins}m
                    </button>
                  ))}
                </div>

                <div className="text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
                  Pacing budget: ~{Math.round((timeLimitMinutes * 60) / questionCount)}s per question
                </div>
              </div>
            )}

            {/* Launch CTA */}
            <div className="flex justify-end pt-1">
              <Button
                onClick={handleLaunch}
                isLoading={isStarting}
                disabled={isStarting}
                className="flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold shadow-sm"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Launch {questionCount}-Question Quick Quiz</span>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </Card>
      )}

      {/* =========================================================================
          THEMED SCENARIO-BASED PRACTICE QUIZZES (10 QUIZZES AVAILABLE)
          ========================================================================= */}
      {(activeSection === 'all' || activeSection === 'scenarios') && (
        <div className="space-y-4 font-sans">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/60 rounded-md text-sky-700 dark:text-sky-300">
                <Building2 className="w-4 h-4" />
              </div>
              <h3 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Themed Architectural Scenario Quizzes (10 Quizzes Available)
              </h3>
              <Badge variant="neutral" className="text-[10px]">10 PRESETS</Badge>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Real-world enterprise case studies with realistic architectural trade-offs, constraints, and countdown pacing budgets.
            </p>
          </div>

          {/* Domain Filter Buttons */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-950 rounded-lg border border-slate-200 dark:border-slate-800 text-xs">
            {[
              { id: 'all', label: 'All 10 Quizzes' },
              { id: 'DOM-CONCEPTS', label: 'Cloud Concepts' },
              { id: 'DOM-SERVICES', label: 'Architecture' },
              { id: 'DOM-SECURITY', label: 'Security & Pricing' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedScenarioCategory(tab.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold transition-all ${
                  selectedScenarioCategory === tab.id
                    ? 'bg-sky-600 text-white shadow-sm'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* 10 Scenario Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredPresetQuizzes.map((quiz, index) => (
            <Card
              key={quiz.id}
              className="p-4 sm:p-5 flex flex-col justify-between border-slate-200/90 dark:border-slate-800/90 hover:border-sky-500/50 bg-white dark:bg-slate-900/80 transition-all shadow-sm space-y-3"
            >
              <div className="space-y-3">
                {/* Header: Enterprise & Difficulty */}
                <div className="flex items-start justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-700 dark:text-sky-300 block">
                      Case Study: {quiz.scenarioEnterprise}
                    </span>
                    <h4 className="font-display text-sm sm:text-base font-bold text-slate-900 dark:text-white leading-snug">
                      {quiz.title}
                    </h4>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {quiz.subtitle}
                    </span>
                  </div>

                  <Badge
                    variant={
                      quiz.difficulty === 'Foundational'
                        ? 'neutral'
                        : quiz.difficulty === 'Intermediate'
                        ? 'info'
                        : 'warning'
                    }
                    className="shrink-0 text-[10px]"
                  >
                    {quiz.difficulty}
                  </Badge>
                </div>

                {/* Scenario Context Narrative */}
                <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-950/60 p-2.5 rounded-lg border border-slate-200/60 dark:border-slate-800/60">
                  {quiz.scenarioContext}
                </p>

                {/* Pacing & Scope Unboxed Metadata */}
                <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-slate-600 dark:text-slate-400">
                  <span className="font-bold text-slate-900 dark:text-white font-mono tabular-nums">
                    {quiz.questionCount} Questions
                  </span>
                  <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums flex items-center gap-1">
                    <Clock className="w-3 h-3 inline text-slate-400" />
                    {quiz.timeLimitMinutes} min countdown
                  </span>
                  <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                  <span className="text-sky-700 dark:text-sky-300 font-semibold">
                    {quiz.domainTitle}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                    ~{Math.round((quiz.timeLimitMinutes * 60) / quiz.questionCount)}s / Q
                  </span>
                </div>

                {/* Key Syllabus Themes Covered */}
                <div className="text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800/70 pt-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">Key Themes: </span>
                  <span>{quiz.keyThemes.join(' · ')}</span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-[10px] text-slate-400 font-mono">
                  Preset #{index + 1}
                </span>

                <Button
                  size="sm"
                  onClick={() =>
                    onStartQuickQuiz({
                      totalQuestions: quiz.questionCount,
                      domainId: quiz.domainId,
                      isTimed: true,
                      timeLimitMinutes: quiz.timeLimitMinutes,
                      examMode: 'timed_exam',
                    })
                  }
                  disabled={isStarting}
                  className="text-xs font-semibold flex items-center gap-1.5 shadow-sm"
                >
                  <Zap className="w-3.5 h-3.5 fill-current" />
                  <span>Launch Scenario Quiz {index + 1}</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>
      )}

      {/* Progress & Analytics Tracker Card */}
      {(activeSection === 'all' || activeSection === 'quick' || activeSection === 'analytics') && (
        <Card className="space-y-4 font-sans">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 dark:border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-sky-700 dark:text-sky-300" />
            <h3 className="font-display text-xs sm:text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
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
          <div className="bg-slate-50 dark:bg-slate-950/70 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">
              COMPLETED SESSIONS
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
              {stats.totalCompleted}
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              {stats.totalQuestionsAnswered} total Qs
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/70 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">
              BEST SCORE
            </span>
            <span className={`text-xl font-bold font-mono tabular-nums ${stats.bestScore >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-white'}`}>
              {stats.bestScore > 0 ? `${stats.bestScore}%` : '—'}
            </span>
            <span className="text-[10px] text-slate-400 block font-mono">
              AZ-900 Cutoff: 70%
            </span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/70 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">
              AVERAGE SCORE
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-sky-700 dark:text-sky-300">
              {stats.averageScore > 0 ? `${stats.averageScore}%` : '—'}
            </span>
            <span className="text-[10px] text-slate-400 block">Across all quizzes</span>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/70 p-3 rounded-lg border border-slate-200/80 dark:border-slate-800/80">
            <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-semibold uppercase tracking-wider">
              EXAM BENCHMARK
            </span>
            <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
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
                    <span className={`font-bold font-mono tabular-nums ${dom.accuracy >= 70 ? 'text-emerald-600 dark:text-emerald-400' : dom.accuracy >= 50 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-500'}`}>
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
                        : 'bg-sky-600'
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
                    <span className="text-[10px] text-slate-400 block font-mono">
                      {rec.date} • {rec.correctCount} / {rec.totalQuestions} correct
                      {typeof rec.timeTakenSeconds === 'number' && rec.timeTakenSeconds > 0 && (
                        <> • {Math.floor(rec.timeTakenSeconds / 60)}m {rec.timeTakenSeconds % 60}s</>
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className={`text-sm font-bold font-mono tabular-nums ${rec.score >= 70 ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-500 dark:text-rose-400'}`}>
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
      )}
    </div>
  );
};
