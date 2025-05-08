#!/bin/bash

# Colores para la salida
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}======================================================${NC}"
echo -e "${CYAN}         AiDuxCare v1.15 - Script de Inicio          ${NC}"
echo -e "${CYAN}======================================================${NC}"

# 1. Liberar puertos primero
echo -e "\n${YELLOW}📋 PASO 1: Liberar puertos y procesos...${NC}"
bash scripts/freeAllPorts.sh

# 2. Comprobar si existe .env.local, si no, crearlo desde .env.example
echo -e "\n${YELLOW}📋 PASO 2: Verificar configuración de entorno...${NC}"
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}⚠️ Archivo .env.local no encontrado. Creando desde ejemplo...${NC}"
    if [ -f .env.example ]; then
        cp .env.example .env.local
        echo -e "${GREEN}✅ Archivo .env.local creado desde ejemplo${NC}"
    else
        echo -e "${RED}❌ No existe archivo .env.example. Creando configuración mínima...${NC}"
        echo "VITE_API_BASE_URL=http://localhost:3000" > .env.local
        echo "VITE_PORT=5176" >> .env.local
        echo "VITE_LANGFUSE_PUBLIC_KEY=pk_dev_123456789" >> .env.local
        echo "VITE_LANGFUSE_SECRET_KEY=sk_dev_123456789" >> .env.local
        echo "VITE_LANGFUSE_BASE_URL=https://cloud.langfuse.com" >> .env.local
        echo -e "${GREEN}✅ Archivo .env.local creado con configuración mínima${NC}"
    fi
else
    echo -e "${GREEN}✅ Usando archivo .env.local existente${NC}"
fi

# 3. Iniciar el servidor API en segundo plano
echo -e "\n${YELLOW}📋 PASO 3: Iniciando servidor API...${NC}"
node simple-server-direct.mjs &
API_PID=$!

# Esperar a que el servidor API esté en funcionamiento
echo -e "${YELLOW}⏳ Esperando a que el servidor API inicie...${NC}"
sleep 2

# Verificar que el servidor API está respondiendo
if curl -s http://localhost:3000 > /dev/null; then
    echo -e "${GREEN}✅ API corriendo en http://localhost:3000${NC}"
else
    echo -e "${RED}❌ API no responde. Abortando...${NC}"
    kill $API_PID 2>/dev/null
    exit 1
fi

# 4. Iniciar el frontend Vite
echo -e "\n${YELLOW}📋 PASO 4: Iniciando frontend...${NC}"
echo -e "${CYAN}🚀 Ejecutando: npm run start${NC}"
npm run start &
FRONTEND_PID=$!

# Esperar a que el frontend esté en funcionamiento
echo -e "${YELLOW}⏳ Esperando a que el frontend inicie...${NC}"
sleep 5

# Verificar que el frontend está respondiendo
if curl -s -I http://localhost:5176 > /dev/null; then
    echo -e "${GREEN}✅ Frontend corriendo en http://localhost:5176${NC}"
else
    echo -e "${RED}⚠️ Frontend podría no estar respondiendo en http://localhost:5176${NC}"
    echo -e "${YELLOW}ℹ️ Pero el proceso continúa ejecutándose. Verificar en el navegador.${NC}"
fi

# Configurar cierre limpio
cleanup() {
    echo -e "\n${YELLOW}🛑 Deteniendo servicios...${NC}"
    kill $FRONTEND_PID 2>/dev/null
    kill $API_PID 2>/dev/null
    echo -e "${GREEN}✅ Servicios detenidos${NC}"
    exit 0
}

# Capturar señales para cierre limpio
trap cleanup SIGINT SIGTERM

echo -e "\n${GREEN}🎉 Sistema AiDuxCare v1.15 iniciado correctamente${NC}"
echo -e "${CYAN}📡 API: http://localhost:3000${NC}"
echo -e "${CYAN}🖥️ Frontend: http://localhost:5176${NC}"
echo -e "${YELLOW}⚠️ Presiona Ctrl+C para detener todos los servicios${NC}\n"

# Mantener el script en ejecución
wait 