# Plan de Normalización de Tipos para AiDuxCare

## Resumen del Trabajo Realizado

1. **Normalización de estructura en `/types/shared`:**
   - Movimos todos los tipos principales a una estructura compartida con PascalCase
   - Creamos interfaces bien documentadas para: `AuditLogEntry`, `ChecklistAudioItem`, `ClinicalEvaluation`, `CopilotSuggestion`, `Patient`, `Visit`, y `VisitPDFMetadata`
   - Agregamos tipos de apoyo (enums, tipos auxiliares) con nombres descriptivos
   - Todo se exporta desde el archivo barrel principal `src/types/index.ts`

2. **Eliminación de duplicaciones:**
   - Se eliminaron los archivos duplicados con diferentes casos (ej. `Patient.ts` vs `patient.ts`)
   - Se creó un script `cleanup-types.sh` para facilitar esta limpieza

## Correcciones Pendientes

### 1. Corregir Importaciones

Primero debemos corregir todas las importaciones rotas:

```bash
# Buscar todas las importaciones que usan archivos eliminados
find src -type f -name "*.ts" -o -name "*.tsx" | xargs grep -l "from '\.\./\(Patient\|Visit\|AuditLogEntry\|ClinicalEvaluation\|ChecklistAudioItem\|CopilotSuggestion\|VisitPDFMetadata\)'" | sort
```

Para cada archivo encontrado, actualizar la importación para usar `@/types/shared`:

```typescript
// ANTES
import type { Patient } from '../Patient';

// DESPUÉS
import type { Patient } from '@/types/shared';
```

### 2. Corregir Errores de Tipo Z

Los errores relacionados con `z` se deben a que estamos usando `import type { z }`, pero intentando usarlo como valor:

1. Corregir en `src/modules/emr/services/EvalService.ts` y archivos relacionados:
   ```typescript
   // Cambiar
   import type { z } from '@/types/schema-utils';
   
   // Por
   import { z } from '@/types/schema-utils';
   ```

### 3. Eliminar Exportaciones Duplicadas

El error `Module has already exported a member named 'X'` indica exportaciones duplicadas:

1. Revisar `src/types/index.ts` para eliminar exportaciones duplicadas
2. Usar namespaces o renombrado para resolver ambigüedades:
   ```typescript
   export * as AuthUtils from './utils/auth';
   ```

### 4. Arreglar Alias de Importación

Tenemos errores por rutas no encontradas:

1. Verificar que los alias `@/types` y `@/core` estén correctamente configurados en `tsconfig.json`
2. Asegurarse de que todos los proyectos que extienden del base tengan la configuración correcta de paths

### 5. Prefijado de Variables No Usadas

Identificar y corregir variables y parámetros no utilizados:

```bash
# Ver todos los errores de variables no utilizadas
npx eslint src --ext .ts,.tsx --no-ignore --quiet --rule 'no-unused-vars: error' -f json
```

Para cada uno:
1. Si realmente no se usa: eliminar
2. Si es necesario mantenerlo: prefijarlo con `_`

### 6. Eliminar Importaciones No Usadas

```bash
# Ejecutar para corregir automáticamente las importaciones no usadas
npx eslint src --ext .ts,.tsx --fix --rule 'no-unused-vars: error'
```

### 7. Ajustar Schema Utils

Los errores en `schema-utils.ts` y similares indican que los tipos no se están siendo usados correctamente:

1. Revisar y corregir las implementaciones de esquemas en los archivos:
   - `src/types/schema-utils.ts`
   - `src/types/zod-utils.ts`
   - `src/types/zod-adapter.ts`
   - `src/types/zod-shim.ts`

## Validación Final

Una vez hechas todas las correcciones:

```bash
# Correr la comprobación TypeScript
npx tsc --noEmit

# Correr el linter
npx eslint src --ext .ts,.tsx --fix

# Hacer commit de los cambios
git add .
git commit -m "refactor: normalización de tipos y corrección de errores de TypeScript"
```

## Notas adicionales

- Considerar agregar test unitarios para validar la estructura de tipos
- Considerar agregar hooks de pre-commit para validar TypeScript
- Mejorar la documentación de tipos complejos con ejemplos 