import { useState } from "react";
import {
  INITIAL_STUDENTS_DATA,
  INITIAL_CYCLE_STATUSES,
  INITIAL_GRADUATIONS
} from "../../data/mockData";

export function useStudentGrades() {
  const [studentsData, setStudentsData] = useState<any>(() => {
    const saved = localStorage.getItem("sfa_students");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_STUDENTS_DATA;
  });

  const [cycleStatuses, setCycleStatuses] = useState<any>(INITIAL_CYCLE_STATUSES);

  const [graduations, setGraduations] = useState<any[]>(() => {
    const saved = localStorage.getItem("sfa_graduations");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_GRADUATIONS;
  });

  const handleUpdateStudentsData = (updatedMap: any) => {
    setStudentsData(updatedMap);
    try {
      localStorage.setItem("sfa_students", JSON.stringify(updatedMap));
    } catch (e) {
      console.warn("[localStorage] Could not save sfa_students:", e);
    }
  };

  const handleUpdateGraduations = (updatedList: any[]) => {
    setGraduations(updatedList);
    try {
      localStorage.setItem("sfa_graduations", JSON.stringify(updatedList));
    } catch (e) {
      console.warn("[localStorage] Could not save sfa_graduations:", e);
    }
  };

  return {
    studentsData,
    setStudentsData,
    cycleStatuses,
    setCycleStatuses,
    graduations,
    setGraduations,
    handleUpdateStudentsData,
    handleUpdateGraduations
  };
}
