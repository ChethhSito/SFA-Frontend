import React, { useState } from "react";
import { Check, ShieldCheck, Printer, Award, FileCheck } from "lucide-react";
import { Graduation, StudentPersonalData } from "../../../types";
import { ProcessedStudent } from "../mgeTypes";
import { CertificadoEstudiosModal } from "../modals/CertificadoEstudiosModal";
import { ResolucionTitulacionModal } from "../modals/ResolucionTitulacionModal";

interface Props {
  graduations: Graduation[];
  studentsList: { [dni: string]: StudentPersonalData };
  processedStudents: ProcessedStudent[];
  onIssuerUpdate: (studentDni: string, approve: boolean) => void;
  onCreateGraduationProcess: (dni: string) => void;
}

export default function MgeConstanciasTab({
  graduations,
  studentsList,
  processedStudents,
  onIssuerUpdate,
  onCreateGraduationProcess,
}: Props) {
  const [selectedCertStudent, setSelectedCertStudent] = useState<any>(null);
  const [selectedResStudent, setSelectedResStudent] = useState<any>(null);
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 border border-slate-200 rounded-xl bg-slate-50">
        <div className="space-y-0.5">
          <h4 className="text-xs font-black uppercase text-slate-800">
            Gestión y Solicitudes de Certificados Escolares
          </h4>
          <p className="text-[10.5px] font-semibold text-slate-450">
            Registre o tramite certificados de estudios modulares completos o constancias de egresado oficiales.
          </p>
        </div>

        <div className="flex gap-2">
          <select
            id="add-grad-student"
            className="p-2 border border-slate-250 bg-white font-bold rounded-lg text-xs"
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) {
                onCreateGraduationProcess(e.target.value);
                e.target.value = "";
              }
            }}
          >
            <option value="" disabled>-- Aperturar para un estudiante --</option>
            {processedStudents.map((st) => (
              <option key={st.dni} value={st.dni}>{st.lastName}, {st.name} ({st.dni})</option>
            ))}
          </select>
        </div>
      </div>

      <div className="border border-slate-205 rounded-xl overflow-hidden bg-white shadow-3xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Estudiante</th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Trámite Académico</th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Requisitos Presentados</th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Estado de Trámite</th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">Firma & Emisión</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {graduations.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-slate-400 font-bold uppercase">
                    No hay solicitudes de certificados presentados en este periodo.
                  </td>
                </tr>
              ) : (
                graduations.map((g) => {
                  const studentObj = studentsList[g.studentDni];
                  return (
                    <tr key={g.studentDni} className="hover:bg-slate-50/50 transition-all">
                      <td className="px-4 py-3.5">
                        <div className="font-extrabold text-slate-900">
                          {studentObj ? `${studentObj.lastName}, ${studentObj.name}` : "Estudiante Desconocido"}
                        </div>
                        <div className="text-[10px] font-mono font-bold text-slate-400">DNI: {g.studentDni}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-800">Certificado Oficial de Egresado (Módulos Completos)</div>
                        {g.obs && <p className="text-[9px] text-[#9F062A] font-medium leading-normal italic mt-0.5">* Obs: {g.obs}</p>}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="flex flex-wrap gap-1">
                          <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold ${g.docsChecked.solicitud ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700"}`}>Sol.</span>
                          <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold ${g.docsChecked.constanciaEgresado ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700"}`}>Const. Mod.</span>
                          <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold ${g.docsChecked.practicasPre ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700"}`}>Prácticas Pre.</span>
                          <span className={`px-2 py-0.5 rounded text-[8.5px] font-bold ${g.docsChecked.pagoDerecho ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-red-50 text-red-700"}`}>Pago Der.</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {g.status === "Certificado Emitido" ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-full border border-emerald-100 font-extrabold text-[9.5px] uppercase">
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 block" /> EMITIDO FIRMADO
                          </span>
                        ) : g.status === "Solicitado" ? (
                          <span className="px-2 py-0.5 bg-blue-50 text-blue-700 rounded-full border border-blue-100 font-bold uppercase text-[9.5px]">
                            SOLICITADO / REVISIÓN
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-amber-50 text-amber-700 rounded-full border border-amber-100 font-bold uppercase text-[9.5px]">
                            {g.status}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex justify-end gap-1.5 flex-wrap">
                          <button
                            onClick={() => setSelectedCertStudent({
                              studentDni: g.studentDni,
                              studentName: studentObj ? `${studentObj.lastName}, ${studentObj.name}` : "Estudiante Egresado",
                              careerName: "Electrotecnia Industrial"
                            })}
                            className="px-2 py-1 bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-[8.5px] uppercase tracking-wider rounded transition-all cursor-pointer flex items-center gap-1"
                            title="Certificado de Estudios SGE/MINEDU"
                          >
                            <Award className="w-3 h-3" /> Certificado
                          </button>
                          <button
                            onClick={() => setSelectedResStudent({
                              resolutionNumber: `RD-2026-0${Math.floor(Math.random() * 90 + 10)}-IESTP-SFA`,
                              studentDni: g.studentDni,
                              studentName: studentObj ? `${studentObj.lastName}, ${studentObj.name}` : "Estudiante Egresado",
                              careerName: "Electrotecnia Industrial"
                            })}
                            className="px-2 py-1 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-[8.5px] uppercase tracking-wider rounded transition-all cursor-pointer flex items-center gap-1"
                            title="Resolución Directoral de Titulación"
                          >
                            <FileCheck className="w-3 h-3 text-amber-300" /> R.D. Titulación
                          </button>
                          <button
                            onClick={() => onIssuerUpdate(g.studentDni, true)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[8.5px] uppercase tracking-wider rounded transition-all cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> Emitir
                          </button>
                          <button
                            onClick={() => onIssuerUpdate(g.studentDni, false)}
                            className="px-2 py-1 bg-red-600 hover:bg-red-700 text-white font-black text-[8.5px] uppercase tracking-wider rounded transition-all cursor-pointer"
                            title="Observar"
                          >
                            Obs.
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      <CertificadoEstudiosModal
        isOpen={Boolean(selectedCertStudent)}
        onClose={() => setSelectedCertStudent(null)}
        studentDni={selectedCertStudent?.studentDni || ""}
        studentName={selectedCertStudent?.studentName || ""}
        careerName={selectedCertStudent?.careerName || "Electrotecnia Industrial"}
        modulesCompleted={3}
        totalCredits={120}
      />

      <ResolucionTitulacionModal
        isOpen={Boolean(selectedResStudent)}
        onClose={() => setSelectedResStudent(null)}
        resolutionNumber={selectedResStudent?.resolutionNumber || "RD-2026-048-IESTP-SFA"}
        studentDni={selectedResStudent?.studentDni || ""}
        studentName={selectedResStudent?.studentName || ""}
        careerName={selectedResStudent?.careerName || "Electrotecnia Industrial"}
      />
    </div>
  );
}
