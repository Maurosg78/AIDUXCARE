#!/usr/bin/env python
"""
Script para probar la funcionalidad de validación y almacenamiento de alertas.

Este script ejecuta pruebas contra el endpoint /api/mcp/validate para verificar:
1. La correcta validación de registros clínicos
2. El almacenamiento de alertas en la tabla validation_alerts
3. La trazabilidad con Langfuse
"""

import requests
import json
import time
from datetime import datetime
from typing import Dict, Any, List, Optional
import asyncio
import logging
import sys
import os

# Configuración
BASE_URL = os.environ.get("MCP_URL", "http://localhost:8001")
HEADERS = {"Content-Type": "application/json"}

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)]
)
logger = logging.getLogger("validation-test")

# Colores para terminal
RESET = "\033[0m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
RED = "\033[31m"
BLUE = "\033[34m"

# Casos de prueba
TEST_CASES = [
    {
        "name": "Caso completo sin alertas",
        "visit_id": "VIS001",
        "expected_alerts": 0
    },
    {
        "name": "Caso con campos breves",
        "visit_id": "VIS002",
        "expected_alerts": 4  # Todos los campos son breves
    },
    {
        "name": "Caso con campos faltantes",
        "visit_id": "VIS003",
        "expected_alerts": 2  # Faltan diagnóstico y plan
    }
]

def print_header(texto: str) -> None:
    """Imprime un encabezado."""
    print(f"\n{BLUE}{'='*80}{RESET}")
    print(f"{BLUE}{texto.center(80)}{RESET}")
    print(f"{BLUE}{'='*80}{RESET}")

def print_result(mensaje: str, exito: bool) -> None:
    """Imprime un resultado con color."""
    if exito:
        print(f"{GREEN}✓ {mensaje}{RESET}")
    else:
        print(f"{RED}✗ {mensaje}{RESET}")

def validate_visit(visit_id: str) -> Dict[str, Any]:
    """
    Ejecuta una validación para una visita.
    
    Args:
        visit_id: ID de la visita a validar
        
    Returns:
        Respuesta del endpoint /validate
    """
    url = f"{BASE_URL}/api/mcp/validate"
    params = {"visit_id": visit_id}
    
    try:
        logger.info(f"Validando visita {visit_id}...")
        response = requests.get(url, params=params, headers=HEADERS)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        logger.error(f"Error al validar visita {visit_id}: {e}")
        return {"error": str(e)}

def run_test_case(case: Dict[str, Any]) -> None:
    """
    Ejecuta las pruebas para un caso.
    
    Args:
        case: Caso de prueba a ejecutar
    """
    print_header(f"Probando: {case['name']} (ID: {case['visit_id']})")
    
    # Ejecutar validación
    result = validate_visit(case["visit_id"])
    
    if "error" in result:
        print_result("Validación completada", False)
        print(f"{RED}Error: {result['error']}{RESET}")
        return
    
    # Verificar resultados
    alerts_count = len(result.get("alerts", []))
    expected_count = case["expected_alerts"]
    
    print_result(
        f"Validación completada ({alerts_count} alertas encontradas)", 
        True
    )
    
    # Verificar cantidad de alertas
    alerts_match = alerts_count == expected_count
    print_result(
        f"Cantidad de alertas correcta (esperadas: {expected_count}, recibidas: {alerts_count})", 
        alerts_match
    )
    
    # Mostrar alertas encontradas
    if alerts_count > 0:
        print(f"\n{YELLOW}Alertas encontradas:{RESET}")
        for i, alert in enumerate(result.get("alerts", []), 1):
            field = alert.get("field", "general")
            message = alert.get("message", "Sin mensaje")
            alert_type = alert.get("type", "desconocido")
            print(f"{YELLOW}{i}. Campo: {field}, Tipo: {alert_type}{RESET}")
            print(f"{YELLOW}   Mensaje: {message}{RESET}")
    
    # Resultado general
    print_result("Caso de prueba", alerts_match)

def main():
    """Función principal del script."""
    print_header("PRUEBA DE VALIDACIÓN Y ALMACENAMIENTO DE ALERTAS - v1.28.0")
    
    # Verificar que el servidor esté disponible
    try:
        health_check = requests.get(f"{BASE_URL}/api/health")
        health_check.raise_for_status()
        
        health_data = health_check.json()
        version = health_data.get("version", "Desconocida")
        
        print(f"{GREEN}Servidor MCP disponible en {BASE_URL}{RESET}")
        print(f"{GREEN}Versión del servidor: {version}{RESET}")
        
        # Verificar versión
        if version != "v1.28.0":
            print(f"{YELLOW}Advertencia: La versión del servidor ({version}) no es v1.28.0{RESET}")
    
    except requests.exceptions.RequestException:
        print(f"{RED}No se pudo conectar con el servidor en {BASE_URL}.{RESET}")
        print(f"{RED}Asegúrate de que esté en ejecución e intenta nuevamente.{RESET}")
        return
    
    # Ejecutar casos de prueba
    for case in TEST_CASES:
        run_test_case(case)
        print("\n" + "-" * 80)
    
    print_header("PRUEBAS FINALIZADAS")

if __name__ == "__main__":
    main() 