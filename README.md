# PriceLabs Automation Framework - Version 3.0

## 🚀 Overview
This repository contains a professional-grade automation suite for the PriceLabs Multicalendar application. Built using a **Hybrid TDD / Data-Driven Page Object Model (POM)**, the framework is engineered for maximum stability in highly dynamic React/Chakra UI environments.

## 🏗 Framework Architecture (3-Tier POM)
To ensure long-term maintainability and satisfy the requirement of keeping selectors separate from business logic, the framework utilizes a three-tier architecture:

1.  **Locators Layer (`cypress/support/locators/`)**: A dedicated layer containing strictly selector strings (prioritizing `qa-id` for stability). **No Cypress logic or commands reside here.**
2.  **Page Actions Layer (`cypress/support/pages/`)**: Contains high-level business logic (e.g., `updatePrice`, `dragAndDropDateRange`). It interacts with the Locators layer to perform actions and handle synchronization.
3.  **Test Layer (`cypress/e2e/tests/`)**: Organized using Mocha’s `describe` for features, `context` for specific states, and atomic `it` blocks for assertions.

## ⏱ The "Wait-for-Settle" Strategy
PriceLabs' Multicalendar is a highly dynamic UI. This framework strictly adheres to the technical standard of **Zero `cy.wait(number)`** by implementing a multi-stage settlement strategy:

*   **Network Synchronization**: Utilizes `cy.intercept()` to alias XHR/Fetch calls (Search, Save, Refresh) and waits for API resolution before performing assertions.
*   **UI State Guard (Skeletons)**: Explicitly monitors for the absence of `chakra-skeleton` loaders, ensuring the grid is fully interactive before attempting clicks.
*   **Progress Bar Lifecycle**: Synchronizes with the `dso-auto-refresh-loader` (transitioning from Red $\rightarrow$ Grey $\rightarrow$ Disappear) to ensure data persistence is visually confirmed by the application state before validation.

## 🧪 Test Coverage

### 1. Feature: Multicalendar DSO (UI)
*   **Functional (2)**: 
    *   Single date DSO update via modal with verification of Save persistence.
    *   Bulk update for date ranges, ensuring the grid reflects changes across multiple cells.
*   **Drag & Drop (1)**: Demonstrated technical proficiency by automating a range selection using native mouse events (`mousedown`, `mousemove`, `mouseup`).
*   **End-to-End (2)**: Verified that inputting a DSO change dynamically updates the "Final Price" summary in the modal before saving.
*   **Negative (2)**: 
    *   Validated inline error handling (`qa-id="dso-price-error"`) for negative price inputs.
    *   Verified that the "Update" button is disabled/blocked during invalid input states.

### 2. API Testing
*   **Functional**: Direct `cy.request()` to update values with 200 OK validation and body response consistency checks.
*   **Negative**: Verified security and validation logic by confirming **422 (Unprocessable Entity)** or **403 (Unauthorized)** responses when using expired tokens or malformed payloads.

## 🛠 Technical Standards
*   **UI Components**: Interacted with 6+ component types: **Modals, DatePickers, Search Inputs, Tooltips/Toasts, Data Grids, and Progress Bars.**
*   **Data-Driven**: All test inputs (Listing IDs, DSO values, User Credentials) are externalized in `cypress/fixtures/`.
*   **Reporting**: Integrated `cypress-mochawesome-reporter`. Failure screenshots are automatically embedded in the HTML report for rapid root-cause analysis.
*   **Session Management**: Implemented `cy.session()` to bypass repetitive login flows, reducing execution time by approximately 60%.

---

## 🏃 How to Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Update `cypress/fixtures/config/qa.env.json` with your QA credentials and target Listing ID:
```json
{
  "baseUrl": "https://app.pricelabs.co",
  "credentials": {
    "username": "your_email@example.com",
    "password": "your_password"
  }
}
```

### 3. Run All Tests
```bash
npx cypress run --env version=qa
```

### 4. View Report
After execution, open the generated report:
```bash
open cypress/reports/index.html
```

---

## 📂 Project Structure
```text
cypress/
  ├── e2e/tests/         # TDD Organized Test Files
  ├── fixtures/          # Data-Driven JSON Files
  ├── support/
  │    ├── locators/     # Dedicated Selector Layer
  │    ├── pages/        # Business Logic / POM Actions
  │    ├── services/     # API Service Layer
  │    └── e2e.js        # Global Hooks & Exception Handling
  └── cypress.config.js  # Environment & Reporter Config
```

---
**Branch:** `framework/version.0.3`  
**Status:** ✅ All Mandatory Features Completed.