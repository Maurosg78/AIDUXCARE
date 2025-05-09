"""
Endpoint de validación de registros clínicos.

Este módulo proporciona el endpoint para validar automáticamente
la calidad y completitud de los registros clínicos.
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from typing import Dict, List, Any, Optional
import logging
from datetime import datetime

from core.validators import validate_emr_record
from core.langfuse_tracing import create_trace
from services import store_validation_alerts

# Importación de servicios en modo simulado
try:
    from services.emr_service import get_visit_fields
except ImportError:
    # En modo simulado, creamos una función que simula la recuperación de datos
    def get_visit_fields(visit_id: str) -> Dict[str, Any]:
        """Simula la recuperación de campos de una visita."""
        logging.warning(f"Usando simulación para get_visit_fields({visit_id})")
        
        # Casos de prueba simulados
        simulated_data = {
            "VIS001": {
                "anamnesis": "Paciente masculino de 42 años con dolor lumbar irradiado a pierna derecha por trayecto L5. Inicio hace 3 días tras levantar cajas pesadas en mudanza. Dolor 7/10, empeora con movimiento y sedestación prolongada. Niega traumatismo directo. Sin alteraciones esfinterianas. Antecedentes: Sobrepeso (IMC 28), sedentario, trabajador de oficina.",
                "exploracion": "PA 130/85, FC 78, afebril. Postura antiálgica. Limitación flexión lumbar. Lasègue positivo 45° derecha. ROT conservados. No déficit motor. Hipoestesia cara lateral pierna derecha. Pulsos periféricos presentes.",
                "diagnostico": "Lumbociática aguda derecha. Probable hernia discal L4-L5 o L5-S1.",
                "plan": "1. Reposo relativo 48h. 2. Diclofenaco 50mg/8h con protección gástrica. 3. Paracetamol 1g/8h alternando. 4. Metocarbamol 750mg/8h. 5. Aplicación calor local. 6. Reevaluación en 7 días. 7. Solicitud RMN lumbar si no mejoría."
            },
            "VIS002": {
                "anamnesis": "Cefalea desde ayer.",
                "exploracion": "Exploración normal.",
                "diagnostico": "Probable cefalea tensional.",
                "plan": "Paracetamol."
            },
            "VIS003": {
                "anamnesis": "Paciente femenina de 35 años con tos productiva, fiebre de 38.5°C y malestar general desde hace 3 días. Expectoración verdosa. Vacunación COVID-19 completa. No alergias medicamentosas conocidas.",
                "exploracion": "Febril. Orofaringe hiperémica. Auscultación: crepitantes en base pulmonar derecha. SatO2 96%."
                # Diagnóstico y plan omitidos intencionalmente
            },
            "VIS004": {
                "anamnesis": "Paciente masculino de 68 años con dolor opresivo retroesternal de inicio súbito hace 2 horas, intensidad 8/10, irradiado a brazo izquierdo y mandíbula, asociado a náuseas y sudoración. Antecedentes: HTA en tratamiento con enalapril, dislipemia, exfumador (20 paq/año), diabetes tipo 2.",
                "exploracion": "PA 160/95, FC 92, FR 20, SatO2 94% basal. Paciente pálido, sudoroso. ACP: taquicárdico, sin soplos, crepitantes bibasales. Abdomen y EEII sin hallazgos.",
                "diagnostico": "Síndrome coronario agudo con elevación del ST (cara inferior). IAM tipo I.",
                "plan": "1. AAS 300mg masticado. 2. Clopidogrel 600mg. 3. Heparina 5000 UI. 4. Morfina 4mg IV. 5. Oxigenoterapia. 6. ECG seriados. 7. Activación código infarto. 8. Traslado urgente a hemodinámica para ICP primaria. 9. Controles enzimáticos seriados."
            },
            "VIS005": {
                "anamnesis": "Paciente femenina de 23 años, asmática desde la infancia, acude por disnea progresiva desde hace 12 horas tras exposición a polvo en limpieza doméstica. Usa salbutamol inhalado que no ha sido efectivo en esta ocasión. No fiebre ni expectoración. Último ingreso por asma hace 2 años.",
                "exploracion": "Taquipnea (FR 24), taquicardia (FC 110), SatO2 91% basal. Uso de musculatura accesoria. Sibilancias espiratorias difusas en ambos campos pulmonares. No cianosis.",
                "diagnostico": "Exacerbación asmática moderada-grave",
                "plan": "Salbutamol inhalado."
            }
        }
        
        if visit_id not in simulated_data:
            raise HTTPException(status_code=404, detail=f"Visita {visit_id} no encontrada")
        
        return simulated_data[visit_id]

# Router para validación
router = APIRouter(prefix="/api/mcp", tags=["validación"])

@router.get("/validate", summary="Validar registro clínico")
async def validate_visit(
    visit_id: str = Query(..., description="ID de la visita a validar")
) -> Dict[str, Any]:
    """
    Valida la calidad y completitud de un registro clínico.
    
    Realiza validaciones automáticas para detectar:
    - Campos obligatorios faltantes
    - Campos con texto demasiado breve
    - Otras validaciones específicas
    
    Las alertas generadas se almacenan en la tabla validation_alerts
    como parte del historial clínico legal de la visita.
    
    Returns:
        Dict con resultado de la validación y posibles alertas
    """
    # Crear traza en Langfuse para seguimiento
    trace = create_trace(
        name="clinical_validation", 
        metadata={"visit_id": visit_id, "timestamp": datetime.now().isoformat()}
    )
    
    try:
        with trace.span("get_visit_data"):
            # Obtener los campos de la visita desde el servicio EMR
            visit_data = get_visit_fields(visit_id)
        
        with trace.span("perform_validation"):
            # Realizar validación
            validation_alerts = validate_emr_record(visit_data)
            
            # Convertir alertas a formato JSON
            alerts_json = [alert.to_dict() for alert in validation_alerts]
            
            # Actualizar metadatos de la traza
            trace.update(metadata={
                "alerts_count": len(alerts_json),
                "fields_validated": list(visit_data.keys())
            })
        
        # Almacenar las alertas en la tabla validation_alerts (v1.28.0)
        if validation_alerts:
            with trace.span("store_validation_alerts"):
                storage_success = await store_validation_alerts(visit_id, validation_alerts)
                trace.update(metadata={"storage_success": storage_success})
        
        # Preparar respuesta
        return {
            "visit_id": visit_id,
            "validation_passed": len(alerts_json) == 0,
            "alerts": alerts_json,
            "fields_validated": list(visit_data.keys()),
            "timestamp": datetime.now().isoformat()
        }
    except Exception as e:
        # Registrar error en la traza
        trace.update(status="error", metadata={"error": str(e)})
        
        # Capturar errores específicos
        if "no encontrada" in str(e):
            raise HTTPException(status_code=404, detail=f"Visita {visit_id} no encontrada")
        
        # Error genérico
        raise HTTPException(status_code=500, detail=f"Error al validar la visita: {str(e)}") 