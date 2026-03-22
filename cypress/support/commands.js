import { LoginLocators } from "./locators/loginLocators";

Cypress.Commands.add('login', () => {
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
        cy.get(LoginLocators.userEmailInputField).should('be.visible').type(userIdentifier);
        cy.get(LoginLocators.userPasswordInputField).should('be.visible').type(credentials.password, { log: false });
        cy.get(LoginLocators.signInButton).click();
    })
});