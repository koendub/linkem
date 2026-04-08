import React from 'react';
import ReactDOM from 'react-dom/client';
import { EditLinkView } from '@/components/EditLinkView';
import styleText from '../../components/style.css?inline';
import { LinkWithConditions, UnstoredLinkWithConditions } from '@/types';


export function showCreateLinkModal(selectedText: string, url: string, xpath: string, onSave: (link: LinkWithConditions | UnstoredLinkWithConditions) => void) {
  const initialLinkData = createInitialLinkData(selectedText, url, xpath);

  const [docRoot, modalReactRoot] = createShadowRootContainer();
  const root = ReactDOM.createRoot(modalReactRoot);

  const handleClose = () => {
    root.unmount();
    document.body.removeChild(docRoot);
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

function createInitialLinkData(selectedText: string, url: string, xpath: string): UnstoredLinkWithConditions {
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
    visibility: 'private',
    icon: null,

    conditions: [
      { id: '', link_id: '', type: 'url_start', value: url?.split('?')[0] || '', created_at: '' },
      { id: '', link_id: '', type: 'xpath_exists', value: xpath || '', created_at: '' }
    ],

    // Link content
    href_path_format: '...',
    on_xpath: xpath || '',
    on_selected_text_regex: selectedTextRe,
    position: 'user_default',
    display_name: '',
  };
}

function createShadowRootContainer(): [HTMLDivElement, HTMLDivElement] {
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
  return [shadowRootContainer, modalContainer];
}
