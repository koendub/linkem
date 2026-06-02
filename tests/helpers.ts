import { Page, BrowserContext } from '@playwright/test';

export interface ExtensionTestHelpers {
  getServiceWorkerPage: () => Promise<Page>;
  getPopupPage: () => Promise<Page>;
  openPopupInNewPage: (targetPage: Page) => Promise<Page>;
  exportLinks: (popupPage: Page) => Promise<string>;
  importLinks: (popupPage: Page, importData: string) => Promise<void>;
  allowPermissions: (context: BrowserContext, permissions: string[]) => Promise<void>;
  waitForContentScript: (page: Page) => Promise<void>;
}

/**
 * Create test helpers for extension testing
 */
export async function createExtensionHelpers(context: BrowserContext): Promise<ExtensionTestHelpers> {
  let serviceWorkerPage: Page | null = null;
  let popupPage: Page | null = null;

  return {
    /**
     * Get or create the service worker page (background service worker)
     */
    async getServiceWorkerPage() {
      if (!serviceWorkerPage) {
        // Get all pages and find the service worker
        const pages = context.pages();
        for (const page of pages) {
          const url = page.url();
          if (url.includes('chrome-extension://') && url.endsWith('/background/')) {
            serviceWorkerPage = page;
            break;
          }
        }

        if (!serviceWorkerPage) {
          throw new Error('Service worker page not found');
        }
      }
      return serviceWorkerPage;
    },

    /**
     * Get the extension popup page
     */
    async getPopupPage() {
      if (!popupPage || popupPage.isClosed()) {
        popupPage = await this.openPopupInNewPage(null as any);
      }
      return popupPage;
    },

    /**
     * Open the extension popup in a new page (for manual testing or fresh popup)
     */
    async openPopupInNewPage(targetPage: Page) {
      return new Promise<Page>((resolve) => {
        // Listen for new pages (the popup will open as a new page)
        const handler = (page: Page) => {
          if (page.url().includes('popup') && page.url().includes('chrome-extension://')) {
            context.removeListener('page', handler);
            resolve(page);
          }
        };

        context.on('page', handler);

        // Trigger popup opening
        if (targetPage) {
          targetPage.evaluate(() => {
            // This would trigger opening popup - for now we manually navigate
            window.open(
              chrome.runtime.getURL('src/entrypoints/popup/index.html'),
              'popup',
              'width=400,height=600'
            );
          }).catch(() => {
            // Fallback: manually create the popup page
            const popupUrl = `chrome-extension://${chrome.runtime.id}/src/entrypoints/popup/index.html`;
            context.newPage().then(resolve).catch((e) => {
              console.error('Failed to create popup page:', e);
            });
          });
        } else {
          // Create popup page directly
          context.newPage().then((page) => {
            const extensionId = context.pages()[0].url().split('/')[2];
            page.goto(`chrome-extension://${extensionId}/src/entrypoints/popup/index.html`)
              .then(() => resolve(page))
              .catch((e) => {
                console.error('Failed to navigate to popup:', e);
              });
          });
        }

        // Timeout after 10 seconds
        setTimeout(() => {
          context.removeListener('page', handler);
          // As a fallback, create the page manually
          context.newPage().then((page) => {
            const extensionId = context.pages()[0].url().split('/')[2];
            page.goto(`chrome-extension://${extensionId}/src/entrypoints/popup/index.html`)
              .then(() => resolve(page))
              .catch((e) => console.error(e));
          });
        }, 10000);
      });
    },

    /**
     * Export links from the extension
     */
    async exportLinks(popupPage: Page): Promise<string> {
      // Click on the export tab
      await popupPage.click('button[data-state="tab"]', {
        hasText: /upload|export/i,
      }).catch(() => {
        // Alternative: find export tab button
        return popupPage.evaluate(() => {
          const tabs = document.querySelectorAll('button[data-tabs-trigger]');
          for (const tab of tabs) {
            if (tab.innerHTML.includes('Upload') || tab.innerHTML.includes('upload')) {
              (tab as HTMLButtonElement).click();
              return true;
            }
          }
          return false;
        });
      });

      // Wait for export button and click it
      const exportButton = popupPage.locator('button:has-text("Export")').first();
      await exportButton.waitFor({ state: 'visible', timeout: 5000 });
      await exportButton.click();

      // Get the exported text from the textarea
      const exportText = await popupPage.locator('.export-output, textarea').first().inputValue();
      return exportText;
    },

    /**
     * Import links to the extension
     */
    async importLinks(popupPage: Page, importData: string): Promise<void> {
      // Click on the import tab
      await popupPage.evaluate(() => {
        const tabs = document.querySelectorAll('button[data-tabs-trigger]');
        for (const tab of tabs) {
          if (tab.innerHTML.includes('Download') || tab.innerHTML.includes('download')) {
            (tab as HTMLButtonElement).click();
            return true;
          }
        }
      });

      await popupPage.waitForTimeout(500);

      // Click import button to show form
      const importButton = popupPage.locator('button:has-text("Import from Text or Id")').first();
      await importButton.waitFor({ state: 'visible', timeout: 5000 });
      await importButton.click();

      // Fill in the import text
      const textarea = popupPage.locator('textarea').first();
      await textarea.fill(importData);

      // Click the import button
      const confirmButton = popupPage.locator('button:has-text("Import")').first();
      await confirmButton.click();

      // Wait for success message
      await popupPage.locator('text=Successfully imported').waitFor({ state: 'visible', timeout: 10000 });
    },

    /**
     * Allow permissions requested by the extension
     */
    async allowPermissions(context: BrowserContext, _permissions: string[]): Promise<void> {
      // This is typically handled by the extension's permission request UI
      // In Playwright, we can't directly grant permissions, so we handle the UI
      const pages = context.pages();
      for (const page of pages) {
        const permissionButtons = await page.locator('button:has-text("Allow")').count();
        if (permissionButtons > 0) {
          await page.click('button:has-text("Allow")');
          await page.waitForTimeout(500);
        }
      }
    },

    /**
     * Wait for content script to be injected
     */
    async waitForContentScript(page: Page): Promise<void> {
      await page.waitForFunction(() => {
        return (window as any).chrome !== undefined;
      }, { timeout: 5000 });
    },
  };
}

/**
 * Get the extension ID from a page in the extension context
 */
export function getExtensionId(page: Page): string {
  const url = page.url();
  const match = url.match(/chrome-extension:\/\/([a-z]+)/);
  return match ? match[1] : '';
}

/**
 * Create a basic link object for testing
 */
export function createTestLink(overrides?: Partial<any>) {
  return {
    name: 'Test Link',
    href_format: 'https://www.google.com/search?q={text-value}',
    display_name: '{href-host.prettify()}',
    position: 'next_to_text',
    on_xpath: '//a[contains(@class, "test")]',
    on_selected_text_regex: '.+',
    conditions: [
      {
        type: 'url_start',
        value: 'https://example.com',
      },
    ],
    visibility: 'private',
    ...overrides,
  };
}
