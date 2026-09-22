import { useState, useEffect } from "react";
import { Course } from "../../types";
import {
  fetchCourses,
  createCourse as apiCreateCourse,
  updateCourse as apiUpdateCourse
} from "../../services/api";

export function useAcademicPlanning() {
  const [courses, setCourses] = useState<Course[]>(() => {
    const saved = localStorage.getItem("sfa_courses");
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error("Error reading sfa_courses:", e);
      }
    }
    return [];
  });

  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetchCourses()
      .then((apiCourses) => {
        if (!apiCourses) throw new Error("No se pudo consultar cursos");
        setCourses(apiCourses);
        localStorage.setItem("sfa_courses", JSON.stringify(apiCourses));
      })
      .catch((err) => {
        console.error("Error fetching courses from REST API:", err);
        setError("Error al cargar los cursos de planificación académica.");
      })
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateCourses = (updatedList: Course[]) => {
    setCourses(updatedList);
    try {
      localStorage.setItem("sfa_courses", JSON.stringify(updatedList));
    } catch (e) {
      console.warn("[localStorage] Could not save sfa_courses:", e);
    }
  };

  const handleCreateCourse = async (newCourse: Partial<Course>) => {
    const created = await apiCreateCourse(newCourse);
    const itemToSave = created || (newCourse as Course);
    const exists = courses.some((c) => c.code === itemToSave.code);
    const nextList = exists
      ? courses.map((c) => (c.code === itemToSave.code ? itemToSave : c))
      : [...courses, itemToSave];
    handleUpdateCourses(nextList);
    return itemToSave;
  };

  const handleUpdateCourseByCode = async (code: string, data: Partial<Course>) => {
    await apiUpdateCourse(code, data);
    const nextList = courses.map((c) => (c.code === code ? { ...c, ...data } : c));
    handleUpdateCourses(nextList);
  };

  return {
    courses,
    setCourses,
    coursesLoading: loading,
    coursesError: error,
    handleUpdateCourses,
    handleCreateCourse,
    handleUpdateCourseByCode
  };
}
