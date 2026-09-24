import { useState, useEffect } from "react";
import { 
  fetchCourseMaterials, 
  uploadCourseMaterial, 
  fetchCourseAssignments, 
  createCourseAssignment 
} from "../../services/api";

export function useMaterialUpload() {
  const [materials, setMaterials] = useState<any[]>(() => {
    const saved = localStorage.getItem("sfa_materials");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  const [assignments, setAssignments] = useState<any[]>(() => {
    const saved = localStorage.getItem("sfa_assignments");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

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
        if (apiAsgs && Array.isArray(apiAsgs) && apiAsgs.length > 0) {
          setAssignments(apiAsgs);
          localStorage.setItem("sfa_assignments", JSON.stringify(apiAsgs));
        }
      })
      .catch((err) => console.warn("Error fetching assignments API:", err));
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

  const handleUpdateAssignments = async (updatedList: any[]) => {
    setAssignments(updatedList);
    try {
      localStorage.setItem("sfa_assignments", JSON.stringify(updatedList));
    } catch (e) {
      console.warn("[localStorage] Could not save sfa_assignments:", e);
    }
    const latestItem = updatedList[updatedList.length - 1];
    if (latestItem) {
      try {
        await createCourseAssignment(latestItem);
      } catch (err) {
        console.warn("[API Error] Could not save assignment to DB:", err);
      }
    }
  };

  return {
    materials,
    setMaterials,
    assignments,
    setAssignments,
    evaluations,
    handleUpdateMaterials,
    handleUpdateAssignments
  };
}
