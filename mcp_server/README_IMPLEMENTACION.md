# MCP FastAPI Server - AiDuxCare v1.20.1

Este repositorio contiene la implementación del microservicio FastAPI para el MCP (Model Context Protocol) de AiDuxCare, diseñado para conectar el frontend React con el sistema de Contexto Predictivo basado en Langraph.

## Estructura del proyecto

```
mcp_server/
│
├── app/                       # Módulo principal de la aplicación
│   ├── api/                   # API endpoints
│   │   ├── __init__.py
│   │   └── routes.py          # Definición de rutas
│   │
│   ├── core/                  # Componentes centrales
│   │   ├── __init__.py
│   │   ├── config.py          # Configuraciones
│   │   └── utils.py           # Utilidades
│   │
│   ├── langraph/              # Integración con Langraph
│   │   ├── __init__.py
│   │   ├── langraph_mcp.py    # Wrapper para langraph_mcp
│   │   └── processor.py       # Procesador de solicitudes
│   │
│   ├── schemas/               # Modelos de datos
│   │   ├── __init__.py
│   │   └── request.py         # Esquemas de solicitudes/respuestas
│   │
│   ├── __init__.py
│   └── main.py                # Punto de entrada FastAPI
│
├── tests/                     # Pruebas
│   ├── __init__.py
│   └── test_api.py            # Pruebas de API
│
├── .env                       # Variables de entorno (no incluido en control de versiones)
├── env.example                # Ejemplo de variables de entorno
├── requirements.txt           # Dependencias de Python
├── run.py                     # Script para iniciar el servidor
└── test_server.py             # Servidor de prueba simplificado
```

## Requisitos

- Python 3.11+
- FastAPI
- Uvicorn
- Pydantic
- Langchain y Langgraph
- OpenAI API

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/your-repo/aiduxcare.git
cd aiduxcare/mcp_server
```

2. Crear un entorno virtual e instalar dependencias:
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Configurar variables de entorno:
```bash
cp env.example .env
# Editar .env con tus propias configuraciones
```

## Ejecución

Para ejecutar el servidor en modo desarrollo:

```bash
python run.py --reload --debug
```

O usando uvicorn directamente:

```bash
cd mcp_server
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Para ejecutar el servidor de prueba simplificado (sin dependencias de Langraph):

```bash
cd mcp_server
PORT=8001 python test_server.py
```

## API Endpoints

### POST /api/mcp/respond

Endpoint principal para integración con el frontend. Recibe la consulta del usuario y devuelve una respuesta estructurada.

**Solicitud:**
```json
{
  "visit_id": "VIS001",
  "role": "health_professional",
  "user_input": "El paciente refiere dolor irradiado al brazo derecho",
  "previous_messages": []
}
```

**Respuesta:**
```json
{
  "response": "Basado en los síntomas de dolor que refiere...",
  "conversation_item": {
    "id": "msg_2",
    "timestamp": "2025-05-09T00:29:39.733490",
    "sender_type": "assistant",
    "sender_name": "AiDuxCare MCP",
    "content": "Basado en los síntomas de dolor que refiere...",
    "metadata": {
      "tools_used": ["clinical_evaluation", "treatment_recommendation"],
      "visit_id": "VIS001",
      "confidence": 0.92
    }
  },
  "context_summary": {
    "active_tools": ["clinical_evaluation", "treatment_recommendation"],
    "memory_blocks_count": 3,
    "processing_time_ms": 500.0,
    "user_role": "health_professional"
  },
  "trace": [...]
}
```

### GET /api/health

Endpoint para verificar el estado del servidor.

## Solución de problemas

### Puerto 8000 en uso

Si el puerto 8000 está en uso, puedes especificar un puerto diferente:

```bash
python run.py --port 8001
```

### Error al importar langraph_mcp

El archivo `langraph_mcp.py` está ubicado en la raíz del proyecto. Si hay problemas de importación, verifica:

1. Que exista un archivo `langraph_mcp.py` en la raíz del proyecto
2. Que el archivo `app/langraph/langraph_mcp.py` esté correctamente implementado como wrapper

## Pruebas y validación

Para verificar que el servidor está funcionando correctamente:

```bash
curl -X POST http://localhost:8000/api/mcp/respond \
  -H "Content-Type: application/json" \
  -d '{
    "visit_id": "VIS001",
    "role": "health_professional",
    "user_input": "El paciente refiere dolor irradiado al brazo derecho",
    "previous_messages": []
  }' | jq
```

## Cambios en la versión v1.20.1

- Corrección de problemas de importación en langraph_mcp
- Implementación de servidor de prueba para desarrollo
- Mejoras en validación de solicitudes y respuestas
- Documentación completa para desarrollo y producción 