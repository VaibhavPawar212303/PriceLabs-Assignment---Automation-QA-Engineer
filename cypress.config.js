const { defineConfig } = require("cypress");
const path = require("path");
const fs = require("fs-extra");

function getConfigurationByFile(version) {
  const pathToConfigFile = path.resolve("cypress", "fixtures", "config", `${version}.env.json`);
  
  if (!fs.existsSync(pathToConfigFile)) {
    console.warn(`Config file not found: ${version}.env.json. Defaulting to empty config.`);
    return {};
  }
  return fs.readJson(pathToConfigFile);
}

module.exports = defineConfig({
  e2e: {  
   async setupNodeEvents(on, config) {
      require('cypress-mochawesome-reporter/plugin')(on);
      
      const version = config.env.version || "qa";
      const envConfig = await getConfigurationByFile(version);
      if (envConfig.baseUrl) {
        config.baseUrl = envConfig.baseUrl;
      }
      config.env = {
        ...config.env,
        ...envConfig
      };
      return config;
    },

    viewportWidth: 1536,
    viewportHeight: 960,
    
    video: false,
    screenshotOnRunFailure: true,
    chromeWebSecurity: false,
    retries:2,
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