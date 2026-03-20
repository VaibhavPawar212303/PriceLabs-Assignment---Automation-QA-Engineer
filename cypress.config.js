const { defineConfig } = require("cypress");
const path = require("path");
const fs = require("fs-extra");

/**
 * Function to load environment-specific config files
 */
function getConfigurationByFile(version) {
  const pathToConfigFile = path.resolve("cypress", "fixtures", "config", `${version}.env.json`);
  
  if (!fs.existsSync(pathToConfigFile)) {
    console.warn(`⚠️  Config file not found: ${version}.env.json. Defaulting to empty config.`);
    return {};
  }
  return fs.readJson(pathToConfigFile);
}

module.exports = defineConfig({
  e2e: {  
   async setupNodeEvents(on, config) {
      // 1. Mochawesome Reporter Plugin
      require('cypress-mochawesome-reporter/plugin')(on);

      // 2. Dynamic Environment Logic
      // Default to 'qa' if no version is passed via --env version=xxx
      const version = config.env.version || "qa";
      const envConfig = await getConfigurationByFile(version);

      // Merge loaded config into Cypress config
      if (envConfig.baseUrl) {
        config.baseUrl = envConfig.baseUrl;
      }
      config.env = {
        ...config.env,
        ...envConfig
      };

      // 3. Stealth Mode: Anti-Detection Flags
      on('before:browser:launch', (browser = {}, launchOptions) => {
        if (browser.family === 'chromium' && browser.name !== 'electron') {
          launchOptions.args.push('--disable-blink-features=AutomationControlled');
          launchOptions.args.push('--disable-infobars');
          launchOptions.args.push('--no-sandbox');
          
          // Remove the "Chrome is being controlled by automated software" notification
          launchOptions.args = launchOptions.args.filter(arg => arg !== '--enable-automation');
        }
        return launchOptions;
      });

      return config;
    },

    // Technical Standards: Stability & Timeouts
    viewportWidth: 1536,
    viewportHeight: 960,
    defaultCommandTimeout: 15000,
    requestTimeout: 20000,
    responseTimeout: 20000,
    video: false,
    screenshotOnRunFailure: true,
    chromeWebSecurity: false,
    
    // Reporting
    reporter: 'cypress-mochawesome-reporter',
    reporterOptions: {
      charts: true,
      reportPageTitle: 'PriceLabs Automation Report',
      embeddedScreenshots: true,
      inlineAssets: true,
      saveAllAttempts: false,
    },
  },
});