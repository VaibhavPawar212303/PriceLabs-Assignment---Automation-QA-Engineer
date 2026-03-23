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

    context('End-to-End: Price Synchronization', () => {
        it('End-to-End (1): Verify that "Summary" updates accordingly in the modal', () => {
            const listingId = uiData.listingIdTwo;
            const expectedPrice = uiData.expectedPrice;
            const pricingData = {base: uiData.base,min: uiData.min,max: uiData.max,override: uiData.override};
            const todayDate = CalendarPage.getDynamicDate(0)

            CalendarPage.searchAndVerifyListing(listingId, uiData.propertyName);
            CalendarPage.openDsoModalForDate(todayDate);
            CalendarPage.fillPricingAndVerifySummary(pricingData.base,pricingData.min,pricingData.max,pricingData.override);
            CalendarPage.verifyGridPrice(listingId, 4, pricingData.override);
            
            CalendarPage.getSummaryPopoverContent(listingId, 4).then((content) => {
                expect(content).to.include(`Final${expectedPrice}`);
                expect(content).to.include(`Listing Override${expectedPrice}`);
                const requiredSections = ['MARKET FACTORS', 'PRICE CUSTOMIZATIONS', 'THRESHOLDS'];
                requiredSections.forEach(section => {
                    expect(content).to.include(section);
                });
                cy.log('E2E Success: Final Price and full calculation summary verified.');
            });
        });
    });
});