import React, { useState } from "react";
import {
  Phone, Mail, MapPin, Facebook, ChevronDown, Users, Award,
  CheckSquare, Landmark, Zap, User, GraduationCap, LayoutDashboard,
  LogOut, ArrowRight, Menu, X, Instagram, Building2
} from "lucide-react";

export type PortalTab = "inicio" | "nosotros" | "programas" | "admision" | "transparencia" | "contactanos";

interface PortalHeaderProps {
  currentTab: PortalTab;
  setCurrentTab: (tab: PortalTab) => void;
  setSelectedProgramId: (id: string) => void;
  setProgramSelection: (id: string) => void;
  setSubmitSuccessMsg: (msg: string) => void;
  activeSessionRole: string | null;
  activeRoleLabel: string | null;
  onEnterIntranet: () => void;
  onLogout?: () => void;
}

export const PortalHeader: React.FC<PortalHeaderProps> = ({
  currentTab,
  setCurrentTab,
  setSelectedProgramId,
  setProgramSelection,
  setSubmitSuccessMsg,
  activeSessionRole,
  activeRoleLabel,
  activeSessionName,
  onEnterIntranet,
  onLogout
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      {/* 1. TOPBAR DELGADO INSTITUCIONAL DE CONTACTO */}
      <div className="bg-[#800521] text-white py-1.5 px-4 sm:px-8 lg:px-12 text-xs font-semibold border-b border-red-950">
        <div className="w-full max-w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 sm:gap-6 text-[10.5px]">
            <span className="flex items-center gap-1.5 font-bold tracking-wide">
              <Building2 className="w-3.5 h-3.5 text-amber-300" />
              IESTP SAN FRANCISCO DE ASÍS
            </span>
            <span className="flex items-center gap-1.5 text-slate-100 hover:text-amber-300 transition-colors">
              <Phone className="w-3.5 h-3.5 text-amber-300" />
              Central: 01 500 6177
            </span>
            <span className="flex items-center gap-1.5 text-slate-100 hover:text-amber-300 transition-colors">
              <Mail className="w-3.5 h-3.5 text-amber-300" />
              admision@iestpsfa.edu.pe
            </span>
            <span className="hidden lg:flex items-center gap-1.5 text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              VMT - Pachacútec Cdra. 50
            </span>
          </div>

          <div className="flex items-center gap-4 text-[10.5px]">
            <span className="text-amber-300 font-extrabold uppercase tracking-wider hidden sm:inline">
              RESOLUCIÓN MINEDU: R.M. 124-2021
            </span>
            <div className="flex items-center gap-2.5">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition-colors" aria-label="Instagram">
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition-colors" aria-label="Facebook">
                <Facebook className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. NAVEGACIÓN LIMPIA, FINA Y ELEGANTE CON LOGO INSTITUCIONAL */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="w-full max-w-full mx-auto px-4 sm:px-8 lg:px-12 py-2 flex justify-between items-center gap-4 relative">

          {/* Logo Institucional Fino y Pegado a la Izquierda */}
          <div
            className="flex items-center gap-2 cursor-pointer select-none shrink-0"
            onClick={() => { setCurrentTab("inicio"); setMobileMenuOpen(false); }}
          >
            <img
              src="/SFA-Logo.jpeg"
              alt="Logo Oficial IESTP San Francisco de Asís"
              className="w-8 h-8 sm:w-8.5 sm:h-8.5 object-contain rounded-full border border-[#CFA020] shadow-xs shrink-0 bg-white p-0.5"
            />
            <div>
              <h1 className="text-[11px] sm:text-xs font-black tracking-tight leading-tight uppercase text-slate-800">
                IESTP <span className="text-[#9F062A]">SAN FRANCISCO</span>
                <span className="text-[#CFA020] ml-1">DE ASÍS</span>
              </h1>
              <span className="text-[7.5px] sm:text-[8px] uppercase tracking-widest text-[#9F062A] font-bold block leading-none mt-0.5">
                LUZ Y VERDAD • VILLA MARÍA DEL TRIUNFO
              </span>
            </div>
          </div>

          {/* Menú de Navegación Principal Fino, Holgado y Elegante */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-7 text-[11px] font-bold text-slate-700">

            <button
              onClick={() => { setCurrentTab("inicio"); }}
              className={`py-1 px-1 relative transition-colors uppercase tracking-wider cursor-pointer outline-none focus:outline-none focus:ring-0 select-none ${currentTab === "inicio" ? "text-[#9F062A] font-extrabold" : "hover:text-[#9F062A]"}`}
            >
              <span>INICIO</span>
              {currentTab === "inicio" && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#9F062A] rounded-full" />
              )}
            </button>

            {/* Nosotros Dropdown */}
            <div className="relative py-2 group">
              <button
                onClick={() => { setCurrentTab("nosotros"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className={`py-1 px-1 relative transition-colors uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer outline-none focus:outline-none focus:ring-0 select-none ${currentTab === "nosotros" ? "text-[#9F062A] font-extrabold" : "hover:text-[#9F062A]"}`}
              >
                <span>NOSOTROS</span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform" />
                {currentTab === "nosotros" && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#9F062A] rounded-full" />
                )}
              </button>

              <div className="absolute top-full left-0 w-64 bg-white border border-slate-200/90 shadow-2xl rounded-xl p-2 z-50 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 space-y-1">
                <button
                  onClick={() => {
                    setCurrentTab("nosotros");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full text-left p-2.5 hover:bg-rose-50 hover:text-[#9F062A] rounded-lg transition-colors text-[11px] font-bold uppercase flex items-center gap-2.5 text-slate-800 cursor-pointer"
                >
                  <Award className="w-4 h-4 text-[#9F062A] shrink-0" />
                  <span>Misión, Visión y Valores</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentTab("nosotros");
                    setTimeout(() => {
                      const el = document.getElementById("organigrama-section");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 150);
                  }}
                  className="w-full text-left p-2.5 hover:bg-rose-50 hover:text-[#9F062A] rounded-lg transition-colors text-[11px] font-bold uppercase flex items-center gap-2.5 text-slate-800 cursor-pointer"
                >
                  <Users className="w-4 h-4 text-[#9F062A] shrink-0" />
                  <span>Plana Directiva y Autoridades</span>
                </button>
              </div>
            </div>

            {/* Programas Dropdown */}
            <div className="relative py-2 group">
              <button
                onClick={() => { setCurrentTab("programas"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className={`py-1 px-1 relative transition-colors uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer outline-none focus:outline-none focus:ring-0 select-none ${currentTab === "programas" ? "text-[#9F062A] font-extrabold" : "hover:text-[#9F062A]"}`}
              >
                <span>PROGRAMAS</span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform" />
                {currentTab === "programas" && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#9F062A] rounded-full" />
                )}
              </button>

              <div className="absolute top-full left-0 w-72 bg-white border border-slate-200/90 shadow-2xl rounded-xl p-2.5 z-50 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 space-y-1">
                <span className="text-[9px] uppercase font-black text-[#9F062A] tracking-wider block px-2 mb-1 font-mono">Especialidades Licenciadas:</span>
                <button
                  onClick={() => {
                    setSelectedProgramId("electronica");
                    setCurrentTab("programas");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full text-left p-2.5 hover:bg-rose-50 hover:text-[#9F062A] rounded-lg transition-colors text-[11px] font-bold text-slate-800 uppercase flex flex-col cursor-pointer"
                >
                  <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-[#9F062A] shrink-0" /> Electricidad Industrial</span>
                  <span className="text-[9px] text-slate-500 normal-case font-normal mt-0.5 ml-6">Control de PLCs, Motores y Subestaciones</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedProgramId("contabilidad");
                    setCurrentTab("programas");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full text-left p-2.5 hover:bg-rose-50 hover:text-[#9F062A] rounded-lg transition-colors text-[11px] font-bold text-slate-800 uppercase flex flex-col mt-0.5 cursor-pointer"
                >
                  <span className="flex items-center gap-2"><Landmark className="w-4 h-4 text-[#9F062A] shrink-0" /> Contabilidad Financiera</span>
                  <span className="text-[9px] text-slate-500 normal-case font-normal mt-0.5 ml-6">Tributación Empresarial, NIIF y ERP</span>
                </button>
              </div>
            </div>

            {/* Admisión Dropdown */}
            <div className="relative py-2 group">
              <button
                onClick={() => { setCurrentTab("admision"); setSubmitSuccessMsg(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className={`py-1 px-1 relative transition-colors uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer outline-none focus:outline-none focus:ring-0 select-none ${currentTab === "admision" ? "text-[#9F062A] font-extrabold" : "hover:text-[#9F062A]"}`}
              >
                <span>ADMISIÓN</span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform" />
                {currentTab === "admision" && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#9F062A] rounded-full" />
                )}
              </button>

              <div className="absolute top-full left-0 w-64 bg-white border border-slate-200/90 shadow-2xl rounded-xl p-2 z-50 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 space-y-1">
                <button
                  onClick={() => {
                    setCurrentTab("admision");
                    setSubmitSuccessMsg("");
                    setTimeout(() => {
                      const el = document.getElementById("admision-form");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 150);
                  }}
                  className="w-full text-left p-2.5 hover:bg-rose-50 hover:text-[#9F062A] rounded-lg transition-colors text-[11px] font-bold uppercase flex items-center gap-2.5 text-slate-800 cursor-pointer"
                >
                  <CheckSquare className="w-4 h-4 text-[#9F062A] shrink-0" />
                  <span>Pre-Inscripción Virtual 2026-I</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentTab("admision");
                    setSubmitSuccessMsg("");
                    setTimeout(() => {
                      const el = document.getElementById("tasas-requisitos");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 150);
                  }}
                  className="w-full text-left p-2.5 hover:bg-rose-50 hover:text-[#9F062A] rounded-lg transition-colors text-[11px] font-bold uppercase flex items-center gap-2.5 text-slate-800 cursor-pointer"
                >
                  <Landmark className="w-4 h-4 text-[#9F062A] shrink-0" />
                  <span>Tasas y Requisitos del Examen</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => { setCurrentTab("transparencia"); }}
              className={`py-1 px-1 relative transition-colors uppercase tracking-wider cursor-pointer outline-none focus:outline-none focus:ring-0 select-none ${currentTab === "transparencia" ? "text-[#9F062A] font-extrabold" : "hover:text-[#9F062A]"}`}
            >
              <span>TRANSPARENCIA</span>
              {currentTab === "transparencia" && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#9F062A] rounded-full" />
              )}
            </button>

            <button
              onClick={() => { setCurrentTab("contactanos"); }}
              className={`py-1 px-1 relative transition-colors uppercase tracking-wider cursor-pointer outline-none focus:outline-none focus:ring-0 select-none ${currentTab === "contactanos" ? "text-[#9F062A] font-extrabold" : "hover:text-[#9F062A]"}`}
            >
              <span>CONTÁCTANOS</span>
              {currentTab === "contactanos" && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#9F062A] rounded-full" />
              )}
            </button>

          </nav>

          {/* User Profile Pill or Intranet Académica Button */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            {activeSessionRole ? (
              <div className="relative group">
                <button
                  type="button"
                  onClick={onEnterIntranet}
                  className="flex items-center gap-2.5 bg-white hover:bg-slate-50 text-slate-800 pl-2 pr-3.5 py-1.5 rounded-full font-bold text-[11px] transition-all shadow-2xs border border-slate-250 cursor-pointer group-hover:border-[#9F062A] group-hover:shadow-md"
                >
                  <div className="w-7 h-7 rounded-full bg-[#9F062A]/10 text-[#9F062A] border border-[#9F062A]/30 flex items-center justify-center font-black text-[10px] relative shrink-0 shadow-3xs">
                    <User className="w-4 h-4 text-[#9F062A]" />
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
                  </div>
                  <div className="text-left leading-tight">
                    <span className="block text-[11px] font-black tracking-tight text-slate-900 uppercase max-w-[140px] truncate">
                      {activeSessionName || activeRoleLabel}
                    </span>
                    {activeSessionName && (
                      <span className="block text-[9px] font-bold text-slate-500 uppercase leading-none">
                        {activeRoleLabel}
                      </span>
                    )}
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#9F062A] group-hover:rotate-180 transition-all ml-0.5" />
                </button>

                {/* Hover Bridge & Dropdown Menu */}
                <div className="absolute top-full right-0 w-64 pt-2 -mt-1 z-50 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200">
                  <div className="bg-white border border-slate-200 shadow-2xl rounded-2xl p-2.5 space-y-1.5 text-left">
                    <div className="px-3.5 py-2.5 bg-slate-50 rounded-xl border border-slate-100 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#9F062A] text-white flex items-center justify-center font-black text-xs shrink-0 shadow-xs">
                        <User className="w-4 h-4 text-amber-300" />
                      </div>
                      <div className="leading-tight overflow-hidden">
                        <span className="text-[9px] font-black uppercase text-[#9F062A] tracking-wider block">
                          Sesión Conectada
                        </span>
                        <span className="text-xs font-black text-slate-900 uppercase truncate block mt-0.5">
                          {activeSessionName || activeRoleLabel}
                        </span>
                        {activeSessionName && (
                          <span className="text-[9.5px] font-bold text-slate-500 uppercase block mt-0.5">
                            Rol: {activeRoleLabel}
                          </span>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={onEnterIntranet}
                      className="w-full text-left p-2.5 bg-[#9F062A]/5 hover:bg-[#9F062A] text-[#9F062A] hover:text-white rounded-xl transition-all text-[11px] font-extrabold uppercase flex items-center justify-between cursor-pointer border border-[#9F062A]/20 group/btn"
                    >
                      <div className="flex items-center gap-2">
                        <LayoutDashboard className="w-4 h-4" />
                        <span>Ir a mi Módulo</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                    </button>

                    {onLogout && (
                      <button
                        type="button"
                        onClick={onLogout}
                        className="w-full text-left p-2.5 hover:bg-rose-50 text-slate-600 hover:text-rose-700 rounded-xl transition-all text-[11px] font-extrabold uppercase flex items-center gap-2 cursor-pointer border border-transparent hover:border-rose-100"
                      >
                        <LogOut className="w-4 h-4 text-slate-400 hover:text-rose-600" />
                        <span>Cerrar Sesión</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={onEnterIntranet}
                className="flex items-center gap-1.5 bg-[#9F062A] hover:bg-[#800521] text-white px-3.5 py-1.5 rounded-lg font-bold tracking-wide transition-all shadow-xs text-[10.5px] cursor-pointer active:scale-95"
              >
                <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
                <span>Intranet Académica</span>
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-[#9F062A] focus:outline-none cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white animate-fade-in w-full text-xs font-bold text-slate-800 select-none pb-6 px-4">
            <div className="py-3 space-y-1">
              <button
                onClick={() => { setCurrentTab("inicio"); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-md hover:bg-rose-50 text-[#9F062A] block uppercase font-extrabold"
              >
                INICIO
              </button>
              <button
                onClick={() => { setCurrentTab("nosotros"); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-md hover:bg-rose-50 text-slate-800 block uppercase"
              >
                NOSOTROS
              </button>
              <button
                onClick={() => { setCurrentTab("programas"); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-md hover:bg-rose-50 text-slate-800 block uppercase"
              >
                PROGRAMAS
              </button>
              <button
                onClick={() => { setCurrentTab("admision"); setSubmitSuccessMsg(""); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-md hover:bg-rose-50 text-slate-800 block uppercase"
              >
                ADMISIÓN
              </button>
              <button
                onClick={() => { setCurrentTab("transparencia"); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-md hover:bg-rose-50 text-slate-800 block uppercase"
              >
                TRANSPARENCIA
              </button>
              <button
                onClick={() => { setCurrentTab("contactanos"); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-md hover:bg-rose-50 text-slate-800 block uppercase"
              >
                CONTÁCTANOS
              </button>
              <div className="pt-3 border-t border-slate-200 space-y-2">
                {activeSessionRole ? (
                  <>
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-[#9F062A] text-white flex items-center justify-center font-black text-xs relative shadow-3xs">
                          <User className="w-4 h-4 text-amber-300" />
                          <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white" />
                        </div>
                        <div className="text-left leading-tight">
                          <span className="text-xs font-black text-slate-900 block uppercase">{activeRoleLabel}</span>
                          <span className="text-[9px] text-emerald-700 font-extrabold uppercase block"></span>
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => { onEnterIntranet(); setMobileMenuOpen(false); }}
                      className="w-full py-3 bg-[#9F062A] text-white rounded-xl font-extrabold uppercase tracking-wider text-center text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
                    >
                      <LayoutDashboard className="w-4 h-4 text-amber-300" />
                      <span>Ir a mi Módulo ({activeRoleLabel})</span>
                    </button>

                    {onLogout && (
                      <button
                        type="button"
                        onClick={() => { onLogout(); setMobileMenuOpen(false); }}
                        className="w-full py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl font-extrabold uppercase tracking-wider text-center text-xs flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 text-rose-600" />
                        <span>Cerrar Sesión</span>
                      </button>
                    )}
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => { onEnterIntranet(); setMobileMenuOpen(false); }}
                    className="w-full py-3 bg-[#9F062A] text-white rounded-xl font-bold uppercase tracking-wider text-center text-xs flex items-center justify-center gap-2 shadow-md cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4 text-amber-300" />
                    <span>Intranet Académica</span>
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
};
