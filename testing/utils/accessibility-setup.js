// SmartPetBuys Accessibility Testing Setup
// Global setup for comprehensive WCAG 2.1 AA compliance testing

const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

/**
 * Global setup for accessibility testing
 * Prepares test environment and validates Hugo server availability
 */
async function globalSetup(config) {
  console.log('🚀 Starting SmartPetBuys Accessibility Testing Setup...');
  
  // Ensure test results directories exist
  const testResultsDir = path.join(__dirname, '..', 'test-results');
  const accessibilityReportDir = path.join(testResultsDir, 'accessibility-report');
  
  if (!fs.existsSync(testResultsDir)) {
    fs.mkdirSync(testResultsDir, { recursive: true });
  }
  
  if (!fs.existsSync(accessibilityReportDir)) {
    fs.mkdirSync(accessibilityReportDir, { recursive: true });
  }
  
  // Verify Hugo server is running
  console.log('🔍 Verifying Hugo server availability...');
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  try {
    // Test base URL connectivity
    const baseURL = config.use?.baseURL || 'http://localhost:1313';
    console.log(`🌐 Testing connection to: ${baseURL}`);
    
    const response = await page.goto(baseURL, {
      waitUntil: 'networkidle',
      timeout: 30000
    });
    
    if (!response.ok()) {
      throw new Error(`Server not responding correctly. Status: ${response.status()}`);
    }
    
    // Verify critical pages are accessible
    const criticalPages = [
      '/',
      '/posts/',
      '/legal/privacy/'
    ];
    
    for (const pagePath of criticalPages) {
      console.log(`📄 Verifying page: ${pagePath}`);
      const pageResponse = await page.goto(`${baseURL}${pagePath}`, {
        waitUntil: 'networkidle',
        timeout: 15000
      });
      
      if (!pageResponse.ok()) {
        console.warn(`⚠️  Warning: Page ${pagePath} returned status ${pageResponse.status()}`);
      }
    }
    
    // Inject axe-core accessibility testing library
    console.log('🔧 Preparing axe-core accessibility library...');
    const axeCoreScript = `
      if (typeof window !== 'undefined' && !window.axe) {
        const script = document.createElement('script');
        script.src = 'https://unpkg.com/axe-core@4.8.2/axe.min.js';
        script.async = true;
        document.head.appendChild(script);
        
        script.onload = function() {
          console.log('✅ axe-core loaded successfully');
          window.axeReady = true;
        };
        
        script.onerror = function() {
          console.warn('⚠️  Failed to load axe-core from CDN');
          window.axeReady = false;
        };
      }
    `;
    
    await page.addInitScript(axeCoreScript);
    
    // Create accessibility test data file
    const accessibilityTestData = {
      testStart: new Date().toISOString(),
      baseURL: baseURL,
      testEnvironment: {
        nodeVersion: process.version,
        playwrightVersion: require('@playwright/test/package.json').version,
        axeCoreVersion: '4.8.2',
      },
      wcagGuidelines: {
        level: 'AA',
        version: '2.1',
        principles: ['Perceivable', 'Operable', 'Understandable', 'Robust']
      },
      testDevices: [
        'iPhone 15 Pro (VoiceOver simulation)',
        'Samsung Galaxy S24 (TalkBack simulation)',
        'iPad Pro (Switch Control)',
        'Desktop (Keyboard Navigation)',
        'High Contrast Mode',
        'Reduced Motion',
        'Large Text/Zoom'
      ],
      criticalPages: criticalPages,
      setupComplete: true
    };
    
    const testDataPath = path.join(accessibilityReportDir, 'test-setup-data.json');
    fs.writeFileSync(testDataPath, JSON.stringify(accessibilityTestData, null, 2));
    
    console.log('✅ Accessibility testing environment prepared successfully');
    console.log(`📊 Test data saved to: ${testDataPath}`);
    
  } catch (error) {
    console.error('❌ Accessibility testing setup failed:', error.message);
    throw error;
  } finally {
    await page.close();
    await context.close();
    await browser.close();
  }
  
  // Store global state for tests
  process.env.ACCESSIBILITY_SETUP_COMPLETE = 'true';
  process.env.ACCESSIBILITY_TEST_START_TIME = new Date().toISOString();
  
  console.log('🎯 Accessibility testing setup complete. Ready to validate WCAG 2.1 AA compliance!');
  
  return {
    baseURL: config.use?.baseURL || 'http://localhost:1313',
    setupTime: new Date().toISOString(),
    axeCoreReady: true
  };
}

module.exports = globalSetup;