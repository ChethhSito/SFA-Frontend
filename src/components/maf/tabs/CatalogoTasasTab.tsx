import React from "react";
import { Coins, Plus, Trash2 } from "lucide-react";
import Button from "../../ui/Button";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "../../ui/Card";
import PageTransition from "../../ui/PageTransition";
import { MafConcept } from "../mafTypes";

interface CatalogoTasasTabProps {
  concepts: MafConcept[];
  setShowAddConceptModal: (show: boolean) => void;
  handleToggleConceptActive: (id: string) => void;
  handleDeleteConcept: (id: string, code: string) => void;
}

export const CatalogoTasasTab: React.FC<CatalogoTasasTabProps> = ({
  concepts,
  setShowAddConceptModal,
  handleToggleConceptActive,
  handleDeleteConcept
}) => {
  return (
    <PageTransition id="catalogo_tasas" className="space-y-6">
      <Card>
        <CardHeader className="border-b border-slate-100 pb-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-slate-900 flex items-center gap-2">
                <Coins className="w-5 h-5 text-amber-500" />
                Catálogo Oficial de Tasas y Aranceles Escolares
              </CardTitle>
              <CardDescription>
                Gestione el catálogo unificado de conceptos de pago válidos para el año académico 2026. Los módulos externos consumirán estas tasas autorizadas.
              </CardDescription>
            </div>
            <div>
              <Button
                onClick={() => setShowAddConceptModal(true)}
                className="bg-[#9F062A] text-white hover:bg-[#800521] font-black text-xs uppercase tracking-widest px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-red-950/20"
              >
                <Plus className="w-4 h-4" /> Agregar Nueva Tasa
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-550">Código Tasa</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-550">Concepto Académico</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-550">Grupo / Categoría</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-550 font-mono">Arancel (Tasa Oficial)</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-550">Estado</th>
                  <th className="px-4 py-3 text-[10px] font-black uppercase text-slate-550 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold text-slate-700">
                {concepts.map((c) => (
                  <tr key={c.id} className={`hover:bg-slate-50/50 transition-all ${!c.active ? "opacity-60" : ""}`}>
                    <td className="px-4 py-3.5 font-mono text-slate-900 font-black">{c.code}</td>
                    <td className="px-4 py-3.5">
                      <div className="font-extrabold text-slate-900">{c.name}</div>
                      <div className="text-[10px] text-slate-500 font-bold block leading-relaxed mt-0.5">{c.description}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-750 text-[10px] font-extrabold uppercase tracking-wide">
                        {c.category}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-slate-950 font-extrabold text-sm">
                      S/. {c.amount.toFixed(2)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`px-2 py-0.5 rounded text-[9.5px] font-black uppercase ${
                        c.active ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-slate-100 text-slate-500"
                      }`}>
                        {c.active ? "ACTIVO" : "INACTIVO"}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => handleToggleConceptActive(c.id)}
                          className={`px-2.5 py-1 rounded text-[9px] font-black uppercase tracking-wider cursor-pointer ${
                            c.active ? "bg-amber-50 text-amber-700 hover:bg-amber-100" : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                          }`}
                        >
                          {c.active ? "DESACTIVAR" : "ACTIVAR"}
                        </button>
                        <button
                          onClick={() => handleDeleteConcept(c.id, c.code)}
                          className="p-1 text-red-500 hover:text-red-700 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </PageTransition>
  );
};
