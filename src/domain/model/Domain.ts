import { z } from 'zod';
import { DomainId, DomainIdSchema } from './Ids.ts';

export interface QuestionDomain {
  readonly id: DomainId;
  readonly title: string;
  readonly description: string;
  readonly displayOrder: number;
}

export const QuestionDomainSchema = z.object({
  id: DomainIdSchema,
  title: z.string().min(3),
  description: z.string().min(5),
  displayOrder: z.number().int().positive(),
});

export function createQuestionDomain(raw: unknown): QuestionDomain {
  return QuestionDomainSchema.parse(raw);
}
