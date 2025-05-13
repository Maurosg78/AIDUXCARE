#!/bin/bash

# Colores para la salida
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔍 Buscando y liberando puertos utilizados por AiDuxCare...${NC}"

# Función para matar procesos en un puerto
free_port() {
    local port=$1
    local pids=$(lsof -ti:$port 2>/dev/null)
    
    if [ -n "$pids" ]; then
        echo -e "${YELLOW}🔄 Puerto $port está siendo usado por PID: $pids${NC}"
        echo -e "${YELLOW}🔄 Matando procesos...${NC}"
        kill -9 $pids 2>/dev/null
        echo -e "${GREEN}✅ Puerto $port liberado${NC}"
    else
        echo -e "${GREEN}✓ Puerto $port ya está libre${NC}"
    fi
}

# Matar procesos específicos por nombre que puedan afectar
echo -e "${YELLOW}🔄 Buscando procesos de Vite, Node y npm...${NC}"

# Matar procesos de Vite
pkill -f "vite" 2>/dev/null
echo -e "${GREEN}✓ Procesos de Vite terminados${NC}"

# Matar procesos de los servidores
pkill -f "simple-server" 2>/dev/null
echo -e "${GREEN}✓ Procesos de servidores terminados${NC}"

# Matar scripts npm que podrían estar ejecutando estos procesos
pkill -f "npm run dev" 2>/dev/null
pkill -f "npm run start" 2>/dev/null
pkill -f "npm run api" 2>/dev/null
echo -e "${GREEN}✓ Procesos npm relacionados terminados${NC}"

# Liberar los puertos específicos
free_port 5175
free_port 5176
free_port 3000

echo -e "${GREEN}🎉 Todos los puertos liberados. El sistema está listo para iniciar.${NC}" 