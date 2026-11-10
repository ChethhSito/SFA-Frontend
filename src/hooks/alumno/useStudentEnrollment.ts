import { useState, useEffect, useRef } from "react";
import {
  fetchEnrollments,
  createEnrollment as apiCreateEnrollment,
  updateEnrollment as apiUpdateEnrollment
} from "../../services/api";

function normalizeEnrollmentList(list: any[]): any[] {
  return (list || []).map((enr) => {
    const hasRealPaymentEvidence = Boolean(
      enr.paymentOperation ||
      enr.paymentVoucherUrl ||
      enr.paymentVoucherFileName
    );
    if (
      enr.academicStatus !== "MATRICULADO" &&
      enr.paymentStatus === "Validado" &&
      !hasRealPaymentEvidence
    ) {
      return {
        ...enr,
        paymentStatus: "No Pagado",
      };
    }
    return enr;
  });
}

export function useStudentEnrollment() {
  const [enrollments, setEnrollments] = useState<any[]>([]);
  const enrollmentsRef = useRef<any[]>([]);
  enrollmentsRef.current = enrollments;

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const reloadEnrollments = () => {
    setLoading(true);
    return fetchEnrollments()
      .then((apiEnrolls) => {
        if (!apiEnrolls) throw new Error("No se pudo consultar matrículas");
        const normalized = normalizeEnrollmentList(apiEnrolls);
        setEnrollments(normalized);
        enrollmentsRef.current = normalized;
        try {
          localStorage.setItem("sfa_enrollments", JSON.stringify(normalized));
        } catch (e) {}
        if (normalized.length === 0 && typeof localStorage.removeItem === "function") {
          localStorage.removeItem("sfa_session_alumno");
        }
      })
      .catch((err) => {
        console.error("Error fetching enrollments from REST API:", err);
        setError("Error al cargar matrículas.");
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    void reloadEnrollments();
  }, []);

  const handleUpdateEnrollments = (updatedList: any[]) => {
    const normalized = normalizeEnrollmentList(updatedList);
    const prevByDni = new Map(enrollmentsRef.current.map((e) => [e.studentDni, e]));
    setEnrollments(normalized);
    enrollmentsRef.current = normalized;
    try {
      localStorage.setItem("sfa_enrollments", JSON.stringify(normalized));
    } catch (e) {
      console.warn("[localStorage] Could not save sfa_enrollments:", e);
    }
    if (Array.isArray(normalized)) {
      for (const enr of normalized) {
        if (!enr.studentDni) continue;
        const prev = prevByDni.get(enr.studentDni);
        if (prev && JSON.stringify(prev) === JSON.stringify(enr)) continue;
        apiUpdateEnrollment(enr.studentDni, enr)
          .then((res) => {
            if (!res) {
              return apiCreateEnrollment(enr);
            }
            return res;
          })
          .catch((err) => console.warn("Could not sync enrollment to API:", err));
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
    reloadEnrollments,
    handleUpdateEnrollments,
    handleCreateEnrollment,
    handleUpdateEnrollmentByDni
  };
}
