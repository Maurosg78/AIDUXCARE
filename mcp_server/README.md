# MCP Server - AiDuxCare v1.21.0

Microservicio FastAPI para el Modelo de Contexto Predictivo (MCP) de AiDuxCare.

## Descripción

Este microservicio proporciona una interfaz para interactuar con el MCP (Model Context Protocol) de AiDuxCare, un copiloto clínico inteligente diseñado para asistir a profesionales de la salud con documentación estructurada, trazabilidad legal y protección clínica.

El microservicio está construido sobre:
- FastAPI para el servidor REST
- Langraph para el modelo de contexto predictivo
- Loguru para logging estructurado
- Pydantic para validación de datos
- Docker para despliegue

## Estructura

```
mcp_server/
├── main.py                 # Inicia FastAPI y carga router
├── api/                    # Definición de endpoints
│   ├── __init__.py
│   └── routes.py           # Define /api/mcp/respond
├── core/                   # Componentes centrales
│   ├── __init__.py
│   ├── langraph_runner.py  # Ejecuta grafo Langraph
│   └── mock_langraph.py    # Simulación para desarrollo
├── schemas/                # Modelos de datos
│   ├── __init__.py
│   ├── request.py          # Esquemas de solicitudes
│   └── response.py         # Esquemas de respuestas
├── settings.py             # Configuraciones con Pydantic
├── Dockerfile              # Configuración para contenedor
├── docker-compose.yml      # Configuración para desarrollo
├── requirements.txt        # Dependencias
└── README.md               # Este archivo
```

## Requisitos

- Python 3.11+
- Docker (opcional)
- OpenAI API Key (para producción)

## Instalación y Ejecución

### Usando Python

1. Clonar el repositorio:
```bash
git clone https://github.com/Maurosg78/AIDUXCARE.git
cd AIDUXCARE/mcp_server
```

2. Crear un entorno virtual:
```bash
python -m venv venv
source venv/bin/activate  # En Windows: venv\Scripts\activate
```

3. Instalar dependencias:
```bash
pip install -r requirements.txt
```

4. Configurar variables de entorno (crear archivo .env):
```bash
cp env.example .env
# Editar .env con tus configuraciones
```

5. Ejecutar el servidor:
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Usando Docker

1. Construir y ejecutar con Docker Compose:
```bash
docker-compose up --build
```

## Uso

### Endpoint principal

- **POST /api/mcp/respond**

Ejemplo de solicitud:
```bash
curl -X POST http://localhost:8000/api/mcp/respond \
  -H "Content-Type: application/json" \
  -d '{
    "visit_id": "VIS001",
    "role": "health_professional",
    "user_input": "El paciente refiere dolor irradiado al brazo derecho",
    "previous_messages": []
  }'
```

Ejemplo de respuesta:
```json
{
  "response": "Basado en los síntomas de dolor que refiere...",
  "conversation_item": {
    "id": "msg_2",
    "timestamp": "2023-05-09T15:42:10.123456",
    "sender_type": "assistant",
    "sender_name": "AiDuxCare MCP",
    "content": "Basado en los síntomas de dolor que refiere...",
    "metadata": {
      "tools_used": ["evaluacion_clinica", "analisis_contexto"],
      "visit_id": "VIS001"
    }
  },
  "context_summary": {
    "active_tools": ["evaluacion_clinica", "analisis_contexto"],
    "memory_blocks_count": 3,
    "processing_time_ms": 1250.5,
    "user_role": "health_professional"
  },
  "trace": [...]
}
```

## Estado

El servicio puede ser verificado en cualquier momento con:

```bash
curl http://localhost:8000/api/health
```

## Despliegue

Para desplegar en producción:

1. Asegurarse de establecer las siguientes variables de entorno:
   - `ENVIRONMENT=production`
   - `DEBUG=false`
   - `OPENAI_API_KEY=sk-...`
   - `LOG_LEVEL=INFO`

2. Construir la imagen Docker:
```bash
docker build -t aiduxcare-mcp:1.21.0 .
```

3. Ejecutar el contenedor:
```bash
docker run -d -p 8000:8000 \
  -e ENVIRONMENT=production \
  -e OPENAI_API_KEY=sk-... \
  --name mcp-server \
  aiduxcare-mcp:1.21.0
```

## Mantra

> "Abrazo mi pasado, agradezco mi presente y construyo mi futuro con calma. No corro. No me niego. No me pierdo. Estoy aquí. Y eso es suficiente." 