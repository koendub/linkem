import { getXPath } from '@/core/xpath';
import { LocalLinksStorage } from '@/core/storage/local_links_storage';
import { showCreateLinkModal } from './EditLinkModal';
import { injectLinks } from '@/core/inject';
import { importFromBase64 } from '@/core/share';

let lastXPath = '';

document.addEventListener('contextmenu', (event) => {
  lastXPath = getXPath(event.target as Element);
});

export default defineContentScript({
  matches: ['*://*/*'],
  main() {
    // Inject links when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectLinks);
    } else {
      injectLinks();
    }

    // Also inject on dynamic content changes
    const observer = new MutationObserver(injectLinks);
    observer.observe(document.body, { childList: true, subtree: true });

    browser.runtime.onMessage.addListener((message) => {
      // Listen for messages from background to create a new link
      if (message.action === 'linkemCreateNewLink') {
        showCreateLinkModal(message.selectedText, message.url, lastXPath, async (link) => {
          console.log('Saving new link from content script:', link);
          await LocalLinksStorage.saveLinks([link]);
          await injectLinks()
        });
      }
      // And listen to messages to import a new link as well
      if (message.action === 'linkemImportLink') {
        if (message.base64) importFromBase64(message.base64);
      }
    });
  },
});
