import React from "react";
import { Download, Printer, Save, Check } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/Card";
import Button from "../../ui/Button";
import { ROSTER } from "../DocenteTypes";
import { CourseFormula } from "./CourseFormulaCard";

interface GradeSheetTableProps {
  formula: CourseFormula;
  sheetData: { [key: string]: string };
  computeStudentAverage: (studentDni: string) => { average: number; missingAny: boolean };
  onInitiateSecureEdit: (studentDni: string, studentName: string, variableId: string, currentVal: string) => void;
  onExportExcel: () => void;
  onExportPDF: () => void;
  onSaveSheet: () => void;
  onPublishOfficial: () => void;
}

export const GradeSheetTable: React.FC<GradeSheetTableProps> = ({
  formula,
  sheetData,
  computeStudentAverage,
  onInitiateSecureEdit,
  onExportExcel,
  onExportPDF,
  onSaveSheet,
  onPublishOfficial
}) => {
  return (
    <Card className="border border-slate-150">
      <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
        <div>
          <CardTitle>Planilla Digital de Registro Seguro de Calificaciones</CardTitle>
          <CardDescription>Edición bloqueada contra escritura directa. Haga clic sobre cualquier celda para desbloquear mediante su firma digital.</CardDescription>
        </div>
        <div className="flex flex-wrap gap-2 md:self-center shrink-0">
          <Button
            onClick={onExportExcel}
            variant="secondary"
            className="font-bold text-[10px] uppercase py-2.5 px-3.5 flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Exportar Excel
          </Button>
          <Button
            onClick={onExportPDF}
            variant="secondary"
            className="font-bold text-[10px] uppercase py-2.5 px-3.5 flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" /> Exportar PDF
          </Button>
        </div>
      </CardHeader>
      <CardContent className="p-0 overflow-x-auto select-text">
        <table className="w-full text-xs font-bold border-collapse text-left min-w-[700px]">
          <thead>
            <tr className="bg-slate-50 border-b text-slate-500 uppercase tracking-wider text-[9px] font-black">
              <th className="py-2.5 px-4">Alumno</th>
              <th className="py-2.5 px-3 font-mono w-24">DNI</th>
              {formula.variables.map((v) => (
                <th key={v.id} className="py-3 px-2 text-center w-24 font-mono leading-tight">
                  <span className="block text-slate-800">{v.id}</span>
                  <span className="text-[8px] text-slate-400 font-bold block">({v.weight * 100}%)</span>
                </th>
              ))}
              <th className="py-2.5 px-4 text-center w-28 text-[#8B0026] bg-slate-50 border-l">Promedio Final</th>
              <th className="py-2.5 px-4 text-center w-24 bg-slate-50">Condición</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-150/60 font-sans text-xs">
            {ROSTER.map((std) => {
              const stats = computeStudentAverage(std.dni);
              const isUnderWeight = stats.missingAny;
              const isApproved = stats.average >= 12.5;

              return (
                <tr key={std.dni} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <span className="font-extrabold text-slate-800 uppercase block leading-tight">
                      {std.lastName}, {std.name}
                    </span>
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
                      <span className={`text-base font-black font-mono tracking-tight ${isApproved ? "text-emerald-705 text-emerald-700" : "text-[#8B0026]"}`}>
                        {stats.average.toFixed(1)}
                      </span>
                    )}
                  </td>

                  <td className="py-3.5 px-4 text-center bg-slate-50/40">
                    {isUnderWeight ? (
                      <span className="text-[10px] text-slate-350 italic font-semibold">Pendiente</span>
                    ) : isApproved ? (
                      <span className="text-[9px] font-black uppercase tracking-wider py-1 px-2.5 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-sm">ADMITIDO</span>
                    ) : (
                      <span className="text-[9px] font-black uppercase tracking-wider py-1 px-2.5 bg-red-50 border border-red-200 text-[#8B0026] rounded-sm">DESAPROBADO</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {/* Save Panel footer row */}
        <div className="p-5 bg-slate-50 border-t flex flex-col sm:flex-row justify-between items-center gap-3">
          <Button
            onClick={onSaveSheet}
            variant="secondary"
            className="font-black text-[11px] uppercase tracking-wider py-3 px-6"
          >
            <Save className="w-4 h-4 mr-1.5 text-slate-500" /> Guardar Cambios
          </Button>
          <div className="flex-1" />
          <Button
            onClick={onPublishOfficial}
            variant="primary"
            className="font-black text-[11px] uppercase tracking-wider py-3 px-6 bg-[#8B0026] text-white"
          >
            <Check className="w-4 h-4 mr-1.5" /> Publicar Promedios Oficiales
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
