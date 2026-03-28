chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'createLink',
    title: 'Linkem: Create New Link',
    contexts: ['all']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'createLink') {
    chrome.tabs.sendMessage(tab!.id!, { action: 'showForm' });
  }
});