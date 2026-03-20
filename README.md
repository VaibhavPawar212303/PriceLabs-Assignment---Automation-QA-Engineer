# PriceLabs Automation Challenge - Version 1.0

## 🚀 Overview
This repository contains the automated testing suite for the PriceLabs Multicalendar DSO feature. The framework is built using **Cypress** with a **Hybrid TDD / Data-Driven Page Object Model (POM)** architecture.

## 🏗 Architecture (3-Tier Structure)
To meet the "Cypress AI" technical standards, the project separates concerns into three distinct layers:

### 1. Locators Layer (`cypress/support/locators/`)
- **Responsibility:** Strictly stores selector strings (CSS, IDs, XPath).
- **Purpose:** Decouples the UI structure from the business logic. If a class name changes in the application, we only update it here.
- **Logic:** No Cypress commands (`cy.get`) are allowed in this layer.

### 2. Page Actions Layer (`cypress/support/pages/`)
- **Responsibility:** Contains methods that represent user actions (e.g., `updateDSOValue`, `login`).
- **Purpose:** Provides a clean API for test scripts to interact with the page.
- **Logic:** Uses selectors from the Locators Layer and performs actions using Cypress commands.

### 3. Test Layer (`cypress/e2e/tests/`)
- **Responsibility:** Contains the test scenarios categorized into `api-tests` and `functional-tests`.
- **Strategy:** Uses Mocha's `describe` for features, `context` for state management, and `it` for atomic assertions.

---

## 📊 Reporting & Failure Analysis (Mochawesome)
This framework implements `cypress-mochawesome-reporter` to meet the high technical standards for visibility and debugging:

- **Automatic Screenshots:** On any test failure, a screenshot is automatically captured and embedded directly into the HTML report.
- **Unified HTML Report:** Generates a standalone, interactive HTML report with charts showing pass/fail rates.
- **Configuration:** Managed via `cypress.config.js` and `cypress/support/e2e.js`.

---

## 🛠 Setup & Installation

1. **Clone the repository:**
   ```bash
   git clone <repo-url>
   git checkout framework/version.0.1