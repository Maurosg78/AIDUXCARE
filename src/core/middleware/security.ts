/**
 * Middleware de seguridad para Express
 * 
 * Implementa cabeceras de seguridad HTTP y otras medidas
 * de protección para el servidor Express.
 */

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware para aplicar encabezados de seguridad HTTP
 */
export function securityHeaders(req: Request, res: Response, next: NextFunction): void {
  // Prevenir sniffing de MIME type
  res.setHeader('X-Content-Type-Options', 'nosniff');
  
  // Prevenir que el sitio se muestre en un iframe
  res.setHeader('X-Frame-Options', 'DENY');
  
  // Controlar información de referencia
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
  // Content Security Policy - Ajustado para API
  const csp = [
    "default-src 'self'",
    "script-src 'self'",
    "img-src 'self' data:",
    "style-src 'self'",
    "connect-src 'self'",
    "font-src 'self'",
    "object-src 'none'",
    "frame-ancestors 'none'"
  ].join('; ');
  
  res.setHeader('Content-Security-Policy', csp);
  
  // HSTS - Strict Transport Security (solo en producción)
  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }
  
  // Para APIs, deshabilitar caché
  if (req.path.startsWith('/api/')) {
    res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
  }
  
  next();
}

/**
 * Middleware para protección básica contra ataques
 */
export function basicProtection(req: Request, res: Response, next: NextFunction): void {
  // Limitar tamaño de payload para evitar DoS
  const contentLength = parseInt(req.headers['content-length'] as string || '0', 10);
  const MAX_CONTENT_LENGTH = 1 * 1024 * 1024; // 1MB
  
  if (contentLength > MAX_CONTENT_LENGTH) {
    return res.status(413).json({
      error: 'Payload demasiado grande',
      maxSize: `${MAX_CONTENT_LENGTH / 1024 / 1024}MB`
    });
  }
  
  // Validar Content-Type para solicitudes POST/PUT/PATCH
  if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
    const contentType = req.headers['content-type'] || '';
    
    if (!contentType.includes('application/json') && 
        !contentType.includes('multipart/form-data') && 
        !contentType.includes('application/x-www-form-urlencoded')) {
      return res.status(415).json({
        error: 'Content-Type no soportado',
        acceptedTypes: 'application/json, multipart/form-data, application/x-www-form-urlencoded'
      });
    }
  }
  
  next();
}

/**
 * Middleware para validación simple de parámetros críticos
 */
export function validateParams(req: Request, res: Response, next: NextFunction): void {
  // Lista de patrones de inyección comunes
  const suspiciousPatterns = [
    /\.\.\//g,           // Path traversal
    /\s*(;|--|\/\*|\|)/g, // SQL injection
    /<script>/ig,        // XSS simple
    /document\./ig,      // XSS DOM
    /eval\(/ig,          // Evaluación dinámica
  ];
  
  // Función para verificar un objeto en busca de patrones sospechosos
  const checkObject = (obj: any): string | null => {
    if (!obj) return null;
    
    for (const key in obj) {
      if (typeof obj[key] === 'string') {
        const value = obj[key] as string;
        
        for (const pattern of suspiciousPatterns) {
          if (pattern.test(value)) {
            return `Patrón sospechoso detectado en parámetro: ${key}`;
          }
        }
      } else if (typeof obj[key] === 'object') {
        const result = checkObject(obj[key]);
        if (result) return result;
      }
    }
    
    return null;
  };
  
  // Verificar query params, params y body
  const queryCheck = checkObject(req.query);
  const paramsCheck = checkObject(req.params);
  const bodyCheck = checkObject(req.body);
  
  if (queryCheck || paramsCheck || bodyCheck) {
    return res.status(400).json({
      error: 'Parámetros inválidos detectados',
      detail: queryCheck || paramsCheck || bodyCheck
    });
  }
  
  next();
}

/**
 * Aplica todos los middlewares de seguridad en un solo paso
 */
export function applySecurityMiddleware(app: any): void {
  app.use(securityHeaders);
  app.use(basicProtection);
  app.use(validateParams);
} 