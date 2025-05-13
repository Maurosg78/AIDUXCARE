import { PDFDocument, rgb, StandardFonts, PageSizes } from 'pdf-lib';
import type { Visit, Patient, User, PatientEval  } from '@/core/types';
import { trackEvent } from '@/core/lib/langfuse.client';
import DocumentSignatureService from '@/core/services/security/DocumentSignatureService';

/**
 * Clase para el servicio de exportación de documentos
 * Encargada de generar PDFs a partir de datos de la aplicación
 */
export class ExportService {
  /**
   * Genera un PDF con los datos de una visita médica
   * @param visit Datos de la visita
   * @param patient Datos del paciente
   * @param professional Datos del profesional
   * @param evaluation Datos de la evaluación clínica
   * @param signDocument Indica si se debe firmar digitalmente el documento
   * @returns Array de bytes (Uint8Array) que representa el documento PDF
   */
  static async generateVisitPDF(
    visit: Visit,
    patient: Patient,
    professional: User,
    evaluation?: PatientEval,
    signDocument: boolean = true
  ): Promise<Uint8Array> {
    try {
      // Registrar evento de generación de PDF
      await trackEvent('emr.generate_pdf', {
        visitId: visit.id,
        patientId: visit.patientId,
        professionalId: professional.id,
        action: 'export',
        operation: 'generateVisitPDF'
      });

      // Crear un nuevo documento PDF
      const pdfDoc = await PDFDocument.create();
      
      // Agregar una página al documento (tamaño A4)
      const page = pdfDoc.addPage(PageSizes.A4);
      
      // Obtener las fuentes estándar
      const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
      const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const helveticaOblique = await pdfDoc.embedFont(StandardFonts.HelveticaOblique);
      
      // Dimensiones de la página
      const { width, height } = page.getSize();
      const margin = 50;
      const contentWidth = width - 2 * margin;
      
      // Colores para el documento
      const primaryColor = rgb(0.13, 0.4, 0.76); // Azul AiDuxCare
      const textColor = rgb(0.1, 0.1, 0.1);      // Casi negro
      const subtitleColor = rgb(0.4, 0.4, 0.4);  // Gris
      
      // -- ENCABEZADO --
      let currentY = height - margin;
      
      // Logo / Título
      page.drawText('AiDuxCare', {
        x: margin,
        y: currentY,
        size: 24,
        font: helveticaBold,
        color: primaryColor,
      });
      
      // Fecha y hora del documento
      const now = new Date();
      const formattedDate = now.toLocaleDateString('es-ES', {
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric'
      });
      
      const formattedTime = now.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
      });
      
      page.drawText(`Fecha de impresión: ${formattedDate} ${formattedTime}`, {
        x: width - margin - 200,
        y: currentY,
        size: 10,
        font: helvetica,
        color: subtitleColor,
      });
      
      currentY -= 20;
      
      // Línea separadora
      page.drawLine({
        start: { x: margin, y: currentY },
        end: { x: width - margin, y: currentY },
        thickness: 1,
        color: primaryColor,
      });
      
      currentY -= 30;
      
      // -- TÍTULO DOCUMENTO --
      page.drawText('INFORME DE VISITA CLÍNICA', {
        x: margin,
        y: currentY,
        size: 16,
        font: helveticaBold,
        color: primaryColor,
      });
      
      currentY -= 40;
      
      // -- DATOS DEL PACIENTE --
      page.drawText('DATOS DEL PACIENTE', {
        x: margin,
        y: currentY,
        size: 14,
        font: helveticaBold,
        color: primaryColor,
      });
      
      currentY -= 20;
      
      // Nombre del paciente
      page.drawText(`Nombre: ${patient.firstName} ${patient.lastName}`, {
        x: margin,
        y: currentY,
        size: 12,
        font: helvetica,
        color: textColor,
      });
      
      currentY -= 20;
      
      // ID del paciente
      page.drawText(`ID Paciente: ${patient.id}`, {
        x: margin,
        y: currentY,
        size: 12,
        font: helvetica,
        color: textColor,
      });
      
