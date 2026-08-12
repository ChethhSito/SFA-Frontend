"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, ArrowLeft, Loader2 } from "lucide-react";
import PostulanteDashboard from "@/components/PostulanteDashboard";
import Button from "@/components/ui-custom/Button";
import { Applicant } from "@/types";
import { INITIAL_APPLICANTS } from "@/lib/mockData";

export default function PostulantePage() {
  const router = useRouter();
  const [session, setSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // States
  const [applicants, setApplicants] = useState<Applicant[]>([]);

  useEffect(() => {
    const s = localStorage.getItem("sfa_session_postulante");
    setSession(s);

    // Load DB States
    const savedApps = localStorage.getItem("sfa_applicants");
    setApplicants(savedApps ? JSON.parse(savedApps) : INITIAL_APPLICANTS);

    setLoading(false);
  }, []);

  const saveState = (key: string, value: any, setter: React.Dispatch<React.SetStateAction<any>>) => {
    setter(value);
    localStorage.setItem(key, JSON.stringify(value));
  };

  const handleUpdateApplicant = (updated: any) => {
    const nextList = applicants.map((app) => (app.dni === updated.dni ? updated : app));
    saveState("sfa_applicants", nextList, setApplicants);
  };

  const handleLogout = () => {
    localStorage.removeItem("sfa_session_postulante");
    router.push("/ingresar");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col gap-2.5 items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-white text-xs font-bold uppercase tracking-widest">Validando Expediente...</span>
      </div>
    );
  }

  const currentDni = session || "";
  const applicantToRender = applicants.find((a) => a.applicantCode === currentDni || a.dni === currentDni) || null;

  if (!applicantToRender) {
    return (
      <div className="min-h-screen bg-slate-955 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-rose-950 text-[#CFA020] flex items-center justify-center mx-auto border border-rose-900/35">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-white font-black text-lg uppercase tracking-wider">Acceso Restringido</h3>
            <p className="text-slate-400 text-xs font-medium leading-relaxed">
              Su sesión de admisión ha expirado o no se encuentra autenticado. Por favor, vuelva a ingresar.
            </p>
          </div>
          <div className="pt-2">
            <Button 
              onClick={handleLogout}
              className="w-full bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-xs font-bold tracking-widest rounded-lg flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Registrarse o Ingresar
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PostulanteDashboard
      applicant={applicantToRender}
      onUpdateApplicant={handleUpdateApplicant}
      onLogout={handleLogout}
    />
  );
}
