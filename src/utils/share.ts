import { LinkPackage, LinkWithConditions, LinkPackageWithLinks, } from "@/types";
import { LocalLinksStorage } from "./storage/local_links_storage";
import { LocalPackageStorage } from "./storage/local_package_storage";


/////////////////////////////////////////////////////////// Importing / Exporting with Base64

type CanBase64Import = LinkPackageWithLinks | LinkWithConditions;

export async function importFromBase64(encoded: string) {
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
    await LocalLinksStorage.saveLinks(pkg.links);
    await LocalPackageStorage.savePackage(pkg);
  } else if ('conditions' in data && Array.isArray((data as any).conditions)) {
    await LocalLinksStorage.saveLinks([data as LinkWithConditions]);
  } else {
    throw new Error('Invalid format: must be a link package or single link');
  }
}

export async function exportToBase64(data: LinkPackage | LinkWithConditions): Promise<string> {
  const exportData: CanBase64Import = 'conditions' in data
    ? data as LinkWithConditions
    : { ...data as LinkPackage, links: await LocalLinksStorage.getLinksWithIds(data.linkIds) };
  const jsonString = JSON.stringify(exportData);
  return btoa(jsonString);
}

/////////////////////////////////////////////////////////// Importing / Exporting with Supabase

export function fetchRemoteLinks(id: string) {
  // TODO: Implement remote fetching from Supabase
}

export function publishLinksRemotely(links: LinkPackage | LinkWithConditions) {
  // TODO: Implement remote publishing to Supabase
}
