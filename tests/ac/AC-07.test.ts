/**
 * Downstream Test Contract: AC-07
 * Story: US-07 - Exportable Diagnostic Audit Log
 */

import { loadScenario, applyNodePatch, generateAuditLog } from '../../src/engine/diagnosticEngine.ts';
import { SCENARIO_CATALOG } from '../../src/engine/scenarioData.ts';

export async function testAC07_1(): Promise<{ passed: boolean; message: string; elapsedMs: number }> {
  const scenario = SCENARIO_CATALOG.find((s) => s.id === 'SCN-01')!;
  let state = loadScenario('SCN-01');

  // Apply 2 patches
  state = applyNodePatch(state, scenario, 'alb-public-01', 'listener_port', 443).state;
  state = applyNodePatch(state, scenario, 'subnet-app-private', 'route_target', 'nat-gateway-01').state;

  const t0 = performance.now();
  // AC-07-1: Given a completed scenario session with 2 applied patches,
  // When proctor clicks Export Audit Log,
  // Then a downloadable JSON document containing timestamp, 2 patch records, and final verification outcome is generated in <= 100 ms.
  const auditLog = generateAuditLog(state);
  const elapsedMs = performance.now() - t0;

  const passed =
    auditLog !== null &&
    auditLog.applied_patches.length === 2 &&
    auditLog.status === 'RESOLVED' &&
    elapsedMs <= 100;

  return {
    passed,
    message: passed
      ? `AC-07-1 PASSED: Audit record with 2 patches generated in ${elapsedMs.toFixed(2)} ms (<= 100 ms).`
      : `AC-07-1 FAILED: patches=${auditLog?.applied_patches?.length}, status=${auditLog?.status}`,
    elapsedMs,
  };
}

export async function testAC07_2(): Promise<{ passed: boolean; message: string; elapsedMs: number }> {
  const scenario = SCENARIO_CATALOG.find((s) => s.id === 'SCN-01')!;
  let state = loadScenario('SCN-01');
  state = applyNodePatch(state, scenario, 'alb-public-01', 'listener_port', 443).state;

  const t0 = performance.now();
  // AC-07-2: Given an exported audit log payload,
  // When schema validation executes against exported string,
  // Then output contains valid JSON with non-null properties scenario_id, total_elapsed_seconds, score, and applied_patches.
  const auditLog = generateAuditLog(state);
  const jsonString = JSON.stringify(auditLog);
  const parsed = JSON.parse(jsonString);
  const elapsedMs = performance.now() - t0;

  const passed =
    parsed.scenario_id === 'SCN-01' &&
    typeof parsed.total_elapsed_seconds === 'number' &&
    typeof parsed.score === 'number' &&
    Array.isArray(parsed.applied_patches) &&
    parsed.applied_patches.length === 1 &&
    elapsedMs <= 50;

  return {
    passed,
    message: passed
      ? `AC-07-2 PASSED: Valid JSON schema with all mandatory keys parsed in ${elapsedMs.toFixed(2)} ms.`
      : `AC-07-2 FAILED: parsed=${JSON.stringify(parsed)}`,
    elapsedMs,
  };
}

import { describe, it, expect } from 'vitest';

describe('AC-07 Tests', () => {
  it('AC-07-1 executes and passes', async () => {
    const res = await testAC07_1();
    expect(res.passed).toBe(true);
  });
  it('AC-07-2 executes and passes', async () => {
    const res = await testAC07_2();
    expect(res.passed).toBe(true);
  });
});

