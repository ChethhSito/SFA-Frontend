import React from "react";
import { FileText, GraduationCap, Users, CheckCircle2, AlertTriangle, Clock } from "lucide-react";
import { Applicant, AdmissionPeriod } from "../../../types";
import { Card } from "../../ui/Card";
import PageHeader from "../../ui/PageHeader";
import PageTransition from "../../ui/PageTransition";

interface SecretariaTabProps {
  applicants: Applicant[];
  admissionPeriods: AdmissionPeriod[];
  selectedPeriodId: string;
  setSelectedPeriodId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  prepostulantesCareerFilter: string;
  setPrepostulantesCareerFilter: (c: string) => void;
  applicantFilterType: "all" | "pending" | "observed" | "approved" | "enrolled";
  setApplicantFilterType: (f: "all" | "pending" | "observed" | "approved" | "enrolled") => void;
  setSelectedDossierAppDni: (dni: string | null) => void;
  renderPeriodSelector: () => React.ReactNode;
}

export const SecretariaTab: React.FC<SecretariaTabProps> = ({
  applicants,
  admissionPeriods,
  selectedPeriodId,
  setSelectedPeriodId,
  searchQuery,
  setSearchQuery,
  prepostulantesCareerFilter,
  setPrepostulantesCareerFilter,
  applicantFilterType,
  setApplicantFilterType,
  setSelectedDossierAppDni,
  renderPeriodSelector,
}) => {
  return (
    <PageTransition id="secretaria" className="space-y-6">
      <PageHeader
        title="División de Admisiones Institucionales"
        subtitle="Gestione carpetas de admisión, audite requisitos digitales por período y resuelva incidencias de postulación."
        icon={<FileText className="w-6 h-6 text-[#9F062A]" />}
        actions={renderPeriodSelector()}
      />

      {/* 1. Academic Period Selector Banner */}
      <div className="bg-slate-900 text-white rounded-xl p-5 md:p-6 shadow-md border-b-4 border-amber-500 relative flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="space-y-1 z-10">
          <span className="text-[10px] text-amber-300 font-extrabold tracking-widest uppercase block">
            Período de Admisión Administrado
          </span>
          <h3 className="text-lg md:text-xl font-black font-display tracking-tight">
            Periodo de Admisión: {admissionPeriods.find((p) => p.id === selectedPeriodId)?.name || "Seleccione Periodo"}
          </h3>
          <p className="text-xs text-slate-300 font-medium">
            Las estadísticas, filtros y postulantes mostrados corresponden únicamente a esta cohorte.
          </p>
        </div>
        <div className="flex items-center gap-2.5 z-10 bg-slate-800 p-2 rounded-lg border border-slate-700 w-full md:w-auto">
          <label htmlFor="period-dashboard-selector" className="text-xs font-extrabold tracking-wide text-slate-300 uppercase whitespace-nowrap">
            Periodo:
          </label>
          <select
            id="period-dashboard-selector"
            value={selectedPeriodId}
            onChange={(e) => setSelectedPeriodId(e.target.value)}
            className="bg-slate-950 text-white border border-slate-800 rounded-md px-3 py-1.5 text-xs font-black focus:outline-none focus:ring-1 focus:ring-amber-500 w-full md:w-auto cursor-pointer"
          >
            <option value="all">TODOS LOS PERIODOS ({applicants.length})</option>
            {admissionPeriods.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} {p.status === "APERTURADO" ? "(ACTIVO)" : ""}
              </option>
            ))}
          </select>
        </div>
        <div className="absolute right-6 bottom-4 opacity-5 pointer-events-none hidden lg:block">
          <GraduationCap className="w-32 h-32" />
        </div>
      </div>

      {/* 2. Key Dynamic Stats for selected period */}
      {(() => {
        const activeApplicants = applicants.filter(
          (app) =>
            !selectedPeriodId ||
            selectedPeriodId === "all" ||
            app.periodId === selectedPeriodId ||
            !app.periodId ||
            app.periodId === "1" ||
            app.periodId === admissionPeriods[0]?.id
        );
        const totalInPeriod = activeApplicants.length;
        const pendingF = activeApplicants.filter((a) => a.folderStatus === "Pending").length;
        const observedF = activeApplicants.filter((a) => a.folderStatus === "Observed").length;
        const approvedF = activeApplicants.filter((a) => a.folderStatus === "Approved").length;
        const enrolledF = activeApplicants.filter((a) => a.folderStatus === "Enrolled").length;
        const totalRevenue = activeApplicants.filter((a) => a.paymentStatus === "Validado").length * 120;

        return (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 text-xs font-bold font-mono">
            <div className="bg-white border rounded-lg p-3.5 shadow-sm space-y-1 border-slate-200">
              <span className="uppercase text-[9px] font-black tracking-wider block text-slate-400">
                Postulantes
              </span>
              <span className="text-xl font-black text-slate-900 block">{totalInPeriod}</span>
            </div>
            <div className="bg-yellow-50/40 border border-yellow-200/55 rounded-lg p-3.5 shadow-xs space-y-1">
              <span className="text-yellow-600/80 uppercase text-[9px] font-black tracking-wider block">
                Pendientes
              </span>
              <span className="text-xl font-black text-yellow-700 block">{pendingF}</span>
            </div>
            <div className="bg-red-50/40 border border-red-200/50 rounded-lg p-3.5 shadow-xs space-y-1">
              <span className="text-red-500/80 uppercase text-[9px] font-black tracking-wider block">
                Observados
              </span>
              <span className="text-xl font-black text-red-650 block">{observedF}</span>
            </div>
            <div className="bg-emerald-50/40 border border-emerald-200/50 rounded-lg p-3.5 shadow-xs space-y-1">
              <span className="text-emerald-600/80 uppercase text-[9px] font-black tracking-wider block">
                Aprobados & Matric.
              </span>
              <span className="text-xl font-black text-emerald-700 block">{approvedF + enrolledF}</span>
            </div>
            <div className="bg-blue-50/50 border border-blue-200/50 rounded-lg p-3.5 shadow-xs space-y-1 col-span-2 lg:col-span-1">
              <span className="text-blue-600 uppercase text-[9px] font-black tracking-wider block">
                Tasa Recaudada
              </span>
              <span className="text-xl font-black text-blue-800 block">S/. {totalRevenue.toFixed(2)}</span>
            </div>
          </div>
        );
      })()}

      {/* 3. Search & Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-100 p-4 shadow-xs flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="relative flex-1">
          <input
            type="text"
            placeholder="Buscar postulante por nombre, apellido o DNI..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-3.5 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-[#9F062A]"
          />
          <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs uppercase">
            Buscar
          </span>
        </div>

        {/* Career Selection Filter */}
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-black uppercase text-slate-550 whitespace-nowrap">Especialidad:</span>
          <select
            value={prepostulantesCareerFilter}
            onChange={(e) => setPrepostulantesCareerFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-extrabold text-slate-705 outline-none focus:border-[#9F062A] cursor-pointer"
          >
            <option value="all">TODAS LAS CARRERAS</option>
            <option value="electronica">ELECTRICIDAD INDUSTRIAL</option>
            <option value="contabilidad">CONTABILIDAD</option>
          </select>
        </div>

        {/* Folder Filters */}
        <div className="flex flex-wrap items-center gap-1.5">
          {[
            { id: "all", label: "Todos" },
            { id: "pending", label: "Pendientes" },
            { id: "observed", label: "Observados" },
            { id: "approved", label: "Aprobados" },
            { id: "enrolled", label: "Matriculados" },
          ].map((filt) => (
            <button
              key={filt.id}
              type="button"
              onClick={() => setApplicantFilterType(filt.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                applicantFilterType === filt.id
                  ? "bg-[#9F062A] text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {filt.label}
            </button>
          ))}
        </div>
      </div>

      {/* 4. Applicants List Grid */}
      {(() => {
        const activeApplicants = applicants.filter(
          (app) =>
            !selectedPeriodId ||
            selectedPeriodId === "all" ||
            app.periodId === selectedPeriodId ||
            !app.periodId ||
            app.periodId === "1" ||
            app.periodId === admissionPeriods[0]?.id
        );
        const filteredApplicants = activeApplicants.filter((app) => {
          const fullName = `${app.name} ${app.lastName}`.toLowerCase();
          const matchesQuery =
            fullName.includes(searchQuery.toLowerCase()) ||
            app.dni.includes(searchQuery) ||
            (app.applicantCode && app.applicantCode.toLowerCase().includes(searchQuery.toLowerCase()));
          if (!matchesQuery) return false;

          if (prepostulantesCareerFilter !== "all" && app.programId !== prepostulantesCareerFilter) {
            return false;
          }

          if (applicantFilterType === "pending") return app.folderStatus === "Pending";
          if (applicantFilterType === "observed") return app.folderStatus === "Observed";
          if (applicantFilterType === "approved") return app.folderStatus === "Approved";
          if (applicantFilterType === "enrolled") return app.folderStatus === "Enrolled";
          return true;
        });

        if (filteredApplicants.length === 0) {
          return (
            <div className="p-12 text-center bg-white rounded-xl border border-slate-150 shadow-xs">
              <span className="p-3 bg-slate-50 text-slate-400 rounded-full inline-block mb-3">
                <Users className="w-8 h-8 mx-auto" />
              </span>
              <h4 className="text-slate-800 font-bold text-sm">No se encontraron expedientes de admisiones</h4>
              <p className="text-slate-400 text-xs mt-1">
                Verifique la búsqueda, cambie el filtro de estado o agregue postulantes para este período.
              </p>
            </div>
          );
        }

        return (
          <Card className="overflow-hidden border border-slate-150 shadow-sm mt-4">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900 border-b border-slate-800 text-white font-extrabold uppercase tracking-wide text-[10px]">
                    <th className="p-3">Postulante / Código</th>
                    <th className="p-3">Especialidad de Destino</th>
                    <th className="p-3">Pago Tasa (S/. 120)</th>
                    <th className="p-3">Dossier Digital</th>
                    <th className="p-3 text-center">Revisión</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white font-semibold text-slate-700">
                  {filteredApplicants.map((app) => {
                    const appDocs = app.docs || {
                      dniFile: { status: "No Enviado" as const },
                      certificadoFile: { status: "No Enviado" as const },
                      partidaFile: { status: "No Enviado" as const },
                      fotoFile: { status: "No Enviado" as const },
                    };

                    const docsListKeys: Array<"dniFile" | "certificadoFile" | "partidaFile" | "fotoFile"> = [
                      "dniFile",
                      "certificadoFile",
                      "partidaFile",
                      "fotoFile",
                    ];
                    const valCount = docsListKeys.filter((k) => appDocs[k]?.status === "Validado").length;
                    const obsCount = docsListKeys.filter((k) => appDocs[k]?.status === "Observado").length;
                    const pendCount = docsListKeys.filter((k) => appDocs[k]?.status === "Pendiente").length;

                    return (
                      <tr key={app.dni} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3.5 border-none">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-155 text-[#9F062A] font-extrabold flex items-center justify-center border border-slate-200 select-none">
                              {app.name.charAt(0)}
                              {app.lastName.charAt(0)}
                            </div>
                            <div>
                              <h4 className="font-bold text-[#9F062A] uppercase leading-none block text-[11.5px]">
                                {app.name} {app.lastName}
                              </h4>
                              <span className="text-[10px] text-slate-500 font-bold block mt-1 tracking-tight">
                                DNI: {app.dni} | Código:{" "}
                                <span className="font-mono text-slate-800">
                                  {app.applicantCode || "PE-2026-" + app.dni.slice(-4)}
                                </span>
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 font-bold uppercase tracking-tight text-slate-900 border-none">
                          {app.programId === "electronica" ? "Electricidad Industrial" : "Contabilidad"}
                        </td>
                        <td className="p-3.5 border-none">
                          {app.paymentStatus === "Validado" ? (
                            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Tasa Validada (S/ 120)
                            </span>
                          ) : app.paymentStatus === "Observado" ? (
                            <span className="text-xs font-bold text-red-700 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Tasa Observada
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-500" /> Por revisar
                            </span>
                          )}
                        </td>
                        <td className="p-3.5 border-none">
                          <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-1.5 text-[9px] font-extrabold uppercase tracking-tight">
                              <span className="text-emerald-700 font-black">{valCount} OK</span>
                              {obsCount > 0 && <span className="text-red-600 font-black">{obsCount} OBS</span>}
                              {pendCount > 0 && <span className="text-amber-600 font-black">{pendCount} PEND</span>}
                            </div>
                            <div className="w-24 h-1 border border-slate-200 bg-slate-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-emerald-600 transition-all duration-300"
                                style={{ width: `${(valCount / 4) * 100}%` }}
                              />
                            </div>
                          </div>
                        </td>
                        <td className="p-3.5 text-center border-none">
                          <button
                            type="button"
                            onClick={() => setSelectedDossierAppDni(app.dni)}
                            className="inline-flex items-center gap-1.5 uppercase font-black text-[9px] tracking-wider bg-[#9F062A] hover:bg-[#800521] text-white px-2.5 py-1.5 rounded-lg border border-transparent shadow-xs transition-colors cursor-pointer"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Dossier</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        );
      })()}
    </PageTransition>
  );
};
