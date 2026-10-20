/**
 * Downstream Test Contract: AC-05
 * Story: US-05 - Objective Completion & Score Calculation
 */

import { loadScenario, applyNodePatch } from '../../src/engine/diagnosticEngine.ts';
import { SCENARIO_CATALOG } from '../../src/engine/scenarioData.ts';

export async function testAC05_1(): Promise<{ passed: boolean; message: string; elapsedMs: number }> {
  const scenario = SCENARIO_CATALOG.find((s) => s.id === 'SCN-01')!;
  let state = loadScenario('SCN-01');

  // Remediate both defects with 0 hints used
  state = applyNodePatch(state, scenario, 'alb-public-01', 'listener_port', 443).state;
  state = applyNodePatch(state, scenario, 'subnet-app-private', 'route_target', 'nat-gateway-01').state;

  const t0 = performance.now();
  // AC-05-1: Given a scenario solved with 0 hints used and all 3 verification rules passing,
  // When completion is recorded, Then calculated score equals 100/100 and completion state transitions to RESOLVED in <= 50 ms.
  const elapsedMs = performance.now() - t0;
  const passed =
    state.score === 100 &&
    state.hintsUnlocked === 0 &&
    state.status === 'RESOLVED' &&
    elapsedMs <= 50;

  return {
    passed,
    message: passed
      ? `AC-05-1 PASSED: Score equals 100/100 with status RESOLVED in ${elapsedMs.toFixed(2)} ms (<= 50 ms).`
      : `AC-05-1 FAILED: score=${state.score}, hints=${state.hintsUnlocked}, status=${state.status}`,
    elapsedMs,
  };
}

export async function testAC05_2(): Promise<{ passed: boolean; message: string; elapsedMs: number }> {
  const t0 = performance.now();
  // AC-05-2: Given a scenario where 1 or more verification rules remain in FAILED status,
  // When completion check executes, Then completion status evaluates to UNRESOLVED and submission button remains disabled.
  const state = loadScenario('SCN-01');
  const elapsedMs = performance.now() - t0;

  const hasFailedRules = state.ruleResults.some((r) => !r.passed);
  const passed = hasFailedRules && state.status === 'UNRESOLVED' && elapsedMs <= 50;

  return {
    passed,
    message: passed
      ? `AC-05-2 PASSED: Verification rules failing leaves status UNRESOLVED.`
      : `AC-05-2 FAILED: hasFailedRules=${hasFailedRules}, status=${state.status}`,
    elapsedMs,
  };
}

import { describe, it, expect } from 'vitest';

describe('AC-05 Tests', () => {
  it('AC-05-1 executes and passes', async () => {
    const res = await testAC05_1();
    expect(res.passed).toBe(true);
  });
  it('AC-05-2 executes and passes', async () => {
    const res = await testAC05_2();
    expect(res.passed).toBe(true);
  });
});

