#!/usr/bin/env python
"""
Script para ejecutar casos clínicos simulados contra el servidor MCP.

Este script prueba:
1. POST /api/mcp/respond - Simulando envío de campos
2. POST /api/mcp/store - Guardando la respuesta en Supabase
3. GET /api/mcp/validate - Ejecutando validación automática
"""

import json
import requests
import time
from typing import Dict, Any, List, Optional

# Configuración
BASE_URL = "http://localhost:8001"  # Asegúrate de que el servidor esté en este puerto
HEADERS = {"Content-Type": "application/json"}

# Colores para terminal
RESET = "\033[0m"
GREEN = "\033[32m"
YELLOW = "\033[33m"
RED = "\033[31m"
BLUE = "\033[34m"

# Casos clínicos simulados
casos_clinicos = [
    {
        "nombre": "Dolor lumbar con radiculopatía",
        "visit_id": "VIS001",
        "campos": {
            "anamnesis": "Paciente masculino de 42 años con dolor lumbar irradiado a pierna derecha por trayecto L5. Inicio hace 3 días tras levantar cajas pesadas en mudanza. Dolor 7/10, empeora con movimiento y sedestación prolongada. Niega traumatismo directo. Sin alteraciones esfinterianas. Antecedentes: Sobrepeso (IMC 28), sedentario, trabajador de oficina.",
            "exploracion": "PA 130/85, FC 78, afebril. Postura antiálgica. Limitación flexión lumbar. Lasègue positivo 45° derecha. ROT conservados. No déficit motor. Hipoestesia cara lateral pierna derecha. Pulsos periféricos presentes.",
            "diagnostico": "Lumbociática aguda derecha. Probable hernia discal L4-L5 o L5-S1.",
            "plan": "1. Reposo relativo 48h. 2. Diclofenaco 50mg/8h con protección gástrica. 3. Paracetamol 1g/8h alternando. 4. Metocarbamol 750mg/8h. 5. Aplicación calor local. 6. Reevaluación en 7 días. 7. Solicitud RMN lumbar si no mejoría."
        },
        "expectativas": {
            "respond": True,  # Se espera respuesta exitosa
            "store": True,    # Se espera almacenamiento exitoso
            "validate": {     # No se esperan alertas de validación
                "expect_alerts": False,
                "expected_alerts": []
            }
        }
    },
    {
        "nombre": "Cefalea tensional - texto demasiado breve",
        "visit_id": "VIS002",
        "campos": {
            "anamnesis": "Cefalea desde ayer.",
            "exploracion": "Exploración normal.",
            "diagnostico": "Probable cefalea tensional.",
            "plan": "Paracetamol."
        },
        "expectativas": {
            "respond": True,
            "store": True,
            "validate": {
                "expect_alerts": True,
                "expected_alerts": ["anamnesis_demasiado_breve", "exploracion_demasiado_breve", "plan_demasiado_breve"]
            }
        }
    },
    {
        "nombre": "Infección respiratoria - campos omitidos",
        "visit_id": "VIS003",
        "campos": {
            "anamnesis": "Paciente femenina de 35 años con tos productiva, fiebre de 38.5°C y malestar general desde hace 3 días. Expectoración verdosa. Vacunación COVID-19 completa. No alergias medicamentosas conocidas.",
            "exploracion": "Febril. Orofaringe hiperémica. Auscultación: crepitantes en base pulmonar derecha. SatO2 96%."
            # Diagnóstico omitido intencionalmente
            # Plan omitido intencionalmente
        },
        "expectativas": {
            "respond": True,
            "store": True,
            "validate": {
                "expect_alerts": True,
                "expected_alerts": ["diagnostico_faltante", "plan_faltante"]
            }
        }
    },
    {
        "nombre": "Síndrome coronario agudo - caso completo",
        "visit_id": "VIS004",
        "campos": {
            "anamnesis": "Paciente masculino de 68 años con dolor opresivo retroesternal de inicio súbito hace 2 horas, intensidad 8/10, irradiado a brazo izquierdo y mandíbula, asociado a náuseas y sudoración. Antecedentes: HTA en tratamiento con enalapril, dislipemia, exfumador (20 paq/año), diabetes tipo 2.",
            "exploracion": "PA 160/95, FC 92, FR 20, SatO2 94% basal. Paciente pálido, sudoroso. ACP: taquicárdico, sin soplos, crepitantes bibasales. Abdomen y EEII sin hallazgos.",
            "diagnostico": "Síndrome coronario agudo con elevación del ST (cara inferior). IAM tipo I.",
            "plan": "1. AAS 300mg masticado. 2. Clopidogrel 600mg. 3. Heparina 5000 UI. 4. Morfina 4mg IV. 5. Oxigenoterapia. 6. ECG seriados. 7. Activación código infarto. 8. Traslado urgente a hemodinámica para ICP primaria. 9. Controles enzimáticos seriados."
        },
        "expectativas": {
            "respond": True,
            "store": True,
            "validate": {
                "expect_alerts": False,
                "expected_alerts": []
            }
        }
    },
    {
        "nombre": "Crisis asmática - plan terapéutico insuficiente",
        "visit_id": "VIS005",
        "campos": {
            "anamnesis": "Paciente femenina de 23 años, asmática desde la infancia, acude por disnea progresiva desde hace 12 horas tras exposición a polvo en limpieza doméstica. Usa salbutamol inhalado que no ha sido efectivo en esta ocasión. No fiebre ni expectoración. Último ingreso por asma hace 2 años.",
            "exploracion": "Taquipnea (FR 24), taquicardia (FC 110), SatO2 91% basal. Uso de musculatura accesoria. Sibilancias espiratorias difusas en ambos campos pulmonares. No cianosis.",
            "diagnostico": "Exacerbación asmática moderada-grave",
            "plan": "Salbutamol inhalado."
        },
        "expectativas": {
            "respond": True,
            "store": True,
            "validate": {
                "expect_alerts": True,
                "expected_alerts": ["plan_demasiado_breve"]
            }
        }
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

def call_respond_endpoint(caso: Dict[str, Any], campo: str) -> Dict[str, Any]:
    """Llama al endpoint /api/mcp/respond con los datos del caso y campo."""
    url = f"{BASE_URL}/api/mcp/respond"
    payload = {
        "visit_id": caso["visit_id"],
        "role": "health_professional",
        "user_input": caso["campos"][campo],
        "field": campo
    }
    
    try:
        response = requests.post(url, json=payload, headers=HEADERS)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"{RED}Error al llamar a /api/mcp/respond: {str(e)}{RESET}")
        return {"error": str(e)}

def call_store_endpoint(caso: Dict[str, Any], campo: str) -> Dict[str, Any]:
    """Llama al endpoint /api/mcp/store con los datos del caso y campo."""
    url = f"{BASE_URL}/api/mcp/store"
    payload = {
        "visit_id": caso["visit_id"],
        "field": campo,
        "role": "health_professional",
        "content": caso["campos"][campo],
        "overwrite": True
    }
    
    try:
        response = requests.post(url, json=payload, headers=HEADERS)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"{RED}Error al llamar a /api/mcp/store: {str(e)}{RESET}")
        return {"error": str(e)}

