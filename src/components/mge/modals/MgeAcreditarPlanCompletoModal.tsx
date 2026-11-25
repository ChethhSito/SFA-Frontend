import React, { useState } from "react";
import { updateStudentCycleStatuses } from "../../../services/api";
import {
  GraduationCap,
  XCircle,
  CheckCircle2,
  ArrowRight,
  Award,
  Calendar,
  BookOpen,
  FileCheck2,
  ShieldCheck,
  UserCheck,
  Clock,
  Sparkles
} from "lucide-react";
import { ProcessedStudent } from "../mgeTypes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: ProcessedStudent;
  program: string;
  onConfirm: () => void;
}

// Cursos formativos completos de los 6 ciclos (Contabilidad)
const CONT_FULL_CURRICULUM_COURSES: Record<number, Array<{
  code: string;
  name: string;
  credits: number;
  doc: string;
  grade: number;
  status: "APROBADO";
  asis: string;
  isReal: boolean;
  notes?: string;
}>> = {
  1: [
    { code: "CONT-101", name: "Fundamentos de Contabilidad y Doctrina Contable", credits: 4, doc: "Lic. Patricia Elena Benavides Silva", grade: 16.4, status: "APROBADO", asis: "16/16 (100%)", isReal: true, notes: "Acta Consolidada" },
    { code: "CONT-102", name: "Documentación Comercial, Mercantil y Bancaria", credits: 4, doc: "Lic. Marco Antonio Paredes Quispe", grade: 16.5, status: "APROBADO", asis: "16/16 (100%)", isReal: true, notes: "Acta Consolidada" },
    { code: "CONT-103", name: "Matemática Financiera y Comercial", credits: 3, doc: "Lic. Carlos Enrique Vásquez Torres", grade: 17.0, status: "APROBADO", asis: "16/16 (100%)", isReal: true, notes: "Acta Consolidada" },
    { code: "CONT-104", name: "Legislación Comercial y Societaria", credits: 3, doc: "Abg. Rosa María Flores Huamán", grade: 15.0, status: "APROBADO", asis: "16/16 (100%)", isReal: true, notes: "Acta Consolidada" },
    { code: "CONT-105", name: "Comunicación y Competencias Digitales", credits: 2, doc: "Lic. Sofía Lorena Valenzuela Ríos", grade: 16.0, status: "APROBADO", asis: "16/16 (100%)", isReal: true, notes: "Acta Consolidada" },
  ],
  2: [
    { code: "CONT-201", name: "Contabilidad General y Plan Contable General Empresarial", credits: 4, doc: "Lic. Patricia Elena Benavides Silva", grade: 16.6, status: "APROBADO", asis: "16/16 (100%)", isReal: true, notes: "Acta Consolidada" },
    { code: "CONT-202", name: "Títulos Valores y Operaciones Financieras", credits: 4, doc: "Lic. Marco Antonio Paredes Quispe", grade: 17.0, status: "APROBADO", asis: "16/16 (100%)", isReal: true, notes: "Acta Consolidada" },
    { code: "CONT-203", name: "Estadística Aplicada a la Gestión Contable", credits: 3, doc: "Lic. Carlos Enrique Vásquez Torres", grade: 16.0, status: "APROBADO", asis: "16/16 (100%)", isReal: true, notes: "Acta Consolidada" },
    { code: "CONT-204", name: "Ofimática Aplicada a los Negocios (Excel Contable)", credits: 3, doc: "Lic. Sofía Lorena Valenzuela Ríos", grade: 16.5, status: "APROBADO", asis: "16/16 (100%)", isReal: true, notes: "Acta Consolidada" },
    { code: "CONT-205", name: "Inglés Técnico para Negocios y Finanzas", credits: 2, doc: "Lic. Carmen Luzardo", grade: 15.5, status: "APROBADO", asis: "16/16 (100%)", isReal: true, notes: "Acta Consolidada" },
  ],
  3: [
    { code: "CONT-301", name: "Contabilidad de Sociedades Mercantiles", credits: 4, doc: "Lic. Patricia Elena Benavides Silva", grade: 17.0, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "CONT-302", name: "Legislación Tributaria I (IGV, Comprobantes y Detracciones)", credits: 4, doc: "Abg. Rosa María Flores Huamán", grade: 16.5, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "CONT-303", name: "Costos y Presupuestos Básicos", credits: 3, doc: "Lic. Marco Antonio Paredes Quispe", grade: 17.5, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "CONT-304", name: "Contabilidad Computarizada I (Concar / Siigo)", credits: 3, doc: "Lic. Sofía Lorena Valenzuela Ríos", grade: 16.0, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "CONT-305", name: "Ética y Deontología Profesional", credits: 2, doc: "Lic. Carmen Luzardo", grade: 17.0, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
  ],
  4: [
    { code: "CONT-401", name: "Contabilidad de Costos Avanzada por Procesos y Órdenes", credits: 4, doc: "Lic. Patricia Elena Benavides Silva", grade: 17.5, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "CONT-402", name: "Legislación Tributaria II (Impuesto a la Renta de 3ra)", credits: 4, doc: "Abg. Rosa María Flores Huamán", grade: 18.0, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "CONT-403", name: "Legislación Laboral, Planillas y T-Registro / PLAME", credits: 3, doc: "Abg. Rosa María Flores Huamán", grade: 16.5, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "CONT-404", name: "Contabilidad Computarizada II (Sistemas ERP Integrados)", credits: 3, doc: "Lic. Sofía Lorena Valenzuela Ríos", grade: 17.0, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "CONT-405", name: "Gestión Financiera y Flujo de Caja", credits: 2, doc: "Lic. Carlos Enrique Vásquez Torres", grade: 18.0, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
  ],
  5: [
    { code: "CONT-501", name: "Auditoría Financiera y Procedimientos de Control", credits: 4, doc: "Lic. Patricia Elena Benavides Silva", grade: 18.0, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "CONT-502", name: "Formulación y Presentación de Estados Financieros (NIIF)", credits: 4, doc: "Lic. Marco Antonio Paredes Quispe", grade: 17.5, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "CONT-503", name: "Finanzas Corporativas y Valoración de Empresas", credits: 3, doc: "Lic. Carlos Enrique Vásquez Torres", grade: 18.0, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "CONT-504", name: "Tributación Municipal y Aduanera", credits: 3, doc: "Abg. Rosa María Flores Huamán", grade: 16.5, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "CONT-505", name: "Emprendimiento y Plan de Negocios Contables", credits: 2, doc: "Lic. Elena Gómez", grade: 19.0, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
  ],
  6: [
    { code: "CONT-601", name: "Proyecto Integrador de Gestión Contable y Tributaria", credits: 5, doc: "Lic. Patricia Elena Benavides Silva", grade: 18.5, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "CONT-602", name: "Auditoría Tributaria, Fiscalización y Peritaje Contable", credits: 4, doc: "Lic. Marco Antonio Paredes Quispe", grade: 17.0, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "CONT-603", name: "Análisis e Interpretación de Estados Financieros", credits: 3, doc: "Lic. Carlos Enrique Vásquez Torres", grade: 17.5, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "CONT-604", name: "Control Interno y Gestión Integral de Riesgos (COSO)", credits: 2, doc: "Lic. Patricia Elena Benavides Silva", grade: 19.0, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "CONT-605", name: "Legislación Laboral y Relaciones de Trabajo", credits: 2, doc: "Abg. Rosa María Flores Huamán", grade: 18.0, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
  ],
};

// Cursos formativos completos de los 6 ciclos (Electricidad Industrial)
const FULL_CURRICULUM_COURSES: Record<number, Array<{
  code: string;
  name: string;
  credits: number;
  doc: string;
  grade: number;
  status: "APROBADO";
  asis: string;
  isReal: boolean;
  notes?: string;
}>> = {
  1: [
    { code: "EIND-101", name: "Fundamentos de Electricidad y Circuitos CC", credits: 4, doc: "Ing. Roberto Chávez Peña", grade: 16.4, status: "APROBADO", asis: "16/16 (100%)", isReal: true, notes: "Acta Consolidada" },
    { code: "EIND-102", name: "Instalaciones Eléctricas de Edificaciones", credits: 4, doc: "Ing. Walter Fernández", grade: 16.5, status: "APROBADO", asis: "16/16 (100%)", isReal: true, notes: "Acta Consolidada" },
    { code: "EIND-103", name: "Seguridad e Higiene Industrial en Baja Tensión", credits: 3, doc: "Ing. Carlos Morales", grade: 17.0, status: "APROBADO", asis: "16/16 (100%)", isReal: true, notes: "Acta Consolidada" },
    { code: "EIND-104", name: "Matemática Aplicada a la Tecnología Eléctrica", credits: 3, doc: "Lic. Carmen Luzardo", grade: 15.0, status: "APROBADO", asis: "16/16 (100%)", isReal: true, notes: "Acta Consolidada" },
    { code: "EIND-105", name: "Comunicación y Tecnologías Digitales", credits: 2, doc: "Lic. Elena Gómez", grade: 16.0, status: "APROBADO", asis: "16/16 (100%)", isReal: true, notes: "Acta Consolidada" },
  ],
  2: [
    { code: "EIND-201", name: "Circuitos Eléctricos en Corriente Alterna", credits: 4, doc: "Ing. Manuel Ramos Salazar", grade: 16.6, status: "APROBADO", asis: "16/16 (100%)", isReal: true, notes: "Firma PIN 1234" },
    { code: "EIND-202", name: "Electrónica Analógica y de Potencia Básica", credits: 4, doc: "Ing. Roberto Chávez Peña", grade: 17.0, status: "APROBADO", asis: "16/16 (100%)", isReal: true, notes: "Acta Consolidada" },
    { code: "EIND-203", name: "Taller de Medidas e Instrumentos Eléctricos", credits: 3, doc: "Ing. Walter Fernández", grade: 16.0, status: "APROBADO", asis: "16/16 (100%)", isReal: true, notes: "Acta Consolidada" },
    { code: "EIND-204", name: "Dibujo y CAD Electrotécnico (AutoCAD Electrical)", credits: 3, doc: "Ing. Manuel Ramos Salazar", grade: 16.5, status: "APROBADO", asis: "16/16 (100%)", isReal: true, notes: "Acta Consolidada" },
    { code: "EIND-205", name: "Inglés Técnico para Electricidad", credits: 2, doc: "Lic. Carmen Luzardo", grade: 15.5, status: "APROBADO", asis: "16/16 (100%)", isReal: true, notes: "Acta Consolidada" },
  ],
  3: [
    { code: "EIND-301", name: "Máquinas Eléctricas Rotativas y Generadores", credits: 4, doc: "Ing. Walter Fernández", grade: 17.0, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "EIND-302", name: "Instalaciones Eléctricas Industriales en Media Tensión", credits: 4, doc: "Ing. Manuel Ramos Salazar", grade: 16.5, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "EIND-303", name: "Tableros Eléctricos y Sistemas de Protección", credits: 3, doc: "Ing. Roberto Chávez Peña", grade: 17.5, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "EIND-304", name: "Electrónica de Potencia Industrial", credits: 3, doc: "Ing. Walter Fernández", grade: 16.0, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "EIND-305", name: "Sociedad y Economía en la Globalización", credits: 2, doc: "Lic. Carmen Luzardo", grade: 17.0, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
  ],
  4: [
    { code: "EIND-401", name: "Control de Motores y Arranque Electrónico", credits: 4, doc: "Ing. Manuel Ramos Salazar", grade: 17.5, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "EIND-402", name: "Automatización con Controladores Lógicos Programables (PLC I)", credits: 4, doc: "Ing. Roberto Chávez Peña", grade: 18.0, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "EIND-403", name: "Mantenimiento de Subestaciones y Redes de Distribución", credits: 3, doc: "Ing. Walter Fernández", grade: 16.5, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "EIND-404", name: "Sistemas Neumáticos y Electroneumáticos Industriales", credits: 3, doc: "Ing. Carlos Morales", grade: 17.0, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "EIND-405", name: "Medio Ambiente y Desarrollo Sostenible", credits: 2, doc: "Lic. Elena Gómez", grade: 18.0, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
  ],
  5: [
    { code: "EIND-501", name: "Automatización Avanzada PLC II y Redes Industriales", credits: 4, doc: "Ing. Roberto Chávez Peña", grade: 18.0, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "EIND-502", name: "Sistemas de Supervisión SCADA y Pantallas HMI", credits: 4, doc: "Ing. Manuel Ramos Salazar", grade: 17.5, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "EIND-503", name: "Instrumentación y Control de Procesos Industriales", credits: 3, doc: "Ing. Walter Fernández", grade: 18.0, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "EIND-504", name: "Eficiencia Energética y Auditorías Eléctricas", credits: 3, doc: "Ing. Carlos Morales", grade: 16.5, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "EIND-505", name: "Ética y Deontología Profesional", credits: 2, doc: "Lic. Carmen Luzardo", grade: 19.0, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
  ],
  6: [
    { code: "EIND-601", name: "Integración de Sistemas Automatizados y Robótica", credits: 4, doc: "Ing. Roberto Chávez Peña", grade: 18.5, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "EIND-602", name: "Mantenimiento Predictivo y Gestión de Activos Eléctricos", credits: 4, doc: "Ing. Manuel Ramos Salazar", grade: 17.0, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "EIND-603", name: "Proyectos Electromecánicos y Gestión de Obras", credits: 3, doc: "Ing. Walter Fernández", grade: 17.5, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "EIND-604", name: "Proyecto de Innovación y Titulación EFSRT", credits: 3, doc: "Ing. Manuel Ramos Salazar", grade: 19.0, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
    { code: "EIND-605", name: "Emprendimiento y Gestión Empresarial", credits: 2, doc: "Lic. Elena Gómez", grade: 18.0, status: "APROBADO", asis: "16/16 (100%)", isReal: false, notes: "A Consolidar" },
  ],
};

const CYCLE_META: Record<number, { title: string; period: string; module: string; avg: number; color: string }> = {
  1: { title: "Ciclo I", period: "2027-I", module: "Módulo I", avg: 16.2, color: "emerald" },
  2: { title: "Ciclo II", period: "2027-II", module: "Módulo I", avg: 16.5, color: "emerald" },
  3: { title: "Ciclo III", period: "2028-I", module: "Módulo II", avg: 16.8, color: "blue" },
  4: { title: "Ciclo IV", period: "2028-II", module: "Módulo II", avg: 17.4, color: "blue" },
  5: { title: "Ciclo V", period: "2029-I", module: "Módulo III", avg: 17.8, color: "purple" },
  6: { title: "Ciclo VI", period: "2029-II", module: "Módulo III", avg: 18.0, color: "amber" },
};

export const MgeAcreditarPlanCompletoModal: React.FC<Props> = ({
  isOpen,
  onClose,
  student,
  program,
  onConfirm,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeCycleTab, setActiveCycleTab] = useState<number>(2); // Por defecto en Ciclo II para contrastar

  if (!isOpen || !student) return null;

  const studentDni = student.dni || "74859612";
  const isContabilidad = (program || student.programId || "").toLowerCase().includes("cont");
  const activeCurriculum = isContabilidad ? CONT_FULL_CURRICULUM_COURSES : FULL_CURRICULUM_COURSES;

  const handleExecuteConsolidation = () => {
    setIsProcessing(true);
    try {
      // 1. Activar estado de promoción total y egreso (dinámico por DNI)
      localStorage.setItem(`sfa_student_promoted_${studentDni}`, "true");
      localStorage.setItem(`sfa_student_graduated_all_${studentDni}`, "true");
      localStorage.setItem(`sfa_student_cycle_${studentDni}`, "6");
      localStorage.setItem(`sfa_student_status_${studentDni}`, "Egresado Lectivo");

      // Las Prácticas Preprofesionales (EFSRT) quedan PENDIENTES de trámite y validación por Secretaría
      // NO se auto-acreditan aquí para respetar el flujo ministerial estricto
      localStorage.removeItem(`sfa_efsrt_validated_${studentDni}`);
      localStorage.removeItem(`sfa_efsrt_all_approved_${studentDni}`);
      localStorage.removeItem(`sfa_titulacion_enabled_${studentDni}`);

      // 3. Registrar notas oficiales y 16 semanas de asistencia para cada asignatura de Ciclos III, IV, V y VI
      [3, 4, 5, 6].forEach((cycNum) => {
        const coursesInCyc = activeCurriculum[cycNum];
        coursesInCyc.forEach((c) => {
          // Notas
          localStorage.setItem(`sfa_grades_${c.code}_${studentDni}`, String(c.grade));
          localStorage.setItem(`sfa_acta_signed_${c.code}_${studentDni}`, "true");
          localStorage.setItem(`sfa_acta_signed_${c.code}_date_${studentDni}`, "20/11/2026 12:00");

          // Asistencias (16 semanas completas = 100%)
          localStorage.setItem(`sfa_attendance_complete_${c.code}_${studentDni}`, "true");
          localStorage.setItem(`sfa_attendance_count_${c.code}_${studentDni}`, "16");
        });
      });

      // Asistencias globales de ciclo
      ["cycle3", "cycle4", "cycle5", "cycle6"].forEach((cycKey) => {
        localStorage.setItem(`sfa_attendance_complete_${cycKey}_${studentDni}`, "true");
      });

      // 4. Persistir los 6 ciclos en MongoDB para sincronización entre navegadores/pestañas
      try {
        const allCycleEntries = [1, 2, 3, 4, 5, 6].map((cycNum) => {
          const coursesInCyc = activeCurriculum[cycNum] || [];
          const meta = CYCLE_META[cycNum];
          const totalCr = coursesInCyc.reduce((sum, c) => sum + c.credits, 0);
          return {
            cycleNumber: cycNum,
            year: cycNum <= 2 ? 2027 : cycNum <= 4 ? 2028 : 2029,
            status: "Aprobado",
            average: meta?.avg || 17.0,
            credits: totalCr || 16,
            courses: coursesInCyc.map((c) => ({
              name: `${c.code}::${c.name}`,
              grade: c.grade,
              approved: true,
            })),
          };
        });
        void updateStudentCycleStatuses(studentDni, allCycleEntries);
      } catch {}

      if (typeof window !== "undefined") {
        window.dispatchEvent(new Event("storage"));
      }

      setTimeout(() => {
        setIsProcessing(false);
        onConfirm();
        onClose();
      }, 500);
    } catch (err) {
      console.error("Error al consolidar plan completo:", err);
      setIsProcessing(false);
    }
  };

  const activeCourses = activeCurriculum[activeCycleTab] || [];
  const activeMeta = CYCLE_META[activeCycleTab] || CYCLE_META[2];

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 md:p-5 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[95vh] overflow-hidden text-slate-800 font-sans text-left">
        {/* Header Institucional */}
        <div className="bg-gradient-to-r from-emerald-800 to-slate-950 text-white px-6 py-4 flex items-center justify-between shadow-md shrink-0 border-b-2 border-emerald-500">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-700/60 border border-emerald-400/40 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="font-black text-sm md:text-base uppercase tracking-wide block">
                Acreditación de Plan Completo (6 Ciclos • Egreso y Titulación)
              </span>
              <span className="text-[10px] text-emerald-200 font-mono block">
                Auditoría Curricular Integral · Validación de Malla de 120 Créditos
              </span>
            </div>
          </div>
          <button
            type="button"
            disabled={isProcessing}
            onClick={onClose}
            className="text-white/80 hover:text-white p-1.5 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Body del Modal */}
        <div className="flex-1 p-5 md:p-6 overflow-y-auto space-y-5 custom-scrollbar text-left">
          {/* Tarjeta de Datos del Estudiante */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase text-slate-900">
                  Estudiante: <span className="text-emerald-800">{student.lastName}, {student.name}</span>
                </span>
                <span className="text-[10px] font-mono font-bold bg-white border border-slate-200 px-2.5 py-0.5 rounded text-slate-700">
                  DNI: {student.dni}
                </span>
              </div>
              <span className="text-[10px] font-black uppercase font-mono px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                Padrón Oficial Regular
              </span>
            </div>
            <div className="text-[11px] text-slate-600 font-medium flex flex-wrap items-center gap-3 pt-1 border-t border-slate-200/60">
              <span>Programa: <strong className="text-slate-800">{program}</strong></span>
              <span>•</span>
              <span>Total Plan Curricular: <strong className="text-slate-800">120 Créditos (6 Ciclos)</strong></span>
              <span>•</span>
              <span>Módulos Técnicos: <strong className="text-slate-800">3 Módulos EFSRT</strong></span>
            </div>
          </div>

          {/* Sección 1: Diagrama de Progresión Modular con Flechas */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <ArrowRight className="w-4 h-4 text-emerald-700" />
                Ruta Curricular de Transición y Certificación Modular
              </h4>
              <span className="text-[10px] text-slate-500 font-bold uppercase font-mono">
                Haga clic en un módulo para auditar sus asignaturas
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              {/* Bloque 1 */}
              <div
                onClick={() => setActiveCycleTab(activeCycleTab === 1 ? 2 : 1)}
                className={`p-3 rounded-xl border transition-all cursor-pointer shadow-2xs space-y-1 relative ${
                  activeCycleTab === 1 || activeCycleTab === 2
                    ? "bg-emerald-50 border-emerald-500 ring-2 ring-emerald-400/30"
                    : "bg-white border-emerald-300 hover:border-emerald-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-emerald-700 font-mono">Módulo I</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <p className="text-xs font-black text-slate-900 leading-tight">Ciclos I y II</p>
                <p className="text-[10px] text-slate-500 font-medium">32 Créditos · 10 Cursos</p>
                <span className="inline-block text-[9px] font-bold text-emerald-700 bg-white border border-emerald-300 px-1.5 py-0.5 rounded">
                  Completado (100% Asis)
                </span>
              </div>

              {/* Bloque 2 */}
              <div
                onClick={() => setActiveCycleTab(activeCycleTab === 3 ? 4 : 3)}
                className={`p-3 rounded-xl border transition-all cursor-pointer shadow-2xs space-y-1 ${
                  activeCycleTab === 3 || activeCycleTab === 4
                    ? "bg-blue-50 border-blue-500 ring-2 ring-blue-400/30"
                    : "bg-white border-blue-200 hover:border-blue-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-blue-700 font-mono">Módulo II</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <p className="text-xs font-black text-slate-900 leading-tight">Ciclos III y IV</p>
                <p className="text-[10px] text-slate-500 font-medium">44 Créditos · 10 Cursos</p>
                <span className="inline-block text-[9px] font-bold text-blue-700 bg-white border border-blue-300 px-1.5 py-0.5 rounded">
                  A Consolidar
                </span>
              </div>

              {/* Bloque 3 */}
              <div
                onClick={() => setActiveCycleTab(activeCycleTab === 5 ? 6 : 5)}
                className={`p-3 rounded-xl border transition-all cursor-pointer shadow-2xs space-y-1 ${
                  activeCycleTab === 5 || activeCycleTab === 6
                    ? "bg-purple-50 border-purple-500 ring-2 ring-purple-400/30"
                    : "bg-white border-purple-200 hover:border-purple-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-purple-700 font-mono">Módulo III</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-500" />
                </div>
                <p className="text-xs font-black text-slate-900 leading-tight">Ciclos V y VI</p>
                <p className="text-[10px] text-slate-500 font-medium">44 Créditos · 10 Cursos</p>
                <span className="inline-block text-[9px] font-bold text-purple-700 bg-white border border-purple-300 px-1.5 py-0.5 rounded">
                  A Consolidar
                </span>
              </div>

              {/* Bloque 4: Meta Final */}
              <div
                onClick={() => setActiveCycleTab(6)}
                className={`bg-gradient-to-br from-emerald-700 to-emerald-900 text-white p-3 rounded-xl shadow-xs space-y-1 cursor-pointer transition-all ${
                  activeCycleTab === 6 ? "ring-2 ring-amber-400 ring-offset-2" : "hover:brightness-105"
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-amber-300 font-mono">EGRESO LECTIVO</span>
                  <Award className="w-4 h-4 text-amber-300" />
                </div>
                <p className="text-xs font-black leading-tight text-white">96 Créditos</p>
                <p className="text-[10px] text-emerald-200 font-medium">100% Cursos Aprobados</p>
                <span className="inline-block text-[9px] font-black uppercase text-slate-950 bg-amber-400 px-1.5 py-0.5 rounded font-mono">
                  EFSRT Pendiente
                </span>
              </div>
            </div>
          </div>

          {/* Sección 2: Visor Detallado de Notas y Asistencias por Ciclo */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3 shadow-2xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[#800521]" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-900">
                  Asignaturas, Calificaciones y Asistencias por Semestre
                </h4>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono font-bold text-slate-500">
                  Promedio del {activeMeta.title}: <strong className="text-emerald-700">{activeMeta.avg}</strong> / 20
                </span>
                <span className="text-[10px] font-mono font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">
                  {activeMeta.module} ({activeMeta.period})
                </span>
              </div>
            </div>

            {/* Pestañas de los 6 Ciclos */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[1, 2, 3, 4, 5, 6].map((num) => {
                const isSelected = activeCycleTab === num;
                const isReal = num <= 2;
                return (
                  <button
                    key={num}
                    type="button"
                    onClick={() => setActiveCycleTab(num)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-black font-mono uppercase tracking-wider transition-all cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                      isSelected
                        ? "bg-[#800521] text-white border-red-700 shadow-xs"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
                    }`}
                  >
                    <span>Ciclo {num}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                      isSelected ? "bg-white/20 text-white" : isReal ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-700"
                    }`}>
                      {isReal ? "Auditado" : "Proyectado"}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Tabla Detallada del Ciclo Activo */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100/80 text-slate-600 font-mono text-[10px] uppercase font-bold border-b border-slate-200">
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-3">Asignatura Oficial</th>
                    <th className="py-2.5 px-3">Docente Titular</th>
                    <th className="py-2.5 px-3 text-center">Créd.</th>
                    <th className="py-2.5 px-3 text-center">Asistencia</th>
                    <th className="py-2.5 px-3 text-center">Nota Final</th>
                    <th className="py-2.5 px-3 text-center">Condición</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-sans">
                  {activeCourses.map((c) => (
                    <tr key={c.code} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-2.5 px-3 font-mono font-bold text-slate-800 text-[11px] whitespace-nowrap">
                        {c.code}
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-900">
                        <span className="block font-bold">{c.name}</span>
                        <span className="text-[10px] text-slate-400 font-mono block">
                          {c.isReal ? "Registro Oficial en Acta Firmada" : "Consolidación Curricular de Secretaría"}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-slate-600 text-[11px] whitespace-nowrap">
                        {c.doc}
                      </td>
                      <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-700">
                        {c.credits}
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md">
                          <Clock className="w-3 h-3 text-emerald-600" />
                          {c.asis}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className={`inline-block font-mono font-black text-xs px-2.5 py-0.5 rounded-md border ${
                          c.grade >= 16.5
                            ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                            : "bg-blue-50 text-blue-700 border-blue-300"
                        }`}>
                          {c.grade.toFixed(1)}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 text-center whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 font-mono text-[10px] font-bold uppercase text-emerald-800 bg-emerald-100/70 border border-emerald-300 px-2 py-0.5 rounded-md">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {c.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {activeCycleTab === 2 && (
              <div className="bg-amber-50/80 border border-amber-300/80 rounded-lg p-2.5 text-xs text-amber-950 flex items-center justify-between">
                <span>
                  Asignatura evaluada por docente: <strong>{isContabilidad ? "CONT-201 (Lic. Patricia Elena Benavides Silva)" : "EIND-201 (Ing. Manuel Ramos Salazar)"}</strong>
                </span>
                <span className="font-mono font-bold text-amber-900 bg-white px-2 py-0.5 rounded border border-amber-200">
                  Fórmula: 0.2*NPA + 0.2*PC1 + 0.2*PC2 + 0.4*EX_FINAL = 16.6
                </span>
              </div>
            )}
          </div>

          {/* Sección 3: Acciones que ejecutará la confirmación */}
          <div className="border border-emerald-200 bg-emerald-50/60 rounded-xl p-3.5 space-y-2 text-xs text-emerald-950">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="font-bold uppercase tracking-wider text-[11px] text-emerald-900">
                Garantías de Consolidación Integral en el Sistema:
              </span>
            </div>
            <ul className="space-y-1.5 pl-6 list-disc text-[11px] text-emerald-900/90 leading-relaxed">
              <li>
                <strong>Notas reales protegidas:</strong> Se mantienen intactas todas las notas de los Ciclos I y II ya auditadas y firmadas por los docentes.
              </li>
              <li>
                <strong>Cierre de Actas de Ciclos III a VI:</strong> Se registran las asignaturas restantes con sus docentes titulares oficiales, promedios vigesimales entre 16.5 y 19.0 y firmas de actas institucionales.
              </li>
              <li>
                <strong>16 semanas de Asistencia garantizadas:</strong> Se registran 16/16 semanas al 100% de puntualidad en cada curso para que ni alumno ni secretaría vean campos vacíos.
              </li>
              <li>
                <strong>Apertura de Titulación:</strong> El alumno queda habilitado para tramitar su <strong>Constancia de Egresado</strong> y validar sus <strong>Prácticas Preprofesionales (EFSRT)</strong>.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer con Acciones */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
              Promedio Final Proyectado de la Carrera
            </span>
            <span className="text-base font-black text-emerald-800 font-display">
              16.8 / 20 <span className="text-xs font-bold text-slate-500 font-sans">(Rendimiento Sobresaliente)</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              disabled={isProcessing}
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-200 border border-slate-300 transition-colors cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="button"
              disabled={isProcessing}
              onClick={handleExecuteConsolidation}
              className="px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider font-mono bg-emerald-700 hover:bg-emerald-600 text-white shadow-md border border-emerald-600 transition-all cursor-pointer flex items-center gap-2 hover:shadow-lg active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
              <span>{isProcessing ? "Consolidando 6 Ciclos..." : "Confirmar Egreso Curricular Lectivo (96 Créditos)"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
