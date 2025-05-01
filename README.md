# AiDuxCare

Sistema de gestión clínica con IA integrada.

## Requisitos

- Node.js 18.x o superior
- npm 9.x o superior

## Instalación

```bash
npm install
```

## Desarrollo

```bash
npm run dev
```

## Construcción para producción

```bash
npm run build
```

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

## Seguridad

- Todas las rutas están protegidas por roles
- No hay rutas públicas excepto `/login`
- Las credenciales de API se manejan en el backend
- Variables sensibles configuradas en el panel de Vercel 