# AiDuxCare

Sistema de gestión clínica inteligente con asistente IA para fisioterapeutas.

## 🚀 Configuración del Entorno

### Variables de Entorno Requeridas

Copia `.env.example` a `.env` y configura las siguientes variables:

```bash
# Langfuse - Trazabilidad y análisis
VITE_LANGFUSE_PUBLIC_KEY="REQUIRED"
VITE_LANGFUSE_SECRET_KEY="REQUIRED"
VITE_LANGFUSE_HOST="https://cloud.langfuse.com"

# NextAuth - Autenticación
NEXTAUTH_SECRET="REQUIRED"
NEXTAUTH_URL="http://localhost:3000"

# Vercel - Despliegue
VERCEL_TOKEN="REQUIRED"
VERCEL_ORG_ID="REQUIRED"
VERCEL_PROJECT_ID="REQUIRED"
```

### Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev

# Construir para producción
npm run build
```

## 🧪 Testing

```bash
# Ejecutar linting
npm run lint

# Ejecutar tests
npm run test

# Ejecutar evaluaciones
npm run eval:all
```

## 📊 Monitoreo

El sistema utiliza Langfuse para monitoreo y análisis. Los siguientes eventos son trackeados:

- `form.update`: Actualizaciones del formulario clínico
- `copilot.feedback`: Feedback sobre sugerencias de IA
- `copilot.suggestion.generated`: Nuevas sugerencias generadas
- `copilot.context.updated`: Actualizaciones del contexto
- `audio.transcript.validated`: Frases validadas por voz

## 🔒 Seguridad

- Todos los datos clínicos son procesados localmente
- Las transcripciones de voz son validadas antes de almacenarse
- El acceso a los dashboards administrativos requiere autenticación
- Los eventos son anonimizados antes de enviarse a Langfuse

## 🤝 Contribución

1. Asegúrate de que el linting pase sin errores
2. Añade tests para nuevas funcionalidades
3. Actualiza la documentación según sea necesario
4. Sigue las convenciones de commits:
   - `feat:` para nuevas funcionalidades
   - `fix:` para correcciones de bugs
   - `chore:` para mantenimiento
   - `docs:` para documentación

## Documentación

La documentación completa del proyecto se encuentra en la carpeta `/docs`:

- [Índice de Documentación](./docs/README_DOCS.md) - Acceso a toda la documentación técnica y operativa

## Despliegue en Vercel

1. Preparación local:
   ```bash
   # Verificar build local
   npm run build
   npm run preview
   ```

2. Configuración en Vercel:
   - Conectar repositorio desde vercel.com
   - Framework Preset: Vite
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`

3. Variables de entorno en Vercel:
   - `VITE_LANGFUSE_HOST`
   - `VITE_LANGFUSE_PROJECT_ID`
   - `VITE_API_BASE_URL`

4. Despliegue:
   - Vercel detectará automáticamente la configuración
   - Cada push a main generará un nuevo despliegue
   - Las rutas funcionarán correctamente gracias a `base: "/"`

## Estructura de rutas

- `/` - Página principal (requiere autenticación)
- `/login` - Página de inicio de sesión
- `/dashboard` - Dashboard de impacto (admin, auditor)
- `/patients` - Lista de pacientes (fisioterapeuta, admin)
- `/patients/:patientId/visits/:visitId` - Detalle de visita (fisioterapeuta, admin) 