import React, { createContext, useContext, useState, useEffect } from "react";
import { Role, SystemUser } from "../types";

interface AuthContextType {
  currentRole: Role | null;
  currentUserIdentifier: string | null;
  isAuthenticated: boolean;
  login: (role: Role, identifier: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  currentRole: null,
  currentUserIdentifier: null,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
});

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [currentUserIdentifier, setCurrentUserIdentifier] = useState<string | null>(null);

  useEffect(() => {
    const roles: Role[] = ["superadmin", "administrador", "postulante", "alumno", "docente", "mpa", "mge", "maf"];
    for (const r of roles) {
      const savedSession = localStorage.getItem(`sfa_session_${r}`);
      if (savedSession) {
        setCurrentRole(r);
        setCurrentUserIdentifier(savedSession);
        break;
      }
    }
  }, []);

  const login = (role: Role, identifier: string) => {
    const roles: Role[] = ["superadmin", "administrador", "postulante", "alumno", "docente", "mpa", "mge", "maf"];
    roles.forEach((r) => localStorage.removeItem(`sfa_session_${r}`));
    localStorage.setItem(`sfa_session_${role}`, identifier);
    setCurrentRole(role);
    setCurrentUserIdentifier(identifier);
  };

  const logout = () => {
    const roles: Role[] = ["superadmin", "administrador", "postulante", "alumno", "docente", "mpa", "mge", "maf"];
    roles.forEach((r) => localStorage.removeItem(`sfa_session_${r}`));
    setCurrentRole(null);
    setCurrentUserIdentifier(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentRole,
        currentUserIdentifier,
        isAuthenticated: !!currentRole,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