def call_validate_endpoint(caso: Dict[str, Any]) -> Dict[str, Any]:
    """Llama al endpoint /api/mcp/validate para el caso."""
    url = f"{BASE_URL}/api/mcp/validate"
    params = {"visit_id": caso["visit_id"]}
    
    try:
        response = requests.get(url, params=params, headers=HEADERS)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"{RED}Error al llamar a /api/mcp/validate: {str(e)}{RESET}")
        return {"error": str(e)}

def check_validation_expectations(caso: Dict[str, Any], validate_response: Dict[str, Any]) -> bool:
    """Verifica si la validación cumple con las expectativas."""
    expectativas = caso["expectativas"]["validate"]
    
    if "error" in validate_response:
        print(f"{RED}No se pudo validar debido a un error en la llamada{RESET}")
        return False
    
    alerts = validate_response.get("alerts", [])
    alert_types = [alert["type"] for alert in alerts]
    
    # Verificar si esperamos alertas
    if expectativas["expect_alerts"]:
        if not alerts:
            print(f"{RED}Se esperaban alertas pero no se recibieron{RESET}")
            return False
        
        # Verificar tipos de alertas esperadas
        expected_alerts = set(expectativas["expected_alerts"])
        received_alerts = set(alert_types)
        
        missing_alerts = expected_alerts - received_alerts
        unexpected_alerts = received_alerts - expected_alerts
        
        if missing_alerts:
            print(f"{YELLOW}Alertas esperadas que no se recibieron: {missing_alerts}{RESET}")
        
        if unexpected_alerts:
            print(f"{YELLOW}Alertas recibidas que no se esperaban: {unexpected_alerts}{RESET}")
        
        return len(missing_alerts) == 0  # Éxito si no faltan alertas esperadas
    else:
        # No esperamos alertas
        if alerts:
            print(f"{YELLOW}No se esperaban alertas pero se recibieron: {alert_types}{RESET}")
            return False
        return True

