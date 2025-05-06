# AiDuxCare

Sistema de gestión clínica inteligente con asistente IA para fisioterapeutas.

## 🚀 Configuración del Entorno

### Variables de Entorno Requeridas

Copia `.env.example` a `.env.local` y configura las siguientes variables:

```bash
# Supabase - Base de datos
NEXT_PUBLIC_SUPABASE_URL="https://your-project.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key"

# Langfuse - Trazabilidad y análisis
LANGFUSE_PUBLIC_KEY="pk-lf-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
LANGFUSE_SECRET_KEY="sk-lf-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"

# API
VITE_API_BASE_URL="http://localhost:3000"
```

### Configuración de Supabase

1. Crear proyecto en [Supabase](https://supabase.com)
2. Crear las siguientes tablas:

```sql
-- Tabla de pacientes
create table patients (
  id uuid default uuid_generate_v4() primary key,
  full_name text not null,
  birth_date date not null,
  sex text not null,
  clinical_history text[] default array[]::text[],
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Tabla de visitas
create table visits (
  id uuid default uuid_generate_v4() primary key,
  patient_id uuid references patients(id) on delete cascade not null,
  professional_id text not null,
  date timestamp with time zone not null,
  reason text not null,
  notes text default '',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Trigger para actualizar updated_at
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$ language plpgsql;

create trigger update_patients_updated_at
  before update on patients
  for each row
  execute function update_updated_at_column();

create trigger update_visits_updated_at
  before update on visits
  for each row
  execute function update_updated_at_column();
```

3. Copiar las credenciales de Supabase al `.env.local`
4. Ejecutar la migración de datos de prueba:
```bash
npm run seed:supabase
```

### Instalación

```bash
# Instalar dependencias
npm install

# Ejecutar en desarrollo
npm run dev:all

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

## Changelog

### Versión 1.8.0 – 2025-05-07
- 🔒 Actualizadas dependencias críticas (Next.js, Vite) para resolver vulnerabilidades
- 🧱 Manejo robusto de errores en VisitDetailPage (carga, validación, estado inconsistente)
- 🧭 Middleware reforzado para rutas protegidas (`/patients/*`, `/visits/*`, `/dashboard`)
- 🧭 Página 404 profesional con redirección a `/dashboard`
- ✅ El sistema queda técnicamente estable para iniciar pruebas clínicas reales en entorno controlado

---
*AiDuxCare - Transformando la Fisioterapia con IA* 