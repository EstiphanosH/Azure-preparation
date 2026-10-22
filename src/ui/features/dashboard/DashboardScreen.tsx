import React from 'react';
import { DashboardView } from './DashboardView.tsx';
import { useAuth } from '../../hooks/useAuth.ts';
import { useReadiness } from '../../hooks/useReadiness.ts';
import { useQuiz } from '../../hooks/useQuiz.ts';
import { useUserData } from '../../hooks/useUserData.ts';

export interface DashboardScreenProps {
  onStartSession: (
    sessionId: string,
    count?: number,
    timedConfig?: {
      isTimed?: boolean;
      timeLimitMinutes?: number;
      examMode?: 'timed_exam' | 'practice';
    }
  ) => void;
  onLogout: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onStartSession, onLogout }) => {
  const { session, userId, logout } = useAuth();
  const { data: readinessData, isLoading: isLoadingReadiness, error: readinessError } = useReadiness(userId);
  const { startSession, isStarting, startError } = useQuiz(userId);
  const { exportData, deleteAccount, isDeleting } = useUserData(userId);

  const handleStartQuiz = async (config?: {
    totalQuestions?: number;
    domainId?: string | null;
    isTimed?: boolean;
    timeLimitMinutes?: number;
    examMode?: 'timed_exam' | 'practice';
  }) => {
    try {
      const count = Math.min(80, Math.max(10, config?.totalQuestions ?? 50));
      const res = await startSession({
        totalQuestions: count,
        domainId: config?.domainId ?? null,
      });
      onStartSession(res.id, count, {
        isTimed: config?.isTimed,
        timeLimitMinutes: config?.timeLimitMinutes,
        examMode: config?.examMode,
      });
    } catch {
      // Error handled via hook state
    }
  };

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  const handleDeleteAccount = async () => {
    try {
      await deleteAccount();
      onLogout();
    } catch {
      // Error handled via hook state
    }
  };

  const handleExportData = () => {
    const dataToExport = exportData || {
      candidate: {
        userId,
        email: session?.email ?? 'candidate@cloudfix.edu',
        username: session?.username ?? 'candidate',
      },
      exportedAt: new Date().toISOString(),
      score: readinessData?.overallScore ?? 0,
      grade: readinessData?.evaluationGrade ?? 'NOT_READY',
      totalAttempts: readinessData?.totalAttemptsEvaluated ?? 0,
    };

    const blob = new Blob([JSON.stringify(dataToExport, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `candidate-export-${userId}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const defaultDomains = [
    {
      domainId: 'DOM-CONCEPTS',
      domainTitle: 'AZ-900 Domain 1: Cloud Concepts',
      weightPct: 28,
      accuracyPct: 0,
      weightedScore: 0,
      attemptsCount: 0,
    },
    {
      domainId: 'DOM-SERVICES',
      domainTitle: 'AZ-900 Domain 2: Azure Architecture & Services',
      weightPct: 37,
      accuracyPct: 0,
      weightedScore: 0,
      attemptsCount: 0,
    },
    {
      domainId: 'DOM-SECURITY',
      domainTitle: 'AZ-900 Domain 3: Azure Management & Governance',
      weightPct: 35,
      accuracyPct: 0,
      weightedScore: 0,
      attemptsCount: 0,
    },
  ];

  const domainBreakdown = readinessData?.domainBreakdown.length
    ? readinessData.domainBreakdown
    : defaultDomains;

  return (
    <DashboardView
      userEmail={session?.email ?? 'candidate@cloudfix.edu'}
      username={session?.username ?? 'candidate'}
      overallScore={readinessData?.overallScore ?? 0}
      evaluationGrade={readinessData?.evaluationGrade ?? 'NOT_READY'}
      domainBreakdown={domainBreakdown}
      totalAttempts={readinessData?.totalAttemptsEvaluated ?? 0}
      onStartQuiz={handleStartQuiz}
      onExportData={handleExportData}
      onDeleteAccount={handleDeleteAccount}
      onLogout={handleLogout}
      isLoading={isLoadingReadiness}
      isStartingQuiz={isStarting}
      isDeleting={isDeleting}
      errorMessage={readinessError?.message || startError}
    />
  );
};
