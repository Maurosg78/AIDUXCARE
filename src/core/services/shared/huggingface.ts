const HF_API_URL = "https://api-inference.huggingface.co/models/mistralai/Mixtral-8x7B-Instruct-v0.1";
const HF_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY;

export const sendMessageToHF = async (prompt: string): Promise<string> => {
  const response = await fetch(HF_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${HF_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ inputs: prompt })
  });

  if (!response.ok) {
    throw new Error("Error al conectar con HuggingFace");
  }

  const result = await response.json();
  return result?.[0]?.generated_text || "Sin respuesta.";
};
