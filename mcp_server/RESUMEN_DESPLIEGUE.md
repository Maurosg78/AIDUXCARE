# Resumen: Despliegue de AiDuxCare MCP v1.29.0 en Railway

## Requisitos Previos
- Cuenta en [Railway](https://railway.app/)
- Cuenta en [Supabase](https://supabase.com/) con base de datos configurada
- Cuenta en [Anthropic](https://www.anthropic.com/) para acceso a Claude
- Cuenta en [Langfuse](https://langfuse.com/) para trazabilidad

## Archivos Clave (en mcp_server/)
- ✅ `railway.json` - Configuración para Railway
- ✅ `main.py` - Punto de entrada de la aplicación
- ✅ `requirements.txt` - Dependencias del proyecto

## Pasos para el Despliegue

### 1. Preparar el Código
- ✅ Verificar que `railway.json` contiene la configuración correcta:
  ```json
  {
    "build": {
      "rootDir": "mcp_server",
      "buildCommand": "pip install -r requirements.txt",
      "startCommand": "python main.py"
    }
  }
  ```
- ✅ Verificar que `main.py` está actualizado a v1.29.0 y usa Claude
- ✅ Comprobar que `requirements.txt` contiene todas las dependencias

### 2. Verificación Local
```bash
cd mcp_server
python main.py
```
Visitar http://localhost:8001/api/health

### 3. Subir a GitHub
```bash
git add .
git commit -m "fix: estructura limpia para despliegue en Railway"
git push origin main
```

### 4. Despliegue en Railway
1. Ir a [Railway](https://railway.app/) y crear un nuevo proyecto
2. Seleccionar "Deploy from GitHub"
3. Elegir el repositorio de AiDuxCare
4. Railway detectará automáticamente `railway.json`

### 5. Configurar Variables de Entorno
En el panel de Railway, ir a Settings > Variables:

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

### 6. Verificar Despliegue
Visitar https://<nombre-del-proyecto>.up.railway.app/api/health

## Solución de Problemas
- Verificar logs en Railway
- Comprobar variables de entorno
- Ejecutar `python verify_deployment.py` para diagnóstico

## Notas Adicionales
- Railway asignará un dominio automáticamente
- El servicio se escala automáticamente según la demanda
- Los logs están disponibles en el panel de Railway
- Langfuse permitirá monitorear el uso del modelo LLM 