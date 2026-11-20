import React, { useState } from "react";
import { Download, Printer, ChevronDown, ChevronUp, Lock, Save, Check } from "lucide-react";
import { StudentPersonalData } from "../../../types";
import { CourseFormula } from "./CourseFormulaCard";

export interface SubcomponentVariable {
  id: string;
  label: string;
  weight: number;
}

export interface SubcomponentData {
  id: string;
  code: string;
  name: string;
  fullName: string;
  weightPct: number;
  credits: number;
  courseId: string;
  teacherName: string;
  canEdit: boolean;
  variables: SubcomponentVariable[];
  studentGrades: Record<string, {
    values: Record<string, number | null>;
    average: number | null;
  }>;
}

interface GradeSheetTableProps {
  students: StudentPersonalData[];
  formula: CourseFormula;
  sheetData: { [key: string]: string };
  computeStudentAverage: (studentDni: string) => { average: number; missingAny: boolean };
  onInitiateSecureEdit: (studentDni: string, studentName: string, variableId: string, currentVal: string, targetCourseId?: string) => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
  onSaveSheet: () => void;
  onPublishOfficial: () => void;
  subComponents?: SubcomponentData[];
  isTheoryCourse?: boolean;
}

export const GradeSheetTable: React.FC<GradeSheetTableProps> = ({
  students,
  formula,
  sheetData,
  computeStudentAverage,
  onInitiateSecureEdit,
  onExportExcel,
  onExportPDF,
  onSaveSheet,
  onPublishOfficial,
  subComponents = [],
  isTheoryCourse = false
}) => {
  const [expandedStudents, setExpandedStudents] = useState<Record<string, boolean>>({});

  const toggleExpand = (dni: string) => {
    setExpandedStudents((prev) => ({ ...prev, [dni]: !prev[dni] }));
  };

  const hasSubcomponents = isTheoryCourse && subComponents.length > 0;

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-3xs overflow-hidden text-left font-sans">
      <div className="p-5 border-b border-slate-150 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h3 className="text-sm font-black uppercase text-slate-900">Planilla Digital de Registro de Calificaciones</h3>
          <p className="text-xs text-slate-500 mt-0.5">Edición protegida con firma digital PIN. Haga clic sobre la calificación a modificar.</p>
        </div>
        <div className="flex flex-wrap gap-2 md:self-center shrink-0">
          <button
            type="button"
            onClick={onExportExcel}
            className="font-bold text-[10.5px] uppercase py-2 px-3.5 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-emerald-600" /> Exportar Excel
          </button>
          <button
            type="button"
            onClick={onExportPDF}
            className="font-bold text-[10.5px] uppercase py-2 px-3.5 flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition-all cursor-pointer shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5 text-[#800521]" /> Imprimir / PDF
          </button>
        </div>
      </div>
      <div className="p-0 overflow-x-auto select-text">
        <table className="w-full text-xs font-bold border-collapse text-left min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 border-b text-slate-500 uppercase tracking-wider text-[9px] font-black">
              <th className="py-2.5 px-4">Alumno</th>
              <th className="py-2.5 px-3 font-mono w-24">DNI</th>
              {formula.variables.map((v) => (
                <th key={v.id} className="py-3 px-2 text-center w-24 font-mono leading-tight">
                  <span className="block text-slate-800">{v.id}</span>
                  <span className="text-[8px] text-slate-400 font-bold block">({Math.round(v.weight * 100)}%)</span>
                </th>
              ))}
              <th className="py-2.5 px-4 text-center w-28 text-[#8B0026] bg-slate-50 border-l">Promedio Final</th>
              <th className="py-2.5 px-4 text-center w-24 bg-slate-50">Condición</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150/60 font-sans text-xs">
            {students.map((std) => {
              const stats = computeStudentAverage(std.dni);
              const isUnderWeight = stats.missingAny;
              const isApproved = stats.average >= 12.5;
              const isExpanded = !!expandedStudents[std.dni];

              return (
                <React.Fragment key={std.dni}>
                  <tr className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div>
                        <span className="font-extrabold text-slate-800 uppercase block leading-tight">
                          {std.lastName}, {std.name}
                        </span>
                        {hasSubcomponents && (
                          <button
                            type="button"
                            onClick={() => toggleExpand(std.dni)}
                            className={`mt-1.5 inline-flex items-center gap-1.5 text-[9.5px] font-mono font-bold px-2 py-0.5 rounded border transition-all cursor-pointer ${
                              isExpanded
                                ? "bg-[#800521] text-white border-[#800521] shadow-2xs"
                                : "bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-300"
                            }`}
                            title="Desplegar notas de Taller y Laboratorio"
                          >
                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            <span>{isExpanded ? "Ocultar Áreas Prácticas" : "Desplegable Taller y Lab"}</span>
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-3 font-mono text-slate-450 font-semibold select-all">
                      {std.dni}
                    </td>
                    
                    {formula.variables.map((v) => {
                      const val = sheetData[`${std.dni}-${v.id}`] || "";
                      const numVal = parseFloat(val);
                      const hasGrade = val !== "";
                      const cellIsApproved = hasGrade && !isNaN(numVal) && numVal >= 12.5;
                      
                      return (
                        <td key={v.id} className="py-3.5 px-2 text-center">
                          <button
                            onClick={() => onInitiateSecureEdit(std.dni, std.lastName + ", " + std.name, v.id, val)}
                            className={`w-14 py-2 px-1 border rounded text-center font-mono font-black text-xs transition-all hover:scale-110 select-none cursor-pointer ${
                              !hasGrade
                                ? "bg-white text-slate-300 border-slate-200 hover:border-slate-400"
                                : cellIsApproved
                                ? "bg-emerald-50 text-emerald-800 border-emerald-250 hover:bg-emerald-100/80"
                                : "bg-[#8B0026]/5 text-[#8B0026] border-red-200 hover:bg-[#8B0026]/10"
                            }`}
                            title="Cambiar nota de forma segura"
                          >
                            {hasGrade ? numVal.toFixed(1) : "--"}
                          </button>
                        </td>
                      );
                    })}

                    {/* Calculated Averages */}
                    <td className="py-3.5 px-4 text-center border-l bg-slate-50/40">
                      {isUnderWeight ? (
                        <span className="text-[10px] text-slate-400 italic font-medium">Incompleto</span>
                      ) : (
                        <span className={`text-base font-black font-mono tracking-tight ${isApproved ? "text-emerald-700" : "text-[#8B0026]"}`}>
                          {stats.average.toFixed(1)}
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-center bg-slate-50/40">
                      {isUnderWeight ? (
                        <span className="text-[10px] text-slate-350 italic font-semibold">Pendiente</span>
                      ) : isApproved ? (
                        <span className="text-[9px] font-black uppercase tracking-wider py-1 px-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-sm">APROBADO</span>
                      ) : (
                        <span className="text-[9px] font-black uppercase tracking-wider py-1 px-2.5 bg-red-50 border border-red-200 text-[#8B0026] rounded-sm">DESAPROBADO</span>
                      )}
                    </td>
                  </tr>

                  {/* Accordion Row for Taller & Laboratorio */}
                  {hasSubcomponents && isExpanded && (
                    <tr className="bg-slate-50/70 border-b border-slate-200">
                      <td colSpan={formula.variables.length + 4} className="p-4">
                        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-2xs space-y-3">
                          <div className="flex items-center justify-between border-b border-slate-100 pb-2">
                            <span className="text-[10px] font-mono font-bold text-slate-600 uppercase tracking-wider">
                              Desglose de Áreas Prácticas • {std.lastName}, {std.name}
                            </span>
                            <span className="text-[9px] font-mono font-bold text-slate-400 uppercase">
                              Evaluación Continua Curricular (PEC: 60%)
                            </span>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {subComponents.map((sub) => {
                              const subGrades = sub.studentGrades[std.dni];
                              const isApprovedSub = subGrades?.average !== null && subGrades?.average !== undefined && subGrades.average >= 12.5;

                              return (
                                <div key={sub.id} className="p-3.5 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2.5 text-left">
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                      <span className="text-[9.5px] font-mono font-bold text-slate-600 bg-white border border-slate-200 px-2 py-0.5 rounded">
                                        {sub.code}
                                      </span>
                                      <span className="text-[10.5px] font-black text-slate-800 uppercase">
                                        Parte {sub.id === "tal" ? "2: Taller" : "3: Laboratorio"}
                                      </span>
                                    </div>
                                    <span className="text-[9px] font-mono font-bold text-[#800521] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded uppercase">
                                      Peso: {sub.weightPct}% ({sub.credits} CR)
                                    </span>
                                  </div>

                                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                                    <span>Docente: {sub.teacherName}</span>
                                    <span className={`text-[9px] font-mono font-bold px-1.5 py-0.2 rounded uppercase ${
                                      sub.canEdit ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-slate-100 text-slate-500"
                                    }`}>
                                      {sub.canEdit ? "Modo Edición" : "Solo Lectura"}
                                    </span>
                                  </div>

                                  <div className="grid grid-cols-3 gap-2 pt-1">
                                    {sub.variables.map((v) => {
                                      const g = subGrades?.values[v.id];
                                      const hasG = g !== null && g !== undefined;

                                      return (
                                        <div key={v.id} className="bg-white p-2 rounded border border-slate-200 text-center shadow-3xs">
                                          <span className="text-[8.5px] font-bold text-slate-400 block uppercase truncate" title={v.label}>
                                            {v.id}
                                          </span>
                                          <span className="text-[7.5px] text-slate-400 font-mono block">
                                            ({Math.round(v.weight * 100)}%)
                                          </span>
                                          <div className="mt-1">
                                            {sub.canEdit ? (
                                              <button
                                                type="button"
                                                onClick={() => onInitiateSecureEdit(std.dni, `${std.lastName}, ${std.name}`, v.id, hasG ? String(g) : "", sub.courseId)}
                                                className="w-full py-1 px-1 border rounded text-center font-mono font-black text-xs bg-white text-slate-800 hover:border-slate-400 hover:scale-105 cursor-pointer transition-all"
                                                title={`Calificar ${v.id}`}
                                              >
                                                {hasG ? g.toFixed(1) : "--"}
                                              </button>
                                            ) : (
                                              <div
                                                className="w-full py-1 px-1 border border-slate-200 rounded text-center font-mono font-bold text-xs bg-slate-50 text-slate-600 flex items-center justify-center gap-1 cursor-not-allowed"
                                                title="Solo lectura. Calificado por el docente de área."
                                              >
                                                <Lock className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                                <span>{hasG ? g.toFixed(1) : "--"}</span>
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>

                                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px]">
                                    <span className="text-slate-500 font-medium">Promedio Parcial de {sub.name}:</span>
                                    <span className={`font-mono font-black text-xs ${
                                      subGrades?.average === null || subGrades?.average === undefined ? "text-slate-400" : isApprovedSub ? "text-emerald-700" : "text-rose-700"
                                    }`}>
                                      {subGrades?.average !== null && subGrades?.average !== undefined ? `${subGrades.average.toFixed(1)} / 20` : "NR"}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>

        {/* Save Panel footer row */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <button
            type="button"
            onClick={onSaveSheet}
            className="w-full sm:w-auto font-black text-[11px] uppercase tracking-wider py-2.5 px-5 rounded-xl border border-slate-300 bg-white hover:bg-slate-100 text-slate-750 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
          >
            <Save className="w-4 h-4 text-slate-500" /> Guardar Borrador
          </button>
          <div className="flex-1" />
          <button
            type="button"
            onClick={onPublishOfficial}
            className="w-full sm:w-auto font-black text-[11px] uppercase tracking-wider py-2.5 px-6 rounded-xl bg-[#800521] hover:bg-[#66041a] text-white transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md hover:shadow-lg active:scale-95"
          >
            <Check className="w-4 h-4 text-amber-300" /> Publicar Promedios Oficiales
          </button>
        </div>
      </div>
    </div>
  );
};
