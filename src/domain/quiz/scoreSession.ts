import { Attempt } from '../model/Attempt.ts';
import { QuestionId } from '../model/Ids.ts';

export interface ScoreSessionInput {
  readonly totalQuestions: number;
  readonly attempts: readonly Attempt[];
}

export interface ScoreSessionResult {
  readonly score: number;
  readonly correctCount: number;
  readonly answeredCount: number;
  readonly totalQuestions: number;
  readonly percentage: number;
}

export type ScoreSessionError =
  | { readonly kind: 'INVALID_TOTAL_QUESTIONS'; readonly message: string }
  | { readonly kind: 'NEGATIVE_ATTEMPTS_DETECTED'; readonly message: string };

export type ScoreSessionOutput =
  | { readonly ok: true; readonly data: ScoreSessionResult }
  | { readonly ok: false; readonly error: ScoreSessionError };

/**
 * Pure session scoring function.
 * Evaluates candidate attempts against total questions.
 * Handles retries (deduplicating multiple attempts on the same question by selecting the latest attempt).
 * Handles partial completion, empty attempts, all-right, and all-wrong scenarios.
 * Strictly synchronous and pure; returns typed Result with zero exceptions thrown.
 */
export function scoreSession(input: ScoreSessionInput): ScoreSessionOutput {
  if (input.totalQuestions <= 0) {
    return {
      ok: false,
      error: {
        kind: 'INVALID_TOTAL_QUESTIONS',
        message: 'Total questions must be a positive integer greater than zero.',
      },
    };
  }

  if (input.attempts.length === 0) {
    return {
      ok: true,
      data: {
        score: 0,
        correctCount: 0,
        answeredCount: 0,
        totalQuestions: input.totalQuestions,
        percentage: 0,
      },
    };
  }

  // Deduplicate attempts by questionId, taking the latest by createdAt
  const latestAttemptsByQuestion = new Map<QuestionId, Attempt>();

  for (const attempt of input.attempts) {
    const existing = latestAttemptsByQuestion.get(attempt.questionId);
    if (!existing || attempt.createdAt.getTime() >= existing.createdAt.getTime()) {
      latestAttemptsByQuestion.set(attempt.questionId, attempt);
    }
  }

  let correctCount = 0;
  for (const attempt of latestAttemptsByQuestion.values()) {
    if (attempt.isCorrect) {
      correctCount += 1;
    }
  }

  const answeredCount = latestAttemptsByQuestion.size;
  const rawPercentage = (correctCount / input.totalQuestions) * 100;
  const clampedScore = Math.max(0, Math.min(100, Math.round(rawPercentage)));

  return {
    ok: true,
    data: {
      score: clampedScore,
      correctCount,
      answeredCount,
      totalQuestions: input.totalQuestions,
      percentage: Number(rawPercentage.toFixed(2)),
    },
  };
}
