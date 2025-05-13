import { PatientVisit } from "@/modules/emr/models/PatientVisit";

export type Suggestion = {
  type: "alert" | "recommendation";
  message: string;
};

export class CopilotService {
  static analyzeVisit(visit: PatientVisit): Suggestion[] {
    const suggestions: Suggestion[] = [];

    if (!visit.visitDate) {
      suggestions.push({
        type: "alert",
        message: "La visita no tiene una fecha asignada.",
      });
    }

    if (!visit.notes || visit.notes.length < 10) {
      suggestions.push({
        type: "recommendation",
        message: "Agrega más detalles clínicos en las notas.",
      });
    }

    if (visit.status === "scheduled" && new Date(visit.visitDate) < new Date()) {
      suggestions.push({
        type: "alert",
        message: "Esta visita estaba programada en el pasado pero sigue marcada como 'scheduled'.",
      });
    }

    return suggestions;
  }
}
