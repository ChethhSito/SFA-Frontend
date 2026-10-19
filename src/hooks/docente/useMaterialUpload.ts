import { useState, useEffect, useRef } from "react";
import { 
  fetchCourseMaterials, 
  uploadCourseMaterial, 
  fetchCourseAssignments, 
  createCourseAssignment,
  updateCourseAssignment,
  deleteCourseAssignment
} from "../../services/api";

export function useMaterialUpload() {
  const [materials, setMaterials] = useState<any[]>(() => {
    const saved = localStorage.getItem("sfa_materials");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  const [assignments, setAssignments] = useState<any[]>([]);
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null);
  const syncingAssignments = useRef(false);

  const [evaluations] = useState<any[]>([]);

  useEffect(() => {
    fetchCourseMaterials()
      .then((apiMats) => {
        if (apiMats && Array.isArray(apiMats) && apiMats.length > 0) {
          setMaterials(apiMats);
          localStorage.setItem("sfa_materials", JSON.stringify(apiMats));
        }
      })
      .catch((err) => console.warn("Error fetching materials API:", err));

    fetchCourseAssignments()
      .then((apiAsgs) => {
        if (!Array.isArray(apiAsgs)) throw new Error("No se pudieron consultar las calificaciones.");
        if (apiAsgs && Array.isArray(apiAsgs)) {
          setAssignments(apiAsgs);
          localStorage.setItem("sfa_assignments", JSON.stringify(apiAsgs));
        }
      })
      .catch((err) => { console.warn("Error fetching assignments API:", err); setAssignmentsError("No se pudieron cargar las evaluaciones y calificaciones. Recargue para reintentar."); })
      .finally(() => setAssignmentsLoading(false));
  }, []);

  const handleUpdateMaterials = async (updatedList: any[]) => {
    setMaterials(updatedList);
    try {
      localStorage.setItem("sfa_materials", JSON.stringify(updatedList));
    } catch (e) {
      console.warn("[localStorage] Could not save sfa_materials:", e);
    }
    const latestItem = updatedList[updatedList.length - 1];
    if (latestItem) {
      try {
        await uploadCourseMaterial(latestItem);
      } catch (err) {
        console.warn("[API Error] Could not save material to DB:", err);
      }
    }
  };

  const handleUpdateAssignments = async (updatedList: any[]): Promise<boolean> => {
    if (syncingAssignments.current) return false;
    syncingAssignments.current = true;
    let confirmed = [...assignments];
    const keep = (list: any[]) => {
      setAssignments(list);
      try { localStorage.setItem("sfa_assignments", JSON.stringify(list)); }
      catch (err) { console.warn("No se pudo guardar la caché de evaluaciones", err); }
    };
    try {
      // Persist every changed evaluation, not just the last item in the list.
      for (const item of updatedList) {
        const previous = assignments.find((current) => current.id === item.id);
        if (previous && JSON.stringify(previous) === JSON.stringify(item)) continue;
        const response = previous
          ? await updateCourseAssignment(previous.id, { submissions: item.submissions })
          : await createCourseAssignment(item);
        if (!response) throw new Error("No se pudo guardar la evaluación.");
        const saved = { ...response, id: response._id || response.id };
        confirmed = previous
          ? confirmed.map((current) => current.id === previous.id ? saved : current)
          : [...confirmed, saved];
        keep(confirmed);
      }
      for (const previous of assignments) {
        if (updatedList.some((current) => current.id === previous.id)) continue;
        const deleted = await deleteCourseAssignment(previous.id);
        if (!deleted?.success) throw new Error("No se pudo eliminar la evaluación.");
        confirmed = confirmed.filter((current) => current.id !== previous.id);
        keep(confirmed);
      }
      return true;
    } catch (err) {
      console.error("No se pudieron guardar todas las evaluaciones", err);
      return false;
    } finally { syncingAssignments.current = false; }
  };

  return {
    assignmentsLoading,
    assignmentsError,
    materials,
    setMaterials,
    assignments,
    setAssignments,
    evaluations,
    handleUpdateMaterials,
    handleUpdateAssignments
  };
}
