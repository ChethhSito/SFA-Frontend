import React, { useState } from "react";
import {
  Phone, Mail, MapPin, Facebook, Youtube, ChevronLeft, ChevronRight,
  BookOpen, Award, GraduationCap, Compass, Briefcase,
  HelpCircle, LogIn, Landmark, Check, Send, FileText, FileCheck,
  ChevronDown, Globe, Users, Calendar, CheckSquare, Menu, X, Loader2,
  CheckCircle2, ArrowRight, ShieldCheck, Zap, Building2, HeartHandshake,
  Instagram, Clock, FileSpreadsheet, ShieldAlert, UserCheck, Layers, Cpu, Download
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AdmissionPeriod } from "../types";
import { createApplicant, fetchApplicantByDni, sendTransactionalWelcomeEmail } from "../services/api";

interface PortalHomeProps {
  onEnterIntranet: () => void;
  admissionPeriods?: AdmissionPeriod[];
}

export default function PortalHome({
  onEnterIntranet,
  admissionPeriods = []
}: PortalHomeProps) {
  // Dynamic active/matching period check using current date validation
  const activePeriod = admissionPeriods.find(p => p.status === "APERTURADO" || p.isActive) ||
    admissionPeriods.find(p => p.status !== "CERRADO" && p.status !== "PENDIENTE") ||
    admissionPeriods[0];

  const displayPeriod = activePeriod || admissionPeriods[0];

  // Navigation State
  const [currentTab, setCurrentTab] = useState<
    "inicio" | "nosotros" | "programas" | "admision" | "transparencia" | "contactanos"
  >("inicio");

  // Navigation Dropdown & Mobile states
  const [activeDropdown, setActiveDropdown] = useState<"nosotros" | "programas" | "admision" | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredCareerId, setHoveredCareerId] = useState<string | null>(null);

  // Success modal confirmation state
  const [successModalData, setSuccessModalData] = useState<{
    name: string;
    lastName: string;
    email: string;
    programName: string;
  } | null>(null);

  // Loading modal state during pre-enrollment submission
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);

  // Pre-inscripción / Admission form state
  const [dniInput, setDniInput] = useState("");
  const [nameInput, setNameInput] = useState("");
  const [lastNameInput, setLastNameInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [programSelection, setProgramSelection] = useState("electronica");
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState("");

  // Contact form state
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactSubject, setContactSubject] = useState("admision");
  const [contactMessage, setContactMessage] = useState("");
  const [contactSuccessMsg, setContactSuccessMsg] = useState("");

  // Interactive Programs tab sub-selection
  const [selectedProgramId, setSelectedProgramId] = useState("electronica");

  // FAQ interactive state
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);

  // Values carousel slider state
  const [currentValueIdx, setCurrentValueIdx] = useState(0);

  // Handle live admission registration via NestJS REST API → MongoDB
  const handlePreEnrollmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccessMsg("");

    if (!/^\d{8}$/.test(dniInput)) {
      alert("El DNI debe contener exactamente 8 dígitos numéricos.");
      return;
    }

    setIsSubmittingForm(true);

    try {
      const existing = await fetchApplicantByDni(dniInput);
      if (existing) {
        setSubmitSuccessMsg(
          `El DNI ${dniInput} ya se encuentra registrado en la base de datos de Admisión. Utilice su DNI o Código como usuario en el portal de Intranet.`
        );
        setIsSubmittingForm(false);
        return;
      }

      const tempPass = "clave123";

      const newApplicantPayload = {
        dni: dniInput,
        name: nameInput,
        lastName: lastNameInput,
        email: emailInput,
        phone: phoneInput,
        programId: programSelection,
        paymentStatus: "No Pagado" as const,
        paymentOperation: "",
        examStatus: "No Programado" as const,
        admitted: false,
        periodId: displayPeriod?.id || activePeriod?.id || admissionPeriods[0]?.id || "1",
        folderStatus: "Pending" as const,
        password: tempPass,
        registeredAt: new Date().toISOString().split("T")[0]
      };

      const activeProg = careersDetail.find(c => c.id === programSelection);
      const progName = activeProg ? activeProg.name : "Programa Seleccionado";

      const created = await createApplicant(newApplicantPayload);
      const generatedApplicantCode = created?.applicantCode || dniInput;

      if (emailInput && emailInput.trim()) {
        sendTransactionalWelcomeEmail({
          email: emailInput.trim(),
          applicantCode: generatedApplicantCode,
          password: tempPass,
          name: `${nameInput} ${lastNameInput}`.trim(),
          dni: dniInput,
          programName: progName,
          url: `${window.location.origin}/ingresar`
        }).catch((err) => console.warn("Notice: Email dispatch queued:", err));
      }

      setSuccessModalData({
        name: nameInput,
        lastName: lastNameInput,
        email: emailInput,
        programName: progName
      });

      setSubmitSuccessMsg(
        `¡Pre-inscripción registrada con éxito! Código Oficial de Postulante: ${generatedApplicantCode}. Sus credenciales de acceso han sido enviadas a su correo electrónico (${emailInput}).`
      );

      try {
        const newApplicantObj = {
          id: created?.id || `APP-${Date.now()}`,
          applicantCode: generatedApplicantCode,
          dni: dniInput,
          name: nameInput,
          lastName: lastNameInput,
          email: emailInput,
          phone: phoneInput,
          programId: programSelection,
          programName: progName,
          password: tempPass,
          status: "PRE_INSCRITO",
          registrationDate: new Date().toISOString().split("T")[0]
        };
        const savedApps = localStorage.getItem("sfa_applicants");
        const existingList: any[] = savedApps ? JSON.parse(savedApps) : [];
        if (!existingList.some((a) => a.dni === dniInput)) {
          existingList.push(newApplicantObj);
          localStorage.setItem("sfa_applicants", JSON.stringify(existingList));
        }
      } catch (e) {
        console.error("Error updating local applicants storage:", e);
      }

      setDniInput("");
      setNameInput("");
      setLastNameInput("");
      setEmailInput("");
      setPhoneInput("");
    } catch (err) {
      console.error(err);
      alert("Error al procesar el registro de pre-inscripción.");
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccessMsg("¡Mensaje recibido con éxito! Su solicitud ha sido remitida a Mesa de Partes Virtuales de la Secretaría Académica. Nos comunicaremos en un plazo máximo de 24 horas hábiles.");
    setContactName("");
    setContactEmail("");
    setContactMessage("");
  };

  const careersDetail = [
    {
      id: "electronica",
      name: "Electricidad Industrial",
      hours: "3080 Horas Lectivas (3 Años / 6 Ciclos)",
      title: "Profesional Técnico en Electricidad Industrial",
      profile: "Diagnostica, instala, programa y realiza el mantenimiento preventivo y correctivo de sistemas eléctricos de media y baja tensión, maquinaria de potencia, automatización industrial mediante PLCs, motores eléctricos y tableros de control.",
      salaryEst: "S/. 1,900 - S/. 4,200",
      image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=800&auto=format&fit=crop",
      icon: <Zap className="w-6 h-6 text-amber-300" />,
      careerPath: [
        { cycle: "I Ciclo", courses: ["Electricidad de Corriente Continua", "Taller de Ajuste Mecánico", "Matemática Aplicada", "Seguridad e Higiene Industrial"] },
        { cycle: "II Ciclo", courses: ["Dibujo Técnico Eléctrico", "Luminotecnia e Instalaciones", "Instalaciones de Potencia", "Física Técnica Aplicada"] },
        { cycle: "III Ciclo", courses: ["Electrónica Analógica e Instrumentación", "Mediciones Eléctricas", "Circuitos Eléctricos de CA", "Máquinas Eléctricas I"] },
        { cycle: "IV Ciclo", courses: ["Sistemas Digitales", "Bobinado de Máquinas Rotativas", "Control de Motores Eléctricos", "Programación Básica de PLCs"] },
        { cycle: "V Ciclo", courses: ["Automatización Industrial con PLCs Avanzados", "Neumática e Hidráulica Industrial", "Redes Industriales y SCADA", "Subestaciones Eléctricas"] },
        { cycle: "VI Ciclo", courses: ["Mantenimiento Electromecánico de Plantas", "Instrumentación y Control del Taller", "Gestión y Proyecto de Titulación Profesional", "Ética Profesional"] }
      ]
    },
    {
      id: "contabilidad",
      name: "Contabilidad Financiera",
      hours: "3040 Horas Lectivas (3 Años / 6 Ciclos)",
      title: "Profesional Técnico en Contabilidad",
      profile: "Domina el control tributario y financiero de acuerdo a las Normas Internacionales de Información Financiera (NIIF), auditoría tributaria en PyMEs, costos de producción y sistematización contable con software ERP moderno.",
      salaryEst: "S/. 1,700 - S/. 3,800",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=800&auto=format&fit=crop",
      icon: <Landmark className="w-6 h-6 text-amber-300" />,
      careerPath: [
        { cycle: "I Ciclo", courses: ["Contabilidad General I", "Matemática Financiera Aplicada", "Documentación Comercial y Contable", "Tecnología de la Información"] },
        { cycle: "II Ciclo", courses: ["Plan Contable General Empresarial", "Tributación I (IGV y Comprobantes)", "Contabilidad General II", "Estadística Aplicada"] },
        { cycle: "III Ciclo", courses: ["Contabilidad de Costos Industriales", "Costeo por Procesos y Órdenes", "Tributación II (Renta y Retenciones)", "Legislación Comercial"] },
        { cycle: "IV Ciclo", courses: ["Software Contable ERP de Aplicación", "Legislación Laboral y Planillas", "Formulación de Estados Financieros", "Finanzas Empresariales"] },
        { cycle: "V Ciclo", courses: ["Auditoría Financiera e Integral", "Contabilidad Gubernamental del Estado", "Análisis e Interpretación de Estados", "Costos para la Toma de Decisiones"] },
        { cycle: "VI Ciclo", courses: ["Planeamiento Financiero y Fiscal Avanzado", "Peritaje Contable y Tributario", "Proyecto de Titulación Profesional", "Ética y Deontología Profesional"] }
      ]
    }
  ];

  const faqsList = [
    {
      id: 1,
      question: "¿La enseñanza en el IESTP San Francisco de Asís es gratuita?",
      answer: "Sí. Al ser un Instituto de Educación Superior Tecnológico Público, la enseñanza regular no tiene costos de pensión mensual (S/. 0.00 de pensión). Solo se abonan las tasas ordinarias institucionales por derecho de examen de admisión y matrícula semestral."
    },
    {
      id: 2,
      question: "¿Qué título obtendré al finalizar mis 3 años de estudio?",
      answer: "Obtendrás el Título Oficial a Nombre de la Nación como Profesional Técnico expedido directamente por el Ministerio de Educación (MINEDU), con pleno valor oficial para ejercer a nivel nacional e internacional."
    },
    {
      id: 3,
      question: "¿Cuáles son los requisitos para la Pre-Inscripción al Examen 2026-I?",
      answer: "Los requisitos básicos son: Copia simple de DNI vigente, Certificado de estudios de 5to de Secundaria (original o digital emitido por el Minedu) y comprobante del derecho de examen de admisión."
    },
    {
      id: 4,
      question: "¿Cuáles son los turnos de estudio disponibles?",
      answer: "Ofrecemos turnos en horario Diurno (Mañana/Tarde) y Nocturno, permitiendo a nuestros estudiantes trabajar y realizar sus prácticas profesionales mientras estudian."
    },
    {
      id: 5,
      question: "¿Cómo se realizan las Prácticas Pre-Profesionales (EFSRT)?",
      answer: "Se desarrollan progresivamente a lo largo de la carrera a través de los Módulos Formativos en empresas e instituciones mediante convenios interinstitucionales aprobados."
    },
    {
      id: 6,
      question: "¿Dónde se rinde el Examen de Admisión Ordinario?",
      answer: "El examen presencial se realiza en las instalaciones de nuestro campus principal ubicado en Villa María del Triunfo en las fechas publicadas en el cronograma institucional."
    },
    {
      id: 7,
      question: "¿Puedo convalidar estudios de otro instituto o universidad?",
      answer: "Sí, el proceso de convalidación académica se tramita mediante Secretaría Académica previa evaluación del Plan de Estudios y sílabos oficializados del postulante."
    },
    {
      id: 8,
      question: "¿Cuándo inician las clases del Semestre Académico 2026-I?",
      answer: "Las clases del Semestre 2026-I inician inmediatamente tras concluir el proceso de matrícula oficial adjudicado a los postulantes aprobados en el Examen de Admisión."
    }
  ];

  const activeCareer = careersDetail.find(c => c.id === selectedProgramId) || careersDetail[0];

  return (
    <div id="home-view" className="flex flex-col min-h-screen bg-white font-sans text-slate-900 selection:bg-[#9F062A] selection:text-white">

      {/* 1. TOPBAR DELGADO INSTITUCIONAL DE CONTACTO */}
      <div className="bg-[#800521] text-white py-1.5 px-4 sm:px-8 lg:px-12 text-xs font-semibold border-b border-red-950">
        <div className="w-full max-w-full mx-auto flex flex-col md:flex-row justify-between items-center gap-2">

          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 sm:gap-6 text-[10.5px]">
            <span className="flex items-center gap-1.5 font-bold tracking-wide">
              <Building2 className="w-3.5 h-3.5 text-amber-300" />
              IESTP SAN FRANCISCO DE ASÍS
            </span>
            <span className="flex items-center gap-1.5 text-slate-100 hover:text-amber-300 transition-colors">
              <Phone className="w-3.5 h-3.5 text-amber-300" />
              Central: 01 500 6177
            </span>
            <span className="flex items-center gap-1.5 text-slate-100 hover:text-amber-300 transition-colors">
              <Mail className="w-3.5 h-3.5 text-amber-300" />
              admision@iestpsfa.edu.pe
            </span>
            <span className="hidden lg:flex items-center gap-1.5 text-slate-200">
              <MapPin className="w-3.5 h-3.5 text-amber-300" />
              VMT - Pachacútec Cdra. 50
            </span>
          </div>

          <div className="flex items-center gap-4 text-[10.5px]">
            <span className="text-amber-300 font-extrabold uppercase tracking-wider hidden sm:inline">
              RESOLUCIÓN MINEDU: R.M. 124-2021
            </span>
            <div className="flex items-center gap-2.5">
              <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition-colors" aria-label="Instagram">
                <Instagram className="w-3.5 h-3.5" />
              </a>
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-amber-300 transition-colors" aria-label="Facebook">
                <Facebook className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>

        </div>
      </div>

      {/* 2. NAVEGACIÓN LIMPIA, FINA Y ELEGANTE CON LOGO INSTITUCIONAL */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
        <div className="w-full max-w-full mx-auto px-4 sm:px-8 lg:px-12 py-2 flex justify-between items-center gap-4 relative">

          {/* Logo Institucional Fino y Pegado a la Izquierda */}
          <div
            className="flex items-center gap-2 cursor-pointer select-none shrink-0"
            onClick={() => { setCurrentTab("inicio"); setMobileMenuOpen(false); }}
          >
            <img
              src="/SFA-Logo.jpeg"
              alt="Logo Oficial IESTP San Francisco de Asís"
              className="w-8 h-8 sm:w-8.5 sm:h-8.5 object-contain rounded-full border border-[#CFA020] shadow-xs shrink-0 bg-white p-0.5"
            />
            <div>
              <h1 className="text-[11px] sm:text-xs font-black tracking-tight leading-tight uppercase text-slate-800">
                IESTP <span className="text-[#9F062A]">SAN FRANCISCO</span>
                <span className="text-[#CFA020] ml-1">DE ASÍS</span>
              </h1>
              <span className="text-[7.5px] sm:text-[8px] uppercase tracking-widest text-[#9F062A] font-bold block leading-none mt-0.5">
                LUZ Y VERDAD • VILLA MARÍA DEL TRIUNFO
              </span>
            </div>
          </div>

          {/* Menú de Navegación Principal Fino, Holgado y Elegante */}
          <nav className="hidden lg:flex items-center gap-4 xl:gap-7 text-[11px] font-bold text-slate-700">

            <button
              onClick={() => { setCurrentTab("inicio"); setActiveDropdown(null); }}
              className={`py-1 px-1 relative transition-colors uppercase tracking-wider cursor-pointer outline-none focus:outline-none focus:ring-0 select-none ${currentTab === "inicio" ? "text-[#9F062A] font-extrabold" : "hover:text-[#9F062A]"}`}
            >
              <span>INICIO</span>
              {currentTab === "inicio" && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#9F062A] rounded-full" />
              )}
            </button>

            {/* Nosotros Dropdown */}
            <div className="relative py-2 group">
              <button
                onClick={() => { setCurrentTab("nosotros"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className={`py-1 px-1 relative transition-colors uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer outline-none focus:outline-none focus:ring-0 select-none ${currentTab === "nosotros" ? "text-[#9F062A] font-extrabold" : "hover:text-[#9F062A]"}`}
              >
                <span>NOSOTROS</span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform" />
                {currentTab === "nosotros" && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#9F062A] rounded-full" />
                )}
              </button>

              <div className="absolute top-full left-0 w-64 bg-white border border-slate-200/90 shadow-2xl rounded-xl p-2 z-50 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 space-y-1">
                <button
                  onClick={() => {
                    setCurrentTab("nosotros");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full text-left p-2.5 hover:bg-rose-50 hover:text-[#9F062A] rounded-lg transition-colors text-[11px] font-bold uppercase flex items-center gap-2.5 text-slate-800 cursor-pointer"
                >
                  <Award className="w-4 h-4 text-[#9F062A] shrink-0" />
                  <span>Misión, Visión y Valores</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentTab("nosotros");
                    setTimeout(() => {
                      const el = document.getElementById("organigrama-section");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 150);
                  }}
                  className="w-full text-left p-2.5 hover:bg-rose-50 hover:text-[#9F062A] rounded-lg transition-colors text-[11px] font-bold uppercase flex items-center gap-2.5 text-slate-800 cursor-pointer"
                >
                  <Users className="w-4 h-4 text-[#9F062A] shrink-0" />
                  <span>Plana Directiva y Autoridades</span>
                </button>
              </div>
            </div>

            {/* Programas Dropdown */}
            <div className="relative py-2 group">
              <button
                onClick={() => { setCurrentTab("programas"); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className={`py-1 px-1 relative transition-colors uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer outline-none focus:outline-none focus:ring-0 select-none ${currentTab === "programas" ? "text-[#9F062A] font-extrabold" : "hover:text-[#9F062A]"}`}
              >
                <span>PROGRAMAS</span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform" />
                {currentTab === "programas" && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#9F062A] rounded-full" />
                )}
              </button>

              <div className="absolute top-full left-0 w-72 bg-white border border-slate-200/90 shadow-2xl rounded-xl p-2.5 z-50 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 space-y-1">
                <span className="text-[9px] uppercase font-black text-[#9F062A] tracking-wider block px-2 mb-1 font-mono">Especialidades Licenciadas:</span>
                <button
                  onClick={() => {
                    setSelectedProgramId("electronica");
                    setCurrentTab("programas");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full text-left p-2.5 hover:bg-rose-50 hover:text-[#9F062A] rounded-lg transition-colors text-[11px] font-bold text-slate-800 uppercase flex flex-col cursor-pointer"
                >
                  <span className="flex items-center gap-2"><Zap className="w-4 h-4 text-[#9F062A] shrink-0" /> Electricidad Industrial</span>
                  <span className="text-[9px] text-slate-500 normal-case font-normal mt-0.5 ml-6">Control de PLCs, Motores y Subestaciones</span>
                </button>
                <button
                  onClick={() => {
                    setSelectedProgramId("contabilidad");
                    setCurrentTab("programas");
                    window.scrollTo({ top: 0, behavior: "smooth" });
                  }}
                  className="w-full text-left p-2.5 hover:bg-rose-50 hover:text-[#9F062A] rounded-lg transition-colors text-[11px] font-bold text-slate-800 uppercase flex flex-col mt-0.5 cursor-pointer"
                >
                  <span className="flex items-center gap-2"><Landmark className="w-4 h-4 text-[#9F062A] shrink-0" /> Contabilidad Financiera</span>
                  <span className="text-[9px] text-slate-500 normal-case font-normal mt-0.5 ml-6">Tributación Empresarial, NIIF y ERP</span>
                </button>
              </div>
            </div>

            {/* Admisión Dropdown */}
            <div className="relative py-2 group">
              <button
                onClick={() => { setCurrentTab("admision"); setSubmitSuccessMsg(""); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                className={`py-1 px-1 relative transition-colors uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer outline-none focus:outline-none focus:ring-0 select-none ${currentTab === "admision" ? "text-[#9F062A] font-extrabold" : "hover:text-[#9F062A]"}`}
              >
                <span>ADMISIÓN</span>
                <ChevronDown className="w-3 h-3 text-slate-400 group-hover:rotate-180 transition-transform" />
                {currentTab === "admision" && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#9F062A] rounded-full" />
                )}
              </button>

              <div className="absolute top-full left-0 w-64 bg-white border border-slate-200/90 shadow-2xl rounded-xl p-2 z-50 opacity-0 pointer-events-none group-hover:opacity-100 group-hover:pointer-events-auto transition-all duration-200 space-y-1">
                <button
                  onClick={() => {
                    setCurrentTab("admision");
                    setSubmitSuccessMsg("");
                    setTimeout(() => {
                      const el = document.getElementById("admision-form");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 150);
                  }}
                  className="w-full text-left p-2.5 hover:bg-rose-50 hover:text-[#9F062A] rounded-lg transition-colors text-[11px] font-bold uppercase flex items-center gap-2.5 text-slate-800 cursor-pointer"
                >
                  <CheckSquare className="w-4 h-4 text-[#9F062A] shrink-0" />
                  <span>Pre-Inscripción Virtual 2026-I</span>
                </button>
                <button
                  onClick={() => {
                    setCurrentTab("admision");
                    setSubmitSuccessMsg("");
                    setTimeout(() => {
                      const el = document.getElementById("tasas-requisitos");
                      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    }, 150);
                  }}
                  className="w-full text-left p-2.5 hover:bg-rose-50 hover:text-[#9F062A] rounded-lg transition-colors text-[11px] font-bold uppercase flex items-center gap-2.5 text-slate-800 cursor-pointer"
                >
                  <Landmark className="w-4 h-4 text-[#9F062A] shrink-0" />
                  <span>Tasas y Requisitos del Examen</span>
                </button>
              </div>
            </div>

            <button
              onClick={() => { setCurrentTab("transparencia"); setActiveDropdown(null); }}
              className={`py-1 px-1 relative transition-colors uppercase tracking-wider cursor-pointer outline-none focus:outline-none focus:ring-0 select-none ${currentTab === "transparencia" ? "text-[#9F062A] font-extrabold" : "hover:text-[#9F062A]"}`}
            >
              <span>TRANSPARENCIA</span>
              {currentTab === "transparencia" && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#9F062A] rounded-full" />
              )}
            </button>

            <button
              onClick={() => { setCurrentTab("contactanos"); setActiveDropdown(null); }}
              className={`py-1 px-1 relative transition-colors uppercase tracking-wider cursor-pointer outline-none focus:outline-none focus:ring-0 select-none ${currentTab === "contactanos" ? "text-[#9F062A] font-extrabold" : "hover:text-[#9F062A]"}`}
            >
              <span>CONTÁCTANOS</span>
              {currentTab === "contactanos" && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#9F062A] rounded-full" />
              )}
            </button>

          </nav>

          {/* Botón Compacto y Fino de Intranet Académica */}
          <div className="hidden lg:flex items-center gap-3 shrink-0">
            <button
              onClick={onEnterIntranet}
              className="flex items-center gap-1.5 bg-[#9F062A] hover:bg-[#800521] text-white px-3 py-1.5 rounded-md font-bold tracking-wide transition-all shadow-xs text-[10.5px] cursor-pointer active:scale-95"
            >
              <GraduationCap className="w-3.5 h-3.5 text-amber-300" />
              <span>Intranet Académica</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:text-[#9F062A] focus:outline-none cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* Mobile Navigation Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white animate-fade-in w-full text-xs font-bold text-slate-800 select-none pb-6 px-4">
            <div className="py-3 space-y-1">
              <button
                onClick={() => { setCurrentTab("inicio"); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-md hover:bg-rose-50 text-[#9F062A] block uppercase font-extrabold"
              >
                INICIO
              </button>
              <button
                onClick={() => { setCurrentTab("nosotros"); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-md hover:bg-rose-50 text-slate-800 block uppercase"
              >
                NOSOTROS
              </button>
              <button
                onClick={() => { setCurrentTab("programas"); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-md hover:bg-rose-50 text-slate-800 block uppercase"
              >
                PROGRAMAS
              </button>
              <button
                onClick={() => { setCurrentTab("admision"); setSubmitSuccessMsg(""); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-md hover:bg-rose-50 text-slate-800 block uppercase"
              >
                ADMISIÓN
              </button>
              <button
                onClick={() => { setCurrentTab("transparencia"); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-md hover:bg-rose-50 text-slate-800 block uppercase"
              >
                TRANSPARENCIA
              </button>
              <button
                onClick={() => { setCurrentTab("contactanos"); setMobileMenuOpen(false); }}
                className="w-full text-left px-4 py-3 rounded-md hover:bg-rose-50 text-slate-800 block uppercase"
              >
                CONTÁCTANOS
              </button>
              <div className="pt-3 border-t border-slate-200">
                <button
                  onClick={() => { onEnterIntranet(); setMobileMenuOpen(false); }}
                  className="w-full py-3 bg-[#9F062A] text-white rounded-lg font-bold uppercase tracking-wider text-center text-xs flex items-center justify-center gap-2 shadow-md"
                >
                  <GraduationCap className="w-4 h-4 text-amber-300" /> Intranet Académica
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* 3. DYNAMIC CONTENT VIEWS */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >

            {/* ================= INICIO VIEW ================= */}
            {currentTab === "inicio" && (
              <div className="space-y-0">

                {/* HERO PRINCIPAL INSTITUCIONAL Y REALISTA */}
                <section className="relative min-h-[500px] lg:min-h-[560px] bg-slate-950 flex items-center overflow-hidden">

                  {/* Fotografía Realista de Estudiantes del Instituto */}
                  <div className="absolute inset-0 z-0">
                    <img
                      src="/hero_campus_sfa.jpg"
                      alt="Estudiantes del IESTP San Francisco de Asís caminando en el campus"
                      className="w-full h-full object-cover object-center scale-100"
                    />
                    {/* Degradado Granate Institucional desde la Izquierda */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#450212] via-[#66031A]/95 via-45% to-transparent z-10" />
                  </div>

                  {/* Contenido del Hero Integrado en el Lado Izquierdo */}
                  <div className="max-w-7xl mx-auto w-full px-6 sm:px-10 py-12 relative z-20 grid grid-cols-1 lg:grid-cols-12 items-center">

                    <div className="lg:col-span-7 space-y-5 text-white">

                      {/* Etiqueta de Admisión con Línea Dorada */}
                      <div className="inline-flex items-center gap-2 bg-black/40 border-l-4 border-[#CFA020] px-3.5 py-1.5 rounded-r-md text-xs font-bold uppercase tracking-wider text-white">
                        <span>ADMISION ORDINARIA 2026 ABIERTA</span>
                      </div>

                      {/* Título Grande: Blanco + Dorado para "DE ASÍS" */}
                      <h2 className="text-4xl sm:text-5xl lg:text-6xl font-black leading-tight tracking-tight uppercase">
                        IESTP SAN FRANCISCO<br />
                        <span className="text-[#CFA020]">DE ASÍS</span>
                      </h2>

                      {/* Subtítulo en Blanco Negrita */}
                      <h3 className="text-base sm:text-xl font-bold text-white leading-snug">
                        Formación técnica de calidad para un mejor futuro.
                      </h3>

                      {/* Texto Institucional */}
                      <p className="text-xs sm:text-sm text-slate-200 font-normal leading-relaxed max-w-xl">
                        En el IESTP San Francisco de Asís te preparamos con valores, conocimientos y habilidades para que seas un profesional competitivo y comprometido con la sociedad.
                      </p>

                      {/* Botones Principal (Granate) y Secundario (Borde Blanco) */}
                      <div className="flex flex-wrap items-center gap-4 pt-4">
                        <button
                          onClick={() => { setCurrentTab("admision"); setSubmitSuccessMsg(""); }}
                          className="bg-[#9F062A] hover:bg-[#800521] text-white font-bold px-6 py-3.5 rounded-md text-xs uppercase tracking-wider shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
                        >
                          <span>EXAMEN DE ADMISIÓN ORDINARIO</span>
                          <ArrowRight className="w-4 h-4 text-white" />
                        </button>
                        <button
                          onClick={() => setCurrentTab("programas")}
                          className="bg-transparent hover:bg-white/10 text-white font-bold px-6 py-3.5 rounded-md text-xs uppercase tracking-wider border border-white/60 transition-colors flex items-center gap-2 cursor-pointer"
                        >
                          <Calendar className="w-4 h-4 text-amber-300" />
                          <span>VER PLANES TECNOLÓGICOS</span>
                        </button>
                      </div>

                    </div>

                    {/* Detalle Visual Discreto en la Esquina Inferior Derecha */}
                    <div className="hidden lg:block lg:col-span-5 relative h-full">
                      <div className="absolute bottom-4 right-0 text-right select-none">
                        <p className="font-serif italic text-white/95 text-xl sm:text-2xl drop-shadow-md tracking-wide">
                          “Tu esfuerzo también es parte de nuestra historia”
                        </p>
                        <div className="w-36 h-0.5 bg-[#CFA020] ml-auto mt-1 rounded-full shadow-sm" />
                      </div>
                    </div>

                  </div>

                  {/* Transición Orgánica Inferior Blanca */}
                  <div className="absolute bottom-0 left-0 right-0 h-6 bg-white rounded-t-[50%] z-20 translate-y-3" />
                </section>

                {/* 4. FRANJA DE BENEFICIOS INSTITUCIONALES (DIRECTAMENTE DEBAJO DEL HERO CON HOVERS INTERACTIVOS) */}
                <section className="bg-white border-b border-slate-200/80 py-8 px-4 relative z-30 shadow-xs">
                  <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 lg:gap-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">

                      {/* Beneficio 1 */}
                      <div className="group flex items-start gap-4 p-4 sm:px-5 rounded-2xl transition-all duration-300 hover:bg-gradient-to-b hover:from-white hover:to-rose-50/40 hover:shadow-md hover:-translate-y-1 border border-transparent hover:border-[#9F062A]/20 cursor-default">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#9F062A] border border-amber-200/70 group-hover:bg-[#800521] group-hover:text-amber-300 group-hover:border-amber-400/50 shadow-2xs group-hover:scale-110 transition-all duration-300 flex items-center justify-center shrink-0">
                          <GraduationCap className="w-6 h-6 transition-colors" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 group-hover:text-[#9F062A] uppercase tracking-wider transition-colors">PROGRAMAS TÉCNICOS</h4>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1 group-hover:text-slate-700 transition-colors">Formación alineada al mercado laboral</p>
                        </div>
                      </div>

                      {/* Beneficio 2 */}
                      <div className="group flex items-start gap-4 p-4 sm:px-5 rounded-2xl transition-all duration-300 hover:bg-gradient-to-b hover:from-white hover:to-rose-50/40 hover:shadow-md hover:-translate-y-1 border border-transparent hover:border-[#9F062A]/20 cursor-default">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#9F062A] border border-amber-200/70 group-hover:bg-[#800521] group-hover:text-amber-300 group-hover:border-amber-400/50 shadow-2xs group-hover:scale-110 transition-all duration-300 flex items-center justify-center shrink-0">
                          <Users className="w-6 h-6 transition-colors" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 group-hover:text-[#9F062A] uppercase tracking-wider transition-colors">DOCENTES CALIFICADOS</h4>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1 group-hover:text-slate-700 transition-colors">Profesionales con experiencia real</p>
                        </div>
                      </div>

                      {/* Beneficio 3 */}
                      <div className="group flex items-start gap-4 p-4 sm:px-5 rounded-2xl transition-all duration-300 hover:bg-gradient-to-b hover:from-white hover:to-rose-50/40 hover:shadow-md hover:-translate-y-1 border border-transparent hover:border-[#9F062A]/20 cursor-default">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#9F062A] border border-amber-200/70 group-hover:bg-[#800521] group-hover:text-amber-300 group-hover:border-amber-400/50 shadow-2xs group-hover:scale-110 transition-all duration-300 flex items-center justify-center shrink-0">
                          <Building2 className="w-6 h-6 transition-colors" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 group-hover:text-[#9F062A] uppercase tracking-wider transition-colors">INFRAESTRUCTURA MODERNA</h4>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1 group-hover:text-slate-700 transition-colors">Ambientes seguros y equipados</p>
                        </div>
                      </div>

                      {/* Beneficio 4 */}
                      <div className="group flex items-start gap-4 p-4 sm:px-5 rounded-2xl transition-all duration-300 hover:bg-gradient-to-b hover:from-white hover:to-rose-50/40 hover:shadow-md hover:-translate-y-1 border border-transparent hover:border-[#9F062A]/20 cursor-default">
                        <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#9F062A] border border-amber-200/70 group-hover:bg-[#800521] group-hover:text-amber-300 group-hover:border-amber-400/50 shadow-2xs group-hover:scale-110 transition-all duration-300 flex items-center justify-center shrink-0">
                          <ShieldCheck className="w-6 h-6 transition-colors" />
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-slate-900 group-hover:text-[#9F062A] uppercase tracking-wider transition-colors">COMPROMISO SOCIAL</h4>
                          <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1 group-hover:text-slate-700 transition-colors">Educación que transforma vidas</p>
                        </div>
                      </div>

                    </div>
                  </div>
                </section>

                {/* 5. CARRERAS DESTACADAS Y PRESENTACIÓN INSTITUCIONAL */}
                <section className="py-14 px-4 sm:px-6 lg:px-8 bg-slate-50/70 border-y border-slate-200/60 overflow-hidden">
                  <div className="w-full max-w-7xl mx-auto space-y-8">
                    <div className="text-center max-w-3xl mx-auto space-y-2">
                      <span className="text-[#9F062A] font-black text-xs uppercase tracking-widest block font-mono">CONOCE NUESTRAS ESPECIALIDADES</span>
                      <h3 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight">
                        Carreras Profesionales Licenciadas
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        Formación técnica de 3 años con titulación oficial expedida directamente por el Ministerio de Educación (MINEDU) y pensión mensual de S/ 0.00.
                      </p>
                    </div>

                    {/* Tarjetas Horizontales Alternadas (Zig-Zag) con Hover Focus */}
                    <div className="space-y-6">

                      {/* CARRERA 01: ELECTRICIDAD INDUSTRIAL (Imagen Izquierda - Información Derecha) */}
                      <div
                        onMouseEnter={() => setHoveredCareerId("electronica")}
                        onMouseLeave={() => setHoveredCareerId(null)}
                        onClick={() => {
                          setSelectedProgramId("electronica");
                          setProgramSelection("electronica");
                          setCurrentTab("programas");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`group bg-white rounded-3xl border transition-all duration-500 overflow-hidden cursor-pointer ${
                          hoveredCareerId === "electronica"
                            ? "border-[#9F062A] shadow-2xl scale-[1.015] z-10 bg-gradient-to-r from-rose-50/30 via-white to-white"
                            : hoveredCareerId === "contabilidad"
                            ? "border-slate-200/80 shadow-sm opacity-85 scale-[0.985]"
                            : "border-slate-200/90 shadow-md hover:shadow-xl"
                        }`}
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[280px]">
                          {/* Columna Imagen (Izquierda) - Cuadrada / Rectangular Flush */}
                          <div className="lg:col-span-5 relative overflow-hidden bg-slate-900 min-h-[220px] lg:min-h-full">
                            <img
                              src={careersDetail[0].image}
                              alt={careersDetail[0].name}
                              className="w-full h-full object-cover rounded-none transition-transform duration-700 ease-out group-hover:scale-108"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                            <div className="absolute top-0 left-0 bg-slate-950/90 text-amber-300 font-mono text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1.5 border-b border-r border-amber-400/40 rounded-br-xl shadow-md">
                              ● LICENCIAMIENTO MINEDU
                            </div>
                            <div className="absolute bottom-3 left-4 text-white">
                              <span className="text-[10px] font-extrabold font-mono text-amber-300 uppercase tracking-widest block">ESPECIALIDAD 01</span>
                              <h4 className="text-lg font-black uppercase tracking-tight text-white drop-shadow-md">
                                ELECTRICIDAD INDUSTRIAL
                              </h4>
                            </div>
                            <div className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r from-amber-400 via-[#9F062A] to-amber-400 transition-all duration-500" />
                          </div>

                          {/* Columna Información (Derecha) */}
                          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-4">
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl font-black text-[#9F062A] font-mono">01</span>
                                <div className="h-0.5 w-12 group-hover:w-24 bg-amber-400 transition-all duration-500" />
                                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">TITULACIÓN DIRECTA</span>
                              </div>
                              <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight hidden lg:block">
                                ELECTRICIDAD INDUSTRIAL
                              </h4>
                              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                                Diagnostica, instala, programa y realiza el mantenimiento preventivo y correctivo de sistemas eléctricos de media y baja tensión, maquinaria de potencia, automatización industrial mediante PLCs, motores eléctricos y tableros de control.
                              </p>
                            </div>

                            {/* Métricas Horizontales Limpias */}
                            <div className="py-2.5 border-y border-slate-200/80 grid grid-cols-3 gap-2 text-center">
                              <div>
                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono block">ARANCEL</span>
                                <span className="text-sm font-black text-[#9F062A]">S/ 0.00</span>
                              </div>
                              <div className="border-x border-slate-200/80 px-2">
                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono block">DURACIÓN</span>
                                <span className="text-sm font-black text-slate-900">3 Años</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono block">HORAS</span>
                                <span className="text-sm font-black text-slate-900">3,080 Hrs</span>
                              </div>
                            </div>

                            {/* Botón de Acción */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProgramId("electronica");
                                setProgramSelection("electronica");
                                setCurrentTab("programas");
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="w-full py-3 px-5 bg-[#9F062A] hover:bg-[#800521] text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md group-hover:shadow-lg active:scale-98"
                            >
                              <span>VER MALLA CURRICULAR Y CURSOS</span>
                              <ArrowRight className="w-4 h-4 text-amber-300 transition-transform duration-300 group-hover:translate-x-1.5" />
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* CARRERA 02: CONTABILIDAD FINANCIERA (Información Izquierda - Imagen Derecha) */}
                      <div
                        onMouseEnter={() => setHoveredCareerId("contabilidad")}
                        onMouseLeave={() => setHoveredCareerId(null)}
                        onClick={() => {
                          setSelectedProgramId("contabilidad");
                          setProgramSelection("contabilidad");
                          setCurrentTab("programas");
                          window.scrollTo({ top: 0, behavior: "smooth" });
                        }}
                        className={`group bg-white rounded-3xl border transition-all duration-500 overflow-hidden cursor-pointer ${
                          hoveredCareerId === "contabilidad"
                            ? "border-[#9F062A] shadow-2xl scale-[1.015] z-10 bg-gradient-to-r from-white via-white to-rose-50/30"
                            : hoveredCareerId === "electronica"
                            ? "border-slate-200/80 shadow-sm opacity-85 scale-[0.985]"
                            : "border-slate-200/90 shadow-md hover:shadow-xl"
                        }`}
                      >
                        <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch min-h-[280px]">
                          {/* Columna Información (Izquierda) */}
                          <div className="lg:col-span-7 p-6 sm:p-8 flex flex-col justify-between space-y-4 order-2 lg:order-1">
                            <div className="space-y-3">
                              <div className="flex items-center gap-3">
                                <span className="text-2xl font-black text-[#9F062A] font-mono">02</span>
                                <div className="h-0.5 w-12 group-hover:w-24 bg-amber-400 transition-all duration-500" />
                                <span className="text-[11px] font-extrabold text-slate-500 uppercase tracking-wider font-mono">TITULACIÓN DIRECTA</span>
                              </div>
                              <h4 className="text-xl font-black text-slate-900 uppercase tracking-tight hidden lg:block">
                                CONTABILIDAD FINANCIERA
                              </h4>
                              <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                                Domina el control tributario y financiero de acuerdo a las Normas Internacionales de Información Financiera (NIIF), auditoría tributaria en PyMEs, costos de producción y sistematización contable con software ERP moderno.
                              </p>
                            </div>

                            {/* Métricas Horizontales Limpias */}
                            <div className="py-2.5 border-y border-slate-200/80 grid grid-cols-3 gap-2 text-center">
                              <div>
                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono block">ARANCEL</span>
                                <span className="text-sm font-black text-[#9F062A]">S/ 0.00</span>
                              </div>
                              <div className="border-x border-slate-200/80 px-2">
                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono block">DURACIÓN</span>
                                <span className="text-sm font-black text-slate-900">3 Años</span>
                              </div>
                              <div>
                                <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider font-mono block">HORAS</span>
                                <span className="text-sm font-black text-slate-900">3,040 Hrs</span>
                              </div>
                            </div>

                            {/* Botón de Acción */}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedProgramId("contabilidad");
                                setProgramSelection("contabilidad");
                                setCurrentTab("programas");
                                window.scrollTo({ top: 0, behavior: "smooth" });
                              }}
                              className="w-full py-3 px-5 bg-[#9F062A] hover:bg-[#800521] text-white font-extrabold rounded-2xl text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer shadow-md group-hover:shadow-lg active:scale-98"
                            >
                              <span>VER MALLA CURRICULAR Y CURSOS</span>
                              <ArrowRight className="w-4 h-4 text-amber-300 transition-transform duration-300 group-hover:translate-x-1.5" />
                            </button>
                          </div>

                          {/* Columna Imagen (Derecha) - Cuadrada / Rectangular Flush */}
                          <div className="lg:col-span-5 relative overflow-hidden bg-slate-900 min-h-[220px] lg:min-h-full order-1 lg:order-2">
                            <img
                              src={careersDetail[1].image}
                              alt={careersDetail[1].name}
                              className="w-full h-full object-cover rounded-none transition-transform duration-700 ease-out group-hover:scale-108"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent" />
                            <div className="absolute top-0 left-0 bg-slate-950/90 text-amber-300 font-mono text-[10px] font-extrabold uppercase tracking-wider px-3.5 py-1.5 border-b border-r border-amber-400/40 rounded-br-xl shadow-md">
                              ● LICENCIAMIENTO MINEDU
                            </div>
                            <div className="absolute bottom-3 left-4 text-white">
                              <span className="text-[10px] font-extrabold font-mono text-amber-300 uppercase tracking-widest block">ESPECIALIDAD 02</span>
                              <h4 className="text-lg font-black uppercase tracking-tight text-white drop-shadow-md">
                                CONTABILIDAD FINANCIERA
                              </h4>
                            </div>
                            <div className="absolute bottom-0 left-0 h-1 w-0 group-hover:w-full bg-gradient-to-r from-amber-400 via-[#9F062A] to-amber-400 transition-all duration-500" />
                          </div>
                        </div>
                      </div>

                    </div>
                  </div>
                </section>

                {/* 6. PASO A PASO DEL PROCESO DE ADMISIÓN (DISEÑO ESCALONADO TIPO ESCALERA) */}
                <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 via-white to-slate-50 border-t border-slate-200 overflow-hidden">
                  <div className="max-w-7xl mx-auto space-y-16">
                    <div className="text-center max-w-3xl mx-auto space-y-3">
                      <span className="text-[#9F062A] font-extrabold text-xs uppercase tracking-widest block font-mono">
                        PROCESO ORDINARIO DE ADMISIÓN 2026-I
                      </span>
                      <h3 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase tracking-tight">
                        Pasos para la Inscripción
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed">
                        Sigue esta secuencia escalonada de 4 pasos para completar tu pre-inscripción y asegurar tu vacante institucional.
                      </p>
                    </div>

                    {/* Contenedor Escalonado tipo Escalera */}
                    <div className="relative pt-6 pb-12">

                      {/* Línea Conectora en Escalera (Escritorio) */}
                      <div className="hidden lg:block absolute bottom-12 left-16 right-16 h-1 bg-gradient-to-r from-[#9F062A] via-[#800521] to-[#CFA020] z-0 rounded-full opacity-30" />

                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-6 relative z-10 items-end">
                        {[
                          {
                            step: "01",
                            title: "Pre-Inscripción Virtual",
                            desc: "Registra tus datos personales en el formulario web para obtener tu Código Oficial de Postulante.",
                            icon: <CheckSquare className="w-6 h-6 text-[#9F062A]" />,
                            stairClass: "lg:translate-y-12"
                          },
                          {
                            step: "02",
                            title: "Pago de Tasa Ordinaria",
                            desc: "Abona S/. 120 por derecho de examen en las agencias o agentes del Banco de la Nación.",
                            icon: <Landmark className="w-6 h-6 text-[#9F062A]" />,
                            stairClass: "lg:translate-y-8"
                          },
                          {
                            step: "03",
                            title: "Examen de Admisión",
                            desc: "Rinde la evaluación presencial de aptitud académica y conocimientos en nuestro campus.",
                            icon: <FileText className="w-6 h-6 text-[#9F062A]" />,
                            stairClass: "lg:translate-y-4"
                          },
                          {
                            step: "04",
                            title: "Adjudicación y Matrícula",
                            desc: "Con tu vacante obtenida, formaliza tu matrícula semestral e inicia tus clases profesionales.",
                            icon: <GraduationCap className="w-6 h-6 text-[#9F062A]" />,
                            stairClass: "lg:translate-y-0"
                          }
                        ].map((st, idx) => (
                          <div
                            key={idx}
                            className={`bg-white border-2 border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-sm hover:border-[#9F062A] hover:shadow-xl transition-all duration-300 flex flex-col justify-between relative group ${st.stairClass}`}
                          >
                            <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                <div className="w-12 h-12 rounded-xl bg-amber-50 text-[#9F062A] flex items-center justify-center border border-amber-200/60 shadow-2xs group-hover:scale-105 transition-transform">
                                  {st.icon}
                                </div>
                                <span className="w-8 h-8 rounded-full bg-[#800521] text-amber-300 font-mono font-black text-xs flex items-center justify-center border border-amber-400/40 shadow-xs">
                                  {st.step}
                                </span>
                              </div>

                              <div>
                                <h4 className="text-base font-black text-slate-900 uppercase tracking-tight">{st.title}</h4>
                                <p className="text-xs text-slate-600 font-medium leading-relaxed mt-1.5">{st.desc}</p>
                              </div>
                            </div>

                            <div className="pt-4 border-t border-slate-100 flex items-center justify-end">
                              <div className="w-8 h-8 rounded-full bg-slate-100 group-hover:bg-[#9F062A] group-hover:text-white transition-all flex items-center justify-center text-slate-500 shadow-2xs">
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* PREGUNTAS FRECUENTES (LAYOUT 2 COLUMNAS: 4 IZQUIERDA Y 4 DERECHA CON ANIMACIÓN SUAVE) */}
                <section className="bg-slate-50 border-t border-slate-200 py-16 px-4">
                  <div className="max-w-6xl mx-auto space-y-10">
                    <div className="text-center">
                      <span className="text-[#9F062A] font-extrabold text-xs uppercase tracking-widest block font-mono">RESOLVEMOS TUS DUDAS</span>
                      <h3 className="text-2xl sm:text-4xl font-black mt-1 text-slate-900 uppercase tracking-tight">Preguntas Frecuentes</h3>
                      <p className="text-xs text-slate-500 font-medium mt-1">Encuentra respuestas inmediatas sobre el proceso de admisión y vida académica</p>
                    </div>

                    {/* Grid de 2 Columnas (4 en la izquierda, 4 en la derecha) */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 lg:gap-6 items-start">
                      {[
                        faqsList.slice(0, 4),
                        faqsList.slice(4, 8)
                      ].map((faqCol, colIdx) => (
                        <div key={colIdx} className="space-y-3">
                          {faqCol.map((faq) => {
                            const isOpen = expandedFaqId === faq.id;
                            return (
                              <div
                                key={faq.id}
                                className={`bg-white border rounded-xl overflow-hidden transition-all duration-300 ${isOpen ? "border-[#9F062A] shadow-md ring-1 ring-[#9F062A]/20 bg-rose-50/10" : "border-slate-200 hover:border-slate-300 hover:shadow-xs"}`}
                              >
                                <button
                                  onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                                  className="w-full text-left p-4.5 text-xs sm:text-[13px] font-black text-slate-900 uppercase flex items-center justify-between gap-3 cursor-pointer select-none"
                                >
                                  <span className="leading-snug">{faq.question}</span>
                                  <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300 ${isOpen ? "bg-[#9F062A] text-amber-300" : "bg-slate-100 text-slate-500"}`}>
                                    <ChevronDown className={`w-4 h-4 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
                                  </div>
                                </button>

                                <div
                                  className={`transition-all duration-300 ease-in-out overflow-hidden ${isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"}`}
                                >
                                  <div className="px-4.5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 font-medium">
                                    {faq.answer}
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </section>

              </div>
            )}

            {/* ================= PROGRAMAS VIEW (DETALLE COMPLETO DE CURSOS POR CICLO I AL VI) ================= */}
            {currentTab === "programas" && (
              <div className="bg-slate-50 py-16 px-4 min-h-screen">
                <div className="max-w-7xl mx-auto space-y-12">

                  <div className="text-center max-w-3xl mx-auto">
                    <span className="text-[#9F062A] font-extrabold text-xs uppercase tracking-widest block font-mono">MALLA CURRICULAR Y PLANES DE ESTUDIO</span>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase mt-1">Programas de Estudio Licenciados</h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2 leading-relaxed">
                      Conoce en detalle el plan modular por ciclos académicos, la carga horaria y las competencias profesionales de cada especialidad.
                    </p>
                  </div>

                  {/* Selector de Carrera */}
                  <div className="flex justify-center items-center gap-3 flex-wrap">
                    {careersDetail.map((c) => {
                      const isActive = selectedProgramId === c.id;
                      return (
                        <button
                          key={c.id}
                          onClick={() => setSelectedProgramId(c.id)}
                          className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-2.5 ${isActive ? "bg-[#9F062A] text-white border-[#9F062A] shadow-md" : "bg-white text-slate-700 border-slate-200 hover:bg-rose-50 hover:text-[#9F062A]"}`}
                        >
                          {React.cloneElement(c.icon as React.ReactElement, {
                            className: `w-5 h-5 ${isActive ? "text-amber-300" : "text-[#9F062A]"}`
                          })}
                          <span>{c.name}</span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Detalle Completo de la Carrera Seleccionada */}
                  <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs space-y-10 max-w-5xl mx-auto">

                    {/* Cabecera del Programa */}
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
                      <div className="flex items-center gap-4">
                        <img src={activeCareer.image} alt={activeCareer.name} className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-xs" />
                        <div>
                          <span className="text-xs font-bold text-slate-600 inline-flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-[#9F062A]" />
                            <span>{activeCareer.hours}</span>
                          </span>
                          <h3 className="text-2xl font-black text-slate-900 uppercase mt-2">{activeCareer.name}</h3>
                          <span className="text-xs text-slate-500 font-bold block mt-0.5">{activeCareer.title}</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-start md:items-end gap-2 shrink-0">
                        <span className="text-[10px] uppercase font-bold text-slate-400">Proyección Salarial Promedio:</span>
                        <span className="text-emerald-700 font-black text-base bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                          {activeCareer.salaryEst}
                        </span>
                      </div>
                    </div>

                    {/* Perfil del Egresado */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-black uppercase tracking-wider text-[#9F062A] flex items-center gap-2">
                        <UserCheck className="w-4 h-4" />
                        Perfil Profesional del Egresado
                      </h4>
                      <p className="text-xs sm:text-sm text-slate-700 font-medium leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-200">
                        {activeCareer.profile}
                      </p>
                    </div>

                    {/* Malla Curricular Detallada: Ciclo I al VI (Camino de Ciclos Conectado, Sin MODULAR) */}
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                        <h4 className="text-xs font-black uppercase tracking-wider text-[#9F062A] flex items-center gap-2">
                          <Layers className="w-4 h-4 text-[#9F062A]" />
                          Ruta Formativa de Plan de Estudios (Ciclo I al VI)
                        </h4>
                        <span className="text-[11px] font-bold text-slate-500 font-mono">
                          6 Semestres Académicos • 3 Años de Formación
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {activeCareer.careerPath.map((cp, idx) => (
                          <div
                            key={idx}
                            className="bg-white border-2 border-slate-200/90 rounded-2xl p-5 space-y-4 shadow-2xs hover:border-[#9F062A] hover:shadow-md transition-all relative group flex flex-col justify-between"
                          >
                            <div className="space-y-3">
                              <div className="flex items-center justify-between border-b border-slate-100 pb-2.5">
                                <div className="flex items-center gap-2">
                                  <span className="w-6 h-6 rounded-full bg-[#800521] text-amber-300 text-[10.5px] font-mono font-black flex items-center justify-center shadow-xs">
                                    0{idx + 1}
                                  </span>
                                  <span className="text-xs font-black text-slate-900 uppercase tracking-wide">
                                    {cp.cycle}
                                  </span>
                                </div>
                                <span className="text-[10px] font-extrabold text-[#9F062A] bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 font-mono">
                                  Semestre {idx + 1}
                                </span>
                              </div>

                              <ul className="space-y-2 text-xs text-slate-700 font-semibold pt-1">
                                {cp.courses.map((course, cIdx) => (
                                  <li key={cIdx} className="flex items-start gap-2">
                                    <span className="w-1.5 h-1.5 rounded-full bg-[#9F062A] shrink-0 mt-1.5 group-hover:scale-125 transition-transform" />
                                    <span className="leading-snug">{course}</span>
                                  </li>
                                ))}
                              </ul>
                            </div>

                            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold text-slate-400 uppercase font-mono">
                              <span></span>
                              {idx < 5 ? (
                                <span className="text-[#9F062A] flex items-center gap-1 font-bold">
                                  Siguiente <ArrowRight className="w-3 h-3" />
                                </span>
                              ) : (
                                <span className="text-emerald-700 font-black">
                                  Titulación Oficial ✓
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Botón de Postulación a la Carrera */}
                    <div className="pt-4 border-t border-slate-200 text-center">
                      <button
                        onClick={() => {
                          setProgramSelection(activeCareer.id);
                          setCurrentTab("admision");
                          setSubmitSuccessMsg("");
                          setTimeout(() => {
                            window.scrollTo({ top: 0, behavior: "smooth" });
                            const el = document.getElementById("admision-form");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }, 50);
                        }}
                        className="py-4 px-8 bg-[#9F062A] hover:bg-[#800521] text-white font-extrabold rounded-xl text-xs uppercase tracking-widest shadow-md transition-all inline-flex items-center gap-2 cursor-pointer active:scale-95"
                      >
                        <span>Postular a {activeCareer.name}</span>
                        <ArrowRight className="w-4 h-4 text-amber-300" />
                      </button>
                    </div>

                  </div>

                </div>
              </div>
            )}

            {/* ================= NOSOTROS VIEW (INCLUYE AUTORIDADES Y PLANA DIRECTIVA EN ORGANIGRAMA) ================= */}
            {currentTab === "nosotros" && (
              <div className="bg-slate-50 py-12 sm:py-16 px-4 min-h-screen">
                <div className="max-w-6xl mx-auto space-y-12">

                  {/* 1. Header Banner Institucional con Imagen Real de Facachada del Campus */}
                  <div className="bg-gradient-to-r from-[#800521] via-[#9F062A] to-slate-900 rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-lg border border-red-950">
                    {/* Imagen Institucional de la Fachada Real con Fundido Total Continuo */}
                    <div className="absolute inset-0 w-full h-full opacity-40 sm:opacity-55 pointer-events-none overflow-hidden">
                      <img
                        src="/campus_facade_sfa.jpg"
                        alt="Fachada Principal IESTP San Francisco de Asís"
                        className="w-full h-full object-cover object-right"
                      />
                      <div className="absolute inset-0 bg-gradient-to-r from-[#630217] via-[#800521]/95 via-45% to-transparent" />
                    </div>

                    <div className="relative z-10 max-w-xl space-y-4">
                      <span className="bg-slate-900/90 text-amber-300 text-[11px] font-mono font-black uppercase tracking-widest px-4 py-1.5 rounded-lg border border-amber-400/30 inline-flex items-center gap-2 shadow-xs">
                        <Award className="w-3.5 h-3.5 text-amber-300" />
                        <span>INSTITUCIÓN PÚBLICA LICENCIADA • R.M. 124-2021</span>
                      </span>
                      <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight">
                        Nuestra Identidad e Historia
                      </h2>
                      <p className="text-xs sm:text-sm text-rose-100 font-medium leading-relaxed">
                        El Instituto de Educación Superior Tecnológico Público San Francisco de Asís lidera la formación técnica profesional gratuita en Villa María del Triunfo y Lima Sur, formando líderes capacitados con ética, innovación y visión de futuro para transformar el país.
                      </p>
                    </div>
                  </div>

                  {/* 2. Misión y Visión */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    <div className="bg-white border border-slate-200 p-8 rounded-2xl space-y-4 shadow-xs relative overflow-hidden group hover:border-[#9F062A] transition-colors">
                      <div className="w-2 h-full bg-[#9F062A] absolute top-0 left-0" />
                      <div className="w-12 h-12 bg-rose-50 text-[#9F062A] rounded-xl flex items-center justify-center border border-rose-100">
                        <Award className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-wide">Nuestra Misión</h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        Somos un Instituto de Educación Superior Tecnológico Público que forma profesionales técnicos competitivos, con pensamiento crítico, valores éticos e innovación tecnológica, capaces de responder a las exigencias del mercado laboral y contribuir al desarrollo socioeconómico del Perú.
                      </p>
                    </div>

                    <div className="bg-white border border-slate-200 p-8 rounded-2xl space-y-4 shadow-xs relative overflow-hidden group hover:border-[#CFA020] transition-colors">
                      <div className="w-2 h-full bg-[#CFA020] absolute top-0 left-0" />
                      <div className="w-12 h-12 bg-amber-50 text-[#CFA020] rounded-xl flex items-center justify-center border border-amber-100">
                        <Compass className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-black text-slate-900 uppercase tracking-wide">Nuestra Visión</h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                        Ser un Instituto de Educación Superior Tecnológico Público referente en Lima Metropolitana, acreditado y reconocido por su excelencia académica, calidad educativa, infraestructura moderna y alto nivel de empleabilidad de sus egresados.
                      </p>
                    </div>

                  </div>

                  {/* 3. Carrusel Interactivo de Valores Institucionales (Tarjeta Central Destacada y Centrada) */}
                  <div className="bg-white border border-slate-200 rounded-3xl p-8 sm:p-10 shadow-xs space-y-8">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-100 pb-4">
                      <div className="text-center sm:text-left">
                        <span className="text-[#9F062A] font-black text-xs uppercase tracking-widest font-mono">PRINCIPIOS FUNDAMENTALES</span>
                        <h3 className="text-2xl font-black text-slate-900 uppercase mt-0.5">Valores Institucionales</h3>
                      </div>

                      {/* Botones de Navegación del Carrusel */}
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setCurrentValueIdx((prev) => (prev === 0 ? 4 : prev - 1))}
                          className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 hover:bg-[#9F062A] hover:text-white hover:border-[#9F062A] transition-colors flex items-center justify-center cursor-pointer text-slate-700 shadow-2xs active:scale-95"
                          aria-label="Anterior Valor"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => setCurrentValueIdx((prev) => (prev === 4 ? 0 : prev + 1))}
                          className="w-10 h-10 rounded-full border border-slate-200 bg-slate-50 hover:bg-[#9F062A] hover:text-white hover:border-[#9F062A] transition-colors flex items-center justify-center cursor-pointer text-slate-700 shadow-2xs active:scale-95"
                          aria-label="Siguiente Valor"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>
                    </div>

                    {/* Tarjetas del Carrusel de Valores (Central Destacada, Grande y Centrada) */}
                    {(() => {
                      const valuesList = [
                        {
                          title: "Excelencia Académica",
                          subtitle: "Calidad Formativa de Nivel Superior",
                          desc: "Rigurosidad en el aprendizaje práctico, actualización tecnológica constante y desarrollo de competencias profesionales alineadas a las demandas reales del mercado laboral peruano.",
                          icon: <CheckCircle2 className="w-8 h-8 text-[#9F062A]" />
                        },
                        {
                          title: "Ética y Deontología",
                          subtitle: "Integridad y Transparencia",
                          desc: "Formación integral sustentada en valores humanos, honestidad profesional, transparencia en la gestión académica y un compromiso indestructible con la comunidad estudiantil.",
                          icon: <ShieldCheck className="w-8 h-8 text-[#9F062A]" />
                        },
                        {
                          title: "Innovación Tecnológica",
                          subtitle: "Equipamiento Industrial Moderno",
                          desc: "Uso de laboratorios equipados con tecnología industrial avanzada, simuladores ERP de última generación, módulos PLC automatizados y plataformas digitales completas.",
                          icon: <Zap className="w-8 h-8 text-[#9F062A]" />
                        },
                        {
                          title: "Inclusión y Equidad",
                          subtitle: "Educación Superior Gratuita y Abierta",
                          desc: "Garantizamos el derecho universal a la educación técnica profesional de calidad sin pensiones mensuales (S/. 0.00) ni barreras económicas en Villa María del Triunfo.",
                          icon: <Users className="w-8 h-8 text-[#9F062A]" />
                        },
                        {
                          title: "Compromiso Social",
                          subtitle: "Transformación Socioeconómica",
                          desc: "Alianzas estratégicas con empresas e instituciones para impulsar proyectos de investigación aplicada, prácticas pre-profesionales y alta tasa de empleabilidad.",
                          icon: <HeartHandshake className="w-8 h-8 text-[#9F062A]" />
                        }
                      ];

                      const total = valuesList.length;
                      const activeIdx = currentValueIdx % total;
                      const leftIdx = (activeIdx + total - 1) % total;
                      const rightIdx = (activeIdx + 1) % total;

                      const leftVal = valuesList[leftIdx];
                      const centerVal = valuesList[activeIdx];
                      const rightVal = valuesList[rightIdx];

                      return (
                        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center py-4">

                          {/* Tarjeta Izquierda (Secundaria) */}
                          <div
                            onClick={() => setCurrentValueIdx(leftIdx)}
                            className="hidden lg:flex lg:col-span-3 bg-slate-50 border border-slate-200 p-5 rounded-2xl flex-col items-center justify-center text-center opacity-70 hover:opacity-100 hover:border-[#9F062A] transition-all cursor-pointer scale-95 space-y-2 select-none shadow-2xs"
                          >
                            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                              {leftVal.icon}
                            </div>
                            <h4 className="text-sm font-black text-slate-800 uppercase leading-snug">{leftVal.title}</h4>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase block">{leftVal.subtitle}</span>
                          </div>

                          {/* Tarjeta Central (MUCHO MÁS GRANDE Y CENTRADA) */}
                          <div className="lg:col-span-6 bg-gradient-to-b from-white to-rose-50/30 border-2 border-[#9F062A] p-8 sm:p-10 rounded-3xl flex flex-col items-center justify-center text-center shadow-xl z-10 space-y-4 scale-100 sm:scale-105 transition-all">
                            <div className="w-16 h-16 bg-rose-100/80 rounded-2xl flex items-center justify-center border-2 border-rose-200 shadow-xs">
                              {centerVal.icon}
                            </div>
                            <div className="space-y-1">
                              <h4 className="text-xl sm:text-2xl font-black text-slate-900 uppercase tracking-tight">{centerVal.title}</h4>
                              <span className="text-xs font-extrabold text-[#9F062A] tracking-wider uppercase block">{centerVal.subtitle}</span>
                            </div>
                            <p className="text-xs sm:text-sm text-slate-600 font-medium leading-relaxed max-w-lg">
                              {centerVal.desc}
                            </p>
                          </div>

                          {/* Tarjeta Derecha (Secundaria) */}
                          <div
                            onClick={() => setCurrentValueIdx(rightIdx)}
                            className="hidden lg:flex lg:col-span-3 bg-slate-50 border border-slate-200 p-5 rounded-2xl flex-col items-center justify-center text-center opacity-70 hover:opacity-100 hover:border-[#9F062A] transition-all cursor-pointer scale-95 space-y-2 select-none shadow-2xs"
                          >
                            <div className="p-2.5 bg-white rounded-xl border border-slate-200">
                              {rightVal.icon}
                            </div>
                            <h4 className="text-sm font-black text-slate-800 uppercase leading-snug">{rightVal.title}</h4>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase block">{rightVal.subtitle}</span>
                          </div>

                        </div>
                      );
                    })()}

                    {/* Indicadores de Paginación del Carrusel */}
                    <div className="flex justify-center items-center gap-2 pt-2">
                      {[0, 1, 2, 3, 4].map((idx) => (
                        <button
                          key={idx}
                          onClick={() => setCurrentValueIdx(idx)}
                          className={`h-2.5 rounded-full transition-all cursor-pointer ${currentValueIdx % 5 === idx ? "w-9 bg-[#9F062A]" : "w-2.5 bg-slate-200 hover:bg-slate-300"}`}
                          aria-label={`Ver valor ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* 4. Organigrama Institucional Gráfico en Árbol Jerárquico (Fidelidad de Referencia) */}
                  <div id="organigrama-section" className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-10 shadow-xs space-y-8 overflow-x-auto scroll-mt-24">

                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 border-b border-slate-100 pb-6">
                      <div>
                        <span className="bg-[#9F062A] text-white text-[10px] font-mono font-bold px-3 py-1 rounded-md uppercase tracking-wider inline-block mb-1">
                          ORGANIGRAMA INSTITUCIONAL 2026
                        </span>
                        <h3 className="text-2xl font-black text-slate-900 uppercase">Estructura Organizacional Oficial</h3>
                        <p className="text-xs text-slate-500 font-medium">Plana directiva y jerarquía académica del IESTP San Francisco de Asís</p>
                      </div>

                      <button
                        onClick={() => window.print()}
                        className="py-2.5 px-4 bg-slate-900 hover:bg-[#9F062A] text-white font-extrabold text-xs rounded-xl uppercase tracking-wider transition-colors flex items-center gap-2 cursor-pointer shadow-xs shrink-0"
                      >
                        <Download className="w-4 h-4 text-amber-400" />
                        <span>Descargar Organigrama</span>
                      </button>
                    </div>

                    {/* Estructura Jerárquica del Árbol de Organigrama */}
                    <div className="min-w-[900px] pt-4 pb-8 space-y-8">

                      {/* NIVEL 1: ALTA DIRECCIÓN (DIRECTOR GENERAL) */}
                      <div className="flex justify-center">
                        <div className="w-64 bg-gradient-to-r from-[#9F062A] to-[#800521] text-white rounded-xl p-4 text-center shadow-lg border border-amber-400/40 relative z-20">
                          <span className="text-[10px] font-mono font-black text-amber-300 uppercase tracking-widest block">DIRECCIÓN GENERAL</span>
                          <h4 className="text-base font-black uppercase mt-0.5 text-white">Lic. Manuel Ramos</h4>
                          <span className="text-[10.5px] text-rose-100 font-medium block mt-0.5">Director General</span>
                        </div>
                      </div>

                      {/* LÍNEA DE CONEXIÓN ORTOGONAL DESDE NIVEL 1 A RAMA DE NIVEL 2 */}
                      <div className="relative z-10">
                        {/* T-Line Vertical desde Nivel 1 */}
                        <div className="w-0.5 h-6 bg-slate-400 mx-auto" />

                        {/* Barra Horizontal Conectora Nivel 2 (de la 1º columna a la 4º columna) */}
                        <div className="w-[78%] h-0.5 bg-slate-400 mx-auto" />
                      </div>

                      {/* NIVEL 2 Y 3: 4 COLUMNAS CON SUS RESPECTIVAS RAMAS DEPARTAMENTALES */}
                      <div className="grid grid-cols-4 gap-4 relative z-20 pt-1">
                        {[
                          {
                            headRole: "SUB-DIRECCIÓN ACADÉMICA",
                            headName: "Mg. Rosa Elvira Huamán",
                            color: "bg-slate-800 text-white border-slate-700",
                            items: [
                              { title: "Coordinación Electricidad", name: "Ing. Jorge Toledo" },
                              { title: "Coordinación Contabilidad", name: "Lic. Elena Morales" },
                              { title: "Unidad de Investigación", name: "Ing. Luis Castillo" }
                            ]
                          },
                          {
                            headRole: "SECRETARÍA ACADÉMICA",
                            headName: "Ing. Carlos Mendoza",
                            color: "bg-slate-800 text-white border-slate-700",
                            items: [
                              { title: "Registro y Matrículas", name: "Lic. Carmen Vargas" },
                              { title: "Certificación y Titulación", name: "Lic. Roberto Soto" },
                              { title: "Trámite Documentario", name: "Sra. Ana Gutiérrez" }
                            ]
                          },
                          {
                            headRole: "UNIDAD ADMINISTRATIVA",
                            headName: "Lic. Fernando Castro",
                            color: "bg-slate-800 text-white border-slate-700",
                            items: [
                              { title: "Tesorería y Caja", name: "CPC. Maria Fernández" },
                              { title: "Recursos Humanos", name: "Lic. Javier Paredes" },
                              { title: "Servicios Generales", name: "Sr. Pedro Morales" }
                            ]
                          },
                          {
                            headRole: "COORDINACIÓN ÁREAS TÉCNICAS",
                            headName: "Ing. Patricia Alva",
                            color: "bg-slate-800 text-white border-slate-700",
                            items: [
                              { title: "Taller de Potencia PLC", name: "Ing. Víctor Ramos" },
                              { title: "Laboratorio ERP Contable", name: "CPC. Daniel Ríos" },
                              { title: "Prácticas EFSRT", name: "Mg. Gloria Silva" }
                            ]
                          }
                        ].map((col, cIdx) => (
                          <div key={cIdx} className="space-y-4 flex flex-col items-center">

                            {/* Conector vertical individual bajando de la barra horizontal */}
                            <div className="w-0.5 h-4 bg-slate-400 -mt-5" />

                            {/* Cabeza del Departamento (Nivel 2) */}
                            <div className={`w-full ${col.color} rounded-xl p-3.5 text-center shadow-md border space-y-0.5`}>
                              <span className="text-[9.5px] font-mono font-bold text-amber-300 uppercase tracking-wide block">{col.headRole}</span>
                              <h5 className="text-xs font-black uppercase text-white leading-tight">{col.headName}</h5>
                            </div>

                            {/* Rama Vertical de Sub-Unidades (Nivel 3 con L-connector lines) */}
                            <div className="w-full space-y-2.5 pl-3 border-l-2 border-slate-300">
                              {col.items.map((sub, sIdx) => (
                                <div
                                  key={sIdx}
                                  className="bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-left shadow-2xs hover:border-[#9F062A] hover:bg-white transition-all space-y-0.5 relative"
                                >
                                  {/* L-connector line desde el eje vertical izquierdo */}
                                  <div className="w-3 h-0.5 bg-slate-300 absolute -left-3 top-1/2 -translate-y-1/2" />

                                  <span className="text-[9px] font-bold text-slate-500 uppercase font-mono block leading-none">{sub.title}</span>
                                  <h6 className="text-[11px] font-black text-slate-900 uppercase leading-snug">{sub.name}</h6>
                                </div>
                              ))}
                            </div>

                          </div>
                        ))}
                      </div>

                    </div>

                  </div>

                </div>
              </div>
            )}

            {/* ================= ADMISIÓN VIEW ================= */}
            {currentTab === "admision" && (
              <div className="bg-slate-50 py-16 px-4 min-h-screen">
                <div className="max-w-7xl mx-auto space-y-10">

                  <div className="text-center max-w-3xl mx-auto">
                    <span className="text-[#9F062A] font-extrabold text-xs uppercase tracking-widest block font-mono">PROCESO ORDINARIO 2026-I</span>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase mt-1">Pre-Inscripción Virtual de Admisión</h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2 leading-relaxed">
                      Completa el formulario oficial para obtener tu Código de Postulante y registrar tus credenciales de acceso a la Intranet Académica.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                    {/* Lado Izquierdo: Tasas Ordinarias y Requisitos del Proceso */}
                    <div className="lg:col-span-5 space-y-6">

                      <div id="tasas-requisitos" className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4 scroll-mt-24">
                        <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                          <div className="p-2.5 bg-rose-50 text-[#9F062A] rounded-lg border border-rose-100">
                            <Landmark className="w-5 h-5" />
                          </div>
                          <div>
                            <h3 className="text-sm font-black text-slate-900 uppercase">Tasas Ordinarias de Admisión</h3>
                            <span className="text-[10px] text-slate-500 font-medium">Aranceles oficiales aprobados por la Dirección</span>
                          </div>
                        </div>

                        <div className="space-y-3 text-xs font-semibold">
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <span className="text-slate-700">Derecho de Examen de Admisión Ordinario</span>
                            <span className="text-[#9F062A] font-black text-sm">S/. 120.00</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg border border-slate-200">
                            <span className="text-slate-700">Matrícula Semestral Regular</span>
                            <span className="text-[#9F062A] font-black text-sm">S/. 250.00</span>
                          </div>
                          <div className="flex justify-between items-center p-3 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-200">
                            <span className="font-bold">Pensión Mensual de Enseñanza</span>
                            <span className="font-black text-sm text-emerald-700">S/. 0.00 (Gratuito)</span>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
                        <h3 className="text-sm font-black text-slate-900 uppercase border-b border-slate-100 pb-2 flex items-center gap-2">
                          <FileCheck className="w-4 h-4 text-[#9F062A]" />
                          Documentos Requeridos
                        </h3>
                        <ul className="space-y-2.5 text-xs text-slate-600 font-medium">
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>Copia simple de DNI vigente o Carné de Extranjería.</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>Certificado oficial de estudios de 5to de Secundaria (original o digital MINEDU).</span>
                          </li>
                          <li className="flex items-start gap-2">
                            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>Voucher original de pago por derecho de examen (Banco de la Nación).</span>
                          </li>
                        </ul>
                      </div>

                      <div className="bg-rose-50 border border-rose-200 p-5 rounded-xl text-xs space-y-2 text-rose-950">
                        <span className="font-extrabold uppercase text-[#9F062A] block">¿Necesitas ayuda con tu inscripción?</span>
                        <p className="font-medium leading-relaxed text-slate-700">
                          Comunícate con la Secretaría de Admisión llamando al <strong>01 500 6177</strong> o escribiendo a <strong>admision@iestpsfa.edu.pe</strong>.
                        </p>
                      </div>

                    </div>

                    {/* Lado Derecho: Formulario Oficial de Pre-Inscripción */}
                    <div id="admision-form" className="lg:col-span-7 scroll-mt-24">
                      <div className="bg-white border-2 border-slate-200 p-6 sm:p-8 rounded-2xl shadow-md">

                        <div className="border-b border-slate-200 pb-4 mb-5 flex justify-between items-center">
                          <div>
                            <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Formulario de Inscripción Virtual</h3>
                            <p className="text-xs text-slate-500 font-medium mt-0.5">Ingresa tus datos completos tal como figuran en tu DNI.</p>
                          </div>
                          <span className="bg-[#9F062A] text-white text-[10px] font-mono font-bold px-3 py-1 rounded-md uppercase">
                            ADMISIÓN 2026-I
                          </span>
                        </div>

                        {submitSuccessMsg ? (
                          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-6 rounded-xl text-xs space-y-4">
                            <div className="flex items-start gap-3">
                              <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                              <p className="font-semibold text-sm leading-relaxed">{submitSuccessMsg}</p>
                            </div>
                            <button
                              onClick={() => setSubmitSuccessMsg("")}
                              className="w-full py-3 bg-emerald-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider"
                            >
                              Realizar Otra Inscripción
                            </button>
                          </div>
                        ) : (
                          <form onSubmit={handlePreEnrollmentSubmit} className="space-y-4">

                            {/* DNI y Programa al que Postula en la misma fila */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-bold uppercase text-slate-700 block mb-1">DNI del Postulante *</label>
                                <input
                                  type="text"
                                  maxLength={8}
                                  required
                                  placeholder="Ingrese 8 dígitos de su DNI"
                                  value={dniInput}
                                  onChange={(e) => setDniInput(e.target.value.replace(/\D/g, ""))}
                                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#9F062A] rounded-lg px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none font-medium"
                                />
                              </div>

                              <div>
                                <label className="text-xs font-bold uppercase text-slate-700 block mb-1">Programa al que Postula *</label>
                                <select
                                  value={programSelection}
                                  onChange={(e) => setProgramSelection(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#9F062A] rounded-lg px-4 py-3 text-xs text-slate-900 outline-none font-medium cursor-pointer"
                                >
                                  <option value="electronica">Electricidad Industrial</option>
                                  <option value="contabilidad">Contabilidad Financiera</option>
                                </select>
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-bold uppercase text-slate-700 block mb-1">Nombres *</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="Sus Nombres completos"
                                  value={nameInput}
                                  onChange={(e) => setNameInput(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#9F062A] rounded-lg px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none font-medium"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold uppercase text-slate-700 block mb-1">Apellidos *</label>
                                <input
                                  type="text"
                                  required
                                  placeholder="Sus Apellidos completos"
                                  value={lastNameInput}
                                  onChange={(e) => setLastNameInput(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#9F062A] rounded-lg px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none font-medium"
                                />
                              </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              <div>
                                <label className="text-xs font-bold uppercase text-slate-700 block mb-1">Correo Electrónico *</label>
                                <input
                                  type="email"
                                  required
                                  placeholder="correo@ejemplo.com"
                                  value={emailInput}
                                  onChange={(e) => setEmailInput(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#9F062A] rounded-lg px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none font-medium"
                                />
                              </div>
                              <div>
                                <label className="text-xs font-bold uppercase text-slate-700 block mb-1">Teléfono / Celular *</label>
                                <input
                                  type="tel"
                                  required
                                  placeholder="987654321"
                                  value={phoneInput}
                                  onChange={(e) => setPhoneInput(e.target.value)}
                                  className="w-full bg-slate-50 border border-slate-300 focus:border-[#9F062A] rounded-lg px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none font-medium"
                                />
                              </div>
                            </div>

                            <button
                              type="submit"
                              disabled={isSubmittingForm}
                              className="w-full mt-4 py-3.5 bg-[#9F062A] hover:bg-[#800521] text-white font-extrabold rounded-lg text-xs uppercase tracking-wider shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-95"
                            >
                              {isSubmittingForm ? (
                                <>
                                  <Loader2 className="w-5 h-5 animate-spin text-amber-300" />
                                  <span>Registrando en Sistema...</span>
                                </>
                              ) : (
                                <>
                                  <Send className="w-5 h-5 text-amber-300" />
                                  <span>Completar Registro de Pre-Inscripción</span>
                                </>
                              )}
                            </button>

                            <p className="text-[10px] text-slate-500 text-center font-medium pt-2">
                              Al registrarte se generará tu Código de Postulante y se enviarán tus credenciales de la Intranet por correo electrónico.
                            </p>
                          </form>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* ================= CONTÁCTANOS VIEW ================= */}
            {currentTab === "contactanos" && (
              <div className="bg-slate-50 py-16 px-4 min-h-screen">
                <div className="max-w-7xl mx-auto space-y-10">

                  <div className="text-center max-w-3xl mx-auto">
                    <span className="text-[#9F062A] font-extrabold text-xs uppercase tracking-widest block font-mono">MESA DE PARTES Y SECRETARÍA</span>
                    <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase mt-1">Canales de Atención Institucional</h2>
                    <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2 leading-relaxed">
                      Estamos a tu disposición para resolver consultas sobre admisión, trámites documentarios, traslados e información académica.
                    </p>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">

                    <div className="lg:col-span-5 space-y-4">

                      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex items-start gap-4">
                        <div className="p-3 bg-rose-50 text-[#9F062A] rounded-lg shrink-0 border border-rose-100">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black text-slate-900 uppercase">Ubicación del Campus</h3>
                          <p className="text-xs text-slate-600 font-medium mt-1">Av. Pachacútec Cdra. 50, Villa María del Triunfo, Lima - Perú.</p>
                          <span className="text-[10px] text-slate-400 font-semibold block mt-1">Referencia: Altura del Paradero Pachacútec.</span>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex items-start gap-4">
                        <div className="p-3 bg-rose-50 text-[#9F062A] rounded-lg shrink-0 border border-rose-100">
                          <Phone className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black text-slate-900 uppercase">Central Telefónica</h3>
                          <p className="text-xs text-slate-600 font-bold mt-1">01 500 6177</p>
                          <span className="text-[10px] text-slate-500 font-medium block mt-1">Horario de atención: Lunes a Viernes de 8:00 am a 5:00 pm.</span>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex items-start gap-4">
                        <div className="p-3 bg-rose-50 text-[#9F062A] rounded-lg shrink-0 border border-rose-100">
                          <Mail className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black text-slate-900 uppercase">Mesa de Partes Virtual</h3>
                          <p className="text-xs text-[#9F062A] font-bold mt-1">admision@iestpsfa.edu.pe</p>
                          <span className="text-[10px] text-slate-500 font-medium block mt-1">Recepción de solicitudes de trámites y consultas.</span>
                        </div>
                      </div>

                      <div className="bg-white border border-slate-200 p-5 rounded-xl shadow-xs flex items-start gap-4">
                        <div className="p-3 bg-rose-50 text-[#9F062A] rounded-lg shrink-0 border border-rose-100">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div>
                          <h3 className="text-xs font-black text-slate-900 uppercase">Turnos Académicos</h3>
                          <p className="text-xs text-slate-600 font-medium mt-1">Turno Mañana: 8:00 am - 1:00 pm</p>
                          <p className="text-xs text-slate-600 font-medium">Turno Tarde: 1:00 pm - 6:00 pm</p>
                          <p className="text-xs text-slate-600 font-medium">Turno Noche: 6:00 pm - 10:00 pm</p>
                        </div>
                      </div>

                    </div>

                    <div className="lg:col-span-7">
                      <div className="bg-white border-2 border-slate-200 p-6 sm:p-8 rounded-2xl shadow-md">
                        <div className="border-b border-slate-200 pb-4 mb-5">
                          <h3 className="text-lg font-black text-slate-900 uppercase tracking-tight">Envío de Mensajes y Consultas</h3>
                          <p className="text-xs text-slate-500 font-medium mt-0.5">Escribe tu consulta y el área encargada te responderá a la brevedad.</p>
                        </div>

                        {contactSuccessMsg ? (
                          <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 p-5 rounded-xl text-xs space-y-3">
                            <div className="flex items-start gap-2.5">
                              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                              <p className="font-semibold leading-relaxed">{contactSuccessMsg}</p>
                            </div>
                            <button
                              onClick={() => setContactSuccessMsg("")}
                              className="w-full py-2.5 bg-emerald-700 text-white font-bold rounded-lg text-xs uppercase tracking-wider"
                            >
                              Enviar Otra Consulta
                            </button>
                          </div>
                        ) : (
                          <form onSubmit={handleContactSubmit} className="space-y-4">
                            <div>
                              <label className="text-xs font-bold uppercase text-slate-700 block mb-1">Nombre Completo *</label>
                              <input
                                type="text"
                                required
                                placeholder="Ingrese su nombre y apellido"
                                value={contactName}
                                onChange={(e) => setContactName(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 focus:border-[#9F062A] rounded-lg px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none font-medium"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-bold uppercase text-slate-700 block mb-1">Correo Electrónico *</label>
                              <input
                                type="email"
                                required
                                placeholder="correo@ejemplo.com"
                                value={contactEmail}
                                onChange={(e) => setContactEmail(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 focus:border-[#9F062A] rounded-lg px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none font-medium"
                              />
                            </div>

                            <div>
                              <label className="text-xs font-bold uppercase text-slate-700 block mb-1">Área o Tipo de Consulta *</label>
                              <select
                                value={contactSubject}
                                onChange={(e) => setContactSubject(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 focus:border-[#9F062A] rounded-lg px-4 py-3 text-xs text-slate-900 outline-none font-medium cursor-pointer"
                              >
                                <option value="admision">Información sobre Admisión 2026</option>
                                <option value="tramites">Trámites de Secretaría Académica</option>
                                <option value="traslados">Traslados y Convalidaciones</option>
                                <option value="otros">Otras Consultas Institucionales</option>
                              </select>
                            </div>

                            <div>
                              <label className="text-xs font-bold uppercase text-slate-700 block mb-1">Mensaje *</label>
                              <textarea
                                rows={4}
                                required
                                placeholder="Describa aquí su consulta detalladamente..."
                                value={contactMessage}
                                onChange={(e) => setContactMessage(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-300 focus:border-[#9F062A] rounded-lg px-4 py-3 text-xs text-slate-900 placeholder-slate-400 outline-none font-medium"
                              />
                            </div>

                            <button
                              type="submit"
                              className="w-full py-3.5 bg-[#9F062A] hover:bg-[#800521] text-white font-extrabold rounded-lg text-xs uppercase tracking-wider shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                            >
                              <Send className="w-4 h-4 text-amber-300" />
                              <span>Enviar Consulta a Secretaría Académica</span>
                            </button>
                          </form>
                        )}
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* ================= TRANSPARENCIA VIEW ================= */}
            {currentTab === "transparencia" && (
              <div className="max-w-7xl mx-auto py-16 px-4 space-y-12">
                <div className="text-center max-w-3xl mx-auto">
                  <span className="text-[#9F062A] font-extrabold text-xs uppercase tracking-widest block font-mono">PORTAL DE TRANSPARENCIA INSTITUCIONAL</span>
                  <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase mt-1">Reglamentos y Documentos Oficiales</h2>
                  <p className="text-xs sm:text-sm text-slate-600 font-medium mt-2 max-w-2xl mx-auto leading-relaxed">
                    Acceso público a la normativa académica, resoluciones de licenciamiento, reglamentos de titulación y directivas de gestión institucional del IESTP San Francisco de Asís.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[
                    {
                      title: "Resolución de Licenciamiento R.M. 124-2021",
                      code: "R.M. 124-2021-MINEDU",
                      size: "2.4 MB PDF",
                      desc: "Resolución Ministerial oficial expedida por el Ministerio de Educación que otorga el licenciamiento institucional."
                    },
                    {
                      title: "Reglamento Académico Institucional 2026",
                      code: "REG-ACAD-2026-I",
                      size: "1.8 MB PDF",
                      desc: "Normas integrales de evaluación semestral, asistencia, convalidación de asignaturas y permanencia académica."
                    },
                    {
                      title: "Reglamento del Proceso de Admisión Ordinario",
                      code: "REG-ADM-2026-I",
                      size: "1.2 MB PDF",
                      desc: "Lineamientos del examen de admisión, ponderación de contenidos, vacantes y adjudicación de plazas."
                    },
                    {
                      title: "Reglamento de Titulación Profesional y EFSRT",
                      code: "REG-TIT-2026",
                      size: "1.5 MB PDF",
                      desc: "Requisitos y procedimientos para la obtención del Título a Nombre de la Nación y prácticas pre-profesionales."
                    },
                    {
                      title: "Reglamento de Investigación e Innovación",
                      code: "REG-INV-2026",
                      size: "1.1 MB PDF",
                      desc: "Directivas para el desarrollo de proyectos de investigación aplicada e innovación tecnológica en módulos."
                    },
                    {
                      title: "Reglamento de Conducta y Ética Estudiantil",
                      code: "COD-ETICA-2026",
                      size: "950 KB PDF",
                      desc: "Código de ética, normas de convivencia, deberes, derechos y procedimiento disciplinario de la comunidad."
                    },
                    {
                      title: "Reglamento de Protección de Datos Personales",
                      code: "DIR-DATOS-2026",
                      size: "820 KB PDF",
                      desc: "Política de seguridad, privacidad y tratamiento de datos personales de postulantes y estudiantes matriculados."
                    },
                    {
                      title: "Cuadro Oficial de Vacantes Admisión 2026-I",
                      code: "VAC-ADM-2026",
                      size: "650 KB PDF",
                      desc: "Distribución oficial de vacantes por programa de estudios para los turnos diurno y nocturno."
                    },
                    {
                      title: "Directiva de Becas y Bienestar Estudiantil",
                      code: "DIR-BEC-2026",
                      size: "890 KB PDF",
                      desc: "Criterios y procedimientos para exoneración de tasas académicas por rendimiento o vulnerabilidad."
                    }
                  ].map((doc, idx) => (
                    <div key={idx} className="bg-white border border-slate-200 p-6 rounded-2xl space-y-4 shadow-xs hover:border-[#9F062A] transition-all hover:shadow-md flex flex-col justify-between">
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <div className="p-2.5 bg-rose-50 rounded-xl border border-rose-100 text-[#9F062A]">
                            <FileText className="w-6 h-6" />
                          </div>
                          <span className="text-[9.5px] font-mono font-bold text-[#9F062A] bg-rose-50 px-2 py-0.5 rounded border border-rose-100">
                            {doc.code}
                          </span>
                        </div>

                        <div>
                          <h3 className="text-sm font-black text-slate-900 uppercase leading-snug">{doc.title}</h3>
                          <span className="text-[10px] text-slate-400 font-medium block mt-0.5">{doc.size}</span>
                        </div>

                        <p className="text-xs text-slate-600 leading-relaxed font-medium">
                          {doc.desc}
                        </p>
                      </div>

                      <button className="pt-3 border-t border-slate-100 text-xs text-[#9F062A] font-bold uppercase tracking-wider flex items-center justify-between hover:text-[#800521] transition-colors cursor-pointer w-full">
                        <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Descargar PDF Oficial</span>
                        <ArrowRight className="w-4 h-4 text-amber-500" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 4. FOOTER INSTITUCIONAL EN GRANATE OSCURO */}
      <footer className="bg-[#4D0213] text-slate-200 border-t border-red-950 text-xs py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">

          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/SFA-Logo.jpeg"
                alt="Logo Oficial IESTP San Francisco de Asís"
                className="w-10 h-10 object-contain rounded-full border-2 border-[#CFA020] bg-white p-0.5 shadow-md shrink-0"
              />
              <div>
                <h4 className="text-white font-black text-sm uppercase tracking-tight leading-tight">IESTP San Francisco de Asís</h4>
                <span className="text-[9.5px] font-mono font-bold text-amber-300 uppercase block leading-none mt-0.5">Luz y Verdad • VMT</span>
              </div>
            </div>
            <p className="text-slate-300 leading-relaxed font-medium text-xs">
              Educación superior tecnológica pública de calidad en Villa María del Triunfo. Formación profesional modular con título a Nombre de la Nación.
            </p>
            <span className="text-[10px] text-amber-300 font-mono font-extrabold block">
              RESOLUCIÓN MINEDU: R.M. 124-2021
            </span>
          </div>

          <div>
            <h5 className="text-white font-extrabold uppercase tracking-wider mb-3 text-[11px]">Carreras Licenciadas</h5>
            <ul className="space-y-2 text-[11px] font-medium">
              <li><button onClick={() => { setSelectedProgramId("electronica"); setCurrentTab("programas"); }} className="hover:text-amber-300 transition-colors text-slate-200">Electricidad Industrial</button></li>
              <li><button onClick={() => { setSelectedProgramId("contabilidad"); setCurrentTab("programas"); }} className="hover:text-amber-300 transition-colors text-slate-200">Contabilidad Financiera</button></li>
            </ul>
          </div>

          <div>
            <h5 className="text-white font-extrabold uppercase tracking-wider mb-3 text-[11px]">Enlaces de Interés</h5>
            <ul className="space-y-2 text-[11px] font-medium">
              <li><button onClick={() => setCurrentTab("admision")} className="hover:text-amber-300 transition-colors text-slate-200">Pre-Inscripción 2026-I</button></li>
              <li><button onClick={() => setCurrentTab("transparencia")} className="hover:text-amber-300 transition-colors text-slate-200">Portal de Transparencia</button></li>
              <li><button onClick={onEnterIntranet} className="hover:text-amber-300 transition-colors text-slate-200">Intranet Académica</button></li>
            </ul>
          </div>

          <div className="space-y-2 font-medium">
            <h5 className="text-white font-extrabold uppercase tracking-wider mb-3 text-[11px]">Ubicación Institucional</h5>
            <p className="flex items-center gap-1.5 text-slate-200"><MapPin className="w-4 h-4 text-amber-300 shrink-0" /> Av. Pachacútec Cdra. 50, Villa María del Triunfo</p>
            <p className="flex items-center gap-1.5 text-slate-200"><Phone className="w-4 h-4 text-amber-300 shrink-0" /> (01) 500 6177</p>
            <p className="flex items-center gap-1.5 text-slate-200"><Mail className="w-4 h-4 text-amber-300 shrink-0" /> admision@iestpsfa.edu.pe</p>
          </div>

        </div>

        <div className="max-w-7xl mx-auto border-t border-rose-950/60 mt-10 pt-6 text-center text-[10px] text-slate-300 font-medium">
          &copy; 2026 IESTP San Francisco de Asís. Todos los derechos reservados. Villa María del Triunfo, Lima - Perú.
        </div>
      </footer>

      {/* CONFIRMATION MODAL WITH APPLICANT DETAILS */}
      {successModalData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 max-w-md w-full text-center space-y-5 shadow-2xl relative">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase text-[#9F062A] tracking-widest block font-mono">REGISTRO COMPLETADO</span>
              <h3 className="text-xl font-black text-slate-900 uppercase mt-1">¡Pre-Inscripción Exitosa!</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed font-medium">
                Estimado(a) <strong className="text-slate-900">{successModalData.name} {successModalData.lastName}</strong>, tu pre-inscripción al programa de <strong className="text-[#9F062A]">{successModalData.programName}</strong> ha sido registrada en el sistema oficial del IESTP San Francisco de Asís.
              </p>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 text-left text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-200 pb-1.5">
                <span className="text-slate-500 uppercase font-bold text-[10px]">Correo Electrónico:</span>
                <span className="text-slate-900 font-bold">{successModalData.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 uppercase font-bold text-[10px]">Acceso a Intranet:</span>
                <span className="text-emerald-700 font-bold">Credenciales Enviadas al Correo</span>
              </div>
            </div>

            <button
              onClick={() => setSuccessModalData(null)}
              className="w-full py-3 bg-[#9F062A] hover:bg-[#800521] text-white font-extrabold rounded-lg text-xs uppercase tracking-widest shadow-md cursor-pointer"
            >
              Entendido
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
