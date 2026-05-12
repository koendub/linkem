import { LinkPackage, LinkPackageWithLinks, LinkWithConditions, LocalUserSettingsValues, UnstoredLinkPackage, UnstoredLinkWithConditions } from "@/core/types/extra_types";
import { LocalIdStorageDict, LocalStorageDict } from "../utils/storage_dict";

// Settings:

export const settingsStorage = new LocalStorageDict<LocalUserSettingsValues>('linkem_settings', { default_link_position: 'next_to_text' });

settingsStorage.getItem('localUserId').then(id => {
  if (!id) {
    const newId = 'local-' + crypto.randomUUID();
    settingsStorage.updateItems({ localUserId: newId });
  }
});

// Links:

export class LocalLinksStorage extends LocalIdStorageDict<LinkWithConditions> {
  async updateLinks(links: (LinkWithConditions | UnstoredLinkWithConditions)[]): Promise<void> {
    // If needed, assign IDs and creation timestamps and such
    const now = new Date().toISOString();
    const localUserId = await settingsStorage.getItem('localUserId');
    const readyLinks = links.map(link => {
      return {
        id: localUserId + '-' + crypto.randomUUID(),
        user_id: localUserId,
        created_at: now,
        ...link,
        updated_at: now,
      } as LinkWithConditions;
    });
    // Then group by host and save to storage
    await this.updateValues(readyLinks);
  }
}

export const linksStorage = new LocalLinksStorage('linkem_links');

// Link packages

export class LocalPackageStorage extends LocalIdStorageDict<LinkPackage> {
  async savePackage(pkg: UnstoredLinkPackage | LinkPackage | LinkPackageWithLinks): Promise<LinkPackage> {
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
    const links = Object.values(await linksStorage.getItems(storePkg.linkIds));
    if (links.length !== storePkg.linkIds.length) {
      throw new Error('One or more links in the package do not exist!');
    }
    // Then just store it
    await this.updateItems({ [storePkg.id]: storePkg });
    return storePkg;
  }

  async addLinkToPackage(packageId: string, linkId: string): Promise<void> {
    const pkg: LinkPackage | undefined = await this.getItem(packageId);
    if (!pkg) throw new Error('Package not found');
    if (pkg.linkIds.includes(linkId)) throw new Error('Link already in package');
    pkg.linkIds.push(linkId);
    await this.updateItems({ [packageId]: pkg });
  }

  async removeLinkFromPackage(packageId: string, linkId: string): Promise<void> {
    const pkg: LinkPackage | undefined = await this.getItem(packageId);
    if (!pkg) throw new Error('Package not found');
    if (!pkg.linkIds.includes(linkId)) throw new Error('Link not in package');
    pkg.linkIds = pkg.linkIds.filter(id => id !== linkId);
    await this.updateItems({ [packageId]: pkg });
  }
}

export const packagesStorage = new LocalPackageStorage('linkem_packages');
