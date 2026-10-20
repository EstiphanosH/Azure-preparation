import { z } from 'zod';
import {
  AttemptId,
  AttemptIdSchema,
  SessionId,
  SessionIdSchema,
  UserId,
  UserIdSchema,
  QuestionId,
  QuestionIdSchema,
} from './Ids.ts';

export interface Attempt {
  readonly id: AttemptId;
  readonly sessionId: SessionId;
  readonly userId: UserId;
  readonly questionId: QuestionId;
  readonly selectedIndex: 0 | 1 | 2 | 3;
  readonly isCorrect: boolean;
  readonly timeTakenMs: number;
  readonly createdAt: Date;
}

export const AttemptSchema = z.object({
  id: AttemptIdSchema,
  sessionId: SessionIdSchema,
  userId: UserIdSchema,
  questionId: QuestionIdSchema,
  selectedIndex: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
  ]),
  isCorrect: z.boolean(),
  timeTakenMs: z.number().int().nonnegative(),
  createdAt: z.date(),
});

export function createAttempt(raw: unknown): Attempt {
  return AttemptSchema.parse(raw);
}
