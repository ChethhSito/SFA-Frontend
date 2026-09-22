import { useState } from "react";

export function useMaterialUpload() {
  const [materials, setMaterials] = useState<any[]>(() => {
    const saved = localStorage.getItem("sfa_materials");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [assignments, setAssignments] = useState<any[]>(() => {
    const saved = localStorage.getItem("sfa_assignments");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  const [evaluations] = useState<any[]>([]);

  const handleUpdateMaterials = (updatedList: any[]) => {
    setMaterials(updatedList);
    try {
      localStorage.setItem("sfa_materials", JSON.stringify(updatedList));
    } catch (e) {
      console.warn("[localStorage] Could not save sfa_materials:", e);
    }
  };

  const handleUpdateAssignments = (updatedList: any[]) => {
    setAssignments(updatedList);
    try {
      localStorage.setItem("sfa_assignments", JSON.stringify(updatedList));
    } catch (e) {
      console.warn("[localStorage] Could not save sfa_assignments:", e);
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
