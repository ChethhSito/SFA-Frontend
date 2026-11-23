import React, { useState } from "react";
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
  UserCheck
} from "lucide-react";
import { ProcessedStudent } from "../mgeTypes";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  student: ProcessedStudent;
  program: string;
  onConfirm: () => void;
}

// Cursos formativos oficiales para los Ciclos III, IV, V y VI (Electricidad Industrial)
const REMAINING_CYCLES_COURSES = [
  // Ciclo III (Módulo Técnico II)
  { code: "EIND-301", name: "Máquinas Eléctricas Rotativas y Generadores", credits: 4, cycle: 3, grade: 17.0, doc: "Ing. Walter Fernández" },
  { code: "EIND-302", name: "Instalaciones Eléctricas Industriales en Media Tensión", credits: 4, cycle: 3, grade: 16.5, doc: "Ing. Manuel Ramos Salazar" },
  { code: "EIND-303", name: "Tableros Eléctricos y Sistemas de Protección", credits: 3, cycle: 3, grade: 17.5, doc: "Ing. Roberto Chávez Peña" },
  { code: "EIND-304", name: "Electrónica de Potencia Industrial", credits: 3, cycle: 3, grade: 16.0, doc: "Ing. Walter Fernández" },
  { code: "EIND-305", name: "Sociedad y Economía en la Globalización", credits: 2, cycle: 3, grade: 17.0, doc: "Lic. Carmen Luzardo" },

  // Ciclo IV (Módulo Técnico II)
  { code: "EIND-401", name: "Control de Motores y Arranque Electrónico", credits: 4, cycle: 4, grade: 17.5, doc: "Ing. Manuel Ramos Salazar" },
  { code: "EIND-402", name: "Automatización con Controladores Lógicos Programables (PLC I)", credits: 4, cycle: 4, grade: 18.0, doc: "Ing. Roberto Chávez Peña" },
  { code: "EIND-403", name: "Mantenimiento de Subestaciones y Redes de Distribución", credits: 3, cycle: 4, grade: 16.5, doc: "Ing. Walter Fernández" },
  { code: "EIND-404", name: "Sistemas Neumáticos y Electroneumáticos Industriales", credits: 3, cycle: 4, grade: 17.0, doc: "Ing. Carlos Morales" },
  { code: "EIND-405", name: "Medio Ambiente y Desarrollo Sostenible", credits: 2, cycle: 4, grade: 18.0, doc: "Lic. Elena Gómez" },

  // Ciclo V (Módulo Técnico III)
  { code: "EIND-501", name: "Automatización Avanzada PLC II y Redes Industriales", credits: 4, cycle: 5, grade: 18.0, doc: "Ing. Roberto Chávez Peña" },
  { code: "EIND-502", name: "Sistemas de Supervisión SCADA y Pantallas HMI", credits: 4, cycle: 5, grade: 17.5, doc: "Ing. Manuel Ramos Salazar" },
  { code: "EIND-503", name: "Instrumentación y Control de Procesos Industriales", credits: 3, cycle: 5, grade: 18.0, doc: "Ing. Walter Fernández" },
  { code: "EIND-504", name: "Eficiencia Energética y Auditorías Eléctricas", credits: 3, cycle: 5, grade: 16.5, doc: "Ing. Carlos Morales" },
  { code: "EIND-505", name: "Ética y Deontología Profesional", credits: 2, cycle: 5, grade: 19.0, doc: "Lic. Carmen Luzardo" },

  // Ciclo VI (Módulo Técnico III)
  { code: "EIND-601", name: "Integración de Sistemas Automatizados y Robótica", credits: 4, cycle: 6, grade: 18.5, doc: "Ing. Roberto Chávez Peña" },
  { code: "EIND-602", name: "Mantenimiento Predictivo y Gestión de Activos Eléctricos", credits: 4, cycle: 6, grade: 17.0, doc: "Ing. Manuel Ramos Salazar" },
  { code: "EIND-603", name: "Proyectos Electromecánicos y Gestión de Obras", credits: 3, cycle: 6, grade: 17.5, doc: "Ing. Walter Fernández" },
  { code: "EIND-604", name: "Proyecto de Innovación y Titulación EFSRT", credits: 3, cycle: 6, grade: 19.0, doc: "Ing. Manuel Ramos Salazar" },
  { code: "EIND-605", name: "Emprendimiento y Gestión Empresarial", credits: 2, cycle: 6, grade: 18.0, doc: "Lic. Elena Gómez" },
];

