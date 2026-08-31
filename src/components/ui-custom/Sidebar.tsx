import React, { useState, ReactNode } from "react";
import { GraduationCap, Menu, X, LogOut, ChevronDown, ChevronRight } from "lucide-react";
import Badge from "./Badge";
import { motion, AnimatePresence } from "motion/react";

export interface SidebarSubItem {
  label: string;
  icon?: ReactNode;
  route: string;
  active?: boolean;
}

export interface SidebarItem {
  label: string;
  icon: ReactNode;
  route: string;
  active?: boolean;
  subItems?: SidebarSubItem[];
}

export interface SidebarSection {
  title: string;
  items: SidebarItem[];
}

export interface SidebarProps {
  institution: {
    name: string;
    subtitle: string;
    logo?: ReactNode | string;
  };

  user: {
    name: string;
    role: string;
    status: string;
    avatar?: string;
  };

  sections: SidebarSection[];
  onItemClick?: (route: string) => void;
  onLogout?: () => void;
  extraContent?: ReactNode;
  className?: string;
}

export default function Sidebar({
  institution,
  user,
  sections,
  onItemClick,
  onLogout,
  extraContent,
  className = ""
}: SidebarProps) {
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Helper to extract initials
  const getInitials = (name: string) => {
    if (!name) return "U";
    const parts = name.split(" ");
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name[0].toUpperCase();
  };

  // Helper to render Status Badge colors dynamically
  const getStatusVariant = (status: string) => {
    const s = status.toUpperCase();
    if (s.includes("ADMITIDO")) return "warning";
    if (s.includes("MATRICULADO") || s.includes("VALIDADO") || s.includes("APROBADO") || s.includes("APTO")) return "success";
    if (s.includes("OBSERVADO") || s.includes("RECHAZADO") || s.includes("FALTA") || s.includes("NO APTO")) return "danger";
    if (s.includes("TARDANZA") || s.includes("PENDIENTE") || s.includes("EN PROCESO")) return "warning";
    return "brand";
  };

  const renderLogo = () => {
    if (!institution.logo) {
      return (
        <div className="h-10 w-10 bg-[#8B0026] text-[#CFA020] rounded-xl flex items-center justify-center font-bold shadow-md shrink-0 border border-[#8B0026]/10">
          <GraduationCap className="w-5 h-5" />
        </div>
      );
    }
    if (typeof institution.logo === "string") {
      return (
        <div className="h-10 w-10 bg-[#8B0026] text-[#CFA020] rounded-xl flex items-center justify-center font-bold shadow-md shrink-0 overflow-hidden">
          {institution.logo.startsWith("http") ? (
            <img src={institution.logo} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-base font-black">{institution.logo}</span>
          )}
        </div>
      );
    }
    return institution.logo;
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-white">
      {/* Header of Institution - Perfect White Theme like Reference Image */}
      <div className="p-5 flex items-center gap-3 border-b border-slate-100">
        {renderLogo()}
        <div className="text-left">
          <h1 className="text-sm font-black text-[#8B0026] tracking-tight leading-none uppercase">
            {institution.name}
          </h1>
          <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide block mt-1">
            {institution.subtitle}
          </span>
        </div>
      </div>

      {/* User Status Profile Card - Match Image exactly with bg-slate-50/50, yellow avatar, stats */}
      <div className="px-4 py-4 mt-2">
        <div className="p-4 bg-slate-50/60 border border-slate-100 rounded-2xl text-left relative overflow-hidden shadow-xs hover:border-slate-200/80 transition-colors">
          <div className="flex items-center gap-3">
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt="Avatar" 
                className="w-10 h-10 rounded-full object-cover ring-2 ring-slate-100 shrink-0" 
              />
            ) : (
              <div className="h-10 w-10 bg-amber-400 text-slate-900 border border-amber-300 rounded-full flex items-center justify-center font-black text-xs shrink-0 tracking-tight">
                {getInitials(user.name)}
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h4 className="text-[11.5px] font-black text-slate-800 leading-tight block truncate" title={user.name}>
                {user.name}
              </h4>
              <span className="text-[9.5px] text-slate-500 font-bold block truncate mt-0.5" title={user.role}>
                {user.role}
              </span>
            </div>
          </div>
          
          <div className="mt-3.5 pt-2.5 border-t border-slate-200/50 flex justify-between items-center text-[10px] font-bold">
            <span className="text-slate-400 uppercase tracking-widest text-[9px] font-black">ESTADO:</span>
            <Badge variant={getStatusVariant(user.status)} className="font-extrabold tracking-wider px-2 py-0.5 text-[9px] uppercase border">
              {user.status}
            </Badge>
          </div>
        </div>
      </div>

      {extraContent && (
        <div className="px-4 pb-2">
          {extraContent}
        </div>
      )}

      {/* Scrollable Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-4 py-2 space-y-5 custom-scrollbar text-left">
        {sections.map((section, idx) => (
          <div key={idx} className="space-y-1.5">
            {/* Section Title */}
            <span className="text-[9.5px] text-slate-500 font-black uppercase tracking-wider block px-2.5">
              {section.title}
            </span>

            {/* Menu Items */}
            <div className="space-y-1">
              {section.items.map((item, itemIdx) => {
                const hasSubItems = !!item.subItems && item.subItems.length > 0;
                const isSubActive = hasSubItems && item.subItems!.some(s => s.active);
                const isExpanded = expandedItems[item.route] !== undefined 
                  ? expandedItems[item.route] 
                  : (isSubActive || item.active);
                
                const isItemActive = item.active || (hasSubItems && isSubActive);

                return (
                  <div key={itemIdx} className="space-y-0.5">
                    <button
                      onClick={() => {
                        if (hasSubItems) {
                          setExpandedItems(prev => ({
                            ...prev,
                            [item.route]: !isExpanded
                          }));
                        } else {
                          if (onItemClick) onItemClick(item.route);
                          setIsOpenMobile(false);
                        }
                      }}
                      className={`w-full text-left py-2.5 px-3 rounded-xl transition-all duration-150 flex items-center justify-between cursor-pointer text-xs font-semibold ${
                        item.active
                          ? "bg-[#8B0026] text-white font-bold shadow-md shadow-red-950/5 border border-red-900/10"
                          : isSubActive
                            ? "bg-slate-100 text-[#8B0026] font-bold border border-slate-200"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <span className={`w-4 h-4 shrink-0 flex items-center justify-center transition-colors ${item.active ? "text-amber-400" : isSubActive ? "text-[#8B0026]" : "text-slate-400"}`}>
                          {item.icon}
                        </span>
                        <span className="truncate tracking-wide">{item.label}</span>
                      </div>
                      {hasSubItems && (
                        <span className="shrink-0 text-slate-400 ml-1">
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </span>
                      )}
                    </button>

                    {/* Smooth disclosure for subItems */}
                    {hasSubItems && (
                      <AnimatePresence initial={false}>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.15, ease: "easeInOut" }}
                            className="overflow-hidden pl-5 pr-1 space-y-1 mt-1 border-l border-slate-100 ml-4 py-0.5"
                          >
                            {item.subItems!.map((sub, subIdx) => {
                              const isThisSubActive = sub.active;
                              return (
                                <button
                                  key={subIdx}
                                  onClick={() => {
                                    if (onItemClick) onItemClick(sub.route);
                                    setIsOpenMobile(false);
                                  }}
                                  className={`w-full text-left py-2 px-3 rounded-lg transition-all duration-150 flex items-center gap-2.5 cursor-pointer text-[11px] font-semibold ${
                                    isThisSubActive
                                      ? "bg-[#8B0026]/10 text-[#8B0026] font-extrabold border-l-2 border-[#8B0026]"
                                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                  }`}
                                >
                                  {sub.icon && (
                                    <span className={`w-3.5 h-3.5 shrink-0 flex items-center justify-center transition-colors ${isThisSubActive ? "text-[#8B0026]" : "text-slate-400"}`}>
                                      {sub.icon}
                                    </span>
                                  )}
                                  <span className="truncate tracking-wide leading-none">{sub.label}</span>
                                </button>
                              );
                            })}
                          </motion.div>
                        )}
                      </AnimatePresence>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Logout Action Bar */}
      {onLogout && (
        <div className="p-4 border-t border-slate-100 bg-slate-50/40 shrink-0">
          <button
            onClick={onLogout}
            className="w-full py-2.5 px-3 rounded-xl bg-transparent hover:bg-rose-50 text-slate-600 hover:text-rose-700 text-xs font-bold uppercase transition-all flex items-center justify-center gap-2 tracking-wider border border-transparent hover:border-rose-100"
          >
            <LogOut className="w-4 h-4 shrink-0 text-slate-400 hover:text-rose-600" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* 1. Hamburger Header for Mobile Screens */}
      <div className="md:hidden w-full bg-white border-b border-slate-100 px-4 py-3 flex items-center justify-between shrink-0 z-40 relative">
        <div className="flex items-center gap-2.5">
          {renderLogo()}
          <div className="text-left">
            <h1 className="text-xs font-black text-[#8B0026] tracking-tight leading-none uppercase">
              {institution.name}
            </h1>
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block mt-0.5">
              {institution.subtitle}
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="p-1.5 text-slate-500 hover:text-[#8B0026] hover:bg-slate-50 rounded-lg transition-colors border border-slate-100 shadow-xs cursor-pointer"
          aria-label="Abrir menú"
        >
          {isOpenMobile ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* 2. Drawer Slide Overlay for Mobile */}
      <AnimatePresence>
        {isOpenMobile && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpenMobile(false)}
              className="md:hidden fixed inset-0 bg-black z-40"
            />

            {/* Sidebar drawer panel */}
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="md:hidden fixed top-0 bottom-0 left-0 w-72 h-screen z-50 shadow-2xl bg-white flex flex-col border-r border-slate-100"
            >
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={() => setIsOpenMobile(false)}
                  className="p-1.5 text-slate-400 hover:text-[#8B0026] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                >
                  <X className="w-4.5 h-4.5" />
                </button>
              </div>
              <div className="w-full h-full">
                <SidebarContent />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* 3. Sticky and Non-Scrollable Sidebar on Desktop Screens */}
      <aside className={`hidden md:flex flex-col w-64 h-full bg-white border-r border-slate-100/90 shrink-0 select-none ${className}`}>
        <SidebarContent />
      </aside>
    </>
  );
}
