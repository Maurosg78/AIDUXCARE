# Validación Pre-Clínica AiDuxCare

## Estado de Configuración (Actualizado: 2024-03-19)
- **Rama**: pre-clinical-test
- **URL**: https://aiduxcare-test.vercel.app
- **Estado**: ⚠️ En proceso de despliegue

## Correcciones Técnicas Realizadas
- ✅ Configuración de PostCSS actualizada
- ✅ Dependencias de Tailwind actualizadas
- ✅ Formato de archivos de configuración corregido

## Variables de Entorno para Vercel
```env
# Langfuse (Monitoreo de IA)
VITE_LANGFUSE_PUBLIC_KEY=pk-lf-57c6e2ec-8603-44cf-b030-cddcef1f1f3d
VITE_LANGFUSE_SECRET_KEY=sk-lf-c1872960-86af-4899-b275-b7de8d536794
VITE_LANGFUSE_BASE_URL=https://cloud.langfuse.com

# Autenticación
NEXTAUTH_SECRET=8cbd83a9409a407ea2d43a6db7e1fc2a96cf367fa2055c7ceaf3d58b66bbda0f

# Vercel (CI/CD)
VERCEL_TOKEN=[Opcional]
VERCEL_ORG_ID=[Opcional]
VERCEL_PROJECT_ID=[Opcional]
```

## Plan de Validación

### 1. 🚀 Deploy en Vercel
- [ ] Confirmar rama pre-clinical-test
- [ ] Configurar variables de entorno en Vercel
- [ ] Realizar deploy inicial
- [ ] Verificar build exitoso

### 2. 🔍 Validación de Usuarios
- [ ] Probar acceso con laura@clinicatest.com
- [ ] Probar acceso con jose@valenciamed.com
- [ ] Probar acceso con ines@movsalud.es
- [ ] Verificar permisos de EMR
- [ ] Validar formulario de feedback

### 3. 📊 Validación de Eventos Langfuse
- [ ] Verificar eventos form.update
- [ ] Verificar eventos feedback.submit
- [ ] Confirmar formato de traceId
- [ ] Validar metadatos de eventos

### 4. 🏥 Validación Clínica
- [ ] Completar visita de prueba
- [ ] Verificar guardado de datos
- [ ] Probar escucha activa
- [ ] Validar sugerencias del copiloto

### 5. 🔧 Health Check
- [ ] Ejecutar script de validación
- [ ] Verificar endpoints activos
- [ ] Confirmar conexiones de API
- [ ] Validar respuestas de servicios

## Estado de Validación
⚠️ **En Progreso**
- Build local corregido
- Pendiente deploy en Vercel
- Pendiente validación de usuarios
- Pendiente verificación de eventos

## Próximos Pasos
1. Completar deploy en Vercel
2. Ejecutar validaciones automáticas
3. Realizar pruebas manuales
4. Documentar resultados
5. Aprobar para uso clínico

## Contacto Soporte
- **Email**: soporte@aiduxcare.com
- **Horario**: L-V 9:00-18:00 CET
- **Tiempo respuesta**: < 2 horas en horario laboral 