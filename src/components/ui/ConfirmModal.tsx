import React, { useEffect } from "react";
import { AlertTriangle, AlertCircle, HelpCircle, Info, Trash2, X } from "lucide-react";

export interface ConfirmModalProps {
  isOpen: boolean;
  title?: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info" | "primary";
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
  onClose: () => void;
}

const variantConfig = {
  danger: {
    icon: Trash2,
    iconWrapper: "bg-red-50 text-red-600 border border-red-200",
    confirmBtn: "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/20",
    badgeText: "Acción Crítica",
    badgeStyle: "bg-red-100 text-red-800",
  },
  warning: {
    icon: AlertTriangle,
    iconWrapper: "bg-amber-50 text-amber-600 border border-amber-200",
    confirmBtn: "bg-amber-600 hover:bg-amber-700 text-white shadow-md shadow-amber-500/20",
    badgeText: "Advertencia",
    badgeStyle: "bg-amber-100 text-amber-800",
  },
  info: {
    icon: Info,
    iconWrapper: "bg-sky-50 text-sky-600 border border-sky-200",
    confirmBtn: "bg-sky-600 hover:bg-sky-700 text-white shadow-md shadow-sky-500/20",
    badgeText: "Información",
    badgeStyle: "bg-sky-100 text-sky-800",
  },
  primary: {
    icon: HelpCircle,
    iconWrapper: "bg-[#9F062A]/10 text-[#9F062A] border border-[#9F062A]/20",
    confirmBtn: "bg-[#9F062A] hover:bg-[#800521] text-white shadow-md shadow-[#9F062A]/20",
    badgeText: "Confirmación",
    badgeStyle: "bg-[#9F062A]/10 text-[#9F062A]",
  },
};

export default function ConfirmModal({
  isOpen,
  title = "Confirmar acción",
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "primary",
  isLoading = false,
  onConfirm,
  onClose,
}: ConfirmModalProps) {
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const current = variantConfig[variant] || variantConfig.primary;
  const Icon = current.icon;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      className="fixed inset-0 z-[10050] flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-150">
        {/* Header decoration bar */}
        <div className={`h-1.5 w-full ${variant === "danger" ? "bg-red-600" : variant === "warning" ? "bg-amber-500" : variant === "info" ? "bg-sky-500" : "bg-[#9F062A]"}`} />

        <div className="p-6">
          <div className="flex items-start gap-4">
            <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl ${current.iconWrapper}`}>
              <Icon className="h-6 w-6" aria-hidden="true" />
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${current.badgeStyle}`}>
                  {current.badgeText}
                </span>
              </div>
              <h3 id="confirm-modal-title" className="text-base font-bold text-slate-900 leading-snug">
                {title}
              </h3>
              <div className="mt-2 text-xs font-medium text-slate-600 leading-relaxed break-words whitespace-pre-line">
                {message}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              aria-label="Cerrar modal"
              className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors disabled:opacity-50"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons Footer */}
        <div className="flex items-center justify-end gap-3 bg-slate-50/80 px-6 py-4 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={isLoading}
            className={`rounded-xl px-5 py-2.5 text-xs font-bold transition-all active:scale-95 disabled:opacity-50 flex items-center gap-2 cursor-pointer ${current.confirmBtn}`}
          >
            {isLoading && (
              <span className="inline-block h-3.5 w-3.5 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
