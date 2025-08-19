// SmartPetBuys Mobile Testing - Device Matrix Configuration
// Comprehensive device matrix testing configuration

const { defineConfig } = require('@playwright/test');
const baseConfig = require('./playwright.config.js');
const deviceMatrix = require('./device-matrix.json');

// Create device configurations from the device matrix
function createDeviceProjects() {
  const projects = [];
  
  // Add Tier 1 Critical devices
  deviceMatrix.device_matrix.testing_priorities.tier_1_critical.forEach(deviceName => {
    // Find device in matrix
    let device = null;
    let category = null;
    
    // Search through all device categories
    Object.keys(deviceMatrix.device_matrix).forEach(cat => {
      if (cat === 'smartphones') {
        Object.keys(deviceMatrix.device_matrix[cat]).forEach(brand => {
          const found = deviceMatrix.device_matrix[cat][brand].find(d => 
            d.name.includes(deviceName.replace(/[^\w\s]/g, ''))
          );
          if (found) {
            device = found;
            category = cat;
          }
        });
      } else if (cat === 'tablets') {
        Object.keys(deviceMatrix.device_matrix[cat]).forEach(brand => {
          const found = deviceMatrix.device_matrix[cat][brand].find(d => 
            d.name.includes(deviceName.replace(/[^\w\s]/g, ''))
          );
          if (found) {
            device = found;
            category = cat;
          }
        });
      }
    });
    
    if (device) {
      const projectName = `${deviceName.replace(/\s+/g, '-')}-Critical`;
      projects.push({
        name: projectName,
        use: {
          viewport: { 
            width: parseInt(device.viewport.split('x')[0]), 
            height: parseInt(device.viewport.split('x')[1]) 
          },
          deviceScaleFactor: device.pixel_ratio,
          isMobile: category === 'smartphones',
          hasTouch: true,
          userAgent: device.user_agent,
        },
        testMatch: ['**/critical/*.spec.js', '**/smoke/*.spec.js'],
      });
    }
  });
  
  // Add Tier 2 Important devices
  deviceMatrix.device_matrix.testing_priorities.tier_2_important.forEach(deviceName => {
    let device = null;
    let category = null;
    
    // Search through all device categories
    Object.keys(deviceMatrix.device_matrix).forEach(cat => {
      if (cat === 'smartphones' || cat === 'tablets' || cat === 'foldables') {
        Object.keys(deviceMatrix.device_matrix[cat]).forEach(brand => {
          const found = deviceMatrix.device_matrix[cat][brand].find(d => 
            d.name.includes(deviceName.replace(/[^\w\s]/g, ''))
          );
          if (found) {
            device = found;
            category = cat;
          }
        });
      }
    });
    
    if (device) {
      const projectName = `${deviceName.replace(/\s+/g, '-')}-Important`;
      projects.push({
        name: projectName,
        use: {
          viewport: { 
            width: parseInt(device.viewport.split('x')[0]), 
            height: parseInt(device.viewport.split('x')[1]) 
          },
          deviceScaleFactor: device.pixel_ratio,
          isMobile: category === 'smartphones' || category === 'foldables',
          hasTouch: true,
          userAgent: device.user_agent,
        },
        testMatch: ['**/regression/*.spec.js', '**/performance/*.spec.js'],
      });
    }
  });
  
  return projects;
}

module.exports = defineConfig({
  ...baseConfig,
  projects: [
    ...createDeviceProjects(),
    
    // Add specific edge case devices
    {
      name: 'Ultra-Small-Mobile-320px',
      use: {
        viewport: { width: 320, height: 568 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Mobile/15E148 Safari/604.1',
      },
      testMatch: ['**/edge-cases/*.spec.js'],
    },
    
    {
      name: 'Large-Tablet-Landscape',
      use: {
        viewport: { width: 1366, height: 1024 },
        deviceScaleFactor: 2,
        isMobile: false,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      },
      testMatch: ['**/tablet/*.spec.js'],
    },
    
    {
      name: 'Ultra-Wide-Aspect-Ratio',
      use: {
        viewport: { width: 384, height: 896 },
        deviceScaleFactor: 4.275,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 13; XQ-DQ72) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36',
      },
      testMatch: ['**/edge-cases/*.spec.js'],
    },
  ],
  
  // Device matrix specific settings
  use: {
    ...baseConfig.use,
    // Longer timeout for device matrix testing
    actionTimeout: 45000,
    navigationTimeout: 45000,
  },
  
  // Enhanced reporting for device matrix
  reporter: [
    ['html', { outputFolder: 'test-results/device-matrix-report' }],
    ['json', { outputFile: 'test-results/device-matrix-results.json' }],
    ['./reporters/device-matrix-reporter.js'],
  ],
  
  // Retry settings for device matrix
  retries: process.env.CI ? 3 : 1,
  
  // Parallel execution optimized for device matrix
  workers: process.env.CI ? 2 : 4,
});