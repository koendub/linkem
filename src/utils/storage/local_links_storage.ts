import { LinkWithConditions, UnstoredLinkWithConditions } from '@/types';
import { LocalStorageDict, settingsStorage } from './local_base_storage';


export function getLinkHost(link: LinkWithConditions): string {
  const hostConditions = link.conditions.filter(c => c.type === 'url_start');
  if (hostConditions.length === 0) return '*';
  if (hostConditions.length > 1) {
    console.warn(`Link ${link.id} has multiple url_start conditions, which should not happen!`);
  }
  const smallest = hostConditions.reduce((sm, cur) => {
    return cur.value.length < sm.value.length ? cur : sm;
  }, link.conditions[0]);
  return new URL(smallest.value).host;
}

export function getLinksForHostMap(allLinks: LinkWithConditions[]): Map<string, LinkWithConditions[]> {
  const map = new Map<string, LinkWithConditions[]>();
  allLinks.forEach(link => {
    const host = getLinkHost(link);
    if (!map.has(host)) map.set(host, []);
    map.get(host)!.push(link);
  });
  return map;
}

export class LocalLinksStorage {
  private static storage = new LocalStorageDict<{ [linkId: string]: LinkWithConditions }>('linkem_links');

  static async getAllLinks(): Promise<LinkWithConditions[]> {
    return Object.values(await this.storage.getValue() || {}).flat();
  }

  static async getLinksWithIds(ids: string[]): Promise<LinkWithConditions[]> {
    const dict = await this.storage.getValue() || {};
    return ids.map(id => dict[id]);
  }

  static async saveLinks(links: (LinkWithConditions | UnstoredLinkWithConditions)[]) {
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
    await this.storage.updateItems(Object.fromEntries(readyLinks.map(link => [link.id, link])));
  }

  static async deleteLink(linkId: string): Promise<void> {
    await this.storage.removeItem(linkId);
  }
}
