import { getXPath } from '@/core/utils/xpath';
import { showCreateLinkModal } from './createLinkModal';
import { importFromBase64 } from '@/core/share';
import { linksStorage } from '@/core/storage/local_storage';
import { checkInjectLinks } from './injectLinks';

let lastXPath = '';

document.addEventListener('contextmenu', (event) => {
  lastXPath = getXPath(event.target as Element, false);
});

export function registerMessageListeners() {
  browser.runtime.onMessage.addListener((message) => {
    // Listen for messages from background to create a new link
    if (message.action === 'linkem-create-new-link') {
      const url = message.url || window.location.href;
      showCreateLinkModal(message.selectedText, url, lastXPath, async (link) => {
        await linksStorage.updateLinks([link]);
        await checkInjectLinks()
      });
    }
  });

  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    const message = event.data;
    // And listen to messages to import a new link as well
    if (message.action === 'linkem-import-link') {
      if (message.base64) {
        importFromBase64(message.base64);
        window.postMessage({ action: 'linkem-import-link-completed' });
      }
    }
    // Pong the pings to test for installation
    if (message.action === 'linkem-ping') {
      window.postMessage({ action: 'linkem-pong' });
    }
  });
}
