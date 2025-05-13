#!/bin/bash

# Script para limpiar archivos de tipos duplicados después de la normalización

echo "Eliminando archivos de tipos duplicados..."

# Archivos a eliminar (versiones antiguas)
FILES_TO_REMOVE=(
  "src/types/AuditLogEntry.ts"
  "src/types/audit/AuditLogEntry.ts"
  "src/types/ChecklistAudioItem.ts"
  "src/types/audio/ChecklistAudioItem.ts"
  "src/types/ClinicalEvaluation.ts"
  "src/types/clinical/ClinicalEvaluation.ts"
  "src/types/Visit.ts"
  "src/types/clinical/Visit.ts"
  "src/types/patient.ts"
  "src/types/clinical/Patient.ts"
  "src/types/CopilotSuggestion.ts"
  "src/types/copilot/CopilotSuggestion.ts"
  "src/types/VisitPDFMetadata.ts"
  "src/types/export/VisitPDFMetadata.ts"
  "src/types/Evaluation.ts"
)

for file in "${FILES_TO_REMOVE[@]}"; do
  if [ -f "$file" ]; then
    echo "Eliminando $file"
    rm "$file"
  else
    echo "El archivo $file no existe"
  fi
done

echo "Limpieza completada." 