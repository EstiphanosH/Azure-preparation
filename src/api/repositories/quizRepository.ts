import { SessionId, UserId, QuestionId, DomainId, AttemptId } from '../../domain/model/Ids.ts';
import { QuizSession } from '../../domain/model/QuizSession.ts';
import { Attempt } from '../../domain/model/Attempt.ts';
import { Question } from '../../domain/model/Question.ts';
import { SYNTHETIC_QUESTION_BANK } from '../../domain/model/QuestionBank.ts';

export interface CandidateExportData {
  readonly candidate: {
    readonly userId: string;
    readonly email: string;
    readonly username: string;
  };
  readonly sessionsCount: number;
  readonly attemptsCount: number;
  readonly exportedAt: string;
  readonly sessions: readonly {
    readonly sessionId: string;
    readonly domainId: string | null;
    readonly status: string;
    readonly score: number;
  }[];
  readonly attempts: readonly {
    readonly attemptId: string;
    readonly sessionId: string;
    readonly questionId: string;
    readonly selectedIndex: number;
    readonly isCorrect: boolean;
    readonly timeTakenMs: number;
  }[];
}

export interface IQuizRepository {
  createSession(session: QuizSession): Promise<QuizSession>;
  getSessionById(sessionId: SessionId): Promise<QuizSession | null>;
  updateSession(session: QuizSession): Promise<QuizSession>;
  createAttempt(attempt: Attempt): Promise<Attempt>;
  getAttemptsBySessionId(sessionId: SessionId): Promise<Attempt[]>;
  getAttemptsByUserId(userId: UserId): Promise<Attempt[]>;
  getQuestionById(questionId: QuestionId): Promise<Question | null>;
  getQuestionsByDomain(domainId?: DomainId | null, limit?: number): Promise<Question[]>;
  exportUserData(userId: UserId, includeAttempts: boolean): Promise<CandidateExportData>;
  deleteUserCascade(userId: UserId): Promise<{ deleted: true; count: number }>;
  forceDatabaseError(type?: 'syntax' | 'constraint' | 'rls'): Promise<never>;
  setUserMeta(userId: UserId, meta: { email: string; username: string }): void;
}

export class InMemoryQuizRepository implements IQuizRepository {
  private sessions = new Map<SessionId, QuizSession>();
  private attempts = new Map<AttemptId, Attempt>();
  private questions = new Map<QuestionId, Question>();
  private users = new Map<UserId, { email: string; username: string }>();

  public setUserMeta(userId: UserId, meta: { email: string; username: string }): void {
    this.users.set(userId, meta);
  }

  constructor() {
    this.seedDefaultQuestions();
  }

  private seedDefaultQuestions(): void {
    for (const q of SYNTHETIC_QUESTION_BANK) {
      this.questions.set(q.id, q);
    }
  }

  public registerUser(userId: UserId, email: string, username: string): void {
    this.users.set(userId, { email, username });
  }

  public async createSession(session: QuizSession): Promise<QuizSession> {
    this.sessions.set(session.id, session);
    return session;
  }

  public async getSessionById(sessionId: SessionId): Promise<QuizSession | null> {
    return this.sessions.get(sessionId) ?? null;
  }

  public async updateSession(session: QuizSession): Promise<QuizSession> {
    this.sessions.set(session.id, session);
    return session;
  }

  public async createAttempt(attempt: Attempt): Promise<Attempt> {
    this.attempts.set(attempt.id, attempt);
    return attempt;
  }

  public async getAttemptsBySessionId(sessionId: SessionId): Promise<Attempt[]> {
    const results: Attempt[] = [];
    for (const att of this.attempts.values()) {
      if (att.sessionId === sessionId) {
        results.push(att);
      }
    }
    return results;
  }

  public async getAttemptsByUserId(userId: UserId): Promise<Attempt[]> {
    const results: Attempt[] = [];
    for (const att of this.attempts.values()) {
      if (att.userId === userId) {
        results.push(att);
      }
    }
    return results;
  }

  public async getQuestionById(questionId: QuestionId): Promise<Question | null> {
    return this.questions.get(questionId) ?? null;
  }

  public async getQuestionsByDomain(domainId?: DomainId | null, limit = 40): Promise<Question[]> {
    const results: Question[] = [];
    for (const q of this.questions.values()) {
      if (!domainId || q.domainId === domainId) {
        results.push(q);
      }
      if (results.length >= limit) break;
    }
    return results;
  }

  public async exportUserData(userId: UserId, includeAttempts: boolean): Promise<CandidateExportData> {
    const userMeta = this.users.get(userId) ?? {
      email: `${userId}@cloudfix.edu`,
      username: `user_${userId}`,
    };

    const userSessions: QuizSession[] = [];
    for (const sess of this.sessions.values()) {
      if (sess.userId === userId) {
        userSessions.push(sess);
      }
    }

    const userAttempts: Attempt[] = [];
    if (includeAttempts) {
      for (const att of this.attempts.values()) {
        if (att.userId === userId) {
          userAttempts.push(att);
        }
      }
    }

    return {
      candidate: {
        userId,
        email: userMeta.email,
        username: userMeta.username,
      },
      sessionsCount: userSessions.length,
      attemptsCount: userAttempts.length,
      exportedAt: new Date().toISOString(),
      sessions: userSessions.map((s) => ({
        sessionId: s.id,
        domainId: s.domainId,
        status: s.status,
        score: s.score,
      })),
      attempts: userAttempts.map((a) => ({
        attemptId: a.id,
        sessionId: a.sessionId,
        questionId: a.questionId,
        selectedIndex: a.selectedIndex,
        isCorrect: a.isCorrect,
        timeTakenMs: a.timeTakenMs,
      })),
    };
  }

  public async deleteUserCascade(userId: UserId): Promise<{ deleted: true; count: number }> {
    let deletedCount = 0;

    // Delete attempts
    for (const [id, att] of this.attempts.entries()) {
      if (att.userId === userId) {
        this.attempts.delete(id);
        deletedCount += 1;
      }
    }

    // Delete sessions
    for (const [id, sess] of this.sessions.entries()) {
      if (sess.userId === userId) {
        this.sessions.delete(id);
        deletedCount += 1;
      }
    }

    // Delete profile
    if (this.users.has(userId)) {
      this.users.delete(userId);
      deletedCount += 1;
    }

    return { deleted: true, count: deletedCount };
  }

  public async forceDatabaseError(type: 'syntax' | 'constraint' | 'rls' = 'syntax'): Promise<never> {
    if (type === 'constraint') {
      throw new Error('duplicate key value violates unique constraint "users_email_key" DETAIL: Key (email)=(test@example.com) already exists.');
    }
    if (type === 'rls') {
      throw new Error('new row violates row-level security policy for table "quiz_sessions"');
    }
    throw new Error('syntax error at or near "SELECT FROM WHERE" in PostgreSQL query execution.');
  }
}

export const quizRepository = new InMemoryQuizRepository();
