import { useState, useEffect } from 'react';
import { CustomLink, LinkCondition } from '../models';
import { LinksStorage } from '../utils/storage';
import { LinkLocation } from '@/models/LinkLocation';
import { Link, Plus, Trash2, X, Save, ChevronDown } from 'lucide-react';
import { Accordion } from '@base-ui/react';
import './style.css';

interface EditLinkViewProps {
  link?: CustomLink;
  selectedText?: string;
  url?: string;
  xpath?: string;
  onClose: () => void;
  onSave: () => void;
}

export function EditLinkView({ link, selectedText, url, xpath, onClose, onSave }: EditLinkViewProps) {
  const [name, setName] = useState('');
  const [position, setPosition] = useState<'on_text' | 'next_to_text' | 'user_default'>('user_default');
  const [displayName, setDisplayName] = useState('');
  const [hrefPathFormat, setHrefPathFormat] = useState('');
  const [conditions, setConditions] = useState<LinkCondition[]>([]);
  const [visibility, setVisibility] = useState<'private' | 'public'>('private');

  const isEditing = !!link;

  useEffect(() => {
    if (isEditing && link) {
      setName(link.name);
      setPosition(link.location.position);
      setDisplayName(link.location.displayName || '');
      setHrefPathFormat(link.hrefPathFormat);
      setConditions(link.conditions);
      setVisibility(link.visibility);
    } else {
      setName(`Link to ${selectedText?.slice(0, 20) || ''}`);
      setHrefPathFormat('https://example.com/search/{text-value}');
      setConditions([
        { type: 'url_start', value: url?.split('?')[0] || '' },
        { type: 'xpath_exists', value: xpath || '' }
      ]);
    }
  }, [link, selectedText, url, xpath, isEditing]);

  const updateCondition = (index: number, condition: LinkCondition) => {
    const newConditions = [...conditions];
    newConditions[index] = condition;
    setConditions(newConditions);
  };

  const handleSave = async () => {
    if (isEditing && link) {
      const updatedLink = { ...link, name, hrefPathFormat, conditions, visibility, location: { ...link.location, position, displayName: position === 'next_to_text' ? displayName : undefined } };
      await LinksStorage.saveLink(updatedLink);
    } else {
      const location: LinkLocation = {
        onXPath: xpath || '',
        onSelectedTextRe: selectedText || '',
        position,
        displayName: position === 'next_to_text' ? displayName : undefined
      }
      const newLink: CustomLink = {
        id: Date.now().toString(),
        name,
        creator: 'user',
        visibility,
        createdAt: new Date(),
        location,
        hrefPathFormat,
        conditions,
      };
      await LinksStorage.saveLink(newLink);
    }
    onSave();
    onClose();
  };

  return (
    <div className="bg-white text-gray-900 p-4 w-full h-full overflow-y-auto border-l border-gray-200 flex flex-col no-scrollbar">
      <div className="flex-1 overflow-y-auto pr-2">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Link className="w-6 h-6 mr-3 text-blue-500" />
          {isEditing ? 'Edit Link' : 'Create New Link'}
        </h2>
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label>Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter link name"
                className='w-full'
              />
            </div>
            <div>
              <label>Href Path Format</label>
              <input
                value={hrefPathFormat}
                onChange={(e) => setHrefPathFormat(e.target.value)}
                placeholder="https://example.com/search/{text-value}"
                className='w-full'
              />
              <small className="text-gray-500 text-xs mt-2 block">
                Use <span className="bg-blue-100 px-2 py-1 rounded font-mono text-blue-700">{`{text-value}`}</span> to insert the selected text.
              </small>
            </div>
          </div>
          <Accordion.Root multiple className="space-y-3">

            {/* Link Location Accordion */}
            <Accordion.Item value="location" className="border border-gray-300 rounded-lg bg-white">
              <Accordion.Header>
                <Accordion.Trigger className="w-full px-4 py-3 text-left font-semibold text-gray-900 hover:bg-gray-50 rounded-lg flex items-center justify-between transition-colors">
                  Link Location
                  <ChevronDown className="w-5 h-5 transition-transform duration-200" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Panel className="smooth-accordion-panel">
                <div className="px-4 py-3 space-y-3">
                  <div>
                    <label>Position</label>
                    <select
                      value={position}
                      onChange={(e) => setPosition(e.target.value as any)}
                    >
                      <option value="user_default">User Default</option>
                      <option value="on_text">On Text</option>
                      <option value="next_to_text">Next to Text</option>
                    </select>
                  </div>
                  {position === 'next_to_text' && (
                    <div>
                      <label>Display Name</label>
                        <input
                          value={displayName}
                          onChange={(e) => setDisplayName(e.target.value)}
                          placeholder="Enter display name"
                        />
                    </div>
                  )}
                </div>
              </Accordion.Panel>
            </Accordion.Item>

            {/* Conditions Accordion */}
            <Accordion.Item value="conditions" className="border border-gray-300 rounded-lg bg-white">
              <Accordion.Header>
                <Accordion.Trigger className="w-full px-4 py-3 text-left font-semibold text-gray-900 hover:bg-gray-50 rounded-lg flex items-center justify-between transition-colors">
                  Conditions
                  <ChevronDown className="w-5 h-5 transition-transform duration-200" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Panel className="smooth-accordion-panel">
                <div className="px-4 py-3">
                  <div className="space-y-2">
                    {conditions.map((cond, index) => (
                      <div key={index} className="flex flex-wrap gap-2 items-center p-2 bg-gray-50 border border-gray-200 rounded-lg">
                        <button
                          onClick={() => setConditions(conditions.filter((_, i) => i !== index))}
                          className="p-2 bg-red-500 hover:bg-red-600 rounded-lg text-white transition-colors flex items-center justify-center w-auto!"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <select
                          value={cond.type}
                          onChange={(e) => updateCondition(index, { ...cond, type: e.target.value as any })}
                          className="w-auto!"
                        >
                          <option value="url_start">URL Starts With</option>
                          <option value="url_contains">URL Contains</option>
                          <option value="xpath_exists">XPath Exists</option>
                          <option value="value_match">Value Match</option>
                        </select>
                        <input
                          value={cond.value}
                          onChange={(e) => updateCondition(index, { ...cond, value: e.target.value })}
                          placeholder="Condition value"
                          className='flex-1'
                        />
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => setConditions([...conditions, { type: 'url_start', value: '' }])}
                    className="mt-3 px-4 py-1 mx-auto bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Condition
                  </button>
                </div>
              </Accordion.Panel>
            </Accordion.Item>

            {/* Sharing Accordion */}
            <Accordion.Item value="sharing" className="border border-gray-300 rounded-lg bg-white">
              <Accordion.Header>
                <Accordion.Trigger className="w-full px-4 py-3 text-left font-semibold text-gray-900 hover:bg-gray-50 rounded-lg flex items-center justify-between transition-colors">
                  Sharing
                  <ChevronDown className="w-5 h-5 transition-transform duration-200" />
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Panel className="smooth-accordion-panel">
                <div className="px-4 py-3 space-y-3">
                  <div>
                    <label>Visibility</label>
                    <select
                      value={visibility}
                      onChange={(e) => setVisibility(e.target.value as any)}
                    >
                      <option value="private">Private</option>
                      <option value="public">Public</option>
                    </select>
                  </div>
                </div>
              </Accordion.Panel>
            </Accordion.Item>

          </Accordion.Root>
        </div>
      </div>
      <div className="flex justify-end space-x-3 mt-1 pt-2 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg flex items-center transition-colors"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg flex items-center transition-colors"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Link
        </button>
      </div>
    </div>
  );
};
