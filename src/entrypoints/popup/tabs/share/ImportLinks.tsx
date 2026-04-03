import React, { useState } from 'react';
import { ExportedLink, ExportedLinkPackage, LinkWithConditions, UnstoredLinkWithConditions } from '@/types';
import { LocalLinksStorage } from '@/utils/storage/local_links_storage';
import { decodeFromBase64 } from '@/utils/encoding';
import { ArrowLeft, AlertCircle, CheckCircle } from 'lucide-react';

interface ImportLinksProps {
  onBack: () => void;
  onImportComplete: () => void;
}

const ImportLinks: React.FC<ImportLinksProps> = ({ onBack, onImportComplete }) => {
  const [input, setInput] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [importedCount, setImportedCount] = useState(0);



  const handleImport = async () => {
    setError(null);
    setSuccess(false);
    setImportedCount(0);

    if (!input.trim()) {
      setError('Please paste a base64 code');
      return;
    }

    setIsLoading(true);

    try {
      const data = decodeFromBase64<ExportedLinkPackage | ExportedLink>(input.trim());

      let linksToImport: ExportedLink[] = [];

      if (isPackage(data)) {
        linksToImport = data.links;
      } else if (isSingleLink(data)) {
        linksToImport = [data];
      } else {
        throw new Error('Invalid format: must be a link package or single link');
      }

      // Import each link
      for (const linkData of linksToImport) {
        const newLink: UnstoredLinkWithConditions = {
          name: linkData.name,
          href_path_format: linkData.href_path_format,
          display_name: linkData.display_name,
          on_xpath: linkData.on_xpath,
          on_selected_text_regex: linkData.on_selected_text_regex,
          position: linkData.position,
          icon: linkData.icon,
          visibility: linkData.visibility,
          conditions: linkData.conditions as any,
          // Don't set ID - let saveLink generate it
          // user_id: 'local-user',
          // created_at: new Date().toISOString(),
          // updated_at: new Date().toISOString(),
        };

        await LocalLinksStorage.saveLink(newLink);
      }

      setImportedCount(linksToImport.length);
      setSuccess(true);
      setInput('');

      // Reset and go back after 2 seconds
      setTimeout(() => {
        onImportComplete();
      }, 2000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to import links. Please check the code and try again.');
      }
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
        <h2 className="text-xl font-bold text-gray-900">Import Links</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 min-h-0">
        <p className="text-sm text-gray-600 mb-4">
          Paste a base64 code that someone shared with you to import their links:
        </p>

        <input
          type="text"
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setError(null);
            setSuccess(false);
          }}
          placeholder="Paste base64 code here..."
          className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
        />

        {/* Error Message */}
        {error && (
          <div className="flex items-start gap-3 bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <AlertCircle size={20} className="text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-red-900">Import Error</p>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="flex items-start gap-3 bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
            <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-semibold text-green-900">Import Successful</p>
              <p className="text-sm text-green-700 mt-1">
                Successfully imported {importedCount} link{importedCount !== 1 ? 's' : ''}!
              </p>
            </div>
          </div>
        )}

        {/* Info Box */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-900">
          <p className="font-semibold mb-2">How to import:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Ask someone to share a link package or single link with you</li>
            <li>Paste the base64 code they give you above</li>
            <li>Click Import to add the links to your collection</li>
          </ul>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 px-6 py-4 flex justify-end gap-3">
        <button
          onClick={onBack}
          className="px-4 py-2 bg-gray-200 text-gray-900 rounded-lg hover:bg-gray-300 transition"
        >
          Cancel
        </button>
        <button
          onClick={handleImport}
          disabled={isLoading || !input.trim()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Importing...' : 'Import'}
        </button>
      </div>
    </div>
  );
};

export default ImportLinks;
