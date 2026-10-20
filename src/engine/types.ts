/**
 * Core domain types for CloudFix Unofficial Diagnostic Sandbox
 * Independent educational tooling with synthetic topology definitions.
 */

export interface TopologyNode {
  id: string;
  name: string;
  type: 'gateway' | 'load_balancer' | 'subnet' | 'database';
  x: number;
  y: number;
  status: 'healthy' | 'misconfigured' | 'pending';
  config: {
    listener_port?: number;
    ingress_security_group?: string;
    route_target?: string;
    cidr_block?: string;
    ssl_policy?: string;
    multi_az?: boolean;
    [key: string]: string | number | boolean | undefined;
  };
}

export interface TopologyEdge {
  id: string;
  from: string;
  to: string;
  label: string;
  protocol: string;
  port: number;
  status: 'active' | 'blocked' | 'degraded';
}

export interface VerificationRule {
  id: string;
  title: string;
  description: string;
  targetNodeId: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  validate: (nodes: Record<string, TopologyNode>) => { passed: boolean; message: string };
}

export interface RuleResult {
  ruleId: string;
  title: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM';
  passed: boolean;
  message: string;
  targetNodeId: string;
}

export interface Hint {
  tier: number;
  penaltyPoints: number;
  title: string;
  guidance: string;
}

export interface ScenarioDefinition {
  id: string;
  title: string;
  difficulty: 'Associate' | 'Professional' | 'Specialty';
  description: string;
  objective: string;
  nodes: TopologyNode[];
  edges: TopologyEdge[];
  rules: VerificationRule[];
  hints: Hint[];
}

export interface AppliedPatchRecord {
  id: string;
  timestamp: string;
  nodeId: string;
  property: string;
  previousValue: string | number | boolean | undefined;
  newValue: string | number | boolean;
}

export interface AuditLogExport {
  scenario_id: string;
  session_id: string;
  timestamp: string;
  total_elapsed_seconds: number;
  score: number;
  status: 'RESOLVED' | 'UNRESOLVED';
  hints_used: number;
  rules_passed: number;
  rules_total: number;
  applied_patches: AppliedPatchRecord[];
}

export interface FeatureFlagDefinition {
  flag_name: string;
  default: boolean;
  owner_role: string;
  kill_switch_behavior: string;
  module_gated: string;
  current_value: boolean;
}
