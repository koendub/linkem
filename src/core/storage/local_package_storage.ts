import { LinkPackage, LinkPackageWithLinks, UnstoredLinkPackage } from '@/core/types';
import { LocalStorageDict, settingsStorage } from './local_base_storage';
import { LocalLinksStorage } from './local_links_storage';


export class LocalPackageStorage {
  static storage = new LocalStorageDict<{ [packageId: string]: LinkPackage }>('linkem_packages');

  static async getAllPackages(): Promise<{ [packageId: string]: LinkPackage }> {
    return await this.storage.getValue() || {};
  }

  static async savePackage(pkg: UnstoredLinkPackage | LinkPackage | LinkPackageWithLinks): Promise<LinkPackage> {
    // If needed, assign IDs and creation timestamps and such
    const now = new Date().toISOString();
    const localUserId = await settingsStorage.getItem('localUserId');
    const storePkg = {
        id: 'id' in pkg ? pkg.id : (localUserId + '-' + crypto.randomUUID()),
        user_id: 'user_id' in pkg ? pkg.user_id : localUserId,
        created_at: 'created_at' in pkg ? pkg.created_at : now,
        updated_at: now,
        name: pkg.name,
        linkIds: 'linkIds' in pkg ? pkg.linkIds : 'links' in pkg ? pkg.links.map(l => l.id) : [],
    } as LinkPackage;
    // To verify, make sure the given links exist
    const links = await LocalLinksStorage.getLinksWithIds(storePkg.linkIds);
    if (links.length !== storePkg.linkIds.length) {
      throw new Error('One or more links in the package do not exist!');
    }
    // Then just store it
    await this.storage.updateItems({ [storePkg.id]: storePkg });
    return storePkg;
  }

  static async deletePackage(packageId: string): Promise<void> {
    await this.storage.removeItem(packageId);
  }

  static async addLinkToPackage(packageId: string, linkId: string): Promise<void> {
    const pkg: LinkPackage | undefined = await this.storage.getItem(packageId);
    if (!pkg) throw new Error('Package not found');
    if (pkg.linkIds.includes(linkId)) throw new Error('Link already in package');
    pkg.linkIds.push(linkId);
    await this.storage.updateItems({ [packageId]: pkg });
  }

  static async removeLinkFromPackage(packageId: string, linkId: string): Promise<void> {
    const pkg: LinkPackage | undefined = await this.storage.getItem(packageId);
    if (!pkg) throw new Error('Package not found');
    if (!pkg.linkIds.includes(linkId)) throw new Error('Link not in package');
    pkg.linkIds = pkg.linkIds.filter(id => id !== linkId);
    await this.storage.updateItems({ [packageId]: pkg });
  }
}