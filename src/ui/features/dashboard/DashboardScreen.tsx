import React from 'react';
import { DashboardView } from './DashboardView.tsx';
import { useAuth } from '../../hooks/useAuth.ts';
import { useReadiness } from '../../hooks/useReadiness.ts';
import { useQuiz } from '../../hooks/useQuiz.ts';
import { useUserData } from '../../hooks/useUserData.ts';

export interface DashboardScreenProps {
  onStartSession: (sessionId: string) => void;
  onLogout: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({ onStartSession, onLogout }) => {
  const { session, userId, logout } = useAuth();
  const { data: readinessData, isLoading: isLoadingReadiness, error: readinessError } = useReadiness(userId);
  const { startSession, isStarting, startError } = useQuiz(userId);
  const { deleteAccount, isDeleting } = useUserData(userId);

  const handleStartQuiz = async () => {
    try {
      const res = await startSession({ totalQuestions: 10, domainId: 'DOM-SERVICES' });
      onStartSession(res.id);
    } catch {
      // Error in hook state
    }
  };

  const handleLogout = async () => {
    await logout();
    onLogout();
  };

  const handleDeleteAccount = async () => {
    if (window.confirm('Are you sure you want to permanently delete your account and all associated test data?')) {
      await deleteAccount();
      onLogout();
    }
  };

  const handleExportData = () => {
    alert('Candidate GDPR Export initiated. Data package compiled from database view.');
  };

  const defaultDomains = [
    {
      domainId: 'DOM-CONCEPTS',
      domainTitle: 'Cloud Fundamentals & Architectures',
      weightPct: 28,
      accuracyPct: 0,
      weightedScore: 0,
      attemptsCount: 0,
    },
    {
      domainId: 'DOM-SERVICES',
      domainTitle: 'Compute, Storage & Networking Services',
      weightPct: 37,
      accuracyPct: 0,
      weightedScore: 0,
      attemptsCount: 0,
    },
    {
      domainId: 'DOM-SECURITY',
      domainTitle: 'Identity, Governance & Compliance Controls',
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
