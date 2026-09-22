import { useState, useEffect } from "react";
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
        return JSON.parse(savedEnrolls);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchEnrollments()
      .then((apiEnrolls) => {
        if (!apiEnrolls) throw new Error("No se pudo consultar matrículas");
        setEnrollments(apiEnrolls);
        localStorage.setItem("sfa_enrollments", JSON.stringify(apiEnrolls));
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
