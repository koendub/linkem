import { LinkPackage, UnstoredLinkPackage } from '@/types';

export class LocalPackageStorage {
  private static readonly STORAGE_KEY = 'linkem_packages';

  static async getAllPackages(): Promise<LinkPackage[]> {
    const result = await browser.storage.local.get(this.STORAGE_KEY);
    // @ts-ignore
    const packages: LinkPackage[] = result[this.STORAGE_KEY] || [];
    return packages;
  }

  static async savePackage(pkg: UnstoredLinkPackage | LinkPackage): Promise<LinkPackage> {
    const packages = await this.getAllPackages();
    let savedPackage: LinkPackage;

    if ('id' in pkg && pkg.id) {
      // Update existing package
      const existingIndex = packages.findIndex(p => p.id === pkg.id);
      const existingPackage = packages[existingIndex];
      if (existingIndex >= 0) {
        savedPackage = {
          ...pkg,
          created_at: existingPackage.created_at,
          updated_at: new Date().toISOString(),
          user_id: existingPackage.user_id,
        } as LinkPackage;
        packages[existingIndex] = savedPackage;
      } else {
        throw new Error('Package not found');
      }
    } else {
      // Add new package
      const newPackage: LinkPackage = {
        ...pkg,
        id: Math.random().toString(36).substr(2, 9), // Short random ID
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString(),
        user_id: 'local-user', // placeholder for local storage
      };
      packages.push(newPackage);
      savedPackage = newPackage;
    }

    await browser.storage.local.set({ [this.STORAGE_KEY]: packages });
    return savedPackage;
  }

  static async deletePackage(packageId: string): Promise<void> {
    const packages = await this.getAllPackages();
    const filtered = packages.filter(p => p.id !== packageId);
    await browser.storage.local.set({ [this.STORAGE_KEY]: filtered });
  }

  static async addLinkToPackage(packageId: string, linkId: string): Promise<LinkPackage> {
    const packages = await this.getAllPackages();
    const pkg = packages.find(p => p.id === packageId);
    
    if (!pkg) {
      throw new Error('Package not found');
    }

    if (!pkg.linkIds.includes(linkId)) {
      pkg.linkIds.push(linkId);
    }

    await browser.storage.local.set({ [this.STORAGE_KEY]: packages });
    return pkg;
  }

  static async removeLinkFromPackage(packageId: string, linkId: string): Promise<LinkPackage> {
    const packages = await this.getAllPackages();
    const pkg = packages.find(p => p.id === packageId);
    
    if (!pkg) {
      throw new Error('Package not found');
    }

    pkg.linkIds = pkg.linkIds.filter(id => id !== linkId);
    await browser.storage.local.set({ [this.STORAGE_KEY]: packages });
    return pkg;
  }
}
