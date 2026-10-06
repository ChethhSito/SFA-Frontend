import { useState, useEffect } from "react";
import { Graduation } from "../../types";
import {
  fetchGraduations,
  createGraduation as apiCreateGraduation,
  updateGraduation as apiUpdateGraduation
} from "../../services/api";

export function useGraduationsManager() {
  const [graduations, setGraduations] = useState<Graduation[]>(() => {
    const saved = localStorage.getItem("sfa_graduations");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error reading sfa_graduations:", e);
      }
    }
    return [];
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchGraduations()
      .then((apiGrads) => {
        if (!apiGrads) throw new Error("No se pudo consultar graduaciones");
        setGraduations(apiGrads);
        localStorage.setItem("sfa_graduations", JSON.stringify(apiGrads));
      })
      .catch((err) => {
        console.error("Error fetching graduations:", err);
        setError("Error al cargar graduaciones y egresados.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateGraduations = (updatedList: Graduation[]) => {
    setGraduations(updatedList);
    try {
      localStorage.setItem("sfa_graduations", JSON.stringify(updatedList));
    } catch (e) {
      console.warn("[localStorage] Could not save sfa_graduations:", e);
    }
  };

  const handleCreateGraduation = async (newGraduation: Partial<Graduation>) => {
    const created = await apiCreateGraduation(newGraduation);
    const itemToSave = created || (newGraduation as Graduation);
    const exists = graduations.some((g) => g.studentDni === itemToSave.studentDni);
    const nextList = exists
      ? graduations.map((g) => (g.studentDni === itemToSave.studentDni ? itemToSave : g))
      : [...graduations, itemToSave];
    handleUpdateGraduations(nextList);
    return itemToSave;
  };

  const handleUpdateGraduationByDni = async (studentDni: string, data: Partial<Graduation>) => {
    await apiUpdateGraduation(studentDni, data);
    const nextList = graduations.map((g) => (g.studentDni === studentDni ? { ...g, ...data } : g));
    handleUpdateGraduations(nextList);
  };

  return {
    graduations,
    setGraduations,
    graduationsLoading: loading,
    graduationsError: error,
    handleUpdateGraduations,
    handleCreateGraduation,
    handleUpdateGraduationByDni
  };
}
