# ClinicalAuditLog: Sistema de Trazabilidad Clínica por Visita

## Propósito y utilidad clínica/legal

El componente `ClinicalAuditLog.tsx` permite visualizar en tiempo real todos los eventos clínicos relevantes registrados durante la atención de una visita. Su objetivo es garantizar la trazabilidad legal y clínica de cada acción realizada sobre la ficha del paciente, incluyendo ediciones manuales, sugerencias de IA aceptadas, modificadas o rechazadas, y otras intervenciones relevantes.

Esto aporta:
- **Seguridad jurídica**: registro inalterable de quién hizo qué y cuándo.
- **Auditoría clínica**: permite revisar el historial de cambios y decisiones.
- **Transparencia**: facilita la supervisión y la mejora continua de la calidad asistencial.

## Flujo de datos

1. **Registro del evento**: Cada vez que un profesional edita un campo, acepta/modifica/rechaza una sugerencia de IA, o realiza una acción relevante, se llama a `AuditLogService.logEvent()`, que inserta el evento en la tabla `audit_logs` de Supabase.
2. **Consulta de logs**: El componente `ClinicalAuditLog` llama a `AuditLogService.getLogsByVisitId(visitId)` para obtener todos los eventos asociados a la visita.
3. **Visualización**: Los eventos se muestran en una tabla cronológica, accesible y clara, dentro de la UI de la visita.

## Modelo de datos esperado (Supabase)

```ts
{
  id: string;           // UUID único del evento
  visitId: string;      // UUID de la visita
  timestamp: string;    // Fecha/hora ISO
  action: 'manual_edit' | 'field_updated' | 'ai_suggestion_accepted' | 'ai_suggestion_modified' | 'ai_suggestion_rejected' | ...
  field: string;        // Campo afectado
  oldValue?: string;    // Valor anterior (si aplica)
  newValue?: string;    // Valor nuevo (si aplica)
  modifiedBy: string;   // Email o ID del profesional
  source: 'user' | 'copilot';
}
```

## Ejemplo de respuesta típica

```json
[
  {
    "id": "1",
    "visitId": "visit-1",
    "timestamp": "2024-05-07T10:00:00Z",
    "action": "manual_edit",
    "field": "motivo",
    "oldValue": "Dolor",
    "newValue": "Dolor lumbar",
    "modifiedBy": "doctor@aiduxcare.com",
    "source": "user"
  },
  {
    "id": "2",
    "visitId": "visit-1",
    "timestamp": "2024-05-07T11:00:00Z",
    "action": "ai_suggestion_accepted",
    "field": "diagnostico",
    "oldValue": null,
    "newValue": "Lumbalgia",
    "modifiedBy": "doctor@aiduxcare.com",
    "source": "copilot"
  }
]
```

## Esquema visual del UI (ClinicalAuditLog)

```jsx
<TableContainer component={Paper}>
  <Table aria-label="Tabla de eventos clínicos" size="small">
    <TableHead>
      <TableRow>
        <TableCell><b>Fecha/Hora</b></TableCell>
        <TableCell><b>Campo</b></TableCell>
        <TableCell><b>Acción</b></TableCell>
        <TableCell><b>Usuario</b></TableCell>
        <TableCell><b>Valor anterior</b></TableCell>
        <TableCell><b>Valor nuevo</b></TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {/* ...map de logs... */}
    </TableBody>
  </Table>
</TableContainer>
```

- Acciones traducidas: "manual_edit" → "Edición manual", "ai_suggestion_accepted" → "Sugerencia IA aceptada", etc.
- Loading: spinner centrado.
- Error: mensaje claro.
- Vacío: mensaje "No hay eventos registrados para esta visita."

## Instrucciones de integración

1. Importa el componente:
   ```tsx
   import ClinicalAuditLog from '@/components/VisitDetail/ClinicalAuditLog';
   ```
2. Úsalo en la vista de detalle de visita (`/visits/[id]`):
   ```tsx
   <ClinicalAuditLog visitId={visitId} />
   ```
3. Recomendado: colócalo en una nueva pestaña o sección llamada "Trazabilidad" o "Historial de cambios".
4. El componente se actualizará automáticamente si cambia el `visitId`.

## Accesibilidad y recomendaciones UX

- Tabla con navegación por teclado (`tabIndex={0}` en filas).
- Alto contraste y fuente legible (MUI por defecto).
- Encabezados claros y descriptivos.
- Loading y error accesibles.
- Compatible con lectores de pantalla (aria-label en la tabla).

## Estado de tests y cómo probar

- Test unitario en `src/components/VisitDetail/ClinicalAuditLog.test.tsx`.
- Cubre: renderizado de logs, mensaje vacío, mensaje de error.
- Para probar localmente:
  1. Ejecuta `npm run test` o `npm run test -- src/components/VisitDetail/ClinicalAuditLog.test.tsx`
  2. Verifica que todos los tests pasen.

---

**Esta documentación cierra oficialmente la versión v1.14 de AiDuxCare.** 