import { importFromBase64 } from '@/core/share';


function registerMessageListeners() {
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
    if (message.action === 'linkem-version') {
      // @ts-ignore
      const linkemVersion = __APP_VERSION__;
      window.postMessage({ action: 'linkem-version-completed', data: linkemVersion }); 
    }
  });
}

export default defineContentScript({
  matches: ['https://buffer-flow.github.io/*'],
  main: registerMessageListeners
});
