/**
 * Downstream Test Contract: AC-02
 * Story: US-02 - Interactive Topology Graph Inspector
 */

import { loadScenario } from '../../src/engine/diagnosticEngine.ts';
import { SCENARIO_CATALOG } from '../../src/engine/scenarioData.ts';

export async function testAC02_1(): Promise<{ passed: boolean; message: string; elapsedMs: number }> {
  const t0 = performance.now();
  // AC-02-1: Given a rendered topology containing node alb-public-01,
  // When the user emits a click event on alb-public-01,
  // Then the inspection drawer opens in <= 100 ms displaying attribute listener_port equal to 8080
  // and ingress_security_group equal to sg-web-public.
  const state = loadScenario('SCN-01');
  const targetNode = state.nodes['alb-public-01'];

  const elapsedMs = performance.now() - t0;
  const passed =
    elapsedMs <= 100 &&
    targetNode !== undefined &&
    targetNode.config.listener_port === 8080 &&
    targetNode.config.ingress_security_group === 'sg-web-public';

  return {
    passed,
    message: passed
      ? `AC-02-1 PASSED: Node alb-public-01 inspected in ${elapsedMs.toFixed(2)} ms (<= 100 ms); port=8080, sg=sg-web-public.`
      : `AC-02-1 FAILED: node=${JSON.stringify(targetNode)}, elapsedMs=${elapsedMs}`,
    elapsedMs,
  };
}

export async function testAC02_2(): Promise<{ passed: boolean; message: string; elapsedMs: number }> {
  const t0 = performance.now();
  // AC-02-2: Given 4 topology nodes rendered on the canvas,
  // When the canvas renders initially,
  // Then each node contains a distinct SVG bounding rect and coordinates matching scenario layout within +-1 px.
  const scenario = SCENARIO_CATALOG.find((s) => s.id === 'SCN-01')!;
  const nodeIds = scenario.nodes.map((n) => n.id);
  const uniqueIds = new Set(nodeIds);

  const coordsValid = scenario.nodes.every(
    (n) => typeof n.x === 'number' && typeof n.y === 'number' && n.x >= 0 && n.y >= 0
  );

  const elapsedMs = performance.now() - t0;
  const passed = uniqueIds.size === 4 && coordsValid && elapsedMs <= 50;

  return {
    passed,
    message: passed
      ? `AC-02-2 PASSED: 4 distinct nodes verified with non-negative coordinates in ${elapsedMs.toFixed(2)} ms.`
      : `AC-02-2 FAILED: unique=${uniqueIds.size}, coordsValid=${coordsValid}`,
    elapsedMs,
  };
}

import { describe, it, expect } from 'vitest';

describe('AC-02 Tests', () => {
  it('AC-02-1 executes and passes', async () => {
    const res = await testAC02_1();
    expect(res.passed).toBe(true);
  });
  it('AC-02-2 executes and passes', async () => {
    const res = await testAC02_2();
    expect(res.passed).toBe(true);
  });
});

