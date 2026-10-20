import React from 'react';

/**
 * Accessible DomainBreakdownChart Component
 * A11y Notes:
 * - Uses semantic progressbar roles with aria-valuenow, aria-valuemin, aria-valuemax
 * - Visible numeric percentage on every row
 * - Fully accessible table/list structure
 */
export interface DomainScoreItem {
  domainId: string;
  domainTitle: string;
  weightPct: number;
  accuracyPct: number;
  weightedScore: number;
  attemptsCount: number;
}

export interface DomainBreakdownChartProps {
  breakdown: readonly DomainScoreItem[];
}

export const DomainBreakdownChart: React.FC<DomainBreakdownChartProps> = ({ breakdown }) => {
  return (
    <div className="space-y-4 font-mono text-xs">
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <span className="font-bold text-white uppercase text-[11px] tracking-wider">
          Architectural Domain Proficiency
        </span>
        <span className="text-slate-400 text-[10px]">Weight / Accuracy</span>
      </div>

      <div className="space-y-3.5">
        {breakdown.map((item) => {
          const isPassing = item.accuracyPct >= 60;
          return (
            <div key={item.domainId} className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-slate-200 font-semibold truncate max-w-[240px]">
                  {item.domainTitle}
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-slate-400 text-[11px]">Weight {item.weightPct}%</span>
                  <span
                    className={`font-bold ${
                      isPassing ? 'text-emerald-400' : 'text-amber-400'
                    }`}
                  >
                    {item.accuracyPct}%
                  </span>
                </div>
              </div>

              {/* Progress bar with ARIA */}
              <div
                role="progressbar"
                aria-label={`${item.domainTitle} proficiency`}
                aria-valuenow={item.accuracyPct}
                aria-valuemin={0}
                aria-valuemax={100}
                className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden border border-slate-800"
              >
                <div
                  style={{ width: `${Math.min(100, Math.max(0, item.accuracyPct))}%` }}
                  className={`h-full transition-all duration-500 ${
                    isPassing ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
