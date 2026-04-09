import React, { useState, useEffect } from 'react';
import { LinkPackage, LinkWithConditions, UnstoredLinkPackage } from '@/types';
import { LocalLinksStorage } from '@/utils/storage/local_links_storage';
import { LocalPackageStorage } from '@/utils/storage/local_package_storage';
import { exportToBase64 } from '@/utils/share';
import { Plus, Trash2, Copy, Check, Share, PencilLine } from 'lucide-react';
import { useStorageValue } from '@/utils/hooks/useStorage';
import { settingsStorage } from '@/utils/storage/local_base_storage';

interface EditPackageViewProps {
  initialPkg: LinkPackage | UnstoredLinkPackage;
  onClose: (result: LinkPackage | UnstoredLinkPackage) => void;
}

function EditPackageView({ initialPkg, onClose }: EditPackageViewProps) {
  const [pkg, setPkg] = useState<LinkPackage | UnstoredLinkPackage>(initialPkg);
  const { value: allLinks } = useStorageValue(LocalLinksStorage.storage, {});

  // Sync local state when initialPkg changes (e.g., when editing a different package)
  useEffect(() => {
    setPkg(initialPkg);
  }, [initialPkg]);

  const handleAddLinkToPackage = async (link: LinkWithConditions) => {
    if (pkg.linkIds.includes(link.id)) return;
    pkg.linkIds.push(link.id);
    setPkg({...pkg});
  };

  const handleRemoveLinkFromPackage = async (link: LinkWithConditions) => {
    if (!pkg.linkIds.includes(link.id)) return;
    pkg.linkIds = pkg.linkIds.filter((id) => id !== link.id);
    setPkg({...pkg});
  };

  return (
    <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-semibold text-gray-900">Editing: {pkg.name}</h4>
        <button
          onClick={() => onClose({ ...pkg, name: pkg.name.trim() })}
          className="text-sm text-blue-600 hover:text-blue-700"
        >
          Done
        </button>
      </div>

      {/* Basic package settings */}
      <div>
        <label className="block mb-1 text-sm font-medium text-gray-700">Package Name</label>
        <input
          type="text"
          value={pkg.name}
          onChange={(e) => setPkg({ ...pkg, name: e.target.value })}
          className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />
      </div>

      <p className="text-sm text-gray-600 mb-3">
        {pkg.linkIds.length} link{pkg.linkIds.length !== 1 ? 's' : ''} in this package
      </p>

      {/* Add or Remove Links to Package */}
      {allLinks && Object.keys(allLinks).length > 0 && (
        <div className="space-y-2 max-h-48 overflow-y-auto">
          {Object.values(allLinks).map((link) => {
            const isInPackage = pkg.linkIds.includes(link.id);
            return (
              <button
                key={link.id}
                onClick={() => isInPackage ? handleRemoveLinkFromPackage(link) : handleAddLinkToPackage(link)}
                className={`w-full text-left p-2 rounded-lg transition text-sm ${
                  isInPackage
                    ? 'bg-blue-200 border border-blue-400'
                    : 'bg-gray-100 border border-gray-300 hover:bg-gray-200'
                }`}
              >
                <div className="font-medium text-gray-900">{link.name}</div>
                <div className="text-xs text-gray-600">{link.href_path_format}</div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  )
}

interface ShareablePackageProps {
  item: LinkPackage | LinkWithConditions;
}

function ShareableView({ item }: ShareablePackageProps) {
  const [copied, setCopied] = useState(false);
  const [base64, setBase64] = useState<string | undefined>(undefined);

  useEffect(() => {
    const generateBase64 = async () => {
      const encoded = await exportToBase64(item);
      setBase64(encoded);
    };
    generateBase64();
  }, [item]);

  const handleCopyShareText = useCallback(async () => {
    const useBase64 = base64 || await exportToBase64(item);
    navigator.clipboard.writeText(useBase64);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [base64]);

  return (
    <div className="p-4 bg-gray-50 border border-gray-200 rounded-b-lg">
      <h4 className="font-semibold text-gray-900 mb-2">Share "{item.name}"</h4>
      <div className="flex gap-2">
        <input
          type="text"
          readOnly
          placeholder='Generating shareable text...'
          value={base64}
          className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={!base64}
        />
        <button
          onClick={() => handleCopyShareText()}
          className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-1 whitespace-nowrap"
        >
          {copied ? <Check size={16} /> : <Copy size={16} />}
          {copied ? 'Copied!' : 'Copy'}
        </button>
      </div>
    </div>
  )
}

const ExportTab: React.FC = () => {
  const [editingPackage, setEditingPackage] = useState<LinkPackage | UnstoredLinkPackage | null>(null);
  const [showShareId, setShowShareId] = useState<string | null>(null);
  const { value: allLinks } = useStorageValue(LocalLinksStorage.storage, {});

  const { value: packages, refresh: refreshPackages, isLoading } = useStorageValue(LocalPackageStorage.storage, {}, async (pkgs) => {
    const myUserId = await settingsStorage.getItem('localUserId');
    const filteredPkgs = {} as { [id: string]: LinkPackage };
    Object.values(pkgs).forEach((pkg) => {
      if (pkg.user_id === myUserId) {
        filteredPkgs[pkg.id] = pkg;
      }
    });
    return filteredPkgs;
  });

  const handleDeletePackage = async (packageId: string) => {
    await LocalPackageStorage.deletePackage(packageId);
    await refreshPackages();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col bg-white min-h-full items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white p-6 min-h-full">
      {/* Link Packages Section */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Your Link Packages</h3>

        {/* Create Package Button */}
        {!editingPackage && (
          <button
            onClick={() => setEditingPackage({ name: '', linkIds: [] })}
            className="btn-primary w-[calc(100%-var(--spacing)*4)]"
          >
            <Plus size={18} className='mr-2' />
            Create New Package
          </button>
        )}

        {/* Edit Package */}
        {editingPackage && (
          <EditPackageView
            initialPkg={editingPackage} onClose={async (updatedPkg) => {
            setEditingPackage(null);
            await LocalPackageStorage.savePackage(updatedPkg);
            console.log('Saved package:', updatedPkg);
            await refreshPackages();
          }} />
        )}

        {/* Packages List */}
        {editingPackage ? null : Object.values(packages).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No packages yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.values(packages).map((pkg) => (
              <div key={pkg.id}>
                <div
                  className="border border-gray-200 rounded-lg p-2 pl-4 flex items-center justify-between bg-white hover:border-gray-300 transition"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {pkg.linkIds.length} link{pkg.linkIds.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center">
                    <button onClick={() => setEditingPackage(pkg)} className="btn-icon-blue">
                      <PencilLine size={14} />
                    </button>
                    <button onClick={() => setShowShareId(showShareId === pkg.id ? null : pkg.id)} className="btn-icon-green">
                      <Share size={14} />
                    </button>
                    <button onClick={() => handleDeletePackage(pkg.id)} className="btn-icon-red">
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
                {showShareId === pkg.id && <ShareableView item={pkg} />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Single Links Section */}
      <div className="border-t border-gray-200 pt-6">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Export Single Links</h3>

        {Object.values(allLinks).length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No links available to export</p>
          </div>
        ) : (
          <div className="space-y-3">
            {Object.values(allLinks).map((link) => (
              <div key={link.id}>
                <div className="flex items-center justify-between p-2 pl-4 border border-gray-200 rounded-lg hover:border-gray-300 transition">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{link.name}</h4>
                    <p className="text-sm text-gray-500 truncate">{link.href_path_format}</p>
                    {link.display_name && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">{link.display_name}</p>
                    )}
                  </div>
                  <button onClick={() => setShowShareId(showShareId === link.id ? null : link.id)} className="btn-icon-green">
                    <Share size={14} />
                  </button>
                </div>
                {showShareId === link.id && <ShareableView item={link} />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExportTab;
