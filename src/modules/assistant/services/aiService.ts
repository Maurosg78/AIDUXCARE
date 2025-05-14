import axios from "axios.js";

const API_URL = "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium";

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${import.meta.env.VITE_HUGGINGFACE_API_KEY as string | undefined}`,
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
