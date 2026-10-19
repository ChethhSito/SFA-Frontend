import { useEffect, useState } from "react";
import type { MgeSubTab } from "../../components/mge/mgeTypes";

const allowedTabs = new Set<MgeSubTab>(["estudiantes", "matricula_gral", "pagos", "notas", "asistencias", "riesgo_ia", "historial", "constancias", "reportes"]);
export function useMgeNavigation() {
  const [activeSubTab, setActiveSubTab] = useState<MgeSubTab>(() => {
    try {
      const saved = sessionStorage.getItem("sfa_mge_active_tab") as MgeSubTab | null;
      if (saved && allowedTabs.has(saved)) return saved;
    } catch { /* Navigation still works when browser storage is unavailable. */ }
    return "estudiantes";
  });
  useEffect(() => {
    try { sessionStorage.setItem("sfa_mge_active_tab", activeSubTab); }
    catch { /* Persistence is optional; keep the current view usable. */ }
  }, [activeSubTab]);
  return { activeSubTab, setActiveSubTab };
}
