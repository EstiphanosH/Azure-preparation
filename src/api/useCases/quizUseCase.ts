import { z } from 'zod';
import {
  StartSessionInputSchema,
  SubmitAttemptInputSchema,
  FinalizeSessionInputSchema,
  QuizSessionResponseSchema,
  AttemptResponseSchema,
  FinalizeSessionResponseSchema,
} from '../schemas/index.ts';
import { ApiError } from '../errors.ts';
import { IQuizRepository, quizRepository } from '../repositories/quizRepository.ts';
import {
  makeSessionId,
  makeUserId,
  makeQuestionId,
  makeDomainId,
  makeAttemptId,
} from '../../domain/model/Ids.ts';
import {
  startSession,
  recordAttempt,
  submitSession,
  applyScore,
  resetSession,
} from '../../domain/quiz/lifecycle.ts';
import { scoreSession } from '../../domain/quiz/scoreSession.ts';
import { createQuizSession } from '../../domain/model/QuizSession.ts';
import { createAttempt } from '../../domain/model/Attempt.ts';

export class QuizUseCase {
  constructor(private repo: IQuizRepository = quizRepository) {}

  public async startSession(
    rawInput: unknown,
    userIdStr: string
  ): Promise<{ ok: true; data: z.infer<typeof QuizSessionResponseSchema> } | { ok: false; error: ApiError }> {
    const parsed = StartSessionInputSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        ok: false,
        error: {
          kind: 'ValidationError',
          statusCode: 400,
          message: 'Invalid start session payload.',
          issues: parsed.error.issues.map((i) => i.message),
        },
      };
    }

    const sessionId = makeSessionId(`sess-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`);
    const userId = makeUserId(userIdStr);
    const domainId = parsed.data.domainId ? makeDomainId(parsed.data.domainId) : null;

    // Use pure domain lifecycle state machine
    const initialLife = resetSession();
    if (!initialLife.ok) {
      return {
        ok: false,
        error: {
          kind: 'ValidationError',
          statusCode: 400,
          message: initialLife.error.message,
          issues: [initialLife.error.kind],
        },
      };
    }
    const startedLife = startSession(initialLife.state, sessionId, userId, new Date());
    if (!startedLife.ok) {

      return {
        ok: false,
        error: {
          kind: 'ValidationError',
          statusCode: 400,
          message: startedLife.error.message,
          issues: [startedLife.error.kind],
        },
      };
    }

    const sessionEntity = createQuizSession({
      id: sessionId,
      userId,
      domainId,
      status: 'IN_PROGRESS',
      score: 0,
      totalQuestions: parsed.data.totalQuestions,
      startedAt: new Date(),
      completedAt: null,
    });

    const saved = await this.repo.createSession(sessionEntity);

    const response = QuizSessionResponseSchema.parse({
      id: saved.id,
      userId: saved.userId,
      domainId: saved.domainId,
      status: saved.status,
      score: saved.score,
      totalQuestions: saved.totalQuestions,
      startedAt: saved.startedAt.toISOString(),
    });

    return { ok: true, data: response };
  }

  public async submitAttempt(
    rawInput: unknown,
    userIdStr: string
  ): Promise<{ ok: true; data: z.infer<typeof AttemptResponseSchema> } | { ok: false; error: ApiError }> {
    const parsed = SubmitAttemptInputSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        ok: false,
        error: {
          kind: 'ValidationError',
          statusCode: 400,
          message: 'Invalid attempt submission payload.',
          issues: parsed.error.issues.map((i) => i.message),
        },
      };
    }

    const sessionId = makeSessionId(parsed.data.sessionId);
    const questionId = makeQuestionId(parsed.data.questionId);
    const userId = makeUserId(userIdStr);

    const session = await this.repo.getSessionById(sessionId);
    if (!session) {
      return {
        ok: false,
        error: {
          kind: 'NotFoundError',
          statusCode: 404,
          message: 'Target session does not exist.',
          resource: `Session ${sessionId}`,
        },
      };
    }

    // RLS boundary check: user can only attempt their own session
    if (session.userId !== userId) {
      return {
        ok: false,
        error: {
          kind: 'AuthError',
          statusCode: 401,
          code: 'UNAUTHORIZED',
          message: 'Unauthorized attempt access across candidates.',
        },
      };
    }

    if (session.status !== 'IN_PROGRESS') {
      return {
        ok: false,
        error: {
          kind: 'ValidationError',
          statusCode: 400,
          message: `Cannot record attempts on session with status ${session.status}.`,
          issues: ['SESSION_NOT_IN_PROGRESS'],
        },
      };
    }

    const question = await this.repo.getQuestionById(questionId);
    if (!question) {
      return {
        ok: false,
        error: {
          kind: 'NotFoundError',
          statusCode: 404,
          message: 'Target question does not exist.',
          resource: `Question ${questionId}`,
        },
      };
    }

    const isCorrect = parsed.data.selectedIndex === question.correctAnswerIndex;
    const attemptId = makeAttemptId(`att-${Date.now().toString(36)}-${Math.random().toString(36).substring(2, 6)}`);

    const attemptEntity = createAttempt({
      id: attemptId,
      sessionId,
      userId,
      questionId,
      selectedIndex: parsed.data.selectedIndex,
      isCorrect,
      timeTakenMs: parsed.data.timeTakenMs,
      createdAt: new Date(),
    });

    // Domain state machine validation
    const pastAttempts = await this.repo.getAttemptsBySessionId(sessionId);
    const inProgressState = {
      kind: 'in_progress' as const,
      sessionId,
      userId,
      startedAt: session.startedAt,
      attempts: pastAttempts,
    };
    const domainRecordResult = recordAttempt(inProgressState, attemptEntity);
    if (!domainRecordResult.ok) {
      return {
        ok: false,
        error: {
          kind: 'ValidationError',
          statusCode: 400,
          message: domainRecordResult.error.message,
          issues: [domainRecordResult.error.kind],
        },
      };
    }

    const saved = await this.repo.createAttempt(attemptEntity);

    const response = AttemptResponseSchema.parse({
      id: saved.id,
      sessionId: saved.sessionId,
      questionId: saved.questionId,
      selectedIndex: saved.selectedIndex,
      isCorrect: saved.isCorrect,
      timeTakenMs: saved.timeTakenMs,
    });

    return { ok: true, data: response };
  }

  public async finalizeSession(
    rawInput: unknown,
    userIdStr: string
  ): Promise<{ ok: true; data: z.infer<typeof FinalizeSessionResponseSchema> } | { ok: false; error: ApiError }> {
    const parsed = FinalizeSessionInputSchema.safeParse(rawInput);
    if (!parsed.success) {
      return {
        ok: false,
        error: {
          kind: 'ValidationError',
          statusCode: 400,
          message: 'Invalid finalize session payload.',
          issues: parsed.error.issues.map((i) => i.message),
        },
      };
    }

    const sessionId = makeSessionId(parsed.data.sessionId);
    const userId = makeUserId(userIdStr);

    const session = await this.repo.getSessionById(sessionId);
    if (!session) {
      return {
        ok: false,
        error: {
          kind: 'NotFoundError',
          statusCode: 404,
          message: 'Target session does not exist.',
          resource: `Session ${sessionId}`,
        },
      };
    }

    if (session.userId !== userId) {
      return {
        ok: false,
        error: {
          kind: 'AuthError',
          statusCode: 401,
          code: 'UNAUTHORIZED',
          message: 'Unauthorized finalize attempt on another candidate session.',
        },
      };
    }

    const attempts = await this.repo.getAttemptsBySessionId(sessionId);

    // 1. Submit session in domain lifecycle
    const inProgressState = {
      kind: 'in_progress' as const,
      sessionId,
      userId,
      startedAt: session.startedAt,
      attempts,
    };
    const submittedResult = submitSession(inProgressState, new Date());
    if (!submittedResult.ok) {
      return {
        ok: false,
        error: {
          kind: 'ValidationError',
          statusCode: 400,
          message: submittedResult.error.message,
          issues: [submittedResult.error.kind],
        },
      };
    }

    // 2. Score session using pure domain scoreSession
    const scoreOutput = scoreSession({
      totalQuestions: session.totalQuestions,
      attempts,
    });
    if (!scoreOutput.ok) {
      return {
        ok: false,
        error: {
          kind: 'ValidationError',
          statusCode: 400,
          message: scoreOutput.error.message,
          issues: [scoreOutput.error.kind],
        },
      };
    }

    // 3. Apply score in domain lifecycle
    const applyScoreResult = applyScore(
      submittedResult.state,
      scoreOutput.data.score,
      session.totalQuestions,
      new Date()
    );
    if (!applyScoreResult.ok) {
      return {
        ok: false,
        error: {
          kind: 'ValidationError',
          statusCode: 400,
          message: applyScoreResult.error.message,
          issues: [applyScoreResult.error.kind],
        },
      };
    }

    const updatedSession = createQuizSession({
      ...session,
      status: 'RESOLVED',
      score: scoreOutput.data.score,
      completedAt: new Date(),
    });
    await this.repo.updateSession(updatedSession);

    const response = FinalizeSessionResponseSchema.parse({
      sessionId: updatedSession.id,
      userId: updatedSession.userId,
      status: 'RESOLVED',
      score: scoreOutput.data.score,
      correctCount: scoreOutput.data.correctCount,
      totalQuestions: scoreOutput.data.totalQuestions,
      percentage: scoreOutput.data.percentage,
      completedAt: (updatedSession.completedAt ?? new Date()).toISOString(),
    });

    return { ok: true, data: response };
  }
}

export const quizUseCase = new QuizUseCase();
