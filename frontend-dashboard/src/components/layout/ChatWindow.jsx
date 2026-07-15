import React, { useEffect, useRef, useState, useContext } from "react";
import { ModelTierBadge } from "../agent/ModelTierBadge";
import { Send, User, Terminal, Loader2 } from "lucide-react";
import { AuthContext } from "../../context/AuthContext";
import Logo from "../brand/Logo";

/**
 * ChatWindow
 * The primary interface for real-time AI interaction.
 * Handles message rendering, auto-scrolling, and input orchestration.
 */
const ChatWindow = ({ messages, currentTier, onSendMessage, isGenerating }) => {
  const { isLoggedIn } = useContext(AuthContext);
  const [input, setInput] = useState("");
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  // --- 1. SMART SCROLLING LOGIC ---
  const scrollToBottom = () => {
    if (scrollRef.current) {
      const { scrollHeight, clientHeight } = scrollRef.current;
      scrollRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: "smooth",
      });
    }
  };

  // Trigger scroll on new messages
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- 2. INPUT HANDLERS ---
  const handleTextareaChange = (e) => {
    setInput(e.target.value);
    e.target.style.height = "inherit";
    e.target.style.height = `${e.target.scrollHeight}px`;
  };

  const handleSend = () => {
    if (!input.trim() || isGenerating) return;

    if (onSendMessage) onSendMessage(input.trim());

    setInput("");
    if (textareaRef.current) textareaRef.current.style.height = "inherit";
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex h-full flex-1 flex-col bg-white transition-colors duration-500 dark:bg-slate-950">
      
      {/* HEADER SECTION */}
      <header className="z-10 flex items-center justify-between border-b border-slate-200 bg-white/80 px-6 py-4 backdrop-blur-md dark:border-white/5 dark:bg-slate-950/50">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.2em] text-slate-500">
            <Terminal size={14} className="text-blue-500" />
            Active Model
          </div>
          <ModelTierBadge tier={currentTier} />
        </div>

        {!isLoggedIn && (
          <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-100 px-3 py-1 dark:border-white/10 dark:bg-slate-500/10">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400" />
            <span className="text-[8px] font-black uppercase tracking-widest text-slate-500">
              Sandbox Mode
            </span>
          </div>
        )}
      </header>

      {/* MESSAGE THREAD */}
      <div
        ref={scrollRef}
        className="custom-scrollbar flex-1 space-y-8 overflow-y-auto p-6 scroll-smooth"
      >
        {messages.length === 0 && (
          <div className="flex h-full flex-col items-center justify-center px-4 text-center animate-in fade-in zoom-in-95 duration-700">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-blue-200 bg-blue-50 transition-all dark:border-blue-500/20 dark:bg-blue-600/10">
              <Logo size={28} className="text-blue-500 drop-shadow-sm" />
            </div>
            <h3 className="text-xl font-black italic text-slate-900 dark:text-white">
              System Ready
            </h3>
            <p className="mt-2 max-w-sm text-xs font-medium leading-relaxed text-slate-500 dark:text-slate-400">
              HybridNode initialized. Semantic Router actively routing requests across Groq LPUs and Gemini Cloud.
            </p>
          </div>
        )}

        {messages.map((m, i) => (
          <div
            key={i}
            className={`group flex gap-4 ${
              m.role === "user" ? "flex-row-reverse" : "flex-row animate-in fade-in slide-in-from-bottom-2 duration-300"
            }`}
          >
            {/* Avatar */}
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border transition-all ${
                m.role === "user"
                  ? "border-slate-200 bg-white dark:border-white/10 dark:bg-slate-800"
                  : "border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-600/10"
              }`}
            >
              {m.role === "user" ? (
                <User size={16} className="text-slate-500 dark:text-slate-400" />
              ) : (
                <Logo size={18} className="text-blue-500" />
              )}
            </div>

            {/* Bubble */}
            <div className={`max-w-[85%] whitespace-pre-wrap rounded-[1.5rem] p-4 text-[13px] font-medium leading-relaxed transition-all ${
                m.role === "user"
                  ? "rounded-tr-none bg-blue-600 text-white shadow-lg shadow-blue-600/20"
                  : "rounded-tl-none border border-slate-200 bg-slate-50 text-slate-800 dark:border-white/5 dark:bg-slate-900 dark:text-slate-200"
              }`}
            >
              {m.content}
            </div>
          </div>
        ))}

        {/* LOADING INDICATOR */}
        {isGenerating && (
          <div className="flex flex-row gap-4 animate-in fade-in duration-300">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-600/10">
              <Logo size={16} className="animate-pulse text-blue-500" />
            </div>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-100 px-4 py-2 text-[9px] font-black uppercase tracking-widest text-slate-400 dark:border-white/5 dark:bg-slate-900/50 dark:text-slate-500">
              <Loader2 size={10} className="animate-spin text-blue-500" />
              Thinking...
            </div>
          </div>
        )}
      </div>

      {/* INPUT INTERFACE */}
      <div className="border-t border-slate-100 bg-white/80 p-6 backdrop-blur-sm dark:border-white/5 dark:bg-slate-950/80">
        <div className="group relative mx-auto max-w-4xl">
          <textarea
            ref={textareaRef}
            rows="1"
            value={input}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            disabled={isGenerating}
            placeholder={isGenerating ? "AI is processing..." : "Type your message..."}
            className="max-h-48 w-full resize-none rounded-2xl border border-slate-200 bg-slate-50 p-4 pr-14 text-sm font-medium text-slate-900 outline-none transition-all placeholder:text-slate-400 focus:border-blue-600 disabled:opacity-50 dark:border-white/10 dark:bg-slate-900 dark:text-white dark:placeholder:text-slate-700 dark:focus:border-blue-500/50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isGenerating}
            className="absolute bottom-3 right-3 rounded-xl bg-blue-600 p-2.5 text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 active:scale-95 disabled:opacity-50"
          >
            <Send size={18} />
          </button>
        </div>

        <p className="mt-4 text-center text-[8px] font-black uppercase tracking-[0.3em] text-slate-400 opacity-40 dark:text-slate-500">
          HybridNode • Orchestration Gateway • v1.0.0
        </p>
      </div>
    </div>
  );
};

export default ChatWindow;