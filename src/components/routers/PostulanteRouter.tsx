import React, { useEffect, useState } from "react";
import PostulanteDashboard from "../PostulanteDashboard";
import { Applicant, Enrollment } from "../../types";
import { Lock, ArrowLeft, Loader2 } from "lucide-react";
import Button from "../ui/Button";
import { auth, isFirebaseEnabled, db } from "../../firebase/config";
import { getDocumentGeneric, saveDocumentGeneric } from "../../firebase/firestore";
import { doc, onSnapshot } from "firebase/firestore";
import { fetchApplicantByDni, updateApplicant } from "../../services/api";

interface PostulanteRouterProps {
  applicants: Applicant[];
  enrollments: Enrollment[];
  onUpdateApplicant: (updated: Applicant) => void;
  onUpdateEnrollment: (updatedEnr: Enrollment) => void;
  onLogout: () => void;
}

export default function PostulanteRouter({ applicants, enrollments, onUpdateApplicant, onUpdateEnrollment, onLogout }: PostulanteRouterProps) {
  const [session, setSession] = useState<string | null>(null);
  const [liveApplicant, setLiveApplicant] = useState<Applicant | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Check local storage session
    const s = localStorage.getItem("sfa_session_postulante");
    setSession(s);

    if (s) {
      setLoading(true);
      fetchApplicantByDni(s).then((apiApp) => {
        if (apiApp) {
          setLiveApplicant(apiApp);
        }
        setLoading(false);
      }).catch((err) => {
        console.error("Error fetching REST API applicant in PostulanteRouter:", err);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }

    let unsubscribe: (() => void) | undefined = undefined;
    if (isFirebaseEnabled && s && db) {
      const docRef = doc(db, "applicants", s);
      unsubscribe = onSnapshot(docRef, (docSnap) => {
        if (docSnap.exists()) {
          setLiveApplicant({ id: docSnap.id, ...docSnap.data() } as unknown as Applicant);
        }
      }, (err) => {
        console.error("Error watching live applicant profile:", err);
      });
    }

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  // Local fallback resolve
  const currentDni = session || "";
  let applicantToRender = liveApplicant;
  if (!liveApplicant) {
    // Use local list as safe fallback
    applicantToRender = applicants.find((a) => 
      a.id === currentDni || 
      a.uid === currentDni || 
      a.applicantCode === currentDni || 
      a.dni === currentDni ||
      (a as any)._id === currentDni
    ) || null;
  }

  const handleUpdateLiveApplicant = async (updated: Applicant) => {
    // Update locally immediately
    onUpdateApplicant(updated);
    setLiveApplicant(updated);

    // Persist to NestJS Backend (MongoDB)
    try {
      await updateApplicant(updated.dni, updated);
      console.log("Updated applicant in Backend REST API successfully!");
    } catch (apiErr) {
      console.error("Error saving updated applicant to REST API:", apiErr);
    }
    
    // Update in Firebase Firestore if enabled
    if (isFirebaseEnabled && session) {
      try {
        await saveDocumentGeneric("applicants", session, updated);
        console.log("Updated live applicant profile successfully in Firestore!");
      } catch (err) {
        console.error("Error saving updated applicant to Firestore:", err);
      }
    }
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
              Su sesión de admisión ha expirado o no se encuentra autenticado en Firebase. Por favor, vuelva a ingresar.
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
    />
  );
}
