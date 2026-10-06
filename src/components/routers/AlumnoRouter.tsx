import React, { useEffect, useState } from "react";
import AlumnoDashboard from "../alumno/AlumnoDashboard";
import { Enrollment, StudentPersonalData, Course, CourseMaterial, CourseAssignment, CourseEvaluation, AttendanceRecord, CycleStatus, Graduation } from "../../types";
import { Lock, ArrowLeft } from "lucide-react";
import Button from "../ui/Button";

interface AlumnoRouterProps {
  enrollments: Enrollment[];
  studentsData: { [dni: string]: StudentPersonalData };
  courses: Course[];
  materials: CourseMaterial[];
  assignments: CourseAssignment[];
  evaluations: CourseEvaluation[];
  attendance: AttendanceRecord[];
  cycleStatuses: { [dni: string]: CycleStatus[] };
  graduations: Graduation[];
  onUpdatePersonal: (studentDni: string, updated: StudentPersonalData) => void;
  onUpdateEnrollment: (enr: Enrollment) => void;
  onUpdateAssignments: (updated: CourseAssignment[]) => void;
  onLogout: () => void;
}

export default function AlumnoRouter({
  enrollments,
  studentsData,
  courses,
  materials,
  assignments,
  evaluations,
  attendance,
  cycleStatuses,
  graduations,
  onUpdatePersonal,
  onUpdateEnrollment,
  onUpdateAssignments,
  onLogout
}: AlumnoRouterProps) {
  const [session, setSession] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const s = localStorage.getItem("sfa_session_alumno");
    setSession(s);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <span className="text-white text-xs font-bold uppercase tracking-widest">Iniciando Portal del Estudiante...</span>
      </div>
    );
  }

  const currentDni = session || "";
  let personal = studentsData[currentDni];
  if (!personal && currentDni) {
    try {
      const saved = localStorage.getItem("sfa_students");
      if (saved) {
        const parsed = JSON.parse(saved);
        personal = parsed[currentDni];
      }
    } catch (e) {
      console.error("Error retrieving student fallback from localStorage:", e);
    }
  }

  if (!session || !personal) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 max-w-sm w-full text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-slate-950 text-[#CFA020] flex items-center justify-center mx-auto border border-yellow-905_color">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-white font-black text-lg uppercase tracking-wider">Módulo de Alumnos</h3>
            <p className="text-slate-400 text-xs font-medium leading-relaxed">
              Área reservada para estudiantes matriculados de la institución. Inicie sesión para ver su avance académico y asignaturas.
            </p>
          </div>
          <div className="pt-2">
            <Button 
              onClick={onLogout}
              className="w-full bg-[#9F062A] hover:bg-[#800521] text-white uppercase text-xs font-bold tracking-widest rounded-lg flex items-center justify-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Ingresar a Intranet
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 1. Encontrar o reconstruir el expediente de matrícula
  const foundEnr = enrollments.find((e) => e.studentDni === currentDni);
  
  // 2. Consultar historial de postulante y documentos guardados localmente
  let appRecord: any = null;
  let localDocStatus: any = null;
  try {
    const savedApps = localStorage.getItem("sfa_applicants");
    if (savedApps) {
      const parsedApps = JSON.parse(savedApps);
      appRecord = parsedApps.find((a: any) => a.dni === currentDni);
    }
    const rawLocalDocs = localStorage.getItem(`sfa_doc_status_${currentDni}`);
    if (rawLocalDocs) {
      localDocStatus = JSON.parse(rawLocalDocs);
    }
  } catch (e) {}

  const isEnrolled = foundEnr?.academicStatus === "MATRICULADO" || appRecord?.folderStatus === "Enrolled" || appRecord?.academicStatus === "MATRICULADO";
  const isApproved = isEnrolled || appRecord?.folderStatus === "Approved" || appRecord?.admitted === "ADMITIDO" || appRecord?.admitted === true;

  // Unificar documentos reales
  const appDocs = appRecord?.docs || {};
  const enrDocs = foundEnr?.docs || {};
  const docKeys: Array<"dniFile" | "certificadoFile" | "partidaFile" | "fotoFile"> = [
    "dniFile", "certificadoFile", "partidaFile", "fotoFile"
  ];
  
  const mergedDocs: any = {};
  for (const k of docKeys) {
    const local = localDocStatus?.[k];
    const fromApp = appDocs[k];
    const fromEnr = enrDocs[k];

    let fileName = local?.fileName || fromApp?.fileName || fromEnr?.fileName;
    let fileDataUrl = local?.fileDataUrl || fromApp?.fileDataUrl || fromEnr?.fileDataUrl;
    if (!fileDataUrl) {
      try {
        fileDataUrl = localStorage.getItem(`sfa_file_data_${currentDni}_${k}`) || undefined;
      } catch (e) {}
    }
    
    // Si fue admitido/matriculado o validado en secretaría, el documento es Validado
    const isValid = local?.status === "Validado" || fromApp?.status === "Validado" || fromEnr?.status === "Validado" || isApproved;
    const isObs = local?.status === "Observado" || fromApp?.status === "Observado" || fromEnr?.status === "Observado";
    const isPend = local?.status === "Pendiente" || fromApp?.status === "Pendiente" || fromEnr?.status === "Pendiente" || !!fileName;

    const status = isValid ? "Validado" : isObs ? "Observado" : isPend ? "Pendiente" : "No Enviado";
    if (isValid && !fileName) {
      fileName = k === "dniFile" ? `dni_${currentDni}.pdf`
        : k === "certificadoFile" ? `certificado_secundaria_${currentDni}.pdf`
        : k === "partidaFile" ? `partida_nacimiento_${currentDni}.pdf`
        : `foto_carnet_${currentDni}.jpg`;
    }

    mergedDocs[k] = {
      status,
      fileName,
      fileDataUrl,
      observations: local?.observations || fromApp?.observations || fromEnr?.observations
    };
  }

  const enr: Enrollment = {
    studentDni: currentDni,
    programId: foundEnr?.programId || appRecord?.programId || "electronica",
    academicStatus: isEnrolled ? "MATRICULADO" : (foundEnr?.academicStatus || "ADMITIDO"),
    shift: foundEnr?.shift || appRecord?.shift || "Mañana",
    groupId: foundEnr?.groupId || appRecord?.groupId,
    docs: mergedDocs,
    paymentStatus: isEnrolled ? "Validado" : (foundEnr?.paymentStatus || appRecord?.paymentStatus || "No Pagado"),
    paymentOperation: foundEnr?.paymentOperation || appRecord?.paymentOperation || (isEnrolled ? `OP-MATR-2026-${currentDni ? currentDni.slice(-4) : "0001"}` : "")
  };
  let historyList = cycleStatuses[currentDni] || [];
  if (historyList.length === 0 && currentDni) {
    try {
      const savedCycles = localStorage.getItem("sfa_cycle_statuses") || localStorage.getItem("sfa_cycles");
      if (savedCycles) {
        const parsedCycles = JSON.parse(savedCycles);
        if (parsedCycles[currentDni]) {
          historyList = parsedCycles[currentDni];
        }
      }
    } catch (e) {}
  }
  const gradDoc = graduations.find((g) => g.studentDni === currentDni);

  return (
    <AlumnoDashboard 
      studentDni={currentDni}
      personalData={personal}
      enrollment={enr}
      courses={courses}
      materials={materials}
      assignments={assignments}
      evaluations={evaluations}
      attendance={attendance}
      cycleStatuses={historyList}
      graduation={gradDoc}
      onUpdatePersonal={(updated) => onUpdatePersonal(currentDni, updated)}
      onUpdateEnrollment={onUpdateEnrollment}
      onUpdateAssignments={onUpdateAssignments}
      onLogout={onLogout}
    />
  );
}
