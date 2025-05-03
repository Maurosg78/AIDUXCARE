import { Langfuse } from 'langfuse';

async function main() {
  const langfuse = new Langfuse({
    publicKey: process.env.LANGFUSE_PUBLIC_KEY || '',
    secretKey: process.env.LANGFUSE_SECRET_KEY || '',
    baseUrl: process.env.LANGFUSE_BASE_URL || 'https://cloud.langfuse.com'
  });

  try {
    const trace = langfuse.trace({
      name: 'check-events'
    });

    console.log('Trace:', {
      id: trace.id
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

main(); 