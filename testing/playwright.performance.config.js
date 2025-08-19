// SmartPetBuys Mobile Testing - Performance Configuration
// Core Web Vitals and performance testing across device matrix

const { defineConfig } = require('@playwright/test');
const baseConfig = require('./playwright.config.js');

module.exports = defineConfig({
  ...baseConfig,
  
  // Performance-specific test directory
  testDir: './tests/performance',
  
  // Performance testing projects for key devices
  projects: [
    {
      name: 'Performance-iPhone-15-Pro',
      use: {
        viewport: { width: 393, height: 852 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        // Performance-specific settings
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-web-security',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
            '--memory-pressure-off',
            '--max_old_space_size=4096'
          ]
        }
      },
    },
    
    {
      name: 'Performance-iPhone-SE',
      use: {
        viewport: { width: 375, height: 667 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-web-security',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
            '--memory-pressure-off',
            '--max_old_space_size=2048'
          ]
        }
      },
    },
    
    {
      name: 'Performance-Samsung-Galaxy-S24',
      use: {
        viewport: { width: 360, height: 780 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-web-security',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
            '--memory-pressure-off',
            '--max_old_space_size=4096'
          ]
        }
      },
    },
    
    {
      name: 'Performance-Samsung-Galaxy-A54',
      use: {
        viewport: { width: 360, height: 780 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-A546B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36',
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-web-security',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
            '--memory-pressure-off',
            '--max_old_space_size=2048'
          ]
        }
      },
    },
    
    {
      name: 'Performance-iPad-Pro',
      use: {
        viewport: { width: 1024, height: 1366 },
        deviceScaleFactor: 2,
        isMobile: false,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        launchOptions: {
          args: [
            '--no-sandbox',
            '--disable-web-security',
            '--disable-features=TranslateUI',
            '--disable-ipc-flooding-protection',
            '--memory-pressure-off',
            '--max_old_space_size=6144'
          ]
        }
      },
    },
    
    // Network throttling simulation
    {
      name: 'Performance-3G-Connection',
      use: {
        viewport: { width: 375, height: 667 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        // Simulate 3G connection
        contextOptions: {
          offline: false,
          networkConditions: {
            offline: false,
            downloadThroughput: 1.5 * 1024 * 1024 / 8, // 1.5 Mbps
            uploadThroughput: 750 * 1024 / 8, // 750 kbps
            latency: 40 // 40ms
          }
        }
      },
    },
    
    {
      name: 'Performance-Slow-4G-Connection',
      use: {
        viewport: { width: 375, height: 667 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        // Simulate slow 4G
        contextOptions: {
          offline: false,
          networkConditions: {
            offline: false,
            downloadThroughput: 4 * 1024 * 1024 / 8, // 4 Mbps
            uploadThroughput: 3 * 1024 * 1024 / 8, // 3 Mbps
            latency: 20 // 20ms
          }
        }
      },
    },
  ],
  
  // Performance-specific settings
  use: {
    ...baseConfig.use,
    // Extended timeout for performance tests
    actionTimeout: 60000,
    navigationTimeout: 60000,
    // Always record trace for performance analysis
    trace: 'on',
    // Record video for performance debugging
    video: 'on',
  },
  
  // Performance testing specific timeout
  timeout: 120000,
  
  // Performance testing reporter
  reporter: [
    ['html', { outputFolder: 'test-results/performance-report' }],
    ['json', { outputFile: 'test-results/performance-results.json' }],
    ['./reporters/core-web-vitals-reporter.js'],
    ['./reporters/performance-budget-reporter.js'],
  ],
  
  // Retry for performance tests
  retries: process.env.CI ? 2 : 1,
  
  // Sequential execution for accurate performance measurements
  workers: 1,
  
  // Performance test-specific expect timeouts
  expect: {
    timeout: 30000,
  },
});