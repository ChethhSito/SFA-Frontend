import React from "react";
import { createPortal } from "react-dom";
import { Unlock } from "lucide-react";
import Button from "../../ui/Button";

export interface EvaluationAuditContext {
  week?: number | string;
  modality?: string;
  evaluatedAt?: string;
}

interface EditGradeModalProps {
  saving?: boolean;
  isOpen: boolean;
  activeStudentName: string;
  activeVariableId: string;
  tempGrade: string;
  gradeErrorMessage: string;
  auditContext?: EvaluationAuditContext;
  onGradeChange: (value: string) => void;
  onSaveGrade: () => void;
  onClose: () => void;
}

export const EditGradeModal: React.FC<EditGradeModalProps> = ({
  saving = false,
  isOpen,
  activeStudentName,
  activeVariableId,
  tempGrade,
  gradeErrorMessage,
  auditContext,
  onGradeChange,
  onSaveGrade,
  onClose
}) => {
  if (!isOpen) return null;

  const content = (
    <div 
      className="fixed inset-0 z-[99999] bg-slate-950/75 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget && !saving) onClose();
      }}
    >
      <div 
        className="bg-white rounded-2xl border border-slate-150 max-w-sm w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="text-center space-y-1">
          <div className="mx-auto w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center mb-3">
            <Unlock className="w-5 h-5 text-emerald-700" />
          </div>
          <h3 className="text-sm font-black text-slate-900 uppercase">Establecer Nueva Nota</h3>
          <p className="text-[10px] text-slate-500 font-semibold leading-normal font-bold">
            Modificando nota en <span className="text-slate-800 uppercase font-black">{activeStudentName}</span> <br />
            para el indicador <span className="text-[#8B0026] font-mono font-extrabold">[{activeVariableId}]</span>
          </p>
        </div>

        {/* Auditoría: Dónde y en qué tiempo se evalúa */}
        <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 text-[10px] space-y-1.5 shadow-3xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-bold uppercase tracking-wider text-[9px] text-slate-400">Sesión / Lugar:</span>
            <span className="font-extrabold text-slate-800">
              {auditContext?.week ? `Semana ${auditContext.week} • ${auditContext.modality || "Presencial"}` : "Planilla Oficial de Actas"}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-bold uppercase tracking-wider text-[9px] text-slate-400">Fecha y Hora:</span>
            <span className="font-mono font-bold text-slate-700">
              {auditContext?.evaluatedAt || new Date().toLocaleString("es-PE", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })}
            </span>
          </div>
          <div className="flex items-center justify-between text-slate-500">
            <span className="font-bold uppercase tracking-wider text-[9px] text-slate-400">Firma Digital:</span>
            <span className="font-bold text-[#800521] flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" /> PIN Docente Verificado
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-slate-500 uppercase text-[9px] font-black tracking-wider text-left">Firma Digital Habilitada. Nueva Nota:</label>
          <input
            disabled={saving}
            type="text"
            autoFocus
            placeholder="Ejemplo: 14.5"
            value={tempGrade}
            onChange={(e) => onGradeChange(e.target.value)}
            className="w-full text-center py-3 border border-slate-200 rounded-xl font-mono text-2xl font-black text-[#8B0521] focus:outline-[#8B0026] select-all bg-slate-50/50"
          />
          <p className="text-[9.5px] text-slate-400 font-bold leading-normal text-center">
            Rango exigido de 0.0 a 20.0 (se permiten números decimales, no letras).
          </p>
        </div>

        {gradeErrorMessage && (
          <p className="text-[10px] text-[#8B0026] font-extrabold text-center uppercase animate-pulse">{gradeErrorMessage}</p>
        )}

        <div className="flex gap-2">
          <Button
            disabled={saving}
            onClick={onClose}
            variant="secondary"
            className="flex-1 py-2.5 font-bold uppercase text-[10px]"
          >
            Cancelar
          </Button>
          <Button
            disabled={saving}
            onClick={onSaveGrade}
            variant="primary"
            className="flex-1 py-2.5 font-bold uppercase text-[10px] bg-[#8B0026] text-white"
          >
            {saving ? "Guardando..." : "Guardar Nota"}
          </Button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
};
