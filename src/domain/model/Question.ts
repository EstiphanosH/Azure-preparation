import { z } from 'zod';
import { QuestionId, QuestionIdSchema, DomainId, DomainIdSchema } from './Ids.ts';
import { Difficulty, DifficultySchema } from './Difficulty.ts';

export interface Question {
  readonly id: QuestionId;
  readonly domainId: DomainId;
  readonly difficulty: Difficulty;
  readonly prompt: string;
  readonly options: readonly [string, string, string, string];
  readonly correctAnswerIndex: 0 | 1 | 2 | 3;
  readonly explanation: string;
  readonly sourceOutlineTheme: string;
}

export const QuestionSchema = z.object({
  id: QuestionIdSchema,
  domainId: DomainIdSchema,
  difficulty: DifficultySchema,
  prompt: z.string().min(10, 'Prompt must be at least 10 characters'),
  options: z.tuple([
    z.string().min(1),
    z.string().min(1),
    z.string().min(1),
    z.string().min(1),
  ]),
  correctAnswerIndex: z.union([
    z.literal(0),
    z.literal(1),
    z.literal(2),
    z.literal(3),
  ]),
  explanation: z.string().min(10),
  sourceOutlineTheme: z.string().min(3),
});

export function createQuestion(raw: unknown): Question {
  return QuestionSchema.parse(raw);
}
