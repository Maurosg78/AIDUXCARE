# 🚀 Roadmap de Innovación Técnica — AiDuxCare

Este documento recoge las funcionalidades estratégicas definidas por el CTO para que AiDuxCare sea una plataforma clínica inteligente, legalmente sólida y escalable desde su MVP.

---

## 🗣️ PRIORIDAD 1: Escucha Activa e Interacción por Voz (**Parte del MVP**)

**Objetivo:** Capturar información clínica a través del ambiente en tiempo real, mediante micrófono, sin interrumpir la consulta.

**Componentes clave:**
- Módulo de escucha activa por micrófono (durante la atención)
- Transcripción automática en tiempo real (ej: Whisper, Deepgram)
- Integración directa con la ficha clínica
- Reconocimiento de acentos y términos técnicos multilingües (inglés y español)

**Requisitos legales:**
- Consentimiento explícito del paciente antes de activar micrófono
- Cumplimiento con GDPR (UE), HIPAA (EE.UU.) y PIPEDA (Canadá)
- Política de retención de audio + anonimización de voz opcional

**Estado:** Prioridad crítica e integrada al MVP validado en España

---

## 🔝 PRIORIDAD 2: Mejora Visual y Experiencia de Usuario

**Objetivo:** Alinear la interfaz y organización documental con los EMRs más avanzados de Europa, EE.UU. y Canadá.

**Inspiraciones:**
- **Jane App**: Simplicidad y navegación intuitiva
- **Epic Systems**: Jerarquía y profundidad clínica
- **athenahealth**: Eficiencia operativa y acceso rápido
- **Cerner/Oracle**: Compatibilidad HL7/FHIR y estandarización

**Principios clave a implementar:**
- Layouts limpios, en grid
- Jerarquía visual efectiva
- Navegación ágil entre pacientes, visitas y módulos
- Diseño responsivo y sin sobrecarga cognitiva

---

## 🔐 PRIORIDAD 3: Normativas Internacionales de Seguridad y Confidencialidad

**Objetivo:** Garantizar cumplimiento legal y protección para el profesional y el paciente según normativas internacionales.

**Normas clave:**
- **GDPR (UE)**: Minimización de datos, consentimiento, derecho al olvido
- **HIPAA (EE.UU.)**: Encriptación, trazabilidad, control de accesos
- **PIPEDA (Canadá)**: Consentimiento informado, política de retención, notificación de brechas

**Aplicaciones en AiDuxCare:**
- Política de privacidad visible en la web pública
- Logs de acceso y roles mínimos ya operativos (Langfuse)
- Anonimización parcial bajo demanda
- Control granular por rol y entidad

---

## 🧠 PRIORIDAD 4: Reportes Automatizados para Pacientes

**Objetivo:** Generar y entregar automáticamente al paciente un resumen de su visita con información relevante para su seguimiento.

**Ejemplos de contenido según especialidad:**
- Ejercicios personalizados (fisioterapia)
- Plan de alimentación o hábitos (nutrición)
- Recomendaciones de compra o autocuidado (farmacia, medicina general)

**Integración futura sugerida:**
- API de plataformas como **Wibbi.com**
- Plantillas configurables por tipo de visita

**Etapa estimada:** v2.0+

---

## 📊 PRIORIDAD 5: Módulo Administrativo — Facturación + Continuidad Asistencial

**Objetivo:** Mejorar la eficiencia administrativa y prevenir el abandono de tratamientos.

### A. Facturación electrónica:
- Registro automático por prestación
- Generación de facturas y exportación CSV/PDF
- Envío por email e integración con Stripe o QuickBooks

### B. Seguimiento de pacientes ausentes:
- Alertas por cancelaciones reiteradas o inasistencia
- Reporte de abandono de tratamiento por paciente
- Filtros por profesional, servicio y fecha

### C. Panel administrativo:
- Ingresos semanales por profesional
- Tasa de asistencia vs. inasistencia
- Reportes operativos exportables

**Etapa estimada:** v1.5+

---

## 💰 PRIORIDAD 6: Módulo de Cálculo de Honorarios Profesionales

**Objetivo:** Automatizar el cálculo del pago a cada profesional según sus prestaciones realizadas y porcentaje asignado.

**Características:**
- Configuración individual de porcentaje por profesional o servicio
- Vinculación automática con la facturación
- Reporte mensual de montos a pagar por cada profesional
- Soporte para normativas específicas por país

**Etapa estimada:** v1.6+

---

## 📱 PRIORIDAD 7: App Multiplataforma (Mobile y Desktop)

**Objetivo:** Permitir el acceso total a AiDuxCare desde cualquier dispositivo, para profesionales y administrativos.

**Características esperadas:**
- App oficial (React Native o Flutter)
- Modo offline con sincronización
- Acceso a pacientes, formularios, copiloto, reportes y facturación
- Modo multiusuario (por clínica o independiente)

**Etapa estimada:** v2.0+

---

## 🔁 Notas Finales

La escucha activa por voz pasa a formar parte del MVP obligatorio.  
Ninguna versión será considerada final sin este componente operativo y auditado.  
Todos los módulos seguirán principios legales, clínicos y de escalabilidad técnica. 