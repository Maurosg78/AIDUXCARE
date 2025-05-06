import { MCPContext } from '../CopilotContextBuilder';

export interface MCPTool {
  name: string;
  description: string;
  apply(context: MCPContext): Promise<MCPContext>;
}

export interface MCPToolMetadata {
  appliedAt: string;
  toolName: string;
  modifications: string[];
}

export const enrichContextWithToolMetadata = (
  context: MCPContext,
  metadata: MCPToolMetadata
): MCPContext => {
  return {
    ...context,
    tools_metadata: [
      ...(context.tools_metadata || []),
      metadata
    ]
  };
}; 