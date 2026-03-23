import { CalendarLocators } from '../../../../support/locators/calendarLocators';
import CalendarPage from '../../../../support/pages/CalendarPage';

describe('Feature: Multicalendar DSO (Functional)', () => {
    let uiData;
    
    before(() => {
        cy.fixture('test-data/uiData').then((data) => {
            uiData = data;
        });
    });
    beforeEach(() => {
        cy.login();
        cy.visit('/multicalendar');
    });
    context('Negative Scenarios: Error Handling', () => {
        it('Negative (1): Attempt to input invalid characters and verify error handling', () => {
            const listingId = uiData.listingIdTwo;
            const invalidPrice = uiData.invalidPriceOne;
            const expectedError = uiData.expectedErrorOne;
            const todayDate = CalendarPage.getDynamicDate(0).id

            CalendarPage.searchAndVerifyListing(listingId);
            CalendarPage.openDsoModalForDate(todayDate);
            CalendarPage.verifyPriceRangeValidationError(invalidPrice, expectedError, "Price must be an integer");
            cy.get(CalendarLocators.modalTitle).should('be.visible');
        });

        it('Negative (2): Attempt to input or out-of-range percentages and verify error handling', () => {
            const listingId = uiData.listingIdTwo;
            const invalidPrice = uiData.invalidPriceTwo;
            const expectedError = uiData.expectedErrorTwo;
            const Date =  CalendarPage.getDynamicDate(0).id

            CalendarPage.searchAndVerifyListing(listingId);
            CalendarPage.openDsoModalForDate(Date);
            CalendarPage.verifyPriceRangeValidationError(invalidPrice, expectedError, "Please fix the errors to save DSO.");
            cy.get(CalendarLocators.modalTitle).should('be.visible');
        });
    });
});