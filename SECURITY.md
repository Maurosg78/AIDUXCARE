# Política de Seguridad - AiDuxCare

## 🛡️ Introducción

AiDuxCare es una plataforma de salud digital que proporciona asistencia para documentación clínica de alta calidad mediante el uso de inteligencia artificial. Debido a la naturaleza sensible de los datos clínicos que manejamos, la seguridad es un pilar fundamental en nuestra arquitectura.

Este documento detalla las medidas implementadas para garantizar la confidencialidad, integridad y disponibilidad de los datos clínicos, así como las prácticas de seguridad adoptadas en nuestro ciclo de desarrollo.

### Filosofía de seguridad

Nuestra aproximación a la seguridad se basa en:

- **Defensa en profundidad**: Múltiples capas de seguridad en cada nivel de la aplicación
- **Mínimo privilegio**: Acceso únicamente a la información necesaria para cada rol
- **Seguridad por diseño**: La seguridad como requisito desde las fases iniciales del desarrollo
- **Mejora continua**: Evaluación y actualización constante de nuestras prácticas de seguridad

## 🏢 Infraestructura protegida

### Hosting y despliegue

- **Frontend**: Desplegado en Vercel con control estricto de variables de entorno, CI/CD seguro, y previews aislados
- **Backend (Node.js Express)**: Alojado en Railway con configuración de seguridad optimizada
- **API MCP (FastAPI)**: Servicio independiente con aislamiento y configuración restrictiva en Railway
- **Entorno de desarrollo**: Configuración local con variables .env.local separadas y cifradas en repositorio

### Bases de datos y almacenamiento

- **Supabase**:
  - RLS (Row Level Security) configurado por tipo de usuario
  - Separación de claves de servicio (backend) y anónimas (frontend)
  - Autenticación JWT y verificación de roles integrada
  - Backups automáticos cifrados

### Observabilidad y monitorización

- **Langfuse**: 
  - Configurado con claves de acceso en backend y frontend aisladas
  - Filtrado automático de información sensible en trazas
  - Segmentación estricta por entorno (dev/prod)

## 🔐 Gestión de autenticación y sesiones

### NextAuth

- Configuración robusta con estrategia JWT segura
- Cookies protegidas con configuraciones óptimas:
  ```javascript
  cookies: {
    sessionToken: {
      name: isProduction ? '__Secure-next-auth.session-token' : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'strict',
        secure: isProduction,
        path: '/',
        maxAge: 8 * 60 * 60, // 8 horas
      },
    },
    callbackUrl: {
      name: isProduction ? '__Secure-next-auth.callback-url' : 'next-auth.callback-url',
      options: {
        httpOnly: true,
        sameSite: 'strict',
        secure: isProduction,
        path: '/',
      },
    },
    csrfToken: {
      name: isProduction ? '__Secure-next-auth.csrf-token' : 'next-auth.csrf-token',
      options: {
        httpOnly: true,
        sameSite: 'strict',
        secure: isProduction,
        path: '/',
      },
    },
  }
  ```

### JWT y Tokens

- Tokens JWT firmados con algoritmo HS256
- Secreto de firma protegido en variables de entorno
- Tiempo de expiración limitado (8 horas)
- Validación de claims (`iat`, `exp`, `sub`, `email`) en cada petición
- Estructura del payload sin información sensible

### RoleBasedRedirect y Control de Acceso

- Middleware para verificación de roles en rutas protegidas
- Redirección automática según rol asignado
- Comprobación en cliente y servidor para prevención de accesos no autorizados

## 🛑 Protección contra CSRF

### Middleware CSRF en FastAPI

- Implementación completa de tokens CSRF basados en HMAC-SHA256
- Endpoint dedicado para generación de tokens (`/api/csrf-token`)
- Middleware para validación automática en métodos mutantes:
  ```python
  @router.post("/store", summary="Almacenar campo de registro clínico")
  async def store_emr_field(
    request: Dict[str, Any] = Body(...),
    user_data: Dict[str, Any] = Depends(require_auth),
    _: None = Depends(require_csrf)
  ) -> Dict[str, Any]:
  ```

### Cliente CSRF en Frontend

- Cliente Axios específico con token CSRF automático:
  ```typescript
  export const mcpApiClient = createCsrfProtectedAxios(MCP_BASE_URL);
  ```
- Interceptor para renovación y gestión transparente de tokens
- Validación doble (cookie + header) para mayor seguridad

### Flujo de CSRF completo

