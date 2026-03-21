import { CalendarLocators } from '../locators/calendarLocators';

class CalendarPage {

    /**
     * Searches for a listing and waits for the grid to settle
     */
    searchAndVerifyListing(listingId) {
        // Intercept search API before performing the action
        cy.intercept('GET', '**/api/listings?search_query=*').as('getListings');
        
        cy.get(CalendarLocators.searchListingInput).clear().type(`${listingId}{enter}`);
        
        // Wait for network to settle
        cy.wait('@getListings');
        
        // UI Validation
        cy.get(CalendarLocators.listingCheckbox(listingId), { timeout: 10000 })
          .should('be.visible');
    }
    /**
     * Opens the DSO Modal via the Date Header
     */
    openDsoModalForDate(date) {
        // Robust Interaction: clicking the text inside the header
        cy.get(CalendarLocators.calendarHeaderDate(date)).eq(0)
          .should('be.visible')
          .click({ force: true });

        // Component Validation: Verify Modal is visually ready
        cy.get(CalendarLocators.modalTitle)
          .should('be.visible')
          .and('contain', 'Overrides');
    }
    /**
     * Updates the price and waits for the full Save + Auto-Refresh lifecycle
     */
    updatePrice(value) {
        // 1. Enter the new price in the modal
        cy.get(CalendarLocators.priceInput).should('be.visible').clear().type(value);

        // 2. Setup Intercept for the Save action
        cy.intercept('POST', '**/api/add_custom_pricing').as('saveDso');
        
        // 3. Click the Update button
        cy.get(CalendarLocators.updateDsoButton).click();

        // 4. Wait-for-settle (Step 1: Network)
        // Ensure the data has reached the server
        cy.wait('@saveDso').its('response.statusCode').should('eq', 200);

        // 5. Wait-for-settle (Step 2: UI Progress Bar)
        // First, we ensure the loader container appears
        cy.get(CalendarLocators.autoRefreshLoader, { timeout: 10000 })
          .should('be.visible');
        
        // Second, we wait for the progress bar to finish and the loader to vanish.
        // We use a 30s timeout because the grid refresh involves complex calculations.
        cy.get(CalendarLocators.autoRefreshLoader, { timeout: 30000 })
          .should('not.exist');
          
        // 6. Final UI Guard: Ensure modal is closed
        cy.get(CalendarLocators.modalTitle).should('not.exist');
        
        cy.log('✅ UI Settle complete: Values are now updated on the grid');
    }
    verifyGridUpdate(listingId, cellIndex, expectedValue) {
        // Now that the loader is gone, the grid MUST be stable
        cy.get(CalendarLocators.pricingBadge(listingId, cellIndex))
          .should('be.visible')
          .and('contain', expectedValue);
          
        cy.log(`⭐ Success: Grid reflects the updated price of ${expectedValue}`);
    }
    bulkUpdatePrice(price) {
        // 1. Enter the bulk price
        cy.get(CalendarLocators.priceInput).should('be.visible').clear().type(price);

        // 2. Setup Intercepts for the Bulk Save (Wait-for-settle)
        cy.intercept('POST', '**/api/add_custom_pricing').as('bulkSaveApi');

        // 3. Click Update/Add
        // We use a flexible selector to catch either 'Update' or 'Add' buttons
        cy.get(CalendarLocators.updateDsoButton).click();

        // 4. Wait-for-settle (Step A: Network)
        cy.wait('@bulkSaveApi').its('response.statusCode').should('eq', 200);

        // 5. Wait-for-settle (Step B: Progress Bar)
        // Bulk updates trigger the Red -> Grey progress bar lifecycle.
        // We wait for the loader to vanish from the grid.
        cy.get(CalendarLocators.autoRefreshLoader, { timeout: 35000 })
          .should('not.exist');
          
        cy.log('✅ Bulk update settled: Progress bar finished.');
    }
    verifyRangePersistence(listingId, startIndex, endIndex, expectedPrice) {
        // Iterate through the range of cells to verify persistence
        for (let i = startIndex; i <= endIndex; i++) {
            cy.get(CalendarLocators.pricingBadge(listingId, i))
              .should('be.visible')
              .and('contain', expectedPrice);
        }
        cy.log(`⭐ Persistence Verified: Cells ${startIndex} to ${endIndex} updated to ${expectedPrice}`);
    }
    /**
     * Verifies the price displayed on the grid after settlement
     */
    verifyGridPrice(listingId, cellIndex, expectedPrice) {
        cy.get(CalendarLocators.pricingBadge(listingId, cellIndex))
          .should('be.visible')
          .and('contain', expectedPrice);
    }
    dragAndDropDateRange(listingId, startIndex, endIndex) {
        // 1. Wait-for-settle: Ensure the grid is stable (No loaders)
        cy.get(CalendarLocators.autoRefreshLoader).should('not.exist');
        // 3. Execution: Sequential Mouse Triggers
        // mousedown: Starts the drag at the first date
        cy.get(CalendarLocators.pricingBadge(listingId, startIndex))
          .trigger('mousedown', { which: 1, force: true });

        // mousemove: Moves the selection to the end date
        cy.get(CalendarLocators.pricingBadge(listingId, endIndex))
          .trigger('mousemove', { force: true });

        // mouseup: Releases the drag, triggering the Modal
        cy.get(CalendarLocators.pricingBadge(listingId, endIndex))
          .trigger('mouseup', { force: true });

        // 5. Component Validation: Verify Modal is open
        cy.get(CalendarLocators.modalTitle)
          .should('be.visible')
          .and('contain', 'Date Specific Overrides');
          
        cy.log(`✅ Proficiency Demo: Drag & Drop from index ${startIndex} to ${endIndex} successful.`);
    }
    /**
     * Requirement: End-to-End (2)
     * Verifies that typing a price updates the modal's summary/final price display
     */
    verifySummaryUpdate(inputPrice) {
        cy.get(CalendarLocators.priceInput)
          .clear()
          .type(inputPrice);

        // Verification: The summary section should reflect the new input
        // In PriceLabs, 'New Final Price' header or summary box updates dynamically
        cy.get(CalendarLocators.summaryFinalPrice)
          .should('have.value', inputPrice);
          
        cy.log(`✅ E2E: Summary/Final Price correctly synchronized with input: ${inputPrice}`);
    }

