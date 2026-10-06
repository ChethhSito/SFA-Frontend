import React, { useState } from "react";
import { X, FileSpreadsheet, CheckCircle2, GraduationCap } from "lucide-react";
import { Course } from "../../../types";
import { ROSTER } from "../DocenteTypes";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "../../ui/Card";
import Badge from "../../ui/Badge";
import Button from "../../ui/Button";
import PageHeader from "../../ui/PageHeader";

interface Props {
  course: Course;
  weeksCount: number;
  materialsCount: number;
  assignmentsCount: number;
  averageGpa: number;
}

export function CierreCurso({ course, weeksCount, materialsCount, assignmentsCount, averageGpa }: Props) {
  const [showActaModal, setShowActaModal] = useState(false);
  const [isSigned, setIsSigned] = useState(false);
  const [signDni, setSignDni] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSignActa = (e: React.FormEvent) => {
    e.preventDefault();
    if (signDni.length < 8) {
      alert("Por favor ingrese un DNI válido de 8 dígitos para proceder con la firma segura.");
      return;
    }
    setIsSigned(true);
    showToast("🎉 ¡Acta firmada digitalmente con éxito! Los registros se han cerrado y enviado al Coordinador Académico del IESTP San Francisco de Asís.");
  };

  return (
    <div className="space-y-6 text-left relative">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md p-4 bg-emerald-600 text-white rounded-xl shadow-2xl flex items-start gap-3 border border-emerald-500 animate-slide-up">
          <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5 text-amber-300" />
          <div className="text-xs font-bold font-sans">
            <span className="block font-black text-white text-[13px] mb-1">PROCESAMIENTO COMPLETED</span>
            <p>{toastMessage}</p>
          </div>
          <button onClick={() => setToastMessage(null)} className="p-1 hover:bg-emerald-750 rounded text-emerald-100">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <PageHeader
        title="CIERRE DE CURSO: Cómputo Final de Evaluación"
        subtitle="Cierre formal de asignatura académica regulada. Genere actas nominales autorizadas con firma digital de DNI."
        icon={<CheckCircle2 className="w-5 h-5 text-[#8B0026]" />}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Summary */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div>
              <CardTitle>Resumen Histórico de Ejecución Académica</CardTitle>
              <CardDescription>Consolidado final de dictado semestral regular</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-5 text-xs text-slate-700 font-bold divide-y divide-slate-100/70">
            <div className="py-3 flex justify-between">
              <span className="text-slate-400">Total de Semanas Ejecutadas:</span>
              <span className="text-slate-900 font-extrabold">{weeksCount} de 16 Semanas Curriculares</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-slate-400">Materiales de Estudio Publicados:</span>
              <span className="text-slate-900">{materialsCount} recursos didácticos activos</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-slate-400">Talleres y Prácticas Validadas:</span>
              <span className="text-slate-900">{assignmentsCount} tareas evaluadas</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-slate-400">Promedio General de Rendimiento:</span>
              <span className="text-[#8B0026] font-display font-black text-sm">{averageGpa.toFixed(2)} / 20</span>
            </div>
            <div className="py-3 flex justify-between">
              <span className="text-slate-400">Estado de Envío de Actas:</span>
              <span>
                {isSigned ? (
                  <Badge variant="success" className="font-extrabold tracking-wider px-3 border py-0.5 text-[9px] uppercase">ENVIADO Y FIRMADO</Badge>
                ) : (
                  <Badge variant="warning" className="font-extrabold tracking-wider px-3 border py-0.5 text-[9px] uppercase">PENDIENTE DE FIRMA</Badge>
                )}
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <Card>
          <CardHeader>
            <div>
              <CardTitle>Servicios de Coordinación</CardTitle>
              <CardDescription>Acciones de fin de curso</CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-5 flex flex-col gap-3">
            <Button onClick={() => setShowActaModal(true)} variant="primary" fullWidth className="font-black text-[10px] py-3 uppercase tracking-wider bg-[#8B0026]">
              <FileSpreadsheet className="w-4 h-4 mr-1.5 text-amber-300 animate-pulse" /> Generar Acta Oficial SFA
            </Button>
            <Button onClick={() => showToast("📈 El Reporte Consolidado de Rendimiento ha sido exitosamente generado y enviado a Coordinación Académica.")} variant="outline" fullWidth className="font-black text-[10px]">
              Generar Reporte de Rendimiento
            </Button>
            <Button onClick={() => showToast("📥 El PDF oficial del curso con todas sus calificaciones ha sido descargado al sistema.")} variant="outline" fullWidth className="font-black text-[10px]">
              Exportar a PDF
            </Button>
            <Button onClick={() => showToast("📊 La hoja de cálculo Excel (.xlsx) de notas de alumnos se compiló y descargó.")} variant="outline" fullWidth className="font-black text-[10px]">
              Exportar a Excel
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Acta Modal */}
      {showActaModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-fade-in font-sans">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white p-6 shadow-2xl relative border-t-8 border-[#8B0026] text-left">
            <button
              onClick={() => setShowActaModal(false)}
              className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 rounded-lg cursor-pointer text-slate-450"
            >
              <X className="w-5 h-5" />
            </button>

            <CardHeader className="border-b pb-4">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 bg-[#8B0026] text-[#CFA020] rounded-xl flex items-center justify-center font-bold shadow-md">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <CardTitle>ACTA CONSOLIDADA DE EVALUACIÓN SEMESTRAL</CardTitle>
                  <CardDescription>IESTP San Francisco de Asís • Cátedra: {course.name} ({course.code})</CardDescription>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-5 font-sans space-y-5 text-slate-800 text-xs font-bold leading-normal">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-wrap justify-between gap-4">
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">PROGRAMA ACADÉMICO</span>
                  <span className="text-slate-900 uppercase">Sistemas & Electrotecnia</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase">DOCENTE AUXILIAR</span>
                  <span className="text-slate-900">Ing. Miguel Ángel Ramos Torres</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[9px] uppercase font-bold">SEMESTRE LECTIVO</span>
                  <span className="text-slate-900">Regular</span>
                </div>
              </div>

              <div className="space-y-2 border rounded-xl overflow-hidden divide-y divide-slate-100">
                <div className="p-3 bg-slate-100 flex justify-between text-[10px] font-black text-slate-450 tracking-wider uppercase select-none">
                  <span className="w-1/3">DNI & Alumno</span>
                  <span className="w-1/4 text-center">N1 (S4)</span>
                  <span className="w-1/4 text-center">N2 (S8)</span>
                  <span className="w-1/4 text-center">Promedio Final</span>
                </div>
                {ROSTER.map((std, idx) => {
                  const grade1 = [17, 15, 14, 16, 12][idx];
                  const grade2 = [18, 16, 15, 14, 11][idx];
                  const finalAvg = Math.round((grade1 + grade2) / 2);
                  return (
                    <div key={std.dni} className="p-3.5 flex justify-between items-center bg-white">
                      <div className="w-1/3 text-left">
                        <span className="font-extrabold text-slate-900 block">{std.name} {std.lastName}</span>
                        <span className="text-[9.5px] text-slate-400">DNI: {std.dni}</span>
                      </div>
                      <span className="w-1/4 text-center font-mono font-bold text-slate-700">{grade1}</span>
                      <span className="w-1/4 text-center font-mono font-bold text-slate-700">{grade2}</span>
                      <span className="w-1/4 text-center font-mono font-black text-[#8B0026] text-sm">{finalAvg}</span>
                    </div>
                  );
                })}
              </div>

              {/* Digital Signature */}
              <div className="p-5 border border-dashed rounded-xl border-[#8B0026]/40 bg-zinc-50/50 flex flex-col md:flex-row justify-between items-center gap-6">
                <div className="text-left space-y-1 md:max-w-md">
                  <span className="text-[#8B0026] block font-black text-xs uppercase tracking-wider">Firma Electrónica Autorizada SFA</span>
                  <p className="text-[10px] text-slate-500 font-medium">
                    Al proceder con su firma ingresando su DNI de identificación oficial, las notas pasarán a un estado permanente de sólo lectura, sincronizadas con el sistema nacional de actas del Ministerio de Educación del Perú.
                  </p>
                </div>

                {isSigned ? (
                  <div className="flex items-center gap-2 text-emerald-600 border border-emerald-200 bg-emerald-50 px-4 py-2.5 rounded-lg">
                    <CheckCircle2 className="w-5 h-5 shrink-0" />
                    <span className="text-xs uppercase font-extrabold tracking-wider">FIRMADO ELECTRÓNICAMENTE</span>
                  </div>
                ) : (
                  <form onSubmit={handleSignActa} className="flex gap-2 w-full md:w-auto">
                    <input
                      type="password"
                      required
                      placeholder="Ingrese DNI Docente"
                      value={signDni}
                      onChange={(e) => setSignDni(e.target.value.replace(/\D/g, "").slice(0, 8))}
                      className="w-44 px-3 py-2 bg-white border rounded-md font-mono text-center tracking-widest focus:outline-[#8B0026] font-black text-sm h-10"
                    />
                    <Button type="submit" variant="primary" className="font-black text-[9.5px] tracking-wider uppercase bg-[#8B0026] h-10 text-white shrink-0 px-4">
                      Firmar Acta
                    </Button>
                  </form>
                )}
              </div>
            </CardContent>

            <CardFooter className="bg-slate-50 justify-end gap-2 p-4">
              <Button onClick={() => setShowActaModal(false)} variant="outline" className="font-bold text-xs">
                Cerrar Vista Preliminar
              </Button>
            </CardFooter>
          </Card>
        </div>
      )}
    </div>
  );
}