1. Obtención de token en el inicio de sesión o carga inicial
2. Renovación automática cuando expira (90% de vida útil)
3. Validación en cada operación de escritura para prevenir ataques CSRF

## ✅ Validación de entradas y sanitización de datos

### Esquemas de validación

- Uso extensivo de Zod para validación de entrada:
  ```typescript
  const RequestSchema = z.object({
    visit_id: z.string().uuid(),
    field: z.string(),
    role: z.string(),
    content: z.string(),
    overwrite: z.boolean().optional()
  });
  ```
- Tipado fuerte en TypeScript con interfaces y tipos definidos
- Validación específica para datos clínicos sensibles

### Sanitización

- Filtrado de campos permitidos en cada API
- Transformación de valores antes de procesamiento
- Protección contra inyección con patrones de validación:
  ```typescript
  const suspiciousPatterns = [
    /\.\.\//g,           // Path traversal
    /\s*(;|--|\/\*|\|)/g, // SQL injection
    /<script>/ig,        // XSS simple
    /document\./ig,      // XSS DOM
    /eval\(/ig           // Evaluación dinámica
  ];
  ```

### Manejo de errores

- Errores personalizados en diferentes niveles
- Respuestas de error sin exposición de detalles sensibles
- Monitorización de errores para detección de intentos de explotación

## 🛡️ Encabezados de seguridad HTTP y middleware

### Headers de seguridad

Implementados a través de middleware en FastAPI y Express:

