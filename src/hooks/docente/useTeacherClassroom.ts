import { useState } from "react";
import {
  GENERAL_CLASSROOMS,
  GENERAL_TEACHERS,
  INITIAL_COURSES,
  INITIAL_ATTENDANCE
} from "../../data/mockData";

export function useTeacherClassroom() {
  const [classrooms, setClassrooms] = useState<any[]>(() => {
    const saved = localStorage.getItem("sfa_classrooms");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return GENERAL_CLASSROOMS;
  });

  const [teachers, setTeachers] = useState<any[]>(() => {
    const saved = localStorage.getItem("sfa_teachers");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return GENERAL_TEACHERS;
  });

  const [courses, setCourses] = useState<any[]>(() => {
    const saved = localStorage.getItem("sfa_courses");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_COURSES;
  });

  const [attendance, setAttendance] = useState<any[]>(() => {
    const saved = localStorage.getItem("sfa_attendance");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return INITIAL_ATTENDANCE;
  });

  const handleUpdateClassrooms = (updatedList: any[]) => {
    setClassrooms(updatedList);
    try {
      localStorage.setItem("sfa_classrooms", JSON.stringify(updatedList));
    } catch (e) {
      console.warn("[localStorage] Could not save sfa_classrooms:", e);
    }
  };

  const handleUpdateTeachers = (updatedList: any[]) => {
    setTeachers(updatedList);
    try {
      localStorage.setItem("sfa_teachers", JSON.stringify(updatedList));
    } catch (e) {
      console.warn("[localStorage] Could not save sfa_teachers:", e);
    }
  };

  const handleUpdateCourses = (updatedList: any[]) => {
    setCourses(updatedList);
    try {
      localStorage.setItem("sfa_courses", JSON.stringify(updatedList));
    } catch (e) {
      console.warn("[localStorage] Could not save sfa_courses:", e);
    }
  };

  const handleUpdateAttendance = (updatedList: any[]) => {
    setAttendance(updatedList);
    try {
      localStorage.setItem("sfa_attendance", JSON.stringify(updatedList));
    } catch (e) {
      console.warn("[localStorage] Could not save sfa_attendance:", e);
    }
  };

  return {
    classrooms,
    setClassrooms,
    teachers,
    setTeachers,
    courses,
    setCourses,
    attendance,
    setAttendance,
    handleUpdateClassrooms,
    handleUpdateTeachers,
    handleUpdateCourses,
    handleUpdateAttendance
  };
}
