import { CalendarLocators } from '../locators/calendarLocators';

class CalendarPage {
  searchAndVerifyListing(listingId, expectedName) {
    cy.intercept('GET', '**/api/listings?search_query=*').as('getListings');
    cy.get(CalendarLocators.searchListingInput)
      .should('be.visible')
      .clear()
      .type(`${listingId}{enter}`);
    cy.wait('@getListings').its('response.statusCode').should('eq', 200);
    cy.get(CalendarLocators.searchLoadingSpinner).should('not.exist');
    cy.get(CalendarLocators.skeletonLoader).should('not.exist');
    cy.get(CalendarLocators.tableLoadingSpinner).should('not.exist');
    cy.get(CalendarLocators.listingRow(listingId))
      .should('be.visible')
      .within(() => {
        cy.get(CalendarLocators.syncToggle(listingId)).should('exist');
        cy.get(CalendarLocators.saveRefreshBtn(listingId)).should('be.visible');
        cy.get(CalendarLocators.basePriceInput(listingId))
          .should('be.visible')
          .invoke('val')
          .should('not.be.empty');
      });
    cy.log(`Deep Verification complete for Listing: ${listingId}`);
  }
  openViewOverridesList(listingId) {
    cy.get(CalendarLocators.listingEllipses(listingId), { timeout: 15000 })
      .should('be.visible')
      .then(($btn) => {
        cy.wrap($btn).click({ force: true });
      });
    cy.get(CalendarLocators.viewOverridesOption(listingId), { timeout: 10000 })
      .should('be.visible')
      .click();
    cy.get(CalendarLocators.viewModalTitle).should('be.visible');
    cy.log(`Successfully navigated to Overrides List for: ${listingId}`);
  }
  clickEditOverride(dateId, dateText) {
    cy.get(CalendarLocators.overrideRowByDate(dateText), { timeout: 10000 })
      .should('be.visible')
      .trigger('mouseover');
    cy.get(CalendarLocators.editOverrideBtn(dateId))
      .should('exist')
      .click({ force: true });
    cy.get('[qa-id="dso-modal-title"]', { timeout: 10000 }).should('be.visible');
    cy.log(`✅ Successfully triggered Edit for ${dateText}`);
  }
  openDsoModalForDate(date) {
    cy.get(CalendarLocators.calendarHeaderDate(date))
      .should('exist')
      .trigger('mouseover', { force: true })
      .trigger('mousedown', { which: 1, force: true })
      .click({ force: true });
    cy.get(CalendarLocators.modalTitle, { timeout: 10000 })
      .should('be.visible')
      .and('contain', 'Overrides');
    cy.log(`Modal opened for ${date} after hover sequence.`);
  }
  updatePrice(value) {
    cy.get(CalendarLocators.priceInput).should('be.visible').clear().type(value);
    cy.intercept('POST', '**/api/add_custom_pricing').as('saveDso');
    cy.get(CalendarLocators.updateDsoButton).click();
    cy.wait('@saveDso').its('response.statusCode').should('eq', 200);
    cy.get(CalendarLocators.autoRefreshLoader, { timeout: 10000 }).should('be.visible');
    cy.get(CalendarLocators.autoRefreshLoader, { timeout: 30000 }).should('not.exist');
    cy.get(CalendarLocators.modalTitle).should('not.exist');
    cy.get(CalendarLocators.viewModalCloseBtn, { timeout: 10000 }).should('be.visible').click({ force: true });
    cy.get(CalendarLocators.viewModalTitle).should('not.exist');
    cy.log('UI Settle complete: Values are now updated on the grid');
  }
  verifyGridUpdate(listingId, cellIndex, expectedValue) {
    cy.get(CalendarLocators.pricingBadge(listingId, cellIndex))
      .should('be.visible')
      .and('contain', expectedValue);
    cy.log(`Success: Grid reflects the updated price of ${expectedValue}`);
  }
  editEntryFromList(dateId) {
    cy.get(CalendarLocators.editOverrideBtn(dateId))
      .should('exist')
      .click({ force: true });
    cy.get('[qa-id="dso-modal-title"]').should('be.visible');
  }
  updatePriceAndSettle(price) {
    cy.get(CalendarLocators.priceInput).should('be.visible').clear().type(price);
    cy.intercept('POST', '**/api/add_custom_pricing').as('saveApi');
    cy.get(CalendarLocators.updateDsoButton).click();
    cy.wait('@saveApi').its('response.statusCode').should('eq', 200);
    cy.get(CalendarLocators.autoRefreshLoader).should('be.visible');
    cy.get(CalendarLocators.autoRefreshLoader).should('not.exist');

    // 4. Final Settle: Wait for the Edit modal to close and return to the List modal
    cy.get('[qa-id="dso-modal-title"]').should('not.exist');
    cy.get(CalendarLocators.viewModalTitle).should('be.visible');

    cy.log(`✅ Entry updated to ${price} and returned to management list.`);
  }
  closeManagementList() {
    cy.get(CalendarLocators.viewModalCloseBtn).click({ force: true });
    cy.get(CalendarLocators.viewModalTitle).should('not.exist');
  }
  verifyGridPrice(listingId, cellIndex, expectedPrice) {
    cy.get(CalendarLocators.pricingBadge(listingId, cellIndex))
      .should('be.visible')
      .and('contain', expectedPrice);
  }
  dragAndDropDateRange(listingId, startIndex, endIndex) {
    cy.get(CalendarLocators.autoRefreshLoader).should('not.exist');
    cy.get(CalendarLocators.pricingBadge(listingId, startIndex)).trigger('mousedown', { which: 1, force: true });
    cy.get(CalendarLocators.pricingBadge(listingId, endIndex)).trigger('mousemove', { force: true });
    cy.get(CalendarLocators.pricingBadge(listingId, endIndex)).trigger('mouseup', { force: true });
    cy.get(CalendarLocators.modalTitle).should('be.visible').and('contain', 'Date Specific Overrides');
    cy.log(`Proficiency Demo: Drag & Drop from index ${startIndex} to ${endIndex} successful.`);
  }
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
  addPrice(value) {
    cy.get(CalendarLocators.priceInput)
      .should('be.visible')
      .clear()
      .type(value);
    cy.intercept('POST', '**/api/add_custom_pricing').as('addDsoApi');
    cy.get(CalendarLocators.addDsoButton)
      .should('be.visible')
      .click();
    cy.wait('@addDsoApi').its('response.statusCode').should('eq', 200);
    cy.get(CalendarLocators.autoRefreshLoader).should('be.visible');
    cy.get(CalendarLocators.autoRefreshLoader).should('not.exist');
    cy.get(CalendarLocators.modalTitle).should('not.exist');
    cy.log(`Bulk price ${value} successfully added via Drag & Drop.`);
  }
}

export default new CalendarPage();