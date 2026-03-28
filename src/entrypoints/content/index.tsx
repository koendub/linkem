import { LinksStorage } from '../../general/storage';
import { LinkInjector } from './LinkInjector';
import { showCreateLinkModal } from './modal';


export default defineContentScript({
  matches: ['*://*/*'],
  main() {
    console.log('Link\'em content script loaded.');

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
        showCreateLinkModal(message.selectedText, message.url, () => injectLinks());
      }
    });
  },
});

async function injectLinks() {
  try {
    console.log('Injecting links...')
    const links = await LinksStorage.getAllLinks();
    LinkInjector.injectLinks(links);
  } catch (error) {
    console.error('Failed to inject links:', error);
  }
}


