import { useState, useEffect } from "react";
import {
  INITIAL_STUDENTS_DATA,
  INITIAL_CYCLE_STATUSES,
  INITIAL_GRADUATIONS
} from "../../data/mockData";
import {
  fetchStudents,
  updateStudentPersonalData as apiUpdatePersonalData,
  updateStudentCycleStatuses as apiUpdateCycleStatuses
} from "../../services/api";

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

  const [studentsLoading, setStudentsLoading] = useState<boolean>(false);
  const [studentsError, setStudentsError] = useState<string | null>(null);

  useEffect(() => {
    setStudentsLoading(true);
    fetchStudents()
      .then((apiStudents) => {
        if (apiStudents && Array.isArray(apiStudents) && apiStudents.length > 0) {
          const studentMap: any = { ...studentsData };
          const cyclesMap: any = { ...cycleStatuses };

          apiStudents.forEach((st) => {
            if (st.dni) {
              studentMap[st.dni] = { ...studentMap[st.dni], ...st };
              if (st.cycleStatuses && Array.isArray(st.cycleStatuses) && st.cycleStatuses.length > 0) {
                cyclesMap[st.dni] = st.cycleStatuses;
              }
            }
          });

          setStudentsData(studentMap);
          setCycleStatuses(cyclesMap);
          localStorage.setItem("sfa_students", JSON.stringify(studentMap));
        }
      })
      .catch((err) => {
        console.error("Error fetching students from REST API:", err);
        setStudentsError("Error al cargar datos de estudiantes.");
      })
      .finally(() => setStudentsLoading(false));
  }, []);

  const handleUpdateStudentsData = async (updatedMap: any) => {
    setStudentsData(updatedMap);
    try {
      localStorage.setItem("sfa_students", JSON.stringify(updatedMap));
    } catch (e) {
      console.warn("[localStorage] Could not save sfa_students:", e);
    }

    // Direct sync for modified student personal details
    for (const [dni, details] of Object.entries(updatedMap)) {
      try {
        await apiUpdatePersonalData(dni, details);
      } catch (err) {
        console.error(`Error updating student personal data for DNI ${dni}:`, err);
      }
    }
  };

  const handleUpdatePersonalSingle = async (dni: string, details: any) => {
    const nextMap = { ...studentsData, [dni]: details };
    setStudentsData(nextMap);
    try {
      localStorage.setItem("sfa_students", JSON.stringify(nextMap));
    } catch (e) {
      console.warn(e);
    }
    await apiUpdatePersonalData(dni, details);
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
    studentsLoading,
    studentsError,
    handleUpdateStudentsData,
    handleUpdatePersonalSingle,
    handleUpdateGraduations
  };
}
