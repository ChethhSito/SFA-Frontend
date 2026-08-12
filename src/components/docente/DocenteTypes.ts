import { CourseMaterial, CourseAssignment } from "../../types";

export interface WeeklyObservation {
  id: string;
  text: string;
  date: string;
  type: "General" | "Incidencia" | "Acuerdo";
}

export interface StudentRosterItem {
  dni: string;
  name: string;
  lastName: string;
  email: string;
  phone: string;
}

export const ROSTER: StudentRosterItem[] = [
  { dni: "12345678", name: "Luis Fernando", lastName: "Castillo Rivera", email: "luis.castillo@iestpsfa.edu.pe", phone: "987654322" },
  { dni: "22334455", name: "María de los Ángeles", lastName: "Mendoza Prado", email: "maria.mendoza@iestpsfa.edu.pe", phone: "911223344" },
  { dni: "44556677", name: "Diego Valentín", lastName: "Ruiz Espinoza", email: "diego.ruiz@iestpsfa.edu.pe", phone: "944556677" },
  { dni: "88776655", name: "Sofía Alejandra", lastName: "Torres Cáceres", email: "sofia.torres@iestpsfa.edu.pe", phone: "988776655" },
  { dni: "55667788", name: "Jean Pierre", lastName: "Gamarra Flores", email: "jean.gamarra@iestpsfa.edu.pe", phone: "955667788" }
];

