import React, { useState } from "react";
import {
  Users,
  MapPin,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldCheck,
  Award,
  AlertTriangle,
  RefreshCw,
  ChevronDown,
  Check,
} from "lucide-react";
import { Applicant } from "../../../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/Card";
import PageHeader from "../../ui/PageHeader";
import PageTransition from "../../ui/PageTransition";
import { AdminAdmissionPinModal } from "../modals/AdminAdmissionPinModal";

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
  notify?: (message: string, kind?: "success" | "error" | "warning" | "info") => void;
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
  notify,
}) => {
  // Modal de PIN institucional para admitir formalmente al postulante
  const [pinModalOpen, setPinModalOpen] = useState(false);
  const [selectedAppForPin, setSelectedAppForPin] = useState<Applicant | null>(null);

  const activeApps = applicants.filter((app) => 
    !selectedPeriodId || 
    selectedPeriodId === "all" || app.periodId === selectedPeriodId
  );

  // Un candidato califica como "Postulante Apto" cuando sus 4 documentos y su pago de tasa están validados
  const readyPostulantes = activeApps.filter((app) => {
    let localDocStatus: any = null;
    try {
      const raw = localStorage.getItem(`sfa_doc_status_${app.dni}`);
      if (raw) localDocStatus = JSON.parse(raw);
    } catch (e) {}

    let localPayStatus: string | null = null;
    try {
      localPayStatus = localStorage.getItem(`sfa_payment_status_${app.dni}`);
    } catch (e) {}

    const appDocs = { ...(app.docs || {}), ...(localDocStatus || {}) };
    const isDni = appDocs?.dniFile?.status === "Validado";
    const isCert = appDocs?.certificadoFile?.status === "Validado";
    const isPartida = appDocs?.partidaFile ? (appDocs.partidaFile.status === "Validado" || appDocs.partidaFile.status === "No Enviado") : true;
    const isFoto = appDocs?.fotoFile?.status === "Validado";
    const isPayment = localPayStatus === "Validado" || app.paymentStatus === "Validado";
    return isDni && isCert && isPartida && isFoto && isPayment;
  });

  // Filtrado por texto, carrera y aula
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
    "Aula 101 - Pabellón A (Teoría)",
    "Aula 102 - Pabellón A (Teoría)",
    "Aula 201 - Pabellón B (Teoría)",
    "Aula 202 - Pabellón B (Teoría)",
    "Laboratorio L-101 (Cómputo)",
    "Taller Electricidad 1",
    "Auditorio Principal San Francisco",
  ];

  const handleAssignClassroom = (dni: string, classroom: string) => {
    const updatedList = applicants.map((a) => {
      if (a.dni === dni) {
        return {
          ...a,
          examClassroom: classroom || undefined,
          examStatus: classroom ? ("Programado" as const) : ("No Programado" as const),
        };
      }
      return a;
    });
    onUpdateApplicants(updatedList);
    if (classroom) {
      notify?.(`Aula asignada con éxito: ${classroom}`, "success");
    } else {
      notify?.("Asignación de aula removida.", "info");
    }
  };

  const handleOpenPinModal = (app: Applicant) => {
    setSelectedAppForPin(app);
    setPinModalOpen(true);
  };

  const handleConfirmAdmissionWithPin = (dni: string) => {
    const target = applicants.find((a) => a.dni === dni);
    const updatedList = applicants.map((a) => {
      if (a.dni === dni) {
        return {
          ...a,
          admitted: "ADMITIDO" as const,
          folderStatus: "Approved" as const,
          folderApprovedAt: new Date().toISOString().split("T")[0],
          examStatus: "Evaluado" as const,
        };
      }
      return a;
    });
    onUpdateApplicants(updatedList);
    notify?.(
      `¡Firma digital validada! ${target?.name || "El postulante"} ${target?.lastName || ""} ha sido OFICIALMENTE ADMITIDO y habilitado para el proceso de matrícula.`,
      "success"
    );
  };

  const handleRevertAdmission = (dni: string) => {
    const updatedList = applicants.map((a) => {
      if (a.dni === dni) {
        return {
          ...a,
          admitted: "PENDIENTE" as any,
        };
      }
      return a;
    });
    onUpdateApplicants(updatedList);
    notify?.("Estado de admisión revertido a Pendiente de Evaluación.", "info");
  };

  const handleMarkNotAdmitted = (dni: string) => {
    const target = applicants.find((a) => a.dni === dni);
    const updatedList = applicants.map((a) => {
      if (a.dni === dni) {
        return {
          ...a,
          admitted: "NO ADMITIDO" as const,
        };
      }
      return a;
    });
    onUpdateApplicants(updatedList);
    notify?.(`El postulante ${target?.name || ""} ha sido calificado como NO ADMITIDO.`, "warning");
  };

  return (
    <PageTransition id="postulantes" className="space-y-6 text-left">
      <PageHeader
        title="Postulantes Aptos (Examen de Admisión)"
        subtitle="Gestione los postulantes que ya tienen sus 5 requisitos completamente validados (4 documentos y pago S/.120 de Tasa confirmados). Asigne aulas físicas de evaluación y registre los resultados para admisión mediante firma digital."
        icon={<Users className="w-6 h-6 text-[#9F062A]" />}
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
              <CardTitle>Control de Aulas y Resultados Oficiales de Admisión</CardTitle>
              <CardDescription>
                Gestione la asignación de aulas físicas para el examen presencial y registre la resolución oficial de ingreso mediante firma digital con PIN.
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
                    <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase border-b border-slate-100 font-extrabold tracking-wider">
                      <th className="p-4 text-left">Postulante</th>
                      <th className="p-4 text-left">DNI / Contacto</th>
                      <th className="p-4 text-left">Carrera Postulada</th>
                      <th className="p-4 text-left">Aula de Examen Presencial</th>
                      <th className="p-4 text-center">Decisión Oficial de Admisión</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                    {filteredList.map((app, idx) => {
                      const isAdmitted = app.admitted === "ADMITIDO" || app.admitted === true;
                      const isNotAdmitted = app.admitted === "NO ADMITIDO";

                      return (
                        <tr key={app.dni || idx} className="hover:bg-slate-50/50 transition-colors">
                          <td className="p-4 text-left">
                            <span className="font-extrabold text-slate-900 block text-xs">
                              {app.name} {app.lastName}
                            </span>
                            <span className="text-[9.5px] text-slate-400 font-extrabold uppercase mt-0.5 block font-mono">
                              CÓDIGO: {app.applicantCode || "PE-2027-" + app.dni.slice(-4)}
                            </span>
                          </td>
                          <td className="p-4 text-left">
                            <span className="font-mono font-bold text-slate-700 block">{app.dni}</span>
                            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
                              {app.phone || app.email}
                            </span>
                          </td>
                          <td className="p-4 uppercase text-[10.5px] text-slate-800 font-bold">
                            {app.programId === "electronica" ? "Electricidad Industrial" : "Contabilidad"}
                          </td>

                          {/* Control de Aula de Examen */}
                          <td className="p-4 text-left">
                            <div className="flex items-center gap-1.5">
                              <MapPin
                                className={`w-3.5 h-3.5 shrink-0 ${
                                  app.examClassroom ? "text-indigo-600" : "text-amber-500"
                                }`}
                              />
                              <select
                                value={app.examClassroom || ""}
                                onChange={(e) => handleAssignClassroom(app.dni, e.target.value)}
                                className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border shadow-3xs cursor-pointer focus:outline-none transition-all ${
                                  app.examClassroom
                                    ? "bg-indigo-50/90 text-indigo-900 border-indigo-200 focus:border-indigo-400"
                                    : "bg-amber-50/80 text-amber-900 border-amber-200 focus:border-amber-400"
                                }`}
                              >
                                <option value="">-- Sin Asignar Aula --</option>
                                {classroomOptions.map((option) => (
                                  <option key={option} value={option}>
                                    {option}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <span className="text-[9.5px] text-slate-400 mt-1 block">
                              {app.examClassroom ? (
                                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                                  <Check className="w-3 h-3" /> Visible en el portal del postulante
                                </span>
                              ) : (
                                <span className="text-amber-600 font-medium">
                                  Pendiente de asignación física
                                </span>
                              )}
                            </span>
                          </td>

                          {/* Estado de Admisión con Componente de PIN */}
                          <td className="p-4 text-center">
                            {isAdmitted ? (
                              <div className="flex items-center justify-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
                                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                  ADMITIDO (INGRESO APROBADO)
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRevertAdmission(app.dni)}
                                  className="text-[10px] font-extrabold text-slate-400 hover:text-rose-600 hover:underline uppercase tracking-wider cursor-pointer"
                                  title="Revertir ingreso a Pendiente"
                                >
                                  Revertir
                                </button>
                              </div>
                            ) : isNotAdmitted ? (
                              <div className="flex items-center justify-center gap-2">
                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-rose-100 text-rose-800 border border-rose-300 shadow-2xs">
                                  <XCircle className="w-4 h-4 text-rose-600" />
                                  NO ADMITIDO
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleRevertAdmission(app.dni)}
                                  className="text-[10px] font-extrabold text-slate-400 hover:text-indigo-600 hover:underline uppercase tracking-wider cursor-pointer"
                                  title="Revertir a Pendiente"
                                >
                                  Revertir
                                </button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-2">
                                <button
                                  type="button"
                                  onClick={() => handleOpenPinModal(app)}
                                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white shadow-3xs transition-all hover:scale-[1.02] cursor-pointer"
                                >
                                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-100" />
                                  <span>Admitir</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleMarkNotAdmitted(app.dni)}
                                  className="px-2.5 py-1.5 rounded-lg text-xs font-bold uppercase text-slate-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 transition-colors cursor-pointer"
                                  title="Calificar como No Admitido"
                                >
                                  No Admitir
                                </button>
                              </div>
                            )}
                          </td>
                                  className="px-2.5 py-2 rounded-xl text-[10.5px] font-bold uppercase text-slate-500 hover:text-rose-700 hover:bg-rose-50 border border-slate-200 hover:border-rose-200 transition-colors cursor-pointer"
                                  title="Calificar como No Admitido"
                                >
                                  No Admitir
                                </button>
                              </div>
                            )}
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

      {/* MODAL INSTITUCIONAL DE FIRMA DIGITAL CON PIN */}
      <AdminAdmissionPinModal
        isOpen={pinModalOpen}
        applicant={selectedAppForPin}
        onConfirmAdmission={handleConfirmAdmissionWithPin}
        onClose={() => {
          setPinModalOpen(false);
          setSelectedAppForPin(null);
        }}
      />
    </PageTransition>
  );
};
