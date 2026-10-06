import React from "react";
import { CheckSquare, GraduationCap, FileText } from "lucide-react";
import { Enrollment, Applicant, AdmissionPeriod } from "../../../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/Card";
import PageHeader from "../../ui/PageHeader";
import PageTransition from "../../ui/PageTransition";

interface MatriculadosTabProps {
  enrollments: Enrollment[];
  applicants: Applicant[];
  admissionPeriods: AdmissionPeriod[];
  selectedPeriodId: string;
  setSelectedPeriodId: (id: string) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  careerFilter: string;
  setCareerFilter: (c: string) => void;
  setSelectedDossierAppDni: (dni: string | null) => void;
  setSelectedFichaDni: (dni: string | null) => void;
  renderPeriodSelector: () => React.ReactNode;
}

export const MatriculadosTab: React.FC<MatriculadosTabProps> = ({
  enrollments,
  applicants,
  admissionPeriods,
  selectedPeriodId,
  setSelectedPeriodId,
  searchQuery,
  setSearchQuery,
  careerFilter,
  setCareerFilter,
  setSelectedDossierAppDni,
  setSelectedFichaDni,
  renderPeriodSelector,
}) => {
  const matriculatedListInSearch = enrollments
    .filter((enr) => enr.academicStatus === "MATRICULADO")
    .map((enr) => {
      const applicant = applicants.find((a) => a.dni === enr.studentDni);
      return { enr, app: applicant };
    })
    .filter((item) => {
      const matchesPeriod = selectedPeriodId === "all" || item.app?.periodId === selectedPeriodId;
      const matchesCareer = careerFilter === "all" || item.enr.programId === careerFilter;

      let matchesSearch = true;
      if (searchQuery) {
        const q = searchQuery.toLowerCase();
        const nameOk = item.app?.name?.toLowerCase().includes(q) || false;
        const lastNameOk = item.app?.lastName?.toLowerCase().includes(q) || false;
        const dniOk = item.enr.studentDni.includes(q);
        const codeOk = item.app?.applicantCode?.toLowerCase().includes(q) || false;
        matchesSearch = nameOk || lastNameOk || dniOk || codeOk;
      }
      return matchesPeriod && matchesCareer && matchesSearch;
    });

  const totalMatriculados = matriculatedListInSearch.length;
  const elecMatriculados = matriculatedListInSearch.filter((item) => item.enr.programId === "electronica").length;
  const contMatriculados = matriculatedListInSearch.filter((item) => item.enr.programId === "contabilidad").length;

  return (
    <PageTransition id="matriculados" className="space-y-6">
      <PageHeader
        title="Padrón Oficial de Estudiantes Matriculados"
        subtitle="Consulte la nómina oficial, administre la cohorte matriculada y expida constancias oficiales de matrícula con validez institucional."
        icon={<CheckSquare className="w-6 h-6 text-emerald-600" />}
        actions={renderPeriodSelector()}
      />

      <div className="space-y-6 text-left">
        {/* Performance Indicators */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-3xs flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                Total Matriculados Filtrados
              </span>
              <span className="text-2xl font-black text-emerald-700 mt-1 block font-mono">{totalMatriculados}</span>
              <span className="text-[10px] text-slate-500 font-bold block mt-1">Con Matrícula validada</span>
            </div>
            <div className="p-3.5 bg-emerald-50 rounded-xl text-emerald-600">
              <CheckSquare className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-3xs flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                Electricidad Industrial
              </span>
              <span className="text-2xl font-black text-slate-800 mt-1 block font-mono">{elecMatriculados}</span>
              <span className="text-[10px] text-slate-500 font-bold block mt-1">Sistemas Electromecánicos</span>
            </div>
            <div className="p-3.5 bg-sky-50 rounded-xl text-sky-600">
              <GraduationCap className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-3xs flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider block">
                Contabilidad Regular
              </span>
              <span className="text-2xl font-black text-slate-800 mt-1 block font-mono">{contMatriculados}</span>
              <span className="text-[10px] text-slate-500 font-bold block mt-1">Contabilidad Pública e Impuestos</span>
            </div>
            <div className="p-3.5 bg-blue-50 rounded-xl text-blue-600">
              <FileText className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Interactive Query Filters Control bar */}
        <div className="bg-white rounded-xl border border-slate-150 p-4 shadow-3xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Buscar por DNI, Apellidos, Nombres, Código..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-3.5 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-800 placeholder-slate-400 focus:outline-[#9F062A]"
            />
            <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-[10px] uppercase font-mono">
              Buscar
            </span>
          </div>

          <div className="flex flex-col sm:flex-row gap-3.5 items-stretch sm:items-center">
            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <label htmlFor="padr-period-sel" className="text-[9.5px] font-black uppercase text-slate-500 whitespace-nowrap">
                Periodo:
              </label>
              <select
                id="padr-period-sel"
                value={selectedPeriodId}
                onChange={(e) => setSelectedPeriodId(e.target.value)}
                className="bg-transparent text-slate-800 border-none font-extrabold text-xs focus:outline-none cursor-pointer"
              >
                <option value="all">TODOS LOS PERIODOS</option>
                {admissionPeriods.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name.toUpperCase()}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-200">
              <label htmlFor="padr-career-sel" className="text-[9.5px] font-black uppercase text-slate-500 whitespace-nowrap">
                Carrera:
              </label>
              <select
                id="padr-career-sel"
                value={careerFilter}
                onChange={(e) => setCareerFilter(e.target.value)}
                className="bg-transparent text-slate-800 border-none font-extrabold text-xs focus:outline-none cursor-pointer"
              >
                <option value="all">TODAS LAS ESPECIALIDADES</option>
                <option value="electronica">ELECTRICIDAD INDUSTRIAL</option>
                <option value="contabilidad">CONTABILIDAD</option>
              </select>
            </div>
          </div>
        </div>

        {/* Main Padrón Table */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <CardTitle>Nómina de Matriculados Oficiales del Instituto</CardTitle>
                <CardDescription>
                  Estudiantes que completaron exitosamente su proceso de carpeta, examen y registro académico regular.
                </CardDescription>
              </div>
              <span className="font-mono text-[10px] font-bold text-slate-400">
                {totalMatriculados} Estudiantes Registrados
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {matriculatedListInSearch.length === 0 ? (
              <div className="p-16 text-center text-slate-400 font-bold text-xs">
                No se encontraron estudiantes matriculados que coincidan con los filtros seleccionados en este período.
              </div>
            ) : (
              <div className="overflow-x-auto text-xs font-semibold">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-[10.5px] uppercase border-b border-slate-100">
                      <th className="p-4 text-center w-12">N°</th>
                      <th className="p-4 text-left">Código de Matrícula</th>
                      <th className="p-4 text-left">Nombre Completo / DNI</th>
                      <th className="p-4 text-left">Especialidad de Destino</th>
                      <th className="p-4 text-left">Turno Asignado</th>
                      <th className="p-4 text-center">Ciclo Activo</th>
                      <th className="p-4 text-center">Condición de Matrícula</th>
                      <th className="p-4 text-center">Carpeta / Constancia</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                    {matriculatedListInSearch.map((item, idx) => {
                      const code = item.app?.applicantCode || `REG-${item.enr.studentDni.slice(0, 4)}`;
                      return (
                        <tr key={idx} className="hover:bg-slate-50/50 transition-all">
                          <td className="p-4 text-center font-mono font-bold text-slate-400">{idx + 1}</td>
                          <td className="p-4 font-mono font-black text-[#9F062A] uppercase">{code}</td>
                          <td className="p-4 text-left">
                            <span className="font-black text-slate-900 block">
                              {item.app ? `${item.app.lastName}, ${item.app.name}` : "Estudiante Sin Registro de Enlace"}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono font-bold mt-0.5 block">
                              DNI: {item.enr.studentDni}
                            </span>
                          </td>
                          <td className="p-4 text-left">
                            {item.enr.programId === "electronica" ? (
                              <span className="inline-flex items-center gap-1.5 uppercase font-bold text-[10px] text-slate-800">
                                <span className="w-2 h-2 rounded-full bg-sky-500" />
                                Electricidad Industrial
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 uppercase font-bold text-[10px] text-slate-800">
                                <span className="w-2 h-2 rounded-full bg-blue-500" />
                                Contabilidad
                              </span>
                            )}
                          </td>
                          <td className="p-4 text-left font-bold text-slate-600">
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-700 font-bold rounded-md font-sans text-[10px] border">
                              {item.enr.shift || "Mañana"}
                            </span>
                          </td>
                          <td className="p-4 text-center font-black text-slate-800 font-mono">CICLO I</td>
                          <td className="p-4 text-center">
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-850 hover:bg-emerald-150 border border-emerald-250 rounded-full text-[9px] font-black uppercase tracking-wider select-none animate-pulse">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 inline-block" />
                              Matrícula Regular
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              {item.app && (
                                <button
                                  type="button"
                                  onClick={() => setSelectedDossierAppDni(item.app!.dni)}
                                  className="inline-flex items-center gap-1 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 text-[10px] font-bold uppercase px-2.5 py-1.5 rounded-lg shadow-3xs cursor-pointer select-none transition-all"
                                >
                                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                                  <span>Dossier</span>
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => setSelectedFichaDni(item.enr.studentDni)}
                                className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-black text-white text-[10px] font-black uppercase px-3 py-1.5 rounded-lg shadow-3xs cursor-pointer select-none transition-all border border-transparent"
                              >
                                Emitir Ficha
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
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
