/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LANGFUSE_HOST: string
  readonly VITE_LANGFUSE_PROJECT_ID: string
  readonly VITE_API_BASE_URL: string
  readonly VITE_HUGGINGFACE_API_KEY: string
  readonly DEV: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 