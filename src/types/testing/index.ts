import '@testing-library/jest-dom';

export * from './jest';
export * from './testing-library';

// Tipos comunes para testing
export type TestWrapperProps = {
  children: React.ReactNode;
};

export type MockContext = {
  patient_state?: {
    age?: number;
    sex?: 'M' | 'F' | 'O';
    history?: string[];
  };
  visit_metadata?: {
    visit_id?: string;
    date?: string;
    professional?: string;
  };
  rules_and_constraints?: string[];
  system_instructions?: string;
  enrichment?: Record<string, unknown>;
}; 