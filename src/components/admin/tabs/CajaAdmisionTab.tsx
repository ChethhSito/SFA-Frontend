import React from "react";
import { CreditCard, CheckCircle2, AlertTriangle, XCircle, Clock, Eye, RefreshCw } from "lucide-react";
import { Applicant } from "../../../types";
import { ACADEMIC_PROGRAMS } from "../../../mockData";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/Card";
import PageHeader from "../../ui/PageHeader";
import PageTransition from "../../ui/PageTransition";
import Button from "../../ui/Button";

interface CajaAdmisionTabProps {
  applicants: Applicant[];
  selectedPeriodId: string;
  renderPeriodSelector: () => React.ReactNode;
  triggerAdminPreview: (title: string, fileName: string, fileType: "image" | "receipt", customMeta?: any) => void;
  handleApproveApplicantPayment: (applicantDni: string, approve: boolean) => void;
  openObservePaymentModal: (dni: string) => void;
  handleResetApplicantPayment: (applicantDni: string) => void;
}

export const CajaAdmisionTab: React.FC<CajaAdmisionTabProps> = ({
  applicants,
  selectedPeriodId,
  renderPeriodSelector,
  triggerAdminPreview,
  handleApproveApplicantPayment,
  openObservePaymentModal,
  handleResetApplicantPayment,
}) => {
  return (
    <PageTransition id="caja_admision" className="space-y-6">
      <PageHeader
        title="Derechos de Admisión - Oficina de Caja"
        subtitle="Audite los recibos financieros de postulación virtuales (Tasa S/. 120.00)."
        icon={<CreditCard className="w-6 h-6" />}
        actions={renderPeriodSelector()}
      />

      {/* Applicant Admission paid vouchers list */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Validaciones para Examen de Admisión Directo/Ordinario</CardTitle>
            <CardDescription>Derechos de postulación pagados por postulantes virtuales (Tasa S/. 120.00)</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto text-xs font-semibold animate-fade-in">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase border-b border-slate-100">
                  <th className="p-4 text-left">Postulante</th>
                  <th className="p-4 text-left">DNI / Código</th>
                  <th className="p-4 text-left">Especialidad</th>
                  <th className="p-4 text-left">Operación N°</th>
                  <th className="p-4 text-left">Costo Base</th>
                  <th className="p-4 text-left">Estado</th>
                  <th className="p-4 text-center">Acción Fiscal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                {applicants
                  .filter((app) => app.periodId === selectedPeriodId && app.paymentOperation)
                  .map((app, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                      <td className="p-4 font-black text-slate-900">
                        {app.name} {app.lastName}
                      </td>
                      <td className="p-4 font-mono text-xs text-slate-600 leading-tight">
                        <span className="block font-bold text-slate-850">{app.dni}</span>
                        <span className="block text-[9px] text-amber-600 font-extrabold">
                          {app.applicantCode || "No tiene"}
                        </span>
                      </td>
                      <td className="p-4 uppercase text-slate-500 text-[11px] font-bold">
                        {ACADEMIC_PROGRAMS.find((p) => p.id === app.programId)?.name || app.programId}
                      </td>
                      <td className="p-4 font-mono text-xs text-left">
                        <span className="font-bold text-[#5493D5] block mb-1">{app.paymentOperation}</span>
                        {app.paymentVoucherUrl ? (
                          <button
                            onClick={() =>
                              triggerAdminPreview(
                                "Voucher de " + app.name + " " + app.lastName,
                                app.paymentVoucherFileName || "voucher_pago.jpg",
                                "image",
                                { fileDataUrl: app.paymentVoucherUrl }
                              )
                            }
                            className="px-2 py-1 bg-[#9F062A]/10 hover:bg-[#9F062A]/20 text-[#9F062A] text-[9px] font-black uppercase tracking-wider rounded border border-[#9F062A]/20 transition-all cursor-pointer flex items-center gap-1 mt-1 shrink-0"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Ver Voucher Adjunto</span>
                          </button>
                        ) : (
                          <span className="text-[9px] text-slate-400 font-bold block mt-0.5">
                            Sin Voucher Físico
                          </span>
                        )}
                      </td>
                      <td className="p-4 font-bold">S/. 120.00</td>
                      <td className="p-4">
                        {app.paymentStatus === "Validado" ? (
                          <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Validado
                          </span>
                        ) : app.paymentStatus === "Observado" ? (
                          <span className="text-xs font-bold text-red-700 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Observado
                          </span>
                        ) : app.paymentStatus === "Rechazado" ? (
                          <span className="text-xs font-bold text-red-700 flex items-center gap-1">
                            <XCircle className="w-3.5 h-3.5 text-red-600" /> Rechazado
                          </span>
                        ) : (
                          <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-amber-500" /> Pendiente
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {app.paymentStatus === "Pendiente" ? (
                          <div className="flex gap-1.5 justify-center">
                            <Button
                              onClick={() => handleApproveApplicantPayment(app.dni, true)}
                              variant="primary"
                              size="sm"
                              className="font-bold tracking-wider rounded-md"
                            >
                              Aprobar
                            </Button>
                            <Button
                              onClick={() => openObservePaymentModal(app.dni)}
                              variant="outline"
                              size="sm"
                              className="font-bold tracking-wider rounded-md border-red-200 hover:bg-red-50 text-red-700"
                            >
                              Observar
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-center gap-2">
                            {app.paymentStatus === "Validado" ? (
                              <span className="text-emerald-700 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Aprobado
                              </span>
                            ) : (
                              <span className="text-emerald-700 font-black text-[10px] uppercase tracking-wider">
                                Aprobado / Cerrado
                              </span>
                            )}
                            <button
                              onClick={() => handleResetApplicantPayment(app.dni)}
                              className="text-[8.5px] uppercase font-sans font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded px-2 py-1 tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                              title="Restablecer para poder cambiar de estado o corregir aprobación por causalidad"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Restablecer</span>
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageTransition>
  );
};
