// SmartPetBuys Mobile Testing - Visual Regression Tests for Responsive Breakpoints
// Tests visual consistency across responsive breakpoints

const { test, expect } = require('@playwright/test');

test.describe('Visual Regression - Responsive Breakpoints @visual', () => {
  const testPages = [
    { path: '/', name: 'homepage' },
    { path: '/posts/', name: 'posts-listing' },
  ];

  const breakpoints = [
    { width: 320, height: 568, name: 'mobile-320' },
    { width: 375, height: 667, name: 'mobile-375' },
    { width: 390, height: 844, name: 'mobile-390' },
    { width: 430, height: 932, name: 'mobile-430' },
    { width: 480, height: 854, name: 'phablet-480' },
    { width: 768, height: 1024, name: 'tablet-768' },
    { width: 1024, height: 768, name: 'tablet-landscape' },
  ];

  for (const page of testPages) {
    for (const breakpoint of breakpoints) {
      test(`${page.name} - ${breakpoint.name} visual regression`, async ({ page: playwrightPage }) => {
        // Set viewport to specific breakpoint
        await playwrightPage.setViewportSize({ 
          width: breakpoint.width, 
          height: breakpoint.height 
        });

        // Navigate to page
        await playwrightPage.goto(page.path);
        await playwrightPage.waitForLoadState('networkidle');

        // Wait for any animations or lazy loading
        await playwrightPage.waitForTimeout(1000);

        // Hide dynamic content that might cause false failures
        await playwrightPage.addStyleTag({
          content: `
            .timestamp, .date, .current-time { visibility: hidden !important; }
            .random-content, .live-content { display: none !important; }
            .animation, .animate { animation: none !important; transition: none !important; }
          `
        });

        // Take full page screenshot
        const screenshotName = `${page.name}-${breakpoint.name}`;
        await expect(playwrightPage).toHaveScreenshot(`${screenshotName}-full.png`, {
          fullPage: true,
          clip: { x: 0, y: 0, width: breakpoint.width, height: Math.min(breakpoint.height * 3, 4000) }
        });

        // Take header screenshot
        const header = playwrightPage.locator('header, .header, .site-header').first();
        if (await header.isVisible()) {
          await expect(header).toHaveScreenshot(`${screenshotName}-header.png`);
        }

        // Take main content screenshot
        const main = playwrightPage.locator('main, .main-content, .content').first();
        if (await main.isVisible()) {
          await expect(main).toHaveScreenshot(`${screenshotName}-main.png`);
        }

        // Take footer screenshot if visible
        await playwrightPage.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await playwrightPage.waitForTimeout(500);
        
        const footer = playwrightPage.locator('footer, .footer, .site-footer').first();
        if (await footer.isVisible()) {
          await expect(footer).toHaveScreenshot(`${screenshotName}-footer.png`);
        }
      });
    }
  }

  test('Product cards visual consistency across breakpoints', async ({ page }) => {
    await page.goto('/posts/');
    await page.waitForLoadState('networkidle');

    // Check if product cards exist
    const productCards = page.locator('.product-box, .product-card, .post-card');
    const cardCount = await productCards.count();

    if (cardCount > 0) {
      for (const breakpoint of breakpoints) {
        await page.setViewportSize({ 
          width: breakpoint.width, 
          height: breakpoint.height 
        });
        await page.waitForTimeout(500);

        // Take screenshot of product grid
        const productGrid = page.locator('.products-grid, .post-grid, .grid').first();
        if (await productGrid.isVisible()) {
          await expect(productGrid).toHaveScreenshot(`product-grid-${breakpoint.name}.png`);
        }

        // Take screenshot of individual product card
        const firstCard = productCards.first();
        if (await firstCard.isVisible()) {
          await expect(firstCard).toHaveScreenshot(`product-card-${breakpoint.name}.png`);
        }
      }
    }
  });

  test('Navigation visual consistency across breakpoints', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ 
        width: breakpoint.width, 
        height: breakpoint.height 
      });
      await page.waitForTimeout(500);

      // Take navigation screenshot
      const nav = page.locator('nav, .navigation, .nav, header').first();
      if (await nav.isVisible()) {
        await expect(nav).toHaveScreenshot(`navigation-${breakpoint.name}.png`);
      }

      // Test mobile menu if on mobile breakpoint
      if (breakpoint.width <= 768) {
        const menuToggle = page.locator('.mobile-menu-toggle, .hamburger-menu, [aria-label*="menu"]');
        
        if (await menuToggle.count() > 0) {
          await menuToggle.first().click();
          await page.waitForTimeout(500);

          const mobileMenu = page.locator('.mobile-nav, .mobile-menu, .nav-menu[aria-expanded="true"]');
          if (await mobileMenu.isVisible()) {
            await expect(mobileMenu).toHaveScreenshot(`mobile-menu-${breakpoint.name}.png`);
          }

          // Close menu
          await menuToggle.first().click();
          await page.waitForTimeout(500);
        }
      }
    }
  });

  test('Form elements visual consistency across breakpoints', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Look for forms
    const forms = page.locator('form, .newsletter-form, .search-form');
    const formCount = await forms.count();

    if (formCount > 0) {
      for (const breakpoint of breakpoints) {
        await page.setViewportSize({ 
          width: breakpoint.width, 
          height: breakpoint.height 
        });
        await page.waitForTimeout(500);

        // Take form screenshots
        for (let i = 0; i < Math.min(formCount, 3); i++) {
          const form = forms.nth(i);
          if (await form.isVisible()) {
            await expect(form).toHaveScreenshot(`form-${i}-${breakpoint.name}.png`);
          }
        }
      }
    }
  });

  test('Typography visual consistency across breakpoints', async ({ page }) => {
    await page.goto('/posts/');
    await page.waitForLoadState('networkidle');

    // Navigate to a post with typography
    const postLinks = page.locator('article a, .post-title a, .post-link');
    const linkCount = await postLinks.count();

    if (linkCount > 0) {
      await postLinks.first().click();
      await page.waitForLoadState('networkidle');

      for (const breakpoint of breakpoints) {
        await page.setViewportSize({ 
          width: breakpoint.width, 
          height: breakpoint.height 
        });
        await page.waitForTimeout(500);

        // Test heading typography
        const headings = page.locator('h1, h2, h3').first();
        if (await headings.isVisible()) {
          await expect(headings).toHaveScreenshot(`headings-${breakpoint.name}.png`);
        }

        // Test paragraph typography
        const paragraphs = page.locator('.post-content p, .content p, main p').first();
        if (await paragraphs.isVisible()) {
          await expect(paragraphs).toHaveScreenshot(`paragraph-${breakpoint.name}.png`);
        }
      }
    }
  });

  test('Sticky elements visual behavior across breakpoints', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const stickyElements = page.locator('[class*="sticky"], .sticky-header, .fixed-header');
    const stickyCount = await stickyElements.count();

    if (stickyCount > 0) {
      for (const breakpoint of breakpoints) {
        await page.setViewportSize({ 
          width: breakpoint.width, 
          height: breakpoint.height 
        });
        await page.waitForTimeout(500);

        // Test sticky element at top
        await page.evaluate(() => window.scrollTo(0, 0));
        await page.waitForTimeout(300);

        const stickyElement = stickyElements.first();
        if (await stickyElement.isVisible()) {
          await expect(stickyElement).toHaveScreenshot(`sticky-top-${breakpoint.name}.png`);
        }

        // Test sticky element when scrolled
        await page.evaluate(() => window.scrollTo(0, 500));
        await page.waitForTimeout(500);

        if (await stickyElement.isVisible()) {
          await expect(stickyElement).toHaveScreenshot(`sticky-scrolled-${breakpoint.name}.png`);
        }
      }
    }
  });

  test('Button and interactive elements visual consistency', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    for (const breakpoint of breakpoints) {
      await page.setViewportSize({ 
        width: breakpoint.width, 
        height: breakpoint.height 
      });
      await page.waitForTimeout(500);

      // Test button states
      const buttons = page.locator('button, .btn, input[type="submit"]');
      const buttonCount = await buttons.count();

      if (buttonCount > 0) {
        const button = buttons.first();
        
        if (await button.isVisible()) {
          // Normal state
          await expect(button).toHaveScreenshot(`button-normal-${breakpoint.name}.png`);

          // Hover state (desktop only)
          if (breakpoint.width > 768) {
            await button.hover();
            await page.waitForTimeout(200);
            await expect(button).toHaveScreenshot(`button-hover-${breakpoint.name}.png`);
          }

          // Focus state
          await button.focus();
          await page.waitForTimeout(200);
          await expect(button).toHaveScreenshot(`button-focus-${breakpoint.name}.png`);
        }
      }

      // Test link states
      const links = page.locator('a');
      const linkCount = await links.count();

      if (linkCount > 0) {
        const link = links.first();
        
        if (await link.isVisible()) {
          // Normal state
          await expect(link).toHaveScreenshot(`link-normal-${breakpoint.name}.png`);

          // Focus state
          await link.focus();
          await page.waitForTimeout(200);
          await expect(link).toHaveScreenshot(`link-focus-${breakpoint.name}.png`);
        }
      }
    }
  });
});