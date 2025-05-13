"""
Herramientas para el agente MCP de AiDuxCare.

Cada herramienta sigue un patrón compatible con futuras migraciones a Langraph:
- Recibe argumentos específicos
- Retorna un resultado estructurado
- Incluye metadatos para trazabilidad
"""

import json
from datetime import datetime
from typing import Dict, List, Any, Optional, Tuple

# Herramientas simuladas para AiDuxCare

def sugerir_diagnostico_clinico(
    motivo_consulta: str, 
    sintomas: List[str], 
    antecedentes: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Sugiere posibles diagnósticos clínicos basados en los síntomas y antecedentes.
    
    Args:
        motivo_consulta: Razón principal de la visita
        sintomas: Lista de síntomas reportados
        antecedentes: Antecedentes médicos relevantes (opcional)
    
    Returns:
        Diccionario con diagnósticos sugeridos, confianza y referencias
    """
    timestamp = datetime.now().isoformat()
    
    # Simulación de diagnósticos basados en síntomas comunes
    diagnosticos_simulados = {
        "dolor cervical": {
            "principal": "Cervicalgia mecánica",
            "secundarios": ["Contractura muscular", "Hernia discal cervical"],
            "confianza": 0.85,
            "referencias": ["Guía Clínica Cervicalgia 2024", "Manual de Fisioterapia 2023"]
        },
        "dolor lumbar": {
            "principal": "Lumbalgia inespecífica",
            "secundarios": ["Síndrome facetario", "Discopatía"],
            "confianza": 0.78,
            "referencias": ["Protocolo Lumbalgia MINSAL 2024", "European Spine Journal 2023"]
        },
        "dolor rodilla": {
            "principal": "Condropatía rotuliana",
            "secundarios": ["Tendinopatía", "Lesión meniscal"],
            "confianza": 0.82,
            "referencias": ["JOSPT Guidelines 2024", "Revista Fisioterapia 2022"]
        }
    }
    
    # Búsqueda simplificada basada en palabras clave
    diagnostico = {"principal": "No determinado", "secundarios": [], "confianza": 0.5, "referencias": []}
    
    for palabra_clave, diag in diagnosticos_simulados.items():
        if palabra_clave in motivo_consulta.lower() or any(palabra_clave in s.lower() for s in sintomas):
            diagnostico = diag
            break
    
    return {
        "diagnósticos": diagnostico,
        "timestamp": timestamp,
        "tool": "sugerir_diagnostico_clinico",
        "inputs": {
            "motivo_consulta": motivo_consulta,
            "sintomas": sintomas,
            "antecedentes": antecedentes or []
        }
    }


def evaluar_riesgo_legal(
    diagnostico: str,
    tratamiento_propuesto: str,
    consentimiento_informado: bool,
    condiciones_especiales: Optional[List[str]] = None
) -> Dict[str, Any]:
    """
    Evalúa posibles riesgos legales del tratamiento propuesto.
    
    Args:
        diagnostico: Diagnóstico establecido o presuntivo
        tratamiento_propuesto: Descripción del tratamiento a realizar
        consentimiento_informado: Si se ha obtenido consentimiento informado
        condiciones_especiales: Condiciones que requieren atención especial
    
    Returns:
        Evaluación de riesgo legal con sugerencias
    """
    timestamp = datetime.now().isoformat()
    
    # Palabras clave que aumentan el riesgo legal
    palabras_alto_riesgo = ["manipulación", "invasivo", "experimental", "aguja", "alta intensidad"]
    palabras_medio_riesgo = ["movilización", "tracción", "eléctrico", "calor"]
    
    # Calcular nivel de riesgo básico
    nivel_riesgo = "bajo"
    riesgos_identificados = []
    recomendaciones = []
    
    if not consentimiento_informado:
        nivel_riesgo = "alto"
        riesgos_identificados.append("Ausencia de consentimiento informado documentado")
        recomendaciones.append("Obtener y documentar consentimiento informado antes de iniciar tratamiento")
    
    # Evaluar el tratamiento propuesto
    for palabra in palabras_alto_riesgo:
        if palabra in tratamiento_propuesto.lower():
            nivel_riesgo = "alto"
            riesgos_identificados.append(f"Técnica de alto riesgo identificada: {palabra}")
            recomendaciones.append(f"Documentar detalladamente procedimiento y respuesta para '{palabra}'")
    
    if nivel_riesgo != "alto":
        for palabra in palabras_medio_riesgo:
            if palabra in tratamiento_propuesto.lower():
                nivel_riesgo = "medio"
                riesgos_identificados.append(f"Técnica de riesgo moderado: {palabra}")
                recomendaciones.append(f"Explicar beneficios y riesgos de '{palabra}' al paciente")
    
    # Considerar condiciones especiales
    if condiciones_especiales:
        for condicion in condiciones_especiales:
            riesgos_identificados.append(f"Condición especial a considerar: {condicion}")
            recomendaciones.append(f"Documentar plan de manejo específico para: {condicion}")
            if nivel_riesgo == "bajo":
                nivel_riesgo = "medio"
    
    return {
        "evaluacion_riesgo": {
            "nivel": nivel_riesgo,
            "riesgos_identificados": riesgos_identificados,
            "recomendaciones": recomendaciones,
            "referencia_legal": "Normativa de Práctica Clínica 2024" 
        },
        "timestamp": timestamp,
        "tool": "evaluar_riesgo_legal",
        "inputs": {
            "diagnostico": diagnostico,
            "tratamiento_propuesto": tratamiento_propuesto,
            "consentimiento_informado": consentimiento_informado,
            "condiciones_especiales": condiciones_especiales or []
        }
    }


def recordar_visitas_anteriores(
    paciente_id: str,
    limite: int = 3
) -> Dict[str, Any]:
    """
    Recupera información de visitas anteriores del paciente.
    
    Args:
        paciente_id: Identificador único del paciente
        limite: Número máximo de visitas a recuperar
    
    Returns:
        Resumen de visitas anteriores con diagnósticos y tratamientos
    """
    timestamp = datetime.now().isoformat()
    
    # Base de datos simulada de visitas por paciente
    visitas_simuladas = {
        "P001": [
            {
                "fecha": "2025-04-10",
                "motivo": "Dolor cervical agudo",
                "diagnostico": "Cervicalgia por estrés",
                "tratamiento": "Terapia manual + calor",
                "evolucion": "Favorable con disminución de dolor en 70%"
            },
            {
                "fecha": "2025-03-15",
                "motivo": "Control mensual",
                "diagnostico": "Cervicalgia en mejora",
                "tratamiento": "Ejercicios domiciliarios",
                "evolucion": "Estable, continúa con ejercicios"
            }
        ],
        "P002": [
            {
                "fecha": "2025-05-01",
                "motivo": "Dolor lumbar irradiado",
                "diagnostico": "Lumbociática",
                "tratamiento": "TENS + ejercicios específicos",
                "evolucion": "Mejora leve, persiste dolor irradiado"
            },
            {
                "fecha": "2025-04-20",
                "motivo": "Evaluación inicial lumbar",
                "diagnostico": "Lumbalgia mecánica",
                "tratamiento": "Reposo relativo + antiinflamatorios",
                "evolucion": "Sin cambios significativos"
            },
            {
                "fecha": "2024-11-15",
                "motivo": "Molestias en hombro",
                "diagnostico": "Tendinitis supraespinoso",
                "tratamiento": "Ultrasonido + ejercicios",
                "evolucion": "Resuelto"
            }
        ],
        "P003": []
    }
    
    # Obtener visitas del paciente o lista vacía
    visitas = visitas_simuladas.get(paciente_id, [])[:limite]
    
    return {
        "visitas_anteriores": {
            "total_encontradas": len(visitas),
            "paciente_id": paciente_id,
            "registros": visitas
        },
        "timestamp": timestamp,
        "tool": "recordar_visitas_anteriores",
        "inputs": {
            "paciente_id": paciente_id,
            "limite": limite
        }
    }


# Función utilitaria para formatear resultados de herramientas de forma legible
def formatear_resultado_herramienta(resultado: Dict[str, Any]) -> str:
    """Formatea el resultado de una herramienta para mostrar de forma legible"""
    if not resultado:
        return "No se obtuvo resultado de la herramienta."
    
    nombre_herramienta = resultado.get("tool", "desconocida")
    timestamp = resultado.get("timestamp", "")
    
    if nombre_herramienta == "sugerir_diagnostico_clinico":
        diagnosticos = resultado.get("diagnósticos", {})
        principal = diagnosticos.get("principal", "No determinado")
        secundarios = ", ".join(diagnosticos.get("secundarios", []))
        confianza = diagnosticos.get("confianza", 0) * 100
        referencias = ", ".join(diagnosticos.get("referencias", []))
        
        return (f"📋 SUGERENCIA DIAGNÓSTICA ({confianza:.0f}% confianza):\n"
                f"Principal: {principal}\n"
                f"Secundarios: {secundarios}\n"
                f"Referencias: {referencias}")
    
    elif nombre_herramienta == "evaluar_riesgo_legal":
        evaluacion = resultado.get("evaluacion_riesgo", {})
        nivel = evaluacion.get("nivel", "desconocido").upper()
        riesgos = "\n- ".join([""] + evaluacion.get("riesgos_identificados", []))
        recomendaciones = "\n- ".join([""] + evaluacion.get("recomendaciones", []))
        
        return (f"⚖️ EVALUACIÓN DE RIESGO LEGAL - NIVEL {nivel}:\n"
                f"Riesgos identificados:{riesgos}\n"
                f"Recomendaciones:{recomendaciones}")
    
    elif nombre_herramienta == "recordar_visitas_anteriores":
        visitas = resultado.get("visitas_anteriores", {})
        paciente = visitas.get("paciente_id", "")
        total = visitas.get("total_encontradas", 0)
        registros = visitas.get("registros", [])
        
        if not registros:
            return f"📅 No se encontraron visitas anteriores para el paciente {paciente}"
        
        texto_visitas = ""
        for i, visita in enumerate(registros, 1):
            texto_visitas += (f"\n{i}. {visita.get('fecha')} - {visita.get('motivo')}\n"
                             f"   Dx: {visita.get('diagnostico')}\n"
                             f"   Tx: {visita.get('tratamiento')}\n")
        
        return f"📅 VISITAS ANTERIORES ({total}):{texto_visitas}"
    
    else:
        # Formato genérico para otras herramientas
        return f"Resultado de {nombre_herramienta}:\n{json.dumps(resultado, indent=2, ensure_ascii=False)}" 