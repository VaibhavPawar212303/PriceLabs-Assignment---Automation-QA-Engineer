class APIService {
    addCustomPricing(payload, tokenOverride = undefined, useSession = true) {
        const apiUrl = `${Cypress.env('apiBaseUrl')}/add_custom_pricing`;
        return cy.getCookie('_csrf_token').then((cookie) => {
            const csrfToken = cookie ? cookie.value : '';
            const token = tokenOverride || Cypress.env('authToken');
            return cy.request({
                method: 'POST',
                url: apiUrl,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-Token': useSession ? csrfToken : 'expired_csrf'
                },
                ...(useSession ? {} : { headers: { 'Cookie': '', 'Authorization': `Bearer ${tokenOverride}` } }),
                body: payload,
                failOnStatusCode: false
            });
        });
    }
}
export default new APIService();