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

export function AcademicCatalogProvider({ children }: { children: React.ReactNode }) {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [courses, setCourses] = useState<MpaCourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [careers, academicCourses] = await Promise.all([
        fetchMpaCollection<MpaCareer>("careers"),
        fetchMpaCollection<MpaCourse>("courses"),
      ]);
      setCourses(academicCourses);
      setPrograms(careers.map((career) => ({
        id: career.id as ProgramId,
        name: career.name,
        description: career.description || "",
        duration: `${Math.ceil(career.durationSemesters / 2)} años (${career.durationSemesters} ciclos)`,
        courses: academicCourses.filter((course) => course.careerId === career.id).map((course) => course.name),
      })));
      setError(null);
    } catch (cause) {
      setError(`No se pudo cargar el catálogo académico: ${cause instanceof Error ? cause.message : "error desconocido"}`);
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
      {error && <div role="alert" className="bg-amber-50 border-b border-amber-200 px-4 py-2 text-xs font-semibold text-amber-900">{error}</div>}
      {children}
    </AcademicCatalogContext.Provider>
  );
}

export function useAcademicCatalog() {
  const context = useContext(AcademicCatalogContext);
  if (!context) throw new Error("AcademicCatalogProvider is missing");
  return context;
}
