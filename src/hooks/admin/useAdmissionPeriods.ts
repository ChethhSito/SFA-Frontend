import { useState, useEffect } from "react";
import { AdmissionPeriod } from "../../types";
import { fetchAdmissionPeriods } from "../../services/api";

export function useAdmissionPeriods() {
  const [admissionPeriods, setAdmissionPeriods] = useState<AdmissionPeriod[]>([]);

  useEffect(() => {
    fetchAdmissionPeriods().then((apiPeriods) => {
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
    handleUpdateAdmissionPeriods
  };
}
