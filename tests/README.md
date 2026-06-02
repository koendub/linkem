# Link'em E2E Tests

This directory contains end-to-end tests for the Link'em browser extension using Playwright.

## Prerequisites

- Node.js 16+ installed
- All project dependencies installed (`npm install`)
- Chrome/Chromium browser (Playwright downloads it automatically, but you can specify a path)

## Setup

Tests are configured in `playwright.config.ts`. The configuration:
- Loads the extension from `.output/chrome` (built extension)
- Runs tests in Chrome only
- Supports both headless and headed modes
- Records videos on test failure

## Running Tests

### Build the extension first

Before running any tests, build the extension:

```bash
npm run build
```

This creates the extension in `.output/chrome` needed for test execution.

### Run all tests (headless mode)

```bash
npm test
```

Tests run in headless mode by default, which is faster and suitable for CI/CD.

### Run tests with visible browser

To see the tests being performed (visually verify):

```bash
npm run test:headed
```

This runs tests with the browser visible so you can watch the actions occur.

### Run tests with Playwright UI

For an interactive debugging experience:

```bash
npm run test:ui
```

This opens the Playwright UI where you can:
- Step through tests
- Inspect elements
- Replay tests
- View traces

### Debug tests

For more detailed debugging:

```bash
npm run test:debug
```

This opens the Playwright inspector where you can step through code and inspect state.

## Test Cases

### Test 1: Create a link using context menu
**File:** `extension.spec.ts` - "Test 1: Create and inject a link via context menu"

Tests the workflow:
1. Navigate to example.com
2. Select text on the page
3. Right-click to trigger context menu
4. Verify extension popup loads correctly
5. Creates a link that can be edited

**Expected behavior:** Extension loads, context menu integration works

### Test 2: Import links and view on target website
**File:** `extension.spec.ts` - "Test 2: Import links and view on target website"

Tests the workflow:
1. Open extension popup
2. Navigate to Import tab
3. Paste a base64-encoded link package
4. Verify import succeeds
5. Navigate to target website (example.com)
6. Verify imported link is injected into the page

**Expected behavior:** Links are imported and injected on matching websites

### Test 3: Create, edit, and verify link changes
**File:** `extension.spec.ts` - "Test 3: Create link, edit it, and verify changes"

Tests the workflow:
1. Store a test link in extension storage
2. Open extension popup's Links tab
3. Click the Edit button for the link
4. Modify the link name and href format
5. Save changes
6. Verify changes appear in the popup and storage

**Expected behavior:** Link editing works and changes persist

## Test Helpers

`helpers.ts` contains utility functions:
- `getExtensionBackgroundPage()` - Access the service worker
- `getOrOpenPopup()` - Get or open the extension popup page
- `getExtensionId()` - Extract the extension ID from pages

## Troubleshooting

### Extension not loading
- Ensure `npm run build` was executed
- Check that `.output/chrome` directory exists with extension files
- Verify Chrome and Chromium are properly installed

### Tests timeout
- Increase timeout in `playwright.config.ts` if needed
- Check that network connectivity is available (for example.com)
- Run with `--headed` flag to see what's happening

### Shadow DOM elements not found
- Some extension elements may be in shadow DOM
- Use `evaluate()` to access DOM directly
- Check browser console for errors using `page.on('console', ...)`

### Screenshots and videos
- On test failure, videos are saved to `test-results/` directory
- HTML report generated in `playwright-report/`
- View with: `npx playwright show-report`

## CI/CD Integration

For CI/CD pipelines, use:

```bash
npm test
```

This runs in headless mode and exits with appropriate status codes.

## Architecture

The tests use:
- **Playwright Test** - Test framework and runner
- **Chrome DevTools Protocol** - To load and interact with the extension
- **Chrome Storage API** - To directly manipulate extension storage for testing
- **Content Scripts** - To test injection and DOM interaction

## Notes

- Tests are isolated and don't share state between runs
- Each test gets a fresh extension context
- The extension popup and content pages are tested independently
- Network requests to example.com are real (tests require internet)

## Adding New Tests

To add a new test:

1. Add a new `test()` block in `extension.spec.ts`
2. Use helper functions for common operations
3. Follow the naming convention: `test('should <action> when <condition>')`
4. Use `expect()` for assertions
5. Clean up resources in test completion

Example:

```typescript
test('should do something', async ({ context }) => {
  const popupPage = await getOrOpenPopup(context);
  // Test code here
  expect(someCondition).toBe(true);
});
```
