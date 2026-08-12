"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  Phone, Mail, MapPin, ChevronLeft, ChevronRight, 
  BookOpen, Award, ShieldAlert, GraduationCap, Compass, Briefcase, 
  HelpCircle, LogIn, Landmark, Check, Send, FileText, FileCheck, HelpCircle as HelpIcon,
  ChevronDown, Globe, Users, Award as MedalIcon, Calendar, CheckSquare, Menu, X
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { AdmissionPeriod } from "@/types";

// Local SVG components for brand logos (removed in lucide-react v1+)
const Facebook = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" width="14" height="14">
    <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
  </svg>
);

const Youtube = ({ className }: { className?: string }) => (
  <svg className={className} fill="currentColor" viewBox="0 0 24 24" aria-hidden="true" width="14" height="14">
    <path fillRule="evenodd" d="M19.812 5.418c.861.23 1.538.907 1.768 1.768C22 8.698 22 12 22 12s0 3.302-.42 4.814c-.23.861-.907 1.538-1.768 1.768C18.302 19 12 19 12 19s-6.302 0-7.814-.42c-.861-.23-1.538-.907-1.768-1.768C2 15.302 2 12 2 12s0-3.302.42-4.814c.23-.861.907-1.538 1.768-1.768C5.698 5 12 5 12 5s6.302 0 7.812.418ZM9.75 8.25v7.5L15.25 12 9.75 8.25Z" clipRule="evenodd" />
  </svg>
);

// Fallbacks / Stubs for simulated Firebase features in standby mode
const isFirebaseEnabled = false;
const registerWithEmailAndPassword = async (email: string, pass: string) => null;
const saveDocumentGeneric = async (col: string, id: string, data: any) => {};
const listCollectionGeneric = async (col: string) => [];
const sendWelcomeEmailBrevo = async (data: any) => {};

