import React from "react";
import { Calendar, Plus, Trash2, CheckCircle, CheckCircle2, ShieldAlert, Clock, FileText, CreditCard, Award, GraduationCap, Compass } from "lucide-react";
import { AdmissionPeriod, MpaPeriod } from "../../../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/Card";
import PageHeader from "../../ui/PageHeader";
import PageTransition from "../../ui/PageTransition";
import Button from "../../ui/Button";

interface PeriodosTabProps {
  admissionPeriods: AdmissionPeriod[];
  mpaPeriods: MpaPeriod[];
  selectedAcademicPeriodId: string;
  newPeriodPreEnrollmentStartDate: string;
  setNewPeriodPreEnrollmentStartDate: (v: string) => void;
  newPeriodPreEnrollmentEndDate: string;
  setNewPeriodPreEnrollmentEndDate: (v: string) => void;
  newPeriodAdmissionDate: string;
  setNewPeriodAdmissionDate: (v: string) => void;
  newPeriodResultsPublicationDate: string;
  setNewPeriodResultsPublicationDate: (v: string) => void;
  newPeriodEnrollmentStartDate: string;
  setNewPeriodEnrollmentStartDate: (v: string) => void;
  newPeriodEnrollmentEndDate: string;
  setNewPeriodEnrollmentEndDate: (v: string) => void;
  newPeriodClassesStartDate: string;
  onMpaPeriodChange: (periodId: string) => void;
  onCreatePeriod: (e: React.FormEvent) => void;
  onUpdatePeriodStatus: (id: string, nextStatus: "PENDIENTE" | "APERTURADO" | "EXAMEN" | "MATRICULA" | "CERRADO") => void;
  onDeletePeriod: (id: string) => void;
  sanitizePeriodName: (str?: string) => string;
}

