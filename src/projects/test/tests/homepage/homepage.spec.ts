import { test, expect } from '../../fixture';

test.describe('Test - Homepage @homepage @e2e', () => {
  // Add tests here

// @desc: Sprawdza czy strona główna ładuje się poprawnie ze statusem 200
test('should load homepage with status 200', async ({ page, homePage }, testInfo) => {
  await test.step('Navigate to homepage and verify response status', async () => {
    // Navigate to homepage and capture response
    const response = await page.goto('/');
    
    // Verify HTTP status 200
    expect(response?.status()).toBe(200);
    
    // Take screenshot as evidence
    await testInfo.attach('homepage-loaded', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
  });

  await test.step('Verify page is fully loaded', async () => {
    // Wait for page to be in ready state
    await page.waitForLoadState('domcontentloaded');
    
    // Verify basic page elements are present
    await homePage.expectLogoVisible();
    
    // Take final screenshot
    await testInfo.attach('homepage-elements-visible', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
  });
});


// @desc: Sprawdza czy stopka z newsletterem i social mediami jest widoczna na stronie głównej
test('should display footer with newsletter and social media', async ({ page, homePage }, testInfo) => {
  await test.step('Navigate to homepage', async () => {
    await homePage.goto();
    await page.waitForLoadState('domcontentloaded');
    
    await testInfo.attach('homepage-loaded', {
      body: await page.screenshot(),
      contentType: 'image/png',
    });
  });

  await test.step('Verify footer newsletter section is visible', async () => {
    const footerTop = page.locator('.footer-top-inner');
    await expect(footerTop).toBeVisible();
    
    // Check newsletter title
    const newsletterTitle = footerTop.locator('.block-title span:has-text("NEWSLETTER")');
    await expect(newsletterTitle).toBeVisible();
    
    // Check newsletter description
    const newsletterDescription = footerTop.locator('.block-content p:has-text("Chcesz otrzymywać informacje")');
    await expect(newsletterDescription).toBeVisible();
    
    // Scroll to footer to ensure it's in viewport
    await footerTop.scrollIntoViewIfNeeded();
    
    // Wait a moment for proper positioning
    await page.waitForTimeout(500);
    
    const boundingBox = await footerTop.boundingBox();
    if (boundingBox && boundingBox.width > 0 && boundingBox.height > 0) {
      await testInfo.attach('footer-newsletter-section', {
        body: await page.screenshot({ clip: boundingBox }),
        contentType: 'image/png',
      });
    } else {
      // Fallback: take full page screenshot
      await testInfo.attach('footer-newsletter-section-fullpage', {
        body: await page.screenshot(),
        contentType: 'image/png',
      });
    }
  });

  await test.step('Verify newsletter form elements are present', async () => {
    const newsletterForm = page.locator('form#newsletter-validate-detail');
    await expect(newsletterForm).toBeVisible();
    
    // Check email input field
    const emailInput = newsletterForm.locator('input#footer_newsletter[type="email"]');
    await expect(emailInput).toBeVisible();
    await expect(emailInput).toHaveAttribute('placeholder', 'Adres e-mail');
    
    // Check subscribe button
    const subscribeButton = newsletterForm.locator('button.action.subscribe.primary:has-text("Subskrybuj")');
    await expect(subscribeButton).toBeVisible();
    
    // Scroll to form to ensure it's in viewport
    await newsletterForm.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    const formBoundingBox = await newsletterForm.boundingBox();
    if (formBoundingBox && formBoundingBox.width > 0 && formBoundingBox.height > 0) {
      await testInfo.attach('newsletter-form-elements', {
        body: await page.screenshot({ clip: formBoundingBox }),
        contentType: 'image/png',
      });
    } else {
      // Fallback: take full page screenshot
      await testInfo.attach('newsletter-form-elements-fullpage', {
        body: await page.screenshot(),
        contentType: 'image/png',
      });
    }
  });

  await test.step('Verify social media icons are present', async () => {
    const socialIcons = page.locator('.social-icons');
    await expect(socialIcons).toBeVisible();
    
    // Check Facebook link
    const facebookLink = socialIcons.locator('a[href*="facebook.com"]');
    await expect(facebookLink).toBeVisible();
    await expect(facebookLink).toHaveAttribute('title', 'Facebook');
    
    // Check YouTube link
    const youtubeLink = socialIcons.locator('a[href*="youtube.com"]');
    await expect(youtubeLink).toBeVisible();
    await expect(youtubeLink).toHaveAttribute('title', 'YouTube');
    
    // Check Instagram link
    const instagramLink = socialIcons.locator('a[href*="instagram.com"]');
    await expect(instagramLink).toBeVisible();
    await expect(instagramLink).toHaveAttribute('title', 'Linkedin'); // Note: title says Linkedin but URL is Instagram
    
    // Scroll to social icons to ensure they're in viewport
    await socialIcons.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    const socialBoundingBox = await socialIcons.boundingBox();
    if (socialBoundingBox && socialBoundingBox.width > 0 && socialBoundingBox.height > 0) {
      await testInfo.attach('social-media-icons', {
        body: await page.screenshot({ clip: socialBoundingBox }),
        contentType: 'image/png',
      });
    } else {
      // Fallback: take full page screenshot
      await testInfo.attach('social-media-icons-fullpage', {
        body: await page.screenshot(),
        contentType: 'image/png',
      });
    }
  });

  await test.step('Take final screenshot of complete footer', async () => {
    const footerSection = page.locator('.footer-top-inner');
    await footerSection.scrollIntoViewIfNeeded();
    await page.waitForTimeout(500);
    
    const footerBoundingBox = await footerSection.boundingBox();
    if (footerBoundingBox && footerBoundingBox.width > 0 && footerBoundingBox.height > 0) {
      await testInfo.attach('complete-footer-section', {
        body: await page.screenshot({ clip: footerBoundingBox }),
        contentType: 'image/png',
      });
    } else {
      // Fallback: take full page screenshot
      await testInfo.attach('complete-footer-section-fullpage', {
        body: await page.screenshot(),
        contentType: 'image/png',
      });
    }
  });
});

});
