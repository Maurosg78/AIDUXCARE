import { VercelRequest, VercelResponse } from '@vercel/node';
import { Langfuse } from 'langfuse-node';

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, metadata } = req.body;
    
    if (!name) {
      return res.status(400).json({ error: 'Missing event name' });
    }

    const client = new Langfuse({
      publicKey: process.env.VITE_LANGFUSE_PUBLIC_KEY!,
      secretKey: process.env.LANGFUSE_SECRET_KEY!,
      baseUrl: process.env.VITE_LANGFUSE_BASE_URL
    });

    const trace = await client.trace({
      name,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        userAgent: req.headers['user-agent'],
        origin: req.headers.origin
      }
    });

    return res.status(200).json({ 
      success: true, 
      traceId: trace.id 
    });

  } catch (error) {
    console.error('[Event Handler]', error);
    return res.status(500).json({ 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
} 