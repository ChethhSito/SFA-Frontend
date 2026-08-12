import React from "react";
import { AlertTriangle, Info, CheckCircle2, XCircle } from "lucide-react";

interface AlertBoxProps {
  title: string;
  description: string;
  variant?: "danger" | "warning" | "success" | "info" | "brand";
  actions?: React.ReactNode;
  className?: string;
}

export default function AlertBox({
  title,
  description,
  variant = "warning",
  actions,
  className = ""
}: AlertBoxProps) {
  
  const icons = {
    danger: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
    brand: <AlertTriangle className="w-5 h-5 text-brand-wine shrink-0 animate-pulse" />
  };

  const variants = {
    danger: "bg-rose-50 border-rose-200 text-rose-900",
    warning: "bg-amber-50 border-amber-200 text-amber-900",
    success: "bg-emerald-50 border-emerald-200 text-emerald-900",
    info: "bg-sky-50 border-sky-200 text-sky-900",
    brand: "bg-rose-50/50 border-rose-200/60 text-slate-900"
  };

  return (
    <div
      className={`rounded-xl border p-5 shadow-xs text-left flex flex-col md:flex-row gap-4 items-start md:items-center justify-between ${variants[variant]} ${className}`}
    >
      <div className="flex gap-3.5 items-start">
        <div className="mt-0.5">{icons[variant]}</div>
        <div>
          <h4 className="text-xs font-black uppercase tracking-wider mb-1">
            {title}
          </h4>
          <p className="text-xs font-medium leading-relaxed opacity-90">
            {description}
          </p>
        </div>
      </div>
      
      {actions && (
        <div className="w-full md:w-auto shrink-0 flex justify-end">
          {actions}
        </div>
      )}
    </div>
  );
}
export { AlertTriangle, Info, CheckCircle2, XCircle };
