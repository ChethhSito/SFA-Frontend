import { useState, useEffect } from "react";
import { INITIAL_ENROLLMENTS } from "../../data/mockData";
import {
  fetchEnrollments,
  createEnrollment as apiCreateEnrollment,
  updateEnrollment as apiUpdateEnrollment
} from "../../services/api";

export function useStudentEnrollment() {
  const [enrollments, setEnrollments] = useState<any[]>(() => {
    const savedEnrolls = localStorage.getItem("sfa_enrollments");
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
        return parsedEnrolls;
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem("sfa_enrollments", JSON.stringify(INITIAL_ENROLLMENTS));
    }
    return INITIAL_ENROLLMENTS;
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchEnrollments()
      .then((apiEnrolls) => {
        if (apiEnrolls && apiEnrolls.length > 0) {
          setEnrollments(apiEnrolls);
          localStorage.setItem("sfa_enrollments", JSON.stringify(apiEnrolls));
        }
      })
      .catch((err) => {
        console.error("Error fetching enrollments from REST API:", err);
        setError("Error al cargar matrículas.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateEnrollments = (updatedList: any[]) => {
    setEnrollments(updatedList);
    try {
      localStorage.setItem("sfa_enrollments", JSON.stringify(updatedList));
    } catch (e) {
      console.warn("[localStorage] Could not save sfa_enrollments:", e);
    }
  };

  const handleCreateEnrollment = async (newEnrollment: any) => {
    const created = await apiCreateEnrollment(newEnrollment);
    const itemToSave = created || newEnrollment;
    const exists = enrollments.some((e) => e.studentDni === itemToSave.studentDni);
    const nextList = exists
      ? enrollments.map((e) => (e.studentDni === itemToSave.studentDni ? itemToSave : e))
      : [...enrollments, itemToSave];
    handleUpdateEnrollments(nextList);
    return itemToSave;
  };

  const handleUpdateEnrollmentByDni = async (studentDni: string, data: any) => {
    await apiUpdateEnrollment(studentDni, data);
    const nextList = enrollments.map((e) => (e.studentDni === studentDni ? { ...e, ...data } : e));
    handleUpdateEnrollments(nextList);
  };

  return {
    enrollments,
    setEnrollments,
    enrollmentsLoading: loading,
    enrollmentsError: error,
    handleUpdateEnrollments,
    handleCreateEnrollment,
    handleUpdateEnrollmentByDni
  };
}
