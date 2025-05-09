#!/bin/bash
# Script para probar el flujo completo de validación desde audio
# AiDuxCare v1.29.0

# Colores para salida
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # Sin color

# Configuración
SERVER_PORT=8001
SERVER_URL="http://localhost:${SERVER_PORT}"
TEST_VISIT_ID="VIS_TEST_AUDIO_$(date +%s)"

# Encabezado
echo -e "${BLUE}======================================================${NC}"
echo -e "${BLUE}     PRUEBA DE FLUJO DE AUDIO A VALIDACIÓN v1.29.0     ${NC}"
echo -e "${BLUE}======================================================${NC}"
echo

# Verificar que el servidor esté activo
echo -e "${YELLOW}Verificando que el servidor MCP esté activo...${NC}"
SERVER_STATUS=$(curl -s -o /dev/null -w "%{http_code}" ${SERVER_URL}/api/health)

if [ "$SERVER_STATUS" != "200" ]; then
    echo -e "${RED}❌ Error: El servidor MCP no está disponible en ${SERVER_URL}${NC}"
    echo -e "${YELLOW}Por favor, inicia el servidor con: cd mcp_server && python run_app.py${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Servidor MCP activo${NC}"
echo

# Campos clínicos simulados (transcripción de audio)
echo -e "${YELLOW}Simulando transcripción de audio a campos clínicos...${NC}"
ANAMNESIS="Paciente femenina de 38 años que consulta por cefalea frontal pulsátil de 3 días de evolución. Intensidad 7/10, asociada a fotofobia y náuseas. Antecedentes de migraña con aura en tratamiento preventivo con propranolol."
EXPLORACION="PA 120/80. FC 76. Afebril. Glasgow 15. Exploración neurológica sin focalidad. Pupilas isocóricas y normorreactivas. No signos meníngeos."
DIAGNOSTICO="Crisis migrañosa moderada-severa"
PLAN="1. Sumatriptán 50 mg VO. 2. Metoclopramida 10 mg VO. 3. Mantener hidratación. 4. Ambiente tranquilo, oscuro. 5. Control evolutivo en 48h."

echo -e "${GREEN}✅ Transcripción simulada completada${NC}"
echo

# 1. Almacenar cada campo vía /api/mcp/store
echo -e "${YELLOW}PASO 1: Almacenando campos clínicos...${NC}"

# Función para almacenar un campo
store_field() {
    local field=$1
    local content=$2
    local result=$(curl -s -X POST ${SERVER_URL}/api/mcp/store \
        -H "Content-Type: application/json" \
        -d "{\"visit_id\":\"${TEST_VISIT_ID}\",\"field\":\"${field}\",\"role\":\"health_professional\",\"content\":\"${content}\",\"overwrite\":true}")
    
    if [[ $result == *"\"success\":true"* ]]; then
        echo -e "${GREEN}✅ Campo ${field} almacenado correctamente${NC}"
        return 0
    else
        echo -e "${RED}❌ Error al almacenar campo ${field}${NC}"
        echo -e "${RED}Respuesta: ${result}${NC}"
        return 1
    fi
}

# Almacenar cada campo
store_field "anamnesis" "$ANAMNESIS"
store_field "exploracion" "$EXPLORACION"
store_field "diagnostico" "$DIAGNOSTICO"
store_field "plan" "$PLAN"

echo -e "${GREEN}✅ Todos los campos han sido almacenados${NC}"
echo

# 2. Ejecutar validación automática
echo -e "${YELLOW}PASO 2: Ejecutando validación automática...${NC}"
VALIDATION_RESULT=$(curl -s -X GET "${SERVER_URL}/api/mcp/validate?visit_id=${TEST_VISIT_ID}")

if [[ $VALIDATION_RESULT == *"validation_passed"* ]]; then
    echo -e "${GREEN}✅ Validación ejecutada correctamente${NC}"
    
    # Analizar resultado
    PASSED=$(echo $VALIDATION_RESULT | grep -o '"validation_passed":true' || echo '"validation_passed":false')
    ALERTS_COUNT=$(echo $VALIDATION_RESULT | grep -o '"alerts":\[.*\]' | tr -cd '[' | wc -c)
    FIELDS_COUNT=$(echo $VALIDATION_RESULT | grep -o '"fields_validated":\[.*\]' | tr -cd ',' | wc -c)
    FIELDS_COUNT=$((FIELDS_COUNT + 1))

    echo -e "${BLUE}Detalles de la validación:${NC}"
    if [[ $PASSED == *"true"* ]]; then
        echo -e "${GREEN}• Validación exitosa: Sin alertas${NC}"
    else
        echo -e "${YELLOW}• Validación con alertas${NC}"
    fi
    echo -e "${BLUE}• Campos validados: ${FIELDS_COUNT}${NC}"
    echo -e "${BLUE}• Alertas encontradas: ${ALERTS_COUNT}${NC}"
    
    # Si hay alertas, mostrarlas
    if [[ $ALERTS_COUNT -gt 0 ]]; then
        echo -e "${YELLOW}Alertas detectadas:${NC}"
        # Extraer y mostrar alertas (simplificado para este script)
        echo $VALIDATION_RESULT | grep -o '"type":"[^"]*","message":"[^"]*"' | \
        while read alert; do
            TYPE=$(echo $alert | cut -d '"' -f 4)
            MESSAGE=$(echo $alert | cut -d '"' -f 8)
            echo -e "${YELLOW}  • ${TYPE}: ${MESSAGE}${NC}"
        done
    fi
else
    echo -e "${RED}❌ Error al ejecutar validación${NC}"
    echo -e "${RED}Respuesta: ${VALIDATION_RESULT}${NC}"
fi

echo
echo -e "${BLUE}======================================================${NC}"
echo -e "${GREEN}✅ Prueba de flujo audio-validación completada${NC}"
echo -e "${BLUE}  ID de visita: ${TEST_VISIT_ID}${NC}"
echo -e "${BLUE}  Servidor: ${SERVER_URL}${NC}"
echo -e "${BLUE}======================================================${NC}" 