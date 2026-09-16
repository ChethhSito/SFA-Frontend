import { useAuthSession } from "./auth/useAuthSession";
import { useAdmissionPeriods } from "./admin/useAdmissionPeriods";
import { useApplicantsManager } from "./admin/useApplicantsManager";
import { useStudentEnrollment } from "./alumno/useStudentEnrollment";
import { useStudentGrades } from "./alumno/useStudentGrades";
import { useTeacherClassroom } from "./docente/useTeacherClassroom";
import { useMaterialUpload } from "./docente/useMaterialUpload";
import { useUsersManager } from "./superadmin/useUsersManager";
import { useAcademicPlanning } from "./mpa/useAcademicPlanning";
import { useGraduationsManager } from "./mge/useGraduationsManager";
import { useFinanceManager } from "./maf/useFinanceManager";

export function useAppData() {
  const authSession = useAuthSession();
  const admissionPeriodsHook = useAdmissionPeriods();
  const enrollmentHook = useStudentEnrollment();
  const gradesHook = useStudentGrades();
  const classroomHook = useTeacherClassroom();
  const materialHook = useMaterialUpload();
  const applicantsHook = useApplicantsManager();
  const usersHook = useUsersManager();
  const mpaHook = useAcademicPlanning();
  const mgeHook = useGraduationsManager();
  const mafHook = useFinanceManager(enrollmentHook.enrollments, enrollmentHook.handleUpdateEnrollments);

  const handleUpdateApplicantsFromAdmin = async (updatedList: any[]) => {
    let currentEnrollments = [...enrollmentHook.enrollments];
    let currentStudentsData = { ...gradesHook.studentsData };
    let currentCycleStatuses = { ...gradesHook.cycleStatuses };
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
      enrollmentHook.handleUpdateEnrollments(currentEnrollments);
      gradesHook.handleUpdateStudentsData(currentStudentsData);
      gradesHook.setCycleStatuses(currentCycleStatuses);
    }

    await applicantsHook.handleUpdateApplicantsFromAdmin(updatedList);
  };

  return {
    // Auth & Session
    currentUser: authSession.currentUser,
    setCurrentUser: authSession.setCurrentUser,
    customAlert: authSession.customAlert,
    setCustomAlert: authSession.setCustomAlert,
    handleLogout: authSession.handleLogout,
    handleLoginSuccess: authSession.handleLoginSuccess,

    // Admin & Admissions
    admissionPeriods: admissionPeriodsHook.admissionPeriods,
    setAdmissionPeriods: admissionPeriodsHook.setAdmissionPeriods,
    handleUpdateAdmissionPeriods: admissionPeriodsHook.handleUpdateAdmissionPeriods,

    // Applicants & Pre-postulante / Admisión
    applicants: applicantsHook.applicants,
    setApplicants: applicantsHook.setApplicants,
    applicantsLoading: applicantsHook.loading,
    applicantsError: applicantsHook.error,
    handleUpdateApplicantsFromAdmin,
    handleCreateApplicant: applicantsHook.handleCreateApplicant,
    handleUpdateApplicantByDni: applicantsHook.handleUpdateApplicantByDni,
    handleDeleteApplicantByDni: applicantsHook.handleDeleteApplicantByDni,
    handleSendWelcomeEmail: applicantsHook.handleSendWelcomeEmail,

    // Enrollments
    enrollments: enrollmentHook.enrollments,
    setEnrollments: enrollmentHook.setEnrollments,
    enrollmentsLoading: enrollmentHook.enrollmentsLoading,
    enrollmentsError: enrollmentHook.enrollmentsError,
    handleUpdateEnrollments: enrollmentHook.handleUpdateEnrollments,
    handleCreateEnrollment: enrollmentHook.handleCreateEnrollment,
    handleUpdateEnrollmentByDni: enrollmentHook.handleUpdateEnrollmentByDni,

    // Students & Grades (MGE)
    studentsData: gradesHook.studentsData,
    setStudentsData: gradesHook.setStudentsData,
    cycleStatuses: gradesHook.cycleStatuses,
    setCycleStatuses: gradesHook.setCycleStatuses,
    graduations: mgeHook.graduations,
    setGraduations: mgeHook.setGraduations,
    graduationsLoading: mgeHook.graduationsLoading,
    graduationsError: mgeHook.graduationsError,
    handleUpdateStudentsData: gradesHook.handleUpdateStudentsData,
    handleUpdateGraduations: mgeHook.handleUpdateGraduations,
    handleCreateGraduation: mgeHook.handleCreateGraduation,
    handleUpdateGraduationByDni: mgeHook.handleUpdateGraduationByDni,

    // Academic Planning (MPA)
    courses: mpaHook.courses,
    setCourses: mpaHook.setCourses,
    coursesLoading: mpaHook.coursesLoading,
    coursesError: mpaHook.coursesError,
    handleUpdateCourses: mpaHook.handleUpdateCourses,
    handleCreateCourse: mpaHook.handleCreateCourse,
    handleUpdateCourseByCode: mpaHook.handleUpdateCourseByCode,

    // Classroom & Teachers (Docente)
    classrooms: classroomHook.classrooms,
    setClassrooms: classroomHook.setClassrooms,
    teachers: classroomHook.teachers,
    setTeachers: classroomHook.setTeachers,
    attendance: classroomHook.attendance,
    setAttendance: classroomHook.setAttendance,
    handleUpdateClassrooms: classroomHook.handleUpdateClassrooms,
    handleUpdateTeachers: classroomHook.handleUpdateTeachers,
    handleUpdateAttendance: classroomHook.handleUpdateAttendance,

    // Materials, Assignments & Evaluations
    materials: materialHook.materials,
    setMaterials: materialHook.setMaterials,
    assignments: materialHook.assignments,
    setAssignments: materialHook.setAssignments,
    evaluations: materialHook.evaluations,
    handleUpdateMaterials: materialHook.handleUpdateMaterials,
    handleUpdateAssignments: materialHook.handleUpdateAssignments,

    // SuperAdmin (Users Management)
    systemUsers: usersHook.users,
    setSystemUsers: usersHook.setUsers,
    usersLoading: usersHook.usersLoading,
    usersError: usersHook.usersError,
    handleCreateUser: usersHook.handleCreateUser,
    handleUpdateUser: usersHook.handleUpdateUser,
    handleDeleteUser: usersHook.handleDeleteUser,

    // MAF (Finance & Payments)
    financeTransactions: mafHook.transactions,
    handleRegisterPayment: mafHook.handleRegisterPayment,
    getTotalRevenue: mafHook.getTotalRevenue
  };
}
