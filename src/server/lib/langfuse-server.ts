import { Langfuse } from 'langfuse';

export const langfuseServer = new Langfuse({
  publicKey: process.env.VITE_LANGFUSE_PUBLIC_KEY!,
  secretKey: process.env.VITE_LANGFUSE_SECRET_KEY!,
  host: process.env.VITE_LANGFUSE_BASE_URL!,
});

