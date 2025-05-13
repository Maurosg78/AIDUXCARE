import { useState, FormEvent  } from 'react';
import { Box, TextField, Button, Typography, Container, CircularProgress } from "@mui/material";

/**
 * Interfaz para mensajes de chat
 */
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

/**
 * Solicita una respuesta de IA basada en la entrada del usuario
 * @param prompt Mensaje del usuario para procesar
 * @returns Respuesta generada por el asistente
 */
const getAIResponse = async (prompt: string): Promise<string> => {
  try {
    // Simular una llamada a la API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Respuestas simuladas
    const responses = [
      "Basado en los síntomas descritos, podría tratarse de una contractura muscular. Recomendaría aplicar calor local y descanso.",
      "Es importante realizar una evaluación más detallada. ¿Podría describir si el dolor se irradia a alguna extremidad?",
      "Los datos clínicos sugieren un cuadro de lumbalgia mecánica. Un abordaje con ejercicios de fortalecimiento lumbar podría ser beneficioso.",
      "Considerando el historial, sería recomendable realizar una evaluación postural completa en la próxima sesión."
    ];
    
    // Seleccionar una respuesta aleatoria
    return responses[Math.floor(Math.random() * responses.length)];
  } catch (error) {
    console.error('Error al obtener respuesta:', error);
    return "Lo siento, ocurrió un error al procesar tu consulta.";
  }
};

/**
 * Página de chat con el asistente clínico
 */
const ChatPage: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  /**
   * Maneja el envío de un mensaje
   */
  const handleSend = async (): Promise<void> => {
    if (!input.trim()) return;
    
    // Agregar mensaje del usuario
    const userMessage: ChatMessage = {
      role: 'user',
      content: input
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    
    try {
      // Obtener respuesta del asistente
      const aiReply = await getAIResponse(input);
      
      // Agregar respuesta del asistente
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: aiReply
      };
      
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
      
      // Mensaje de error
      setMessages(prev => [
        ...prev, 
        {
          role: 'assistant',
          content: 'Lo siento, ocurrió un error al procesar tu consulta.'
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Maneja el envío del formulario
   */
  const handleSubmit = (e: FormEvent): void => {
    e.preventDefault();
    handleSend();
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
          sx={{ 
            mb: 2, 
            p: 2, 
            maxHeight: '60vh', 
            overflowY: 'auto',
            bgcolor: '#f5f5f5',
            borderRadius: 1
          }}
          role="log"
          aria-label="Historial de mensajes"
        >
          {messages.map((msg, idx) => (
            <Box 
              key={idx} 
              sx={{ 
                mb: 1,
                p: 1,
                borderRadius: 1,
                maxWidth: '80%',
                bgcolor: msg.role === 'user' ? 'primary.light' : 'background.paper',
                color: msg.role === 'user' ? 'white' : 'text.primary',
                alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                display: 'inline-block',
                ml: msg.role === 'user' ? 'auto' : 0
              }}
              role="listitem"
            >
              <Typography variant="body1">
                {msg.role === 'user' ? '👤 ' : '🤖 '}
                {msg.content}
              </Typography>
            </Box>
          ))}
          
          {isLoading && (
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <CircularProgress size={20} sx={{ mr: 1 }} />
              <Typography variant="body2" color="text.secondary">
                El asistente está escribiendo...
              </Typography>
            </Box>
          )}
        </Box>

        <Box 
          component="form"
          onSubmit={handleSubmit}
          sx={{ display: 'flex', gap: 1 }}
        >
          <TextField
            fullWidth
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Escribe tu pregunta..."
            size="small"
            id="chat-input"
            aria-label="Mensaje para el asistente"
            disabled={isLoading}
            inputProps={{
              'aria-label': 'Escribe tu pregunta para el asistente'
            }}
          />
          <Button 
            variant="contained" 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            aria-label="Enviar mensaje"
            type="submit"
          >
            Enviar
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default ChatPage;
