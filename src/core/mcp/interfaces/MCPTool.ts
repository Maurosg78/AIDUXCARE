interface MCPToolParameter {
  type: string;
  description?: string;
  enum?: string[];
  items?: MCPToolParameter;
  properties?: Record<string, MCPToolParameter>;
  required?: string[];
}

export interface MCPToolDefinition {
  type: string;
  function: {
    name: string;
    description: string;
    parameters: {
      type: string;
      properties: Record<string, MCPToolParameter>;
      required?: string[];
    };
  };
}

export interface MCPContext {
  patient_state: {
    history: string[];
    age: number;
    sex: "M" | "F" | "O";
  };
  visit_metadata: {
    professional: string;
    date: string;
    visit_id: string;
  };
  rules_and_constraints: string[];
  system_instructions: string;
  enrichment: Record<string, unknown>;
  tools_metadata?: MCPToolDefinition[];
}

export const getDynamicTools = (context: MCPContext): MCPToolDefinition[] => {
  return [
    ...(context.tools_metadata || []),
    {
      type: "function",
      function: {
        name: "get_patient_info",
        description: "Obtiene información del paciente actual",
        parameters: {
          type: "object",
          properties: {},
          required: []
        }
      }
    }
  ];
};