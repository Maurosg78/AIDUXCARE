#!/usr/bin/env python
"""
Script para probar manualmente el endpoint /api/mcp/entries.

Ejecutar desde mcp_server/ con:
    python test_endpoint.py
"""

import requests
import json
import sys
import os
from datetime import datetime


def test_entries_endpoint(base_url="http://localhost:8001", visit_id="VIS001", field=None, role=None):
    """Prueba el endpoint /api/mcp/entries con diferentes parámetros."""
    
    # Construir URL con parámetros
    url = f"{base_url}/api/mcp/entries?visit_id={visit_id}"
    if field:
        url += f"&field={field}"
    if role:
        url += f"&role={role}"
    
    print(f"\n🔍 Probando: {url}")
    
    try:
        # Realizar petición GET
        response = requests.get(url, timeout=10)
        
        # Mostrar resultado
        print(f"📊 Status: {response.status_code}")
        
        # Formatear la respuesta JSON de manera legible
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Éxito: {len(data.get('entries', []))} entradas encontradas")
            print(f"🔹 Filtros aplicados: {data.get('filters', {})}")
            print(f"🕒 Timestamp: {data.get('timestamp', '')}")
            
            # Mostrar entradas con formato
            entries = data.get("entries", [])
            if entries:
                print("\n📝 Entradas:")
                for i, entry in enumerate(entries, 1):
                    print(f"  {i}. Campo: {entry.get('field')} | Rol: {entry.get('role')}")
                    print(f"     Contenido: {entry.get('content')[:80]}...")
            else:
                print("\n📭 No se encontraron entradas para los criterios especificados")
        else:
            print(f"❌ Error {response.status_code}: {response.text}")
            
    except requests.exceptions.ConnectionError:
        print(f"❌ Error de conexión: Asegúrate que el servidor está ejecutándose en {base_url}")
    except Exception as e:
        print(f"❌ Error: {str(e)}")


def main():
    """Función principal para probar el endpoint con diferentes casos."""
    # Determinar URL base
    port = os.environ.get("PORT", "8001")
    base_url = f"http://localhost:{port}"
    
    # Caso 1: Consulta básica con visit_id
    test_entries_endpoint(base_url)
    
    # Caso 2: Consulta con filtro de campo
    test_entries_endpoint(base_url, field="anamnesis")
    
    # Caso 3: Consulta con filtro de rol
    test_entries_endpoint(base_url, role="health_professional")
    
    # Caso 4: Consulta con ambos filtros
    test_entries_endpoint(base_url, field="diagnostico", role="health_professional")
    
    # Caso 5: Consulta para visita inexistente
    test_entries_endpoint(base_url, visit_id="VIS999")
    
    # Caso 6: Consulta para campo que no existe
    test_entries_endpoint(base_url, field="campo_inexistente")


if __name__ == "__main__":
    print("🧪 Prueba del endpoint GET /api/mcp/entries")
    print("==========================================")
    main() 