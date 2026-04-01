import { getXPath } from '@/utils/xpath';
import { LocalLinksStorage } from '../../utils/storage/local_links_storage';
import { LinkInjector } from './LinkInjector';
import { showCreateLinkModal } from './EditLinkModal';

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

    // Listen for messages from background
    browser.runtime.onMessage.addListener((message) => {
      if (message.action === 'showCreateLinkModal') {
        showCreateLinkModal(message.selectedText, message.url, lastXPath, async (link) => {
          await LocalLinksStorage.saveLink(link);
          await injectLinks()
        });
      }
    });
  },
});

async function injectLinks() {
  try {
    const links = await LocalLinksStorage.getAllLinks();
    await LinkInjector.injectLinks(links);
  } catch (error) {
    console.error('Failed to inject links:', error);
  }
}
