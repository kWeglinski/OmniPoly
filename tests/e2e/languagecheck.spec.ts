import { test, expect } from '@playwright/test';

test.describe('Language Check Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    const langCheckTab = page.locator('text=Language Check').first();
    await expect(langCheckTab).toBeVisible();
    await langCheckTab.click();

    const tabIndicator = page.locator('[role="tab"][aria-selected="true"]');
    await expect(tabIndicator).toContainText('Language Check');
  });

  test('language check tab loads with language selector', async ({ page }) => {
    const langSelector = page.locator('[id*="tags-standard"], [role="combobox"]').first();
    await expect(langSelector).toBeVisible();
  });

  test('language check tab has content input area', async ({ page }) => {
    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible();
  });

  test('can type text in language check', async ({ page }) => {
    const textarea = page.locator('textarea').first();

    await textarea.fill('This is a test sentence for grammar checking.');
    await expect(textarea).toHaveValue('This is a test sentence for grammar checking.');
  });

  test('screenshot - language check tab visual baseline', async ({ page }) => {
    await expect(page).toHaveScreenshot('language-check-tab.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('language check tab with text entered', async ({ page }) => {
    const textarea = page.locator('textarea').first();

    await textarea.fill('This is a test sentence.');
    await page.waitForTimeout(1500);

    await expect(page).toHaveScreenshot('language-check-tab-with-text.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('can switch between tabs', async ({ page }) => {
    await page.locator('text=Translate').first().click();

    const tabIndicator = page.locator('[role="tab"][aria-selected="true"]');
    await expect(tabIndicator).toContainText('Translate');

    const textarea = page.locator('textarea').first();
    await expect(textarea).toBeVisible();

    await page.locator('text=Language Check').first().click();
    await expect(page.locator('[role="tab"][aria-selected="true"]')).toContainText('Language Check');
  });

  test('page loads without errors in console on language check', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    await page.goto('/');
    await page.locator('text=Language Check').first().click();
    await page.waitForTimeout(1000);

    expect(errors.length).toBe(0);
  });
});
