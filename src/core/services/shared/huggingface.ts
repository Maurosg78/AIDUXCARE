// Cliente simple para Hugging Face
const HF_API_KEY = import.meta.env.VITE_HUGGINGFACE_API_KEY as string | undefined;

// Función para verificar las credenciales
const hasCredentials = (): boolean => {
  return !!HF_API_KEY;
};

// Headers básicos para peticiones a Hugging Face
const getHeaders = (): Record<string, string> => {
  return {
    'Content-Type': 'application/json',
    ...(HF_API_KEY ? { 'Authorization': `Bearer ${HF_API_KEY}` } : {})
  };
};

// Función simple para inferencia de modelos
async function query(model: string, inputs: any, options = {}): Promise<any> {
  if (!hasCredentials()) {
    console.error('No se encontró API_KEY para Hugging Face');
    return Promise.reject(new Error('No HF API key available'));
  }

  try {
    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        headers: getHeaders(),
        method: 'POST',
        body: JSON.stringify({
          inputs,
          options
        })
      }
    );

    if (!response.ok) {
      throw new Error(`Error en petición a Hugging Face: ${response.statusText}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error en inferencia de Hugging Face:', error);
    throw error;
  }
}

// Exportar cliente con funciones principales
export const huggingFaceClient = {
  query,
  hasCredentials
};

export default huggingFaceClient;
