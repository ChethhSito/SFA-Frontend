import React, { useState, useEffect, useMemo } from "react";
import {
  ChevronDown, Printer, AlertTriangle, FileText, Calendar, Clock, CheckCircle2
} from "lucide-react";
import { Enrollment, AttendanceRecord } from "../../../types";
import { studentAttendanceRecords } from "../../../utils/attendance";
import PageTransition from "../../ui/PageTransition";

interface AttendanceTabProps {
  loading: boolean;
  error: string | null;
  onReload: () => Promise<boolean>;
  enrollment: Enrollment;
  studentDni?: string;
  attendance?: AttendanceRecord[];
  selectedAttendanceSemester: string;
  setSelectedAttendanceSemester: React.Dispatch<React.SetStateAction<string>>;
  expandedAttendanceCourse: string | null;
  setExpandedAttendanceCourse: React.Dispatch<React.SetStateAction<string | null>>;
  setActiveTab: (tab: any) => void;
  studentCourses?: any[];
  studentTasks?: any[];
  mpaPlanningData?: any;
  studentGroup?: any;
}

// 5 Cursos Oficiales Ciclo I (Electricidad Industrial)
const CICLO_1_COURSES = [
  {
    id: "cur_ei_101",
    code: "EIND-101",
    name: "Fundamentos de Electricidad y Circuitos CC",
    credits: 4,
    group: "EI-I-A",
    teacherName: "Ing. Roberto Chávez Peña",
    classroom: "Lab. Electricidad 101",
    schedule: "Lun - Mie 08:00 - 10:15"
  },
  {
    id: "cur_ei_102",
    code: "EIND-102",
    name: "Instalaciones Eléctricas de Edificaciones",
    credits: 4,
    group: "EI-I-A",
    teacherName: "Ing. Walter Fernández",
    classroom: "Taller de Instalaciones",
    schedule: "Mar - Jue 08:00 - 10:15"
  },
  {
    id: "cur_ei_103",
    code: "EIND-103",
    name: "Seguridad e Higiene Industrial en Baja Tensión",
    credits: 3,
    group: "EI-I-A",
    teacherName: "Ing. Carlos Morales",
    classroom: "Aula 102",
    schedule: "Vie 08:00 - 11:00"
  },
  {
    id: "cur_ei_104",
    code: "EIND-104",
    name: "Matemática Aplicada a la Tecnología Eléctrica",
    credits: 3,
    group: "EI-I-A",
    teacherName: "Lic. Carmen Luzardo",
    classroom: "Aula 103",
    schedule: "Lun 10:30 - 12:45"
  },
  {
    id: "cur_ei_105",
    code: "EIND-105",
    name: "Comunicación y Tecnologías Digitales",
    credits: 2,
    group: "EI-I-A",
    teacherName: "Lic. Elena Gómez",
    classroom: "Lab. Cómputo 1",
    schedule: "Mie 10:30 - 12:00"
  }
];

// 5 Cursos Oficiales Ciclo I (Contabilidad)
const CONTABILIDAD_CICLO_1_COURSES = [
  {
    id: "cur_co_101",
    code: "CONT-101",
    name: "Fundamentos de Contabilidad y Doctrina Contable",
    credits: 4,
    group: "CONT-I-A",
    teacherName: "Lic. Patricia Elena Benavides Silva",
    classroom: "Aula 201 • Pabellón C",
    schedule: "Lun 08:00 - 09:40"
  },
  {
    id: "cur_co_102",
    code: "CONT-102",
    name: "Documentación Comercial, Mercantil y Bancaria",
    credits: 4,
    group: "CONT-I-A",
    teacherName: "Lic. Patricia Elena Benavides Silva",
    classroom: "Aula 201 • Pabellón C",
    schedule: "Mar 08:00 - 09:40"
  },
  {
    id: "cur_co_103",
    code: "CONT-103",
    name: "Matemática Financiera y Comercial",
    credits: 3,
    group: "CONT-I-A",
    teacherName: "Lic. Fernando Gabriel Díaz Torres",
    classroom: "Aula 201 • Pabellón C",
    schedule: "Mie 08:00 - 09:40"
  },
  {
    id: "cur_co_104",
    code: "CONT-104",
    name: "Legislación Comercial y Societaria",
    credits: 3,
    group: "CONT-I-A",
    teacherName: "Lic. Carlos Alberto Mendoza Quispe",
    classroom: "Aula 201 • Pabellón C",
    schedule: "Jue 08:00 - 09:40"
  },
  {
    id: "cur_co_105",
    code: "CONT-105",
    name: "Comunicación y Competencias Digitales",
    credits: 2,
    group: "CONT-I-A",
    teacherName: "Lic. Jorge Luis Paucar Silva",
    classroom: "Lab. Contable 1 • Pabellón C",
    schedule: "Vie 08:00 - 09:40"
  }
];

