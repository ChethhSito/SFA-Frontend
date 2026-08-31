import React, { useState, useEffect } from "react";
import Sidebar, { SidebarItem } from "../ui-custom/Sidebar";
import Badge from "../ui-custom/Badge";
import Button from "../ui-custom/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../ui-custom/Card";
import { 
  CreditCard, 
  Settings, 
  Percent, 
  History, 
  HelpCircle, 
  Plus, 
  Search, 
  Filter, 
  DollarSign, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  Trash2, 
  Edit3, 
  CheckSquare, 
  PlusCircle, 
  Info,
  Calendar,
  Layers,
  Sparkles,
  RefreshCw,
  Coins,
  ShieldCheck,
  UserCheck,
  ArrowRightLeft,
  BookOpen,
  ArrowLeft
} from "lucide-react";
import PageTransition from "../ui-custom/PageTransition";

export interface MafConcept {
  id: string;
  code: string;
  name: string;
  amount: number;
  description: string;
  category: "Admisión" | "Matrícula" | "Servicios" | "Trámites";
  active: boolean;
}

export interface MafObligation {
  id: string;
  studentDni: string;
  studentName: string;
  conceptCode: string;
  conceptName: string;
  amount: number;
  discount: number; // For exonerations / scholarships
  finalAmount: number;
  period: string;
  status: "Pendiente" | "En Proceso" | "Validado" | "Observado" | "Exonerado";
  dateCreated: string;
  voucherRegistered?: boolean;
  voucherDetails?: {
    operationNumber: string;
    bankName: string;
    paymentDate: string;
    amountPaid: number;
    observations?: string;
  };
}

export interface MafExoneration {
  id: string;
  studentDni: string;
  studentName: string;
  type: "Beca Integral (100%)" | "Media Beca (50%)" | "Exoneración por Convenio" | "Caso Social";
  percentage: number; // 50 or 100
  reason: string;
  dateGranted: string;
  conceptCode: string; // Exoneration applied to specific concept (e.g. MATRICULA)
}

export interface MafAuditLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  module: string;
  details: string;
  type: "success" | "warning" | "info" | "danger";
}

interface MafDashboardProps {
  onLogout: () => void;
}

