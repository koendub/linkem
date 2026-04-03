import React, { useState } from 'react';
import { LinkPackage, LinkWithConditions } from '@/types';
import { LocalPackageStorage } from '@/utils/storage/local_package_storage';
import { ArrowLeft, Plus, Check, X } from 'lucide-react';

interface PackageEditorProps {
  package: LinkPackage;
  links: LinkWithConditions[];
  onBack: () => void;
  onPackageUpdated: () => void;
}

const PackageEditor: React.FC<PackageEditorProps> = ({
  package: pkg,
  links,
  onBack,
  onPackageUpdated,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Get only links that don't have a creator_id (local/user created links)
  const userLinks = links;

  const handleAddLink = async (linkId: string) => {
    setIsLoading(true);
    try {
      await LocalPackageStorage.addLinkToPackage(pkg.id, linkId);
      onPackageUpdated();
    } catch (error) {
      console.error('Failed to add link:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveLink = async (linkId: string) => {
    setIsLoading(true);
    try {
      await LocalPackageStorage.removeLinkFromPackage(pkg.id, linkId);
      onPackageUpdated();
    } catch (error) {
      console.error('Failed to remove link:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <div className="border-b border-gray-200 px-6 py-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-3"
        >
          <ArrowLeft size={18} />
          Back
        </button>
        <h2 className="text-xl font-bold text-gray-900">{pkg.name}</h2>
        <p className="text-sm text-gray-500 mt-1">#{pkg.id}</p>
      </div>

      {/* Links List */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        <h3 className="text-lg font-semibold mb-4 text-gray-900">Your Links</h3>

        {userLinks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No links available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {userLinks.map((link) => {
              const isInPackage = pkg.linkIds.includes(link.id);

              return (
                <div
                  key={link.id}
                  className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition"
                >
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate">{link.name}</h4>
                    <p className="text-sm text-gray-500 truncate">{link.href_path_format}</p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {isInPackage ? (
                      <>
                        <button
                          disabled={isLoading}
                          className="p-2 text-green-600 hover:bg-green-50 rounded transition disabled:opacity-50"
                        >
                          <Check size={18} />
                        </button>
                        <button
                          onClick={() => handleRemoveLink(link.id)}
                          disabled={isLoading}
                          className="p-2 text-red-600 hover:bg-red-50 rounded transition disabled:opacity-50"
                        >
                          <X size={18} />
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleAddLink(link.id)}
                        disabled={isLoading}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded transition disabled:opacity-50"
                      >
                        <Plus size={18} />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default PackageEditor;
