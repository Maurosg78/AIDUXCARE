import { langfuseBackend } from '@/core/lib/langfuse.backend';
import { verifyBackendConfig } from '@/core/lib/langfuse.backend';
import type { TraceOptions  } from '@/types/langfuse.events';

export async function handleEvent(req: Request) {
  try {
    verifyBackendConfig();
    
    const { name, metadata } = await req.json();
    
    if (!name) {
      return new Response('Missing event name', { status: 400 });
    }

    const traceOptions: TraceOptions = {
      name,
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString(),
        userAgent: req.headers.get('user-agent'),
        origin: req.headers.get('origin')
      }
    };

    const trace = await langfuseBackend.trace(name);

    return new Response(JSON.stringify({ success: true, traceId: trace.id }), {
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('[Event Handler]', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error'
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
} 