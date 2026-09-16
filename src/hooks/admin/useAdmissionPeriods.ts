import { useState, useEffect } from "react";
import { AdmissionPeriod } from "../../types";
import { fetchAdmissionPeriods } from "../../services/api";

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

export function useAdmissionPeriods() {
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

  const handleUpdateAdmissionPeriods = (updatedList: AdmissionPeriod[]) => {
    setAdmissionPeriods(updatedList);
    try {
      localStorage.setItem("sfa_admission_periods", JSON.stringify(updatedList));
    } catch (e) {
      console.error(e);
    }
  };

  return {
    admissionPeriods,
    setAdmissionPeriods,
    handleUpdateAdmissionPeriods
  };
}
