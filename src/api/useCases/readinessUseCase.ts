import { z } from 'zod';
import { GetReadinessQuerySchema, ReadinessScoreResponseSchema } from '../schemas/index.ts';
import { ApiError } from '../errors.ts';
import { IQuizRepository, quizRepository } from '../repositories/quizRepository.ts';
import { makeUserId, QuestionId } from '../../domain/model/Ids.ts';
import { computeReadiness, QuestionDomainLookup } from '../../domain/readiness/computeReadiness.ts';

export class ReadinessUseCase {
  constructor(private repo: IQuizRepository = quizRepository) {}

  public async getReadiness(
    rawQuery: unknown,
    userIdStr: string
  ): Promise<{ ok: true; data: z.infer<typeof ReadinessScoreResponseSchema> } | { ok: false; error: ApiError }> {
    const parsed = GetReadinessQuerySchema.safeParse(rawQuery ?? {});
    if (!parsed.success) {
      return {
        ok: false,
        error: {
          kind: 'ValidationError',
          statusCode: 400,
          message: 'Invalid readiness query parameters.',
          issues: parsed.error.issues.map((i) => i.message),
        },
      };
    }

    const userId = makeUserId(userIdStr);
    const attempts = await this.repo.getAttemptsByUserId(userId);
    const questions = await this.repo.getQuestionsByDomain(null, 200);

    const questionDomainMap: Record<string, string> = {};
    for (const q of questions) {
      questionDomainMap[q.id] = q.domainId;
    }

    // Pure domain execution - zero business logic in use case
    const domainReadiness = computeReadiness({
      userId,
      attempts,
      questionDomainMap: questionDomainMap as QuestionDomainLookup,
      evaluationTime: new Date(),
      halfLifeDays: parsed.data.halfLifeDays,
    });

    const response = ReadinessScoreResponseSchema.parse({
      userId: domainReadiness.userId,
      overallScore: domainReadiness.overallScore,
      evaluationGrade: domainReadiness.evaluationGrade,
      domainBreakdown: domainReadiness.domainBreakdown.map((d) => ({
        domainId: d.domainId,
        domainTitle: d.domainTitle,
        weightPct: d.weightPct,
        accuracyPct: d.accuracyPct,
        weightedScore: d.weightedScore,
        attemptsCount: d.attemptsCount,
      })),
      totalAttemptsEvaluated: domainReadiness.totalAttemptsEvaluated,
      calculatedAt: domainReadiness.calculatedAt.toISOString(),
    });

    return { ok: true, data: response };
  }
}

export const readinessUseCase = new ReadinessUseCase();