      // Datos adicionales en la misma línea (si están disponibles)
      if (patient.age) {
        page.drawText(`Edad: ${patient.age} años`, {
          x: margin + 250,
          y: currentY,
          size: 12,
          font: helvetica,
          color: textColor,
        });
      }
      
      currentY -= 20;
      
      // Email del paciente (si está disponible)
      if (patient.email) {
        page.drawText(`Email: ${patient.email}`, {
          x: margin,
          y: currentY,
          size: 12,
          font: helvetica,
          color: textColor,
        });
        
        currentY -= 20;
      }
      
      // Teléfono del paciente (si está disponible)
      if (patient.phone) {
        page.drawText(`Teléfono: ${patient.phone}`, {
          x: margin,
          y: currentY,
          size: 12,
          font: helvetica,
          color: textColor,
        });
        
        currentY -= 20;
      }
      
      currentY -= 20;
      
      // -- DATOS DE LA VISITA --
      page.drawText('DATOS DE LA VISITA', {
        x: margin,
        y: currentY,
        size: 14,
        font: helveticaBold,
        color: primaryColor,
      });
      
      currentY -= 20;
      
      // ID de visita
      page.drawText(`ID Visita: ${visit.id}`, {
        x: margin,
        y: currentY,
        size: 12,
        font: helvetica,
        color: textColor,
      });
      
      currentY -= 20;
      
      // Fecha de la visita
      const visitDate = new Date(visit.date || visit.visitDate || now.toISOString());
      page.drawText(`Fecha: ${visitDate.toLocaleDateString('es-ES', {
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric'
      })}`, {
        x: margin,
        y: currentY,
        size: 12,
        font: helvetica,
        color: textColor,
      });
      
      // Estado de la visita
      page.drawText(`Estado: ${visit.status}`, {
        x: margin + 250,
        y: currentY,
        size: 12,
        font: helvetica,
        color: textColor,
      });
      
      currentY -= 20;
      
      // Tipo de visita (si está disponible)
      if (visit.type || visit.visitType) {
        page.drawText(`Tipo: ${visit.type || visit.visitType}`, {
          x: margin,
          y: currentY,
          size: 12,
          font: helvetica,
          color: textColor,
        });
        
        currentY -= 20;
      }
      
      currentY -= 20;
      
