// SmartPetBuys Mobile Testing - Smoke Tests for Basic Functionality
// Quick smoke tests to verify basic site functionality across devices

const { test, expect } = require('@playwright/test');

test.describe('Basic Functionality Smoke Tests @smoke @critical', () => {
  test('Homepage loads successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check page loads
    await expect(page).toHaveTitle(/SmartPetBuys/);
    
    // Check main elements are visible
    await expect(page.locator('header')).toBeVisible();
    await expect(page.locator('main, .main-content')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
  });

  test('Navigation works on mobile', async ({ page, isMobile }) => {
    await page.goto('/');
    
    if (isMobile) {
      // Test mobile menu
      const menuToggle = page.locator('button.mobile-menu-toggle, button.hamburger-menu, button[aria-label*="menu"]');
      if (await menuToggle.count() > 0) {
        await menuToggle.first().click();
        await page.waitForTimeout(500);
        
        const mobileMenu = page.locator('.mobile-nav, .mobile-menu');
        await expect(mobileMenu).toBeVisible();
      }
    } else {
      // Test desktop navigation
      const nav = page.locator('nav, .nav-menu');
      await expect(nav.first()).toBeVisible();
    }
  });

  test('Posts page loads and displays content', async ({ page }) => {
    await page.goto('/posts/');
    await page.waitForLoadState('networkidle');
    
    // Check posts are visible
    const posts = page.locator('article, .post, .post-card');
    await expect(posts.first()).toBeVisible();
  });

  test('Basic responsive layout works', async ({ page }) => {
    await page.goto('/');
    
    // Test key breakpoints
    const breakpoints = [320, 768, 1200];
    
    for (const width of breakpoints) {
      await page.setViewportSize({ width, height: 800 });
      await page.waitForTimeout(300);
      
      // Check no horizontal overflow
      const hasOverflow = await page.evaluate(() => {
        return document.documentElement.scrollWidth > document.documentElement.clientWidth;
      });
      
      expect(hasOverflow).toBeFalsy();
    }
  });

  test('Search functionality basic test', async ({ page }) => {
    await page.goto('/');
    
    const searchInput = page.locator('input[type="search"], input[placeholder*="search"]');
    
    if (await searchInput.count() > 0) {
      await searchInput.fill('dog');
      await page.keyboard.press('Enter');
      
      // Should navigate to search results or show results
      await page.waitForTimeout(1000);
      expect(page.url()).toContain('search');
    }
  });
});