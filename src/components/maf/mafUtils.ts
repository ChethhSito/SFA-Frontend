import { MafConcept, MafObligation, MafExoneration, MafAuditLog } from "./mafTypes";

export const defaultConcepts: MafConcept[] = [
  { id: "c1", code: "ADM01", name: "Derecho de Examen de Admisión Ordinario", amount: 120, description: "Tasa general obligatoria para registro y rendición del examen de admisión", category: "Admisión", active: true },
  { id: "c2", code: "MAT01", name: "Matrícula Semestral Regular", amount: 250, description: "Tasa semestral obligatoria de registro y reserva de vacante ciclo escolar", category: "Matrícula", active: true },
  { id: "c3", code: "CER01", name: "Certificado de Estudios Oficial", amount: 50, description: "Trámite de expedición de expediente de calificaciones certificadas", category: "Trámites", active: true },
  { id: "c4", code: "CON01", name: "Constancia de Matrícula Institucional", amount: 30, description: "Constancia con validez institucional de matrícula vigente", category: "Trámites", active: true },
  { id: "c5", code: "SUB01", name: "Derecho de Examen de Subsanación", amount: 45, description: "Subsanación académica por curso desaprobado", category: "Servicios", active: true },
  { id: "c6", code: "CAR01", name: "Duplicado de Carné de Estudiante", amount: 15, description: "Reposición de credencial física de estudiante por pérdida", category: "Trámites", active: true }
];

export const syncObligationsToMamcAndMge = (updated: MafObligation[]) => {
  // Sync MAT01 (Matrícula) payments to enrollments database in localStorage
  const storedEnrollments = localStorage.getItem("sfa_enrollments");
  if (storedEnrollments) {
    try {
      const enrolls = JSON.parse(storedEnrollments);
      let modified = false;
      const nextEnrolls = enrolls.map((enr: any) => {
        const match = updated.find(o => o.studentDni === enr.studentDni && o.conceptCode === "MAT01");
        if (match) {
          let nextStatus = enr.paymentStatus;
          if (match.status === "Validado") nextStatus = "Validado";
          else if (match.status === "Observado") nextStatus = "Rechazado";
          else if (match.status === "Pendiente") nextStatus = "Pendiente";
          else if (match.status === "Exonerado") nextStatus = "Validado";

          if (enr.paymentStatus !== nextStatus) {
            modified = true;
            return {
              ...enr,
              paymentStatus: nextStatus,
              paymentOperation: match.voucherDetails?.operationNumber || enr.paymentOperation
            };
          }
        }
        return enr;
      });

      if (modified) {
        localStorage.setItem("sfa_enrollments", JSON.stringify(nextEnrolls));
      }
    } catch (err) {
      console.error("Failed to sync MAF updates to enrollments", err);
    }
  }

  // Sync ADM01 (Admisión) payment to applicants database in localStorage
  const storedApps = localStorage.getItem("sfa_applicants");
  if (storedApps) {
    try {
      const apps = JSON.parse(storedApps);
      let modified = false;
      const nextApps = apps.map((app: any) => {
        const match = updated.find(o => o.studentDni === app.dni && o.conceptCode === "ADM01");
        if (match) {
          let nextStatus = app.paymentStatus;
          if (match.status === "Validado") nextStatus = "Validado";
          else if (match.status === "Observado") nextStatus = "Observado";
          else if (match.status === "Pendiente" && match.voucherRegistered) nextStatus = "Pendiente";

          if (app.paymentStatus !== nextStatus) {
            modified = true;
            return {
              ...app,
              paymentStatus: nextStatus,
              paymentOperation: match.voucherDetails?.operationNumber || app.paymentOperation
            };
          }
        }
        return app;
      });

      if (modified) {
        localStorage.setItem("sfa_applicants", JSON.stringify(nextApps));
      }
    } catch (err) {
      console.error("Failed to sync MAF admission updates to applicants", err);
    }
  }
};
