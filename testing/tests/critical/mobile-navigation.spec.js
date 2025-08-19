// SmartPetBuys Mobile Testing - Critical Mobile Navigation Tests
// Tests core navigation functionality across mobile devices

const { test, expect } = require('@playwright/test');

test.describe('Mobile Navigation - Critical Tests @critical @smoke', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to homepage before each test
    await page.goto('/');
    
    // Wait for page to be fully loaded
    await page.waitForLoadState('networkidle');
  });

  test('Mobile menu toggle functionality', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Test only relevant for mobile devices');
    
    // Check if mobile menu toggle is visible
    const menuToggle = page.locator('.mobile-menu-toggle, .hamburger-menu, [aria-label*="menu"], [aria-label*="Menu"]');
    await expect(menuToggle).toBeVisible();
    
    // Check touch target size (minimum 44px)
    const toggleBoundingBox = await menuToggle.boundingBox();
    expect(toggleBoundingBox.width).toBeGreaterThanOrEqual(44);
    expect(toggleBoundingBox.height).toBeGreaterThanOrEqual(44);
    
    // Test menu opening
    await menuToggle.click();
    
    // Wait for menu animation
    await page.waitForTimeout(500);
    
    // Check if mobile menu is visible
    const mobileMenu = page.locator('.mobile-nav, .mobile-menu, .nav-menu[aria-expanded="true"]');
    await expect(mobileMenu).toBeVisible();
    
    // Test menu closing
    await menuToggle.click();
    await page.waitForTimeout(500);
    
    // Check if mobile menu is hidden
    await expect(mobileMenu).not.toBeVisible();
  });

  test('Mobile navigation links accessibility', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Test only relevant for mobile devices');
    
    // Open mobile menu
    const menuToggle = page.locator('.mobile-menu-toggle, .hamburger-menu, [aria-label*="menu"], [aria-label*="Menu"]');
    await menuToggle.click();
    await page.waitForTimeout(500);
    
    // Get all navigation links
    const navLinks = page.locator('.mobile-nav a, .mobile-menu a');
    const linkCount = await navLinks.count();
    
    expect(linkCount).toBeGreaterThan(0);
    
    // Test each navigation link
    for (let i = 0; i < linkCount; i++) {
      const link = navLinks.nth(i);
      
      // Check if link is visible and has proper touch targets
      await expect(link).toBeVisible();
      
      const linkBoundingBox = await link.boundingBox();
      if (linkBoundingBox) {
        expect(linkBoundingBox.height).toBeGreaterThanOrEqual(44);
      }
      
      // Check accessibility attributes
      const href = await link.getAttribute('href');
      const ariaLabel = await link.getAttribute('aria-label');
      const textContent = await link.textContent();
      
      // Ensure links have proper attributes or text content
      expect(href || ariaLabel || textContent).toBeTruthy();
    }
  });

  test('Logo visibility and accessibility', async ({ page }) => {
    // Check if logo is visible
    const logo = page.locator('.brand-logo, .logo, .site-logo, header img');
    await expect(logo.first()).toBeVisible();
    
    // Check if logo has proper alt text
    const logoImg = page.locator('header img, .logo img, .brand-logo img');
    if (await logoImg.count() > 0) {
      const altText = await logoImg.first().getAttribute('alt');
      expect(altText).toBeTruthy();
      expect(altText.length).toBeGreaterThan(0);
    }
    
    // Check if logo is clickable and leads to homepage
    const logoLink = page.locator('header a, .logo a, .brand-logo a').first();
    if (await logoLink.count() > 0) {
      const href = await logoLink.getAttribute('href');
      expect(href === '/' || href === '' || href?.includes('index')).toBeTruthy();
    }
  });

  test('Header stickiness on mobile scroll', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Test only relevant for mobile devices');
    
    // Get initial header position
    const header = page.locator('header, .header, .site-header');
    await expect(header).toBeVisible();
    
    const initialPosition = await header.boundingBox();
    
    // Scroll down significantly
    await page.evaluate(() => window.scrollTo(0, 1000));
    await page.waitForTimeout(500);
    
    // Check if header is still visible (sticky behavior)
    await expect(header).toBeVisible();
    
    // Check if header position changed appropriately for sticky behavior
    const scrolledPosition = await header.boundingBox();
    
    // Header should maintain visibility during scroll
    expect(scrolledPosition.y).toBeLessThanOrEqual(100);
  });

  test('Touch target sizes meet accessibility standards', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Test only relevant for mobile devices');
    
    // Check all interactive elements in header
    const interactiveElements = page.locator('header button, header a, header input, .mobile-menu-toggle');
    const elementCount = await interactiveElements.count();
    
    for (let i = 0; i < elementCount; i++) {
      const element = interactiveElements.nth(i);
      
      if (await element.isVisible()) {
        const boundingBox = await element.boundingBox();
        
        if (boundingBox) {
          // Check minimum touch target size (44px x 44px)
          expect(boundingBox.width).toBeGreaterThanOrEqual(44);
          expect(boundingBox.height).toBeGreaterThanOrEqual(44);
        }
      }
    }
  });

  test('Navigation search functionality', async ({ page, isMobile }) => {
    // Look for search functionality
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"], input[placeholder*="Search"], .search-input');
    const searchButton = page.locator('button[type="submit"], .search-button, .search-submit');
    
    if (await searchInput.count() > 0) {
      await expect(searchInput.first()).toBeVisible();
      
      if (isMobile) {
        // Test mobile search interaction
        await searchInput.first().click();
        await page.waitForTimeout(300);
        
        // Type search query
        await searchInput.first().fill('dog food');
        
        // Submit search if button exists
        if (await searchButton.count() > 0) {
          await searchButton.first().click();
          await page.waitForLoadState('networkidle');
          
          // Verify search results or search page loaded
          expect(page.url()).toContain('search');
        }
      }
    }
  });

  test('Breadcrumb navigation on mobile', async ({ page, isMobile }) => {
    // Navigate to a post page
    await page.goto('/posts/');
    await page.waitForLoadState('networkidle');
    
    // Check if there are post links to navigate to
    const postLinks = page.locator('article a, .post-title a, .post-link');
    if (await postLinks.count() > 0) {
      await postLinks.first().click();
      await page.waitForLoadState('networkidle');
      
      // Check for breadcrumb navigation
      const breadcrumbs = page.locator('.breadcrumb, .breadcrumbs, nav[aria-label*="breadcrumb"]');
      
      if (await breadcrumbs.count() > 0) {
        await expect(breadcrumbs.first()).toBeVisible();
        
        if (isMobile) {
          // Check breadcrumb touch targets on mobile
          const breadcrumbLinks = breadcrumbs.locator('a');
          const linkCount = await breadcrumbLinks.count();
          
          for (let i = 0; i < linkCount; i++) {
            const link = breadcrumbLinks.nth(i);
            const boundingBox = await link.boundingBox();
            
            if (boundingBox) {
              expect(boundingBox.height).toBeGreaterThanOrEqual(44);
            }
          }
        }
      }
    }
  });

  test('Mobile menu keyboard navigation', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Test only relevant for mobile devices');
    
    // Focus on menu toggle
    const menuToggle = page.locator('.mobile-menu-toggle, .hamburger-menu, [aria-label*="menu"]');
    await menuToggle.focus();
    
    // Open menu with Enter key
    await page.keyboard.press('Enter');
    await page.waitForTimeout(500);
    
    // Check if menu opened
    const mobileMenu = page.locator('.mobile-nav, .mobile-menu');
    await expect(mobileMenu).toBeVisible();
    
    // Navigate through menu items with Tab
    await page.keyboard.press('Tab');
    
    // Check if first menu item is focused
    const focusedElement = page.locator(':focus');
    await expect(focusedElement).toBeVisible();
    
    // Test Escape key to close menu
    await page.keyboard.press('Escape');
    await page.waitForTimeout(500);
    
    // Menu should be closed
    await expect(mobileMenu).not.toBeVisible();
  });
});