-- Tabla validation_alerts para el registro legal de alertas de validación clínica
-- AiDuxCare v1.28.0

CREATE TABLE IF NOT EXISTS validation_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    visit_id TEXT NOT NULL,
    field TEXT,
    severity TEXT NOT NULL, -- 'warning', 'error', 'info'
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    
    -- Índices para consultas frecuentes
    CONSTRAINT fk_visit FOREIGN KEY (visit_id) REFERENCES visits(id) ON DELETE CASCADE,
    CONSTRAINT valid_severity CHECK (severity IN ('warning', 'error', 'info'))
);

-- Índices para mejorar el rendimiento de consultas
CREATE INDEX IF NOT EXISTS idx_validation_alerts_visit_id ON validation_alerts(visit_id);
CREATE INDEX IF NOT EXISTS idx_validation_alerts_field ON validation_alerts(field);
CREATE INDEX IF NOT EXISTS idx_validation_alerts_type ON validation_alerts(type);
CREATE INDEX IF NOT EXISTS idx_validation_alerts_timestamp ON validation_alerts(timestamp);

-- Comentarios explicativos para la tabla y columnas
COMMENT ON TABLE validation_alerts IS 'Registro legal de alertas de validación clínica generadas por el MCP';
COMMENT ON COLUMN validation_alerts.id IS 'Identificador único de la alerta';
COMMENT ON COLUMN validation_alerts.visit_id IS 'ID de la visita a la que pertenece la alerta';
COMMENT ON COLUMN validation_alerts.field IS 'Campo clínico al que se refiere la alerta (anamnesis, exploracion, etc.)';
COMMENT ON COLUMN validation_alerts.severity IS 'Nivel de severidad: warning, error, info';
COMMENT ON COLUMN validation_alerts.type IS 'Tipo específico de alerta (campo_faltante, texto_breve, etc.)';
COMMENT ON COLUMN validation_alerts.message IS 'Mensaje descriptivo de la alerta';
COMMENT ON COLUMN validation_alerts.timestamp IS 'Fecha y hora en que se registró la alerta';

-- Política RLS para control de acceso
ALTER TABLE validation_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY validation_alerts_access_policy ON validation_alerts
    USING (auth.uid() IN (
        SELECT user_id FROM visit_permissions WHERE visit_id = validation_alerts.visit_id
    )); 