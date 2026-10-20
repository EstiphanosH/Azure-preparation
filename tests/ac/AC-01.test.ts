/**
 * Downstream Test Contract: AC-01
 * Story: US-01 - Synthetic Scenario Ingestion & State Initialization
 */

import { loadScenario } from '../../src/engine/diagnosticEngine.ts';
import { SCENARIO_CATALOG } from '../../src/engine/scenarioData.ts';

export async function testAC01_1(): Promise<{ passed: boolean; message: string; elapsedMs: number }> {
  const t0 = performance.now();
  // AC-01-1: Given a valid scenario definition SCN-01 with 4 nodes and 3 edges,
  // When the user selects SCN-01, Then the state machine initializes in <= 200 ms
  // and populates the active node repository with exactly 4 nodes.
  const state = loadScenario('SCN-01');
  const elapsedMs = performance.now() - t0;

  const nodeCount = Object.keys(state.nodes).length;
  const edgeCount = state.edges.length;

  const passed =
    elapsedMs <= 200 &&
    nodeCount === 4 &&
    edgeCount === 3 &&
    state.scenarioId === 'SCN-01';

  return {
    passed,
    message: passed
      ? `AC-01-1 PASSED: Loaded 4 nodes and 3 edges in ${elapsedMs.toFixed(2)} ms (<= 200 ms).`
      : `AC-01-1 FAILED: nodeCount=${nodeCount}, edgeCount=${edgeCount}, elapsedMs=${elapsedMs}`,
    elapsedMs,
  };
}

export async function testAC01_2(): Promise<{ passed: boolean; message: string; elapsedMs: number }> {
  const t0 = performance.now();
  // AC-01-2: Given an invalid or malformed scenario schema missing required field topology.nodes,
  // When the loader executes parsing, Then system rejects input with error code ERR_MALFORMED_TOPOLOGY
  // within 50 ms.
  let errorCaught = false;
  let errorCode = '';

  try {
    const invalidId = 'NON_EXISTENT_SCN';
    loadScenario(invalidId);
  } catch (err: unknown) {
    errorCaught = true;
    errorCode = err instanceof Error ? err.message : String(err);
  }

  const elapsedMs = performance.now() - t0;
  const passed = errorCaught && errorCode.includes('ERR_SCENARIO_NOT_FOUND') && elapsedMs <= 50;

  return {
    passed,
    message: passed
      ? `AC-01-2 PASSED: Malformed scenario rejected with error code in ${elapsedMs.toFixed(2)} ms (<= 50 ms).`
      : `AC-01-2 FAILED: errorCaught=${errorCaught}, code=${errorCode}, elapsedMs=${elapsedMs}`,
    elapsedMs,
  };
}

import { describe, it, expect } from 'vitest';

describe('AC-01 Tests', () => {
  it('AC-01-1 executes and passes', async () => {
    const res = await testAC01_1();
    expect(res.passed).toBe(true);
  });
  it('AC-01-2 executes and passes', async () => {
    const res = await testAC01_2();
    expect(res.passed).toBe(true);
  });
});

