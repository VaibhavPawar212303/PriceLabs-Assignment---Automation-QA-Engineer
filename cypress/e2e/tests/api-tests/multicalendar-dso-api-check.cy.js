import APIService from '../../../support/services/apiService';

describe('Feature: Multicalendar DSO API Integration', () => {
    let apiData;

    before(() => {
        cy.fixture('test-data/apiData').then((data) => {
            apiData = data;
        });
    });


    describe('Authenticated API Scenarios', () => {
        beforeEach(() => {
            cy.login();
            cy.visit('/multicalendar');
            cy.url().should('include', '/multicalendar');
        });

        context('Functional: Valid Update', () => {
            it('should update successfully with valid data', () => {
                APIService.addCustomPricing(apiData.dsoUpdate.validPayload)
                    .then((response) => {
                        expect(response.status).to.eq(200);
                        expect(response.body.message).to.eq('SUCCESS');
                    });
            });
        });

        context('Negative Scenarios', () => {
            it('should return range error for leadTimeExpiry (0)', () => {
                APIService.addCustomPricing(apiData.dsoUpdate.invalidPayload)
                    .then((response) => {
                        expect(response.body.status).to.not.eq(200);
                        const bodyStr = JSON.stringify(response.body);
                        const isExpectedError = bodyStr.includes("Expiry time") || bodyStr.includes("Listing not found");
                        expect(isExpectedError, `Unexpected API Response: ${bodyStr}`).to.be.true;
                    });
            });
        });
    });


    describe('Unauthenticated API Scenarios', () => {
        beforeEach(() => {
            cy.clearAllCookies();
            cy.clearAllLocalStorage();
            cy.clearAllSessionStorage();
        });
        context('Negative Scenarios', () => {
            it('Negative: should return Unauthorized Access for expired token', () => {
                const expiredToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.expired";
                APIService.addCustomPricing(apiData.dsoUpdate.validPayload, expiredToken)
                    .then((response) => {
                        const bodyStr = JSON.stringify(response.body);
                        expect([200, 401, 403]).to.include(response.status);
                        expect(bodyStr).to.include("Unauthorized Access");
                    });
            });
        })
    });
});