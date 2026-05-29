import { showCreateLinkModal } from "../content/createLinkModal";

async function requestHostPermissions(url: string): Promise<boolean> {
  const urlUrl = new URL(url);
  const origin = `${urlUrl.protocol}//${urlUrl.host}/*`;
  return await browser.permissions.request({
    origins: [origin]
  });
}

function registerContextMenu() {
  // Create context menu
  browser.contextMenus.create({
    id: 'create-link',
    title: 'Link\'em: Create New Link',
    contexts: ['selection']
  });

  // Handle context menu click
  browser.contextMenus.onClicked.addListener(async (info, tab) => {
    if (info.menuItemId === 'create-link' && info.selectionText && tab?.id) {
      // Send message to content script to show create link modal
      browser.tabs.sendMessage(tab.id, {
        action: 'linkem-create-new-link',
        selectedText: info.selectionText,
        url: tab.url
      });
      // browser.scripting.executeScript({
      //   target: { tabId: tab.id },
      //   func: showCreateLinkModal,
      //   args: [info.selectionText, tab.url]
      // });
    }
  });
}

// function siteInjectListener() {
//   browser.tabs.onUpdated.addListener(async (tabId, info, tab) => {
//     if (info.status !== "complete" || !tab.url) {
//       return;
//     }

//     const markedSites = await loadMarkedSites();

//     const url = new URL(tab.url);
//     if (markedSites.includes(url.origin)) {
//       browser.scripting.executeScript({
//         target: { tabId },
//         func: registerInjectLinks,
//       });
//     }
//   });
// }

export default defineBackground(() => {
  registerContextMenu();
  // siteInjectListener();
});
