describe('Flujo Clínico EMR', () => {
  beforeEach(() => {
    // Limpiar localStorage antes de cada prueba
    cy.clearLocalStorage();
  });

  it('Debe permitir login y completar una visita clínica', () => {
    // 1. Visitar la página de login
    cy.visit('/login');

    // 2. Hacer login
    cy.get('[data-testid="email-input"]').type('mauricio@axonvalencia.es');
    cy.get('[data-testid="password-input"]').type('Test1234!');
    cy.get('[data-testid="login-button"]').click();

    // 3. Verificar redirección al dashboard
    cy.url().should('include', '/dashboard');

    // 4. Navegar al EMR
    cy.get('[data-testid="emr-link"]').click();
    cy.url().should('include', '/dashboard/emr');

    // 5. Completar formulario clínico
    cy.get('[data-testid="chief-complaint"]').type('Dolor lumbar agudo');
    cy.get('[data-testid="symptoms"]').type('Dolor al movimiento, Rigidez matutina');
    cy.get('[data-testid="diagnosis"]').type('Lumbalgia mecánica');
    cy.get('[data-testid="treatment-plan"]').type('Ejercicios de estabilización lumbar');
    cy.get('[data-testid="follow-up"]').type('Control en 7 días');

    // 6. Guardar visita
    cy.get('[data-testid="save-visit"]').click();

    // 7. Verificar mensaje de éxito
    cy.get('[data-testid="success-message"]')
      .should('be.visible')
      .and('contain', 'Visita guardada exitosamente');

    // 8. Verificar datos en localStorage
    cy.window().then((win) => {
      const storedVisits = JSON.parse(win.localStorage.getItem('visits') || '[]');
      expect(storedVisits).to.have.length.at.least(1);
      const lastVisit = storedVisits[storedVisits.length - 1];
      expect(lastVisit).to.have.property('chiefComplaint', 'Dolor lumbar agudo');
    });
  });

  it('Debe mostrar errores de validación', () => {
    cy.visit('/login');
    cy.get('[data-testid="email-input"]').type('mauricio@axonvalencia.es');
    cy.get('[data-testid="password-input"]').type('Test1234!');
    cy.get('[data-testid="login-button"]').click();
    cy.get('[data-testid="emr-link"]').click();

    // Intentar guardar sin datos
    cy.get('[data-testid="save-visit"]').click();

    // Verificar mensajes de error
    cy.get('[data-testid="error-chief-complaint"]')
      .should('be.visible')
      .and('contain', 'El motivo de consulta es obligatorio');
    cy.get('[data-testid="error-symptoms"]')
      .should('be.visible')
      .and('contain', 'Los síntomas son obligatorios');
  });
}); 