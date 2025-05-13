#!/usr/bin/env python
"""
Script para ejecutar el servidor MCP con todos los endpoints.

Este script inicia un servidor FastAPI que incluye:
- Endpoint de respuesta (/api/mcp/respond)
- Endpoint de almacenamiento (/api/mcp/store)
- Endpoint de validación (/api/mcp/validate)
"""

import os
import logging
import sys
import uvicorn
from fastapi import FastAPI, Request, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
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
    version="v1.29.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Crear router principal
main_router = APIRouter()

# Endpoints principales
@main_router.get("/", tags=["general"])
async def root():
    """Endpoint raíz que proporciona información básica sobre el API."""
    return {
        "message": "Bienvenido al servidor MCP v1.29.0",
        "documentation": "/docs",
        "health": "/api/health"
    }

@main_router.get("/api/health", tags=["general"])
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

# Configurar endpoint de respuesta manual
from core.langraph_runner import run_mcp_graph

@main_router.post("/api/mcp/respond", tags=["respuestas"], summary="Generar respuesta del copiloto clínico")
async def generate_response(request: dict):
    """
    Genera una respuesta del copiloto clínico según la entrada del usuario.
    
    Returns:
        Dict con la respuesta generada y metadatos
    """
    try:
        # Validar campos obligatorios
        required_fields = ["visit_id", "role", "user_input"]
        for field in required_fields:
            if field not in request:
                raise HTTPException(
                    status_code=422,
                    detail=f"Campo obligatorio '{field}' no proporcionado"
                )
        
        # Extraer valores
        visit_id = request["visit_id"]
        role = request["role"]
        user_input = request["user_input"]
        
        # Valores opcionales
        field = request.get("field")
        previous_messages = request.get("previous_messages", [])
        context_override = request.get("context_override", {})
        
        # Log de la solicitud
        logger.info(f"Recibida solicitud para visita: {visit_id}, rol: {role}")
        
        # Generar respuesta usando el grafo MCP
        response_data = await run_mcp_graph(
            visit_id=visit_id,
            role=role,
            user_input=user_input,
            field=field,
            previous_messages=previous_messages,
            context_override=context_override
        )
        
        # Devolver respuesta
        return response_data
    except Exception as e:
        # Manejar otros errores
        logger.error(f"Error al generar respuesta: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=f"Error al procesar la solicitud: {str(e)}"
        )

# Importar routers de otros módulos
from api.validate import router as validate_router
from api.store import router as store_router

# Registrar routers
app.include_router(main_router)
app.include_router(validate_router)
app.include_router(store_router)

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
    # Obtener puerto de variable de entorno o usar 8001 por defecto
    port = int(os.environ.get("PORT", 8001))
    
    # Mensaje de inicio
    print(f"Iniciando servidor MCP v1.29.0 en http://0.0.0.0:{port}")
    print("Presiona CTRL+C para detener el servidor")
    
    # Iniciar servidor
    uvicorn.run(
        "run_app:app", 
        host="0.0.0.0", 
        port=port,
        reload=os.environ.get("DEBUG", "FALSE").upper() == "TRUE"
    ) 