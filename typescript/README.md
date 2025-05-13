# Guía de TypeScript para AiDuxCare

Este documento describe las mejores prácticas y convenciones para el uso de TypeScript en el proyecto AiDuxCare.

## Configuración

El proyecto utiliza una configuración estricta de TypeScript para garantizar la máxima seguridad de tipos:

- `tsconfig.base.json`: Contiene la configuración base compartida
- `tsconfig.json`: Extiende la configuración base para la aplicación principal
- `tsconfig.backend.json`: Configuración específica para el backend

## Verificación de Tipos

Existen varios comandos para verificar la corrección de tipos:

```bash
# Verificar tipos en toda la aplicación
npm run typecheck

# Verificar tipos en tiempo real mientras se desarrolla
npm run typecheck:watch

# Verificar tipos en la aplicación principal y backend
npm run typecheck:all
```

## Convenciones para Importaciones

### Importaciones Regulares vs Importaciones de Tipo

Para valores que solo se utilizan a nivel de tipo, usar `import type`:

```typescript
// ✅ Correcto
import type { UserRole, Patient } from '@/types';

// ❌ Incorrecto
import { UserRole, Patient } from '@/types';
```

### Orden de Importaciones

Las importaciones deben seguir este orden (automáticamente aplicado por ESLint):

1. Módulos integrados de Node.js
2. Dependencias externas (React, MUI, etc.)
3. Módulos internos (@/components, @/hooks, etc.)
4. Importaciones relativas

## Interfaces y Tipos

### Barrel Files

Usamos barrel files para centralizar las exportaciones de tipos:

```typescript
// src/types/index.ts
export * from './auth';
export * from './patient';
```

### Convenciones de Nomenclatura

- Interfaces: PascalCase y descriptivas (`PatientRecord`, no `IPatientRecord`)
- Tipos: PascalCase para tipos compuestos, sufijo `Type` opcional
- Enums: PascalCase con nombres singulares

### Evitar Cualquier implícito

- No usar `any` explícito o implícito
- Usar `unknown` cuando el tipo es realmente desconocido
- Evitar aserción de tipos sin comprobación

## CI/CD

El proyecto utiliza GitHub Actions para validar la correcta tipificación:

```yaml
# Ejecutado en cada PR y push a main/develop
- name: Typecheck
  run: npm run typecheck
```

## Resolución de Problemas Comunes

### Variables No Utilizadas

Prefija las variables no utilizadas con guion bajo:

```typescript
// ✅ Correcto
const _unusedVar = fetchData();

// ❌ Incorrecto
const unusedVar = fetchData();
```

### Importaciones Circulares

- Utiliza interfaces en lugar de clases cuando sea posible
- Considera mover tipos compartidos a un módulo separado

### Compatibilidad con JavaScript

- Usa comprobaciones de nulidad para valores que podrían ser undefined
- Proporciona valores por defecto para parámetros opcionales

## Actualización y Mantenimiento

Para mantener la calidad del código TypeScript:

1. Ejecutar `npm run typecheck` antes de cada commit
2. Revisar periódicamente los tipos con `npm run typecheck:all`
3. Asegurarse de que los nuevos componentes sigan estas convenciones
4. Actualizar esta documentación según sea necesario 