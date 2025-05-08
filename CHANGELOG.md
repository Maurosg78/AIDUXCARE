# Changelog

## v1.17.0 - Work In Progress (2025-05-08)

### Added
- Created v1.17.0 changelog structure
- Planned roadmap with 4 key phases: TypeScript cleanup, role-based modularization, performance improvements, and visual refinement

### In Progress
- TypeScript error reduction: reducido de 600+ a 156 errores
- Mejoras en las declaraciones de tipos en global.d.ts
- Corrección de componentes importantes: AuditLogViewer y ClinicalAuditLog
- Actualización del archivo useMCPContext.ts para compatibilidad con @tanstack/react-query v5

### Próximos pasos
- Continuar corrección de errores en archivos de routing y auth
- Modularización de componentes por rol de usuario
- Optimización de rendimiento de la interfaz

## v1.16.0 (2025-05-08)

### ✅ Mejoras y correcciones
- Sistema de auditoría clínica implementado y estable
- API de logs de auditoría funcionando correctamente
- Interfaz `ClinicalAuditLog.tsx` renderizando logs correctamente
- Actualización en las declaraciones de tipos para compatibilidad
- Limpieza de código no utilizado

### 🧹 Limpieza
- Eliminados archivos de pruebas obsoletos
- Actualización de tipos en `global.d.ts`
- Arreglados los imports obsoletos

### 🚀 Optimizaciones
- Servidor API optimizado para mejor rendimiento
- Manejo mejorado de trazabilidad clínica

## v1.15.0 (2025-04-20)

### ✅ Mejoras
- Integración con Langfuse para seguimiento de eventos
- Nueva interfaz de usuario para el tablero clínico
- Mejoras en la gestión de pacientes

### 🔧 Correcciones
- Solucionado problema al cargar historial de visitas
- Corregido bug en la creación de nuevos pacientes 