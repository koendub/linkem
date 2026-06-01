import React from 'react';
import { Tabs } from '@base-ui/react/tabs';
import { Link, Download, Upload, Settings } from 'lucide-react';
import LinksTab from './tabs/LinksTab';
import ImportTab from './tabs/ImportTab';
import ExportTab from './tabs/ExportTab';
import SettingsTab from './tabs/SettingsTab';
import { ProblemsButton } from '@/components/ProblemsButton';

const App: React.FC = () => {
  return (
    <div className="w-96 h-128 flex flex-col bg-white rounded-xl overflow-hidden shadow-xl">
      <Tabs.Root defaultValue="links" className="flex-1 flex flex-col h-full overflow-auto">
        <Tabs.List className="flex justify-around py-3 bg-gray-50 border-t border-gray-200 mt-auto">
          <Tabs.Tab value="links" className="border-none cursor-pointer p-2 rounded-md text-gray-500 transition-all duration-200 flex items-center justify-center data-active:bg-blue-500 data-active:text-white">
            <Link size={20} />
          </Tabs.Tab>
          <Tabs.Tab value="import" className="border-none cursor-pointer p-2 rounded-md text-gray-500 transition-all duration-200 flex items-center justify-center data-active:bg-blue-500 data-active:text-white">
            <Download size={20} />
          </Tabs.Tab>
          <Tabs.Tab value="export" className="border-none cursor-pointer p-2 rounded-md text-gray-500 transition-all duration-200 flex items-center justify-center data-active:bg-blue-500 data-active:text-white">
            <Upload size={20} />
          </Tabs.Tab>
          <Tabs.Tab value="settings" className="border-none cursor-pointer p-2 rounded-md text-gray-500 transition-all duration-200 flex items-center justify-center data-active:bg-blue-500 data-active:text-white">
            <Settings size={20} />
          </Tabs.Tab>
          <ProblemsButton />
        </Tabs.List>
        <Tabs.Panel value="links" className="flex-1 overflow-auto">
          <LinksTab />
        </Tabs.Panel>
        <Tabs.Panel value="import" className="flex-1 overflow-auto">
          <ImportTab />
        </Tabs.Panel>
        <Tabs.Panel value="export" className="flex-1 overflow-auto">
          <ExportTab />
        </Tabs.Panel>
        <Tabs.Panel value="settings" className="flex-1 overflow-auto">
          <SettingsTab />
        </Tabs.Panel>
      </Tabs.Root>
    </div>
  );
};

export default App;