// 5 Cursos Oficiales Ciclo II (Contabilidad)
const CONTABILIDAD_CICLO_2_COURSES = [
  {
    id: "cur_co_201",
    code: "CONT-201",
    name: "Contabilidad General Aplicada",
    credits: 4,
    group: "CONT-II-A",
    teacherName: "Lic. Patricia Elena Benavides Silva",
    classroom: "Aula 201 • Pabellón C",
    schedule: "Lun 08:00 - 09:40"
  },
  {
    id: "cur_co_202",
    code: "CONT-202",
    name: "Administración de Archivos Contables",
    credits: 3,
    group: "CONT-II-A",
    teacherName: "Lic. Patricia Elena Benavides Silva",
    classroom: "Aula 202 • Pabellón C",
    schedule: "Mar 08:00 - 09:40"
  },
  {
    id: "cur_co_203",
    code: "CONT-203",
    name: "Sistema de Información Contable I",
    credits: 3,
    group: "CONT-II-A",
    teacherName: "Lic. Fernando Gabriel Díaz Torres",
    classroom: "Lab. Contable 1 • Pabellón C",
    schedule: "Mie 08:00 - 09:40"
  },
  {
    id: "cur_co_204",
    code: "CONT-204",
    name: "Tributación y Legislación Comercial",
    credits: 3,
    group: "CONT-II-A",
    teacherName: "Lic. Carlos Alberto Mendoza Quispe",
    classroom: "Aula 201 • Pabellón C",
    schedule: "Jue 08:00 - 09:40"
  },
  {
    id: "cur_co_205",
    code: "CONT-205",
    name: "Estadística Aplicada a los Negocios",
    credits: 3,
    group: "CONT-II-A",
    teacherName: "Lic. Jorge Luis Paucar Silva",
    classroom: "Lab. Contable 1 • Pabellón C",
    schedule: "Vie 08:00 - 09:40"
  }
];

// 5 Cursos Oficiales Ciclo II (Electricidad Industrial)
const CICLO_2_COURSES = [
  {
    id: "cur_ei_201",
    code: "EIND-201",
    name: "Circuitos Eléctricos en Corriente Alterna",
    credits: 4,
    group: "EI-II-A",
    teacherName: "Ing. Manuel Ramos Salazar",
    classroom: "Aula 201 • Pabellón A",
    schedule: "Lun - Mie 08:00 - 10:15"
  },
  {
    id: "cur_ei_202",
    code: "EIND-202",
    name: "Electrónica Analógica y de Potencia Básica",
    credits: 4,
    group: "EI-II-A",
    teacherName: "Ing. Roberto Chávez Peña",
    classroom: "Taller de Potencia 102",
    schedule: "Mar - Jue 08:00 - 10:15"
  },
  {
    id: "cur_ei_203",
    code: "EIND-203",
    name: "Taller de Medidas e Instrumentos Eléctricos",
    credits: 3,
    group: "EI-II-A",
    teacherName: "Ing. Walter Fernández",
    classroom: "Lab. Mediciones 203",
    schedule: "Vie 08:00 - 11:00"
  },
  {
    id: "cur_ei_204",
    code: "EIND-204",
    name: "Dibujo y CAD Electrotécnico (AutoCAD Electrical)",
    credits: 3,
    group: "EI-II-A",
    teacherName: "Ing. Manuel Ramos Salazar",
    classroom: "Centro de Cómputo CAD",
    schedule: "Lun 10:30 - 12:45"
  },
  {
    id: "cur_ei_205",
    code: "EIND-205",
    name: "Inglés Técnico para Electricidad",
    credits: 2,
    group: "EI-II-A",
    teacherName: "Lic. Carmen Luzardo",
    classroom: "Aula 205",
    schedule: "Mie 10:30 - 12:00"
  }
];

// 5 Cursos Oficiales Ciclo III (Electricidad Industrial)
const CICLO_3_COURSES = [
  {
    id: "cur_ei_301",
    code: "EIND-301",
    name: "Máquinas Eléctricas Rotativas y Generadores",
    credits: 4,
    group: "EI-III-A",
    teacherName: "Ing. Walter Fernández",
    classroom: "Lab. Máquinas Eléctricas",
    schedule: "Lun - Mie 08:00 - 10:15"
  },
  {
    id: "cur_ei_302",
    code: "EIND-302",
    name: "Instalaciones Eléctricas Industriales en Media Tensión",
    credits: 4,
    group: "EI-III-A",
    teacherName: "Ing. Manuel Ramos Salazar",
    classroom: "Taller de MT 302",
    schedule: "Mar - Jue 08:00 - 10:15"
  },
  {
    id: "cur_ei_303",
    code: "EIND-303",
    name: "Tableros Eléctricos y Sistemas de Protección",
    credits: 3,
    group: "EI-III-A",
    teacherName: "Ing. Roberto Chávez Peña",
    classroom: "Lab. Tableros 301",
    schedule: "Vie 08:00 - 11:00"
  },
  {
    id: "cur_ei_304",
    code: "EIND-304",
    name: "Electrónica de Potencia Industrial",
    credits: 3,
    group: "EI-III-A",
    teacherName: "Ing. Walter Fernández",
    classroom: "Lab. Potencia 2",
    schedule: "Lun 10:30 - 12:45"
  },
  {
    id: "cur_ei_305",
    code: "EIND-305",
    name: "Sociedad y Economía en la Globalización",
    credits: 2,
    group: "EI-III-A",
    teacherName: "Lic. Carmen Luzardo",
    classroom: "Aula 305",
    schedule: "Mie 10:30 - 12:00"
  }
];

