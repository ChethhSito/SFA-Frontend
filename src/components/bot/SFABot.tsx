import React, { useState, useRef, useEffect } from "react";
import { 
  X, Send, GraduationCap, Info, Sparkles, MessageSquare, Loader2, Bot
} from "lucide-react";
import SuggestedQuestions from "./SuggestedQuestions";
import TermsModal from "./TermsModal";
import { 
  SFA_DEFAULT_QUESTIONS, 
  SFA_INSTITUTIONAL_TIPS, 
  SFA_SYSTEM_CONTEXT, 
  SuggestedQuestion 
} from "./sfaBotData";

interface Message {
  id: number;
  text: string;
  sender: "bot" | "user";
  timestamp: Date;
}

export default function SFABot() {
  const [isOpen, setIsOpen] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "¡Hola! 👋 Soy SFABot, tu Asistente Virtual Oficial del IESTP San Francisco de Asís 🎓. ¿En qué te puedo ayudar hoy? Selecciona una pregunta frecuente o escribe tu consulta.",
      sender: "bot",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll smoothly to latest message
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen, isLoading]);

  // Periodic floating tip notifications when closed
  useEffect(() => {
    if (isOpen || notification) return;
    const intervalId = setInterval(() => {
      const randomTip = SFA_INSTITUTIONAL_TIPS[Math.floor(Math.random() * SFA_INSTITUTIONAL_TIPS.length)];
      setNotification(randomTip);
      setTimeout(() => setNotification(null), 6000);
    }, 15000);

    return () => clearInterval(intervalId);
  }, [isOpen, notification]);

  // Call Gemini AI or handle predefined answer
  const handleSendMessage = async (textOrObj?: string | SuggestedQuestion) => {
    let messageText = "";
    let predefinedAnswer: string | null = null;

    if (typeof textOrObj === "object" && textOrObj?.question) {
      messageText = textOrObj.question;
      predefinedAnswer = textOrObj.answer;
    } else if (typeof textOrObj === "string") {
      messageText = textOrObj;
    } else {
      messageText = input;
    }

    if (!messageText.trim()) return;

    const userMsgId = Date.now();
    const userMessage: Message = {
      id: userMsgId,
      text: messageText,
      sender: "user",
      timestamp: new Date()
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    // If predefined question selected, answer instantly
    if (predefinedAnswer) {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: Date.now() + 1,
            text: predefinedAnswer!,
            sender: "bot",
            timestamp: new Date()
          }
        ]);
        setIsLoading(false);
      }, 500);
      return;
    }

    // Call Gemini AI
    try {
      const apiKey = (import.meta as any).env?.VITE_GEMINI_API_KEY;

      if (!apiKey || apiKey === "YOUR_API_KEY_HERE") {
        throw new Error("API Key no configurada");
      }

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [
                  { text: `${SFA_SYSTEM_CONTEXT}\n\nConsulta del usuario: ${messageText}` }
                ]
              }
            ]
          })
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP Error ${response.status}`);
      }

      const data = await response.json();
      const botReply = data.candidates?.[0]?.content?.parts?.[0]?.text || 
        "Entendido. Si requieres orientación específica sobre tu expediente o matrícula, puedes consultar en la Intranet Académica. 🎓";

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: botReply,
          sender: "bot",
          timestamp: new Date()
        }
      ]);
    } catch (err: any) {
      console.warn("SFABot Gemini fallback:", err);
      const fallbackReply = "💡 Para consultas sobre tu proceso de admisión o ficha de estudiante, puedes navegar en el menú superior o seleccionar una de nuestras preguntas frecuentes. 🎓";
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          text: fallbackReply,
          sender: "bot",
          timestamp: new Date()
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <>
      {showTerms && <TermsModal onClose={() => setShowTerms(false)} />}

      <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end pointer-events-none sm:bottom-6 sm:right-6">
        {/* Chat Drawer Window */}
        <div
          className={`
            pointer-events-auto mb-3 
            w-[90vw] sm:w-[380px] h-[490px] max-h-[75vh] rounded-3xl
            shadow-2xl border border-slate-200 overflow-hidden flex flex-col
            transition-all duration-300 ease-out origin-bottom-right bg-white
            ${isOpen ? "opacity-100 scale-100 translate-y-0 visible" : "opacity-0 scale-95 translate-y-8 pointer-events-none invisible"}
          `}
        >
          {/* Header */}
          <div className="p-3.5 bg-gradient-to-r from-[#9F062A] via-[#800521] to-[#590013] text-white flex items-center justify-between shadow-md z-10">
            <div className="flex items-center gap-2.5">
              <div className="relative">
                <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-amber-400/40 flex items-center justify-center overflow-hidden text-amber-300">
                  <GraduationCap className="w-6 h-6" />
                </div>
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full animate-pulse"></span>
              </div>
              <div>
                <h3 className="font-extrabold text-sm tracking-wide text-white flex items-center gap-1.5">
                  <span>SFABot</span>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                </h3>
                <p className="text-[10.5px] font-semibold text-amber-200/90 flex items-center gap-1">
                  <span>Asistente Virtual SFA</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setShowTerms(true)}
                className="p-1.5 hover:bg-white/15 rounded-full transition-colors active:scale-95 text-white/90 cursor-pointer"
                title="Políticas de uso"
              >
                <Info className="w-4.5 h-4.5" />
              </button>
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 hover:bg-white/15 rounded-full transition-colors active:scale-95 text-white cursor-pointer"
                aria-label="Cerrar chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Suggested Questions Carousel */}
          <SuggestedQuestions
            questions={SFA_DEFAULT_QUESTIONS}
            onSelectQuestion={handleSendMessage}
            disabled={isLoading}
          />

          {/* Chat Messages Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 custom-scrollbar bg-slate-50/60">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`
                    max-w-[88%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed shadow-2xs
                    ${
                      msg.sender === "user"
                        ? "bg-[#9F062A] text-white rounded-tr-none font-semibold"
                        : "bg-white text-slate-800 border border-slate-200/80 rounded-tl-none font-medium"
                    }
                  `}
                >
                  {msg.text}
                  <div
                    className={`text-[9px] mt-1 flex justify-end font-mono ${
                      msg.sender === "user" ? "text-amber-200/90" : "text-slate-400"
                    }`}
                  >
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl px-4 py-2.5 bg-white border border-slate-200/80 shadow-2xs flex items-center gap-2 text-xs font-semibold text-[#9F062A]">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-[#9F062A]" />
                  <span>SFABot está respondiendo...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box Bar */}
          <div className="p-3 bg-white border-t border-slate-200 shadow-md z-10">
            <div className="flex items-center gap-2 p-1 bg-slate-100 rounded-full border border-slate-200 focus-within:border-[#9F062A]/50 focus-within:bg-white transition-all">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="Escribe tu consulta sobre SFA..."
                className="flex-1 bg-transparent px-3.5 py-1.5 text-xs font-semibold text-slate-800 placeholder-slate-400 outline-none"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={isLoading || !input.trim()}
                className={`p-2 rounded-full transition-all duration-200 shrink-0 ${
                  input.trim()
                    ? "bg-[#9F062A] hover:bg-[#800521] text-white shadow-md cursor-pointer active:scale-95"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
                aria-label="Enviar mensaje"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Floating Action Launcher + Notification Tooltip */}
        <div className="flex flex-row items-center gap-3 pointer-events-auto relative">
          {/* Eco / Institutional Tip Notification Popup */}
          {!isOpen && notification && (
            <div className="absolute right-full mr-3 bottom-1 w-max max-w-[260px] sm:max-w-xs z-50 animate-in fade-in slide-in-from-right duration-300">
              <div className="p-3.5 bg-white border border-amber-300/80 rounded-2xl rounded-br-none shadow-xl text-slate-800 text-xs font-semibold relative">
                <button
                  type="button"
                  onClick={() => setNotification(null)}
                  className="absolute -top-2 -left-2 bg-white text-slate-400 hover:text-rose-600 rounded-full p-0.5 shadow-md border border-slate-200 transition-colors cursor-pointer"
                  aria-label="Cerrar aviso"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
                <p className="leading-relaxed">{notification}</p>
              </div>
            </div>
          )}

          {/* Floating Trigger Button */}
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="pointer-events-auto group relative flex items-center justify-center outline-none cursor-pointer select-none"
            aria-label={isOpen ? "Cerrar SFABot" : "Abrir SFABot"}
          >
            <div className={`absolute inset-0 bg-[#9F062A] rounded-full animate-ping opacity-30 duration-1000 ${isOpen ? "hidden" : "block"}`}></div>
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 bg-gradient-to-tr from-[#9F062A] to-[#800521] text-white border-3 border-white ring-2 ring-amber-400/40 z-10 ${isOpen ? "rotate-90 scale-95" : "hover:scale-110 active:scale-95"}`}>
              {isOpen ? (
                <X className="w-7 h-7" />
              ) : (
                <div className="w-full h-full relative flex items-center justify-center rounded-full overflow-hidden bg-[#9F062A]">
                  <GraduationCap className="w-7 h-7 text-amber-300 group-hover:scale-110 transition-transform" />
                  <span className="absolute top-2 right-2 w-3 h-3 bg-emerald-400 border-2 border-white rounded-full animate-pulse shadow-xs"></span>
                </div>
              )}
            </div>
          </button>
        </div>
      </div>
    </>
  );
}
