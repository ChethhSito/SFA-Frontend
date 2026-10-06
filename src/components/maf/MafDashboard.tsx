import React, { useState, useEffect } from "react";
import Sidebar from "../ui/Sidebar";
import { Card, CardContent } from "../ui/Card";
import {
  CreditCard,
  Percent,
  History,
  HelpCircle,
  Info,
  RefreshCw,
  Coins,
  ShieldCheck,
  Layers,
  ArrowLeft
} from "lucide-react";
import { fetchApplicants, fetchEnrollments } from "../../services/api";
import { MafConcept, MafObligation, MafExoneration, MafAuditLog, SupportTicket } from "./mafTypes";
import { defaultConcepts, syncObligationsToMamcAndMge } from "./mafUtils";
import { AddConceptModal } from "./modals/AddConceptModal";
import { AddObligationModal } from "./modals/AddObligationModal";
import { RegisterVoucherModal } from "./modals/RegisterVoucherModal";
import { ObserveObligationModal } from "./modals/ObserveObligationModal";
import { ExonerationModal } from "./modals/ExonerationModal";
import { RegistroPagosTab } from "./tabs/RegistroPagosTab";
import { ValidacionPagosTab } from "./tabs/ValidacionPagosTab";
import { EstadosPagoTab } from "./tabs/EstadosPagoTab";
import { CatalogoTasasTab } from "./tabs/CatalogoTasasTab";
import { ExoneracionesTab } from "./tabs/ExoneracionesTab";
import { RegistroTransaccionesTab } from "./tabs/RegistroTransaccionesTab";
import { AuditoriaTab } from "./tabs/AuditoriaTab";
import { SoporteTab } from "./tabs/SoporteTab";

interface MafDashboardProps {
  onLogout: () => void;
}

