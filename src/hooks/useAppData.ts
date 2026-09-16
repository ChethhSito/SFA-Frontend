import { useState, useEffect } from "react";
import { Role, AdmissionPeriod } from "../types";
import { isFirebaseEnabled, db } from "../firebase/config";
import { saveDocumentGeneric } from "../firebase/firestore";
import { collection, onSnapshot } from "firebase/firestore";
import {
  fetchApplicants,
  fetchEnrollments,
  fetchAdmissionPeriods,
  fetchCourses,
  fetchTeachers,
  fetchGraduations
} from "../services/api";

import {
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
} from "../data/mockData";

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

export function useAppData() {
  // Navigation / Auth State
  const [currentUser, setCurrentUser] = useState<{ role: Role; identifier: string }>(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path === "/ingresar" || path === "/login" || window.location.search.includes("login")) {
        return { role: "login", identifier: "" };
      }
    }
    const roles: Role[] = ["superadmin", "administrador", "postulante", "alumno", "docente", "mpa", "mge", "maf"];
    for (const r of roles) {
      const saved = localStorage.getItem(`sfa_session_${r}`);
      if (saved) {
        return { role: r, identifier: saved };
      }
    }
    return { role: "portal", identifier: "" };
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

  // Database State Blocks
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

  // Default fallback admission periods
  const DEFAULT_ADMISSION_PERIODS: AdmissionPeriod[] = [
    {
      id: "1",
      academicPeriodId: "p1",
      name: "Periodo Académico 2026-I",
      status: "APERTURADO",
      isActive: true,
      preEnrollmentStartDate: "2026-02-01",
      preEnrollmentEndDate: "2026-12-31",
      admissionDate: "2026-03-22",
      enrollmentStartDate: "2026-03-24",
      enrollmentEndDate: "2026-03-29",
      classesStartDate: "2026-04-06"
    },
    {
      id: "2",
      academicPeriodId: "p2",
      name: "Periodo Académico 2026-II",
      status: "PENDIENTE",
      isActive: false,
      preEnrollmentStartDate: "2026-07-01",
      preEnrollmentEndDate: "2026-08-14",
      admissionDate: "2026-08-16",
      enrollmentStartDate: "2026-08-18",
      enrollmentEndDate: "2026-08-23",
      classesStartDate: "2026-09-01"
    }
  ];

  const [admissionPeriods, setAdmissionPeriods] = useState<AdmissionPeriod[]>(() => {
    const saved = localStorage.getItem("sfa_admission_periods");
    try {
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((p: any) => ({
            ...p,
            name: (p.name || "").replace(/Acad[\uFFFD\?a-zA-Z]*mico/gi, "Académico").replace(/Acadmico/gi, "Académico")
          }));
        }
      }
    } catch (e) {
      console.error("Error reading sfa_admission_periods:", e);
    }
    return DEFAULT_ADMISSION_PERIODS;
  });

  useEffect(() => {
    try {
      localStorage.setItem("sfa_admission_periods", JSON.stringify(admissionPeriods));
    } catch (e) {
      console.error(e);
    }
  }, [admissionPeriods]);

  useEffect(() => {
    fetchAdmissionPeriods().then((apiPeriods) => {
      if (apiPeriods && apiPeriods.length > 0) {
        setAdmissionPeriods(apiPeriods);
      }
    }).catch(err => console.error("Error fetching REST API admission periods:", err));
  }, []);

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

    async function loadBackendData() {
      const isPublic = currentUser.role === "portal" || currentUser.role === "login";
      
      const backendPeriods = await fetchAdmissionPeriods();
      if (backendPeriods && Array.isArray(backendPeriods) && backendPeriods.length > 0) {
        setAdmissionPeriods(backendPeriods);
        localStorage.setItem("sfa_admission_periods", JSON.stringify(backendPeriods));
      }

      if (isPublic) return;

      const backendApplicants = await fetchApplicants();
      if (backendApplicants && Array.isArray(backendApplicants) && backendApplicants.length > 0) {
        setApplicants(backendApplicants);
        localStorage.setItem("sfa_applicants", JSON.stringify(backendApplicants));
      }

      const backendEnrollments = await fetchEnrollments();
      if (backendEnrollments && Array.isArray(backendEnrollments) && backendEnrollments.length > 0) {
        setEnrollments(backendEnrollments);
        localStorage.setItem("sfa_enrollments", JSON.stringify(backendEnrollments));
      }

      const backendCourses = await fetchCourses();
      if (backendCourses && Array.isArray(backendCourses) && backendCourses.length > 0) {
        setCourses(backendCourses);
        localStorage.setItem("sfa_courses", JSON.stringify(backendCourses));
      }

      const backendTeachers = await fetchTeachers();
      if (backendTeachers && Array.isArray(backendTeachers) && backendTeachers.length > 0) {
        setTeachers(backendTeachers);
        localStorage.setItem("sfa_teachers", JSON.stringify(backendTeachers));
      }

      const backendGraduations = await fetchGraduations();
      if (backendGraduations && Array.isArray(backendGraduations) && backendGraduations.length > 0) {
        setGraduations(backendGraduations);
        localStorage.setItem("sfa_graduations", JSON.stringify(backendGraduations));
      }
    }

    loadBackendData();

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

  const stripFileDataUrls = (applicantsList: any[]): any[] => {
    return applicantsList.map((app) => {
      if (!app.docs) return app;
      const strippedDocs: any = {};
      for (const [key, val] of Object.entries(app.docs)) {
        const doc = val as any;
        strippedDocs[key] = { ...doc, fileDataUrl: undefined };
      }
      return { ...app, docs: strippedDocs };
    });
  };

  const saveDatabaseState = (
    key: string,
    value: any,
    setter: React.Dispatch<React.SetStateAction<any>>
  ) => {
    setter(value);
    try {
      const toSave = key === "sfa_applicants" && Array.isArray(value)
        ? stripFileDataUrls(value)
        : value;
      localStorage.setItem(key, JSON.stringify(toSave));
    } catch (e) {
      console.warn(`[localStorage] Could not save ${key} — quota likely exceeded:`, e);
    }
  };

  const handleUpdateApplicantsFromAdmin = async (updatedList: any[]) => {
    saveDatabaseState("sfa_applicants", updatedList, setApplicants);

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

  const handleUpdateEnrollments = (updatedList: any[]) => {
    saveDatabaseState("sfa_enrollments", updatedList, setEnrollments);
  };

  const handleUpdateStudentsData = (updatedMap: any) => {
    saveDatabaseState("sfa_students", updatedMap, setStudentsData);
  };

  const handleUpdateClassrooms = (updatedList: any[]) => {
    saveDatabaseState("sfa_classrooms", updatedList, setClassrooms);
  };

  const handleUpdateTeachers = (updatedList: any[]) => {
    saveDatabaseState("sfa_teachers", updatedList, setTeachers);
  };

  const handleUpdateCourses = (updatedList: any[]) => {
    saveDatabaseState("sfa_courses", updatedList, setCourses);
  };

  const handleUpdateMaterials = (updatedList: any[]) => {
    saveDatabaseState("sfa_materials", updatedList, setMaterials);
  };

  const handleUpdateAssignments = (updatedList: any[]) => {
    saveDatabaseState("sfa_assignments", updatedList, setAssignments);
  };

  const handleUpdateAttendance = (updatedList: any[]) => {
    saveDatabaseState("sfa_attendance", updatedList, setAttendance);
  };

  const handleUpdateGraduations = (updatedList: any[]) => {
    saveDatabaseState("sfa_graduations", updatedList, setGraduations);
  };

  const handleUpdateAdmissionPeriods = (updatedList: AdmissionPeriod[]) => {
    setAdmissionPeriods(updatedList);
    try {
      localStorage.setItem("sfa_admission_periods", JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogout = () => {
    const roles: Role[] = ["superadmin", "administrador", "postulante", "alumno", "docente", "mpa", "mge", "maf"];
    roles.forEach(r => localStorage.removeItem(`sfa_session_${r}`));
    setCurrentUser({ role: "portal", identifier: "" });
  };

  const handleLoginSuccess = (role: Role, identifier: string) => {
    localStorage.setItem(`sfa_session_${role}`, identifier);
    setCurrentUser({ role, identifier });
  };

  return {
    currentUser,
    setCurrentUser,
    customAlert,
    setCustomAlert,
    applicants,
    setApplicants,
    enrollments,
    setEnrollments,
    studentsData,
    setStudentsData,
    classrooms,
    setClassrooms,
    teachers,
    setTeachers,
    courses,
    setCourses,
    materials,
    setMaterials,
    assignments,
    setAssignments,
    evaluations,
    attendance,
    setAttendance,
    cycleStatuses,
    setCycleStatuses,
    graduations,
    setGraduations,
    admissionPeriods,
    setAdmissionPeriods,
    handleUpdateApplicantsFromAdmin,
    handleUpdateEnrollments,
    handleUpdateStudentsData,
    handleUpdateClassrooms,
    handleUpdateTeachers,
    handleUpdateCourses,
    handleUpdateMaterials,
    handleUpdateAssignments,
    handleUpdateAttendance,
    handleUpdateGraduations,
    handleUpdateAdmissionPeriods,
    handleLogout,
    handleLoginSuccess
  };
}
