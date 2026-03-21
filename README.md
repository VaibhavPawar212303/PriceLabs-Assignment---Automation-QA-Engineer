# PriceLabs Automation Challenge - Version 2.0

## 🚀 Overview
Version 2.0 focuses on the **API Testing Integration** and **Authentication Management**. This layer ensures the backend business logic for the Multicalendar DSO (Daily Specific Overrides) is stable before layer-ing the UI tests on top.

## 🏗 Architectural Enhancements
To maintain the "Cypress AI" bar, the following patterns were implemented:

### 1. API Service Layer (`cypress/support/services/apiService.js`)
- **Abstraction:** Created a dedicated `APIService` class to encapsulate `cy.request` logic.
- **Dynamic Headers:** Implemented logic to automatically handle `X-CSRF-Token` extraction from cookies and manage `Authorization` Bearer tokens.
- **Fail-Safe status:** Configured `failOnStatusCode: false` to allow robust assertions on negative test cases (4xx/5xx).

### 2. Session Persistence (`cy.session`)
- **Performance:** Integrated `cy.session()` into the login flow to cache cookies and localStorage. This reduces test execution time by ~70% by avoiding repetitive UI logins.
- **Isolation:** Tests are organized into `Authenticated` and `Unauthenticated` blocks to ensure security tests run in a clean state without persistent session interference.

### 3. Response Logic Handling
- **Multi-layered Status Codes:** Handled the specific PriceLabs API behavior where the server returns an HTTP `200 OK` but includes an internal application error (e.g., `status: 400` or `Unauthorized Access`) in the JSON body.

---

## 🧪 Test Coverage (API Module)

### Functional Tests
- **DSO Update:** Validated that sending a valid JSON payload to `/api/add_custom_pricing` returns a `200 OK` and a `SUCCESS` message.

### Negative & Security Tests
- **Boundary Analysis:** Validated that `leadTimeExpiry` values out of range (e.g., 0) trigger the correct business logic error.
- **Authentication Bypass:** Verified that the API rejects requests when an expired or invalid Bearer token is provided and session cookies are cleared.
- **Robust Error Handling:** Implemented "Fuzzy Matching" assertions to handle dynamic error messages (e.g., "Listing not found" vs "Validation Error").

---

## 🛠 Technical Standards Implemented
- **Zero `cy.wait(number)`**: All tests rely on command chaining and request resolution.
- **TDD Contextual Structure**: Organized tests using Mocha's `context` for state-specific scenarios.
- **Data-Driven**: All API payloads and expired tokens are externalized in `cypress/fixtures/test-data/apiData.json`.
- **Flakiness Suppression**: Implemented a global exception handler in `e2e.js` to catch and ignore non-critical third-party script errors (e.g., Salespanel, MutationObserver).

---

## 📈 Current Progress
- ✅ Framework Scaffolding (v0.1)
- ✅ API Testing Module (v0.2)
- ✅ Dynamic Environment Configuration
- ✅ Session Caching Strategy
- 🚧 UI Locators & POM Actions (v0.3 - Next Phase)

---

## 🏃 Running the API Suite
To run the API integration tests:
```bash
npx cypress run --spec "cypress/e2e/tests/api-tests/*" --env version=qa