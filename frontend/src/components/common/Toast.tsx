import React from 'react';
import { CheckCircle2, Info, AlertTriangle, XCircle, X } from 'lucide-react';
import { useWorkspace } from '../../contexts/WorkspaceContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useWorkspace();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        let Icon = CheckCircle2;
        let borderClass = "border-emerald-500/40 bg-slate-900/95 text-emerald-400";
        if (toast.type === 'error') {
          Icon = XCircle;
          borderClass = "border-red-500/40 bg-slate-900/95 text-red-400";
        } else if (toast.type === 'warning') {
          Icon = AlertTriangle;
          borderClass = "border-amber-500/40 bg-slate-900/95 text-amber-400";
        } else if (toast.type === 'info') {
          Icon = Info;
          borderClass = "border-brand-500/40 bg-slate-900/95 text-brand-400";
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border shadow-xl backdrop-blur-md transition-all animate-slide-in ${borderClass}`}
          >
            <Icon className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-xs font-semibold text-slate-100">{toast.title}</p>
              {toast.description && (
                <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{toast.description}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-500 hover:text-slate-300 p-0.5 rounded"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
