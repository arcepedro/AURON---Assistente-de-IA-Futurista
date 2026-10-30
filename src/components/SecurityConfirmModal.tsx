import React, { useState, useEffect } from 'react';
import { ShieldAlert, AlertTriangle, Check, X, Lock } from 'lucide-react';

interface SecurityConfirmModalProps {
  isOpen: boolean;
  title: string;
  description: string;
  severity?: 'low' | 'medium' | 'high';
  onConfirm: () => void;
  onCancel: () => void;
}

export const SecurityConfirmModal: React.FC<SecurityConfirmModalProps> = ({
  isOpen,
  title,
  description,
  severity = 'high',
  onConfirm,
  onCancel,
}) => {
  const [countdown, setCountdown] = useState(3);

  useEffect(() => {
    if (!isOpen) {
      setCountdown(3);
      return;
    }

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [isOpen, countdown]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md font-rajdhani">
      <div className="w-full max-w-md p-6 rounded-2xl bg-[#090d19] border-2 border-red-500/50 shadow-[0_0_40px_rgba(239,68,68,0.3)] auron-hud-corner relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 border-b border-red-900/40 pb-3">
          <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-700/60 flex items-center justify-center text-red-400">
            <ShieldAlert className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="font-mono-tech text-[10px] tracking-wider text-red-400 uppercase font-semibold">
              PROTOCOLO DE SEGURANÇA AURON
            </span>
            <h2 className="font-orbitron font-bold text-lg text-white">{title}</h2>
          </div>
        </div>

        <div className="p-4 rounded-xl bg-red-950/20 border border-red-900/30 text-sm text-slate-300 leading-relaxed flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p>{description}</p>
        </div>

        <p className="text-xs text-slate-400 font-mono-tech">
          Esta ação alterará dados ou parâmetros permanentes. A autorização do usuário é obrigatória.
        </p>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-800">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2.5 rounded-xl border border-slate-700 hover:bg-slate-900 text-slate-300 text-sm font-semibold transition-colors flex items-center gap-1.5"
          >
            <X className="w-4 h-4" />
            Cancelar Ação
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={countdown > 0}
            className={`px-5 py-2.5 rounded-xl text-white text-sm font-bold transition-all flex items-center gap-2 ${
              countdown > 0
                ? 'bg-red-950/80 border border-red-800 text-red-400 cursor-not-allowed'
                : 'bg-red-600 hover:bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)] cursor-pointer'
            }`}
          >
            <Check className="w-4 h-4" />
            <span>{countdown > 0 ? `Aguarde (${countdown}s)` : 'Autorizar & Executar'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
