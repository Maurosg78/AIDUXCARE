import { Langfuse } from 'langfuse';

const langfuse = new Langfuse({
  publicKey: import.meta.env.VITE_LANGFUSE_PUBLIC_KEY!,
  baseUrl: import.meta.env.VITE_LANGFUSE_BASE_URL!
});

export default langfuse;

export { verifyLangfuseConfig, trackEvent } from './langfuse.client';
