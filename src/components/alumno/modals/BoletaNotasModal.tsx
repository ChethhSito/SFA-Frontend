import React from "react";
import { Award, XCircle, Printer, Download, GraduationCap, CheckCircle2 } from "lucide-react";

interface BoletaNotasModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentDni: string;
  studentName: string;
  careerName: string;
  cycleNumber: number;
  courses: Array<{ name: string; grade: number; approved: boolean }>;
  average: number;
}

export const BoletaNotasModal: React.FC<BoletaNotasModalProps> = ({
  isOpen,
  onClose,
  studentDni,
  studentName,
  careerName,
  cycleNumber,
  courses,
  average
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    const printContents = document.getElementById("boleta-print-card")?.innerHTML;
    if (!printContents) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Boleta Informativa de Notas - Ciclo ${cycleNumber}</title>
            <style>
              body { font-family: system-ui, -apple-system, sans-serif; background: white; padding: 30px; display: flex; justify-content: center; }
              #boleta { border: 4px double #9F062A; padding: 30px; max-width: 650px; background: #fafaf9; }
              table { width: 100%; border-collapse: collapse; margin: 15px 0; }
              th, td { border: 1px solid #cbd5e1; padding: 8px 12px; text-align: left; font-size: 11px; }
              th { background-color: #f1f5f9; font-weight: 800; color: #0f172a; }
              .text-center { text-align: center; }
              .text-right { text-align: right; }
              .font-bold { font-weight: 700; }
              .font-black { font-weight: 900; }
              .text-[#9F062A] { color: #9F062A; }
            </style>
          </head>
          <body>
            <div id="boleta">${printContents}</div>
            <script>
              window.onload = function() { window.print(); setTimeout(() => window.close(), 500); };
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleDownload = () => {
    const textContent = `
========================================
MINISTERIO DE EDUCACIÓN DEL PERÚ
IESTP "SAN FRANCISCO DE ASÍS"
BOLETA INFORMATIVA DE NOTAS - CICLO ${cycleNumber}
========================================

ESTUDIANTE: ${studentName}
DNI: ${studentDni}
CARRERA: ${careerName}
PROMEDIO PONDERADO DEL CICLO: ${average}

CURSOS EVALUADOS:
----------------------------------------
${courses.map((c, i) => `${i + 1}. ${c.name} | NOTA: ${c.grade} | ${c.approved ? 'APROBADO' : 'DESAPROBADO'}`).join("\n")}
----------------------------------------
Documento oficial emitido por la Secretaría Académica.
Periodo Lectivo 2026-I • Lima, Perú.
========================================
    `;
    const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `Boleta_Notas_Ciclo_${cycleNumber}_${studentDni}.txt`;
    link.click();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#9F062A] to-[#800521] text-white px-5 py-3.5 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-300" />
            <span className="font-extrabold text-xs uppercase tracking-wide">
              Boleta Informativa de Notas • Ciclo {cycleNumber}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Print Card Body */}
        <div className="flex-1 p-5 overflow-y-auto bg-slate-100/50 custom-scrollbar">
          <div
            id="boleta-print-card"
            className="bg-stone-50 border-4 border-double border-[#9F062A] p-6 max-w-xl mx-auto shadow-sm rounded-xl text-slate-900 font-sans"
          >
            <div className="border-b-2 border-amber-500 pb-3 mb-4 text-center">
              <span className="text-[9px] font-bold text-amber-600 uppercase tracking-widest block">
                MINISTERIO DE EDUCACIÓN DEL PERÚ
              </span>
              <h2 className="text-xs font-black text-slate-900 uppercase tracking-wide">
                INSTITUTO DE EDUCACIÓN SUPERIOR TECNOLÓGICO PÚBLICO
              </h2>
              <h1 className="text-sm font-black text-[#9F062A] uppercase tracking-widest">
                "SAN FRANCISCO DE ASÍS"
              </h1>
              <span className="text-[8px] font-semibold text-slate-400 block mt-0.5">
                R.M. N° 0233-80-ED • LIMA, PERÚ
              </span>
            </div>

            <div className="bg-white p-3.5 rounded-xl border border-slate-200 mb-4 space-y-1 text-xs">
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-400 font-bold uppercase text-[9px]">Estudiante:</span>
                <span className="font-extrabold text-slate-800 uppercase">{studentName}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-400 font-bold uppercase text-[9px]">DNI:</span>
                <span className="font-mono font-bold text-[#9F062A]">{studentDni}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-1">
                <span className="text-slate-400 font-bold uppercase text-[9px]">Carrera:</span>
                <span className="font-extrabold text-slate-800">{careerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold uppercase text-[9px]">Ciclo Académico:</span>
                <span className="font-bold text-amber-600">Ciclo {cycleNumber}</span>
              </div>
            </div>

            {/* Courses Grade Table */}
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white mb-4">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 uppercase text-[9.5px] font-black border-b border-slate-200">
                    <th className="p-2.5">#</th>
                    <th className="p-2.5">Asignatura / Curso</th>
                    <th className="p-2.5 text-center">Nota</th>
                    <th className="p-2.5 text-center">Condición</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-semibold text-slate-700 text-[11px]">
                  {courses && courses.length > 0 ? (
                    courses.map((c, i) => (
                      <tr key={i} className="hover:bg-slate-50">
                        <td className="p-2.5 text-slate-400 font-mono">{i + 1}</td>
                        <td className="p-2.5 font-bold text-slate-800">{c.name}</td>
                        <td className={`p-2.5 text-center font-mono font-bold ${c.grade >= 13 ? "text-slate-900" : "text-rose-600"}`}>
                          {c.grade}
                        </td>
                        <td className="p-2.5 text-center">
                          <span className={`px-2 py-0.5 rounded-full text-[9.5px] font-extrabold ${c.approved ? "bg-emerald-100 text-emerald-800" : "bg-rose-100 text-rose-800"}`}>
                            {c.approved ? "Aprobado" : "Desaprobado"}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="p-3 text-center text-slate-400 font-medium">
                        No hay cursos registrados en este ciclo.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Summary Footer */}
            <div className="p-3 bg-amber-500/10 border border-amber-300/80 rounded-xl flex items-center justify-between text-xs mb-4">
              <span className="font-extrabold text-slate-800">Promedio Ponderado del Ciclo:</span>
              <span className="text-base font-black text-[#9F062A] font-mono">{average} / 20</span>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-slate-200 text-[8px] font-mono text-slate-400">
              <span>FIRMA DIGITAL SECRETARÍA ACADÉMICA</span>
              <span>VERIFICACIÓN INSTITUCIONAL SFA-2026</span>
            </div>
          </div>
        </div>

        {/* Modal Toolbar */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2">
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir</span>
          </button>
          <button
            type="button"
            onClick={handleDownload}
            className="px-4 py-2 bg-[#9F062A] hover:bg-[#800521] text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Descargar Boleta</span>
          </button>
        </div>
      </div>
    </div>
  );
};
