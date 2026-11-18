import React from "react";
import { CreditCard, CheckCircle2, AlertTriangle, XCircle, Clock, Eye, RefreshCw, FileText, Check } from "lucide-react";
import { Applicant, StudentPersonalData } from "../../../types";
import { useAcademicCatalog } from "../../../context/AcademicCatalogContext";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/Card";
import PageHeader from "../../ui/PageHeader";
import PageTransition from "../../ui/PageTransition";
import Button from "../../ui/Button";

interface CajaAdmisionTabProps {
  applicants: Applicant[];
  studentsList?: { [dni: string]: StudentPersonalData };
  selectedPeriodId: string;
  renderPeriodSelector: () => React.ReactNode;
  triggerAdminPreview: (title: string, fileName: string, fileType: "image" | "receipt", customMeta?: any) => void;
  handleApproveApplicantPayment: (applicantDni: string, approve: boolean) => void;
  openObservePaymentModal: (dni: string) => void;
  handleResetApplicantPayment: (applicantDni: string) => void;
}

export const CajaAdmisionTab: React.FC<CajaAdmisionTabProps> = ({
  applicants,
  studentsList = {},
  selectedPeriodId,
  renderPeriodSelector,
  triggerAdminPreview,
  handleApproveApplicantPayment,
  openObservePaymentModal,
  handleResetApplicantPayment,
}) => {
  const { programs: ACADEMIC_PROGRAMS } = useAcademicCatalog();

  const filteredApplicants = applicants.filter((app) => {
    const matchesPeriod =
      !selectedPeriodId ||
      selectedPeriodId === "all" ||
      app.periodId === selectedPeriodId;
    return matchesPeriod;
  });

  return (
    <PageTransition id="caja_admision" className="space-y-6">
      <PageHeader
        title="Derechos de Admisión - Oficina de Caja"
        subtitle="Audite los recibos financieros de postulación virtuales (Tasa S/. 120.00)."
        icon={<CreditCard className="w-6 h-6" />}
      />

      {/* Applicant Admission paid vouchers list */}
      <Card className="overflow-hidden border border-slate-200/90 shadow-sm mt-4">
        <CardHeader className="bg-slate-50/70 border-b border-slate-100 py-3.5 px-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="text-sm font-black text-slate-800 tracking-tight">Validaciones para Examen de Admisión Directo/Ordinario</CardTitle>
              <CardDescription className="text-xs text-slate-500 font-medium">Derechos de postulación pagados por postulantes virtuales (Tasa Oficial S/. 120.00)</CardDescription>
            </div>
            <span className="self-start sm:self-auto px-2.5 py-1 rounded-full text-[10.5px] font-mono font-bold bg-slate-200 text-slate-700">
              {filteredApplicants.length} {filteredApplicants.length === 1 ? "registro" : "registros"}
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto text-xs font-semibold animate-fade-in">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-white font-extrabold uppercase tracking-wide text-[10px]">
                  <th className="p-3.5">Postulante / Identificación</th>
                  <th className="p-3.5">Especialidad de Destino</th>
                  <th className="p-3.5">Comprobante / Voucher</th>
                  <th className="p-3.5 text-center">Tasa Base</th>
                  <th className="p-3.5 text-center">Estado Fiscal</th>
                  <th className="p-3.5 text-center">Acción de Caja</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                {filteredApplicants.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-slate-400 font-bold italic">
                      No hay postulantes registrados en este período de admisión.
                    </td>
                  </tr>
                ) : (
                  filteredApplicants.map((app, idx) => {
                    const student = studentsList[app.dni];
                    const fullName = (
                      `${app.name || student?.name || ""} ${app.lastName || student?.lastName || ""}`.trim() ||
                      "Postulante Registrado"
                    );
                    const programName = ACADEMIC_PROGRAMS.find((p) => p.id === app.programId)?.name || app.programId || "Electricidad Industrial";
                    const initial1 = (app.name || student?.name || "P").charAt(0).toUpperCase();
                    const initial2 = (app.lastName || student?.lastName || "R").charAt(0).toUpperCase();

                    return (
                      <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-slate-100 text-[#9F062A] font-extrabold flex items-center justify-center border border-slate-200 select-none shrink-0 shadow-3xs">
                              {initial1}{initial2}
                            </div>
                            <div>
                              <h4 className="font-bold text-[#9F062A] uppercase leading-none block text-[11.5px] whitespace-nowrap">
                                {fullName}
                              </h4>
                              <span className="text-[10px] text-slate-500 font-bold block mt-1 tracking-tight whitespace-nowrap">
                                DNI: {app.dni} | Código:{" "}
                                <span className="font-mono text-slate-800">
                                  {app.applicantCode || "Sin código"}
                                </span>
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 font-bold uppercase tracking-tight text-slate-800 text-xs whitespace-nowrap">
                          {programName}
                        </td>

                        <td className="p-3.5">
                          {(() => {
                            const hasVoucherFile = Boolean(
                              app.paymentVoucherUrl ||
                              app.paymentVoucherFileName ||
                              (app.paymentOperation && /\.(png|jpe?g|webp|pdf)$/i.test(app.paymentOperation))
                            );
                            const voucherFileName = app.paymentVoucherFileName || (
                              app.paymentOperation && /\.(png|jpe?g|webp|pdf)$/i.test(app.paymentOperation)
                                ? app.paymentOperation
                                : `voucher_admision_${app.dni}.jpg`
                            );

                            if (!app.paymentOperation && !hasVoucherFile && app.paymentStatus !== "Validado") {
                              return (
                                <span className="text-xs text-slate-400 font-semibold italic flex items-center gap-1">
                                  <Clock className="w-3.5 h-3.5 text-slate-300" /> Sin comprobante
                                </span>
                              );
                            }

                            return (
                              <div className="flex items-center gap-2 whitespace-nowrap">
                                <div className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-100 text-slate-800 border border-slate-200/90 text-[11px] font-semibold max-w-[210px] shadow-3xs">
                                  <FileText className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                                  <span className="truncate font-mono" title={voucherFileName}>
                                    {voucherFileName}
                                  </span>
                                </div>
                                <button
                                  type="button"
                                  onClick={() =>
                                    triggerAdminPreview(
                                      "Voucher Admisión - " + fullName,
                                      voucherFileName,
                                      hasVoucherFile ? "image" : "receipt",
                                      {
                                        dni: app.dni,
                                        studentName: app.name || student?.name || "",
                                        studentLastName: app.lastName || student?.lastName || "",
                                        fullName: fullName,
                                        programName: programName,
                                        transactionId: app.paymentOperation || `ADM-${app.dni}`,
                                        amount: "S/. 120.00",
                                        date: app.paymentValidatedAt || app.registeredAt || new Date().toISOString().split("T")[0],
                                        concept: "Derecho de Examen de Admisión",
                                        fileDataUrl: app.paymentVoucherUrl,
                                        fileName: voucherFileName,
                                        docLabel: "Comprobante de Pago de Admisión",
                                        paymentStatus: app.paymentStatus,
                                        isVoucher: true,
                                      }
                                    )
                                  }
                                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#9F062A] hover:bg-[#800521] text-white text-xs font-bold shadow-3xs transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap select-none"
                                  title="Ver comprobante adjunto"
                                >
                                  <Eye className="w-3.5 h-3.5 text-rose-200" />
                                  <span>Ver</span>
                                </button>
                              </div>
                            );
                          })()}
                        </td>

                        <td className="p-3.5 text-center whitespace-nowrap">
                          <span className="font-mono font-bold text-xs text-slate-800 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200 shadow-3xs">
                            S/. 120.00
                          </span>
                        </td>

                        <td className="p-3.5 text-center whitespace-nowrap">
                          {app.paymentStatus === "Validado" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-3xs">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Validado
                            </span>
                          ) : app.paymentStatus === "Observado" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-3xs">
                              <AlertTriangle className="w-3.5 h-3.5 text-rose-600" /> Observado
                            </span>
                          ) : app.paymentStatus === "Rechazado" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-300 shadow-3xs">
                              <XCircle className="w-3.5 h-3.5 text-rose-600" /> Rechazado
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 shadow-3xs">
                              <Clock className="w-3.5 h-3.5 text-amber-600" /> Por Validar
                            </span>
                          )}
                        </td>

                        <td className="p-3.5 text-center whitespace-nowrap">
                          {!app.paymentOperation && !app.paymentVoucherUrl ? (
                            <span className="text-[11px] font-semibold text-slate-400 italic">Sin pago registrado</span>
                          ) : app.paymentStatus === "Pendiente" ? (
                            <div className="flex items-center justify-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => handleApproveApplicantPayment(app.dni, true)}
                                className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-3xs transition-all hover:scale-105 active:scale-95 cursor-pointer"
                              >
                                <Check className="w-3.5 h-3.5" />
                                <span>Aprobar</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => openObservePaymentModal(app.dni)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-bold text-rose-700 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
                              >
                                <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
                                <span>Observar</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center gap-2">
                              <span className="inline-flex items-center gap-1 text-[11px] font-black text-emerald-800 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 shadow-3xs">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Aprobado
                              </span>
                              <button
                                type="button"
                                onClick={() => handleResetApplicantPayment(app.dni)}
                                className="text-[10px] uppercase font-bold text-slate-400 hover:text-amber-700 hover:bg-amber-50 border border-slate-200 rounded-md px-2 py-1 tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                                title="Restablecer estado del pago para reconsiderar"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Restablecer</span>
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageTransition>
  );
};
