// SmartPetBuys Mobile Testing - Core Web Vitals Performance Tests
// Tests Core Web Vitals metrics across mobile devices

const { test, expect } = require('@playwright/test');

test.describe('Core Web Vitals Performance @performance @critical', () => {
  let coreWebVitals = {};
  
  test.beforeEach(async ({ page }) => {
    // Reset Core Web Vitals object
    coreWebVitals = {};
    
    // Inject Web Vitals measurement script
    await page.addInitScript(() => {
      window.webVitalsResults = {};
      
      // Function to save Web Vitals metrics
      window.saveWebVitalsMetric = (name, value, rating) => {
        window.webVitalsResults[name] = { value, rating };
      };
    });
  });

  test('Homepage Core Web Vitals - LCP (Largest Contentful Paint)', async ({ page }) => {
    // Navigate to homepage and measure LCP
    const startTime = Date.now();
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    // Wait for LCP to be measured
    await page.waitForTimeout(3000);
    
    // Get LCP value using PerformanceObserver
    const lcpValue = await page.evaluate(() => {
      return new Promise((resolve) => {
        if (window.PerformanceObserver) {
          const observer = new PerformanceObserver((list) => {
            const entries = list.getEntries();
            const lastEntry = entries[entries.length - 1];
            resolve(lastEntry ? lastEntry.startTime : null);
          });
          
          try {
            observer.observe({ type: 'largest-contentful-paint', buffered: true });
            
            // Fallback timeout
            setTimeout(() => resolve(null), 2000);
          } catch (e) {
            resolve(null);
          }
        } else {
          resolve(null);
        }
      });
    });
    
    if (lcpValue !== null) {
      console.log(`LCP: ${lcpValue}ms`);
      
      // LCP should be under 2.5 seconds (2500ms) for good rating
      expect(lcpValue).toBeLessThan(2500);
      
      // Store result
      coreWebVitals.lcp = { value: lcpValue, passed: lcpValue < 2500 };
    }
  });

  test('Homepage Core Web Vitals - FID/INP (First Input Delay / Interaction to Next Paint)', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Simulate user interaction to measure FID/INP
    const interactionElements = page.locator('button, a, input, .clickable');
    const elementCount = await interactionElements.count();
    
    if (elementCount > 0) {
      const startTime = performance.now();
      
      // Click on the first interactive element
      await interactionElements.first().click();
      
      const endTime = performance.now();
      const interactionDelay = endTime - startTime;
      
      console.log(`Interaction delay: ${interactionDelay}ms`);
      
      // FID/INP should be under 100ms for good rating
      expect(interactionDelay).toBeLessThan(100);
      
      coreWebVitals.fid = { value: interactionDelay, passed: interactionDelay < 100 };
    }
  });

  test('Homepage Core Web Vitals - CLS (Cumulative Layout Shift)', async ({ page }) => {
    await page.goto('/');
    
    // Monitor layout shifts
    const clsValue = await page.evaluate(() => {
      return new Promise((resolve) => {
        let clsScore = 0;
        
        if (window.PerformanceObserver) {
          const observer = new PerformanceObserver((list) => {
            for (const entry of list.getEntries()) {
              if (!entry.hadRecentInput) {
                clsScore += entry.value;
              }
            }
          });
          
          try {
            observer.observe({ type: 'layout-shift', buffered: true });
            
            // Monitor for 5 seconds then resolve
            setTimeout(() => {
              observer.disconnect();
              resolve(clsScore);
            }, 5000);
          } catch (e) {
            resolve(0);
          }
        } else {
          resolve(0);
        }
      });
    });
    
    console.log(`CLS: ${clsValue}`);
    
    // CLS should be under 0.1 for good rating
    expect(clsValue).toBeLessThan(0.1);
    
    coreWebVitals.cls = { value: clsValue, passed: clsValue < 0.1 };
  });

  test('Page load performance metrics', async ({ page }) => {
    // Measure full page load performance
    const startTime = Date.now();
    
    await page.goto('/', { waitUntil: 'networkidle' });
    
    const loadTime = Date.now() - startTime;
    
    // Get additional performance metrics
    const performanceMetrics = await page.evaluate(() => {
      const navigation = performance.getEntriesByType('navigation')[0];
      const paint = performance.getEntriesByType('paint');
      
      const fcp = paint.find(p => p.name === 'first-contentful-paint');
      const fp = paint.find(p => p.name === 'first-paint');
      
      return {
        domContentLoaded: navigation ? navigation.domContentLoadedEventEnd - navigation.navigationStart : null,
        loadComplete: navigation ? navigation.loadEventEnd - navigation.navigationStart : null,
        firstPaint: fp ? fp.startTime : null,
        firstContentfulPaint: fcp ? fcp.startTime : null,
        totalLoadTime: loadTime
      };
    });
    
    console.log('Performance Metrics:', performanceMetrics);
    
    // First Contentful Paint should be under 1.8 seconds
    if (performanceMetrics.firstContentfulPaint) {
      expect(performanceMetrics.firstContentfulPaint).toBeLessThan(1800);
    }
    
    // DOM Content Loaded should be under 3 seconds
    if (performanceMetrics.domContentLoaded) {
      expect(performanceMetrics.domContentLoaded).toBeLessThan(3000);
    }
    
    // Total load time should be reasonable for mobile
    expect(performanceMetrics.totalLoadTime).toBeLessThan(5000);
  });

  test('Image loading performance', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Check image loading performance
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      let totalImageLoadTime = 0;
      let loadedImages = 0;
      
      for (let i = 0; i < Math.min(imageCount, 10); i++) {
        const image = images.nth(i);
        
        if (await image.isVisible()) {
          const startTime = Date.now();
          
          // Wait for image to load
          await image.evaluate(img => {
            if (!img.complete) {
              return new Promise(resolve => {
                img.onload = resolve;
                img.onerror = resolve;
              });
            }
          });
          
          const loadTime = Date.now() - startTime;
          totalImageLoadTime += loadTime;
          loadedImages++;
        }
      }
      
      if (loadedImages > 0) {
        const avgImageLoadTime = totalImageLoadTime / loadedImages;
        console.log(`Average image load time: ${avgImageLoadTime}ms`);
        
        // Average image load time should be reasonable
        expect(avgImageLoadTime).toBeLessThan(1000);
      }
    }
  });

  test('Mobile-specific performance metrics', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Test only relevant for mobile devices');
    
    await page.goto('/');
    
    // Test scroll performance
    const scrollStartTime = Date.now();
    
    await page.evaluate(() => {
      window.scrollTo({ top: 1000, behavior: 'smooth' });
    });
    
    await page.waitForTimeout(1000);
    
    const scrollEndTime = Date.now();
    const scrollDuration = scrollEndTime - scrollStartTime;
    
    // Smooth scroll should complete within reasonable time
    expect(scrollDuration).toBeLessThan(2000);
    
    // Test touch interaction responsiveness
    const touchElements = page.locator('button, a, input[type="submit"]');
    const touchElementCount = await touchElements.count();
    
    if (touchElementCount > 0) {
      const touchStartTime = Date.now();
      
      await touchElements.first().tap();
      
      const touchEndTime = Date.now();
      const touchResponseTime = touchEndTime - touchStartTime;
      
      console.log(`Touch response time: ${touchResponseTime}ms`);
      
      // Touch response should be under 50ms for good UX
      expect(touchResponseTime).toBeLessThan(50);
    }
  });

  test('Network resource loading performance', async ({ page }) => {
    // Monitor network requests
    const networkRequests = [];
    
    page.on('response', response => {
      networkRequests.push({
        url: response.url(),
        status: response.status(),
        size: response.headers()['content-length'],
        type: response.request().resourceType()
      });
    });
    
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Analyze network requests
    const cssRequests = networkRequests.filter(req => req.type === 'stylesheet');
    const jsRequests = networkRequests.filter(req => req.type === 'script');
    const imageRequests = networkRequests.filter(req => req.type === 'image');
    
    console.log(`Network requests: CSS: ${cssRequests.length}, JS: ${jsRequests.length}, Images: ${imageRequests.length}`);
    
    // Check that critical resources loaded successfully
    const failedRequests = networkRequests.filter(req => req.status >= 400);
    expect(failedRequests.length).toBe(0);
    
    // CSS requests should be reasonable in number (mobile optimization)
    expect(cssRequests.length).toBeLessThan(10);
    
    // JavaScript requests should be optimized
    expect(jsRequests.length).toBeLessThan(15);
  });

  test('Mobile viewport and rendering performance', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Test only relevant for mobile devices');
    
    await page.goto('/');
    
    // Check viewport meta tag
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');
    expect(viewportMeta).toContain('width=device-width');
    expect(viewportMeta).toContain('initial-scale=1');
    
    // Test orientation change performance (simulate)
    const initialViewport = page.viewportSize();
    
    // Simulate landscape orientation
    await page.setViewportSize({ 
      width: initialViewport.height, 
      height: initialViewport.width 
    });
    
    await page.waitForTimeout(500);
    
    // Check that layout adapted properly
    const bodyWidth = await page.evaluate(() => document.body.clientWidth);
    expect(bodyWidth).toBe(initialViewport.height);
    
    // Restore original orientation
    await page.setViewportSize(initialViewport);
  });

  test.afterEach(async ({ page }) => {
    // Log Core Web Vitals results
    console.log('Core Web Vitals Results:', coreWebVitals);
    
    // Save results to file for reporting
    const results = {
      timestamp: new Date().toISOString(),
      url: page.url(),
      viewport: page.viewportSize(),
      userAgent: await page.evaluate(() => navigator.userAgent),
      coreWebVitals: coreWebVitals
    };
    
    // Store results for custom reporter
    await page.evaluate((results) => {
      window.testResults = results;
    }, results);
  });
});