import { describe, it, expect } from 'vitest';
import {
  QuizLifecycleState,
  startSession,
  recordAttempt,
  submitSession,
  applyScore,
  resetSession,
} from './lifecycle.ts';
import {
  makeAttemptId,
  makeQuestionId,
  makeSessionId,
  makeUserId,
} from '../model/Ids.ts';
import { Attempt } from '../model/Attempt.ts';

function createDummyAttempt(id: string): Attempt {
  return {
    id: makeAttemptId(`att-${id}`),
    sessionId: makeSessionId('ses-1'),
    userId: makeUserId('usr-1'),
    questionId: makeQuestionId(`q-${id}`),
    selectedIndex: 0,
    isCorrect: true,
    timeTakenMs: 1200,
    createdAt: new Date(),
  };
}

describe('QuizLifecycle State Machine', () => {
  const sessionId = makeSessionId('ses-live-1');
  const userId = makeUserId('usr-live-1');
  const startedAt = new Date('2026-10-19T10:00:00Z');

  // 1. Valid Transitions Flow
  it('executes full valid lifecycle flow: idle -> in_progress -> attempt -> submitted -> scored -> reset', () => {
    // Step 1: Idle
    const idleState: QuizLifecycleState = { kind: 'idle' };

    // Step 2: Start session -> in_progress
    const startRes = startSession(idleState, sessionId, userId, startedAt);
    expect(startRes.ok).toBe(true);
    if (!startRes.ok) return;
    expect(startRes.state.kind).toBe('in_progress');

    // Step 3: Record attempt -> remains in_progress with attempt added
    const attempt = createDummyAttempt('1');
    const attemptRes = recordAttempt(startRes.state, attempt);
    expect(attemptRes.ok).toBe(true);
    if (!attemptRes.ok) return;
    expect(attemptRes.state.kind).toBe('in_progress');
    if (attemptRes.state.kind === 'in_progress') {
      expect(attemptRes.state.attempts).toHaveLength(1);
    }

    // Step 4: Submit session -> submitted
    const submitRes = submitSession(attemptRes.state);
    expect(submitRes.ok).toBe(true);
    if (!submitRes.ok) return;
    expect(submitRes.state.kind).toBe('submitted');

    // Step 5: Apply score -> scored
    const scoreRes = applyScore(submitRes.state, 100, 10);
    expect(scoreRes.ok).toBe(true);
    if (!scoreRes.ok) return;
    expect(scoreRes.state.kind).toBe('scored');
    if (scoreRes.state.kind === 'scored') {
      expect(scoreRes.state.score).toBe(100);
      expect(scoreRes.state.totalQuestions).toBe(10);
    }

    // Step 6: Reset session -> idle
    const resetRes = resetSession();
    expect(resetRes.ok).toBe(true);
    if (!resetRes.ok) return;
    expect(resetRes.state.kind).toBe('idle');

  });

  // 2. Invalid Transition 1: Cannot submit from idle
  it('Invalid 1: Rejects submitting session from idle state', () => {
    const idleState: QuizLifecycleState = { kind: 'idle' };
    const res = submitSession(idleState);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.kind).toBe('CANNOT_SUBMIT_NON_IN_PROGRESS_SESSION');
      expect(res.error.currentState).toBe('idle');
    }
  });

  // 3. Invalid Transition 2: Cannot score from idle
  it('Invalid 2: Rejects applying score from idle state', () => {
    const idleState: QuizLifecycleState = { kind: 'idle' };
    const res = applyScore(idleState, 80, 10);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.kind).toBe('CANNOT_SCORE_NON_SUBMITTED_SESSION');
      expect(res.error.currentState).toBe('idle');
    }
  });

  // 4. Invalid Transition 3: Cannot score directly from in_progress without submission
  it('Invalid 3: Rejects applying score directly from in_progress state', () => {
    const inProgressState: QuizLifecycleState = {
      kind: 'in_progress',
      sessionId,
      userId,
      startedAt,
      attempts: [],
    };
    const res = applyScore(inProgressState, 80, 10);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.kind).toBe('CANNOT_SCORE_NON_SUBMITTED_SESSION');
      expect(res.error.currentState).toBe('in_progress');
    }
  });

  // 5. Invalid Transition 4: Cannot record attempts on scored session
  it('Invalid 4: Rejects recording attempts on already scored session', () => {
    const scoredState: QuizLifecycleState = {
      kind: 'scored',
      sessionId,
      userId,
      startedAt,
      submittedAt: new Date(),
      scoredAt: new Date(),
      score: 90,
      totalQuestions: 10,
    };
    const res = recordAttempt(scoredState, createDummyAttempt('99'));
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.kind).toBe('CANNOT_RECORD_ATTEMPT_NON_IN_PROGRESS');
      expect(res.error.currentState).toBe('scored');
    }
  });

  // 6. Invalid Transition 5: Cannot start session when already in_progress
  it('Invalid 5: Rejects starting session when already in_progress', () => {
    const inProgressState: QuizLifecycleState = {
      kind: 'in_progress',
      sessionId,
      userId,
      startedAt,
      attempts: [],
    };
    const res = startSession(inProgressState, makeSessionId('new-ses'), userId);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.kind).toBe('CANNOT_START_NON_IDLE_SESSION');
    }
  });

  // 7. Invalid Score Bounds
  it('Invalid 6: Rejects out-of-bounds score on submitted session', () => {
    const submittedState: QuizLifecycleState = {
      kind: 'submitted',
      sessionId,
      userId,
      startedAt,
      submittedAt: new Date(),
      attempts: [],
    };
    const res = applyScore(submittedState, 150, 10);
    expect(res.ok).toBe(false);
    if (!res.ok) {
      expect(res.error.kind).toBe('INVALID_SCORE_RANGE');
    }
  });
});
