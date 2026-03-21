import { CalendarLocators } from '../../../../support/locators/calendarLocators';
import CalendarPage from '../../../../support/pages/CalendarPage';

describe('Feature: Multicalendar DSO (Functional)', () => {
    const listingId = "VRMREALTY___50";
    const newPrice = "145";
    const bulkPrice = "225";


    beforeEach(() => {
        cy.login();
        cy.visit('/multicalendar');
    });

    it('Functional (1): Update DSO values for a single date; verify "Save" persistence', () => {
        // 1. Search and Select the listing
        CalendarPage.searchAndVerifyListing(listingId);

        // 2. Open the Modal (Clicking the pricing cell index 4)
        CalendarPage.openDsoModalForDate(listingId, 4);

        // 3. Perform the Update
        CalendarPage.updatePrice(newPrice);

        // 4. Verification: persistence check on the grid
        CalendarPage.verifyGridPrice(listingId, 4, newPrice);
        
        // 5. Final check: Toast visibility (Requirement: Negative/Toast messages)
        cy.get('body').should('contain', 'updated');
    });

    it('Functional (2): Bulk update for a date range; verify "Save" persistence', () => {
        // 1. Search listing
        CalendarPage.searchAndVerifyListing(listingId);

        // 2. Open Modal for the first date (Index 4)
        CalendarPage.openDsoModalForDate(listingId, 4);

        // 3. Perform Bulk Update
        // (Assuming the modal is already set to a range or we use the default range)
        CalendarPage.bulkUpdatePrice(bulkPrice);

        // 4. Requirement: Verify Persistence across the range
        // We check index 4 (Start Date) and index 5 (End Date)
        CalendarPage.verifyRangePersistence(listingId, 4, 5, bulkPrice);
    });

    context('Advanced Interaction: Drag & Drop', () => {
        it('Drag & Drop (1): Demonstrate proficiency by automating a range selection', () => {
            const listingId = "VRMREALTY___50";

            // 1. Navigate and search
            CalendarPage.searchAndVerifyListing(listingId);

            // 2. Drag from Mar 21 (Index 4) to Mar 23 (Index 6)
            // This selects a 3-day range
            CalendarPage.dragAndDropDateRange(listingId, 4, 5);

            // 3. Perform a bulk update within the newly opened modal to prove it's active
            CalendarPage.updatePrice("150");

            // 4. Final verification: Check first and last date in the range
            CalendarPage.verifyGridPrice(listingId, 4, "150");
            CalendarPage.verifyGridPrice(listingId, 5, "150");
        });
    });

    context('End-to-End: Price Synchronization', () => {
        it('End-to-End (2): Verify that "Final Price" updates accordingly in the modal', () => {
            const listingId = "VRMREALTY___50";
            CalendarPage.searchAndVerifyListing(listingId);
            CalendarPage.openDsoModalForDate(listingId, 4);

            // Verify that changing the input updates the summary display
            CalendarPage.verifySummaryUpdate("300");
        });
    });

    context('Negative Scenarios: Error Handling', () => {
        it.only('Negative (2): Attempt to input invalid characters and verify error handling', () => {
            const listingId = "VRMREALTY___50";
            const invalidPrice = "abc";
            const expectedError = "Cannot be less than 0";

            CalendarPage.searchAndVerifyListing(listingId);
            CalendarPage.openDsoModalForDate(listingId, 4);

            // Attempt to type alphabetic characters into a numeric field
            CalendarPage.verifyPriceRangeValidationError(invalidPrice, expectedError);

            // Verify modal didn't close (Validation blocked it)
            cy.get(CalendarLocators.modalTitle).should('be.visible');
        });

        it.only('Negative (2): Attempt out-of-range percentage and verify toast messages', () => {
            const listingId = "VRMREALTY___50";
            CalendarPage.searchAndVerifyListing(listingId);
            CalendarPage.openDsoModalForDate(listingId, 4);

            // Attempt a massive number that should trigger a range error
            CalendarPage.attemptInvalidUpdate("9999999");
            
            // The app should show a toast/alert
            cy.get(CalendarLocators.toastAlert).should('be.visible');
        });
    });
});