// 5 Cursos Oficiales Ciclo IV (Electricidad Industrial)
const CICLO_4_COURSES = [
  {
    id: "cur_ei_401",
    code: "EIND-401",
    name: "Control de Motores y Arranque Electrónico",
    credits: 4,
    group: "EI-IV-A",
    teacherName: "Ing. Manuel Ramos Salazar",
    classroom: "Taller Motores 401",
    schedule: "Lun - Mie 08:00 - 10:15"
  },
  {
    id: "cur_ei_402",
    code: "EIND-402",
    name: "Automatización con Controladores Lógicos Programables (PLC I)",
    credits: 4,
    group: "EI-IV-A",
    teacherName: "Ing. Roberto Chávez Peña",
    classroom: "Lab. Automatización PLC",
    schedule: "Mar - Jue 08:00 - 10:15"
  },
  {
    id: "cur_ei_403",
    code: "EIND-403",
    name: "Mantenimiento de Subestaciones y Redes de Distribución",
    credits: 3,
    group: "EI-IV-A",
    teacherName: "Ing. Walter Fernández",
    classroom: "Campo de Subestaciones",
    schedule: "Vie 08:00 - 11:00"
  },
  {
    id: "cur_ei_404",
    code: "EIND-404",
    name: "Sistemas Neumáticos y Electroneumáticos Industriales",
    credits: 3,
    group: "EI-IV-A",
    teacherName: "Ing. Carlos Morales",
    classroom: "Lab. Neumática 402",
    schedule: "Lun 10:30 - 12:45"
  },
  {
    id: "cur_ei_405",
    code: "EIND-405",
    name: "Medio Ambiente y Desarrollo Sostenible",
    credits: 2,
    group: "EI-IV-A",
    teacherName: "Lic. Elena Gómez",
    classroom: "Aula 405",
    schedule: "Mie 10:30 - 12:00"
  }
];

// 5 Cursos Oficiales Ciclo V (Electricidad Industrial)
const CICLO_5_COURSES = [
  {
    id: "cur_ei_501",
    code: "EIND-501",
    name: "Automatización Avanzada PLC II y Redes Industriales",
    credits: 4,
    group: "EI-V-A",
    teacherName: "Ing. Roberto Chávez Peña",
    classroom: "Lab. Redes Industriales",
    schedule: "Lun - Mie 08:00 - 10:15"
  },
  {
    id: "cur_ei_502",
    code: "EIND-502",
    name: "Sistemas de Supervisión SCADA y Pantallas HMI",
    credits: 4,
    group: "EI-V-A",
    teacherName: "Ing. Manuel Ramos Salazar",
    classroom: "Centro de Cómputo SCADA",
    schedule: "Mar - Jue 08:00 - 10:15"
  },
  {
    id: "cur_ei_503",
    code: "EIND-503",
    name: "Instrumentación y Control de Procesos Industriales",
    credits: 3,
    group: "EI-V-A",
    teacherName: "Ing. Walter Fernández",
    classroom: "Lab. Instrumentación",
    schedule: "Vie 08:00 - 11:00"
  },
  {
    id: "cur_ei_504",
    code: "EIND-504",
    name: "Eficiencia Energética y Auditorías Eléctricas",
    credits: 3,
    group: "EI-V-A",
    teacherName: "Ing. Carlos Morales",
    classroom: "Aula 504",
    schedule: "Lun 10:30 - 12:45"
  },
  {
    id: "cur_ei_505",
    code: "EIND-505",
    name: "Ética y Deontología Profesional",
    credits: 2,
    group: "EI-V-A",
    teacherName: "Lic. Carmen Luzardo",
    classroom: "Aula 505",
    schedule: "Mie 10:30 - 12:00"
  }
];

// 5 Cursos Oficiales Ciclo VI (Electricidad Industrial)
const CICLO_6_COURSES = [
  {
    id: "cur_ei_601",
    code: "EIND-601",
    name: "Integración de Sistemas Automatizados y Robótica",
    credits: 4,
    group: "EI-VI-A",
    teacherName: "Ing. Roberto Chávez Peña",
    classroom: "Taller Robótica Industrial",
    schedule: "Lun - Mie 08:00 - 10:15"
  },
  {
    id: "cur_ei_602",
    code: "EIND-602",
    name: "Mantenimiento Predictivo y Gestión de Activos Eléctricos",
    credits: 4,
    group: "EI-VI-A",
    teacherName: "Ing. Manuel Ramos Salazar",
    classroom: "Lab. Predictivo 602",
    schedule: "Mar - Jue 08:00 - 10:15"
  },
  {
    id: "cur_ei_603",
    code: "EIND-603",
    name: "Proyectos Electromecánicos y Gestión de Obras",
    credits: 3,
    group: "EI-VI-A",
    teacherName: "Ing. Walter Fernández",
    classroom: "Aula de Proyectos 603",
    schedule: "Vie 08:00 - 11:00"
  },
  {
    id: "cur_ei_604",
    code: "EIND-604",
    name: "Proyecto de Innovación y Titulación EFSRT",
    credits: 3,
    group: "EI-VI-A",
    teacherName: "Ing. Manuel Ramos Salazar",
    classroom: "Taller de Titulación",
    schedule: "Lun 10:30 - 12:45"
  },
  {
    id: "cur_ei_605",
    code: "EIND-605",
    name: "Emprendimiento y Gestión Empresarial",
    credits: 2,
    group: "EI-VI-A",
    teacherName: "Lic. Elena Gómez",
    classroom: "Aula 605",
    schedule: "Mie 10:30 - 12:00"
  }
];

