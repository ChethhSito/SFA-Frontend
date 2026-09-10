/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { Role, AdmissionPeriod } from "./types";
import PortalHome from "./components/PortalHome";
import LoginPortal from "./components/LoginPortal";
import AdminRouter from "./components/routers/AdminRouter";
import MpaRouter from "./components/routers/MpaRouter";
import MgeRouter from "./components/routers/MgeRouter";
import MafRouter from "./components/routers/MafRouter";
import PostulanteRouter from "./components/routers/PostulanteRouter";
import AlumnoRouter from "./components/routers/AlumnoRouter";
import DocenteRouter from "./components/routers/DocenteRouter";
import { isFirebaseEnabled, db } from "./firebase/config";
import { listCollectionGeneric, saveDocumentGeneric } from "./firebase/firestore";
import { collection, onSnapshot } from "firebase/firestore";
import { AlertCircle } from "lucide-react";

const alertQueue: string[] = [];
let globalAlertHandler: ((message: string) => void) | null = null;

if (typeof window !== "undefined") {
  window.alert = (message: any) => {
    const msg = String(message || "");
    if (globalAlertHandler) {
      globalAlertHandler(msg);
    } else {
      alertQueue.push(msg);
    }
  };
}

import {
  ACADEMIC_PROGRAMS,
  INITIAL_APPLICANTS,
  INITIAL_STUDENTS_DATA,
  INITIAL_ENROLLMENTS,
  GENERAL_TEACHERS,
  GENERAL_CLASSROOMS,
  INITIAL_COURSES,
  INITIAL_MATERIALS,
  INITIAL_ASSIGNMENTS,
  INITIAL_EVALUATIONS,
  INITIAL_ATTENDANCE,
  INITIAL_CYCLE_STATUSES,
  INITIAL_GRADUATIONS
} from "./mockData";

