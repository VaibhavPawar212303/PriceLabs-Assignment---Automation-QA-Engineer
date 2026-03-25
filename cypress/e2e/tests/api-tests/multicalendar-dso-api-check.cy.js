import CalendarPage from '../../../support/pages/CalendarPage';
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
                        cy.log(JSON.stringify(response.requestBody));
                    });
            });
            it('should update successfully with valid data', () => {

                cy.request({
                    method: 'GET',
                    url: 'https://api.pricelabs.co/v1/listings/VRMREALTY___50/overrides?pms=vrm',
                    headers: {
                        'X-API-Key': `${Cypress.env('authToken')}`,
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest',
                    }
                }).then((res) => {
                    cy.log(JSON.stringify())
                    cy.wrap(res.body.overrides).then((array) => {
                        cy.log(JSON.stringify(array))
                    })
                })
            });
            it.only("Validate the api response data for date", () => {
                // 1. Helper Function to handle "Mar 24 2026" format
                const formatToISO = (dateStr) => {
                    const months = {
                        Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
                        Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12'
                    };
                    const parts = dateStr.trim().split(' ');
                    return `${parts[2]}-${months[parts[0]]}-${parts[1].padStart(2, '0')}`;
                };
            
                // 2. First API Call
                APIService.addCustomPricing(apiData.dsoUpdate.validPayload).then((response) => {
                    expect(response.status).to.eq(200);
                    
                    // Parse the request body to get the dates we just sent
                    const response1 = JSON.parse(response.requestBody);
                    const startISO = formatToISO(response1.startDate);
                    const endISO = formatToISO(response1.endDate);
            
                    // 3. Second API Call (Nested inside the first .then so response1 is available)
                    cy.request({
                        method: 'GET',
                        url: 'https://api.pricelabs.co/v1/listings/VRMREALTY___50/overrides?pms=vrm',
                        headers: {
                            'X-API-Key': `${Cypress.env('authToken')}`,
                            'Content-Type': 'application/json',
                            'X-Requested-With': 'XMLHttpRequest',
                        }
                    }).then((res) => {
                        // res.body.overrides should already be an array
                        const response2Array = res.body.overrides;
            
                        // 4. Filter the array using the ISO dates
                        const filteredResults = response2Array.filter(item => {
                            return item.date >= startISO && item.date <= endISO;
                        });
            
                        // 5. Assertions
                        cy.log(`Found ${filteredResults.length} records between ${startISO} and ${endISO}`);
                        
                        // Validate length (e.g., 3 days for Mar 24, 25, 26)
                        expect(filteredResults).to.have.lengthOf(3);
            
                        // Validate that every filtered item has the correct price
                        filteredResults.forEach((item) => {
                            expect(item.price.toString()).to.eq(response1.price.toString());
                        });
                    });
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