// 16 Fechas semanales para Ciclo I (Marzo a Junio 2027)
const DATES_2027_I = [
  "2027-03-15", "2027-03-22", "2027-03-29", "2027-04-05",
  "2027-04-12", "2027-04-19", "2027-04-26", "2027-05-03",
  "2027-05-10", "2027-05-17", "2027-05-24", "2027-05-31",
  "2027-06-07", "2027-06-14", "2027-06-21", "2027-06-28"
];

// 16 Fechas semanales para Ciclo II (Agosto a Noviembre 2027)
const DATES_2027_II = [
  "2027-08-16", "2027-08-23", "2027-08-30", "2027-09-06",
  "2027-09-13", "2027-09-20", "2027-09-27", "2027-10-04",
  "2027-10-11", "2027-10-18", "2027-10-25", "2027-11-01",
  "2027-11-08", "2027-11-15", "2027-11-22", "2027-11-29"
];

// 16 Fechas semanales para Ciclo III (Marzo a Junio 2028)
const DATES_2028_I = [
  "2028-03-13", "2028-03-20", "2028-03-27", "2028-04-03",
  "2028-04-10", "2028-04-17", "2028-04-24", "2028-05-01",
  "2028-05-08", "2028-05-15", "2028-05-22", "2028-05-29",
  "2028-06-05", "2028-06-12", "2028-06-19", "2028-06-26"
];

// 16 Fechas semanales para Ciclo IV (Agosto a Noviembre 2028)
const DATES_2028_II = [
  "2028-08-14", "2028-08-21", "2028-08-28", "2028-09-04",
  "2028-09-11", "2028-09-18", "2028-09-25", "2028-10-02",
  "2028-10-09", "2028-10-16", "2028-10-23", "2028-10-30",
  "2028-11-06", "2028-11-13", "2028-11-20", "2028-11-27"
];

// 16 Fechas semanales para Ciclo V (Marzo a Junio 2029)
const DATES_2029_I = [
  "2029-03-12", "2029-03-19", "2029-03-26", "2029-04-02",
  "2029-04-09", "2029-04-16", "2029-04-23", "2029-04-30",
  "2029-05-07", "2029-05-14", "2029-05-21", "2029-05-28",
  "2029-06-04", "2029-06-11", "2029-06-18", "2029-06-25"
];

// 16 Fechas semanales para Ciclo VI (Agosto a Noviembre 2029)
const DATES_2029_II = [
  "2029-08-13", "2029-08-20", "2029-08-27", "2029-09-03",
  "2029-09-10", "2029-09-17", "2029-09-24", "2029-10-01",
  "2029-10-08", "2029-10-15", "2029-10-22", "2029-10-29",
  "2029-11-05", "2029-11-12", "2029-11-19", "2029-11-26"
];

