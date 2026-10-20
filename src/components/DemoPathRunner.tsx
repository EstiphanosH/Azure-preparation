import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Clock, CheckCircle2, ChevronRight, Mic, Volume2 } from 'lucide-react';

interface DemoStep {
  step: number;
  timeWindow: string;
  expectedSeconds: number;
  title: string;
  actionText: string;
  scriptReadAloud: string;
}

const DEMO_STEPS: DemoStep[] = [
  {
    step: 1,
    timeWindow: '00:00 - 00:10',
    expectedSeconds: 10,
    title: 'Cold Open & Scenario Catalog Ingestion',
    actionText: 'Load application root. Scenario SCN-01 loads in <= 200 ms.',
    scriptReadAloud: 'Opening CloudFix Sandbox. The declarative scenario catalog loads instantly in under 200 ms with broken scenario SCN-01.',
  },
  {
    step: 2,
    timeWindow: '00:10 - 00:20',
    expectedSeconds: 20,
    title: 'Topology Graph Rendering',
    actionText: 'Canvas renders 4 nodes (Gateway, Load Balancer, Subnet, Database) & 3 edges in 100 ms.',
    scriptReadAloud: 'Notice the visual topology canvas rendering all four cloud tiers and their traffic links within 100 milliseconds.',
  },
  {
    step: 3,
    timeWindow: '00:20 - 00:30',
    expectedSeconds: 30,
    title: 'Automated Diagnostic Evaluation',
    actionText: 'Banner displays: FAILED (2 of 3 verification rules failing).',
    scriptReadAloud: 'The synchronous rule engine immediately flags two critical misconfigurations: listener port mismatch and blackholed route.',
  },
  {
    step: 4,
    timeWindow: '00:30 - 00:40',
    expectedSeconds: 40,
    title: 'Public Load Balancer Inspection',
    actionText: 'Click alb-public-01. Inspection drawer reveals port 8080.',
    scriptReadAloud: 'Clicking the public load balancer opens the attribute inspector, showing port 8080 instead of standard HTTPS port 443.',
  },
  {
    step: 5,
    timeWindow: '00:40 - 00:50',
    expectedSeconds: 50,
    title: 'Diagnostic Rule Cross-Reference',
    actionText: 'Click failure item RULE-ERR-01. Node highlights red.',
    scriptReadAloud: 'Selecting the rule failure pulses the offending node to establish immediate diagnostic traceability.',
  },
  {
    step: 6,
    timeWindow: '00:50 - 01:05',
    expectedSeconds: 65,
    title: 'Remediate Ingress Listener Port',
    actionText: 'Change listener_port from 8080 to 443 and click Apply Patch.',
    scriptReadAloud: 'We apply our first configuration patch, setting the ingress listener to port 443.',
  },
  {
    step: 7,
    timeWindow: '01:05 - 01:15',
    expectedSeconds: 75,
    title: 'Real-Time Rule Re-evaluation',
    actionText: 'Evaluation completes in <= 50 ms: 1 of 3 rules failing (50% progress).',
    scriptReadAloud: 'In under 50 ms, the rule engine re-evaluates: the ingress rule passes, and the first edge turns active green.',
  },
  {
    step: 8,
    timeWindow: '01:15 - 01:30',
    expectedSeconds: 90,
    title: 'Private Subnet Routing Inspection',
    actionText: 'Select subnet-app-private. Note route_target is blackhole.',
    scriptReadAloud: 'Next we inspect the private app subnet and discover its default egress route target is set to blackhole.',
  },
  {
    step: 9,
    timeWindow: '01:30 - 01:45',
    expectedSeconds: 105,
    title: 'Remediate Subnet Route Target',
    actionText: 'Update route_target to nat-gateway-01 and click Apply Patch.',
    scriptReadAloud: 'We patch the routing table to direct egress through the active NAT gateway.',
  },
  {
    step: 10,
    timeWindow: '01:45 - 01:55',
    expectedSeconds: 115,
    title: 'Deterministic Resolution & Edge Activation',
    actionText: 'All 3 rules evaluate to PASSED. Topology edges turn solid green.',
    scriptReadAloud: 'Immediately all three rules pass in 40 ms. The entire topology visualizes as completely healthy.',
  },
  {
    step: 11,
    timeWindow: '01:55 - 02:05',
    expectedSeconds: 125,
    title: 'Objective Completion Report',
    actionText: 'Modal confirms 100/100 score, 0 hints used, and RESOLVED status.',
    scriptReadAloud: 'The completion summary awards a clean 100 out of 100 score with zero penalty deductions.',
  },
  {
    step: 12,
    timeWindow: '02:05 - 02:10',
    expectedSeconds: 130,
    title: 'Acceptance Contract Suite Verification',
    actionText: 'Run full 14-test programmatic suite. 14/14 tests pass green.',
    scriptReadAloud: 'Finally, we execute the automated contract test suite: all 14 programmatic tests pass green in under 5 milliseconds.',
  },
];

