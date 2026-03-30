import React from 'react';
import ReactDOM from 'react-dom/client';
import { EditLinkView } from '@/components/EditLinkView';
import styleText from '../../components/style.css?inline';
import { UnstoredLink } from '@/models';


export function showCreateLinkModal(selectedText: string, url: string, xpath: string, onSave: () => void) {
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

  const root = ReactDOM.createRoot(modalContainer);

  const handleClose = () => {
    root.unmount();
    document.body.removeChild(modalContainer);
  };

  const initialLinkData: UnstoredLink = {
    // Basic info
    name: `Link to ${selectedText?.slice(0, 20) || ''}`,
    creator: 'user',
    visibility: 'private',
    createdAt: new Date(),

    // Link content
    location: {
      onXPath: xpath || '',
      onSelectedTextRe: selectedText || '',
      position: 'user_default',
      displayName: '',
    },
    hrefPathFormat: '...',
    conditions: [
      { type: 'url_start', value: url?.split('?')[0] || '' },
      { type: 'xpath_exists', value: xpath || '' }
    ],
  };

  root.render(
    <React.StrictMode>
      <div style={{
        position: 'fixed',
        top: '0',
        left: '0',
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(0,0,0,0.5)',
        zIndex: '10000',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <EditLinkView
          link={initialLinkData}
          onClose={handleClose}
          onSave={onSave}
        />
      </div>
    </React.StrictMode>
  );
}
