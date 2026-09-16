import React from "react";
import { Users } from "lucide-react";
import { Applicant, Enrollment } from "../../../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/Card";
import PageHeader from "../../ui/PageHeader";
import PageTransition from "../../ui/PageTransition";

interface VistasTabProps {
  applicants: Applicant[];
  enrollments: Enrollment[];
  selectedPeriodId: string;
  onUpdateApplicants: (apps: Applicant[]) => void;
  renderPeriodSelector: () => React.ReactNode;
}

export const VistasTab: React.FC<VistasTabProps> = ({
  applicants,
  enrollments,
  selectedPeriodId,
  onUpdateApplicants,
  renderPeriodSelector,
}) => {
  const activeApps = applicants.filter((app) => app.periodId === selectedPeriodId);
  const totalAppsCount = activeApps.length;
  const completedDossiers = activeApps.filter((app) => {
    const isDni = app.docs?.dniFile?.status === "Validado";
    const isCert = app.docs?.certificadoFile?.status === "Validado";
    const isPartida = app.docs?.partidaFile ? app.docs.partidaFile.status === "Validado" : true;
    const isFoto = app.docs?.fotoFile?.status === "Validado";
    const isPayment = app.paymentStatus === "Validado";
    return isDni && isCert && isPartida && isFoto && isPayment;
  });

  const admittedList = activeApps.filter((a) => a.admitted === "ADMITIDO" || a.admitted === true);
  const enrolledList = enrollments.filter((enr) => {
    const isApp = applicants.find((a) => a.dni === enr.studentDni && a.periodId === selectedPeriodId);
    return enr.academicStatus === "MATRICULADO" && isApp;
  });

  const revenue = activeApps.filter((a) => a.paymentStatus === "Validado").length * 120;

  return (
    <PageTransition id="vistas" className="space-y-6">
      <PageHeader
        title="Vistas y Reportes de Admisión"
        subtitle="Consulte estadísticas generales del proceso de admisión, analice el embudo de conversión y registre los resultados del examen de suficiencia académica."
        icon={<Users className="w-6 h-6 text-[#9F062A]" />}
        actions={renderPeriodSelector()}
      />

      <div className="space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-3xs text-left">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">
              1. Prepostulantes
            </span>
            <span className="text-xl font-black text-slate-800 mt-1 block font-mono">{totalAppsCount}</span>
            <span className="text-[9px] text-slate-500 font-bold block mt-0.5">En este período</span>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-3xs text-left">
            <span className="text-[9px] text-amber-600 font-extrabold uppercase tracking-wider block">
              2. Expedientes Aptos
            </span>
            <span className="text-xl font-black text-amber-700 mt-1 block font-mono">{completedDossiers.length}</span>
            <span className="text-[9px] text-slate-550 font-bold block mt-0.5">Pagos y Docs aprobados</span>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-3xs text-left">
            <span className="text-[9px] text-[#9F062A] font-extrabold uppercase tracking-wider block">
              3. Admitidos (Examen)
            </span>
            <span className="text-xl font-black text-[#9F062A] mt-1 block font-mono">{admittedList.length}</span>
            <span className="text-[9px] text-slate-500 font-bold block mt-0.5">Ingresantes aprobados</span>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-3xs text-left">
            <span className="text-[9px] text-emerald-600 font-extrabold uppercase tracking-wider block">
              4. Matriculados
            </span>
            <span className="text-xl font-black text-emerald-700 mt-1 block font-mono">{enrolledList.length}</span>
            <span className="text-[9px] text-slate-550 font-bold block mt-0.5">Con matrícula confirmada</span>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-3xs text-left col-span-1 sm:col-span-2 lg:col-span-1">
            <span className="text-[9px] text-blue-600 font-extrabold uppercase tracking-wider block">
              Total Recaudación
            </span>
            <span className="text-xl font-black text-blue-800 mt-1 block font-mono">S/. {revenue.toFixed(2)}</span>
            <span className="text-[9px] text-slate-500 font-bold block mt-0.5">Por derecho de admisión</span>
          </div>
        </div>

        {/* Funnel chart and program division */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 text-left">
          <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-4">
            <h3 className="font-extrabold text-[11px] uppercase text-slate-500 tracking-wider">Embudo de Proceso</h3>
            <div className="space-y-3.5">
              {[
                { label: "Postulación Inicial", value: totalAppsCount, pct: 100, color: "bg-slate-400" },
                {
                  label: "Expediente Validado",
                  value: completedDossiers.length,
                  pct: totalAppsCount ? Math.round((completedDossiers.length / totalAppsCount) * 100) : 0,
                  color: "bg-amber-500",
                },
                {
                  label: "Admitidos (Ingresantes)",
                  value: admittedList.length,
                  pct: totalAppsCount ? Math.round((admittedList.length / totalAppsCount) * 100) : 0,
                  color: "bg-[#9F062A]",
                },
                {
                  label: "Matrícula Completada",
                  value: enrolledList.length,
                  pct: admittedList.length ? Math.round((enrolledList.length / admittedList.length) * 100) : 0,
                  color: "bg-emerald-500",
                },
              ].map((step, sIdx) => (
                <div key={sIdx} className="space-y-1">
                  <div className="flex justify-between text-xs font-bold text-slate-700">
                    <span>{step.label}</span>
                    <span className="font-mono font-black">
                      {step.value} ({step.pct}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                    <div className={`${step.color} h-2 rounded-full`} style={{ width: `${Math.min(100, step.pct)}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-3xs space-y-4">
            <h3 className="font-extrabold text-[11px] uppercase text-slate-500 tracking-wider">
              Distribución por Programas de Estudio
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-gradient-to-br from-slate-50 to-emerald-50/20 border border-slate-150 rounded-xl">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">ELECTRICIDAD INDUSTRIAL</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 leading-none">
                    {activeApps.filter((a) => a.programId === "electronica").length}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">Inscritos</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600 font-mono pt-2.5 border-t border-slate-100">
                  <div>
                    Admitidos:{" "}
                    <span className="font-black text-[#9F062A]">
                      {admittedList.filter((a) => a.programId === "electronica").length}
                    </span>
                  </div>
                  <div>
                    Matriculados:{" "}
                    <span className="font-black text-emerald-700">
                      {enrolledList.filter((item) => item.programId === "electronica").length}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gradient-to-br from-slate-50 to-blue-50/20 border border-slate-150 rounded-xl">
                <span className="text-[10px] text-slate-400 font-extrabold uppercase">CONTABILIDAD</span>
                <div className="mt-2 flex items-baseline gap-2">
                  <span className="text-2xl font-black text-slate-900 leading-none">
                    {activeApps.filter((a) => a.programId === "contabilidad").length}
                  </span>
                  <span className="text-xs text-slate-500 font-bold">Inscritos</span>
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2 text-[10px] font-bold text-slate-600 font-mono pt-2.5 border-t border-slate-100">
                  <div>
                    Admitidos:{" "}
                    <span className="font-black text-[#9F062A]">
                      {admittedList.filter((a) => a.programId === "contabilidad").length}
                    </span>
                  </div>
                  <div>
                    Matriculados:{" "}
                    <span className="font-black text-emerald-700">
                      {enrolledList.filter((item) => item.programId === "contabilidad").length}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Grading and Admission exam results board */}
        <Card>
          <CardHeader>
            <div className="text-left">
              <CardTitle>Resultados Académicos y Calificación del Examen</CardTitle>
              <CardDescription>
                Rellene el resultado oficial para los postulantes calificados correspondientes al período seleccionado. Cuando marque a un postulante como ADMITIDO, pasará instantáneamente a la bandeja de matrícula de Ingresantes.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {completedDossiers.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-xs font-bold leading-normal">
                No se han detectado expedientes completamente aprobados (carpeta validada y pago validado) en este período aún.
              </div>
            ) : (
              <div className="overflow-x-auto text-xs font-semibold animate-scale-up">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase border-b border-slate-100">
                      <th className="p-4 text-left">Postulante</th>
                      <th className="p-4 text-left">DNI</th>
                      <th className="p-4 text-left">Especialidad Postulada</th>
                      <th className="p-4 text-left">Expediente Administrativo</th>
                      <th className="p-4 text-center">Estado del Examen / Admisión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                    {completedDossiers.map((app, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 text-left">
                          <span className="font-black text-slate-900 block">
                            {app.name} {app.lastName}
                          </span>
                          <span className="text-[10px] text-slate-400 font-bold uppercase">
                            {app.applicantCode || "Sin Código"}
                          </span>
                        </td>
                        <td className="p-4 font-mono font-bold text-slate-600">{app.dni}</td>
                        <td className="p-4 uppercase text-[10.5px]">
                          {app.programId === "electronica" ? "Electricidad Industrial" : "Contabilidad"}
                        </td>
                        <td className="p-4 text-left">
                          <span className="px-2.5 py-1 bg-emerald-100 text-emerald-850 border border-emerald-250 rounded-full text-[9px] font-black uppercase tracking-wider">
                            EXPEDIENTE COMPLETO
                          </span>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex items-center justify-center">
                            <select
                              value={
                                app.admitted === "ADMITIDO" || app.admitted === true
                                  ? "admitido"
                                  : app.admitted === "NO ADMITIDO"
                                  ? "no_admitido"
                                  : "pendiente"
                              }
                              onChange={(e) => {
                                const val = e.target.value;
                                const updatedList = applicants.map((a) => {
                                  if (a.dni === app.dni) {
                                    let admittedValue: "PENDIENTE" | "ADMITIDO" | "NO ADMITIDO" = "PENDIENTE";
                                    let folderStatusValue: "Pending" | "Observed" | "Approved" | "Enrolled" = "Pending";
                                    if (val === "admitido") {
                                      admittedValue = "ADMITIDO";
                                      folderStatusValue = "Approved";
                                    } else if (val === "no_admitido") {
                                      admittedValue = "NO ADMITIDO";
                                      folderStatusValue = "Pending";
                                    } else {
                                      admittedValue = "PENDIENTE";
                                      folderStatusValue = "Pending";
                                    }
                                    return {
                                      ...a,
                                      admitted: admittedValue,
                                      folderStatus: folderStatusValue,
                                    };
                                  }
                                  return a;
                                });
                                onUpdateApplicants(updatedList);

                                if (val === "admitido") {
                                  alert(`El ingresante ${app.name} ${app.lastName} ahora figura con el resultado ADMITIDO.`);
                                } else if (val === "no_admitido") {
                                  alert(`El postulante ${app.name} ${app.lastName} ha sido calificado como NO ADMITIDO.`);
                                } else {
                                  alert(`El postulante ${app.name} ${app.lastName} queda en estado PENDIENTE.`);
                                }
                              }}
                              className="text-[11px] font-sans font-extrabold uppercase tracking-wider bg-white border border-slate-300 rounded-md px-3 py-1.5 text-slate-800 shadow-3xs cursor-pointer focus:outline-none focus:border-[#9F062A]"
                            >
                              <option value="pendiente">PENDIENTE / SIN ENTRAR</option>
                              <option value="admitido">ADMITIDO (INSPECTADO)</option>
                              <option value="no_admitido">NO ADMITIDO / OMISO</option>
                            </select>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageTransition>
  );
};
