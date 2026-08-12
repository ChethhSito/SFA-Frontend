import React from "react";

export type BadgeVariant = 
  | "success" 
  | "warning" 
  | "danger" 
  | "info" 
  | "brand" 
  | "gold" 
  | "neutral";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  pulse?: boolean;
  children?: React.ReactNode;
  className?: string;
}

export default function Badge({
  children,
  variant = "neutral",
  pulse = false,
  className = "",
  ...props
}: BadgeProps) {
  
  const baseStyle = "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider select-none border font-sans";
  
  const variants = {
    success: "bg-emerald-50 text-emerald-700 border-emerald-100",
    warning: "bg-amber-50 text-amber-700 border-amber-100",
    danger: "bg-rose-50 text-rose-700 border-rose-100",
    info: "bg-sky-50 text-sky-700 border-sky-100",
    brand: "bg-rose-50 text-brand-wine border-rose-100",
    gold: "bg-amber-50 text-brand-gold border-amber-100",
    neutral: "bg-slate-50 text-slate-600 border-slate-200",
  };

  return (
    <span
      className={`${baseStyle} ${variants[variant]} ${className}`}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-1.5 w-1.5 shrink-0">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
            variant === "success" ? "bg-emerald-500" :
            variant === "danger" ? "bg-rose-500" :
            variant === "warning" ? "bg-amber-500" : "bg-brand-blue"
          }`}></span>
          <span className={`relative inline-flex rounded-full h-1.5 w-1.5 ${
            variant === "success" ? "bg-emerald-600" :
            variant === "danger" ? "bg-rose-600" :
            variant === "warning" ? "bg-amber-600" : "bg-brand-blue"
          }`}></span>
        </span>
      )}
      {children}
    </span>
  );
}
