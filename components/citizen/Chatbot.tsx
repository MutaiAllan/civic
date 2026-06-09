"use client";
import { useState, useRef, useEffect } from "react";

interface Message { role: "user" | "bot"; text: string; }

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hello! I'm the CAES assistant. How can I help you navigate the civic portal?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (open) endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const msgText = input.trim();
    setInput("");
    
    // Add user message locally
    const newMessages: Message[] = [...messages, { role: "user", text: msgText }];
    setMessages(newMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!res.ok) throw new Error("Failed to get response");
      
      const data = await res.json();
      setMessages(m => [...m, { role: "bot", text: data.text }]);
    } catch (error) {
      console.error(error);
      setMessages(m => [...m, { role: "bot", text: "I'm sorry, I'm having trouble connecting right now. Please try again later." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {open && (
        <div className="w-80 bg-white border border-slate-200 rounded-2xl mb-3 overflow-hidden shadow-lg flex flex-col h-[400px]">
          <div className="bg-slate-800 px-4 py-3 flex justify-between items-center flex-shrink-0">
            <div>
              <p className="text-white text-sm font-semibold">CAES Assistant</p>
              <p className="text-slate-400 text-xs">Citizen guidance</p>
            </div>
            <button onClick={() => setOpen(false)} className="text-slate-400 hover:text-white text-lg leading-none">✕</button>
          </div>

          <div className="flex-1 overflow-y-auto p-3 space-y-2 bg-slate-50/50">
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] px-3 py-2 rounded-xl text-xs leading-relaxed shadow-sm ${
                  m.role === "user" ? "bg-slate-800 text-white rounded-br-sm" : "bg-white text-slate-700 border border-slate-200 rounded-bl-sm"}`}>
                  {m.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-slate-200 px-3 py-2 rounded-xl text-[10px] text-slate-400 italic">
                  Assistant is typing...
                </div>
              </div>
            )}
            <div ref={endRef} />
          </div>

          <div className="p-3 border-t border-slate-100 flex gap-2 bg-white flex-shrink-0">
            <input 
              value={input} 
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && send()}
              placeholder="Ask a question..."
              disabled={loading}
              className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-slate-400 disabled:bg-slate-50" 
            />
            <button 
              onClick={send} 
              disabled={loading}
              className="bg-slate-800 text-white px-3 py-1.5 text-xs rounded-lg hover:bg-slate-700 transition-colors disabled:opacity-50"
            >
              {loading ? "..." : "→"}
            </button>
          </div>
        </div>
      )}

      <button onClick={() => setOpen(o => !o)}
        className="w-14 h-14 rounded-full bg-slate-800 text-white flex items-center justify-center text-2xl hover:bg-slate-700 transition-all shadow-xl hover:scale-110 active:scale-95">
        {open ? "✕" : "💬"}
      </button>
    </div>
  );
}

