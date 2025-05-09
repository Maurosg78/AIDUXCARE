# AiDuxCare MCP Server

## Despliegue en Railway

Para desplegar este microservicio en Railway:

1. Haz fork de este repositorio en GitHub
2. Conéctalo a Railway desde la plataforma
3. Configura las variables de entorno necesarias:
   - `ANTHROPIC_API_KEY`: Tu clave de API de Anthropic/Claude
   - `MODEL_PROVIDER`: "anthropic"
   - `DEFAULT_MODEL`: "claude-3-sonnet-20240229"
   - `SUPABASE_URL`: URL de tu proyecto Supabase
   - `SUPABASE_SERVICE_ROLE_KEY`: Clave de servicio de Supabase
   - `LANGFUSE_PUBLIC_KEY`: Clave pública de Langfuse
   - `LANGFUSE_SECRET_KEY`: Clave secreta de Langfuse
   - `LANGFUSE_HOST`: URL de Langfuse (normalmente "https://cloud.langfuse.com")
   - `PORT`: 8001 (Railway lo configurará automáticamente)
   - `ENABLE_TRACE`: "true"
   - `DEBUG`: "false"
   - `ENVIRONMENT`: "production"
   - `LOG_LEVEL`: "INFO"

Railway utilizará el Dockerfile en la carpeta mcp_server para construir y ejecutar la aplicación.

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

# AiDuxCare v1.15

## Instalación y Ejecución Rápida v1.15

Para ejecutar AiDuxCare v1.15 de forma estable, sigue estos pasos:

### Método 1: Ejecución con un solo comando (Recomendado)
```bash
# Iniciar todo el sistema con un solo comando
npm run quickstart
```

