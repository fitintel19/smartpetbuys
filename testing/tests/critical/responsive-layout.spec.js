// SmartPetBuys Mobile Testing - Critical Responsive Layout Tests
// Tests core responsive layout functionality across breakpoints

const { test, expect } = require('@playwright/test');

test.describe('Responsive Layout - Critical Tests @critical @smoke', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('Homepage layout integrity across viewport sizes', async ({ page }) => {
    const viewports = [
      { width: 320, height: 568 }, // iPhone SE
      { width: 375, height: 667 }, // iPhone 8
      { width: 390, height: 844 }, // iPhone 14
      { width: 430, height: 932 }, // iPhone 15 Pro Max
      { width: 768, height: 1024 }, // iPad Portrait
      { width: 1024, height: 768 }, // iPad Landscape
    ];

    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500); // Allow layout to settle
      
      // Check main container visibility
      const mainContent = page.locator('main, .main-content, .content, #content');
      await expect(mainContent.first()).toBeVisible();
      
      // Check header visibility
      const header = page.locator('header, .header, .site-header');
      await expect(header.first()).toBeVisible();
      
      // Check footer visibility
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(300);
      
      const footer = page.locator('footer, .footer, .site-footer');
      await expect(footer.first()).toBeVisible();
      
      // Check for horizontal scroll (should not exist)
      const hasHorizontalScroll = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      expect(hasHorizontalScroll).toBeFalsy();
      
      // Scroll back to top for next iteration
      await page.evaluate(() => window.scrollTo(0, 0));
    }
  });

  test('Product cards responsive behavior', async ({ page }) => {
    // Navigate to a page with product cards
    await page.goto('/posts/');
    await page.waitForLoadState('networkidle');
    
    const productCards = page.locator('.product-box, .product-card, .post-card');
    const cardCount = await productCards.count();
    
    if (cardCount > 0) {
      const breakpoints = [
        { width: 320, expectedCols: 1 },
        { width: 480, expectedCols: 2 },
        { width: 768, expectedCols: 3 },
        { width: 1024, expectedCols: 4 },
      ];
      
      for (const { width, expectedCols } of breakpoints) {
        await page.setViewportSize({ width, height: 800 });
        await page.waitForTimeout(500);
        
        // Check if cards are properly arranged
        const firstCard = productCards.first();
        await expect(firstCard).toBeVisible();
        
        // Verify card layout doesn't overflow
        const cardBoundingBox = await firstCard.boundingBox();
        expect(cardBoundingBox.x + cardBoundingBox.width).toBeLessThanOrEqual(width);
        
        // Check card content visibility
        const cardImage = firstCard.locator('img').first();
        const cardTitle = firstCard.locator('h1, h2, h3, h4, .title, .product-title').first();
        
        if (await cardImage.count() > 0) {
          await expect(cardImage).toBeVisible();
        }
        
        if (await cardTitle.count() > 0) {
          await expect(cardTitle).toBeVisible();
        }
      }
    }
  });

  test('Typography scaling across devices', async ({ page }) => {
    const testElements = [
      { selector: 'h1', minSize: 24 },
      { selector: 'h2', minSize: 20 },
      { selector: 'h3', minSize: 18 },
      { selector: 'p', minSize: 14 },
    ];
    
    const viewports = [
      { width: 320, height: 568 },
      { width: 768, height: 1024 },
      { width: 1200, height: 800 },
    ];
    
    for (const viewport of viewports) {
      await page.setViewportSize(viewport);
      await page.waitForTimeout(500);
      
      for (const { selector, minSize } of testElements) {
        const elements = page.locator(selector);
        const elementCount = await elements.count();
        
        if (elementCount > 0) {
          const element = elements.first();
          
          if (await element.isVisible()) {
            const fontSize = await element.evaluate(el => {
              return parseInt(window.getComputedStyle(el).fontSize);
            });
            
            expect(fontSize).toBeGreaterThanOrEqual(minSize);
            
            // Check line height for readability
            const lineHeight = await element.evaluate(el => {
              const style = window.getComputedStyle(el);
              return parseFloat(style.lineHeight) / parseFloat(style.fontSize);
            });
            
            expect(lineHeight).toBeGreaterThanOrEqual(1.2);
          }
        }
      }
    }
  });

  test('Navigation responsive behavior', async ({ page }) => {
    const breakpoints = [
      { width: 375, isMobile: true },
      { width: 768, isMobile: false },
      { width: 1200, isMobile: false },
    ];
    
    for (const { width, isMobile } of breakpoints) {
      await page.setViewportSize({ width, height: 800 });
      await page.waitForTimeout(500);
      
      if (isMobile) {
        // Mobile: hamburger menu should be visible
        const mobileToggle = page.locator('.mobile-menu-toggle, .hamburger-menu, [aria-label*="menu"]');
        await expect(mobileToggle).toBeVisible();
        
        // Desktop navigation should be hidden
        const desktopNav = page.locator('.nav-menu, .desktop-nav');
        if (await desktopNav.count() > 0) {
          await expect(desktopNav.first()).not.toBeVisible();
        }
      } else {
        // Desktop: navigation menu should be visible
        const desktopNav = page.locator('.nav-menu, .desktop-nav, header nav');
        if (await desktopNav.count() > 0) {
          await expect(desktopNav.first()).toBeVisible();
        }
        
        // Mobile toggle should be hidden
        const mobileToggle = page.locator('.mobile-menu-toggle, .hamburger-menu');
        if (await mobileToggle.count() > 0) {
          await expect(mobileToggle.first()).not.toBeVisible();
        }
      }
    }
  });

  test('Form elements responsive behavior', async ({ page }) => {
    // Look for forms on the page
    const forms = page.locator('form, .newsletter-form, .search-form');
    const formCount = await forms.count();
    
    if (formCount > 0) {
      const viewports = [
        { width: 320, height: 568 },
        { width: 430, height: 932 },
        { width: 768, height: 1024 },
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(500);
        
        const form = forms.first();
        await expect(form).toBeVisible();
        
        // Check input fields
        const inputs = form.locator('input, textarea, select');
        const inputCount = await inputs.count();
        
        for (let i = 0; i < inputCount; i++) {
          const input = inputs.nth(i);
          
          if (await input.isVisible()) {
            const inputBox = await input.boundingBox();
            
            // Input should not exceed viewport width
            expect(inputBox.x + inputBox.width).toBeLessThanOrEqual(viewport.width);
            
            // Touch target size for mobile
            if (viewport.width <= 480) {
              expect(inputBox.height).toBeGreaterThanOrEqual(44);
            }
          }
        }
        
        // Check buttons
        const buttons = form.locator('button, input[type="submit"]');
        const buttonCount = await buttons.count();
        
        for (let i = 0; i < buttonCount; i++) {
          const button = buttons.nth(i);
          
          if (await button.isVisible()) {
            const buttonBox = await button.boundingBox();
            
            // Button should not exceed viewport width
            expect(buttonBox.x + buttonBox.width).toBeLessThanOrEqual(viewport.width);
            
            // Touch target size for mobile
            if (viewport.width <= 480) {
              expect(buttonBox.height).toBeGreaterThanOrEqual(44);
              expect(buttonBox.width).toBeGreaterThanOrEqual(44);
            }
          }
        }
      }
    }
  });

  test('Image responsive behavior', async ({ page }) => {
    const images = page.locator('img');
    const imageCount = await images.count();
    
    if (imageCount > 0) {
      const viewports = [
        { width: 320, height: 568 },
        { width: 768, height: 1024 },
        { width: 1200, height: 800 },
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(500);
        
        for (let i = 0; i < Math.min(imageCount, 5); i++) {
          const image = images.nth(i);
          
          if (await image.isVisible()) {
            const imageBox = await image.boundingBox();
            
            // Image should not exceed container width
            expect(imageBox.x + imageBox.width).toBeLessThanOrEqual(viewport.width);
            
            // Check if image has loaded
            const isLoaded = await image.evaluate(img => img.complete && img.naturalHeight !== 0);
            expect(isLoaded).toBeTruthy();
            
            // Check for responsive image attributes
            const srcset = await image.getAttribute('srcset');
            const sizes = await image.getAttribute('sizes');
            
            // Modern responsive images should have srcset or be within reasonable bounds
            if (!srcset) {
              expect(imageBox.width).toBeLessThanOrEqual(viewport.width * 1.1);
            }
          }
        }
      }
    }
  });

  test('Sidebar responsive behavior', async ({ page }) => {
    // Navigate to a post page that might have a sidebar
    const postLinks = page.locator('article a, .post-title a, .post-link');
    const linkCount = await postLinks.count();
    
    if (linkCount > 0) {
      await postLinks.first().click();
      await page.waitForLoadState('networkidle');
      
      const sidebar = page.locator('.sidebar, .post-sidebar, .widget-area');
      
      if (await sidebar.count() > 0) {
        const viewports = [
          { width: 375, shouldShow: false },
          { width: 768, shouldShow: true },
          { width: 1200, shouldShow: true },
        ];
        
        for (const { width, shouldShow } of viewports) {
          await page.setViewportSize({ width, height: 800 });
          await page.waitForTimeout(500);
          
          if (shouldShow) {
            await expect(sidebar.first()).toBeVisible();
          } else {
            // On mobile, sidebar might be hidden or repositioned
            const isVisible = await sidebar.first().isVisible();
            const isPositionedBelow = await sidebar.first().evaluate(el => {
              const rect = el.getBoundingClientRect();
              return rect.y > window.innerHeight * 0.5;
            });
            
            // Sidebar should either be hidden or positioned below main content on mobile
            expect(isVisible === false || isPositionedBelow === true).toBeTruthy();
          }
        }
      }
    }
  });

  test('Sticky elements responsive behavior', async ({ page }) => {
    const stickyElements = page.locator('[class*="sticky"], .sticky-header, .fixed-header');
    const stickyCount = await stickyElements.count();
    
    if (stickyCount > 0) {
      const viewports = [
        { width: 375, height: 667 },
        { width: 768, height: 1024 },
      ];
      
      for (const viewport of viewports) {
        await page.setViewportSize(viewport);
        await page.waitForTimeout(500);
        
        // Scroll down to test sticky behavior
        await page.evaluate(() => window.scrollTo(0, 500));
        await page.waitForTimeout(300);
        
        for (let i = 0; i < stickyCount; i++) {
          const stickyElement = stickyElements.nth(i);
          
          if (await stickyElement.isVisible()) {
            const elementBox = await stickyElement.boundingBox();
            
            // Sticky element should not exceed viewport width
            expect(elementBox.x + elementBox.width).toBeLessThanOrEqual(viewport.width);
            
            // Check if element is actually sticky (positioned at top of viewport)
            expect(elementBox.y).toBeLessThanOrEqual(100);
          }
        }
        
        // Scroll back to top
        await page.evaluate(() => window.scrollTo(0, 0));
      }
    }
  });
});