"""
Servidor principal MCP para AiDuxCare.

Este módulo implementa el servidor FastAPI que expone los endpoints
necesarios para el Model Context Protocol (MCP).
"""

from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import os
import sys
import argparse
from datetime import datetime

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(module)s:%(funcName)s:%(lineno)d - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)

logger = logging.getLogger("mcp-server")

# Crear aplicación FastAPI
app = FastAPI(
    title="MCP Server - AiDuxCare",
    description="Model Context Protocol para AiDuxCare",
    version="v1.29.0"  # Actualizado a la versión 1.29.0
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En producción, especificar los orígenes permitidos
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Importar routers - Con manejo de errores para asegurar que la app inicie
try:
    from api.respond import router as respond_router
    from api.validate import router as validate_router
    from api.store import router as store_router
    from api.entries import router as entries_router
    
    # Registrar routers
    app.include_router(respond_router)
    app.include_router(validate_router)
    app.include_router(store_router)
    app.include_router(entries_router)
    logger.info("Routers cargados correctamente")
except ImportError as e:
    logger.error(f"Error al importar routers: {str(e)}")
    logger.warning("La aplicación continuará funcionando solo con endpoints básicos")

@app.get("/", tags=["general"])
async def root():
    """Endpoint raíz que proporciona información básica sobre el API."""
    return {
        "message": "Bienvenido al servidor MCP v1.29.0",
        "documentation": "/docs",
        "health": "/api/health"
    }

@app.get("/api/health", tags=["general"])
async def health():
    """Endpoint de estado que proporciona información sobre la salud del servicio."""
    
    # Obtener modelo LLM de la configuración
    model_provider = os.environ.get("MODEL_PROVIDER", "anthropic")
    model = os.environ.get("DEFAULT_MODEL", "claude-3-sonnet-20240229")
    if os.environ.get("MOCK_LLM", "FALSE").upper() == "TRUE":
        model += " (simulado)"
    
    return {
        "status": "ok",
        "version": "v1.29.0",
        "service": "MCP Server - AiDuxCare",
        "model_provider": model_provider,
        "model": model
    }

@app.exception_handler(Exception)
async def general_exception_handler(request: Request, exc: Exception):
    """Manejador global de excepciones."""
    logger.error(f"Error no controlado: {str(exc)}")
    
    return JSONResponse(
        status_code=500,
        content={
            "error": "Error interno del servidor",
            "detail": str(exc),
            "timestamp": datetime.now().isoformat()
        }
    )

@app.on_event("startup")
async def startup_event():
    """Evento de inicio del servidor."""
    logger.info("Iniciando servidor MCP v1.29.0")
    logger.info(f"Modo DEBUG: {os.environ.get('DEBUG', 'FALSE')}")
    logger.info(f"Entorno: {os.environ.get('ENVIRONMENT', 'production')}")
    logger.info(f"Proveedor LLM: {os.environ.get('MODEL_PROVIDER', 'anthropic')}")
    logger.info(f"Modelo LLM: {os.environ.get('DEFAULT_MODEL', 'claude-3-sonnet-20240229')}")
    
    cors_origins = os.environ.get(
        "CORS_ORIGINS", 
        "http://localhost:3000,https://aiduxcare.vercel.app"
    ).split(",")
    logger.info(f"CORS habilitado para: {cors_origins}")
    
    # Verificar conexión con servicios externos
    logger.info("Conexión con Supabase configurada")
    if os.environ.get("ENABLE_TRACE", "TRUE").upper() == "TRUE":
        logger.info("Trazabilidad con Langfuse habilitada")
    else:
        logger.info("Trazabilidad con Langfuse deshabilitada")

@app.on_event("shutdown")
async def shutdown_event():
    """Evento de cierre del servidor."""
    logger.info("Deteniendo servidor MCP")

# Para ejecución directa
if __name__ == "__main__":
    import uvicorn
    
    # Parsear argumentos de línea de comandos
    parser = argparse.ArgumentParser(description="Servidor MCP para AiDuxCare")
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", 8001)),
                      help="Puerto en el que se ejecutará la aplicación")
    parser.add_argument("--host", type=str, default="0.0.0.0",
                      help="Host en el que se ejecutará la aplicación")
    parser.add_argument("--reload", action="store_true",
                      help="Activar recarga automática")
    
    args = parser.parse_args()
    
    # Mensaje de inicio
    print(f"Iniciando servidor MCP v1.29.0 en http://{args.host}:{args.port}")
    print("Presiona CTRL+C para detener el servidor")
    
    # Determinar si se debe usar reload
    reload_mode = args.reload or os.environ.get("DEBUG", "FALSE").upper() == "TRUE"
    
    try:
        # Ejecutar servidor
        uvicorn.run(
            "main:app", 
            host=args.host, 
            port=args.port,
            reload=reload_mode
        )
    except Exception as e:
        logger.error(f"Error al iniciar el servidor: {str(e)}")
        sys.exit(1) 