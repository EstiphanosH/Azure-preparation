import { describe, it, expect } from 'vitest';
import { scoreSession, ScoreSessionInput } from './scoreSession.ts';
import { Attempt } from '../model/Attempt.ts';
import { makeAttemptId, makeSessionId, makeUserId, makeQuestionId } from '../model/Ids.ts';

function createDummyAttempt(
  questionKey: string,
  isCorrect: boolean,
  timestampOffsetMs = 0
): Attempt {
  return {
    id: makeAttemptId(`att-${questionKey}-${timestampOffsetMs}`),
    sessionId: makeSessionId('ses-test-1'),
    userId: makeUserId('usr-test-1'),
    questionId: makeQuestionId(`q-${questionKey}`),
    selectedIndex: isCorrect ? 0 : 1,
    isCorrect,
    timeTakenMs: 1500,
    createdAt: new Date(1700000000000 + timestampOffsetMs),
  };
}

describe('scoreSession (Pure Domain Unit Tests - Table Driven)', () => {
  interface TestCase {
    readonly description: string;
    readonly input: ScoreSessionInput;
    readonly expectedOk: boolean;
    readonly expectedScore?: number;
    readonly expectedCorrect?: number;
    readonly expectedAnswered?: number;
    readonly expectedErrorKind?: string;
  }

  const testCases: readonly TestCase[] = [
    {
      description: 'Case 1: Empty attempts on 10 total questions produces 0 score',
      input: {
        totalQuestions: 10,
        attempts: [],
      },
      expectedOk: true,
      expectedScore: 0,
      expectedCorrect: 0,
      expectedAnswered: 0,
    },
    {
      description: 'Case 2: All right (10/10) produces 100 score',
      input: {
        totalQuestions: 10,
        attempts: Array.from({ length: 10 }, (_, i) => createDummyAttempt(`q${i}`, true)),
      },
      expectedOk: true,
      expectedScore: 100,
      expectedCorrect: 10,
      expectedAnswered: 10,
    },
    {
      description: 'Case 3: All wrong (0/10) produces 0 score',
      input: {
        totalQuestions: 10,
        attempts: Array.from({ length: 10 }, (_, i) => createDummyAttempt(`q${i}`, false)),
      },
      expectedOk: true,
      expectedScore: 0,
      expectedCorrect: 0,
      expectedAnswered: 10,
    },
    {
      description: 'Case 4: Partial completion - 5 of 10 answered, all 5 correct',
      input: {
        totalQuestions: 10,
        attempts: Array.from({ length: 5 }, (_, i) => createDummyAttempt(`q${i}`, true)),
      },
      expectedOk: true,
      expectedScore: 50,
      expectedCorrect: 5,
      expectedAnswered: 5,
    },
    {
      description: 'Case 5: Partial completion - 6 of 10 answered, 3 correct, 3 wrong',
      input: {
        totalQuestions: 10,
        attempts: [
          createDummyAttempt('q1', true),
          createDummyAttempt('q2', true),
          createDummyAttempt('q3', true),
          createDummyAttempt('q4', false),
          createDummyAttempt('q5', false),
          createDummyAttempt('q6', false),
        ],
      },
      expectedOk: true,
      expectedScore: 30,
      expectedCorrect: 3,
      expectedAnswered: 6,
    },
    {
      description: 'Case 6: Retry/Overwrite - Question q1 initially wrong, later retried and answered correct',
      input: {
        totalQuestions: 1,
        attempts: [
          createDummyAttempt('q1', false, 100),
          createDummyAttempt('q1', true, 500), // Later timestamp overrides earlier
        ],
      },
      expectedOk: true,
      expectedScore: 100,
      expectedCorrect: 1,
      expectedAnswered: 1,
    },
    {
      description: 'Case 7: Retry/Overwrite - Question q1 initially correct, later retried and answered wrong',
      input: {
        totalQuestions: 1,
        attempts: [
          createDummyAttempt('q1', true, 100),
          createDummyAttempt('q1', false, 500), // Later timestamp overrides
        ],
      },
      expectedOk: true,
      expectedScore: 0,
      expectedCorrect: 0,
      expectedAnswered: 1,
    },
    {
      description: 'Case 8: Invalid total questions (zero) returns typed domain error',
      input: {
        totalQuestions: 0,
        attempts: [createDummyAttempt('q1', true)],
      },
      expectedOk: false,
      expectedErrorKind: 'INVALID_TOTAL_QUESTIONS',
    },
    {
      description: 'Case 9: Negative total questions returns typed domain error',
      input: {
        totalQuestions: -5,
        attempts: [],
      },
      expectedOk: false,
      expectedErrorKind: 'INVALID_TOTAL_QUESTIONS',
    },
    {
      description: 'Case 10: Percentage rounding check (7 correct out of 9 total = 77.78% -> 78 score)',
      input: {
        totalQuestions: 9,
        attempts: [
          ...Array.from({ length: 7 }, (_, i) => createDummyAttempt(`right-${i}`, true)),
          ...Array.from({ length: 2 }, (_, i) => createDummyAttempt(`wrong-${i}`, false)),
        ],
      },
      expectedOk: true,
      expectedScore: 78,
      expectedCorrect: 7,
      expectedAnswered: 9,
    },
  ];

  for (const tc of testCases) {
    it(tc.description, () => {
      const result = scoreSession(tc.input);

      if (tc.expectedOk) {
        expect(result.ok).toBe(true);
        if (result.ok) {
          expect(result.data.score).toBe(tc.expectedScore);
          expect(result.data.correctCount).toBe(tc.expectedCorrect);
          expect(result.data.answeredCount).toBe(tc.expectedAnswered);
          expect(result.data.totalQuestions).toBe(tc.input.totalQuestions);
        }
      } else {
        expect(result.ok).toBe(false);
        if (!result.ok) {
          expect(result.error.kind).toBe(tc.expectedErrorKind);
        }
      }
    });
  }
});
