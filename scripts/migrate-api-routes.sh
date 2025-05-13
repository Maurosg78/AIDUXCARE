#!/bin/bash

# Crear directorios necesarios
mkdir -p src/server/routes/admin
mkdir -p src/server/routes/public
mkdir -p src/server/middleware

# Mover rutas de administrador
mv src/pages/api/admin/* src/server/routes/admin/
mv src/pages/api/public/* src/server/routes/public/

# Eliminar directorios vacíos
rm -rf src/pages/api/admin
rm -rf src/pages/api/public

# Actualizar imports en archivos movidos
find src/server/routes -type f -name "*.ts" -exec sed -i '' 's|@/pages/api|@/server/routes|g' {} +
find src/server/routes -type f -name "*.ts" -exec sed -i '' 's|../../../|@/|g' {} +

echo "✅ Migración de rutas API completada" 