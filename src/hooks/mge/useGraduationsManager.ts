import { useState, useEffect } from "react";
import { Graduation } from "../../types";
import {
  fetchGraduations,
  createGraduation as apiCreateGraduation,
  updateGraduation as apiUpdateGraduation
} from "../../services/api";

export function useGraduationsManager() {
  const [graduations, setGraduations] = useState<Graduation[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const reloadGraduations = async () => {
    setLoading(true);
    setError(null);
    try {
      const rows = await fetchGraduations();
      if (!Array.isArray(rows)) throw new Error("No se pudo consultar graduaciones");
      setGraduations(rows);
      try { localStorage.setItem("sfa_graduations", JSON.stringify(rows)); } catch { /* Optional cache. */ }
      return true;
    } catch {
      setError("No se pudieron cargar los expedientes. Se necesita una sesión Firebase válida.");
      return false;
    } finally { setLoading(false); }
  };
  useEffect(() => { void reloadGraduations(); }, []);

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
    if (!created) return null;
    const itemToSave = created;
    const exists = graduations.some((g) => g.studentDni === itemToSave.studentDni);
    const nextList = exists
      ? graduations.map((g) => (g.studentDni === itemToSave.studentDni ? itemToSave : g))
      : [...graduations, itemToSave];
    handleUpdateGraduations(nextList);
    return itemToSave;
  };

  const handleUpdateGraduationByDni = async (studentDni: string, data: Partial<Graduation>) => {
    const saved = await apiUpdateGraduation(studentDni, data);
    if (!saved) return null;
    const nextList = graduations.map((g) => (g.studentDni === studentDni ? saved : g));
    handleUpdateGraduations(nextList);
    return saved;
  };

  return {
    graduations,
    setGraduations,
    graduationsLoading: loading,
    graduationsError: error,
    reloadGraduations,
    handleUpdateGraduations,
    handleCreateGraduation,
    handleUpdateGraduationByDni
  };
}
