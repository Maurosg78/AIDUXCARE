// Definimos las interfaces para el contexto MCP

export interface MCPContext {
  patient_state?: {
    sex?: 'M' | 'F' | 'O';
    age?: number;
    history?: string[];
  };
  visit_metadata?: {
    professional?: string;
    date?: string;
    visit_id?: string;
  };
  rules_and_constraints?: string[];
  system_instructions?: string;
  enrichment?: Record<string, unknown>;
  tools_metadata?: unknown[];
}

// Contexto enriquecido extendiendo el contexto base
export interface EnrichedMCPContext extends MCPContext {
  patient_data?: {
    name?: string;
    allergies?: string[];
    medications?: string[];
    conditions?: string[];
  };
  reference_data?: {
    clinical_guidelines?: string[];
    documentation_templates?: string[];
    medication_interactions?: string[];
  };
  ai_metadata?: {
    model?: string;
    version?: string;
    capabilities?: string[];
  };
} 