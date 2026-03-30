import React, { useState, useEffect } from 'react';
import { SettingsStorage } from '../../../utils/storage';
import { Settings } from 'lucide-react';
import { UserSettings } from '@/models/UserSettings';

const SettingsTab: React.FC = () => {
  const [settings, setSettings] = useState<UserSettings | null>(null);

  useEffect(() => {
    const loadSettings = async () => {
      setSettings(await SettingsStorage.getSettings());
    };
    loadSettings();
  }, []);

  useEffect(() => {
    if (settings) {
      SettingsStorage.saveSettings({ ...settings });
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
      <div className="bg-white border border-gray-300 rounded-lg p-4 shadow-sm">
        <label className="block mb-3 text-sm font-semibold text-gray-900">
          Default Link Display Position
        </label>
        <div className="flex flex-col gap-2">
          <label className={`flex items-center p-2 border border-gray-300 rounded-md cursor-pointer transition-colors duration-200 ${settings.defaultLinkPosition === 'on_text' ? 'bg-blue-50' : 'bg-white'}`}>
            <input
              type="radio"
              value="on_text"
              checked={settings.defaultLinkPosition === 'on_text'}
              onChange={() => setSettings({ ...settings, defaultLinkPosition: 'on_text' })}
              className="mr-2"
            />
            <div>
              <div className="text-sm text-gray-900 font-medium">On Text</div>
              <div className="text-xs text-gray-500">Replaces selected text with link</div>
            </div>
          </label>
          <label className={`flex items-center p-2 border border-gray-300 rounded-md cursor-pointer transition-colors duration-200 ${settings.defaultLinkPosition === 'next_to_text' ? 'bg-blue-50' : 'bg-white'}`}>
            <input
              type="radio"
              value="next_to_text"
              checked={settings.defaultLinkPosition === 'next_to_text'}
              onChange={() => setSettings({ ...settings, defaultLinkPosition: 'next_to_text' })}
              className="mr-2"
            />
            <div>
              <div className="text-sm text-gray-900 font-medium">Next to Text</div>
              <div className="text-xs text-gray-500">Adds link beside selected text</div>
            </div>
          </label>
        </div>
      </div>
    </div>
  );
};

export default SettingsTab;