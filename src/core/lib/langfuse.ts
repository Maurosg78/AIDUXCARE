import { Langfuse } from 'langfuse';

// Declaración de tipo para entorno Vite que extiende la interfaz ImportMetaEnv
declare global {
  interface ImportMetaEnv {
    readonly VITE_LANGFUSE_PUBLIC_KEY?: string;
    readonly VITE_LANGFUSE_BASE_URL?: string;
  }
}

// Simplemente usamos la configuración básica ya que la biblioteca del cliente
// no permite la personalización avanzada como lo hace langfuse-node
const langfuse = new Langfuse({
  publicKey: import.meta.env.VITE_LANGFUSE_PUBLIC_KEY || ''
  // La propiedad baseUrl ya no es soportada por la biblioteca
});

export { langfuse };

export { verifyLangfuseConfig, trackEvent } from './langfuse.client';
