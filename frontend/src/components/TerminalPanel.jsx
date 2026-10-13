import React from 'react';

/**
 * CLI Output Panel matching Vercel Design System.
 * Uses Geist Mono aesthetic with ▲ and ✓ markers. No inline CSS or emojis.
 */
export default function TerminalPanel({ logs = [], onClear }) {
  return (
    <div className="bg-pure border border-hairline rounded-md p-4 font-mono text-xs text-obsidian shadow-subtle-2">
      <div className="flex items-center justify-between border-b border-hairline pb-2.5 mb-3">
        <div className="flex items-center gap-2">
          <span className="inline-block w-2.5 h-2.5 bg-obsidian rounded-sm"></span>
          <span className="font-mono text-[11px] tracking-widest uppercase text-stone font-medium">
            PIPELINE EXECUTION LOG
          </span>
        </div>
        {logs.length > 0 && (
          <button
            onClick={onClear}
            className="text-[11px] text-stone hover:text-obsidian transition-colors uppercase font-mono tracking-wider"
          >
            Clear
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
        {logs.length === 0 ? (
          <div className="text-smoke italic font-mono text-[12px] py-1">
            ▲ Awaiting file upload and processing triggers...
          </div>
        ) : (
          logs.map((log, index) => {
            const isSuccess = log.type === 'success';
            const isError = log.type === 'error';
            const isWarning = log.type === 'warning';
            const isInfo = log.type === 'info';

            return (
              <div key={index} className="flex items-start gap-2 leading-relaxed">
                {isSuccess && <span className="text-terminal-green font-bold">✓</span>}
                {isError && <span className="text-red-600 font-bold">✖</span>}
                {isWarning && <span className="text-amber-600 font-bold">▲</span>}
                {(isInfo || (!isSuccess && !isError && !isWarning)) && <span className="text-obsidian">▲</span>}
                
                <span
                  className={
                    isSuccess
                      ? 'text-terminal-green'
                      : isError
                      ? 'text-red-600'
                      : isWarning
                      ? 'text-amber-700 font-medium'
                      : 'text-charcoal'
                  }
                >
                  {log.text}
                </span>

                {log.timestamp && (
                  <span className="ml-auto text-[10px] text-smoke font-mono">
                    {log.timestamp}
                  </span>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
