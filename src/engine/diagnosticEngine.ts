import {
  ScenarioDefinition,
  TopologyNode,
  TopologyEdge,
  RuleResult,
  AppliedPatchRecord,
  AuditLogExport,
} from './types.ts';
import { SCENARIO_CATALOG } from './scenarioData.ts';

export interface DiagnosticState {
  scenarioId: string;
  scenarioTitle: string;
  objective: string;
  nodes: Record<string, TopologyNode>;
  edges: TopologyEdge[];
  ruleResults: RuleResult[];
  appliedPatches: AppliedPatchRecord[];
  hintsUnlocked: number;
  score: number;
  elapsedSeconds: number;
  status: 'LOADED' | 'EVALUATING' | 'RESOLVED' | 'UNRESOLVED';
  selectedNodeId: string | null;
  lastEvaluationDurationMs: number;
  historyCount: number;
}

export function loadScenario(scenarioId: string): DiagnosticState {
  const t0 = performance.now();
  const scenario = SCENARIO_CATALOG.find((s) => s.id === scenarioId);
  if (!scenario) {
    throw new Error(`ERR_SCENARIO_NOT_FOUND: ${scenarioId}`);
  }

  // Deep clone nodes and edges
  const nodes: Record<string, TopologyNode> = {};
  scenario.nodes.forEach((n) => {
    nodes[n.id] = JSON.parse(JSON.stringify(n));
  });

  const edges: TopologyEdge[] = JSON.parse(JSON.stringify(scenario.edges));

  const initialRuleResults = runRuleEvaluation(nodes, scenario);
  const t1 = performance.now();

  return {
    scenarioId: scenario.id,
    scenarioTitle: scenario.title,
    objective: scenario.objective,
    nodes,
    edges,
    ruleResults: initialRuleResults,
    appliedPatches: [],
    hintsUnlocked: 0,
    score: 100,
    elapsedSeconds: 0,
    status: initialRuleResults.every((r) => r.passed) ? 'RESOLVED' : 'UNRESOLVED',
    selectedNodeId: 'alb-public-01',
    lastEvaluationDurationMs: Math.max(1, Math.round(t1 - t0)),
    historyCount: 0,
  };
}

export function runRuleEvaluation(
  nodes: Record<string, TopologyNode>,
  scenario: ScenarioDefinition
): RuleResult[] {
  return scenario.rules.map((rule) => {
    const outcome = rule.validate(nodes);
    return {
      ruleId: rule.id,
      title: rule.title,
      severity: rule.severity,
      passed: outcome.passed,
      message: outcome.message,
      targetNodeId: rule.targetNodeId,
    };
  });
}

export function validatePort(value: number): { valid: boolean; error?: string } {
  if (typeof value !== 'number' || isNaN(value)) {
    return { valid: false, error: 'PORT_MUST_BE_NUMBER' };
  }
  if (value < 1 || value > 65535) {
    return { valid: false, error: 'PORT_RANGE_INVALID_1_TO_65535' };
  }
  return { valid: true };
}

export function applyNodePatch(
  state: DiagnosticState,
  scenario: ScenarioDefinition,
  nodeId: string,
  property: string,
  newValue: string | number | boolean
): { success: boolean; state: DiagnosticState; error?: string } {
  const t0 = performance.now();
  const targetNode = state.nodes[nodeId];
  if (!targetNode) {
    return { success: false, state, error: `ERR_NODE_NOT_FOUND: ${nodeId}` };
  }

  if (property.includes('port')) {
    const portNum = Number(newValue);
    const check = validatePort(portNum);
    if (!check.valid) {
      return { success: false, state, error: check.error };
    }
    newValue = portNum;
  }

  const previousValue = targetNode.config[property];

  // Immutably copy state
  const updatedNodes = {
    ...state.nodes,
    [nodeId]: {
      ...targetNode,
      config: {
        ...targetNode.config,
        [property]: newValue,
      },
    },
  };

  const newRuleResults = runRuleEvaluation(updatedNodes, scenario);
  const allPassed = newRuleResults.every((r) => r.passed);

  // Update edges dynamically based on rules
  const updatedEdges = state.edges.map((e) => {
    if (e.id === 'edge-1') {
      const alb = updatedNodes['alb-public-01'];
      return { ...e, status: alb?.config?.listener_port === 443 ? 'active' : 'blocked' };
    }
    if (e.id === 'edge-2') {
      const subnet = updatedNodes['subnet-app-private'];
      return { ...e, status: subnet?.config?.route_target === 'nat-gateway-01' ? 'active' : 'blocked' };
    }
    return e;
  }) as TopologyEdge[];

  // Update node statuses
  Object.values(updatedNodes).forEach((n) => {
    const failingRule = newRuleResults.find((r) => r.targetNodeId === n.id && !r.passed);
    n.status = failingRule ? 'misconfigured' : 'healthy';
  });

  const patchRecord: AppliedPatchRecord = {
    id: `patch-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    timestamp: new Date().toISOString(),
    nodeId,
    property,
    previousValue,
    newValue,
  };

  const hintsDeduction = state.hintsUnlocked * 10;
  const currentScore = Math.max(0, 100 - hintsDeduction);

  const t1 = performance.now();

  const nextState: DiagnosticState = {
    ...state,
    nodes: updatedNodes,
    edges: updatedEdges,
    ruleResults: newRuleResults,
    appliedPatches: [...state.appliedPatches, patchRecord],
    score: currentScore,
    status: allPassed ? 'RESOLVED' : 'UNRESOLVED',
    lastEvaluationDurationMs: Math.max(1, Math.round(t1 - t0)),
    historyCount: state.historyCount + 1,
  };

  return { success: true, state: nextState };
}

export function requestNextHint(state: DiagnosticState, maxTier = 3): DiagnosticState {
  if (state.hintsUnlocked >= maxTier) {
    return state;
  }
  const nextTier = state.hintsUnlocked + 1;
  const newScore = Math.max(0, 100 - nextTier * 10);
  return {
    ...state,
    hintsUnlocked: nextTier,
    score: newScore,
  };
}

export function generateAuditLog(state: DiagnosticState): AuditLogExport {
  const passedCount = state.ruleResults.filter((r) => r.passed).length;
  return {
    scenario_id: state.scenarioId,
    session_id: `ses-${state.scenarioId}-${Date.now()}`,
    timestamp: new Date().toISOString(),
    total_elapsed_seconds: state.elapsedSeconds,
    score: state.score,
    status: state.status === 'RESOLVED' ? 'RESOLVED' : 'UNRESOLVED',
    hints_used: state.hintsUnlocked,
    rules_passed: passedCount,
    rules_total: state.ruleResults.length,
    applied_patches: state.appliedPatches,
  };
}
