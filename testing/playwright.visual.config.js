// SmartPetBuys Mobile Testing - Visual Regression Configuration
// Visual regression testing across device matrix and responsive breakpoints

const { defineConfig } = require('@playwright/test');
const baseConfig = require('./playwright.config.js');

module.exports = defineConfig({
  ...baseConfig,
  
  // Visual testing specific directory
  testDir: './tests/visual',
  
  // Visual regression testing projects for comprehensive device coverage
  projects: [
    // === PRIMARY MOBILE DEVICES ===
    {
      name: 'Visual-iPhone-15-Pro',
      use: {
        viewport: { width: 393, height: 852 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      },
      testMatch: ['**/visual/mobile/*.spec.js'],
    },
    
    {
      name: 'Visual-iPhone-SE',
      use: {
        viewport: { width: 375, height: 667 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      },
      testMatch: ['**/visual/mobile/*.spec.js'],
    },
    
    {
      name: 'Visual-Samsung-Galaxy-S24',
      use: {
        viewport: { width: 360, height: 780 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      },
      testMatch: ['**/visual/mobile/*.spec.js'],
    },
    
    {
      name: 'Visual-Samsung-Galaxy-S24-Ultra',
      use: {
        viewport: { width: 384, height: 832 },
        deviceScaleFactor: 3.75,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S928B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      },
      testMatch: ['**/visual/mobile/*.spec.js'],
    },
    
    {
      name: 'Visual-Google-Pixel-8-Pro',
      use: {
        viewport: { width: 448, height: 998 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 14; Pixel 8 Pro) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      },
      testMatch: ['**/visual/mobile/*.spec.js'],
    },
    
    // === TABLET DEVICES ===
    {
      name: 'Visual-iPad-Pro-Portrait',
      use: {
        viewport: { width: 1024, height: 1366 },
        deviceScaleFactor: 2,
        isMobile: false,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      },
      testMatch: ['**/visual/tablet/*.spec.js'],
    },
    
    {
      name: 'Visual-iPad-Pro-Landscape',
      use: {
        viewport: { width: 1366, height: 1024 },
        deviceScaleFactor: 2,
        isMobile: false,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      },
      testMatch: ['**/visual/tablet/*.spec.js'],
    },
    
    {
      name: 'Visual-iPad-Air-Portrait',
      use: {
        viewport: { width: 820, height: 1180 },
        deviceScaleFactor: 2,
        isMobile: false,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      },
      testMatch: ['**/visual/tablet/*.spec.js'],
    },
    
    {
      name: 'Visual-iPad-Air-Landscape',
      use: {
        viewport: { width: 1180, height: 820 },
        deviceScaleFactor: 2,
        isMobile: false,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      },
      testMatch: ['**/visual/tablet/*.spec.js'],
    },
    
    // === RESPONSIVE BREAKPOINT TESTING ===
    {
      name: 'Visual-Breakpoint-320px',
      use: {
        viewport: { width: 320, height: 568 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/13.0 Mobile/15E148 Safari/604.1',
      },
      testMatch: ['**/visual/breakpoints/*.spec.js'],
    },
    
    {
      name: 'Visual-Breakpoint-360px',
      use: {
        viewport: { width: 360, height: 640 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 10; SM-G973F) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      },
      testMatch: ['**/visual/breakpoints/*.spec.js'],
    },
    
    {
      name: 'Visual-Breakpoint-375px',
      use: {
        viewport: { width: 375, height: 667 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      },
      testMatch: ['**/visual/breakpoints/*.spec.js'],
    },
    
    {
      name: 'Visual-Breakpoint-390px',
      use: {
        viewport: { width: 390, height: 844 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1',
      },
      testMatch: ['**/visual/breakpoints/*.spec.js'],
    },
    
    {
      name: 'Visual-Breakpoint-430px',
      use: {
        viewport: { width: 430, height: 932 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
      },
      testMatch: ['**/visual/breakpoints/*.spec.js'],
    },
    
    {
      name: 'Visual-Breakpoint-480px',
      use: {
        viewport: { width: 480, height: 854 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 12; SM-G998B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      },
      testMatch: ['**/visual/breakpoints/*.spec.js'],
    },
    
    {
      name: 'Visual-Breakpoint-768px',
      use: {
        viewport: { width: 768, height: 1024 },
        deviceScaleFactor: 2,
        isMobile: false,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      },
      testMatch: ['**/visual/breakpoints/*.spec.js'],
    },
    
    {
      name: 'Visual-Breakpoint-1024px',
      use: {
        viewport: { width: 1024, height: 768 },
        deviceScaleFactor: 2,
        isMobile: false,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
      },
      testMatch: ['**/visual/breakpoints/*.spec.js'],
    },
    
    // === EDGE CASES ===
    {
      name: 'Visual-Foldable-Folded',
      use: {
        viewport: { width: 384, height: 832 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-F946B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36',
      },
      testMatch: ['**/visual/edge-cases/*.spec.js'],
    },
    
    {
      name: 'Visual-Foldable-Unfolded',
      use: {
        viewport: { width: 604, height: 724 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 13; SM-F946B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36',
      },
      testMatch: ['**/visual/edge-cases/*.spec.js'],
    },
    
    {
      name: 'Visual-Ultra-Wide-Aspect',
      use: {
        viewport: { width: 384, height: 896 },
        deviceScaleFactor: 4.275,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 13; XQ-DQ72) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Mobile Safari/537.36',
      },
      testMatch: ['**/visual/edge-cases/*.spec.js'],
    },
  ],
  
  // Visual testing specific settings
  use: {
    ...baseConfig.use,
    // Extended timeout for visual tests
    actionTimeout: 30000,
    navigationTimeout: 30000,
    // Always take screenshots for visual regression
    screenshot: 'on',
    // Disable video for visual tests to reduce storage
    video: 'off',
  },
  
  // Visual testing timeout
  timeout: 60000,
  
  // Visual testing specific reporter
  reporter: [
    ['html', { outputFolder: 'test-results/visual-report' }],
    ['json', { outputFile: 'test-results/visual-results.json' }],
    ['./reporters/visual-regression-reporter.js'],
  ],
  
  // Retry for visual tests
  retries: process.env.CI ? 1 : 0,
  
  // Parallel execution for visual tests
  workers: process.env.CI ? 3 : 4,
  
  // Visual testing specific expect configuration
  expect: {
    timeout: 15000,
    // Strict visual comparison settings
    toMatchSnapshot: {
      threshold: 0.1,
      maxDiffPixels: 500,
    },
  },
});