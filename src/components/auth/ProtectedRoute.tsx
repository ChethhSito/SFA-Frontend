import React from "react";
import { Role } from "../../types";
import { useAuth } from "../../context/AuthContext";
import { ShieldAlert } from "lucide-react";

interface ProtectedRouteProps {
  allowedRoles: Role[];
  children: React.ReactNode;
  onUnauthorized?: () => void;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  allowedRoles,
  children,
  onUnauthorized,
}) => {
  const { currentRole, isAuthenticated } = useAuth();

  if (!isAuthenticated || !currentRole || !allowedRoles.includes(currentRole)) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col justify-center items-center p-6 text-white font-sans">
        <div className="bg-slate-900 border border-red-500/30 p-8 rounded-2xl max-w-md w-full text-center shadow-2xl backdrop-blur-xl">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-500/20">
            <ShieldAlert size={36} />
          </div>
          <h2 className="text-xl font-bold mb-2 text-white">Acceso No Autorizado</h2>
          <p className="text-sm text-slate-400 mb-6">
            No tienes los permisos requeridos ({allowedRoles.join(", ")}) para visualizar este módulo.
          </p>
          <button
            onClick={() => onUnauthorized ? onUnauthorized() : window.location.reload()}
            className="w-full py-3 px-4 bg-gradient-to-r from-red-600 to-amber-600 hover:from-red-500 hover:to-amber-500 text-white font-semibold rounded-xl shadow-lg transition-all transform hover:-translate-y-0.5"
          >
            Volver al Inicio
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};
