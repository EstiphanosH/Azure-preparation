/**
 * Downstream Test Contract: AC-03
 * Story: US-03 - Configuration Patch Application & Immutability
 */

import { loadScenario, applyNodePatch } from '../../src/engine/diagnosticEngine.ts';
import { SCENARIO_CATALOG } from '../../src/engine/scenarioData.ts';

export async function testAC03_1(): Promise<{ passed: boolean; message: string; elapsedMs: number }> {
  const scenario = SCENARIO_CATALOG.find((s) => s.id === 'SCN-01')!;
  const state = loadScenario('SCN-01');

  const t0 = performance.now();
  // AC-03-1: Given node alb-public-01 with listener_port: 8080,
  // When user dispatches patch payload { listener_port: 443 },
  // Then active state updates listener_port to 443 in <= 30 ms and records 1 revision entry in local history array.
  const result = applyNodePatch(state, scenario, 'alb-public-01', 'listener_port', 443);
  const elapsedMs = performance.now() - t0;

  const passed =
    result.success &&
    result.state.nodes['alb-public-01'].config.listener_port === 443 &&
    result.state.appliedPatches.length === 1 &&
    result.state.historyCount === 1 &&
    elapsedMs <= 30;

  return {
    passed,
    message: passed
      ? `AC-03-1 PASSED: Port updated to 443 in ${elapsedMs.toFixed(2)} ms (<= 30 ms); history count=1.`
      : `AC-03-1 FAILED: success=${result.success}, port=${result.state.nodes['alb-public-01']?.config?.listener_port}, elapsedMs=${elapsedMs}`,
    elapsedMs,
  };
}

export async function testAC03_2(): Promise<{ passed: boolean; message: string; elapsedMs: number }> {
  const scenario = SCENARIO_CATALOG.find((s) => s.id === 'SCN-01')!;
  const state = loadScenario('SCN-01');

  const t0 = performance.now();
  // AC-03-2: Given an existing node configuration,
  // When user dispatches invalid port value -1 or 99999,
  // Then patch validator rejects change with validation message PORT_RANGE_INVALID_1_TO_65535
  // and leaves node state unchanged.
  const result = applyNodePatch(state, scenario, 'alb-public-01', 'listener_port', 99999);
  const elapsedMs = performance.now() - t0;

  const passed =
    !result.success &&
    result.error === 'PORT_RANGE_INVALID_1_TO_65535' &&
    result.state.nodes['alb-public-01'].config.listener_port === 8080;

  return {
    passed,
    message: passed
      ? `AC-03-2 PASSED: Invalid port 99999 rejected with PORT_RANGE_INVALID_1_TO_65535; node preserved.`
      : `AC-03-2 FAILED: success=${result.success}, error=${result.error}`,
    elapsedMs,
  };
}

import { describe, it, expect } from 'vitest';

describe('AC-03 Tests', () => {
  it('AC-03-1 executes and passes', async () => {
    const res = await testAC03_1();
    expect(res.passed).toBe(true);
  });
  it('AC-03-2 executes and passes', async () => {
    const res = await testAC03_2();
    expect(res.passed).toBe(true);
  });
});

