/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { AlertCircle } from "lucide-react";
import { useAppData } from "./hooks/useAppData";
import { PortalHome, LoginPortal } from "./components/portal";
import { NotFoundPage } from "./components/ui";
import AdminRouter from "./components/routers/AdminRouter";
import SuperAdminRouter from "./components/routers/SuperAdminRouter";
import MpaRouter from "./components/routers/MpaRouter";
import MgeRouter from "./components/routers/MgeRouter";
import MafRouter from "./components/routers/MafRouter";
import PostulanteRouter from "./components/routers/PostulanteRouter";
import AlumnoRouter from "./components/routers/AlumnoRouter";
import DocenteRouter from "./components/routers/DocenteRouter";
import SFABot from "./components/bot/SFABot";

export default function App() {
  const {
    currentUser,
    setCurrentUser,
    customAlert,
    setCustomAlert,
    applicants,
    enrollments,
    studentsData,
    classrooms,
    teachers,
    courses,
    materials,
    assignments,
    evaluations,
    attendance,
    cycleStatuses,
    setCycleStatuses,
    graduations,
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
    handleLogout,
    handleLoginSuccess
  } = useAppData();

  const handleEnterIntranet = () => {
    const roles = ["superadmin", "administrador", "postulante", "alumno", "docente", "mpa", "mge", "maf"];
    for (const r of roles) {
      const s = localStorage.getItem(`sfa_session_${r}`);
      if (s) {
        setCurrentUser({ role: r as any, identifier: s });
        return;
      }
    }
    setCurrentUser({ role: "login", identifier: "" });
  };

  const handleGoPortal = () => {
    setCurrentUser({ role: "portal", identifier: "" });
  };

  const handleUpdateApplicant = (updated: any) => {

    const exists = applicants.some((a) => a.dni === updated.dni);
    const nextList = exists 
      ? applicants.map((a) => (a.dni === updated.dni ? updated : a))
      : [...applicants, updated];

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
        handleUpdateEnrollments([...enrollments, newEnrollmentRow]);

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
        handleUpdateStudentsData({ ...studentsData, [updated.dni]: newStudentPersonal });

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
        setCycleStatuses({ ...cycleStatuses, [updated.dni]: newCycleStatus });
      }
    }

    handleUpdateApplicantsFromAdmin(nextList);
  };

  const handleUpdateEnrollment = (enr: any) => {
    const exists = enrollments.some((item) => item.studentDni === enr.studentDni);
    const nextList = exists 
      ? enrollments.map((item) => (item.studentDni === enr.studentDni ? enr : item))
      : [...enrollments, enr];
    handleUpdateEnrollments(nextList);
  };

  const handleUpdatePersonalData = (studentDni: string, details: any) => {
    handleUpdateStudentsData({ ...studentsData, [studentDni]: details });
  };

  return (
    <div id="root-viewport" className="min-h-screen bg-slate-100 selection:bg-[#9F062A] selection:text-white">
      {/* 1. Portal Public view */}
      {currentUser.role === "portal" && (
        <PortalHome 
          onEnterIntranet={handleEnterIntranet} 
          onLogout={handleLogout}
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
          onGoToPortal={handleGoPortal}
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
          onUpdateAssignments={handleUpdateAssignments}
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
          onUpdateMaterials={handleUpdateMaterials}
          onUpdateAssignments={handleUpdateAssignments}
          onUpdateAttendance={handleUpdateAttendance}
          onLogout={handleLogout}
        />
      )}

      {/* 5.5 SuperAdmin System Administration panel */}
      {currentUser.role === "superadmin" && (
        <SuperAdminRouter 
          onLogout={handleLogout}
          onSwitchRole={handleLoginSuccess}
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
          onUpdateEnrollments={handleUpdateEnrollments}
          onUpdateClassrooms={handleUpdateClassrooms}
          onUpdateTeachers={handleUpdateTeachers}
          onUpdateGraduations={handleUpdateGraduations}
          onUpdateAdmissionPeriods={setAdmissionPeriods}
          onUpdateStudentsList={handleUpdateStudentsData}
          onUpdateCourses={handleUpdateCourses}
          onUpdateAssignments={handleUpdateAssignments}
          onUpdateAttendance={handleUpdateAttendance}
          onLogout={handleLogout}
          onGoToPortal={() => setCurrentUser({ role: "portal", identifier: "" })}
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
          onUpdateEnrollments={handleUpdateEnrollments}
          onUpdateStudentsList={handleUpdateStudentsData}
          onUpdateCourses={handleUpdateCourses}
          onUpdateAssignments={handleUpdateAssignments}
          onUpdateAttendance={handleUpdateAttendance}
          onUpdateGraduations={handleUpdateGraduations}
          onLogout={handleLogout}
        />
      )}

      {/* 7.6 MAF Administration and Finance panel */}
      {currentUser.role === "maf" && (
        <MafRouter 
          onLogout={handleLogout}
        />
      )}

      {/* 8. Fallback 404 NOT FOUND Screen */}
      {!["portal", "login", "postulante", "alumno", "docente", "superadmin", "administrador", "mpa", "mge", "maf"].includes(currentUser.role) && (
        <NotFoundPage onGoToPortal={() => setCurrentUser({ role: "portal", identifier: "" })} />
      )}

      {/* Custom Global Alert Dialog */}
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

      {/* Floating Virtual Assistant SFABot */}
      <SFABot />
    </div>
  );
}
