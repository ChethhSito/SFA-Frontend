import React, { useState, useRef, useEffect } from "react";
import { 
  ChevronDown, 
  ChevronUp, 
  HelpCircle, 
  Search,
  ChevronRight
} from "lucide-react";
import { SuggestedQuestion } from "./sfaBotData";

interface SuggestedQuestionsProps {
  onSelectQuestion: (q: SuggestedQuestion) => void;
  disabled?: boolean;
  questions: SuggestedQuestion[];
}

export default function SuggestedQuestions({
  onSelectQuestion,
  disabled = false,
  questions
}: SuggestedQuestionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState<SuggestedQuestion | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (q: SuggestedQuestion) => {
    setSelectedQuestion(q);
    onSelectQuestion(q);
    setIsOpen(false);
    setSearchTerm("");
  };

  if (!questions || questions.length === 0) return null;

  const filteredQuestions = questions.filter((q) =>
    q.question.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      ref={dropdownRef}
      className="w-full bg-slate-50/95 backdrop-blur-xs border-b border-slate-200/90 px-3 py-2 relative z-30 select-none shrink-0"
    >
      {/* Desplegable Dropdown Toggle Button (Full Width) */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full flex items-center justify-between px-3.5 py-2 rounded-2xl text-xs font-bold transition-all shadow-2xs cursor-pointer border
          ${
            isOpen
              ? "bg-[#9F062A] text-white border-[#9F062A] shadow-md ring-2 ring-amber-400/50"
              : "bg-amber-500/10 hover:bg-[#9F062A]/10 text-[#9F062A] border-amber-300/60 hover:border-[#9F062A]/30"
          }
        `}
        title="Ver desplegable con la lista de preguntas frecuentes"
      >
        <div className="flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
          <span className="font-extrabold tracking-wide">Preguntas Frecuentes</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span
            className={`px-2 py-0.5 text-[10.5px] rounded-full font-extrabold ${
              isOpen ? "bg-white text-[#9F062A]" : "bg-[#9F062A] text-white"
            }`}
          >
            {questions.length}
          </span>
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </div>
      </button>

      {/* Selected Question Pill Badge right below Preguntas Frecuentes */}
      {!isOpen && selectedQuestion && (
        <div className="mt-2 p-2.5 bg-white border border-rose-200/90 rounded-xl flex items-start justify-between gap-2 shadow-2xs animate-in fade-in duration-200">
          <span className="text-[11.5px] font-semibold text-slate-700 leading-snug flex-1">
            {selectedQuestion.question}
          </span>
          <button
            type="button"
            onClick={() => setSelectedQuestion(null)}
            className="text-slate-400 hover:text-[#9F062A] text-xs font-bold shrink-0 p-0.5 rounded hover:bg-rose-50 transition-colors cursor-pointer mt-0.5"
            title="Quitar selección"
          >
            ✕
          </button>
        </div>
      )}

      {/* Desplegable Menu Container */}
      {isOpen && (
        <div className="mt-2 bg-white border border-slate-200/90 shadow-xl rounded-2xl p-2.5 z-40 animate-in fade-in slide-in-from-top-1 duration-200 max-h-[230px] overflow-y-auto custom-scrollbar">
          <div className="flex items-center gap-2 p-1.5 mb-2 bg-slate-100/90 rounded-xl border border-slate-200/80">
            <Search className="w-3.5 h-3.5 text-slate-400 ml-1 shrink-0" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar en preguntas frecuentes..."
              className="w-full bg-transparent text-xs text-slate-700 outline-none placeholder-slate-400 font-semibold"
            />
          </div>

          <div className="space-y-1">
            {filteredQuestions.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-3 font-medium">
                No se encontraron preguntas con ese término.
              </p>
            ) : (
              filteredQuestions.map((item, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelect(item)}
                  disabled={disabled}
                  className={`w-full text-left p-2 rounded-xl border transition-all flex items-center justify-between group cursor-pointer shadow-2xs ${
                    selectedQuestion?.question === item.question
                      ? "bg-rose-50 border-[#9F062A]/40 text-[#9F062A]"
                      : "bg-white border-slate-100 hover:bg-rose-50/80 hover:border-[#9F062A]/20"
                  }`}
                >
                  <span className="text-[11.5px] font-semibold text-slate-700 group-hover:text-[#9F062A] leading-tight">
                    {item.question}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#9F062A] shrink-0 ml-2 group-hover:translate-x-0.5 transition-transform" />
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
