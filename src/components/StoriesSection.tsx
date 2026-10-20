import React, { useState } from 'react';
import { CheckCircle2, FileCode, Check, ShieldCheck, ListOrdered } from 'lucide-react';

interface Story {
  id: string;
  name: string;
  persona: string;
  moscow: 'MUST' | 'SHOULD' | 'COULD' | 'WON\'T';
  mappedTest: string;
  acs: {
    id: string;
    given: string;
    when: string;
    then: string;
  }[];
}

const STORIES: Story[] = [
  {
    id: 'US-01',
    name: 'Synthetic Scenario Ingestion & State Initialization',
    persona: 'Cloud Architecture Student',
    moscow: 'MUST',
    mappedTest: 'tests/ac/AC-01.test.ts',
    acs: [
      {
        id: 'AC-01-1',
        given: 'a valid scenario definition SCN-01 with 4 nodes and 3 edges',
        when: 'the user selects SCN-01 from the scenario catalog',
        then: 'the state machine initializes with status LOADED in ≤ 200 ms and populates the active node repository with exactly 4 nodes.',
      },
      {
        id: 'AC-01-2',
        given: 'an invalid or malformed scenario schema missing required field topology.nodes',
        when: 'the loader executes parsing',
        then: 'the system rejects the input with error code ERR_MALFORMED_TOPOLOGY within 50 ms and preserves the default empty workspace.',
      },
    ],
  },
  {
    id: 'US-02',
    name: 'Interactive Topology Graph Inspector',
    persona: 'Diagnostic Candidate',
    moscow: 'MUST',
    mappedTest: 'tests/ac/AC-02.test.ts',
    acs: [
      {
        id: 'AC-02-1',
        given: 'a rendered topology containing node alb-public-01',
        when: 'the user emits a click event on alb-public-01',
        then: 'the inspection drawer opens in ≤ 100 ms displaying attribute listener_port equal to 8080 and attribute ingress_security_group equal to sg-web-public.',
      },
      {
        id: 'AC-02-2',
        given: '4 topology nodes rendered on the canvas',
        when: 'the canvas renders initially',
        then: 'each node contains a distinct SVG bounding rect and coordinates matching the scenario layout object within ±1 pixel tolerance.',
      },
    ],
  },
  {
    id: 'US-03',
    name: 'Configuration Patch Application & Immutability',
    persona: 'Cloud Remediation Engineer',
    moscow: 'MUST',
    mappedTest: 'tests/ac/AC-03.test.ts',
    acs: [
      {
        id: 'AC-03-1',
        given: 'node alb-public-01 with listener_port: 8080',
        when: 'the user dispatches a patch payload { listener_port: 443 }',
        then: 'the active state updates listener_port to 443 in ≤ 30 ms and records 1 revision entry in the local history array.',
      },
      {
        id: 'AC-03-2',
        given: 'an existing node configuration',
        when: 'the user dispatches an invalid port value -1 or 99999',
        then: 'the patch validator rejects the change with validation message PORT_RANGE_INVALID_1_TO_65535 and leaves node state unchanged.',
      },
    ],
  },
  {
    id: 'US-04',
    name: 'Deterministic Diagnostic Verification Engine',
    persona: 'Automated Assessment Evaluator',
    moscow: 'MUST',
    mappedTest: 'tests/ac/AC-04.test.ts',
    acs: [
      {
        id: 'AC-04-1',
        given: 'an unpatched SCN-01 topology state with 3 verification rules',
        when: 'the diagnostic evaluator runs',
        then: 'exactly 2 rules evaluate to FAILED and 1 rule evaluates to PASSED within ≤ 50 ms total runtime.',
      },
      {
        id: 'AC-04-2',
        given: 'patched node states where listener_port == 443 and route_target == nat-gateway-01',
        when: 'the diagnostic evaluator runs',
        then: '3 of 3 rules evaluate to PASSED within ≤ 50 ms and the overall topology health flag transitions to HEALTHY.',
      },
    ],
  },
  {
    id: 'US-05',
    name: 'Objective Completion & Score Calculation',
    persona: 'Hackathon Judge',
    moscow: 'MUST',
    mappedTest: 'tests/ac/AC-05.test.ts',
    acs: [
      {
        id: 'AC-05-1',
        given: 'a scenario solved with 0 hints used and all 3 verification rules passing',
        when: 'completion is recorded',
        then: 'the calculated score equals 100/100 and the completion state transitions to RESOLVED in ≤ 50 ms.',
      },
      {
        id: 'AC-05-2',
        given: 'a scenario where 1 or more verification rules remain in FAILED status',
        when: 'completion check executes',
        then: 'the completion status evaluates to UNRESOLVED and the submission button remains disabled.',
      },
    ],
  },
  {
    id: 'US-06',
    name: '3-Tier Progressive Hint Ladder',
    persona: 'Learning Candidate',
    moscow: 'SHOULD',
    mappedTest: 'tests/ac/AC-06.test.ts',
    acs: [
      {
        id: 'AC-06-1',
        given: 'an active scenario with hint tier 0 and base score 100',
        when: 'the user triggers Request Hint Tier 1',
        then: 'the system reveals hint text for tier 1 in ≤ 20 ms and deducts 10 points from the potential score, setting the maximum obtainable score to 90.',
      },
      {
        id: 'AC-06-2',
        given: 'hint tier 3 is already active',
        when: 'the user attempts to request an additional hint',
        then: 'the hint request control disables and the hint counter remains clamped at 3 with cumulative deduction of 30 points.',
      },
    ],
  },
  {
    id: 'US-07',
    name: 'Exportable Diagnostic Audit Log',
    persona: 'Technical Proctor',
    moscow: 'SHOULD',
    mappedTest: 'tests/ac/AC-07.test.ts',
    acs: [
      {
        id: 'AC-07-1',
        given: 'a completed scenario session with 2 applied patches',
        when: 'the proctor clicks Export Audit Log',
        then: 'a downloadable JSON document containing timestamp, 2 patch records, and final verification outcome is generated within ≤ 100 ms.',
      },
      {
        id: 'AC-07-2',
        given: 'an exported audit log payload',
        when: 'schema validation executes against the exported string',
        then: 'the output contains valid JSON with non-null properties scenario_id, total_elapsed_seconds, score, and applied_patches.',
      },
    ],
  },
];