      // -- DATOS CLÍNICOS --
      if (evaluation) {
        page.drawText('DATOS CLÍNICOS', {
          x: margin,
          y: currentY,
          size: 14,
          font: helveticaBold,
          color: primaryColor,
        });
        
        currentY -= 30;

        // Motivo de consulta
        if (evaluation.motivo || evaluation.anamnesis) {
          page.drawText('Motivo de consulta / Anamnesis:', {
            x: margin,
            y: currentY,
            size: 12,
            font: helveticaBold,
            color: textColor,
          });
          
          currentY -= 20;
          
          const motivoText = evaluation.motivo || evaluation.anamnesis || 'No especificado';
          const motivoLines = this.getTextLines(motivoText, helvetica, 11, contentWidth);
          
          motivoLines.forEach(line => {
            page.drawText(line, {
              x: margin,
              y: currentY,
              size: 11,
              font: helvetica,
              color: textColor,
            });
            
            currentY -= 15;
          });
          
          currentY -= 10;
        }
        
        // Exploración física
        if (evaluation.physicalExam) {
          page.drawText('Exploración física:', {
            x: margin,
            y: currentY,
            size: 12,
            font: helveticaBold,
            color: textColor,
          });
          
          currentY -= 20;
          
          const explorationLines = this.getTextLines(evaluation.physicalExam, helvetica, 11, contentWidth);
          
          explorationLines.forEach(line => {
            page.drawText(line, {
              x: margin,
              y: currentY,
              size: 11,
              font: helvetica,
              color: textColor,
            });
            
            currentY -= 15;
          });
          
          currentY -= 10;
        }
        
        // Diagnóstico
        if (evaluation.diagnosis || evaluation.diagnosticoFisioterapeutico) {
          page.drawText('Diagnóstico:', {
            x: margin,
            y: currentY,
            size: 12,
            font: helveticaBold,
            color: textColor,
          });
          
          currentY -= 20;
          
          const diagnosisText = evaluation.diagnosis || evaluation.diagnosticoFisioterapeutico || 'No especificado';
          const diagnosisLines = this.getTextLines(diagnosisText, helvetica, 11, contentWidth);
          
          diagnosisLines.forEach(line => {
            page.drawText(line, {
              x: margin,
              y: currentY,
              size: 11,
              font: helvetica,
              color: textColor,
            });
            
            currentY -= 15;
          });
          
          currentY -= 10;
        }
        
        // Plan de tratamiento
        if (evaluation.treatment || evaluation.tratamientoPropuesto) {
          page.drawText('Plan de tratamiento:', {
            x: margin,
            y: currentY,
            size: 12,
            font: helveticaBold,
            color: textColor,
          });
          
          currentY -= 20;
          
          const treatmentText = evaluation.treatment || evaluation.tratamientoPropuesto || 'No especificado';
          const treatmentLines = this.getTextLines(treatmentText, helvetica, 11, contentWidth);
          
          treatmentLines.forEach(line => {
            page.drawText(line, {
              x: margin,
              y: currentY,
              size: 11,
              font: helvetica,
              color: textColor,
            });
            
            currentY -= 15;
          });
          
          currentY -= 10;
        }
        
        // Observaciones (si están disponibles)
        if (evaluation.observations) {
          page.drawText('Observaciones:', {
            x: margin,
            y: currentY,
            size: 12,
            font: helveticaBold,
            color: textColor,
          });
          
          currentY -= 20;
          
          const observationsLines = this.getTextLines(evaluation.observations, helvetica, 11, contentWidth);
          
          observationsLines.forEach(line => {
            page.drawText(line, {
              x: margin,
              y: currentY,
              size: 11,
              font: helvetica,
              color: textColor,
            });
            
            currentY -= 15;
          });
          
          currentY -= 10;
        }
      } else {
        // Mensaje cuando no hay datos clínicos
        page.drawText('No hay datos clínicos disponibles', {
          x: margin,
          y: currentY,
          size: 12,
          font: helveticaOblique,
          color: subtitleColor,
        });
        
        currentY -= 30;
      }
      
      // -- FIRMA DEL PROFESIONAL --
      currentY = Math.min(currentY, 150); // Asegurar espacio para la firma
      
      // Línea de firma
      page.drawLine({
        start: { x: margin, y: currentY },
        end: { x: margin + 200, y: currentY },
        thickness: 1,
        color: subtitleColor,
      });
      
      currentY -= 15;
      
      // Nombre del profesional
      page.drawText(`${professional.name}`, {
        x: margin,
        y: currentY,
        size: 11,
        font: helveticaBold,
        color: textColor,
      });
      
      currentY -= 15;
      
      // Rol del profesional
      page.drawText(`${this.getRoleDisplay(professional.role)}`, {
        x: margin,
        y: currentY,
        size: 10,
        font: helvetica,
        color: textColor,
      });
      
      currentY -= 15;
      
      // Fecha de firma
      page.drawText(`Fecha: ${formattedDate}`, {
        x: margin,
        y: currentY,
        size: 10,
        font: helvetica,
        color: textColor,
      });
      
      // -- PIE DE PÁGINA --
      const footerY = 30;
      
      // Línea separadora del pie de página
      page.drawLine({
        start: { x: margin, y: footerY + 10 },
        end: { x: width - margin, y: footerY + 10 },
        thickness: 0.5,
        color: subtitleColor,
      });
      
      // Texto del pie de página
      page.drawText('Este documento fue generado por AiDuxCare - Sistema de Gestión Clínica', {
        x: margin,
        y: footerY,
        size: 8,
        font: helvetica,
        color: subtitleColor,
      });
      
