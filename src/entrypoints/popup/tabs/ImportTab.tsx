import { useState, useEffect } from 'react';
import { Download, Trash2, AlertCircle, CheckCircle } from 'lucide-react';
import { importFromBase64 } from '@/core/share';
import { LinkPackage } from '@/core/types';
import { linksStorage, packagesStorage, settingsStorage } from '@/core/storage/local_storage';


function ImportForm({ onImport }: { onImport: () => void }) {
  const [showImportForm, setShowImportForm] = useState(false);
  const [input, setInput] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Error and success messages disappear after 5 seconds
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];
    if (errorMsg) timers.push(setTimeout(() => setErrorMsg(null), 5000));
    if (successMsg) timers.push(setTimeout(() => setSuccessMsg(null), 5000));
    return () => timers.forEach(t => clearTimeout(t));
  }, [errorMsg, successMsg]);

  const handleImport = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!input.trim()) {
      setErrorMsg('Please paste your text here');
      return;
    }

    setIsLoading(true);
    try {
      importFromBase64(input.trim());
      setSuccessMsg('Successfully imported links!');
      setInput('');
      setShowImportForm(false);
      onImport();
    } catch (err) {
      if (err instanceof Error) {
        setErrorMsg(err.message);
      } else {
        setErrorMsg('Failed to import. Please check the text and try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {/* Import Button / Textfield */}
      <button
        onClick={() => setShowImportForm(!showImportForm)}
        className="btn-primary w-[calc(100%-var(--spacing)*4)]"
      >
        <Download size={18} className='mr-2' />
        Import from Text or Id
      </button>

      {/* Import Form */}
      {showImportForm && (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <div className="mb-3">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Paste your text here
            </label>
            <textarea
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                setErrorMsg(null);
                setSuccessMsg(null);
              }}
              placeholder="paste your text here"
              className="w-full p-3 border border-gray-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-24 resize-none"
            />
          </div>

          {/* Import Button */}
          <button
            onClick={handleImport}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-50 disabled:cursor-not-allowed font-medium"
          >
            {isLoading ? 'Importing...' : 'Import'}
          </button>

          {/* Error Message */}
          {errorMsg && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2">
              <AlertCircle size={18} className="text-red-600 shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
          )}

          {/* Success Message */}
          {successMsg && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg flex items-start gap-2">
              <CheckCircle size={18} className="text-green-600 shrink-0 mt-0.5" />
              <p className="text-sm text-green-700">{successMsg}</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function ImportTab() {
  const [importedPackages, setImportedPackages] = useState<LinkPackage[]>([]);

  useEffect(() => {
    loadImportedPackages();
  }, []);

  const loadImportedPackages = async () => {
    try {
      const allPackages = await packagesStorage.getValue();
      const thisUserId = await settingsStorage.getItem('localUserId');
      const importedPackages = Object.values(allPackages).filter(pkg => pkg.user_id !== thisUserId);
      setImportedPackages(importedPackages);
    } catch (error) {
      console.error('Failed to load imported packages:', error);
    }
  };

  const handleDeleteImportedPackage = async (packageId: string) => {
    const pkg = importedPackages.find(p => p.id === packageId);
    if (!pkg) return;
    try {
      // Delete all links in the package
      for (const linkId of pkg.linkIds) {
        await linksStorage.removeItem(linkId);
      }
      await packagesStorage.removeItem(packageId);
      loadImportedPackages();
    } catch (error) {
      console.error('Failed to delete imported package:', error);
    }
  };

  return (
    <div className="flex flex-col bg-white p-6 min-h-full">
      <ImportForm onImport={loadImportedPackages} />

      {/* Imported Packages List */}
      <div>
        <h3 className="text-lg font-semibold mb-4 text-gray-900">
          Previously Imported ({importedPackages.length})
        </h3>

        {importedPackages.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No imported packages yet. Import one to get started!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {importedPackages.map((pkg) => (
              <div
                key={pkg.id}
                className="border border-gray-200 rounded-lg p-4 flex items-center justify-between bg-white hover:border-gray-300 transition"
              >
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900">{pkg.name}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    {pkg.linkIds.length} link{pkg.linkIds.length !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Last updated: {new Date(pkg.updated_at!).toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteImportedPackage(pkg.id)}
                  className="ml-4 px-3 py-2 bg-red-50 text-red-700 rounded hover:bg-red-100 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
