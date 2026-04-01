import { useState, useEffect } from 'react';
import { CustomLink, LinkCondition, UnstoredLink } from '../models';
import { Link, Plus, Trash2, X, Save, ChevronDown } from 'lucide-react';
import { Accordion } from '@base-ui/react';
import './style.css';

interface EditLinkViewProps {
  link: CustomLink | UnstoredLink;
  onSave: (link: CustomLink | UnstoredLink) => void;
  onClose: () => void;
}

export function EditLinkView({ link, onClose, onSave }: EditLinkViewProps) {
  const [linkObj, setLinkObj] = useState<CustomLink | UnstoredLink>(link);

  useEffect(() => {
    setLinkObj({ ...link });
  }, [link]);

  const updateCondition = (index: number, condition: LinkCondition) => {
    const newConditions = [...linkObj.conditions];
    newConditions[index] = condition;
    setLinkObj({ ...linkObj, conditions: newConditions });
  };

  const handleSave = async () => {
    onSave(linkObj);
    onClose();
  };

  return (
    <div className="bg-white text-gray-900 p-4 w-full h-full overflow-y-auto border-l border-gray-200 flex flex-col">
      <div className="flex-1 pr-2">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Link className="w-6 h-6 mr-3 text-blue-500" />
          {'id' in linkObj ? 'Edit Link' : 'Create New Link'}
        </h2>
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label>Name</label>
              <input
                value={linkObj.name}
                onChange={(e) => setLinkObj({ ...linkObj, name: e.target.value })}
                placeholder="Enter link name"
              />
            </div>
            <div>
              <label>Href Path Format</label>
              <input
                value={linkObj.hrefPathFormat}
                onChange={(e) => setLinkObj({ ...linkObj, hrefPathFormat: e.target.value })}
                placeholder="https://example.com/search/{text-value}"
              />
              <small className="text-gray-500 text-xs mt-2 block">
                Use <span className="bg-blue-100 px-2 py-1 rounded font-mono text-blue-700">{`{text-value}`}</span> to insert the selected text.
              </small>
            </div>
          </div>
          <Accordion.Root multiple className="space-y-3">

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
                      value={linkObj.visibility}
                      onChange={(e) => setLinkObj({ ...linkObj, visibility: e.target.value as any })}
                    >
                      <option value="private">Private</option>
                      <option value="public">Public</option>
                    </select>
                  </div>
                </div>
              </Accordion.Panel>
            </Accordion.Item>

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
                      value={linkObj.position}
                      onChange={(e) => setLinkObj({ ...linkObj, position: e.target.value as any })}
                    >
                      <option value="user_default">User Default</option>
                      <option value="on_text">On Text</option>
                      <option value="next_to_text">Next to Text</option>
                    </select>
                  </div>
                  <div>
                    <label className='p-0 m-0'>Display Name</label>
                    <div className='text-xs text-gray-500 mb-1'>(for when position is 'Next to Text')</div>
                    <input
                      value={linkObj.displayName}
                      onChange={(e) => setLinkObj({ ...linkObj, displayName: e.target.value })}
                      placeholder="Enter display name"
                    />
                  </div>
                  <div>
                    <label>On Element XPath</label>
                    <input
                      value={linkObj.onXPath}
                      onChange={(e) => setLinkObj({ ...linkObj, onXPath: e.target.value })}
                      placeholder="Enter display name"
                    />
                  </div>
                  <div>
                    <label>On Text Regex</label>
                    <input
                      value={linkObj.onSelectedTextRegex}
                      onChange={(e) => setLinkObj({ ...linkObj, onSelectedTextRegex: e.target.value })}
                      placeholder="Enter display name"
                    />
                  </div>
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
                  <p className='text-sm text-gray-800 mb-1'>Add conditions. A custom link will only be shown if all its conditions are met.</p>
                  <div className="space-y-2">
                    {linkObj.conditions.map((cond, index) => (
                      <div key={index} className="flex flex-wrap gap-2 items-center p-2 bg-gray-50 border border-gray-200 rounded-lg">
                        <button
                          onClick={() => setLinkObj({ ...linkObj, conditions: linkObj.conditions.filter((_, i) => i !== index) })}
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
                    onClick={() => setLinkObj({ ...linkObj, conditions: [...linkObj.conditions, { type: 'url_start', value: '' }] })}
                    className="mt-3 px-4 py-1 mx-auto bg-green-500 hover:bg-green-600 text-white rounded-lg flex items-center transition-colors"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Add Condition
                  </button>
                </div>
              </Accordion.Panel>
            </Accordion.Item>

          </Accordion.Root>
        </div>
      </div>
      <div className="flex justify-end space-x-3 mt-2 pt-2 border-t border-gray-200">
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
