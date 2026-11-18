import React, { useEffect, useMemo, useState } from "react";
import PostulanteDashboard from "../postulante";
import { Applicant, Enrollment } from "../../types";
import { Lock, ArrowLeft, Loader2 } from "lucide-react";
import Button from "../ui/Button";
import { fetchApplicantByDni, fetchEnrollmentByDni } from "../../services/api";

interface PostulanteRouterProps {
  applicants: Applicant[];
  enrollments: Enrollment[];
  onUpdateApplicant: (updated: Applicant) => void;
  onUpdateEnrollment: (updatedEnr: Enrollment) => void;
  onLogout: () => void;
  onGoToPortal?: () => void;
  onSwitchRole?: (role: any, identifier: string) => void;
}

const DOC_KEYS = ["dniFile", "certificadoFile", "partidaFile", "fotoFile"] as const;

export default function PostulanteRouter({
  applicants,
  enrollments,
  onUpdateApplicant,
  onUpdateEnrollment,
  onLogout,
  onGoToPortal,
  onSwitchRole,
}: PostulanteRouterProps) {
  const [session, setSession] = useState<string | null>(null);
  const [liveApplicant, setLiveApplicant] = useState<Applicant | null>(null);
  const [liveEnrollment, setLiveEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [, setSyncTick] = useState(0);

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
      Promise.all([
        fetchApplicantByDni(s),
        fetchEnrollmentByDni(s)
      ])
        .then(([apiApp, apiEnr]) => {
          if (!cancelled) {
            if (apiApp) setLiveApplicant(apiApp);
            if (apiEnr) {
              setLiveEnrollment(apiEnr);
              onUpdateEnrollment(apiEnr);
            }
          }
        })
        .catch((err) => {
          console.error("Error fetching REST API data in PostulanteRouter:", err);
        })
        .finally(() => {
          if (!cancelled && showSpinner) setLoading(false);
        });
    };

    // Carga inicial
    loadFromMongo(true);

    // Auto-polling en segundo plano cada 3 segundos para reflejar asignación de aula y admisiones en tiempo real
    const interval = setInterval(() => {
      loadFromMongo(false);
    }, 3000);

    // Sincronización instantánea al cambiar o enfocar la pestaña
    const handleSync = () => {
      loadFromMongo(false);
      setSyncTick((t) => t + 1);
    };

    window.addEventListener("focus", handleSync);
    window.addEventListener("storage", handleSync);

    return () => {
      cancelled = true;
      clearInterval(interval);
      window.removeEventListener("focus", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, []);

  const currentDni = session || "";

  const effectiveEnrollments = useMemo(() => {
    let list = [...enrollments];
    if (liveEnrollment) {
      const idx = list.findIndex(e => e.studentDni === liveEnrollment.studentDni);
      if (idx >= 0) {
        list[idx] = { ...list[idx], ...liveEnrollment };
      } else {
        list.push(liveEnrollment);
      }
    }
    try {
      const saved = localStorage.getItem("sfa_enrollments");
      if (saved) {
        const parsed: Enrollment[] = JSON.parse(saved);
        const mySaved = parsed.find(e => e.studentDni === currentDni);
        if (mySaved) {
          const idx = list.findIndex(e => e.studentDni === currentDni);
          if (idx >= 0) {
            list[idx] = { ...list[idx], ...mySaved };
          } else {
            list.push(mySaved);
          }
        }
      }
    } catch {}
    return list;
  }, [enrollments, liveEnrollment, currentDni]);

  let storedApp: Applicant | null = null;
  try {
    const rawStored = localStorage.getItem("sfa_applicants");
    if (rawStored) {
      const parsed: Applicant[] = JSON.parse(rawStored);
      storedApp =
        parsed.find(
          (a) =>
            a.id === currentDni ||
            a.uid === currentDni ||
            a.applicantCode === currentDni ||
            a.dni === currentDni
        ) || null;
    }
  } catch (e) {}

  const propApp = applicants.find(
    (a) =>
      a.id === currentDni ||
      a.uid === currentDni ||
      a.applicantCode === currentDni ||
      a.dni === currentDni ||
      (a as any)._id === currentDni
  );

  const localApp = storedApp || propApp;

  let applicantToRender: Applicant | null = null;
  const base = localApp || propApp || liveApplicant;
  if (base) {
    applicantToRender = {
      ...propApp,
      ...localApp,
      ...liveApplicant,
      examClassroom: liveApplicant?.examClassroom || localApp?.examClassroom || propApp?.examClassroom,
      examStatus:
        (liveApplicant?.examClassroom || localApp?.examClassroom || propApp?.examClassroom)
          ? "Programado"
          : (liveApplicant?.examStatus || localApp?.examStatus || propApp?.examStatus || "No Programado"),
      paymentStatus:
        localApp?.paymentStatus === "Validado" || liveApplicant?.paymentStatus === "Validado" || propApp?.paymentStatus === "Validado"
          ? "Validado"
          : (liveApplicant?.paymentStatus || localApp?.paymentStatus || propApp?.paymentStatus || "No Pagado"),
      folderStatus:
        localApp?.folderStatus === "Approved" || liveApplicant?.folderStatus === "Approved" || propApp?.folderStatus === "Approved"
          ? "Approved"
          : (liveApplicant?.folderStatus || localApp?.folderStatus || propApp?.folderStatus || "Pending"),
      admitted:
        localApp?.admitted === "ADMITIDO" || liveApplicant?.admitted === "ADMITIDO" || propApp?.admitted === "ADMITIDO" ||
        localApp?.admitted === true || liveApplicant?.admitted === true || propApp?.admitted === true
          ? "ADMITIDO"
          : (liveApplicant?.admitted || localApp?.admitted || propApp?.admitted || "PENDIENTE"),
    };
  }

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
      enrollments={effectiveEnrollments}
      onUpdateApplicant={handleUpdateLiveApplicant}
      onUpdateEnrollment={onUpdateEnrollment}
      onLogout={onLogout}
      onGoToPortal={onGoToPortal}
      onSwitchRole={onSwitchRole}
    />
  );
}
