import { useState, useEffect } from "react";
import { isFirestoreEnabled, db } from "../../firebase/config";
import { saveDocumentGeneric } from "../../firebase/firestore";
import { collection, onSnapshot } from "firebase/firestore";
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

export function useApplicantsManager(
  onAdmissionTrigger?: (updatedList: any[]) => void
) {
  const [applicants, setApplicants] = useState<any[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchApplicants()
      .then((apiApps) => {
        if (!apiApps) throw new Error("No se pudo consultar postulantes");
        setApplicants(apiApps);
        localStorage.setItem("sfa_applicants", JSON.stringify(stripFileDataUrls(apiApps)));
        if (apiApps.length === 0) {
          localStorage.removeItem("sfa_session_postulante");
          for (const key of Object.keys(localStorage)) {
            if (key.startsWith("sfa_doc_status_") || key.startsWith("sfa_payment_status_")) {
              localStorage.removeItem(key);
            }
          }
        }
      })
      .catch((err) => {
        console.error("Error fetching REST API applicants:", err);
        setError("Error al cargar postulantes desde el servidor.");
      })
      .finally(() => setLoading(false));

    let unsubscribeApplicants: (() => void) | undefined = undefined;
    if (isFirestoreEnabled && db) {
      try {
        const colRef = collection(db, "applicants");
        unsubscribeApplicants = onSnapshot(
          colRef,
          (snapshot) => {
            const fireApps: any[] = [];
            snapshot.forEach((doc) => {
              fireApps.push({ id: doc.id, ...doc.data() });
            });
            if (fireApps.length > 0) {
              setApplicants((prev) => {
                const merged = [...prev];
                fireApps.forEach((fa) => {
                  const idx = merged.findIndex((m) => m.dni === fa.dni || m.applicantCode === fa.applicantCode);
                  if (idx >= 0) {
                    const localItem = merged[idx];
                    let localDocStatus: any = null;
                    try {
                      const raw = localStorage.getItem(`sfa_doc_status_${localItem.dni}`);
                      if (raw) localDocStatus = JSON.parse(raw);
                    } catch (e) {}

                    let localPayStatus: string | null = null;
                    try {
                      localPayStatus = localStorage.getItem(`sfa_payment_status_${localItem.dni}`);
                    } catch (e) {}

                    const isPayValid = 
                      localItem.paymentStatus === "Validado" || 
                      localPayStatus === "Validado" || 
                      fa.paymentStatus === "Validado";

                    const paymentStatus = isPayValid ? "Validado" : (fa.paymentStatus || localItem.paymentStatus || "Pendiente");

                    const isFolderApproved = 
                      localItem.folderStatus === "Approved" || 
                      localItem.folderStatus === "Enrolled" || 
                      fa.folderStatus === "Approved" || 
                      fa.folderStatus === "Enrolled";

                    const folderStatus = isFolderApproved 
                      ? (localItem.folderStatus === "Enrolled" || fa.folderStatus === "Enrolled" ? "Enrolled" : "Approved")
                      : (fa.folderStatus || localItem.folderStatus || "Pending");

                    const admitted = 
                      localItem.admitted === "ADMITIDO" || 
                      localItem.admitted === true || 
                      fa.admitted === "ADMITIDO" || 
                      fa.admitted === true;

                    const localDocs = { ...(localItem.docs || {}), ...(localDocStatus || {}) };
                    const faDocs = fa.docs || {};
                    const mergedDocs = { ...faDocs, ...localDocs };

                    for (const key of ["dniFile", "certificadoFile", "partidaFile", "fotoFile"]) {
                      if (localDocs[key]?.status === "Validado" || faDocs[key]?.status === "Validado") {
                        mergedDocs[key] = {
                          ...(faDocs[key] || {}),
                          ...(localDocs[key] || {}),
                          status: "Validado"
                        };
                      }
                    }

                    merged[idx] = { 
                      ...fa, 
                      ...localItem, 
                      paymentStatus, 
                      folderStatus, 
                      admitted: admitted ? "ADMITIDO" : (fa.admitted || localItem.admitted),
                      docs: mergedDocs 
                    };
                  } else {
                    merged.push(fa);
                  }
                });
                localStorage.setItem("sfa_applicants", JSON.stringify(stripFileDataUrls(merged)));
                return merged;
              });
            }
          },
          (error) => {
            console.error("onSnapshot error for applicants:", error);
          }
        );
      } catch (e) {
        console.error("Error setting up Firestore snapshot listener for applicants:", e);
      }
    }

    return () => {
      if (unsubscribeApplicants) {
        unsubscribeApplicants();
      }
    };
  }, []);

  const handleUpdateApplicantsFromAdmin = async (updatedList: any[]) => {
    setApplicants(updatedList);
    try {
      localStorage.setItem("sfa_applicants", JSON.stringify(stripFileDataUrls(updatedList)));
    } catch (e) {
      console.warn("[localStorage] Could not save sfa_applicants:", e);
    }

    if (onAdmissionTrigger) {
      onAdmissionTrigger(updatedList);
    }

    // Persist to the local REST API; Firestore is optional.
    for (const app of updatedList) {
      const cleanDoc = stripFileDataUrls([app])[0];
      try {
        apiUpdateApplicant(app.dni, cleanDoc);
      } catch (err) {
        console.warn(`[Backend API] Could not persist applicant ${app.dni}:`, err);
      }

      if (isFirestoreEnabled) {
        try {
          const targetId = app.id || app.dni;
          saveDocumentGeneric("applicants", targetId, cleanDoc);
          if (app.dni && app.dni !== targetId) {
            saveDocumentGeneric("applicants", app.dni, cleanDoc);
          }
        } catch (err) {
          console.error("Error saving updated applicant to Firestore:", err);
        }
      }
    }
  };

  /**
   * Registra un nuevo postulante / pre-postulante conectando con el backend REST y guardando en estado local.
   */
  const handleCreateApplicant = async (newApplicant: any) => {
    // 1. Enviar al backend NestJS/REST API
    const result = await apiCreateApplicant(newApplicant);
    const itemToSave = result || newApplicant;

    // 2. Actualizar lista local y localStorage/Firestore
    const exists = applicants.some((a) => a.dni === itemToSave.dni);
    const updatedList = exists
      ? applicants.map((a) => (a.dni === itemToSave.dni ? itemToSave : a))
      : [...applicants, itemToSave];

    await handleUpdateApplicantsFromAdmin(updatedList);
    return itemToSave;
  };

  /**
   * Actualiza el estado de un postulante por DNI.
   */
  const handleUpdateApplicantByDni = async (dni: string, data: any) => {
    await apiUpdateApplicant(dni, data);
    const updatedList = applicants.map((a) => (a.dni === dni ? { ...a, ...data } : a));
    await handleUpdateApplicantsFromAdmin(updatedList);
  };

  /**
   * Elimina un postulante por DNI.
   */
  const handleDeleteApplicantByDni = async (dni: string) => {
    await apiDeleteApplicant(dni);
    const updatedList = applicants.filter((a) => a.dni !== dni);
    await handleUpdateApplicantsFromAdmin(updatedList);
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
    handleSendWelcomeEmail
  };
}
