// SmartPetBuys Mobile Testing - Test Helper Utilities
// Common utilities and helpers for mobile testing

/**
 * Wait for network to be idle with custom timeout
 */
async function waitForNetworkIdle(page, timeout = 5000) {
  await page.waitForLoadState('networkidle', { timeout });
}

/**
 * Wait for all images to load
 */
async function waitForImages(page) {
  await page.evaluate(() => {
    const images = Array.from(document.querySelectorAll('img'));
    return Promise.all(
      images.map(img => {
        if (img.complete) return Promise.resolve();
        return new Promise(resolve => {
          img.onload = resolve;
          img.onerror = resolve;
        });
      })
    );
  });
}

/**
 * Get device viewport information
 */
function getDeviceViewports() {
  return {
    'mobile-320': { width: 320, height: 568 },
    'mobile-375': { width: 375, height: 667 },
    'mobile-390': { width: 390, height: 844 },
    'mobile-430': { width: 430, height: 932 },
    'phablet-480': { width: 480, height: 854 },
    'tablet-768': { width: 768, height: 1024 },
    'tablet-landscape': { width: 1024, height: 768 },
    'desktop-1200': { width: 1200, height: 800 },
  };
}

/**
 * Check if element meets touch target requirements
 */
async function checkTouchTarget(element, minSize = 44) {
  const boundingBox = await element.boundingBox();
  if (!boundingBox) return false;
  
  return boundingBox.width >= minSize && boundingBox.height >= minSize;
}

/**
 * Get Core Web Vitals measurements
 */
async function getCoreWebVitals(page) {
  return await page.evaluate(() => {
    return new Promise((resolve) => {
      const vitals = {};
      
      // LCP
      if (window.PerformanceObserver) {
        try {
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            if (entries.length > 0) {
              vitals.lcp = entries[entries.length - 1].startTime;
            }
          }).observe({ type: 'largest-contentful-paint', buffered: true });
          
          // CLS
          let clsScore = 0;
          new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsScore += entry.value;
              }
            }
            vitals.cls = clsScore;
          }).observe({ type: 'layout-shift', buffered: true });
          
          // FCP
          new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const fcp = entries.find(entry => entry.name === 'first-contentful-paint');
            if (fcp) {
              vitals.fcp = fcp.startTime;
            }
          }).observe({ type: 'paint', buffered: true });
          
        } catch (e) {
          console.log('Performance observation error:', e);
        }
      }
      
      // Navigation timing fallback
      const navigation = performance.getEntriesByType('navigation')[0];
      if (navigation) {
        vitals.domContentLoaded = navigation.domContentLoadedEventEnd - navigation.navigationStart;
        vitals.loadComplete = navigation.loadEventEnd - navigation.navigationStart;
      }
      
      setTimeout(() => resolve(vitals), 3000);
    });
  });
}

/**
 * Simulate network conditions
 */
async function setNetworkConditions(page, condition) {
  const conditions = {
    '3G': {
      downloadThroughput: 1.5 * 1024 * 1024 / 8,
      uploadThroughput: 750 * 1024 / 8,
      latency: 40
    },
    'Slow 4G': {
      downloadThroughput: 4 * 1024 * 1024 / 8,
      uploadThroughput: 3 * 1024 * 1024 / 8,
      latency: 20
    },
    'Fast 4G': {
      downloadThroughput: 20 * 1024 * 1024 / 8,
      uploadThroughput: 10 * 1024 * 1024 / 8,
      latency: 10
    }
  };
  
  if (conditions[condition]) {
    const cdp = await page.context().newCDPSession(page);
    await cdp.send('Network.emulateNetworkConditions', conditions[condition]);
  }
}

/**
 * Take element screenshot with proper waiting
 */
async function takeElementScreenshot(element, name, options = {}) {
  await element.scrollIntoViewIfNeeded();
  await element.waitFor({ state: 'visible' });
  
  // Wait for any animations to complete
  await element.page().waitForTimeout(300);
  
  return await element.screenshot({
    path: `test-results/screenshots/${name}`,
    ...options
  });
}

/**
 * Check accessibility violations using axe
 */
