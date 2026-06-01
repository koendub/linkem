import { getFailingUrlConditions } from "@/core/conditions";
import { requestHostPermissions, storeMissingPermissions } from "@/core/permissions";
import { linksStorage } from "@/core/storage/local_storage";


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
      // Request permissions immediately while still in user gesture context
      if (!await requestHostPermissions([tab.url!])) return;
      // Now execute the content script that starts the create link view
      await browser.scripting.executeScript({
        target: { tabId: tab.id! },
        files: ['/content-scripts/createlink.js'],
      });
    }
  });
}

function siteInjectListener() {
  async function checkForLinksToInjectInTab(tab: Browser.tabs.Tab) {
    const links = Object.values(await linksStorage.getValue());
    const matchingLinks = links.filter(l => getFailingUrlConditions(l, tab.url!).length === 0)
    if (matchingLinks.length > 0) {
      // Check if we already have permissions without requesting them (not a user gesture)
      const urlUrl = new URL(tab.url!);
      const origin = `${urlUrl.protocol}//${urlUrl.host}/*`;
      const hasPermission = await browser.permissions.contains({ origins: [origin] });
      if (hasPermission) {
        await browser.scripting.executeScript({
          target: { tabId: tab.id! },
          files: ['/content-scripts/inject.js'],
        });
      } else {
        // Store missing permissions so we can try to ask for them later
        await storeMissingPermissions([tab.url!]);
      }
    }
  }

  // Does the have the risk of running the script multiple times?
  // It does not seem so, but who knows
  browser.tabs.onUpdated.addListener(async (_, info, tab) => {
    if (info.status !== "complete" || !tab.url) return;
    await checkForLinksToInjectInTab(tab);
  });
}

export default defineBackground(() => {
  registerContextMenu();
  siteInjectListener();
});
