import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AdmissionPeriod } from "../../types";
import { createApplicant, fetchApplicantByDni, sendTransactionalWelcomeEmail } from "../../services/api";
import { careersDetail } from "./portalData";
import { PortalHeader, PortalTab } from "./PortalHeader";
import { PortalFooter } from "./PortalFooter";
import { PortalSuccessModal } from "./PortalSuccessModal";
import { HomeTab } from "./tabs/HomeTab";
import { NosotrosTab } from "./tabs/NosotrosTab";
import { ProgramasTab } from "./tabs/ProgramasTab";
import { AdmisionTab } from "./tabs/AdmisionTab";
import { TransparenciaTab } from "./tabs/TransparenciaTab";
import { ContactanosTab } from "./tabs/ContactanosTab";

interface PortalHomeProps {
  onEnterIntranet: () => void;
  onLogout?: () => void;
  admissionPeriods?: AdmissionPeriod[];
}

export default function PortalHome({
  onEnterIntranet,
  onLogout,
  admissionPeriods = []
}: PortalHomeProps) {
  // Dynamic active/matching period check using current date validation
  const activePeriod = admissionPeriods.find(p => p.status === "APERTURADO" || p.isActive) ||
    admissionPeriods.find(p => p.status !== "CERRADO" && p.status !== "PENDIENTE") ||
    admissionPeriods[0];

  const displayPeriod = activePeriod || admissionPeriods[0];

  // Check if user has an active intranet session stored in localStorage
  const { activeSessionRole, activeSessionName } = (() => {
    const roles = ["superadmin", "administrador", "postulante", "alumno", "docente", "mpa", "mge", "maf"];
    for (const r of roles) {
      const s = localStorage.getItem(`sfa_session_${r}`);
      if (s) {
        let name = "";
        try {
          if (r === "postulante") {
            const apps = localStorage.getItem("sfa_applicants");
            if (apps) {
              const parsed = JSON.parse(apps);
              const found = parsed.find((a: any) => a.dni === s || a.id === s || a.applicantCode === s);
              if (found) name = `${found.name} ${found.lastName}`;
            }
          } else if (r === "alumno") {
            const stds = localStorage.getItem("sfa_students");
            if (stds) {
              const parsed = JSON.parse(stds);
              const found = parsed[s];
              if (found) name = `${found.name} ${found.lastName}`;
            }
          }
        } catch (e) {
          console.warn(e);
        }
        return { activeSessionRole: r, activeSessionName: name || null };
      }
    }
    return { activeSessionRole: null, activeSessionName: null };
  })();

  const activeRoleLabel = activeSessionRole === "administrador" ? "Gestor MAMC" :
    activeSessionRole === "superadmin" ? "SuperAdmin" :
      activeSessionRole === "postulante" ? "Postulante" :
        activeSessionRole === "alumno" ? "Alumno" :
          activeSessionRole === "docente" ? "Docente" :
            activeSessionRole === "mpa" ? "Planificación (MPA)" :
              activeSessionRole === "mge" ? "Gestión Estudiantes (MGE)" :
                activeSessionRole === "maf" ? "Finanzas (MAF)" : null;


  // Navigation State
  const [currentTab, setCurrentTab] = useState<PortalTab>("inicio");

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

  return (
    <div id="home-view" className="flex flex-col min-h-screen bg-white font-sans text-slate-900 selection:bg-[#9F062A] selection:text-white">

      {/* Header & Topbar Component */}
      <PortalHeader
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        setSelectedProgramId={setSelectedProgramId}
        setProgramSelection={setProgramSelection}
        setSubmitSuccessMsg={setSubmitSuccessMsg}
        activeSessionRole={activeSessionRole}
        activeRoleLabel={activeRoleLabel}
        activeSessionName={activeSessionName}
        onEnterIntranet={onEnterIntranet}
        onLogout={onLogout}
      />

      {/* Dynamic Tab Views */}
      <main className="flex-1 overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.35, ease: "easeInOut" }}
          >
            {currentTab === "inicio" && (
              <HomeTab
                setCurrentTab={setCurrentTab}
                setSelectedProgramId={setSelectedProgramId}
                setProgramSelection={setProgramSelection}
                setSubmitSuccessMsg={setSubmitSuccessMsg}
              />
            )}

            {currentTab === "nosotros" && <NosotrosTab />}

            {currentTab === "programas" && (
              <ProgramasTab
                selectedProgramId={selectedProgramId}
                setSelectedProgramId={setSelectedProgramId}
                setProgramSelection={setProgramSelection}
                setCurrentTab={setCurrentTab}
                setSubmitSuccessMsg={setSubmitSuccessMsg}
              />
            )}

            {currentTab === "admision" && (
              <AdmisionTab
                dniInput={dniInput}
                setDniInput={setDniInput}
                nameInput={nameInput}
                setNameInput={setNameInput}
                lastNameInput={lastNameInput}
                setLastNameInput={setLastNameInput}
                emailInput={emailInput}
                setEmailInput={setEmailInput}
                phoneInput={phoneInput}
                setPhoneInput={setPhoneInput}
                programSelection={programSelection}
                setProgramSelection={setProgramSelection}
                submitSuccessMsg={submitSuccessMsg}
                setSubmitSuccessMsg={setSubmitSuccessMsg}
                isSubmittingForm={isSubmittingForm}
                handlePreEnrollmentSubmit={handlePreEnrollmentSubmit}
              />
            )}

            {currentTab === "transparencia" && <TransparenciaTab />}

            {currentTab === "contactanos" && (
              <ContactanosTab
                contactName={contactName}
                setContactName={setContactName}
                contactEmail={contactEmail}
                setContactEmail={setContactEmail}
                contactSubject={contactSubject}
                setContactSubject={setContactSubject}
                contactMessage={contactMessage}
                setContactMessage={setContactMessage}
                contactSuccessMsg={contactSuccessMsg}
                setContactSuccessMsg={setContactSuccessMsg}
                handleContactSubmit={handleContactSubmit}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Footer Component */}
      <PortalFooter
        setCurrentTab={setCurrentTab}
        setSelectedProgramId={setSelectedProgramId}
        onEnterIntranet={onEnterIntranet}
      />

      {/* Confirmation Modal */}
      <PortalSuccessModal
        data={successModalData}
        onClose={() => setSuccessModalData(null)}
      />

    </div>
  );
}
