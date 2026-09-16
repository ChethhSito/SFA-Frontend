/**
 * WeeklyViews.tsx — Barrel re-export
 *
 * Cada componente vive en su propio archivo dentro de ./views/.
 * Este módulo re-exporta todo para mantener compatibilidad con las
 * importaciones existentes en DocenteDashboard.tsx y otros consumers.
 */

export { ResumenCurso }    from "./views/ResumenCurso";
export { MaterialManager } from "./views/MaterialManager";
export { TareaManager }    from "./views/TareaManager";
export { ObservacionManager } from "./views/ObservacionManager";
export { EntregaManager }  from "./views/EntregaManager";
export { CalificacionManager } from "./views/CalificacionManager";
export { CierreCurso }     from "./views/CierreCurso";
