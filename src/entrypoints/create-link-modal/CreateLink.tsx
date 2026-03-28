import React, { useState, useEffect } from 'react';
import { CustomLink, Condition } from '../../general/models';
import { LinksStorage } from '../../general/storage';

const CreateLink: React.FC = () => {
  const [name, setName] = useState('');
  const [position, setPosition] = useState<'on_text' | 'next_to_text'>('on_text');
  const [displayName, setDisplayName] = useState('');
  const [hrefPathFormat, setHrefPathFormat] = useState('');
  const [conditions, setConditions] = useState<Condition[]>([]);
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');
  const [selectedText, setSelectedText] = useState('');
  const [currentUrl, setCurrentUrl] = useState('');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setSelectedText(params.get('text') || '');
    setCurrentUrl(params.get('url') || '');
    // Pre-fill some
    setName(`Link to ${params.get('text')?.slice(0, 20) || 'selected text'}`);
    setHrefPathFormat('https://example.com/search/{text_value}');
    // Add default condition
    if (params.get('url')) {
      setConditions([{ type: 'url_start', value: params.get('url')!.split('?')[0] }]);
    }
  }, []);

  const addCondition = () => {
    setConditions([...conditions, { type: 'url_start', value: '' }]);
  };

  const updateCondition = (index: number, condition: Condition) => {
    const newConditions = [...conditions];
    newConditions[index] = condition;
    setConditions(newConditions);
  };

  const removeCondition = (index: number) => {
    setConditions(conditions.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    const link: CustomLink = {
      id: Date.now().toString(),
      name,
      creator: 'user',
      position,
      displayName: position === 'next_to_text' ? displayName : undefined,
      hrefPathFormat,
      conditions,
      visibility,
      createdAt: new Date()
    };
    await LinksStorage.saveLink(link);
    window.close(); // Close the tab
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px' }}>
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
        <small>Use {`{text_value}`} to insert the selected text.</small>
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
            <button onClick={() => removeCondition(index)}>Remove</button>
          </div>
        ))}
        <button onClick={addCondition}>Add Condition</button>
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
    </div>
  );
};

export default CreateLink;