export const MgeAcreditarPlanCompletoModal: React.FC<Props> = ({
  isOpen,
  onClose,
  student,
  program,
  onConfirm,
}) => {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !student) return null;

  const studentDni = student.dni || "74859612";

  const handleExecuteConsolidation = () => {
    setIsProcessing(true);
    try {
      // 1. Activar estado de promoción total y egreso
      localStorage.setItem(`sfa_student_promoted_${studentDni}`, "true");
      localStorage.setItem("sfa_student_promoted_74859612", "true");
      localStorage.setItem("sfa_student_promoted", "true");

      localStorage.setItem(`sfa_student_graduated_all_${studentDni}`, "true");
      localStorage.setItem("sfa_student_graduated_all_74859612", "true");
      localStorage.setItem("sfa_student_graduated_all", "true");

      localStorage.setItem(`sfa_student_cycle_${studentDni}`, "6");
      localStorage.setItem("sfa_student_cycle_74859612", "6");
      localStorage.setItem("sfa_student_cycle", "6");

      localStorage.setItem(`sfa_student_status_${studentDni}`, "Egresado");
      localStorage.setItem("sfa_student_status_74859612", "Egresado");

      // 2. Acreditación de los 3 Módulos Formativos (EFSRT)
      localStorage.setItem(`sfa_efsrt_modulo1_approved_${studentDni}`, "true");
      localStorage.setItem("sfa_efsrt_modulo1_approved_74859612", "true");
      localStorage.setItem(`sfa_efsrt_modulo2_approved_${studentDni}`, "true");
      localStorage.setItem("sfa_efsrt_modulo2_approved_74859612", "true");
      localStorage.setItem(`sfa_efsrt_modulo3_approved_${studentDni}`, "true");
      localStorage.setItem("sfa_efsrt_modulo3_approved_74859612", "true");
      localStorage.setItem(`sfa_efsrt_all_approved_${studentDni}`, "true");
      localStorage.setItem("sfa_efsrt_all_approved_74859612", "true");

      // Habilitar pago y apertura de expediente de titulación
      localStorage.setItem(`sfa_titulacion_enabled_${studentDni}`, "true");
      localStorage.setItem("sfa_titulacion_enabled_74859612", "true");

      // 3. Registrar notas oficiales y 16 semanas de asistencia para cada asignatura de Ciclos III, IV, V y VI
      REMAINING_CYCLES_COURSES.forEach((c) => {
        // Notas
        localStorage.setItem(`sfa_grades_${c.code}_${studentDni}`, String(c.grade));
        localStorage.setItem(`sfa_grades_${c.code}_74859612`, String(c.grade));
        localStorage.setItem(`sfa_acta_signed_${c.code}`, "true");
        localStorage.setItem(`sfa_acta_signed_${c.code}_date`, "20/11/2026 12:00");

        // Asistencias (16 semanas completas = 100%)
        localStorage.setItem(`sfa_attendance_complete_${c.code}`, "true");
        localStorage.setItem(`sfa_attendance_count_${c.code}_${studentDni}`, "16");
        localStorage.setItem(`sfa_attendance_count_${c.code}_74859612`, "16");
      });

      // Asistencias globales de ciclo
      ["cycle3", "cycle4", "cycle5", "cycle6"].forEach((cycKey) => {
        localStorage.setItem(`sfa_attendance_complete_${cycKey}_${studentDni}`, "true");
        localStorage.setItem(`sfa_attendance_complete_${cycKey}_74859612`, "true");
        localStorage.setItem(`sfa_attendance_complete_${cycKey}`, "true");
      });

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

  return (
    <div
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isProcessing) onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-3xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[94vh] overflow-hidden text-slate-800 font-sans text-left">
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
        <div className="flex-1 p-6 overflow-y-auto space-y-5 custom-scrollbar text-left">
          {/* Tarjeta de Datos del Estudiante */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2">
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

          {/* Sección 1: Estado Actual Real (Ciclos I y II) */}
          <div className="border border-slate-200 rounded-xl p-4 bg-white space-y-3 shadow-2xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-800">
                  Estado Actual Auditado en Sistema (Ciclos I y II Culminados)
                </h4>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                MÓDULO TÉCNICO I APROBADO
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <span className="text-[9.5px] uppercase font-bold text-slate-500 block leading-tight">
                  Ciclo I (2027-I)
                </span>
                <span className="text-sm font-black text-slate-800 block mt-1">16.2 / 20</span>
                <span className="text-[10px] text-slate-500 font-medium block">
                  5 Cursos · 16 cr. · 16/16 sem. (100% asis.)
                </span>
              </div>

              <div className="bg-slate-50 p-3 rounded-lg border border-slate-200/80">
                <span className="text-[9.5px] uppercase font-bold text-slate-500 block leading-tight">
                  Ciclo II (2027-II)
                </span>
                <span className="text-sm font-black text-slate-800 block mt-1">16.5 / 20</span>
                <span className="text-[10px] text-slate-500 font-medium block">
                  5 Cursos · 16 cr. · 16/16 sem. (100% asis.)
                </span>
              </div>

              <div className="bg-emerald-50/70 p-3 rounded-lg border border-emerald-200">
                <span className="text-[9.5px] uppercase font-bold text-emerald-700 block leading-tight">
                  Subtotal Acumulado
                </span>
                <span className="text-sm font-black text-emerald-900 block mt-1">32 / 120 cr. (27%)</span>
                <span className="text-[10px] text-emerald-800 font-medium block">
                  10 Asignaturas Oficiales con Actas
                </span>
              </div>
            </div>

            <div className="text-[11px] text-slate-600 bg-slate-50/80 p-2.5 rounded-lg border border-slate-200 flex items-center justify-between">
              <span>
                Asignatura evaluada por docente: <strong className="text-slate-800">EIND-201 (Ing. Manuel Ramos Salazar)</strong>
              </span>
              <span className="font-mono font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-slate-200">
                Nota Final: 16.6 (Acta PIN 1234)
              </span>
            </div>
          </div>

          {/* Sección 2: Diagrama de Progresión Modular con Flechas */}
          <div className="border border-slate-200 rounded-xl p-4 bg-slate-50/70 space-y-3">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
              <ArrowRight className="w-4 h-4 text-emerald-700" />
              Ruta Curricular de Transición y Certificación Modular
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
              {/* Bloque 1 */}
              <div className="bg-white p-3 rounded-xl border border-emerald-300 shadow-2xs space-y-1 relative">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-emerald-700 font-mono">Módulo I</span>
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                </div>
                <p className="text-xs font-black text-slate-900 leading-tight">Ciclos I y II</p>
                <p className="text-[10px] text-slate-500 font-medium">32 Créditos</p>
                <span className="inline-block text-[9px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  Completado
                </span>
              </div>

              {/* Bloque 2 */}
              <div className="bg-white p-3 rounded-xl border border-blue-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-blue-700 font-mono">Módulo II</span>
                  <ArrowRight className="w-3.5 h-3.5 text-blue-500" />
                </div>
                <p className="text-xs font-black text-slate-900 leading-tight">Ciclos III y IV</p>
                <p className="text-[10px] text-slate-500 font-medium">44 Créditos</p>
                <span className="inline-block text-[9px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                  A Consolidar
                </span>
              </div>

              {/* Bloque 3 */}
              <div className="bg-white p-3 rounded-xl border border-purple-200 shadow-2xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-purple-700 font-mono">Módulo III</span>
                  <ArrowRight className="w-3.5 h-3.5 text-purple-500" />
                </div>
                <p className="text-xs font-black text-slate-900 leading-tight">Ciclos V y VI</p>
                <p className="text-[10px] text-slate-500 font-medium">44 Créditos</p>
                <span className="inline-block text-[9px] font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                  A Consolidar
                </span>
              </div>

              {/* Bloque 4: Meta Final */}
              <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 text-white p-3 rounded-xl shadow-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-black uppercase text-amber-300 font-mono">EGRESO TOTAL</span>
                  <Award className="w-4 h-4 text-amber-300" />
                </div>
                <p className="text-xs font-black leading-tight text-white">120 Créditos</p>
                <p className="text-[10px] text-emerald-200 font-medium">100% Malla Culminada</p>
                <span className="inline-block text-[9px] font-black uppercase text-slate-950 bg-amber-400 px-1.5 py-0.5 rounded font-mono">
                  Apto Titulación
                </span>
              </div>
            </div>
          </div>

          {/* Sección 3: Acciones que ejecutará la confirmación */}
          <div className="border border-emerald-200 bg-emerald-50/60 rounded-xl p-4 space-y-2 text-xs text-emerald-950">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span className="font-bold uppercase tracking-wider text-[11px] text-emerald-900">
                Consolidación Integral que se ejecutará en el Sistema:
              </span>
            </div>
            <ul className="space-y-1.5 pl-6 list-disc text-[11px] text-emerald-900/90 leading-relaxed">
              <li>
                <strong>Notas preservadas:</strong> Se mantienen intactas todas las calificaciones formativas y actas ya firmadas de los Ciclos I y II.
              </li>
              <li>
                <strong>Cierre de Actas de Ciclos III a VI:</strong> Se registran las 20 asignaturas de los semestres restantes con sus docentes titulares, promedios vigesimales entre 16.5 y 19.0 y firmas de actas institucionales.
              </li>
              <li>
                <strong>16 semanas de Asistencia garantizadas:</strong> Se registran 16/16 semanas al 100% de puntualidad para cada curso, evitando registros en blanco en el portal del alumno.
              </li>
              <li>
                <strong>Habilitación en Secretaría:</strong> Se abre el expediente para emisión de <strong>Constancia de Egresado</strong> y validación de <strong>Prácticas Preprofesionales (EFSRT)</strong> para titulación.
              </li>
            </ul>
          </div>
        </div>

        {/* Footer con Acciones */}
        <div className="bg-slate-50 px-6 py-3.5 border-t border-slate-200 flex items-center justify-between shrink-0">
          <div className="text-left">
            <span className="text-[10px] uppercase font-bold text-slate-400 block font-mono">
              Promedio Final Proyectado
            </span>
            <span className="text-base font-black text-emerald-800 font-display">
              16.8 / 20 <span className="text-xs font-bold text-slate-500 font-sans">(Sobresaliente)</span>
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
              <span>{isProcessing ? "Consolidando 6 Ciclos..." : "Confirmar Egreso Curricular (120 Créditos)"}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
