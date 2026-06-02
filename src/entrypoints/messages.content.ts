import { getLinkHostUrl, requestHostPermissions } from '@/core/permissions';
import { importFromBase64 } from '@/core/share';


function registerMessageListeners() {
  window.addEventListener('message', (event) => {
    if (event.source !== window) return;
    const message = event.data;
    // And listen to messages to import a new link as well
    if (message.action === 'linkem-import-link') {
      if (!message.base64) {
        console.error('Received import link message without base64 data');
        return;
      }
      createImportLinkButton(message.base64, () => {
        window.postMessage({ action: 'linkem-import-link-completed' });
      });
    }
    // Pong the pings to test for installation
    if (message.action === 'linkem-ping') {
      window.postMessage({ action: 'linkem-pong' });
    }
    if (message.action === 'linkem-version') {
      // @ts-ignore
      const linkemVersion = __APP_VERSION__;
      window.postMessage({ action: 'linkem-version-completed', data: linkemVersion }); 
    }
  });
}

function createImportLinkButton(base64LinkData: string, onComplete: () => void) {
  // Add a button to the page that we can use to import a link.
  // Sadly it has to be a button instead of automatic because we need to ask permissions on a user gesture
  const anchor = document.body.querySelector('#action-display-anchor'); 
  if (!anchor) {
    console.error('Could not find anchor to display import link button');
    return;
  }

  const handleClick = async () => {
    await importFromBase64(base64LinkData, async (links) => {
      const newUrls = links.map(getLinkHostUrl);
      browser.runtime.sendMessage({ action: 'linkem-ask-permissions', data: newUrls });
    });
    onComplete();
  }

  const button = document.createElement('button');
  button.textContent = 'Import Link';
  button.addEventListener('click', handleClick);
  button.classList.add('action-button-site-style');

  anchor.appendChild(button);
}

export default defineContentScript({
  matches: ['https://buffer-flow.github.io/*'],
  main: registerMessageListeners
});
