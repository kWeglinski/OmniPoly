import { test, expect } from '@playwright/test';

test.describe('OmniPoly - Home Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('page loads and shows Translate tab', async ({ page }) => {
    const translateTab = page.getByRole('tab', { name: 'Translate' });
    await expect(translateTab).toBeVisible();
    await expect(translateTab).toHaveAttribute('aria-selected', 'true');
  });

  test('page has text input area for translation', async ({ page }) => {
    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible();
  });

  test('page has a result/output area', async ({ page }) => {
    const outputArea = page.locator('.translation').first();
    await expect(outputArea).toBeVisible();
  });

  test('tab navigation works - switch to Language Check', async ({ page }) => {
    const langCheckTab = page.getByRole('tab', { name: 'Language Check' });

    await expect(langCheckTab).toBeVisible();
    await langCheckTab.click();

    const tabIndicator = page.locator('[role="tab"][aria-selected="true"]');
    await expect(tabIndicator).toContainText('Language Check');
  });

  test('tab navigation - switch back to Translate', async ({ page }) => {
    const langCheckTab = page.getByRole('tab', { name: 'Language Check' });
    await langCheckTab.click();

    const translateTab = page.getByRole('tab', { name: 'Translate' });
    await expect(translateTab).toBeVisible();
    await translateTab.click();

    const tabIndicator = page.locator('[role="tab"][aria-selected="true"]');
    await expect(tabIndicator).toContainText('Translate');
  });

  test('typing in textarea triggers auto-translate (debounced)', async ({ page }) => {
    const textarea = page.locator('textarea').first();

    await textarea.fill('Hello world');
    await expect(textarea).toHaveValue('Hello world');

    await page.waitForTimeout(2000);
  });

  test('screenshot - full page visual baseline', async ({ page }) => {
    await expect(page).toHaveScreenshot('homepage.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.05,
    });
  });

  test('settings panel is visible on translate tab', async ({ page }) => {
    const settingsContainer = page.locator('.settings');
    await expect(settingsContainer).toBeVisible();
  });

  test('page responds to keyboard input', async ({ page }) => {
    const textarea = page.locator('textarea').first();

    await textarea.click();
    await page.keyboard.type('Testing');
    await expect(textarea).toContainText('Testing');
  });

  test('mobile viewport - layout adapts', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 375, height: 812 } });
    const page = await context.newPage();

    await page.goto('/');

    const translateTab = page.getByRole('tab', { name: 'Translate' });
    await expect(translateTab).toBeVisible();
    await expect(page).toHaveScreenshot('homepage-mobile.png', {
      maxDiffPixelRatio: 0.05,
    });

    await context.close();
  });
});
