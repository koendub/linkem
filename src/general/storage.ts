import { CustomLink } from './models';

export class LinksStorage {
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

  static async saveLink(link: CustomLink): Promise<void> {
    const links = await this.getAllLinks();
    const existingIndex = links.findIndex(l => l.id === link.id);
    if (existingIndex >= 0) {
      links[existingIndex] = link;
    } else {
      links.push(link);
    }
    await browser.storage.local.set({ [this.STORAGE_KEY]: links });
  }

  static async deleteLink(linkId: string): Promise<void> {
    const links = await this.getAllLinks();
    const filtered = links.filter(l => l.id !== linkId);
    await browser.storage.local.set({ [this.STORAGE_KEY]: filtered });
  }

  static async updateLink(linkId: string, updates: Partial<CustomLink>): Promise<void> {
    const links = await this.getAllLinks();
    const link = links.find(l => l.id === linkId);
    if (link) {
      Object.assign(link, updates);
      await this.saveLink(link);
    }
  }
}