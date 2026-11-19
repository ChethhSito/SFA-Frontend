import { useState, useEffect, useRef } from "react";
import { 
  fetchCourseMaterials, 
  uploadCourseMaterial, 
  deleteCourseMaterial,
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

  const refreshAssignments = async () => {
    try {
      const apiAsgs = await fetchCourseAssignments();
      if (Array.isArray(apiAsgs)) {
        setAssignments(apiAsgs);
        localStorage.setItem("sfa_assignments", JSON.stringify(apiAsgs));
      }
    } catch (err) {
      console.warn("Error refreshing assignments:", err);
    }
  };

  useEffect(() => {
    fetchCourseMaterials()
      .then((apiMats) => {
        if (Array.isArray(apiMats)) {
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

    // Real-time synchronization across tabs and on window focus (no manual F5 needed)
    let channel: BroadcastChannel | null = null;
    try {
      if (typeof window !== "undefined" && "BroadcastChannel" in window) {
        channel = new BroadcastChannel("sfa_realtime_sync");
        channel.onmessage = (e) => {
          if (e.data?.type === "ASSIGNMENTS_UPDATED" || e.data?.type === "GRADE_UPDATED") {
            refreshAssignments();
          }
        };
      }
    } catch {}

    const handleFocus = () => {
      refreshAssignments();
    };

    if (typeof window !== "undefined") {
      window.addEventListener("focus", handleFocus);
      if (typeof document !== "undefined") {
        document.addEventListener("visibilitychange", handleFocus);
      }
    }

    return () => {
      if (channel) channel.close();
      if (typeof window !== "undefined") {
        window.removeEventListener("focus", handleFocus);
        if (typeof document !== "undefined") {
          document.removeEventListener("visibilitychange", handleFocus);
        }
      }
    };
  }, []);

  const handleUpdateMaterials = async (updatedList: any[]): Promise<boolean> => {
    const added = updatedList.find((item) => !materials.some((previous) => previous.id === item.id));
    const removed = materials.find((item) => !updatedList.some((next) => next.id === item.id));
    if (added) {
      const { courseId, title, fileName, contentBase64, mimeType } = added;
      const response = await uploadCourseMaterial({ courseId, title, fileName, contentBase64, mimeType });
      if (!response) return false;
      const next = [...materials, { ...response, id: response._id || response.id }];
      setMaterials(next);
      localStorage.setItem("sfa_materials", JSON.stringify(next));
      return true;
    }
    if (removed) {
      if (!await deleteCourseMaterial(removed.id)) return false;
      const next = materials.filter((item) => item.id !== removed.id);
      setMaterials(next);
      localStorage.setItem("sfa_materials", JSON.stringify(next));
      return true;
    }
    return true;
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
        try {
          await deleteCourseAssignment(previous.id);
        } catch (delErr) {
          console.warn("Could not delete assignment on server, proceeding with local deletion:", delErr);
        }
        confirmed = confirmed.filter((current) => current.id !== previous.id);
        keep(confirmed);
      }
      try {
        if (typeof window !== "undefined" && "BroadcastChannel" in window) {
          const ch = new BroadcastChannel("sfa_realtime_sync");
          ch.postMessage({ type: "ASSIGNMENTS_UPDATED" });
          ch.close();
        }
      } catch {}
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
