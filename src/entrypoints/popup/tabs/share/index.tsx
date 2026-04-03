import React, { useState, useEffect } from 'react';
import { LinkPackage, LinkWithConditions } from '@/types';
import { LocalLinksStorage } from '@/utils/storage/local_links_storage';
import { LocalPackageStorage } from '@/utils/storage/local_package_storage';
import PackageList from './PackageList';
import PackageEditor from './PackageEditor';
import SingleLinkShare from './SingleLinkShare';
import ImportLinks from './ImportLinks';


type ViewType = 'list' | 'editor' | 'single' | 'import';

const Share: React.FC = () => {
  const [currentView, setCurrentView] = useState<ViewType>('list');
  const [packages, setPackages] = useState<LinkPackage[]>([]);
  const [links, setLinks] = useState<LinkWithConditions[]>([]);
  const [selectedPackage, setSelectedPackage] = useState<LinkPackage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [loadedPackages, loadedLinks] = await Promise.all([
        LocalPackageStorage.getAllPackages(),
        LocalLinksStorage.getAllLinks(),
      ]);
      setPackages(loadedPackages);
      setLinks(loadedLinks);
    } catch (error) {
      console.error('Failed to load data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePackageSelect = (pkg: LinkPackage) => {
    setSelectedPackage(pkg);
    setCurrentView('editor');
  };

  const handleCreatePackage = async (name: string) => {
    const newPackage = await LocalPackageStorage.savePackage({
      name,
      linkIds: [],
    });
    setSelectedPackage(newPackage);
    setPackages([...packages, newPackage]);
    setCurrentView('editor');
  };

  const handleDeletePackage = async (packageId: string) => {
    await LocalPackageStorage.deletePackage(packageId);
    const updatedPackages = packages.filter(p => p.id !== packageId);
    setPackages(updatedPackages);
    setCurrentView('list');
  };

  const handlePackageUpdated = async () => {
    const updatedPackages = await LocalPackageStorage.getAllPackages();
    setPackages(updatedPackages);
  };

  const handleImportComplete = async () => {
    await loadData();
    setCurrentView('list');
  };

  if (loading) {
    return (
      <div className="p-10 text-center flex flex-col items-center justify-center h-full">
        <p className="text-gray-500">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col bg-white min-h-full">
      {currentView === 'list' && (
        <PackageList
          packages={packages}
          onSelectPackage={handlePackageSelect}
          onCreatePackage={handleCreatePackage}
          onDeletePackage={handleDeletePackage}
          onViewSingleShare={() => setCurrentView('single')}
          onViewImport={() => setCurrentView('import')}
          links={links}
        />
      )}

      {currentView === 'editor' && selectedPackage && (
        <PackageEditor
          package={selectedPackage}
          links={links}
          onBack={() => {
            setCurrentView('list');
            setSelectedPackage(null);
          }}
          onPackageUpdated={handlePackageUpdated}
        />
      )}

      {currentView === 'single' && (
        <SingleLinkShare
          links={links}
          onBack={() => setCurrentView('list')}
        />
      )}

      {currentView === 'import' && (
        <ImportLinks
          onBack={() => setCurrentView('list')}
          onImportComplete={handleImportComplete}
        />
      )}
    </div>
  );
};

export default Share;
