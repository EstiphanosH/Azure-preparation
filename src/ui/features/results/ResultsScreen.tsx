import React from 'react';
import { ResultsView } from './ResultsView.tsx';
import { useReadiness } from '../../hooks/useReadiness.ts';
import { useSessionDetails } from '../../hooks/useQuiz.ts';
import { useAuth } from '../../hooks/useAuth.ts';

export interface ResultsScreenProps {
  sessionId: string;
  onNavigateDashboard: () => void;
  onRetakeQuiz: () => void;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  sessionId,
  onNavigateDashboard,
  onRetakeQuiz,
}) => {
  const { userId } = useAuth();
  const { data: readinessData, isLoading: isLoadingReadiness } = useReadiness(userId);
  const { data: sessionData, isLoading: isLoadingSession } = useSessionDetails(sessionId);

  const score = sessionData?.session.score ?? readinessData?.overallScore ?? 80;
  const grade = readinessData?.evaluationGrade ?? 'READY';
  const totalQuestions = sessionData?.session.totalQuestions ?? 10;
  const attempts = sessionData?.attempts ?? [];
  const correctCount = attempts.filter((a) => a.isCorrect).length;

  const defaultDomains = [
    {
      domainId: 'DOM-CONCEPTS',
      domainTitle: 'Cloud Fundamentals & Architectures',
      weightPct: 28,
      accuracyPct: 100,
      weightedScore: 28,
      attemptsCount: 1,
    },
    {
      domainId: 'DOM-SERVICES',
      domainTitle: 'Compute, Storage & Networking Services',
      weightPct: 37,
      accuracyPct: 100,
      weightedScore: 37,
      attemptsCount: 1,
    },
    {
      domainId: 'DOM-SECURITY',
      domainTitle: 'Identity, Governance & Compliance Controls',
      weightPct: 35,
      accuracyPct: 100,
      weightedScore: 35,
      attemptsCount: 1,
    },
  ];

  const domainBreakdown = readinessData?.domainBreakdown.length
    ? readinessData.domainBreakdown
    : defaultDomains;

  return (
    <ResultsView
      score={score}
      grade={grade}
      sessionId={sessionId}
      totalQuestions={totalQuestions}
      correctCount={correctCount}
      domainBreakdown={domainBreakdown}
      onReturnDashboard={onNavigateDashboard}
      onRetakeQuiz={onRetakeQuiz}
      isLoading={isLoadingReadiness || isLoadingSession}
    />
  );
};
