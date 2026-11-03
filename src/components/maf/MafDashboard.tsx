import React, { useState, useEffect } from "react";
import Sidebar from "../ui/Sidebar";
import ConfirmModal from "../ui/ConfirmModal";
import { Card, CardContent } from "../ui/Card";
import {
  CreditCard,
  History,
  HelpCircle,
  Info,
  RefreshCw,
  Coins,
  ShieldCheck,
  Layers,
  ArrowLeft
} from "lucide-react";
import { fetchAdmissionPeriods, fetchApplicants, fetchEnrollments, fetchStudentByDni, updateApplicant, updateEnrollment } from "../../services/api";
import { createServiceRequest, fetchServiceRequests, ServiceConceptCode, ServiceRequest, updateServiceRequestPayment, deliverServiceRequestResult } from "../../services/serviceRequests";
import { MafConcept, MafObligation, MafAuditLog, SupportTicket } from "./mafTypes";
import { defaultConcepts, syncObligationsToMamcAndMge } from "./mafUtils";
import { readMafState, saveMafState } from "../../services/mafState";
import { AddConceptModal } from "./modals/AddConceptModal";
import { AddObligationModal } from "./modals/AddObligationModal";
import { RegisterVoucherModal } from "./modals/RegisterVoucherModal";
import { ObserveObligationModal } from "./modals/ObserveObligationModal";
import { RegistroPagosTab } from "./tabs/RegistroPagosTab";
import { ValidacionPagosTab } from "./tabs/ValidacionPagosTab";
import { EstadosPagoTab } from "./tabs/EstadosPagoTab";
import { CatalogoTasasTab } from "./tabs/CatalogoTasasTab";
import { RegistroTransaccionesTab } from "./tabs/RegistroTransaccionesTab";
import { AuditoriaTab } from "./tabs/AuditoriaTab";
import { SoporteTab } from "./tabs/SoporteTab";

interface MafDashboardProps {
  onLogout: () => void;
}

function obligationFromRequest(request: ServiceRequest): MafObligation {
  return {
    id: request.id,
    studentDni: request.studentDni || request.teacherDni || '',
    studentName: request.studentName,
    conceptCode: request.conceptCode,
    conceptName: request.conceptName,
    amount: request.amount,
    discount: 0,
    finalAmount: request.amount,
    period: request.period || "Sin período",
    status: request.status,
    dateCreated: request.createdAt?.slice(0, 10) || new Date().toISOString().slice(0, 10),
    source: request.source,
    requestReason: request.reason,
    requestedBy: request.requestedBy,
    contactPhone: request.contactPhone,
    deliveryStatus: request.deliveryStatus,
    resultFileName: request.resultFileName,
    voucherRegistered: !!request.paymentOperation,
    ...(request.paymentOperation ? { voucherDetails: {
      operationNumber: request.paymentOperation,
      bankName: request.bankName || "Banco de la Nación",
      paymentDate: request.paymentDate || "",
      amountPaid: request.amountPaid || request.amount,
    } } : {}),
  };
}

