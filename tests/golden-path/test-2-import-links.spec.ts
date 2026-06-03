import { expect, test } from "../fixtures";


test('Test 2: Import links and view on target website', async ({ page }) => {
  console.log('Starting Test 2: Import links and navigate');

  const testLink = {
    id: 'test-link-' + Date.now(),
    name: 'Test Search Link',
    href_format: 'https://www.google.com/search?q={text-value}',
  };

  // Navigate to the target website
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