async function checkAccessibility(page, options = {}) {
  try {
    const { injectAxe, checkA11y } = require('axe-playwright');
    await injectAxe(page);
    
    const defaultOptions = {
      axeOptions: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']
        }
      },
      ...options
    };
    
    await checkA11y(page, null, defaultOptions);
    return true;
  } catch (error) {
    console.error('Accessibility check failed:', error.message);
    return false;
  }
}

/**
 * Simulate mobile gestures
 */
async function simulateSwipe(page, direction, element = null) {
  const target = element || page.locator('body');
  const box = await target.boundingBox();
  
  if (!box) return;
  
  const startX = box.x + box.width / 2;
  const startY = box.y + box.height / 2;
  let endX = startX;
  let endY = startY;
  
  switch (direction) {
    case 'up':
      endY -= box.height * 0.5;
      break;
    case 'down':
      endY += box.height * 0.5;
      break;
    case 'left':
      endX -= box.width * 0.5;
      break;
    case 'right':
      endX += box.width * 0.5;
      break;
  }
  
  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(endX, endY);
  await page.mouse.up();
}

/**
 * Test form validation and mobile keyboard behavior
 */
async function testFormMobileBehavior(page, formSelector) {
  const form = page.locator(formSelector);
  const inputs = form.locator('input, textarea, select');
  const inputCount = await inputs.count();
  
  const results = [];
  
  for (let i = 0; i < inputCount; i++) {
    const input = inputs.nth(i);
    const inputType = await input.getAttribute('type');
    const autocomplete = await input.getAttribute('autocomplete');
    const placeholder = await input.getAttribute('placeholder');
    
    // Test focus behavior
    await input.focus();
    const isFocused = await input.evaluate(el => document.activeElement === el);
    
    // Test input validation
    await input.fill('test');
    await input.blur();
    
    const validationMessage = await input.evaluate(el => el.validationMessage);
    
    results.push({
      index: i,
      type: inputType,
      autocomplete,
      placeholder,
      isFocused,
      validationMessage
    });
  }
  
  return results;
}

/**
 * Measure scroll performance
 */
async function measureScrollPerformance(page) {
  return await page.evaluate(() => {
    return new Promise((resolve) => {
      const startTime = performance.now();
      let frameCount = 0;
      
      function measureFrame() {
        frameCount++;
        if (frameCount < 60) { // Measure for 60 frames
          requestAnimationFrame(measureFrame);
        } else {
          const endTime = performance.now();
          const duration = endTime - startTime;
          const fps = 60 / (duration / 1000);
          resolve({ duration, fps, frameCount });
        }
      }
      
      // Start smooth scroll
      window.scrollTo({ top: 1000, behavior: 'smooth' });
      requestAnimationFrame(measureFrame);
    });
  });
}

/**
 * Get comprehensive page performance metrics
 */
async function getPagePerformanceMetrics(page) {
  const coreWebVitals = await getCoreWebVitals(page);
  
  const additionalMetrics = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    
    return {
      navigation: navigation ? {
        domainLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
        connect: navigation.connectEnd - navigation.connectStart,
        request: navigation.responseStart - navigation.requestStart,
        response: navigation.responseEnd - navigation.responseStart,
        domProcessing: navigation.domComplete - navigation.responseEnd,
        onLoad: navigation.loadEventEnd - navigation.loadEventStart
      } : null,
      paint: paint.reduce((acc, entry) => {
        acc[entry.name.replace('first-', '').replace('-paint', '')] = entry.startTime;
        return acc;
      }, {}),
      resourceCount: performance.getEntriesByType('resource').length
    };
  });
  
  return {
    ...coreWebVitals,
    ...additionalMetrics
  };
}

/**
 * Generate test report data
 */
function generateTestReportData(testName, viewport, results) {
  return {
    testName,
    viewport,
    timestamp: new Date().toISOString(),
    results,
    passed: Object.values(results).every(result => 
      typeof result === 'boolean' ? result : result.passed !== false
    )
  };
}

module.exports = {
  waitForNetworkIdle,
  waitForImages,
  getDeviceViewports,
  checkTouchTarget,
  getCoreWebVitals,
  setNetworkConditions,
  takeElementScreenshot,
  checkAccessibility,
  simulateSwipe,
  testFormMobileBehavior,
  measureScrollPerformance,
  getPagePerformanceMetrics,
  generateTestReportData
};