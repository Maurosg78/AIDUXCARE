# Plan de Estabilización TypeScript para AiDuxCare

Este documento describe los pasos realizados y pendientes para estabilizar el sistema de tipos en el proyecto AiDuxCare.

## Fase 1: Configuración Base (Completado)

- ✅ Configuración de `tsconfig.base.json` con opciones estrictas pero compatibles con el ecosistema
- ✅ Ajuste de opciones críticas como `moduleResolution: "bundler"`, `verbatimModuleSyntax: false`
- ✅ Configuración adecuada de JSX y otras opciones de compatibilidad
- ✅ Ajuste de `skipLibCheck: true` para evitar errores en módulos de terceros

## Fase 2: Organización de Tipos (Parcialmente Completado)

- ✅ Creación de un barrel file en `src/types/index.ts`
- ✅ Organización en subdirectorios lógicos: `/clinical`, `/custom`, `/utils`, etc.
- ✅ Movimiento de interfaces de autenticación a `src/types/custom/SessionTypes.ts`
- ✅ Movimiento de interfaces de LangFuse a `src/types/custom/LangfuseTypes.ts`

## Fase 3: Problemas Pendientes (En Progreso)

1. **Conflictos de casing en archivos**:
   - Resolver inconsistencias entre `Patient.ts` y `patient.ts`
   - Normalizar los nombres a minúsculas (`patient.ts`) o PascalCase (`Patient.ts`) de forma consistente

2. **Exportaciones múltiples**:
   - Revisar y eliminar exportaciones duplicadas en el barrel file
   - Usar exportaciones con alias para resolver ambigüedades (`export { X as Y }`)

3. **Interfaces no utilizadas**:
   - Marcar parámetros no utilizados con prefijo `_`
   - Eliminar interfaces declaradas pero no utilizadas

4. **Conversión de `any` a `unknown`**:
   - Sustituir usos restantes de `any` por `unknown`
   - Añadir type guards para manejar valores `unknown`

## Fase 4: Corrección de Problemas en Archivos Específicos

### Problemas de tipos en `.d.ts`:

1. **`next-auth.d.ts`**:
   - Resolver conflictos de tipo para Provider y Session
   - Utilizar las etiquetas `_` para tipos no utilizados

2. **`langfuse.d.ts`**:
   - Eliminar interfaces duplicadas con tipos existentes
   - Evitar las declaraciones que causan merging circular

3. **`schema-utils.ts`**:
   - Resolver parámetros no utilizados
   - Eliminar uso de `any` en favor de `unknown`

### Verificación de Cambios:

- Ejecutar `npx tsc --noEmit` para verificar correcciones
- Ejecutar `npx eslint src --ext .ts,.tsx --fix` para linting

## Pasos Siguientes

1. Implementar un workflow en CI/CD para verificación de tipos
2. Crear scripts automatizados para verificar regresiones
3. Refactorizar componentes problemáticos como `VisitDetailPage.tsx`

## Impacto Esperado

- **0 errores** de compilación TS (`npx tsc --noEmit`)
- **0 advertencias**, **0 errores** de ESLint (`npx eslint src --ext .ts,.tsx`)
- Sistema de tipos más confiable y refactorización más segura
- Mejor experiencia de desarrollo con autocompletado y detección de errores 