import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { MpaCareer, MpaCourse, Program, ProgramId } from "../types";
import { fetchMpaCollection } from "../services/mpaApi";

interface AcademicCatalogState {
  programs: Program[];
  courses: MpaCourse[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

const AcademicCatalogContext = createContext<AcademicCatalogState | null>(null);

const CACHE_PROGRAMS_KEY = "sfa_academic_catalog_programs";
const CACHE_COURSES_KEY = "sfa_academic_catalog_courses";

export function AcademicCatalogProvider({ children }: { children: React.ReactNode }) {
  const [programs, setPrograms] = useState<Program[]>(() => {
    try {
      const cached = localStorage.getItem(CACHE_PROGRAMS_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [courses, setCourses] = useState<MpaCourse[]>(() => {
    try {
      const cached = localStorage.getItem(CACHE_COURSES_KEY);
      return cached ? JSON.parse(cached) : [];
    } catch {
      return [];
    }
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [careers, academicCourses] = await Promise.all([
        fetchMpaCollection<MpaCareer>("careers"),
        fetchMpaCollection<MpaCourse>("courses"),
      ]);

      const mappedPrograms: Program[] = careers.map((career) => ({
        id: career.id as ProgramId,
        name: career.name,
        description: career.description || "",
        duration: `${Math.ceil(career.durationSemesters / 2)} años (${career.durationSemesters} ciclos)`,
        courses: academicCourses.filter((course) => course.careerId === career.id).map((course) => course.name),
      }));

      setCourses(academicCourses);
      setPrograms(mappedPrograms);
      setError(null);

      try {
        localStorage.setItem(CACHE_PROGRAMS_KEY, JSON.stringify(mappedPrograms));
        localStorage.setItem(CACHE_COURSES_KEY, JSON.stringify(academicCourses));
      } catch {}
    } catch (cause) {
      console.warn("No se pudo sincronizar el catálogo académico con el backend:", cause);
      setError(cause instanceof Error ? cause.message : "error de conexión");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const onChanged = () => { void refresh(); };
    window.addEventListener("mpa:catalog-changed", onChanged);
    return () => window.removeEventListener("mpa:catalog-changed", onChanged);
  }, [refresh]);

  return (
    <AcademicCatalogContext.Provider value={{ programs, courses, loading, error, refresh }}>
      {children}
    </AcademicCatalogContext.Provider>
  );
}

export function useAcademicCatalog() {
  const context = useContext(AcademicCatalogContext);
  if (!context) throw new Error("AcademicCatalogProvider is missing");
  return context;
}

