/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { QuizView, QuizQuestionItem } from './QuizView.tsx';
import { useQuestions, useQuiz } from '../../hooks/useQuiz.ts';
import { useAuth } from '../../hooks/useAuth.ts';
import { saveQuickQuizRecord } from '../../../domain/quiz/quickQuizGenerator.ts';

export interface QuizScreenProps {
  sessionId: string;
  questionCount?: number;
  isTimed?: boolean;
  timeLimitMinutes?: number;
  examMode?: 'timed_exam' | 'practice';
  onSessionFinalized: (finalScore: number) => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  sessionId,
  questionCount = 50,
  isTimed = false,
  timeLimitMinutes = 45,
  examMode = 'practice',
  onSessionFinalized,
}) => {
  const { userId } = useAuth();
  const safeCount = Math.min(60, Math.max(10, questionCount));
  const { data: allQuestions = [], isLoading: isLoadingQuestions } = useQuestions(null, safeCount);
  const questions = allQuestions.slice(0, safeCount);

  const { submitAttempt, isSubmitting, finalizeSession, isFinalizing, submitError, finalizeError } =
    useQuiz(userId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hasSubmittedCurrent, setHasSubmittedCurrent] = useState(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState<boolean | null>(null);
  const [activeHint, setActiveHint] = useState<string | null>(null);
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  const [timeExpiredNotice, setTimeExpiredNotice] = useState<boolean>(false);

  // Candidate progress tracking across all questions in the session
  const [answeredState, setAnsweredState] = useState<
    Record<number, { selectedIndex: number; isCorrect: boolean }>
  >({});
  const [flaggedIndices, setFlaggedIndices] = useState<Set<number>>(new Set());

  const rawQ = questions[currentIndex];

  const getDomainTitle = (domainId?: string) => {
    switch (domainId) {
      case 'DOM-CONCEPTS':
        return 'Domain 1: Cloud Concepts';
      case 'DOM-SERVICES':
        return 'Domain 2: Azure Architecture & Services';
      case 'DOM-SECURITY':
        return 'Domain 3: Security, Governance & Pricing';
      default:
        return 'AZ-900 Core Domain';
    }
  };

  const currentQuestion: QuizQuestionItem | null = rawQ
    ? {
        id: rawQ.id,
        prompt: rawQ.prompt,
        options: rawQ.options,
        explanation: rawQ.explanation,
        domainId: rawQ.domainId,
        domainTitle: getDomainTitle(rawQ.domainId),
      }
    : null;

  const handleSubmitAttempt = async () => {
    if (selectedIndex === null || !currentQuestion) return;

    try {
      const res = await submitAttempt({
        sessionId,
        questionId: currentQuestion.id,
        selectedIndex: selectedIndex as 0 | 1 | 2 | 3,
        timeTakenMs: 8500,
      });

      setIsCurrentCorrect(res.isCorrect);
      setHasSubmittedCurrent(true);

      // Record answer state for progress tracker
      setAnsweredState((prev) => ({
        ...prev,
        [currentIndex]: {
          selectedIndex,
          isCorrect: res.isCorrect,
        },
      }));
    } catch {
      // Error in hook state
    }
  };

  const handleNextQuestion = () => {
    const nextIdx = currentIndex + 1;
    setCurrentIndex(nextIdx);
    setActiveHint(null);

    // If already answered previously, load that answer
    if (answeredState[nextIdx]) {
      setSelectedIndex(answeredState[nextIdx].selectedIndex);
      setHasSubmittedCurrent(true);
      setIsCurrentCorrect(answeredState[nextIdx].isCorrect);
    } else {
      setSelectedIndex(null);
      setHasSubmittedCurrent(false);
      setIsCurrentCorrect(null);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentIndex <= 0) return;
    const prevIdx = currentIndex - 1;
    setCurrentIndex(prevIdx);
    setActiveHint(null);

    if (answeredState[prevIdx]) {
      setSelectedIndex(answeredState[prevIdx].selectedIndex);
      setHasSubmittedCurrent(true);
      setIsCurrentCorrect(answeredState[prevIdx].isCorrect);
    } else {
      setSelectedIndex(null);
      setHasSubmittedCurrent(false);
      setIsCurrentCorrect(null);
    }
  };

  const handleJumpToQuestion = (targetIdx: number) => {
    if (targetIdx < 0 || targetIdx >= questions.length) return;
    setCurrentIndex(targetIdx);
    setActiveHint(null);

    if (answeredState[targetIdx]) {
      setSelectedIndex(answeredState[targetIdx].selectedIndex);
      setHasSubmittedCurrent(true);
      setIsCurrentCorrect(answeredState[targetIdx].isCorrect);
    } else {
      setSelectedIndex(null);
      setHasSubmittedCurrent(false);
      setIsCurrentCorrect(null);
    }
  };

  const handleToggleFlag = () => {
    setFlaggedIndices((prev) => {
      const next = new Set(prev);
      if (next.has(currentIndex)) {
        next.delete(currentIndex);
      } else {
        next.add(currentIndex);
      }
      return next;
    });
  };

  const handleFinalize = async () => {
    try {
      const res = await finalizeSession({ sessionId });

      // Save to Quick Quiz progress tracker in localStorage
      const totalAnswered = Object.keys(answeredState).length;
      const correctCount = Object.values(answeredState).filter((a) => a.isCorrect).length;
      const calculatedScore = totalAnswered > 0 ? Math.round((correctCount / questions.length) * 100) : res.score;

      // Group by domain for domain-level tracking
      const domainMap: Record<string, { total: number; correct: number; title: string }> = {};
      questions.forEach((q, idx) => {
        const domId = q.domainId;
        if (!domainMap[domId]) {
          domainMap[domId] = { total: 0, correct: 0, title: getDomainTitle(domId) };
        }
        domainMap[domId].total += 1;
        if (answeredState[idx]?.isCorrect) {
          domainMap[domId].correct += 1;
        }
      });

      const domainBreakdown = Object.entries(domainMap).map(([domId, val]) => ({
        domainId: domId,
        domainTitle: val.title,
        correct: val.correct,
        total: val.total,
        percentage: val.total > 0 ? Math.round((val.correct / val.total) * 100) : 0,
      }));

      saveQuickQuizRecord({
        sessionId,
        date: new Date().toLocaleDateString(undefined, {
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        }),
        score: calculatedScore,
        correctCount,
        totalQuestions: questions.length,
        grade: calculatedScore >= 70 ? 'READY' : calculatedScore >= 50 ? 'REVIEW_REQUIRED' : 'NOT_READY',
        domainBreakdown,
        timeTakenSeconds: elapsedSeconds,
      });

      onSessionFinalized(res.score);
    } catch {
      // Error in hook state
    }
  };

  const handleTimeExpired = async () => {
    setTimeExpiredNotice(true);
    setTimeout(async () => {
      await handleFinalize();
    }, 1200);
  };

  const handleRequestHint = () => {
    setActiveHint('Analyze managed infrastructure trade-offs and zero-trust verification rules.');
  };

  const answeredIndices = Object.keys(answeredState).map(Number);
  const flaggedList = Array.from(flaggedIndices);

  const timeLimitSeconds = isTimed ? timeLimitMinutes * 60 : undefined;

  return (
    <QuizView
      currentQuestion={currentQuestion}
      currentIndex={currentIndex}
      totalQuestions={questions.length || safeCount}
      selectedIndex={selectedIndex}
      onSelectOption={setSelectedIndex}
      onSubmitAttempt={handleSubmitAttempt}
      isSubmitting={isSubmitting}
      hasSubmittedCurrent={hasSubmittedCurrent}
      isCurrentCorrect={isCurrentCorrect}
      onNextQuestion={handleNextQuestion}
      onPreviousQuestion={handlePreviousQuestion}
      onFinalize={handleFinalize}
      isFinalizing={isFinalizing}
      activeHint={activeHint}
      onRequestHint={handleRequestHint}
      isLoadingSession={isLoadingQuestions}
      errorMessage={submitError || finalizeError}
      answeredIndices={answeredIndices}
      flaggedIndices={flaggedList}
      onJumpToQuestion={handleJumpToQuestion}
      onToggleFlag={handleToggleFlag}
      isCurrentFlagged={flaggedIndices.has(currentIndex)}
      isTimed={isTimed}
      timeLimitSeconds={timeLimitSeconds}
      onTimeExpired={handleTimeExpired}
      onTimeUpdate={(elapsed) => setElapsedSeconds(elapsed)}
      examMode={examMode}
      timeExpiredNotice={timeExpiredNotice}
    />
  );
};