export const WEEKLY_THEMES: { [code: string]: { topic: string; desc: string }[] } = {
  "EE-101": [
    { topic: "Introducción a la Automatización Industrial", desc: "Syllabus del curso, pirámide de automatización, arquitecturas de control." },
    { topic: "Sensores y Actuadores de Campo", desc: "Mediciones analógicas y discretas, actuadores neumáticos y contactores." },
    { topic: "Controladores Lógicos Programables", desc: "Controladores Lógicos Programables: Arquitectura del PLC Siemens S7-1200, módulos de comunicación y direccionamiento." },
    { topic: "Lógica de Contactos Ladder", desc: "Lógica de relés combinatoria, contactos NA/NC, bobinas, temporizadores TON/TOF." },
    { topic: "Temporizadores y Conteo de Eventos", desc: "Configuración de temporizadores en cascada y contadores CTU/CTD." },
    { topic: "Interfaces Hombre-Máquina (HMI)", desc: "Sistemas HMI de panel dinámico, botones, indicadores luminosos y alarmas." },
    { topic: "Sistemas SCADA", desc: "Supervisión remota, visualización de tendencias, base de datos de tags lectivos." },
    { topic: "Seguridad Industrial y Redes", desc: "Normativas de seguridad en celdas de automatización y buses de campo (Profinet)." },
    { topic: "Evaluación Parcial Práctica", desc: "Examen de control secuencial por lotes en estación modular síncrona." },
    { topic: "Variadores de Frecuencia", desc: "Integración de variador de velocidad con motor mediante señales analógicas." },
    { topic: "Procesamiento Analógico", desc: "Escalamiento normado de señales de temperatura, presión y nivel en PLC." },
    { topic: "Control PID Avanzado", desc: "Sintonización empírica de bucles de control PID mediante autotuning." },
    { topic: "Programación por Bloques de Función (FBD)", desc: "Estructuras de subrutinas orientadas a modularidad de software." },
    { topic: "Mantenimiento y Diagnóstico", desc: "Lectura de buffers de diagnóstico de CPU, depuración en línea." },
    { topic: "Manufactura Integrada (CIM)", desc: "Lógica de celdas robóticas, sincronismo de fajas transportadoras." },
    { topic: "Evaluación Final e Informe", desc: "Sustentación del proyecto final de automatización de planta embotelladora." }
  ],
  "SY-301": [
    { topic: "Ciclo de Vida de Software y PMBOK V7", desc: "Introducción a marcos predictivos e híbridos en desarrollo tecnológico." },
    { topic: "Gestión de Requisitos del Negocio", desc: "Técnicas de elicitación, matriz de transaccionalidad y definición del alcance del software." },
    { topic: "Planificación: EDT (WBS) y Cronograma", desc: "Desglose jerárquico del trabajo, hitos y paquetes de control de avance." },
    { topic: "Estimaciones Metodológicas de Esfuerzo", desc: "Cálculo por Puntos de Función, estimaciones COCOMO II y juicio de expertos." },
    { topic: "Programación con Redes de Ruta Crítica", desc: "Métodos PERT/CPM para identificar actividades críticas del proyecto." },
    { topic: "Gobernanza y Gestión de Riesgos", desc: "Identificación y mitigación de riesgos de alcance, tiempo, costo y personal." },
    { topic: "Aseguramiento de Calidad de Software (SQA)", desc: "Plan de SQA, auditorías de procesos y auditoría de código." },
    { topic: "SCRUM: Gestión Ágil Colaborativa", desc: "Conceptos clave: Sprints, Scrum Master, Product Owner y Kanban boards." },
    { topic: "Sistemas de Gestión de Configuración (SCM)", desc: "Flujos de trabajo en ramas, DevOps e integración continua." },
    { topic: "Métricas y KPIs Corporativos del Proyecto", desc: "Análisis del valor ganado (CVP, RVP, CPI, SPI) para presupuestos." },
    { topic: "Contratos y Adquisiciones Tecnológicas", desc: "Selección de proveedores cloud, SLA (Service Level Agreements) y contratos." },
    { topic: "Estrategia de Pruebas e Integración", desc: "Pruebas unitarias, integradas, UAT (User Acceptance Testing) y planes de QA." },
    { topic: "Gestión del Éxito de Adopción (Change Management)", desc: "Metodologías de entrega gradual, capacitación y documentación corporativa." },
    { topic: "Marcos de Trabajo COBIT e ITIL", desc: "Gobernanza corporativa de infraestructuras de TI y mesas de ayuda." },
    { topic: "Auditoría de Proyectos e Informes", desc: "Preparación de la memoria técnica de cierre académico y lecciones aprendidas." },
    { topic: "Defensa Pública de Portafolio", desc: "Exposición final de la carpeta del proyecto administrativo del sistema ERP." }
  ],
  "SY-302": [
    { topic: "El Modelo OSI y Enrutamiento IP Avanzado", desc: "Análisis de capas físicas y esquemas de direccionamiento de interconexión." },
    { topic: "VLSM y Direccionamiento CIDR", desc: "Subneteo de longitud variable para optimizar rangos de host." },
    { topic: "Enrutamiento Estático vs Enrutamiento Dinámico", desc: "Cálculos de métricas, distancias administrativas e interacciones de pasarelas." },
    { topic: "Protocolo RIPv2 y Configuración Básica", desc: "Enrutamiento por vector de distancia, timers y balanceo de carga." },
    { topic: "Protocolo OSPF Single Area y Configuración", desc: "Enrutamiento por estado de enlace, determinación de ID de router, áreas y adyacencias." },
    { topic: "Virtual Local Area Networks (VLANs) y Trunking", desc: "Segmentación de redes de conmutación, protocolo de etiquetado 802.1Q." },
    { topic: "Enrutamiento Inter-VLAN (Router-on-a-Stick)", desc: "Subinterfaces lógicas, enrutamiento en switches multicapa." },
    { topic: "Protocolo STP (Spanning Tree Protocol)", desc: "Evitar bucles de capa 2, roles de puerto, elección de root bridge y convergencia." },
    { topic: "Examen Parcial Práctico en Laboratorio", desc: "Simulación de interconexión compleja y direccionamiento físico de switches." },
    { topic: "Listas de Control de Acceso (ACLs)", desc: "Reglas de filtrado de tráfico IP, diferencias entre ACLs estándar y extendidas." },
    { topic: "Configuración de NAT Estática, Dinámica y PAT", desc: "Traducción de direcciones públicas y privadas, sobrecarga de puertos." },
    { topic: "Arquitectura WAN, VPN e IPSec", desc: "Túneles de comunicación cifrada para oficinas distribuidas geográficamente." },
    { topic: "DHCPv4 y DHCPv6 Configuración de Servidores", desc: "Asignación dinámica de direcciones IP y exclusiones en routers." },
    { topic: "Servicios Inalámbricos WLAN y Seguridad WPA3", desc: "Acceso inalámbrico estructurado, controladores AP y autenticación." },
    { topic: "Monitoreo con SNMP y logs de Syslog", desc: "Gestión proactiva y reporte de alertas de estado de tarjetas de red." },
    { topic: "Proyecto Integrador de Telecomunicaciones", desc: "Sustentación de infraestructura multi-sucursal completamente conectada." }
  ]
};

export const getWeekTheme = (courseCode: string, week: number) => {
  const list = WEEKLY_THEMES[courseCode];
  if (list && list[week - 1]) {
    return list[week - 1];
  }
  return {
    topic: `Semana ${week}: Unidad de Aprendizaje y Práctica`,
    desc: `Análisis del tema silábico de la Semana ${week} correspondiente al programa de estudios institucional.`
  };
};
