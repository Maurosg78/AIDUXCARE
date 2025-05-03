import { Langfuse } from 'langfuse';

const langfuse = new Langfuse({
  publicKey: "pk-lf-80733c0c-7175-41bf-91f1-8215bf5a468e",
  secretKey: "@langfuse_secret_key",
  baseUrl: "https://cloud.langfuse.com",
  flushAt: 1
});

export function logEvalTest(testName: string, success: boolean) {
  langfuse.trace({
    name: 'eval_test',
    input: {
      testName
    },
    output: {
      success
    },
    tags: ['test']
  });
} 