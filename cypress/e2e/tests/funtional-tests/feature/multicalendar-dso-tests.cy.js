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

    context('Validate the DSO Update And Save persistence', () => {
        it('Functional (1): Update DSO with Random Price via Date Header', () => {
            const randomPrice = (Math.floor(Math.random() * 350) + 151).toString();
            cy.log(`Test Random Price: ${randomPrice}`);
            CalendarPage.searchAndVerifyListing(uiData.listingId, uiData.propertyName);
            CalendarPage.openViewOverridesList(uiData.listingId);
            CalendarPage.clickEditOverride(uiData.targetDateId, uiData.targetDateText);
            CalendarPage.updatePrice(randomPrice);
            CalendarPage.verifyGridPrice(uiData.listingId, 4, randomPrice);
            cy.reload();
            CalendarPage.verifyGridPrice(uiData.listingId, 4, randomPrice);
        });
        it('Functional (2): Bulk update existing entries sequentially via management list', () => {
            const listingId = "VRMREALTY___233";
            const updates = [
                { dateId: "2026-03-21", cellIndex: 4 },
                { dateId: "2026-03-22", cellIndex: 5 }
            ];
            CalendarPage.searchAndVerifyListing(listingId, uiData.propertyName);
            CalendarPage.openViewOverridesList(listingId);
            updates.forEach((item) => {
                item.randomPrice = (Math.floor(Math.random() * 350) + 151).toString();
                cy.log(`Step 1: Updating ${item.dateId} to ${item.randomPrice}`);
                CalendarPage.editEntryFromList(item.dateId);
                CalendarPage.updatePriceAndSettle(item.randomPrice);
            });
            CalendarPage.closeManagementList();
            updates.forEach((item) => {
                cy.log(`Step 2: Verifying Grid Index ${item.cellIndex} matches ${item.randomPrice}`);
                CalendarPage.verifyGridPrice(listingId, item.cellIndex, item.randomPrice);
            });
            cy.reload();
            updates.forEach((item) => {
                CalendarPage.verifyGridPrice(listingId, item.cellIndex, item.randomPrice);
            });

        });
    });

    context('Advanced Interaction: Drag & Drop', () => {
        it('Drag & Drop (1): Demonstrate proficiency by automating a range selection', () => {
            const listingId = "VRMREALTY___50";
            // 1. Setup
            CalendarPage.searchAndVerifyListing(listingId);
            // 2. Advanced Interaction: Drag from index 4 to 6
            CalendarPage.dragAndDropDateRange(listingId, 4, 6);
            // 3. Fill and Save the new range
            CalendarPage.addPrice("150");
            // 4. Multi-Cell Verification (Proves the 'Bulk' aspect)
            CalendarPage.verifyGridPrice(listingId, 4, "150");
            CalendarPage.verifyGridPrice(listingId, 5, "150");
            CalendarPage.verifyGridPrice(listingId, 6, "150");
            cy.log('Drag & Drop requirement completed successfully.');
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
        it('Negative (1): Attempt to input invalid characters and verify error handling', () => {
            const listingId = "VRMREALTY___50";
            const invalidPrice = "abc";
            const expectedError = "Cannot be less than 0";

            CalendarPage.searchAndVerifyListing(listingId);
            CalendarPage.openDsoModalForDate(uiData.targetDateId);

            // Attempt to type alphabetic characters into a numeric field
            CalendarPage.verifyPriceRangeValidationError(invalidPrice, expectedError);

            // Verify modal didn't close (Validation blocked it)
            cy.get(CalendarLocators.modalTitle).should('be.visible');
        });

        it('Negative (2): Attempt out-of-range percentage and verify toast messages', () => {
            const listingId = "VRMREALTY___50";
            CalendarPage.searchAndVerifyListing(listingId);
            CalendarPage.openDsoModalForDate(uiData.targetDateId, 4);

            // Attempt a massive number that should trigger a range error
            CalendarPage.attemptInvalidUpdate("9999999");

            // The app should show a toast/alert
            cy.get(CalendarLocators.toastAlert).should('be.visible');
        });
    });
});