import { SessionId, UserId } from '../model/Ids.ts';
import { Attempt } from '../model/Attempt.ts';

export type QuizLifecycleState =
  | {
      readonly kind: 'idle';
    }
  | {
      readonly kind: 'in_progress';
      readonly sessionId: SessionId;
      readonly userId: UserId;
      readonly startedAt: Date;
      readonly attempts: readonly Attempt[];
    }
  | {
      readonly kind: 'submitted';
      readonly sessionId: SessionId;
      readonly userId: UserId;
      readonly startedAt: Date;
      readonly submittedAt: Date;
      readonly attempts: readonly Attempt[];
    }
  | {
      readonly kind: 'scored';
      readonly sessionId: SessionId;
      readonly userId: UserId;
      readonly startedAt: Date;
      readonly submittedAt: Date;
      readonly scoredAt: Date;
      readonly score: number;
      readonly totalQuestions: number;
    };

export type LifecycleErrorKind =
  | 'CANNOT_START_NON_IDLE_SESSION'
  | 'CANNOT_RECORD_ATTEMPT_NON_IN_PROGRESS'
  | 'CANNOT_SUBMIT_NON_IN_PROGRESS_SESSION'
  | 'CANNOT_SCORE_NON_SUBMITTED_SESSION'
  | 'INVALID_SCORE_RANGE'
  | 'INVALID_TOTAL_QUESTIONS';

export interface LifecycleError {
  readonly kind: LifecycleErrorKind;
  readonly message: string;
  readonly currentState: QuizLifecycleState['kind'];
}

export type LifecycleResult =
  | { readonly ok: true; readonly state: QuizLifecycleState }
  | { readonly ok: false; readonly error: LifecycleError };

/**
 * Pure, deterministic lifecycle state machine for quiz sessions.
 * Returns typed results rather than throwing exceptions.
 */
export function startSession(
  state: QuizLifecycleState,
  sessionId: SessionId,
  userId: UserId,
  startedAt: Date = new Date()
): LifecycleResult {
  if (state.kind !== 'idle') {
    return {
      ok: false,
      error: {
        kind: 'CANNOT_START_NON_IDLE_SESSION',
        message: `Cannot start session when state is '${state.kind}'. Session must be in 'idle' state.`,
        currentState: state.kind,
      },
    };
  }

  return {
    ok: true,
    state: {
      kind: 'in_progress',
      sessionId,
      userId,
      startedAt,
      attempts: [],
    },
  };
}

export function recordAttempt(
  state: QuizLifecycleState,
  attempt: Attempt
): LifecycleResult {
  if (state.kind !== 'in_progress') {
    return {
      ok: false,
      error: {
        kind: 'CANNOT_RECORD_ATTEMPT_NON_IN_PROGRESS',
        message: `Cannot record attempts when state is '${state.kind}'. Session must be 'in_progress'.`,
        currentState: state.kind,
      },
    };
  }

  return {
    ok: true,
    state: {
      ...state,
      attempts: [...state.attempts, attempt],
    },
  };
}

export function submitSession(
  state: QuizLifecycleState,
  submittedAt: Date = new Date()
): LifecycleResult {
  if (state.kind !== 'in_progress') {
    return {
      ok: false,
      error: {
        kind: 'CANNOT_SUBMIT_NON_IN_PROGRESS_SESSION',
        message: `Cannot submit session when state is '${state.kind}'. Session must be 'in_progress'.`,
        currentState: state.kind,
      },
    };
  }

  return {
    ok: true,
    state: {
      kind: 'submitted',
      sessionId: state.sessionId,
      userId: state.userId,
      startedAt: state.startedAt,
      submittedAt,
      attempts: state.attempts,
    },
  };
}

export function applyScore(
  state: QuizLifecycleState,
  score: number,
  totalQuestions: number,
  scoredAt: Date = new Date()
): LifecycleResult {
  if (state.kind !== 'submitted') {
    return {
      ok: false,
      error: {
        kind: 'CANNOT_SCORE_NON_SUBMITTED_SESSION',
        message: `Cannot score session when state is '${state.kind}'. Session must be 'submitted'.`,
        currentState: state.kind,
      },
    };
  }

  if (score < 0 || score > 100) {
    return {
      ok: false,
      error: {
        kind: 'INVALID_SCORE_RANGE',
        message: `Score ${score} out of valid bounds (0 to 100).`,
        currentState: state.kind,
      },
    };
  }

  if (totalQuestions <= 0) {
    return {
      ok: false,
      error: {
        kind: 'INVALID_TOTAL_QUESTIONS',
        message: `Total questions ${totalQuestions} must be positive.`,
        currentState: state.kind,
      },
    };
  }

  return {
    ok: true,
    state: {
      kind: 'scored',
      sessionId: state.sessionId,
      userId: state.userId,
      startedAt: state.startedAt,
      submittedAt: state.submittedAt,
      scoredAt,
      score,
      totalQuestions,
    },
  };
}

export function resetSession(): LifecycleResult {
  return {
    ok: true,
    state: { kind: 'idle' },
  };
}
