#!/bin/bash

echo "🔍 Analizando y corrigiendo dependencias..."

# Limpiar caché y módulos
echo "🧹 Limpiando caché y node_modules..."
rm -rf node_modules
rm -f package-lock.json
npm cache clean --force

# Instalar dependencias principales
echo "📦 Instalando dependencias principales..."
npm install react@18.2.0 react-dom@18.2.0 @types/react@18.2.0 @types/react-dom@18.2.0 --legacy-peer-deps

# Instalar dependencias de MUI
echo "🎨 Instalando dependencias de MUI..."
npm install @mui/material@5.14.20 @mui/icons-material@5.14.20 @emotion/react@11.11.1 @emotion/styled@11.11.0 --legacy-peer-deps

# Instalar date-fns y pickers
echo "📅 Instalando date-fns y pickers..."
npm install date-fns@2.30.0 @mui/x-date-pickers@5.0.20 --legacy-peer-deps

# Instalar dependencias de routing
echo "🛣️ Instalando dependencias de routing..."
npm install react-router-dom@6.20.0 --legacy-peer-deps

# Instalar dependencias de UI
echo "🎯 Instalando dependencias de UI..."
npm install @radix-ui/react-label@2.0.2 @radix-ui/react-radio-group@1.1.3 --legacy-peer-deps

# Instalar dependencias de desarrollo
echo "🛠️ Instalando dependencias de desarrollo..."
npm install -D typescript@5.0.4 @vitejs/plugin-react@4.2.0 vite@4.5.0 --legacy-peer-deps

# Limpiar dependencias no utilizadas
echo "🧹 Limpiando dependencias no utilizadas..."
npm prune

echo "✅ Proceso completado. Iniciando servidor de desarrollo..." 