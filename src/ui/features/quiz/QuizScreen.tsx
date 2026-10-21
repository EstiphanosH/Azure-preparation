import React, { useState } from 'react';
import { QuizView, QuizQuestionItem } from './QuizView.tsx';
import { useQuestions, useQuiz } from '../../hooks/useQuiz.ts';
import { useAuth } from '../../hooks/useAuth.ts';

export interface QuizScreenProps {
  sessionId: string;
  questionCount?: number;
  onSessionFinalized: (finalScore: number) => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  sessionId,
  questionCount = 10,
  onSessionFinalized,
}) => {
  const { userId } = useAuth();
  const safeCount = Math.min(40, Math.max(10, questionCount));
  const { data: allQuestions = [], isLoading: isLoadingQuestions } = useQuestions(null, safeCount);
  const questions = allQuestions.slice(0, safeCount);

  const { submitAttempt, isSubmitting, finalizeSession, isFinalizing, submitError, finalizeError } =
    useQuiz(userId);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [hasSubmittedCurrent, setHasSubmittedCurrent] = useState(false);
  const [isCurrentCorrect, setIsCurrentCorrect] = useState<boolean | null>(null);
  const [activeHint, setActiveHint] = useState<string | null>(null);

  const rawQ = questions[currentIndex];
  const currentQuestion: QuizQuestionItem | null = rawQ
    ? {
        id: rawQ.id,
        prompt: rawQ.prompt,
        options: rawQ.options,
        explanation: rawQ.explanation,
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
    } catch {
      // Error in hook state
    }
  };

  const handleNextQuestion = () => {
    setCurrentIndex((prev) => prev + 1);
    setSelectedIndex(null);
    setHasSubmittedCurrent(false);
    setIsCurrentCorrect(null);
    setActiveHint(null);
  };

  const handleFinalize = async () => {
    try {
      const res = await finalizeSession({ sessionId });
      onSessionFinalized(res.score);
    } catch {
      // Error in hook state
    }
  };

  const handleRequestHint = () => {
    setActiveHint('Analyze managed infrastructure trade-offs and zero-trust verification rules.');
  };

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
      onFinalize={handleFinalize}
      isFinalizing={isFinalizing}
      activeHint={activeHint}
      onRequestHint={handleRequestHint}
      isLoadingSession={isLoadingQuestions}
      errorMessage={submitError || finalizeError}
    />
  );
};
