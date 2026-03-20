class APIService {
    /**
     * @param {Object} payload 
     * @param {string} tokenOverride - Token string
     * @param {boolean} useSession - Set to false to test token validation without cookies
     */
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
                    // If useSession is false, we send a blank CSRF to mimic an expired session
                    'X-CSRF-Token': useSession ? csrfToken : 'expired_csrf'
                },
                // THE TRICK: If useSession is false, we don't send cookies
                // Cypress doesn't have a 'no-cookie' flag, so we manually override the Cookie header
                ...(useSession ? {} : { headers: { 'Cookie': '', 'Authorization': `Bearer ${tokenOverride}` } }),
                body: payload,
                failOnStatusCode: false
            });
        });
    }
}
export default new APIService();