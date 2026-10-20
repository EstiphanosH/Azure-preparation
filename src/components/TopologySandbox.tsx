import React, { useState, useEffect } from 'react';
import {
  Server,
  Network,
  Database,
  Globe,
  AlertCircle,
  CheckCircle2,
  Wrench,
  HelpCircle,
  Download,
  Zap,
  Clock,
  RotateCcw,
  Sparkles,
  Layers,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import {
  DiagnosticState,
  loadScenario,
  applyNodePatch,
  requestNextHint,
  generateAuditLog,
} from '../engine/diagnosticEngine.ts';
import { SCENARIO_CATALOG } from '../engine/scenarioData.ts';
import { FeatureFlagDefinition } from '../engine/types.ts';

interface TopologySandboxProps {
  flags?: FeatureFlagDefinition[];
}

export const TopologySandbox: React.FC<TopologySandboxProps> = ({ flags = [] }) => {
  const scenario = SCENARIO_CATALOG[0]; // SCN-01
  const [state, setState] = useState<DiagnosticState>(() => loadScenario('SCN-01'));
  const [selectedNodeId, setSelectedNodeId] = useState<string>('alb-public-01');
  const [patchProperty, setPatchProperty] = useState<string>('listener_port');
  const [patchValue, setPatchValue] = useState<string>('443');
  const [patchFeedback, setPatchFeedback] = useState<{ success: boolean; message: string } | null>(
    null
  );
  const [isAuditModalOpen, setIsAuditModalOpen] = useState(false);
  const [showCompletionModal, setShowCompletionModal] = useState(false);

  // Check feature flags
  const isHintEnabled = flags.find((f) => f.flag_name === 'ff_progressive_hint_ladder')?.current_value ?? true;
  const isAuditExportEnabled = flags.find((f) => f.flag_name === 'ff_export_audit_log')?.current_value ?? true;
  const isReferenceShortcutEnabled = flags.find((f) => f.flag_name === 'ff_reference_patch_shortcut')?.current_value ?? true;
  const isPacketAnimationEnabled = flags.find((f) => f.flag_name === 'ff_edge_packet_animation')?.current_value ?? true;

  // Real-time scenario timer
  useEffect(() => {
    const timer = setInterval(() => {
      setState((prev) => {
        if (prev.status === 'RESOLVED') return prev;
        return { ...prev, elapsedSeconds: prev.elapsedSeconds + 1 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard shortcut Ctrl+Shift+D for reference remediation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isReferenceShortcutEnabled && e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        applyReferenceSolution();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [state, isReferenceShortcutEnabled]);

  // Sync default input value when selected node changes
  useEffect(() => {
    if (selectedNodeId === 'alb-public-01') {
      setPatchProperty('listener_port');
      setPatchValue(String(state.nodes['alb-public-01']?.config?.listener_port ?? 443));
    } else if (selectedNodeId === 'subnet-app-private') {
      setPatchProperty('route_target');
      setPatchValue(String(state.nodes['subnet-app-private']?.config?.route_target ?? 'nat-gateway-01'));
    }
  }, [selectedNodeId]);

  const handleApplyPatch = () => {
    const result = applyNodePatch(state, scenario, selectedNodeId, patchProperty, patchValue);
    if (result.success) {
      setState(result.state);
      setPatchFeedback({
        success: true,
        message: `Applied patch: ${selectedNodeId}.${patchProperty} -> ${patchValue} in ${result.state.lastEvaluationDurationMs} ms`,
      });
      if (result.state.status === 'RESOLVED') {
        setShowCompletionModal(true);
      }
    } else {
      setPatchFeedback({
        success: false,
        message: `Patch rejected: ${result.error}`,
      });
    }
  };

  const applyReferenceSolution = () => {
    let next = applyNodePatch(state, scenario, 'alb-public-01', 'listener_port', 443).state;
    next = applyNodePatch(next, scenario, 'subnet-app-private', 'route_target', 'nat-gateway-01').state;
    setState(next);
    setShowCompletionModal(true);
    setPatchFeedback({
      success: true,
      message: 'Reference remediation applied: Port set to 443, route target set to nat-gateway-01.',
    });
  };

  const handleRequestHint = () => {
    if (!isHintEnabled) return;
    const next = requestNextHint(state, 3);
    setState(next);
  };

  const handleReset = () => {
    setState(loadScenario('SCN-01'));
    setSelectedNodeId('alb-public-01');
    setPatchFeedback(null);
    setShowCompletionModal(false);
  };

  const selectedNode = state.nodes[selectedNodeId];
  const failingRules = state.ruleResults.filter((r) => !r.passed);
  const passingRules = state.ruleResults.filter((r) => r.passed);

  return (
    <div className="space-y-6">
      {/* Top Scenario Control Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-cyan-950 border border-cyan-700 text-cyan-300 font-mono text-xs font-bold rounded">
              {state.scenarioId}
            </span>
            <h3 className="text-sm font-bold text-slate-100">{state.scenarioTitle}</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-2xl">{state.objective}</p>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 rounded border border-slate-800 text-xs font-mono">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">Elapsed:</span>
            <span className="font-bold text-slate-200">{state.elapsedSeconds}s</span>
          </div>

          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-950 rounded border border-slate-800 text-xs font-mono">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-slate-400">Score:</span>
            <span className="font-bold text-amber-300">{state.score}/100</span>
          </div>

          <div className="flex items-center gap-1.5">
            {isReferenceShortcutEnabled && (
              <button
                onClick={applyReferenceSolution}
                className="px-3 py-1.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-700 text-indigo-200 rounded text-xs font-mono font-semibold flex items-center gap-1.5"
                title="Shortcut: Ctrl+Shift+D"
              >
                <Zap className="w-3.5 h-3.5 text-indigo-400" />
                <span>Reference Fix</span>
              </button>
            )}
            <button
              onClick={handleReset}
              className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 rounded"
              title="Reset Scenario"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Main Sandbox Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Topology Canvas & Diagnostic Rules */}
        <div className="lg:col-span-8 space-y-4">
          {/* Status Diagnostic Banner */}
          <div
            className={`p-3.5 rounded-lg border font-mono text-xs flex items-center justify-between ${
              state.status === 'RESOLVED'
                ? 'bg-emerald-950/40 border-emerald-700 text-emerald-200'
                : 'bg-rose-950/30 border-rose-800/80 text-rose-200'
            }`}
          >
            <div className="flex items-center gap-2">
              {state.status === 'RESOLVED' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              )}
              <span className="font-bold">
                {state.status === 'RESOLVED'
                  ? 'HEALTHY: All 3 verification rules passing'
                  : `FAILED: ${failingRules.length} of ${state.ruleResults.length} verification rules failing`}
              </span>
            </div>
            <span className="text-[11px] text-slate-400">
              Evaluated in {state.lastEvaluationDurationMs} ms (≤ 50 ms budget)
            </span>
          </div>

          {/* 2D SVG Topology Canvas */}
          <div className="relative p-6 bg-slate-900 border border-slate-800 rounded-lg min-h-[360px] flex flex-col justify-between overflow-hidden shadow-inner">
            <div className="absolute top-3 left-4 text-[10px] font-mono uppercase tracking-wider text-slate-500">
              Deterministic 2D Topology Graph Inspector (US-02)
            </div>

            {/* SVG Visual Canvas */}
            <svg className="w-full h-64 overflow-visible" viewBox="0 0 840 280">
              <defs>
                <linearGradient id="edgeGradActive" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#10b981" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
                <linearGradient id="edgeGradBlocked" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#f43f5e" />
                  <stop offset="100%" stopColor="#e11d48" />
                </linearGradient>
              </defs>

              {/* Connecting Edges */}
              {state.edges.map((edge) => {
                const fromNode = state.nodes[edge.from];
                const toNode = state.nodes[edge.to];
                if (!fromNode || !toNode) return null;

                const isBlocked = edge.status === 'blocked';

                return (
                  <g key={edge.id}>
                    <line
                      x1={fromNode.x + 40}
                      y1={fromNode.y + 40}
                      x2={toNode.x + 40}
                      y2={toNode.y + 40}
                      stroke={isBlocked ? '#f43f5e' : '#10b981'}
                      strokeWidth="3"
                      strokeDasharray={isBlocked ? '6,6' : isPacketAnimationEnabled ? '8,4' : 'none'}
                      className={!isBlocked && isPacketAnimationEnabled ? 'animate-pulse' : ''}
                    />
                    <rect
                      x={(fromNode.x + toNode.x) / 2 + 10}
                      y={(fromNode.y + toNode.y) / 2 + 25}
                      width="80"
                      height="20"
                      rx="4"
                      fill="#020617"
                      stroke={isBlocked ? '#e11d48' : '#059669'}
                      strokeWidth="1"
                    />
                    <text
                      x={(fromNode.x + toNode.x) / 2 + 50}
                      y={(fromNode.y + toNode.y) / 2 + 39}
                      textAnchor="middle"
                      fill={isBlocked ? '#fda4af' : '#6ee7b7'}
                      fontSize="9"
                      fontFamily="monospace"
                      fontWeight="600"
                    >
                      {edge.label}
                    </text>
                  </g>
                );
              })}

              {/* Topology Nodes */}
              {Object.values(state.nodes).map((node) => {
                const isSelected = selectedNodeId === node.id;
                const isMisconfigured = node.status === 'misconfigured';

                let IconComponent = Server;
                if (node.type === 'gateway') IconComponent = Globe;
                if (node.type === 'load_balancer') IconComponent = Network;
                if (node.type === 'subnet') IconComponent = Layers;
                if (node.type === 'database') IconComponent = Database;

                return (
                  <g
                    key={node.id}
                    onClick={() => setSelectedNodeId(node.id)}
                    className="cursor-pointer transition-all"
                  >
                    {/* Bounding Node Box */}
                    <rect
                      x={node.x}
                      y={node.y}
                      width="80"
                      height="80"
                      rx="12"
                      fill={isSelected ? '#0f172a' : '#020617'}
                      stroke={
                        isSelected
                          ? '#06b6d4'
                          : isMisconfigured
                          ? '#f43f5e'
                          : '#10b981'
                      }
                      strokeWidth={isSelected ? '3' : '2'}
                      className={isMisconfigured ? 'animate-pulse' : ''}
                    />

                    {/* Node Icon */}
                    <foreignObject x={node.x + 24} y={node.y + 16} width="32" height="32">
                      <IconComponent
                        className={`w-8 h-8 ${
                          isMisconfigured
                            ? 'text-rose-400'
                            : isSelected
                            ? 'text-cyan-400'
                            : 'text-emerald-400'
                        }`}
                      />
                    </foreignObject>

                    {/* Node Name Label */}
                    <text
                      x={node.x + 40}
                      y={node.y + 68}
                      textAnchor="middle"
                      fill={isSelected ? '#38bdf8' : '#e2e8f0'}
                      fontSize="10"
                      fontFamily="monospace"
                      fontWeight="bold"
                    >
                      {node.name.length > 12 ? node.name.substring(0, 11) + '..' : node.name}
                    </text>

                    {/* Misconfiguration Marker */}
                    {isMisconfigured && (
                      <circle
                        cx={node.x + 72}
                        cy={node.y + 8}
                        r="6"
                        fill="#f43f5e"
                        stroke="#020617"
                        strokeWidth="2"
                      />
                    )}
                  </g>
                );
              })}
            </svg>

            {/* Canvas Legend */}
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  Healthy Node
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block animate-ping"></span>
                  Misconfigured Node
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block"></span>
                  Selected Active Node
                </span>
              </div>
              <span>Click any node to inspect attributes</span>
            </div>
          </div>

          {/* Diagnostic Verification Rules List */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              Diagnostic Rules Engine Output (US-04)
            </h4>
            <div className="space-y-2">
              {state.ruleResults.map((r) => (
                <div
                  key={r.ruleId}
                  onClick={() => setSelectedNodeId(r.targetNodeId)}
                  className={`p-3 rounded-lg border font-mono text-xs cursor-pointer transition-all flex items-start justify-between gap-3 ${
                    r.passed
                      ? 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                      : 'bg-rose-950/20 border-rose-800/80 text-rose-200 hover:bg-rose-950/30'
                  }`}
                >
                  <div className="flex items-start gap-2.5">
                    {r.passed ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-200">{r.ruleId}</span>
                        <span className="text-[10px] text-slate-400 font-sans">{r.title}</span>
                        <span
                          className={`text-[9px] px-1 py-0.2 rounded uppercase font-bold ${
                            r.severity === 'CRITICAL'
                              ? 'bg-rose-900/80 text-rose-200'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {r.severity}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 font-sans mt-0.5">{r.message}</p>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold shrink-0 ${
                      r.passed
                        ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                        : 'bg-rose-950 border border-rose-700 text-rose-300'
                    }`}
                  >
                    {r.passed ? 'PASSED' : 'FAILED'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Node Inspector Drawer & Patch Editor */}
        <div className="lg:col-span-4 space-y-4">
          {/* Node Inspector Drawer */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-3">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <Wrench className="w-4 h-4 text-cyan-400" />
                <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider">
                  Node Inspector Drawer
                </h4>
              </div>
              <span
                className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                  selectedNode.status === 'healthy'
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                    : 'bg-rose-950 text-rose-300 border border-rose-800'
                }`}
              >
                {selectedNode.status}
              </span>
            </div>

            <div className="text-xs font-mono space-y-1">
              <div className="text-slate-400">Node ID: <span className="text-cyan-300 font-bold">{selectedNode.id}</span></div>
              <div className="text-slate-400">Resource Name: <span className="text-slate-200">{selectedNode.name}</span></div>
              <div className="text-slate-400">Type: <span className="text-slate-200">{selectedNode.type}</span></div>
            </div>

            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase text-slate-500 font-bold block">
                Configuration Attributes:
              </span>
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800 text-[11px] font-mono space-y-1 text-slate-300 overflow-x-auto">
                {Object.entries(selectedNode.config).map(([key, val]) => (
                  <div key={key} className="flex justify-between gap-2">
                    <span className="text-slate-500">{key}:</span>
                    <span
                      className={`font-bold ${
                        (key === 'listener_port' && val !== 443) ||
                        (key === 'route_target' && val === 'blackhole')
                          ? 'text-rose-400 underline decoration-rose-500'
                          : 'text-emerald-400'
                      }`}
                    >
                      {String(val)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Configuration Patch Editor (US-03) */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-3">
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              Configuration Patch Editor (US-03)
            </h4>

            <div className="space-y-2.5 text-xs font-mono">
              <div>
                <label className="text-slate-400 block text-[11px] mb-1">Target Property</label>
                <select
                  value={patchProperty}
                  onChange={(e) => setPatchProperty(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded p-2 text-xs"
                >
                  {Object.keys(selectedNode.config).map((k) => (
                    <option key={k} value={k}>
                      {k}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-slate-400 block text-[11px] mb-1">Remediation Value</label>
                <input
                  type="text"
                  value={patchValue}
                  onChange={(e) => setPatchValue(e.target.value)}
                  placeholder="Enter target value (e.g. 443, nat-gateway-01)"
                  className="w-full bg-slate-950 border border-slate-700 text-slate-200 rounded p-2 text-xs focus:border-cyan-500 focus:outline-none"
                />
              </div>

              <button
                onClick={handleApplyPatch}
                className="w-full py-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded text-xs transition-colors shadow"
              >
                Apply Patch Payload
              </button>
            </div>

            {patchFeedback && (
              <div
                className={`p-2.5 rounded text-[11px] font-mono ${
                  patchFeedback.success
                    ? 'bg-emerald-950/60 border border-emerald-800 text-emerald-300'
                    : 'bg-rose-950/60 border border-rose-800 text-rose-300'
                }`}
              >
                {patchFeedback.message}
              </div>
            )}
          </div>

          {/* Hint Ladder (US-06) */}
          {isHintEnabled && (
            <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  Progressive Hint Ladder (US-06)
                </h4>
                <span className="text-[10px] font-mono text-amber-400 font-bold">
                  Tier {state.hintsUnlocked} of 3
                </span>
              </div>

              {state.hintsUnlocked === 0 ? (
                <p className="text-xs text-slate-400 font-sans">
                  No hints requested. Base score is 100 points. Requesting a hint imposes a 10-point deduction.
                </p>
              ) : (
                <div className="space-y-2">
                  {scenario.hints.slice(0, state.hintsUnlocked).map((h) => (
                    <div
                      key={h.tier}
                      className="p-2.5 bg-slate-950 rounded border border-amber-900/60 text-xs font-mono"
                    >
                      <div className="flex justify-between text-amber-400 font-bold text-[11px]">
                        <span>Tier {h.tier}: {h.title}</span>
                        <span>-10 pts</span>
                      </div>
                      <p className="text-slate-300 font-sans text-[11px] mt-1">{h.guidance}</p>
                    </div>
                  ))}
                </div>
              )}

              <button
                onClick={handleRequestHint}
                disabled={state.hintsUnlocked >= 3}
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-amber-300 border border-slate-700 rounded text-xs font-mono font-semibold"
              >
                {state.hintsUnlocked >= 3
                  ? 'All 3 Hints Unlocked'
                  : `Request Hint Tier ${state.hintsUnlocked + 1} (-10 pts)`}
              </button>
            </div>
          )}

          {/* Audit Log Export (US-07) */}
          <div className="p-4 bg-slate-900 border border-slate-800 rounded-lg space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
              <Download className="w-4 h-4 text-cyan-400" />
              Proctor Audit Log (US-07)
            </h4>

            {isAuditExportEnabled ? (
              <button
                onClick={() => setIsAuditModalOpen(true)}
                className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded text-xs font-mono font-semibold flex items-center justify-center gap-2"
              >
                <span>Export Session Audit JSON</span>
              </button>
            ) : (
              <div className="p-2.5 bg-rose-950/40 border border-rose-800 text-rose-300 rounded text-xs font-mono">
                Audit Export Disabled by Proctor Policy (ff_export_audit_log killed)
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Completion Modal */}
      {showCompletionModal && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-emerald-600 rounded-xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-emerald-950 rounded-lg border border-emerald-700">
                <CheckCircle2 className="w-6 h-6 text-emerald-400" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-100">Scenario SCN-01 Resolved!</h3>
                <p className="text-xs text-slate-400">All 3 verification rules validated in ≤ 50 ms.</p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5 text-center font-mono">
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Score</span>
                <span className="text-lg font-bold text-emerald-400">{state.score}/100</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Duration</span>
                <span className="text-lg font-bold text-cyan-400">{state.elapsedSeconds}s</span>
              </div>
              <div className="p-2.5 bg-slate-950 rounded border border-slate-800">
                <span className="text-[10px] text-slate-500 uppercase block">Hints Used</span>
                <span className="text-lg font-bold text-amber-400">{state.hintsUnlocked}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => setIsAuditModalOpen(true)}
                className="px-3 py-1.5 bg-slate-800 text-slate-200 rounded text-xs font-mono"
              >
                Inspect Audit Log
              </button>
              <button
                onClick={() => setShowCompletionModal(false)}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded text-xs font-mono"
              >
                Acknowledge Success
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Audit Log Modal */}
      {isAuditModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-xl w-full space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Download className="w-4 h-4 text-cyan-400" />
                Session Audit Log (US-07 JSON Schema)
              </h3>
              <button
                onClick={() => setIsAuditModalOpen(false)}
                className="text-slate-400 hover:text-slate-200 text-xs font-mono"
              >
                [Close]
              </button>
            </div>

            <pre className="p-3 bg-slate-950 rounded border border-slate-800 text-[11px] font-mono text-cyan-300 max-h-72 overflow-y-auto">
              {JSON.stringify(generateAuditLog(state), null, 2)}
            </pre>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => {
                  const blob = new Blob([JSON.stringify(generateAuditLog(state), null, 2)], {
                    type: 'application/json',
                  });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `audit-${state.scenarioId}-${Date.now()}.json`;
                  a.click();
                }}
                className="px-4 py-1.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded text-xs font-mono"
              >
                Download JSON File
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
