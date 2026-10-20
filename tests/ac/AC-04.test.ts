/**
 * Downstream Test Contract: AC-04
 * Story: US-04 - Deterministic Diagnostic Verification Engine
 */

import { loadScenario, applyNodePatch } from '../../src/engine/diagnosticEngine.ts';
import { SCENARIO_CATALOG } from '../../src/engine/scenarioData.ts';

export async function testAC04_1(): Promise<{ passed: boolean; message: string; elapsedMs: number }> {
  const t0 = performance.now();
  // AC-04-1: Given an unpatched SCN-01 topology state with 3 verification rules,
  // When diagnostic evaluator runs,
  // Then exactly 2 rules evaluate to FAILED and 1 rule evaluates to PASSED within <= 50 ms.
  const state = loadScenario('SCN-01');
  const elapsedMs = performance.now() - t0;

  const failedCount = state.ruleResults.filter((r) => !r.passed).length;
  const passedCount = state.ruleResults.filter((r) => r.passed).length;

  const passed =
    failedCount === 2 &&
    passedCount === 1 &&
    state.ruleResults.length === 3 &&
    elapsedMs <= 50;

  return {
    passed,
    message: passed
      ? `AC-04-1 PASSED: Unpatched state has 2 FAILED and 1 PASSED rules in ${elapsedMs.toFixed(2)} ms (<= 50 ms).`
      : `AC-04-1 FAILED: failed=${failedCount}, passed=${passedCount}, elapsedMs=${elapsedMs}`,
    elapsedMs,
  };
}

export async function testAC04_2(): Promise<{ passed: boolean; message: string; elapsedMs: number }> {
  const scenario = SCENARIO_CATALOG.find((s) => s.id === 'SCN-01')!;
  let state = loadScenario('SCN-01');

  // Remediate both defects
  state = applyNodePatch(state, scenario, 'alb-public-01', 'listener_port', 443).state;
  state = applyNodePatch(state, scenario, 'subnet-app-private', 'route_target', 'nat-gateway-01').state;

  const t0 = performance.now();
  // AC-04-2: Given patched node states where listener_port == 443 and route_target == nat-gateway-01,
  // When diagnostic evaluator runs, Then 3 of 3 rules evaluate to PASSED within <= 50 ms
  // and overall topology health flag transitions to HEALTHY.
  const allPassed = state.ruleResults.every((r) => r.passed);
  const elapsedMs = performance.now() - t0;

  const passed = allPassed && state.ruleResults.length === 3 && elapsedMs <= 50 && state.status === 'RESOLVED';

  return {
    passed,
    message: passed
      ? `AC-04-2 PASSED: All 3 rules PASSED, state is RESOLVED in ${elapsedMs.toFixed(2)} ms (<= 50 ms).`
      : `AC-04-2 FAILED: allPassed=${allPassed}, status=${state.status}, elapsedMs=${elapsedMs}`,
    elapsedMs,
  };
}

import { describe, it, expect } from 'vitest';

describe('AC-04 Tests', () => {
  it('AC-04-1 executes and passes', async () => {
    const res = await testAC04_1();
    expect(res.passed).toBe(true);
  });
  it('AC-04-2 executes and passes', async () => {
    const res = await testAC04_2();
    expect(res.passed).toBe(true);
  });
});

