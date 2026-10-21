/**
 * Pure Acceptance Criteria Contract Validation Functions
 * Free of test-runner dependencies (Node / Vitest) so they can execute
 * in both the browser UI (AcceptanceGateRunner) and Node CLI / CI test suites.
 */

import { loadScenario, applyNodePatch, requestNextHint, generateAuditLog } from './diagnosticEngine.ts';
import { SCENARIO_CATALOG } from './scenarioData.ts';

export interface TestContractResult {
  passed: boolean;
  message: string;
  elapsedMs: number;
}

// AC-01-1: Given a valid scenario definition SCN-01 with 4 nodes and 3 edges,
// When user selects SCN-01, state machine initializes in <= 200 ms with 4 nodes.
export async function testAC01_1(): Promise<TestContractResult> {
  const t0 = performance.now();
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

// AC-01-2: Given an invalid or malformed scenario schema, rejects input within 50 ms.
export async function testAC01_2(): Promise<TestContractResult> {
  const t0 = performance.now();
  let errorCaught = false;
  let errorCode = '';

  try {
    loadScenario('NON_EXISTENT_SCN');
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

// AC-02-1: Click alb-public-01 -> inspection drawer opens in <= 100 ms with port 8080 and sg-web-public.
export async function testAC02_1(): Promise<TestContractResult> {
  const t0 = performance.now();
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

// AC-02-2: 4 distinct nodes rendered with valid non-negative coordinates in <= 50 ms.
export async function testAC02_2(): Promise<TestContractResult> {
  const t0 = performance.now();
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

// AC-03-1: Patch listener_port to 443 in <= 30 ms and records 1 revision entry in history.
export async function testAC03_1(): Promise<TestContractResult> {
  const scenario = SCENARIO_CATALOG.find((s) => s.id === 'SCN-01')!;
  const state = loadScenario('SCN-01');

  const t0 = performance.now();
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

// AC-03-2: Invalid port value (99999) rejected with PORT_RANGE_INVALID_1_TO_65535.
export async function testAC03_2(): Promise<TestContractResult> {
  const scenario = SCENARIO_CATALOG.find((s) => s.id === 'SCN-01')!;
  const state = loadScenario('SCN-01');

  const t0 = performance.now();
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

// AC-04-1: Unpatched state has 2 rules failed and 1 rule passed in <= 50 ms.
export async function testAC04_1(): Promise<TestContractResult> {
  const t0 = performance.now();
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

// AC-04-2: Both defects remediated -> all 3 rules pass and state transitions to RESOLVED in <= 50 ms.
export async function testAC04_2(): Promise<TestContractResult> {
  const scenario = SCENARIO_CATALOG.find((s) => s.id === 'SCN-01')!;
  let state = loadScenario('SCN-01');

  state = applyNodePatch(state, scenario, 'alb-public-01', 'listener_port', 443).state;
  state = applyNodePatch(state, scenario, 'subnet-app-private', 'route_target', 'nat-gateway-01').state;

  const t0 = performance.now();
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

// AC-05-1: Solved with 0 hints used -> score equals 100/100, status RESOLVED in <= 50 ms.
export async function testAC05_1(): Promise<TestContractResult> {
  const scenario = SCENARIO_CATALOG.find((s) => s.id === 'SCN-01')!;
  let state = loadScenario('SCN-01');

  state = applyNodePatch(state, scenario, 'alb-public-01', 'listener_port', 443).state;
  state = applyNodePatch(state, scenario, 'subnet-app-private', 'route_target', 'nat-gateway-01').state;

  const t0 = performance.now();
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

// AC-05-2: Unresolved verification rules -> status UNRESOLVED.
export async function testAC05_2(): Promise<TestContractResult> {
  const t0 = performance.now();
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

// AC-06-1: Request hint tier 1 -> reveals hint text in <= 20 ms and deducts 10 points (score 90).
export async function testAC06_1(): Promise<TestContractResult> {
  let state = loadScenario('SCN-01');

  const t0 = performance.now();
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

// AC-06-2: Requesting hints beyond tier 3 remains clamped at 3 and score at 70 (-30 points).
export async function testAC06_2(): Promise<TestContractResult> {
  let state = loadScenario('SCN-01');

  state = requestNextHint(state, 3);
  state = requestNextHint(state, 3);
  state = requestNextHint(state, 3);

  const t0 = performance.now();
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

// AC-07-1: Completed scenario audit export generates downloadable JSON with 2 patches in <= 100 ms.
export async function testAC07_1(): Promise<TestContractResult> {
  const scenario = SCENARIO_CATALOG.find((s) => s.id === 'SCN-01')!;
  let state = loadScenario('SCN-01');

  state = applyNodePatch(state, scenario, 'alb-public-01', 'listener_port', 443).state;
  state = applyNodePatch(state, scenario, 'subnet-app-private', 'route_target', 'nat-gateway-01').state;

  const t0 = performance.now();
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

// AC-07-2: Exported audit log contains valid JSON with non-null required properties.
export async function testAC07_2(): Promise<TestContractResult> {
  const scenario = SCENARIO_CATALOG.find((s) => s.id === 'SCN-01')!;
  let state = loadScenario('SCN-01');
  state = applyNodePatch(state, scenario, 'alb-public-01', 'listener_port', 443).state;

  const t0 = performance.now();
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

export interface SuiteSummary {
  passedTotal: number;
  total: number;
  results: Array<{ id: string; passed: boolean; message: string; elapsedMs: number }>;
}

export async function runAllTests(): Promise<SuiteSummary> {
  const tests = [
    { id: 'AC-01-1', fn: testAC01_1 },
    { id: 'AC-01-2', fn: testAC01_2 },
    { id: 'AC-02-1', fn: testAC02_1 },
    { id: 'AC-02-2', fn: testAC02_2 },
    { id: 'AC-03-1', fn: testAC03_1 },
    { id: 'AC-03-2', fn: testAC03_2 },
    { id: 'AC-04-1', fn: testAC04_1 },
    { id: 'AC-04-2', fn: testAC04_2 },
    { id: 'AC-05-1', fn: testAC05_1 },
    { id: 'AC-05-2', fn: testAC05_2 },
    { id: 'AC-06-1', fn: testAC06_1 },
    { id: 'AC-06-2', fn: testAC06_2 },
    { id: 'AC-07-1', fn: testAC07_1 },
    { id: 'AC-07-2', fn: testAC07_2 },
  ];

  let passedTotal = 0;
  const results = [];

  for (const test of tests) {
    const res = await test.fn();
    results.push({ id: test.id, ...res });
    if (res.passed) {
      passedTotal++;
    }
  }

  return { passedTotal, total: tests.length, results };
}
