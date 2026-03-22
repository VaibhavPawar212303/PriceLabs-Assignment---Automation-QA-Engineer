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
            const listingId = uiData.listingIdTwo;
            const targetDate = uiData.targetDateId;
            const propertyName = uiData.propertyName;
            const targetDateText = uiData.targetDateText
            const randomPrice = (Math.floor(Math.random() * 350) + 151).toString();

            cy.log(`Test Random Price: ${randomPrice}`);

            CalendarPage.searchAndVerifyListing(listingId, propertyName);
            CalendarPage.performSmartDsoAction(listingId, targetDate, randomPrice);
            CalendarPage.openViewOverridesList(listingId);
            CalendarPage.clickEditOverride(targetDate, targetDateText);
            CalendarPage.updatePrice(randomPrice);
            CalendarPage.verifyGridPrice(listingId, 4, randomPrice);
            cy.reload();
            CalendarPage.verifyGridPrice(listingId, 4, randomPrice);
        });
        it('Functional (2): Sequential Smart DSO Update and persistence check', () => {
            const listingId = uiData.listingIdTwo;
            const updates = [
                { dateId: "2026-03-23", cellIndex: 5 },
                { dateId: "2026-03-24", cellIndex: 6 }
            ];
            CalendarPage.searchAndVerifyListing(listingId, uiData.propertyName);
            updates.forEach((item) => {
                item.randomPrice = (Math.floor(Math.random() * 350) + 151).toString();
                cy.log(`Step 1: Smart Action for ${item.dateId} -> Price: ${item.randomPrice}`);
                CalendarPage.performSmartDsoAction(listingId, item.dateId, item.randomPrice);
                CalendarPage.verifyGridPrice(listingId, item.cellIndex, item.randomPrice);
            });
            updates.forEach((item) => {
                cy.log(`Step 2: Persistence Verify for ${item.dateId}`);
                CalendarPage.verifyGridPrice(listingId, item.cellIndex, item.randomPrice);
                CalendarPage.verifyDsoBadgeVisible(listingId, item.cellIndex);
            });
            cy.log('Sequential Smart DSO updates and persistence verified successfully.');
        });
    });
});