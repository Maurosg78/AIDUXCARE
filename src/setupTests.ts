import '@testing-library/jest-dom';

// Extender expect con matchers personalizados
expect.extend({
  toBeInTheDocument(received) {
    const pass = received !== null;
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to be in the document`,
      pass,
    };
  },
  toHaveValue(received, expected) {
    const pass = received.value === expected;
    return {
      message: () => `expected ${received} ${pass ? 'not ' : ''}to have value ${expected}`,
      pass,
    };
  },
}); 