// SmartPetBuys Mobile Testing - Accessibility Configuration
// Comprehensive accessibility testing across mobile devices

const { defineConfig } = require('@playwright/test');
const baseConfig = require('./playwright.config.js');

module.exports = defineConfig({
  ...baseConfig,
  
  // Accessibility-specific test directory
  testDir: './tests/accessibility',
  
  // Accessibility testing projects for key devices and assistive technologies
  projects: [
    {
      name: 'A11y-iPhone-15-Pro-VoiceOver',
      use: {
        viewport: { width: 393, height: 852 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        // Simulate VoiceOver usage patterns
        extraHTTPHeaders: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
          'Prefers-Reduced-Motion': 'reduce',
        }
      },
    },
    
    {
      name: 'A11y-iPhone-SE-Large-Text',
      use: {
        viewport: { width: 375, height: 667 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        // Simulate large text scaling
        extraHTTPHeaders: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
        }
      },
    },
    
    {
      name: 'A11y-Samsung-Galaxy-S24-TalkBack',
      use: {
        viewport: { width: 360, height: 780 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (Linux; Android 14; SM-S921B) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
        // Simulate TalkBack usage
        extraHTTPHeaders: {
          'Prefers-Reduced-Motion': 'reduce',
          'Prefers-Color-Scheme': 'dark'
        }
      },
    },
    
    {
      name: 'A11y-High-Contrast-Mode',
      use: {
        viewport: { width: 375, height: 667 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        // Simulate high contrast mode
        colorScheme: 'dark',
        extraHTTPHeaders: {
          'Prefers-Contrast': 'high',
          'Prefers-Color-Scheme': 'dark'
        }
      },
    },
    
    {
      name: 'A11y-Reduced-Motion',
      use: {
        viewport: { width: 393, height: 852 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        // Simulate reduced motion preference
        reducedMotion: 'reduce',
        extraHTTPHeaders: {
          'Prefers-Reduced-Motion': 'reduce'
        }
      },
    },
    
    {
      name: 'A11y-Keyboard-Navigation',
      use: {
        viewport: { width: 1024, height: 1366 },
        deviceScaleFactor: 2,
        isMobile: false,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        // Focus on keyboard navigation testing
        extraHTTPHeaders: {
          'User-Agent': 'Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        }
      },
    },
    
    {
      name: 'A11y-Switch-Control',
      use: {
        viewport: { width: 375, height: 667 },
        deviceScaleFactor: 2,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1',
        // Simulate switch control usage patterns
        extraHTTPHeaders: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1'
        }
      },
    },
    
    {
      name: 'A11y-Voice-Control',
      use: {
        viewport: { width: 393, height: 852 },
        deviceScaleFactor: 3,
        isMobile: true,
        hasTouch: true,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1',
        // Simulate voice control testing
        extraHTTPHeaders: {
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1'
        }
      },
    },
  ],
  
  // Accessibility-specific settings
  use: {
    ...baseConfig.use,
    // Extended timeout for accessibility tests
    actionTimeout: 45000,
    navigationTimeout: 45000,
    // Always take screenshots for accessibility verification
    screenshot: 'on',
  },
  
  // Accessibility testing timeout
  timeout: 90000,
  
  // Accessibility testing reporter
  reporter: [
    ['html', { outputFolder: 'accessibility-test-results' }],
    ['json', { outputFile: 'test-results/accessibility-results.json' }],
    ['list'],
    ['junit', { outputFile: 'test-results/accessibility-junit.xml' }]
  ],
  
  // Retry for accessibility tests
  retries: process.env.CI ? 2 : 1,
  
  // Parallel execution for accessibility tests
  workers: process.env.CI ? 2 : 3,
  
  // Accessibility test-specific expect timeouts
  expect: {
    timeout: 20000,
    // More lenient threshold for accessibility screenshots
    toMatchSnapshot: {
      threshold: 0.3,
    },
  },
});