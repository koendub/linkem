import React, { useState, useMemo } from 'react';
import { CustomLink, LinkCondition } from '../../models';
import { EditLinkView } from '../../components/EditLinkView';
import { Edit, Trash2 } from 'lucide-react';

interface LinksTabProps {
  links: CustomLink[];
  onDelete: (id: string) => void;
  onRefresh: () => void;
}

const LinksTab: React.FC<LinksTabProps> = ({ links, onDelete, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLink, setEditingLink] = useState<CustomLink | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>('');

  useEffect(() => {
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        setCurrentUrl(tabs[0].url || '');
      }
    });
  }, []);

  const checkUrlCondition = (condition: LinkCondition, url: string): boolean => {
    switch (condition.type) {
      case 'url_start':
        return url.startsWith(condition.value);
      case 'url_contains':
        return url.includes(condition.value);
      case 'xpath_exists':
      case 'value_match':
        // Can't check without DOM, assume true for now
        return true;
      default:
        return false;
    }
  };

  const doesLinkApplyToUrl = (link: CustomLink, url: string): boolean => {
    return link.conditions.every(condition => checkUrlCondition(condition, url));
  };

  const filteredLinks = useMemo(() => {
    const filtered = links.filter(link =>
      link.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    const currentPageLinks = filtered.filter(link => doesLinkApplyToUrl(link, currentUrl));
    const otherLinks = filtered.filter(link => !doesLinkApplyToUrl(link, currentUrl));
    return { currentPageLinks, otherLinks };
  }, [links, searchTerm, currentUrl]);

  const handleEdit = (link: CustomLink) => {
    setEditingLink(link);
  };

  const handleCloseEdit = () => {
    setEditingLink(null);
    onRefresh();
  };

  return (
    <div className="relative w-full h-full overflow-hidden">
      {/* Main content */}
      <div className="p-4 w-full box-border">
        <div className="relative mb-4">
          <input
            type="text"
            placeholder="Search links..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg box-border text-sm bg-white shadow-sm outline-none"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-base">
            🔍
          </div>
        </div>
        {filteredLinks.currentPageLinks.length > 0 && (
          <>
            <h3 className="my-4 text-xs text-gray-500 uppercase tracking-wider font-semibold">Current Page Links</h3>
            <ul className="list-none p-0 m-0">
              {filteredLinks.currentPageLinks.map(link => (
                <li key={link.id} className="mb-2 border border-gray-300 rounded-lg p-3 bg-white shadow-sm transition-shadow duration-200 cursor-pointer hover:shadow-md">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-900 mb-1">{link.name}</div>
                      <div className="text-xs text-gray-500">{link.hrefPathFormat}</div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(link)} className="p-1.5 border-none rounded bg-blue-500 text-white cursor-pointer flex items-center justify-center transition-colors duration-200 hover:bg-blue-600">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => onDelete(link.id)} className="p-1.5 border-none rounded bg-red-500 text-white cursor-pointer flex items-center justify-center transition-colors duration-200 hover:bg-red-700">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
        {filteredLinks.otherLinks.length > 0 && (
          <>
            <h3 className="my-4 text-xs text-gray-500 uppercase tracking-wider font-semibold">All Links</h3>
            <ul className="list-none p-0 m-0">
              {filteredLinks.otherLinks.map(link => (
                <li key={link.id} className="mb-2 border border-gray-300 rounded-lg p-3 bg-white shadow-sm transition-shadow duration-200 cursor-pointer hover:shadow-md">
                  <div className="flex justify-between items-center">
                    <div className="flex-1">
                      <div className="font-semibold text-sm text-gray-900 mb-1">{link.name}</div>
                      <div className="text-xs text-gray-500">{link.hrefPathFormat}</div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(link)} className="p-1.5 border-none rounded bg-blue-500 text-white cursor-pointer flex items-center justify-center transition-colors duration-200 hover:bg-blue-600">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => onDelete(link.id)} className="p-1.5 border-none rounded bg-red-500 text-white cursor-pointer flex items-center justify-center transition-colors duration-200 hover:bg-red-700">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </>
        )}
        {filteredLinks.currentPageLinks.length === 0 && filteredLinks.otherLinks.length === 0 && (
          <div className="text-center py-10 px-5 text-gray-500 text-sm">
            No links found.
          </div>
        )}
      </div>

      {/* Sliding edit panel */}
      <div className={`absolute inset-0 bg-white transition-transform duration-300 ease-in-out ${editingLink ? 'translate-x-0' : 'translate-x-full'}`}>
        {editingLink && <EditLinkView link={editingLink} onClose={() => setEditingLink(null)} onSave={handleCloseEdit} />}
      </div>
    </div>
  );
};

export default LinksTab;