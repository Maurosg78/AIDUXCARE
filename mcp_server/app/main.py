"""
Punto de entrada principal para el microservicio MCP.

Este módulo configura la aplicación FastAPI, incluyendo:
- Middleware CORS
- Rutas API
- Documentación automática
- Gestión de errores
"""

import time
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

from app.api.routes import router as api_router
from app.core.config import settings
from app.core.utils import setup_logging, logger, create_error_response

# Configurar logging
setup_logging(debug_mode=settings.DEBUG)

# Crear aplicación FastAPI
app = FastAPI(
    title=settings.APP_NAME,
    description="Microservicio para el Modelo de Contexto Predictivo (MCP) de AiDuxCare",
    version=settings.API_VERSION,
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configurar middleware CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Middleware para logging de solicitudes
@app.middleware("http")
async def log_requests(request: Request, call_next):
    """
    Middleware para logging de tiempos de respuesta y errores.
    """
    start_time = time.time()
    
    # Registrar solicitud
    logger.info(f"Solicitud iniciada: {request.method} {request.url.path}")
    
    try:
        # Procesar solicitud
        response = await call_next(request)
        
        # Registrar tiempo de respuesta
        process_time = time.time() - start_time
        logger.info(f"Solicitud completada: {request.method} {request.url.path} - " 
                   f"Tiempo: {process_time:.3f}s - Estado: {response.status_code}")
        
        return response
    
    except Exception as e:
        # Registrar error
        process_time = time.time() - start_time
        logger.error(f"Error en solicitud: {request.method} {request.url.path} - "
                    f"Tiempo: {process_time:.3f}s - Error: {str(e)}")
        
        # Devolver respuesta de error
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content=create_error_response(
                message="Error interno del servidor",
                status_code=500,
                details={"error": str(e)}
            )
        )

# Manejador de errores de validación
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """
    Manejador personalizado para errores de validación.
    """
    logger.warning(f"Error de validación: {str(exc)}")
    
    return JSONResponse(
        status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
        content=create_error_response(
            message="Error de validación en los datos de entrada",
            status_code=422,
            details={"errors": exc.errors()}
        )
    )

# Incluir rutas API
app.include_router(api_router, prefix=settings.API_PREFIX)

@app.get("/")
async def root():
    """
    Ruta raíz que redirige a la documentación.
    """
    return {
        "message": f"Bienvenido al servidor MCP v{settings.API_VERSION}",
        "documentation": "/docs",
        "health": f"{settings.API_PREFIX}/health"
    }

# Evento de inicio
@app.on_event("startup")
async def startup_event():
    """
    Evento ejecutado al iniciar la aplicación.
    """
    logger.info(f"Iniciando servidor MCP v{settings.API_VERSION}")
    logger.info(f"Modo DEBUG: {settings.DEBUG}")
    logger.info(f"Modelo LLM: {settings.LLM_MODEL}")
    logger.info(f"CORS habilitado para: {settings.CORS_ORIGINS}")

# Evento de apagado
@app.on_event("shutdown")
async def shutdown_event():
    """
    Evento ejecutado al detener la aplicación.
    """
    logger.info("Deteniendo servidor MCP")

# Si se ejecuta directamente, iniciar con uvicorn
if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True) 