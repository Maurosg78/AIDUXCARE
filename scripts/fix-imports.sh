#!/bin/bash

# Reemplazar next/router por react-router-dom
find src -type f -name "*.tsx" -exec sed -i '' 's|import { useRouter } from "next/router"|import { useNavigate } from "react-router-dom"|g' {} +
find src -type f -name "*.tsx" -exec sed -i '' 's|const router = useRouter()|const navigate = useNavigate()|g' {} +
find src -type f -name "*.tsx" -exec sed -i '' 's|router.push|navigate|g' {} +

# Corregir mayúsculas/minúsculas en nombres de archivos
mv src/components/ui/button.tsx src/components/ui/Button.tsx 2>/dev/null || true

# Actualizar imports de servicios
find src -type f -name "*.tsx" -exec sed -i '' 's|@/core/services/langfuseClient|@/core/lib/langfuse.client|g' {} +

# Eliminar archivos de next-auth
rm -f src/pages/api/auth/[...nextauth].ts
rm -f src/middleware.ts

echo "✅ Correcciones de importación completadas" 