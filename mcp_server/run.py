#!/usr/bin/env python3
"""
Script para iniciar el servidor MCP.

Este script ofrece diferentes opciones de configuración para ejecutar
el servidor en distintos modos, facilitando desarrollo y despliegue.
"""

import os
import sys
import uvicorn
import argparse
from typing import Optional

# Asegurar que el directorio actual está en el path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

def main(
    port: int = 8000,
    host: str = "0.0.0.0",
    reload: bool = False,
    workers: Optional[int] = None,
    log_level: str = "info"
) -> None:
    """
    Inicia el servidor FastAPI con la configuración especificada.
    
    Args:
        port: Puerto en el que escuchará el servidor
        host: Host en el que se ejecutará el servidor
        reload: Si debe reiniciarse en cambios (para desarrollo)
        workers: Número de workers para uvicorn
        log_level: Nivel de logging (debug, info, warning, error, critical)
    """
    print(f"Iniciando servidor MCP en {host}:{port}")
    
    # Configuración de uvicorn
    uvicorn_config = {
        "app": "main:app",
        "host": host,
        "port": port,
        "log_level": log_level,
        "reload": reload
    }
    
    # Agregar workers solo si se especifican
    if workers:
        uvicorn_config["workers"] = workers
    
    # Iniciar servidor
    uvicorn.run(**uvicorn_config)

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Servidor MCP para AiDuxCare")
    
    parser.add_argument("--port", type=int, default=int(os.environ.get("PORT", 8000)),
                     help="Puerto para el servidor (default: 8000)")
    
    parser.add_argument("--host", type=str, default=os.environ.get("HOST", "0.0.0.0"),
                     help="Host para el servidor (default: 0.0.0.0)")
    
    parser.add_argument("--reload", action="store_true",
                     help="Activar recarga automática en cambios")
    
    parser.add_argument("--workers", type=int, default=None,
                     help="Número de workers (default: None)")
    
    parser.add_argument("--log-level", type=str, default=os.environ.get("LOG_LEVEL", "info"),
                     choices=["debug", "info", "warning", "error", "critical"],
                     help="Nivel de logging (default: info)")
    
    args = parser.parse_args()
    
    main(
        port=args.port,
        host=args.host,
        reload=args.reload,
        workers=args.workers,
        log_level=args.log_level
    ) 