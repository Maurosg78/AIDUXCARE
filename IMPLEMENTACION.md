# Implementación de Roles de Usuario en MCP - AiDuxCare v1.17

Este documento detalla la implementación de la fase 2 de la versión 1.17 de AiDuxCare, que consiste en modularizar el comportamiento del agente MCP según el tipo de usuario.

## Cambios Realizados

### 1. Actualización de `MCPContext` (mcp/context.py)

- Se añadió el atributo `user_role` al contexto, con tres valores posibles: `"health_professional"`, `"patient"` o `"admin_staff"`.
- El rol se puede especificar en el constructor y se incluye en los eventos y metadatos generados.
- Se actualizan todos los métodos relevantes para considerar el rol de usuario.
- Se añadió compatibilidad con la serialización/deserialización JSON para incluir el rol.

### 2. Modificación de `MCPAgent` (mcp/agent_mcp.py)

- Se añadió el atributo `config` para almacenar configuraciones específicas del rol.
- Se modificó el método `_seleccionar_herramientas` para filtrar herramientas según permisos del rol.
- Se adaptó el método `_decidir_siguiente_paso` para tomar decisiones específicas según el rol.
- Se personalizó el método `_generar_respuesta_final` para generar respuestas adaptadas al tipo de usuario.

### 3. Creación de `agent_factory.py`

Se creó un nuevo archivo `mcp/agent_factory.py` con:

- `create_agent_by_role`: Función principal que crea agentes según el rol definido en el contexto.
- Funciones específicas para cada rol:
  - `crear_agente_profesional_salud`
  - `crear_agente_paciente`
  - `crear_agente_administrativo`

### 4. Actualización de `test_mcp.py`

- Se reemplazó la prueba única por pruebas específicas para cada rol.
- Se añadieron pruebas para mostrar las diferencias de comportamiento entre roles.
- Se incluyó una prueba para verificar la creación directa de agentes con diferentes roles.

### 5. Actualización de `README.md`

- Se documentó la nueva arquitectura por roles.
- Se incluyeron ejemplos de uso para cada rol.
- Se actualizó la sección de migración a Langraph para incluir consideraciones de roles.

## Configuraciones por Rol

### health_professional
- Acceso a todas las herramientas clínicas
- Respuestas técnicas y detalladas
- Máximo de 5 iteraciones de razonamiento

### patient
- Acceso limitado a historial de visitas
- Lenguaje simplificado sin términos técnicos
- Máximo de 3 iteraciones de razonamiento

### admin_staff
- Acceso a historial y evaluación de riesgo legal
- Enfoque en aspectos administrativos
- Máximo de 4 iteraciones de razonamiento

## Cómo Probar los Cambios

### 1. Verificar la Instalación

Asegúrate de tener todos los archivos necesarios:
- `mcp/context.py` (modificado)
- `mcp/agent_mcp.py` (modificado)
- `mcp/agent_factory.py` (nuevo)
- `mcp/tools.py` (sin cambios)
- `test_mcp.py` (modificado)

### 2. Ejecutar Pruebas

```bash
# Ejecutar todas las pruebas
python test_mcp.py

# Ejecutar prueba simplificada
python test_mcp_simple.py
```

### 3. Comprobar Diferencias de Comportamiento

Las diferencias principales que deberías observar son:

- **Profesional de salud:** Acceso a todas las herramientas y respuestas técnicas detalladas
- **Paciente:** Lenguaje simplificado, sin información técnica ni de riesgo legal
- **Administrativo:** Enfoque en aspectos de gestión, sin diagnósticos clínicos

### 4. Ejemplo de Integración

```python
from mcp.context import MCPContext
from mcp.agent_factory import crear_agente_paciente

# Crear contexto para un paciente
contexto = MCPContext(
    paciente_id="P001",
    paciente_nombre="Juan Pérez",
    visita_id="V20250508-001",
    profesional_email="contacto@clinica.com",
    motivo_consulta="Dolor lumbar",
    user_role="patient"  # Especificar rol aquí
)

# Crear agente específico para paciente
agente = crear_agente_paciente(contexto)

# Procesar mensaje
respuesta = agente.procesar_mensaje("¿Qué indican mis últimas consultas?")
print(respuesta)
```

## Notas de Implementación

- La solución mantiene compatibilidad con versiones anteriores.
- El diseño facilita la migración futura a Langraph.
- La arquitectura por roles permite personalizar fácilmente el comportamiento sin cambiar el núcleo de la implementación.

## Próximos Pasos

1. Añadir más herramientas específicas para cada rol
2. Implementar pruebas unitarias automatizadas
3. Refinar las respuestas según feedback de usuarios reales
4. Integrar con la interfaz web de AiDuxCare 