import { useState, useEffect, useRef, useCallback } from "react";
import {
  fetchEnrollments,
  fetchEnrollmentByDni,
  createEnrollment as apiCreateEnrollment,
  updateEnrollment as apiUpdateEnrollment
} from "../../services/api";

function normalizeEnrollmentList(list: any[]): any[] {
  return (list || []).map((enr) => {
    const hasRealPaymentEvidence = Boolean(
      enr.paymentOperation ||
      enr.paymentVoucherUrl ||
      enr.hasPaymentVoucher ||
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

  const hydrationRunRef = useRef(0);
  const lastLocalWriteRef = useRef<number>(0);

  /** El listado no trae el voucher en base64: se descarga en segundo plano, de a 3, sin bloquear la pantalla. */
  const hydrateVouchers = useCallback(async (list: any[]) => {
    const run = ++hydrationRunRef.current;
    const targets = list.filter((e) => e.hasPaymentVoucher && !e.paymentVoucherUrl);
    for (let i = 0; i < targets.length; i += 3) {
      const chunk = targets.slice(i, i + 3);
      const fulls = await Promise.all(chunk.map((e) => fetchEnrollmentByDni(e.studentDni).catch(() => null)));
      if (run !== hydrationRunRef.current) return;
      setEnrollments((prev) => {
        const next = prev.map((p) => {
          const idx = chunk.findIndex((c) => c.studentDni === p.studentDni);
          const full: any = idx >= 0 ? fulls[idx] : null;
          return full?.paymentVoucherUrl && !p.paymentVoucherUrl ? { ...p, paymentVoucherUrl: full.paymentVoucherUrl } : p;
        });
        enrollmentsRef.current = next;
        return next;
      });
    }
  }, []);

  const reloadEnrollments = useCallback((silent = false) => {
    if (silent && Date.now() - lastLocalWriteRef.current < 5000) {
      return Promise.resolve();
    }
    const fetchStartedAt = Date.now();
    if (!silent) setLoading(true);
    return fetchEnrollments()
      .then((apiEnrolls) => {
        if (!apiEnrolls) throw new Error("No se pudo consultar matrículas");
        if (silent && lastLocalWriteRef.current >= fetchStartedAt) return;
        const prevByDni = new Map(enrollmentsRef.current.map((e) => [e.studentDni, e]));
        const withVouchers = apiEnrolls.map((enr: any) => {
          const prev: any = prevByDni.get(enr.studentDni);
          return enr.hasPaymentVoucher && !enr.paymentVoucherUrl && prev?.paymentVoucherUrl
            ? { ...enr, paymentVoucherUrl: prev.paymentVoucherUrl }
            : enr;
        });
        const normalized = normalizeEnrollmentList(withVouchers);
        setEnrollments(normalized);
        enrollmentsRef.current = normalized;
        void hydrateVouchers(normalized);
        try {
          localStorage.setItem("sfa_enrollments", JSON.stringify(normalized.map(({ paymentVoucherUrl, ...rest }: any) => rest)));
        } catch (e) {}
        if (normalized.length === 0 && typeof localStorage.removeItem === "function") {
          localStorage.removeItem("sfa_session_alumno");
        }
      })
      .catch((err) => {
        console.error("Error fetching enrollments from REST API:", err);
        setError("Error al cargar matrículas.");
      })
      .finally(() => {
        if (!silent) setLoading(false);
      });
  }, [hydrateVouchers]);

  useEffect(() => {
    void reloadEnrollments(false);
    let lastFocusSync = Date.now();
    const handleFocusSync = () => {
      if (document.visibilityState === "hidden") return;
      const now = Date.now();
      if (now - lastFocusSync < 1000) return;
      lastFocusSync = now;
      void reloadEnrollments(true);
    };
    const pollInterval = window.setInterval(() => {
      if (document.visibilityState !== "visible") return;
      void reloadEnrollments(true);
    }, 4000);
    window.addEventListener("focus", handleFocusSync);
    document.addEventListener("visibilitychange", handleFocusSync);
    return () => {
      window.clearInterval(pollInterval);
      window.removeEventListener("focus", handleFocusSync);
      document.removeEventListener("visibilitychange", handleFocusSync);
    };
  }, [reloadEnrollments]);

  const handleUpdateEnrollments = (updatedList: any[]) => {
    lastLocalWriteRef.current = Date.now();
    const normalized = normalizeEnrollmentList(updatedList);
    const prevByDni = new Map(enrollmentsRef.current.map((e) => [e.studentDni, e]));
    setEnrollments(normalized);
    enrollmentsRef.current = normalized;
    try {
      localStorage.setItem("sfa_enrollments", JSON.stringify(normalized.map(({ paymentVoucherUrl, ...rest }: any) => rest)));
      window.dispatchEvent(new Event("sfa_sync_event"));
    } catch (e) {
      console.warn("[localStorage] Could not save sfa_enrollments:", e);
    }
    if (Array.isArray(normalized)) {
      for (const enr of normalized) {
        if (!enr.studentDni) continue;
        const prev = prevByDni.get(enr.studentDni);
        if (prev && JSON.stringify(prev) === JSON.stringify(enr)) continue;
        const { hasPaymentVoucher, ...enrPayload } = enr;
        apiUpdateEnrollment(enr.studentDni, enrPayload)
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
      try { localStorage.setItem("sfa_enrollments", JSON.stringify(next.map(({ paymentVoucherUrl, ...rest }: any) => rest))); }
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
