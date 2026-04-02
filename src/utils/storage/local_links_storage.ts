import { Link, Condition, LinkWithConditions, UnstoredLinkWithConditions } from '@/types';

export class LocalLinksStorage {
  private static readonly STORAGE_KEY = 'linkem_links';

  static async getAllLinks(): Promise<LinkWithConditions[]> {
    const result = await browser.storage.local.get(this.STORAGE_KEY);
    // @ts-ignore
    const links: LinkWithConditions[] = result[this.STORAGE_KEY] || [];
    return links;
  }

  static async saveLink(link: LinkWithConditions | UnstoredLinkWithConditions): Promise<LinkWithConditions> {
    const links = await this.getAllLinks();
    let addedLink: LinkWithConditions;
    if ('id' in link && link.id) {
      // Update existing link
      const existingIndex = links.findIndex(l => l.id === link.id);
      links[existingIndex] = link as LinkWithConditions;
      addedLink = link as LinkWithConditions;
    } else {
      // Add new link
      const newLink = {
        ...link,
        id: 'local-' + crypto.randomUUID(),
        user_id: 'local-user', // placeholder for local storage
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      links.push(newLink as LinkWithConditions);
      addedLink = newLink as LinkWithConditions;
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
