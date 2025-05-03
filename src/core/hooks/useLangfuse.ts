import { Langfuse } from 'langfuse-node';

const langfuse = new Langfuse({
  publicKey: import.meta.env.VITE_LANGFUSE_PUBLIC_KEY,
  secretKey: import.meta.env.VITE_LANGFUSE_SECRET_KEY,
  baseUrl: import.meta.env.VITE_LANGFUSE_HOST,
});

export const useLangfuse = () => {
  const trace = langfuse.trace({
    name: 'active_listening',
    metadata: {
      type: 'clinical_audio',
    },
  });

  return { trace };
}; 