#!/bin/bash

# Script para corregir las importaciones de react-router-dom

echo "Buscando y reemplazando importaciones de react-router-dom..."

# Para archivos .tsx
find ./src -name "*.tsx" -type f -exec sed -i '' 's/from "react-router-dom"/from "react-router"/g' {} \;
find ./src -name "*.tsx" -type f -exec sed -i '' "s/from 'react-router-dom'/from 'react-router'/g" {} \;

# Para archivos .ts
find ./src -name "*.ts" -type f -exec sed -i '' 's/from "react-router-dom"/from "react-router"/g' {} \;
find ./src -name "*.ts" -type f -exec sed -i '' "s/from 'react-router-dom'/from 'react-router'/g" {} \;

echo "Reemplazo completado. Asegúrate de verificar que las importaciones funcionen correctamente." 