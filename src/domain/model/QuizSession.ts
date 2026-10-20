import { z } from 'zod';
import {
  SessionId,
  SessionIdSchema,
  UserId,
  UserIdSchema,
  DomainId,
  DomainIdSchema,
} from './Ids.ts';

export const QuizLifecycleStatusValues = [
  'IN_PROGRESS',
  'RESOLVED',
  'TIMED_OUT',
  'ABANDONED',
] as const;
export type QuizLifecycleStatus = (typeof QuizLifecycleStatusValues)[number];

export interface QuizSession {
  readonly id: SessionId;
  readonly userId: UserId;
  readonly domainId: DomainId | null;
  readonly status: QuizLifecycleStatus;
  readonly score: number;
  readonly totalQuestions: number;
  readonly startedAt: Date;
  readonly completedAt: Date | null;
}

export const QuizSessionSchema = z.object({
  id: SessionIdSchema,
  userId: UserIdSchema,
  domainId: DomainIdSchema.nullable(),
  status: z.enum(QuizLifecycleStatusValues),
  score: z.number().int().min(0).max(100),
  totalQuestions: z.number().int().positive(),
  startedAt: z.date(),
  completedAt: z.date().nullable(),
});

export function createQuizSession(raw: unknown): QuizSession {
  return QuizSessionSchema.parse(raw);
}
