import { useState, useEffect, useCallback, useRef } from "react";
import {
  fetchApplicants,
  fetchApplicantByDni,
  createApplicant as apiCreateApplicant,
  updateApplicant as apiUpdateApplicant,
  deleteApplicant as apiDeleteApplicant,
  sendTransactionalWelcomeEmail
} from "../../services/api";

const DOC_KEYS = ["dniFile", "certificadoFile", "partidaFile", "fotoFile"] as const;

/** El listado del backend no trae las imágenes (hasFile / hasPaymentVoucher); indica si faltan por descargar. */
function needsBinaries(app: any): boolean {
  return (
    DOC_KEYS.some((key) => app.docs?.[key]?.hasFile && !app.docs?.[key]?.fileDataUrl) ||
    Boolean(app.hasPaymentVoucher && !app.paymentVoucherUrl)
  );
}

/** Copia al postulante actual las imágenes descargadas del detalle, sin pisar el resto de sus datos. */
function mergeFullBinaries(current: any, full: any): any {
  const docs: any = { ...(current.docs || {}) };
  for (const key of DOC_KEYS) {
    const cur = current.docs?.[key];
    const fullDoc = full.docs?.[key];
    if (cur && fullDoc?.fileDataUrl && !cur.fileDataUrl && cur.fileName === fullDoc.fileName) {
      docs[key] = { ...cur, fileDataUrl: fullDoc.fileDataUrl };
    }
  }
  return {
    ...current,
    docs,
    paymentVoucherUrl: current.paymentVoucherUrl || full.paymentVoucherUrl,
  };
}