export default function MafDashboard({ onLogout }: MafDashboardProps) {
  // Navigation State
  const [activeTab, setActiveTab] = useState<
    "registro_pagos" | "validacion_pagos" | "estados_pago" | "catalogo_tasas" | "gestion_conceptos" | "exoneraciones" | "registro_transacciones" | "auditoria" | "soporte"
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
  const [tickets, setTickets] = useState([
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
    // 1. Initial Concepts (Catálogo de Tasas)
    const storedConcepts = localStorage.getItem("maf_concepts");
    if (storedConcepts) {
      setConcepts(JSON.parse(storedConcepts));
    } else {
      const defaultConcepts: MafConcept[] = [
        { id: "c1", code: "ADM01", name: "Derecho de Examen de Admisión Ordinario", amount: 120, description: "Tasa general obligatoria para registro y rendición del examen de admisión", category: "Admisión", active: true },
        { id: "c2", code: "MAT01", name: "Matrícula Semestral Regular", amount: 250, description: "Tasa semestral obligatoria de registro y reserva de vacante ciclo escolar", category: "Matrícula", active: true },
        { id: "c3", code: "CER01", name: "Certificado de Estudios Oficial", amount: 50, description: "Trámite de expedición de expediente de calificaciones certificadas", category: "Trámites", active: true },
        { id: "c4", code: "CON01", name: "Constancia de Matrícula Institucional", amount: 30, description: "Constancia con validez institucional de matrícula vigente", category: "Trámites", active: true },
        { id: "c5", code: "SUB01", name: "Derecho de Examen de Subsanación", amount: 45, description: "Subsanación académica por curso desaprobado", category: "Servicios", active: true },
        { id: "c6", code: "CAR01", name: "Duplicado de Carné de Estudiante", amount: 15, description: "Reposición de credencial física de estudiante por pérdida", category: "Trámites", active: true }
      ];
      setConcepts(defaultConcepts);
      localStorage.setItem("maf_concepts", JSON.stringify(defaultConcepts));
    }

    // 2. Initial Exonerations
    const storedExonerations = localStorage.getItem("maf_exonerations");
    if (storedExonerations) {
      setExonerations(JSON.parse(storedExonerations));
    } else {
      const defaultExonerations: MafExoneration[] = [];
      setExonerations(defaultExonerations);
      localStorage.setItem("maf_exonerations", JSON.stringify(defaultExonerations));
    }

    // 3. Initial Obligations (Solicitudes originadas por MAMC / MGE o internas)
    const storedObligations = localStorage.getItem("maf_obligations");
    if (storedObligations) {
      setObligations(JSON.parse(storedObligations));
    } else {
      const defaultObligations: MafObligation[] = [];
      setObligations(defaultObligations);
      localStorage.setItem("maf_obligations", JSON.stringify(defaultObligations));
    }

    // 4. Initial Audit logs
    const storedLogs = localStorage.getItem("maf_audit_logs");
    if (storedLogs) {
      setAuditLogs(JSON.parse(storedLogs));
    } else {
      const defaultLogs: MafAuditLog[] = [];
      setAuditLogs(defaultLogs);
      localStorage.setItem("maf_audit_logs", JSON.stringify(defaultLogs));
    }
  }, []);

  // Save on updates helper
  const handleConceptsUpdate = (updated: MafConcept[]) => {
    setConcepts(updated);
    localStorage.setItem("maf_concepts", JSON.stringify(updated));
  };

  const handleObligationsUpdate = (updated: MafObligation[]) => {
    setObligations(updated);
    localStorage.setItem("maf_obligations", JSON.stringify(updated));
    
    // Sync to MAMC & MGE enrollment keys if applicable!
    // For example, if we validated a MAT01 (Matrícula) payment, let's update enrollment paymentStatus to "Validado" 
    // so MAMC and MGE reflect this financial clearance instantly!
    const storedEnrollments = localStorage.getItem("sfa_enrollments");
    if (storedEnrollments) {
      try {
        const enrolls = JSON.parse(storedEnrollments);
        let modified = false;
        const nextEnrolls = enrolls.map((enr: any) => {
          // Find matching obligation for MAT01 for this student
          const match = updated.find(o => o.studentDni === enr.studentDni && o.conceptCode === "MAT01");
          if (match) {
            let nextStatus = enr.paymentStatus;
            if (match.status === "Validado") nextStatus = "Validado";
            else if (match.status === "Observado") nextStatus = "Rechazado"; // Maps to Rejected/Observed in MAMC
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
          // If the app page listens to this state React context, it will pick it up on reload or re-mount
        }
      } catch (err) {
        console.error("Failed to sync MAF updates to enrollments", err);
      }
    }

    // Sync ADM01 (Admisión) payment to applicants database!
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

    // Check discount from existing exoneration for this student and concept code
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

    // Apply retroactively to any matching "Pendiente" obligations for this student and concept
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

    const t = {
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
                icon: <CheckSquare className="w-4 h-4" />,
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
                label: "Auditoría de Movimientos",
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

        {/* KPI Scorecard Grid (No BI/Análisis, only direct accounting variables) */}
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


        {/* =======================================================
            TAB 1: REGISTRO DE PAGOS (VOUCHERS)
            ======================================================= */}
        {activeTab === "registro_pagos" && (
          <PageTransition id="registro_pagos" className="space-y-6">
            <div className="bg-white p-6 border border-slate-205 rounded-2xl relative shadow-xs overflow-hidden">
              <div className="absolute top-0 bottom-0 right-0 w-24 bg-gradient-to-l from-emerald-500/5 to-transparent pointer-events-none" />
              
              <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-100 gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-[#9F062A]" />
                    Registro Directo de Voucher Bancario
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    Registre e ingrese depósitos bancarios traídos por ventanilla. El voucher ingresará en fase de validación en MAF.
                  </p>
                </div>
              </div>

              {/* Informative Step Box */}
              <div className="bg-slate-50 p-4 border border-slate-200 rounded-xl grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 text-xs text-slate-600 leading-relaxed font-semibold">
                <div className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-extrabold flex items-center justify-center shrink-0">1</span>
                  <p>Asocie el depósito físico a una obligación de pago ingresando los datos del estudiante en ventanilla.</p>
                </div>
                <div className="flex gap-2.5">
                  <span className="w-5 h-5 rounded-full bg-slate-900 text-white font-extrabold flex items-center justify-center shrink-0">2</span>
                  <p>Ingrese el monto pagado, el banco (BN, BCP, BBVA, etc.) y fecha impresa en el váucher.</p>
                </div>
                <div className="flex gap-2.5 font-bold text-slate-900">
                  <span className="w-5 h-5 rounded-full bg-[#9F062A] text-white font-black flex items-center justify-center shrink-0">3</span>
                  <p>El voucher quedará cargado con estado Pendiente de Validación en la cola oficial financiera.</p>
                </div>
              </div>

              {/* Quick Obligations List to Trigger Voucher Setup */}
              <div>
                <div className="flex flex-col sm:flex-row items-center justify-between pb-3 gap-3">
                  <h4 className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-slate-400" />
                    Seleccione una obligación de pago para cargar comprobante bancario:
                  </h4>
                  <div className="relative w-full sm:w-64">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="DNI o Nombre Alumno..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-205 rounded-lg text-xs font-bold leading-none"
                    />
                  </div>
                </div>

                <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-550">Alumno</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-550">Concepto de Tasa</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-550">Importe Ajustado</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-550">Estado</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-550 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {filteredObligations.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="px-4 py-10 text-center text-slate-450 uppercase font-black tracking-wider">
                            No se encontraron obligaciones pendientes que coincidan con la búsqueda.
                          </td>
                        </tr>
                      ) : (
                        filteredObligations.map((o) => (
                          <tr key={o.id} className="hover:bg-slate-50/50 transition-all">
                            <td className="px-4 py-3.5">
                              <div className="font-extrabold text-slate-900 uppercase">{o.studentName}</div>
                              <div className="text-[10px] text-slate-400 font-black">DNI: {o.studentDni} | Periodo: {o.period}</div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="font-bold text-slate-800">{o.conceptName}</div>
                              <div className="text-[9px] text-[#9F062A] font-black font-mono">{o.conceptCode}</div>
                            </td>
                            <td className="px-4 py-3.5 font-mono">
                              <div className="text-slate-900 font-extrabold text-xs">S/. {o.finalAmount.toFixed(2)}</div>
                              {o.discount > 0 && (
                                <div className="text-[9px] text-purple-650 font-black">Desc. Exoneración: S/. {o.discount.toFixed(2)}</div>
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider ${
                                o.status === "Validado" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                o.status === "En Proceso" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                                o.status === "Observado" ? "bg-red-50 text-red-700 border border-red-150 animate-pulse" :
                                o.status === "Exonerado" ? "bg-purple-50 text-purple-700 border border-purple-100" :
                                "bg-amber-50 text-amber-700 border border-amber-100"
                              }`}>
                                {o.status}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              {o.status === "Pendiente" || o.status === "Observado" ? (
                                <Button
                                  onClick={() => handleOpenRegisterVoucher(o.id)}
                                  className="bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-[10px] tracking-wide uppercase px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer ml-auto"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Registrar Pago
                                </Button>
                              ) : o.voucherRegistered ? (
                                <div className="text-[10px] text-slate-500 font-bold">
                                  Voucher #{o.voucherDetails?.operationNumber}
                                </div>
                              ) : (
                                <span className="text-[10px] text-slate-400 font-bold">No Aplica</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </PageTransition>
        )}


        {/* =======================================================
            TAB 2: VALIDACIÓN DE PAGOS
            ======================================================= */}
        {activeTab === "validacion_pagos" && (
          <PageTransition id="validacion_pagos" className="space-y-6">
            <Card>
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-slate-900 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-emerald-600" />
                      Auditoría e Inspección de Comprobantes Bancarios Registrados
                    </CardTitle>
                    <CardDescription>
                      Compare los vouchers virtuales y números de operación con el extracto de cuenta bancaria del IESTP. Apruebe para dar conformidad o declare observado para notificar corrección.
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[11px] font-bold text-slate-500">Filtrar por validación:</span>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="p-1 px-2 border border-slate-205 bg-white font-bold rounded-lg text-xs"
                    >
                      <option value="En Proceso">Por Validar ({stats.vouchersPorValidar})</option>
                      <option value="todos">Ver Historial Completo</option>
                      <option value="Validado">Validados</option>
                      <option value="Observado">Observados / Rechazados</option>
                    </select>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Estudiante / DNI</th>
                        <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Concepto Solicitado</th>
                        <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Datos del Voucher</th>
                        <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Importe Recibido</th>
                        <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Estado de Caja</th>
                        <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 text-right">Acciones de Verificación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {obligations.filter(ob => statusFilter === "todos" ? ob.voucherRegistered : ob.status === statusFilter).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-4 py-12 text-center text-slate-450 uppercase font-black tracking-widest leading-none">
                            No se encontraron vouchers bancarios pendientes de auditoría en este filtro.
                          </td>
                        </tr>
                      ) : (
                        obligations.filter(ob => statusFilter === "todos" ? ob.voucherRegistered : ob.status === statusFilter).map((ob) => (
                          <tr key={ob.id} className="hover:bg-slate-55/60 transition-all">
                            <td className="px-4 py-3.5">
                              <div className="font-extrabold text-slate-900 uppercase">{ob.studentName}</div>
                              <div className="text-[10px] text-slate-400 font-bold">DNI: {ob.studentDni} | Periodo: {ob.period}</div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="font-bold text-slate-800">{ob.conceptName}</div>
                              <span className="px-2 py-0.2 rounded bg-slate-100 text-slate-600 text-[9px] font-black tracking-wider uppercase font-mono">{ob.conceptCode}</span>
                            </td>
                            <td className="px-4 py-3.5 font-mono">
                              <div className="text-slate-850 font-extrabold text-xs">#{ob.voucherDetails?.operationNumber || "SIN REGISTRO"}</div>
                              <div className="text-[9.5px] text-slate-400 font-bold block">Banco: {ob.voucherDetails?.bankName} ({ob.voucherDetails?.paymentDate})</div>
                            </td>
                            <td className="px-4 py-3.5">
                              <div className="text-emerald-700 font-black text-xs">S/. {(ob.voucherDetails?.amountPaid || ob.finalAmount).toFixed(2)}</div>
                              <span className="text-[9px] text-slate-400 block font-bold leading-none">Tasa: S/. {ob.amount}</span>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                ob.status === "Validado" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                                ob.status === "Observado" ? "bg-red-50 text-red-700 border border-red-150 animate-pulse" :
                                "bg-blue-50 text-blue-700 border border-blue-150"
                              }`}>
                                {ob.status}
                              </span>
                              {ob.status === "Observado" && ob.voucherDetails?.observations && (
                                <div className="text-[9.5px] text-red-650 font-bold mt-1 max-w-xs truncate leading-tight">Reason: {ob.voucherDetails.observations}</div>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              {ob.status === "En Proceso" ? (
                                <div className="flex gap-2 justify-end">
                                  <Button
                                    onClick={() => handleOpenObservePayment(ob.id)}
                                    className="bg-red-50 text-red-700 hover:bg-red-100 font-black text-[9.5px] uppercase tracking-wide px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                                  >
                                    <AlertTriangle className="w-3.5 h-3.5" /> Observar
                                  </Button>
                                  <Button
                                    onClick={() => handleApprovePayment(ob.id)}
                                    className="bg-emerald-600 text-white hover:bg-emerald-700 font-black text-[9.5px] uppercase tracking-wide px-2.5 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer shadow-sm"
                                  >
                                    <CheckCircle className="w-3.5 h-3.5" /> Validar Pago
                                  </Button>
                                </div>
                              ) : (
                                <div className="text-[10px] text-slate-450 font-bold">
                                  Auditoría Concluida
                                </div>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </PageTransition>
        )}


        {/* =======================================================
            TAB 3: ESTADOS DE PAGO
            ======================================================= */}
        {activeTab === "estados_pago" && (
          <PageTransition id="estados_pago" className="space-y-6">
            <div className="bg-white p-6 border border-slate-205 rounded-2xl relative shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-4 mb-4">
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase tracking-wider flex items-center gap-2">
                    <CheckSquare className="w-4 h-4 text-[#9F062A]" />
                    Consulta General de Estados Financieros de Caja
                  </h3>
                  <p className="text-xs text-slate-500 font-semibold leading-relaxed">
                    Visualice el estado general de cobros, tasas académicas, postulantes virtuales y alumnos del instituto.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2.5">
                  <div className="relative w-48 sm:w-60">
                    <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="DNI o Nombre..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-1.5 bg-slate-50 border border-slate-205 rounded-lg text-xs font-bold leading-none"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="p-1 px-2 border border-slate-205 bg-white font-bold rounded-lg text-xs"
                  >
                    <option value="todos">Todos los Estados</option>
                    <option value="Pendiente">Pendiente</option>
                    <option value="En Proceso">En Verificación</option>
                    <option value="Validado">Validado / Cerrado</option>
                    <option value="Observado">Observado</option>
                    <option value="Exonerado">Exonerados</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto border border-slate-200 rounded-xl bg-white">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200">
                      <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Código Obligación</th>
                      <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Estudiante DNI</th>
                      <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Concepto</th>
                      <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Monto Original</th>
                      <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Monto Final</th>
                      <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Estado de Cobro</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                    {filteredObligations.map((o) => (
                      <tr key={o.id} className="hover:bg-slate-50/50 transition-all">
                        <td className="px-4 py-3 text-slate-650 font-mono font-bold uppercase">{o.id}</td>
                        <td className="px-4 py-3">
                          <div className="font-extrabold text-slate-900 uppercase">{o.studentName}</div>
                          <div className="text-[10px] text-slate-400 font-bold block">DNI: {o.studentDni} | Periodo: {o.period}</div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-semibold text-slate-800">{o.conceptName}</div>
                          <span className="text-[9px] text-[#9F062A] font-black font-mono leading-none">{o.conceptCode}</span>
                        </td>
                        <td className="px-4 py-3 font-mono text-slate-500">S/. {o.amount.toFixed(2)}</td>
                        <td className="px-4 py-3 font-mono text-slate-905 font-bold">
                          S/. {o.finalAmount.toFixed(2)}
                          {o.discount > 0 && <span className="text-[9px] text-purple-600 block leading-none font-sans font-bold">(- S/. {o.discount.toFixed(2)})</span>}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase tracking-wider block text-center w-36 ${
                            o.status === "Validado" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                            o.status === "En Proceso" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                            o.status === "Observado" ? "bg-red-50 text-red-700 border border-red-150 animate-pulse" :
                            o.status === "Exonerado" ? "bg-purple-50 text-purple-800 border border-purple-100" :
                            "bg-amber-100 text-amber-800 border border-amber-200"
                          }`}>
                            {o.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </PageTransition>
        )}


        {/* =======================================================
            TAB 4: CATÁLOGO DE TASAS ACADÉMICAS
            ======================================================= */}
        {activeTab === "catalogo_tasas" && (
          <PageTransition id="catalogo_tasas" className="space-y-6">
            <Card>
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-slate-900 flex items-center gap-2">
                      <Coins className="w-5 h-5 text-amber-500" />
                      Catálogo Oficial de Tasas y Aranceles Escolares
                    </CardTitle>
                    <CardDescription>
                      Gestione el catálogo unificado de conceptos de pago válidos para el año académico 2026. Los módulos externos consumirán estas tasas autorizadas.
                    </CardDescription>
                  </div>
                  <div>
                    <Button
                      onClick={() => setShowAddConceptModal(true)}
                      className="bg-[#9F062A] text-white hover:bg-[#800521] font-black text-xs uppercase tracking-widest px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-950/20"
                    >
                      <Plus className="w-4 h-4" /> Agregar Nueva Tasa
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-550">Código Tasa</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-550">Concepto Académico</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-550">Grupo / Categoría</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-550 font-mono">Arancel (Tasa Oficial)</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-550">Estado</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-550 text-right">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {concepts.map((c) => (
                        <tr key={c.id} className={`hover:bg-slate-50/50 transition-all ${!c.active ? "opacity-60" : ""}`}>
                          <td className="px-4 py-3.5 font-mono text-slate-900 font-black">{c.code}</td>
                          <td className="px-4 py-3.5">
                            <div className="font-extrabold text-slate-900">{c.name}</div>
                            <div className="text-[10px] text-slate-500 font-bold block leading-relaxed mt-0.5">{c.description}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-750 text-[10px] font-extrabold uppercase tracking-wide">
                              {c.category}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 font-mono text-slate-950 font-extrabold text-sm">
                            S/. {c.amount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3.5">
                            <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase ${
                              c.active ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-500"
                            }`}>
                              {c.active ? "ACTIVO" : "INACTIVO"}
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-right">
                            <div className="flex gap-2 justify-end">
                              <button
                                onClick={() => handleToggleConceptActive(c.id)}
                                className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider cursor-pointer ${
                                  c.active ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                }`}
                              >
                                {c.active ? "DESACTIVAR" : "ACTIVAR"}
                              </button>
                              <button
                                onClick={() => handleDeleteConcept(c.id, c.code)}
                                className="p-1 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </PageTransition>
        )}


        {/* =======================================================
            TAB 5: CONTROL DE EXONERACIONES Y BECAS
            ======================================================= */}
        {activeTab === "exoneraciones" && (
          <PageTransition id="exoneraciones" className="space-y-6">
            <Card>
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-slate-900 flex items-center gap-2">
                      <Percent className="w-5 h-5 text-purple-600" />
                      Registro y Control de Becas y Exoneraciones Extraordinarias
                    </CardTitle>
                    <CardDescription>
                      Registre estudiantes exonerados del examen de admisión o con becas institucionales del pago de derecho de matrícula regular.
                    </CardDescription>
                  </div>
                  <div>
                    <Button
                      onClick={handleOpenAddExoneration}
                      className="bg-purple-600 text-white hover:bg-purple-700 font-black text-xs uppercase tracking-widest px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-purple-950/20"
                    >
                      <PlusCircle className="w-4 h-4" /> Registrar Beca/Exoneración
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500">Afectado / DNI</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500">Tipo de Exoneración</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500">Descuento (%)</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500">Concepto de Tasa Afectado</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500">Fecha Resolución</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 font-mono">Justificación / Motivo</th>
                        <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-500 text-right">Anulación</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {exonerations.length === 0 ? (
                        <tr>
                          <td colSpan={7} className="px-4 py-12 text-center text-slate-450 uppercase font-black tracking-widest">
                            No se han computado becas deportivas, sociales ni exoneraciones en este periodo.
                          </td>
                        </tr>
                      ) : (
                        exonerations.map((ex) => (
                          <tr key={ex.id} className="hover:bg-slate-50/50 transition-all text-xs">
                            <td className="px-4 py-3.5">
                              <div className="font-extrabold text-slate-900 uppercase">{ex.studentName}</div>
                              <div className="text-[10px] text-slate-400 font-bold block">DNI: {ex.studentDni}</div>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="px-2.5 py-0.5 rounded bg-purple-55 text-purple-750 text-[10px] font-extrabold uppercase">
                                {ex.type}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-mono text-purple-900 font-black text-sm">
                              {ex.percentage}%
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[9px] font-black font-mono uppercase">
                                {ex.conceptCode}
                              </span>
                            </td>
                            <td className="px-4 py-3.5 font-mono">{ex.dateGranted}</td>
                            <td className="px-4 py-3.5 text-xs text-slate-500 max-w-sm italic">
                              "{ex.reason}"
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <button
                                onClick={() => handleDeleteExoneration(ex.id, ex.studentName)}
                                className="p-1 px-2 hover:bg-red-50 text-red-500 hover:text-red-700 border border-transparent hover:border-red-150 rounded transition-all cursor-pointer"
                              >
                                Revocar Beca
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </PageTransition>
        )}


        {/* =======================================================
            TAB 6: REGISTRO DE TRANSACCIONES / SOLICITUDES
            ======================================================= */}
        {activeTab === "registro_transacciones" && (
          <PageTransition id="registro_transacciones" className="space-y-6">
            <Card>
              <CardHeader className="border-b border-slate-100 pb-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle className="text-slate-900 flex items-center gap-2">
                      <Layers className="w-5 h-5 text-indigo-600" />
                      Registro de Solicitudes y Obligaciones de Cobro Académico
                    </CardTitle>
                    <CardDescription>
                      Cada vez que un módulo (MAMC de Admisión o MGE de Alumnos) genera un trámite, se crea un registro de obligación en MAF. Use esta opción para agregar una obligación de forma manual.
                    </CardDescription>
                  </div>
                  <div>
                    <Button
                      onClick={() => setShowAddObligationModal(true)}
                      className="bg-slate-900 text-white hover:bg-slate-800 font-black text-xs uppercase tracking-widest px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md"
                    >
                      <Plus className="w-4 h-4" /> Generar Solicitud de Pago
                    </Button>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200">
                        <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">ID Obligación</th>
                        <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Acreedor / Estudiante</th>
                        <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Tasa Aplicada</th>
                        <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 font-mono">Total Adeudado</th>
                        <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Fecha de Alta</th>
                        <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500">Estado de Cuenta</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                      {obligations.map((ab) => (
                        <tr key={ab.id} className="hover:bg-slate-50/50 transition-all">
                          <td className="px-4 py-3 font-mono font-black text-slate-900">{ab.id}</td>
                          <td className="px-4 py-3">
                            <div className="font-extrabold text-slate-900 uppercase">{ab.studentName}</div>
                            <div className="text-[10px] text-slate-400 font-bold block">DNI: {ab.studentDni} | Periodo: {ab.period}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-semibold text-slate-805">{ab.conceptName}</div>
                            <span className="text-[9.5px] text-[#9F062A] font-black font-mono leading-none">{ab.conceptCode}</span>
                          </td>
                          <td className="px-4 py-3 font-mono text-slate-950 font-black">
                            S/. {ab.finalAmount.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 font-mono">{ab.dateCreated}</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase block text-center w-28 ${
                              ab.status === "Validado" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" :
                              ab.status === "En Proceso" ? "bg-blue-50 text-blue-700 border border-blue-100" :
                              ab.status === "Observado" ? "bg-red-50 text-red-700 border border-red-150 animate-pulse" :
                              ab.status === "Exonerado" ? "bg-purple-100 text-purple-800 border border-purple-150" :
                              "bg-amber-100 text-amber-800 border border-amber-200"
                            }`}>
                              {ab.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </PageTransition>
        )}


        {/* =======================================================
            TAB 7: AUDITORÍA DE MOVIMIENTOS
            ======================================================= */}
        {activeTab === "auditoria" && (
          <PageTransition id="auditoria" className="space-y-6">
            <Card>
              <CardHeader className="border-b border-slate-100 pb-4">
                <CardTitle className="text-slate-900 flex items-center gap-2">
                  <History className="w-5 h-5 text-indigo-600" />
                  Registro de Auditoría Integral (Log de Actividades del MAF)
                </CardTitle>
                <CardDescription>
                  Registro inmutable e intransferible de todas las transacciones financieras, aprobaciones de caja, exoneraciones dictadas y de las tasas ingresadas en el sistema.
                </CardDescription>
              </CardHeader>

              <CardContent className="p-0">
                <div className="p-4 bg-slate-50 border-b border-slate-100 text-xs font-mono font-bold uppercase text-slate-500 tracking-wider">
                  Auditoría General Administrativa — Trazabilidad Completa
                </div>

                <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar bg-slate-900 text-slate-100">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="p-3 bg-slate-800 rounded-lg border-l-4 border-l-amber-500 text-xs md:flex items-start justify-between font-mono gap-4">
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-1.5 py-0.2 rounded bg-slate-700 text-amber-400 text-[10px] font-black font-mono">
                            {log.id}
                          </span>
                          <span className="text-slate-400 text-[10px]">{log.timestamp}</span>
                          <span className="px-1.5 bg-blue-900 text-blue-200 rounded text-[9px] font-black uppercase font-sans">
                            {log.action}
                          </span>
                        </div>
                        <p className="text-slate-200 font-extrabold text-[11px] leading-relaxed mt-1">
                          {log.details}
                        </p>
                      </div>
                      <div className="text-right shrink-0 mt-2 md:mt-0 text-[10px] font-sans text-slate-500">
                        <span className="px-2 py-0.5 rounded bg-slate-700 text-slate-300 font-bold uppercase font-mono tracking-wider block mb-1">
                          USER: {log.user}
                        </span>
                        <span>MODULE: {log.module}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </PageTransition>
        )}


        {/* =======================================================
            TAB 8: SOPORTE TÉCNICO
            ======================================================= */}
        {activeTab === "soporte" && (
          <PageTransition id="soporte" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: Tickets Queue */}
              <div className="lg:col-span-2 space-y-6">
                <Card>
                  <CardHeader className="border-b border-slate-100 pb-4">
                    <CardTitle className="text-slate-900">Cola de Tickets de Incidencia Financiera</CardTitle>
                    <CardDescription>Consulte los reclamos por depósitos no visualizados u observaciones ingresadas por estudiantes y postulantes.</CardDescription>
                  </CardHeader>

                  <CardContent className="p-4 space-y-4">
                    {tickets.map(t => (
                      <div key={t.id} className="p-4 border border-slate-205 rounded-xl bg-white space-y-3 shadow-xs">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="px-2 py-0.5 bg-slate-100 text-slate-650 rounded text-[10px] font-black font-mono uppercase tracking-widest">{t.id}</span>
                            <h4 className="text-xs font-black text-slate-900 uppercase mt-1 leading-none">{t.topic}</h4>
                          </div>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                            t.status === "Atendido" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-amber-100 text-amber-800 border border-amber-200 animate-pulse"
                          }`}>
                            {t.status}
                          </span>
                        </div>

                        <p className="text-[11.5px] text-slate-650 leading-relaxed font-semibold">
                          "{t.detail}"
                        </p>

                        <div className="flex flex-wrap items-center justify-between text-[10px] text-slate-400 font-bold border-t border-slate-100 pt-2.5">
                          <div>SENDER: <span className="text-slate-700">{t.sender}</span> (DNI {t.dni})</div>
                          <div className="flex items-center gap-3">
                            <span>REG: {t.date}</span>
                            {t.status === "Pendiente" && (
                              <button
                                onClick={() => handleResolveTicket(t.id)}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded font-black uppercase text-[9px] cursor-pointer"
                              >
                                Marcar Resuelto
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>

              {/* Right Column: Register ticket Form */}
              <div className="lg:col-span-1 space-y-6">
                <Card>
                  <CardHeader className="border-b border-slate-100">
                    <CardTitle className="text-slate-900 text-sm">Registrar Solicitud / Reclamo de Clientes</CardTitle>
                    <CardDescription>Cargue una llamada de soporte o discrepancia reportada por vía telefónica o presencial.</CardDescription>
                  </CardHeader>

                  <CardContent className="p-4">
                    <form onSubmit={handleAddTicket} className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Nombre Completo</label>
                        <input
                          type="text"
                          required
                          value={newTicket.sender}
                          onChange={(e) => setNewTicket({ ...newTicket, sender: e.target.value })}
                          placeholder="p.ej. Mario Solis"
                          className="w-full p-2 border border-slate-205 rounded-lg text-xs font-bold leading-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">DNI del Estudiante</label>
                        <input
                          type="text"
                          required
                          value={newTicket.dni}
                          onChange={(e) => setNewTicket({ ...newTicket, dni: e.target.value })}
                          placeholder="Número de 8 dígitos"
                          className="w-full p-2 border border-slate-205 rounded-lg text-xs font-bold leading-none font-mono"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Tema / Asunto</label>
                        <input
                          type="text"
                          required
                          value={newTicket.topic}
                          onChange={(e) => setNewTicket({ ...newTicket, topic: e.target.value })}
                          placeholder="p.ej. Error en banco BN"
                          className="w-full p-2 border border-slate-205 rounded-lg text-xs font-bold leading-none"
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Detalle del Inconveniente</label>
                        <textarea
                          required
                          rows={4}
                          value={newTicket.detail}
                          onChange={(e) => setNewTicket({ ...newTicket, detail: e.target.value })}
                          placeholder="Escriba la descripción..."
                          className="w-full p-2 border border-slate-205 rounded-lg text-xs font-semibold font-sans leading-normal"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-widest rounded-lg transition-all cursor-pointer shadow-sm"
                      >
                        Enviar Reclamo a Cola
                      </button>
                    </form>
                  </CardContent>
                </Card>
              </div>

            </div>
          </PageTransition>
        )}

      </main>

      {/* ==========================================================
          OBLIGATIONS CREATION DIALOG (MODAL)
          ========================================================== */}
      {showAddObligationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-slate-900 text-white p-5 border-b-2 border-amber-500">
              <h3 className="text-xs font-black uppercase tracking-widest">Generar Obligación de Pago Académica</h3>
              <p className="text-[10px] text-slate-450 font-bold mt-1 leading-relaxed">Cárguelo como parte de los requisitos escolares del estudiante.</p>
            </div>
            
            <form onSubmit={handleCreateObligation} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">DNI del Alumno / Postulante *</label>
                <input
                  type="text"
                  required
                  placeholder="8 dígitos"
                  value={obligationForm.studentDni}
                  onChange={(e) => setFormStudentByDni(e.target.value)}
                  className="w-full p-2.5 border border-slate-205 bg-slate-50 text-xs font-bold font-mono rounded-lg"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Nombre Completo del Estudiante *</label>
                <input
                  type="text"
                  required
                  placeholder="Apellidos, Nombres"
                  value={obligationForm.studentName}
                  onChange={(e) => setObligationForm({ ...obligationForm, studentName: e.target.value })}
                  className="w-full p-2.5 border border-slate-205 bg-slate-50 text-xs font-bold rounded-lg"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Seleccionar Tasa Arbitrada del Catálogo *</label>
                <select
                  required
                  value={obligationForm.conceptId}
                  onChange={(e) => setObligationForm({ ...obligationForm, conceptId: e.target.value })}
                  className="w-full p-2.5 border border-slate-205 bg-white text-xs font-extrabold text-slate-800 rounded-lg"
                >
                  <option value="">-- Seleccionar Tasa --</option>
                  {concepts.filter(c => c.active).map(c => (
                    <option key={c.id} value={c.id}>{c.name} - S/. {c.amount}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Periodo Académico</label>
                <select
                  value={obligationForm.period}
                  onChange={(e) => setObligationForm({ ...obligationForm, period: e.target.value })}
                  className="w-full p-2.5 border border-slate-205 bg-white text-xs font-extrabold text-slate-800 rounded-lg"
                >
                  <option value="2026-I">2026-I</option>
                  <option value="2026-II">2026-II</option>
                </select>
              </div>

              <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4 mt-6">
                <button
                  type="reset"
                  onClick={() => setShowAddObligationModal(false)}
                  className="px-5 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer"
                >
                  Generar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================================
          VOUCHER INSCRIPTION OVERLAY DIALOG (MODAL)
          ========================================================== */}
      {showRegisterVoucherModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-[#9F062A] text-white p-5 border-b-2 border-amber-400">
              <h3 className="text-xs font-black uppercase tracking-widest">Registrar Comprobante Bancario Físico</h3>
              <p className="text-[10px] text-amber-200 font-bold mt-1 leading-relaxed">Asocie el dinero bancario de ventanilla a la cuenta del estudiante.</p>
            </div>

            <form onSubmit={handleRegisterVoucher} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Operación Bancaria N° *</label>
                  <input
                    type="text"
                    required
                    placeholder="p.ej. OP-489012"
                    value={voucherForm.operationNumber}
                    onChange={(e) => setVoucherForm({ ...voucherForm, operationNumber: e.target.value })}
                    className="w-full p-2.5 border border-slate-205 text-xs font-bold font-mono rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Banco Emisor *</label>
                  <select
                    value={voucherForm.bankName}
                    onChange={(e) => setVoucherForm({ ...voucherForm, bankName: e.target.value })}
                    className="w-full p-2.5 border border-slate-205 text-xs font-extrabold text-slate-800 rounded-lg bg-white"
                  >
                    <option value="Banco de la Nación">Banco de la Nación</option>
                    <option value="BCP">BCP (Agente/App)</option>
                    <option value="BBVA">BBVA Continental</option>
                    <option value="Interbank">Interbank</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Monto Depositado *</label>
                  <input
                    type="number"
                    required
                    min={0.1}
                    step={0.01}
                    value={voucherForm.amountPaid}
                    onChange={(e) => setVoucherForm({ ...voucherForm, amountPaid: Number(e.target.value) })}
                    className="w-full p-2.5 border border-slate-205 text-xs font-bold font-mono rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Fecha de Operación</label>
                  <input
                    type="date"
                    required
                    value={voucherForm.paymentDate}
                    onChange={(e) => setVoucherForm({ ...voucherForm, paymentDate: e.target.value })}
                    className="w-full p-2.5 border border-slate-205 text-xs font-bold font-mono rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Observaciones Internas de Caja</label>
                <input
                  type="text"
                  placeholder="Opcional..."
                  value={voucherForm.observations}
                  onChange={(e) => setVoucherForm({ ...voucherForm, observations: e.target.value })}
                  className="w-full p-2.5 border border-slate-205 text-xs font-bold rounded-lg"
                />
              </div>

              <div className="p-3 bg-slate-50 border border-slate-205 rounded-lg flex items-start gap-2 text-[10.5px] font-semibold text-slate-500 leading-normal">
                <Info className="w-4 h-4 shrink-0 text-[#9F062A]" />
                <p>
                  Asegúrese de constatar que el importe coincida exactamente con la tasa adeudada antes de guardar el registro en MAF.
                </p>
              </div>

              <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowRegisterVoucherModal(false)}
                  className="px-5 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer"
                >
                  Registrar Depósito
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================================
          EXONERATION CREATION SYSTEM (MODAL)
          ========================================================== */}
      {showExonerationModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full overflow-hidden">
            <div className="bg-purple-900 text-white p-5 border-b-2 border-purple-500">
              <h3 className="text-xs font-black uppercase tracking-widest">Registrar Beca o Exoneración Escolar</h3>
              <p className="text-[10px] text-purple-200 font-bold mt-1 leading-relaxed">Aplique exoneraciones basadas en resoluciones o convenios autorizados.</p>
            </div>

            <form onSubmit={handleAddExoneration} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">DNI del Alumno Afectado *</label>
                <input
                  type="text"
                  required
                  placeholder="8 dígitos"
                  value={exonerationForm.studentDni}
                  onChange={(e) => setFormExonerationDni(e.target.value)}
                  className="w-full p-2.5 border border-slate-205 bg-slate-50 text-xs font-bold font-mono rounded-lg focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Nombre Completo del Estudiante</label>
                <input
                  type="text"
                  required
                  placeholder="p.ej. Alva Mendoza, Gino"
                  value={exonerationForm.studentName}
                  onChange={(e) => setExonerationForm({ ...exonerationForm, studentName: e.target.value })}
                  className="w-full p-2.5 border border-slate-205 bg-slate-50 text-xs font-bold rounded-lg focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Tipo de Exención *</label>
                  <select
                    value={exonerationForm.type}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      const pct = val.includes("Integral") || val.includes("Exoneración") ? 100 : 50;
                      setExonerationForm({ ...exonerationForm, type: val, percentage: pct });
                    }}
                    className="w-full p-2.5 border border-slate-205 text-xs font-extrabold text-slate-850 bg-white rounded-lg"
                  >
                    <option value="Beca Integral (100%)">Beca Integral (100%)</option>
                    <option value="Media Beca (50%)">Media Beca (50%)</option>
                    <option value="Exoneración por Convenio">Exoneración por Convenio</option>
                    <option value="Caso Social">Caso Social Especial</option>
                  </select>
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Porcentaje Descuento %</label>
                  <input
                    type="number"
                    readOnly
                    value={exonerationForm.percentage}
                    className="w-full p-2.5 border border-slate-205 bg-slate-100 text-xs font-black font-mono rounded-lg focus:outline-none text-slate-500"
                  />
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Tasa Afectada *</label>
                <select
                  required
                  value={exonerationForm.conceptCode}
                  onChange={(e) => setExonerationForm({ ...exonerationForm, conceptCode: e.target.value })}
                  className="w-full p-2.5 border border-slate-205 text-xs font-extrabold text-slate-850 bg-white rounded-lg focus:outline-none"
                >
                  <option value="MAT01">MAT01 - Matrícula Semestral Regular</option>
                  <option value="ADM01">ADM01 - Derecho de Examen de Admisión</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-450 tracking-wider block mb-1">Resolución N° / Fundamento de Exoneración *</label>
                <textarea
                  required
                  rows={3}
                  placeholder="Escriba el motivo técnico legal de la resolución directorial"
                  value={exonerationForm.reason}
                  onChange={(e) => setExonerationForm({ ...exonerationForm, reason: e.target.value })}
                  className="w-full p-2.5 border border-slate-205 text-xs font-semibold rounded-lg focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 border-t border-slate-100 pt-4 mt-6">
                <button
                  type="button"
                  onClick={() => setShowExonerationModal(false)}
                  className="px-5 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-[10px] uppercase tracking-wider hover:bg-slate-50 transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-xl bg-purple-900 hover:bg-purple-800 text-white font-black text-[10px] uppercase tracking-widest transition-all cursor-pointer"
                >
                  Registrar Beca
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================================
          OBSERVATION EXPLANATORY DIALOG (MODAL)
          ========================================================== */}
      {showObserveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="bg-slate-900 text-white p-5">
              <h3 className="text-xs font-black uppercase tracking-widest">Declarar Pago como Observado</h3>
              <p className="text-[10px] text-slate-400 font-bold mt-1">Escriba el detalle de por qué el voucher no se aprueba.</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-450 block mb-1">Detalle de Observación / Corrección *</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Ej. El código de operación no coincide con el estado de cuenta diario. / Monto incompleto, tasas son de S/. 250 y abonó S/. 120."
                  value={observationText}
                  onChange={(e) => setObservationText(e.target.value)}
                  className="w-full p-2.5 border border-slate-205 text-xs font-semibold rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-2">
                <button
                  onClick={() => { setShowObserveModal(false); setSelectedObligationId(null); }}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-[10px] uppercase cursor-pointer hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleConfirmObservePayment}
                  className="px-5 py-2 rounded-xl bg-[#9F062A] text-white hover:bg-[#800521] font-black text-[10px] uppercase tracking-widest cursor-pointer"
                >
                  Observar Voucher
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      {/* ==========================================================
          ADD CATALOG TASA CONCEPT OVERLAY (MODAL)
          ========================================================== */}
      {showAddConceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-sm w-full overflow-hidden">
            <div className="bg-[#9F062A] text-white p-5">
              <h3 className="text-xs font-black uppercase tracking-widest">Crear Nueva Tasa en el Catálogo</h3>
              <p className="text-[10px] text-amber-250 font-bold mt-1">Registre un concepto institucional de cobro.</p>
            </div>

            <form onSubmit={handleAddConcept} className="p-6 space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase text-slate-450 block mb-1">Código de Tasa (Ej: INS02) *</label>
                <input
                  type="text"
                  required
                  maxLength={10}
                  placeholder="Ej: MAT02"
                  value={conceptForm.code}
                  onChange={(e) => setConceptForm({ ...conceptForm, code: e.target.value })}
                  className="w-full p-2 border border-slate-205 text-xs font-bold font-mono rounded-lg"
                />
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-450 block mb-1">Nombre del Concepto *</label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Tasa de Duplicado de Certificado"
                  value={conceptForm.name}
                  onChange={(e) => setConceptForm({ ...conceptForm, name: e.target.value })}
                  className="w-full p-2 border border-slate-205 text-xs font-bold rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 block mb-1">Arancel (S/.) *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={conceptForm.amount}
                    onChange={(e) => setConceptForm({ ...conceptForm, amount: Number(e.target.value) })}
                    className="w-full p-2 border border-slate-205 text-xs font-bold font-mono rounded-lg"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-450 block mb-1">Categoría *</label>
                  <select
                    value={conceptForm.category}
                    onChange={(e) => setConceptForm({ ...conceptForm, category: e.target.value as any })}
                    className="w-full p-2 border border-slate-205 text-xs font-extrabold text-slate-800 bg-white rounded-lg"
                  >
                    <option value="Admisión">Admisión</option>
                    <option value="Matrícula">Matrícula</option>
                    <option value="Servicios">Servicios</option>
                    <option value="Trámites">Trámites</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase text-slate-450 block mb-1">Descripción Informativa</label>
                <textarea
                  rows={2}
                  value={conceptForm.description}
                  onChange={(e) => setConceptForm({ ...conceptForm, description: e.target.value })}
                  className="w-full p-2 border border-slate-205 text-xs font-semibold rounded-lg"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddConceptModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-600 font-bold text-[10px] uppercase cursor-pointer hover:bg-slate-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-black text-[10px] uppercase tracking-widest cursor-pointer"
                >
                  Guardar Tasa
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );

  // Helper autofills for forms to streamline UX
  function setFormStudentByDni(dni: string) {
    let text = dni.trim();
    setObligationForm(prev => ({ ...prev, studentDni: text }));
    if (text.length === 8) {
      // Look up student from studentsList or applicants in localStorage
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
  }

  function setFormExonerationDni(dni: string) {
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
  }
}