- `Content-Security-Policy`: Restringido a orígenes conocidos
  ```
  default-src 'self';
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  font-src 'self' https://fonts.gstatic.com;
  img-src 'self' data: https:;
  script-src 'self';
  connect-src 'self' https://api.langfuse.com;
  object-src 'none';
  upgrade-insecure-requests;
  frame-ancestors 'none'
  ```
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Strict-Transport-Security: max-age=31536000; includeSubDomains; preload` (en producción)

### Middleware de seguridad

- Express:
  ```typescript
  app.use(securityHeaders);
  app.use(basicProtection);
  app.use(validateParams);
  ```

- FastAPI:
  ```python
  app.add_middleware(SecurityHeadersMiddleware)
  ```

### CORS restrictivo

- Configuración estricta para orígenes permitidos:
  ```python
  app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,  # Orígenes específicos permitidos
    allow_credentials=True,
    allow_methods=["GET", "POST"],  # Métodos limitados
    allow_headers=["Content-Type", "Authorization"],  # Headers permitidos
  )
  ```

## 📝 Gestión de logs sensibles y auditoría

### Filtrado de información sensible

- Implementación de filtros específicos para redactar información sensible:
  ```python
  def filter_sensitive_data(record):
    sensitive_patterns = [
      (r'([a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+)', '[EMAIL-REDACTADO]'),
      (r'(eyJ[a-zA-Z0-9_-]{5,}\.eyJ[a-zA-Z0-9_-]{5,})', '[TOKEN-REDACTADO]'),
      (r'(patient_id|visit_id)["\']\s*:\s*["\']([a-zA-Z0-9-]{5,})["\']', r'\1": "[ID-REDACTADO]"'),
      (r'(password|secret|key)["\']\s*:\s*["\']([^"\']{3,})["\']', r'\1": "[SECRETO-REDACTADO]"')
    ]
    
    message = record["message"]
    for pattern, replacement in sensitive_patterns:
      import re
      message = re.sub(pattern, replacement, message)
      
    record["message"] = message
    return record
  ```

### Centralización de logs

- Uso de Loguru para estructuración de logs en Python
- Winston para NodeJS
- Centralización y niveles configurables según entorno

### Trazabilidad de acciones

- Registro de acciones sensibles con contexto:
  ```python
  logging.info(f"Usuario {user_data.get('email')} solicitando validación para visita {visit_id}")
  ```
- Integración con Langfuse para trazabilidad de IA
- Identificación de usuarios en cada operación

## 🚫 Rate limiting y anti-DOS

### Protección contra abusos

- Limitación de tamaño de payload:
  ```typescript
  const contentLength = parseInt(req.headers['content-length'] as string || '0', 10);
  const MAX_CONTENT_LENGTH = 1 * 1024 * 1024; // 1MB
  
  if (contentLength > MAX_CONTENT_LENGTH) {
    return res.status(413).json({
      error: 'Payload demasiado grande',
      maxSize: `${MAX_CONTENT_LENGTH / 1024 / 1024}MB`
    });
  }
  ```

### Validación de Content-Type

- Restricción de tipos permitidos:
  ```typescript
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
  ```

### Prevención de ataques comunes

- Middleware de protección contra patrones de ataque básicos
- Límites de tasa por IP en endpoints críticos

## 🔒 Mecanismos de control de roles y acceso

### Roles implementados

- Separación de funcionalidades por roles:
  - `admin`: Acceso completo a la plataforma
  - `professional`: Acceso a pacientes y visitas asignadas
  - `fisioterapeuta`: Acceso específico a funciones de fisioterapia
  - `health_professional`: Acceso a funcionalidades clínicas generales

### Middleware de acceso

- Validación de roles en backend:
  ```python
  if "role" in token_data:
    user_role = token_data["role"]
    allowed_roles = ["admin", "professional", "fisioterapeuta", "health_professional"]
    if user_role not in allowed_roles:
      logger.warning(f"Usuario {token_data['email']} con rol {user_role} intentó acceder a ruta protegida")
      raise HTTPException(
        status_code=403,
        detail="No tienes permisos para acceder a este recurso"
      )
  ```

### Rutas protegidas

- Implementación en frontend con `ProtectedRoute`:
  ```tsx
  <ProtectedRoute allowedRoles={['professional', 'fisioterapeuta']}>
    <VisitPage />
  </ProtectedRoute>
  ```
- Validación en backend con middleware `require_auth`

## 📋 Pendientes y mejoras recomendadas

### Mejoras implementadas en la versión 1.30

| Mejora | Descripción | Prioridad | Estado |
|--------|-------------|-----------|--------|
| Validación completa de tipado TypeScript | Verificación de que todos los componentes, APIs y servicios tienen un tipado estricto sin errores ni bypass de tipo (@ts-ignore) | Alta | ✅ Completado |
| Exportación PDF de visitas clínicas | Implementación de exportación PDF con datos clínicos estructurados y firma digital del profesional | Alta | ✅ Completado |

### Mejoras sugeridas para la versión 1.30+

| Mejora | Descripción | Prioridad | Estado |
|--------|-------------|-----------|--------|
| MFA para cuentas críticas | Autenticación de dos factores para cuentas administrativas | Alta | En progreso |
| Firma digital de campos clínicos | Implementación de firma digital (hash + timestamp) para cada campo clínico validado | Alta | ✅ Implementado en PDF |
| Rotación automática de JWT | Mecanismo para rotación automática de tokens tras eventos críticos | Alta | En progreso |
| Revisión avanzada de acceso granular por rol | Implementar control más detallado basado en permisos específicos, no solo roles | Media | Pendiente |
| Auditoría externa del código y seguridad | Revisión por terceros de la arquitectura de seguridad | Media | Pendiente |
| Cifrado de campos clínicos sensibles en reposo | Implementar cifrado a nivel de campo para datos altamente sensibles | Media | Pendiente |
| Endpoint de auditoría avanzada | Sistema central para registro y consulta de acciones críticas de seguridad | Media | En progreso |
| Protección contra repetición (nonce) | Mecanismo para prevenir ataques de repetición en operaciones sensibles | Media | En progreso |
| Verificación de integridad del frontend | Validación del hash de build para detectar manipulaciones | Baja | En progreso |
| Centralización de logs sensibles en Langfuse | Sistema unificado para almacenamiento y análisis de logs de seguridad | Baja | En progreso |
| Separación de subdominios por tipo de usuario | Aislamiento de interfaces por rol para mayor seguridad | Baja | En estudio |
| Detección de anomalías en patrones de acceso | Sistema para identificar comportamientos sospechosos | Baja | Pendiente |
| Implementación de logs inmutables | Sistema para garantizar la integridad de registros de auditoría | Baja | Pendiente |

## 🔍 Pruebas de seguridad

AiDuxCare implementa endpoints específicos para verificación de seguridad:

- `/api/security/headers-check`: Verificación de cabeceras de seguridad
- `/api/security/csrf-check`: Validación de protección CSRF
- `/api/security/auth-check`: Comprobación de autenticación
- `/api/security/full-check`: Verificación completa de todas las protecciones

Estos endpoints permiten validar de manera continua que las implementaciones de seguridad funcionan correctamente.

---

> Última actualización: Mayo 2024 - v1.29.0
> 
> Este documento se revisa y actualiza regularmente como parte de nuestro compromiso con la mejora continua de la seguridad. 