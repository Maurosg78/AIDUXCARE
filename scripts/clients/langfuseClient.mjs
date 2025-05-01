import { Langfuse } from 'langfuse';
import dotenv from 'dotenv';

dotenv.config();

// Inicializar el cliente de Langfuse
// IMPORTANTE: Reemplaza estas claves con las nuevas que generes en la interfaz de Langfuse
const langfuse = new Langfuse({
  publicKey: "pk-lf-80733c0c-7175-41bf-91f1-8215bf5a468e",
  secretKey: "sk-lf-1432bacf-de95-4dfd-99d2-0e1ad5b80602",
  baseUrl: "https://cloud.langfuse.com",
  flushAt: 1, // Forzar el envío inmediato de datos
  flush: true // Habilitar el envío automático
});

// Asegurarnos de que los datos se envíen antes de que el programa termine
process.on('beforeExit', async () => {
  await langfuse.shutdownAsync();
});

export { langfuse }; 