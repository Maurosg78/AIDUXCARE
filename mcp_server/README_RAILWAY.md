# Despliegue de AiDuxCare MCP v1.29.0 en Railway

Este documento contiene las instrucciones para desplegar el microservicio MCP (Model Context Protocol) de AiDuxCare v1.29.0 en la plataforma Railway.

## Estructura del Proyecto

La estructura del proyecto para el despliegue debe ser la siguiente:

```
AIDUXCARE/
├── railway.json         # Archivo principal de configuración
├── nixpacks.toml        # Configuración específica para Nixpacks
├── mcp_server/
│   ├── app/
│   ├── api/
│   ├── core/
│   ├── schemas/
│   ├── services/
│   ├── tests/
│   ├── main.py
│   ├── requirements.txt
│   └── Procfile
├── README.md
└── .git
```

## Archivos Clave para el Despliegue

### railway.json (en la raíz del proyecto)

Este archivo indica a Railway cómo construir y ejecutar la aplicación:

```json
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "cd mcp_server && pip install -r requirements.txt",
    "startCommand": "cd mcp_server && python main.py"
  }
}
```

### nixpacks.toml (en la raíz del proyecto)

```toml
[phases.setup]
nixPkgs = ["python311"]

[phases.install]
cmds = ["cd mcp_server && pip install -r requirements.txt"]

[start]
cmd = "cd mcp_server && python main.py"
```

### Procfile (en mcp_server/)

```
web: python main.py
```

### requirements.txt

Contiene todas las dependencias necesarias para el funcionamiento del microservicio, incluyendo:
- FastAPI
- Langchain
- Langfuse
- Supabase
- Anthropic (Claude)

## Variables de Entorno en Railway

Las siguientes variables de entorno deben configurarse en el panel de Railway:

```
# === SUPABASE ===
SUPABASE_URL=https://<TU_DOMINIO_SUPABASE>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=sk_<TU_CLAVE_REAL>

# === ANTHROPIC ===
ANTHROPIC_API_KEY=sk-ant-api03-...
MODEL_PROVIDER=anthropic
DEFAULT_MODEL=claude-3-sonnet-20240229

# === LANGFUSE ===
LANGFUSE_PUBLIC_KEY=pk-lf-...
LANGFUSE_SECRET_KEY=sk-lf-...
LANGFUSE_HOST=https://cloud.langfuse.com

# === MCP SERVER ===
PORT=8001
ENABLE_TRACE=true
DEBUG=false
ENVIRONMENT=production
LOG_LEVEL=INFO
```

## Pasos para el Despliegue

1. **Verificación Local**
   ```bash
   cd mcp_server
   python main.py
   ```
   Visitar http://localhost:8001/api/health para confirmar que todo funciona correctamente.

2. **Subir a GitHub**
   ```bash
   git add .
   git commit -m "fix: estructura limpia para despliegue en Railway"
   git push origin main
   ```

3. **Despliegue en Railway**
   - Acceder a https://railway.app
   - Crear un New Project > Deploy from GitHub
   - Seleccionar el repositorio de AiDuxCare
   - Railway detectará automáticamente el archivo railway.json
   - Configurar las variables de entorno en Settings > Variables
   - En unos minutos, la aplicación estará disponible en la URL proporcionada por Railway

4. **Verificación del Despliegue**
   - Visitar https://<nombre-del-proyecto>.up.railway.app/api/health
   - Comprobar que la respuesta indica que el servicio está funcionando correctamente

## Solución de Problemas

Si encuentras problemas durante el despliegue:

1. **Revisar los logs en Railway** para identificar errores específicos
2. **Verificar las variables de entorno** estén correctamente configuradas
3. **Comprobar la conectividad** con Supabase, Anthropic y Langfuse

## Mantenimiento y Monitoreo

Railway proporciona herramientas para monitorear el estado de la aplicación y ver los logs en tiempo real. Se recomienda:

1. Configurar alertas para errores y problemas de rendimiento
2. Revisar regularmente los logs para detectar posibles problemas
3. Utilizar Langfuse para monitorear el rendimiento y uso del modelo LLM

---

Para más detalles sobre la implementación del MCP, consultar el archivo `README.md` principal del proyecto. 