      // Numeración de página
      page.drawText('Página 1 de 1', {
        x: width - margin - 60,
        y: footerY,
        size: 8,
        font: helvetica,
        color: subtitleColor,
      });
      
      // Serializar el documento a bytes
      const pdfBytes = await pdfDoc.save();
      
      // Si se solicita la firma digital, registrarla
      if (signDocument) {
        try {
          // Registrar la firma digital
          const signResult = await DocumentSignatureService.signDocument(
            visit.id,
            professional.id,
            pdfBytes
          );
          
          if (!signResult.success) {
            console.warn('No se pudo registrar la firma digital:', signResult.error);
          } else {
            console.log(`Documento firmado digitalmente. Hash: ${signResult.hash}`);
          }
        } catch (signError) {
          console.error('Error al firmar digitalmente el documento:', signError);
          // Continuamos para devolver el PDF aunque la firma falle
        }
      }
      
      return pdfBytes;
    } catch (error) {
      console.error('Error al generar PDF de visita:', error);
      throw new Error('No se pudo generar el PDF de la visita');
    }
  }
  
  /**
   * Divide un texto largo en líneas que quepan en el ancho disponible
   */
  private static getTextLines(
    text: string,
    font: any,
    fontSize: number,
    maxWidth: number
  ): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';
    
    words.forEach(word => {
      // Manejar saltos de línea en el texto original
      if (word.includes('\n')) {
        const segments = word.split('\n');
        
        // Procesar primer segmento con la línea actual
        const testLine = currentLine + (currentLine ? ' ' : '') + segments[0];
        const width = font.widthOfTextAtSize(testLine, fontSize);
        
        if (width <= maxWidth) {
          currentLine = testLine;
        } else {
          lines.push(currentLine);
          currentLine = segments[0];
        }
        
        // Agregar la línea actual
        lines.push(currentLine);
        
        // Procesar los segmentos restantes (si hay)
        currentLine = '';
        for (let i = 1; i < segments.length; i++) {
          if (i === segments.length - 1) {
            // El último segmento se convierte en la línea actual
            currentLine = segments[i];
          } else {
            // Los segmentos intermedios son líneas completas
            lines.push(segments[i]);
          }
        }
      } else {
        // Comportamiento normal para palabras sin saltos de línea
        const testLine = currentLine + (currentLine ? ' ' : '') + word;
        const width = font.widthOfTextAtSize(testLine, fontSize);
        
        if (width <= maxWidth) {
          currentLine = testLine;
        } else {
          lines.push(currentLine);
          currentLine = word;
        }
      }
    });
    
    // Agregar la última línea si no está vacía
    if (currentLine) {
      lines.push(currentLine);
    }
    
    return lines;
  }
  
  /**
   * Convierte el rol del sistema a un texto más amigable
   */
  private static getRoleDisplay(role: string): string {
    const roleMap: Record<string, string> = {
      'admin': 'Administrador',
      'professional': 'Profesional Médico',
      'fisioterapeuta': 'Fisioterapeuta',
      'secretary': 'Secretario/a',
      'developer': 'Desarrollador'
    };
    
    return roleMap[role] || role;
  }

  /**
   * Verifica la firma digital de un documento PDF
   * @param visitId ID de la visita asociada al documento
   * @param pdfBytes Array de bytes del documento PDF
   * @returns Promise con el resultado de la verificación
   */
  static async verifyDocumentSignature(
    visitId: string,
    pdfBytes: Uint8Array
  ): Promise<{ valid: boolean; signature?: any; error?: string }> {
    try {
      // Generar el hash del documento
      const hash = await DocumentSignatureService.generateHash(pdfBytes);
      
      // Verificar si existe una firma con ese hash
      return await DocumentSignatureService.verifySignature(visitId, hash);
    } catch (error) {
      console.error('Error al verificar la firma del documento:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return { valid: false, error: errorMessage };
    }
  }
}

// Exportar una instancia única del servicio (singleton)
export default ExportService; 