import { useState, useEffect } from "react";
import { isFirebaseEnabled, db } from "../../firebase/config";
import { saveDocumentGeneric } from "../../firebase/firestore";
import { collection, onSnapshot } from "firebase/firestore";
import { fetchApplicants } from "../../services/api";

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
  const [applicants, setApplicants] = useState<any[]>(() => {
    const savedApps = localStorage.getItem("sfa_applicants");
    if (savedApps) {
      try {
        return JSON.parse(savedApps);
      } catch (err) {
        console.error("parsing local sfa_applicants", err);
      }
    }
    return [];
  });

  useEffect(() => {
    fetchApplicants().then((apiApps) => {
      if (apiApps && apiApps.length > 0) {
        setApplicants((prev) => {
          const merged = [...prev];
          apiApps.forEach((a) => {
            const index = merged.findIndex((m) => m.dni === a.dni || m.applicantCode === a.applicantCode);
            if (index >= 0) {
              merged[index] = { ...merged[index], ...a };
            } else {
              merged.push(a);
            }
          });
          localStorage.setItem("sfa_applicants", JSON.stringify(merged));
          return merged;
        });
      }
    }).catch((err) => console.error("Error fetching REST API applicants:", err));

    let unsubscribeApplicants: (() => void) | undefined = undefined;
    if (isFirebaseEnabled && db) {
      try {
        const colRef = collection(db, "applicants");
        unsubscribeApplicants = onSnapshot(colRef, (snapshot) => {
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
                  merged[idx] = { ...merged[idx], ...fa };
                } else {
                  merged.push(fa);
                }
              });
              localStorage.setItem("sfa_applicants", JSON.stringify(stripFileDataUrls(merged)));
              return merged;
            });
          }
        }, (error) => {
          console.error("onSnapshot error for applicants:", error);
        });
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

    if (isFirebaseEnabled) {
      for (const app of updatedList) {
        try {
          const cleanDoc = stripFileDataUrls([app])[0];
          await saveDocumentGeneric("applicants", cleanDoc, app.dni);
        } catch (err) {
          console.error("Error saving updated applicant to Firestore:", err);
        }
      }
    }
  };

  return {
    applicants,
    setApplicants,
    handleUpdateApplicantsFromAdmin
  };
}
