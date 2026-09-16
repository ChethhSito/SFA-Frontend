import { useState, useEffect } from "react";
import { Role } from "../../types";

const alertQueue: string[] = [];
let globalAlertHandler: ((message: string) => void) | null = null;

if (typeof window !== "undefined") {
  window.alert = (message: any) => {
    const msg = String(message || "");
    if (globalAlertHandler) {
      globalAlertHandler(msg);
    } else {
      alertQueue.push(msg);
    }
  };
}

export function useAuthSession() {
  const [currentUser, setCurrentUser] = useState<{ role: Role; identifier: string }>(() => {
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path === "/ingresar" || path === "/login" || window.location.search.includes("login")) {
        return { role: "login", identifier: "" };
      }
    }
    const roles: Role[] = ["superadmin", "administrador", "postulante", "alumno", "docente", "mpa", "mge", "maf"];
    for (const r of roles) {
      const saved = localStorage.getItem(`sfa_session_${r}`);
      if (saved) {
        return { role: r, identifier: saved };
      }
    }
    return { role: "portal", identifier: "" };
  });

  const [customAlert, setCustomAlert] = useState<{ message: string; show: boolean }>({
    message: "",
    show: false
  });

  useEffect(() => {
    globalAlertHandler = (message: string) => {
      setCustomAlert({ message, show: true });
    };
    while (alertQueue.length > 0) {
      const msg = alertQueue.shift();
      if (msg) {
        setCustomAlert({ message: msg, show: true });
      }
    }
    return () => {
      globalAlertHandler = null;
    };
  }, []);

  const handleLogout = () => {
    const roles: Role[] = ["superadmin", "administrador", "postulante", "alumno", "docente", "mpa", "mge", "maf"];
    roles.forEach((r) => localStorage.removeItem(`sfa_session_${r}`));
    setCurrentUser({ role: "portal", identifier: "" });
  };

  const handleLoginSuccess = (role: Role, identifier: string) => {
    localStorage.setItem(`sfa_session_${role}`, identifier);
    setCurrentUser({ role, identifier });
  };

  return {
    currentUser,
    setCurrentUser,
    customAlert,
    setCustomAlert,
    handleLogout,
    handleLoginSuccess
  };
}
