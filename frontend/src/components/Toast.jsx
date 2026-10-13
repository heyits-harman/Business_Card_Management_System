import React from 'react';
import { AlertCircle, CheckCircle2, AlertTriangle, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const isError = toast.type === 'error';
  const isSuccess = toast.type === 'success';
  const isWarning = toast.type === 'warning';

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md w-full animate-bounce-in">
      <div
        className={`p-4 rounded-md border shadow-lg flex items-start gap-3 ${
          isError
            ? 'bg-red-50 border-red-200 text-red-900'
            : isSuccess
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : isWarning
            ? 'bg-amber-50 border-amber-200 text-amber-900'
            : 'bg-pure border-hairline text-obsidian shadow-subtle-2'
        }`}
      >
        {isError && <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />}
        {isSuccess && <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />}
        {isWarning && <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />}

        <div className="flex-1 text-xs">
          {toast.code && (
            <div className="font-mono text-[10px] uppercase font-bold tracking-wider mb-0.5">
              CODE: {toast.code}
            </div>
          )}
          <div className="font-sans font-medium">{toast.message}</div>
        </div>

        <button
          onClick={onClose}
          className="text-stone hover:text-obsidian p-0.5 rounded transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
