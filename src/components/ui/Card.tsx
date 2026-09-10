import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  withActiveHighlight?: boolean;
  withHoverEffect?: boolean;
  children?: React.ReactNode;
  className?: string;
  key?: React.Key;
}

export function Card({
  children,
  className = "",
  withActiveHighlight = false,
  withHoverEffect = false,
  ...props
}: CardProps) {
  return (
    <div
      className={`bg-white rounded-xl border border-slate-100 shadow-xs text-left relative overflow-hidden transition-all duration-200 ${
        withActiveHighlight ? "border-l-4 border-l-[#9F062A]" : ""
      } ${withHoverEffect ? "hover:scale-[1.01] hover:shadow-xs" : ""} ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export function CardHeader({
  children,
  className = "",
  ...props
}: CardHeaderProps) {
  return (
    <div
      className={`px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

interface CardTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children?: React.ReactNode;
  className?: string;
}

export function CardTitle({
  children,
  className = "",
  ...props
}: CardTitleProps) {
  return (
    <h3
      className={`text-xs font-black text-slate-800 uppercase tracking-tight ${className}`}
      {...props}
    >
      {children}
    </h3>
  );
}

interface CardDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
  children?: React.ReactNode;
  className?: string;
}

export function CardDescription({
  children,
  className = "",
  ...props
}: CardDescriptionProps) {
  return (
    <p
      className={`text-[10px] text-slate-400 font-bold uppercase tracking-wide ${className}`}
      {...props}
    >
      {children}
    </p>
  );
}

interface CardContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export function CardContent({
  children,
  className = "",
  ...props
}: CardContentProps) {
  return (
    <div className={`p-6 ${className}`} {...props}>
      {children}
    </div>
  );
}

interface CardFooterProps extends React.HTMLAttributes<HTMLDivElement> {
  children?: React.ReactNode;
  className?: string;
}

export function CardFooter({
  children,
  className = "",
  ...props
}: CardFooterProps) {
  return (
    <div
      className={`px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