export const StoriesSection: React.FC = () => {
  const [selectedStory, setSelectedStory] = useState<string>('US-01');

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-sm font-semibold text-slate-200 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            7 Structured User Stories & 14 Quantifiable Acceptance Criteria
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Zero ambiguous adjectives. Every AC follows strict <span className="font-mono text-cyan-300">Given ... When ... Then ...</span> format with explicit milliseconds, counts, or thresholds.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="px-2.5 py-1 bg-emerald-950/70 border border-emerald-800 text-emerald-300 rounded font-mono text-xs">
            5 MUST Stories
          </span>
          <span className="px-2.5 py-1 bg-amber-950/70 border border-amber-800 text-amber-300 rounded font-mono text-xs">
            2 SHOULD Stories
          </span>
          <span className="px-2.5 py-1 bg-cyan-950/70 border border-cyan-800 text-cyan-300 rounded font-mono text-xs">
            14 Mapped Tests
          </span>
        </div>
      </div>

      {/* Traceability Table */}
      <div className="space-y-2">
        <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Traceability Matrix (docs/stories.md#traceability)
        </h3>
        <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/60">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
              <tr>
                <th className="p-2.5">Story ID</th>
                <th className="p-2.5">MoSCoW</th>
                <th className="p-2.5">Story Title</th>
                <th className="p-2.5">Downstream Test Contract</th>
                <th className="p-2.5">AC IDs</th>
                <th className="p-2.5">Verification Target</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {STORIES.map((s) => (
                <tr
                  key={s.id}
                  onClick={() => setSelectedStory(s.id)}
                  className={`cursor-pointer transition-colors ${
                    selectedStory === s.id ? 'bg-cyan-950/40 text-cyan-200' : 'hover:bg-slate-800/40 text-slate-300'
                  }`}
                >
                  <td className="p-2.5 font-bold text-cyan-400">{s.id}</td>
                  <td className="p-2.5">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                        s.moscow === 'MUST'
                          ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                          : 'bg-amber-950 border border-amber-700 text-amber-300'
                      }`}
                    >
                      {s.moscow}
                    </span>
                  </td>
                  <td className="p-2.5 font-sans font-medium text-slate-200">{s.name}</td>
                  <td className="p-2.5 text-slate-400 flex items-center gap-1.5">
                    <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                    {s.mappedTest}
                  </td>
                  <td className="p-2.5 text-cyan-300">{s.acs.map((a) => a.id).join(', ')}</td>
                  <td className="p-2.5 font-sans text-slate-400 text-[11px]">
                    {s.id === 'US-01' && 'Scenario loads 4 nodes in ≤ 200 ms; rejects malformed schema in ≤ 50 ms'}
                    {s.id === 'US-02' && 'Node click reveals drawer in ≤ 100 ms; coordinates render within ±1px'}
                    {s.id === 'US-03' && 'Value patch applies in ≤ 30 ms; out-of-range port rejected'}
                    {s.id === 'US-04' && 'Initial state fails 2 rules in ≤ 50 ms; remediated state passes 3 rules in ≤ 50 ms'}
                    {s.id === 'US-05' && '100/100 score awarded for zero hints; completion disabled while rules fail'}
                    {s.id === 'US-06' && 'Deducts 10 points per hint in ≤ 20 ms; clamps at tier 3 (-30 points)'}
                    {s.id === 'US-07' && 'Audit JSON exported in ≤ 100 ms; contains non-null audit schema properties'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Story Detail */}
      {selectedStory && (
        <div className="p-5 bg-slate-900 border border-slate-700 rounded-lg space-y-4">
          {(() => {
            const story = STORIES.find((s) => s.id === selectedStory)!;
            return (
              <>
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-3">
                    <span className="text-lg font-mono font-bold text-cyan-400">{story.id}</span>
                    <h4 className="text-base font-semibold text-slate-100">{story.name}</h4>
                    <span
                      className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                        story.moscow === 'MUST'
                          ? 'bg-emerald-950 border border-emerald-700 text-emerald-300'
                          : 'bg-amber-950 border border-amber-700 text-amber-300'
                      }`}
                    >
                      {story.moscow}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                    <FileCode className="w-4 h-4 text-cyan-400" />
                    <span>Contract: {story.mappedTest}</span>
                  </div>
                </div>

                <div className="text-xs font-mono text-slate-300 bg-slate-950/60 p-3 rounded border border-slate-800">
                  <span className="text-slate-500 font-bold uppercase">Persona: </span>
                  <span className="text-cyan-300">{story.persona}</span>
                </div>

                <div className="space-y-3">
                  <h5 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                    Acceptance Criteria ({story.acs.length} Testable Contracts)
                  </h5>
                  {story.acs.map((ac) => (
                    <div
                      key={ac.id}
                      className="p-3.5 bg-slate-950/70 border border-slate-800 rounded-md font-mono text-xs space-y-1.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-cyan-400">{ac.id}</span>
                        <span className="text-[10px] text-emerald-400 bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-800">
                          Verified Contract
                        </span>
                      </div>
                      <div className="text-slate-300 font-sans leading-relaxed">
                        <span className="font-mono text-amber-300 font-bold">Given </span>
                        {ac.given},{' '}
                        <span className="font-mono text-cyan-300 font-bold">When </span>
                        {ac.when},{' '}
                        <span className="font-mono text-emerald-300 font-bold">Then </span>
                        {ac.then}
                      </div>
                    </div>
                  ))}
                </div>
              </>
            );
          })()}
        </div>
      )}
    </div>
  );
};
