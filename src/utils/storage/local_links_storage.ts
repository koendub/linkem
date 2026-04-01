import { CustomLink } from '../../models';

export class LocalLinksStorage {
  private static readonly STORAGE_KEY = 'linkem_links';

  static async getAllLinks(): Promise<CustomLink[]> {
    const result = await browser.storage.local.get(this.STORAGE_KEY);
    // @ts-ignore
    const links: CustomLink[] = result[this.STORAGE_KEY] || [];
    return links.map((link: any) => ({
      ...link,
      createdAt: new Date(link.createdAt)
    }));
  }

  static async saveLink(link: CustomLink | Omit<CustomLink, 'id'>): Promise<CustomLink> {
    const links = await this.getAllLinks();
    let addedLink: CustomLink;
    if ('id' in link && link.id) {
      // Update existing link
      const existingIndex = links.findIndex(l => l.id === link.id);
      links[existingIndex] = link as CustomLink;
      addedLink = link as CustomLink;
    } else {
      // Add new link
      const newLink = { ...link, id: crypto.randomUUID() };
      links.push(newLink as CustomLink);
      addedLink = newLink as CustomLink;
    }
    // Convert dates back to strings before saving (JSON doesn't support Date objects)
    const linksToSave = links.map(l => ({
      ...l,
      createdAt: l.createdAt instanceof Date ? l.createdAt.toISOString() : l.createdAt
    }));
    await browser.storage.local.set({ [this.STORAGE_KEY]: linksToSave });
    return addedLink;
  }

  static async deleteLink(linkId: string): Promise<void> {
    const links = await this.getAllLinks();
    const filtered = links.filter(l => l.id !== linkId);
    await browser.storage.local.set({ [this.STORAGE_KEY]: filtered });
  }
}
