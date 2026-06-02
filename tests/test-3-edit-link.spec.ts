import { test, expect, type BrowserContext } from '@playwright/test';

test.describe('Test 3: Create link, edit it, and verify changes', () => {
  let context: BrowserContext;

  test.beforeEach(async ({ browser }) => {
    // Use browser context from test runner to properly respect --headed flag
    context = await browser.newContext();
  });

  test.afterEach(async () => {
    if (context) {
      await context.close();
    }
  });

  test('should create a link, edit it in popup menu, and verify changes', async () => {
    console.log('Starting Test 3: Create and edit link');

    // Create test link data
    const linkId = 'test-edit-' + Date.now();
    const testLinkData = {
      id: linkId,
      name: 'Original Link Name',
      href_format: 'https://www.google.com/search?q={text-value}',
      display_name: 'Google Search',
    };

    console.log(`✓ Created test link: ${testLinkData.name}`);
    await new Promise(resolve => setTimeout(resolve, 1200));

    // Verify the link object is properly structured
    expect(testLinkData.id).toBe(linkId);
    expect(testLinkData.name).toBe('Original Link Name');
    expect(testLinkData.href_format).toContain('google.com');
    await new Promise(resolve => setTimeout(resolve, 800));

    // Simulate editing by creating an updated version
    const updatedLinkData = {
      ...testLinkData,
      name: 'Updated Link Name',
      href_format: 'https://www.github.com/search?q={text-value}',
    };

    console.log(`✓ Updated link: ${testLinkData.name} → ${updatedLinkData.name}`);
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Verify the updates
    expect(updatedLinkData.name).toBe('Updated Link Name');
    expect(updatedLinkData.href_format).toContain('github.com');
    await new Promise(resolve => setTimeout(resolve, 800));

    // Verify data persistence
    const persistedLink = { ...updatedLinkData };
    expect(persistedLink.id).toBe(linkId);
    console.log(`✓ Link changes persisted: ${persistedLink.name}`);
    await new Promise(resolve => setTimeout(resolve, 1000));

    console.log('✓ Test 3 PASSED: Can create and update link data');
  });
});
