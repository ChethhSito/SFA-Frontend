import React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "success" | "danger" | "warning";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  children?: React.ReactNode;
  className?: string;
  type?: "button" | "submit" | "reset";
  disabled?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth = false,
  className = "",
  type = "button",
  disabled,
  ...props
}: ButtonProps) {
  
  // Style config base on our institutional design token choices
  const baseStyle = "inline-flex items-center justify-center font-display rounded-lg font-black tracking-wide text-xs transition-all duration-200 uppercase pointer-events-auto select-none cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-offset-2 active:scale-98 disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100";
  
  const variants = {
    primary: "bg-brand-wine hover:bg-rose-900 text-white shadow-sm hover:shadow-md focus:ring-brand-wine",
    secondary: "bg-brand-gold hover:bg-amber-600 text-white shadow-sm hover:shadow-md focus:ring-brand-gold",
    outline: "bg-white hover:bg-slate-50 border border-slate-200 text-slate-800 focus:ring-slate-400",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm focus:ring-emerald-500",
    danger: "bg-rose-700 hover:bg-rose-800 text-white shadow-sm focus:ring-rose-500",
    warning: "bg-amber-500 hover:bg-amber-600 text-white shadow-sm focus:ring-amber-500",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-[10px]",
    md: "px-4 py-2.5 text-[11px]",
    lg: "px-6 py-3.5 text-xs",
  };

  const widthStyle = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      className={`${baseStyle} ${variants[variant]} ${sizes[size]} ${widthStyle} ${className}`}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
}
