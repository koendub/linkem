import { useState, useEffect } from 'react';
import { LinkWithConditions, UnstoredLinkWithConditions } from '@/core/types';
import { Link, X, Save, ChevronDown } from 'lucide-react';
import { Accordion } from '@base-ui/react';
import { hasSupabaseConfig } from '@/core/storage/supabase_storage';
import { ExactConditionsEditor, SimpleConditionsEditor, useOriginalUrl } from './editing/ConditionsEditor';
import { HrefFormatEditor } from './editing/HrefFormatEditor';
import { ExactDisplayEditor, SimpleDisplayEditor } from './editing/DisplayEditor';

type LinkToEdit = LinkWithConditions | UnstoredLinkWithConditions;

interface EditLinkViewProps {
  initialLink: LinkToEdit;
  onSave: (link: LinkToEdit) => void;
  onClose: () => void;
}

export function EditLinkView({ initialLink, onClose, onSave }: EditLinkViewProps) {
  const originalUrl = useOriginalUrl(initialLink.conditions);
  const [link, setLink] = useState<LinkToEdit>({ ...initialLink });
  const [isSimpleMode, setIsSimpleMode] = useState(true);

  useEffect(() => {
    setLink({ ...initialLink });
  }, [initialLink]);

  const handleSave = async () => {
    onSave(link);
    onClose();
  };

  return (
    <div className="text-md bg-white text-gray-900 p-4 w-full h-full overflow-y-auto border-l border-gray-200 flex flex-col">
      <div className="flex-1 pr-2">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
          <Link className="w-6 h-6 mr-3 text-blue-500" />
          {'id' in link ? 'Edit Link' : 'Create New Link'}
        </h2>
        <div className="space-y-6">
          <div className="space-y-4">
            <div>
              <label>Name</label>
              <input
                value={link.name}
                onChange={(e) => setLink({ ...link, name: e.target.value })}
                placeholder="Enter link name"
              />
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <label>Link URL Format</label>
              </div>
              <HrefFormatEditor link={link} onChange={(updatedLink) => setLink(updatedLink)} />
            </div>
            <div className="flex gap-2 bg-gray-200 rounded-lg p-1">
              <button
                onClick={() => setIsSimpleMode(true)}
                className={`flex-1 px-3 py-1 rounded transition-colors font-medium text-sm ${
                  isSimpleMode
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-300'
                }`}
              >
                Simple
              </button>
              <button
                onClick={() => setIsSimpleMode(false)}
                className={`flex-1 px-3 py-1 rounded transition-colors font-medium text-sm ${
                  !isSimpleMode
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-700 hover:bg-gray-300'
                }`}
              >
                Advanced
              </button>
            </div>
          </div>
          {isSimpleMode ? (
            <div className='flex flex-col gap-2'>
              <SimpleDisplayEditor link={link} setLink={setLink} />
              <SimpleConditionsEditor conditions={link.conditions} onChange={(newConds) => setLink({ ...link, conditions: newConds })} originalUrl={originalUrl} />
            </div>
          ) : (
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
                  <ExactDisplayEditor link={link} setLink={setLink} />
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
                  <ExactConditionsEditor conditions={link.conditions} onChange={(newConds) => setLink({ ...link, conditions: newConds })} originalUrl={originalUrl} />
                </Accordion.Panel>
              </Accordion.Item>

              {/* Sharing Accordion */}
              {hasSupabaseConfig() && (
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
                          value={link.visibility}
                          onChange={(e) => setLink({ ...link, visibility: e.target.value as any })}
                        >
                          <option value="private">Private</option>
                          <option value="public">Public</option>
                        </select>
                      </div>
                    </div>
                  </Accordion.Panel>
                </Accordion.Item>
              )}

            </Accordion.Root>
          )}

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
