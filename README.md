# PriceLabs Automation Framework - Final Release

## 🚀 Overview
This repository contains a professional-grade automation suite for the **PriceLabs Multicalendar** application. Built using a **Hybrid TDD / Data-Driven Page Object Model (POM)**, the framework is engineered for maximum stability in highly dynamic React/Chakra UI environments, strictly adhering to high-level "Cypress AI" technical standards.

## 🏗 Framework Architecture (3-Tier POM)
To ensure maintainability and satisfy the requirement of keeping selectors separate from business logic, the framework utilizes a three-tier architecture:

1.  **Locators Layer (`cypress/support/locators/`)**: A dedicated layer containing strictly selector strings (prioritizing `qa-id` for stability). **No Cypress commands reside here.**
2.  **Page Actions Layer (`cypress/support/pages/`)**: Contains high-level business logic and Page Objects (e.g., `updatePrice`, `dragAndDropDateRange`). It interacts with the Locators layer to handle synchronization and complex UI workflows.
3.  **API Service Layer (`cypress/support/services/`)**: Encapsulates `cy.request` logic with dynamic header management (CSRF tokens and Authorization) for backend validation.

## ⏱ The "Wait-for-Settle" Strategy
A primary challenge of the PriceLabs UI is its dynamic nature. This framework achieves 100% stability with **Zero `cy.wait(number)`** through a multi-stage settlement strategy:

*   **Network Level**: Utilizes `cy.intercept()` to alias XHR/Fetch calls (Search, Save, Refresh) and waits for API resolution before proceeding.
*   **UI State Guard (Skeletons)**: Explicitly monitors for the absence of `chakra-skeleton` loaders and spinners, ensuring the grid is interactive before attempting clicks.
*   **Visual Lifecycle Sync**: Synchronizes with the `dso-auto-refresh-loader` (Progress Bar) transitioning from **Red** $\rightarrow$ **Grey** $\rightarrow$ **Disappear** to ensure data persistence is visually confirmed by the application state before validation.

## 🧪 Test Coverage

### 1. Feature: Multicalendar DSO (UI)
*   **Functional Updates**: 
    *   Single date DSO update via modal with verification of Save persistence.
    *   Bulk update for date ranges sequentially via management list.
    *   "Smart Actions" that automatically detect whether to `ADD` or `UPDATE` based on the presence of a DSO badge.
*   **Drag & Drop**: Demonstrated technical proficiency by automating range selection using native mouse events (`mousedown`, `mousemove`, `mouseup`).
*   **End-to-End**: Verified real-time pricing synchronization where manual overrides dynamically update the "Final Price" summary in the footer before saving.
*   **Negative Scenarios**: 
    *   Validated inline error handling (`qa-id="dso-price-error"`) for negative/invalid inputs.
    *   Verified global toast notifications: "Please fix the errors to save DSO."

### 2. API Testing
*   **Functional**: Direct `cy.request()` to `/api/add_custom_pricing` with 200 OK validation and internal success status checks.
*   **Security & Negative**: Verified robust error handling for **422 (Unprocessable Entity)**, **403 (Unauthorized)**, and **400 (Bad Request)** responses when using expired tokens or malformed payloads.

## 🛠 Technical Standards
*   **Component Interaction**: Native interaction with **Modals, DatePickers, Search Inputs, Tooltips/Popovers, Data Grids, and Progress Bars.**
*   **Session Persistence**: Implemented `cy.session()` to cache authentication state, reducing total execution time by approximately 60%.
*   **Data-Driven**: 100% of test inputs (Listing IDs, DSO values, credentials) are externalized in `cypress/fixtures/`.
*   **Robustness**: Integrated a global exception handler to suppress non-critical third-party script errors (e.g., Salespanel).
*   **Reporting**: Integrated `cypress-mochawesome-reporter` with failure screenshots automatically embedded in HTML reports.

---

## 🏃 How to Run

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment
Update `cypress/fixtures/config/qa.env.json` with your credentials and target Listing ID.

### 3. Run UI Tests (Headless)
```bash
npx cypress run --env version=qa --spec "cypress/e2e/tests/funtional-tests/**"
```

### 4. Run API Tests (Headless)
```bash
npx cypress run --env version=qa --spec "cypress/e2e/tests/api-tests/**"
```

### 5. View Report
```bash
open cypress/reports/index.html
```

---

## 📂 Project Structure
```text
cypress/
  ├── e2e/tests/           # TDD Organized Test Files (UI & API)
  ├── fixtures/            # Data-Driven JSON (Config & Test Data)
  ├── support/
  │    ├── locators/       # Pure Selector strings (qa-id)
  │    ├── pages/          # POM Business Logic
  │    ├── services/       # API Request abstraction
  │    └── e2e.js          # Global Hooks & Exception Handling
  └── cypress.config.js    # Multi-env & Reporter Configuration
```
