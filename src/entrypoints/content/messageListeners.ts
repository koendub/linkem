import { showCreateLinkModal } from './createLinkModal';
import { importFromBase64 } from '@/core/share';


export function registerMessageListeners() {
  browser.runtime.onMessage.addListener((message) => {
    // Listen for messages from background to create a new link
    if (message.action === 'linkem-create-new-link') {
      showCreateLinkModal(message.selectedText, message.url);
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
