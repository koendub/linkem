import React, { useState } from 'react';
import { LinkPackage, LinkWithConditions } from '@/types';
import { exportToBase64 } from '@/utils/share';
import { Share, Plus, Trash2, Copy, Check } from 'lucide-react';

interface PackageListProps {
  packages: LinkPackage[];
  links: LinkWithConditions[];
  onSelectPackage: (pkg: LinkPackage) => void;
  onCreatePackage: (name: string) => void;
  onDeletePackage: (packageId: string) => void;
  onViewSingleShare: () => void;
  onViewImport: () => void;
}

const PackageList: React.FC<PackageListProps> = ({
  packages,
  links,
  onSelectPackage,
  onCreatePackage,
  onDeletePackage,
  onViewSingleShare,
  onViewImport,
}) => {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createName, setCreateName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [sharePackageId, setSharePackageId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCreate = async () => {
    if (!createName.trim()) return;
    setIsCreating(true);
    try {
      onCreatePackage(createName);
      setCreateName('');
      setShowCreateForm(false);
    } finally {
      setIsCreating(false);
    }
  };

  const handleShareClick = (pkg: LinkPackage) => {
    setSharePackageId(pkg.id);
  };

  const handleCopyShare = (pkg: LinkPackage) => {
    const encoded = exportToBase64(pkg, links);
    navigator.clipboard.writeText(encoded);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sharedPackage = sharePackageId ? packages.find(p => p.id === sharePackageId) : null;
  const sharedEncoded = sharedPackage ? exportToBase64(sharedPackage, links) : '';

  return (
    <div className="flex flex-col bg-white min-h-full">
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        <h2 className="text-xl font-bold mb-6 text-gray-900">Link Packages</h2>

        {packages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No packages yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {packages.map((pkg) => (
              <div key={pkg.id}>
                <div className="border border-gray-200 rounded-lg p-4 flex items-center justify-between bg-white hover:border-gray-300 transition">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900">{pkg.name}</h3>
                      <span className="text-sm text-gray-500 font-mono">#{pkg.id}</span>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">
                      {pkg.linkIds.length} link{pkg.linkIds.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => onSelectPackage(pkg)}
                      className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleShareClick(pkg)}
                      className="px-3 py-1 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100 transition flex items-center gap-1"
                    >
                      <Share size={14} />
                      Share
                    </button>
                    <button
                      onClick={() => onDeletePackage(pkg.id)}
                      className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {sharePackageId === pkg.id && (
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200 flex gap-2">
                    <input
                      type="text"
                      readOnly
                      value={sharedEncoded}
                      className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleCopyShare(pkg)}
                      className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-1 whitespace-nowrap"
                    >
                      {copied ? (
                        <>
                          <Check size={16} />
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy size={16} />
                          Copy
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => setSharePackageId(null)}
                      className="px-3 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 transition"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Create Package Section */}
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="w-full mt-6 py-2 px-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          Create Link Package
        </button>

        {showCreateForm && (
          <div className="mt-3 p-4 bg-gray-50 rounded-lg border border-gray-200 flex gap-2">
            <input
              type="text"
              value={createName}
              onChange={(e) => setCreateName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleCreate();
                }
              }}
              placeholder="Package name..."
              className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
            <button
              onClick={handleCreate}
              disabled={isCreating || !createName.trim()}
              className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition disabled:opacity-50 whitespace-nowrap"
            >
              {isCreating ? 'Creating...' : 'Create'}
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setCreateName('');
              }}
              className="px-4 py-2 bg-gray-300 text-gray-900 rounded hover:bg-gray-400 transition"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Single Link Share Button */}
        <button
          onClick={onViewSingleShare}
          className="w-full mt-3 py-2 px-4 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition"
        >
          Share Single Link
        </button>

        {/* Import Button */}
        <button
          onClick={onViewImport}
          className="w-full mt-3 py-2 px-4 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
        >
          Import Links
        </button>
      </div>
    </div>
  );
};

export default PackageList;
