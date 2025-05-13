import { verifyLangfuseConfig, trackEvent } from '@/core/lib/langfuse.client';

export function useLangfuse() {
  verifyLangfuseConfig();
  return { trackEvent };
}

