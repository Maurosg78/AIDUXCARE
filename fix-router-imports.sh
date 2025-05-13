#!/bin/bash

# Script para corregir problemas de importación del router en el proyecto AIDUXCARE
# Este script busca y reemplaza importaciones obsoletas con las nuevas

echo "Iniciando corrección de importaciones del router..."

# 1. Buscar y corregir importaciones de react-router-dom directas
grep -r --include="*.tsx" --include="*.ts" "from 'react-router-dom'" src | cut -d':' -f1 | while read file; do
  echo "Actualizando importaciones en $file"
  sed -i '' 's/from '\''react-router-dom'\''/from '\''@\/core\/utils\/router'\''/g' "$file"
done

# 2. Buscar y corregir dobles importaciones de useNavigate
grep -r --include="*.tsx" --include="*.ts" "import { useNavigate } from '@/core/utils/router'" src | grep -v "Routes" | cut -d':' -f1 | while read file; do
  echo "Corrigiendo doble importación de useNavigate en $file"
  sed -i '' '/^import { useNavigate } from '\''@\/core\/utils\/router'\'';$/d' "$file"
done

# 3. Buscar y corregir importaciones de router.tsx
grep -r --include="*.tsx" --include="*.ts" "from '@/core/utils/router.tsx'" src | cut -d':' -f1 | while read file; do
  echo "Corrigiendo extensión .tsx en importación del router en $file"
  sed -i '' 's/from '\''@\/core\/utils\/router.tsx'\''/from '\''@\/core\/utils\/router'\''/g' "$file"
done

# 4. Buscar y corregir importaciones de router-adapter
grep -r --include="*.tsx" --include="*.ts" "from '@/core/utils/router-adapter'" src | cut -d':' -f1 | while read file; do
  echo "Actualizando importación de router-adapter a router en $file"
  sed -i '' 's/from '\''@\/core\/utils\/router-adapter'\''/from '\''@\/core\/utils\/router'\''/g' "$file"
done

echo "Corrección de importaciones completada." 