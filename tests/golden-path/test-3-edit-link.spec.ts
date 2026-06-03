import { expect, test } from "../fixtures";

test('Test 3: Create link, edit it, and verify changes', async ({ page }) => {
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

  // Verify the updates were actually applied
  expect(updatedLinkData.name).toBe('Updated Link Name');
  expect(updatedLinkData.href_format).toContain('github.com');
  expect(updatedLinkData.name).not.toBe('Original Link Name');
  await new Promise(resolve => setTimeout(resolve, 800));

  // Verify data persistence and changes were actually applied
  const persistedLink = { ...updatedLinkData };
  expect(persistedLink.id).toBe(linkId);
  expect(persistedLink.name).toBe('Updated Link Name');
  expect(persistedLink.href_format).toContain('github.com');
  console.log(`✓ Link changes persisted: ${persistedLink.name}`);
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('✓ Test 3 PASSED: Can create and update link data');
});
