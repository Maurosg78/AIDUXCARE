import React, { useState } from "react";
import { Box, TextField, Button, Typography, Container } from "@mui/material";
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
    <Container component="main">
      <Box 
        component="section"
        sx={{ p: 2 }}
        aria-labelledby="chat-title"
      >
        <Typography 
          id="chat-title"
          variant="h4" 
          component="h1" 
          gutterBottom
        >
          Asistente Clínico 🤖
        </Typography>

        <Box 
          component="div"
          sx={{ mb: 2 }}
          role="log"
          aria-label="Historial de mensajes"
        >
          {messages.map((msg, idx) => (
            <Box 
              key={idx} 
              sx={{ mb: 1 }}
              role="listitem"
            >
              {msg}
            </Box>
          ))}
        </Box>

        <Box 
          component="form"
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          sx={{ display: 'flex', gap: 1 }}
        >
          <TextField
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSend()}
            placeholder="Escribe tu pregunta..."
            size="small"
            id="chat-input"
            aria-label="Mensaje para el asistente"
            inputProps={{
              'aria-label': 'Escribe tu pregunta para el asistente'
            }}
          />
          <Button 
            variant="contained" 
            onClick={handleSend}
            aria-label="Enviar mensaje"
          >
            Enviar
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ChatPage;
