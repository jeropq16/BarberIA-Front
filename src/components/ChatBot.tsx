"use client";

import { useState } from "react";
import Image from "next/image";
import { chatWithAi, analyzeHaircutImage } from "@/services/ai";

interface Message {
  sender: "user" | "bot";
  text: string;
  imageUrl?: string;
}

export default function ChatBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: "bot",
      text: "👋 Bienvenido a BarberIA ✂️\nDescribe tu corte ideal o sube una foto."
    }
  ]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim() && !image) return;

    const currentInput = input;
    const currentImage = image;

    // Agregar mensaje del usuario al chat
    const userMessage: Message = {
      sender: "user",
      text: currentInput,
      imageUrl: currentImage ? URL.createObjectURL(currentImage) : undefined
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setImage(null);
    setLoading(true);

    try {
      let botResponseText = "";

      if (currentImage) {
        // Lógica para análisis de imagen
        const data = await analyzeHaircutImage(currentImage);

        botResponseText = `✂️ Corte Identificado: ${data.recommendedStyle}
        
🧠 Análisis:
${data.analysisReport}

📊 Confianza: ${data.confidenceLevel}`;

      } else {
        // Lógica para chat de texto normal
        // Usamos el historial reciente como contexto simplificado si fuera necesario
        // Por ahora enviamos solo el mensaje actual
        botResponseText = await chatWithAi(currentInput);
      }

      const botMessage: Message = {
        sender: "bot",
        text: botResponseText
      };

      setMessages((prev) => [...prev, botMessage]);

    } catch (error: any) {
      console.error(error);
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: `❌ Error: ${error.message || "No se pudo procesar la solicitud."}`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* BOTÓN FLOTANTE */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="chatbot-button fixed bottom-6 right-6 
             w-16 h-16 
             rounded-full 
             bg-transparent 
             border-2 border-red-600 
             flex items-center justify-center
             hover:bg-red-600/10 
             transition-all duration-300
             shadow-lg z-50"
      >
        <Image
          src="/img/logo_blanco.png"
          alt="Logo"
          width={60}
          height={60}
          priority
        />
      </button>


      {isOpen && (
        <div className="chatbot-window fixed bottom-24 right-6 w-[450px] max-w-[90vw] h-[600px] bg-[#121212] border border-[#333] rounded-2xl shadow-2xl flex flex-col z-50 overflow-hidden font-sans">
          {/* HEADER */}
          <div className="chatbot-header p-4 border-b border-[#333] flex justify-between items-center bg-gradient-to-r from-[#1a1a1a] to-[#252525]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center text-lg">
                🤖
              </div>
              <div className="flex flex-col">
                <span className="font-bold text-white text-base">Barber IA</span>
                <span className="text-xs text-green-400 font-medium flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse"></span>
                  En línea
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-white transition-colors p-1 hover:bg-[#333] rounded-full"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          {/* MENSAJES */}
          <div className="chatbot-messages flex-1 p-5 overflow-y-auto custom-scroll space-y-4 bg-[#0a0a0a]">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.sender === "bot" ? "items-start" : "items-end"} animate-fade-in-up`}
              >
                <div className={`p-4 rounded-2xl max-w-[85%] text-sm leading-relaxed shadow-sm ${msg.sender === "bot"
                  ? "bg-[#1f1f1f] text-gray-100 rounded-tl-none border border-[#333]"
                  : "bg-gradient-to-br from-red-600 to-red-700 text-white rounded-tr-none"
                  }`}>
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                </div>
                {msg.imageUrl && (
                  <div className="mt-2 p-1 bg-[#1f1f1f] rounded-xl border border-[#333]">
                    <img
                      src={msg.imageUrl}
                      alt="imagen enviada"
                      className="rounded-lg max-w-[200px] object-cover"
                    />
                  </div>
                )}
                <span className="text-[10px] text-gray-500 mt-1 px-1">
                  {msg.sender === "bot" ? "BarberIA" : "Tú"}
                </span>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start animate-pulse">
                <div className="bg-[#1f1f1f] border border-[#333] px-4 py-3 rounded-2xl rounded-tl-none flex gap-1 items-center">
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                  <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                </div>
              </div>
            )}
            <div id="messages-end" />
          </div>

          {/* INPUT */}
          <div className="chatbot-input p-4 border-t border-[#333] bg-[#1a1a1a] flex flex-col gap-3">
            {image && (
              <div className="flex items-center justify-between bg-[#252525] p-2 rounded-lg border border-[#333] animate-fade-in w-full">
                <div className="flex items-center gap-2 overflow-hidden">
                  <div className="w-8 h-8 rounded bg-gray-700 flex-shrink-0 overflow-hidden text-lg flex items-center justify-center">📷</div>
                  <span className="text-xs text-gray-300 truncate max-w-[200px]">{image.name}</span>
                </div>
                <button onClick={() => setImage(null)} className="text-gray-400 hover:text-red-400 p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>
              </div>
            )}

            <div className="flex gap-2 items-center w-full">
              <label
                htmlFor="image-upload"
                className="cursor-pointer p-2.5 rounded-full hover:bg-[#2a2a2a] text-gray-400 hover:text-red-500 transition-all flex-shrink-0"
                title="Subir foto"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
              </label>
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) setImage(file);
                }}
              />

              <input
                type="text"
                placeholder={image ? "Añade un comentario..." : "Pregunta sobre cortes..."}
                value={input}
                className="flex-1 bg-[#111] text-white border border-[#333] rounded-full px-4 py-2.5 outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all text-smplaceholder-gray-600"
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              />

              <button
                onClick={sendMessage}
                disabled={loading || (!input.trim() && !image)}
                className={`p-2.5 rounded-full transition-all flex-shrink-0 ${(!input.trim() && !image) || loading
                  ? "bg-[#2a2a2a] text-gray-600 cursor-not-allowed"
                  : "bg-red-600 text-white hover:bg-red-700 shadow-lg hover:scale-105 active:scale-95"
                  }`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
