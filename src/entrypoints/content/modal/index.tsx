import React from 'react';
import ReactDOM from 'react-dom/client';
import { CreateLinkModal } from './CreateLinkModal';


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
      <CreateLinkModal
        selectedText={selectedText}
        url={url}
        xpath={xpath}
        onClose={handleClose}
        onSave={onSave}
      />
    </React.StrictMode>
  );
}
