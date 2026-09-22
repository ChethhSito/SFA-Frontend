import React from "react";
import { Search, Plus, Edit2, Trash2, CircleDot } from "lucide-react";
import { useAcademicCatalog } from "../../../context/AcademicCatalogContext";
import Button from "../../ui/Button";
import { ProcessedStudent } from "../mgeTypes";

interface Props {
  filteredStudents: ProcessedStudent[];
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenAddModal: () => void;
  onEditClick: (dni: string) => void;
  onDeleteStudent: (dni: string) => void;
}

export default function MgeEstudiantesTab({
  filteredStudents,
  searchQuery,
  onSearchChange,
  onOpenAddModal,
  onEditClick,
  onDeleteStudent,
}: Props) {
  const { programs: ACADEMIC_PROGRAMS } = useAcademicCatalog();
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar estudiante por DNI, Nombre o Correo..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-xl text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#9F062A] bg-slate-50/50"
          />
        </div>
        <Button
          onClick={onOpenAddModal}
          className="w-full md:w-auto bg-[#9F062A] hover:bg-[#820522] text-white text-xs font-bold uppercase tracking-widest px-4 py-2.5 rounded-xl flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" /> Registrar Nuevo Estudiante
        </Button>
      </div>

      <div className="border border-slate-200 rounded-xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Estudiante</th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">DNI</th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Carrera Técnica</th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Contacto</th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider">Estado Académico</th>
                <th className="px-4 py-3.5 text-[10px] font-black uppercase text-slate-500 tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredStudents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-slate-400 font-bold uppercase tracking-wide">
                    No se encontraron registros de estudiantes con ese criterio.
                  </td>
                </tr>
              ) : (
                filteredStudents.map((st) => (
                  <tr key={st.dni} className="hover:bg-slate-50/50 transition-all">
                    <td className="px-4 py-3.5">
                      <div className="font-extrabold text-slate-900">{st.lastName}, {st.name}</div>
                      <div className="text-[10px] text-slate-450 font-medium">{st.email}</div>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-700 font-bold">{st.dni}</td>
                    <td className="px-4 py-3.5">
                      <span className="font-semibold text-slate-800 text-[11px] block">
                        {ACADEMIC_PROGRAMS.find((p) => p.id === st.programId)?.name || st.programId}
                      </span>
                      <span className="text-[9px] text-[#9F062A] font-black uppercase bg-red-50 px-1.5 py-0.5 rounded">
                        Turno: {st.shift}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-700">{st.phone || "Sin Teléfono"}</div>
                      <div className="text-[9.5px] text-slate-450 font-medium">Distrito: {st.district}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      {st.academicStatus === "MATRICULADO" ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 font-bold text-[10px] uppercase tracking-wide">
                          <CircleDot className="w-2.5 h-2.5 animate-pulse" /> Matriculado Activo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-100 font-bold text-[10px] uppercase tracking-wide">
                          ADMITIDO (PENDIENTE MATRÍCULA)
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex justify-end gap-1.5">
                        <button
                          onClick={() => onEditClick(st.dni)}
                          className="p-1 px-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold tracking-wide uppercase text-[10px] rounded transition-all cursor-pointer flex items-center gap-1"
                        >
                          <Edit2 className="w-3 h-3" /> Ficha
                        </button>
                        <button
                          onClick={() => onDeleteStudent(st.dni)}
                          className="p-1 px-2 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded transition-all cursor-pointer"
                          title="Dar de baja"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
