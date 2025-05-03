# Marco Teórico-Técnico para el Desarrollo de AiDuxCare (EMR y Clinical Agent)

---

## I. VISIÓN ESTRATÉGICA Y OBJETIVO GENERAL

**AiDuxCare** es un sistema clínico inteligente compuesto por dos grandes componentes integrados:

1. **EMR estructurado**: Diseñado para capturar datos clínicos de manera intuitiva, estructurada y legalmente trazable.  
2. **Agente Inteligente (Clinical Copilot)**: Funciona como copiloto clínico, capaz de razonar con el profesional, detectar omisiones y emitir feedback en tiempo real.

El objetivo es doble:

- Elevar la calidad de la atención mediante soporte cognitivo.  
- Reducir el riesgo clínico y legal por mala documentación o errores de juicio.

---

## II. COMPONENTES CENTRALES Y ARQUITECTURA

### 1. EMR Estructurado

- **Frontend:** React + Vite + Tailwind  
- **Routing:** React Router Dinámico  
- **Validaciones:** Zod (formularios) + reglas clínicas integradas  
- **Roles:** Paciente / Profesional / Administrador (auth por JWT, futuro OAuth)  
- **Eventos de interacción:** Capturados con Langfuse

### 2. Clinical Copilot (IA)

- **Tipo de IA:** Basado en LLMs (OpenAI / Claude / Mistral)  
- **Modo:** Observador por defecto, interactivo bajo demanda  
- **Funciones actuales:**
  - Feedback sobre campos incompletos  
  - Advertencia sobre inconsistencias (ej. síntomas sin correlato en diagnóstico)  
  - Generación de resumen estructurado  

### 3. Observabilidad y Trazabilidad

- **Langfuse:**
  - Registro de cada evento: `form.update`, `copilot.feedback`, etc.  
  - Asociación por `traceId` con el paciente/visita  
  - Uso de `span.name` para identificar módulo  

---

## III. FLUJOS DE INTERACCIÓN

1. **Ingreso de datos clínicos:**  
   - Al escribir en cada campo se dispara `trackEvent()`  
   - Se crea un `trace` y `span` en Langfuse con el campo, valor y traceId del paciente  

2. **Activación del copiloto:**  
   - El profesional puede activar al agente para que analice lo ingresado  
   - El copiloto responde con sugerencias, advertencias o aprobaciones  

3. **Registro de feedback:**  
   - Cada sugerencia aplicada o ignorada se registra con evento `copilot.feedback`  

4. **Evaluaciones automáticas (EVALs):**  
   - Se ejecutan scripts que analizan la documentación ingresada  
   - Se valora: completitud, coherencia, legibilidad y valor legal  

---

## IV. MÉTRICAS Y VALIDACIÓN DE IMPACTO

- **Eventos por paciente y campo**  
- **Campos omitidos detectados por IA**  
- **Errores prevenidos (según alertas del copiloto)**  
- **Feedbacks emitidos/aplicados por el profesional**  
- **Evaluaciones automáticas exitosas (EVALs > 80%)**

---

## V. DESPLIEGUE Y ESCALABILIDAD

- **Vercel:** Hosting actual para MVP  
- **CI/CD:** Push a main = despliegue  
- **Próximo paso:** Backend propio en Node.js con base de datos PostgreSQL (si se requiere)  
- **Escalado futuro:** SaaS multi-clínica con ambientes segregados por tenant  

---

## VI. SEGURIDAD Y PRIVACIDAD

- JWT con roles y permisos  
- Datos pseudonimizados en logs  
- Acceso restringido a Langfuse por API keys  
- Plan: encriptación de datos sensibles + auditoría externa  

---

## VII. ENLACE CON LA START-UP VISA DE CANADÁ

AiDuxCare está alineado con los criterios de la SUV:

- **Innovación:** Primera plataforma en su tipo que actúa como copiloto con trazabilidad legal  
- **Escalabilidad:** Diseñado para crecer desde clínicas locales a redes internacionales  
- **Impacto:** Mejora calidad de atención, reduce burnout y protege legalmente  
- **Equipo:** Experiencia en fisioterapia, salud canadiense y tecnología  
- **Validación:** MVP en pruebas reales en España + interés de incubadora canadiense  

---

## VIII. CONCLUSIÓN

Este marco es la base para desarrollar de forma ordenada, escalable y alineada con la visión internacional de AiDuxCare. Sirve tanto para coordinar el trabajo entre IA humanas y artificiales, como para presentar el proyecto ante cualquier evaluador técnico, inversor o entidad de gobierno.

Toda mejora o extensión deberá respetar esta estructura y documentarse como parte del crecimiento controlado del producto.  