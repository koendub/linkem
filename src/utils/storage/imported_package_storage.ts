import { LinkWithConditions } from '@/types';

export interface ImportedPackage {
  id: string;
  name: string;
  linkIds: string[];
  importedAt: string;
}

export class ImportedPackageStorage {
  private static readonly STORAGE_KEY = 'linkem_imported_packages';

  static async getAllImportedPackages(): Promise<ImportedPackage[]> {
    const result = await browser.storage.local.get(this.STORAGE_KEY);
    // @ts-ignore
    const packages: ImportedPackage[] = result[this.STORAGE_KEY] || [];
    return packages;
  }

  static async saveImportedPackage(
    name: string,
    linkIds: string[]
  ): Promise<ImportedPackage> {
    const packages = await this.getAllImportedPackages();

    const newPackage: ImportedPackage = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      linkIds,
      importedAt: new Date().toISOString(),
    };

    packages.push(newPackage);
    await browser.storage.local.set({ [this.STORAGE_KEY]: packages });
    return newPackage;
  }

  static async deleteImportedPackage(packageId: string): Promise<void> {
    const packages = await this.getAllImportedPackages();
    const filtered = packages.filter(p => p.id !== packageId);
    await browser.storage.local.set({ [this.STORAGE_KEY]: filtered });
  }

  static async getImportedPackageById(packageId: string): Promise<ImportedPackage | null> {
    const packages = await this.getAllImportedPackages();
    const pkg = packages.find(p => p.id === packageId);
    return pkg || null;
  }
}