export default function MafDashboard({ onLogout }: MafDashboardProps) {
  // Navigation State
  const [activeTab, setActiveTab] = useState<
    "registro_pagos" | "validacion_pagos" | "estados_pago" | "catalogo_tasas" | "registro_transacciones" | "resultados" | "auditoria" | "soporte"
  >("registro_pagos");

  // Notifications State
  const [notification, setNotification] = useState<{ message: string; type: "success" | "info" | "warning" } | null>(null);

  // Core Entity States
  const [concepts, setConcepts] = useState<MafConcept[]>([]);
  const [obligations, setObligations] = useState<MafObligation[]>([]);
  const [verifiedStudentDni, setVerifiedStudentDni] = useState("");
  const [auditLogs, setAuditLogs] = useState<MafAuditLog[]>([]);

  // Search, Filter, and Modal States
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");

  // Modals visibility toggles
  const [showAddConceptModal, setShowAddConceptModal] = useState(false);
  const [showAddObligationModal, setShowAddObligationModal] = useState(false);
  const [showRegisterVoucherModal, setShowRegisterVoucherModal] = useState(false);
  const [showObserveModal, setShowObserveModal] = useState(false);

  // Reusable confirmation modal state
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    variant: "danger" | "warning" | "info" | "primary";
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void | Promise<void>;
  }>({
    isOpen: false,
    title: "",
    message: "",
    variant: "primary",
    onConfirm: () => {},
  });

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
    period: "",
    requestedBy: "",
    contactPhone: "",
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


  // Support Tickets State
  const [tickets, setTickets] = useState<SupportTicket[]>([
    { id: "T-8091", sender: "Rosa Elvira Huamán", dni: "44332211", topic: "Voucher de admisión rechazado", date: "2026-06-15", status: "Pendiente", detail: "El banco no emitió el código correcto pero adjunto mi captura de banca por celular." },
    { id: "T-8082", sender: "Jorge Luis Toledo", dni: "76543210", topic: "Error de cobro duplicado", date: "2026-06-14", status: "Atendido", detail: "Hice el pago dos veces por error, solicito la devolución de S/. 250." },
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
      void saveMafState('auditLogs', updated).catch(error => console.error('No se pudo guardar auditoría MAF:', error));
      return updated;
    });
  };

  const refreshServiceRequests = async () => {
    const requests = await fetchServiceRequests();
    setObligations(current => {
      const byId = new Map(current.map(item => [item.id, item]));
      requests.forEach(request => byId.set(request.id, obligationFromRequest(request)));
      const next = Array.from(byId.values());
      localStorage.setItem("maf_obligations", JSON.stringify(next));
      void saveMafState('obligations', next).catch(error => console.error('No se pudieron guardar obligaciones MAF:', error));
      return next;
    });
    return requests.length;
  };

  // Initialization & LocalStorage Load
  useEffect(() => {
    const storedConcepts = localStorage.getItem("maf_concepts");
    if (storedConcepts) {
      const previous: MafConcept[] = JSON.parse(storedConcepts);
      setConcepts([...previous, ...defaultConcepts.filter(item => !previous.some(old => old.code === item.code))]);
    } else {
      setConcepts(defaultConcepts);
      localStorage.setItem("maf_concepts", JSON.stringify(defaultConcepts));
    }

    localStorage.removeItem("maf_exonerations");

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
        const [apiApps, apiEnrolls, periods] = await Promise.all([
          fetchApplicants(), fetchEnrollments(), fetchAdmissionPeriods(),
        ]);
        if (!apiApps || !apiEnrolls) throw new Error("No se pudieron consultar postulantes y matrículas en la API local");
        const apps: any[] = apiApps;
        const enrolls: any[] = apiEnrolls;
        const appDnis = new Set(apps.map(app => app.dni));
        const enrollmentDnis = new Set(enrolls.map(enrollment => enrollment.studentDni));

        setObligations((prevObls) => {
          const updatedObls = prevObls.filter(ob =>
            (!ob.id.startsWith("OBL-ADM-") || appDnis.has(ob.studentDni)) &&
            (!ob.id.startsWith("OBL-MAT-") || enrollmentDnis.has(ob.studentDni))
          );
          let changed = updatedObls.length !== prevObls.length;

          apps.forEach((app) => {
            const dni = app.dni;
            if (!dni) return;
            const fullName = `${app.name || ''} ${app.lastName || ''}`.trim() || `Postulante DNI ${dni}`;
            const existingAdm = updatedObls.find((o) => o.studentDni === dni && o.conceptCode === "ADM01");

            let status: MafObligation["status"] = "Pendiente";
            if (app.paymentStatus === "Validado" || app.paymentStatus === "VERIFICADO") {
              status = "Validado";
            } else if (app.paymentStatus === "POR_VERIFICAR" || app.paymentStatus === "En Proceso" || app.paymentStatus === "Pagado" || app.paymentStatus === "Pendiente") {
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
                period: periods?.find(period => period.id === app.periodId)?.name || app.periodId || "Sin período",
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
            } else if (existingAdm.status !== status) {
              existingAdm.status = status;
              existingAdm.voucherRegistered = !!app.paymentOperation || !!app.voucherCode || status === 'Validado';
              changed = true;
            }
          });

          enrolls.forEach((enr) => {
            const dni = enr.studentDni;
            if (!dni) return;
            const fullName = enr.studentName || `Estudiante DNI ${dni}`;
            const existingMat = updatedObls.find((o) => o.studentDni === dni && o.conceptCode === "MAT01");

            let status: MafObligation["status"] = "Pendiente";
            if (enr.paymentStatus === "Validado") {
              status = "Validado";
            } else if (enr.paymentStatus === "POR_VERIFICAR" || enr.paymentStatus === "En Proceso" || enr.paymentStatus === "Pagado" || enr.paymentStatus === "Pendiente") {
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
            } else if (existingMat.status !== status) {
              existingMat.status = status;
              existingMat.voucherRegistered = !!enr.paymentOperation || status === 'Validado';
              changed = true;
            }
          });

          if (changed) {
            localStorage.setItem("maf_obligations", JSON.stringify(updatedObls));
            void saveMafState('obligations', updatedObls).catch(error => console.error('No se pudieron guardar obligaciones MAF:', error));
          }

          return updatedObls;
        });
      } catch (err) {
        console.error("Error syncing MAMC payments into MAF:", err);
      }
    };

    const hydrate = async () => {
      try {
        const [serverConcepts, serverObligations, serverLogs] = await Promise.all([
          readMafState<MafConcept>('concepts'), readMafState<MafObligation>('obligations'), readMafState<MafAuditLog>('auditLogs'),
        ]);
        const localConcepts = JSON.parse(localStorage.getItem('maf_concepts') || '[]') as MafConcept[];
        const localObligations = JSON.parse(localStorage.getItem('maf_obligations') || '[]') as MafObligation[];
        const localLogs = JSON.parse(localStorage.getItem('maf_audit_logs') || '[]') as MafAuditLog[];
        const conceptsToUse = [...(serverConcepts.length ? serverConcepts : localConcepts), ...defaultConcepts.filter(item => !(serverConcepts.length ? serverConcepts : localConcepts).some(old => old.code === item.code))];
        setConcepts(conceptsToUse);
        const obligationsToUse = (serverObligations.length ? serverObligations : localObligations).map(item =>
          (item.status as string) === 'Exonerado' ? { ...item, status: 'Pendiente' as const, discount: 0, finalAmount: item.amount } : item,
        );
        setObligations(obligationsToUse);
        setAuditLogs(serverLogs.length ? serverLogs : localLogs);
        if (!serverConcepts.length) await saveMafState('concepts', conceptsToUse);
        if (obligationsToUse.length && (!serverObligations.length || obligationsToUse.some(item => (serverObligations.find(old => old.id === item.id)?.status as string) === 'Exonerado')))
          await saveMafState('obligations', obligationsToUse);
        if (!serverLogs.length && localLogs.length) await saveMafState('auditLogs', localLogs);
      } catch (error) { console.error('No se pudo cargar el estado MAF desde MongoDB:', error); }
      await syncMamcPayments();
      await refreshServiceRequests().catch(error => console.error('No se pudieron cargar solicitudes:', error));
    };
    void hydrate();
  }, []);

  // Save on updates helper
  const handleConceptsUpdate = (updated: MafConcept[]) => {
    setConcepts(updated);
    localStorage.setItem("maf_concepts", JSON.stringify(updated));
    void saveMafState('concepts', updated).catch(error => triggerNotification(error.message, 'warning'));
  };

  const handleObligationsUpdate = (updated: MafObligation[]) => {
    updated.filter(item => item.id.startsWith("SOL-")).forEach(item => {
      const previous = obligations.find(old => old.id === item.id);
      const operation = item.voucherDetails?.operationNumber || "";
      if (previous && item.status !== 'Validado' && (previous.status !== item.status || (previous.voucherDetails?.operationNumber || "") !== operation)) {
        void updateServiceRequestPayment(item.id, {
          status: item.status,
          paymentOperation: operation,
          paymentDate: item.voucherDetails?.paymentDate || "",
          amountPaid: item.voucherDetails?.amountPaid || 0,
          bankName: item.voucherDetails?.bankName || "",
        }).catch(error => {
          console.error("No se pudo sincronizar el estado de la solicitud:", error);
          triggerNotification("El estado se guardó solo en este navegador; compruebe la conexión con el servidor.", "warning");
        });
      }
    });
    setObligations(updated);
    localStorage.setItem("maf_obligations", JSON.stringify(updated));
    void saveMafState('obligations', updated).catch(error => triggerNotification(error.message, 'warning'));
    syncObligationsToMamcAndMge(updated);
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
    setConfirmModal({
      isOpen: true,
      title: "Eliminar Concepto de Tasa",
      message: `¿Está seguro de que desea eliminar permanentemente el concepto de tasa "${code}" del catálogo institucional?`,
      variant: "danger",
      confirmText: "Eliminar Concepto",
      cancelText: "Cancelar",
      onConfirm: () => {
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
        const nextList = concepts.filter(c => c.id !== id);
        handleConceptsUpdate(nextList);
        addAuditLog("Eliminar Concepto Académico", `Se eliminó el concepto ${code} del catálogo institucional.`, "warning");
        triggerNotification("Concepto de tasa eliminado del catálogo.");
      }
    });
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
  const handleCreateObligation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verifiedStudentDni !== obligationForm.studentDni || !obligationForm.conceptId || !obligationForm.requestedBy.trim()) {
      triggerNotification("Primero identifique a un estudiante registrado mediante su DNI.", "warning");
      return;
    }

    const matchedConcept = concepts.find(c => c.id === obligationForm.conceptId);
    if (!matchedConcept || !["ADM01", "MAT01", "CER01", "CON01", "SUB01", "CAR01"].includes(matchedConcept.code)) return;
    let newObl: MafObligation;
    try {
      const request = await createServiceRequest({
        studentDni: obligationForm.studentDni,
        conceptCode: matchedConcept.code as ServiceConceptCode,
        source: "llamada_apoderado",
        period: obligationForm.period,
        reason: "Solicitud recibida por llamada del apoderado",
        requestedBy: obligationForm.requestedBy.trim(),
        contactPhone: obligationForm.contactPhone.trim(),
      });
      newObl = obligationFromRequest(request);
    } catch (error) {
      triggerNotification(error instanceof Error ? error.message : "No se pudo crear la solicitud.", "warning");
      return;
    }

    const nextObls = [newObl, ...obligations];
    handleObligationsUpdate(nextObls);

    addAuditLog(
      "Crear Obligación de Pago",
      `Se generó obligación de pago para ${newObl.studentName} por el concepto ${newObl.conceptCode} de S/.${newObl.finalAmount}.`,
      "success"
    );

    triggerNotification(`Obligación de pago generada con éxito.`);
    setShowAddObligationModal(false);
    setVerifiedStudentDni("");
    setObligationForm({ studentDni: "", studentName: "", conceptId: "", period: "", requestedBy: "", contactPhone: "" });
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

  const handleRegisterVoucher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedObligationId || !voucherForm.operationNumber || voucherForm.amountPaid <= 0) {
      triggerNotification("Por favor ingrese todos los detalles del comprobante físico.", "warning");
      return;
    }

    const selected = obligations.find(o => o.id === selectedObligationId);
    try {
      if (selected?.id.startsWith('SOL-')) await updateServiceRequestPayment(selected.id, {
        status: 'En Proceso', paymentOperation: voucherForm.operationNumber,
        paymentDate: voucherForm.paymentDate, amountPaid: Number(voucherForm.amountPaid), bankName: voucherForm.bankName,
      });
      else if (selected?.conceptCode === 'ADM01') {
        const saved = await updateApplicant(selected.studentDni, { paymentStatus: 'Pendiente', paymentOperation: voucherForm.operationNumber });
        if (!saved) throw new Error('No se pudo guardar el voucher de admisión.');
      } else if (selected?.conceptCode === 'MAT01') {
        const saved = await updateEnrollment(selected.studentDni, { paymentStatus: 'Pendiente', paymentOperation: voucherForm.operationNumber });
        if (!saved) throw new Error('No se pudo guardar el voucher de matrícula.');
      }
    } catch (error) {
      triggerNotification(error instanceof Error ? error.message : 'No se pudo guardar el voucher en el servidor.', 'warning');
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
  const handleOpenObservePayment = (oblId: string) => {
    setSelectedObligationId(oblId);
    setObservationText("");
    setShowObserveModal(true);
  };

  const handleConfirmObservePayment = async () => {
    if (!selectedObligationId || !observationText.trim()) {
      triggerNotification("Por favor, provea la razón del rechazo / observación para notificar al estudiante.", "warning");
      return;
    }

    const selected = obligations.find(o => o.id === selectedObligationId);
    try {
      if (selected?.id.startsWith('SOL-')) await updateServiceRequestPayment(selected.id, {
        status: 'Observado', paymentOperation: selected.voucherDetails?.operationNumber,
        paymentDate: selected.voucherDetails?.paymentDate, amountPaid: selected.voucherDetails?.amountPaid,
        bankName: selected.voucherDetails?.bankName,
      });
      else if (selected?.conceptCode === 'ADM01') {
        const saved = await updateApplicant(selected.studentDni, { paymentStatus: 'Observado', paymentObservations: observationText });
        if (!saved) throw new Error('No se pudo guardar la observación de admisión.');
      } else if (selected?.conceptCode === 'MAT01') {
        const saved = await updateEnrollment(selected.studentDni, { paymentStatus: 'Observado' });
        if (!saved) throw new Error('No se pudo guardar la observación de matrícula.');
      }
    } catch (error) { triggerNotification(error instanceof Error ? error.message : 'No se guardó la observación.', 'warning'); return; }
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
    const text = dni.trim();
    setVerifiedStudentDni("");
    setObligationForm(prev => ({ ...prev, studentDni: text, studentName: "" }));
    if (!/^\d{8}$/.test(text)) return;
    void fetchStudentByDni(text).then(student => {
      if (!student || student.active === false) {
        triggerNotification("No se encontró un estudiante activo con ese DNI.", "warning");
        return;
      }
      setVerifiedStudentDni(text);
      setObligationForm(prev => prev.studentDni === text ? { ...prev, studentName: `${student.name} ${student.lastName}`.trim() } : prev);
    });
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
              { label: "Resultados de Trámites", icon: <Layers className="w-4 h-4" />, route: "resultados", active: activeTab === "resultados" },
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
              onClick={() => void refreshServiceRequests().then(count => {
                triggerNotification(`${count} solicitud(es) de estudiantes consultadas en la base local.`);
              }).catch(() => triggerNotification("No se pudieron consultar las solicitudes en la base local.", "warning"))}
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
            onBankConfirmed={(ids, fileName) => {
              const selected = new Set(ids);
              handleObligationsUpdate(obligations.map(ob => selected.has(ob.id) && ob.status === "En Proceso" ? { ...ob, status: "Validado" } : ob));
              addAuditLog("Conciliación bancaria", `Se importó ${fileName} y se validaron ${ids.length} pagos.`, "success");
            }}
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


        {activeTab === "registro_transacciones" && (
          <RegistroTransaccionesTab
            obligations={obligations}
            setShowAddObligationModal={setShowAddObligationModal}
          />
        )}

        {activeTab === "resultados" && <section className="space-y-4 rounded-xl border bg-white p-5">
          <h2 className="text-xl font-black">Entrega de documentos</h2>
          <p className="text-sm text-slate-600">El pago debe estar validado con el reporte bancario. Adjunte el PDF emitido por Secretaría; el alumno o docente podrá descargarlo desde su historial.</p>
          {obligations.filter(item => item.id.startsWith('SOL-') && item.status === 'Validado').map(item =>
            <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 border-b py-3 text-sm">
              <div><p className="font-bold">{item.conceptName} · {item.studentName}</p><p className="text-slate-500">{item.id} · {item.deliveryStatus === 'Emitido' ? `Emitido: ${item.resultFileName}` : 'Pendiente de emisión'}</p></div>
              <label className="cursor-pointer rounded border px-3 py-2 font-bold text-[#800521]">Adjuntar PDF emitido<input type="file" accept="application/pdf,.pdf" className="sr-only" onChange={async e => {
                const file = e.target.files?.[0]; if (!file) return;
                try { await deliverServiceRequestResult(item.id, file); await refreshServiceRequests(); triggerNotification('Documento disponible para el solicitante.', 'success'); }
                catch (error) { triggerNotification(error instanceof Error ? error.message : 'No se pudo entregar el documento.', 'warning'); }
                e.target.value = '';
              }} /></label>
            </div>)}
        </section>}

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


      {/* Reusable Confirmation Modal */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        variant={confirmModal.variant}
        confirmText={confirmModal.confirmText}
        cancelText={confirmModal.cancelText}
        onConfirm={confirmModal.onConfirm}
        onClose={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
      />
    </div>
  );

}
