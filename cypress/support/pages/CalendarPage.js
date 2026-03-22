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
  verifyPriceViaTooltip(listingId, cellIndex, expectedPrice) {
    // 2. Trigger Hover (Requirement: Interaction with Tooltips)
    // We use trigger('mouseover') to activate the React tooltip listener
    cy.get(CalendarLocators.pricingBadge(listingId, cellIndex))
      .should('be.visible')
      .trigger('mouseover', { force: true });

    // 3. Validation: Check the tooltip content
    // We use a broader timeout because tooltips often have a small fade-in delay
    cy.get(CalendarLocators.tooltipContainer, { timeout: 8000 })
      .should('be.visible')
      .and('contain', expectedPrice)
      .and('contain', 'Fixed Price'); // Standard PriceLabs tooltip text

    // 4. Cleanup: Mouse out to hide tooltip for subsequent tests
    cy.get(CalendarLocators.pricingBadge(listingId, cellIndex))
      .trigger('mouseout', { force: true });

    cy.log(`✅ Tooltip Validation: Price ${expectedPrice} verified via hover.`);
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
  verifyPriceRangeValidationError(invalidValue, expectedInlineError, expectedToastMessage) {
    cy.get(CalendarLocators.priceInput)
      .should('be.visible')
      .clear()
      .type(invalidValue);
    cy.get(CalendarLocators.addDsoButton).click();
    cy.get('body').then(($body) => {
      if ($body.find('[qa-id="dso-warning-modal-title"]').length > 0) {
        cy.log('⚠️ Overwrite Warning detected. Bypassing animation to click Go Back...');
        cy.get(CalendarLocators.warningGoBackBtn)
          .should('be.visible')
          .click({ force: true });
        cy.get(CalendarLocators.warningModalTitle).should('not.exist');
        cy.get(CalendarLocators.addDsoButton).click();
      }
    });
    cy.get(CalendarLocators.priceError)
      .should('be.visible')
      .and('contain', expectedInlineError);
    cy.get(CalendarLocators.errorToast).first()
      .should('be.visible')
      .within(() => {
        cy.get(CalendarLocators.toastDescription)
          .should('have.text', expectedToastMessage);
      });
    cy.log(`Negative Test Success: Errors verified for "${invalidValue}"`);
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
  fillPricingAndVerifySummary(base, min, max, override) {

    // Helper to handle the "Add" button logic for Min/Max
    const ensurePricingFieldVisible = (labelSelector, inputSelector, value) => {
      cy.get('body').then(($body) => {
        if ($body.find(inputSelector).length === 0) {
          cy.log(`Revealing field via Add button for: ${labelSelector}`);
          // Find the unique label, go to parent container, then find the 'Add' button inside
          cy.get(labelSelector).parent().find(CalendarLocators.modalGenericAddBtn).click();
        }
        cy.get(inputSelector).should('be.visible').clear().type(value);
      });
    };

    // 1. Fill Base Price (Unique ID button)
    cy.get('body').then(($body) => {
      if ($body.find(CalendarLocators.modalBasePriceInput).length === 0) {
        cy.get(CalendarLocators.modalAddBaseBtn).click();
      }
      cy.get(CalendarLocators.modalBasePriceInput).clear().type(base);
    });

    // 2. Fill Min and Max Price using the Relative Helper
    ensurePricingFieldVisible(CalendarLocators.modalMinPriceLabel, CalendarLocators.modalMinPriceInput, min);
    ensurePricingFieldVisible(CalendarLocators.modalMaxPriceLabel, CalendarLocators.modalMaxPriceInput, max);

    // 3. Fill the Main Override and Verify Summary
    cy.get(CalendarLocators.modalOverridePriceInput).clear().type(override, { delay: 50 });
    cy.get(CalendarLocators.addDsoButton).click();
  }
  getSummaryPopoverContent(listingId, cellIndex) {
    // 1. Trigger the popover
    cy.get(CalendarLocators.pricingBadge(listingId, cellIndex))
      .should('be.visible')
      .trigger('mouseover', { force: true })
      .trigger('mouseenter', { force: true });

    // 2. Wait-for-settle: Pricing data replaces "Loading..."
    // We use a negative assertion to wait for the loader text to disappear
    // This is the professional way to handle internal React state changes.
    cy.get(CalendarLocators.summaryPopover, { timeout: 15000 })
      .should('be.visible')
      .should('not.contain', 'Loading...') // <--- CRITICAL STEP
      .should('contain', 'Final');        // Ensure target data is present

    // 3. Capture the settled text
    return cy.get(CalendarLocators.summaryPopover)
      .filter(':visible') // Ensure we only get the active one
      .first()
      .invoke('text')
      .then((fullText) => {
        cy.log('✅ SETTLED POPOVER CONTENT:', fullText);
        return cy.wrap(fullText);
      });
  }

}

export default new CalendarPage();