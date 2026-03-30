
export default defineBackground(() => {
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
        action: 'showCreateLinkModal',
        selectedText: info.selectionText,
        url: tab.url
      });
    }
  });
});
