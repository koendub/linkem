import { Link, Type, AppWindow, X } from 'lucide-react';
import { LinkType } from '@/core/types';

interface SelectElementTypeViewProps {
  onSelect: (type: LinkType) => void;
  onClose: () => void;
}

const OPTIONS: { type: LinkType; icon: typeof Link; title: string; description: string }[] = [
  { type: 'link', icon: Link, title: 'Link', description: 'Add a clickable link' },
  { type: 'text', icon: Type, title: 'Text', description: 'Add a piece of styled text' },
  { type: 'subpage', icon: AppWindow, title: 'Subpage', description: 'Embed another page in an iframe' },
];

export function SelectElementTypeView({ onSelect, onClose }: SelectElementTypeViewProps) {
  return (
    <div className="text-md bg-white text-gray-900 p-4 w-full h-full overflow-y-auto border-l border-gray-200 flex flex-col">
      <div className="flex-1 pr-2">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">What do you want to add?</h2>
        <div className="space-y-3">
          {OPTIONS.map(({ type, icon: Icon, title, description }) => (
            <button
              key={type}
              onClick={() => onSelect(type)}
              className="w-full flex items-center gap-4 p-4 border border-gray-300 rounded-lg bg-white hover:bg-blue-50 hover:border-blue-400 transition-colors text-left"
            >
              <Icon className="w-8 h-8 text-blue-500 shrink-0" />
              <div>
                <div className="font-semibold text-gray-900">{title}</div>
                <div className="text-sm text-gray-500">{description}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
      <div className="flex justify-end mt-2 pt-2 border-t border-gray-200">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-lg flex items-center transition-colors"
        >
          <X className="w-4 h-4 mr-2" />
          Cancel
        </button>
      </div>
    </div>
  );
}