export function stripFileDataUrls(applicantsList: any[]): any[] {
  return applicantsList.map((app) => {
    const { paymentVoucherUrl, ...restApp } = app;
    if (!restApp.docs) return restApp;
    const strippedDocs: any = {};
    for (const [key, val] of Object.entries(restApp.docs)) {
      const doc = val as any;
      strippedDocs[key] = { ...doc, fileDataUrl: undefined };
    }
    return { ...restApp, docs: strippedDocs };
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
            : nextDoc.fileDataUrl ||
              (prevDoc && prevDoc.fileName === nextDoc.fileName ? prevDoc.fileDataUrl : undefined),
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

function buildDeltaPatchPayload(prevApp: any, nextApp: any): any {
  if (!prevApp) return nextApp;
  const docKeys = ["dniFile", "certificadoFile", "partidaFile", "fotoFile"] as const;
  let patchDocs: any = undefined;
  if (nextApp.docs) {
    const changedDocs: Record<string, any> = {};
    for (const key of docKeys) {
      const prevDoc = prevApp.docs?.[key];
      const nextDoc = nextApp.docs?.[key];
      if (!nextDoc) continue;
      const docChanged =
        !prevDoc ||
        prevDoc.status !== nextDoc.status ||
        prevDoc.fileName !== nextDoc.fileName ||
        (prevDoc.observations || "") !== (nextDoc.observations || "") ||
        (nextDoc.fileDataUrl && nextDoc.fileDataUrl !== prevDoc.fileDataUrl);
      if (docChanged) {
        const cleaned = { ...nextDoc };
        delete cleaned.hasFile;
        if (prevDoc && cleaned.fileDataUrl && cleaned.fileDataUrl === prevDoc.fileDataUrl) {
          delete cleaned.fileDataUrl;
        }
        changedDocs[key] = cleaned;
      }
    }
    if (Object.keys(changedDocs).length > 0) {
      patchDocs = changedDocs;
    }
  }
  const payload: any = {
    ...nextApp,
  };
  if (patchDocs) {
    payload.docs = patchDocs;
  } else {
    delete payload.docs;
  }
  // Marcadores del listado liviano: son solo de lectura, no se guardan en la base de datos
  delete payload.hasPaymentVoucher;
  if (
    prevApp.paymentVoucherUrl &&
    nextApp.paymentVoucherUrl &&
    nextApp.paymentVoucherUrl === prevApp.paymentVoucherUrl
  ) {
    delete payload.paymentVoucherUrl;
  }
  return payload;
}

function hasApplicantChanged(prevApp: any, nextApp: any): boolean {
  if (!prevApp) return true;
  if (
    prevApp.folderStatus !== nextApp.folderStatus ||
    prevApp.folderObservations !== nextApp.folderObservations ||
    prevApp.paymentStatus !== nextApp.paymentStatus ||
    prevApp.paymentOperation !== nextApp.paymentOperation ||
    prevApp.paymentObservations !== nextApp.paymentObservations ||
    prevApp.paymentVoucherFileName !== nextApp.paymentVoucherFileName ||
    prevApp.paymentVoucherUrl !== nextApp.paymentVoucherUrl ||
    prevApp.examClassroom !== nextApp.examClassroom ||
    prevApp.examStatus !== nextApp.examStatus ||
    prevApp.admitted !== nextApp.admitted ||
    prevApp.programId !== nextApp.programId ||
    prevApp.name !== nextApp.name ||
    prevApp.lastName !== nextApp.lastName ||
    prevApp.email !== nextApp.email ||
    prevApp.phone !== nextApp.phone ||
    JSON.stringify(prevApp.supportQueries || []) !== JSON.stringify(nextApp.supportQueries || [])
  ) {
    return true;
  }
  const docKeys = ["dniFile", "certificadoFile", "partidaFile", "fotoFile"] as const;
  for (const key of docKeys) {
    const p = prevApp.docs?.[key] || {};
    const n = nextApp.docs?.[key] || {};
    if (
      p.status !== n.status ||
      p.fileName !== n.fileName ||
      p.observations !== n.observations ||
      p.fileDataUrl !== n.fileDataUrl
    ) {
      return true;
    }
  }
  return false;
}

export function useApplicantsManager(
  onAdmissionTrigger?: (updatedList: any[]) => void
) {
  const [applicants, setApplicants] = useState<any[]>([]);
  const applicantsRef = useRef<any[]>([]);
  applicantsRef.current = applicants;

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const hydrationRunRef = useRef(0);
  const lastLocalWriteRef = useRef<number>(0);

  /** Descarga las imágenes en segundo plano (de a 3), sin bloquear la pantalla ni el listado. */
  const hydrateBinaries = useCallback(async (list: any[]) => {
    const run = ++hydrationRunRef.current;
    const targets = list.filter(needsBinaries);
    for (let i = 0; i < targets.length; i += 3) {
      const chunk = targets.slice(i, i + 3);
      const fulls = await Promise.all(chunk.map((app) => fetchApplicantByDni(app.dni).catch(() => null)));
      if (run !== hydrationRunRef.current) return;
      setApplicants((prev) => {
        const next = prev.map((p) => {
          const idx = chunk.findIndex((c) => c.dni === p.dni);
          const full = idx >= 0 ? fulls[idx] : null;
          return full ? mergeFullBinaries(p, full) : p;
        });
        applicantsRef.current = next;
        return next;
      });
    }
  }, []);

  const reloadApplicants = useCallback((silent = false) => {
    if (silent && Date.now() - lastLocalWriteRef.current < 5000) {
      return Promise.resolve();
    }
    const fetchStartedAt = Date.now();
    if (!silent) setLoading(true);
    return fetchApplicants()
      .then((apiApps) => {
        if (!apiApps) throw new Error("No se pudo consultar postulantes");
        if (silent && lastLocalWriteRef.current >= fetchStartedAt) return;
        const prevByDni = new Map(applicantsRef.current.map((a) => [a.dni, a]));
        const merged = apiApps.map((app) => preserveExistingDocBinaries(prevByDni.get(app.dni), app));
        setApplicants(merged);
        applicantsRef.current = merged;
        void hydrateBinaries(merged);
        try {
          localStorage.setItem("sfa_applicants", JSON.stringify(stripFileDataUrls(merged)));
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
      .finally(() => {
        if (!silent) setLoading(false);
      });
  }, [hydrateBinaries]);

  useEffect(() => {
    void reloadApplicants(false);

    // Sincronización silenciosa cuando otra pestaña escribe, al volver a enfocar o cada 4s (listado liviano ~2KB)
    let lastFocusSync = Date.now();
    const handleSync = (e: StorageEvent) => {
      if (e.key && e.key.startsWith("sfa_applicants")) {
        void reloadApplicants(true);
      }
    };
    const handleFocusSync = () => {
      if (document.visibilityState === "hidden") return;
      const now = Date.now();
      if (now - lastFocusSync < 1000) return;
      lastFocusSync = now;
      void reloadApplicants(true);
    };
    const hasRelevantSession = () => {
      try {
        return Boolean(
          localStorage.getItem("sfa_session_admin") ||
          localStorage.getItem("sfa_session_mge") ||
          localStorage.getItem("sfa_session_superadmin")
        );
      } catch {
        return false;
      }
    };
    const pollInterval = window.setInterval(() => {
      if (document.visibilityState !== "visible" || !hasRelevantSession()) return;
      void reloadApplicants(true);
    }, 5000);

    window.addEventListener("storage", handleSync);
    window.addEventListener("focus", handleFocusSync);
    document.addEventListener("visibilitychange", handleFocusSync);

    return () => {
      window.clearInterval(pollInterval);
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("focus", handleFocusSync);
      document.removeEventListener("visibilitychange", handleFocusSync);
    };
  }, [reloadApplicants]);

  const handleUpdateApplicantsFromAdmin = async (updatedList: any[]) => {
    lastLocalWriteRef.current = Date.now();
    const prevByDni = new Map(applicantsRef.current.map((a) => [a.dni, a]));
    const hydratedList = updatedList.map((app) =>
      preserveExistingDocBinaries(prevByDni.get(app.dni), app)
    );

    const changedApplicants = hydratedList.filter((app) =>
      hasApplicantChanged(prevByDni.get(app.dni), app)
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

    const targets = changedApplicants.length > 0 ? changedApplicants : [];
    await Promise.all(
      targets.map(async (app) => {
        try {
          const prevApp = prevByDni.get(app.dni);
          const payload = buildDeltaPatchPayload(prevApp, app);
          await apiUpdateApplicant(app.dni, payload);
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
    lastLocalWriteRef.current = Date.now();
    const prev = applicantsRef.current.find((a) => a.dni === dni);
    const merged = preserveExistingDocBinaries(prev, { ...(prev || {}), ...data });
    const updatedList = applicantsRef.current.map((a) => (a.dni === dni ? merged : a));
    setApplicants(updatedList);
    applicantsRef.current = updatedList;
    await apiUpdateApplicant(dni, buildDeltaPatchPayload(prev, merged));
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
