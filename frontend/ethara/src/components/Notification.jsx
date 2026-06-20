import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, X } from 'lucide-react';

export default function Notification({ message, type, onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, 4000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-4 py-3.5 rounded-2xl border shadow-2xl backdrop-blur-md transition-all duration-300 ${
      type === 'success'
        ? 'bg-slate-900/95 border-emerald-500/30 text-emerald-200 shadow-emerald-950/20'
        : 'bg-slate-900/95 border-rose-500/30 text-rose-200 shadow-rose-950/20'
    }`}>
      <div className="flex items-center justify-center">
        {type === 'success' ? (
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
        ) : (
          <AlertCircle className="w-5 h-5 text-rose-400" />
        )}
      </div>
      <div className="flex-1 text-sm font-medium max-w-sm leading-relaxed pr-2">
        {message}
      </div>
      <button 
        onClick={onClose} 
        className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
