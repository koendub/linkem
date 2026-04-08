import React, { useState, useEffect } from 'react';
import { LinkPackage, LinkPackageWithLinks, LinkWithConditions } from '@/types';
import { LocalLinksStorage } from '@/utils/storage/local_links_storage';
import { LocalPackageStorage } from '@/utils/storage/local_package_storage';
import { exportToBase64 } from '@/utils/share';
import { Upload, Plus, Trash2, Copy, Check, Share } from 'lucide-react';

function CreatePackageForm({ onCreate }: { onCreate: (name: string) => void }) {
  const [createName, setCreateName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
}

function EditPackageView({ pkg, onClose }: { pkg: LinkPackageWithLinks; onClose: () => void }) {


  const onSave = async () => {
    await LocalPackageStorage.savePackage(pkg);


  }
}


const ExportTab: React.FC = () => {
  const [packages, setPackages] = useState<LinkPackage[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingPackageId, setEditingPackageId] = useState<string | null>(null);

  const [sharePackageId, setSharePackageId] = useState<string | null>(null);
  const [shareLinkId, setShareLinkId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loadedPackages, loadedLinks] = await Promise.all([
        LocalPackageStorage.getAllPackages(),
        LocalLinksStorage.getAllLinks(),
      ]);
      setPackages(Object.values(loadedPackages));
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePackage = async () => {
    if (!createName.trim()) return;
    setIsCreating(true);
    try {
      const newPackage = await LocalPackageStorage.savePackage({
        name: createName,
        linkIds: [],
      });
      setPackages([...packages, newPackage]);
      setCreateName('');
      setShowCreateForm(false);
      setEditingPackageId(newPackage.id);
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeletePackage = async (packageId: string) => {
    await LocalPackageStorage.deletePackage(packageId);
    setPackages(packages.filter(p => p.id !== packageId));
    if (editingPackageId === packageId) {
      setEditingPackageId(null);
    }
  };

  const handleAddLinkToPackage = async (packageId: string, linkId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg || pkg.linkIds.includes(linkId)) return;

    pkg.linkIds.push(linkId);
    await LocalPackageStorage.savePackage(pkg);
    setPackages([...packages]);
  };

  const handleRemoveLinkFromPackage = async (packageId: string, linkId: string) => {
    const pkg = packages.find(p => p.id === packageId);
    if (!pkg) return;

    pkg.linkIds = pkg.linkIds.filter(id => id !== linkId);
    await LocalPackageStorage.savePackage(pkg);
    setPackages([...packages]);
  };

  const handleCopyPackageShare = (pkg: LinkPackage) => {
    const encoded = exportToBase64(pkg, links);
    navigator.clipboard.writeText(encoded);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyLinkShare = (link: LinkWithConditions) => {
    const encoded = exportToBase64(link, links);
    navigator.clipboard.writeText(encoded);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="flex flex-col bg-white min-h-full items-center justify-center">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  const editingPackage = editingPackageId ? packages.find(p => p.id === editingPackageId) : null;
  const sharedPackage = sharePackageId ? packages.find(p => p.id === sharePackageId) : null;
  const sharedLink = shareLinkId ? links.find(l => l.id === shareLinkId) : null;

  return (
    <div className="flex flex-col bg-white min-h-full">
      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        {/* Link Packages Section */}
        <div className="mb-8">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Link Packages</h3>

          {/* Create Package Button */}
          {!showCreateForm && !editingPackage && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium flex items-center justify-center gap-2 mb-4"
            >
              <Plus size={18} />
              Create New Package
            </button>
          )}

          {/* Create Package Form */}
          {showCreateForm && !editingPackage && (
            <div className="mb-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <input
                type="text"
                value={createName}
                onChange={(e) => setCreateName(e.target.value)}
                placeholder="Package name"
                className="w-full p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
                onKeyDown={(e) => e.key === 'Enter' && handleCreatePackage()}
              />
              <div className="flex gap-2">
                <button
                  onClick={handleCreatePackage}
                  disabled={isCreating || !createName.trim()}
                  className="flex-1 px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 text-sm font-medium"
                >
                  {isCreating ? 'Creating...' : 'Create'}
                </button>
                <button
                  onClick={() => {
                    setShowCreateForm(false);
                    setCreateName('');
                  }}
                  className="flex-1 px-3 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition text-sm font-medium"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Edit Package */}
          {editingPackage && (
            <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-semibold text-gray-900">Editing: {editingPackage.name}</h4>
                <button
                  onClick={() => setEditingPackageId(null)}
                  className="text-sm text-blue-600 hover:text-blue-700"
                >
                  Done
                </button>
              </div>
              <p className="text-sm text-gray-600 mb-3">
                {editingPackage.linkIds.length} link{editingPackage.linkIds.length !== 1 ? 's' : ''} in this package
              </p>

              {/* Add Links to Package */}
              {links.length > 0 && (
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {links.map((link) => {
                    const isInPackage = editingPackage.linkIds.includes(link.id);
                    return (
                      <button
                        key={link.id}
                        onClick={() =>
                          isInPackage
                            ? handleRemoveLinkFromPackage(editingPackage.id, link.id)
                            : handleAddLinkToPackage(editingPackage.id, link.id)
                        }
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
          )}

          {/* Packages List */}
          {packages.length === 0 && !showCreateForm && !editingPackage ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No packages yet. Create one to get started!</p>
            </div>
          ) : !editingPackage && !showCreateForm ? (
            <div className="space-y-3">
              {packages.map((pkg) => (
                <div
                  key={pkg.id}
                  className="border border-gray-200 rounded-lg p-4 flex items-center justify-between bg-white hover:border-gray-300 transition"
                >
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                    <p className="text-sm text-gray-500 mt-1">
                      {pkg.linkIds.length} link{pkg.linkIds.length !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => setEditingPackageId(pkg.id)}
                      className="px-3 py-1 text-sm bg-blue-50 text-blue-700 rounded hover:bg-blue-100 transition"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setSharePackageId(sharePackageId === pkg.id ? null : pkg.id)}
                      className="px-3 py-1 text-sm bg-green-50 text-green-700 rounded hover:bg-green-100 transition flex items-center gap-1"
                    >
                      <Share size={14} />
                      Share
                    </button>
                    <button
                      onClick={() => handleDeletePackage(pkg.id)}
                      className="px-3 py-1 text-sm bg-red-50 text-red-700 rounded hover:bg-red-100 transition"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {/* Share Package */}
          {sharedPackage && (
            <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
              <h4 className="font-semibold text-gray-900 mb-2">Share "{sharedPackage.name}"</h4>
              <div className="flex gap-2">
                <input
                  type="text"
                  readOnly
                  value={exportToBase64(sharedPackage, links)}
                  className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={() => handleCopyPackageShare(sharedPackage)}
                  className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-1 whitespace-nowrap"
                >
                  {copied ? <Check size={16} /> : <Copy size={16} />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Single Links Section */}
        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-semibold mb-4 text-gray-900">Export Single Links</h3>

          {links.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No links available to export</p>
            </div>
          ) : (
            <div className="space-y-3">
              {links.map((link) => (
                <div key={link.id}>
                  <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:border-gray-300 transition">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-semibold text-gray-900 truncate">{link.name}</h4>
                      <p className="text-sm text-gray-500 truncate">{link.href_path_format}</p>
                      {link.display_name && (
                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">{link.display_name}</p>
                      )}
                    </div>
                    <button
                      onClick={() => setShareLinkId(shareLinkId === link.id ? null : link.id)}
                      className="ml-4 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 whitespace-nowrap"
                    >
                      <Share size={16} />
                      Share
                    </button>
                  </div>

                  {shareLinkId === link.id && (
                    <div className="mt-2 p-4 bg-gray-50 rounded-lg border border-gray-200 flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={exportToBase64(link, links)}
                        className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <button
                        onClick={() => handleCopyLinkShare(link)}
                        className="px-3 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-1 whitespace-nowrap"
                      >
                        {copied ? <Check size={16} /> : <Copy size={16} />}
                        {copied ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExportTab;
