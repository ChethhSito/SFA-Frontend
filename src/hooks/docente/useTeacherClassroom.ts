import { useEffect, useState } from "react";
import { fetchCourses, fetchTeachers, saveCourseAttendance } from "../../services/api";
import { fetchMpaCollection } from "../../services/mpaApi";

export function useTeacherClassroom() {
  const [classrooms, setClassrooms] = useState<any[]>(() => {
    const saved = localStorage.getItem("sfa_classrooms");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  const [teachers, setTeachers] = useState<any[]>(() => {
    const saved = localStorage.getItem("sfa_teachers");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  const [courses, setCourses] = useState<any[]>(() => {
    const saved = localStorage.getItem("sfa_courses");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  const [attendance, setAttendance] = useState<any[]>(() => {
    const saved = localStorage.getItem("sfa_attendance");
    if (saved) {
      try { return JSON.parse(saved); } catch (e) { console.error(e); }
    }
    return [];
  });

  useEffect(() => {
    fetchMpaCollection<any>("classrooms").then((items) => {
      setClassrooms(items);
      localStorage.setItem("sfa_classrooms", JSON.stringify(items));
    }).catch((err) => console.error("Error fetching classrooms:", err));

    fetchTeachers().then((items) => {
      if (items) {
        setTeachers(items);
        localStorage.setItem("sfa_teachers", JSON.stringify(items));
      }
    }).catch((err) => console.error("Error fetching teachers:", err));

    fetchCourses().then((items) => {
      if (items) {
        setCourses(items);
        localStorage.setItem("sfa_courses", JSON.stringify(items));
      }
    }).catch((err) => console.error("Error fetching courses:", err));
  }, []);

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

  const handleUpdateAttendance = async (updatedList: any[]) => {
    setAttendance(updatedList);
    try {
      localStorage.setItem("sfa_attendance", JSON.stringify(updatedList));
    } catch (e) {
      console.warn("[localStorage] Could not save sfa_attendance:", e);
    }

    const latest = updatedList[updatedList.length - 1];
    if (latest && latest.courseId && latest.date && latest.statusMap) {
      try {
        await saveCourseAttendance(latest.courseId, latest.date, latest.statusMap);
      } catch (err) {
        console.warn("[API Error] Could not save attendance to DB:", err);
      }
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
