import { trackEvent } from '@/core/lib/langfuse.client';

export async function logEvalTest(testName: string, success: boolean) {
  return trackEvent('eval_test', {
    testName,
    success,
    tags: ['test']
  });
} 