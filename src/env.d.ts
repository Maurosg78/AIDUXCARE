/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LANGFUSE_PUBLIC_KEY: string
  readonly VITE_LANGFUSE_SECRET_KEY: string
  readonly VITE_LANGFUSE_HOST: string
  readonly VITE_LANGFUSE_BASE_URL: string
  readonly MODE: string
  [key: string]: string | undefined
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 