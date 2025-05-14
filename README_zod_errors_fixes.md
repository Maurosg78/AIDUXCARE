# 🛠️ Historial de errores críticos detectados y corregidos en AiDuxCare (tipado y Zod)

Este documento resume los principales errores que surgieron durante el proceso de migración a tipado estricto y validaciones con Zod. Servirá como referencia obligatoria para cualquier desarrollador que trabaje en futuras ramas del proyecto AiDuxCare.

---

## ❌ 1. Uso incorrecto de `infer<T>` en funciones
**Ubicación:** `src/types/zod-utils.ts`

### ❗ Error cometido
```ts
(data: unknown): infer<T> => { ... }
```

### 💡 Corrección
El operador `infer` solo puede usarse dentro de tipos condicionales. La forma correcta es:

```ts
type InferSchema<T extends z.ZodTypeAny> = z.infer<T>
```

Y en funciones:

```ts
const result = schema.safeParse(data);
const parsed = result.success ? result.data as z.infer<typeof schema> : null;
```

---

## ❌ 2. Imports rotos por falta de extensiones `.js`
**Ubicación:** `src/types/**/*.ts`, `src/backend/**/*.ts`

### ❗ Error típico
```ts
import { X } from './utils/helper'; // ❌
```

Con `moduleResolution: 'node16'`, esto falla.

### 💡 Corrección
```ts
import { X } from './utils/helper.js'; // ✅
```

Automatizado con:

```bash
find ./src -type f \( -name "*.ts" -o -name "*.tsx" \) -exec sed -i '' -E 's/(from ".*?)([^\\.])(";)/\1\2.js\3/g' {} +
```

---

## ❌ 3. No se exportaban correctamente `z`, `ZodTypeAny` ni tipos derivados
**Ubicación:** `src/backend/utils/zod-utils.ts`

### ❗ Problema
Al importar `z` desde Zod, no se volvía a exportar para otros archivos que lo necesitaban.

### 💡 Corrección añadida al final del archivo:
```ts
export { z, ZodTypeAny };
```

---

## ❌ 4. Tipos `ZodType` incorrectamente importados
**Ubicación:** `src/types/zod-utils.ts`

### ❗ Error
```ts
import { ZodType } from 'zod'; // ❌
```

Zod ya no exporta directamente ese tipo.

### 💡 Corrección
Reemplazar por:

```ts
import { z } from 'zod';
type MySchema<T extends z.ZodTypeAny> = z.infer<T>;
```

---

## ❌ 5. Campos que esperaban `string` recibían `unknown`
**Ubicación:** `src/types/legacy-adapters.ts`

### ❗ Problema
```ts
doctorId: visit.doctorId, // doctorId era `unknown`
```

### 💡 Corrección
Forzar tipo:

```ts
doctorId: String(visit.doctorId ?? ''),
```

---

## ❌ 6. Archivos `.ts` rotos por cambios parciales
**Ubicación:** varios, especialmente:
- `langfuse.d 2.ts`
- `legacy-adapters.ts`

### 💡 Solución
Revisar manualmente el cierre de interfaces, objetos y estructuras. Usar:

```bash
npx tsc --project tsconfig.routes.json
```

Para validar al final.

---

## ✅ Lecciones aprendidas
- Usa siempre `z.infer<typeof schema>` para derivar tipos.
- No utilices `infer<T>` como tipo de retorno de funciones.
- Si usas `node16` o `nodenext`, **todos los imports relativos deben tener `.js`**.
- Exporta todo lo que se usa en múltiples módulos.
- Verifica lo que alteran herramientas automáticas como `ts-migrate`.

---

Este documento debe mantenerse actualizado con cada refactor importante.

