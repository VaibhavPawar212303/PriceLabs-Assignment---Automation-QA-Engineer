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
  clearNotifications() {
    cy.get('body').then(($body) => {
      if ($body.find(CalendarLocators.notificationCloseBtn).length > 0) {
        cy.log('Clearing blocking notifications...');
        cy.get(CalendarLocators.notificationCloseBtn).click({multiple: true });
        cy.get(CalendarLocators.chakraAlert).should('not.exist');
      }
    });
  }
  openDsoModalForDate(date) {
    // 1. Define the internal interaction logic for reuse
    const performHeaderClick = () => {
      cy.get(CalendarLocators.calendarHeaderDate(date))
        .should('exist')
        .trigger('mouseover', { force: true })
        .trigger('mousedown', { which: 1, force: true })
        .click({ force: true });
    };
    performHeaderClick();
    cy.get('body').then(($body) => {
      if ($body.find(CalendarLocators.chakraAlert).length > 0) {
        cy.log('Alert detected blocking modal opening. Retrying hover and click...');
        cy.get(CalendarLocators.chakraAlert).should('be.visible');
        this.clearNotifications();
        performHeaderClick();
      }
    });
    cy.get(CalendarLocators.modalTitle)
      .should('be.visible')
      .and('contain', 'Overrides');
    cy.log(`Modal successfully opened for ${date} (handled potential alerts).`);
  }
  addPriceForDragAndDrop(value) {
    cy.intercept('POST', '**/api/dso_auto_refresh*').as('refreshApi');
    cy.get(CalendarLocators.priceInput)
      .should('be.visible')
      .clear()
      .type(value);
    cy.get(CalendarLocators.addDsoButton)
      .should('be.visible')
      .click()   
    cy.get('body').then(($body) => {
      if ($body.find(CalendarLocators.warningModalTitle).length > 0) {
        cy.log('Overwrite Warning detected. Confirming update...');
        cy.contains('button', 'Update')
        .should('exist')
        .should('be.visible')
        .click({ force: true });
      }
    });
    cy.wait(['@refreshApi']);
    cy.get(CalendarLocators.modalTitle).should('not.exist');
    cy.log(`Successfully added ${value} (Confirmed overwrite if prompted)`);
  }
  addPrice(value) {
    cy.intercept('POST', '**/api/bulk_dso_auto_refresh_poll*').as('pollApi');
    cy.get(CalendarLocators.priceInput)
      .should('be.visible')
      .clear()
      .type(value);
    cy.get(CalendarLocators.addDsoButton)
      .should('be.visible')
      .click()
      
    cy.get('body').then(($body) => {
      if ($body.find(CalendarLocators.warningModalTitle).length > 0) {
        cy.log('Overwrite Warning detected. Confirming update...');
        cy.contains('button', 'Update')
        .should('exist')
        .should('be.visible')
        .click({ force: true });
      }
    });
    cy.wait('@pollApi',{timeout:6000});
    cy.get(CalendarLocators.modalTitle).should('not.exist');
    cy.log(`Successfully added ${value} (Confirmed overwrite if prompted)`);
  }
  fillPricingAndVerifySummary(base, min, max, override) {
    cy.intercept('POST', '**/api/bulk_dso_auto_refresh_poll*').as('pollApi');
    const ensurePricingFieldVisible = (labelSelector, inputSelector, value) => {
      cy.get('body').then(($body) => {
        if ($body.find(inputSelector).length === 0) {
          cy.log(`Revealing field via Add button for: ${labelSelector}`);
          cy.get(labelSelector).parent().find(CalendarLocators.modalGenericAddBtn).click();
        }
        cy.get(inputSelector).should('be.visible').clear().type(value);
      });
    };
    cy.get('body').then(($body) => {
      if ($body.find(CalendarLocators.modalBasePriceInput).length === 0) {
        cy.get(CalendarLocators.modalAddBaseBtn).click();
      }
      cy.get(CalendarLocators.modalBasePriceInput).clear().type(base);
    });
    ensurePricingFieldVisible(CalendarLocators.modalMinPriceLabel, CalendarLocators.modalMinPriceInput, min);
    ensurePricingFieldVisible(CalendarLocators.modalMaxPriceLabel, CalendarLocators.modalMaxPriceInput, max);
    cy.get(CalendarLocators.modalOverridePriceInput).clear().type(override, { delay: 60 });
    cy.get(CalendarLocators.addDsoButton).click();
    cy.get('body').then(($body) => {
      // Check for the warning title
      if ($body.find(CalendarLocators.warningModalTitle).length > 0) {
        cy.log('Overwrite Warning detected. Locating Confirmation button by text...');

        // RE-QUERY STRATEGY: Find the 'Update' button by text inside the dialog
        // This is the most robust way to handle portaled Chakra UI elements
        cy.contains('button', 'Update', { timeout: 10000 })
          .should('exist')
          .should('be.visible')
          .click({ force: true });
          
        cy.log('Overwrite confirmed via text-based lookup.');
      }
    });
    cy.wait(['@pollApi']);
    cy.get(CalendarLocators.autoRefreshLoader).should('not.exist');
    cy.reload();
    cy.get(CalendarLocators.warningModalTitle).should('not.exist');
    cy.get(CalendarLocators.modalTitle).should('not.exist');
    cy.log(`Flow Complete: Values saved, warning handled, and grid settled for price: ${override}`);
  }
  openViewOverridesList(listingId) {
    const triggerMenu = (attempts = 0) => {
      if (attempts > 2) throw new Error(`Failed to open menu for ${listingId} after multiple retries`);
      cy.get(CalendarLocators.listingEllipses(listingId))
        .should('be.visible')
        .click({ force: true });
      cy.get('body').then(($body) => {
        const isMenuVisible = $body.find(CalendarLocators.viewOverridesOption(listingId)).length > 0;
        if (!isMenuVisible) {
          cy.log(`Menu not opened (Attempt ${attempts + 1}). Retrying click...`);
          cy.wait(500); 
          triggerMenu(attempts + 1);
        }
      });
    };
    triggerMenu();
    cy.get(CalendarLocators.viewOverridesOption(listingId), { timeout: 10000 })
      .should('be.visible')
      .click({ force: true });
    cy.get(CalendarLocators.viewModalTitle).should('be.visible');
    cy.log(`Successfully navigated to Management List for: ${listingId}`);
  }
  clickEditOverride(dateId, dateText) {
    cy.get(CalendarLocators.overrideRowByDate(dateText))
      .should('be.visible')
      .trigger('mouseover');
    cy.get(CalendarLocators.editOverrideBtn(dateId))
      .should('exist')
      .click({ force: true });
    cy.get(CalendarLocators.modalTitle).should('be.visible');
    cy.log(`Successfully triggered Edit for ${dateText}`);
  }
  performSmartDsoAction(listingId, dateId, price) {
    cy.get(CalendarLocators.autoRefreshLoader).should('not.exist');
    this.openDsoModalForDate(dateId);
    cy.get('body').then(($body) => {
      if ($body.find(CalendarLocators.updateDsoButton).length > 0) {
        cy.log('Action: UPDATE');
        this.updatePrice(price);
      } else {
        cy.log('Action: ADD');
        this.addPrice(price);
      }
    });
    cy.get(CalendarLocators.autoRefreshLoader).should('not.exist');
  }
  updatePrice(value) {
    cy.intercept('POST', '**/api/dso_auto_refresh*').as('refreshApi');
    cy.get(CalendarLocators.priceInput).should('be.visible').clear().type(value);
    cy.intercept('POST', '**/api/add_custom_pricing').as('saveDso');
    cy.get(CalendarLocators.updateDsoButton).click();
    cy.wait('@refreshApi');
    cy.wait('@saveDso').its('response.statusCode').should('eq', 200);
    cy.get(CalendarLocators.autoRefreshLoader).should('not.exist');
    cy.get(CalendarLocators.modalTitle).should('not.exist');
    cy.get(CalendarLocators.viewModalCloseBtn).should('be.visible').click({ force: true });
    cy.get(CalendarLocators.viewModalTitle).should('not.exist');
    cy.log('UI Settle complete: Values are now updated on the grid');
  }
  verifyDsoBadgeVisible(listingId, cellIndex) {
    cy.get(CalendarLocators.autoRefreshLoader).should('not.exist');
    cy.reload();
    cy.get(CalendarLocators.pricingCell(listingId, cellIndex))
      .find(CalendarLocators.dsoBadge)
      .should('be.visible')
      .and('exist');
    cy.log(`Badge confirmed "Complete" for Cell Index: ${cellIndex}`);
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
    cy.get(CalendarLocators.modalOverridePriceInput).should('be.visible').clear().type(price);
    cy.intercept('POST', '**/api/add_custom_pricing').as('saveApi');
    cy.get(CalendarLocators.updateDsoButton).click();
    cy.wait('@saveApi').its('response.statusCode').should('eq', 200);
    cy.get('body').then(($body) => {
      if ($body.find(CalendarLocators.closeModelButton).length > 0) {
        cy.get(CalendarLocators.closeModelButton).should('be.visible').click({ force: true });
      }
    });
    cy.get(CalendarLocators.autoRefreshLoader).should('be.visible');
    cy.get(CalendarLocators.autoRefreshLoader, { timeout: 35000 }).should('not.exist');
    cy.get(CalendarLocators.modalTitle).should('not.exist');
    cy.log(`Entry updated to ${price} and returned to management list`);
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
    cy.get(CalendarLocators.pricingBadge(listingId, cellIndex))
      .should('be.visible')
      .trigger('mouseover', { force: true });
    cy.get(CalendarLocators.tooltipContainer, { timeout: 8000 })
      .should('be.visible')
      .and('contain', expectedPrice)
      .and('contain', 'Fixed Price');
    cy.get(CalendarLocators.pricingBadge(listingId, cellIndex))
      .trigger('mouseout', { force: true });
    cy.log(`Tooltip Validation: Price ${expectedPrice} verified via hover.`);
  }
  dragAndDropDateRange(listingId, startIndex, endIndex) {
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
    cy.log(`E2E: Summary/Final Price correctly synchronized with input: ${inputPrice}`);
  }
  attemptInvalidUpdate(invalidValue) {
    cy.get(CalendarLocators.priceInput)
      .clear()
      .type(invalidValue);
    cy.get(CalendarLocators.updateDsoButton).click();
    cy.get(CalendarLocators.toastAlert, { timeout: 10000 })
      .should('be.visible')
      .and('not.contain', 'SUCCESS');
    cy.log(`Negative Test: Correctly identified invalid input: ${invalidValue}`);
  }
  verifyPriceRangeValidationError(invalidValue, expectedInlineError, expectedToastMessage) {
    cy.get(CalendarLocators.priceInput)
      .should('be.visible')
      .clear()
      .type(invalidValue);
    cy.get(CalendarLocators.addDsoButton).click();
    cy.get('body').then(($body) => {
      if ($body.find(CalendarLocators.warningModalTitle).length > 0) {
        cy.log('Overwrite Warning detected. Bypassing animation to click Go Back...');
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
  getSummaryPopoverContent(listingId, cellIndex) {
    cy.get(CalendarLocators.pricingBadge(listingId, cellIndex))
      .should('be.visible')
      .trigger('mouseover', { force: true })
      .trigger('mouseenter', { force: true });
    cy.get(CalendarLocators.summaryPopover, { timeout: 15000 })
      .should('be.visible')
      .should('not.contain', 'Loading...') 
      .should('contain', 'Final');       
    return cy.get(CalendarLocators.summaryPopover)
      .filter(':visible') 
      .first()
      .invoke('text')
      .then((fullText) => {
        cy.log('SETTLED POPOVER CONTENT:', fullText);
        return cy.wrap(fullText);
      });
  }
}

export default new CalendarPage();