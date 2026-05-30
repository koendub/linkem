import { getFailingUrlConditions } from "@/core/conditions";
import { linksStorage } from "@/core/storage/local_storage";

async function requestHostPermissions(url: string): Promise<boolean> {
  const urlUrl = new URL(url);
  const origin = `${urlUrl.protocol}//${urlUrl.host}/*`;
  console.log(`Requesting permissions for origin: ${origin}`);
  const needPerm = { origins: [origin] }
  if (await browser.permissions.contains(needPerm)) return true;
  const permission = await browser.permissions.request(needPerm);
  console.log(`Permission for origin ${origin} ` + (permission ? 'granted!' : 'rejected!'));
  return permission;
}

async function ensureRunningContentScript(onTab: Browser.tabs.Tab): Promise<boolean> {
  const permissions = await requestHostPermissions(onTab.url!);
  if (!permissions) return false;
  await browser.scripting.executeScript({
    target: { tabId: onTab.id! },
    files: ['/content-scripts/content.js'],
  });
  return true;
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
      if (!await ensureRunningContentScript(tab)) return;
      // Send message to content script to show create link modal
      browser.tabs.sendMessage(tab.id, {
        action: 'linkem-create-new-link',
        selectedText: info.selectionText,
        url: tab.url
      });
    }
  });
}

function siteInjectListener() {
  async function checkForLinksToInjectInTab(tab: Browser.tabs.Tab) {
    const links = Object.values(await linksStorage.getValue()); // Get value uses old value in memory?
    const matchingLinks = links.filter(l => getFailingUrlConditions(l, tab.url!).length === 0)
    console.log(`For tab ${tab.url} found ${matchingLinks.length} matching links`);
    if (matchingLinks.length > 0) await ensureRunningContentScript(tab);
  }

  browser.tabs.onUpdated.addListener(async (tabId, info, tab) => {
    if (info.status !== "complete" || !tab.url) return;
    await checkForLinksToInjectInTab(tab);
  });
}

export default defineBackground(() => {
  registerContextMenu();
  siteInjectListener();
});
