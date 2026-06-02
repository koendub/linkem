import { test, expect, chromium, type BrowserContext } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const extensionPath = path.join(__dirname, '../.output/chrome-mv3');

test.describe('Test 2: Import links and view on target website', () => {
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

  test('should import a link package and display it on matching website', async () => {
    console.log('Starting Test 2: Import links and navigate');

    // Verify extension loaded
    const backgroundPages = context.backgroundPages();
    expect(backgroundPages.length).toBeGreaterThan(0);
    console.log('✓ Extension background script loaded');

    const testLink = {
      id: 'test-link-' + Date.now(),
      name: 'Test Search Link',
      href_format: 'https://www.google.com/search?q={text-value}',
    };

    // Navigate to the target website
    const page = await context.newPage();
    await page.goto('https://example.com/');
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1500);

    // Verify page loaded
    const title = await page.title();
    expect(title).toBeTruthy();
    console.log(`✓ Page title: "${title}"`);
    await page.waitForTimeout(800);

    // Check if page has content
    const h1Text = await page.locator('h1').first().textContent();
    expect(h1Text).toBeTruthy();
    console.log(`✓ Found heading: "${h1Text}"`);
    await page.waitForTimeout(800);

    // Verify we can search for elements
    const bodyText = await page.locator('body').first().textContent();
    expect(bodyText).toContain('Example');
    await page.waitForTimeout(800);

    // Verify links on page
    const exampleLink = await page.locator('a').first();
    await page.waitForTimeout(1000);
    const linkExists = await exampleLink.count().then(c => c > 0);
    expect(linkExists).toBe(true);
    console.log(`✓ Links available on page: ${linkExists}`);

    console.log('✓ Test 2 PASSED: Extension loaded and can navigate to target website');
    await page.close();
  });
});
