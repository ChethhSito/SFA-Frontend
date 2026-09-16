import React, { useState, ReactNode } from "react";
import { GraduationCap, Menu, X, LogOut, ChevronDown, ChevronRight, ChevronLeft, Home } from "lucide-react";
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
  institution?: {
    name: string;
    subtitle: string;
    logo?: ReactNode | string;
  };

  user?: {
    name: string;
    role: string;
    status: string;
    avatar?: string;
  };

  sections?: SidebarSection[];
  
  // Alternate flat props for simple dashboards
  title?: string;
  subtitle?: string;
  logo?: ReactNode | string;
  items?: Array<{ id: string; label: string; icon?: ReactNode; badge?: string }>;
  activeId?: string;
  onSelect?: (id: string) => void;
  userProfile?: {
    name?: string;
    role?: string;
    status?: string;
    avatar?: string;
    avatarBg?: string;
  };

  onItemClick?: (route: string) => void;
  onLogout?: () => void;
  onGoToPortal?: () => void;
  extraContent?: ReactNode;
  className?: string;
}

export default function Sidebar({
  institution,
  user,
  sections,
  title,
  subtitle,
  logo,
  items,
  activeId,
  onSelect,
  userProfile,
  onItemClick,
  onLogout,
  onGoToPortal,
  extraContent,
  className = ""
}: SidebarProps) {
  const [isOpenMobile, setIsOpenMobile] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  // Resolve institution header values
  const instName = institution?.name || title || "SFA Admisión";
  const instSubtitle = institution?.subtitle || subtitle || "Portal Institucional";
  const instLogo = institution?.logo !== undefined ? institution.logo : logo;

  // Resolve user values
  const userName = user?.name || userProfile?.name || "Usuario";
  const userRole = user?.role || userProfile?.role || "Postulante 2026-I";
  const userStatus = user?.status || userProfile?.status || "Activo";
  const userAvatar = user?.avatar || userProfile?.avatar;

  // Resolve sections vs flat items
  const resolvedSections: SidebarSection[] = (sections && sections.length > 0)
    ? sections
    : (items && items.length > 0)
      ? [{
          title: "Menú Principal",
          items: items.map(it => ({
            label: it.label,
            icon: it.icon,
            route: it.id,
            active: activeId === it.id
          }))
        }]
      : [];

  const handleNavigation = (route: string) => {
    if (onItemClick) onItemClick(route);
    if (onSelect) onSelect(route);
  };

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
    const s = (status || "").toUpperCase();
    if (s.includes("ADMITIDO")) return "warning";
    if (s.includes("MATRICULADO") || s.includes("VALIDADO") || s.includes("APROBADO") || s.includes("APTO")) return "success";
    if (s.includes("OBSERVADO") || s.includes("RECHAZADO") || s.includes("FALTA") || s.includes("NO APTO")) return "danger";
    if (s.includes("TARDANZA") || s.includes("PENDIENTE") || s.includes("EN PROCESO")) return "warning";
    return "brand";
  };

  const renderItemIcon = (icon: ReactNode | any) => {
    if (!icon) return null;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === "function" || (typeof icon === "object" && (icon as any).$$typeof)) {
      const IconComp = icon as any;
      return <IconComp className="w-4 h-4" />;
    }
    return icon;
  };

  const renderLogo = () => {
    if (!instLogo) {
      return (
        <div className="h-10 w-10 bg-[#8B0026] text-[#CFA020] rounded-xl flex items-center justify-center font-bold shadow-md shrink-0 border border-[#8B0026]/10">
          <GraduationCap className="w-5 h-5" />
        </div>
      );
    }
    if (typeof instLogo === "string") {
      return (
        <div className="h-10 w-10 bg-[#8B0026] text-[#CFA020] rounded-xl flex items-center justify-center font-bold shadow-md shrink-0 overflow-hidden">
          {instLogo.startsWith("http") ? (
            <img src={instLogo} alt="Logo" className="w-full h-full object-cover" />
          ) : (
            <span className="text-white text-base font-black">{instLogo}</span>
          )}
        </div>
      );
    }
    return renderItemIcon(instLogo);
  };

  const SidebarContent = ({ collapsed = false }: { collapsed?: boolean }) => (
    <div className="flex flex-col h-full bg-white relative z-20">
      {/* Header of Institution */}
      <div className={`p-4 flex items-center border-b border-slate-100 ${collapsed ? "justify-center" : "gap-3"}`}>
        {renderLogo()}
        {!collapsed && (
          <div className="text-left min-w-0 flex-1">
            <h1 className="text-xs font-black text-[#8B0026] tracking-tight leading-none uppercase truncate">
              {instName}
            </h1>
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block mt-1 truncate">
              {instSubtitle}
            </span>
          </div>
        )}
      </div>

      {/* User Status Profile Card */}
      <div className={`py-3 ${collapsed ? "px-2" : "px-4 mt-1"}`}>
        <div className={`bg-slate-50/80 border border-slate-200/80 rounded-2xl text-left relative overflow-hidden transition-colors ${collapsed ? "p-2 flex flex-col items-center justify-center" : "p-3.5"}`}>
          <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3"}`}>
            {userAvatar ? (
              <img 
                src={userAvatar} 
                alt="Avatar" 
                className="w-9 h-9 rounded-full object-cover ring-2 ring-amber-400/40 shrink-0" 
              />
            ) : (
              <div className="h-9 w-9 bg-amber-400 text-slate-900 border border-amber-300 rounded-full flex items-center justify-center font-black text-xs shrink-0 tracking-tight">
                {getInitials(userName)}
              </div>
            )}
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <h4 className="text-[11px] font-black text-slate-800 leading-tight block truncate" title={userName}>
                  {userName}
                </h4>
                <span className="text-[9px] text-slate-500 font-bold block truncate mt-0.5" title={userRole}>
                  {userRole}
                </span>
              </div>
            )}
          </div>
          
          {!collapsed && (
            <div className="mt-3 pt-2 border-t border-slate-200/60 flex justify-between items-center text-[10px] font-bold">
              <span className="text-slate-400 uppercase tracking-widest text-[8.5px] font-black">ESTADO:</span>
              <Badge variant={getStatusVariant(userStatus)} className="font-extrabold tracking-wider px-2 py-0.5 text-[8.5px] uppercase border">
                {userStatus}
              </Badge>
            </div>
          )}
        </div>
      </div>

      {extraContent && !collapsed && (
        <div className="px-4 pb-2">
          {extraContent}
        </div>
      )}

      {/* Scrollable Navigation Sections */}
      <div className={`flex-1 overflow-y-auto space-y-4 custom-scrollbar text-left ${collapsed ? "px-2 py-2" : "px-3 py-2"}`}>
        {resolvedSections.map((section, idx) => (
          <div key={idx} className="space-y-1">
            {!collapsed && section.title && (
              <span className="text-[9px] text-slate-400 font-black uppercase tracking-wider block px-2 mb-1">
                {section.title}
              </span>
            )}

            {/* Menu Items */}
            <div className="space-y-1">
              {section.items.map((item, itemIdx) => {
                const hasSubItems = !!item.subItems && item.subItems.length > 0;
                const isSubActive = hasSubItems && item.subItems!.some(s => s.active);
                const isExpanded = expandedItems[item.route] !== undefined 
                  ? expandedItems[item.route] 
                  : (isSubActive || item.active);

                return (
                  <div key={itemIdx} className="space-y-0.5">
                    <button
                      title={collapsed ? item.label : undefined}
                      onClick={() => {
                        if (hasSubItems && !collapsed) {
                          setExpandedItems(prev => ({
                            ...prev,
                            [item.route]: !isExpanded
                          }));
                        } else {
                          handleNavigation(item.route);
                          setIsOpenMobile(false);
                        }
                      }}
                      className={`w-full transition-all duration-150 flex items-center cursor-pointer text-xs font-semibold ${
                        collapsed ? "justify-center p-2.5 rounded-xl" : "justify-between py-2.5 px-3 rounded-xl"
                      } ${
                        item.active
                          ? "bg-[#9F062A] text-white font-bold shadow-sm shadow-[#9F062A]/20 border border-red-900/20"
                          : isSubActive
                            ? "bg-slate-100 text-[#9F062A] font-bold border border-slate-200"
                            : "text-slate-600 hover:bg-slate-100/80 hover:text-slate-900"
                      }`}
                    >
                      <div className={`flex items-center ${collapsed ? "justify-center" : "gap-3 min-w-0"}`}>
                        <span className={`w-4 h-4 shrink-0 flex items-center justify-center transition-colors ${item.active ? "text-amber-400" : isSubActive ? "text-[#9F062A]" : "text-slate-400"}`}>
                          {renderItemIcon(item.icon)}
                        </span>
                        {!collapsed && <span className="truncate tracking-wide text-[11.5px]">{item.label}</span>}
                      </div>
                      {!collapsed && hasSubItems && (
                        <span className="shrink-0 text-slate-400 ml-1">
                          {isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5" />
                          )}
                        </span>
                      )}
                    </button>

                    {/* Disclosure for subItems */}
                    {!collapsed && hasSubItems && (
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
                                      ? "bg-[#9F062A]/10 text-[#9F062A] font-extrabold border-l-2 border-[#9F062A]"
                                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
                                  }`}
                                >
                                  {sub.icon && (
                                    <span className={`w-3.5 h-3.5 shrink-0 flex items-center justify-center transition-colors ${isThisSubActive ? "text-[#9F062A]" : "text-slate-400"}`}>
                                      {renderItemIcon(sub.icon)}
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

      {/* Footer Action Bar */}
      {(onGoToPortal || onLogout) && (
        <div className={`border-t border-slate-100 bg-slate-50/50 shrink-0 space-y-1.5 ${collapsed ? "p-2" : "p-3"}`}>
          {onGoToPortal && (
            <button
              onClick={onGoToPortal}
              title={collapsed ? "Volver al Portal Principal" : undefined}
              className={`w-full py-2 rounded-xl text-slate-700 hover:text-[#9F062A] hover:bg-red-50 text-xs font-bold uppercase transition-all flex items-center justify-center tracking-wider cursor-pointer ${
                collapsed ? "px-0" : "px-3 gap-2 border border-slate-200/60 bg-white shadow-2xs"
              }`}
            >
              <Home className="w-4 h-4 shrink-0 text-[#9F062A]" />
              {!collapsed && <span>Portal Principal</span>}
            </button>
          )}

          {onLogout && (
            <button
              onClick={onLogout}
              title={collapsed ? "Cerrar Sesión" : undefined}
              className={`w-full py-2 rounded-xl text-slate-600 hover:text-rose-700 hover:bg-rose-50 text-xs font-bold uppercase transition-all flex items-center justify-center tracking-wider cursor-pointer ${
                collapsed ? "px-0" : "px-3 gap-2 border border-slate-200/60 bg-white shadow-2xs"
              }`}
            >
              <LogOut className="w-4 h-4 shrink-0 text-slate-500 hover:text-rose-600" />
              {!collapsed && <span>Cerrar Sesión</span>}
            </button>
          )}
        </div>
      )}
    </div>
  );

  return (
    <>
      {/* 1. Hamburger Header for Mobile Screens */}
      <div className="md:hidden w-full bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0 z-40 relative">
        <div className="flex items-center gap-2.5">
          {renderLogo()}
          <div className="text-left">
            <h1 className="text-xs font-black text-[#9F062A] tracking-tight leading-none uppercase">
              {instName}
            </h1>
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wide block mt-0.5">
              {instSubtitle}
            </span>
          </div>
        </div>
        <button
          onClick={() => setIsOpenMobile(!isOpenMobile)}
          className="p-1.5 text-slate-500 hover:text-[#9F062A] hover:bg-slate-50 rounded-lg transition-colors border border-slate-200 shadow-2xs cursor-pointer"
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
              className="md:hidden fixed top-0 bottom-0 left-0 w-72 h-screen z-50 shadow-2xl bg-white flex flex-col border-r border-slate-200"
            >
              <div className="absolute top-4 right-4 z-50">
                <button
                  onClick={() => setIsOpenMobile(false)}
                  className="p-1.5 text-slate-400 hover:text-[#9F062A] hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
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

      {/* 3. Sticky and Collapsible Sidebar on Desktop Screens */}
      <aside className={`hidden md:flex flex-col h-full bg-white border-r border-slate-200 shadow-xs shrink-0 select-none relative z-30 transition-all duration-300 ease-in-out ${isCollapsed ? "w-20" : "w-64"} ${className}`}>
        {/* Toggle arrow button on the right edge */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expandir menú lateral" : "Colapsar menú lateral"}
          className="absolute -right-3.5 top-6 z-40 bg-white hover:bg-slate-50 text-slate-600 hover:text-[#9F062A] border border-slate-300 w-7 h-7 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <SidebarContent collapsed={isCollapsed} />
      </aside>
    </>
  );
}
