console.log('[Langfuse] Enviando copilot.feedback, payload:', payload, 'traceId:', formData.traceId);
trackEvent('copilot.feedback', payload, formData.traceId); 