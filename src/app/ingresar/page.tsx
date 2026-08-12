"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  Lock, User, ShieldAlert, ArrowLeft, Loader2 
} from "lucide-react";
import { Role } from "@/types";
import { motion } from "motion/react";

// Fallbacks / Stubs for simulated Firebase features in standby mode
const isFirebaseEnabled = false;
const loginWithEmailAndPassword = async (email: string, pass: string) => null;
const listCollectionGeneric = async <T = any>(col: string): Promise<T[]> => [];

export default function LoginPortal() {
  const router = useRouter();
  
  const onBack = () => {
    router.push("/");
  };
  
  const onLoginSuccess = (role: Role, identifier: string) => {
    // Isolated session setup
    localStorage.setItem(`sfa_session_${role}`, identifier);
    // Redirect based on the selected role dashboard
    router.push(`/${role}`);
  };

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);


  // Read current DB states to map newly pre-registered students or applicants
  const [localApplicants, setLocalApplicants] = useState<any[]>([]);
  const [localStudents, setLocalStudents] = useState<any>({});

  useEffect(() => {
    // Load local storage fallback
    try {
      const savedApps = localStorage.getItem("sfa_applicants");
      const savedStudents = localStorage.getItem("sfa_students");
      if (savedApps) setLocalApplicants(JSON.parse(savedApps));
      if (savedStudents) setLocalStudents(JSON.parse(savedStudents));
    } catch (e) {
      console.error("Error reading local DB states for role matching", e);
    }

    // Load Live Firestore applicants if enabled
    if (isFirebaseEnabled) {
      listCollectionGeneric<any>("applicants")
        .then((fireApps) => {
          if (fireApps && fireApps.length > 0) {
            setLocalApplicants((prev) => {
              const merged = [...fireApps];
              prev.forEach((p) => {
                if (!merged.some((m) => m.dni === p.dni)) {
                  merged.push(p);
                }
              });
              return merged;
            });
          }
        })
        .catch((err) => console.error("Error loading Firestore applicants in login:", err));
    }
  }, []);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    const uTrim = username.trim().toLowerCase();
    const pTrim = password.trim();

    if (!uTrim || !pTrim) {
      setErrorMessage("Por favor ingrese ambos campos requeridos.");
      return;
    }

    setIsSubmitting(true);

    // Determine the role based on credentials typed
    let detectedRole: Role | null = null;
    let detectedIdentifier = "";

    // 1. Check Administrator
    if (uTrim === "admin" || uTrim === "administrador" || uTrim === "admin@iestpsfa.edu.pe") {
      detectedRole = "administrador";
      detectedIdentifier = "admin";
    }
    // 2. Check Docente
    else if (uTrim === "docente" || uTrim === "mramos@iestpsfa.edu.pe" || uTrim === "99887766") {
      detectedRole = "docente";
      detectedIdentifier = uTrim === "99887766" ? "99887766" : "docente";
    }
    // 3. Check Alumno (Luis Castillo 12345678, or custom student profiles)
    else if (uTrim === "alumno" || uTrim === "12345678" || uTrim === "luis.castillo@iestpsfa.edu.pe" || localStudents[uTrim]) {
      detectedRole = "alumno";
      detectedIdentifier = (uTrim === "alumno" || uTrim === "luis.castillo@iestpsfa.edu.pe") ? "12345678" : uTrim;
    }
    // 4. Check Postulante (custom profiles first or matches in localApplicants)
    else if (localApplicants.some(a => a.dni?.toLowerCase() === uTrim || a.applicantCode?.toLowerCase() === uTrim || a.email?.toLowerCase() === uTrim)) {
      const matchedApp = localApplicants.find(a => a.dni?.toLowerCase() === uTrim || a.applicantCode?.toLowerCase() === uTrim || a.email?.toLowerCase() === uTrim);
      detectedRole = "postulante";
      detectedIdentifier = matchedApp.applicantCode || matchedApp.dni;
    }
    else if (uTrim === "postulante" || uTrim === "77777777" || uTrim === "76543210" || uTrim === "45678912" || uTrim === "98765432") {
      const matchedApp = localApplicants.find(a => a.dni === uTrim || a.applicantCode?.toLowerCase() === uTrim);
      detectedRole = "postulante";
      detectedIdentifier = matchedApp ? (matchedApp.applicantCode || matchedApp.dni) : "202610001";
    }
    // 5. General regex detect: if is an 8-digit number, dynamically decide
    else if (/^\d{8}$/.test(uTrim)) {
      // If they registered an applicant earlier and typed DNI
      const matchedApp = localApplicants.find((app: any) => app.dni === uTrim);
      if (matchedApp) {
        detectedRole = "postulante";
        detectedIdentifier = matchedApp.applicantCode || matchedApp.dni;
      } else {
        // Default fallback to candidate profile for untested credentials starting with 7
        if (uTrim.startsWith("7")) {
          detectedRole = "postulante";
          detectedIdentifier = "202610001";
        } else {
          detectedRole = "alumno";
          detectedIdentifier = uTrim;
        }
      }
    }

    if (!detectedRole) {
      setIsSubmitting(false);
      setErrorMessage("Código de acceso o contraseña incorrectos. Por favor, verifique sus credenciales institucionales.");
      return;
    }

    // Isolate sessions: Clear other roles' sessions
    ["administrador", "postulante", "alumno", "docente"].forEach((r) => {
      localStorage.removeItem(`sfa_session_${r}`);
    });

    // 6. DB-verified login for applicant (Postulante)
    if (detectedRole === "postulante") {
      const matchedApp = localApplicants.find(a => 
        a.dni?.toLowerCase() === uTrim || 
        a.applicantCode?.toLowerCase() === uTrim || 
        a.email?.toLowerCase() === uTrim
      );

      if (!matchedApp) {
        setIsSubmitting(false);
        setErrorMessage("No se encontró el registro de admisión de este postulante.");
        return;
      }

      // Check against stored password or standard default "clave123"
      const expectedPassword = matchedApp.password || "clave123";
      if (pTrim !== expectedPassword) {
        setIsSubmitting(false);
        setErrorMessage("Contraseña de postulante incorrecta. Intente con 'clave123'.");
        return;
      }

      const uid = matchedApp.applicantCode || matchedApp.dni || matchedApp.id || "202610001";
      localStorage.setItem("sfa_session_postulante", uid);
      setIsSubmitting(false);
      onLoginSuccess("postulante", uid);
      return;
    }

    // Offline / Fallback login verification (for Docente, Alumno, Administrador, or when Firebase is disabled)
    let isValidPass = pTrim === "123";

    if (!isValidPass) {
      setIsSubmitting(false);
      setErrorMessage("Código de acceso o contraseña incorrectos. Por favor, verifique sus credenciales institucionales.");
      return;
    }

    // Establish safe isolated session key
    localStorage.setItem(`sfa_session_${detectedRole}`, detectedIdentifier);
    setIsSubmitting(false);
    onLoginSuccess(detectedRole, detectedIdentifier);
  };  return (
    <div 
      id="login-portal" 
      className="relative min-h-screen bg-slate-950 flex flex-col justify-center items-center overflow-hidden py-12 px-4 font-sans text-slate-800"
    >
      
      {/* IMMERSIVE CAMPUS BACKGROUND PHOTO WITH BLUR AND GRADIENT OVERLAY */}
      <div className="absolute inset-0 z-0">
        <img 
          src="https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=1920&auto=format&fit=crop"
          alt="IESTP San Francisco de Asís Campus"
          className="w-full h-full object-cover object-center filter blur-[1.5px] scale-[1.02]"
          referrerPolicy="no-referrer"
        />
        {/* Soft elegant brand tint: deep burgundy gradient with gold hue */}
        <div className="absolute inset-0 bg-gradient-to-tr from-slate-950/85 via-slate-900/65 to-[#9F062A]/25 z-10" />
      </div>

      {/* Subtle tech background grid with low opacity on top of background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-10" />

      {/* Floating Red Orb */}
      <motion.div
        animate={{
          x: [0, 80, -50, 0],
          y: [0, -100, 70, 0],
          scale: [1, 1.3, 0.85, 1],
          rotate: [0, 90, 180, 360]
        }}
        transition={{
          duration: 25,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute w-[450px] h-[450px] bg-[#9F062A]/8 rounded-full blur-[90px] -top-24 -left-20 pointer-events-none z-10"
      />

      {/* Floating Gold/Yellow Orb */}
      <motion.div
        animate={{
          x: [0, -90, 60, 0],
          y: [0, 120, -80, 0],
          scale: [1, 0.85, 1.25, 1],
          rotate: [360, 270, 90, 0]
        }}
        transition={{
          duration: 30,
          repeat: Infinity,
          ease: "linear",
        }}
        className="absolute w-[500px] h-[500px] bg-amber-400/6 rounded-full blur-[100px] -bottom-36 -right-20 pointer-events-none z-10"
      />

      {/* Floating Soft Blue Tech Orb */}
      <motion.div
        animate={{
          x: [-40, 40, -40],
          y: [40, -40, 40],
          scale: [0.9, 1.1, 0.9],
        }}
        transition={{
          duration: 15,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-72 h-72 bg-rose-500/4 rounded-full blur-[70px] top-1/3 left-1/3 pointer-events-none z-10"
      />

      {/* Glassmorphic Login Container with Floating Tilt Animation */}
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 35 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 18, stiffness: 95 }}
        className="w-full max-w-md bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200/80 relative z-20 transition-shadow hover:shadow-[#9F062A]/5"
      >
        
        {/* Top Header Card Info */}
        <div className="bg-[#9F062A] py-7 px-6 relative border-b-2 border-[#CFA020] overflow-hidden">
          {/* Subtle animated light sweep */}
          <motion.div 
            animate={{ x: ["-100%", "200%"] }} 
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", repeatDelay: 1 }}
            className="absolute top-0 bottom-0 left-0 w-1/3 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12 pointer-events-none"
          />

          <button 
            onClick={onBack}
            className="absolute top-4 left-4 text-white/90 hover:text-white hover:bg-white/10 px-2.5 py-1 rounded transition-all flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 stroke-[2.5]" /> Volver
          </button>
          
          <div className="mt-5 flex items-center justify-center gap-3">
            <svg className="w-9 h-9 drop-shadow-sm shrink-0 bg-white p-1 rounded-sm" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 5 L85 22 C85 58 68 85 50 95 C32 85 15 58 15 22 Z" fill="#9F062A" />
              <polygon points="50,22 53,30 61,30 55,35 57,43 50,38 43,43 45,35 39,30 47,30" fill="#E3BD26" />
              <rect x="47" y="32" width="6" height="28" rx="1" fill="#EAEAE4" />
              <rect x="36" y="42" width="28" height="6" rx="1" fill="#EAEAE4" />
            </svg>
            <div>
              <h2 className="text-white font-black text-sm tracking-tight leading-none uppercase">IESTP San Francisco de Asís</h2>
              <p className="text-[9px] text-amber-300 font-extrabold uppercase tracking-widest mt-1">Servicio de Intranet Académico</p>
            </div>
          </div>
        </div>
 
        {/* Portal Body */}
        <div className="p-6 sm:p-8 space-y-5">
          <div className="text-center">
            <h3 className="text-base sm:text-lg font-black font-sans text-slate-900 tracking-tight uppercase">Acceso Único</h3>
            <p className="text-[11px] text-slate-500 font-semibold mt-1.5 leading-relaxed">
              Ingrese su DNI o código institucional para acceder al espacio correspondiente.
            </p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Código de Usuario / DNI *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <User className="w-4 h-4" />
                </span>
                <input
                  type="text"
                  required
                  placeholder="Ingrese su DNI o Código"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    setErrorMessage("");
                  }}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-205 rounded-lg text-xs font-semibold text-slate-950 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#9F062A] focus:border-[#9F062A] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-slate-600 uppercase tracking-widest mb-1.5">Contraseña institucional *</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-400">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage("");
                  }}
                  className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-205 rounded-lg text-slate-950 placeholder-slate-400 text-xs font-semibold focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#9F062A] focus:border-[#9F062A] transition-all"
                />
              </div>
            </div>

            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-red-50 rounded-lg border border-red-200 text-xs text-red-850 font-semibold flex items-start gap-2.5 leading-relaxed"
              >
                <ShieldAlert className="w-4 h-4 shrink-0 text-red-650 mt-0.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#9F062A] hover:bg-[#800521] active:scale-[0.99] disabled:opacity-50 text-white rounded-lg font-black text-xs uppercase tracking-widest transition-all shadow-md focus:outline-hidden flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" /> Validando Acceso...
                </>
              ) : (
                "Ingresar al Sistema \u2192"
              )}
            </button>
          </form>

          <div className="border-t border-slate-100 pt-3 text-center">
            <span className="text-[9px] text-slate-450 font-mono tracking-wider uppercase block">Garantía del Servidor de Control • MINEDU</span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
