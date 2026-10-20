import React, { useState } from 'react';
import { ToggleLeft, ToggleRight, Sliders, Shield, AlertOctagon, Info } from 'lucide-react';
import { FeatureFlagDefinition } from '../engine/types.ts';

const INITIAL_FLAGS: FeatureFlagDefinition[] = [
  {
    flag_name: 'ff_progressive_hint_ladder',
    default: true,
    owner_role: 'Product Owner',
    kill_switch_behavior: 'Disables hint trigger button, hides hint drawer, and locks maximum score calculation to 100 with 0 deductions permitted.',
    module_gated: 'src/components/HintLadder.tsx',
    current_value: true,
  },
  {
    flag_name: 'ff_export_audit_log',
    default: true,
    owner_role: 'Security Proctor',
    kill_switch_behavior: 'Replaces download button with disabled state badge reading "Audit Export Disabled by Proctor Policy".',
    module_gated: 'src/components/AuditExportModal.tsx',
    current_value: true,
  },
  {
    flag_name: 'ff_interactive_node_drag',
    default: false,
    owner_role: 'Frontend Lead',
    kill_switch_behavior: 'Pins all SVG topology nodes to static mathematical grid coordinates, preventing mouse coordinate updates during rendering stutter.',
    module_gated: 'src/components/TopologyCanvas.tsx',
    current_value: false,
  },
  {
    flag_name: 'ff_strict_timer_enforcement',
    default: true,
    owner_role: 'Exam Proctor',
    kill_switch_behavior: 'Automatically fails the scenario session when elapsed time exceeds 600 seconds, setting score to 0 and locking patch inputs.',
    module_gated: 'src/components/DiagnosticTimer.tsx',
    current_value: true,
  },
  {
    flag_name: 'ff_reference_patch_shortcut',
    default: true,
    owner_role: 'Demo Lead',
    kill_switch_behavior: 'Hides Ctrl+Shift+D fast-remediate keyboard listener and debug button, preventing accidental solution injection during judge hands-on review.',
    module_gated: 'src/components/ScenarioWorkspace.tsx',
    current_value: true,
  },
  {
    flag_name: 'ff_edge_packet_animation',
    default: true,
    owner_role: 'UI Designer',
    kill_switch_behavior: 'Halts CSS SVG stroke-dashoffset packet animations, reducing GPU render load to zero on low-spec client machines.',
    module_gated: 'src/components/TopologyCanvas.tsx',
    current_value: true,
  },
];

interface FeatureFlagsSectionProps {
  flags?: FeatureFlagDefinition[];
  onToggleFlag?: (flagName: string) => void;
}

export const FeatureFlagsSection: React.FC<FeatureFlagsSectionProps> = ({
  flags: externalFlags,
  onToggleFlag: externalToggle,
}) => {
  const [localFlags, setLocalFlags] = useState<FeatureFlagDefinition[]>(INITIAL_FLAGS);

  const flags = externalFlags || localFlags;

  const handleToggle = (flagName: string) => {
    if (externalToggle) {
      externalToggle(flagName);
    } else {
      setLocalFlags((prev) =>
        prev.map((f) => (f.flag_name === flagName ? { ...f, current_value: !f.current_value } : f))
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <Sliders className="w-4 h-4 text-cyan-400" />
            Feature Flags Configuration Table (docs/feature-flags.md)
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Machine-checkable governance matrix with explicit kill switch behavior for every module. Click the toggles to simulate runtime kill switch dispatches.
          </p>
        </div>
        <div className="px-3 py-1.5 bg-slate-800/80 border border-slate-700 text-slate-300 rounded font-mono text-xs flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5 text-cyan-400" />
          <span>{flags.length} Managed Flags</span>
        </div>
      </div>

      <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/60">
        <table className="w-full text-left text-xs font-mono">
          <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
            <tr>
              <th className="p-3">flag_name</th>
              <th className="p-3">default</th>
              <th className="p-3">current_state</th>
              <th className="p-3">owner_role</th>
              <th className="p-3">kill_switch_behavior</th>
              <th className="p-3">module_gated</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800">
            {flags.map((flag) => {
              const isEnabled = flag.current_value;
              const isKilled = !isEnabled;

              return (
                <tr
                  key={flag.flag_name}
                  className={`transition-colors ${
                    isKilled ? 'bg-rose-950/15 text-slate-300' : 'text-slate-200 hover:bg-slate-800/30'
                  }`}
                >
                  <td className="p-3 font-bold text-cyan-300">
                    <div className="flex items-center gap-1.5">
                      {isKilled && <AlertOctagon className="w-3.5 h-3.5 text-rose-400 shrink-0" />}
                      <span>{flag.flag_name}</span>
                    </div>
                  </td>
                  <td className="p-3">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                        flag.default
                          ? 'bg-emerald-950/80 border border-emerald-800 text-emerald-300'
                          : 'bg-slate-800 border border-slate-700 text-slate-400'
                      }`}
                    >
                      {String(flag.default)}
                    </span>
                  </td>
                  <td className="p-3">
                    <button
                      onClick={() => handleToggle(flag.flag_name)}
                      className={`flex items-center gap-1 px-2.5 py-1 rounded text-xs font-bold transition-all border ${
                        isEnabled
                          ? 'bg-emerald-950/70 border-emerald-700 text-emerald-300 hover:bg-emerald-900/60'
                          : 'bg-rose-950/70 border-rose-800 text-rose-300 hover:bg-rose-900/60'
                      }`}
                    >
                      {isEnabled ? (
                        <>
                          <ToggleRight className="w-4 h-4 text-emerald-400" />
                          <span>ENABLED</span>
                        </>
                      ) : (
                        <>
                          <ToggleLeft className="w-4 h-4 text-rose-400" />
                          <span>KILLED</span>
                        </>
                      )}
                    </button>
                  </td>
                  <td className="p-3 text-slate-400 font-sans">{flag.owner_role}</td>
                  <td className="p-3 font-sans text-xs text-slate-300 max-w-md leading-relaxed">
                    {flag.kill_switch_behavior}
                  </td>
                  <td className="p-3 text-slate-400 text-[11px] text-nowrap">{flag.module_gated}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-4 bg-slate-900/50 border border-slate-800 rounded-lg flex items-start gap-3 text-xs text-slate-400">
        <Info className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-slate-200">Kill Switch Verification Contract: </span>
          When a flag is toggled to <span className="font-mono text-rose-400">KILLED</span>, the corresponding module immediately falls back to its deterministic baseline state without page reloads or unhandled promise exceptions.
        </div>
      </div>
    </div>
  );
};
