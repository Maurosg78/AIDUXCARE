import React, { useState } from "react";
import { getAIResponse } from "../services/aiService";

const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<string[]>([]);
  const [input, setInput] = useState("");

  const handleSend = async () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, `👤: ${input}`]);
    const aiReply = await getAIResponse(input);
    setMessages((prev) => [...prev, `🤖: ${aiReply}`]);
    setInput("");
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>Asistente Clínico 🤖</h1>
      <div style={{ marginBottom: "1rem" }}>
        {messages.map((msg, idx) => (
          <div key={idx} style={{ marginBottom: "0.5rem" }}>{msg}</div>
        ))}
      </div>
      <input
        type="text"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Escribe tu pregunta..."
        style={{ width: "60%", marginRight: "0.5rem" }}
      />
      <button onClick={handleSend}>Enviar</button>
    </div>
  );
};

export default ChatPage;
