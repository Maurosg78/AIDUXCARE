#!/usr/bin/env python
"""
Servidor de prueba simple para verificar que FastAPI funciona correctamente.
"""

import uvicorn
from fastapi import FastAPI, Query, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict, Any, Optional
from datetime import datetime

# Crear aplicación simple
app = FastAPI(title="Test API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

@app.get("/")
async def root():
    return {"message": "Hello World"}

@app.get("/api/test")
async def test_endpoint():
    """Endpoint de prueba simple."""
    return {
        "status": "ok",
        "message": "El servidor está funcionando correctamente",
        "timestamp": datetime.now().isoformat()
    }

@app.get("/api/mcp/entries")
async def test_entries(
    visit_id: str = Query(..., description="ID de la visita médica"),
    field: Optional[str] = Query(None, description="Campo específico a consultar"),
    role: Optional[str] = Query(None, description="Rol del creador a filtrar")
):
    """Simulación del endpoint /mcp/entries."""
    # Datos de prueba
    mock_entries = [
        {
            "id": "mock1",
            "visit_id": visit_id,
            "field": "anamnesis",
            "content": "Paciente refiere dolor de cabeza persistente desde hace 3 días.",
            "role": "health_professional",
            "timestamp": datetime.now().isoformat(),
            "source": "mcp",
            "validated": True
        }
    ]
    
    # Filtrar según parámetros
    filtered_entries = mock_entries
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

if __name__ == "__main__":
    # Iniciar servidor
    uvicorn.run(
        "test_simple_app:app",
        host="0.0.0.0",
        port=8080,
        reload=True
    ) 