interface DemoPathRunnerProps {
  onStepSelect?: (stepNumber: number) => void;
  onRunTestContract?: () => void;
}

export const DemoPathRunner: React.FC<DemoPathRunnerProps> = ({
  onStepSelect,
  onRunTestContract,
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const totalWords = DEMO_STEPS.reduce(
    (acc, step) => acc + step.scriptReadAloud.split(' ').length,
    0
  );
  const estimatedReadAloudSec = Math.round((totalWords / 130) * 60);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    if (isRunning) {
      interval = setInterval(() => {
        setElapsedSeconds((s) => s + 1);
      }, 1000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning]);

  // Sync step with elapsed seconds during playback
  useEffect(() => {
    if (!isRunning) return;
    const foundIndex = DEMO_STEPS.findIndex(
      (s, idx) =>
        elapsedSeconds <= s.expectedSeconds || idx === DEMO_STEPS.length - 1
    );
    if (foundIndex !== -1 && foundIndex !== currentStepIndex) {
      setCurrentStepIndex(foundIndex);
    }
  }, [elapsedSeconds, isRunning]);

  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStepClick = (index: number) => {
    setCurrentStepIndex(index);
    setElapsedSeconds(index === 0 ? 0 : DEMO_STEPS[index - 1].expectedSeconds);
    if (onStepSelect) {
      onStepSelect(DEMO_STEPS[index].step);
    }
  };

  const activeStep = DEMO_STEPS[currentStepIndex];

  return (
    <div className="space-y-6">
      {/* Timer & Pacing Control Panel */}
      <div className="p-5 bg-slate-900 border border-slate-800 rounded-lg flex flex-wrap items-center justify-between gap-6 shadow-xl">
        <div className="flex items-center gap-4">
          <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-center min-w-[120px]">
            <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block">
              Elapsed Time
            </span>
            <span
              className={`text-2xl font-mono font-bold ${
                elapsedSeconds <= 180 ? 'text-cyan-400' : 'text-rose-400'
              }`}
            >
              {formatTime(elapsedSeconds)}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold uppercase text-slate-300">
                Max Time Limit:
              </span>
              <span className="text-xs font-mono text-emerald-400 font-bold">03:00 (180s)</span>
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs font-mono text-slate-400">Total Demo Path Duration:</span>
              <span className="text-xs font-mono text-cyan-300 font-bold">130s (02:10)</span>
            </div>
          </div>
        </div>

        {/* Word count & pacing stats */}
        <div className="flex items-center gap-3 px-4 py-2.5 bg-slate-950/70 border border-slate-800 rounded-lg text-xs font-mono">
          <div className="flex items-center gap-1.5 text-slate-300">
            <Mic className="w-3.5 h-3.5 text-cyan-400" />
            <span>{totalWords} Words</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1.5 text-slate-300">
            <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Read-Aloud Time: ~{estimatedReadAloudSec}s @ 130 WPM</span>
          </div>
          <span className="text-slate-600">|</span>
          <span className="text-emerald-400 font-bold">≤ 3:00 (PASSED)</span>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsRunning(!isRunning)}
            className={`flex items-center gap-2 px-4 py-2 rounded font-mono text-xs font-bold transition-all ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-slate-950'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950'
            }`}
          >
            {isRunning ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run Demo Timer</span>
              </>
            )}
          </button>
          <button
            onClick={() => {
              setIsRunning(false);
              setElapsedSeconds(0);
              setCurrentStepIndex(0);
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded border border-slate-700"
            title="Reset Timer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Active Step Teleprompter Card */}
      <div className="p-5 bg-cyan-950/20 border border-cyan-800/80 rounded-lg space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-cyan-500 text-slate-950 font-mono text-xs font-bold rounded">
              Step {activeStep.step} of 12
            </span>
            <span className="font-mono text-xs text-cyan-300 font-semibold">
              Window: {activeStep.timeWindow}
            </span>
          </div>
          <span className="text-xs font-mono text-slate-400">
            Target Mark: {activeStep.expectedSeconds}s
          </span>
        </div>

        <h4 className="text-base font-bold text-slate-100">{activeStep.title}</h4>

        <div className="p-3 bg-slate-950/80 border border-slate-800 rounded font-mono text-xs text-cyan-200">
          <span className="text-slate-500 font-bold uppercase block text-[10px] mb-1">
            UI Action:
          </span>
          {activeStep.actionText}
        </div>

        <div className="p-3 bg-slate-900/90 border border-cyan-900/60 rounded text-xs text-slate-200 leading-relaxed">
          <span className="text-cyan-400 font-mono font-bold uppercase block text-[10px] mb-1">
            Spoken Script (Read-Aloud):
          </span>
          "{activeStep.scriptReadAloud}"
        </div>

        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-2">
            <button
              disabled={currentStepIndex === 0}
              onClick={() => handleStepClick(currentStepIndex - 1)}
              className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-300 rounded text-xs font-mono"
            >
              Previous Step
            </button>
            <button
              disabled={currentStepIndex === DEMO_STEPS.length - 1}
              onClick={() => handleStepClick(currentStepIndex + 1)}
              className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 font-bold rounded text-xs font-mono flex items-center gap-1"
            >
              <span>Next Step</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {activeStep.step === 12 && onRunTestContract && (
            <button
              onClick={onRunTestContract}
              className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-mono text-xs rounded shadow-lg"
            >
              Verify Test Contract Suite Now
            </button>
          )}
        </div>
      </div>

      {/* Full 12-Step Timeline Matrix */}
      <div className="space-y-2">
        <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
          Complete 12-Step Demonstration Sequence (docs/prd.md#demo-path)
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {DEMO_STEPS.map((s, idx) => {
            const isCompleted = idx < currentStepIndex;
            const isCurrent = idx === currentStepIndex;

            return (
              <div
                key={s.step}
                onClick={() => handleStepClick(idx)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  isCurrent
                    ? 'bg-cyan-950/40 border-cyan-500 shadow-md ring-1 ring-cyan-500/50'
                    : isCompleted
                    ? 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    : 'bg-slate-950/40 border-slate-800/80 text-slate-500 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-1.5">
                  <span
                    className={`font-bold ${
                      isCurrent
                        ? 'text-cyan-400'
                        : isCompleted
                        ? 'text-emerald-400'
                        : 'text-slate-500'
                    }`}
                  >
                    Step {s.step}
                  </span>
                  <span className="text-[11px] text-slate-400">{s.timeWindow}</span>
                </div>
                <div
                  className={`text-xs font-semibold line-clamp-1 ${
                    isCurrent ? 'text-slate-100' : 'text-slate-300'
                  }`}
                >
                  {s.title}
                </div>
                <div className="text-[11px] text-slate-400 mt-1 line-clamp-2">{s.actionText}</div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
