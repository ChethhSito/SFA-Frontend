"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import MpaDashboard from "@/components/MpaDashboard";
import { Lock, ArrowLeft } from "lucide-react";
import Button from "@/components/ui-custom/Button";

export default function MpaPage() {
  const router = useRouter();
  const [session, setSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = localStorage.getItem("sfa_session_mpa");
    setSession(s);
    setLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("sfa_session_mpa");
    router.push("/ingresar");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <span className="text-white text-xs font-bold uppercase tracking-widest">
          Validando Sesión de Planificación Académica (MPA)...
        </span>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-red-950 text-[#9F062A] flex items-center justify-center mx-auto border border-red-900/30">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-white font-black text-lg uppercase tracking-wider font-display">
              Acreditación Requerida
            </h3>
            <p className="text-slate-400 text-xs font-medium leading-relaxed">
              Consola Protegida. No cuenta con una sesión autorizada para el Módulo de Planificación Académica (MPA) en este navegador.
            </p>
          </div>
          <div className="pt-2">
            <Button 
              onClick={handleLogout}
              className="w-full bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-xs font-bold tracking-widest rounded-lg flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Volver a Intranet
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return <MpaDashboard onLogout={handleLogout} />;
}
