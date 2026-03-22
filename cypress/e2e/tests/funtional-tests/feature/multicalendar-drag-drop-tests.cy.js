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

    context('Advanced Interaction: Drag & Drop', () => {
        it('Drag & Drop (1): Demonstrate proficiency by automating a range selection', () => {
            const listingId = uiData.listingIdTwo;
            const bulkPrice = uiData.bulkPrice;
            // 1. Setup
            CalendarPage.searchAndVerifyListing(listingId);
            // 2. Advanced Interaction: Drag from index 4 to 6
            CalendarPage.dragAndDropDateRange(listingId, 4, 6);
            // 3. Fill and Save the new range
            CalendarPage.addPrice(bulkPrice);
            // 4. Multi-Cell Verification (Proves the 'Bulk' aspect)
            CalendarPage.verifyGridPrice(listingId, 4, bulkPrice);
            CalendarPage.verifyGridPrice(listingId, 5, bulkPrice);
            CalendarPage.verifyGridPrice(listingId, 6, bulkPrice);
            cy.log('Drag & Drop requirement completed successfully.');
        });
    });
});