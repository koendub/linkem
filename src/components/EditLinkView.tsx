import { useState, useEffect } from 'react';
import { CustomLink, LinkCondition } from '../models';
import { LinksStorage } from '../utils/storage';
import { LinkLocation } from '@/models/LinkLocation';

interface EditLinkViewProps {
  selectedText: string;
  url: string;
  xpath: string;
  onClose: () => void;
  onSave: () => void;
}

export function EditLinkView({ selectedText, url, xpath, onClose, onSave }: EditLinkViewProps) {
  const [name, setName] = useState('');
  const [position, setPosition] = useState<'on_text' | 'next_to_text'>('on_text');
  const [displayName, setDisplayName] = useState('');
  const [hrefPathFormat, setHrefPathFormat] = useState('');
  const [conditions, setConditions] = useState<LinkCondition[]>([]);
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');

  useEffect(() => {
    setName(`Link to ${selectedText.slice(0, 20)}`);
    setHrefPathFormat('https://example.com/search/{text-value}');
    // Add default conditions
    setConditions([
      { type: 'url_start', value: url.split('?')[0] },
      { type: 'xpath_match', value: xpath }
    ]);
  }, [selectedText, url, xpath]);

  const updateCondition = (index: number, condition: LinkCondition) => {
    const newConditions = [...conditions];
    newConditions[index] = condition;
    setConditions(newConditions);
  };

  const handleSave = async () => {
    const location: LinkLocation = {
      onXPath: xpath,
      onSelectedTextRe: selectedText,
      position,
      displayName: position === 'next_to_text' ? displayName : undefined
    }
    const link: CustomLink = {
      id: Date.now().toString(),
      name,
      creator: 'user',
      visibility,
      createdAt: new Date(),
      location,
      hrefPathFormat,
      conditions,
    };
    await LinksStorage.saveLink(link);
    onSave();
    onClose();
  };

  return (
    <div style={{
      backgroundColor: 'white',
      padding: '20px',
      borderRadius: '8px',
      maxWidth: '500px',
      width: '90%',
      maxHeight: '80vh',
      overflowY: 'auto'
    }}>
      <h2>Create New Link</h2>
      <div>
        <label>Name: <input value={name} onChange={e => setName(e.target.value)} /></label>
      </div>
      <div>
        <label>Position: 
          <select value={position} onChange={e => setPosition(e.target.value as any)}>
            <option value="on_text">On Text</option>
            <option value="next_to_text">Next to Text</option>
          </select>
        </label>
      </div>
      {position === 'next_to_text' && (
        <div>
          <label>Display Name: <input value={displayName} onChange={e => setDisplayName(e.target.value)} /></label>
        </div>
      )}
      <div>
        <label>Href Path Format: <input value={hrefPathFormat} onChange={e => setHrefPathFormat(e.target.value)} /></label>
        <small>Use {`{text-value}`} to insert the selected text.</small>
      </div>
      <div>
        <h3>Conditions</h3>
        {conditions.map((cond, index) => (
          <div key={index}>
            <select value={cond.type} onChange={e => updateCondition(index, { ...cond, type: e.target.value as any })}>
              <option value="url_start">URL Starts With</option>
              <option value="url_contains">URL Contains</option>
              <option value="xpath_match">XPath Match</option>
              <option value="value_match">Value Match</option>
            </select>
            <input value={cond.value} onChange={e => updateCondition(index, { ...cond, value: e.target.value })} />
            <button onClick={() => setConditions(conditions.filter((_, i) => i !== index))}>Remove</button>
          </div>
        ))}
        <button onClick={() => setConditions([...conditions, { type: 'url_start', value: '' }])}>Add Condition</button>
      </div>
      <div>
        <label>Visibility: 
          <select value={visibility} onChange={e => setVisibility(e.target.value as any)}>
            <option value="private">Private</option>
            <option value="public">Public</option>
          </select>
        </label>
      </div>
      <button onClick={handleSave}>Save Link</button>
      <button onClick={onClose}>Cancel</button>
    </div>
  );
};