export const PeriodosTab: React.FC<PeriodosTabProps> = ({
  admissionPeriods,
  mpaPeriods,
  selectedAcademicPeriodId,
  newPeriodPreEnrollmentStartDate,
  setNewPeriodPreEnrollmentStartDate,
  newPeriodPreEnrollmentEndDate,
  setNewPeriodPreEnrollmentEndDate,
  newPeriodAdmissionDate,
  setNewPeriodAdmissionDate,
  newPeriodResultsPublicationDate,
  setNewPeriodResultsPublicationDate,
  newPeriodEnrollmentStartDate,
  setNewPeriodEnrollmentStartDate,
  newPeriodEnrollmentEndDate,
  setNewPeriodEnrollmentEndDate,
  newPeriodClassesStartDate,
  onMpaPeriodChange,
  onCreatePeriod,
  onUpdatePeriodStatus,
  onDeletePeriod,
  sanitizePeriodName,
}) => {
  return (
    <PageTransition id="periodos" className="space-y-6 animate-fade-in">
      <PageHeader
        title="Apertura y Gestión de Períodos de Admisión"
        subtitle="Cree nuevos períodos académicos de examen y programe sus fechas clave. Actívelos para habilitar o desactivar el formulario de pre-inscripción pública."
        icon={<Calendar className="w-6 h-6" />}
      />

      {/* General Admission Status Banner */}
      {admissionPeriods.find((p) => p.status === "APERTURADO" || p.isActive) ? (
        <div className="bg-emerald-50 border border-emerald-250 p-5 rounded-lg flex items-start gap-4 shadow-3xs animate-fade-in">
          <div className="p-2 bg-emerald-100 text-emerald-800 rounded-full shrink-0 animate-fade-in/70">
            <CheckCircle className="w-5 h-5 text-emerald-700 font-bold" />
          </div>
          <div className="space-y-0.5 text-left">
            <h4 className="text-xs font-black text-emerald-900 uppercase tracking-wide">
              PROCESO DE ADMISIÓN ACTIVO:{" "}
              {admissionPeriods.find((p) => p.status === "APERTURADO" || p.isActive)?.name}
            </h4>
            <p className="text-[11px] text-slate-600 font-semibold leading-relaxed">
              El formulario de pre-inscripción en línea está habilitado para recibir postulantes en el portal público con el cronograma configurado.
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-amber-50 border border-amber-250 p-5 rounded-lg flex items-start gap-4 shadow-3xs animate-fade-in">
          <div className="p-2 bg-amber-100 text-amber-800 rounded-full shrink-0 animate-pulse">
            <ShieldAlert className="w-5 h-5 text-amber-700" />
          </div>
          <div className="space-y-0.5 text-left">
            <h4 className="text-xs font-black text-amber-900 uppercase tracking-wide">
              PORTAL DE ADMISIÓN DESACTIVADO
            </h4>
            <p className="text-[11px] text-slate-650 font-semibold leading-relaxed">
              No hay ningún periodo de admisión activo en este momento. El formulario público de admisión mostrará el siguiente aviso:
            </p>
            <div className="mt-2 bg-rose-50 text-[#9F062A] text-[10px] font-black uppercase px-3 py-1.5 text-center rounded border border-rose-100 inline-block tracking-wide shadow-3xs">
              Pronto se reaperturarán los exámenes de admisión
            </div>
          </div>
        </div>
      )}

      {/* Interactive Stacked Layout: Top Form, Bottom List */}
      <div className="space-y-6">
        {/* Top Form card: Create Period */}
        <Card>
          <CardHeader className="border-b border-slate-100">
            <div>
              <CardTitle>Aperturar Nuevo Periodo de Admisión</CardTitle>
              <CardDescription>
                Registre un nuevo ciclo académico reprogramando sus fechas clave de pre-inscripción, examen y matrícula
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            {mpaPeriods.length === 0 ? (
              <div className="py-8 px-4 text-center space-y-4">
                <div className="w-12 h-12 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mx-auto text-[#9F062A]">
                  <ShieldAlert className="w-6 h-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider block">
                    Planificación requerida
                  </h4>
                  <p className="text-[11px] text-slate-500 font-semibold leading-relaxed">
                    No se registran períodos académicos en el MPA. Es obligatorio que primero cree al menos un período académico en el Módulo de Planificación Académica antes de aperturar un proceso de admisión.
                  </p>
                </div>
                <div className="pt-2">
                  <span className="inline-block bg-rose-50 text-[#9F062A] text-[9px] font-black uppercase px-3 py-1.5 rounded tracking-wider border border-rose-100">
                    Requiere Registro en MPA
                  </span>
                </div>
              </div>
            ) : (
              <form onSubmit={onCreatePeriod} className="space-y-6 text-xs font-semibold text-left">
                <div className="space-y-2 max-w-xl">
                  <label className="block text-[10px] font-black text-[#9F062A] uppercase tracking-wide">
                    Seleccionar Período Académico del MPA *
                  </label>
                  <select
                    required
                    value={selectedAcademicPeriodId}
                    onChange={(e) => onMpaPeriodChange(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:outline-hidden focus:ring-1 focus:ring-[#9F062A] focus:bg-white font-extrabold text-slate-800 cursor-pointer"
                  >
                    <option value="">-- SELECCIONE PERÍODO ACADÉMICO --</option>
                    {mpaPeriods.map((ap) => {
                      const alreadyLinked = admissionPeriods.some((adp) => adp.academicPeriodId === ap.id);
                      return (
                        <option key={ap.id} value={ap.id} disabled={alreadyLinked}>
                          {sanitizePeriodName(ap.name)} {alreadyLinked ? " (Ya tiene Admisión)" : ""}
                        </option>
                      );
                    })}
                  </select>
                  <p className="text-[10px] text-slate-400 font-bold leading-normal">
                    Por restricciones de integración, un Período Académico solo puede tener un único Período de Admisión asociado.
                  </p>
                  {selectedAcademicPeriodId && (
                    <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 text-[10px] text-amber-900 leading-normal font-medium space-y-1 animate-fade-in mt-2">
                      <span className="font-extrabold uppercase text-amber-800 flex items-center gap-1 text-[9.5px]">
                        Fechas Sugeridas Calculadas
                      </span>
                      <p>
                        Se han pre-completado fechas referenciales calculadas en base a la Fecha de Inicio de Clases del MPA:
                      </p>
                      <ul className="list-disc pl-3.5 space-y-0.5 mt-1 font-bold text-amber-850">
                        <li>
                          <strong>Pre-Inscripción:</strong> 35 días antes del inicio de clases
                        </li>
                        <li>
                          <strong>Evaluación y Publicación:</strong> 20 días antes del inicio de clases
                        </li>
                        <li>
                          <strong>Matrícula Regular:</strong> 10 días antes del inicio de clases
                        </li>
                      </ul>
                    </div>
                  )}
                </div>

                {/* 4 HORIZONTAL GRID COLUMNS FOR DATES */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-2 border-t border-slate-100">
                  {/* Section 1: Pre-inscripción */}
                  <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-3">
                    <span className="block text-[10px] font-black text-[#9F062A] uppercase tracking-widest border-b pb-1.5 border-slate-200">
                      1. Pre-Inscripción Virtual
                    </span>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase">
                          Fecha Inicio
                        </label>
                        <input
                          type="date"
                          required
                          value={newPeriodPreEnrollmentStartDate}
                          max={newPeriodPreEnrollmentEndDate || undefined}
                          onChange={(e) => setNewPeriodPreEnrollmentStartDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-[#9F062A] cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase">
                          Fecha Límite
                        </label>
                        <input
                          type="date"
                          required
                          value={newPeriodPreEnrollmentEndDate}
                          min={newPeriodPreEnrollmentStartDate || undefined}
                          max={newPeriodAdmissionDate || undefined}
                          onChange={(e) => setNewPeriodPreEnrollmentEndDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-[#9F062A] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 2: Examen y Publicación */}
                  <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-3">
                    <span className="block text-[10px] font-black text-[#9F062A] uppercase tracking-widest border-b pb-1.5 border-slate-200">
                      2. Evaluación y Publicación
                    </span>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase">
                          Fecha de Examen
                        </label>
                        <input
                          type="date"
                          required
                          value={newPeriodAdmissionDate}
                          min={newPeriodPreEnrollmentEndDate || newPeriodPreEnrollmentStartDate || undefined}
                          max={newPeriodResultsPublicationDate || undefined}
                          onChange={(e) => setNewPeriodAdmissionDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-[#9F062A] cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase">
                          Publicación Resultados
                        </label>
                        <input
                          type="date"
                          required
                          value={newPeriodResultsPublicationDate}
                          min={newPeriodAdmissionDate || undefined}
                          max={newPeriodEnrollmentStartDate || undefined}
                          onChange={(e) => setNewPeriodResultsPublicationDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-[#9F062A] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 3: Matrícula Regular */}
                  <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-3">
                    <span className="block text-[10px] font-black text-[#9F062A] uppercase tracking-widest border-b pb-1.5 border-slate-200">
                      3. Matrícula Regular
                    </span>
                    <div className="space-y-2">
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase">
                          Inicio Matrícula
                        </label>
                        <input
                          type="date"
                          required
                          value={newPeriodEnrollmentStartDate}
                          min={newPeriodResultsPublicationDate || newPeriodAdmissionDate || undefined}
                          max={newPeriodEnrollmentEndDate || undefined}
                          onChange={(e) => setNewPeriodEnrollmentStartDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-[#9F062A] cursor-pointer"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase">
                          Límite Matrícula
                        </label>
                        <input
                          type="date"
                          required
                          value={newPeriodEnrollmentEndDate}
                          min={newPeriodEnrollmentStartDate || undefined}
                          max={newPeriodClassesStartDate || undefined}
                          onChange={(e) => setNewPeriodEnrollmentEndDate(e.target.value)}
                          className="w-full px-2.5 py-1.5 bg-white border border-slate-300 rounded-lg text-xs font-bold focus:outline-hidden focus:ring-1 focus:ring-[#9F062A] cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Section 4: Inicio de Clases */}
                  <div className="p-4 bg-slate-50/70 border border-slate-200/80 rounded-xl space-y-3 flex flex-col justify-between">
                    <div>
                      <span className="block text-[10px] font-black text-[#9F062A] uppercase tracking-widest border-b pb-1.5 border-slate-200 mb-3">
                        4. Inicio del Ciclo Académico
                      </span>
                      <div className="space-y-1">
                        <label className="block text-[9px] font-bold text-slate-500 uppercase">
                          Fecha Inicio Clases (MPA)
                        </label>
                        <input
                          type="date"
                          disabled
                          value={newPeriodClassesStartDate}
                          className="w-full px-3 py-1.5 bg-slate-200/70 border border-slate-300 rounded-lg text-xs font-bold text-slate-600 cursor-not-allowed"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex justify-end pt-2">
                  <Button
                    type="submit"
                    variant="primary"
                    className="font-extrabold uppercase text-xs tracking-wider py-3 px-6 flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Registrar Periodo de Admisión</span>
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        {/* Bottom List of Periods (Full Width) */}
        <Card>
          <CardHeader className="border-b border-slate-100">
            <div>
              <CardTitle>Listado de Periodos Académicos Registrados</CardTitle>
              <CardDescription>
                Habilite o deshabilite el estado de admisión (Los registros son indefinidos y no se eliminan)
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {mpaPeriods.length === 0 ? (
              <div className="p-12 text-center space-y-3 col-span-full">
                <div className="w-12 h-12 rounded-full bg-slate-50 border border-slate-150 flex items-center justify-center mx-auto text-slate-400 mb-2">
                  <Calendar className="w-6 h-6" />
                </div>
                <p className="text-slate-500 font-extrabold text-xs uppercase tracking-wider">
                  Sin períodos académicos en MPA
                </p>
                <p className="text-[11px] text-slate-400 font-semibold leading-normal max-w-sm mx-auto">
                  Debe registrar y publicar primeramente un período escolar dentro del módulo de Planificación Académica (MPA) para habilitar esta vista.
                </p>
              </div>
            ) : admissionPeriods.length === 0 ? (
              <div className="p-8 text-center text-slate-400 font-semibold text-xs">
                No hay periodos registrados en el sistema.
              </div>
            ) : (
              <div className="divide-y text-xs font-semibold divide-slate-100">
                {admissionPeriods.map((period) => (
                  <div key={period.id} className="p-5 space-y-4 hover:bg-slate-50/40 transition-all text-left">
                    {/* Header bar: Title & Status badge */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200/80 shadow-2xs">
                      <div className="flex items-center gap-3 flex-wrap">
                        <div className="p-2 rounded-lg bg-red-50 text-[#9F062A]">
                          <Calendar className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="font-black text-slate-900 tracking-wide text-base block">
                            ADMISIÓN {sanitizePeriodName(period.name)}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold block">
                            ID Periodo: {period.id}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {period.status === "APERTURADO" && (
                          <span className="px-3 py-1 bg-emerald-100/80 text-emerald-800 border border-emerald-200/80 text-xs font-black uppercase tracking-wider rounded-full flex items-center gap-1.5 shadow-3xs">
                            <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Aperturado (Pre-Inscripción)
                          </span>
                        )}
                        {period.status === "PENDIENTE" && (
                          <span className="px-3 py-1 bg-amber-100/80 text-amber-800 border border-amber-200/80 text-xs font-black uppercase tracking-wider rounded-full flex items-center gap-1.5 shadow-3xs">
                            <Clock className="w-4 h-4 text-amber-600" /> Pendiente (Inactivo)
                          </span>
                        )}
                        {period.status === "EXAMEN" && (
                          <span className="px-3 py-1 bg-red-100/80 text-[#9F062A] border border-red-200/80 text-xs font-black uppercase tracking-wider rounded-full flex items-center gap-1.5 shadow-3xs">
                            <FileText className="w-4 h-4 text-[#9F062A]" /> Examen de Admisión
                          </span>
                        )}
                        {period.status === "MATRICULA" && (
                          <span className="px-3 py-1 bg-indigo-100/80 text-indigo-800 border border-indigo-200/80 text-xs font-black uppercase tracking-wider rounded-full flex items-center gap-1.5 shadow-3xs">
                            <CreditCard className="w-4 h-4 text-indigo-600" /> Matrícula Regular
                          </span>
                        )}
                        {period.status === "CERRADO" && (
                          <span className="px-3 py-1 bg-slate-100 text-slate-600 border border-slate-200 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5 shadow-3xs">
                            Cerrado / Finalizado
                          </span>
                        )}
                      </div>
                    </div>

                    {/* 3x2 Grid for key dates & details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {/* Card 1: Pre-Inscripción Virtual */}
                      <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 space-y-1">
                        <span className="text-[9.5px] font-black uppercase text-slate-400 block tracking-wider">
                          PRE-INSCRIPCIÓN VIRTUAL
                        </span>
                        <div className="text-slate-800 font-extrabold text-xs flex items-center gap-2">
                          <FileText className="w-4 h-4 text-[#9F062A] shrink-0" />
                          <span>
                            {period.preEnrollmentStartDate
                              ? new Date(period.preEnrollmentStartDate + "T12:00:00").toLocaleDateString("es-PE", {
                                  day: "numeric",
                                  month: "short",
                                })
                              : "-"}{" "}
                            al{" "}
                            {period.preEnrollmentEndDate
                              ? new Date(period.preEnrollmentEndDate + "T12:00:00").toLocaleDateString("es-PE", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "-"}
                          </span>
                        </div>
                      </div>

                      {/* Card 2: Examen de Admisión */}
                      <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 space-y-1">
                        <span className="text-[9.5px] font-black uppercase text-slate-400 block tracking-wider">
                          EXAMEN DE ADMISIÓN
                        </span>
                        <div className="text-slate-800 font-extrabold text-xs flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-[#9F062A] shrink-0" />
                          <span>
                            {period.admissionDate
                              ? new Date(period.admissionDate + "T12:00:00").toLocaleDateString("es-PE", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })
                              : "-"}
                          </span>
                        </div>
                      </div>

                      {/* Card 3: Publicación de Resultados */}
                      <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 space-y-1">
                        <span className="text-[9.5px] font-black uppercase text-slate-400 block tracking-wider">
                          PUBLICACIÓN DE RESULTADOS
                        </span>
                        <div className="text-[#9F062A] font-extrabold text-xs flex items-center gap-2">
                          <Award className="w-4 h-4 text-[#9F062A] shrink-0" />
                          <span>
                            {period.resultsPublicationDate
                              ? new Date(period.resultsPublicationDate + "T12:00:00").toLocaleDateString("es-PE", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })
                              : "24 de Marzo, 2026"}
                          </span>
                        </div>
                      </div>

                      {/* Card 4: Matrícula Regular */}
                      <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 space-y-1">
                        <span className="text-[9.5px] font-black uppercase text-slate-400 block tracking-wider">
                          MATRÍCULA REGULAR
                        </span>
                        <div className="text-slate-800 font-extrabold text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span>
                            {period.enrollmentStartDate
                              ? new Date(period.enrollmentStartDate + "T12:00:00").toLocaleDateString("es-PE", {
                                  day: "numeric",
                                  month: "short",
                                })
                              : "-"}{" "}
                            al{" "}
                            {period.enrollmentEndDate
                              ? new Date(period.enrollmentEndDate + "T12:00:00").toLocaleDateString("es-PE", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric",
                                })
                              : "-"}
                          </span>
                        </div>
                      </div>

                      {/* Card 5: Inicio de Clases */}
                      <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 space-y-1">
                        <span className="text-[9.5px] font-black uppercase text-slate-400 block tracking-wider">
                          INICIO DE CLASES
                        </span>
                        <div className="text-indigo-950 font-black text-xs flex items-center gap-2">
                          <GraduationCap className="w-4 h-4 text-indigo-600 shrink-0" />
                          <span>
                            {period.classesStartDate
                              ? new Date(period.classesStartDate + "T12:00:00").toLocaleDateString("es-PE", {
                                  day: "numeric",
                                  month: "long",
                                  year: "numeric",
                                })
                              : "-"}
                          </span>
                        </div>
                      </div>

                      {/* Card 6: Período Asociado (MPA) */}
                      {(() => {
                        const mpaP = mpaPeriods.find((ap) => ap.id === period.academicPeriodId);
                        return (
                          <div className="bg-slate-50 border border-slate-200/70 rounded-xl p-3.5 space-y-1">
                            <span className="text-[9.5px] font-black uppercase text-slate-400 block tracking-wider">
                              PERÍODO ASOCIADO (MPA)
                            </span>
                            <div className="text-emerald-900 font-black text-xs flex items-center gap-2 uppercase">
                              <Compass className="w-4 h-4 text-emerald-600 shrink-0" />
                              <span>{mpaP ? sanitizePeriodName(mpaP.name) : "PERIODO PREESTABLECIDO"}</span>
                            </div>
                          </div>
                        );
                      })()}
                    </div>

                    {/* Action Bar */}
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 bg-slate-50/50 p-3 rounded-xl border border-slate-200/60">
                      <div className="flex items-center gap-3 flex-1">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-wider whitespace-nowrap">
                          Cambiar Estado:
                        </label>
                        <select
                          value={period.status}
                          onChange={(e) => onUpdatePeriodStatus(period.id, e.target.value as any)}
                          className="px-3 py-2 bg-white border border-slate-300 rounded-lg text-xs font-black text-slate-800 focus:outline-hidden focus:ring-1 focus:ring-[#9F062A] uppercase cursor-pointer flex-1 max-w-md shadow-3xs"
                        >
                          <option value="PENDIENTE">PENDIENTE (INACTIVO)</option>
                          <option value="APERTURADO">APERTURADO (PRE-INSCRIPCIÓN)</option>
                          <option value="EXAMEN">EXAMEN DE ADMISIÓN</option>
                          <option value="MATRICULA">REGISTRANDO MATRÍCULA</option>
                          <option value="CERRADO">CERRADO / FINALIZADO</option>
                        </select>
                      </div>

                      <button
                        onClick={() => onDeletePeriod(period.id)}
                        className="px-4 py-2 text-xs font-extrabold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 hover:border-rose-300 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-2 shadow-3xs"
                      >
                        <Trash2 className="w-4 h-4" />
                        <span>Eliminar Periodo</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};
