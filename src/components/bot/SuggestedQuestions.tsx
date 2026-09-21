import React, { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
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
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 220;
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth"
      });
    }
  };

  if (!questions || questions.length === 0) return null;

  return (
    <div className="w-full bg-slate-50/90 backdrop-blur-xs border-b border-slate-200/80 p-2 relative group select-none">
      {/* Left Scroll Arrow */}
      <button
        type="button"
        onClick={() => scroll("left")}
        disabled={disabled}
        className="absolute left-1 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-white shadow-md border border-slate-200 text-[#9F062A] opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 cursor-pointer"
        aria-label="Desplazar preguntas a la izquierda"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>

      {/* Right Scroll Arrow */}
      <button
        type="button"
        onClick={() => scroll("right")}
        disabled={disabled}
        className="absolute right-1 top-1/2 -translate-y-1/2 z-10 p-1 rounded-full bg-white shadow-md border border-slate-200 text-[#9F062A] opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-0 cursor-pointer"
        aria-label="Desplazar preguntas a la derecha"
      >
        <ChevronRight className="w-4 h-4" />
      </button>

      {/* Questions Horizontal Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="flex gap-2 overflow-x-auto pb-1 custom-scrollbar snap-x px-4 scroll-smooth"
      >
        {questions.map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => onSelectQuestion(item)}
            disabled={disabled}
            className="snap-start shrink-0 whitespace-nowrap px-3 py-1.5 bg-white hover:bg-rose-50 hover:border-[#9F062A]/40 text-slate-700 hover:text-[#9F062A] border border-slate-200 rounded-full text-xs font-semibold active:scale-95 transition-all shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {item.question}
          </button>
        ))}
      </div>
    </div>
  );
}