    /**
     * Requirement: Negative (2)
     * Inputs invalid data and verifies toast/error feedback
     */
    attemptInvalidUpdate(invalidValue) {
        cy.get(CalendarLocators.priceInput)
          .clear()
          .type(invalidValue);

        // We try to click Add/Update to trigger validation
        cy.get(CalendarLocators.updateDsoButton).click();

        // Wait-for-settle: Verify error feedback appears (Toast or Inline)
        cy.get(CalendarLocators.toastAlert, { timeout: 10000 })
          .should('be.visible')
          .and('not.contain', 'SUCCESS'); 
          
        cy.log(`✅ Negative Test: Correctly identified invalid input: ${invalidValue}`);
    }

    verifyPriceRangeValidationError(invalidValue, expectedErrorMessage) {
        // 1. Type the invalid value (e.g., a negative number)
        cy.get(CalendarLocators.priceInput)
          .should('be.visible')
          .clear()
          .type(invalidValue);
        
          cy.get(CalendarLocators.updateDsoButton).click();

        // 2. Wait-for-settle: In a dynamic UI, the error appears as the state updates
        // No cy.wait(number) needed; Cypress retries until the error is visible
        cy.get(CalendarLocators.priceError)
          .should('be.visible')
          .and('contain', expectedErrorMessage);
          
        cy.log(`✅ Negative Test: Successfully caught validation error: "${expectedErrorMessage}"`);
    }
}

export default new CalendarPage();