#!/usr/bin/env python
"""
Servidor FastAPI independiente para el endpoint /api/mcp/entries.

Este script crea un servidor FastAPI mínimo y autónomo que simula
el comportamiento del endpoint GET /api/mcp/entries.
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, Optional, List
from datetime import datetime
import uvicorn

# Crear aplicación
app = FastAPI(title="MCP Server Minimal")

# Configurar CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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

@app.get("/")
async def root():
    """Ruta raíz."""
    return {
        "message": "Servidor MCP Minimal",
        "docs": "/docs",
        "status": "running"
    }

@app.get("/api/mcp/entries")
async def get_emr_entries(
    visit_id: str = Query(..., description="ID de la visita médica"),
    field: Optional[str] = Query(None, description="Campo específico a consultar"),
    role: Optional[str] = Query(None, description="Rol del creador a filtrar")
):
    """
    Simulación del endpoint GET /api/mcp/entries.
    
    Este endpoint devuelve entradas EMR simuladas para pruebas.
    """
    print(f"Solicitud recibida: visit_id={visit_id}, field={field}, role={role}")
    
    # Detectar visita inexistente
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
    
    # Filtrar entradas
    filtered_entries = list(MOCK_ENTRIES)
    if field:
        filtered_entries = [e for e in filtered_entries if e["field"] == field]
    if role:
        filtered_entries = [e for e in filtered_entries if e["role"] == role]
    
    # Construir respuesta
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
async def health_check():
    """Endpoint de verificación de salud."""
    return {
        "status": "ok",
        "version": "v1.24.0",
        "timestamp": datetime.now().isoformat()
    }

if __name__ == "__main__":
    # Iniciar servidor
    print("Iniciando servidor MCP Minimal en 0.0.0.0:8001...")
    uvicorn.run(
        "app:app",
        host="0.0.0.0",
        port=8001,
        reload=True
    ) 