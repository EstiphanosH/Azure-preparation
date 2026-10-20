/**
 * Downstream Test Contract: AC-06
 * Story: US-06 - 3-Tier Progressive Hint Ladder
 */

import { loadScenario, requestNextHint } from '../../src/engine/diagnosticEngine.ts';

export async function testAC06_1(): Promise<{ passed: boolean; message: string; elapsedMs: number }> {
  let state = loadScenario('SCN-01');

  const t0 = performance.now();
  // AC-06-1: Given an active scenario with hint tier 0 and base score 100,
  // When user triggers Request Hint Tier 1,
  // Then system reveals hint text for tier 1 in <= 20 ms and deducts 10 points from potential score (max 90).
  state = requestNextHint(state, 3);
  const elapsedMs = performance.now() - t0;

  const passed =
    state.hintsUnlocked === 1 &&
    state.score === 90 &&
    elapsedMs <= 20;

  return {
    passed,
    message: passed
      ? `AC-06-1 PASSED: Hint tier 1 unlocked, score deducted to 90 in ${elapsedMs.toFixed(2)} ms (<= 20 ms).`
      : `AC-06-1 FAILED: hintsUnlocked=${state.hintsUnlocked}, score=${state.score}, elapsedMs=${elapsedMs}`,
    elapsedMs,
  };
}

export async function testAC06_2(): Promise<{ passed: boolean; message: string; elapsedMs: number }> {
  let state = loadScenario('SCN-01');

  // Request all 3 hints
  state = requestNextHint(state, 3);
  state = requestNextHint(state, 3);
  state = requestNextHint(state, 3);

  const t0 = performance.now();
  // AC-06-2: Given hint tier 3 is already active,
  // When user attempts to request an additional hint,
  // Then hint request control disables and hint counter remains clamped at 3 with cumulative deduction of 30 points.
  state = requestNextHint(state, 3);
  const elapsedMs = performance.now() - t0;

  const passed =
    state.hintsUnlocked === 3 &&
    state.score === 70 &&
    elapsedMs <= 20;

  return {
    passed,
    message: passed
      ? `AC-06-2 PASSED: Hint counter clamped at 3, score clamped at 70 (-30 points).`
      : `AC-06-2 FAILED: hintsUnlocked=${state.hintsUnlocked}, score=${state.score}`,
    elapsedMs,
  };
}

import { describe, it, expect } from 'vitest';

describe('AC-06 Tests', () => {
  it('AC-06-1 executes and passes', async () => {
    const res = await testAC06_1();
    expect(res.passed).toBe(true);
  });
  it('AC-06-2 executes and passes', async () => {
    const res = await testAC06_2();
    expect(res.passed).toBe(true);
  });
});