export default function App() {
  // Navigation / Auth State
  const [currentUser, setCurrentUser] = useState<{ role: Role; identifier: string }>({
    role: "portal",
    identifier: ""
  });

  // Custom global alert modal state
  const [customAlert, setCustomAlert] = useState<{ message: string; show: boolean }>({
    message: "",
    show: false
  });

  useEffect(() => {
    globalAlertHandler = (message: string) => {
      setCustomAlert({ message, show: true });
    };
    // Flush any alerts that were queued before mounting completed
    while (alertQueue.length > 0) {
      const msg = alertQueue.shift();
      if (msg) {
        setCustomAlert({ message: msg, show: true });
      }
    }
    return () => {
      globalAlertHandler = null;
    };
  }, []);

  // Mock Database State Blocks (reactive and shared!)
  const [applicants, setApplicants] = useState<any[]>([]);
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const [studentsData, setStudentsData] = useState(INITIAL_STUDENTS_DATA);
  const [classrooms, setClassrooms] = useState(GENERAL_CLASSROOMS);
  const [teachers, setTeachers] = useState(GENERAL_TEACHERS);
  const [courses, setCourses] = useState(INITIAL_COURSES);
  const [materials, setMaterials] = useState(INITIAL_MATERIALS);
  const [assignments, setAssignments] = useState(INITIAL_ASSIGNMENTS);
  const [evaluations] = useState(INITIAL_EVALUATIONS);
  const [attendance, setAttendance] = useState(INITIAL_ATTENDANCE);
  const [cycleStatuses, setCycleStatuses] = useState(INITIAL_CYCLE_STATUSES);
  const [graduations, setGraduations] = useState(INITIAL_GRADUATIONS);

  // Admission periods state
  const [admissionPeriods, setAdmissionPeriods] = useState<AdmissionPeriod[]>(() => {
    // Read MPA Academic Periods first to enforce absolute dependency
    const mpaSaved = localStorage.getItem("mpa_db_periods");
    let validMpaIds: string[] = [];
    if (mpaSaved) {
      try {
        const parsedMpa = JSON.parse(mpaSaved);
        if (Array.isArray(parsedMpa)) {
          validMpaIds = parsedMpa.map((p: any) => p.id);
        }
      } catch (e) {
        console.error("Error reading mpa_db_periods:", e);
      }
    }

    if (validMpaIds.length === 0) {
      return []; // Return empty if there are no Academic Periods in MPA
    }

    const saved = localStorage.getItem("sfa_admission_periods");
    try {
      if (saved) {
        const parsed = JSON.parse(saved);
        // Migrar periodos guardados antiguos si no tienen fechas o tienen formato viejo / duplicado
        const migrated = parsed.map((p: any) => {
          const isSecondPeriod = p.name && p.name.includes("-II");
          const hasDefaultFirstPeriodDate = p.preEnrollmentStartDate === "2026-02-01" && isSecondPeriod;
          return {
            ...p,
            status: p.status || (p.isActive ? "APERTURADO" : "PENDIENTE"),
            academicPeriodId: p.academicPeriodId || (p.id === "1" ? "p1" : p.id === "2" ? "p2" : undefined),
            preEnrollmentStartDate: hasDefaultFirstPeriodDate ? "2026-07-01" : (p.preEnrollmentStartDate || (isSecondPeriod ? "2026-07-01" : "2026-02-01")),
            preEnrollmentEndDate: hasDefaultFirstPeriodDate ? "2026-08-14" : (p.preEnrollmentEndDate || (isSecondPeriod ? "2026-08-14" : "2026-03-20")),
            admissionDate: hasDefaultFirstPeriodDate ? "2026-08-16" : (p.admissionDate || (isSecondPeriod ? "2026-08-16" : "2026-03-22")),
            enrollmentStartDate: hasDefaultFirstPeriodDate ? "2026-08-18" : (p.enrollmentStartDate || (isSecondPeriod ? "2026-08-18" : "2026-03-24")),
            enrollmentEndDate: hasDefaultFirstPeriodDate ? "2026-08-23" : (p.enrollmentEndDate || p.enrollmentDate || (isSecondPeriod ? "2026-08-23" : "2026-03-29")),
            classesStartDate: hasDefaultFirstPeriodDate ? "2026-09-01" : (p.classesStartDate || (isSecondPeriod ? "2026-09-01" : "2026-04-06"))
          };
        });
        // Strict filter: only keep admission periods linked to existing academic period IDs
        return migrated.filter((p: any) => p.academicPeriodId && validMpaIds.includes(p.academicPeriodId));
      }
    } catch (e) {
      console.error(e);
    }
    return []; // No mock periods
  });

  useEffect(() => {
    try {
      localStorage.setItem("sfa_admission_periods", JSON.stringify(admissionPeriods));
    } catch (e) {
      console.error(e);
    }
  }, [admissionPeriods]);

  // Reactive verification: Automatically purge admission periods if their linked academic periods are deleted or empty in the MPA
  useEffect(() => {
    try {
      const mpaSaved = localStorage.getItem("mpa_db_periods");
      let validMpaIds: string[] = [];
      if (mpaSaved) {
        const parsedMpa = JSON.parse(mpaSaved);
        if (Array.isArray(parsedMpa)) {
          validMpaIds = parsedMpa.map((p: any) => p.id);
        }
      }
      const filtered = admissionPeriods.filter(
        (p) => p.academicPeriodId && validMpaIds.includes(p.academicPeriodId)
      );
      if (filtered.length !== admissionPeriods.length) {
        setAdmissionPeriods(filtered);
      }
    } catch (e) {
      console.error("Error syncing MAMC admission periods with MPA academic periods:", e);
    }
  });

  // Synchronize state with localStorage and fetch live applicants from Firestore
  useEffect(() => {
    const savedApps = localStorage.getItem("sfa_applicants");
    const savedEnrolls = localStorage.getItem("sfa_enrollments");
    const savedStudents = localStorage.getItem("sfa_students");
    const savedClass = localStorage.getItem("sfa_classrooms");
    const savedMats = localStorage.getItem("sfa_materials");
    const savedAsgs = localStorage.getItem("sfa_assignments");
    const savedAtt = localStorage.getItem("sfa_attendance");
    const savedGrad = localStorage.getItem("sfa_graduations");
    const savedCourses = localStorage.getItem("sfa_courses");
    const savedTeachers = localStorage.getItem("sfa_teachers");

    let initialApps: any[] = [];
    if (savedApps) {
      try {
        initialApps = JSON.parse(savedApps);
      } catch (err) {
        console.error("parsing local sfa_applicants", err);
      }
    }
    setApplicants(initialApps);

    let initialEnrolls = INITIAL_ENROLLMENTS;
    if (savedEnrolls) {
      try {
        let parsedEnrolls = JSON.parse(savedEnrolls);
        if (!localStorage.getItem("sfa_luis_matriculado_migrated")) {
          parsedEnrolls = parsedEnrolls.map((e: any) => {
            if (e.studentDni === "12345678") {
              return {
                ...e,
                academicStatus: "ADMITIDO",
                shift: undefined,
                groupId: undefined
              };
            }
            return e;
          });
          localStorage.setItem("sfa_enrollments", JSON.stringify(parsedEnrolls));
          localStorage.setItem("sfa_luis_matriculado_migrated", "true");
        }
        initialEnrolls = parsedEnrolls;
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem("sfa_enrollments", JSON.stringify(INITIAL_ENROLLMENTS));
    }
    setEnrollments(initialEnrolls);
    if (savedStudents) setStudentsData(JSON.parse(savedStudents));
    if (savedClass) setClassrooms(JSON.parse(savedClass));
    if (savedMats) setMaterials(JSON.parse(savedMats));
    if (savedAsgs) setAssignments(JSON.parse(savedAsgs));
    if (savedAtt) setAttendance(JSON.parse(savedAtt));
    if (savedGrad) setGraduations(JSON.parse(savedGrad));
    if (savedCourses) setCourses(JSON.parse(savedCourses));
    if (savedTeachers) setTeachers(JSON.parse(savedTeachers));

    // Live real-time sync from Firestore
    let unsubscribeApplicants: (() => void) | undefined = undefined;
    if (isFirebaseEnabled && db) {
      try {
        const colRef = collection(db, "applicants");
        unsubscribeApplicants = onSnapshot(colRef, (snapshot) => {
          const fireApps: any[] = [];
          snapshot.forEach((doc) => {
            fireApps.push({ id: doc.id, ...doc.data() });
          });
          setApplicants(fireApps);
          localStorage.setItem("sfa_applicants", JSON.stringify(fireApps));
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

  const saveDatabaseState = (
    key: string,
    value: any,
    setter: React.Dispatch<React.SetStateAction<any>>
  ) => {
    setter(value);
    localStorage.setItem(key, JSON.stringify(value));
  };

  const handleUpdateApplicantsFromAdmin = async (updatedList: any[]) => {
    saveDatabaseState("sfa_applicants", updatedList, setApplicants);

    // Sync newly admitted applicants to create enrollment & student rows if not exist
    let currentEnrollments = [...enrollments];
    let currentStudentsData = { ...studentsData };
    let currentCycleStatuses = { ...cycleStatuses };
    let databaseChanged = false;

    for (const updated of updatedList) {
      if (updated.admitted === true || updated.admitted === "ADMITIDO") {
        const existsEnroll = currentEnrollments.some((e) => e.studentDni === updated.dni);
        if (!existsEnroll) {
          const newEnrollmentRow = {
            studentDni: updated.dni,
            programId: updated.programId,
            academicStatus: "ADMITIDO" as const,
            docs: {
              dniFile: { status: "No Enviado" as const },
              certificadoFile: { status: "No Enviado" as const },
              partidaFile: { status: "No Enviado" as const },
              fotoFile: { status: "No Enviado" as const }
            },
            paymentStatus: "No Pagado" as const
          };
          currentEnrollments.push(newEnrollmentRow);

          const newStudentPersonal = {
            dni: updated.dni,
            birthDate: "",
            name: updated.name,
            lastName: updated.lastName,
            gender: "Masculino",
            email: updated.email,
            phone: updated.phone,
            address: "",
            district: "",
            province: "",
            emergencyName: "",
            emergencyPhone: "",
            emergencyRelation: ""
          };
          currentStudentsData[updated.dni] = newStudentPersonal;

          const newCycleStatus = [
            {
              cycleNumber: 1,
              year: 2026,
              status: "Pendiente" as const,
              average: 0,
              credits: 24,
              courses: updated.programId === "electronica" ? [
                { name: "Introducción a la Electricidad", grade: 0, approved: false },
                { name: "Matemática Aplicada I", grade: 0, approved: false }
              ] : [
                { name: "Introducción a la Contabilidad", grade: 0, approved: false },
                { name: "Matemática Financiera", grade: 0, approved: false }
              ]
            }
          ];
          currentCycleStatuses[updated.dni] = newCycleStatus;
          databaseChanged = true;
        }
      }
    }

    if (databaseChanged) {
      saveDatabaseState("sfa_enrollments", currentEnrollments, setEnrollments);
      saveDatabaseState("sfa_students", currentStudentsData, setStudentsData);
      setCycleStatuses(currentCycleStatuses);
    }

    if (isFirebaseEnabled) {
      // Sync each modified applicant back to Firestore
      for (const updatedApp of updatedList) {
        const existingApp = applicants.find(a => a.dni === updatedApp.dni);
        if (!existingApp || JSON.stringify(existingApp) !== JSON.stringify(updatedApp)) {
          const docId = updatedApp.id || updatedApp.uid || updatedApp.applicantCode;
          if (docId) {
            try {
              await saveDocumentGeneric("applicants", docId, updatedApp);
              console.log(`Synced applicant ${updatedApp.dni} modification to Firestore.`);
            } catch (err) {
              console.error(`Error syncing applicant ${updatedApp.dni} to Firestore:`, err);
            }
          }
        }
      }
    }
  };

  const handleLoginSuccess = (role: Role, identifier: string) => {
    setCurrentUser({ role, identifier });
  };

  const handleLogout = () => {
    setCurrentUser({ role: "portal", identifier: "" });
  };

  // State update interfaces
  const handleUpdateApplicant = (updated: any) => {
    const nextList = applicants.map((app) => (app.dni === updated.dni ? updated : app));
    
    // If the applicant is newly admitted, check if they already have a student profile & enrollment row
    if (updated.admitted === true || updated.admitted === "ADMITIDO") {
      const existsEnroll = enrollments.some((e) => e.studentDni === updated.dni);
      if (!existsEnroll) {
        const newEnrollmentRow = {
          studentDni: updated.dni,
          programId: updated.programId,
          academicStatus: "ADMITIDO" as const,
          docs: {
            dniFile: { status: "No Enviado" as const },
            certificadoFile: { status: "No Enviado" as const },
            partidaFile: { status: "No Enviado" as const },
            fotoFile: { status: "No Enviado" as const }
          },
          paymentStatus: "No Pagado" as const
        };
        saveDatabaseState("sfa_enrollments", [...enrollments, newEnrollmentRow], setEnrollments);

        const newStudentPersonal = {
          dni: updated.dni,
          birthDate: "",
          name: updated.name,
          lastName: updated.lastName,
          gender: "Masculino",
          email: updated.email,
          phone: updated.phone,
          address: "",
          district: "",
          province: "",
          emergencyName: "",
          emergencyPhone: "",
          emergencyRelation: ""
        };
        saveDatabaseState("sfa_students", { ...studentsData, [updated.dni]: newStudentPersonal }, setStudentsData);

        // create cycle placeholder
        const newCycleStatus = [
          {
            cycleNumber: 1,
            year: 2026,
            status: "Pendiente" as const,
            average: 0,
            credits: 24,
            courses: updated.programId === "electronica" ? [
              { name: "Introducción a la Electricidad", grade: 0, approved: false },
              { name: "Matemática Aplicada I", grade: 0, approved: false }
            ] : [
              { name: "Introducción a la Contabilidad", grade: 0, approved: false },
              { name: "Matemática Financiera", grade: 0, approved: false }
            ]
          }
        ];
        const nextCycleStatuses = { ...cycleStatuses, [updated.dni]: newCycleStatus };
        setCycleStatuses(nextCycleStatuses);
      }
    }

    saveDatabaseState("sfa_applicants", nextList, setApplicants);
  };

  const handleUpdateEnrollment = (enr: any) => {
    const exists = enrollments.some((item) => item.studentDni === enr.studentDni);
    const nextList = exists 
      ? enrollments.map((item) => (item.studentDni === enr.studentDni ? enr : item))
      : [...enrollments, enr];
    saveDatabaseState("sfa_enrollments", nextList, setEnrollments);
  };

  const handleUpdatePersonalData = (studentDni: string, details: any) => {
    const nextObj = { ...studentsData, [studentDni]: details };
    saveDatabaseState("sfa_students", nextObj, setStudentsData);
  };

  return (
    <div id="root-viewport" className="min-h-screen bg-slate-100 selection:bg-[#9F062A] selection:text-white">
      {/* 1. Portal Public view */}
      {currentUser.role === "portal" && (
        <PortalHome 
          onEnterIntranet={() => setCurrentUser({ role: "login", identifier: "" })} 
          admissionPeriods={admissionPeriods}
        />
      )}

      {/* 2. Login Gateway */}
      {currentUser.role === "login" && (
        <LoginPortal 
          onBack={() => setCurrentUser({ role: "portal", identifier: "" })}
          onLoginSuccess={handleLoginSuccess}
        />
      )}

      {/* 3. Applicant workspace */}
      {currentUser.role === "postulante" && (
        <PostulanteRouter 
          applicants={applicants}
          enrollments={enrollments}
          onUpdateApplicant={handleUpdateApplicant}
          onUpdateEnrollment={handleUpdateEnrollment}
          onLogout={handleLogout}
        />
      )}

      {/* 4. Student regular dashboard */}
      {currentUser.role === "alumno" && (
        <AlumnoRouter 
          enrollments={enrollments}
          studentsData={studentsData}
          courses={courses}
          materials={materials}
          assignments={assignments}
          evaluations={evaluations}
          attendance={attendance}
          cycleStatuses={cycleStatuses}
          graduations={graduations}
          onUpdatePersonal={handleUpdatePersonalData}
          onUpdateEnrollment={handleUpdateEnrollment}
          onUpdateAssignments={(updated) => saveDatabaseState("sfa_assignments", updated, setAssignments)}
          onLogout={handleLogout}
        />
      )}

      {/* 5. Teacher registry panel */}
      {currentUser.role === "docente" && (
        <DocenteRouter 
          courses={courses}
          materials={materials}
          assignments={assignments}
          evaluations={evaluations}
          attendance={attendance}
          studentsList={studentsData}
          onUpdateMaterials={(updated) => saveDatabaseState("sfa_materials", updated, setMaterials)}
          onUpdateAssignments={(updated) => saveDatabaseState("sfa_assignments", updated, setAssignments)}
          onUpdateAttendance={(updated) => saveDatabaseState("sfa_attendance", updated, setAttendance)}
          onLogout={handleLogout}
        />
      )}

      {/* 6. Administrator backoffice panel */}
      {currentUser.role === "administrador" && (
        <AdminRouter 
          applicants={applicants}
          enrollments={enrollments}
          studentsList={studentsData}
          classrooms={classrooms}
          teachers={teachers}
          graduations={graduations}
          admissionPeriods={admissionPeriods}
          courses={courses}
          assignments={assignments}
          attendance={attendance}
          onUpdateApplicants={handleUpdateApplicantsFromAdmin}
          onUpdateEnrollments={(updated) => saveDatabaseState("sfa_enrollments", updated, setEnrollments)}
          onUpdateClassrooms={(updated) => saveDatabaseState("sfa_classrooms", updated, setClassrooms)}
          onUpdateTeachers={(updated) => saveDatabaseState("sfa_teachers", updated, setTeachers)}
          onUpdateGraduations={(updated) => saveDatabaseState("sfa_graduations", updated, setGraduations)}
          onUpdateAdmissionPeriods={setAdmissionPeriods}
          onUpdateStudentsList={(updated) => saveDatabaseState("sfa_students", updated, setStudentsData)}
          onUpdateCourses={(updated) => saveDatabaseState("sfa_courses", updated, setCourses)}
          onUpdateAssignments={(updated) => saveDatabaseState("sfa_assignments", updated, setAssignments)}
          onUpdateAttendance={(updated) => saveDatabaseState("sfa_attendance", updated, setAttendance)}
          onLogout={handleLogout}
        />
      )}

      {/* 7. MPA Academic Planning backoffice panel */}
      {currentUser.role === "mpa" && (
        <MpaRouter 
          onLogout={handleLogout}
        />
      )}

      {/* 7.5 MGE Student Management backoffice panel */}
      {currentUser.role === "mge" && (
        <MgeRouter
          applicants={applicants}
          enrollments={enrollments}
          studentsList={studentsData}
          courses={courses}
          assignments={assignments}
          attendance={attendance}
          graduations={graduations}
          admissionPeriods={admissionPeriods}
          onUpdateEnrollments={(updated) => saveDatabaseState("sfa_enrollments", updated, setEnrollments)}
          onUpdateStudentsList={(updated) => saveDatabaseState("sfa_students", updated, setStudentsData)}
          onUpdateCourses={(updated) => saveDatabaseState("sfa_courses", updated, setCourses)}
          onUpdateAssignments={(updated) => saveDatabaseState("sfa_assignments", updated, setAssignments)}
          onUpdateAttendance={(updated) => saveDatabaseState("sfa_attendance", updated, setAttendance)}
          onUpdateGraduations={(updated) => saveDatabaseState("sfa_graduations", updated, setGraduations)}
          onLogout={handleLogout}
        />
      )}

      {/* 7.6 MAF Administration and Finance panel */}
      {currentUser.role === "maf" && (
        <MafRouter 
          onLogout={handleLogout}
        />
      )}

      {/* Custom Global Alert Dialog (Intercepts all window.alert calls elegantly) */}
      {customAlert.show && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-105 max-w-sm w-full overflow-hidden transform scale-100 transition-all">
            <div className="p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-full bg-[#9F062A]/10 flex items-center justify-center text-[#9F062A] shrink-0">
                  <AlertCircle className="w-5 h-5" />
                </div>
                <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest">
                  Notificación Institucional
                </h3>
              </div>
              <p className="text-xs font-semibold text-slate-600 leading-relaxed whitespace-pre-line">
                {customAlert.message}
              </p>
            </div>
            <div className="bg-slate-50 px-6 py-4 flex justify-end border-t border-slate-100">
              <button
                onClick={() => setCustomAlert({ message: "", show: false })}
                className="px-5 py-2 rounded-xl bg-[#9F062A] hover:bg-[#820522] text-white text-[10px] font-bold uppercase tracking-widest transition-all active:scale-95 shadow-md shadow-[#9F062A]/20 cursor-pointer"
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
