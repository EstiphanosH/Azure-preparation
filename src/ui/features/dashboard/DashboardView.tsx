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
import { FlashcardViewer } from '../flashcards/FlashcardViewer.tsx';
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
  BookOpen,
  TrendingUp,
  Clock,
  Building2,
  Menu,
  X,
} from 'lucide-react';

export interface DashboardViewProps {
  userEmail: string;
  username: string;
  overallScore: number;
  evaluationGrade: 'READY' | 'REVIEW_REQUIRED' | 'NOT_READY';
  domainBreakdown: readonly DomainScoreItem[];
  totalAttempts: number;
  onStartQuiz: (config?: {
    totalQuestions?: number;
    domainId?: string | null;
    isTimed?: boolean;
    timeLimitMinutes?: number;
    examMode?: 'timed_exam' | 'practice';
  }) => void;
  onExportData: () => void;
  onDeleteAccount: () => void;
  onLogout: () => void;
  isLoading: boolean;
  isStartingQuiz: boolean;
  isDeleting: boolean;
  errorMessage: string | null;
}

export type DashboardTab =
  | 'simulator'
  | 'scenarios'
  | 'flashcards'
  | 'readiness'
  | 'custom'
  | 'governance';

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
  const [activeTab, setActiveTab] = useState<DashboardTab>('simulator');
  const [questionCount, setQuestionCount] = useState<number>(50);
  const [selectedDomain, setSelectedDomain] = useState<string | null>(null);
  const [isCustomTimed, setIsCustomTimed] = useState<boolean>(false);
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const QUESTION_OPTIONS = [10, 15, 20, 25, 30, 40, 50] as const;

  const handleStart = () => {
    const validatedCount = Math.min(80, Math.max(10, questionCount));
    onStartQuiz({
      totalQuestions: validatedCount,
      domainId: selectedDomain,
      isTimed: isCustomTimed,
      timeLimitMinutes: isCustomTimed ? Math.max(15, Math.round(validatedCount * 0.9)) : undefined,
      examMode: isCustomTimed ? 'timed_exam' : 'practice',
    });
  };

  const handleExport = () => {
    onExportData();
    setExportNotice('Candidate data package exported to download queue (JSON schema validated).');
    setTimeout(() => setExportNotice(null), 4000);
  };

  const navItems = [
    {
      id: 'simulator' as const,
      label: 'Practice Simulator',
      description: 'Benchmark & Quick Quizzes',
      icon: Zap,
      badge: '50-Q',
    },
    {
      id: 'scenarios' as const,
      label: 'Scenario Quizzes',
      description: '10 Enterprise Case Studies',
      icon: Building2,
      badge: '10 Presets',
    },
    {
      id: 'flashcards' as const,
      label: 'Interactive Flashcards',
      description: 'Active Recall Study Deck',
      icon: BookOpen,
      badge: '40 Cards',
    },
    {
      id: 'readiness' as const,
      label: 'Readiness & Analytics',
      description: 'Scores & Domain Mastery',
      icon: TrendingUp,
      badge: overallScore > 0 ? `${overallScore}%` : undefined,
    },
    {
      id: 'custom' as const,
      label: 'Custom Assessment',
      description: 'Tailored Question Parameters',
      icon: Sliders,
    },
    {
      id: 'governance' as const,
      label: 'Data & Privacy',
      description: 'GDPR Export & Account Purge',
      icon: Shield,
    },
  ];

  const activeItem = navItems.find((item) => item.id === activeTab) || navItems[0]!;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col justify-between font-sans antialiased transition-colors">
        <main className="flex-1 flex items-center justify-center p-6">
          <div role="status" aria-live="polite" className="text-center space-y-3">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-sky-600 mx-auto" />
            <p className="text-xs text-slate-600 dark:text-slate-400">Loading candidate profile and diagnostic history...</p>
          </div>
        </main>
        <Disclaimer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 flex flex-col font-sans antialiased transition-colors">
      {/* Mobile Top Navigation Bar */}
      <header className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur px-4 py-3 sticky top-0 z-30 transition-colors flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(true)}
            aria-label="Open navigation sidebar"
            aria-expanded={isMobileSidebarOpen}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <Menu className="w-5 h-5 text-slate-700 dark:text-slate-200" />
          </button>
          <div>
            <span className="font-display font-bold text-sm text-slate-900 dark:text-white block leading-tight">
              AZ-900 Studio
            </span>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {activeItem.label}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button size="sm" variant="outline" onClick={onLogout} aria-label="Logout" className="text-xs py-1.5 px-2.5">
            <LogOut className="w-3.5 h-3.5" />
          </Button>
        </div>
      </header>

      {/* Main Workspace Frame with Sidebar */}
      <div className="flex-1 flex w-full">
        {/* Mobile Sidebar Backdrop Overlay */}
        {isMobileSidebarOpen && (
          <div
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-40 lg:hidden transition-opacity"
            onClick={() => setIsMobileSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Sidebar (Desktop Persistent, Mobile Off-Canvas Drawer) */}
        <aside
          aria-label="Candidate Navigation Sidebar"
          className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-slate-900 border-r border-slate-200/90 dark:border-slate-800/90 flex flex-col justify-between transition-transform duration-200 ease-in-out lg:static lg:translate-x-0 ${
            isMobileSidebarOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0'
          }`}
        >
          <div className="p-4 sm:p-5 space-y-6">
            {/* Sidebar Brand Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200/80 dark:border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-sky-600 text-white rounded-xl shadow-xs">
                  <Activity className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="font-display font-bold text-sm tracking-tight text-slate-900 dark:text-white">
                    AZ-900 CANDIDATE DASHBOARD
                  </h1>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block">
                    Azure Certification Suite
                  </span>
                </div>
              </div>

              {/* Mobile Close Button */}
              <button
                type="button"
                onClick={() => setIsMobileSidebarOpen(false)}
                aria-label="Close navigation sidebar"
                className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Navigation Links List */}
            <nav className="space-y-1">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block px-2.5 pb-1">
                Workspace Navigation
              </span>
              {navItems.map((item) => {
                const IconComponent = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs transition-all ${
                      isActive
                        ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border border-sky-200/90 dark:border-sky-800/80 font-semibold shadow-xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-800/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <IconComponent
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400 dark:text-slate-500'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge && (
                      <span
                        className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold shrink-0 ${
                          isActive
                            ? 'bg-sky-200/80 dark:bg-sky-800/80 text-sky-900 dark:text-sky-200'
                            : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Sidebar Exam Readiness Widget */}
            <div className="p-3.5 bg-slate-50 dark:bg-slate-950/60 border border-slate-200/80 dark:border-slate-800/80 rounded-xl space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Readiness Status
                </span>
                <span className="text-[10px] font-mono tabular-nums text-slate-400">
                  Cutoff: 70%
                </span>
              </div>

              <div className="flex items-baseline justify-between">
                <span className="text-xl font-bold font-mono tabular-nums text-slate-900 dark:text-white">
                  {overallScore > 0 ? `${overallScore}%` : '—'}
                </span>
                <Badge
                  variant={
                    evaluationGrade === 'READY'
                      ? 'success'
                      : evaluationGrade === 'REVIEW_REQUIRED'
                      ? 'warning'
                      : 'danger'
                  }
                  className="text-[9px]"
                >
                  {evaluationGrade === 'READY'
                    ? 'EXAM READY'
                    : evaluationGrade === 'REVIEW_REQUIRED'
                    ? 'IN PROGRESS'
                    : 'PRACTICE REQ'}
                </Badge>
              </div>

              <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  style={{ width: `${Math.min(100, Math.max(0, overallScore))}%` }}
                  className={`h-full transition-all duration-500 ${
                    overallScore >= 70
                      ? 'bg-emerald-500'
                      : overallScore >= 50
                      ? 'bg-amber-500'
                      : 'bg-sky-600'
                  }`}
                />
              </div>

              <span className="text-[10px] text-slate-500 dark:text-slate-400 block font-mono">
                {totalAttempts} diagnostic sessions evaluated
              </span>
            </div>
          </div>

          {/* Sidebar Candidate Profile & Account Actions Footer */}
          <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5 truncate">
                <div className="w-8 h-8 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs uppercase shrink-0 shadow-xs">
                  {username ? username.charAt(0) : 'C'}
                </div>
                <div className="truncate text-xs">
                  <span className="font-semibold text-slate-900 dark:text-white block truncate">
                    {username}
                  </span>
                  <span className="text-[10px] text-slate-400 font-mono block truncate">
                    {userEmail}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <ThemeToggle />
                <button
                  type="button"
                  onClick={onLogout}
                  title="Logout from Candidate Profile"
                  aria-label="Logout"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Workspace Canvas */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Desktop Clean Breadcrumbs Header */}
          <header className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-900/80 backdrop-blur sticky top-0 z-20">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <span className="font-medium">AZ-900 Studio</span>
              <span aria-hidden="true">/</span>
              <span className="font-bold font-display text-slate-900 dark:text-white">
                {activeItem.label}
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Candidate: <strong className="text-slate-800 dark:text-slate-200">{username}</strong>
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={onLogout}
                className="flex items-center gap-1.5 text-xs py-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Logout</span>
              </Button>
            </div>
          </header>

          {/* Clean Viewport Content */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-5xl w-full mx-auto space-y-6">
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

            {/* TAB 1: PRACTICE SIMULATOR (BENCHMARKS & QUICK QUIZZES) */}
            {activeTab === 'simulator' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                      Candidate Practice Simulator
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Launch 50-question full diagnostic benchmark exams or 30-question focused sprints.
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => onStartQuiz({ totalQuestions: 50, domainId: null })}
                      isLoading={isStartingQuiz}
                      disabled={isStartingQuiz}
                      className="text-xs flex items-center gap-1.5 shadow-sm"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start New Diagnostic Session</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setActiveTab('custom')}
                      className="text-xs flex items-center gap-1.5"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Custom Parameters</span>
                    </Button>
                  </div>
                </div>

                <QuickQuizSection
                  onStartQuickQuiz={(config) => onStartQuiz(config)}
                  isStarting={isStartingQuiz}
                  activeSection="quick"
                />
              </div>
            )}

            {/* TAB 2: SCENARIO QUIZZES (10 ARCHITECTURAL CASE STUDIES) */}
            {activeTab === 'scenarios' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                      Architectural Scenario Case Studies
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      10 real-world enterprise architectures with realistic SLAs, budget constraints, and countdown pacing.
                    </p>
                  </div>
                </div>

                <QuickQuizSection
                  onStartQuickQuiz={(config) => onStartQuiz(config)}
                  isStarting={isStartingQuiz}
                  activeSection="scenarios"
                />
              </div>
            )}

            {/* TAB 3: FLASHCARDS (40 HIGH-YIELD CARDS) */}
            {activeTab === 'flashcards' && (
              <div className="space-y-6">
                <FlashcardViewer
                  onStartQuizWithDomain={(dom) =>
                    onStartQuiz({
                      totalQuestions: 15,
                      domainId: dom,
                      isTimed: false,
                      examMode: 'practice',
                    })
                  }
                />
              </div>
            )}

            {/* TAB 4: READINESS & DOMAIN MASTERY */}
            {activeTab === 'readiness' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                      Candidate Readiness & Domain Mastery
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Weighted mastery evaluation benchmarked against the standard AZ-900 700/1000 cutoff.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  <div className="md:col-span-5">
                    <ReadinessGauge score={overallScore} grade={evaluationGrade} />
                  </div>

                  <div className="md:col-span-7">
                    <Card className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                        <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          Full AZ-900 Domain Breakdown
                        </h3>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold font-mono">
                          Passing Cutoff: 70%
                        </span>
                      </div>

                      <DomainBreakdownChart breakdown={domainBreakdown} />
                    </Card>
                  </div>
                </div>

                {/* Historical Attempt Analytics */}
                <QuickQuizSection
                  onStartQuickQuiz={(config) => onStartQuiz(config)}
                  isStarting={isStartingQuiz}
                  activeSection="analytics"
                />
              </div>
            )}

            {/* TAB 5: CUSTOM ASSESSMENT */}
            {activeTab === 'custom' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                      Custom Diagnostic Assessment
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Configure custom question counts, domain constraints, and timed exam countdown conditions.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                  {/* Parameter Controls */}
                  <div className="md:col-span-6 space-y-6">
                    <Card className="space-y-5">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2.5">
                        <h3 className="font-display text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center gap-1.5">
                          <Sliders className="w-4 h-4 text-sky-700 dark:text-sky-300" />
                          <span>Session Parameters</span>
                        </h3>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold font-mono">
                          10–50 Questions
                        </span>
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
                                className={`px-2 py-1.5 rounded-lg border text-xs font-semibold font-mono transition-all focus:outline-none focus:ring-2 focus:ring-sky-500 ${
                                  isSelected
                                    ? 'bg-sky-600 border-sky-600 text-white shadow-sm'
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
                            className="flex-1 accent-sky-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-800 rounded-lg"
                          />
                          <span className="text-xs font-bold text-sky-700 dark:text-sky-300 font-mono tabular-nums w-6 text-right">
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
                          className="w-full px-3 py-2 rounded-lg bg-white dark:bg-slate-950 border border-slate-300 dark:border-slate-800 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                          <option value="">All Domains (Complete AZ-900 Benchmark)</option>
                          <option value="DOM-CONCEPTS">Domain 1: Describe Cloud Concepts (25–30%)</option>
                          <option value="DOM-SERVICES">Domain 2: Describe Azure Architecture & Services (35–40%)</option>
                          <option value="DOM-SECURITY">Domain 3: Describe Azure Management & Governance (30–35%)</option>
                        </select>
                      </div>

                      {/* Timed Mode Toggle */}
                      <div className="flex items-center justify-between p-2.5 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-sky-700 dark:text-sky-300" />
                          <div>
                            <span className="text-[11px] font-semibold text-slate-800 dark:text-slate-200 block">
                              Enable Timed Exam Mode
                            </span>
                            <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                              Countdown budget: ~{Math.round(questionCount * 0.9)} minutes
                            </span>
                          </div>
                        </div>
                        <input
                          type="checkbox"
                          aria-label="Enable Timed Exam Mode for custom quiz"
                          checked={isCustomTimed}
                          onChange={(e) => setIsCustomTimed(e.target.checked)}
                          className="accent-sky-600 h-4 w-4 rounded cursor-pointer"
                        />
                      </div>

                      <Button
                        onClick={handleStart}
                        isLoading={isStartingQuiz}
                        disabled={isStartingQuiz}
                        className="w-full flex items-center justify-center gap-2 mt-2"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>Start Diagnostic Session ({questionCount} Qs)</span>
                      </Button>
                    </Card>
                  </div>

                  {/* Domain Mastery Context */}
                  <div className="md:col-span-6 space-y-6">
                    <Card className="space-y-4">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                        <h3 className="font-display text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                          Current Proficiency Baseline
                        </h3>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
                          {totalAttempts} attempts
                        </span>
                      </div>

                      {totalAttempts === 0 ? (
                        <div className="text-center py-8 space-y-2 text-slate-500 dark:text-slate-400">
                          <p className="text-xs">No diagnostic sessions completed yet.</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">
                            Configure parameters on the left to begin your first diagnostic baseline session.
                          </p>
                        </div>
                      ) : (
                        <DomainBreakdownChart breakdown={domainBreakdown} />
                      )}
                    </Card>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 6: DATA & PRIVACY GOVERNANCE */}
            {activeTab === 'governance' && (
              <div className="space-y-6">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
                  <div>
                    <h2 className="font-display text-lg font-bold text-slate-900 dark:text-white tracking-tight">
                      Candidate Data Portability & Governance
                    </h2>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      Compliant GDPR and CCPA candidate data management, self-service portability, and irreversible erasure.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Data Export Card */}
                  <Card className="space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <Download className="w-5 h-5 text-sky-700 dark:text-sky-300" />
                        <h3 className="font-display text-sm font-bold text-slate-900 dark:text-white">
                          Candidate Data Portability (JSON)
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Export your full historical candidate records, complete assessment attempts, question scores, and domain accuracy metrics in standard machine-readable JSON format.
                      </p>
                      <div className="p-3 bg-slate-50 dark:bg-slate-950/60 rounded-lg border border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 space-y-1 font-mono">
                        <div>• Candidate Profile: {userEmail}</div>
                        <div>• Recorded Diagnostic Sessions: {totalAttempts}</div>
                        <div>• Evaluation Grade: {evaluationGrade}</div>
                      </div>
                    </div>

                    <Button
                      variant="outline"
                      onClick={handleExport}
                      className="w-full flex items-center justify-center gap-2 text-xs"
                    >
                      <Download className="w-4 h-4" />
                      <span>Export Candidate Data (GDPR JSON)</span>
                    </Button>
                  </Card>

                  {/* Account Deletion Card */}
                  <Card className="border-rose-200 dark:border-rose-950/60 bg-rose-50/30 dark:bg-slate-900/40 space-y-4 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-rose-700 dark:text-rose-400">
                        <Shield className="w-5 h-5" />
                        <h3 className="font-display text-sm font-bold">
                          Irreversible Account & Data Purge
                        </h3>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                        Under GDPR Article 17 ("Right to Erasure"), you can request permanent deletion of your credentials, session tokens, historical records, and readiness metrics.
                      </p>
                      <div className="p-3 bg-rose-50 dark:bg-rose-950/40 border border-rose-200/80 dark:border-rose-900/60 rounded-lg text-rose-800 dark:text-rose-300 text-[11px]">
                        Warning: This action permanently cascades across all test history and cannot be reversed.
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="danger"
                      isLoading={isDeleting}
                      disabled={isDeleting}
                      onClick={() => setIsPurgeModalOpen(true)}
                      className="w-full flex items-center justify-center gap-1.5"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Request Account & Data Purge</span>
                    </Button>
                  </Card>
                </div>
              </div>
            )}
          </main>

          <Disclaimer />
        </div>
      </div>

      {/* Real In-App Account Purge Confirmation Modal */}
      <Modal
        isOpen={isPurgeModalOpen}
        onClose={() => setIsPurgeModalOpen(false)}
        title="Confirm Irreversible Account Deletion"
      >
        <div className="space-y-4 font-sans">
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
    </div>
  );
};
