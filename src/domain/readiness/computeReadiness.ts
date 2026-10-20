import { Attempt } from '../model/Attempt.ts';
import { DomainId, UserId, makeDomainId } from '../model/Ids.ts';
import {
  ReadinessScore,
  DomainScoreDetail,
  EvaluationGrade,
} from '../model/ReadinessScore.ts';

export interface DomainWeightConfig {
  readonly domainId: DomainId;
  readonly domainTitle: string;
  readonly weightPct: number;
}

export const DEFAULT_DOMAIN_WEIGHTS: readonly DomainWeightConfig[] = [
  {
    domainId: makeDomainId('DOM-CONCEPTS'),
    domainTitle: 'Cloud Fundamentals & Architectures',
    weightPct: 28, // 25-30% range
  },
  {
    domainId: makeDomainId('DOM-SERVICES'),
    domainTitle: 'Compute, Storage & Networking Services',
    weightPct: 37, // 35-40% range
  },
  {
    domainId: makeDomainId('DOM-SECURITY'),
    domainTitle: 'Identity, Governance & Compliance Controls',
    weightPct: 35, // 30-35% range
  },
] as const;

export interface QuestionDomainLookup {
  readonly [questionId: string]: DomainId;
}

export interface ComputeReadinessInput {
  readonly userId: UserId;
  readonly attempts: readonly Attempt[];
  readonly questionDomainMap: QuestionDomainLookup;
  readonly evaluationTime: Date;
  readonly halfLifeDays?: number;
  readonly domainWeights?: readonly DomainWeightConfig[];
}

/**
 * Computes deterministic multi-domain candidate readiness scores.
 *
 * Mathematical Specification:
 * 1. Recency Decay:
 *    Age in days: A_i = max(0, (T_eval - T_i) / 86,400,000 ms)
 *    Decay Factor: w_i = 0.5 ^ (A_i / T_half), where T_half defaults to 14 days.
 * 2. Domain Accuracy:
 *    Accuracy_d = (sum_{i in d} (w_i * isCorrect_i) / sum_{i in d} w_i) * 100
 *    If sum(w_i) == 0 (no attempts), Accuracy_d = 0.
 * 3. Overall Weighted Score:
 *    OverallScore = sum_d (WeightPct_d * Accuracy_d) / 100
 * 4. Evaluation Grade:
 *    - Overall >= 70% and every domain >= 60% -> 'READY'
 *    - Overall >= 50% -> 'REVIEW_REQUIRED'
 *    - Overall < 50% -> 'NOT_READY'
 *
 * Purity: Strictly synchronous, deterministic, and pure. Zero side effects or external imports.
 */
export function computeReadiness(input: ComputeReadinessInput): ReadinessScore {
  const halfLifeDays = input.halfLifeDays ?? 14;
  const weights = input.domainWeights ?? DEFAULT_DOMAIN_WEIGHTS;
  const evalTimeMs = input.evaluationTime.getTime();

  // Accumulate recency-weighted accuracy per domain
  const domainAccumulators = new Map<
    DomainId,
    { weightedSum: number; totalWeight: number; attemptsCount: number }
  >();

  for (const cfg of weights) {
    domainAccumulators.set(cfg.domainId, {
      weightedSum: 0,
      totalWeight: 0,
      attemptsCount: 0,
    });
  }

  for (const attempt of input.attempts) {
    const domainId = input.questionDomainMap[attempt.questionId];
    if (!domainId) continue;

    const accum = domainAccumulators.get(domainId);
    if (!accum) continue;

    const attemptTimeMs = attempt.createdAt.getTime();
    const ageDays = Math.max(0, (evalTimeMs - attemptTimeMs) / (1000 * 60 * 60 * 24));
    const recencyWeight = Math.pow(0.5, ageDays / halfLifeDays);

    accum.totalWeight += recencyWeight;
    accum.attemptsCount += 1;
    if (attempt.isCorrect) {
      accum.weightedSum += recencyWeight;
    }
  }

  const domainBreakdown: DomainScoreDetail[] = [];
  let aggregateWeightedSum = 0;
  let totalWeightsAssigned = 0;

  for (const cfg of weights) {
    const accum = domainAccumulators.get(cfg.domainId)!;
    const accuracyPct =
      accum.totalWeight > 0
        ? Number(((accum.weightedSum / accum.totalWeight) * 100).toFixed(2))
        : 0;

    const weightedScore = Number(((accuracyPct * cfg.weightPct) / 100).toFixed(2));
    aggregateWeightedSum += weightedScore;
    totalWeightsAssigned += cfg.weightPct;

    domainBreakdown.push({
      domainId: cfg.domainId,
      domainTitle: cfg.domainTitle,
      weightPct: cfg.weightPct,
      accuracyPct,
      weightedScore,
      attemptsCount: accum.attemptsCount,
    });
  }

  const rawOverall =
    totalWeightsAssigned > 0
      ? (aggregateWeightedSum / totalWeightsAssigned) * 100
      : 0;
  const roundedOverall = Math.max(0, Math.min(100, Math.round(rawOverall)));

  // Determine Grade
  const allDomainsPassing = domainBreakdown.every((d) => d.accuracyPct >= 60);

  let evaluationGrade: EvaluationGrade = 'NOT_READY';
  if (roundedOverall >= 70 && allDomainsPassing) {
    evaluationGrade = 'READY';
  } else if (roundedOverall >= 50) {
    evaluationGrade = 'REVIEW_REQUIRED';
  } else {
    evaluationGrade = 'NOT_READY';
  }

  return {
    userId: input.userId,
    overallScore: roundedOverall,
    evaluationGrade,
    domainBreakdown,
    totalAttemptsEvaluated: input.attempts.length,
    calculatedAt: input.evaluationTime,
  };
}
