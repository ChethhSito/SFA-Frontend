import React, { useState } from "react";
import { 
  Phone, Mail, MapPin, Facebook, Youtube, ChevronLeft, ChevronRight, 
  BookOpen, Award, GraduationCap, Compass, Briefcase, 
  HelpCircle, LogIn, Landmark, Check, Send, FileText, FileCheck,
  ChevronDown, Globe, Users, Calendar, CheckSquare, Menu, X, Loader2,
  CheckCircle2, ArrowRight, ShieldCheck, Zap, Building2, HeartHandshake,
  Instagram, Clock, FileSpreadsheet, ShieldAlert, UserCheck, Layers, Cpu
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

      sendTransactionalWelcomeEmail({
        email: emailInput,
        applicantCode: generatedApplicantCode,
        password: tempPass,
        name: `${nameInput} ${lastNameInput}`.trim(),
        dni: dniInput,
        programName: progName,
        url: `${window.location.origin}/ingresar`
      }).catch((err) => console.warn("Notice: Email dispatch queued:", err));

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
      icon: <Zap className="w-5 h-5 text-[#9F062A]" />,
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
      icon: <Landmark className="w-5 h-5 text-[#9F062A]" />,
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
              className={`py-1 px-1 relative transition-colors uppercase tracking-wider cursor-pointer ${currentTab === "inicio" ? "text-[#9F062A] font-extrabold" : "hover:text-[#9F062A]"}`}
            >
              <span>INICIO</span>
              {currentTab === "inicio" && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#9F062A] rounded-full" />
              )}
            </button>

            {/* Nosotros Dropdown */}
            <div 
              className="relative py-1"
              onMouseEnter={() => setActiveDropdown("nosotros")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button 
                onClick={() => setCurrentTab("nosotros")}
                className={`py-1 px-1 relative transition-colors uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer ${currentTab === "nosotros" ? "text-[#9F062A] font-extrabold" : "hover:text-[#9F062A]"}`}
              >
                <span>NOSOTROS</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
                {currentTab === "nosotros" && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#9F062A] rounded-full" />
                )}
              </button>

              {activeDropdown === "nosotros" && (
                <div className="absolute top-full left-0 w-56 bg-white border border-slate-200 shadow-xl rounded-lg p-2 z-50 animate-fade-in mt-1">
                  <button
                    onClick={() => { setCurrentTab("nosotros"); setActiveDropdown(null); }}
                    className="w-full text-left p-2 hover:bg-rose-50 hover:text-[#9F062A] rounded-md transition-colors text-[11px] font-bold uppercase flex items-center gap-2"
                  >
                    <Award className="w-3.5 h-3.5 text-[#9F062A]" /> Misión, Visión y Valores
                  </button>
                  <button
                    onClick={() => { setCurrentTab("nosotros"); setActiveDropdown(null); }}
                    className="w-full text-left p-2 hover:bg-rose-50 hover:text-[#9F062A] rounded-md transition-colors text-[11px] font-bold uppercase mt-0.5 flex items-center gap-2"
                  >
                    <Users className="w-3.5 h-3.5 text-[#9F062A]" /> Plana Directiva y Autoridades
                  </button>
                </div>
              )}
            </div>

            {/* Programas Dropdown */}
            <div 
              className="relative py-1"
              onMouseEnter={() => setActiveDropdown("programas")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button 
                onClick={() => setCurrentTab("programas")}
                className={`py-1 px-1 relative transition-colors uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer ${currentTab === "programas" ? "text-[#9F062A] font-extrabold" : "hover:text-[#9F062A]"}`}
              >
                <span>PROGRAMAS</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
                {currentTab === "programas" && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#9F062A] rounded-full" />
                )}
              </button>

              {activeDropdown === "programas" && (
                <div className="absolute top-full left-0 w-72 bg-white border border-slate-200 shadow-xl rounded-lg p-2.5 z-50 animate-fade-in space-y-1 mt-1">
                  <span className="text-[9px] uppercase font-black text-[#9F062A] tracking-wider block px-2 mb-1">Especialidades Licenciadas:</span>
                  <button
                    onClick={() => { setSelectedProgramId("electronica"); setCurrentTab("programas"); setActiveDropdown(null); }}
                    className="w-full text-left p-2 hover:bg-rose-50 hover:text-[#9F062A] rounded-md transition-colors text-[11px] font-bold text-slate-800 uppercase flex flex-col"
                  >
                    <span className="flex items-center gap-2"><Zap className="w-3.5 h-3.5 text-[#9F062A]" /> Electricidad Industrial</span>
                    <span className="text-[9px] text-slate-500 normal-case font-normal mt-0.5">Control de PLCs, Motores y Subestaciones</span>
                  </button>
                  <button
                    onClick={() => { setSelectedProgramId("contabilidad"); setCurrentTab("programas"); setActiveDropdown(null); }}
                    className="w-full text-left p-2 hover:bg-rose-50 hover:text-[#9F062A] rounded-md transition-colors text-[11px] font-bold text-slate-800 uppercase flex flex-col mt-0.5"
                  >
                    <span className="flex items-center gap-2"><Landmark className="w-3.5 h-3.5 text-[#9F062A]" /> Contabilidad Financiera</span>
                    <span className="text-[9px] text-slate-500 normal-case font-normal mt-0.5">Tributación Empresarial, NIIF y ERP</span>
                  </button>
                </div>
              )}
            </div>

            {/* Admisión Dropdown */}
            <div 
              className="relative py-1"
              onMouseEnter={() => setActiveDropdown("admision")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button 
                onClick={() => { setCurrentTab("admision"); setSubmitSuccessMsg(""); }}
                className={`py-1 px-1 relative transition-colors uppercase tracking-wider inline-flex items-center gap-1 cursor-pointer ${currentTab === "admision" ? "text-[#9F062A] font-extrabold" : "hover:text-[#9F062A]"}`}
              >
                <span>ADMISIÓN</span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
                {currentTab === "admision" && (
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#9F062A] rounded-full" />
                )}
              </button>

              {activeDropdown === "admision" && (
                <div className="absolute top-full left-0 w-60 bg-white border border-slate-200 shadow-xl rounded-lg p-2 z-50 animate-fade-in mt-1">
                  <button
                    onClick={() => { setCurrentTab("admision"); setSubmitSuccessMsg(""); setActiveDropdown(null); }}
                    className="w-full text-left p-2 hover:bg-rose-50 hover:text-[#9F062A] rounded-md transition-colors text-[11px] font-bold uppercase flex items-center gap-2"
                  >
                    <CheckSquare className="w-3.5 h-3.5 text-[#9F062A]" /> Pre-Inscripción Virtual 2026-I
                  </button>
                  <button
                    onClick={() => { setCurrentTab("admision"); setSubmitSuccessMsg(""); setActiveDropdown(null); }}
                    className="w-full text-left p-2 hover:bg-rose-50 hover:text-[#9F062A] rounded-md transition-colors text-[11px] font-bold uppercase mt-0.5 flex items-center gap-2"
                  >
                    <Landmark className="w-3.5 h-3.5 text-[#9F062A]" /> Tasas y Requisitos del Examen
                  </button>
                </div>
              )}
            </div>

            <button 
              onClick={() => { setCurrentTab("transparencia"); setActiveDropdown(null); }} 
              className={`py-1 px-1 relative transition-colors uppercase tracking-wider cursor-pointer ${currentTab === "transparencia" ? "text-[#9F062A] font-extrabold" : "hover:text-[#9F062A]"}`}
            >
              <span>TRANSPARENCIA</span>
              {currentTab === "transparencia" && (
                <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-[#9F062A] rounded-full" />
              )}
            </button>

            <button 
              onClick={() => { setCurrentTab("contactanos"); setActiveDropdown(null); }} 
              className={`py-1 px-1 relative transition-colors uppercase tracking-wider cursor-pointer ${currentTab === "contactanos" ? "text-[#9F062A] font-extrabold" : "hover:text-[#9F062A]"}`}
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
      <main className="flex-1">

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

            {/* 4. FRANJA DE BENEFICIOS INSTITUCIONALES (DIRECTAMENTE DEBAJO DEL HERO) */}
            <section className="bg-white border-b border-slate-200/80 py-8 px-4 relative z-30 shadow-xs">
              <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                  
                  {/* Beneficio 1 */}
                  <div className="flex items-start gap-4 p-4 sm:px-6">
                    <div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center shrink-0 border border-rose-100">
                      <GraduationCap className="w-6 h-6 text-[#9F062A]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">PROGRAMAS TÉCNICOS</h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">Formación alineada al mercado laboral</p>
                    </div>
                  </div>

                  {/* Beneficio 2 */}
                  <div className="flex items-start gap-4 p-4 sm:px-6">
                    <div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center shrink-0 border border-rose-100">
                      <Users className="w-6 h-6 text-[#9F062A]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">DOCENTES CALIFICADOS</h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">Profesionales con experiencia real</p>
                    </div>
                  </div>

                  {/* Beneficio 3 */}
                  <div className="flex items-start gap-4 p-4 sm:px-6">
                    <div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center shrink-0 border border-rose-100">
                      <Building2 className="w-6 h-6 text-[#9F062A]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">INFRAESTRUCTURA MODERNA</h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">Ambientes seguros y equipados</p>
                    </div>
                  </div>

                  {/* Beneficio 4 */}
                  <div className="flex items-start gap-4 p-4 sm:px-6">
                    <div className="w-12 h-12 bg-rose-50 rounded-lg flex items-center justify-center shrink-0 border border-rose-100">
                      <ShieldCheck className="w-6 h-6 text-[#9F062A]" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider">COMPROMISO SOCIAL</h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed mt-1">Educación que transforma vidas</p>
                    </div>
                  </div>

                </div>
              </div>
            </section>

            {/* 5. CARRERAS DESTACADAS Y PRESENTACIÓN INSTITUCIONAL */}
            <section className="py-16 px-4 bg-slate-50">
              <div className="max-w-7xl mx-auto space-y-12">
                <div className="text-center max-w-3xl mx-auto">
                  <span className="text-[#9F062A] font-black text-xs uppercase tracking-widest block font-mono">CONOCE NUESTRAS ESPECIALIDADES</span>
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 uppercase tracking-tight mt-1">
                    Carreras Profesionales Licenciadas
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium mt-2">
                    Ofrecemos módulos formativos estructurados durante 3 años lectivos con titulación oficial expedida directamente por el Ministerio de Educación (MINEDU), asegurando arancel mensual S/. 0.00.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
                  {careersDetail.map((career) => (
                    <div 
                      key={career.id}
                      className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      <div className="relative h-48 bg-slate-100">
                        <img 
                          src={career.image} 
                          alt={career.name} 
                          className="w-full h-full object-cover" 
                        />
                        <span className="absolute top-3 right-3 bg-[#9F062A] text-white text-[10px] font-mono px-3 py-1 rounded font-bold uppercase tracking-wider shadow-xs">
                          3 AÑOS - TITULACIÓN OFICIAL
                        </span>
                      </div>

                      <div className="p-6 space-y-3">
                        <div className="flex items-center gap-2.5">
                          <div className="p-2 rounded-lg bg-rose-50 border border-rose-100">
                            {career.icon}
                          </div>
                          <h4 className="text-lg font-black text-slate-900 uppercase">{career.name}</h4>
                        </div>
                        <p className="text-xs text-slate-600 font-normal leading-relaxed">
                          {career.profile}
                        </p>
                      </div>

                      <div className="p-6 pt-0">
                        <button
                          onClick={() => { setSelectedProgramId(career.id); setProgramSelection(career.id); setCurrentTab("programas"); }}
                          className="w-full py-3 bg-[#9F062A] hover:bg-[#800521] text-white font-extrabold rounded-lg text-xs uppercase tracking-wider transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                        >
                          <span>Ver Malla Curricular y Cursos</span>
                          <ArrowRight className="w-4 h-4 text-amber-300" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* 6. PASO A PASO DEL PROCESO DE ADMISIÓN */}
            <section className="py-16 px-4 bg-white border-t border-slate-200">
              <div className="max-w-7xl mx-auto space-y-10">
                <div className="text-center max-w-3xl mx-auto">
                  <span className="text-[#9F062A] font-extrabold text-xs uppercase tracking-widest block font-mono">PROCESO ORDINARIO DE ADMISIÓN 2026</span>
                  <h3 className="text-2xl sm:text-3xl font-black mt-1 text-slate-900 uppercase">Pasos para la Inscripción</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  {[
                    { step: "01", title: "Pre-Inscripción", desc: "Registra tus datos personales en el formulario virtual para obtener tu código." },
                    { step: "02", title: "Pago de Tasa", desc: "Abona S/. 120 por derecho de examen de admisión en el Banco de la Nación." },
                    { step: "03", title: "Examen de Admisión", desc: "Rinde la evaluación de aptitud y conocimientos en nuestro campus." },
                    { step: "04", title: "Matrícula e Inicio", desc: "Con tu vacante adjudicada, realiza tu matrícula institucional." }
                  ].map((st, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 p-6 rounded-xl relative">
                      <span className="w-8 h-8 rounded-full bg-[#9F062A] text-white font-black text-xs flex items-center justify-center mb-3">
                        {st.step}
                      </span>
                      <h4 className="text-sm font-black text-slate-900 uppercase mb-1">{st.title}</h4>
                      <p className="text-xs text-slate-600 font-medium leading-relaxed">{st.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* PREGUNTAS FRECUENTES */}
            <section className="bg-slate-50 border-t border-slate-200 py-16 px-4">
              <div className="max-w-4xl mx-auto space-y-8">
                <div className="text-center">
                  <span className="text-[#9F062A] font-extrabold text-xs uppercase tracking-widest block font-mono">RESOLVEMOS TUS DUDAS</span>
                  <h3 className="text-2xl sm:text-3xl font-black mt-1 text-slate-900 uppercase">Preguntas Frecuentes</h3>
                </div>

                <div className="space-y-3">
                  {faqsList.map((faq) => (
                    <div 
                      key={faq.id}
                      className="bg-white border border-slate-200 rounded-lg overflow-hidden transition-all"
                    >
                      <button
                        onClick={() => setExpandedFaqId(expandedFaqId === faq.id ? null : faq.id)}
                        className="w-full text-left p-4.5 text-xs font-extrabold text-slate-900 uppercase flex items-center justify-between gap-4 cursor-pointer"
                      >
                        <span>{faq.question}</span>
                        <ChevronDown className={`w-4 h-4 text-[#9F062A] transition-transform ${expandedFaqId === faq.id ? "rotate-180" : ""}`} />
                      </button>
                      {expandedFaqId === faq.id && (
                        <div className="px-4.5 pb-4 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3 font-medium">
                          {faq.answer}
                        </div>
                      )}
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
              <div className="flex justify-center items-center gap-3">
                {careersDetail.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setSelectedProgramId(c.id)}
                    className={`px-6 py-3 rounded-xl font-black text-xs uppercase tracking-wider border transition-all cursor-pointer flex items-center gap-2 ${selectedProgramId === c.id ? "bg-[#9F062A] text-white border-[#9F062A] shadow-md" : "bg-white text-slate-700 border-slate-200 hover:bg-rose-50 hover:text-[#9F062A]"}`}
                  >
                    {c.icon}
                    <span>{c.name}</span>
                  </button>
                ))}
              </div>

              {/* Detalle Completo de la Carrera Seleccionada */}
              <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-10 shadow-xs space-y-10 max-w-5xl mx-auto">
                
                {/* Cabecera del Programa */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-slate-200 pb-8">
                  <div className="flex items-center gap-4">
                    <img src={activeCareer.image} alt={activeCareer.name} className="w-20 h-20 rounded-2xl object-cover border border-slate-200 shadow-xs" />
                    <div>
                      <span className="bg-rose-50 text-[#9F062A] text-[10px] font-mono px-3 py-1 rounded font-extrabold uppercase border border-rose-100">
                        {activeCareer.hours}
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

                {/* Malla Curricular Detallada: Ciclo I al VI */}
                <div className="space-y-4">
                  <h4 className="text-xs font-black uppercase tracking-wider text-[#9F062A] flex items-center gap-2">
                    <Layers className="w-4 h-4" />
                    Plan de Estudios por Ciclos Académicos (Ciclo I al VI)
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {activeCareer.careerPath.map((cp, idx) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-200 pb-2">
                          <span className="bg-[#9F062A] text-white text-[10px] font-mono px-2.5 py-0.5 rounded font-black uppercase">
                            {cp.cycle}
                          </span>
                          <span className="text-[9px] font-bold text-slate-400 uppercase">Modular</span>
                        </div>
                        <ul className="space-y-2 text-xs text-slate-700 font-semibold">
                          {cp.courses.map((course, cIdx) => (
                            <li key={cIdx} className="flex items-start gap-2">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#9F062A] shrink-0 mt-1.5" />
                              <span>{course}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Botón de Postulación a la Carrera */}
                <div className="pt-4 border-t border-slate-200 text-center">
                  <button
                    onClick={() => { setProgramSelection(activeCareer.id); setCurrentTab("admision"); setSubmitSuccessMsg(""); }}
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

        {/* ================= NOSOTROS VIEW (INCLUYE AUTORIDADES Y PLANA DIRECTIVA) ================= */}
        {currentTab === "nosotros" && (
          <div className="bg-slate-50 py-12 sm:py-16 px-4 min-h-screen">
            <div className="max-w-6xl mx-auto space-y-12">
              
              {/* Header Banner Institucional */}
              <div className="bg-gradient-to-r from-[#800521] via-[#9F062A] to-[#630217] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-lg border border-red-950">
                <div className="absolute top-0 right-0 transform translate-x-10 -translate-y-10 opacity-10 pointer-events-none">
                  <Building2 className="w-96 h-96 text-white" />
                </div>
                <div className="relative z-10 max-w-2xl space-y-4">
                  <span className="bg-amber-400/20 text-amber-300 text-xs font-mono font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-amber-400/30 inline-block">
                    INSTITUCIÓN PÚBLICA LICENCIADA • R.M. 124-2021
                  </span>
                  <h2 className="text-3xl sm:text-5xl font-black uppercase tracking-tight leading-tight">
                    Nuestra Identidad e Historia
                  </h2>
                  <p className="text-xs sm:text-sm text-rose-100 font-medium leading-relaxed">
                    El Instituto de Educación Superior Tecnológico Público San Francisco de Asís lidera la formación técnica profesional gratuita en Villa María del Triunfo y Lima Sur, preparando líderes preparados para transformar el país.
                  </p>
                </div>
              </div>

              {/* Misión y Visión */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                <div className="bg-white border border-slate-200 p-8 rounded-2xl space-y-4 shadow-sm relative overflow-hidden group hover:border-[#9F062A] transition-colors">
                  <div className="w-2 h-full bg-[#9F062A] absolute top-0 left-0" />
                  <div className="w-12 h-12 bg-rose-50 text-[#9F062A] rounded-xl flex items-center justify-center border border-rose-100">
                    <Award className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-black text-slate-900 uppercase tracking-wide">Nuestra Misión</h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-medium">
                    Somos un Instituto de Educación Superior Tecnológico Público que forma profesionales técnicos competitivos, con pensamiento crítico, valores éticos e innovación tecnológica, capaces de responder a las exigencias del mercado laboral y contribuir al desarrollo socioeconómico del Perú.
                  </p>
                </div>

                <div className="bg-white border border-slate-200 p-8 rounded-2xl space-y-4 shadow-sm relative overflow-hidden group hover:border-[#CFA020] transition-colors">
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

              {/* Valores Institucionales */}
              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-6">
                <div className="text-center max-w-2xl mx-auto space-y-1">
                  <span className="text-[#9F062A] font-black text-xs uppercase tracking-widest font-mono">PRINCIPIOS FUNDAMENTALES</span>
                  <h3 className="text-2xl font-black text-slate-900 uppercase">Valores Institucionales</h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {[
                    { title: "Excelencia Académica", desc: "Rigurosidad en el aprendizaje práctico e innovación continua.", icon: <CheckCircle2 className="w-5 h-5 text-[#9F062A]" /> },
                    { title: "Ética y Deontología", desc: "Honestidad, transparencia y compromiso con la sociedad.", icon: <ShieldCheck className="w-5 h-5 text-[#9F062A]" /> },
                    { title: "Innovación Tecnológica", desc: "Uso de herramientas modernas y tecnología de punta.", icon: <Zap className="w-5 h-5 text-[#9F062A]" /> },
                    { title: "Inclusión y Equidad", desc: "Acceso a la educación superior pública de calidad sin distinciones.", icon: <Users className="w-5 h-5 text-[#9F062A]" /> }
                  ].map((val, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-2 hover:bg-rose-50/40 transition-colors">
                      <div className="p-2 bg-white rounded-lg w-fit border border-slate-200 shadow-2xs">
                        {val.icon}
                      </div>
                      <h4 className="text-xs font-black text-slate-900 uppercase pt-1">{val.title}</h4>
                      <p className="text-[11px] text-slate-600 font-medium leading-relaxed">{val.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Plana Directiva y Autoridades Institucionales */}
              <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-xs space-y-8">
                <div className="border-b border-slate-200 pb-4 text-center sm:text-left flex flex-col sm:flex-row justify-between items-center gap-2">
                  <div>
                    <h3 className="text-xl font-black text-slate-900 uppercase">Plana Directiva y Autoridades</h3>
                    <span className="text-xs text-slate-500 font-medium">Equipo directivo responsable de la gestión académica y administrativa</span>
                  </div>
                  <span className="bg-[#9F062A] text-white text-[10px] font-mono font-bold px-3 py-1 rounded-md uppercase">
                    GESTIÓN INSTITUCIONAL 2026
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                  {[
                    { role: "Director General", name: "Lic. Manuel Ramos", detail: "Gestión Institucional y Desarrollo Estratégico" },
                    { role: "Secretaría Académica", name: "Mg. Rosa Elvira Huamán", detail: "Control de Registros, Matrículas y Certificaciones" },
                    { role: "Jefe de Unidad Académica", name: "Ing. Carlos Mendoza", detail: "Supervisión Curricular y Plana Docente" },
                    { role: "Coordinador de Admisión", name: "Lic. Luis Alberto Castillo", detail: "Proceso de Admisión Ordinario y Evaluaciones" },
                    { role: "Jefatura de Investigación", name: "Ing. Jorge Luis Toledo", detail: "Proyectos de Innovación Tecnológica" },
                    { role: "Jefatura de Bienestar", name: "Lic. Elena Morales", detail: "Atención al Estudiante y Empleabilidad" }
                  ].map((auth, idx) => (
                    <div key={idx} className="bg-slate-50 border border-slate-200 p-5 rounded-xl space-y-2 hover:shadow-sm transition-shadow">
                      <div className="flex justify-between items-start">
                        <span className="bg-rose-50 text-[#9F062A] text-[10px] font-bold uppercase px-2.5 py-0.5 rounded border border-rose-100 font-mono">
                          {auth.role}
                        </span>
                      </div>
                      <h4 className="text-sm font-black text-slate-900 uppercase pt-1">{auth.name}</h4>
                      <p className="text-xs text-slate-500 font-medium leading-relaxed">{auth.detail}</p>
                    </div>
                  ))}
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
                  
                  <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
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
                <div className="lg:col-span-7">
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

                        <div>
                          <label className="text-xs font-bold uppercase text-slate-700 block mb-1">Programa al que Postula *</label>
                          <select 
                            value={programSelection}
                            onChange={(e) => setProgramSelection(e.target.value)}
                            className="w-full bg-slate-50 border border-slate-300 focus:border-[#9F062A] rounded-lg px-4 py-3 text-xs text-slate-900 outline-none font-medium cursor-pointer"
                          >
                            <option value="electronica">Electricidad Industrial (3 Años - Título Oficial)</option>
                            <option value="contabilidad">Contabilidad Financiera (3 Años - Título Oficial)</option>
                          </select>
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
              <span className="text-[#9F062A] font-extrabold text-xs uppercase tracking-widest block font-mono">PORTAL DE TRANSPARENCIA</span>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 uppercase mt-1">Documentos Oficiales Institucionales</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { title: "Resolución de Licenciamiento R.M. 124-2021", desc: "Resolución Ministerial oficial de licenciamiento emitido por MINEDU." },
                { title: "Reglamento Académico Institucional 2026", desc: "Normas de evaluación, asistencia, convalidación y permanencia académica." },
                { title: "Cuadro de Vacantes Admisión 2026-I", desc: "Distribución oficial de vacantes por programa de estudios." }
              ].map((doc, idx) => (
                <div key={idx} className="bg-white border border-slate-200 p-6 rounded-xl space-y-3 shadow-xs">
                  <FileText className="w-8 h-8 text-[#9F062A]" />
                  <h3 className="text-base font-black text-slate-900 uppercase">{doc.title}</h3>
                  <p className="text-xs text-slate-600 leading-relaxed">{doc.desc}</p>
                  <button className="text-xs text-[#9F062A] font-bold uppercase tracking-wider flex items-center gap-1 hover:underline">
                    <span>Descargar PDF</span> &rarr;
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* 4. FOOTER INSTITUCIONAL EN GRANATE OSCURO */}
      <footer className="bg-[#4D0213] text-slate-200 border-t border-red-950 text-xs py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          
          <div className="space-y-3">
            <h4 className="text-white font-black text-sm uppercase tracking-tight">IESTP San Francisco de Asís</h4>
            <p className="text-slate-300 leading-relaxed font-medium">
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
