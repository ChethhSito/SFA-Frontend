import React from "react";
import { Users, MapPin } from "lucide-react";
import { Applicant } from "../../../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/Card";
import PageHeader from "../../ui/PageHeader";
import PageTransition from "../../ui/PageTransition";

interface PostulantesTabProps {
  applicants: Applicant[];
  selectedPeriodId: string;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  postulantesCareerFilter: string;
  setPostulantesCareerFilter: (c: string) => void;
  postulantesClassroomFilter: string;
  setPostulantesClassroomFilter: (c: string) => void;
  onUpdateApplicants: (apps: Applicant[]) => void;
  renderPeriodSelector: () => React.ReactNode;
}

export const PostulantesTab: React.FC<PostulantesTabProps> = ({
  applicants,
  selectedPeriodId,
  searchQuery,
  setSearchQuery,
  postulantesCareerFilter,
  setPostulantesCareerFilter,
  postulantesClassroomFilter,
  setPostulantesClassroomFilter,
  onUpdateApplicants,
  renderPeriodSelector,
}) => {
  const activeApps = applicants.filter((app) => app.periodId === selectedPeriodId);

  // A candidate is a ready "Postulante" once all 4 documents are validated AND payment is validated.
  const readyPostulantes = activeApps.filter((app) => {
    const isDni = app.docs?.dniFile?.status === "Validado";
    const isCert = app.docs?.certificadoFile?.status === "Validado";
    const isPartida = app.docs?.partidaFile ? app.docs.partidaFile.status === "Validado" : true;
    const isFoto = app.docs?.fotoFile?.status === "Validado";
    const isPayment = app.paymentStatus === "Validado";
    return isDni && isCert && isPartida && isFoto && isPayment;
  });

  // Filtering by search, career and classroom
  const filteredList = readyPostulantes.filter((app) => {
    const fullName = `${app.name} ${app.lastName}`.toLowerCase();
    const matchesQuery =
      fullName.includes(searchQuery.toLowerCase()) ||
      app.dni.includes(searchQuery) ||
      (app.applicantCode && app.applicantCode.toLowerCase().includes(searchQuery.toLowerCase()));
    if (!matchesQuery) return false;

    if (postulantesCareerFilter !== "all" && app.programId !== postulantesCareerFilter) {
      return false;
    }

    if (postulantesClassroomFilter !== "all") {
      if (postulantesClassroomFilter === "none") {
        return !app.examClassroom;
      }
      return app.examClassroom === postulantesClassroomFilter;
    }

    return true;
  });

  const admittedCount = readyPostulantes.filter((a) => a.admitted === "ADMITIDO" || a.admitted === true).length;
  const notAdmittedCount = readyPostulantes.filter((a) => a.admitted === "NO ADMITIDO").length;
  const pendingCount = readyPostulantes.filter(
    (a) => a.admitted !== "ADMITIDO" && a.admitted !== true && a.admitted !== "NO ADMITIDO"
  ).length;
  const hasClassroomCount = readyPostulantes.filter((a) => !!a.examClassroom).length;

  const classroomOptions = [
    "Aula A-101 (Teoría)",
    "Aula B-201 (Cómputo)",
    "Aula C-102 (Motores)",
    "Laboratorio L-101",
    "Auditorio Principal",
  ];

  return (
    <PageTransition id="postulantes" className="space-y-6 text-left">
      <PageHeader
        title="Postulantes Aptos (Examen de Admisión)"
        subtitle="Gestione los postulantes que ya tienen sus 5 requisitos completamente validados (4 documentos y pago S/.120 de Tasa confirmados). Asigne aulas físicas de evaluación y registre los resultados para admisión."
        icon={<Users className="w-6 h-6 text-[#9F062A]" />}
        actions={renderPeriodSelector()}
      />

      <div className="space-y-6">
        {/* Stats Cards Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-left">
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-3xs text-left">
            <span className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider block">
              Total Postulantes Aptos
            </span>
            <span className="text-xl font-black text-slate-800 mt-1 block font-mono">
              {readyPostulantes.length}
            </span>
            <span className="text-[9px] text-emerald-600 font-bold block mt-0.5">Expedientes 100% aprobados</span>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-3xs text-left">
            <span className="text-[9px] text-indigo-600 font-extrabold uppercase tracking-wider block">
              Con Aula Asignada
            </span>
            <span className="text-xl font-black text-indigo-700 mt-1 block font-mono">
              {hasClassroomCount} de {readyPostulantes.length}
            </span>
            <span className="text-[9px] text-slate-500 font-bold block mt-0.5">Aulas distribuidas</span>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-3xs text-left">
            <span className="text-[9px] text-amber-600 font-extrabold uppercase tracking-wider block">
              Evaluación Pendiente
            </span>
            <span className="text-xl font-black text-amber-700 mt-1 block font-mono">{pendingCount}</span>
            <span className="text-[9px] text-slate-500 font-bold block mt-0.5">Esperando examen</span>
          </div>
          <div className="bg-white rounded-xl p-4 border border-slate-200/80 shadow-3xs text-left">
            <span className="text-[9px] text-[#9F062A] font-extrabold uppercase tracking-wider block">
              Admitidos (Ingresantes)
            </span>
            <span className="text-xl font-black text-[#9F062A] mt-1 block font-mono">{admittedCount}</span>
            <span className="text-[9px] text-slate-500 font-bold block mt-0.5">
              Historial rechazados: {notAdmittedCount}
            </span>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-3xs flex flex-wrap gap-4 items-center justify-between text-xs font-bold text-slate-700">
          <div className="flex flex-wrap items-center gap-3">
            {/* Search Input inline */}
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar por DNI, Nombre o Código..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-64 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold focus:outline-[#9F062A]"
              />
            </div>

            {/* Career Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-extrabold uppercase text-[9px]">Especialidad:</span>
              <select
                value={postulantesCareerFilter}
                onChange={(e) => setPostulantesCareerFilter(e.target.value)}
                className="border border-slate-200 bg-white rounded-lg px-2.5 py-1 text-xs text-slate-700 font-bold focus:outline-[#9F062A] cursor-pointer"
              >
                <option value="all">TODAS</option>
                <option value="electronica">ELECTRICIDAD INDUSTRIAL</option>
                <option value="contabilidad">CONTABILIDAD</option>
              </select>
            </div>

            {/* Classroom Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-400 font-extrabold uppercase text-[9px]">Aula Examen:</span>
              <select
                value={postulantesClassroomFilter}
                onChange={(e) => setPostulantesClassroomFilter(e.target.value)}
                className="border border-slate-200 bg-white rounded-lg px-2.5 py-1 text-xs text-slate-700 font-bold focus:outline-[#9F062A] cursor-pointer"
              >
                <option value="all">TODAS LAS AULAS</option>
                <option value="none">SIN AULA ASIGNADA</option>
                {classroomOptions.map((cl) => (
                  <option key={cl} value={cl}>
                    {cl}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="text-[10px] text-slate-400 font-extrabold uppercase">
            Resultados Filtrados: {filteredList.length} de {readyPostulantes.length}
          </div>
        </div>

        {/* Listings Table */}
        <Card>
          <CardHeader>
            <div className="text-left">
              <CardTitle>Control de Aulas y Resultados del Examen</CardTitle>
              <CardDescription>
                A continuación se listan todos los aspirantes aptos. Usted puede asignarles el respectivo aula físico para el examen de admisión y calibrar la decisión oficial de ingreso como ADMITIDO o NO ADMITIDO.
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {readyPostulantes.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs font-bold space-y-2">
                <p>No se encontraron expedientes aptos en este período.</p>
                <p className="text-[10px] text-slate-500 font-medium max-w-md mx-auto">
                  Recuerde que para pasar a esta lista, cada prepostulante debe tener sus 4 documentos (DNI, Certificado, Partida/Foto) evaluados como "Validado" en la carpeta, y el pago de tasa de admisión cobrado y "Validado" por Caja.
                </p>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="p-12 text-center text-slate-400 text-xs font-bold leading-normal">
                Ningún postulante coincide con los criterios de búsqueda o filtros seleccionados.
              </div>
            ) : (
              <div className="overflow-x-auto text-[11.5px] font-semibold animate-scale-up">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[10.5px] uppercase border-b border-slate-150">
                      <th className="p-4 text-left">Postulante</th>
                      <th className="p-4 text-left">DNI / Contacto</th>
                      <th className="p-4 text-left">Carrera Postulada</th>
                      <th className="p-4 text-left">Asignar Aula de Examen</th>
                      <th className="p-4 text-center">Estado de Admisión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                    {filteredList.map((app, idx) => (
                      <tr key={app.dni || idx} className="hover:bg-slate-50/40 transition-colors">
                        <td className="p-4 text-left">
                          <span className="font-extrabold text-slate-900 block">
                            {app.name} {app.lastName}
                          </span>
                          <span className="text-[9.5px] text-slate-400 font-extrabold uppercase mt-0.5 block">
                            CÓDIGO: {app.applicantCode || "PE-2026-" + app.dni.slice(-4)}
                          </span>
                        </td>
                        <td className="p-4 text-left">
                          <span className="font-mono font-bold text-slate-700 block">{app.dni}</span>
                          <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                            {app.phone || app.email}
                          </span>
                        </td>
                        <td className="p-4 uppercase text-[10.5px] text-slate-800">
                          {app.programId === "electronica" ? "Electricidad Industrial" : "Contabilidad"}
                        </td>
                        <td className="p-4 text-left">
                          <div className="flex items-center gap-1.5">
                            <MapPin className="w-4 h-4 text-indigo-500 shrink-0" />
                            <select
                              value={app.examClassroom || ""}
                              onChange={(e) => {
                                const val = e.target.value;
                                const updatedList = applicants.map((a) => {
                                  if (a.dni === app.dni) {
                                    return {
                                      ...a,
                                      examClassroom: val || undefined,
                                      examStatus: val ? ("Programado" as const) : ("No Programado" as const),
                                    };
                                  }
                                  return a;
                                });
                                onUpdateApplicants(updatedList);
                              }}
                              className="text-[11px] font-sans font-bold bg-white border border-slate-200 rounded-md px-2.5 py-1.5 text-slate-850 shadow-3xs cursor-pointer focus:outline-none focus:border-indigo-500"
                            >
                              <option value="">-- Sin Asignar Aula --</option>
                              {classroomOptions.map((option) => (
                                <option key={option} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          </div>
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
                                    let folderStatusValue = a.folderStatus;
                                    if (val === "admitido") {
                                      admittedValue = "ADMITIDO";
                                      folderStatusValue = "Approved";
                                    } else if (val === "no_admitido") {
                                      admittedValue = "NO ADMITIDO";
                                    } else {
                                      admittedValue = "PENDIENTE";
                                    }
                                    return {
                                      ...a,
                                      admitted: admittedValue,
                                      folderStatus: folderStatusValue,
                                      folderApprovedAt:
                                        folderStatusValue === "Approved"
                                          ? new Date().toISOString().split("T")[0]
                                          : a.folderApprovedAt,
                                    };
                                  }
                                  return a;
                                });
                                onUpdateApplicants(updatedList);

                                if (val === "admitido") {
                                  alert(
                                    `El ingresante ${app.name} ${app.lastName} ahora figura con el resultado ADMITIDO y pasará instantáneamente a la bandeja de matrícula.`
                                  );
                                } else if (val === "no_admitido") {
                                  alert(`El postulante ${app.name} ${app.lastName} ha sido calificado como NO ADMITIDO.`);
                                } else {
                                  alert(`El postulante ${app.name} ${app.lastName} queda en estado PENDIENTE.`);
                                }
                              }}
                              className={`text-[11px] font-sans font-black uppercase tracking-wider bg-white border rounded-md px-3 py-1.5 shadow-3xs cursor-pointer focus:outline-none ${
                                app.admitted === "ADMITIDO" || app.admitted === true
                                  ? "text-emerald-700 border-emerald-250 bg-emerald-50 hover:bg-emerald-100"
                                  : app.admitted === "NO ADMITIDO"
                                  ? "text-rose-700 border-rose-250 bg-rose-50 hover:bg-rose-100"
                                  : "text-slate-800 border-slate-300 hover:bg-slate-50"
                              }`}
                            >
                              <option value="pendiente">PENDIENTE / EVALUACION</option>
                              <option value="admitido">ADMITIDO (INGRESO)</option>
                              <option value="no_admitido">NO ADMITIDO (HISTORIAL)</option>
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
