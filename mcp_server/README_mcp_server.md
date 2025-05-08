# Microservicio MCP - AiDuxCare v1.20.0

Microservicio independiente para el MCP (Model Context Protocol) de AiDuxCare, implementado con FastAPI y Langraph.

## Descripción

Este microservicio proporciona un API REST para interactuar con el agente MCP de AiDuxCare, que utiliza Langraph para
implementar un flujo de trabajo basado en grafos para procesamiento de lenguaje natural en el contexto médico.

El servicio está completamente desacoplado del frontend y otros componentes, lo que permite:
- Escalabilidad independiente
- Actualizaciones sin interrupciones
- Pruebas aisladas
- Mayor control sobre los recursos y la configuración

## Arquitectura

```
[Frontend React] ─────────────► [API Supabase] ─────────────► [Microservicio MCP (FastAPI)]
        ▲                                                            ▲
        │                                                            │
[Usuario / Input Audio]                                   [Modelos LLM / Agente Langraph]
```

## Características

- **Endpoint REST para interacción con MCP**: `/api/mcp`
- **Auto-documentación completa**: Swagger UI disponible en `/docs`
- **CORS habilitado**: Para integración con frontend
- **Validación con Pydantic**: Validación robusta de solicitudes y respuestas
- **Trazabilidad**: Registro detallado de cada paso del procesamiento
- **Control de errores**: Manejo estandarizado y descriptivo de errores
- **Herramientas médicas por rol**: Adaptación de herramientas según roles
- **Memoria contextual adaptativa**: Filtrado por rol y prioridad
- **Configuración mediante variables de entorno**

## Requisitos

- Python 3.11+
- FastAPI
- Uvicorn
- Langchain
- Langgraph
- Pydantic

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/yourusername/aiduxcare.git
cd aiduxcare
```

2. Instalar dependencias:
```bash
cd mcp_server
pip install -r requirements.txt
```

3. Configurar variables de entorno:
Crea un archivo `.env` en el directorio `mcp_server/` con la siguiente configuración:
```
DEBUG=false
CORS_ORIGINS=http://localhost:3000,https://aiduxcare.vercel.app
LLM_MODEL=gpt-3.5-turbo
OPENAI_API_KEY=tu_api_key_de_openai
```

## Uso

### Iniciar el servidor:

```bash
cd mcp_server
python run.py
```

Opciones disponibles:
- `--host`: Host donde escuchará el servidor (por defecto: 0.0.0.0)
- `--port`: Puerto donde escuchará el servidor (por defecto: 8000)
- `--reload`: Activar auto-recarga en cambios (desarrollo)
- `--debug`: Activar modo debug

### Acceder a la documentación:

Abrir en el navegador: `http://localhost:8000/docs`

### Ejemplo de petición:

```bash
curl -X POST http://localhost:8000/api/mcp \
     -H "Content-Type: application/json" \
     -d '{
           "visit_id": "VISITA123",
           "role": "health_professional",
           "user_input": "El paciente refiere dolor lumbar al levantar peso"
         }'
```

Respuesta:
```json
{
  "output": "Basado en la descripción, el paciente presenta signos compatibles con lumbalgia mecánica...",
  "used_tools": [
    {
      "tool": "diagnostico",
      "result": "Lumbalgia mecánica: alta probabilidad. Se recomienda valoración física"
    }
  ],
  "trace": [
    {
      "timestamp": "2025-05-10T15:45:22.456123",
      "action": "request_received",
      "metadata": {
        "visit_id": "VISITA123",
        "role": "health_professional",
        "input_length": 53
      }
    },
    ...
  ]
}
```

## Pruebas

Para ejecutar las pruebas:
```bash
cd mcp_server
pytest tests/
```

Para ejecutar pruebas específicas:
```bash
python -m pytest tests/test_api.py -v
```

## Despliegue en producción

### Railway

1. Crear proyecto en Railway
2. Vincular repositorio GitHub
3. Configurar variables de entorno
4. Establecer comando de inicio: `cd mcp_server && python -m uvicorn app.main:app --host 0.0.0.0 --port $PORT`

### Docker

1. Crear Dockerfile:
```Dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY mcp_server/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY langraph_mcp.py .
COPY mcp_server/ .

CMD ["python", "-m", "uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
```

2. Construir imagen:
```bash
docker build -t aiduxcare-mcp:v1.20.0 .
```

3. Ejecutar contenedor:
```bash
docker run -p 8000:8000 --env-file mcp_server/.env aiduxcare-mcp:v1.20.0
```

## Integración con frontend

Para integrar con el frontend React, utiliza Axios o fetch:

```javascript
// Ejemplo con Axios
import axios from 'axios';

const sendMessageToMCP = async (visitId, userInput) => {
  try {
    const response = await axios.post('https://tu-dominio-mcp.railway.app/api/mcp', {
      visit_id: visitId,
      role: 'health_professional',
      user_input: userInput
    });
    
    return response.data.output;
  } catch (error) {
    console.error('Error al comunicarse con MCP:', error);
    throw error;
  }
};
```

## Estructura del proyecto

```
mcp_server/
├── app/
│   ├── __init__.py
│   ├── main.py                 # Punto de entrada FastAPI
│   │   ├── __init__.py
│   │   └── routes.py           # Endpoint principal `/mcp`
│   ├── core/
│   │   ├── __init__.py
│   │   ├── config.py           # Configuración (CORS, settings)
│   │   └── utils.py            # Funciones auxiliares
│   ├── langraph/
│   │   ├── __init__.py
│   │   └── processor.py        # Integración con `langraph_mcp.py`
│   └── schemas/
│       ├── __init__.py
│       └── request.py          # Validación con Pydantic
├── tests/
│   └── test_api.py             # Test del endpoint `/mcp`
├── README_mcp_server.md        # Este archivo
├── requirements.txt            # Dependencias
├── run.py                      # Script para iniciar el servidor
└── .env                        # Variables de entorno (gitignore)
```

## Próximos pasos

- Implementación de autenticación (JWT)
- Integración con bases de datos vectoriales para memoria semántica
- Optimización de rendimiento y escalabilidad
- Monitoreo y alertas
- CI/CD para despliegue automático

## Mantenimiento

Para actualizar el microservicio:

1. Modificar los archivos necesarios
2. Ejecutar pruebas: `pytest tests/`
3. Incrementar versión en `app/core/config.py`
4. Hacer commit y push a repositorio
5. Desplegar nueva versión

## Licencia

Este proyecto es propiedad de AiDuxCare y está protegido por derechos de autor. 