import { useState, useEffect, useCallback } from "react";
import { AdmissionPeriod } from "../../types";
import { fetchAdmissionPeriods } from "../../services/api";

export function useAdmissionPeriods() {
  const [admissionPeriods, setAdmissionPeriods] = useState<AdmissionPeriod[]>([]);

  const reloadAdmissionPeriods = useCallback(() => {
    return fetchAdmissionPeriods().then((apiPeriods) => {
      if (apiPeriods) {
        const sanitized = apiPeriods.map((p: any) => ({
          ...p,
          name: (p.name || "")
            .replace(/\uFFFD/g, "é")
            .replace(/Acad[\uFFFD\?a-zA-Z]*mico/gi, "Académico")
            .replace(/Acadmico/gi, "Académico")
        }));
        setAdmissionPeriods(sanitized);
      }
    }).catch(err => console.error("Error fetching REST API admission periods:", err));
  }, []);

  useEffect(() => {
    void reloadAdmissionPeriods();
    const onFocus = () => void reloadAdmissionPeriods();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [reloadAdmissionPeriods]);

  const handleUpdateAdmissionPeriods = (updatedList: AdmissionPeriod[]) => {
    const sanitized = updatedList.map((p: any) => ({
      ...p,
      name: (p.name || "")
        .replace(/\uFFFD/g, "é")
        .replace(/Acad[\uFFFD\?a-zA-Z]*mico/gi, "Académico")
        .replace(/Acadmico/gi, "Académico")
    }));
    setAdmissionPeriods(sanitized);
  };

  return {
    admissionPeriods,
    setAdmissionPeriods,
    handleUpdateAdmissionPeriods,
    reloadAdmissionPeriods
  };
}
