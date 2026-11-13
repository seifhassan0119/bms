import React from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export default function Toast({ toasts, onDismiss }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      role="region"
      aria-label="Notifications"
      className="fixed bottom-4 right-3 left-3 sm:left-auto sm:right-5 sm:bottom-5 z-50 flex flex-col gap-2 max-w-md pointer-events-none safe-bottom"
    >
      {toasts.map((toast) => {
        const isSuccess = toast.type === 'success';
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            role={isError ? 'alert' : 'status'}
            aria-live={isError ? 'assertive' : 'polite'}
            aria-atomic="true"
            className={`pointer-events-auto flex items-start gap-3 p-3.5 sm:p-4 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-bottom-2 ${
              isSuccess
                ? 'bg-emerald-950/95 border-emerald-500/40 text-emerald-100'
                : isError
                ? 'bg-rose-950/95 border-rose-500/40 text-rose-100'
                : 'bg-slate-900/95 border-slate-700/60 text-slate-100'
            }`}
          >
            {isSuccess && <CheckCircle2 aria-hidden="true" className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}
            {isError && <AlertCircle aria-hidden="true" className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />}
            {!isSuccess && !isError && <Info aria-hidden="true" className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />}

            <div className="flex-1 text-xs">
              {toast.title && <p className="font-bold text-white text-xs sm:text-sm">{toast.title}</p>}
              <p className="mt-0.5 leading-relaxed text-slate-200">{toast.message}</p>
            </div>

            <button
              type="button"
              onClick={() => onDismiss(toast.id)}
              aria-label={`Dismiss ${toast.title || 'notification'}`}
              className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400 min-h-[28px] min-w-[28px] flex items-center justify-center shrink-0"
            >
              <X aria-hidden="true" className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
