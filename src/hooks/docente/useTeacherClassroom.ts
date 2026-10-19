import { useEffect, useState, useRef } from "react";
import { fetchCourses, fetchTeachers, fetchCourseAttendance, saveCourseAttendance } from "../../services/api";
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

  const [attendance, setAttendance] = useState<any[]>([]);
  const [attendanceLoading, setAttendanceLoading] = useState(true);
  const [attendanceError, setAttendanceError] = useState<string | null>(null);
  const attendanceReady = useRef(false);
  const attendanceSaving = useRef(false);
  const cacheAttendance = (records: any[]) => {
    setAttendance(records);
    try { localStorage.setItem("sfa_attendance", JSON.stringify(records)); }
    catch (err) { console.warn("No se pudo guardar la caché de asistencias", err); }
  };
  const reloadAttendance = async () => {
    setAttendanceLoading(true);
    const records = await fetchCourseAttendance();
    if (!records) {
      attendanceReady.current = false;
      setAttendanceError("No se pudieron cargar las asistencias del servidor. Reintente antes de registrar cambios.");
      setAttendanceLoading(false);
      return false;
    }
    cacheAttendance(records);
    attendanceReady.current = true;
    setAttendanceError(null);
    setAttendanceLoading(false);
    return true;
  };

  useEffect(() => {
    void reloadAttendance();
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

  const handleUpdateAttendance = async (updatedList: any[]): Promise<boolean> => {
    if (!attendanceReady.current || attendanceSaving.current) return false;
    attendanceSaving.current = true;
    let confirmed = [...attendance];
    try {
      for (const record of updatedList) {
        const previous = attendance.find((item) => item.courseId === record.courseId && item.date === record.date);
        const changes = Object.fromEntries(Object.entries(record.statusMap || {}).filter(([dni, status]) => previous?.statusMap?.[dni] !== status));
        if (!Object.keys(changes).length) continue;
        const response = await saveCourseAttendance(record.courseId, record.date, changes as Record<string, string>, record.week);
        if (!response) return false;
        const saved = { ...response, id: response._id || response.id || `${response.courseId}-${response.date}` };
        const index = confirmed.findIndex((item) => item.courseId === saved.courseId && item.date === saved.date);
        if (index >= 0) confirmed[index] = saved;
        else confirmed.push(saved);
        cacheAttendance([...confirmed]);
      }
      return true;
    } finally { attendanceSaving.current = false; }
  };

  return {
    classrooms,
    setClassrooms,
    teachers,
    setTeachers,
    courses,
    setCourses,
    attendance,
    attendanceLoading,
    attendanceError,
    reloadAttendance,
    setAttendance,
    handleUpdateClassrooms,
    handleUpdateTeachers,
    handleUpdateCourses,
    handleUpdateAttendance
  };
}
