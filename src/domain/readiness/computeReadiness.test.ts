import { describe, it, expect } from 'vitest';
import { computeReadiness, ComputeReadinessInput } from './computeReadiness.ts';
import { Attempt } from '../model/Attempt.ts';
import {
  makeAttemptId,
  makeDomainId,
  makeQuestionId,
  makeSessionId,
  makeUserId,
} from '../model/Ids.ts';

function createTestAttempt(
  id: string,
  questionId: string,
  isCorrect: boolean,
  daysAgo: number,
  baseDate: Date
): Attempt {
  const createdAt = new Date(baseDate.getTime() - daysAgo * 24 * 60 * 60 * 1000);
  return {
    id: makeAttemptId(`att-${id}`),
    sessionId: makeSessionId('ses-1'),
    userId: makeUserId('usr-alice'),
    questionId: makeQuestionId(questionId),
    selectedIndex: isCorrect ? 0 : 1,
    isCorrect,
    timeTakenMs: 2000,
    createdAt,
  };
}

describe('computeReadiness (Pure Domain Algorithm)', () => {
  const evalDate = new Date('2026-10-19T12:00:00Z');
  const userId = makeUserId('usr-alice');

  const qMap: Record<string, ReturnType<typeof makeDomainId>> = {
    'q-c1': makeDomainId('DOM-CONCEPTS'),
    'q-c2': makeDomainId('DOM-CONCEPTS'),
    'q-s1': makeDomainId('DOM-SERVICES'),
    'q-s2': makeDomainId('DOM-SERVICES'),
    'q-sec1': makeDomainId('DOM-SECURITY'),
    'q-sec2': makeDomainId('DOM-SECURITY'),
  };

  it('evaluates empty attempts as 0 score and NOT_READY', () => {
    const input: ComputeReadinessInput = {
      userId,
      attempts: [],
      questionDomainMap: qMap,
      evaluationTime: evalDate,
    };
    const result = computeReadiness(input);
    expect(result.overallScore).toBe(0);
    expect(result.evaluationGrade).toBe('NOT_READY');
    expect(result.totalAttemptsEvaluated).toBe(0);
  });

  it('awards READY when all domains >= 60% and overall >= 70%', () => {
    const attempts = [
      createTestAttempt('1', 'q-c1', true, 1, evalDate),
      createTestAttempt('2', 'q-c2', true, 1, evalDate),
      createTestAttempt('3', 'q-s1', true, 1, evalDate),
      createTestAttempt('4', 'q-s2', true, 1, evalDate),
      createTestAttempt('5', 'q-sec1', true, 1, evalDate),
      createTestAttempt('6', 'q-sec2', true, 1, evalDate),
    ];
    const result = computeReadiness({
      userId,
      attempts,
      questionDomainMap: qMap,
      evaluationTime: evalDate,
    });
    expect(result.overallScore).toBe(100);
    expect(result.evaluationGrade).toBe('READY');
  });

  it('assigns REVIEW_REQUIRED if overall >= 70% but one domain is below 60%', () => {
    const attempts = [
      createTestAttempt('1', 'q-c1', true, 1, evalDate),
      createTestAttempt('2', 'q-c2', true, 1, evalDate),
      createTestAttempt('3', 'q-s1', true, 1, evalDate),
      createTestAttempt('4', 'q-s2', true, 1, evalDate),
      // Security: both wrong -> 0%
      createTestAttempt('5', 'q-sec1', false, 1, evalDate),
      createTestAttempt('6', 'q-sec2', false, 1, evalDate),
    ];
    const result = computeReadiness({
      userId,
      attempts,
      questionDomainMap: qMap,
      evaluationTime: evalDate,
    });
    // Overall = 28% + 37% + 0% = 65%
    expect(result.overallScore).toBe(65);
    expect(result.evaluationGrade).toBe('REVIEW_REQUIRED');
  });

  it('assigns NOT_READY if overall is below 50%', () => {
    const attempts = [
      createTestAttempt('1', 'q-c1', true, 1, evalDate),
      createTestAttempt('2', 'q-c2', false, 1, evalDate),
      createTestAttempt('3', 'q-s1', false, 1, evalDate),
      createTestAttempt('4', 'q-s2', false, 1, evalDate),
      createTestAttempt('5', 'q-sec1', false, 1, evalDate),
      createTestAttempt('6', 'q-sec2', false, 1, evalDate),
    ];
    const result = computeReadiness({
      userId,
      attempts,
      questionDomainMap: qMap,
      evaluationTime: evalDate,
    });
    expect(result.overallScore).toBeLessThan(50);
    expect(result.evaluationGrade).toBe('NOT_READY');
  });

  it('applies exponential recency decay (recent correct attempt outweighs old wrong attempt)', () => {
    // Question c1: wrong 28 days ago (2 half-lives -> weight 0.25)
    // Question c1: correct 0 days ago (0 half-lives -> weight 1.0)
    // Expected weighted accuracy = (1.0 * 1) / (1.0 + 0.25) = 1.0 / 1.25 = 80.0%
    const attempts = [
      createTestAttempt('old', 'q-c1', false, 28, evalDate),
      createTestAttempt('recent', 'q-c1', true, 0, evalDate),
    ];
    const result = computeReadiness({
      userId,
      attempts,
      questionDomainMap: qMap,
      evaluationTime: evalDate,
      halfLifeDays: 14,
    });
    const conceptsDomain = result.domainBreakdown.find((d) => d.domainId === 'DOM-CONCEPTS');
    expect(conceptsDomain).toBeDefined();
    expect(conceptsDomain?.accuracyPct).toBeCloseTo(80.0, 1);
  });

  it('passes 100-run Determinism Verification: identical output on 100 repeated executions', () => {
    const attempts = [
      createTestAttempt('1', 'q-c1', true, 3, evalDate),
      createTestAttempt('2', 'q-c2', false, 10, evalDate),
      createTestAttempt('3', 'q-s1', true, 1, evalDate),
      createTestAttempt('4', 'q-s2', true, 14, evalDate),
      createTestAttempt('5', 'q-sec1', false, 2, evalDate),
      createTestAttempt('6', 'q-sec2', true, 0, evalDate),
    ];
    const input: ComputeReadinessInput = {
      userId,
      attempts,
      questionDomainMap: qMap,
      evaluationTime: evalDate,
    };

    const baselineJson = JSON.stringify(computeReadiness(input));

    for (let run = 1; run <= 100; run++) {
      const currentJson = JSON.stringify(computeReadiness(input));
      expect(currentJson).toBe(baselineJson);
    }
  });
});
