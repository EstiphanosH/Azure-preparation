/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from 'react';
import { ResultsView } from './ResultsView.tsx';
import { useReadiness } from '../../hooks/useReadiness.ts';
import { useSessionDetails } from '../../hooks/useQuiz.ts';
import { useAuth } from '../../hooks/useAuth.ts';
import { saveQuickQuizRecord } from '../../../domain/quiz/quickQuizGenerator.ts';

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
      domainTitle: 'AZ-900 Domain 1: Cloud Concepts',
      weightPct: 28,
      accuracyPct: 100,
      weightedScore: 28,
      attemptsCount: 1,
    },
    {
      domainId: 'DOM-SERVICES',
      domainTitle: 'AZ-900 Domain 2: Azure Architecture & Services',
      weightPct: 37,
      accuracyPct: 100,
      weightedScore: 37,
      attemptsCount: 1,
    },
    {
      domainId: 'DOM-SECURITY',
      domainTitle: 'AZ-900 Domain 3: Azure Management & Governance',
      weightPct: 35,
      accuracyPct: 100,
      weightedScore: 35,
      attemptsCount: 1,
    },
  ];

  const domainBreakdown = readinessData?.domainBreakdown.length
    ? readinessData.domainBreakdown
    : defaultDomains;

  useEffect(() => {
    if (sessionData && totalQuestions >= 10) {
      saveQuickQuizRecord({
        sessionId,
        date: new Date().toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        score,
        correctCount,
        totalQuestions,
        grade,
        domainBreakdown: domainBreakdown.map((d) => ({
          domainId: d.domainId,
          domainTitle: d.domainTitle,
          correct: Math.round((d.accuracyPct / 100) * d.attemptsCount) || (d.accuracyPct >= 50 ? 1 : 0),
          total: d.attemptsCount || 1,
          percentage: d.accuracyPct,
        })),
      });
    }
  }, [sessionId, sessionData, totalQuestions, score, correctCount, grade, domainBreakdown]);

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