def ejecutar_caso(caso: Dict[str, Any]) -> None:
    """Ejecuta todas las pruebas para un caso clínico."""
    print_header(f"CASO: {caso['nombre']} (ID: {caso['visit_id']})")
    
    resultados = {
        "respond": {},
        "store": {},
        "validate": None
    }
    
    # Ejecutar prueba para cada campo
    for campo in caso["campos"]:
        print(f"\n{BLUE}Probando campo: {campo}{RESET}")
        
        # 1. /respond
        print(f"\n{BLUE}1. Llamando a /api/mcp/respond para {campo}...{RESET}")
        respond_result = call_respond_endpoint(caso, campo)
        resultados["respond"][campo] = respond_result
        respond_success = "error" not in respond_result
        print_result(f"Endpoint /respond para {campo}", respond_success)
        
        if respond_success:
            print(f"{GREEN}Respuesta recibida correctamente{RESET}")
        
        # 2. /store
        print(f"\n{BLUE}2. Llamando a /api/mcp/store para {campo}...{RESET}")
        store_result = call_store_endpoint(caso, campo)
        resultados["store"][campo] = store_result
        store_success = "success" in store_result and store_result["success"]
        print_result(f"Endpoint /store para {campo}", store_success)
        
        if store_success:
            print(f"{GREEN}Contenido almacenado con ID: {store_result.get('entry_id', 'N/A')}{RESET}")
        
        # Pequeña pausa para no sobrecargar el servidor
        time.sleep(0.5)
    
    # 3. /validate (después de almacenar todos los campos)
    print(f"\n{BLUE}3. Llamando a /api/mcp/validate...{RESET}")
    validate_result = call_validate_endpoint(caso)
    resultados["validate"] = validate_result
    
    if "error" not in validate_result:
        alerts = validate_result.get("alerts", [])
        if alerts:
            print(f"{YELLOW}Se encontraron {len(alerts)} alertas:{RESET}")
            for alert in alerts:
                print(f"{YELLOW}  - Tipo: {alert['type']}, Campo: {alert.get('field', 'N/A')}, Mensaje: {alert['message']}{RESET}")
        else:
            print(f"{GREEN}No se encontraron alertas de validación{RESET}")
    
    # Verificar expectativas de validación
    validation_meets_expectations = check_validation_expectations(caso, validate_result)
    print_result("Validación cumple con las expectativas", validation_meets_expectations)
    
    # Resumen general del caso
    print(f"\n{BLUE}Resumen del caso:{RESET}")
    campos_respond = all("error" not in res for res in resultados["respond"].values())
    campos_store = all("success" in res and res["success"] for res in resultados["store"].values())
    
    print_result("Respuestas del copiloto", campos_respond)
    print_result("Almacenamiento en Supabase", campos_store)
    print_result("Validación automática", validation_meets_expectations)
    
    # Resultado global
    resultado_global = campos_respond and campos_store and validation_meets_expectations
    print(f"\n{GREEN if resultado_global else RED}Resultado global: {'ÉXITO' if resultado_global else 'FALLIDO'}{RESET}")

def main():
    """Función principal para ejecutar todos los casos de prueba."""
    print_header("PRUEBA DE CASOS CLÍNICOS CONTRA SERVIDOR MCP")
    
    # Verificar que el servidor esté disponible
    try:
        health_check = requests.get(f"{BASE_URL}/api/health")
        if health_check.status_code == 200:
            print(f"{GREEN}Servidor MCP disponible en {BASE_URL}{RESET}")
            print(f"{GREEN}Versión: {health_check.json().get('version', 'Desconocida')}{RESET}")
            print(f"{GREEN}Modelo: {health_check.json().get('model', 'Desconocido')}{RESET}")
        else:
            print(f"{RED}El servidor respondió con código {health_check.status_code}{RESET}")
            return
    except requests.exceptions.RequestException:
        print(f"{RED}No se pudo conectar con el servidor en {BASE_URL}. Asegúrate de que esté en ejecución.{RESET}")
        return
    
    for caso in casos_clinicos:
        ejecutar_caso(caso)
        print("\n" + "-" * 80)
    
    print_header("PRUEBAS FINALIZADAS")

if __name__ == "__main__":
    main() 