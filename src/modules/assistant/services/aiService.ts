import axios from "axios";

const API_URL = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium";

const headers = {
  Authorization: `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_KEY}`,
};

export async function getAIResponse(prompt: string): Promise<string> {
  try {
    const response = await axios.post(API_URL, { inputs: prompt }, { headers });
    return response.data?.[0]?.generated_text || "Sin respuesta de la IA.";
  } catch (error) {
    console.error("Error al contactar la IA:", error);
    return "Hubo un error al contactar con la IA.";
  }
}
