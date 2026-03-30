import { UserSettings } from '@/models/UserSettings';
import { CustomLink } from '../models';

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

  static async saveLink(link: CustomLink | Omit<CustomLink, 'id'>): Promise<CustomLink> {
    const links = await this.getAllLinks();
    let addedLink: CustomLink;
    if ('id' in link && link.id) {
      // Update existing link
      const existingIndex = links.findIndex(l => l.id === link.id);
      links[existingIndex] = link;
      addedLink = link as CustomLink;
    } else {
      // Add new link
      const newLink = { ...link, id: crypto.randomUUID() };
      links.push(newLink);
      addedLink = newLink as CustomLink;
    }
    await browser.storage.local.set({ [this.STORAGE_KEY]: links });
    return addedLink;
  }

  static async deleteLink(linkId: string): Promise<void> {
    const links = await this.getAllLinks();
    const filtered = links.filter(l => l.id !== linkId);
    await browser.storage.local.set({ [this.STORAGE_KEY]: filtered });
  }
}

export class SettingsStorage {
  private static readonly STORAGE_KEY = 'linkem_settings';

  static async getSettings(): Promise<UserSettings> {
    const result = await browser.storage.local.get(this.STORAGE_KEY);
    // @ts-ignore
    return result[this.STORAGE_KEY] || { defaultLinkPosition: 'next_to_text' };
  }

  static async saveSettings(settings: UserSettings): Promise<void> {
    await browser.storage.local.set({ [this.STORAGE_KEY]: settings });
  }
}