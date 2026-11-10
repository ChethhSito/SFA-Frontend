import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchApplicants,
  createApplicant as apiCreateApplicant,
  updateApplicant as apiUpdateApplicant,
  deleteApplicant as apiDeleteApplicant,
  sendTransactionalWelcomeEmail
} from "../../services/api";

export function stripFileDataUrls(applicantsList: any[]): any[] {
  return applicantsList.map((app) => {
    if (!app.docs) return app;
    const strippedDocs: any = {};
    for (const [key, val] of Object.entries(app.docs)) {
      const doc = val as any;
      strippedDocs[key] = { ...doc, fileDataUrl: undefined };
    }
    return { ...app, docs: strippedDocs };
  });
}

function preserveExistingDocBinaries(prevApp: any, nextApp: any): any {
  if (!prevApp) return nextApp;
  const docKeys = ["dniFile", "certificadoFile", "partidaFile", "fotoFile"] as const;
  const mergedDocs: any = { ...(prevApp.docs || {}), ...(nextApp.docs || {}) };
  for (const key of docKeys) {
    const prevDoc = prevApp.docs?.[key];
    const nextDoc = nextApp.docs?.[key];
    if (nextDoc) {
      mergedDocs[key] = {
        ...prevDoc,
        ...nextDoc,
        fileDataUrl:
          nextDoc.status === "No Enviado"
            ? undefined
            : nextDoc.fileDataUrl || prevDoc?.fileDataUrl,
      };
    }
  }
  return {
    ...prevApp,
    ...nextApp,
    paymentVoucherUrl:
      nextApp.paymentStatus === "No Pagado"
        ? undefined
        : nextApp.paymentVoucherUrl || prevApp.paymentVoucherUrl,
    docs: mergedDocs,
  };
}

export function useApplicantsManager(
  onAdmissionTrigger?: (updatedList: any[]) => void
) {
  const [applicants, setApplicants] = useState<any[]>([]);
  const applicantsRef = useRef<any[]>([]);
  applicantsRef.current = applicants;

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const reloadApplicants = useCallback(() => {
    setLoading(true);
    return fetchApplicants()
      .then((apiApps) => {
        if (!apiApps) throw new Error("No se pudo consultar postulantes");
        setApplicants(apiApps);
        applicantsRef.current = apiApps;
        try {
          localStorage.setItem("sfa_applicants", JSON.stringify(stripFileDataUrls(apiApps)));
          // Limpiar cachés locales heredados que antes causaban estados o nombres de archivo fantasma
          for (const key of Object.keys(localStorage)) {
            if (key.startsWith("sfa_doc_status_") || key.startsWith("sfa_payment_status_")) {
              localStorage.removeItem(key);
            }
          }
          if (apiApps.length === 0) {
            localStorage.removeItem("sfa_session_postulante");
          }
        } catch (e) {
          console.warn("[localStorage] Cleanup warning:", e);
        }
      })
      .catch((err) => {
        console.error("Error fetching REST API applicants:", err);
        setError("Error al cargar postulantes desde el servidor.");
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    void reloadApplicants();
    const onFocus = () => void reloadApplicants();
    window.addEventListener("focus", onFocus);
    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [reloadApplicants]);

  const handleUpdateApplicantsFromAdmin = async (updatedList: any[]) => {
    const prevByDni = new Map(applicantsRef.current.map((a) => [a.dni, a]));
    const hydratedList = updatedList.map((app) =>
      preserveExistingDocBinaries(prevByDni.get(app.dni), app)
    );

    setApplicants(hydratedList);
    applicantsRef.current = hydratedList;

    try {
      localStorage.setItem("sfa_applicants", JSON.stringify(stripFileDataUrls(hydratedList)));
    } catch (e) {
      console.warn("[localStorage] Could not save sfa_applicants:", e);
    }

    if (onAdmissionTrigger) {
      onAdmissionTrigger(hydratedList);
    }

    // Persistir en MongoDB conservando íntegramente fileDataUrl y paymentVoucherUrl
    await Promise.all(
      hydratedList.map(async (app) => {
        try {
          await apiUpdateApplicant(app.dni, app);
        } catch (err) {
          console.warn(`[Backend API] Could not persist applicant ${app.dni}:`, err);
        }
      })
    );
  };

  /**
   * Registra un nuevo postulante / pre-postulante conectando con el backend REST y guardando en estado local.
   */
  const handleCreateApplicant = async (newApplicant: any) => {
    const result = await apiCreateApplicant(newApplicant);
    const itemToSave = result || newApplicant;

    const current = applicantsRef.current;
    const exists = current.some((a) => a.dni === itemToSave.dni);
    const updatedList = exists
      ? current.map((a) => (a.dni === itemToSave.dni ? itemToSave : a))
      : [...current, itemToSave];

    setApplicants(updatedList);
    applicantsRef.current = updatedList;
    return itemToSave;
  };

  /**
   * Actualiza el estado de un postulante por DNI.
   */
  const handleUpdateApplicantByDni = async (dni: string, data: any) => {
    const prev = applicantsRef.current.find((a) => a.dni === dni);
    const merged = preserveExistingDocBinaries(prev, { ...(prev || {}), ...data });
    await apiUpdateApplicant(dni, merged);
    const updatedList = applicantsRef.current.map((a) => (a.dni === dni ? merged : a));
    setApplicants(updatedList);
    applicantsRef.current = updatedList;
  };

  /**
   * Elimina un postulante por DNI.
   */
  const handleDeleteApplicantByDni = async (dni: string) => {
    await apiDeleteApplicant(dni);
    const updatedList = applicantsRef.current.filter((a) => a.dni !== dni);
    setApplicants(updatedList);
    applicantsRef.current = updatedList;
  };

  /**
   * Envía correo transaccional de bienvenida/pre-inscripción a través de Brevo / Backend.
   */
  const handleSendWelcomeEmail = async (payload: {
    email: string;
    name?: string;
    applicantCode?: string;
    password?: string;
    url?: string;
    programName?: string;
    dni?: string;
  }) => {
    return sendTransactionalWelcomeEmail(payload);
  };

  return {
    applicants,
    setApplicants,
    loading,
    error,
    handleUpdateApplicantsFromAdmin,
    handleCreateApplicant,
    handleUpdateApplicantByDni,
    handleDeleteApplicantByDni,
    handleSendWelcomeEmail,
    reloadApplicants
  };
}
