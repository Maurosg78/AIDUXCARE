import { supabase } from '@/core/lib/supabase';
import { trackEvent } from '@/core/lib/langfuse.client';

/**
 * Servicio para firma digital de documentos clínicos
 * Permite generar hashes SHA-256 y registrar firmas digitales en la base de datos
 */
export class DocumentSignatureService {
  /**
   * Genera un hash SHA-256 a partir de datos binarios
   * @param data Array de bytes (Uint8Array) para generar el hash
   * @returns Promise con el hash en formato hexadecimal
   */
  static async generateHash(data: Uint8Array): Promise<string> {
    try {
      // Usar la API de Web Crypto para generar el hash SHA-256
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      
      // Convertir el buffer a un array de bytes
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      
      // Convertir los bytes a string hexadecimal
      const hashHex = hashArray
        .map(byte => byte.toString(16).padStart(2, '0'))
        .join('');
      
      return hashHex;
    } catch (error) {
      console.error('Error al generar hash SHA-256:', error);
      throw new Error('No se pudo generar el hash del documento');
    }
  }
  
  /**
   * Firma un documento médico y registra la firma en la base de datos
   * @param visitId ID de la visita relacionada con el documento
   * @param professionalId ID del profesional que firma el documento
   * @param documentData Datos binarios del documento
   * @returns Promise con el resultado de la operación
   */
  static async signDocument(
    visitId: string,
    professionalId: string,
    documentData: Uint8Array
  ): Promise<{ success: boolean; hash: string; error?: string }> {
    try {
      // Generar el hash del documento
      const hash = await this.generateHash(documentData);
      
      // Verificar si ya existe una firma para este documento
      const { data: existingSignatures } = await supabase
        .from('signatures')
        .select('id')
        .eq('visit_id', visitId)
        .eq('hash', hash);
      
      // Si ya existe una firma con el mismo hash, evitar duplicados
      if (existingSignatures && existingSignatures.length > 0) {
        return { 
          success: true, 
          hash, 
          error: 'El documento ya ha sido firmado previamente con el mismo contenido' 
        };
      }
      
      // Registrar la firma en la base de datos
      const { data, error } = await supabase
        .from('signatures')
        .insert({
          visit_id: visitId,
          professional_id: professionalId,
          hash
        });
      
      // Registrar evento en Langfuse
      await trackEvent('document.signed', {
        visitId,
        professionalId,
        hash,
        action: 'sign_document',
        timestamp: new Date().toISOString()
      });
      
      if (error) {
        console.error('Error al registrar firma:', error);
        return { success: false, hash, error: error.message };
      }
      
      return { success: true, hash };
    } catch (error) {
      console.error('Error al firmar documento:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return { success: false, hash: '', error: errorMessage };
    }
  }
  
  /**
   * Verifica la validez de una firma digital
   * @param visitId ID de la visita
   * @param hash Hash SHA-256 a verificar
   * @returns Promise con el resultado de la verificación
   */
  static async verifySignature(
    visitId: string,
    hash: string
  ): Promise<{ valid: boolean; signature?: any; error?: string }> {
    try {
      // Buscar la firma en la base de datos
      const { data: signatures, error } = await supabase
        .from('signatures')
        .select('*')
        .eq('visit_id', visitId)
        .eq('hash', hash);
      
      if (error) {
        console.error('Error al verificar firma:', error);
        return { valid: false, error: error.message };
      }
      
      // Verificar si se encontró la firma
      if (!signatures || signatures.length === 0) {
        return { valid: false, error: 'No se encontró una firma válida para el documento' };
      }
      
      // Registrar evento en Langfuse
      await trackEvent('document.verified', {
        visitId,
        hash,
        action: 'verify_signature',
        timestamp: new Date().toISOString()
      });
      
      return { valid: true, signature: signatures[0] };
    } catch (error) {
      console.error('Error al verificar firma:', error);
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      return { valid: false, error: errorMessage };
    }
  }
}

// Exportar una instancia única del servicio
export default DocumentSignatureService; 