export default function MafDashboard({ onLogout }: MafDashboardProps) {
  // Navigation State
  const [activeTab, setActiveTab] = useState<
    "registro_pagos" | "validacion_pagos" | "estados_pago" | "catalogo_tasas" | "exoneraciones" | "registro_transacciones" | "auditoria" | "soporte"
  >("registro_pagos");

  // Notifications State
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null);

  // Core Entity States
  const [concepts, setConcepts] = useState<MafConcept[]>([]);
  const [obligations, setObligations] = useState<MafObligation[]>([]);
  const [exonerations, setExonerations] = useState<MafExoneration[]>([]);
  const [auditLogs, setAuditLogs] = useState<MafAuditLog[]>([]);

  // Search, Filter, and Modal States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  // Modals visibility toggles
  const [showAddConceptModal, setShowAddConceptModal] = useState(false);
  const [showAddObligationModal, setShowAddObligationModal] = useState(false);
  const [showRegisterVoucherModal, setShowRegisterVoucherModal] = useState(false);
  const [showObserveModal, setShowObserveModal] = useState(false);
  const [showExonerationModal, setShowExonerationModal] = useState(false);

  // Forms state variables
  const [conceptForm, setConceptForm] = useState<Omit<MafConcept, "id">>({
    code: "",
    name: "",
    amount: 0,
    description: "",
    category: "Servicios",
    active: true,
  });

  const [obligationForm, setObligationForm] = useState({
    studentDni: "",
    studentName: "",
    conceptId: "",
    period: "2026-I",
  });

  const [selectedObligationId, setSelectedObligationId] = useState<string | null>(null);
  const [voucherForm, setVoucherForm] = useState({
    operationNumber: "",
    bankName: "Banco de la Nación",
    paymentDate: new Date().toISOString().split("T")[0],
    amountPaid: 0,
    observations: "",
  });

  const [observationText, setObservationText] = useState("");

  const [exonerationForm, setExonerationForm] = useState({
    studentDni: "",
    studentName: "",
    type: "Beca Integral (100%)" as MafExoneration["type"],
    percentage: 100,
    conceptCode: "",
    reason: "",
  });

  // Support Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>([
    { id: "T-8091", sender: "Rosa Elvira Huamán", dni: "44332211", topic: "Voucher de admisión rechazado", date: "2026-06-15", status: "Pendiente", detail: "El banco no emitió el código correcto pero adjunto mi captura de banca por celular." },
    { id: "T-8082", sender: "Jorge Luis Toledo", dni: "76543210", topic: "Error de cobro duplicado", date: "2026-06-14", status: "Atendido", detail: "Hice el pago dos veces por error, solicito la devolución de S/. 250." },
    { id: "T-8073", sender: "Carlos Mendoza", dni: "98765432", topic: "Carga de exoneración por convenio", date: "2026-06-12", status: "Atendido", detail: "Falta aplicar mi descuento de media beca deportiva de S/.125 para mi matrícula." }
  ]);

  const [newTicket, setNewTicket] = useState({
    sender: "",
    dni: "",
    topic: "",
    detail: ""
  });

  // Trigger transient message banners
  const triggerNotification = (message: string, type: "success" | "info" | "warning" = "success") => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4500);
  };

  // Log automated auditing trials
  const addAuditLog = (action: string, details: string, type: MafAuditLog["type"] = "info") => {
    const newLog: MafAuditLog = {
      id: "LOG-" + Math.floor(100000 + Math.random() * 900000),
      timestamp: new Date().toLocaleDateString("es-PE", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      }),
      user: "MAF_OFFICER",
      action,
      module: "MAF",
      details,
      type,
    };
    setAuditLogs((prev) => {
      const updated = [newLog, ...prev];
      localStorage.setItem("maf_audit_logs", JSON.stringify(updated));
      return updated;
    });
  };

  // Initialization & LocalStorage Load
  useEffect(() => {
    const storedConcepts = localStorage.getItem("maf_concepts");
    if (storedConcepts) {
      setConcepts(JSON.parse(storedConcepts));
    } else {
      setConcepts(defaultConcepts);
      localStorage.setItem("maf_concepts", JSON.stringify(defaultConcepts));
    }

    const storedExonerations = localStorage.getItem("maf_exonerations");
    if (storedExonerations) {
      setExonerations(JSON.parse(storedExonerations));
    } else {
      setExonerations([]);
      localStorage.setItem("maf_exonerations", JSON.stringify([]));
    }

    const storedObligations = localStorage.getItem("maf_obligations");
    if (storedObligations) {
      setObligations(JSON.parse(storedObligations));
    } else {
      setObligations([]);
      localStorage.setItem("maf_obligations", JSON.stringify([]));
    }

    const storedLogs = localStorage.getItem("maf_audit_logs");
    if (storedLogs) {
      setAuditLogs(JSON.parse(storedLogs));
    } else {
      setAuditLogs([]);
      localStorage.setItem("maf_audit_logs", JSON.stringify([]));
    }

    // Automatic Sync of MAMC & MGE Payments
    const syncMamcPayments = async () => {
      try {
        let apps: any[] = [];
        let enrolls: any[] = [];

        const savedApps = localStorage.getItem("sfa_applicants");
        if (savedApps) apps = JSON.parse(savedApps);

        const savedEnrolls = localStorage.getItem("sfa_enrollments");
        if (savedEnrolls) enrolls = JSON.parse(savedEnrolls);

        const apiApps = await fetchApplicants();
        if (apiApps && Array.isArray(apiApps) && apiApps.length > 0) {
          apiApps.forEach((a) => {
            if (!apps.some((x) => x.dni === a.dni)) apps.push(a);
          });
        }

        const apiEnrolls = await fetchEnrollments();
        if (apiEnrolls && Array.isArray(apiEnrolls) && apiEnrolls.length > 0) {
          apiEnrolls.forEach((e) => {
            if (!enrolls.some((x) => (x.id && x.id === (e as any).id) || x.studentDni === e.studentDni)) enrolls.push(e);
          });
        }

        setObligations((prevObls) => {
          const updatedObls = [...prevObls];
          let changed = false;

          apps.forEach((app) => {
            const dni = app.dni;
            if (!dni) return;
            const fullName = `${app.name || ''} ${app.lastName || ''}`.trim() || `Postulante DNI ${dni}`;
            const existingAdm = updatedObls.find((o) => o.studentDni === dni && o.conceptCode === "ADM01");

            let status: MafObligation["status"] = "Pendiente";
            if (app.paymentStatus === "Pagado" || app.paymentStatus === "VERIFICADO" || app.paymentStatus === "Validado" || app.status === "REGISTRADO") {
              status = "Validado";
            } else if (app.paymentStatus === "POR_VERIFICAR" || app.paymentStatus === "En Proceso") {
              status = "En Proceso";
            }

            if (!existingAdm) {
              updatedObls.push({
                id: `OBL-ADM-${dni}`,
                studentDni: dni,
                studentName: fullName,
                conceptCode: "ADM01",
                conceptName: "Derecho de Examen de Admisión Ordinario",
                amount: 120,
                discount: 0,
                finalAmount: 120,
                period: app.admissionPeriod || "2026-I",
                status,
                dateCreated: app.createdAt || new Date().toISOString().split("T")[0],
                voucherRegistered: status === "Validado" || status === "En Proceso" || !!app.voucherCode || !!app.paymentVoucher,
                voucherDetails: {
                  operationNumber: app.voucherCode || app.paymentVoucher || `VOUCH-${dni}`,
                  bankName: "Banco de la Nación",
                  paymentDate: app.paymentDate || new Date().toISOString().split("T")[0],
                  amountPaid: 120,
                  observations: app.notes || "Pago registrado en portal de admisión MAMC"
                }
              });
              changed = true;
            } else if (existingAdm.status !== status && status === "Validado") {
              existingAdm.status = status;
              existingAdm.voucherRegistered = true;
              changed = true;
            }
          });

          enrolls.forEach((enr) => {
            const dni = enr.studentDni;
            if (!dni) return;
            const fullName = enr.studentName || `Estudiante DNI ${dni}`;
            const existingMat = updatedObls.find((o) => o.studentDni === dni && o.conceptCode === "MAT01");

            let status: MafObligation["status"] = "Pendiente";
            if (enr.paymentStatus === "Validado" || enr.paymentStatus === "PAGADO" || enr.academicStatus === "MATRICULADO") {
              status = "Validado";
            } else if (enr.paymentStatus === "POR_VERIFICAR" || enr.paymentStatus === "En Proceso") {
              status = "En Proceso";
            }

            if (!existingMat) {
              updatedObls.push({
                id: `OBL-MAT-${dni}`,
                studentDni: dni,
                studentName: fullName,
                conceptCode: "MAT01",
                conceptName: "Matrícula Semestral Regular",
                amount: 250,
                discount: 0,
                finalAmount: 250,
                period: enr.period || "2026-I",
                status,
                dateCreated: enr.enrollmentDate || new Date().toISOString().split("T")[0],
                voucherRegistered: status === "Validado" || status === "En Proceso" || !!enr.paymentOperation,
                voucherDetails: {
                  operationNumber: enr.paymentOperation || `VOUCH-MAT-${dni}`,
                  bankName: "Banco de la Nación",
                  paymentDate: enr.enrollmentDate || new Date().toISOString().split("T")[0],
                  amountPaid: 250,
                  observations: "Matrícula procesada en portal MAMC/MGE"
                }
              });
              changed = true;
            } else if (existingMat.status !== status && status === "Validado") {
              existingMat.status = status;
              existingMat.voucherRegistered = true;
              changed = true;
            }
          });

          if (changed) {
            localStorage.setItem("maf_obligations", JSON.stringify(updatedObls));
          }

          return updatedObls;
        });
      } catch (err) {
        console.error("Error syncing MAMC payments into MAF:", err);
      }
    };

    syncMamcPayments();
  }, []);

  // Save on updates helper
  const handleConceptsUpdate = (updated: MafConcept[]) => {
    setConcepts(updated);
    localStorage.setItem("maf_concepts", JSON.stringify(updated));
  };

  const handleObligationsUpdate = (updated: MafObligation[]) => {
    setObligations(updated);
    localStorage.setItem("maf_obligations", JSON.stringify(updated));
    syncObligationsToMamcAndMge(updated);
  };

  const handleExonerationsUpdate = (updated: MafExoneration[]) => {
    setExonerations(updated);
    localStorage.setItem("maf_exonerations", JSON.stringify(updated));
  };

  // Concept CRUD Handlers
  const handleAddConcept = (e: React.FormEvent) => {
    e.preventDefault();
    if (!conceptForm.code || !conceptForm.name || conceptForm.amount <= 0) {
      triggerNotification("Por favor rellene todos los campos con valores correctos.", "warning");
      return;
    }

    if (concepts.some(c => c.code.toUpperCase() === conceptForm.code.toUpperCase())) {
      triggerNotification(`El código de tasa ${conceptForm.code.toUpperCase()} ya existe.`, "warning");
      return;
    }

    const newConcept: MafConcept = {
      id: "c" + (concepts.length + 1) + Math.floor(Math.random() * 100),
      code: conceptForm.code.toUpperCase(),
      name: conceptForm.name,
      amount: Number(conceptForm.amount),
      description: conceptForm.description,
      category: conceptForm.category,
      active: true,
    };

    const nextList = [...concepts, newConcept];
    handleConceptsUpdate(nextList);
    addAuditLog("Crear Concepto Académico", `Se creó el concepto ${newConcept.code} (${newConcept.name}) con un valor de S/.${newConcept.amount}.`, "success");
    triggerNotification(`Concepto de tasa ${newConcept.code} agregado con éxito.`);
    setShowAddConceptModal(false);
    setConceptForm({ code: "", name: "", amount: 0, description: "", category: "Servicios", active: true });
  };

  const handleDeleteConcept = (id: string, code: string) => {
    if (confirm(`¿Está seguro de que desea eliminar permanentemente el concepto de tasa ${code}?`)) {
      const nextList = concepts.filter(c => c.id !== id);
      handleConceptsUpdate(nextList);
      addAuditLog("Eliminar Concepto Académico", `Se eliminó el concepto ${code} del catálogo institucional.`, "warning");
      triggerNotification("Concepto de tasa eliminado del catálogo.");
    }
  };

  const handleToggleConceptActive = (id: string) => {
    const nextList = concepts.map(c => {
      if (c.id === id) {
        const nextState = !c.active;
        addAuditLog("Alternar Concepto Académico", `Se ${nextState ? "activó" : "desactivó"} la tasa académica ${c.code}.`, "info");
        return { ...c, active: nextState };
      }
      return c;
    });
    handleConceptsUpdate(nextList);
    triggerNotification("Estado del concepto actualizado.");
  };

  // Obligation Form Handlers
  const handleCreateObligation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!obligationForm.studentDni || !obligationForm.studentName || !obligationForm.conceptId) {
      triggerNotification("Por favor, rellene todos los campos requeridos.", "warning");
      return;
    }

    const matchedConcept = concepts.find(c => c.id === obligationForm.conceptId);
    if (!matchedConcept) return;

    const existingEx = exonerations.find(ex => ex.studentDni === obligationForm.studentDni && ex.conceptCode === matchedConcept.code);
    const discount = existingEx ? (matchedConcept.amount * (existingEx.percentage / 100)) : 0;
    const finalAmt = matchedConcept.amount - discount;

    const newObl: MafObligation = {
      id: "obl-" + Math.floor(1000 + Math.random() * 9000),
      studentDni: obligationForm.studentDni,
      studentName: obligationForm.studentName,
      conceptCode: matchedConcept.code,
      conceptName: matchedConcept.name,
      amount: matchedConcept.amount,
      discount,
      finalAmount: finalAmt,
      period: obligationForm.period,
      status: finalAmt === 0 ? "Exonerado" : "Pendiente",
      dateCreated: new Date().toISOString().split("T")[0]
    };

    const nextObls = [newObl, ...obligations];
    handleObligationsUpdate(nextObls);

    addAuditLog(
      "Crear Obligación de Pago",
      `Se generó obligación de pago para ${newObl.studentName} por el concepto ${newObl.conceptCode} de S/.${newObl.finalAmount}.`,
      "success"
    );

    triggerNotification(`Obligación de pago generada con éxito.`);
    setShowAddObligationModal(false);
    setObligationForm({ studentDni: "", studentName: "", conceptId: "", period: "2026-I" });
  };

  // Register Voucher (Pago) Handler
  const handleOpenRegisterVoucher = (oblId: string) => {
    const ob = obligations.find(o => o.id === oblId);
    if (!ob) return;

    setSelectedObligationId(oblId);
    setVoucherForm({
      operationNumber: "OP-" + Math.floor(100000 + Math.random() * 900000),
      bankName: "Banco de la Nación",
      paymentDate: new Date().toISOString().split("T")[0],
      amountPaid: ob.finalAmount,
      observations: "",
    });
    setShowRegisterVoucherModal(true);
  };

  const handleRegisterVoucher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedObligationId || !voucherForm.operationNumber || voucherForm.amountPaid <= 0) {
      triggerNotification("Por favor ingrese todos los detalles del comprobante físico.", "warning");
      return;
    }

    const nextList = obligations.map(o => {
      if (o.id === selectedObligationId) {
        addAuditLog(
          "Registro de Voucher",
          `Comprobante #${voucherForm.operationNumber} registrado para la obligación de ${o.studentName} por S/.${voucherForm.amountPaid}. Estado: En Proceso de validación.`,
          "info"
        );
        return {
          ...o,
          status: "En Proceso" as const,
          voucherRegistered: true,
          voucherDetails: {
            operationNumber: voucherForm.operationNumber,
            bankName: voucherForm.bankName,
            paymentDate: voucherForm.paymentDate,
            amountPaid: Number(voucherForm.amountPaid),
            observations: voucherForm.observations,
          }
        };
      }
      return o;
    });

    handleObligationsUpdate(nextList);
    triggerNotification("Comprobante de pago bancario registrado con éxito para validación.");
    setShowRegisterVoucherModal(false);
    setSelectedObligationId(null);
  };

  // Validation Handlers (Approve/Reject)
  const handleApprovePayment = (oblId: string) => {
    const ob = obligations.find(o => o.id === oblId);
    if (!ob) return;

    if (confirm(`¿Confirmó el importe de S/. ${ob.finalAmount} y desea VALIDAR oficialmente este pago de ${ob.studentName}?`)) {
      const nextList = obligations.map(o => {
        if (o.id === oblId) {
          addAuditLog(
            "Validación Aprobación",
            `El comprobante ${o.voucherDetails?.operationNumber || "N/A"} asociado a ${o.studentName} fue VALIDADO exitosamente.`,
            "success"
          );
          return {
            ...o,
            status: "Validado" as const,
          };
        }
        return o;
      });

      handleObligationsUpdate(nextList);
      triggerNotification("Pago auditado y VALIDADO oficialmente.");
    }
  };

  const handleOpenObservePayment = (oblId: string) => {
    setSelectedObligationId(oblId);
    setObservationText("");
    setShowObserveModal(true);
  };

  const handleConfirmObservePayment = () => {
    if (!selectedObligationId || !observationText.trim()) {
      triggerNotification("Por favor, provea la razón del rechazo / observación para notificar al estudiante.", "warning");
      return;
    }

    const nextList = obligations.map(o => {
      if (o.id === selectedObligationId) {
        addAuditLog(
          "Validación Observada",
          `El comprobante ${o.voucherDetails?.operationNumber || "N/A"} de ${o.studentName} fue OBSERVADO. Detalle: ${observationText}`,
          "danger"
        );
        return {
          ...o,
          status: "Observado" as const,
          voucherDetails: o.voucherDetails ? {
            ...o.voucherDetails,
            observations: observationText
          } : undefined
        };
      }
      return o;
    });

    handleObligationsUpdate(nextList);
    triggerNotification("Pago calificado como OBSERVADO con éxito.", "warning");
    setShowObserveModal(false);
    setSelectedObligationId(null);
  };

  // Exoneration Forms Handlers
  const handleOpenAddExoneration = () => {
    setExonerationForm({
      studentDni: "",
      studentName: "",
      type: "Beca Integral (100%)",
      percentage: 100,
      conceptCode: "MAT01",
      reason: "",
    });
    setShowExonerationModal(true);
  };

  const handleAddExoneration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!exonerationForm.studentDni || !exonerationForm.studentName || !exonerationForm.reason) {
      triggerNotification("Por favor complete todos los datos de la resolución de exoneración.", "warning");
      return;
    }

    const newEx: MafExoneration = {
      id: "ex-" + Math.floor(1000 + Math.random() * 9000),
      studentDni: exonerationForm.studentDni,
      studentName: exonerationForm.studentName,
      type: exonerationForm.type,
      percentage: Number(exonerationForm.percentage),
      conceptCode: exonerationForm.conceptCode,
      reason: exonerationForm.reason,
      dateGranted: new Date().toISOString().split("T")[0]
    };

    const nextExs = [...exonerations, newEx];
    handleExonerationsUpdate(nextExs);

    const nextObls = obligations.map(o => {
      if (o.studentDni === newEx.studentDni && o.conceptCode === newEx.conceptCode && o.status === "Pendiente") {
        const discountAmt = o.amount * (newEx.percentage / 100);
        const finalAmt = o.amount - discountAmt;
        return {
          ...o,
          discount: discountAmt,
          finalAmount: finalAmt,
          status: finalAmt === 0 ? ("Exonerado" as const) : o.status
        };
      }
      return o;
    });
    handleObligationsUpdate(nextObls);

    addAuditLog(
      "Otorgar Exoneración",
      `Se otorgó exoneración tipo (${newEx.type}) a ${newEx.studentName} para el concepto ${newEx.conceptCode}.`,
      "info"
    );

    triggerNotification("Beca / Exoneración registrada y aplicada con éxito.");
    setShowExonerationModal(false);
  };

  const handleDeleteExoneration = (id: string, name: string) => {
    if (confirm(`¿Desea anular la exoneración de ${name}?`)) {
      const nextList = exonerations.filter(ex => ex.id !== id);
      handleExonerationsUpdate(nextList);
      addAuditLog("Anulación de Exoneración", `Se anuló la exoneración para ${name}.`, "warning");
      triggerNotification("Exoneración anulada con éxito.");
    }
  };

  // Support Ticket Form Submit
  const handleAddTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTicket.sender || !newTicket.dni || !newTicket.topic || !newTicket.detail) {
      triggerNotification("Por favor, complete todos los campos de asistencia.", "warning");
      return;
    }

    const t: SupportTicket = {
      id: "T-" + Math.floor(8100 + Math.random() * 900),
      sender: newTicket.sender,
      dni: newTicket.dni,
      topic: newTicket.topic,
      date: new Date().toISOString().split("T")[0],
      status: "Pendiente",
      detail: newTicket.detail
    };

    setTickets([t, ...tickets]);
    addAuditLog("Soporte Técnico Ticket", `Se abrió un ticket de soporte financiero #${t.id} para ${t.sender}.`, "info");
    triggerNotification("Ticket de soporte enviado a los analistas de sistemas MAF.");
    setNewTicket({ sender: "", dni: "", topic: "", detail: "" });
  };

  const handleResolveTicket = (id: string) => {
    setTickets(tickets.map(t => {
      if (t.id === id) {
        addAuditLog("Soporte Técnico Ticket", `Se marcó como RESUELTO el ticket #${id}.`, "success");
        return { ...t, status: "Atendido" };
      }
      return t;
    }));
    triggerNotification(`Ticket ${id} resuelto.`);
  };

  // Helper autofills for forms
  const setFormStudentByDni = (dni: string) => {
    let text = dni.trim();
    setObligationForm(prev => ({ ...prev, studentDni: text }));
    if (text.length === 8) {
      const savedStudents = localStorage.getItem("sfa_students");
      const savedApplicants = localStorage.getItem("sfa_applicants");
      let foundName = "";

      if (savedStudents) {
        try {
          const list = JSON.parse(savedStudents);
          if (list[text]) foundName = `${list[text].lastName}, ${list[text].name}`;
        } catch (e) {}
      }

      if (!foundName && savedApplicants) {
        try {
          const list = JSON.parse(savedApplicants);
          const ap = list.find((a: any) => a.dni === text);
          if (ap) foundName = `${ap.lastName}, ${ap.name}`;
        } catch (e) {}
      }

      if (foundName) {
        setObligationForm(prev => ({ ...prev, studentName: foundName }));
        triggerNotification(`Estudiante identificado: ${foundName}`, "info");
      }
    }
  };

  const setFormExonerationDni = (dni: string) => {
    let text = dni.trim();
    setExonerationForm(prev => ({ ...prev, studentDni: text }));
    if (text.length === 8) {
      const savedStudents = localStorage.getItem("sfa_students");
      const savedApplicants = localStorage.getItem("sfa_applicants");
      let foundName = "";

      if (savedStudents) {
        try {
          const list = JSON.parse(savedStudents);
          if (list[text]) foundName = `${list[text].lastName}, ${list[text].name}`;
        } catch (e) {}
      }

      if (!foundName && savedApplicants) {
        try {
          const list = JSON.parse(savedApplicants);
          const ap = list.find((a: any) => a.dni === text);
          if (ap) foundName = `${ap.lastName}, ${ap.name}`;
        } catch (e) {}
      }

      if (foundName) {
        setExonerationForm(prev => ({ ...prev, studentName: foundName }));
        triggerNotification(`Estudiante bajo sospecha de beca: ${foundName}`, "info");
      }
    }
  };

  // Filtered queries helper
  const filteredObligations = obligations.filter(o => {
    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      o.studentName.toLowerCase().includes(query) ||
      o.studentDni.includes(query) ||
      o.conceptCode.toLowerCase().includes(query) ||
      o.conceptName.toLowerCase().includes(query);

    if (statusFilter === "todos") return matchesSearch;
    return matchesSearch && o.status === statusFilter;
  });

  const stats = {
    totalRecaudado: obligations.filter(o => o.status === "Validado").reduce((acc, o) => acc + (o.voucherDetails?.amountPaid || o.finalAmount), 0),
    pendientesCount: obligations.filter(o => o.status === "Pendiente" || o.status === "En Proceso").length,
    validadosCount: obligations.filter(o => o.status === "Validado").length,
    becasCount: exonerations.length,
    vouchersPorValidar: obligations.filter(o => o.status === "En Proceso").length,
  };

  return (
    <div
      id="maf-dashboard"
      className="h-screen w-full overflow-hidden bg-slate-50 font-sans text-slate-800 flex flex-col md:flex-row pb-0"
    >
      {/* 1. Sidebar menu on the left */}
      <Sidebar
        institution={{
          name: "IESTP SFA",
          subtitle: "Admisión & Finanzas"
        }}
        user={{
          name: "Consola Financiera MAF",
          role: "Oficina de Finanzas (MAF)",
          status: "TESORERÍA ACADÉMICA",
        }}
        sections={[
          {
            title: "Operaciones Financieras",
            items: [
              {
                label: "Registro de Pagos (Vouchers)",
                icon: <CreditCard className="w-4 h-4" />,
                route: "registro_pagos",
                active: activeTab === "registro_pagos"
              },
              {
                label: "Validación de Pagos",
                icon: <ShieldCheck className="w-4 h-4" />,
                route: "validacion_pagos",
                active: activeTab === "validacion_pagos",
              },
              {
                label: "Estados de Pago",
                icon: <CreditCard className="w-4 h-4" />,
                route: "estados_pago",
                active: activeTab === "estados_pago"
              },
            ]
          },
          {
            title: "Configuración Financiera",
            items: [
              {
                label: "Catálogo de Tasas",
                icon: <Coins className="w-4 h-4" />,
                route: "catalogo_tasas",
                active: activeTab === "catalogo_tasas"
              },
              {
                label: "Control de Exoneraciones / Becas",
                icon: <Percent className="w-4 h-4" />,
                route: "exoneraciones",
                active: activeTab === "exoneraciones"
              }
            ]
          },
          {
            title: "Gestión Administrativa",
            items: [
              {
                label: "Solicitudes de Obligaciones",
                icon: <Layers className="w-4 h-4" />,
                route: "registro_transacciones",
                active: activeTab === "registro_transacciones"
              },
              {
                label: "Auditoria de Movimientos",
                icon: <History className="w-4 h-4" />,
                route: "auditoria",
                active: activeTab === "auditoria"
              }
            ]
          },
          {
            title: "Sistema",
            items: [
              {
                label: "Soporte Técnico Financiero",
                icon: <HelpCircle className="w-4 h-4" />,
                route: "soporte",
                active: activeTab === "soporte"
              }
            ]
          }
        ]}
        onItemClick={(route) => setActiveTab(route as any)}
      />

      {/* 2. Main content viewport areas */}
      <main className="flex-1 p-4 md:p-8 h-full overflow-y-auto bg-slate-50 relative custom-scrollbar">

        {/* Toast Notifier */}
        {notification && (
          <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl shadow-xl flex items-center gap-3 border ${
            notification.type === "success" ? "bg-emerald-55 border-emerald-200 text-white" : "bg-amber-600 border-amber-200 text-white"
          } transition-all animate-bounce`}>
            <Info className="w-5 h-5" />
            <span className="text-xs font-black uppercase tracking-wider">{notification.message}</span>
          </div>
        )}

        {/* Global MAF Module Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-slate-200 pb-5 mb-6 gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-500 text-amber-950 font-black text-[9px] uppercase tracking-wider">
                Consola Oficial MAF
              </span>
              <span className="px-2 py-0.5 rounded bg-slate-200 text-slate-800 font-black text-[9px] uppercase tracking-wider font-mono">
                Source of Truth
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight mt-1">
              Módulo de Administración y Finanzas (MAF)
            </h1>
            <p className="text-xs text-slate-500 font-semibold leading-relaxed">
              Consola Operativa y de Control de Gastos, Matrículas, Prospectos y Trámites Institucionales.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => {
                addAuditLog("Manual Database Sync", "Sincronización forzada de transacciones académicas a través de guardado en disco.", "info");
                triggerNotification("¡Bases de datos financieras sincronizadas con éxito!");
              }}
              className="p-2 border border-slate-250 bg-white rounded-lg hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Sincronizar
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2 hover:bg-red-50 text-red-650 font-black text-[10px] uppercase tracking-wider rounded-lg transition-all border border-red-200/50 flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Cerrar Módulo
            </button>
          </div>
        </div>

        {/* KPI Scorecard Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border-l-4 border-l-emerald-600">
            <CardContent className="pt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Total Recaudado (Caja)</span>
                <p className="text-xl font-black text-slate-900 mt-1 font-mono">S/. {stats.totalRecaudado.toFixed(2)}</p>
              </div>
              <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
                <Coins className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-blue-600">
            <CardContent className="pt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Vouchers por Validar</span>
                <p className="text-xl font-black text-slate-900 mt-1 font-mono">{stats.vouchersPorValidar}</p>
              </div>
              <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-amber-600">
            <CardContent className="pt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Obligaciones Pendientes</span>
                <p className="text-xl font-black text-slate-900 mt-1 font-mono">{stats.pendientesCount}</p>
              </div>
              <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
                <CreditCard className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>

          <Card className="border-l-4 border-l-purple-600">
            <CardContent className="pt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider font-mono">Estudiantes Exonerados</span>
                <p className="text-xl font-black text-slate-900 mt-1 font-mono">{stats.becasCount}</p>
              </div>
              <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
                <Percent className="w-5 h-5" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab content rendering */}
        {activeTab === "registro_pagos" && (
          <RegistroPagosTab
            filteredObligations={filteredObligations}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            handleOpenRegisterVoucher={handleOpenRegisterVoucher}
          />
        )}

        {activeTab === "validacion_pagos" && (
          <ValidacionPagosTab
            obligations={obligations}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            vouchersPorValidar={stats.vouchersPorValidar}
            handleOpenObservePayment={handleOpenObservePayment}
            handleApprovePayment={handleApprovePayment}
          />
        )}

        {activeTab === "estados_pago" && (
          <EstadosPagoTab
            filteredObligations={filteredObligations}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
          />
        )}

        {activeTab === "catalogo_tasas" && (
          <CatalogoTasasTab
            concepts={concepts}
            setShowAddConceptModal={setShowAddConceptModal}
            handleToggleConceptActive={handleToggleConceptActive}
            handleDeleteConcept={handleDeleteConcept}
          />
        )}

        {activeTab === "exoneraciones" && (
          <ExoneracionesTab
            exonerations={exonerations}
            handleOpenAddExoneration={handleOpenAddExoneration}
            handleDeleteExoneration={handleDeleteExoneration}
          />
        )}

        {activeTab === "registro_transacciones" && (
          <RegistroTransaccionesTab
            obligations={obligations}
            setShowAddObligationModal={setShowAddObligationModal}
          />
        )}

        {activeTab === "auditoria" && <AuditoriaTab auditLogs={auditLogs} />}

        {activeTab === "soporte" && (
          <SoporteTab
            tickets={tickets}
            newTicket={newTicket}
            setNewTicket={setNewTicket}
            handleAddTicket={handleAddTicket}
            handleResolveTicket={handleResolveTicket}
          />
        )}
      </main>

      {/* Modals */}
      <AddConceptModal
        show={showAddConceptModal}
        onClose={() => setShowAddConceptModal(false)}
        conceptForm={conceptForm}
        setConceptForm={setConceptForm}
        handleAddConcept={handleAddConcept}
      />

      <AddObligationModal
        show={showAddObligationModal}
        onClose={() => setShowAddObligationModal(false)}
        concepts={concepts}
        obligationForm={obligationForm}
        setObligationForm={setObligationForm}
        setFormStudentByDni={setFormStudentByDni}
        handleCreateObligation={handleCreateObligation}
      />

      <RegisterVoucherModal
        show={showRegisterVoucherModal}
        onClose={() => setShowRegisterVoucherModal(false)}
        voucherForm={voucherForm}
        setVoucherForm={setVoucherForm}
        handleRegisterVoucher={handleRegisterVoucher}
      />

      <ObserveObligationModal
        show={showObserveModal}
        onClose={() => { setShowObserveModal(false); setSelectedObligationId(null); }}
        observationText={observationText}
        setObservationText={setObservationText}
        handleConfirmObservePayment={handleConfirmObservePayment}
      />

      <ExonerationModal
        show={showExonerationModal}
        onClose={() => setShowExonerationModal(false)}
        exonerationForm={exonerationForm}
        setExonerationForm={setExonerationForm}
        setFormExonerationDni={setFormExonerationDni}
        handleAddExoneration={handleAddExoneration}
      />
    </div>
  );
}
