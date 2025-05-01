import { Langfuse } from 'langfuse';
import dotenv from 'dotenv';

dotenv.config();

export const langfuse = new Langfuse({
  publicKey: process.env.LANGFUSE_PUBLIC_KEY!,
  secretKey: process.env.LANGFUSE_SECRET_KEY!,
  baseUrl: process.env.LANGFUSE_HOST,
}); 