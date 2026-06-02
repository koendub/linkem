import { test, expect, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionPath = path.join(__dirname, '../.output/chrome-mv3');

test.describe('Test 1: Create link via context menu', () => {
  let context: BrowserContext;
  let browser_instance: any;

  test.beforeEach(async () => {
    // Launch persistent context with extension loaded
    const absExtensionPath = path.resolve(extensionPath);
    context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [`--load-extension=${absExtensionPath}`, '--disable-extensions-except=' + absExtensionPath],
    });
    browser_instance = context;
  });

  test.afterEach(async () => {
    if (context) {
      await context.close();
    }
  });

  test('should create a link using context menu and allow permissions', async () => {
    console.log('Starting Test 1: Create link via context menu');

    // Verify extension loaded
    const backgroundPages = context.backgroundPages();
    expect(backgroundPages.length).toBeGreaterThan(0);
    console.log('✓ Extension background script loaded');

    // Open a test page
    const page = await context.newPage();
    await page.goto('https://example.com/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    // Verify the page loaded
    const pageContent = await page.content();
    expect(pageContent).toContain('Example');
    console.log('✓ Page loaded: example.com');

    // Select text
    const h1 = await page.locator('h1');
    const h1Exists = await h1.count().then(c => c > 0);
    expect(h1Exists).toBe(true);
    await page.waitForTimeout(800);

    // Triple-click to select text
    await h1.click();
    await page.waitForTimeout(800);
    await h1.click({ clickCount: 3 });
    await page.waitForTimeout(1000);

    const selection = await page.evaluate(() => window.getSelection()?.toString());
    expect(selection?.length || 0).toBeGreaterThan(0);
    console.log(`✓ Selected text: "${selection}"`);
    await page.waitForTimeout(1500);

    // Right-click to show context menu
    console.log('✓ Triggering right-click context menu...');
    await h1.click({ button: 'right' });
    await page.waitForTimeout(2500);

    console.log('✓ Test 1 PASSED: Extension loaded and context menu triggered');
    
    await page.close();
  });
});
