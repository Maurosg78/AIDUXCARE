/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LANGFUSE_PUBLIC_KEY: string;
  readonly VITE_LANGFUSE_SECRET_KEY: string;
  readonly VITE_LANGFUSE_HOST: string;
  readonly VITE_HUGGINGFACE_API_KEY: string;
  readonly VITE_API_BASE_URL: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 