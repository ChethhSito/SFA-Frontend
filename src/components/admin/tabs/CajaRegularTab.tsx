import React from "react";
import { CreditCard, CheckCircle2, AlertTriangle, Clock, Eye, RefreshCw } from "lucide-react";
import { Enrollment, Applicant, StudentPersonalData } from "../../../types";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/Card";
import PageHeader from "../../ui/PageHeader";
import PageTransition from "../../ui/PageTransition";
import Button from "../../ui/Button";

interface CajaRegularTabProps {
  enrollments: Enrollment[];
  applicants: Applicant[];
  studentsList: { [dni: string]: StudentPersonalData };
  selectedPeriodId: string;
  renderPeriodSelector: () => React.ReactNode;
  triggerAdminPreview: (title: string, fileName: string, fileType: "image" | "receipt", customMeta?: any) => void;
  handleApproveEnrollmentPayment: (studentDni: string, approve: boolean) => void;
  handleResetEnrollmentPayment: (studentDni: string) => void;
}

export const CajaRegularTab: React.FC<CajaRegularTabProps> = ({
  enrollments,
  applicants,
  studentsList,
  selectedPeriodId,
  renderPeriodSelector,
  triggerAdminPreview,
  handleApproveEnrollmentPayment,
  handleResetEnrollmentPayment,
}) => {
  return (
    <PageTransition id="caja_regular" className="space-y-6">
      <PageHeader
        title="Matrículas e Inscripciones Semestrales - Oficina de Caja"
        subtitle="Audite las tasas de S/. 250 de matrícula regular y registre la conformidad del pago de ingresantes y alumnos."
        icon={<CreditCard className="w-6 h-6" />}
        actions={renderPeriodSelector()}
      />

      {/* Students matricula regular semester paid vouchers lists */}
      <Card>
        <CardHeader>
          <div>
            <CardTitle>Validaciones de Matrícula Regular e Inscripción</CardTitle>
            <CardDescription>
              Inscripciones para el periodo ordinario de ingresantes y estudiantes admitidos (Tasa S/. 250.00)
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto text-xs font-semibold animate-fade-in">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-slate-50 text-slate-500 text-[10px] uppercase border-b border-slate-100">
                  <th className="p-4 text-left">Alumno</th>
                  <th className="p-4 text-left">DNI</th>
                  <th className="p-4 text-left">Inscripción N°</th>
                  <th className="p-4 text-left">Derecho Regular</th>
                  <th className="p-4 text-left">Estado Pago</th>
                  <th className="p-4 text-left">Ficha Matrícula</th>
                  <th className="p-4 text-center">Acción Fiscal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 bg-white">
                {(() => {
                  const admittedApplicants = applicants.filter((a) => a.admitted === "ADMITIDO" || a.admitted === true);
                  const combinedEnrollments: Enrollment[] = [...enrollments];
                  admittedApplicants.forEach((a) => {
                    if (!combinedEnrollments.some((e) => e.studentDni === a.dni)) {
                      combinedEnrollments.push({
                        studentDni: a.dni,
                        programId: a.programId,
                        academicStatus: "ADMITIDO" as const,
                        paymentStatus: "No Pagado" as const,
                        docs: {
                          dniFile: { status: "No Enviado" as const },
                          certificadoFile: { status: "No Enviado" as const },
                          partidaFile: { status: "No Enviado" as const },
                          fotoFile: { status: "No Enviado" as const }
                        }
                      });
                    }
                  });

                  const filteredEnrollments = combinedEnrollments.filter((enr) => {
                    const app = applicants.find((a) => a.dni === enr.studentDni);
                    const matchesPeriod =
                      !selectedPeriodId ||
                      selectedPeriodId === "all" ||
                      app?.periodId === selectedPeriodId;
                    const isAdmittedOrEnrolled =
                      enr.academicStatus === "ADMITIDO" ||
                      enr.academicStatus === "MATRICULADO" ||
                      (app && (app.admitted === "ADMITIDO" || app.admitted === true));
                    return matchesPeriod && (!!enr.paymentOperation || isAdmittedOrEnrolled);
                  });

                  if (filteredEnrollments.length === 0) {
                    return (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-slate-400 font-bold italic">
                          No hay ingresantes ni estudiantes registrados en este periodo para validación de matrícula.
                        </td>
                      </tr>
                    );
                  }

                  return filteredEnrollments.map((enr, idx) => {
                    const student = studentsList[enr.studentDni];
                    const fallbackApplicant = applicants.find((a) => a.dni === enr.studentDni);
                    const displayName = student
                      ? `${student.name} ${student.lastName}`
                      : fallbackApplicant
                      ? `${fallbackApplicant.name} ${fallbackApplicant.lastName}`
                      : "Estudiante Admitido";

                    return (
                      <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4 font-black text-slate-900">{displayName}</td>
                        <td className="p-4 font-mono text-slate-600 font-bold">{enr.studentDni}</td>
                        <td className="p-4 font-mono text-xs text-left">
                          {enr.paymentOperation ? (
                            <>
                              <span className="font-bold text-[#5493D5] block mb-1">{enr.paymentOperation}</span>
                              {enr.paymentVoucherUrl ? (
                                <button
                                  onClick={() =>
                                    triggerAdminPreview(
                                      "Voucher Matrícula de " + displayName,
                                      enr.paymentVoucherFileName || "voucher_matricula.jpg",
                                      "image",
                                      { fileDataUrl: enr.paymentVoucherUrl }
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
                            </>
                          ) : (
                            <span className="text-[9.5px] text-amber-700 bg-amber-50 border border-amber-200/80 font-black uppercase px-2 py-0.5 rounded">
                              Pendiente de Subir Voucher
                            </span>
                          )}
                        </td>
                        <td className="p-4 font-bold">S/. 250.00</td>
                        <td className="p-4">
                          {enr.paymentStatus === "Validado" ? (
                            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Validado
                            </span>
                          ) : enr.paymentStatus === "Observado" ? (
                            <span className="text-xs font-bold text-red-700 flex items-center gap-1">
                              <AlertTriangle className="w-3.5 h-3.5 text-red-600" /> Rechazado / Obs.
                            </span>
                          ) : enr.paymentStatus === "Pendiente" ? (
                            <span className="text-xs font-bold text-amber-700 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-amber-500" /> Por Revisar
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200">
                              No Pagado
                            </span>
                          )}
                        </td>
                        <td className="p-4">
                          {enr.academicStatus === "MATRICULADO" ? (
                            <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Matriculado
                            </span>
                          ) : enr.paymentStatus === "Validado" ? (
                            <span className="text-xs font-bold text-sky-700 flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-sky-500" /> Pendiente a matricular
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-slate-600">Admitido</span>
                          )}
                        </td>
                        <td className="p-4 text-center">
                          {enr.paymentStatus === "Pendiente" ? (
                            <div className="flex gap-1.5 justify-center">
                              <Button
                                onClick={() => handleApproveEnrollmentPayment(enr.studentDni, true)}
                                variant="primary"
                                size="sm"
                                className="font-bold tracking-wider"
                              >
                                Validar S/.250
                              </Button>
                              <Button
                                onClick={() => handleApproveEnrollmentPayment(enr.studentDni, false)}
                                variant="outline"
                                size="sm"
                                className="font-bold tracking-wider text-rose-700 border-rose-200 hover:bg-rose-50"
                              >
                                Rechazar
                              </Button>
                            </div>
                          ) : enr.paymentStatus === "Validado" ? (
                            <div className="flex flex-col items-center gap-1">
                              <span className="text-emerald-700 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Verificado
                              </span>
                              <button
                                onClick={() => handleResetEnrollmentPayment(enr.studentDni)}
                                className="text-[8.5px] uppercase font-sans font-bold bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded px-2 py-0.5 tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                                title="Restablecer para poder corregir o cambiar de estado"
                              >
                                <RefreshCw className="w-3 h-3" />
                                <span>Restablecer</span>
                              </button>
                            </div>
                          ) : (
                            <div className="flex justify-center">
                              <Button
                                onClick={() => handleApproveEnrollmentPayment(enr.studentDni, true)}
                                variant="outline"
                                size="sm"
                                className="font-bold text-[10px] tracking-wider text-emerald-800 border-emerald-250 hover:bg-emerald-50"
                              >
                                Validar en Ventanilla
                              </Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    );
                  });
                })()}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageTransition>
  );
};
