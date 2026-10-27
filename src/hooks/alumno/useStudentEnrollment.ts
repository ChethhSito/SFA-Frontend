import { useState, useEffect } from "react";
import {
  fetchEnrollments,
  createEnrollment as apiCreateEnrollment,
  updateEnrollment as apiUpdateEnrollment
} from "../../services/api";

export function useStudentEnrollment() {
  const [enrollments, setEnrollments] = useState<any[]>([]);

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchEnrollments()
      .then((apiEnrolls) => {
        if (!apiEnrolls) throw new Error("No se pudo consultar matrículas");
        setEnrollments(apiEnrolls);
        localStorage.setItem("sfa_enrollments", JSON.stringify(apiEnrolls));
        if (apiEnrolls.length === 0) localStorage.removeItem("sfa_session_alumno");
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
    if (Array.isArray(updatedList)) {
      for (const enr of updatedList) {
        if (!enr.studentDni) continue;
        apiUpdateEnrollment(enr.studentDni, enr).catch(() => {
          apiCreateEnrollment(enr).catch((err) => console.warn("Could not sync enrollment to API:", err));
        });
      }
    }
  };

  const saveConfirmedEnrollment = (saved: any) => {
    setEnrollments((current) => {
      const next = current.some((e) => e.studentDni === saved.studentDni)
        ? current.map((e) => e.studentDni === saved.studentDni ? saved : e)
        : [...current, saved];
      try { localStorage.setItem("sfa_enrollments", JSON.stringify(next)); }
      catch (err) { console.warn("No se pudo guardar la caché de matrículas", err); }
      return next;
    });
    setError(null);
  };

  const handleCreateEnrollment = async (newEnrollment: any) => {
    const created = await apiCreateEnrollment(newEnrollment);
    if (!created) {
      setError("No se pudo crear la matrícula en el servidor.");
      return null;
    }
    saveConfirmedEnrollment(created);
    return created;
  };

  const handleUpdateEnrollmentByDni = async (studentDni: string, data: any) => {
    const saved = await apiUpdateEnrollment(studentDni, data);
    if (!saved) {
      setError("No se pudo actualizar la matrícula en el servidor.");
      return null;
    }
    saveConfirmedEnrollment(saved);
    return saved;
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
