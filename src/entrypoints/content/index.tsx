import { getElementByXPath, getXPath } from '@/core/utils/xpath';
import { showCreateLinkModal } from './EditLinkModal';
import { applyLinkToElement } from '@/core/inject';
import { importFromBase64 } from '@/core/share';
import { linksStorage } from '@/core/storage/local_storage';
import { getFailingPostMatchConditions, getFailingPreMatchConditions } from '@/core/conditions';
import { injectCaller } from '@/core/utils/inject_caller';

let lastXPath = '';

document.addEventListener('contextmenu', (event) => {
  lastXPath = getXPath(event.target as Element);
});

async function injectLinks() {
  let anyInjected = false;
  try {
    const allLinks = Object.values(await linksStorage.getValue());
    for (const link of allLinks) {
      if (getFailingPreMatchConditions(link).length === 0) {
        const inElement = getElementByXPath(link.on_xpath);
        if (inElement && getFailingPostMatchConditions(link, inElement).length === 0) {
          const thisInjected = await applyLinkToElement(link, inElement);
          anyInjected = anyInjected || thisInjected;
        }
      }
    }
  } catch (error) {
    console.error('Failed to inject links:', error);
  }
  return anyInjected;
}

export default defineContentScript({
  matches: ['*://*/*'],
  main() {
    injectCaller(injectLinks);

    browser.runtime.onMessage.addListener((message) => {
      // Listen for messages from background to create a new link
      if (message.action === 'linkem-create-new-link') {
        showCreateLinkModal(message.selectedText, message.url, lastXPath, async (link) => {
          await linksStorage.updateLinks([link]);
          await injectLinks()
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
  },
});
