#!/usr/bin/env python3
"""
Script para iniciar el servidor MCP.

Este script inicia el servidor MCP utilizando uvicorn.
Uso: python run.py [--host HOST] [--port PORT] [--reload]
"""

import argparse
import os
import sys
import uvicorn

def main():
    """Función principal para iniciar el servidor MCP."""
    parser = argparse.ArgumentParser(description="Iniciar servidor MCP")
    
    parser.add_argument(
        "--host",
        type=str,
        default="0.0.0.0",
        help="Host donde escuchará el servidor (por defecto: 0.0.0.0)"
    )
    
    parser.add_argument(
        "--port",
        type=int,
        default=8000,
        help="Puerto donde escuchará el servidor (por defecto: 8000)"
    )
    
    parser.add_argument(
        "--reload",
        action="store_true",
        help="Activar auto-recarga en cambios (para desarrollo)"
    )
    
    parser.add_argument(
        "--debug",
        action="store_true",
        help="Activar modo debug"
    )
    
    args = parser.parse_args()
    
    if args.debug:
        os.environ["DEBUG"] = "true"
    
    # Configuración de uvicorn
    uvicorn_config = {
        "app": "app.main:app",
        "host": args.host,
        "port": args.port,
        "reload": args.reload,
        "log_level": "debug" if args.debug else "info"
    }
    
    print(f"Iniciando servidor MCP en http://{args.host}:{args.port}")
    print(f"Para acceder a la documentación, visita http://{args.host}:{args.port}/docs")
    print(f"Auto-recarga: {'Activada' if args.reload else 'Desactivada'}")
    print(f"Modo debug: {'Activado' if args.debug else 'Desactivado'}")
    
    # Iniciar servidor
    uvicorn.run(**uvicorn_config)

if __name__ == "__main__":
    main() 