export default function PortalHome() {
  const router = useRouter();
  const onEnterIntranet = () => {
    router.push('/ingresar');
  };

  const [admissionPeriods, setAdmissionPeriods] = useState<AdmissionPeriod[]>(() => {
    if (typeof window === "undefined") return [];
    const saved = localStorage.getItem("sfa_admission_periods");
    try {
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return [
      { 
        id: "1", 
        name: "2026-I", 
        isActive: true, 
        status: "APERTURADO",
        preEnrollmentStartDate: "2026-02-01",
        preEnrollmentEndDate: "2026-03-20",
        admissionDate: "2026-03-22", 
        enrollmentStartDate: "2026-03-24",
        enrollmentEndDate: "2026-03-29", 
        classesStartDate: "2026-04-06" 
      }
    ];
  });

  const activePeriod = admissionPeriods.find(p => p.status === "APERTURADO");
  const displayPeriod = activePeriod || admissionPeriods.find(p => p.status !== "PENDIENTE") || admissionPeriods[0];


  // Navigation State
  const [currentTab, setCurrentTab] = useState<
    "inicio" | "nosotros" | "programas" | "admision" | "transparencia" | "contactanos"
  >("inicio");

  // Navigation Dropdown & Mobile states
  const [activeDropdown, setActiveDropdown] = useState<"nosotros" | "programas" | "admision" | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Registered applicant details for holding and showcasing copyable temporary access in simulated email mock
  const [registeredApplicant, setRegisteredApplicant] = useState<{
    dni: string;
    applicantCode: string;
    name: string;
    lastName: string;
    email: string;
    programName: string;
    temporaryPassword?: string;
  } | null>(null);

  // Hero Carousel Slide state
  const [currentSlide, setCurrentSlide] = useState(0);

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
  const [contactMessage, setContactMessage] = useState("");
  const [contactSuccessMsg, setContactSuccessMsg] = useState("");

  // Interactive Programs tab sub-selection
  const [selectedProgramId, setSelectedProgramId] = useState("electronica");

  // FAQ interactive state
  const [expandedFaqId, setExpandedFaqId] = useState<number | null>(null);

  const slides = [
    {
      title: "IESTP SAN FRANCISCO DE ASÍS",
      subtitle: "Educación Tecnológica Pública de Primer Nivel en Villa María del Triunfo",
      image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format&fit=crop",
      tagline: "¡Admisión Ordinaria 2026 Abierta!"
    },
    {
      title: "CARRERAS MODULARES LICENCIADAS",
      subtitle: "Titulación Oficial a Nombre de la Nación con laboratorios de computación y talleres prácticos modernos",
      image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=1200&auto=format&fit=crop",
      tagline: "Licenciamiento Minedu Garantizado"
    },
    {
      title: "EMPLEABILIDAD Y CONVENIOS",
      subtitle: "Convenios consolidados en Lima Sur para inserción laboral acelerada de nuestros estudiantes de ciclos avanzados",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=1200&auto=format&fit=crop",
      tagline: "Prácticas Profesionales Estructuradas"
    }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Handle live admission registration directly into localStorage sfa_applicants
  const handlePreEnrollmentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccessMsg("");

    if (!/^\d{8}$/.test(dniInput)) {
      alert("El DNI debe contener exactamente 8 caracteres numéricos.");
      return;
    }

    try {
      const existingApplicantsRaw = localStorage.getItem("sfa_applicants");
      let applicantsList: any[] = [];
      if (existingApplicantsRaw) {
        applicantsList = JSON.parse(existingApplicantsRaw);
      }

      let fireApplicants: any[] = [];
      if (isFirebaseEnabled) {
        try {
          fireApplicants = await listCollectionGeneric("applicants");
        } catch (err) {
          console.error("Error reading from Firestore:", err);
        }
      }

      // Check DNI repeats across both local and firebase rosters
      const isRepeatedLocal = applicantsList.some((app: any) => app.dni === dniInput);
      const isRepeatedFire = fireApplicants.some((app: any) => app.dni === dniInput);
      if (isRepeatedLocal || isRepeatedFire) {
        setSubmitSuccessMsg(`El DNI ${dniInput} ya se encuentra registrado. Utilice su Código de Postulante o DNI como usuario y su clave en la Intranet.`);
        return;
      }

      // Calculate dynamic unique applicantCode
      const getPeriodPrefix = (periodName: string) => {
        const yearMatch = periodName.match(/\d{4}/);
        const year = yearMatch ? yearMatch[0] : "2026";
        const num = periodName.includes("II") ? "2" : "1";
        return `${year}${num}`;
      };

      const periodName = activePeriod?.name || "2026-I";
      const prefix = getPeriodPrefix(periodName);

      // Merge applicant registries to compute non-reusable sequentially unique code
      const combinedRoster = [...applicantsList];
      fireApplicants.forEach((fa) => {
        if (!combinedRoster.some((cr) => cr.dni === fa.dni)) {
          combinedRoster.push(fa);
        }
      });

      const samePrefixApps = combinedRoster.filter((app: any) => 
        app.applicantCode && app.applicantCode.startsWith(prefix)
      );

      let nextSerial = 1;
      if (samePrefixApps.length > 0) {
        const serials = samePrefixApps.map((app: any) => {
          const serialStr = app.applicantCode.slice(5);
          const parsed = parseInt(serialStr, 10);
          return isNaN(parsed) ? 0 : parsed;
        });
        nextSerial = Math.max(...serials) + 1;
      }

      const serialStr = String(nextSerial).padStart(4, '0');
      const generatedApplicantCode = `${prefix}${serialStr}`;
      const tempPass = "clave123";

      // 2. Register applicant directly in Firestore (No Firebase Authentication)
      let fireUid = generatedApplicantCode;
      if (isFirebaseEnabled) {
        try {
          const isEmailRepeatedFire = fireApplicants.some((app: any) => app.email?.toLowerCase() === emailInput.toLowerCase());
          if (isEmailRepeatedFire) {
            alert("El correo electrónico ya se encuentra registrado.");
            return;
          }

          // 1. Create user mapping record in Firestore "users"
          const newUserRecord = {
            id: fireUid,
            uid: fireUid,
            dni: dniInput,
            email: emailInput,
            password: tempPass,
            role: "postulante",
            applicantCode: generatedApplicantCode
          };
          await saveDocumentGeneric("users", fireUid, newUserRecord);

          // 2. Create detail applicant record in Firestore "applicants"
          const newApplicantRecord = {
            id: fireUid,
            uid: fireUid,
            applicantCode: generatedApplicantCode,
            dni: dniInput,
            name: nameInput,
            lastName: lastNameInput,
            email: emailInput,
            password: tempPass,
            phone: phoneInput,
            programId: programSelection,
            paymentStatus: "No Pagado",
            paymentOperation: "",
            examStatus: "No Programado",
            admitted: false,
            periodId: activePeriod?.id || "1",
            folderStatus: "Pending",
            docs: {
              dniFile: { status: "No Enviado", fileName: "" },
              certificadoFile: { status: "No Enviado", fileName: "" },
              partidaFile: { status: "No Enviado", fileName: "" },
              fotoFile: { status: "No Enviado", fileName: "" }
            }
          };
          await saveDocumentGeneric("applicants", fireUid, newApplicantRecord);
          console.log("Firestore-only applicant registration completed for UID:", fireUid);

          // Brevo email service is disabled for now as per updated specifications. We show credentials modal immediately in UI.
          console.info("Brevo email dispatcher is bypassed during development mode.");
        } catch (firebaseErr: any) {
          console.error("Firebase registration failure:", firebaseErr);
          alert(`Error al registrar cuenta de admisión en Firestore: ${firebaseErr.message || firebaseErr}`);
          return;
        }
      }

      // Record offline/local fallback object
      const newApplicant = {
        applicantCode: generatedApplicantCode,
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
        periodId: activePeriod?.id || "1",
        folderStatus: "Pending" as const,
        password: tempPass
      };

      applicantsList.push(newApplicant);
      localStorage.setItem("sfa_applicants", JSON.stringify(applicantsList));

      const activeProg = careersDetail.find(c => c.id === programSelection);
      const progName = activeProg ? activeProg.name : "Programa Seleccionado";

      setRegisteredApplicant({
        applicantCode: generatedApplicantCode,
        dni: dniInput,
        name: nameInput,
        lastName: lastNameInput,
        email: emailInput,
        programName: progName,
        temporaryPassword: tempPass
      });

      setSubmitSuccessMsg(
        `¡Pre-inscripción registrada correctamente! Código Oficial: ${generatedApplicantCode}. Use su Código de Postulante (${generatedApplicantCode}) o su DNI (${dniInput}) y su clave '${tempPass}' para ingresar.`
      );

      // Clean inputs
      setDniInput("");
      setNameInput("");
      setLastNameInput("");
      setEmailInput("");
      setPhoneInput("");
    } catch (err) {
      console.error(err);
      alert("Error al procesar registro.");
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setContactSuccessMsg("¡Gracias! Su mensaje ha sido enviado a Mesa de Partes Virtuales de Secretaría Académica. Le responderemos en breve.");
    setContactName("");
    setContactEmail("");
    setContactMessage("");
  };

  const careersDetail = [
    {
      id: "electronica",
      name: "Electricidad Industrial",
      hours: "3080 Horas Lectivas",
      title: "Profesional Técnico en Electricidad Industrial",
      profile: "Diagnostica, instala, programa y realiza el mantenimiento preventivo y correctivo de sistemas eléctricos de media y baja tensión, maquinaria de potencia, equipos de climatización, control por PLCs de motores y tableros de automatización industrial.",
      careerPath: [
        { cycle: "I Ciclo", desc: "Electricidad de Corriente Continua, Taller de Ajuste" },
        { cycle: "II Ciclo", desc: "Dibujo Técnico Eléctrico, Luminotecnia" },
        { cycle: "III Ciclo", desc: "Electrónica Analógica Aplicada" },
        { cycle: "IV Ciclo", desc: "Sistemas Digitales, Bobinado de Máquinas Rotativas, PLC Básico" },
        { cycle: "V Ciclo", desc: "Automatización Industrial con PLCs Avanzados, Neumática e Hidráulica" },
        { cycle: "VI Ciclo", desc: "Mantenimiento de Subestaciones, Instrumentación del Taller" }
      ],
      icon: <Award className="w-5 h-5 text-amber-500" />,
      salaryEst: "S/. 1,900 - S/. 4,000",
      image: "https://images.unsplash.com/photo-1581092921461-eab62e97a780?q=80&w=600&auto=format&fit=crop"
    },
    {
      id: "contabilidad",
      name: "Contabilidad",
      hours: "3040 Horas Lectivas",
      title: "Profesional Técnico en Contabilidad",
      profile: "Domina el control de auditorías financieras de acuerdo a las Normas Internacionales de Información Financiera (NIIF), tributación de PyMEs, planeamiento fiscal, costos de producción e informática contable con ERPs modernos.",
      careerPath: [
        { cycle: "I Ciclo", desc: "Contabilidad General I, Matemática Financiera" },
        { cycle: "II Ciclo", desc: "Plan Contable General Empresarial, Tributación Básica" },
        { cycle: "III Ciclo", desc: "Contabilidad de Costos Industriales, Costeo por Procesos" },
        { cycle: "IV Ciclo", desc: "Software Contable de Aplicación, Legislación Laboral y Tributaria" },
        { cycle: "V Ciclo", desc: "Auditoría Financiera Integral, Contabilidad Gubernamental del Estado" },
        { cycle: "VI Ciclo", desc: "Planeamiento Financiero Avanzado, Formulación de Estados de Control" }
      ],
      icon: <Landmark className="w-5 h-5 text-[#9F062A]" />,
      salaryEst: "S/. 1,600 - S/. 3,500",
      image: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?q=80&w=600&auto=format&fit=crop"
    }
  ];

  const activeProgramData = careersDetail.find((c) => c.id === selectedProgramId) || careersDetail[0];

  return (
    <div id="home-view" className="flex flex-col min-h-screen bg-slate-50 font-sans text-slate-800">
      
      {/* 1. TOP SOCIAL & CONTACT PANEL */}
      <div className="bg-[#9F062A] text-white py-2 px-4 text-xs font-semibold tracking-wide border-b border-rose-950">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex flex-wrap justify-center md:justify-start items-center gap-4 sm:gap-6 text-[11px]">
            <span className="font-extrabold tracking-widest text-[#E3BD26] uppercase">IESTP SAN FRANCISCO DE ASÍS</span>
            <span className="flex items-center gap-1.5 hover:text-rose-150 transition-colors">
              <Phone className="w-3.5 h-3.5 text-[#E3BD26]" /> Central: 01 500 6177
            </span>
            <span className="flex items-center gap-1.5 hover:text-rose-150 transition-colors">
              <Mail className="w-3.5 h-3.5 text-[#E3BD26]" /> admision@iestpsfa.edu.pe
            </span>
            <span className="hidden lg:flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#E3BD26]" /> VMT - Pachacútec Cdra. 50
            </span>
          </div>
          <div className="flex items-center gap-3.5 text-[11px]">
            <span className="text-amber-300 font-extrabold uppercase tracking-wider">RESOLUCIÓN MINEDU R.M. 124-2021</span>
            <div className="flex items-center gap-3">
              <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:text-amber-400" aria-label="Facebook">
                <Facebook className="w-3.5 h-3.5" />
              </a>
              <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:text-amber-400" aria-label="Youtube">
                <Youtube className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION BAR WITH ACTIVE STATES & SUBSECTIONS */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center relative">
          
          {/* Logo Brand area */}
          <div className="flex items-center gap-3 cursor-pointer select-none" onClick={() => { setCurrentTab("inicio"); setMobileMenuOpen(false); }}>
            <svg className="w-11 h-11 sm:w-12 sm:h-12 drop-shadow-md shrink-0" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M50 5 L85 22 C85 58 68 85 50 95 C32 85 15 58 15 22 Z" fill="#9F062A" stroke="#CFA020" strokeWidth="3.5" />
              <path d="M50 10 L78 25 C78 54 64 78 50 87 C36 78 22 54 22 25 Z" fill="#800521" />
              <polygon points="50,22 53,30 61,30 55,35 57,43 50,38 43,43 45,35 39,30 47,30" fill="#E3BD26" />
              <rect x="47" y="32" width="6" height="28" rx="1" fill="#EAEAE4" />
              <rect x="36" y="42" width="28" height="6" rx="1" fill="#EAEAE4" />
              <path d="M32 68 C37 65 45 65 50 68 C55 65 63 65 68 68 L68 76 C63 73 55 73 50 76 C45 73 37 73 32 76 Z" fill="#EAEAE4" stroke="#CFA020" strokeWidth="1" />
              <line x1="50" y1="68" x2="50" y2="76" stroke="#CFA020" strokeWidth="1" />
            </svg>
            <div>
              <h1 className="text-xs sm:text-base font-black text-slate-900 tracking-tight leading-none uppercase">
                IESTP <span className="text-[#9F062A]">SAN FRANCISCO</span>
                <span className="text-[#CFA020] block sm:inline sm:ml-1">DE ASÍS</span>
              </h1>
              <span className="text-[8px] sm:text-[9px] uppercase tracking-widest text-[#9F062A] font-black block mt-1">Luz y Verdad • Villa María del Triunfo</span>
            </div>
          </div>

          {/* DESKTOP NAVIGATION SYSTEM (with dropdown subsections) */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2 text-[12px] xl:text-[13px] font-extrabold text-slate-600">
            
            {/* Inicio Link */}
            <button 
              onClick={() => { setCurrentTab("inicio"); setActiveDropdown(null); }} 
              className={`px-3 py-2 rounded-md transition-all uppercase tracking-wide cursor-pointer ${currentTab === "inicio" ? "text-[#9F062A] bg-rose-50/50 font-black" : "hover:text-[#9F062A] hover:bg-slate-50"}`}
            >
              Inicio
            </button>

            {/* Nosotros Dropdown Item */}
            <div 
              className="relative group py-2"
              onMouseEnter={() => setActiveDropdown("nosotros")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button 
                onClick={() => setCurrentTab("nosotros")}
                className={`px-3 py-2 rounded-md transition-all uppercase tracking-wide inline-flex items-center gap-1.5 cursor-pointer ${currentTab === "nosotros" ? "text-[#9F062A] bg-rose-50/50 font-black" : "hover:text-[#9F062A] hover:bg-slate-50"}`}
              >
                <span>Nosotros</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 mt-0.5 group-hover:rotate-180`} />
              </button>

              <div className="absolute top-full left-0 hidden group-hover:block w-52 bg-white rounded-md border border-slate-200 shadow-xl p-2 z-50 animate-fade-in">
                <button
                  onClick={() => { setCurrentTab("nosotros"); }}
                  className="w-full text-left p-2.5 hover:bg-rose-50 hover:text-[#9F062A] rounded-md transition-colors text-[11px] font-extrabold text-slate-700 uppercase"
                >
                  Misión, Visión y Valores
                </button>
                <button
                  onClick={() => { setCurrentTab("nosotros"); }}
                  className="w-full text-left p-2.5 hover:bg-rose-50 hover:text-[#9F062A] rounded-md transition-colors text-[11px] font-extrabold text-slate-700 uppercase mt-0.5"
                >
                  Autoridades y Dirección
                </button>
              </div>
            </div>

            {/* Programas Dropdown Item */}
            <div 
              className="relative group py-2"
              onMouseEnter={() => setActiveDropdown("programas")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button 
                onClick={() => setCurrentTab("programas")}
                className={`px-3 py-2 rounded-md transition-all uppercase tracking-wide inline-flex items-center gap-1.5 cursor-pointer ${currentTab === "programas" ? "text-[#9F062A] bg-rose-50/50 font-black" : "hover:text-[#9F062A] hover:bg-slate-50"}`}
              >
                <span>Programas</span>
                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 mt-0.5 group-hover:rotate-180" />
              </button>

              <div className="absolute top-full left-0 hidden group-hover:block w-72 bg-white rounded-md border border-slate-200 shadow-xl p-3 z-50 animate-fade-in space-y-2">
                <div>
                  <span className="text-[9px] uppercase font-black text-[#9F062A] tracking-wider block mb-1">Especialidades Profesionales:</span>
                  <button
                    onClick={() => { setSelectedProgramId("electronica"); setCurrentTab("programas"); }}
                    className="w-full text-left p-2.5 hover:bg-rose-50 hover:text-[#9F062A] rounded-md transition-colors text-[11px] font-extrabold text-slate-800 uppercase flex flex-col"
                  >
                    <span>Electricidad Industrial</span>
                    <span className="text-[9px] text-slate-400 font-normal normal-case block mt-0.5">Control de PLCs, Motores y Sistemas de Media Tensión</span>
                  </button>
                  <button
                    onClick={() => { setSelectedProgramId("contabilidad"); setCurrentTab("programas"); }}
                    className="w-full text-left p-2.5 hover:bg-rose-50 hover:text-[#9F062A] rounded-md transition-colors text-[11px] font-extrabold text-slate-800 uppercase flex flex-col mt-1"
                  >
                    <span>Contabilidad Financiera</span>
                    <span className="text-[9px] text-slate-400 font-normal normal-case block mt-0.5">Tributación Empresarial, Auditoría y Normas NIIF</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Admisión Dropdown Item */}
            <div 
              className="relative group py-2"
              onMouseEnter={() => setActiveDropdown("admision")}
              onMouseLeave={() => setActiveDropdown(null)}
            >
              <button 
                onClick={() => { setCurrentTab("admision"); setSubmitSuccessMsg(""); }}
                className={`px-3 py-2 rounded-md transition-all uppercase tracking-wide inline-flex items-center gap-1.5 cursor-pointer ${currentTab === "admision" ? "text-[#9F062A] bg-rose-50/50 font-black" : "hover:text-[#9F062A] hover:bg-slate-50"}`}
              >
                <span>Admisión</span>
                <ChevronDown className="w-3.5 h-3.5 transition-transform duration-200 mt-0.5 group-hover:rotate-180" />
              </button>

              <div className="absolute top-full left-0 hidden group-hover:block w-64 bg-white rounded-md border border-slate-200 shadow-xl p-2.5 z-50 animate-fade-in">
                <button
                  onClick={() => { setCurrentTab("admision"); setSubmitSuccessMsg(""); }}
                  className="w-full text-left p-2.5 hover:bg-rose-50 hover:text-[#9F062A] rounded-md transition-colors text-[11px] font-extrabold text-slate-700 uppercase"
                >
                  Pre-Inscripción 2026-I
                </button>
                <button
                  onClick={() => { setCurrentTab("admision"); setSubmitSuccessMsg(""); }}
                  className="w-full text-left p-2.5 hover:bg-rose-50 hover:text-[#9F062A] rounded-md transition-colors text-[11px] font-extrabold text-slate-700 uppercase mt-0.5"
                >
                  Tasas y Costos Educativos
                </button>
              </div>
            </div>

            {/* Transparencia Item */}
            <button 
              onClick={() => { setCurrentTab("transparencia"); setActiveDropdown(null); }} 
              className={`px-3 py-2 rounded-md transition-all uppercase tracking-wide cursor-pointer ${currentTab === "transparencia" ? "text-[#9F062A] bg-rose-50/50 font-black" : "hover:text-[#9F062A] hover:bg-slate-50"}`}
            >
              Transparencia
            </button>

            {/* Contáctanos Item */}
            <button 
              onClick={() => { setCurrentTab("contactanos"); setActiveDropdown(null); }} 
              className={`px-3 py-2 rounded-md transition-all uppercase tracking-wide cursor-pointer ${currentTab === "contactanos" ? "text-[#9F062A] bg-rose-50/50 font-black" : "hover:text-[#9F062A] hover:bg-slate-50"}`}
            >
              Contáctanos
            </button>

          </nav>

          {/* Intranet Call to Action Button */}
          <div className="hidden lg:flex items-center gap-3">
            <button 
              onClick={onEnterIntranet}
              className="flex items-center gap-2 bg-[#9F062A] hover:bg-[#800521] text-white px-4 py-2 rounded-md font-bold tracking-wide transition-all shadow-md text-xs border border-[#9F062A] cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-[#E3BD26]" /> Intranet Académica
            </button>
          </div>

          {/* MOBILE TOGGLE ICON */}
          <div className="flex items-center lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-600 hover:text-[#9F062A] focus:outline-hidden cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>

        {/* MOBILE RESPONSIVE ACCORDION SYSTEM (Slides-down when open) */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-100 bg-slate-50 animate-fade-in w-full text-xs font-bold text-slate-700 select-none pb-4">
            <div className="px-4 py-2 space-y-2">
              
              {/* Menu items */}
              <button
                onClick={() => { setCurrentTab("inicio"); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-md hover:bg-rose-50 hover:text-[#9F062A] block transition-all uppercase"
              >
                Inicio
              </button>

              {/* Nosotros Mobile Group */}
              <div className="border-b border-slate-200/50 pb-1">
                <span className="px-3 py-1.5 text-[10px] text-slate-400 uppercase font-black block mt-2">Institucional</span>
                <button
                  onClick={() => { setCurrentTab("nosotros"); setMobileMenuOpen(false); }}
                  className="w-full text-left px-5 py-2 hover:bg-rose-50 hover:text-[#9F062A] block transition-all uppercase text-slate-700 font-semibold"
                >
                  Misión, Visión y Valores
                </button>
                <button
                  onClick={() => { setCurrentTab("nosotros"); setMobileMenuOpen(false); }}
                  className="w-full text-left px-5 py-2 hover:bg-rose-50 hover:text-[#9F062A] block transition-all uppercase text-slate-700 font-semibold"
                >
                  Plana Directiva y Autoridades
                </button>
              </div>

              {/* Programas Mobile Group */}
              <div className="border-b border-slate-200/50 pb-1">
                <span className="px-3 py-1.5 text-[10px] text-slate-400 uppercase font-black block mt-2">Nuestras Carreras</span>
                <button
                  onClick={() => { setSelectedProgramId("electronica"); setCurrentTab("programas"); setMobileMenuOpen(false); }}
                  className="w-full text-left px-5 py-2 hover:bg-rose-50 hover:text-[#9F062A] block transition-all uppercase text-slate-700 font-semibold"
                >
                  • Electricidad Industrial
                </button>
                <button
                  onClick={() => { setSelectedProgramId("contabilidad"); setCurrentTab("programas"); setMobileMenuOpen(false); }}
                  className="w-full text-left px-5 py-2 hover:bg-rose-50 hover:text-[#9F062A] block transition-all uppercase text-slate-700 font-semibold"
                >
                  • Contabilidad Financiera
                </button>
              </div>

              {/* Admisión Mobile Group */}
              <div className="border-b border-slate-200/50 pb-1">
                <span className="px-3 py-1.5 text-[10px] text-slate-400 uppercase font-black block mt-2">Admisión 2026</span>
                <button
                  onClick={() => { setCurrentTab("admision"); setSubmitSuccessMsg(""); setMobileMenuOpen(false); }}
                  className="w-full text-left px-5 py-2 hover:bg-rose-50 hover:text-[#9F062A] block transition-all uppercase text-slate-700 font-semibold"
                >
                  Pre-Inscripción Directa
                </button>
                <button
                  onClick={() => { setCurrentTab("admision"); setSubmitSuccessMsg(""); setMobileMenuOpen(false); }}
                  className="w-full text-left px-5 py-2 hover:bg-rose-50 hover:text-[#9F062A] block transition-all uppercase text-slate-700 font-semibold"
                >
                  Tasas & Costos Ordinarios
                </button>
              </div>

              {/* Independent Pages */}
              <button
                onClick={() => { setCurrentTab("transparencia"); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-md hover:bg-rose-50 hover:text-[#9F062A] block transition-all uppercase"
              >
                Transparencia de Ley
              </button>

              <button
                onClick={() => { setCurrentTab("contactanos"); setMobileMenuOpen(false); }}
                className="w-full text-left px-3 py-2.5 rounded-md hover:bg-rose-50 hover:text-[#9F062A] block transition-all uppercase"
              >
                Mesa de Partes / Ubicación
              </button>

              {/* Mobile CTA */}
              <div className="pt-4 border-t border-slate-200 flex flex-col gap-2 px-3">
                <button 
                  onClick={() => { onEnterIntranet(); setMobileMenuOpen(false); }}
                  className="w-full py-2.5 bg-[#9F062A] text-white rounded font-bold uppercase tracking-wider text-center text-xs flex items-center justify-center gap-2 cursor-pointer"
                >
                  <LogIn className="w-4 h-4 text-[#E3BD26]" /> Intranet Académica
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
            {/* Carousel Slider with Motion */}
            <section className="relative h-[490px] bg-slate-950 overflow-hidden">
              <AnimatePresence mode="wait">
                <motion.div 
                  key={currentSlide}
                  initial={{ opacity: 0, scale: 1.02 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.98 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className="absolute inset-0"
                >
                  <img 
                    src={slides[currentSlide].image} 
                    alt={slides[currentSlide].title} 
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover opacity-35 saturate-110" 
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/60 to-transparent" />
                  <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-slate-950 to-transparent" />
                </motion.div>
              </AnimatePresence>

              {/* Slider overlay text with stagger loading */}
              <div className="absolute inset-0 max-w-7xl mx-auto px-6 sm:px-12 flex flex-col justify-center items-start text-white">
                <motion.span 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="bg-[#CFA020] text-slate-950 font-black px-3 py-1 rounded-sm text-[10px] tracking-widest uppercase mb-4 shadow-md"
                >
                  {slides[currentSlide].tagline}
                </motion.span>
                <motion.h2 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                  className="text-3xl sm:text-5xl font-black max-w-3xl leading-tight tracking-tight text-white drop-shadow-lg uppercase"
                >
                  {slides[currentSlide].title}
                </motion.h2>
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.3 }}
                  className="mt-3 text-xs sm:text-sm text-slate-200 max-w-xl font-semibold leading-relaxed"
                >
                  {slides[currentSlide].subtitle}
                </motion.p>
                
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-8 flex flex-wrap gap-3.5"
                >
                  <button 
                    onClick={() => { setCurrentTab("admision"); setSubmitSuccessMsg(""); }}
                    className="bg-[#9F062A] hover:bg-[#800521] text-white px-5 py-3 rounded-md font-black tracking-widest text-[11px] uppercase shadow-lg transition-all hover:scale-[1.03] active:scale-[0.98] inline-flex items-center gap-2 cursor-pointer"
                  >
                    EXAMEN ADMISIÓN ORDINARIO &rarr;
                  </button>
                  <button 
                    onClick={() => setCurrentTab("programas")}
                    className="bg-transparent hover:bg-white/10 text-white font-bold px-5 py-3 rounded-md text-[11px] tracking-widest uppercase border border-white/50 transition-colors cursor-pointer"
                  >
                    Ver Planes Tecnológicos
                  </button>
                </motion.div>
              </div>

              {/* Slider Controls */}
              <button 
                onClick={prevSlide}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/50 hover:bg-slate-900 text-white flex items-center justify-center transition-all cursor-pointer z-10"
                aria-label="Previous Slide"
              >
                <ChevronLeft className="w-5 h-5 hover:text-[#CFA020]" />
              </button>
              <button 
                onClick={nextSlide}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-slate-900/50 hover:bg-slate-900 text-white flex items-center justify-center transition-all cursor-pointer z-10"
                aria-label="Next Slide"
              >
                <ChevronRight className="w-5 h-5 hover:text-[#CFA020]" />
              </button>
            </section>



            {/* Bento Grid highlighting the main features */}
            <section className="py-16 px-4 max-w-7xl mx-auto space-y-16">
              <div className="text-center max-w-3xl mx-auto">
                <span className="text-[#9F062A] font-extrabold text-[11px] uppercase tracking-widest block font-mono">EDUCACIÓN INTEGRAL SERIA</span>
                <h3 className="text-2xl sm:text-3xl font-black mt-2 text-slate-900 uppercase">¿Por qué estudiar en el IESTP San Francisco de Asís?</h3>
                <p className="text-slate-500 mt-2 text-xs sm:text-sm font-semibold max-w-2xl mx-auto leading-relaxed">
                  Ofrecemos planes curriculares orientados a metas reales en el mercado tecnológico de hoy, en el único Instituto Tecnológico con financiamiento público del distrito.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <motion.div 
                  whileHover={{ y: -4 }}
                  className="bg-white p-6 rounded-lg shadow-sm border border-slate-200/60 flex gap-4"
                >
                  <div className="w-10 h-10 bg-[#9F062A]/10 text-[#9F062A] rounded-md flex items-center justify-center shrink-0">
                    <MedalIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase">Licenciamiento R.M. 124-2021</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold mt-1.5">Aprobado plenamente por el MINEDU, garantizando que el diploma oficial tenga validez a nivel nacional en convenios gubernamentales.</p>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -4 }}
                  className="bg-white p-6 rounded-lg shadow-sm border border-slate-200/60 flex gap-4"
                >
                  <div className="w-10 h-10 bg-amber-50 text-amber-700 rounded-md flex items-center justify-center shrink-0">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase">Inserción Laboral Eficaz</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold mt-1.5">Nuestra secretaría académica procesa convenios corporativos activos para inserción inmediata en el sector industrial de Lima Sur.</p>
                  </div>
                </motion.div>

                <motion.div 
                  whileHover={{ y: -4 }}
                  className="bg-white p-6 rounded-lg shadow-sm border border-slate-200/60 flex gap-4"
                >
                  <div className="w-10 h-10 bg-blue-50 text-blue-700 rounded-md flex items-center justify-center shrink-0">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-slate-900 uppercase">Costo Educativo Público</h4>
                    <p className="text-xs text-slate-500 leading-relaxed font-semibold mt-1.5">Al ser un instituto tecnológico público oficial, el costo mensual de pensiones es S/. 0.00, promoviendo el acceso democrático.</p>
                  </div>
                </motion.div>
              </div>

              {/* Quantitative values section - UPDATED to 02 Careers */}
              <div className="bg-slate-950 rounded-xl p-8 text-white grid grid-cols-2 md:grid-cols-4 gap-6 text-center border-b-4 border-[#CFA020]">
                <div>
                  <span className="text-3xl font-black text-[#CFA020] block font-mono">100%</span>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">Licenciado por Minedu</p>
                </div>
                <div>
                  <span className="text-3xl font-black text-[#E3BD26] block font-mono">02</span>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">Especialidades Activas</p>
                </div>
                <div>
                  <span className="text-3xl font-black text-[#CFA020] block font-mono">30+</span>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">Años de Logros Locales</p>
                </div>
                <div>
                  <span className="text-3xl font-black text-[#E3BD26] block font-mono">S/. 120</span>
                  <p className="text-[10px] text-slate-400 font-extrabold uppercase tracking-widest mt-1">Costo Examen Ordinario</p>
                </div>
              </div>
            </section>

            {/* ================= PROGRAMAS Y PREGUNTAS FRECUENTES SECTION ================= */}
            <section className="bg-slate-100/75 border-t border-slate-200 py-16 px-4">
              <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                
                {/* Left Side: Programas de Estudio */}
                <div className="lg:col-span-7 space-y-6">
                  <div className="border-l-4 border-[#9F062A] pl-3">
                    <span className="text-[#9F502A] text-[10px] font-black tracking-widest uppercase font-mono">IESTP SAN FRANCISCO DE ASÍS</span>
                    <h3 className="text-xl sm:text-2xl font-black uppercase text-slate-950 tracking-tight">Programas de Estudio</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-2">
                    {careersDetail.map((career) => (
                      <motion.div 
                        key={career.id}
                        whileHover={{ y: -6 }}
                        className="bg-white rounded-lg border border-slate-250 overflow-hidden shadow-xs flex flex-col justify-between"
                      >
                        <div className="relative h-40 bg-slate-100">
                          <img 
                            src={career.image} 
                            alt={career.name} 
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover" 
                          />
                          <div className="absolute top-2 right-2 bg-slate-900/80 text-[#CFA020] text-[9px] font-mono uppercase px-2 py-0.5 rounded font-black">
                            {career.hours}
                          </div>
                        </div>
                        
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <span className="p-1 rounded bg-slate-100 text-[#9F062A]">
                                {career.icon}
                              </span>
                              <h4 className="text-sm font-black text-slate-950 uppercase tracking-tight truncate leading-none">
                                {career.name}
                              </h4>
                            </div>
                            <p className="text-[11px] text-slate-600 leading-relaxed font-semibold line-clamp-3">
                              {career.profile}
                            </p>
                          </div>

                          <div className="pt-2">
                            <button
                              onClick={() => {
                                setSelectedProgramId(career.id);
                                setCurrentTab("programas");
                              }}
                              className="w-full bg-slate-900 hover:bg-[#9F062A] text-white hover:text-white font-extrabold text-[10px] tracking-widest uppercase py-2.5 rounded-sm transition-all text-center cursor-pointer select-none"
                            >
                              Más Información &rarr;
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Right Side: Preguntas Frecuentes Accordion with Framer Motion */}
                <div className="lg:col-span-5 space-y-6">
                  <div className="border-l-4 border-[#CFA020] pl-3">
                    <span className="text-[#9F062A] text-[10px] font-black tracking-widest uppercase font-mono">DUDAS Y ORIENTACIÓN AL POSTULANTE</span>
                    <h3 className="text-xl sm:text-2xl font-black uppercase text-slate-950 tracking-tight">Preguntas Frecuentes</h3>
                  </div>

                  <div className="space-y-3">
                    {[
                      {
                        id: 1,
                        question: "¿Qué títulos oficiales otorga el instituto?",
                        answer: "Otorgamos Título Profesional Técnico a Nombre de la Nación en las especialidades de Contabilidad y Electricidad Industrial, respaldado por el Ministerio de Educación (MINEDU) mediante la R.M. N° 124-2021-MINEDU para todo el territorio de la República."
                      },
                      {
                        id: 2,
                        question: "¿Cuál es la duración formal de la carrera?",
                        answer: "Cada carrera profesional técnica tiene una duración de 3 años de estudio teórico-práctico, organizados en 6 Ciclos Académicos Semestrales consecutivos regulados legalmente."
                      },
                      {
                        id: 3,
                        question: "¿El instituto cobra mensualidades o pensión?",
                        answer: "No. Al ser un Instituto de Educación Superior Tecnológico Público oficial del MINEDU, el costo mensual por pensión de enseñanza es de S/. 0.00. El alumno únicamente solventa las tasas semestrales de matrícula de S/. 250."
                      },
                      {
                        id: 4,
                        question: "¿Qué requisitos se necesitan para postular?",
                        answer: "Se requiere presentar copia legible de DNI, el Certificado Oficial de Estudios de Secundaria aprobada, Partida de Nacimiento física de archivo civil, y una fotografía digital tamaño carné formal."
                      },
                      {
                        id: 5,
                        question: "¿Dónde se rinde el Examen de Admisión?",
                        answer: "El Examen General de Admisión Ordinaria se rinde a través de nuestra Intranet Académica con control programado. Los pre-inscritos pueden ingresar con su DNI para completar el test interactivo simulado."
                      }
                    ].map((faq) => {
                      const isOpen = expandedFaqId === faq.id;
                      return (
                        <div 
                          key={faq.id} 
                          className="bg-white rounded-lg border border-slate-200 overflow-hidden shadow-2xs transition-all hover:border-slate-350"
                        >
                          <button
                            onClick={() => setExpandedFaqId(isOpen ? null : faq.id)}
                            className="w-full text-left p-4 flex justify-between items-center gap-3 select-none cursor-pointer"
                          >
                            <span className="text-xs font-bold text-slate-900 uppercase tracking-tight">
                              {faq.question}
                            </span>
                            <ChevronDown 
                              className={`w-4 h-4 text-[#9F062A] shrink-0 transition-transform duration-300 ${
                                isOpen ? "rotate-180" : ""
                              }`} 
                            />
                          </button>

                          <AnimatePresence initial={false}>
                            {isOpen && (
                              <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.25, ease: "easeInOut" }}
                              >
                                <div className="p-4 pt-0 border-t border-slate-100 text-[11px] font-medium leading-relaxed text-slate-650">
                                  {faq.answer}
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })}
                  </div>
                </div>

              </div>
            </section>
          </div>
        )}

        {/* ================= NOSOTROS VIEW ================= */}
        {currentTab === "nosotros" && (
          <div className="py-12 max-w-7xl mx-auto px-4 sm:px-8 space-y-12">
            <div className="bg-slate-900 text-white rounded-lg p-8 shadow-md relative overflow-hidden border-l-4 border-[#9F062A]">
              <div className="max-w-xl space-y-2 relative z-10">
                <span className="text-[#CFA020] text-xs font-black tracking-widest font-mono uppercase">QUIENES SOMOS</span>
                <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">IESTP San Francisco de Asís</h2>
                <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
                  Líderes de la formación técnica formal en el cono sur de Lima, comprometidos con los valores éticos-pastorales de nuestra comunidad educativa y los requerimientos industriales modernos.
                </p>
              </div>
              <div className="absolute right-0 bottom-0 top-0 w-1/3 bg-[#9F062A]/5 pointer-events-none hidden md:block" />
            </div>

            {/* Mission Vision Value grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-2">
                <h3 className="text-sm font-black text-[#9F062A] tracking-widest uppercase border-b pb-2 flex items-center gap-1.5">
                  <MedalIcon className="w-4 h-4 shrink-0" /> Nuestra Misión
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  Brindar una formación profesional técnica integral basada en competencias avanzadas y valores humanistas y cristianos, promoviendo la investigación aplicada, el emprendimiento y el servicio solidario con la comunidad, respondiendo a la demanda ocupacional y facilitando la inserción de egresados al aparato productivo.
                </p>
              </div>

              <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-2">
                <h3 className="text-sm font-black text-[#9F062A] tracking-widest uppercase border-b pb-2 flex items-center gap-1.5">
                  <Compass className="w-4 h-4 shrink-0" /> Nuestra Visión
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed font-semibold">
                  Al consolidarnos hacia el 2028, seremos un instituto superior tecnológico público líder y acreditado en Lima Metropolitana, referente nacional por su excelencia innovadora, docentes de alta especialización y una infraestructura física integral de alto nivel, formando egresados competentes que actúan con ética ambiental y vocación de paz.
                </p>
              </div>
            </div>

            {/* Plana Directiva and Organigrama representation */}
            <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-6">
              <div className="border-b pb-3">
                <h3 className="text-sm font-black text-slate-950 uppercase tracking-widest">Plana Directiva y Autoridades del Campus IESTP</h3>
                <p className="text-[11px] text-[#CFA020] font-bold">Dirección General y Consejo de Vigilancia Académica</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs font-semibold">
                <div className="p-4 bg-slate-50 border rounded-md">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Director General</span>
                  <h4 className="font-black text-slate-900 mt-1">Mag. Roberto Salcedo Villamil</h4>
                  <p className="text-slate-500 font-medium text-[11px] mt-0.5">Gestión Administrativa y Representación de la Entidad</p>
                </div>
                <div className="p-4 bg-slate-50 border rounded-md">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Jefa de Secretaría Académica</span>
                  <h4 className="font-black text-slate-900 mt-1">Lic. Gladys Melgarejo Torres</h4>
                  <p className="text-slate-500 font-medium text-[11px] mt-0.5">Control de Archivos Escolares, Emisión de Diplomas</p>
                </div>
                <div className="p-4 bg-slate-50 border rounded-md">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Coordinador de Egresos</span>
                  <h4 className="font-black text-slate-900 mt-1">Ing. Walter Cárdenas Rojas</h4>
                  <p className="text-slate-500 font-medium text-[11px] mt-0.5">Convenios y Prácticas Pre-Profesionales de Estudiantes</p>
                </div>
                <div className="p-4 bg-slate-50 border rounded-md">
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Jefe de Área de Sistemas</span>
                  <h4 className="font-black text-slate-900 mt-1">Ing. Miguel Ángel Ramos</h4>
                  <p className="text-slate-500 font-medium text-[11px] mt-0.5">Supervisión de Plataformas y Currícula Tecnológica</p>
                </div>
              </div>
            </div>

            {/* Core Values Section */}
            <div className="bg-slate-50 p-6 rounded-lg border border-slate-200 space-y-4">
              <span className="text-xs uppercase font-extrabold text-[#9F062A] tracking-wider block text-center">NUESTROS VALORES CORPORATIVOS</span>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-white border border-slate-200 rounded shadow-2xs">
                  <h4 className="font-black text-[#9F062A] text-xs uppercase">1. Luz y Verdad</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">Proceder ético y honesto.</p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded shadow-2xs">
                  <h4 className="font-black text-[#9F062A] text-xs uppercase">2. Disciplina</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">Cumplimiento formal de metas.</p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded shadow-2xs">
                  <h4 className="font-black text-[#9F062A] text-xs uppercase">3. Innovación</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">Adaptación tecnológica ágil.</p>
                </div>
                <div className="p-3 bg-white border border-slate-200 rounded shadow-2xs">
                  <h4 className="font-black text-[#9F062A] text-xs uppercase">4. Vocación</h4>
                  <p className="text-[11px] text-slate-500 font-medium mt-1">Servicio comprometido.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= PROGRAMAS VIEW ================= */}
        {currentTab === "programas" && (
          <div className="py-12 max-w-7xl mx-auto px-4 sm:px-8 space-y-8">
            <div className="border-b border-slate-200 pb-4 text-center">
              <span className="text-[#9F062A] text-xs font-black tracking-widest uppercase">CATÁLOGO ACADÉMICO COLEGIO SUPERIOR</span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-slate-950 mt-1">Planes de Estudio Autorizados</h2>
              <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-1">Seleccione un programa de estudio abajo para revisar su itinerario formativo, horas totales y perfil laboral proyectado.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Selector List */}
              <div className="lg:col-span-4 bg-white p-4 rounded-lg border border-slate-200 shadow-2xs">
                <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest p-2 block border-b mb-2">Especialidades Profesionales</span>
                
                <div className="space-y-1">
                  {careersDetail.map((career) => (
                    <button
                      key={career.id}
                      onClick={() => setSelectedProgramId(career.id)}
                      className={`w-full text-left p-3 rounded-md text-xs font-bold transition-all flex items-center gap-3 cursor-pointer select-none ${
                        selectedProgramId === career.id
                          ? "bg-[#9F062A] text-white shadow"
                          : "text-slate-750 hover:bg-slate-100"
                      }`}
                    >
                      <div className={`p-1 rounded-sm shrink-0 ${selectedProgramId === career.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-600"}`}>
                        {career.icon}
                      </div>
                      <span className="truncate">{career.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Detail Card */}
              <div className="lg:col-span-8 bg-white p-6 rounded-lg border border-slate-200 shadow-xs space-y-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b pb-4 gap-4">
                  <div>
                    <span className="bg-[#FFFDF4] text-[#CFA020] border border-[#CFA020]/30 text-[10px] font-black uppercase px-2 py-0.5 rounded-sm">
                      {activeProgramData.hours} • Plan Curricular Oficial
                    </span>
                    <h3 className="text-lg font-black text-slate-900 uppercase mt-2">{activeProgramData.name}</h3>
                  </div>
                  
                  <div className="bg-slate-50 p-2 border rounded-md text-[11px] font-mono text-slate-600">
                    Sueldo Estimado: <span className="font-bold text-[#9F062A]">{activeProgramData.salaryEst}</span>
                  </div>
                </div>

                {/* Profile explanation */}
                <div className="space-y-1.5 font-semibold text-xs leading-relaxed text-slate-700">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest">Perfil del Egresado Técnico</span>
                  <p>{activeProgramData.profile}</p>
                </div>

                {/* Syllabus breakdown */}
                <div className="space-y-3 pt-2">
                  <span className="text-[10px] text-slate-400 uppercase font-black tracking-widest block border-b pb-1">Unidades de Competencia Modular</span>
                  
                  <div className="space-y-2 text-xs font-semibold text-slate-700">
                    {activeProgramData.careerPath.map((path, idx) => (
                      <div key={idx} className="p-3 bg-slate-50 border rounded-md flex flex-col sm:flex-row gap-3">
                        <span className="text-[#9F062A] uppercase font-black font-mono shrink-0 sm:w-20">{path.cycle}:</span>
                        <p className="text-slate-600 text-[11px] font-medium leading-relaxed">{path.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button 
                    onClick={() => { setCurrentTab("admision"); setSubmitSuccessMsg(""); }} 
                    className="bg-[#9F062A] hover:bg-[#800521] text-white font-black text-xs uppercase tracking-widest px-4 py-2.5 rounded shadow-sm cursor-pointer"
                  >
                    Postular a esta Carrera Ahora &rarr;
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= ADMISION Y MATRICULA VIEW ================= */}
        {currentTab === "admision" && (
          <div className="py-12 max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
            <div className="border-b border-slate-200 pb-4 text-center">
              <span className="text-[#9F062A] text-xs font-black tracking-widest uppercase">
                {displayPeriod ? `PROCESO ADMISIÓN ORDINARIA ${displayPeriod.name}` : "PROCESO DE ADMISIÓN INSTITUCIONAL"}
              </span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-slate-950 mt-1">Convocatoria y Expedientes Escolares</h2>
              <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-1">
                {displayPeriod 
                  ? `Examen General de Admisión programado para el periodo ${displayPeriod.name}. Revise requisitos institucionales y pre-inscríbase de forma simulada en línea.`
                  : "Estado de las convocatorias para los exámenes de admisión ordinaria."}
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {activePeriod && (
                <div className="lg:col-span-12 bg-white rounded-lg border border-slate-200 shadow-3xs p-5 flex flex-col sm:flex-row items-center justify-center gap-4 text-center sm:text-left">
                  {/* Only Pre-inscripción shown on landing page */}
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="p-3 bg-rose-50 rounded-full border border-rose-100 text-[#9F062A]">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div className="space-y-1">
                      <span className="text-[#9F062A] text-[10px] font-black tracking-widest uppercase block">Pre-Inscripción Virtual</span>
                      <div className="text-sm sm:text-base font-extrabold text-slate-950 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                        <span className="text-slate-500 font-medium text-xs sm:text-sm">Plazo de registro en línea:</span>
                        <span className="text-[#9F062A] font-black tracking-tight">
                          {activePeriod.preEnrollmentStartDate ? new Date(activePeriod.preEnrollmentStartDate + "T12:00:00").toLocaleDateString('es-PE', { day: 'numeric', month: 'long' }) : "-"} al {activePeriod.preEnrollmentEndDate ? new Date(activePeriod.preEnrollmentEndDate + "T12:00:00").toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Registro de Ficha Simulada Obligatoria para Postulantes</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Left Column: Requirements & Info */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Cost Info widget */}
                <div className="bg-slate-900 text-white p-6 rounded-lg shadow-sm border-t-4 border-[#CFA020]">
                  <span className="text-[#CFA020] text-[10px] font-mono tracking-widest uppercase font-black block">TASAS ADMINISTRATIVAS SOCIALES - 2026</span>
                  
                  <div className="mt-4 space-y-3 text-xs font-semibold">
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span>1. Derecho de Examen Ordinario</span>
                      <span className="text-[#CFA020] font-black">S/. 120.00</span>
                    </div>
                    <div className="flex justify-between border-b border-slate-800 pb-2">
                      <span>2. Derecho de Matrícula (Semestral)</span>
                      <span className="text-[#CFA020] font-black">S/. 250.00</span>
                    </div>
                    <div className="flex justify-between pb-1">
                      <span>3. Pensiones o Mensualidades</span>
                      <span className="text-emerald-400 font-extrabold font-mono">COSTO S/. 0.00 (PÚBLICO)</span>
                    </div>
                  </div>
                </div>

                {/* Guide to Pre-Admission Simulation */}
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs space-y-4">
                  <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest border-b pb-2">Guía de Pre-Inscripción 2026</h3>
                  
                  <div className="space-y-4 text-xs font-semibold text-slate-705">
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-rose-50 text-[#9F062A] flex items-center justify-center font-mono font-black text-[11px] shrink-0 mt-0.5">
                        01
                      </div>
                      <div>
                        <span className="text-slate-900 block font-bold uppercase text-[10px] tracking-tight">Formulario de Registro</span>
                        <p className="text-slate-500 font-medium text-[11px] leading-relaxed mt-0.5">
                          Rellene su DNI, nombres completos, correo y teléfono de contacto para iniciar.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-rose-50 text-[#9F062A] flex items-center justify-center font-mono font-black text-[11px] shrink-0 mt-0.5">
                        02
                      </div>
                      <div>
                        <span className="text-slate-900 block font-bold uppercase text-[10px] tracking-tight">Asignación de Credenciales</span>
                        <p className="text-slate-500 font-medium text-[11px] leading-relaxed mt-0.5">
                          El sistema del IESTP generará una credencial temporal automáticamente (Su DNI y clave temporal "123").
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-rose-50 text-[#9F062A] flex items-center justify-center font-mono font-black text-[11px] shrink-0 mt-0.5">
                        03
                      </div>
                      <div>
                        <span className="text-slate-900 block font-bold uppercase text-[10px] tracking-tight">Acceso a la Intranet de Admisión</span>
                        <p className="text-slate-500 font-medium text-[11px] leading-relaxed mt-0.5">
                          Inicie sesión en el portal utilizando sus credenciales temporales generadas.
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded-full bg-rose-50 text-[#9F062A] flex items-center justify-center font-mono font-black text-[11px] shrink-0 mt-0.5">
                        04
                      </div>
                      <div>
                        <span className="text-slate-900 block font-bold uppercase text-[10px] tracking-tight">Requisitos y Examen</span>
                        <p className="text-slate-500 font-medium text-[11px] leading-relaxed mt-0.5">
                          Dentro de su espacio privado podrá subir sus 4 documentos obligatorios de admisión y rendir el Examen virtual.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Pre-inscripcion Form */}
              <div className="lg:col-span-7 bg-white p-6 border border-slate-200 rounded-lg shadow-sm space-y-4 relative">
                {!activePeriod ? (
                  <div className="py-8 px-4 text-center space-y-6 animate-fade-in-down">
                    <div className="w-14 h-14 rounded-full bg-amber-50 text-[#CFA020] flex items-center justify-center mx-auto shadow-3xs border border-amber-100">
                      <ShieldAlert className="w-7 h-7 text-[#9F062A]" />
                    </div>

                    {displayPeriod?.status === "EXAMEN" ? (
                      <>
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black uppercase text-[#9F062A] tracking-wider block">PROCESO {displayPeriod.name}</span>
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                            Evaluación de Admisión en Curso
                          </h3>
                          <p className="text-[11px] text-slate-500 font-semibold leading-normal max-w-sm mx-auto">
                            El periodo de pre-inscripción y registro virtual ha culminado. El sistema se encuentra procesando las carpetas de postulantes.
                          </p>
                        </div>
                        <div className="bg-[#9F062A]/5 border border-[#9F062A]/20 p-5 rounded-lg text-xs font-bold text-[#9F062A] leading-relaxed max-w-md mx-auto uppercase tracking-wide text-left space-y-2">
                          <p className="font-extrabold text-[#9F062A] text-center text-[10px]">¡ATENCIÓN POSTULANTE REGISTRADO!</p>
                          <p className="text-[11px] normal-case text-slate-800">
                            El Examen General de Admisión Virtual está programado para el <strong>{displayPeriod.admissionDate ? new Date(displayPeriod.admissionDate + "T12:00:00").toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}</strong>. Por favor, inicie sesión en la intranet con su DNI para validar sus archivos y resolver el simulacro de examen.
                          </p>
                        </div>
                      </>
                    ) : displayPeriod?.status === "MATRICULA" ? (
                      <>
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black uppercase text-indigo-600 tracking-wider block">PROCESO {displayPeriod.name}</span>
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                            Periodo de Matrícula Regular
                          </h3>
                          <p className="text-[11px] text-slate-500 font-semibold leading-normal max-w-sm mx-auto">
                            El examen general de admisión ha finalizado. El registro escolar de ingresantes y validaciones de pago se encuentra habilitado.
                          </p>
                        </div>
                        <div className="bg-indigo-50/80 border border-indigo-150 p-5 rounded-lg text-xs font-bold text-indigo-900 leading-relaxed max-w-md mx-auto uppercase tracking-wide text-left space-y-2">
                          <p className="font-black text-indigo-850 text-center text-[10px] tracking-wider">RECEPCIÓN DE EXPEDIENTES ESCOLARES</p>
                          <p className="text-[11px] normal-case text-slate-800">
                            La recepción obligatoria de carpetas de matrícula virtual vence el <strong>{displayPeriod.enrollmentEndDate ? new Date(displayPeriod.enrollmentEndDate + "T12:00:00").toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}</strong>. Acceda con sus credenciales de ingresante para subir sus documentos requeridos.
                          </p>
                        </div>
                      </>
                    ) : displayPeriod?.status === "CERRADO" ? (
                      <>
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black uppercase text-slate-500 tracking-wider block">PROCESO {displayPeriod.name}</span>
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                            Proceso de Admisión Concluido
                          </h3>
                          <p className="text-[11px] text-slate-500 font-semibold leading-normal max-w-sm mx-auto">
                            Las vacante institucionales para todos los programas han sido cubiertas al 100% para este ciclo escolar.
                          </p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 p-5 rounded-lg text-xs font-black text-slate-700 leading-relaxed max-w-md mx-auto uppercase tracking-wide shadow-3xs text-center">
                          Inicio de Clases: {displayPeriod.classesStartDate ? new Date(displayPeriod.classesStartDate + "T12:00:00").toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' }) : "-"}
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="space-y-1.5">
                          <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">
                            Inscripciones Cerradas
                          </h3>
                          <p className="text-[11px] text-slate-500 font-semibold leading-normal max-w-sm mx-auto">
                            Actualmente no contamos con un proceso de postulación ordinaria activo en el sistema académico.
                          </p>
                        </div>
                        <div className="bg-rose-50/70 border border-rose-100/80 p-5 rounded-lg text-xs font-black text-[#9F062A] leading-relaxed max-w-md mx-auto uppercase tracking-wide shadow-3xs">
                          Pronto se reaperturarán los exámenes de admisión
                        </div>
                      </>
                    )}

                    <p className="text-[10px] text-slate-400 font-bold max-w-xs mx-auto">
                      La oficina de secretaría académica e informes habilitará los próximos periodos de admisión o convocatorias según calendario oficial.
                    </p>
                  </div>
                ) : (
                  <>
                    <div className="border-b pb-2">
                      <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Formulario de Pre-Inscripción {activePeriod.name}</h3>
                      <p className="text-[11px] text-slate-500">Regístrese en línea. Esto generará una cuenta de postulante simulada en el almacenamiento del navegador.</p>
                    </div>

                    {submitSuccessMsg ? (
                      <div className="p-4 bg-emerald-50 rounded-md border border-emerald-250 space-y-3 font-semibold text-xs text-slate-800 leading-relaxed">
                        <div className="flex gap-2 items-center text-emerald-800">
                          <CheckSquare className="w-5 h-5 text-emerald-600 shrink-0" />
                          <span className="font-black text-sm text-slate-900">¡REGISTRO CON ÉXITO!</span>
                        </div>
                        <p>{submitSuccessMsg}</p>
                        <div className="pt-3 flex gap-2">
                          <button 
                            onClick={onEnterIntranet} 
                            className="bg-[#9F062A] hover:bg-[#800521] text-white font-black text-[11px] px-4 py-2 rounded uppercase tracking-wider"
                          >
                            Ingresar a la Intranet de Admisión &rarr;
                          </button>
                          <button 
                            onClick={() => setSubmitSuccessMsg("")} 
                            className="bg-slate-200 text-slate-705 font-bold text-[11px] px-3 py-2 rounded"
                          >
                            Registrar Otro
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form onSubmit={handlePreEnrollmentSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-700 mb-1 font-bold">DNI del Postulante *</label>
                            <input 
                              type="text" 
                              required 
                              pattern="\d{8}"
                              maxLength={8}
                              placeholder="Ej: 77777777" 
                              value={dniInput} 
                              onChange={(e) => setDniInput(e.target.value.replace(/\D/g, ""))} 
                              className="w-full px-3 py-2 border rounded bg-slate-50 border-slate-300" 
                            />
                          </div>
                          <div>
                            <label className="block text-slate-700 mb-1 font-bold">Carrera de Interés *</label>
                            <select 
                              value={programSelection} 
                              onChange={(e) => setProgramSelection(e.target.value)} 
                              className="w-full px-3 py-2 border rounded bg-slate-50 border-slate-300"
                            >
                              {careersDetail.map((c) => (
                                <option key={c.id} value={c.id}>{c.name}</option>
                              ))}
                            </select>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-700 mb-1 font-bold">Nombres Completos *</label>
                            <input 
                              type="text" 
                              required 
                              placeholder="Ej: Juan Andrés" 
                              value={nameInput} 
                              onChange={(e) => setNameInput(e.target.value)} 
                              className="w-full px-3 py-2 border rounded bg-slate-50 border-slate-300" 
                            />
                          </div>
                          <div>
                            <label className="block text-slate-700 mb-1 font-bold">Apellidos Completos *</label>
                            <input 
                              type="text" 
                              required 
                              placeholder="Ej: Pérez García" 
                              value={lastNameInput} 
                              onChange={(e) => setLastNameInput(e.target.value)} 
                              className="w-full px-3 py-2 border rounded bg-slate-50 border-slate-300" 
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-slate-700 mb-1 font-bold">Correo Electrónico *</label>
                            <input 
                              type="email" 
                              required 
                              placeholder="juan@gmail.com" 
                              value={emailInput} 
                              onChange={(e) => setEmailInput(e.target.value)} 
                              className="w-full px-3 py-2 border rounded bg-slate-50 border-slate-300" 
                            />
                          </div>
                          <div>
                            <label className="block text-slate-700 mb-1 font-bold">Celular / Celulares Contacto *</label>
                            <input 
                              type="tel" 
                              required 
                              placeholder="Ej: 987654321" 
                              value={phoneInput} 
                              onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, ""))} 
                              className="w-full px-3 py-2 border rounded bg-slate-50 border-slate-300" 
                            />
                          </div>
                        </div>

                        <button 
                          type="submit" 
                          className="w-full bg-[#9F062A] hover:bg-[#800521] text-white py-2.5 rounded font-black uppercase text-[10px] tracking-widest shadow cursor-pointer"
                        >
                          Pre-inscribirse
                        </button>
                      </form>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ================= TRANSPARENCIA VIEW ================= */}
        {currentTab === "transparencia" && (
          <div className="py-12 max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
            <div className="bg-slate-900 text-white rounded-lg p-8 shadow-md relative overflow-hidden border-b-4 border-[#CFA020]">
              <div className="max-w-2xl space-y-2 relative z-10">
                <span className="#CFA020 text-xs font-black tracking-widest font-mono uppercase text-[#CFA020]">REQUISITO DE LEY N° 30512</span>
                <h2 className="text-2xl sm:text-3xl font-black uppercase text-white tracking-tight">Portal de Transparencia Tecnológica</h2>
                <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed">
                  Cumplimos estrictamente las directivas de publicación periódica de documentos de gestión, resoluciones directivas de vacantes, y reglamentos académicos oficiales actualizados del IESTP San Francisco de Asís.
                </p>
              </div>
            </div>

            {/* Simulated Transparency PDF List Accordions / Rows */}
            <div className="bg-white rounded-lg border border-slate-200 shadow-xs divide-y">
              {[
                { title: "Resolución Ministerial N° 124-2021-MINEDU", type: "Licenciamiento Institucional", size: "2.4 MB", date: "15 de Mayo de 2021" },
                { title: "Reglamento Académico del Estudiante SFA", type: "Normativa Interna", size: "1.8 MB", date: "10 de Enero de 2026" },
                { title: "Plan Operativo Institucional Anual (POI 2026)", type: "Planificación", size: "4.1 MB", date: "05 de Diciembre de 2025" },
                { title: "Tupa de Derechos Administrativos del IESTP", type: "Tasas y Trámites", size: "850 KB", date: "19 de Marzo de 2026" },
                { title: "Presupuesto Anual de la Entidad e Ingresos por Derechos", type: "Finanzas Públicas", size: "3.2 MB", date: "30 de Enero de 2026" },
                { title: "Estatuto Organigrama Oficial - SFA", type: "Estructura Organizativa", size: "1.1 MB", date: "24 de Noviembre de 2025" }
              ].map((doc, idx) => (
                <div key={idx} className="p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 hover:bg-slate-50/80 transition-colors">
                  <div className="space-y-1">
                    <span className="text-[10px] bg-slate-100 text-slate-600 font-black uppercase tracking-wide px-2 py-0.5 rounded border border-slate-200">
                      {doc.type}
                    </span>
                    <h3 className="font-bold text-slate-900 text-xs sm:text-sm uppercase">{doc.title}</h3>
                    <p className="text-[10px] text-slate-450 font-semibold">Publicado: {doc.date} | Tamaño de Archivo: {doc.size}</p>
                  </div>

                  <button 
                    onClick={() => alert(`Simulación de descarga del documento "${doc.title}". Archivo PDF seguro.`)}
                    className="flex items-center gap-1.5 border border-[#9F062A]/30 hover:bg-[#9F062A] hover:text-white text-[#9F062A] rounded px-3 py-1.5 text-xs font-black transition-all cursor-pointer select-none shrink-0"
                  >
                    <FileCheck className="w-3.5 h-3.5" /> Descargar PDF
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= CONTACTANOS VIEW ================= */}
        {currentTab === "contactanos" && (
          <div className="py-12 max-w-7xl mx-auto px-4 sm:px-8 space-y-10">
            <div className="border-b border-slate-200 pb-4 text-center">
              <span className="text-[#9F062A] text-xs font-black tracking-widest uppercase">MESA EN LÍNEA Y LOCALIDAD</span>
              <h2 className="text-2xl sm:text-3xl font-black uppercase text-slate-950 mt-1">Comuníquese con Secretaría</h2>
              <p className="text-slate-500 text-xs sm:text-sm font-semibold mt-1">Escríbanos directamente o ubíquenos en nuestra sede central física en Villa María del Triunfo.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              
              {/* Sede Contact Info */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white p-6 rounded-lg border border-slate-200 shadow-2xs space-y-4 text-xs font-semibold text-slate-700">
                  <h3 className="text-xs uppercase font-black text-[#9F062A] tracking-wider border-b pb-1">Sede de Operaciones Villa María del Triunfo</h3>
                  
                  <div className="space-y-3">
                    <div className="flex gap-2.5">
                      <MapPin className="w-5 h-5 text-[#9F062A] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-slate-900 block">Dirección Física:</span>
                        <p className="text-slate-550 mt-0.5">Av. prolongación Pachacútec cuadra 50 - Distrito de Villa María del Triunfo (VMT), Lima, Perú.</p>
                      </div>
                    </div>

                    <div className="flex gap-2.5">
                      <Phone className="w-5 h-5 text-[#9F062A] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-slate-900 block">Teléfonos Mesa:</span>
                        <p className="text-slate-550 mt-0.5">01 500 6177 | Celular Soporte: 999-555-123</p>
                      </div>
                    </div>

                    <div className="flex gap-2.5">
                      <Mail className="w-5 h-5 text-[#9F062A] shrink-0 mt-0.5" />
                      <div>
                        <span className="font-extrabold text-slate-900 block">Correos Administrativos:</span>
                        <p className="text-slate-550 mt-0.5">sec.academicaiestpsfa@gmail.com | admision@iestpsfa.edu.pe</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Google Map mock blueprint */}
                <div className="bg-slate-100 p-8 rounded-lg border-2 border-dashed border-slate-300 text-center space-y-3 relative overflow-hidden">
                  <div className="absolute inset-0 bg-slate-950/5" />
                  <MapPin className="w-10 h-10 text-[#CFA020] mx-auto animate-bounce relative z-10" />
                  <h4 className="font-black text-xs text-slate-900 uppercase relative z-10">Mapa del Campus SFA</h4>
                  <p className="text-[11px] text-slate-500 font-medium max-w-xs mx-auto relative z-10 leading-relaxed">
                    Ubicado en la arteria principal Prolongación Pachacútec, contiguo al paradero de buses de Pachacútec Cdra 50.
                  </p>
                  <span className="font-mono text-[9px] bg-slate-200 text-slate-600 px-2 py-0.5 rounded inline-block relative z-10">COORD: -12.16432, -76.93627</span>
                </div>
              </div>

              {/* Message submit form */}
              <div className="lg:col-span-7 bg-white p-6 border border-slate-200 rounded-lg shadow-sm space-y-4">
                <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest block border-b pb-1">Mesa de Partes Virtuales</span>
                
                {contactSuccessMsg ? (
                  <div className="p-4 bg-emerald-50 rounded border border-emerald-200 text-xs font-semibold text-slate-800 leading-relaxed">
                    <p className="text-emerald-800 font-extrabold text-sm mb-1 uppercase">✓ Formulario procesado</p>
                    <p>{contactSuccessMsg}</p>
                    <button 
                      onClick={() => setContactSuccessMsg("")} 
                      className="mt-3 bg-slate-250 text-slate-700 px-3 py-1.5 rounded text-[11px]"
                    >
                      Escribir otro mensaje
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
                    <div>
                      <label className="block text-slate-700 mb-1">Nombre Completo *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="Ej: Daniel Castillo" 
                        value={contactName} 
                        onChange={(e) => setContactName(e.target.value)} 
                        className="w-full px-3 py-2 border rounded bg-slate-50 border-slate-300" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1">Correo Inteligente *</label>
                      <input 
                        type="email" 
                        required 
                        placeholder="daniel@gmail.com" 
                        value={contactEmail} 
                        onChange={(e) => setContactEmail(e.target.value)} 
                        className="w-full px-3 py-2 border rounded bg-slate-50 border-slate-300" 
                      />
                    </div>
                    <div>
                      <label className="block text-slate-700 mb-1">Cuerpo del Mensaje o Consulta *</label>
                      <textarea 
                        required 
                        rows={4}
                        placeholder="Por favor, escriba aquí de forma detallada su consulta, trámite de convalidación o reclamos..." 
                        value={contactMessage} 
                        onChange={(e) => setContactMessage(e.target.value)} 
                        className="w-full px-3 py-2 border rounded bg-slate-50 border-slate-300" 
                      />
                    </div>

                    <button 
                      type="submit" 
                      className="w-full bg-[#9F062A] hover:bg-[#800521] text-white py-2.5 rounded font-black uppercase text-[10px] tracking-widest shadow inline-flex items-center justify-center gap-2"
                    >
                      <Send className="w-3.5 h-3.5 text-white" /> Enviar Mensaje Virtual
                    </button>
                  </form>
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* 4. FOOTER BAR (Unchanged structure, refined colors) */}
      <footer className="bg-slate-900 text-slate-400 text-xs sm:text-xs py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-6 sm:px-12 grid grid-cols-1 md:grid-cols-3 gap-8 leading-relaxed">
          <div>
            <span className="text-white font-black text-sm block mb-4 uppercase tracking-wider">IESTP SAN FRANCISCO DE ASÍS</span>
            <p className="font-semibold text-slate-400">
              Institución oficial de educación superior pública licenciada. Comprometidos con el desarrollo técnico-industrial, la equidad ocupacional y la fe solidaria en Lima Sur.
            </p>
          </div>
          <div>
            <span className="text-white font-black text-sm block mb-4 uppercase tracking-wider">Módulos de Sistema</span>
            <ul className="space-y-2 font-bold text-slate-400">
              <li><button onClick={onEnterIntranet} className="hover:text-amber-400 transition-colors text-left uppercase text-[10px]">Acceder a Intranet de Alumnos</button></li>
              <li><button onClick={onEnterIntranet} className="hover:text-amber-400 transition-colors text-left uppercase text-[10px]">Módulo de Catedráticos / Docentes</button></li>
              <li><button onClick={onEnterIntranet} className="hover:text-amber-400 transition-colors text-left uppercase text-[10px]">Servicios Administrativos (Mesa)</button></li>
              <li><button onClick={() => { setCurrentTab("admision"); setSubmitSuccessMsg(""); }} className="hover:text-amber-400 transition-colors text-left uppercase text-[10px]">Guía de Examen Admisión 2026</button></li>
            </ul>
          </div>
          <div>
            <span className="text-white font-black text-sm block mb-4 uppercase tracking-wider">Soporte Integral</span>
            <p className="font-semibold text-slate-400">Av. Prolongación Pachacútec Cdra. 50 – Villa María del Triunfo (VMT), Lima, Perú.</p>
            <p className="mt-2 text-[#CFA020] font-mono">Central Telefónica: 01 500 6177</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 sm:px-12 mt-8 pt-8 border-t border-slate-800 text-center text-slate-550 font-semibold text-[11px]">
          <p>© 2026 IESTP San Francisco de Asís. Todos los derechos reservados bajo la regulación institucional del MINEDU.</p>
        </div>
      </footer>

      {/* SIMULATED EMAIL NOTIFICATION MODAL */}
      {registeredApplicant && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white border rounded-xl overflow-hidden shadow-2xl max-w-lg w-full text-xs font-semibold">
            {/* Email Header */}
            <div className="bg-slate-950 text-white p-4 flex justify-between items-center border-b border-slate-800">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse" />
                <span className="font-bold tracking-tight text-slate-200">Simulador de Correo Electrónico Académico</span>
              </div>
              <button 
                onClick={() => setRegisteredApplicant(null)} 
                className="text-slate-400 hover:text-white p-1 hover:bg-slate-800 rounded-md transition-all cursor-pointer"
                aria-label="Cerrar Correo"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Email Content */}
            <div className="p-6 space-y-4 bg-[#F8FAF9]">
              <div className="border border-slate-200 rounded bg-white p-3 space-y-1 text-slate-500 font-medium">
                <div><span className="text-slate-800 font-bold">De:</span> admision@iestpsfa.edu.pe <span className="text-slate-400 font-normal">&lt;enviador-de-registro@sfa.edu.pe&gt;</span></div>
                <div><span className="text-slate-800 font-bold">Para:</span> {registeredApplicant.email}</div>
                <div><span className="text-slate-800 font-bold">Asunto:</span> 📥 [IESTP SFA] Credenciales Temporales de Admisión 2026-I</div>
              </div>

              <div className="space-y-3 font-semibold text-slate-700 leading-relaxed bg-white p-5 rounded border border-slate-200">
                <p className="font-extrabold text-slate-900 text-sm">Estimado(a) {registeredApplicant.name} {registeredApplicant.lastName},</p>
                <p>Le confirmamos que se ha pre-inscrito correctamente en las bases de control de admisión del **IESTP San Francisco de Asís** para el programa técnico de **{registeredApplicant.programName}**.</p>
                
                <p>Como indica el proceso, le hemos generado sus accesos digitales temporales. Utilice estos datos para iniciar sesión de inmediato y completar sus procesos:</p>

                <div className="bg-rose-50 border border-rose-200/60 p-4 rounded-lg space-y-2.5 text-slate-900 max-w-sm mx-auto my-4 shadow-2xs">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 font-extrabold uppercase">Código de Postulante:</span>
                    <span className="font-mono font-black text-[#9F062A] tracking-widest text-sm bg-white border px-2 py-0.5 rounded select-all">{registeredApplicant.applicantCode}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 font-extrabold uppercase">Usuario (DNI o Código):</span>
                    <span className="font-mono font-black text-slate-700 tracking-wider text-xs bg-white border px-2 py-0.5 rounded select-all">{registeredApplicant.dni}</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-500 font-extrabold uppercase">Contraseña temporal:</span>
                    <span className="font-mono font-black text-[#9F062A] tracking-widest text-sm bg-white border px-2 py-0.5 rounded">{registeredApplicant.temporaryPassword || "clave123"}</span>
                  </div>
                </div>

                <p className="text-[10px] text-slate-400 italic">Nota: Al acceder con estas credenciales, podrá subir la Carpeta de Admisión Obligatoria y rendir su Examen de Admisión Virtual.</p>
              </div>
            </div>

            {/* Email Footer action */}
            <div className="bg-slate-50 p-4 border-t flex justify-end gap-2.5">
              <button 
                onClick={() => setRegisteredApplicant(null)}
                className="px-4 py-2 border rounded font-bold text-slate-600 hover:bg-slate-100 uppercase text-[10px] cursor-pointer"
              >
                Cerrar Simulación
              </button>
              <button 
                onClick={() => {
                  setRegisteredApplicant(null);
                  onEnterIntranet();
                }}
                className="px-4 py-2 bg-[#9F062A] hover:bg-[#800521] text-white rounded font-black uppercase text-[10px] tracking-wide inline-flex items-center gap-1.5 cursor-pointer shadow-md"
              >
                <LogIn className="w-3.5 h-3.5 text-[#E3BD26]" /> Ingresar Directo a Intranet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
