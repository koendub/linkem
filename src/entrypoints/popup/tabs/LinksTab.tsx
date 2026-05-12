import { useState, useMemo, useRef, useEffect } from 'react';
import { LinkWithConditions, Condition, UnstoredLinkWithConditions } from '@/core/types';
import { EditLinkView } from '../../../components/EditLinkView';
import { Edit, Trash2 } from 'lucide-react';
import { linksStorage } from '@/core/storage/local_storage';


export default function LinksTab() {
  const [links, setLinks] = useState<LinkWithConditions[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [editingLink, setEditingLink] = useState<LinkWithConditions | null>(null);
  const [currentUrl, setCurrentUrl] = useState<string>('');
  const editPanelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    loadLinks();
  }, []);

  const loadLinks = async () => {
    const allLinks = await linksStorage.getValue();
    setLinks(Object.values(allLinks));
  };

  const handleDelete = async (linkId: string) => {
    await linksStorage.removeItem(linkId);
    loadLinks();
  };

  useEffect(() => {
    browser.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        setCurrentUrl(tabs[0].url || '');
      }
    });
  }, []);

  // If there is a click anywhere outside the edit panel, close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const editPanel = editPanelRef.current;
      if (editPanel && !editPanel.contains(event.target as Node)) {
        setEditingLink(null);
        loadLinks();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [loadLinks]);

  const checkUrlCondition = (condition: Condition, url: string): boolean => {
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

  const doesLinkApplyToUrl = (link: LinkWithConditions, url: string): boolean => {
    return link.conditions.every(condition => checkUrlCondition(condition, url));
  };

  const filteredLinks = useMemo(() => {
    const filtered = links.filter(link => link.name.toLowerCase().includes(searchTerm.toLowerCase()));
    const currentPageLinks = filtered.filter(link => doesLinkApplyToUrl(link, currentUrl));
    const otherLinks = filtered.filter(link => !doesLinkApplyToUrl(link, currentUrl));
    return { currentPageLinks, otherLinks };
  }, [links, searchTerm, currentUrl]);

  const handleEdit = (link: LinkWithConditions) => {
    setEditingLink(link);
  };

  const handleSaveEdit = async (link: LinkWithConditions | UnstoredLinkWithConditions) => {
    await linksStorage.updateLinks([link]);
    setEditingLink(null);
    loadLinks();
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
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg box-border bg-white shadow-sm outline-none"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 text-base">
            🔍
          </div>
        </div>
        {filteredLinks.currentPageLinks.length > 0 && (
          <>
            <h3 className="my-4 text-md text-gray-500 uppercase tracking-wider font-semibold">Current Page Links</h3>
            <ul className="list-none p-0 m-0">
              {filteredLinks.currentPageLinks.map(link => (
                <li key={link.id} className="relative mb-2 border border-gray-300 rounded-lg p-3 bg-white shadow-sm transition-shadow duration-200 cursor-pointer hover:shadow-md">
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 mb-1 truncate">{link.name}</div>
                      <div className="text-sm text-gray-500 truncate">{link.href_format}</div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => handleEdit(link)} className="btn-icon btn-blue">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(link.id)} className="btn-icon btn-red">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  {/* Debug triangle */}
                  {/* <div className="absolute right-0 bottom-0 w-0 h-0 border-4 border-t-transparent border-l-transparent border-b-blue-500 border-r-blue-500 group">
                    <div className='hidden group-hover:block absolute right-0 bottom-0 bg-blue-100 rounded-lg max-w-60 p-1'>
                      {getFailingConditions(link)}
                    </div>
                  </div> */}
                </li>
              ))}
            </ul>
          </>
        )}
        {filteredLinks.otherLinks.length > 0 && (
          <>
            <h3 className="my-4 text-md text-gray-500 uppercase tracking-wider font-semibold">All Links</h3>
            <ul className="list-none p-0 m-0">
              {filteredLinks.otherLinks.map(link => (
                <li key={link.id} className="mb-2 border border-gray-300 rounded-lg p-3 bg-white shadow-sm transition-shadow duration-200 cursor-pointer hover:shadow-md">
                  <div className="flex justify-between items-center">
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 mb-1 truncate">{link.name}</div>
                      <div className="text-sm text-gray-500 truncate">{link.href_format}</div>
                    </div>
                    <div className="flex gap-1 ml-1">
                      <button onClick={() => handleEdit(link)} className="btn-icon btn-blue">
                        <Edit size={14} />
                      </button>
                      <button onClick={() => handleDelete(link.id)} className="btn-icon btn-red">
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
          <div className="text-center py-10 px-5 text-gray-500">
            No links found.
          </div>
        )}
      </div>

      {/* Sliding edit panel */}
      <div ref={editPanelRef} className={`absolute inset-0 bg-white transition-transform duration-300 ease-in-out ${editingLink ? 'translate-x-0' : 'translate-x-full'}`}>
        {editingLink && <EditLinkView link={editingLink} onClose={() => setEditingLink(null)} onSave={handleSaveEdit} />}
      </div>
    </div>
  );
};
