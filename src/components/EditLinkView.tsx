import { useState, useEffect } from 'react';
import { CustomLink, LinkCondition } from '../models';
import { LinksStorage } from '../utils/storage';
import { LinkLocation } from '@/models/LinkLocation';
import { Link, Plus, Trash2, X, Save, ChevronDown } from 'lucide-react';
import { Accordion } from '@base-ui/react';

interface EditLinkViewProps {
  selectedText: string;
  url: string;
  xpath: string;
  onClose: () => void;
  onSave: () => void;
}

export function EditLinkView({ selectedText, url, xpath, onClose, onSave }: EditLinkViewProps) {
  const [name, setName] = useState('');
  const [position, setPosition] = useState<'on_text' | 'next_to_text' | 'user_default'>('user_default');
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
      { type: 'xpath_exists', value: xpath }
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
    <div className="bg-slate-900 text-slate-100 p-8 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-scroll border border-slate-700 no-scrollbar">
      <h2 className="text-3xl font-bold text-slate-100 mb-8 flex items-center">
        <Link className="w-6 h-6 inline mr-3 text-blue-400" />
        Create New Link
      </h2>
      <div className="space-y-8">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="Enter link name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-3">Href Path Format</label>
            <input
              value={hrefPathFormat}
              onChange={(e) => setHrefPathFormat(e.target.value)}
              className="w-full px-4 py-3 bg-slate-800 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
              placeholder="https://example.com/search/{text-value}"
            />
            <small className="text-slate-400 text-xs mt-2 block">
              Use <span className="bg-yellow-600 px-1 rounded font-mono text-yellow-100">{`{text-value}`}</span> to insert the selected text.
            </small>
          </div>
        </div>

        <Accordion.Root multiple className="space-y-3">

          {/* Link Location Accordion */}
          <Accordion.Item value="location" className="border border-slate-600 rounded-lg bg-slate-800">
            <Accordion.Header>
              <Accordion.Trigger className="w-full px-4 py-4 text-left font-semibold text-slate-100 hover:bg-slate-700 rounded-lg flex items-center justify-between transition-colors">
                Link Location
                <ChevronDown className="w-5 h-5 transition-transform duration-200 data-panel-open:rotate-180" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel className="h-(--accordion-panel-height) overflow-hidden text-base text-gray-600 transition-[height] ease-out data-ending-style:h-0 data-starting-style:h-0">
              <div className='px-2 py-2'>
                <label className="block text-sm font-medium text-slate-300 mb-2">Position</label>
                <select
                  value={position}
                  onChange={(e) => setPosition(e.target.value as any)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <option value="user_default" className="bg-slate-800 text-slate-100">User Default</option>
                  <option value="on_text" className="bg-slate-800 text-slate-100">On Text</option>
                  <option value="next_to_text" className="bg-slate-800 text-slate-100">Next to Text</option>
                </select>
              </div>
              {position === 'next_to_text' && (
                <div className='px-2 pb-2'>
                  <label className="block text-sm font-medium text-slate-300 mb-2">Display Name</label>
                    <input
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="Enter display name"
                    />
                </div>
              )}
            </Accordion.Panel>
          </Accordion.Item>

          {/* Conditions Accordion */}
          <Accordion.Item value="conditions" className="border border-slate-600 rounded-lg bg-slate-800">
            <Accordion.Header className="py-0! m-0!">
              <Accordion.Trigger className="w-full px-4 py-4 text-left font-semibold text-slate-100 hover:bg-slate-700 rounded-lg flex items-center justify-between transition-colors">
                Conditions
                <ChevronDown className="w-5 h-5 transition-transform duration-200 data-panel-open:rotate-180" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel className="h-(--accordion-panel-height) overflow-hidden text-base text-gray-600 transition-[height] ease-out data-ending-style:h-0 data-starting-style:h-0">
              <div className="space-y-2 p-2 flex flex-col items-center">
                {conditions.map((cond, index) => (
                  <div key={index} className="px-2 flex items-center space-x-3 p-1 w-full bg-slate-700 rounded-lg">
                    <select
                      value={cond.type}
                      onChange={(e) => updateCondition(index, { ...cond, type: e.target.value as any })}
                      className="flex-1 px-3 py-2 bg-slate-600 border border-slate-500 rounded text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                    >
                      <option value="url_start" className="bg-slate-800 text-slate-100">URL Starts With</option>
                      <option value="url_contains" className="bg-slate-800 text-slate-100">URL Contains</option>
                      <option value="xpath_exists" className="bg-slate-800 text-slate-100">XPath Exists</option>
                      <option value="value_match" className="bg-slate-800 text-slate-100">Value Match</option>
                    </select>
                    <input
                      value={cond.value}
                      onChange={(e) => updateCondition(index, { ...cond, value: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-600 border border-slate-500 rounded text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-blue-500 transition-colors"
                      placeholder="Condition value"
                    />
                    <button
                      onClick={() => setConditions(conditions.filter((_, i) => i !== index))}
                      className="p-1 bg-red-600 hover:bg-red-700 rounded-full text-white transition-colors"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={() => setConditions([...conditions, { type: 'url_start', value: '' }])}
                  className="mt-1 px-6 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg flex items-center transition-colors w-fit"
                >
                  <Plus className="w-4 h-4 inline mr-1" />
                  Add Condition
                </button>
              </div>
            </Accordion.Panel>
          </Accordion.Item>

          {/* Sharing Accordion */}
          <Accordion.Item value="sharing" className="border border-slate-600 rounded-lg bg-slate-800">
            <Accordion.Header className="py-0! m-0!">
              <Accordion.Trigger className="w-full px-4 py-4 text-left font-semibold text-slate-100 hover:bg-slate-700 rounded-lg flex items-center justify-between transition-colors">
                Sharing
                <ChevronDown className="w-5 h-5 transition-transform duration-200 data-panel-open:rotate-180" />
              </Accordion.Trigger>
            </Accordion.Header>
            <Accordion.Panel className="h-(--accordion-panel-height) overflow-hidden text-base text-gray-600 transition-[height] ease-out data-ending-style:h-0 data-starting-style:h-0">
              <div className='p-2'>
                <label className="block text-sm font-medium text-slate-300 mb-2">Visibility</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  className="w-full px-4 py-3 bg-slate-700 border border-slate-600 rounded-lg text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                >
                  <option value="private" className="bg-slate-800 text-slate-100">Private</option>
                  <option value="public" className="bg-slate-800 text-slate-100">Public</option>
                </select>
              </div>
            </Accordion.Panel>
          </Accordion.Item>

        </Accordion.Root>
      </div>
      <div className="flex justify-end space-x-4 mt-8">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-slate-100 rounded-lg flex items-center transition-colors"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center transition-colors"
        >
          <Save className="w-4 h-4 mr-2" />
          Save Link
        </button>
      </div>
    </div>
  );
};
