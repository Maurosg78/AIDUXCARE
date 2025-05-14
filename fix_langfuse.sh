#!/bin/bash
set -e

# 1. Hacer backup del archivo original
cp src/backend/routes/langfuse.ts src/backend/routes/langfuse.ts.bak

# 2. Generar scaffold limpio
cat << 'EOC' > src/backend/routes/langfuse.ts
import { Router } from "express";

const langfuseRouter = Router();

// TODO: Implementar endpoints /track y /batch con Zod y langfuseClient

export default langfuseRouter;
EOC

# 3. Mostrar las primeras 5 líneas para verificar contenido
echo "----- head -n 5 src/backend/routes/langfuse.ts -----"
head -n 5 src/backend/routes/langfuse.ts

# 4. Mostrar info del archivo para verificar tamaño y permisos
echo "----- ls -l src/backend/routes/langfuse.ts -----"
ls -l src/backend/routes/langfuse.ts

