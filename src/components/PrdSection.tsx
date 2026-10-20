import React, { useState } from 'react';
import { Award, AlertTriangle, CheckCircle2, ShieldAlert, Cpu, Scale, FileText } from 'lucide-react';

export const PrdSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'mvp' | 'risks'>('matrix');

  return (
    <div className="space-y-6">
      {/* Tab Navigation */}
      <div className="flex border-b border-slate-800 gap-1 pb-px">
        <button
          onClick={() => setActiveTab('matrix')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider rounded-t border-t border-x transition-colors ${
            activeTab === 'matrix'
              ? 'bg-slate-900 border-slate-700 text-cyan-400 border-b-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <Scale className="w-3.5 h-3.5" />
          1. Challenge Decision Matrix (docs/prd.md#challenge-selection)
        </button>
        <button
          onClick={() => setActiveTab('mvp')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider rounded-t border-t border-x transition-colors ${
            activeTab === 'mvp'
              ? 'bg-slate-900 border-slate-700 text-cyan-400 border-b-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5" />
          2. MVP Scope Cut & Disqualified Challenges (docs/prd.md#mvp-cut)
        </button>
        <button
          onClick={() => setActiveTab('risks')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider rounded-t border-t border-x transition-colors ${
            activeTab === 'risks'
              ? 'bg-slate-900 border-slate-700 text-cyan-400 border-b-slate-900'
              : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          3. Risk Register & Scope Cut Triggers (docs/prd.md#risks)
        </button>
      </div>

      {activeTab === 'matrix' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Scale className="w-4 h-4 text-cyan-400" />
                Deterministic Scoring Rubric (1–5 scale with verifiable rationale per cell)
              </div>
              <p className="text-xs text-slate-400 mt-1">
                Weights: Learning Value (25%), Feasibility (25%), Demo Impact (20%), Extensibility (15%), Originality (15%).
              </p>
            </div>
            <div className="px-3 py-1.5 bg-cyan-950/60 border border-cyan-800 text-cyan-300 rounded font-mono text-xs font-bold">
              Winner: Challenge 1 (4.70 / 5.00)
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-800 rounded-lg bg-slate-900/60">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950 text-slate-400 uppercase tracking-wider font-mono border-b border-slate-800">
                <tr>
                  <th className="p-3">Challenge Candidate</th>
                  <th className="p-3">Learning (25%)</th>
                  <th className="p-3">Feasibility (25%)</th>
                  <th className="p-3">Demo Impact (20%)</th>
                  <th className="p-3">Extensibility (15%)</th>
                  <th className="p-3">Originality (15%)</th>
                  <th className="p-3 text-right">Total</th>
                  <th className="p-3">Decision Outcome & Trade-Off</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80 font-mono">
                {/* Winner Row */}
                <tr className="bg-cyan-950/30 text-slate-200 border-l-4 border-l-cyan-400">
                  <td className="p-3 font-semibold text-cyan-300">
                    <div className="flex items-center gap-1.5">
                      <Award className="w-4 h-4 text-cyan-400 shrink-0" />
                      1. Interactive Architecture Sandbox & Misconfiguration Debugger
                    </div>
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-cyan-300">5</span> - Candidates solve synthetic broken topologies by inspecting config directly.
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-cyan-300">5</span> - Deterministic JSON topology state machine runs in-browser without external cloud account dependencies.
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-cyan-300">5</span> - Live side-by-side visualization shows immediate visual topology recovery when misconfigurations are corrected.
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-cyan-300">4</span> - Additional scenarios require only declarative JSON schema entries without code modifications.
                  </td>
                  <td className="p-3">
                    <span className="font-bold text-cyan-300">4</span> - Replaces rote flashcards with interactive state inspection that mirrors production root-cause analysis.
                  </td>
                  <td className="p-3 font-bold text-cyan-300 text-right text-sm">4.70</td>
                  <td className="p-3 font-sans text-xs text-cyan-200 bg-cyan-950/50">
                    <span className="font-bold font-mono text-cyan-400 uppercase">Winner: </span>
                    We chose Interactive Architecture Sandbox & Misconfiguration Debugger because it proves diagnostic competency via synthetic state inspection rather than passive memorization; we lose the broader passive audience of flashcard generation.
                  </td>
                </tr>

                {/* Challenge 2 */}
                <tr className="text-slate-400 hover:bg-slate-900/40">
                  <td className="p-3 font-semibold text-slate-300">2. Voice Oral Examiner</td>
                  <td className="p-3"><span className="text-slate-200 font-bold">3</span> - Audio interaction tests recall but cannot evaluate visual topology relationships.</td>
                  <td className="p-3"><span className="text-amber-400 font-bold">2</span> - Audio stream parsing and transcription introduce latency exceeding 4000 ms and speech recognition errors.</td>
                  <td className="p-3"><span className="text-slate-200 font-bold">4</span> - Voice sounds engaging but introduces high audio feedback risk in noisy presentation rooms.</td>
                  <td className="p-3"><span className="text-slate-200 font-bold">3</span> - Extending evaluation rubrics requires custom linguistic prompting for each syllabus objective.</td>
                  <td className="p-3"><span className="text-slate-200 font-bold">4</span> - Spoken evaluation is rare in technical certification preparation tools.</td>
                  <td className="p-3 font-bold text-slate-300 text-right">3.05</td>
                  <td className="p-3 font-sans text-xs text-rose-300/90">
                    <span className="font-mono text-rose-400 font-bold">REJECTED: </span>
                    Speech recognition latency over 4000 ms and room acoustic noise introduce non-deterministic grading failures.
                  </td>
                </tr>

                {/* Challenge 3 */}
                <tr className="text-slate-400 hover:bg-slate-900/40">
                  <td className="p-3 font-semibold text-slate-300">3. Diagram Whiteboard Vision Evaluator</td>
                  <td className="p-3"><span className="text-slate-200 font-bold">4</span> - Freehand diagramming tests architectural design memory and component placement.</td>
                  <td className="p-3"><span className="text-amber-400 font-bold">2</span> - Freehand strokes produce ambiguous bounding boxes that fail deterministic optical parsing tests.</td>
                  <td className="p-3"><span className="text-slate-200 font-bold">4</span> - Canvas diagramming looks visually appealing on projector displays during presentations.</td>
                  <td className="p-3"><span className="text-slate-200 font-bold">3</span> - Supporting new cloud components requires updating computer vision stroke-classification datasets.</td>
                  <td className="p-3"><span className="text-slate-200 font-bold">4</span> - Freehand drawing grading is unique among automated assessment utilities.</td>
                  <td className="p-3 font-bold text-slate-300 text-right">3.30</td>
                  <td className="p-3 font-sans text-xs text-rose-300/90">
                    <span className="font-mono text-rose-400 font-bold">REJECTED: </span>
                    Canvas geometry variations and image recognition errors prevent reproducible pass-or-fail grading verification within the hackathon time limit.
                  </td>
                </tr>

                {/* Challenge 4 */}
                <tr className="text-slate-400 hover:bg-slate-900/40">
                  <td className="p-3 font-semibold text-slate-300">4. Multiplayer Exam Lobby</td>
                  <td className="p-3"><span className="text-amber-400 font-bold">2</span> - Competitive speed quiz rooms prioritize response velocity over structural debugging skill.</td>
                  <td className="p-3"><span className="text-amber-400 font-bold">2</span> - Distributed room synchronization requires stateful WebSocket infrastructure and distributed session locks.</td>
                  <td className="p-3"><span className="text-slate-200 font-bold">3</span> - Multi-user leaderboards demonstrate real-time data streaming across concurrent browser windows.</td>
                  <td className="p-3"><span className="text-slate-200 font-bold">3</span> - Additional game modes require persistent database migrations and custom socket event handlers.</td>
                  <td className="p-3"><span className="text-slate-200 font-bold">3</span> - Live multiplayer buzzer rooms replicate common trivia game formats.</td>
                  <td className="p-3 font-bold text-slate-300 text-right">2.50</td>
                  <td className="p-3 font-sans text-xs text-rose-300/90">
                    <span className="font-mono text-rose-400 font-bold">REJECTED: </span>
                    Distributed synchronization and session negotiation introduce networking failure points without improving diagnostic assessment rigor.
                  </td>
                </tr>

                {/* Challenge 5 */}
                <tr className="text-slate-400 hover:bg-slate-900/40">
                  <td className="p-3 font-semibold text-slate-300">5. Syllabus Flashcard Ingestion Engine</td>
                  <td className="p-3"><span className="text-amber-400 font-bold">2</span> - Spaced-repetition flashcards evaluate factual term retention instead of operational system debugging.</td>
                  <td className="p-3"><span className="text-slate-200 font-bold">5</span> - Ingesting markdown documents into key-value cards executes in sub-100 ms client-side runtime.</td>
                  <td className="p-3"><span className="text-amber-400 font-bold">2</span> - Flipping digital cards on screen offers low visual demonstration impact to a judging panel.</td>
                  <td className="p-3"><span className="text-slate-200 font-bold">4</span> - Adding card decks requires only uploading structured markdown or CSV documents.</td>
                  <td className="p-3"><span className="text-rose-400 font-bold">1</span> - Basic flashcard applications are standard homework projects with minimal novel engineering value.</td>
                  <td className="p-3 font-bold text-slate-300 text-right">2.85</td>
                  <td className="p-3 font-sans text-xs text-rose-300/90">
                    <span className="font-mono text-rose-400 font-bold">REJECTED: </span>
                    Passive memorization produces low learning value and fails to test applied cloud problem-solving capability.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'mvp' && (
        <div className="space-y-6">
          {/* MUST Table */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                MUST Scope (Every feature maps to ≥1 story ID & downstream test)
              </h3>
              <span className="text-xs font-mono text-slate-400">5 Deliverables</span>
            </div>
            <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/60">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3">Feature ID</th>
                    <th className="p-3">Feature Name</th>
                    <th className="p-3">Mapped Story</th>
                    <th className="p-3">Downstream Test</th>
                    <th className="p-3">Engineering Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="p-3 font-bold text-emerald-400">MUST-01</td>
                    <td className="p-3 text-slate-200 font-sans">Synthetic Scenario Loader</td>
                    <td className="p-3 text-cyan-300 font-bold">US-01</td>
                    <td className="p-3 text-slate-400">tests/ac/AC-01.test.ts</td>
                    <td className="p-3 font-sans text-slate-300">Loads declarative JSON topologies without network calls, eliminating external cloud dependency risks during judging.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-emerald-400">MUST-02</td>
                    <td className="p-3 text-slate-200 font-sans">Interactive Topology Graph Inspector</td>
                    <td className="p-3 text-cyan-300 font-bold">US-02</td>
                    <td className="p-3 text-slate-400">tests/ac/AC-02.test.ts</td>
                    <td className="p-3 font-sans text-slate-300">Renders nodes, subnet boundaries, and link states in a 2D canvas with node inspection drawer showing configuration attributes.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-emerald-400">MUST-03</td>
                    <td className="p-3 text-slate-200 font-sans">Configuration Patch Editor</td>
                    <td className="p-3 text-cyan-300 font-bold">US-03</td>
                    <td className="p-3 text-slate-400">tests/ac/AC-03.test.ts</td>
                    <td className="p-3 font-sans text-slate-300">Enables direct remediation of invalid security groups, ports, and route parameters with typed inputs.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-emerald-400">MUST-04</td>
                    <td className="p-3 text-slate-200 font-sans">Deterministic Diagnostic Engine</td>
                    <td className="p-3 text-cyan-300 font-bold">US-04</td>
                    <td className="p-3 text-slate-400">tests/ac/AC-04.test.ts</td>
                    <td className="p-3 font-sans text-slate-300">Runs rule-based validation against current topology state in ≤ 50 ms and produces structured failure diagnostics.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-emerald-400">MUST-05</td>
                    <td className="p-3 text-slate-200 font-sans">Diagnostic Scoring & Report</td>
                    <td className="p-3 text-cyan-300 font-bold">US-05</td>
                    <td className="p-3 text-slate-400">tests/ac/AC-05.test.ts</td>
                    <td className="p-3 font-sans text-slate-300">Computes completion score (0-100), execution duration in seconds, and objective validation badges upon successful patch application.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* SHOULD Table */}
          <div className="space-y-2">
            <h3 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4 text-amber-400" />
              SHOULD Scope
            </h3>
            <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/60">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="p-3">Feature ID</th>
                    <th className="p-3">Feature Name</th>
                    <th className="p-3">Mapped Story</th>
                    <th className="p-3">Downstream Test</th>
                    <th className="p-3">Engineering Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  <tr>
                    <td className="p-3 font-bold text-amber-400">SHOULD-01</td>
                    <td className="p-3 text-slate-200 font-sans">3-Tier Progressive Hint Ladder</td>
                    <td className="p-3 text-cyan-300 font-bold">US-06</td>
                    <td className="p-3 text-slate-400">tests/ac/AC-06.test.ts</td>
                    <td className="p-3 font-sans text-slate-300">Provides progressive 3-tier clues with incremental 10-point score penalties to prevent user blockage.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-amber-400">SHOULD-02</td>
                    <td className="p-3 text-slate-200 font-sans">Exportable Diagnostic Audit Log</td>
                    <td className="p-3 text-cyan-300 font-bold">US-07</td>
                    <td className="p-3 text-slate-400">tests/ac/AC-07.test.ts</td>
                    <td className="p-3 font-sans text-slate-300">Generates downloadable JSON session audit record containing applied patches, timestamps, and final test matrix.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* WON'T Table (All 4 unchosen challenges explicitly named with reasons) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                WON'T Scope (Explicitly Cut Scope & All 4 Unchosen Challenges)
              </h3>
              <span className="text-xs font-mono text-rose-400/90 font-semibold">Strict Hackathon Rejections</span>
            </div>
            <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/60">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 uppercase font-mono border-b border-slate-800">
                  <tr>
                    <th className="p-3">Disqualified Scope Item</th>
                    <th className="p-3">Category</th>
                    <th className="p-3">Explicit Rejection Rationale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 font-mono">
                  <tr className="bg-rose-950/20">
                    <td className="p-3 font-bold text-rose-400">Voice Oral Examiner</td>
                    <td className="p-3 text-slate-400">Unchosen Challenge 2</td>
                    <td className="p-3 font-sans text-slate-300">High inference latency exceeding 4000 ms breaks the 3-minute demo constraint and introduces non-deterministic speech recognition grading failures.</td>
                  </tr>
                  <tr className="bg-rose-950/20">
                    <td className="p-3 font-bold text-rose-400">Diagram Whiteboard Vision Evaluator</td>
                    <td className="p-3 text-slate-400">Unchosen Challenge 3</td>
                    <td className="p-3 font-sans text-slate-300">Canvas geometry edge-cases and vision model hallucination risk deterministic pass-or-fail grading within hackathon time limits.</td>
                  </tr>
                  <tr className="bg-rose-950/20">
                    <td className="p-3 font-bold text-rose-400">Multiplayer Exam Lobby</td>
                    <td className="p-3 text-slate-400">Unchosen Challenge 4</td>
                    <td className="p-3 font-sans text-slate-300">Distributed synchronization and room coordination introduce operational networking complexity without improving core diagnostic assessment rigor.</td>
                  </tr>
                  <tr className="bg-rose-950/20">
                    <td className="p-3 font-bold text-rose-400">Syllabus Flashcard Ingestion Engine</td>
                    <td className="p-3 text-slate-400">Unchosen Challenge 5</td>
                    <td className="p-3 font-sans text-slate-300">Passive memorization produces low learning value and fails to test applied cloud problem-solving capability.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-300">Real Cloud Provider Provisioning</td>
                    <td className="p-3 text-slate-400">Out of Scope</td>
                    <td className="p-3 font-sans text-slate-300">Spin-up times of 180 to 600 seconds per cloud resource violate the 3-minute demonstration time budget and require live credit card credentials.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-300">User Authentication & Cloud Database</td>
                    <td className="p-3 text-slate-400">Out of Scope</td>
                    <td className="p-3 font-sans text-slate-300">Local state persistence via browser memory eliminates login delays, third-party auth outages, and database cold starts during presentation.</td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-slate-300">Proprietary Vendor Logos & Real Exam Dumps</td>
                    <td className="p-3 text-slate-400">Policy Rejection</td>
                    <td className="p-3 font-sans text-slate-300">Strictly prohibited by hackathon guidelines; all topology configurations and objective descriptions are synthetic.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'risks' && (
        <div className="space-y-4">
          <div className="p-4 bg-slate-900/80 border border-slate-800 rounded-lg">
            <h3 className="text-xs font-mono font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-cyan-400" />
              5 Product Risks with Quantitative Scope Cut Triggers
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Every risk defines an actionable, quantitative threshold where feature scope is immediately cut to guarantee demo success.
            </p>
          </div>

          <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/60">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-slate-950 text-slate-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="p-3">Risk ID</th>
                  <th className="p-3">Risk Description</th>
                  <th className="p-3">Likelihood / Impact</th>
                  <th className="p-3">Mitigation Strategy</th>
                  <th className="p-3 text-rose-400">Quantitative Trigger to Cut Scope</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                <tr>
                  <td className="p-3 font-bold text-cyan-400">RSK-01</td>
                  <td className="p-3 font-sans text-slate-200">Canvas rendering stutter or coordinate overflow on low-DPI displays.</td>
                  <td className="p-3"><span className="text-emerald-400">Low</span> / <span className="text-rose-400">High</span></td>
                  <td className="p-3 font-sans text-slate-300">Use SVG-based deterministic grid layout with preset node coordinates instead of heavy physics engines.</td>
                  <td className="p-3 font-sans text-rose-300 bg-rose-950/20 font-medium">If frame rate drops below 55 FPS during node drag on reference browser, lock node positions to static coordinates.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-cyan-400">RSK-02</td>
                  <td className="p-3 font-sans text-slate-200">Rule validation execution time exceeds UI budget.</td>
                  <td className="p-3"><span className="text-emerald-400">Low</span> / <span className="text-rose-400">High</span></td>
                  <td className="p-3 font-sans text-slate-300">Precompile verification rules to synchronous pure JavaScript predicates executing over in-memory JSON state tree.</td>
                  <td className="p-3 font-sans text-rose-300 bg-rose-950/20 font-medium">If diagnostic evaluation duration exceeds 100 ms on test fixture, disable asynchronous worker dispatch and evaluate synchronously on main thread.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-cyan-400">RSK-03</td>
                  <td className="p-3 font-sans text-slate-200">User gets stuck on topology patch values during the live 3-minute presentation.</td>
                  <td className="p-3"><span className="text-amber-400">Med</span> / <span className="text-rose-400">High</span></td>
                  <td className="p-3 font-sans text-slate-300">Embed 1-click 'Apply Reference Patch' debug button accessible via developer shortcut Ctrl+Shift+D.</td>
                  <td className="p-3 font-sans text-rose-300 bg-rose-950/20 font-medium">If judge interaction pauses without an edit for &gt; 45 seconds, reveal recommended patch prompt banner.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-cyan-400">RSK-04</td>
                  <td className="p-3 font-sans text-slate-200">Accidental reference to copyrighted vendor certifications or exam trademarks.</td>
                  <td className="p-3"><span className="text-emerald-400">Low</span> / <span className="text-rose-400">High</span></td>
                  <td className="p-3 font-sans text-slate-300">Automated CI grep check verifying zero instances of trademarked certification codes or proprietary vendor exam questions.</td>
                  <td className="p-3 font-sans text-rose-300 bg-rose-950/20 font-medium">If any vendor trademark or certification test identifier is discovered in fixtures, immediately replace scenario text with synthetic generic cloud terminology.</td>
                </tr>
                <tr>
                  <td className="p-3 font-bold text-cyan-400">RSK-05</td>
                  <td className="p-3 font-sans text-slate-200">Browser window viewport resize clips patch controls.</td>
                  <td className="p-3"><span className="text-amber-400">Med</span> / <span className="text-amber-400">Med</span></td>
                  <td className="p-3 font-sans text-slate-300">Fixed flexbox column layout with min-width 1024px and responsive scrollable side drawer.</td>
                  <td className="p-3 font-sans text-rose-300 bg-rose-950/20 font-medium">If window width &lt; 1024px causes horizontal scrollbars, collapse inspection drawer into floating overlay modal.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
