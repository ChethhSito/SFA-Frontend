import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { AdmissionPeriod, Applicant } from "../../types";
import { fetchAdmissionPeriods } from "../../services/api";

/**
 * Período de admisión real del postulante, resuelto desde MongoDB (/admission-periods)
 * a partir de applicant.periodId. Reemplaza los años "2026" que estaban fijos en el portal.
 */
export interface ApplicantPeriodInfo {
  period: AdmissionPeriod | null;
  /** Ej. "2027-I" */
  label: string;
  /** Ej. "2027" */
  year: string;
  loading: boolean;
}

const MONTHS = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
const DAYS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export function extractPeriodLabel(...sources: Array<string | undefined>): string | null {
  for (const src of sources) {
    const m = (src || "").match(/(20\d{2})\s*-\s*(II|I|1|2)\b/i);
    if (m) {
      const term = m[2].toUpperCase() === "2" || m[2].toUpperCase() === "II" ? "II" : "I";
      return `${m[1]}-${term}`;
    }
  }
  return null;
}

/** "2027-03-06" -> "Sábado, 6 de Marzo de 2027" (sin desfase de zona horaria). */
export function formatLongDate(iso?: string): string {
  if (!iso) return "Por programar";
  const [y, m, d] = iso.slice(0, 10).split("-").map(Number);
  if (!y || !m || !d) return iso;
  const date = new Date(y, m - 1, d);
  return `${DAYS[date.getDay()]}, ${d} de ${MONTHS[m - 1]} de ${y}`;
}

/** Rango "Lunes 9 al Viernes 19 de Marzo, 2027". */
export function formatDateRange(startIso?: string, endIso?: string): string {
  if (!startIso || !endIso) return "Por programar";
  const [y1, m1, d1] = startIso.slice(0, 10).split("-").map(Number);
  const [y2, m2, d2] = endIso.slice(0, 10).split("-").map(Number);
  const s = new Date(y1, m1 - 1, d1);
  const e = new Date(y2, m2 - 1, d2);
  const startPart = m1 === m2 && y1 === y2 ? `${DAYS[s.getDay()]} ${d1}` : `${DAYS[s.getDay()]} ${d1} de ${MONTHS[m1 - 1]}`;
  return `${startPart} al ${DAYS[e.getDay()]} ${d2} de ${MONTHS[m2 - 1]}, ${y2}`;
}

const ApplicantPeriodContext = createContext<ApplicantPeriodInfo | null>(null);

export function ApplicantPeriodProvider({ applicant, children }: { applicant: Applicant; children: React.ReactNode }) {
  const [periods, setPeriods] = useState<AdmissionPeriod[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const list = await fetchAdmissionPeriods();
      if (!cancelled && list) setPeriods(list);
      if (!cancelled) setLoading(false);
    };
    void load();
    // Re-sincroniza al volver a la pestaña para reflejar cambios hechos por MAMC.
    const onFocus = () => void load();
    window.addEventListener("focus", onFocus);
    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, [applicant.periodId]);

  const value = useMemo<ApplicantPeriodInfo>(() => {
    const period = periods.find((p) => p.id === applicant.periodId) || null;
    const codeYear = /^20\d{2}/.test(applicant.applicantCode || "") ? applicant.applicantCode!.slice(0, 4) : "";
    const label =
      extractPeriodLabel(period?.name, period?.academicPeriodId, applicant.periodId) ||
      (codeYear ? `${codeYear}-I` : "");
    const year = label ? label.slice(0, 4) : codeYear;
    return { period, label, year, loading };
  }, [periods, applicant.periodId, applicant.applicantCode, loading]);

  return <ApplicantPeriodContext.Provider value={value}>{children}</ApplicantPeriodContext.Provider>;
}

export function useApplicantPeriod(): ApplicantPeriodInfo {
  return useContext(ApplicantPeriodContext) || { period: null, label: "", year: "", loading: false };
}

