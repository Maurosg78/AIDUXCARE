#!/usr/bin/env python
"""
Servidor FastAPI independiente para el endpoint /mcp/entries.

Este script crea un servidor FastAPI mínimo y autónomo
para probar el endpoint GET /mcp/entries.
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, Optional, List
from datetime import datetime
import uvicorn
import os
import json

# Activar modo de datos mock
os.environ["MOCK_EMR_DATA"] = "TRUE"

# Datos de prueba
MOCK_ENTRIES = [
    {
        "id": "entry1",
        "visit_id": "VIS001",
        "field": "anamnesis",
        "content": "Paciente presenta cefalea desde hace 3 días.",
        "role": "health_professional",
        "timestamp": "2023-05-15T10:30:00Z",
        "source": "mcp",
        "validated": True
    },
    {
        "id": "entry2",
        "visit_id": "VIS001",
        "field": "exploracion",
        "content": "No se observan alteraciones significativas.",
        "role": "health_professional",
        "timestamp": "2023-05-15T10:35:00Z",
        "source": "mcp",
        "validated": True
    },
    {
        "id": "entry3",
        "visit_id": "VIS001",
        "field": "diagnostico",
        "content": "Cefalea tensional.",
        "role": "health_professional",
        "timestamp": "2023-05-15T10:40:00Z",
        "source": "mcp",
        "validated": True
    },
    {
        "id": "entry4",
        "visit_id": "VIS001",
        "field": "anamnesis",
        "content": "Actualización de anamnesis: refiere episodios similares en el pasado.",
        "role": "patient",
        "timestamp": "2023-05-15T11:00:00Z",
        "source": "mcp",
        "validated": True
    }
]

# Crear app
app = FastAPI(
    title="MCP Entries Server",
    description="Servidor de prueba para el endpoint /mcp/entries",
    version="v1.24.0"
)

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/mcp/entries")
async def get_emr_entries(
    visit_id: str = Query(..., description="ID de la visita médica"),
    field: Optional[str] = Query(None, description="Campo específico a consultar"),
    role: Optional[str] = Query(None, description="Rol del creador a filtrar")
) -> Dict[str, Any]:
    """
    Consulta las entradas clínicas almacenadas para una visita.
    
    Este endpoint permite recuperar las entradas clínicas almacenadas
    para una visita específica, con filtros opcionales.
    """
    print(f"Solicitud recibida: visit_id={visit_id}, field={field}, role={role}")
    
    # Comprobar si la visita existe
    if visit_id != "VIS001":
        raise HTTPException(
            status_code=404,
            detail={
                "success": False,
                "error": f"La visita {visit_id} no existe",
                "error_type": "NotFoundError",
                "timestamp": datetime.now().isoformat()
            }
        )
    
    # Filtrar datos
    filtered_entries = list(MOCK_ENTRIES)
    if field:
        filtered_entries = [e for e in filtered_entries if e["field"] == field]
    if role:
        filtered_entries = [e for e in filtered_entries if e["role"] == role]
    
    # Crear respuesta
    filters = {"visit_id": visit_id}
    if field:
        filters["field"] = field
    if role:
        filters["role"] = role
    
    return {
        "visit_id": visit_id,
        "entries": filtered_entries,
        "count": len(filtered_entries),
        "filters": filters,
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/health")
async def health_check() -> Dict[str, Any]:
    """
    Endpoint de verificación de salud.
    """
    return {
        "status": "ok",
        "version": "v1.24.0",
        "service": "MCP Entries Test Server",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/")
async def root() -> Dict[str, Any]:
    """
    Ruta raíz del API.
    """
    return {
        "message": "Servidor de prueba para el endpoint /mcp/entries",
        "documentation": "/docs",
        "health": "/api/health"
    }

if __name__ == "__main__":
    # Puerto de ejecución (por defecto 8090)
    port = int(os.environ.get("PORT", "8090"))
    
    print(f"Iniciando servidor para pruebas del endpoint /mcp/entries en puerto {port}...")
    uvicorn.run(
        "test_entries_server:app",
        host="0.0.0.0",
        port=port,
        reload=True
    ) 