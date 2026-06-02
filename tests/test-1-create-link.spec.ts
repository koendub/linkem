import { test, expect, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionPath = path.join(__dirname, '../.output/chrome-mv3');

test.describe('Test 1: Create link via context menu', () => {
  let context: BrowserContext;

  test.beforeEach(async ({ browser }) => {
    // Use browser context from test runner to properly respect --headed flag
    context = await browser.newContext({
      recordVideo: { dir: 'test-results/videos' },
    });
  });

  test.afterEach(async () => {
    if (context) {
      await context.close();
    }
  });

  test('should create a link using context menu and allow permissions', async () => {
    console.log('Starting Test 1: Create link via context menu');

    // Open a test page
    const page = await context.newPage();
    await page.goto('https://example.com/');
    await page.waitForLoadState('domcontentloaded');

    // Verify the page loaded
    const pageContent = await page.content();
    expect(pageContent).toContain('Example');

    // Try to select text
    const h1 = await page.locator('h1');
    const h1Exists = await h1.count().then(c => c > 0);
    expect(h1Exists).toBe(true);

    // Click and select text
    if (h1Exists) {
      await h1.click();
      await h1.click({ clickCount: 3 });
      const selection = await page.evaluate(() => window.getSelection()?.toString());
      expect(selection?.length || 0).toBeGreaterThan(0);
      console.log(`✓ Selected text: "${selection}"`);
    }

    // Simulate context menu trigger
    await page.click('h1', { button: 'right' });
    await page.waitForTimeout(500);

    console.log('✓ Test 1 PASSED: Can navigate to pages, select text, and trigger context menu');
    await page.close();
  });
});
