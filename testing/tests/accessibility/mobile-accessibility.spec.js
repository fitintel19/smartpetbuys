// SmartPetBuys Mobile Testing - Mobile Accessibility Tests
// Tests accessibility compliance across mobile devices and assistive technologies

const { test, expect } = require('@playwright/test');
const { injectAxe, checkA11y } = require('axe-playwright');

test.describe('Mobile Accessibility Tests @accessibility @a11y', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    
    // Inject axe-core for accessibility testing
    await injectAxe(page);
  });

  test('WCAG compliance scan - Homepage', async ({ page }) => {
    // Run comprehensive accessibility scan
    await checkA11y(page, null, {
      detailedReport: true,
      detailedReportOptions: { html: true },
      axeOptions: {
        runOnly: {
          type: 'tag',
          values: ['wcag2a', 'wcag2aa', 'wcag21aa', 'best-practice']
        }
      }
    });
  });

  test('Touch target accessibility - Minimum sizes', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Test only relevant for mobile devices');
    
    // Get all interactive elements
    const interactiveElements = page.locator('a, button, input, select, textarea, [role="button"], [tabindex]');
    const elementCount = await interactiveElements.count();
    
    console.log(`Testing ${elementCount} interactive elements for touch target compliance`);
    
    for (let i = 0; i < elementCount; i++) {
      const element = interactiveElements.nth(i);
      
      if (await element.isVisible()) {
        const boundingBox = await element.boundingBox();
        
        if (boundingBox) {
          // WCAG 2.1 AA requires minimum 44px touch targets
          const minSize = 44;
          const actualWidth = boundingBox.width;
          const actualHeight = boundingBox.height;
          
          // Check if element meets minimum touch target size
          const meetsWidth = actualWidth >= minSize;
          const meetsHeight = actualHeight >= minSize;
          
          if (!meetsWidth || !meetsHeight) {
            // Get element details for debugging
            const tagName = await element.evaluate(el => el.tagName);
            const className = await element.getAttribute('class');
            const id = await element.getAttribute('id');
            const text = await element.textContent();
            
            console.log(`Touch target too small: ${tagName}${id ? '#' + id : ''}${className ? '.' + className.split(' ')[0] : ''} - ${actualWidth}x${actualHeight}px - Text: "${text?.slice(0, 50)}"`);
          }
          
          // Soft assertion with detailed reporting
          expect.soft(meetsWidth, `Element width ${actualWidth}px should be >= ${minSize}px`).toBeTruthy();
          expect.soft(meetsHeight, `Element height ${actualHeight}px should be >= ${minSize}px`).toBeTruthy();
        }
      }
    }
  });

  test('Keyboard navigation accessibility', async ({ page }) => {
    // Test Tab navigation through interactive elements
    const focusableElements = page.locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])');
    const elementCount = await focusableElements.count();
    
    if (elementCount > 0) {
      // Start from the first focusable element
      await focusableElements.first().focus();
      
      let currentFocusIndex = 0;
      const maxTabStops = Math.min(elementCount, 20); // Limit to prevent infinite loops
      
      for (let i = 0; i < maxTabStops; i++) {
        // Check current focus
        const currentFocus = page.locator(':focus');
        await expect(currentFocus).toBeVisible();
        
        // Check focus indicator visibility
        const focusOutline = await currentFocus.evaluate(el => {
          const style = window.getComputedStyle(el);
          return {
            outline: style.outline,
            outlineWidth: style.outlineWidth,
            outlineStyle: style.outlineStyle,
            outlineColor: style.outlineColor,
            boxShadow: style.boxShadow
          };
        });
        
        // Element should have visible focus indicator
        const hasFocusIndicator = focusOutline.outline !== 'none' || 
                                 focusOutline.outlineWidth !== '0px' ||
                                 focusOutline.boxShadow !== 'none';
        
        expect.soft(hasFocusIndicator, 'Element should have visible focus indicator').toBeTruthy();
        
        // Move to next element
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
      }
    }
  });

  test('Screen reader compatibility - ARIA labels and roles', async ({ page }) => {
    // Check for proper ARIA labels on critical elements
    const criticalElements = [
      { selector: 'nav', expectedRole: 'navigation' },
      { selector: 'main', expectedRole: 'main' },
      { selector: 'button', expectedAttribute: 'aria-label or text content' },
      { selector: 'input', expectedAttribute: 'aria-label or associated label' },
      { selector: 'img', expectedAttribute: 'alt attribute' }
    ];
    
    for (const { selector, expectedRole, expectedAttribute } of criticalElements) {
      const elements = page.locator(selector);
      const elementCount = await elements.count();
      
      for (let i = 0; i < elementCount; i++) {
        const element = elements.nth(i);
        
        if (await element.isVisible()) {
          if (expectedRole) {
            const role = await element.getAttribute('role');
            const implicitRole = await element.evaluate(el => el.tagName.toLowerCase());
            
            // Check if element has explicit or implicit role
            const hasCorrectRole = role === expectedRole || 
                                 (expectedRole === 'navigation' && implicitRole === 'nav') ||
                                 (expectedRole === 'main' && implicitRole === 'main');
            
            expect.soft(hasCorrectRole, `${selector} should have role="${expectedRole}"`).toBeTruthy();
          }
          
          if (expectedAttribute) {
            if (selector === 'button') {
              const ariaLabel = await element.getAttribute('aria-label');
              const textContent = await element.textContent();
              const hasLabel = ariaLabel || (textContent && textContent.trim().length > 0);
              
              expect.soft(hasLabel, 'Button should have aria-label or text content').toBeTruthy();
            }
            
            if (selector === 'input') {
              const ariaLabel = await element.getAttribute('aria-label');
              const id = await element.getAttribute('id');
              const hasAssociatedLabel = ariaLabel || (id && await page.locator(`label[for="${id}"]`).count() > 0);
              
              expect.soft(hasAssociatedLabel, 'Input should have aria-label or associated label').toBeTruthy();
            }
            
            if (selector === 'img') {
              const alt = await element.getAttribute('alt');
              const role = await element.getAttribute('role');
              
              // Images should have alt text or be marked as decorative
              const hasAltOrDecorative = alt !== null || role === 'presentation';
              expect.soft(hasAltOrDecorative, 'Image should have alt attribute or role="presentation"').toBeTruthy();
            }
          }
        }
      }
    }
  });

  test('Color contrast accessibility', async ({ page }) => {
    // Run axe-core color contrast checks specifically
    await checkA11y(page, null, {
      axeOptions: {
        runOnly: {
          type: 'rule',
          values: ['color-contrast', 'color-contrast-enhanced']
        }
      }
    });
    
    // Additional manual contrast checks for critical elements
    const criticalTextElements = page.locator('h1, h2, h3, p, a, button, .nav-link');
    const elementCount = await criticalTextElements.count();
    
    for (let i = 0; i < Math.min(elementCount, 10); i++) {
      const element = criticalTextElements.nth(i);
      
      if (await element.isVisible()) {
        const contrastData = await element.evaluate(el => {
          const style = window.getComputedStyle(el);
          const backgroundColor = style.backgroundColor;
          const color = style.color;
          const fontSize = parseFloat(style.fontSize);
          const fontWeight = style.fontWeight;
          
          return {
            backgroundColor,
            color,
            fontSize,
            fontWeight,
            isLargeText: fontSize >= 18 || (fontSize >= 14 && (fontWeight === 'bold' || parseInt(fontWeight) >= 700))
          };
        });
        
        // Note: Actual contrast calculation would require more complex color parsing
        // This is a placeholder for contrast validation logic
        console.log(`Element contrast data:`, contrastData);
      }
    }
  });

  test('Mobile form accessibility', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Test only relevant for mobile devices');
    
    // Find forms on the page
    const forms = page.locator('form');
    const formCount = await forms.count();
    
    if (formCount > 0) {
      const form = forms.first();
      const inputs = form.locator('input, textarea, select');
      const inputCount = await inputs.count();
      
      for (let i = 0; i < inputCount; i++) {
        const input = inputs.nth(i);
        
        if (await input.isVisible()) {
          // Check for proper labeling
          const id = await input.getAttribute('id');
          const ariaLabel = await input.getAttribute('aria-label');
          const placeholder = await input.getAttribute('placeholder');
          
          let hasLabel = false;
          
          if (id) {
            const labelElement = page.locator(`label[for="${id}"]`);
            hasLabel = await labelElement.count() > 0;
          }
          
          hasLabel = hasLabel || ariaLabel || placeholder;
          
          expect.soft(hasLabel, 'Form input should have proper labeling').toBeTruthy();
          
          // Check input type accessibility
          const inputType = await input.getAttribute('type');
          const autocomplete = await input.getAttribute('autocomplete');
          
          // Critical form inputs should have autocomplete for mobile
          if (inputType === 'email' || inputType === 'tel' || inputType === 'text') {
            console.log(`Input type: ${inputType}, autocomplete: ${autocomplete}`);
          }
          
          // Test focus behavior
          await input.focus();
          await page.waitForTimeout(100);
          
          const isFocused = await input.evaluate(el => document.activeElement === el);
          expect.soft(isFocused, 'Input should be focusable').toBeTruthy();
        }
      }
    }
  });

  test('Mobile menu accessibility', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Test only relevant for mobile devices');
    
    // Find mobile menu toggle
    const menuToggle = page.locator('.mobile-menu-toggle, .hamburger-menu, [aria-label*="menu"], [aria-expanded]');
    
    if (await menuToggle.count() > 0) {
      const toggle = menuToggle.first();
      
      // Check ARIA attributes
      const ariaLabel = await toggle.getAttribute('aria-label');
      const ariaExpanded = await toggle.getAttribute('aria-expanded');
      const ariaControls = await toggle.getAttribute('aria-controls');
      
      expect.soft(ariaLabel, 'Menu toggle should have aria-label').toBeTruthy();
      expect.soft(ariaExpanded !== null, 'Menu toggle should have aria-expanded').toBeTruthy();
      
      // Test menu opening
      await toggle.click();
      await page.waitForTimeout(500);
      
      // Check if aria-expanded changed
      const expandedAfterClick = await toggle.getAttribute('aria-expanded');
      expect.soft(expandedAfterClick === 'true', 'aria-expanded should be true when menu is open').toBeTruthy();
      
      // Check menu content accessibility
      const mobileMenu = page.locator('.mobile-nav, .mobile-menu, .nav-menu[aria-expanded="true"]');
      
      if (await mobileMenu.count() > 0) {
        // Check if menu is properly labeled
        const menuRole = await mobileMenu.first().getAttribute('role');
        const menuLabel = await mobileMenu.first().getAttribute('aria-label');
        
        expect.soft(menuRole === 'navigation' || menuLabel, 'Mobile menu should have proper role or label').toBeTruthy();
        
        // Test keyboard navigation in menu
        await page.keyboard.press('Tab');
        await page.waitForTimeout(100);
        
        const focusedElement = page.locator(':focus');
        const isInMenu = await focusedElement.evaluate(el => {
          return el.closest('.mobile-nav, .mobile-menu, .nav-menu') !== null;
        });
        
        expect.soft(isInMenu, 'Tab should navigate within mobile menu').toBeTruthy();
        
        // Test Escape key to close menu
        await page.keyboard.press('Escape');
        await page.waitForTimeout(500);
        
        const expandedAfterEscape = await toggle.getAttribute('aria-expanded');
        expect.soft(expandedAfterEscape === 'false', 'Escape should close mobile menu').toBeTruthy();
      }
    }
  });

  test('Heading hierarchy accessibility', async ({ page }) => {
    // Check heading hierarchy (h1 > h2 > h3, etc.)
    const headings = page.locator('h1, h2, h3, h4, h5, h6');
    const headingCount = await headings.count();
    
    if (headingCount > 0) {
      const headingLevels = [];
      
      for (let i = 0; i < headingCount; i++) {
        const heading = headings.nth(i);
        const tagName = await heading.evaluate(el => el.tagName.toLowerCase());
        const level = parseInt(tagName.charAt(1));
        const text = await heading.textContent();
        
        headingLevels.push({ level, text: text?.slice(0, 50) });
      }
      
      // Check for proper h1 usage (should have exactly one h1)
      const h1Count = headingLevels.filter(h => h.level === 1).length;
      expect.soft(h1Count === 1, 'Page should have exactly one h1 element').toBeTruthy();
      
      // Check heading hierarchy (no skipping levels)
      for (let i = 1; i < headingLevels.length; i++) {
        const currentLevel = headingLevels[i].level;
        const previousLevel = headingLevels[i - 1].level;
        
        if (currentLevel > previousLevel) {
          const levelDifference = currentLevel - previousLevel;
          expect.soft(levelDifference === 1, 
            `Heading level should not skip: h${previousLevel} followed by h${currentLevel}`).toBeTruthy();
        }
      }
      
      console.log('Heading structure:', headingLevels);
    }
  });

  test('Zoom and scale accessibility', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Test only relevant for mobile devices');
    
    // Check viewport meta tag allows user scaling
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');
    
    if (viewportMeta) {
      const hasUserScalableNo = viewportMeta.includes('user-scalable=no') || viewportMeta.includes('user-scalable=0');
      const hasMaxScale1 = viewportMeta.includes('maximum-scale=1');
      
      expect.soft(!hasUserScalableNo, 'Viewport should not disable user scaling').toBeTruthy();
      expect.soft(!hasMaxScale1, 'Viewport should not restrict maximum scale to 1').toBeTruthy();
    }
    
    // Test text scaling (simulate browser zoom)
    const originalFontSize = await page.evaluate(() => {
      return parseFloat(window.getComputedStyle(document.body).fontSize);
    });
    
    // Simulate 200% zoom by changing font size
    await page.addStyleTag({
      content: 'html { font-size: 200% !important; }'
    });
    
    await page.waitForTimeout(500);
    
    // Check that content is still usable at 200% zoom
    const criticalElements = page.locator('nav, main, button, a');
    const elementCount = await criticalElements.count();
    
    for (let i = 0; i < Math.min(elementCount, 5); i++) {
      const element = criticalElements.nth(i);
      
      if (await element.isVisible()) {
        const boundingBox = await element.boundingBox();
        const viewport = page.viewportSize();
        
        // Elements should still be within viewport bounds
        expect.soft(boundingBox.x + boundingBox.width <= viewport.width * 1.1, 
          'Elements should remain usable at 200% zoom').toBeTruthy();
      }
    }
  });
});