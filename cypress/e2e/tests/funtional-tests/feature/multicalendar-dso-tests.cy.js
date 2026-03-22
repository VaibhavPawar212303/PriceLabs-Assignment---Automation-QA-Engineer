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
        it('End-to-End (1): Verify that "Summary" updates accordingly in the modal', () => {
            const listingId = "VRMREALTY___50";
            const newPrice = "165";
            const expectedPrice = "125"; 
            
            // Data for E2E validation
            const pricingData = {
                base: "100",
                min: "110",
                max: "130",
                override: "125"
            };
    
            // 1. Navigate and Open Modal
            CalendarPage.searchAndVerifyListing(listingId, uiData.propertyName);
            CalendarPage.openDsoModalForDate(uiData.targetDateId);
    
            // 2. Perform E2E Summary Validation
            // This checks if typing 125 updates the ADR and Total to 125
            CalendarPage.fillPricingAndVerifySummary(
                pricingData.base,
                pricingData.min,
                pricingData.max,
                pricingData.override
            );
            // 4. Final Grid verification
            CalendarPage.verifyGridPrice(listingId, 4, pricingData.override);

            // CalendarPage.verifyPriceViaTooltip(listingId, 4, newPrice);

            CalendarPage.getSummaryPopoverContent(listingId, 4).then((content) => {
            
                // 2. Requirement Verification: Verify 'Final' price updates accordingly
                // Note: The UI concatenates strings, so we check for 'Final125'
                expect(content).to.include(`Final${expectedPrice}`);
    
                // 3. Logic Verification: Verify the 'Listing Override' is the driver
                expect(content).to.include(`Listing Override${expectedPrice}`);
    
                // 4. Data Integrity: Verify the structure of the calculation is present
                // This proves the 'Summary' component is fully rendered
                const requiredSections = ['MARKET FACTORS', 'PRICE CUSTOMIZATIONS', 'THRESHOLDS'];
                requiredSections.forEach(section => {
                    expect(content).to.include(section);
                });
    
                cy.log('E2E Success: Final Price and full calculation summary verified.');
            });
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
            CalendarPage.verifyPriceRangeValidationError(invalidPrice, expectedError,"Price must be an integer");

            // Verify modal didn't close (Validation blocked it)
            cy.get(CalendarLocators.modalTitle).should('be.visible');
        });

        it('Negative (2): Attempt to input or out-of-range percentages and verify error handling', () => {
            const listingId = "VRMREALTY___50";
            const invalidPrice = "-10";
            const expectedError = "Cannot be less than 10";

            CalendarPage.searchAndVerifyListing(listingId);
            CalendarPage.openDsoModalForDate(uiData.targetDateId);

            // Attempt to type alphabetic characters into a numeric field
            CalendarPage.verifyPriceRangeValidationError(invalidPrice, expectedError,"Please fix the errors to save DSO.");

            // Verify modal didn't close (Validation blocked it)
            cy.get(CalendarLocators.modalTitle).should('be.visible');
        });
    });
});