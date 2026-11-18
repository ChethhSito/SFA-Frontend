import React, { useState } from "react";
import { Applicant, Enrollment, Program } from "../../../types";
import { Award, CheckCircle2, Download, ExternalLink, GraduationCap, Printer, ShieldCheck, X } from "lucide-react";
import Button from "../../ui/Button";

interface MatriculaConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  applicant: Applicant;
  enrollment?: Enrollment;
  currentProgram: Program;
  periodLabel?: string;
  onProceedToAlumno: () => void;
}

export const MatriculaConfirmationModal: React.FC<MatriculaConfirmationModalProps> = React.memo(({
  isOpen,
  onClose,
  applicant,
  enrollment,
  currentProgram,
  periodLabel = "2027-I",
  onProceedToAlumno
}) => {
  const [hasDownloaded, setHasDownloaded] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);

  if (!isOpen) return null;

  const studentFullName = `${applicant.name} ${applicant.lastName}`.trim();
  const studentCode = applicant.applicantCode || `202710001`;
  const assignedShift = enrollment?.shift || "Mañana";

  const handlePrintSheet = () => {
    const printContent = document.getElementById("matricula-print-sheet");
    if (!printContent) return;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Constancia Oficial de Matrícula - SFA ${periodLabel}</title>
            <style>
              body { font-family: 'Arial', sans-serif; padding: 40px; color: #1e293b; line-height: 1.5; }
              .header { text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 20px; margin-bottom: 25px; }
              .header h1 { font-size: 14px; color: #800521; margin: 0; text-transform: uppercase; font-weight: 900; letter-spacing: 1px; }
              .header h2 { font-size: 18px; margin: 6px 0; font-weight: 800; color: #0f172a; }
              .header p { font-size: 11px; color: #64748b; margin: 2px 0; font-family: monospace; }
              .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; margin-bottom: 25px; border-bottom: 1px dashed #cbd5e1; padding-bottom: 20px; font-size: 12px; }
              .grid div span { display: block; font-size: 9.5px; text-transform: uppercase; color: #64748b; font-weight: 700; margin-bottom: 2px; }
              .grid div strong { font-size: 13px; color: #0f172a; font-weight: 800; }
              .courses { margin-bottom: 25px; font-size: 12px; }
              .courses table { width: 100%; border-collapse: collapse; margin-top: 8px; }
              .courses th { background: #f8fafc; border: 1px solid #cbd5e1; padding: 8px; text-align: left; font-size: 10px; font-weight: 800; text-transform: uppercase; }
              .courses td { border: 1px solid #cbd5e1; padding: 8px; font-size: 11px; }
              .footer { display: flex; justify-content: space-between; align-items: flex-end; margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0; }
              .seal { border: 2px solid #059669; color: #065f46; background: #ecfdf5; padding: 10px 18px; text-align: center; font-family: monospace; font-size: 9px; font-weight: bold; }
              .seal span { display: block; }
              .notes { font-size: 9px; color: #64748b; font-style: italic; max-width: 320px; }
            </style>
          </head>
          <body>
            ${printContent.innerHTML}
            <script>
              window.onload = function() {
                window.print();
                setTimeout(function() { window.close(); }, 500);
              }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    } else {
      window.print();
    }
  };

  const handleDownloadConstancia = () => {
    setIsDownloading(true);

    setTimeout(() => {
      const textContent = `
========================================================================
MINISTERIO DE EDUCACIÓN - REPÚBLICA DEL PERÚ
INSTITUTO DE EDUCACIÓN SUPERIOR TECNOLÓGICO PÚBLICO
"SAN FRANCISCO DE ASÍS"
R.M. N° 0233-80-ED • R.D. N° 0458-2005-ED
DIRECCIÓN GENERAL • SECRETARÍA GENERAL ACADÉMICA
========================================================================

CONSTANCIA OFICIAL DE MATRÍCULA REGULAR
N° COM-2027-I-${applicant.dni}

La Secretaría Académica del IESTP "San Francisco de Asís" HACE CONSTAR:

Que el estudiante:
------------------------------------------------------------------------
APELLIDOS Y NOMBRES : ${applicant.lastName.toUpperCase()}, ${applicant.name.toUpperCase()}
DOCUMENTO DE IDENTIDAD: DNI ${applicant.dni}
CÓDIGO DE MATRÍCULA  : ${studentCode}
PROGRAMA DE ESTUDIOS : ${currentProgram.name.toUpperCase()}
NIVEL FORMATIVO      : PROFESIONAL TÉCNICO (3 AÑOS / 6 CICLOS)
PERIODO ACADÉMICO    : ${periodLabel}
CICLO MATRICULADO    : CICLO I (PRIMER SEMESTRE ORDINARIO)
TURNO ASIGNADO       : ${assignedShift.toUpperCase()}
CONDICIÓN ACADÉMICA  : ALUMNO REGULAR ORDINARIO
DERECHO DE MATRÍCULA : S/. 250.00 (VALIDADO - CAJA Y TESORERÍA)
------------------------------------------------------------------------

RELACIÓN DE ASIGNATURAS REGISTRADAS (CARGA ACADÉMICA CICLO I):
1. EIND-101 | Fundamentos de Electricidad y Circuitos CC      | 4 Créditos
2. EIND-102 | Instalaciones Eléctricas de Edificaciones       | 4 Créditos
3. EIND-103 | Seguridad e Higiene Industrial en Baja Tensión  | 3 Créditos
4. EIND-104 | Matemática Aplicada a la Tecnología Eléctrica   | 3 Créditos
5. EIND-105 | Comunicación y Tecnologías Digitales            | 2 Créditos
------------------------------------------------------------------------
TOTAL DE CRÉDITOS INSCRITOS: 16 CRÉDITOS ACADÉMICOS

El presente documento certifica la condición de Alumno Regular en este
Instituto Superior Tecnológico Público para los fines académicos,
administrativos y de trámite de carné estudiantil que correspondan.

Emitido con Firma y Sello Digital con Validez Nacional.
Fecha de Emisión: 17 de Noviembre de 2026.
========================================================================
      `.trim();

      const blob = new Blob([textContent], { type: "text/plain;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Constancia_Matricula_SFA_${applicant.dni}.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setIsDownloading(false);
      setHasDownloaded(true);
      try {
        localStorage.setItem(`sfa_matricula_downloaded_${applicant.dni}`, "true");
      } catch {}
    }, 800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden text-left">
        
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#800521] to-[#590013] text-white px-6 py-4 flex items-center justify-between border-b border-amber-400/40 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-400/20 border border-amber-300/40 flex items-center justify-center">
              <GraduationCap className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-300">
                IESTP San Francisco de Asís
              </h3>
              <p className="text-[10px] text-white/80 font-bold uppercase tracking-widest">
                Resolución de Matrícula Institucional • Periodo {periodLabel}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/70 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          
          {/* Celebratory Banner */}
          <div className="bg-emerald-50 border border-emerald-200/90 rounded-xl p-4 text-left space-y-2">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <h4 className="text-sm font-black text-emerald-900 uppercase tracking-wide">
                ¡Has sido Matriculado Oficialmente!
              </h4>
            </div>
            <p className="text-xs text-emerald-850 font-medium leading-relaxed">
              Felicidades, <strong className="font-extrabold text-slate-900">{studentFullName}</strong>. Ha culminado con éxito todas las etapas del proceso. Su matrícula regular para el <strong>Ciclo I</strong> en la carrera de <strong>{currentProgram.name}</strong> ha sido validada y registrada en el padrón oficial del Instituto y ante el Ministerio de Educación.
            </p>
          </div>

          {/* Hidden Printable Sheet (renders in printable window) */}
          <div id="matricula-print-sheet" className="hidden">
            <div className="header">
              <h1>Instituto de Educación Superior Tecnológico Público "San Francisco de Asís"</h1>
              <h2>Constancia Oficial de Matrícula Regular</h2>
              <p>PERIODO ACADÉMICO: ${periodLabel} • CICLO I</p>
            </div>
            <div className="grid">
              <div>
                <span>Estudiante</span>
                <strong>${studentFullName}</strong>
              </div>
              <div>
                <span>Código de Matrícula</span>
                <strong>${studentCode}</strong>
              </div>
              <div>
                <span>Documento DNI</span>
                <strong>${applicant.dni}</strong>
              </div>
              <div>
                <span>Programa de Estudios</span>
                <strong>${currentProgram.name}</strong>
              </div>
              <div>
                <span>Turno Asignado</span>
                <strong>${assignedShift}</strong>
              </div>
              <div>
                <span>Condición</span>
                <strong>Matrícula Regular Validada (S/. 250.00)</strong>
              </div>
            </div>
            <div className="courses">
              <strong>Asignaturas Oficiales Registradas - Ciclo I:</strong>
              <table>
                <thead>
                  <tr>
                    <th>Código</th>
                    <th>Asignatura</th>
                    <th>Tipo</th>
                    <th>Créditos</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td>EIND-101</td><td>Fundamentos de Electricidad y Circuitos CC</td><td>Especialidad</td><td>4</td></tr>
                  <tr><td>EIND-102</td><td>Instalaciones Eléctricas de Edificaciones</td><td>Especialidad</td><td>4</td></tr>
                  <tr><td>EIND-103</td><td>Seguridad e Higiene Industrial en Baja Tensión</td><td>Especialidad</td><td>3</td></tr>
                  <tr><td>EIND-104</td><td>Matemática Aplicada a la Tecnología Eléctrica</td><td>General</td><td>3</td></tr>
                  <tr><td>EIND-105</td><td>Comunicación y Tecnologías Digitales</td><td>General</td><td>2</td></tr>
                </tbody>
              </table>
            </div>
            <div className="footer">
              <div className="notes">
                <p>* Esta constancia acredita la condición de Alumno Regular en el IESTP San Francisco de Asís.</p>
                <p>* Documento firmado digitalmente con valor legal oficial.</p>
              </div>
              <div className="seal">
                <span>IESTP SAN FRANCISCO DE ASÍS</span>
                <span>OFICINA DE ADMISIÓN Y MATRÍCULA</span>
                <span>MATRÍCULA VÁLIDA 2027</span>
              </div>
            </div>
          </div>

          {/* Academic Summary Details Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-2.5 text-xs">
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Estudiante:</span>
              <span className="font-black text-slate-900 uppercase">{studentFullName}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-bold uppercase text-[10px]">DNI / Identificación:</span>
              <span className="font-mono font-extrabold text-slate-800">{applicant.dni}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Código de Estudiante:</span>
              <span className="font-mono font-black text-[#800521] bg-rose-50 border border-rose-200 px-2 py-0.5 rounded">
                {studentCode}
              </span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Programa de Estudios:</span>
              <span className="font-extrabold text-slate-900 uppercase">{currentProgram.name}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Semestre Académico:</span>
              <span className="font-extrabold text-slate-800">Ciclo I • Periodo {periodLabel}</span>
            </div>
            <div className="flex justify-between items-center border-b border-slate-200 pb-2">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Turno Asignado:</span>
              <span className="font-mono font-bold text-slate-700 bg-white border border-slate-200 px-2 py-0.5 rounded">
                {assignedShift}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-500 font-bold uppercase text-[10px]">Tasa de Matrícula:</span>
              <span className="font-mono font-black text-emerald-700">S/. 250.00 (PAGO VALIDADO EN CAJA)</span>
            </div>
          </div>

          {/* Required Action Notice */}
          <div className={`p-3.5 rounded-xl border text-xs text-left transition-all ${
            hasDownloaded
              ? "bg-emerald-50/80 border-emerald-300 text-emerald-900"
              : "bg-amber-50 border-amber-300 text-amber-900"
          }`}>
            <div className="flex items-start gap-2.5">
              <ShieldCheck className={`w-4 h-4 shrink-0 mt-0.5 ${hasDownloaded ? "text-emerald-600" : "text-amber-600"}`} />
              <div className="space-y-1">
                <p className="font-bold uppercase text-[10.5px] tracking-wide">
                  {hasDownloaded
                    ? "✓ Constancia descargada correctamente"
                    : "Paso Requerido: Descargue su Constancia Oficial de Matrícula"}
                </p>
                <p className="text-[11px] leading-relaxed text-slate-700">
                  {hasDownloaded
                    ? "Ya cuenta con su comprobante oficial. Ahora puede finalizar su sesión de admisión y pasar al Portal del Estudiante para consultar su carné y horarios."
                    : "Debe descargar y guardar su Constancia Oficial de Matrícula antes de salir. Este documento certifica su inscripción formal en el primer ciclo."}
                </p>
              </div>
            </div>
          </div>

        </div>

        {/* Modal Action Buttons Footer */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-3 shrink-0">
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handlePrintSheet}
              className="text-xs font-bold text-slate-700 flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Vista Previa</span>
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleDownloadConstancia}
              disabled={isDownloading}
              className="bg-[#800521] hover:bg-[#66041a] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer w-full sm:w-auto justify-center shadow-sm"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isDownloading ? "Generando..." : hasDownloaded ? "Descargar Nuevamente" : "Descargar Constancia Oficial"}</span>
            </Button>
          </div>

          <button
            type="button"
            disabled={!hasDownloaded}
            onClick={onProceedToAlumno}
            className={`w-full sm:w-auto px-4 py-2 rounded-lg text-xs font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all shadow-sm ${
              hasDownloaded
                ? "bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer hover:shadow-md"
                : "bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300"
            }`}
          >
            <span>Ingresar como Alumno Regular</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </div>
  );
});

MatriculaConfirmationModal.displayName = "MatriculaConfirmationModal";
export default MatriculaConfirmationModal;
