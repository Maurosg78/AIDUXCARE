import React from 'react';
import { AuditLogService } from '@/core/services/AuditLogService';
import { useAuth } from '@/core/context/AuthContext';

// Definición del tipo StructuredSuggestion
interface StructuredSuggestionType {
  id: string;
  field: string;
  value: string;
  confidence: number;
  source: string;
  reference?: {
    url: string;
    source: string;
    year: number;
  };
}

interface FieldWithSuggestionProps {
  field: string;
  value: string;
  suggestion?: StructuredSuggestionType;
  onAcceptSuggestion: (suggestion: StructuredSuggestionType) => void;
  onRejectSuggestion: (suggestion: StructuredSuggestionType) => void;
  visitId: string;
}

export const FieldWithSuggestion: React.FC<FieldWithSuggestionProps> = ({
  field,
  value,
  suggestion,
  onAcceptSuggestion,
  onRejectSuggestion,
  visitId,
}) => {
  const { user } = useAuth();

  const handleAccept = () => {
    if (!suggestion) return;
    // Detectar si el usuario editó la sugerencia antes de aceptar
    if (suggestion.value !== value) {
      AuditLogService.logEvent({
        visitId,
        field,
        oldValue: String(suggestion.value),
        newValue: value,
        modifiedBy: user?.user.email || 'desconocido',
        action: 'ai_suggestion_modified',
        source: 'copilot',
      });
    } else {
      AuditLogService.logEvent({
        visitId,
        field,
        newValue: String(suggestion.value),
        modifiedBy: user?.user.email || 'desconocido',
        action: 'ai_suggestion_accepted',
        source: 'copilot',
      });
    }
    onAcceptSuggestion(suggestion);
  };

  const handleReject = () => {
    if (!suggestion) return;
    AuditLogService.logEvent({
      visitId,
      field,
      oldValue: String(suggestion.value),
      modifiedBy: user?.user.email || 'desconocido',
      action: 'ai_suggestion_rejected',
      source: 'copilot',
    });
    onRejectSuggestion(suggestion);
  };

  const fieldId = `field-${field.toLowerCase().replace(/\s+/g, '-')}`;

  return (
    <div className="space-y-2">
      <div className="flex items-start gap-2">
        <div className="flex-1">
          <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700">
            {field}
          </label>
          <div className="mt-1">
            <textarea
              id={fieldId}
              value={value}
              readOnly
              aria-label={`Campo ${field}`}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              rows={3}
            />
          </div>
        </div>
      </div>

      {suggestion && (
        <div className="bg-blue-50 p-4 rounded-md">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm text-blue-800">{suggestion.value}</p>
              {suggestion.reference ? (
                <small className="text-xs text-gray-600 mt-1 block">
                  🔗 Fuente:{' '}
                  <a
                    href={suggestion.reference.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline text-blue-600"
                  >
                    {suggestion.reference.source} ({suggestion.reference.year})
                  </a>
                </small>
              ) : (
                <small className="text-xs text-gray-600 mt-1 block">
                  🔍 Generado por IA (sin fuente externa)
                </small>
              )}
            </div>
            <div className="flex gap-2 ml-4">
              <button
                onClick={handleAccept}
                className="inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Aceptar
              </button>
              <button
                onClick={handleReject}
                className="inline-flex items-center px-2.5 py-1.5 border border-gray-300 text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Rechazar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};