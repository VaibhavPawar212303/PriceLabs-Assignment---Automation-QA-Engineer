Cypress.Commands.add('loginViaUI', () => {
    const credentials = Cypress.env('credentials');
    const userIdentifier = credentials?.email || credentials?.username;

    if (!userIdentifier) {
        throw new Error("❌ Credentials missing in environment config.");
    }

    // cy.session(id, setup, options)
    cy.session(userIdentifier, () => {
        // --- THIS BLOCK RUNS ONLY IF THE SESSION IS NOT CACHED ---
        cy.log('🔑 No active session found. Performing fresh login...');
        // 1. Visit the sign-in page
        cy.visit('/signin');
        // 2. Perform Login Actions
        cy.get('#user_email').should('be.visible').type(userIdentifier);
        cy.get('[name="user[password]"]').should('be.visible').type(credentials.password, { log: false });
        cy.get('input[type="submit"]').click();
    })
    // --- THIS BLOCK RUNS EVERY TIME ---
    // After restoring or creating the session, navigate to the target page
    cy.visit('/multicalendar');
    cy.url().should('include', '/multicalendar');
});