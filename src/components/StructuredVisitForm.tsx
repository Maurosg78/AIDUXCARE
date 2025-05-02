console.log('[Langfuse] Enviando form.update, payload:', payload, 'traceId:', formData.traceId);
trackEvent('form.update', payload, formData.traceId); 