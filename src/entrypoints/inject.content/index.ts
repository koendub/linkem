import { LinksStorage } from '../../general/storage';
import { LinkInjector } from './LinkInjector';

export default defineContentScript({
  matches: ['*://*/*'],
  main() {
    console.log('Link\'em content script loaded.');

    // Inject links when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', injectLinks);
    } else {
      injectLinks();
    }

    // Also inject on dynamic content changes
    const observer = new MutationObserver(injectLinks);
    observer.observe(document.body, { childList: true, subtree: true });

    // Listen for messages from background
    browser.runtime.onMessage.addListener((message) => {
      if (message.action === 'showCreateLinkModal') {
        showCreateLinkModal(message.selectedText, message.url);
      }
    });
  },
});

async function injectLinks() {
  try {
    console.log('Injecting links...')
    const links = await LinksStorage.getAllLinks();
    LinkInjector.injectLinks(links);
  } catch (error) {
    console.error('Failed to inject links:', error);
  }
}

function showCreateLinkModal(selectedText: string, url: string) {
  // Create modal overlay
  const modal = document.createElement('div');
  modal.style.position = 'fixed';
  modal.style.top = '0';
  modal.style.left = '0';
  modal.style.width = '100%';
  modal.style.height = '100%';
  modal.style.backgroundColor = 'rgba(0,0,0,0.5)';
  modal.style.zIndex = '10000';
  modal.style.display = 'flex';
  modal.style.alignItems = 'center';
  modal.style.justifyContent = 'center';

  // Modal content
  const content = document.createElement('div');
  content.style.backgroundColor = 'white';
  content.style.padding = '20px';
  content.style.borderRadius = '8px';
  content.style.maxWidth = '500px';
  content.style.width = '90%';

  content.innerHTML = `
    <h2>Create New Link</h2>
    <form id="create-link-form">
      <div>
        <label>Name: <input type="text" id="name" value="Link to ${selectedText.slice(0,20)}" /></label>
      </div>
      <div>
        <label>Position: 
          <select id="position">
            <option value="on_text">On Text</option>
            <option value="next_to_text">Next to Text</option>
          </select>
        </label>
      </div>
      <div id="display-name-div" style="display:none;">
        <label>Display Name: <input type="text" id="displayName" /></label>
      </div>
      <div>
        <label>Href Path Format: <input type="text" id="href" value="https://example.com/search/{text_value}" /></label>
        <small>Use {text_value} to insert the selected text.</small>
      </div>
      <div>
        <label>Visibility: 
          <select id="visibility">
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
        </label>
      </div>
      <button type="submit">Save Link</button>
      <button type="button" id="cancel">Cancel</button>
    </form>
  `;

  modal.appendChild(content);
  document.body.appendChild(modal);

  // Handle position change
  const positionSelect = content.querySelector('#position') as HTMLSelectElement;
  const displayNameDiv = content.querySelector('#display-name-div') as HTMLDivElement;
  positionSelect.addEventListener('change', () => {
    displayNameDiv.style.display = positionSelect.value === 'next_to_text' ? 'block' : 'none';
  });

  // Handle form submit
  const form = content.querySelector('#create-link-form') as HTMLFormElement;
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = (content.querySelector('#name') as HTMLInputElement).value;
    const position = (content.querySelector('#position') as HTMLSelectElement).value as 'on_text' | 'next_to_text';
    const displayName = (content.querySelector('#displayName') as HTMLInputElement).value;
    const href = (content.querySelector('#href') as HTMLInputElement).value;
    const visibility = (content.querySelector('#visibility') as HTMLSelectElement).value as 'private' | 'public';

    const link = {
      id: Date.now().toString(),
      name,
      creator: 'user',
      position,
      displayName: position === 'next_to_text' ? displayName : undefined,
      hrefPathFormat: href,
      conditions: [{ type: 'url_start' as const, value: url.split('?')[0] }],
      visibility,
      createdAt: new Date()
    };

    await LinksStorage.saveLink(link);
    document.body.removeChild(modal);
    // Re-inject links
    injectLinks();
  });

  // Handle cancel
  const cancelBtn = content.querySelector('#cancel') as HTMLButtonElement;
  cancelBtn.addEventListener('click', () => {
    document.body.removeChild(modal);
  });
}
