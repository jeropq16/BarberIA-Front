"use client";

import { useState } from "react";

interface Message {
  sender: "user" | "bot";
  text: string;
  imageUrl?: string;
}

interface HaircutResponseDto {
  recommendedStyle: string;
  confidenceLevel: string;
  analysisReport: string;
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

    const userMessage: Message = {
      sender: "user",
      text: input,
      imageUrl: image ? URL.createObjectURL(image) : undefined
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setLoading(true);

    try {
      const formData = new FormData();

      // Backend espera "file"
      if (image) {
        formData.append("file", image);
      }

      formData.append("userId", "anonymous");

      const response = await fetch(
        process.env.NEXT_PUBLIC_AI_API_URL as string,
        {
          method: "POST",
          body: formData
        }
      );

      if (!response.ok) {
        throw new Error("Error en la API");
      }

      const data: HaircutResponseDto = await response.json();

      const botMessage: Message = {
        sender: "bot",
        text: `✂️ Corte recomendado:
${data.recommendedStyle}

🧠 Análisis:
${data.analysisReport}

📊 Confianza:
${data.confidenceLevel}`
      };

      setMessages((prev) => [...prev, botMessage]);
      setImage(null);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          sender: "bot",
          text: "❌ Error conectando con el servicio"
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* BOTÓN FLOTANTE */}
      <button className="chatbot-button" onClick={() => setIsOpen(!isOpen)}>
        💬
      </button>

      {isOpen && (
        <div className="chatbot-window">
          {/* HEADER */}
          <div className="chatbot-header">
            <span>Barber IA ✂️</span>
            <button onClick={() => setIsOpen(false)}>✖</button>
          </div>

          {/* MENSAJES */}
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={
                  msg.sender === "bot" ? "bot-message" : "user-message"
                }
              >
                {msg.text}
                {msg.imageUrl && (
                  <img
                    src={msg.imageUrl}
                    alt="imagen"
                    style={{
                      width: "100%",
                      height: "auto",
                      marginTop: "6px",
                      borderRadius: "8px"
                    }}
                  />
                )}
              </div>
            ))}

            {loading && <div className="bot-message">Analizando...</div>}
          </div>

          {/* INPUT */}
          <div className="chatbot-input">
            <label htmlFor="image-upload" style={{ cursor: "pointer" }}>
              📷
            </label>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => setImage(e.target.files?.[0] || null)}
            />

            <input
              type="text"
              placeholder="Describe tu corte o tu rostro..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            />

            <button onClick={sendMessage}>Enviar</button>
          </div>
        </div>
      )}
    </>
  );
}
