import React, { useState } from 'react';
import { LinkWithConditions, ExportedLink } from '@/types';
import { Share, ArrowLeft, Copy, Check } from 'lucide-react';
import { encodeToBase64 } from '@/utils/encoding';

interface SingleLinkShareProps {
  links: LinkWithConditions[];
  onBack: () => void;
}

const SingleLinkShare: React.FC<SingleLinkShareProps> = ({ links, onBack }) => {
  const [shareLinkId, setShareLinkId] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  // Get all user links
  const userLinks = links;

  const generateExportData = (link: LinkWithConditions): ExportedLink => ();

  const handleShareClick = (linkId: string) => {
    setShareLinkId(shareLinkId === linkId ? null : linkId);
  };

  const handleCopyShare = (link: LinkWithConditions) => {
    const encoded = encodeToBase64(generateExportData(link));
    navigator.clipboard.writeText(encoded);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const sharedLink = shareLinkId ? userLinks.find(l => l.id === shareLinkId) : null;
  const sharedEncoded = sharedLink ? encodeToBase64(generateExportData(sharedLink)) : '';

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
        <h2 className="text-xl font-bold text-gray-900">Share Single Link</h2>
      </div>

      {/* Links List */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        {userLinks.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No links available to share</p>
          </div>
        ) : (
          <div className="space-y-3">
            {userLinks.map((link) => (
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
                    onClick={() => handleShareClick(link.id)}
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
                      value={sharedEncoded}
                      className="flex-1 bg-white border border-gray-300 rounded px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() => handleCopyShare(link)}
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
                      onClick={() => setShareLinkId(null)}
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
      </div>
    </div>
  );
};

export default SingleLinkShare;
