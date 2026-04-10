import React, { useEffect } from 'react';
import { Settings } from 'lucide-react';
import { LocalUserSettingsValues, UserSettingsValues } from '@/core/types';
import { settingsStorage } from '@/core/storage/local_base_storage';
import { useStorageValue } from '@/components/hooks/useStorage';

const SettingsTab: React.FC = () => {
  const { value: settings, setValue: setSettings } = useStorageValue(settingsStorage, {} as LocalUserSettingsValues);

  useEffect(() => {
    if (settings) {
      settingsStorage.updateItems(settings);
    }
  }, [settings]);

  if (!settings) {
    return <div className="p-5 h-full box-border">Loading...</div>;
  }

  return (
    <div className="p-5 h-full box-border">
      <div className="flex items-center mb-6">
        <Settings size={20} className="text-gray-500 mr-2" />
        <h3 className="m-0 text-lg text-gray-900 font-semibold">Settings</h3>
      </div>

      {/* Default Link Display Position */}
      <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
        <label className="block mb-3 text-sm font-semibold text-gray-900">
          Default Link Display Position
        </label>
        <div className="flex flex-col gap-2">
          <label className={`flex items-center p-2 border border-gray-300 rounded-md cursor-pointer transition-colors duration-200 ${settings.default_link_position === 'on_text' ? 'bg-blue-50' : 'bg-white'}`}>
            <input
              type="radio"
              value="on_text"
              checked={settings.default_link_position === 'on_text'}
              onChange={() => setSettings({ ...settings, default_link_position: 'on_text' })}
              className="mr-2"
            />
            <div>
              <div className="text-sm text-gray-900 font-medium">On Text</div>
              <div className="text-xs text-gray-500">Replaces selected text with link</div>
            </div>
          </label>
          <label className={`flex items-center p-2 border border-gray-300 rounded-md cursor-pointer transition-colors duration-200 ${settings.default_link_position === 'next_to_text' ? 'bg-blue-50' : 'bg-white'}`}>
            <input
              type="radio"
              value="next_to_text"
              checked={settings.default_link_position === 'next_to_text'}
              onChange={() => setSettings({ ...settings, default_link_position: 'next_to_text' })}
              className="mr-2"
            />
            <div>
              <div className="text-sm text-gray-900 font-medium">Next to Text</div>
              <div className="text-xs text-gray-500">Adds link beside selected text</div>
            </div>
          </label>
        </div>
      </div>

      {/* Allow Networking */}
      <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm mt-4">
        <label className="block mb-3 text-sm font-semibold text-gray-900">
          Allow Networking
          <p className='text-xs text-gray-500'>
            Enable networking features allows you to publish and import links and link packages from other users by ID.
            Due to the potential security implications of importing many remote links, this feature is disabled by default.
            If you enable this, I recommend checking any links you import! (which, btw, is a good idea either way...)
          </p>
        </label>
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={settings.allowNetworking}
            onChange={(e) => setSettings({ ...settings, allowNetworking: e.target.checked })}
            className="mr-2"
          />
          <span className="text-sm text-gray-800">Enable networking features</span>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;