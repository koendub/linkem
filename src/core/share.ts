import { LinkPackage, LinkWithConditions, LinkPackageWithLinks, } from "@/core/types";
import { linksStorage, packagesStorage } from "./storage/local_storage";


/////////////////////////////////////////////////////////// Importing / Exporting with Base64

type CanBase64Import = LinkPackageWithLinks | LinkWithConditions;

export async function importFromBase64(encoded: string): Promise<LinkWithConditions[]> {
  // Decode base64 and parse JSON
  let data: CanBase64Import | null = null;
  try {
    const jsonString = atob(encoded);
    data = JSON.parse(jsonString);
  } catch (e) {
    throw new Error('Invalid base64 string or JSON format');
  }
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid format: data is not an object');
  }
  // Then actually import the package or link
  if ('links' in data && Array.isArray((data as any).links)) {
    const pkg = data as LinkPackageWithLinks;
    await linksStorage.updateLinks(pkg.links);
    await packagesStorage.savePackage(pkg);
    return pkg.links;
  } else if ('conditions' in data && Array.isArray((data as any).conditions)) {
    const lnk = data as LinkWithConditions;
    await linksStorage.updateLinks([lnk]);
    return [lnk];
  } else {
    throw new Error('Invalid format: must be a link package or single link');
  }
}

export async function exportToBase64(data: LinkPackage | LinkWithConditions): Promise<string> {
  const exportData: CanBase64Import = 'conditions' in data
    ? data as LinkWithConditions
    : { ...data as LinkPackage, links: Object.values(await linksStorage.getItems(data.linkIds)) };
  const jsonString = JSON.stringify(exportData);
  return btoa(jsonString);
}

export async function exportToBase64ShareableLink(data: LinkPackage | LinkWithConditions): Promise<string> {
  const base64 = await exportToBase64(data);
  const messageTransformerPrefix = 'https://buffer-flow.github.io/#/msg?for=linkem&name=import-link&base64=';
  return `${messageTransformerPrefix}${base64}`; // TODO: could still add redirect url option with query parameter &redirectUrl=
}

/////////////////////////////////////////////////////////// Importing / Exporting with Supabase

export function fetchRemoteLinks(id: string) {
  // TODO: Implement remote fetching from Supabase
}

export function publishLinksRemotely(links: LinkPackage | LinkWithConditions) {
  // TODO: Implement remote publishing to Supabase
}
