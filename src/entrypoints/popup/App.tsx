import React, { useState, useEffect } from 'react';
import { CustomLink } from '../../general/models';
import { LinksStorage } from '../../general/storage';
import './App.css';

const App: React.FC = () => {
  const [links, setLinks] = useState<CustomLink[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editHref, setEditHref] = useState('');

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    const allLinks = await LinksStorage.getAllLinks();
    setLinks(allLinks);
  };

  const handleDelete = async (id: string) => {
    await LinksStorage.deleteLink(id);
    loadLinks();
  };

  const handleEdit = (link: CustomLink) => {
    setEditingId(link.id);
    setEditName(link.name);
    setEditHref(link.hrefPathFormat);
  };

  const handleSaveEdit = async () => {
    if (editingId) {
      await LinksStorage.updateLink(editingId, { name: editName, hrefPathFormat: editHref });
      setEditingId(null);
      loadLinks();
    }
  };

  const handleCancelEdit = () => {
    setEditingId(null);
  };

  return (
    <div style={{ padding: '10px', width: '300px' }}>
      <h2>Your Links</h2>
      {links.length === 0 ? (
        <p>No links yet. Create one via context menu on selected text.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {links.map(link => (
            <li key={link.id} style={{ marginBottom: '10px', border: '1px solid #ccc', padding: '5px' }}>
              {editingId === link.id ? (
                <div>
                  <input value={editName} onChange={e => setEditName(e.target.value)} />
                  <input value={editHref} onChange={e => setEditHref(e.target.value)} />
                  <button onClick={handleSaveEdit}>Save</button>
                  <button onClick={handleCancelEdit}>Cancel</button>
                </div>
              ) : (
                <div>
                  <strong>{link.name}</strong><br />
                  {link.hrefPathFormat}<br />
                  <button onClick={() => handleEdit(link)}>Edit</button>
                  <button onClick={() => handleDelete(link.id)}>Delete</button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default App;
