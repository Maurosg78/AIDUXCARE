# 🧠 Roadmap de Estabilización TypeScript – AiDuxCare v2.0

Este documento describe el plan para estandarizar, limpiar y asegurar el tipado estricto de todo el proyecto AiDuxCare. Su objetivo es reducir errores, mejorar la mantenibilidad y asegurar calidad clínica y técnica en todos los módulos del MVP.

---

## ✅ Etapas del Plan

### 1. 🔧 Unificación de Configuraciones TS
- Crear `tsconfig.base.json` con configuración estricta
- Crear `tsconfig.strict.json` para migración gradual
- Crear `tsconfig.relaxed.json` para módulos legacy
- Script de validación de herencia de configs
- Documentar cada configuración en `TSCONFIG.md`

### 2. 🚨 Auditoría de `as any` y `@ts-ignore`
- Script que recorra el código y registre todos los `as any` y `@ts-ignore`
- Clasificación: `⚠️ Temporal`, `✅ Necesario`, `🚫 Evitable`
- Registro en `audit-log/ts-any-usage.json`
- Objetivo: -20% por versión
- Implementar ESLint rules personalizadas para monitoreo

### 3. 📦 Refactor de Imports y Consistencia ESM
- Crear `LangfuseWrapper.ts` con typings explícitos
- Usar barrel files (`index.ts`) por módulo
- Verificar alias, imports y compatibilidad ESM/CJS
- Implementar sistema de barril para imports de Express
- Script de validación de imports

### 4. 🧪 Pruebas de Tipos y Cobertura
- Implementar `type-coverage`
- Crear archivos `*.type-test.ts` para validar interfaces clave
- Reportar cobertura por módulo en CI/CD
- Dashboard de cobertura de tipos
- Pruebas de tipo para interfaces críticas

### 5. 🚦 Validación en GitHub Actions
- Nuevo paso en CI: `npx tsc --noEmit --strict`
- Bot comenta en PRs si hay nuevos errores de tipo
- Registro de excepciones temporales (`ts-exceptions.json`)
- Sistema de "tickets de tipo" para excepciones
- Métricas de calidad en dashboard

### 6. 📚 Documentación y Buenas Prácticas
- Crear `typescript-guidelines.md`
- Documentar patrones válidos y anti-patrones
- Establecer canal de discusión sobre tipos
- Guías de mejores prácticas
- Sesiones de training para el equipo

### 7. 📊 Monitoreo y Métricas
- Dashboard de cobertura de tipos por módulo
- Gráficos de tendencia de uso de `any`
- Reportes semanales de salud de tipos
- Alertas automáticas en degradación
- Métricas de tiempo de compilación

### 8. 🔄 Plan de Rollback
- Puntos de control para reversión
- Snapshots de configuraciones estables
- Procedimientos de emergencia
- Documentación de rollback
- Tests de integración post-rollback

---

## 📊 Métricas Objetivo

| Indicador                    | Meta               | Fecha Objetivo |
|-----------------------------|--------------------|----------------|
| Uso de `as any`             | -90% en 3 meses    | 2024-08-12     |
| Tiempo de compilación TS    | < 30 segundos      | 2024-07-12     |
| Errores en PRs              | 0 en producción    | 2024-09-12     |
| Cobertura de tipos          | > 95%              | 2024-10-12     |
| Uso de `@ts-ignore`         | 0                  | 2024-11-12     |

---

## 🔄 Proceso de Implementación

1. **Fase 1: Preparación** (Semana 1-2)
   - Configuración de estructura base
   - Implementación de scripts de validación
   - Creación de documentación inicial

2. **Fase 2: Auditoría** (Semana 3-4)
   - Ejecución de scripts de auditoría
   - Clasificación de usos de `any`
   - Creación de plan de migración

3. **Fase 3: Migración** (Semana 5-8)
   - Implementación de tipos estrictos
   - Refactor de imports
   - Actualización de configuraciones

4. **Fase 4: Validación** (Semana 9-10)
   - Pruebas de integración
   - Validación de CI/CD
   - Documentación final

---

## 📝 Notas de Implementación

- Cada commit importante relacionado con tipos debe mencionar `[types]` en su mensaje
- Las excepciones temporales deben ser documentadas en `ts-exceptions.json`
- Los cambios en tipos deben ser revisados por al menos dos miembros del equipo
- Se debe mantener un registro de decisiones de arquitectura en `ARCHITECTURE.md`

---

Este roadmap será actualizado a medida que avancemos. La última actualización fue el 2024-05-12. 