Este comando realizará automáticamente:
1. Liberación de puertos en uso (5175, 5176, 3000)
2. Configuración de variables de entorno
3. Inicio del servidor API mock (http://localhost:3000)
4. Inicio del frontend (http://localhost:5176)

### Método 2: Ejecución por pasos
```bash
# Paso 1: Liberar puertos que puedan estar ocupados
npm run free-ports

# Paso 2: Configurar variables de entorno
npm run setup-env

# Paso 3: Iniciar el servidor API mock
npm run api

# Paso 4 (en otra terminal): Iniciar el frontend
npm run start
```

### Método 3: Ejecución con dev:all (puede tener problemas)
```bash
# Primero liberar puertos
npm run free-ports

# Ejecutar backend y frontend juntos
npm run dev:all
```

## Solución de problemas
- Si ves errores relacionados con Supabase, asegúrate de estar usando `simple-server-direct.mjs` como backend
- Si ves errores de puerto 5175 ocupado, ejecuta `npm run free-ports`
- Si el comando `npm run dev:all` falla, ejecuta el servidor y frontend por separado 

# MCP - Model Context Protocol para AiDuxCare

Este módulo implementa un agente clínico inteligente para AiDuxCare utilizando la arquitectura MCP (Model Context Protocol).

El agente está diseñado para asistir a diferentes tipos de usuarios del sistema, permitiendo:
- Mantener contexto con memoria de la conversación
- Ejecutar herramientas clínicas especializadas según el rol de usuario
- Generar respuestas adaptadas al tipo de usuario
- Mantener trazabilidad completa de las acciones

## Estructura del Proyecto

```
mcp/
├── __init__.py          # Inicialización del módulo
├── agent_mcp.py         # Agente principal y lógica de razonamiento
├── agent_factory.py     # Fábrica para crear agentes según rol de usuario
├── context.py           # Contexto, estado y manejo de historia
└── tools.py             # Herramientas clínicas disponibles
```

## Instalación

El módulo MCP está diseñado para ejecutarse con dependencias mínimas:

```bash
# Clonar el repositorio
git clone https://github.com/aiduxcare/aiduxcare.git
cd aiduxcare

# Crear un entorno virtual (opcional pero recomendado)
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate

# Instalar dependencias
# Actualmente solo requiere Python estándar
```

## Uso

### Shell Interactivo

La forma más rápida de probar el agente es ejecutar el shell interactivo:

```bash
# Desde la raíz del proyecto
python -m mcp.agent_mcp
```

Esto iniciará una interfaz interactiva donde podrás enviar mensajes al agente y ver sus respuestas.

### Integración Programática con Roles de Usuario

AiDuxCare v1.17 incorpora una arquitectura modular basada en roles de usuario. Los tres roles principales son:
- `health_professional`: Para profesionales de la salud (médicos, fisioterapeutas...)
- `patient`: Para pacientes que acceden a su información
- `admin_staff`: Para personal administrativo y de gestión

Para integrar el agente con un rol específico:

```python
from mcp.context import MCPContext
from mcp.agent_factory import (
    create_agent_by_role,  # Función genérica
    crear_agente_profesional_salud,  # Función específica para profesionales
    crear_agente_paciente,  # Función específica para pacientes
    crear_agente_administrativo  # Función específica para administrativos
)

# 1. Crear contexto (especificando el rol)
contexto = MCPContext(
    paciente_id="P001",
    paciente_nombre="Juan Pérez",
    visita_id="V20250508-001",
    profesional_email="profesional@ejemplo.com",
    motivo_consulta="Dolor cervical persistente",
    user_role="health_professional"  # Especificar rol aquí
)

# 2A. Crear agente usando la fábrica genérica
agente = create_agent_by_role(contexto)

# 2B. Alternativamente, usar la función específica del rol
agente = crear_agente_profesional_salud(contexto)

# 3. Procesar mensajes
respuesta = agente.procesar_mensaje("El paciente refiere dolor cervical con irradiación a brazo derecho")
print(respuesta)

# 4. Ver historia del contexto
print(contexto.obtener_historia_formateada())

# 5. Finalizar sesión
contexto.finalizar_sesion()
```

## Comportamiento por Rol de Usuario

### Rol: health_professional

**Características:**
- Acceso a todas las herramientas clínicas
- Respuestas con terminología técnica y detalles completos
- Razonamiento clínico explícito
- Evaluaciones de riesgo legal detalladas

**Ejemplo de respuesta:**
```
Respecto a la consulta del paciente Juan Pérez:
El diagnóstico principal sugerido es Cervicalgia mecánica.
También se deben considerar: Contractura muscular, Hernia discal cervical.

⚠️ Es importante considerar los siguientes aspectos de riesgo legal:
- Técnica de alto riesgo identificada: manipulación
- Documentar detalladamente procedimiento y respuesta para 'manipulación'

Estoy disponible para asistir con cualquier otra consulta relacionada con este caso.
```

### Rol: patient

**Características:**
- Acceso limitado a herramientas (solo historial)
- Lenguaje simple sin terminología técnica
- Sin acceso a evaluaciones de riesgo legal
- Respuestas enfocadas en información general y cuidados

**Ejemplo de respuesta:**
```
Hola Juan, respecto a tu consulta:
Basado en tus visitas anteriores:
- 2025-04-10 - Dolor cervical agudo
- 2025-03-15 - Control mensual

El profesional de salud considera que podrías presentar Cervicalgia mecánica.

Con la información disponible, recomendaría:
- Seguir las indicaciones de tu profesional de salud
- Mantener un registro de tus síntomas
- Consultar nuevamente si los síntomas persisten o empeoran

Recuerda que esta información no reemplaza la consulta con tu profesional de salud.
```

### Rol: admin_staff

**Características:**
- Acceso a herramientas de historial y riesgos legales
- Sin acceso a herramientas de diagnóstico clínico
- Respuestas enfocadas en aspectos administrativos y legales
- Formato estructurado para facilitar la gestión

**Ejemplo de respuesta:**
```
Información sobre el paciente Juan Pérez para gestión administrativa:
Basado en su historial de visitas:
- 2025-04-10 - Dolor cervical agudo
- 2025-03-15 - Control mensual

Diagnóstico registrado: Cervicalgia mecánica

⚠️ ALERTA: Aspectos legales importantes a considerar:
- Técnica de alto riesgo identificada: manipulación
- Documentar detalladamente procedimiento y respuesta para 'manipulación'

La información proporcionada está sujeta a actualización en futuras visitas.
```

## Herramientas Disponibles

El agente incluye las siguientes herramientas clínicas, disponibles según el rol de usuario:

1. **sugerir_diagnostico_clinico**: Sugiere posibles diagnósticos basados en síntomas y antecedentes.
   - Disponible para: `health_professional`

2. **evaluar_riesgo_legal**: Evalúa riesgos legales del tratamiento propuesto.
   - Disponible para: `health_professional`, `admin_staff`

3. **recordar_visitas_anteriores**: Recupera información de visitas anteriores del paciente.
   - Disponible para: `health_professional`, `patient`, `admin_staff`

## Pruebas

Para probar el comportamiento del agente con los diferentes roles:

```bash
# Ejecutar todas las pruebas
python test_mcp.py
```

## Personalización Avanzada

Es posible personalizar aún más el comportamiento del agente mediante configuraciones adicionales:

```python
# Configuración personalizada
config_personalizada = {
    "max_iteraciones": 3,
    "herramientas_permitidas": ["recordar_visitas_anteriores"],
    "formato_respuesta": "simplificado"
}

# Crear agente con configuración personalizada
from mcp.context import MCPContext
from mcp.agent_factory import create_agent_by_role

contexto = MCPContext(
    paciente_id="P001",
    paciente_nombre="Juan Pérez",
    visita_id="V20250508-001",
    profesional_email="ejemplo@clinica.com",
    motivo_consulta="Dolor lumbar",
    user_role="health_professional"
)

# Aplicar configuración personalizada
agente = create_agent_by_role(contexto, config_personalizada)
```

## Migración a Langraph

Esta implementación está diseñada para facilitar la migración a Langraph en el futuro, manteniendo la arquitectura por roles.

### Futuro Grafo de Componentes con Roles

```python
# Código futuro con Langraph (ejemplo conceptual)
from langraph.graph import Graph, END
from langchain_openai import ChatOpenAI

def create_graph_by_role(role: str) -> Graph:
    """Crea un grafo adaptado al rol de usuario"""
    
    # Herramientas disponibles según rol
    if role == "health_professional":
        tools = ["sugerir_diagnostico_clinico", "evaluar_riesgo_legal", "recordar_visitas_anteriores"]
    elif role == "patient":
        tools = ["recordar_visitas_anteriores"]
    elif role == "admin_staff":
        tools = ["recordar_visitas_anteriores", "evaluar_riesgo_legal"]
    else:
        raise ValueError(f"Rol no válido: {role}")
    
    # Crear grafo
    graph = Graph()
    
    # Configurar nodos según rol
    # ...
    
    return graph.compile()
```

## Licencia

Este módulo es parte del sistema AiDuxCare. Todos los derechos reservados.

## Sistema de Memoria Adaptativa

AiDuxCare v1.17 incorpora un sistema de memoria contextual adaptativa que optimiza el uso de tokens en las consultas a los modelos de IA según el rol del usuario.

### Conceptos Clave

1. **Bloques de Conversación**

Los mensajes de conversación se almacenan como bloques estructurados:

```python
{
  "actor": "patient",  # o professional, companion, system
  "priority": "high",  # o medium, low
  "text": "Me duele mucho la pierna desde hace días",
  "tokens_estimados": 15
}
```

2. **Memoria a Corto y Largo Plazo**

- **Memoria a corto plazo**: Mantiene los bloques de la conversación actual
- **Memoria a largo plazo**: Archiva bloques importantes para referencia futura (solo disponible para roles específicos)

3. **Filtrado Inteligente**

El sistema filtra automáticamente los bloques por:
- Prioridad (alta, media, baja)
- Relevancia para el rol de usuario
- Límite de tokens (configurable)

### Configuración por Rol

| Rol | Memoria Larga | Bloques Corto | Bloques Largo | Umbral Prioridad |
|-----|:-------------:|:-------------:|:-------------:|:----------------:|
| Health Professional | ✅ | 20 | 100 | low |
| Patient | ❌ | 10 | 0 | medium |
| Admin Staff | ✅ | 15 | 50 | medium |

### Optimización de Tokens

El sistema está diseñado para:
- Mantener el contexto relevante bajo 300 tokens por defecto
- Priorizar mensajes críticos o médicamente relevantes
- Filtrar frases triviales o redundantes
- Conservar trazabilidad completa para auditoría

### Uso

```python
# Crear un contexto con memoria
contexto = MCPContext(
    paciente_id="P001",
    paciente_nombre="Juan Pérez",
    visita_id="V001",
    profesional_email="medico@aiduxcare.com",
    motivo_consulta="Dolor lumbar",
    user_role="health_professional"
)

# Añadir un bloque de conversación
contexto.agregar_bloque_conversacion(
    actor="patient",
    texto="Me duele mucho la pierna desde hace días",
    prioridad="high"
)

# Obtener bloques relevantes para el prompt
bloques_relevantes = contexto.filter_relevant_blocks(max_tokens=300)
```

### Integración con Langraph

La arquitectura de memoria está diseñada para facilitar la migración a Langraph:

1. Los bloques de memoria pueden transformarse directamente en nodos
2. El filtrado inteligente puede implementarse como un edge con transformación
3. La lógica de priorización es independiente del modelo de agente 