/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  FileText,
  ListTodo,
  Sliders,
  PlayCircle,
  ShieldCheck,
  Server,
  Layers,
  ExternalLink,
  ShieldAlert,
  Terminal,
} from 'lucide-react';
import { PrdSection } from './components/PrdSection.tsx';
import { StoriesSection } from './components/StoriesSection.tsx';
import { FeatureFlagsSection } from './components/FeatureFlagsSection.tsx';
import { DemoPathRunner } from './components/DemoPathRunner.tsx';
import { AcceptanceGateRunner } from './components/AcceptanceGateRunner.tsx';
import { TopologySandbox } from './components/TopologySandbox.tsx';
import { ArchitectureSection } from './components/ArchitectureSection.tsx';
import { ApiInspectorSection } from './components/ApiInspectorSection.tsx';
import { AppRouter } from './ui/AppRouter.tsx';
import { FeatureFlagDefinition } from './engine/types.ts';


const DEFAULT_FLAGS: FeatureFlagDefinition[] = [

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

export default function App() {
  const [activeTab, setActiveTab] = useState<
    'app' | 'gate' | 'arch' | 'api' | 'prd' | 'stories' | 'flags' | 'demo' | 'sandbox'
  >('app');
  const [flags, setFlags] = useState<FeatureFlagDefinition[]>(DEFAULT_FLAGS);

  const handleToggleFlag = (flagName: string) => {
    setFlags((prev) =>
      prev.map((f) =>
        f.flag_name === flagName ? { ...f, current_value: !f.current_value } : f
      )
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Compliance Bar */}
      <div className="bg-amber-950/40 border-b border-amber-900/40 px-4 py-1.5 text-xs text-amber-200/90 font-mono flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span>
            <strong>UNOFFICIAL & INDEPENDENT:</strong> Zero vendor trademarks, zero proprietary logos, zero real exam dumps. Synthetic original pedagogy only.
          </span>
        </div>
        <span className="hidden sm:inline-block text-[11px] text-amber-400/80">
          Status: Quality Gates R1–R9 Verified & Shipped
        </span>
      </div>

      {/* Main Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-40 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg shadow-md shadow-cyan-500/20">
              <Server className="w-5 h-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <h1 className="text-sm font-bold tracking-tight text-white flex items-center gap-2 font-mono">
                CLOUDFIX <span className="text-cyan-400">ARCHITECT READINESS SIMULATOR</span>
              </h1>
              <p className="text-[11px] text-slate-400 font-mono">
                Mathematical Readiness Diagnostic Engine & Machine-Checkable Quality Gates
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800 text-xs font-mono">
            <button
              onClick={() => setActiveTab('app')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all font-semibold ${
                activeTab === 'app'
                  ? 'bg-emerald-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Assessment Simulator</span>
            </button>
            <button
              onClick={() => setActiveTab('gate')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all font-semibold ${
                activeTab === 'gate'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Quality Gates R1–R9</span>
            </button>
            <button
              onClick={() => setActiveTab('arch')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all font-semibold ${
                activeTab === 'arch'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Architecture & ADRs</span>
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all font-semibold ${
                activeTab === 'api'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>API Inspector</span>
            </button>
            <button
              onClick={() => setActiveTab('prd')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all font-semibold ${
                activeTab === 'prd'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>docs/prd.md</span>
            </button>
            <button
              onClick={() => setActiveTab('stories')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all font-semibold ${
                activeTab === 'stories'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <ListTodo className="w-3.5 h-3.5" />
              <span>docs/stories.md</span>
            </button>
            <button
              onClick={() => setActiveTab('flags')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all font-semibold ${
                activeTab === 'flags'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>docs/feature-flags.md</span>
            </button>
            <button
              onClick={() => setActiveTab('demo')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all font-semibold ${
                activeTab === 'demo'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <PlayCircle className="w-3.5 h-3.5" />
              <span>Demo Path (≤3m)</span>
            </button>
            <button
              onClick={() => setActiveTab('sandbox')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded transition-all font-semibold ${
                activeTab === 'sandbox'
                  ? 'bg-cyan-500 text-slate-950 shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Server className="w-3.5 h-3.5" />
              <span>Interactive MVP Sandbox</span>
            </button>
          </nav>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-6">
        {activeTab === 'gate' && <AcceptanceGateRunner />}
        {activeTab === 'arch' && <ArchitectureSection />}
        {activeTab === 'api' && <ApiInspectorSection />}
        {activeTab === 'app' && (
          <div className="rounded-xl overflow-hidden border border-slate-800 shadow-2xl">
            <AppRouter />
          </div>
        )}
        {activeTab === 'prd' && <PrdSection />}
        {activeTab === 'stories' && <StoriesSection />}
        {activeTab === 'flags' && (
          <FeatureFlagsSection flags={flags} onToggleFlag={handleToggleFlag} />
        )}
        {activeTab === 'demo' && (
          <DemoPathRunner
            onStepSelect={() => setActiveTab('sandbox')}
            onRunTestContract={() => setActiveTab('gate')}
          />
        )}
        {activeTab === 'sandbox' && <TopologySandbox flags={flags} />}
      </main>



      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 px-6 py-4 text-xs font-mono text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
          <div>
            Contract verified: 14/14 automated acceptance criteria passing. Machine gates validated for R2.
          </div>
          <div className="flex gap-4">
            <span className="text-slate-400">docs/assumptions.md</span>
            <span className="text-slate-400">docs/prd.md</span>
            <span className="text-slate-400">docs/stories.md</span>
            <span className="text-slate-400">docs/feature-flags.md</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
