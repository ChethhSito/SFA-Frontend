import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { XCircle, Printer, Download, GraduationCap, Loader2 } from "lucide-react";
import { generateBoletaNotasPdf } from "../../../utils/matriculaPdf";

export interface BoletaCourseItem {
  code?: string;
  name: string;
  credits?: number;
  grade: number | string;
  approved?: boolean | null;
  status?: string;
}

interface BoletaNotasModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentDni: string;
  studentName: string;
  careerName: string;
  cycleNumber: number;
  courses: BoletaCourseItem[];
  average: number | string;
}

export const BoletaNotasModal: React.FC<BoletaNotasModalProps> = ({
  isOpen,
  onClose,
  studentDni,
  studentName,
  careerName,
  cycleNumber,
  courses
}) => {
  const [pdfBlobUrl, setPdfBlobUrl] = useState<string | null>(null);
  const [isLoadingPdf, setIsLoadingPdf] = useState<boolean>(false);

  const formattedCourses = courses.map((c, i) => ({
    code: c.code || `EIND-10${i + 1}`,
    name: c.name,
    credits: typeof c.credits === "number" ? c.credits : 4,
    grade: typeof c.grade === "number" ? c.grade : (Number(c.grade) > 0 ? Number(c.grade) : undefined)
  }));

  useEffect(() => {
    let currentUrl: string | null = null;
    let isMounted = true;

    if (isOpen) {
      setIsLoadingPdf(true);
      generateBoletaNotasPdf(
        cycleNumber.toString(),
        studentName,
        studentDni,
        careerName,
        formattedCourses,
        false
      )
        .then((pdfDoc) => {
          if (!isMounted) return;
          const blob = pdfDoc.output("blob");
          currentUrl = URL.createObjectURL(blob);
          setPdfBlobUrl(currentUrl);
          setIsLoadingPdf(false);
        })
        .catch((err) => {
          console.error("Error al generar vista previa del PDF oficial:", err);
          if (isMounted) setIsLoadingPdf(false);
        });
    } else {
      setPdfBlobUrl(null);
    }

    return () => {
      isMounted = false;
      if (currentUrl) {
        URL.revokeObjectURL(currentUrl);
      }
    };
  }, [isOpen, cycleNumber, studentName, studentDni, careerName, courses]);

  if (!isOpen) return null;

  const handlePrint = () => {
    if (pdfBlobUrl) {
      const printWindow = window.open(pdfBlobUrl, "_blank");
      if (printWindow) {
        printWindow.focus();
      }
    }
  };

  const handleDownload = async () => {
    try {
      await generateBoletaNotasPdf(
        cycleNumber.toString(),
        studentName,
        studentDni,
        careerName,
        formattedCourses,
        true
      );
    } catch (err) {
      console.error("Error al descargar PDF de la boleta de notas:", err);
    }
  };

  const content = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-3 md:p-6 bg-slate-950/75 backdrop-blur-md overflow-y-auto animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white rounded-2xl max-w-4xl w-full border border-slate-200 shadow-2xl flex flex-col max-h-[92vh] overflow-hidden">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-[#9F062A] to-[#800521] text-white px-5 py-3.5 flex items-center justify-between shadow-md shrink-0">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-5 h-5 text-amber-300" />
            <span className="font-extrabold text-xs md:text-sm uppercase tracking-wide">
              Boleta Informativa Oficial de Calificaciones • Ciclo {cycleNumber}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-white/80 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            aria-label="Cerrar modal"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Embedded Real PDF Preview */}
        <div className="flex-1 p-3 md:p-4 bg-slate-100 flex flex-col items-center justify-center overflow-hidden">
          {isLoadingPdf ? (
            <div className="flex flex-col items-center justify-center py-28 gap-3">
              <Loader2 className="w-9 h-9 text-[#800521] animate-spin" />
              <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Generando vista previa del documento oficial en PDF...
              </span>
            </div>
          ) : pdfBlobUrl ? (
            <div className="w-full h-[72vh] rounded-xl overflow-hidden border border-slate-300 shadow-inner bg-slate-200">
              <iframe
                src={`${pdfBlobUrl}#toolbar=0&navpanes=0`}
                className="w-full h-full border-0"
                title={`Boleta de Notas Oficial SFA - Ciclo ${cycleNumber}`}
              />
            </div>
          ) : (
            <div className="py-24 text-center text-slate-500 text-xs">
              No se pudo inicializar la vista previa del documento oficial.
            </div>
          )}
        </div>

        {/* Modal Toolbar */}
        <div className="p-3.5 bg-slate-50 border-t border-slate-200 flex justify-end gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handlePrint}
            disabled={!pdfBlobUrl}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-800 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
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
            <span>Descargar Boleta (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
};
