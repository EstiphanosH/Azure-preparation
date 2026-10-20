import { z } from 'zod';
import { DomainId, DomainIdSchema, UserId, UserIdSchema } from './Ids.ts';

export const EvaluationGradeValues = [
  'READY',
  'REVIEW_REQUIRED',
  'NOT_READY',
] as const;
export type EvaluationGrade = (typeof EvaluationGradeValues)[number];

export interface DomainScoreDetail {
  readonly domainId: DomainId;
  readonly domainTitle: string;
  readonly weightPct: number;
  readonly accuracyPct: number;
  readonly weightedScore: number;
  readonly attemptsCount: number;
}

export interface ReadinessScore {
  readonly userId: UserId;
  readonly overallScore: number;
  readonly evaluationGrade: EvaluationGrade;
  readonly domainBreakdown: readonly DomainScoreDetail[];
  readonly totalAttemptsEvaluated: number;
  readonly calculatedAt: Date;
}

export const ReadinessScoreSchema = z.object({
  userId: UserIdSchema,
  overallScore: z.number().min(0).max(100),
  evaluationGrade: z.enum(EvaluationGradeValues),
  domainBreakdown: z.array(
    z.object({
      domainId: DomainIdSchema,
      domainTitle: z.string(),
      weightPct: z.number().min(0).max(100),
      accuracyPct: z.number().min(0).max(100),
      weightedScore: z.number().min(0).max(100),
      attemptsCount: z.number().int().nonnegative(),
    })
  ),
  totalAttemptsEvaluated: z.number().int().nonnegative(),
  calculatedAt: z.date(),
});
