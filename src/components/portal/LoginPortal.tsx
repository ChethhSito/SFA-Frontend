import React, { useState, useEffect } from "react";
import { 
  Lock, User, ShieldAlert, ArrowLeft, Loader2, Eye, EyeOff 
} from "lucide-react";
import { Applicant, Role } from "../../types";
import { motion } from "motion/react";
import { isFirestoreEnabled } from "../../firebase/config";
import { loginWithEmailAndPassword } from "../../firebase/auth";
import { listCollectionGeneric } from "../../firebase/firestore";
import { activateStaff, fetchApplicants, fetchApplicantByDni, fetchEnrollments, fetchStudents, loginStaff } from "../../services/api";

interface LoginPortalProps {
  onBack: () => void;
  onLoginSuccess: (role: Role, identifier: string) => void;
}

export default function LoginPortal({ onBack, onLoginSuccess }: LoginPortalProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [activationToken, setActivationToken] = useState(() => new URLSearchParams(window.location.search).get("activation") || "");
  const [activationPassword, setActivationPassword] = useState("");

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

    // Load REST API applicants from NestJS backend
    fetchApplicants()
      .then((apiApps) => {
        if (apiApps) {
          setLocalApplicants(apiApps);
          localStorage.setItem("sfa_applicants", JSON.stringify(apiApps));
        }
      })
      .catch((err) => console.error("Error fetching REST API applicants in login:", err));

    // Load Live Firestore applicants if enabled
    if (isFirestoreEnabled) {
      listCollectionGeneric<any>("applicants")
        .then((fireApps) => {
          if (fireApps && fireApps.length > 0) {
            setLocalApplicants((prev) => {
              const merged = [...prev];
              fireApps.forEach((p) => {
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

    const staff = await loginStaff(uTrim, pTrim);
    if (staff) {
      localStorage.setItem("sfa_staff_token", staff.token);
      ["administrador", "postulante", "alumno", "docente", "mpa", "mge", "maf", "superadmin"].forEach(role => localStorage.removeItem(`sfa_session_${role}`));
      localStorage.setItem(`sfa_session_${staff.user.role}`, staff.user.dni || staff.user.email);
      setIsSubmitting(false);
      onLoginSuccess(staff.user.role as Role, staff.user.dni || staff.user.email);
      return;
    }

    const currentEnrollments = await fetchEnrollments();
    const apiStudents = await fetchStudents();
    const studentRecords = apiStudents
      ? Object.fromEntries(apiStudents.filter((student: any) => student.dni).map((student: any) => [student.dni, student]))
      : localStudents;
    if (apiStudents) {
      setLocalStudents(studentRecords);
      localStorage.setItem("sfa_students", JSON.stringify(studentRecords));
    }
    const isDniMatriculado = (dni: string) => {
      const matchedEnroll = currentEnrollments?.find((e: any) => e.studentDni === dni);
      return !!(matchedEnroll && matchedEnroll.academicStatus === "MATRICULADO");
    };

    const studentDniForInput = (() => {
      if (uTrim === "alumno") {
        const firstEnrolled = currentEnrollments?.find((e: any) => e.academicStatus === "MATRICULADO");
        if (firstEnrolled?.studentDni) return firstEnrolled.studentDni;
        const firstStudent = Object.values(studentRecords)[0] as any;
        if (firstStudent?.dni) return firstStudent.dni;
      }
      if (studentRecords[uTrim]) {
        return studentRecords[uTrim].dni;
      }
      const foundSt = Object.values(studentRecords).find((st: any) => st.dni === uTrim || st.email?.toLowerCase() === uTrim) as any;
      return foundSt ? foundSt.dni : "";
    })();

    const isInputStudentMatriculado = studentDniForInput ? isDniMatriculado(studentDniForInput) : false;

    // Determine the role based on credentials typed
    let detectedRole: Role | null = null;
    let detectedIdentifier = "";

    // The local API is authoritative, including an empty result after a reset.
    const apiApps = await fetchApplicants();
    const activeApps = apiApps || [];
    if (apiApps) setLocalApplicants(apiApps);
    let matchedApp = activeApps.find(a => 
      a.dni?.toLowerCase() === uTrim || 
      a.applicantCode?.toLowerCase() === uTrim || 
      a.email?.toLowerCase() === uTrim
    );

    if (!matchedApp) {
      try {
        const singleApp = await fetchApplicantByDni(uTrim);
        if (singleApp) {
          matchedApp = singleApp;
        }
      } catch (e) {
        console.error("Direct fetchApplicantByDni error in login:", e);
      }
    }

    let isMatriculado = false;
    if (matchedApp) {
      try {
        const matchedEnroll = currentEnrollments?.find((e: any) => e.studentDni === matchedApp.dni);
        if (matchedEnroll && matchedEnroll.academicStatus === "MATRICULADO") {
          isMatriculado = true;
        }
      } catch (e) {
        console.error("Error reading sfa_enrollments in LoginPortal:", e);
      }
    }

    if (matchedApp && isMatriculado) {
      const applicantProfile = matchedApp as Applicant & {
        gender?: string;
        birthDate?: string;
        address?: string;
        district?: string;
        province?: string;
      };
      // Validate password against applicant custom password or standard 123 / clave123
      const expectedPassword = matchedApp.password || "clave123";
      if (pTrim !== expectedPassword && pTrim !== "123" && pTrim !== "clave123") {
        setIsSubmitting(false);
        setErrorMessage("Contraseña incorrecta. Ingrese con su clave registrada o '123'.");
        return;
      }

      // Ensure student profile exists in sfa_students
      let localStudentsObj: any = {};
      try {
        const savedStudents = localStorage.getItem("sfa_students");
        if (savedStudents) localStudentsObj = JSON.parse(savedStudents);
      } catch (e) {}

      if (!localStudentsObj[matchedApp.dni]) {
        localStudentsObj[matchedApp.dni] = {
          dni: matchedApp.dni,
          name: matchedApp.name,
          lastName: matchedApp.lastName,
          email: matchedApp.email,
          phone: matchedApp.phone || "",
          gender: applicantProfile.gender || "Masculino",
          birthDate: applicantProfile.birthDate || "",
          address: applicantProfile.address || "",
          district: applicantProfile.district || "",
          province: applicantProfile.province || "",
          emergencyName: "",
          emergencyPhone: "",
          emergencyRelation: "Otros"
        };
        localStorage.setItem("sfa_students", JSON.stringify(localStudentsObj));
      }

      // Ensure cycle statuses are initialized
      let localCycleStatuses: any = {};
      try {
        const savedCycles = localStorage.getItem("sfa_cycle_statuses") || localStorage.getItem("sfa_cycles");
        if (savedCycles) localCycleStatuses = JSON.parse(savedCycles);
      } catch (e) {}

      if (!localCycleStatuses[matchedApp.dni]) {
        localCycleStatuses[matchedApp.dni] = [
          {
            cycleNumber: 1,
            year: 2026,
            status: "Matriculado",
            average: 0,
            credits: 24,
            courses: []
          }
        ];
        localStorage.setItem("sfa_cycle_statuses", JSON.stringify(localCycleStatuses));
      }

      // Establish safe isolated session key
      localStorage.setItem("sfa_session_alumno", matchedApp.dni);
      setIsSubmitting(false);
      onLoginSuccess("alumno", matchedApp.dni);
      return;
    }

    if (isInputStudentMatriculado && (uTrim === "alumno" || uTrim === "luis.castillo@iestpsfa.edu.pe" || studentRecords[uTrim] || Object.values(studentRecords).some((st: any) => st.dni === uTrim || st.email?.toLowerCase() === uTrim))) {
      const studentList = Object.values(studentRecords);
      if (studentList.length === 0) {
        setIsSubmitting(false);
        setErrorMessage("No existen alumnos matriculados en el sistema actualmente. Registre y matricule un alumno primero en el MAMC.");
        return;
      }
      detectedRole = "alumno";
      const matchedSt: any = studentList.find((st: any) => st.dni === uTrim || st.email?.toLowerCase() === uTrim) || studentList[0];
      detectedIdentifier = matchedSt.dni;
    }
    // 4. Check Postulante (dynamic lookup in activeApps)
    else if (uTrim === "postulante" || matchedApp || activeApps.some(a => a.dni?.toLowerCase() === uTrim || a.applicantCode?.toLowerCase() === uTrim || a.email?.toLowerCase() === uTrim)) {
      if (activeApps.length === 0 && !matchedApp) {
        setIsSubmitting(false);
        setErrorMessage("No existen postulantes registrados en el sistema actualmente. Regístrese como postulante primero.");
        return;
      }
      const app = matchedApp || activeApps.find(a => a.dni?.toLowerCase() === uTrim || a.applicantCode?.toLowerCase() === uTrim || a.email?.toLowerCase() === uTrim);
      detectedRole = "postulante";
      detectedIdentifier = app ? (app.id || app.uid || app.applicantCode || app.dni) : (activeApps[0]?.id || activeApps[0]?.uid || activeApps[0]?.dni || uTrim);
    }
    // 5. Check if it's an 8-digit DNI or code
    else if (/^\d{8,12}$/.test(uTrim)) {
      if (isDniMatriculado(uTrim)) {
        // Then check in students if they are matriculado
        const studentList = Object.values(studentRecords);
        const matchedSt: any = studentList.find((st: any) => st.dni === uTrim);
        if (matchedSt) {
          detectedRole = "alumno";
          detectedIdentifier = matchedSt.dni;
        }
      }
      
      if (!detectedRole) {
        // Then check in applicants
        const app = matchedApp || activeApps.find((a: any) => a.dni === uTrim || a.applicantCode === uTrim);
        if (app) {
          detectedRole = "postulante";
          detectedIdentifier = app.id || app.uid || app.applicantCode || app.dni;
        } else {
          setIsSubmitting(false);
          setErrorMessage("El Código/DNI ingresado no se encuentra registrado en el sistema institucional.");
          return;
        }
      }
    }

    if (!detectedRole) {
      setIsSubmitting(false);
      setErrorMessage("Código de acceso o contraseña incorrectos. Por favor, verifique sus credenciales institucionales.");
      return;
    }

    // Isolate sessions: Clear other roles' sessions
    ["administrador", "postulante", "alumno", "docente", "mpa", "mge", "maf", "superadmin"].forEach((r) => {
      localStorage.removeItem(`sfa_session_${r}`);
    });

    // 6. DB-verified login for applicant (Postulante)
    if (detectedRole === "postulante") {
      const app = matchedApp || activeApps.find(a => 
        a.dni?.toLowerCase() === uTrim || 
        a.applicantCode?.toLowerCase() === uTrim || 
        a.email?.toLowerCase() === uTrim
      );

      if (!app) {
        setIsSubmitting(false);
        setErrorMessage("No se encontró el registro de admisión de este postulante.");
        return;
      }

      // Check against stored password or standard default "clave123"
      const expectedPassword = app.password || "clave123";
      if (pTrim !== expectedPassword && pTrim !== "clave123" && pTrim !== "123") {
        setIsSubmitting(false);
        setErrorMessage("Contraseña de postulante incorrecta. Intente con 'clave123'.");
        return;
      }

      const uid = app.dni || app.applicantCode || app.id || app.uid || "202610001";
      localStorage.setItem("sfa_session_postulante", uid);
      setIsSubmitting(false);
      onLoginSuccess("postulante", uid);
      return;
    }

    // Offline / Fallback login verification (for Docente, Alumno, Administrador, or when Firebase is disabled)
    let isValidPass = detectedRole === "alumno" && (pTrim === "123" || pTrim === "clave123");

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
      className="relative min-h-screen bg-slate-950 flex flex-col justify-center items-center overflow-hidden py-8 px-4 font-sans text-slate-800"
    >
      
      {/* REAL CAMPUS FAÇADE BACKGROUND WITH ELEGANT DARK OVERLAY */}
      <div className="absolute inset-0 z-0">
        <img 
          src="/campus_facade_sfa.jpg"
          alt="IESTP San Francisco de Asís Campus Principal"
          className="w-full h-full object-cover object-center filter brightness-90"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/75 to-[#800521]/60 z-10" />
      </div>

      {/* Subtle tech background grid with low opacity */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none z-10" />

      {/* Clean Login Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: "spring", damping: 22, stiffness: 110 }}
        className="w-full max-w-sm sm:max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200/90 relative z-20"
      >
        
        {/* Card Header (Granate + Real Logo + Volver) */}
        <div className="bg-[#9F062A] pt-5 pb-5 px-6 relative text-center">
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-400 via-[#CFA020] to-amber-400" />

          {/* Volver Button */}
          <button 
            onClick={onBack}
            className="absolute top-4 left-4 text-white/90 hover:text-white bg-white/10 hover:bg-white/20 px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider shrink-0 cursor-pointer border border-white/10"
          >
            <ArrowLeft className="w-3.5 h-3.5 text-amber-300" />
            <span>Volver</span>
          </button>

          {/* Real Official SFA Logo Image */}
          <div className="pt-2 flex flex-col items-center justify-center space-y-2">
            <img 
              src="/SFA-Logo.jpeg" 
              alt="Logo IESTP San Francisco de Asís" 
              className="w-14 h-14 object-contain rounded-full border-2 border-amber-400 bg-white p-0.5 shadow-md"
            />
            
            <div>
              <h2 className="text-white font-black text-base sm:text-lg tracking-tight uppercase leading-tight">
                IESTP San Francisco de Asís
              </h2>
              <span className="text-[10px] text-amber-300 font-extrabold uppercase tracking-widest block font-mono mt-0.5">
                INTRANET ACADÉMICA
              </span>
            </div>
          </div>
        </div>
 
        {/* Card Form Body */}
        <div className="p-6 sm:p-7 space-y-5 bg-white">
          {activationToken && <form onSubmit={async event => {
            event.preventDefault();
            setIsSubmitting(true);
            const ok = await activateStaff(activationToken, activationPassword);
            setIsSubmitting(false);
            setErrorMessage(ok ? "Cuenta activada. Ya puede iniciar sesión." : "El enlace venció o la contraseña no cumple los requisitos.");
            if (ok) { setActivationToken(""); setActivationPassword(""); window.history.replaceState({}, "", "/ingresar"); }
          }} className="space-y-3 mb-6 border-b pb-5"><h3 className="font-bold text-sm">Activar cuenta institucional</h3><p className="text-xs text-slate-600">Elija una contraseña de al menos 10 caracteres.</p><input type="password" minLength={10} required value={activationPassword} onChange={event => setActivationPassword(event.target.value)} className="w-full border rounded-lg p-3" placeholder="Nueva contraseña"/><button type="submit" disabled={isSubmitting} className="w-full bg-[#9F062A] text-white font-bold rounded-lg p-3">Activar cuenta</button></form>}
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                DNI / Código de Usuario
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#9F062A]">
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9F062A] focus:border-[#9F062A] transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 uppercase tracking-wider mb-1">
                Contraseña
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-[#9F062A]">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setErrorMessage("");
                  }}
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#9F062A] focus:border-[#9F062A] transition-all [&::-ms-reveal]:hidden [&::-webkit-contacts-auto-fill-button]:hidden"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-[#9F062A] transition-colors cursor-pointer focus:outline-none"
                  title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 text-[#9F062A]" />
                  ) : (
                    <Eye className="w-4 h-4 text-slate-400 hover:text-[#9F062A]" />
                  )}
                </button>
              </div>
            </div>

            {errorMessage && (
              <motion.div 
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-rose-50 rounded-xl border border-rose-200 text-xs text-rose-900 font-bold flex items-start gap-2.5 leading-relaxed"
              >
                <ShieldAlert className="w-4 h-4 shrink-0 text-[#9F062A] mt-0.5" />
                <span>{errorMessage}</span>
              </motion.div>
            )}

            <button 
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 bg-[#9F062A] hover:bg-[#800521] active:scale-[0.99] disabled:opacity-50 text-white rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md focus:outline-none flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-amber-300" />
                  <span>VALIDANDO...</span>
                </>
              ) : (
                <>
                  <span>INGRESAR AL SISTEMA</span>
                  <span className="text-amber-300 font-bold">→</span>
                </>
              )}
            </button>
          </form>

          {/* Minimal Clean Footer Stamp */}
          <div className="border-t border-slate-100 pt-3 text-center">
            <span className="text-[10px] text-slate-400 font-medium tracking-wide uppercase block">
              Plataforma Oficial Institucional • MINEDU
            </span>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
