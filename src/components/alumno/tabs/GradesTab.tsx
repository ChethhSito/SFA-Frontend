import React, { useState } from "react";
import { Zap, Cpu, Sliders, Award, Printer, Info, ChevronRight, FileText, CheckCircle2 } from "lucide-react";
import PageTransition from "../../ui/PageTransition";
import { BoletaNotasModal } from "../modals/BoletaNotasModal";

interface GradesTabProps {
  enrichedCourses: any[];
  selectedCourseDetail: string;
  setSelectedCourseDetail: React.Dispatch<React.SetStateAction<string>>;
  studentInfo?: {
    dni?: string;
    name?: string;
    career?: string;
  };
}

export const GradesTab: React.FC<GradesTabProps> = ({
  enrichedCourses,
  selectedCourseDetail,
  setSelectedCourseDetail,
  studentInfo
}) => {
  const [showBoletaModal, setShowBoletaModal] = useState(false);
  const activeCourse = enrichedCourses.find(c => c.name === selectedCourseDetail || c.id === selectedCourseDetail) || enrichedCourses[0];

  const renderCourseIcon = (iconName: string, className = "w-4 h-4") => {
    switch (iconName) {
      case "Zap":
        return <Zap className={className} />;
      case "Cpu":
        return <Cpu className={className} />;
      case "Sliders":
        return <Sliders className={className} />;
      case "BarChart3":
      default:
        return <Award className={className} />;
    }
  };

  const totalCredits = enrichedCourses.reduce((acc, c) => acc + (Number(c.credits) || 0), 0) || 24;

  // Helper to compute course progressive stats from formula variables
  const computeCourseStats = (course: any) => {
    const evals = course?.evaluations || [];
    const weightedEvals = evals.filter((e: any) => typeof e.weightDecimal === "number" && e.weightDecimal > 0);
    
    let accumulatedPoints = 0;
    let evaluatedWeight = 0;

    weightedEvals.forEach((e: any) => {
      if (typeof e.grade === "number") {
        accumulatedPoints += e.grade * e.weightDecimal;
        evaluatedWeight += e.weightDecimal;
      }
    });

    const isFullyEvaluated = evaluatedWeight >= 0.99;
    const progressiveAverage = evaluatedWeight > 0 
      ? (accumulatedPoints / evaluatedWeight) 
      : 0;

    const breakdownText = weightedEvals.length > 0
      ? weightedEvals.map((e: any) => {
          const g = typeof e.grade === "number" ? e.grade : "NR";
          return `${e.weightDecimal.toFixed(2)}×(${g})`;
        }).join(" + ")
      : "Sin componentes ponderados";

    return {
      accumulatedPoints: Math.round(accumulatedPoints * 10) / 10,
      evaluatedWeight: Math.round(evaluatedWeight * 100) / 100,
      progressiveAverage: Math.round(progressiveAverage * 10) / 10,
      isFullyEvaluated,
      hasAnyGrade: evaluatedWeight > 0,
      breakdownText
    };
  };

  const activeStats = computeCourseStats(activeCourse);

  // Curricular evaluations of the active course (formula variables: PC1, PC2, EX_FINAL)
  const formulaEvaluations = activeCourse?.evaluations?.filter((e: any) => e.isCurricular !== false) || [];

  // Weekly tasks of the active course (accumulated into NPA)
  const weeklyTasks = activeCourse?.weeklyTasks || activeCourse?.evaluations?.filter((e: any) => e.isCurricular === false) || [];
  const gradedWeeklyTasks = weeklyTasks.filter((t: any) => typeof t.grade === "number");
  const courseNpa = gradedWeeklyTasks.length > 0
    ? (gradedWeeklyTasks.reduce((sum: number, t: any) => sum + (t.grade as number), 0) / gradedWeeklyTasks.length).toFixed(1)
    : null;

  // Global cycle NPA across all courses
  const allGradedWeeklyTasks = enrichedCourses.flatMap((c) => c.weeklyTasks || c.evaluations?.filter((e: any) => e.isCurricular === false) || []).filter((t: any) => typeof t.grade === "number");
  const cycleNpaAverage = allGradedWeeklyTasks.length > 0
    ? (allGradedWeeklyTasks.reduce((sum: number, t: any) => sum + (t.grade as number), 0) / allGradedWeeklyTasks.length).toFixed(1)
    : null;

  // Overall cycle calculation: weighted average of courses that have evaluations
  const coursesWithEvaluations = enrichedCourses.map(c => ({
    course: c,
    stats: computeCourseStats(c)
  })).filter(item => item.stats.hasAnyGrade);

  const cycleProgressiveAverage = coursesWithEvaluations.length > 0
    ? (
        coursesWithEvaluations.reduce((sum, item) => sum + (item.stats.progressiveAverage * (Number(item.course.credits) || 4)), 0) /
        coursesWithEvaluations.reduce((sum, item) => sum + (Number(item.course.credits) || 4), 0)
      ).toFixed(1)
    : "Sin notas";

  const hasAnyEvaluations = coursesWithEvaluations.length > 0;

  return (
    <PageTransition id="notas" className="space-y-6">
      {/* Header widget */}
      <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 md:p-7 overflow-hidden text-left border-b-4 border-amber-500 mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-[#800521] to-slate-900/70 opacity-95" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm inline-block select-none font-mono">
              PORTAL DEL ESTUDIANTE • CONTROL DE RENDIMIENTO
            </span>
            <h2 id="notas-view-main" className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase font-display leading-none pt-0.5">
              Récord de Calificaciones
            </h2>
            <p className="text-xs text-white/90 font-medium max-w-2xl">
              Calificaciones oficiales guardadas por evaluación. El promedio mostrado es ponderado y auditado por secretaría académica.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <div className="text-left bg-black/30 border border-white/20 px-3.5 py-2 rounded-xl select-none shadow-inner">
              <span className="text-[9px] text-amber-400 font-extrabold block uppercase mb-0.5 tracking-wider">Período Académico</span>
              <span className="text-xs font-black text-white font-mono">2027-I</span>
            </div>
            <button
              onClick={() => setShowBoletaModal(true)}
              className="bg-white hover:bg-amber-50 text-slate-900 font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-2 select-none cursor-pointer transition-all shadow-md border border-white/30"
            >
              <Printer className="w-3.5 h-3.5 text-[#800521]" />
              <span>Descargar Boleta</span>
            </button>
          </div>
        </div>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs border-l-4 border-l-blue-600 flex items-center justify-between text-left">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Nota de Participación</span>
              <span className="text-[8px] font-black uppercase px-1.5 py-0.5 rounded bg-blue-50 text-blue-800 font-mono">
                {cycleNpaAverage !== null ? "Al Día" : "Sin Registro"}
              </span>
            </div>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{cycleNpaAverage !== null ? cycleNpaAverage : "0.0"}</p>
            <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">
              {allGradedWeeklyTasks.length} tarea{allGradedWeeklyTasks.length === 1 ? "" : "s"} calificada{allGradedWeeklyTasks.length === 1 ? "" : "s"}
            </span>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Award className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs border-l-4 border-l-emerald-600 flex items-center justify-between text-left">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Créditos Llevados</span>
            <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">{totalCredits.toFixed(1)}</p>
            <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Total matriculado Ciclo I</span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <FileText className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs border-l-4 border-l-purple-600 flex items-center justify-between text-left">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Materias Matriculadas</span>
            <p className="text-2xl font-black text-purple-600 mt-1 font-mono">{enrichedCourses.length}</p>
            <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">5 Unidades Didácticas</span>
          </div>
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <Sliders className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs border-l-4 border-l-emerald-600 flex items-center justify-between text-left">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Condición Académica</span>
            <p className="text-xl font-black text-emerald-600 mt-1 font-mono">
              {cycleNpaAverage !== null && Number(cycleNpaAverage) >= 12.5 ? "REGULAR" : "MATRICULADO"}
            </p>
            <span className="text-[9px] text-slate-400 font-semibold block mt-0.5">Semestre Académico 2027-I</span>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Split Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT AREA: Evaluations detail card */}
        <div className="xl:col-span-8 space-y-6 text-left">
          <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="min-w-0 flex-1">
                <h3 className="text-sm md:text-base font-black text-slate-900 tracking-tight flex items-center gap-2">
                  {renderCourseIcon(activeCourse?.iconType || "BarChart3", "w-4 h-4 text-[#800521] shrink-0")}
                  <span className="truncate">{activeCourse?.name}</span>
                </h3>
                <span className="text-[10px] text-slate-400 font-bold uppercase mt-0.5 block">
                  {activeCourse?.code} • {activeCourse?.classroom}
                </span>
              </div>
              
              <button 
                onClick={() => setShowBoletaModal(true)}
                className="bg-[#9F062A] hover:bg-[#800521] text-white font-black text-[10.5px] py-1.5 px-3 rounded-lg flex items-center gap-1.5 uppercase transition-all shadow-xs cursor-pointer select-none shrink-0 self-start sm:self-center"
              >
                <Printer className="w-3.5 h-3.5" /> Descargar Boleta
              </button>
            </div>

            {activeCourse ? (
              <div className="space-y-6">
                {/* 1. SECCIÓN: EVALUACIONES OFICIALES */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <Award className="w-4 h-4 text-[#800521]" />
                        Evaluaciones Oficiales
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        Calificaciones registradas para el acta final.
                      </p>
                    </div>
                    <span className="text-[9px] font-mono font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded border border-slate-200">
                      {formulaEvaluations.length} evaluaciones
                    </span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-xs font-semibold text-slate-600 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase text-left">
                          <th className="py-2.5 px-1">Evaluación</th>
                          <th className="py-2.5 text-center">Código</th>
                          <th className="py-2.5 text-center">Peso</th>
                          <th className="py-2.5 text-center">Estado</th>
                          <th className="py-2.5 text-right">Nota</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {formulaEvaluations.map((evalItem: any, idx: number) => {
                          const isNotRegistered = evalItem.grade === "NR" || evalItem.grade === undefined;
                          return (
                            <tr key={idx} className="hover:bg-slate-50/50 transition-all font-sans">
                              <td className="py-3 px-1">
                                <span className="text-slate-800 font-black block text-[12px]">{evalItem.name}</span>
                                <span className="text-[10px] text-slate-400 font-semibold block mt-0.5">{evalItem.sub}</span>
                              </td>
                              
                              <td className="py-3 text-center">
                                <span className="font-mono text-[11px] text-[#800521] font-black bg-rose-50 border border-rose-200 px-2 py-0.5 rounded uppercase">
                                  {evalItem.prefix}
                                </span>
                              </td>
                              
                              <td className="py-3 text-center font-mono text-slate-600 font-bold text-[11px]">
                                {evalItem.weight}
                              </td>

                              <td className="py-3 text-center">
                                <span className="text-[9.5px] font-bold text-slate-500 uppercase px-2 py-0.5 rounded bg-slate-100 border border-slate-200">
                                  {isNotRegistered ? "Pendiente" : "Registrado"}
                                </span>
                              </td>
                              
                              <td className="py-3 text-right">
                                <span className={`font-mono font-black text-[13px] min-w-12 h-8 inline-flex items-center justify-center px-2.5 rounded-lg border select-none ${
                                  isNotRegistered 
                                    ? "bg-slate-100 text-slate-400 border-slate-200" 
                                    : "bg-emerald-50 text-emerald-800 border-emerald-200 font-extrabold"
                                }`}>
                                  {isNotRegistered ? "NR" : evalItem.grade}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Official Course Formula & Progressive Breakdown */}
                  <div className="bg-slate-50 border border-slate-200/90 p-4 rounded-xl space-y-3 text-left shadow-3xs">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest block">
                        Fórmula Curricular Oficial del Curso:
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="text-[9px] font-mono font-bold bg-white text-slate-700 border border-slate-200 px-2 py-0.5 rounded shadow-3xs">
                          Avance Evaluado: {(activeStats.evaluatedWeight * 100).toFixed(0)}%
                        </span>
                        <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded font-mono ${
                          activeStats.isFullyEvaluated 
                            ? "bg-emerald-100 text-emerald-800" 
                            : "bg-amber-100 text-amber-900 border border-amber-300"
                        }`}>
                          {activeStats.isFullyEvaluated ? "Evaluación Cerrada" : "En Desarrollo Lectivo"}
                        </span>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs space-y-1.5">
                      <code className="text-xs md:text-sm font-mono font-black text-[#800521] block select-all">
                        {activeCourse.formula}
                      </code>
                      <p className="text-[10.5px] text-slate-500 font-semibold leading-relaxed">
                        Desglose de cálculo: <span className="font-mono font-extrabold text-slate-800">{activeStats.breakdownText}</span>
                      </p>
                    </div>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-200 text-xs flex-wrap gap-2">
                      <span className="text-slate-600 font-bold text-[11px]">
                        Puntaje en Acta al momento:
                        <strong className="font-mono text-emerald-700 ml-1.5 font-black text-sm">
                          {activeStats.accumulatedPoints.toFixed(1)} / 20.0 pts
                        </strong>
                      </span>
                      <span className="text-[11px] font-bold text-slate-500">
                        Rendimiento de actas: <strong className="font-mono text-slate-900">{activeStats.hasAnyGrade ? `${activeStats.progressiveAverage.toFixed(1)} / 20` : "Pendiente de primer hito (PC1)"}</strong>
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2. SECCIÓN: ACTIVIDADES Y TAREAS CONTINUAS (NPA) */}
                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                        <FileText className="w-4 h-4 text-blue-600" />
                        Tareas y Actividades Continuas
                      </h4>
                      <p className="text-[10px] text-slate-400 font-medium mt-0.5">
                        Tareas e informes semanales que acumulan en la nota de participación.
                      </p>
                    </div>

                    <div className="bg-blue-50 border border-blue-200 px-3 py-1.5 rounded-xl flex items-center gap-2">
                      <span className="text-[10px] font-black uppercase text-blue-700">Promedio:</span>
                      <span className="font-mono font-black text-blue-900 text-sm">
                        {courseNpa !== null ? `${courseNpa} / 20` : "Sin tareas"}
                      </span>
                    </div>
                  </div>

                  {weeklyTasks.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs font-semibold text-slate-600 border-collapse">
                        <thead>
                          <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase text-left">
                            <th className="py-2.5 px-1">Tarea</th>
                            <th className="py-2.5 text-center">Semana</th>
                            <th className="py-2.5 text-center">Estado</th>
                            <th className="py-2.5 text-right">Nota</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {weeklyTasks.map((task: any, idx: number) => {
                            const isGraded = typeof task.grade === "number";
                            return (
                              <tr key={idx} className="hover:bg-slate-50/50 transition-all font-sans">
                                <td className="py-3 px-1">
                                  <span className="text-slate-800 font-black block text-[12px]">{task.name}</span>
                                  {task.feedback && (
                                    <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5 italic">
                                      "{task.feedback}"
                                    </span>
                                  )}
                                </td>

                                <td className="py-3 text-center">
                                  <span className="font-mono text-[10px] font-bold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
                                    {task.prefix}
                                  </span>
                                </td>

                                <td className="py-3 text-center">
                                  <span className={`text-[9.5px] font-bold uppercase px-2 py-0.5 rounded ${
                                    task.hasSubmitted ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-800"
                                  }`}>
                                    {task.hasSubmitted ? "Entregado" : "Pendiente"}
                                  </span>
                                </td>

                                <td className="py-3 text-right">
                                  <span className={`font-mono font-black text-[13px] min-w-12 h-8 inline-flex items-center justify-center px-2.5 rounded-lg border select-none ${
                                    isGraded
                                      ? "bg-emerald-50 text-emerald-800 border-emerald-200 font-extrabold"
                                      : "bg-slate-100 text-slate-400 border-slate-200"
                                  }`}>
                                    {isGraded ? task.grade : "NR"}
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-4 text-center text-xs text-slate-400 italic">
                      No se han asignado tareas aún.
                    </div>
                  )}
                </div>

                <div className="bg-amber-50/50 border border-amber-100 p-3.5 rounded-lg text-[10.5px] font-bold text-slate-650 flex items-start gap-2 leading-relaxed">
                  <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                  <p>
                    <strong>Nota Importante:</strong> La nota aprobatoria mínima institucional es de <strong>13 (trece)</strong>. Las notas pendientes se registran como <em>"NR"</em> y se regularizan conforme el docente evalúe en las sesiones.
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center p-6 text-slate-400 italic">No hay datos para esta unidad didáctica.</div>
            )}
          </div>
        </div>

        {/* RIGHT AREA: Course navigator bar sidebar */}
        <div className="xl:col-span-4 space-y-6">
          <div className="bg-white rounded-xl border border-slate-100 shadow-xs p-5 space-y-4 text-left">
            <h3 className="text-[11.5px] font-black uppercase text-slate-500 tracking-wider">Cursos del Ciclo</h3>
            
            <div className="space-y-2.5">
              {enrichedCourses.map((courseItem) => {
                const isSelected = activeCourse?.id === courseItem.id;
                const courseItemStats = computeCourseStats(courseItem);
                return (
                  <button
                    key={courseItem.id}
                    onClick={() => setSelectedCourseDetail(courseItem.name)}
                    className={`w-full p-4 rounded-xl border text-left transition-all flex items-center justify-between group cursor-pointer ${
                      isSelected
                        ? "bg-[#800521]/5 border-[#800521]/20 shadow-xs"
                        : "bg-white border-slate-100 hover:border-slate-200 hover:bg-slate-50/50"
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className={`p-2.5 rounded-lg border transition-all ${
                        isSelected
                          ? "bg-[#800521] text-white border-[#800521]"
                          : "bg-slate-50 text-slate-400 group-hover:text-slate-700 border-slate-100 group-hover:border-slate-200"
                      }`}>
                        {renderCourseIcon(courseItem.iconType, "w-4 h-4")}
                      </div>
                      <div className="min-w-0 text-left">
                        <span className={`text-[12.5px] font-black block truncate leading-tight ${
                          isSelected ? "text-slate-900" : "text-slate-700"
                        }`}>
                          {courseItem.name}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[9.5px] text-slate-400 font-extrabold tracking-wide uppercase">
                            Código: {courseItem.code}
                          </span>
                          {courseItemStats.hasAnyGrade && (
                            <span className="text-[8.5px] font-mono font-bold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                              {courseItemStats.progressiveAverage.toFixed(1)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    <ChevronRight className={`w-4 h-4 transition-transform ${
                      isSelected ? "text-[#800521] translate-x-0.5" : "text-slate-350 group-hover:text-slate-600"
                    }`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      <BoletaNotasModal
        isOpen={showBoletaModal}
        onClose={() => setShowBoletaModal(false)}
        studentDni={studentInfo?.dni || "74859612"}
        studentName={studentInfo?.name || "Mateo Sebastián Quispe Rojas"}
        careerName={studentInfo?.career || "Electricidad Industrial"}
        cycleNumber={1}
        courses={enrichedCourses.map((c) => {
          const stats = computeCourseStats(c);
          return {
            name: c.name,
            grade: stats.hasAnyGrade ? stats.progressiveAverage : "NR",
            approved: stats.hasAnyGrade ? stats.progressiveAverage >= 12.5 : null,
            status: stats.hasAnyGrade 
              ? (stats.progressiveAverage >= 12.5 ? "Aprobado" : "Desaprobado")
              : "En Curso"
          };
        })}
        average={hasAnyEvaluations ? Number(cycleProgressiveAverage) : 0}
      />
    </PageTransition>
  );
};
