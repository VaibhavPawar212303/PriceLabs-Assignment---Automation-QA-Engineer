export const utilities = {

    visitAndAggregateData(location,file) {
        let uiData;
        before(() => {
            return cy.fixture(`${file}`).then((data) => {
                uiData = data;
            });
        });
        beforeEach(() => {
            cy.login();
            cy.visit('/multicalendar');
        });

    }
}