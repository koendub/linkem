import React from 'react';
import ReactDOM from 'react-dom/client';
import { EditLinkView } from '@/components/EditLinkView';


export function showCreateLinkModal(selectedText: string, url: string, xpath: string, onSave: () => void) {
  // Create modal container
  const modalContainer = document.createElement('div');
  modalContainer.id = 'linkem-modal-container';
  document.body.appendChild(modalContainer);

  const root = ReactDOM.createRoot(modalContainer);

  const handleClose = () => {
    root.unmount();
    document.body.removeChild(modalContainer);
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
          selectedText={selectedText}
          url={url}
          xpath={xpath}
          onClose={handleClose}
          onSave={onSave}
        />
      </div>
    </React.StrictMode>
  );
}
