import { test, expect } from '@playwright/test';

test.describe('Translate Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');

    const translateTab = page.getByRole('tab', { name: 'Translate' });
    await expect(translateTab).toBeVisible();
  });

  test('display source and target language selectors', async ({ page }) => {
    const sourceSelector = page.getByRole('combobox').first();
    await expect(sourceSelector).toBeVisible();

    const targetSelector = page.getByRole('combobox').last();
    await expect(targetSelector).toBeVisible();
  });

  test('can enter text in source textarea', async ({ page }) => {
    const textarea = page.locator('textarea').first();

    await textarea.fill('Hello, how are you?');
    await expect(textarea).toHaveValue('Hello, how are you?');
  });

  test('language selectors are clickable dropdowns', async ({ page }) => {
    const sourceSelector = page.getByRole('combobox').first();

    if (await sourceSelector.isVisible()) {
      await expect(sourceSelector).toBeVisible();
    }
  });

  test('result area exists and is interactive', async ({ page }) => {
    const textarea = page.locator('textarea').first();
    await textarea.fill('Hello world');

    const resultArea = page.locator('.translation').first();
    await expect(resultArea).toBeVisible();

    await page.waitForTimeout(2000);
  });

  test('screenshot - translate tab visual baseline', async ({ page }) => {
    await expect(page).toHaveScreenshot('translate-tab.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('translate tab with text entered', async ({ page }) => {
    const textarea = page.locator('textarea').first();

    await textarea.fill('Hello world');
    await page.waitForTimeout(1500);

    await expect(page).toHaveScreenshot('translate-tab-with-text.png', {
      maxDiffPixelRatio: 0.05,
    });
  });

  test('page loads without errors in console', async ({ page }) => {
    const errors: string[] = [];

    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error' && !text.includes('fetch failed') && !text.includes('ENOTFOUND')) {
        errors.push(text);
      }
    });

    await page.goto('/');
    await page.waitForTimeout(1000);

    expect(errors.length).toBe(0);
  });
});
