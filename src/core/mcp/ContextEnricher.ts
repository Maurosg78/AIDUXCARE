import { MCPContext, EnrichedMCPContextSchema } from './schemas';
import { trackEvent } from '../lib/langfuse.client';
import { PatientService } from '../services/PatientService';
import { EMREnrichmentSource } from './enrichment/EMREnrichmentSource';

export interface EnrichmentSource {
  name: string;
  getEnrichmentData(context: MCPContext): Promise<Record<string, unknown>>;
}

export class LangfuseEnrichmentSource implements EnrichmentSource {
  name = 'langfuse';

  async getEnrichmentData(context: MCPContext): Promise<Record<string, unknown>> {
    try {
      const response = await trackEvent('context.enrich', {
        context_id: context.visit_metadata.visit_id,
        timestamp: new Date().toISOString()
      });

      return {
        trace_id: response?.traceId,
        enriched_at: new Date().toISOString()
      };
    } catch (error) {
      console.warn('Error al enriquecer con Langfuse:', error);
      return {};
    }
  }
}

export class GlobalRulesEnrichmentSource implements EnrichmentSource {
  name = 'global_rules';
  private static GLOBAL_RULES = [
    "Mantener registro de todas las decisiones clínicas",
    "Documentar cualquier desviación del protocolo estándar",
    "Verificar alergias y contraindicaciones",
    "Respetar preferencias del paciente"
  ];

  async getEnrichmentData(): Promise<Record<string, unknown>> {
    return {
      global_rules: GlobalRulesEnrichmentSource.GLOBAL_RULES,
      applied_at: new Date().toISOString()
    };
  }
}

export class ContextEnricher {
  private sources: EnrichmentSource[];

  constructor(patientService: PatientService) {
    this.sources = [
      new LangfuseEnrichmentSource(),
      new GlobalRulesEnrichmentSource(),
      new EMREnrichmentSource(patientService)
    ];
  }

  async enrich(context: MCPContext): Promise<MCPContext> {
    try {
      const enrichmentData = await Promise.all(
        this.sources.map(async source => ({
          source: source.name,
          data: await source.getEnrichmentData(context)
        }))
      );

      const enrichedContext = {
        ...context,
        enrichment: enrichmentData.reduce((acc, { source, data }) => ({
          ...acc,
          [source]: data
        }), {})
      };

      // Validar el contexto enriquecido
      return EnrichedMCPContextSchema.parse(enrichedContext);
    } catch (error) {
      console.error('Error durante el enriquecimiento del contexto:', error);
      // Retornar contexto original si falla el enriquecimiento
      return context;
    }
  }
} 