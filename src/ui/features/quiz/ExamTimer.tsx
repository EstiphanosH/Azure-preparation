/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState, useRef } from 'react';
import { Clock, AlertTriangle, AlertCircle, Pause, Play } from 'lucide-react';

export interface ExamTimerProps {
  /** Initial time limit in seconds (e.g. 2700 for 45 minutes) */
  readonly initialSeconds: number;
  /** Callback triggered when countdown hits 0 */
  readonly onTimeExpired: () => void;
  /** Total number of questions in current exam session */
  readonly totalQuestions: number;
  /** Number of questions currently answered */
  readonly answeredCount: number;
  /** Optional callback to report elapsed time to parent */
  readonly onTimeUpdate?: (elapsedSeconds: number, remainingSeconds: number) => void;
  /** Whether the timer is currently paused */
  readonly isPaused?: boolean;
}

export const ExamTimer: React.FC<ExamTimerProps> = ({
  initialSeconds,
  onTimeExpired,
  totalQuestions,
  answeredCount,
  onTimeUpdate,
  isPaused = false,
}) => {
  const [secondsRemaining, setSecondsRemaining] = useState<number>(initialSeconds);
  const [isLocalPaused, setIsLocalPaused] = useState<boolean>(isPaused);
  const hasExpiredRef = useRef<boolean>(false);

  useEffect(() => {
    setSecondsRemaining(initialSeconds);
    hasExpiredRef.current = false;
  }, [initialSeconds]);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      if (!hasExpiredRef.current) {
        hasExpiredRef.current = true;
        onTimeExpired();
      }
      return;
    }

    if (isLocalPaused) return;

    const intervalId = window.setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(intervalId);
          if (!hasExpiredRef.current) {
            hasExpiredRef.current = true;
            onTimeExpired();
          }
          return 0;
        }
        const updated = prev - 1;
        const elapsed = initialSeconds - updated;
        onTimeUpdate?.(elapsed, updated);
        return updated;
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, [secondsRemaining, isLocalPaused, onTimeExpired, onTimeUpdate, initialSeconds]);

  const minutes = Math.floor(secondsRemaining / 60);
  const seconds = secondsRemaining % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const remainingQuestions = Math.max(1, totalQuestions - answeredCount);
  const secondsPerQuestion = Math.round(secondsRemaining / remainingQuestions);

  // Visual urgency tiers
  const isCritical = secondsRemaining > 0 && secondsRemaining <= 60; // < 1 min
  const isWarning = secondsRemaining > 60 && secondsRemaining <= 300; // 1-5 mins

  return (
    <div
      data-testid="exam-timer-container"
      role="timer"
      aria-live="polite"
      aria-label={`Exam timer: ${formattedTime} remaining`}
      className={`flex items-center gap-2.5 px-3 py-1.5 rounded-lg border transition-all text-xs font-mono tabular-nums ${
        isCritical
          ? 'bg-rose-500/15 border-rose-500 text-rose-600 dark:text-rose-400 animate-pulse font-bold'
          : isWarning
          ? 'bg-amber-500/15 border-amber-500 text-amber-700 dark:text-amber-400 font-bold'
          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-200'
      }`}
    >
      <div className="flex items-center gap-1.5">
        {isCritical ? (
          <AlertCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
        ) : isWarning ? (
          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
        ) : (
          <Clock className="w-3.5 h-3.5 text-sky-700 dark:text-sky-300 shrink-0" />
        )}
        <span className="font-bold text-sm tracking-tight">{formattedTime}</span>
      </div>

      <div className="hidden sm:flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 pl-1 border-l border-slate-300 dark:border-slate-700">
        <span>{remainingQuestions} left</span>
        <span aria-hidden="true">·</span>
        <span>~{secondsPerQuestion}s/Q</span>
      </div>

      <button
        type="button"
        onClick={() => setIsLocalPaused((p) => !p)}
        title={isLocalPaused ? 'Resume exam countdown' : 'Pause exam countdown'}
        aria-label={isLocalPaused ? 'Resume exam countdown' : 'Pause exam countdown'}
        className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 p-0.5 rounded transition-colors ml-0.5"
      >
        {isLocalPaused ? <Play className="w-3 h-3 fill-current" /> : <Pause className="w-3 h-3" />}
      </button>
    </div>
  );
};
