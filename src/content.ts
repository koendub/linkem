// content.ts - Content script for Linkem extension

let lastXpath = '';

document.addEventListener('contextmenu', (e) => {
  let target: Node | null = e.target as Node;
  if (target && target.nodeType !== Node.ELEMENT_NODE) {
    target = target.parentElement;
  }
  lastXpath = getXPath(target as Element);
});

function getXPath(element: Element): string {
  if (element.id) return `//*[@id="${element.id}"]`;
  let path: string[] = [];
  while (element.nodeType === Node.ELEMENT_NODE) {
    let selector = element.nodeName.toLowerCase();
    if (element.id) {
      selector += `[@id="${element.id}"]`;
      path.unshift(selector);
    } else {
      let sibling = element.previousSibling;
      let nth = 1;
      while (sibling) {
        if (sibling.nodeType === Node.ELEMENT_NODE && (sibling as Element).nodeName.toLowerCase() === selector) nth++;
        sibling = sibling.previousSibling;
      }
      if (nth !== 1) selector += `[${nth}]`;
    }
    path.unshift(selector);
    element = element.parentNode as Element;
  }
  return path.length ? '/' + path.join('/') : '';
}

chrome.runtime.onMessage.addListener((message, _sender, _sendResponse) => {
  if (message.action === 'showForm') {
    showForm();
  }
});

function showForm() {
  const modal = document.createElement('div');
  modal.innerHTML = `
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; align-items: center; justify-content: center;">
      <div style="background: white; padding: 20px; border-radius: 5px; box-shadow: 0 0 10px rgba(0,0,0,0.3);">
        <h3>Create New Link</h3>
        <input type="text" id="linkName" placeholder="Name" style="display: block; margin: 10px 0; padding: 5px; width: 200px;" /><br/>
        <input type="text" id="linkUrl" placeholder="URL" style="display: block; margin: 10px 0; padding: 5px; width: 200px;" /><br/>
        <button id="save" style="margin-right: 10px; padding: 5px 10px;">Save</button>
        <button id="cancel" style="padding: 5px 10px;">Cancel</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  (document.getElementById('save') as HTMLButtonElement).onclick = () => {
    const name = (document.getElementById('linkName') as HTMLInputElement).value;
    const url = (document.getElementById('linkUrl') as HTMLInputElement).value;
    if (name && url && lastXpath) {
      saveLink(name, url, lastXpath);
      insertLink(name, url, lastXpath);
    }
    document.body.removeChild(modal);
  };

  (document.getElementById('cancel') as HTMLButtonElement).onclick = () => {
    document.body.removeChild(modal);
  };
}

function saveLink(name: string, url: string, xpath: string) {
  const siteUrl = window.location.href;
  chrome.storage.local.get([siteUrl], (result) => {
    const links = (result[siteUrl] as { xpath: string; name: string; url: string }[]) || [];
    links.push({ xpath, name, url });
    chrome.storage.local.set({ [siteUrl]: links });
  });
}

function insertLink(name: string, url: string, xpath: string) {
  console.log('Inserting link:', name, url, xpath);
  const element = document.evaluate(xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
  console.log('Element found:', element);
  if (element) {
    const a = document.createElement('a');
    a.href = url;
    a.textContent = name;
    a.style.marginLeft = '10px';
    a.style.color = 'blue';
    a.style.textDecoration = 'underline';
    (element as Element).appendChild(a);
    console.log('Link inserted');
  } else {
    console.error('Element not found for XPath:', xpath);
  }
}

// On load, insert existing links
window.addEventListener('load', () => {
  const siteUrl = window.location.href;
  chrome.storage.local.get([siteUrl], (result) => {
    const links = (result[siteUrl] as { xpath: string; name: string; url: string }[]) || [];
    links.forEach((link) => {
      insertLink(link.name, link.url, link.xpath);
    });
  });
});