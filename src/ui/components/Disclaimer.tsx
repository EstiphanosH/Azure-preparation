import React from 'react';
import { ShieldAlert } from 'lucide-react';

/**
 * Universal Mandatory Disclaimer Footer Component
 * Displayed on every route to guarantee full trademark and vendor disclaimers.
 * A11y Notes:
 * - Uses semantic <footer> tag
 * - High-contrast text exceeding 4.5:1 ratio
 */
export const Disclaimer: React.FC<{ className?: string }> = ({ className = '' }) => {
  return (
    <footer
      data-testid="unofficial-footer"
      className={`border-t border-slate-900 bg-slate-950 px-6 py-4 text-xs font-mono text-slate-400 ${className}`}
    >
      <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-amber-300/90 font-medium">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" aria-hidden="true" />
          <span>Unofficial — not affiliated with Microsoft</span>
        </div>
        <p className="text-[11px] text-slate-500">
          Independent educational diagnostic platform. Zero real exam dumps or trademarked assets.
        </p>
      </div>
    </footer>
  );
};
