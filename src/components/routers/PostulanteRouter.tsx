import React, { useEffect, useState } from "react";
import PostulanteDashboard from "../postulante";
import { Applicant, Enrollment } from "../../types";
import { Lock, ArrowLeft, Loader2 } from "lucide-react";
import Button from "../ui/Button";
import { fetchApplicantByDni } from "../../services/api";

interface PostulanteRouterProps {
  applicants: Applicant[];
  enrollments: Enrollment[];
  onUpdateApplicant: (updated: Applicant) => void;
  onUpdateEnrollment: (updatedEnr: Enrollment) => void;
  onLogout: () => void;
  onGoToPortal?: () => void;
}

const DOC_KEYS = ["dniFile", "certificadoFile", "partidaFile", "fotoFile"] as const;

export default function PostulanteRouter({
  applicants,
  enrollments,
  onUpdateApplicant,
  onUpdateEnrollment,
  onLogout,
  onGoToPortal,
}: PostulanteRouterProps) {
  const [session, setSession] = useState<string | null>(null);
  const [liveApplicant, setLiveApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = localStorage.getItem("sfa_session_postulante");
    setSession(s);

    if (!s) {
      setLoading(false);
      return;
    }

    let cancelled = false;
    const loadFromMongo = (showSpinner: boolean) => {
      if (showSpinner) setLoading(true);
      fetchApplicantByDni(s)
        .then((apiApp) => {
          if (!cancelled && apiApp) {
            setLiveApplicant(apiApp);
          }
        })
        .catch((err) => {
          console.error("Error fetching REST API applicant in PostulanteRouter:", err);
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    };

    loadFromMongo(true);
    return () => {
      cancelled = true;
    };
  }, []);

  const currentDni = session || "";
  const localApp = applicants.find(
    (a) =>
      a.id === currentDni ||
      a.uid === currentDni ||
      a.applicantCode === currentDni ||
      a.dni === currentDni ||
      (a as any)._id === currentDni
  );

  let applicantToRender: Applicant | null = liveApplicant
    ? ({ ...(localApp || {}), ...liveApplicant } as Applicant)
    : localApp || null;

  if (applicantToRender) {
    const rawDocs: any = {
      ...(localApp?.docs || {}),
      ...(liveApplicant?.docs || {}),
    };
    const normalizedDocs: any = {};

    for (const k of DOC_KEYS) {
      const localDoc = (localApp?.docs as any)?.[k];
      const liveDoc = (liveApplicant?.docs as any)?.[k];
      let cachedUrl: string | null = null;
      try {
        cachedUrl = localStorage.getItem(`sfa_file_data_${applicantToRender.dni}_${k}`);
      } catch (e) {}

      const finalUrl = liveDoc?.fileDataUrl || localDoc?.fileDataUrl || cachedUrl || undefined;
      const mergedDoc = { ...(localDoc || {}), ...(liveDoc || {}) };

      if (finalUrl) {
        normalizedDocs[k] = {
          ...mergedDoc,
          status:
            mergedDoc.status && mergedDoc.status !== "No Enviado"
              ? mergedDoc.status
              : "Pendiente",
          fileDataUrl: finalUrl,
        };
      } else {
        // Sin imagen física real en MongoDB, figura estrictamente como No Enviado
        normalizedDocs[k] = {
          status: "No Enviado",
          fileName: undefined,
          fileDataUrl: undefined,
          observations: mergedDoc?.observations,
        };
      }
    }

    applicantToRender = {
      ...applicantToRender,
      docs: normalizedDocs,
    };
  }

  const handleUpdateLiveApplicant = async (updated: Applicant) => {
    setLiveApplicant(updated);

    if (updated.docs) {
      for (const k of DOC_KEYS) {
        const d = (updated.docs as any)[k];
        if (d?.fileDataUrl) {
          try {
            localStorage.setItem(`sfa_file_data_${updated.dni}_${k}`, d.fileDataUrl);
          } catch (e) {}
        }
      }
    }

    if (updated.paymentVoucherUrl) {
      try {
        localStorage.setItem(`sfa_voucher_data_${updated.dni}`, updated.paymentVoucherUrl);
      } catch (e) {}
    }

    // Actualiza el estado global y persiste en MongoDB con fileDataUrl completo
    onUpdateApplicant(updated);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col gap-2.5 items-center justify-center">
        <Loader2 className="w-8 h-8 text-amber-500 animate-spin" />
        <span className="text-white text-xs font-bold uppercase tracking-widest">Validando Expediente...</span>
      </div>
    );
  }

  if (!applicantToRender) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
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
              onClick={onLogout}
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
      enrollments={enrollments}
      onUpdateApplicant={handleUpdateLiveApplicant}
      onUpdateEnrollment={onUpdateEnrollment}
      onLogout={onLogout}
      onGoToPortal={onGoToPortal}
    />
  );
}
