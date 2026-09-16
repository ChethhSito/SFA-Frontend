import { useState, useEffect } from "react";
import { INITIAL_ENROLLMENTS } from "../../data/mockData";
import { fetchEnrollments } from "../../services/api";

export function useStudentEnrollment() {
  const [enrollments, setEnrollments] = useState<any[]>(() => {
    const savedEnrolls = localStorage.getItem("sfa_enrollments");
    if (savedEnrolls) {
      try {
        let parsedEnrolls = JSON.parse(savedEnrolls);
        if (!localStorage.getItem("sfa_luis_matriculado_migrated")) {
          parsedEnrolls = parsedEnrolls.map((e: any) => {
            if (e.studentDni === "12345678") {
              return {
                ...e,
                academicStatus: "ADMITIDO",
                shift: undefined,
                groupId: undefined
              };
            }
            return e;
          });
          localStorage.setItem("sfa_enrollments", JSON.stringify(parsedEnrolls));
          localStorage.setItem("sfa_luis_matriculado_migrated", "true");
        }
        return parsedEnrolls;
      } catch (e) {
        console.error(e);
      }
    } else {
      localStorage.setItem("sfa_enrollments", JSON.stringify(INITIAL_ENROLLMENTS));
    }
    return INITIAL_ENROLLMENTS;
  });

  const handleUpdateEnrollments = (updatedList: any[]) => {
    setEnrollments(updatedList);
    try {
      localStorage.setItem("sfa_enrollments", JSON.stringify(updatedList));
    } catch (e) {
      console.warn("[localStorage] Could not save sfa_enrollments:", e);
    }
  };

  return {
    enrollments,
    setEnrollments,
    handleUpdateEnrollments
  };
}
