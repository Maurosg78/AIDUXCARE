import type { AssistantContext } from "../models/AssistantContext.js";

export const getAssistantResponse = async (context: AssistantContext): Promise<string> => {
  if (!context.patientName) return "No se ha cargado un paciente.";
  return `👤 Paciente: ${context.patientName}\n📋 Recomendación: Sugiere realizar una evaluación neurológica debido a los síntomas referidos.`;
};
