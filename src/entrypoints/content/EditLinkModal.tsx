import React from 'react';
import ReactDOM from 'react-dom/client';
import { EditLinkView } from '@/components/EditLinkView';
import styleText from '../../components/style.css?inline';
import { CustomLink, UnstoredLink } from '@/models';


export function showCreateLinkModal(selectedText: string, url: string, xpath: string, onSave: (link: CustomLink | UnstoredLink) => void) {
  const initialLinkData = createInitialLinkData(selectedText, url, xpath);

  const modalContainer = createShadowRootContainer();
  const root = ReactDOM.createRoot(modalContainer);

  const handleClose = () => {
    root.unmount();
    document.body.removeChild(modalContainer);
  };

  root.render(
    <React.StrictMode>
      <div className='fixed top-0 left-0 w-full h-full bg-black/50 z-10000 flex items-center justify-center'>
        <div className='w-2/3 h-2/3 rounded-lg overflow-hidden shadow-lg'>
          <EditLinkView
            link={initialLinkData}
            onClose={handleClose}
            onSave={onSave}
          />
        </div>
      </div>
    </React.StrictMode>
  );
}

function createInitialLinkData(selectedText: string, url: string, xpath: string): UnstoredLink {
  // Try to guess the most applicable regex for the selected text
  let selectedTextRe = selectedText; 

  // If the selected text is all the text within this element, just replace everything with .+
  // Because the user probably just meant this element in the page, and doesn't care about the exact text
  if (selectedText.trim().length > 0) {
    const element = getElementByXPath(xpath);
    if (element && element.textContent?.trim() === selectedText.trim()) {
      selectedTextRe = '.+';
    }
  }

  // Replace all sequences of digits with \d+
  selectedTextRe = selectedTextRe.replace(/\d+/g, '\\d+');

  return {
    // Basic info
    name: `Link to ${selectedText?.slice(0, 20) || ''}`,
    creator: 'user',
    visibility: 'private',
    createdAt: new Date(),

    // Link content
    location: {
      onXPath: xpath || '',
      onSelectedTextRegex: selectedTextRe,
      position: 'user_default',
      displayName: '',
    },
    hrefPathFormat: '...',
    conditions: [
      { type: 'url_start', value: url?.split('?')[0] || '' },
      { type: 'xpath_exists', value: xpath || '' }
    ],
  };
}

function createShadowRootContainer(): HTMLDivElement {
  // Create shadow root to isolate styles, also import the tailwind styles
  const shadowRootContainer = document.createElement('div');
  document.body.appendChild(shadowRootContainer);
  const shadowRoot = shadowRootContainer.attachShadow({ mode: 'open' });

  const style = document.createElement("style");
  style.textContent = styleText;
  shadowRoot.appendChild(style);

  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.id = 'linkem-modal-container';
  shadowRoot.appendChild(modalContainer);
  return modalContainer;
}
