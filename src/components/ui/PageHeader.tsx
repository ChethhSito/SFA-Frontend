import React from "react";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon?: React.ReactNode;
  actions?: React.ReactNode;
  id?: string;
}

export default function PageHeader({
  title,
  subtitle,
  icon,
  actions,
  id
}: PageHeaderProps) {
  return (
    <div
      id={id}
      className="bg-white rounded-xl border border-slate-100 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm"
    >
      <div className="flex items-center gap-4 text-left">
        {icon && (
          <div className="p-3 bg-rose-50 text-brand-wine rounded-xl shrink-0 border border-rose-100 shadow-xs">
            {icon}
          </div>
        )}
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight font-display mb-1">
            {title}
          </h2>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">
            {subtitle}
          </p>
        </div>
      </div>
      
      {actions && (
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto shrink-0 justify-start md:justify-end">
          {actions}
        </div>
      )}
    </div>
  );
}