export const AttendanceTab: React.FC<AttendanceTabProps> = ({
  loading,
  error,
  onReload,
  enrollment,
  studentDni,
  attendance = [],
  selectedAttendanceSemester,
  setSelectedAttendanceSemester,
  expandedAttendanceCourse,
  setExpandedAttendanceCourse,
  setActiveTab,
  studentCourses = [],
  studentTasks = [],
  mpaPlanningData,
  studentGroup
}) => {
  if (loading) return <p role="status">Cargando asistencias del servidor...</p>;
  if (error) return <div role="alert" className="text-red-700"><p>{error}</p><button type="button" onClick={() => { void onReload(); }} className="border rounded-lg p-2 mt-2">Reintentar carga</button></div>;

  const activeDni = studentDni || enrollment?.studentDni || "74859612";

  // Sincronización reactiva entre pestañas
  const [, setSyncTick] = useState(0);
  useEffect(() => {
    const handleSync = () => setSyncTick((t) => t + 1);
    window.addEventListener("storage", handleSync);
    window.addEventListener("focus", handleSync);
    return () => {
      window.removeEventListener("storage", handleSync);
      window.removeEventListener("focus", handleSync);
    };
  }, []);

  const isMateo = activeDni === "74859612";

  const isCycle2 = typeof window !== "undefined" && Boolean(
    !isMateo && enrollment?.academicStatus === "MATRICULADO" && localStorage.getItem(`sfa_student_cycle_${activeDni}`) !== "2"
      ? false
      : (
        localStorage.getItem(`sfa_student_cycle_${activeDni}`) === "2" ||
        (isMateo && (
          localStorage.getItem("sfa_student_cycle_74859612") === "2" ||
          localStorage.getItem("sfa_cycle2_payment_74859612") === "true" ||
          localStorage.getItem("sfa_cycle2_payment") === "true" ||
          localStorage.getItem("sfa_cycle2_validated_74859612") === "true" ||
          localStorage.getItem("sfa_student_promoted_cycle2_74859612") === "true" ||
          localStorage.getItem("sfa_student_promoted_74859612") === "true" ||
          localStorage.getItem("sfa_simulated_cycle2_74859612")
        )) ||
        studentGroup?.cycle === 2 ||
        (studentGroup?.id?.includes("-II-") && studentGroup?.careerId === enrollment?.programId)
      )
  );

  const isGraduated = typeof window !== "undefined" && Boolean(
    !isMateo && enrollment?.academicStatus === "MATRICULADO" && localStorage.getItem(`sfa_student_graduated_all_${activeDni}`) !== "true"
      ? false
      : (
        localStorage.getItem(`sfa_student_graduated_all_${activeDni}`) === "true" ||
        localStorage.getItem(`sfa_titulacion_enabled_${activeDni}`) === "true" ||
        localStorage.getItem(`sfa_student_status_${activeDni}`) === "Egresado" ||
        (isMateo && (
          localStorage.getItem(`sfa_student_promoted_${activeDni}`) === "true" ||
          localStorage.getItem("sfa_student_promoted_74859612") === "true" ||
          localStorage.getItem("sfa_student_promoted") === "true" ||
          localStorage.getItem("sfa_student_graduated_all_74859612") === "true" ||
          localStorage.getItem("sfa_student_graduated_all") === "true" ||
          localStorage.getItem("sfa_titulacion_enabled_74859612") === "true"
        ))
      )
  );

  type SemesterKey = "2027-I" | "2027-II" | "2028-I" | "2028-II" | "2029-I" | "2029-II";

  // Estado del periodo seleccionado (interactivo y sincronizado)
  const [selectedSemester, setSelectedSemester] = useState<SemesterKey>(() => {
    if (selectedAttendanceSemester) {
      return selectedAttendanceSemester as SemesterKey;
    }
    return isGraduated ? "2027-II" : isCycle2 ? "2027-II" : "2027-I";
  });

  useEffect(() => {
    if (selectedAttendanceSemester) {
      setSelectedSemester(selectedAttendanceSemester as SemesterKey);
    }
  }, [selectedAttendanceSemester]);

  const handleSemesterChange = (newSemester: SemesterKey) => {
    setSelectedSemester(newSemester);
    if (setSelectedAttendanceSemester) {
      setSelectedAttendanceSemester(newSemester);
    }
  };

  const currentCycleRoman = 
    selectedSemester === "2029-II" ? "Ciclo VI" :
    selectedSemester === "2029-I" ? "Ciclo V" :
    selectedSemester === "2028-II" ? "Ciclo IV" :
    selectedSemester === "2028-I" ? "Ciclo III" :
    selectedSemester === "2027-II" ? "Ciclo II" : "Ciclo I";

  const currentPeriod = 
    selectedSemester === "2029-II" ? "Periodo 2029-II" :
    selectedSemester === "2029-I" ? "Periodo 2029-I" :
    selectedSemester === "2028-II" ? "Periodo 2028-II" :
    selectedSemester === "2028-I" ? "Periodo 2028-I" :
    selectedSemester === "2027-II" ? "Periodo 2027-II" : "Periodo 2027-I";

  const isContabilidad = enrollment?.programId === "contabilidad" ||
    studentCourses.some(c => c.code?.startsWith("CONT") || c.name?.toLowerCase().includes("contab"));

  // Determinar la lista de cursos del ciclo seleccionado
  const displayCourses = useMemo(() => {
    let templateCourses = CICLO_1_COURSES;
    if (isContabilidad) {
      templateCourses = (selectedSemester === "2027-I" || (!isCycle2 && !isGraduated))
        ? CONTABILIDAD_CICLO_1_COURSES
        : CONTABILIDAD_CICLO_2_COURSES;
    } else {
      templateCourses = 
        selectedSemester === "2029-II" ? CICLO_6_COURSES :
        selectedSemester === "2029-I" ? CICLO_5_COURSES :
        selectedSemester === "2028-II" ? CICLO_4_COURSES :
        selectedSemester === "2028-I" ? CICLO_3_COURSES :
        selectedSemester === "2027-II" ? CICLO_2_COURSES : CICLO_1_COURSES;
    }

    const defaultGroup = isContabilidad
      ? (selectedSemester === "2027-I" ? "CONT-I-A" : "CONT-II-A")
      : (selectedSemester === "2027-I" ? "EI-I-A" : "EI-II-A");

    return templateCourses.map((tpl) => {
      // Buscar si el curso viene en studentCourses con detalles dinámicos
      const matched = studentCourses.find(
        (sc) =>
          sc.code === tpl.code ||
          sc.id === tpl.id ||
          sc.name?.toLowerCase().includes(tpl.name.toLowerCase().slice(0, 15))
      );
      return {
        ...tpl,
        ...(matched || {}),
        code: tpl.code,
        name: tpl.name,
        credits: matched?.credits || tpl.credits,
        group: matched?.group || tpl.group || defaultGroup,
        teacherName: matched?.teacherName || tpl.teacherName,
        classroom: matched?.classroom || tpl.classroom,
        schedule: matched?.schedule || tpl.schedule,
        attendanceCourseIds: matched?.attendanceCourseIds || [tpl.id, tpl.code]
      };
    });
  }, [selectedSemester, studentCourses, isContabilidad, isCycle2, isGraduated]);

  // Cálculo de asistencia real (solo sintetiza 16 semanas históricas en ciclos ya concluidos/cerrados)
  const isSelectedSemesterConcluded = Boolean(
    isGraduated ||
    (selectedSemester === "2027-I" && isCycle2) ||
    (selectedSemester === "2027-II" && typeof window !== "undefined" && (
      localStorage.getItem(`sfa_simulated_cycle2_${activeDni}`) ||
      localStorage.getItem(`sfa_student_promoted_cycle3_${activeDni}`) === "true" ||
      (isMateo && localStorage.getItem("sfa_simulated_cycle2_74859612"))
    ))
  );

  const currentAttendanceCourses = useMemo(() => {
    const semesterDates = 
      selectedSemester === "2029-II" ? DATES_2029_II :
      selectedSemester === "2029-I" ? DATES_2029_I :
      selectedSemester === "2028-II" ? DATES_2028_II :
      selectedSemester === "2028-I" ? DATES_2028_I :
      selectedSemester === "2027-II" ? DATES_2027_II : DATES_2027_I;

    return displayCourses.map((c) => {
      const rawRecords = studentAttendanceRecords(
        attendance,
        c.attendanceCourseIds || [c.id, c.code],
        activeDni
      );

      // Solo generar 16 semanas consolidadas si el semestre ya concluyó y no hay registros crudos
      const generatedRecords = isSelectedSemesterConcluded
        ? semesterDates.map((dateStr, idx) => ({
            id: `att-${c.code}-w${idx + 1}-s1`,
            courseId: c.id || c.code,
            date: dateStr,
            week: idx + 1,
            topic: `Semana ${idx + 1}: Sesión Práctica y Formativa de Taller`,
            statusMap: { [activeDni]: "Presente" as const }
          }))
        : [];

      const courseRecords = rawRecords.length > 0 ? rawRecords : generatedRecords;
      const sesDictadas = courseRecords.length;

      let asistencias = 0;
      let faltas = 0;
      let tardanzas = 0;

      courseRecords.forEach((rec) => {
        const status = rec.statusMap?.[activeDni] || "Presente";
        if (status === "Presente" || status === "Justificado") {
          asistencias++;
        } else if (status === "Tardanza") {
          asistencias++;
          tardanzas++;
        } else if (status === "Falta") {
          faltas++;
        }
      });

      const effectiveSesDictadas = isSelectedSemesterConcluded ? Math.max(sesDictadas, 16) : sesDictadas;
      const effectiveAsistencias = isSelectedSemesterConcluded ? Math.max(asistencias, 16) : asistencias;
      const effectiveFaltas = faltas;

      const hasRecords = effectiveSesDictadas > 0;
      const attendanceRate = hasRecords ? Math.round((effectiveAsistencias / effectiveSesDictadas) * 100) : 0;
      const puntualidad = hasRecords
        ? `${Math.round(((effectiveAsistencias - tardanzas) / Math.max(effectiveAsistencias, 1)) * 100)}%`
        : "—";

      return {
        id: c.id,
        code: c.code,
        name: c.name,
        group: c.group || (selectedSemester === "2027-II" ? "EI-II-A" : "EI-I-A"),
        attendanceRate,
        statusText: hasRecords ? `${attendanceRate}% Asistencia` : "Sin registros aún",
        statusDesc: hasRecords
          ? (isSelectedSemesterConcluded ? "CONCLUIDO • 16/16 SEMANAS" : `EN CURSO • ${effectiveSesDictadas} SESIÓN${effectiveSesDictadas === 1 ? "" : "ES"}`)
          : "SIN SESIONES REGISTRADAS",
        statusType: !hasRecords ? "neutral" : attendanceRate >= 70 ? "excellent" : "danger",
        sesRealizadas: String(effectiveSesDictadas),
        sesDictadas: effectiveSesDictadas,
        records: courseRecords,
        puntualidad,
        faltas: effectiveFaltas.toString().padStart(2, "0"),
        faltasCount: effectiveFaltas,
        asistenciasCount: effectiveAsistencias,
        creditos: (c.credits || 4).toString().padStart(2, "0"),
        schedule: c.schedule || "Horario Regular",
        classroom: c.classroom || "Aula Principal",
        teacher: c.teacherName || "Docente Titular"
      };
    });
  }, [displayCourses, attendance, activeDni, selectedSemester, isSelectedSemesterConcluded]);

  const totalInasistencias = currentAttendanceCourses.reduce((acc, c) => acc + c.faltasCount, 0);
  const totalSesiones = currentAttendanceCourses.reduce((acc, c) => acc + c.sesDictadas, 0);
  const totalAsistencias = currentAttendanceCourses.reduce((acc, c) => acc + c.asistenciasCount, 0);
  const overallRate = totalSesiones > 0 ? Math.round((totalAsistencias / totalSesiones) * 100) : 0;
  const totalAlertsCount = currentAttendanceCourses.filter((c) => c.attendanceRate < 70 && c.sesDictadas > 0).length;

  return (
    <PageTransition id="attendance" className="space-y-6">
      {/* High Fidelity Institutional Header */}
      <div className="relative bg-[#800521] text-white rounded-2xl shadow-lg p-6 md:p-7 overflow-hidden text-left border-b-4 border-amber-500 mb-6">
        <div className="absolute inset-0 bg-gradient-to-r from-[#800521] to-slate-900/70 opacity-95" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <span className="bg-amber-400 text-slate-950 text-[9.5px] font-black uppercase tracking-widest px-2.5 py-1 rounded-sm inline-block select-none font-mono">
              PORTAL DEL ESTUDIANTE • CONTROL ESCOLAR
            </span>
            <h2 id="asis-view-main" className="text-2xl md:text-3xl font-black text-white tracking-tight uppercase font-display leading-none pt-0.5">
              Control de Asistencia del Estudiante
            </h2>
            <p className="text-xs text-white/90 font-medium max-w-2xl">
              Seguimiento de puntualidad presencial, registro de sesiones dictadas en taller y control de asistencia mínima reglamentaria del 70%.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {/* Selector de Periodo y Ciclo */}
            <div className="text-left bg-black/35 border border-white/25 px-3 py-1.5 rounded-xl select-none shadow-inner flex flex-col gap-0.5">
              <label htmlFor="select-periodo-asistencia" className="text-[9px] text-amber-400 font-extrabold uppercase tracking-wider block">
                Semestre Lectivo
              </label>
              <div className="relative">
                <select
                  id="select-periodo-asistencia"
                  value={selectedSemester}
                  onChange={(e) => handleSemesterChange(e.target.value as any)}
                  className="bg-transparent text-xs font-black text-white font-mono outline-none cursor-pointer pr-4 py-0.5 focus:ring-0"
                >
                  <option value="2027-I" className="text-slate-900 bg-white font-sans font-bold">
                    Periodo 2027-I • Ciclo I
                  </option>
                  {(isCycle2 || isGraduated) && (
                    <option value="2027-II" className="text-slate-900 bg-white font-sans font-bold">
                      Periodo 2027-II • Ciclo II
                    </option>
                  )}
                  {isGraduated && (
                    <>
                      <option value="2028-I" className="text-slate-900 bg-white font-sans font-bold">
                        Periodo 2028-I • Ciclo III
                      </option>
                      <option value="2028-II" className="text-slate-900 bg-white font-sans font-bold">
                        Periodo 2028-II • Ciclo IV
                      </option>
                      <option value="2029-I" className="text-slate-900 bg-white font-sans font-bold">
                        Periodo 2029-I • Ciclo V
                      </option>
                      <option value="2029-II" className="text-slate-900 bg-white font-sans font-bold">
                        Periodo 2029-II • Ciclo VI
                      </option>
                    </>
                  )}
                </select>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="bg-white hover:bg-amber-50 text-slate-900 font-bold text-xs py-2 px-4 rounded-xl flex items-center gap-2 select-none cursor-pointer transition-all shadow-md border border-white/30"
            >
              <Printer className="w-3.5 h-3.5 text-[#800521]" />
              <span>Imprimir Récord</span>
            </button>
          </div>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs border-l-4 border-l-blue-600 flex items-center justify-between text-left">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Asistencia General</span>
            <p className="text-2xl font-black text-slate-900 mt-1 font-mono">{overallRate}%</p>
          </div>
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs border-l-4 border-l-emerald-600 flex items-center justify-between text-left">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Sesiones Asistidas</span>
            <p className="text-2xl font-black text-emerald-600 mt-1 font-mono">{totalAsistencias} / {totalSesiones}</p>
          </div>
          <div className="p-2.5 bg-emerald-50 text-emerald-600 rounded-xl">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs border-l-4 border-l-purple-600 flex items-center justify-between text-left">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Inasistencias Acumuladas</span>
            <p className="text-2xl font-black text-purple-600 mt-1 font-mono">{totalInasistencias}</p>
          </div>
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-4 shadow-2xs border-l-4 border-l-amber-500 flex items-center justify-between text-left">
          <div>
            <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Cursos en Alerta (&lt;70%)</span>
            <p className="text-2xl font-black text-amber-600 mt-1 font-mono">{totalAlertsCount}</p>
          </div>
          <div className="p-2.5 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main panel: LISTADO DE ASIGNATURAS MATRICULADAS */}
      <div id="asis-courses" className="w-full space-y-4 text-left">
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex justify-between items-center border-b border-slate-100 pb-3">
            <h3 className="text-xs font-black text-slate-800 uppercase tracking-tight">
              Listado de Asignaturas Matriculadas ({currentCycleRoman})
            </h3>
            <span className="text-[10px] text-slate-500 font-extrabold uppercase font-mono">
              Periodo {selectedSemester} • 16 Semanas Completas
            </span>
          </div>

          <div className="space-y-3">
            {currentAttendanceCourses.map((c) => {
              const isOpen = expandedAttendanceCourse === c.id;
              return (
                <div key={c.id} className="border border-slate-200 rounded-xl overflow-hidden transition-all duration-200">
                  <div
                    onClick={() => setExpandedAttendanceCourse(isOpen ? null : c.id)}
                    className="p-4 bg-white hover:bg-slate-50/70 flex items-center justify-between cursor-pointer select-none transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-red-50 text-[#800521] flex items-center justify-center font-bold text-xs">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="text-left">
                        <span className="text-slate-900 font-extrabold text-xs block">{c.name}</span>
                        <span className="text-[10px] text-slate-400 font-bold block font-mono">
                          {c.code} • Grupo: {c.group} • {c.creditos} Créditos
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-right">
                      <div className="text-right">
                        <span className="text-xs font-black block text-emerald-600">
                          {c.statusText}
                        </span>
                        <span className="text-[9px] font-bold block uppercase tracking-wider text-emerald-700">
                          {c.statusDesc}
                        </span>
                      </div>
                      <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? "transform rotate-180 text-slate-600" : ""}`} />
                    </div>
                  </div>

                  {isOpen && (
                    <div className="bg-slate-50 border-t border-slate-100 p-4 space-y-3 text-left">
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-left">
                        <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                          <span className="text-[9px] text-slate-400 uppercase font-black block leading-none">Sesiones Dictadas</span>
                          <span className="text-xs font-black text-slate-800 block mt-2">{c.sesRealizadas}</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                          <span className="text-[9px] text-slate-400 uppercase font-black block leading-none">Puntualidad</span>
                          <span className="text-xs font-black text-slate-800 block mt-2">{c.puntualidad}</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                          <span className="text-[9px] text-slate-400 uppercase font-black block leading-none">Faltas Injustificadas</span>
                          <span className="text-xs font-black text-slate-800 block mt-2">{c.faltas}</span>
                        </div>
                        <div className="bg-white p-3 rounded-lg border border-slate-200/80">
                          <span className="text-[9px] text-slate-400 uppercase font-black block leading-none">Créditos</span>
                          <span className="text-xs font-black text-slate-800 block mt-2">{c.creditos} Cr.</span>
                        </div>
                      </div>

                      <div className="bg-white p-4 rounded-xl border border-slate-200/80 text-xs space-y-3">
                        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                          <p className="font-extrabold text-[#800521] uppercase text-[11px] tracking-wider flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-amber-600" />
                            Historial de Sesiones Registradas
                          </p>
                          <span className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-full font-mono">
                            {c.records.length} {c.records.length === 1 ? "sesión registrada" : "sesiones registradas"}
                          </span>
                        </div>

                        {c.records.length > 0 ? (
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-72 overflow-y-auto pr-1">
                            {c.records.map((record) => {
                              const status = record.statusMap?.[activeDni] || "Presente";
                              const statusConfig = {
                                Presente: { bg: "bg-emerald-50/80", text: "text-emerald-700", border: "border-emerald-200", icon: CheckCircle2, label: "Asistencia Confirmada" },
                                Tardanza: { bg: "bg-amber-50/80", text: "text-amber-700", border: "border-amber-200", icon: Clock, label: "Tardanza Justificada" },
                                Falta: { bg: "bg-rose-50/80", text: "text-rose-700", border: "border-rose-200", icon: AlertTriangle, label: "Inasistencia Injustificada" },
                                Justificado: { bg: "bg-blue-50/80", text: "text-blue-700", border: "border-blue-200", icon: FileText, label: "Permiso / Justificado" }
                              }[status] || { bg: "bg-slate-50", text: "text-slate-700", border: "border-slate-200", icon: Clock, label: status };

                              const StatusIcon = statusConfig.icon;

                              return (
                                <div key={record.id || `${record.courseId}-${record.date}`} className={`flex items-center justify-between p-2.5 rounded-lg border ${statusConfig.border} ${statusConfig.bg}`}>
                                  <div className="flex items-center gap-2.5">
                                    <StatusIcon className={`w-4 h-4 ${statusConfig.text} shrink-0`} />
                                    <div>
                                      <span className="font-black text-slate-800 text-[11px] block">
                                        Fecha: {record.date.split("-").reverse().join("/")}
                                      </span>
                                      <span className="text-[10px] text-slate-500 font-medium block">
                                        Semana {record.week || 1} • Sesión Formativa
                                      </span>
                                    </div>
                                  </div>
                                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md border ${statusConfig.border} bg-white ${statusConfig.text}`}>
                                    {status}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-center py-4 bg-slate-50/50 rounded-lg border border-dashed border-slate-200">
                            <Clock className="w-5 h-5 text-slate-400 mx-auto mb-1" />
                            <p className="text-slate-500 text-xs font-semibold">Sin registros de asistencia cargados en este periodo.</p>
                          </div>
                        )}
                      </div>

                      <div className="bg-white p-3.5 rounded-lg border border-slate-200/80 text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-bold">Docente Titular:</span>
                          <span className="font-extrabold text-slate-800">{c.teacher}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-bold">Aula Asignada:</span>
                          <span className="font-extrabold text-slate-800">{c.classroom}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500 font-bold">Horario:</span>
                          <span className="font-mono font-bold text-[#800521]">{c.schedule}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PageTransition>
  );
};
