import { ExportedLinkPackage, ExportedLink, LinkPackage, LinkWithConditions, UnstoredLinkWithConditions, } from "@/types";


/**
 * Decode a base64 string to a typed object
 */
export function decodeFromBase64<T>(encoded: string): T {
  try {
    const jsonString = atob(encoded);
    return JSON.parse(jsonString) as T;
  } catch (e) {
    throw new Error('Invalid base64 string or JSON format');
  }
}

/**
 * Import links from base64 encoded string
 * Returns the decoded data in its exported format
 */
export function importFromBase64(encoded: string): ExportedLinkPackage | ExportedLink {
  const data = decodeFromBase64<unknown>(encoded);
  if (typeof data !== 'object' || data === null) {
    throw new Error('Invalid format: data is not an object');
  }
  if ('links' in data && Array.isArray((data as any).links)) {
    return data as ExportedLinkPackage;
  } else if ('conditions' in data && Array.isArray((data as any).conditions)) {
    return data as ExportedLink;
  } else {
    throw new Error('Invalid format: must be a link package or single link');
  }
}

/**
 * Convert a link or package to its exported format
 */
function convertToExportFormat(data: LinkPackage | LinkWithConditions, allLinks: LinkWithConditions[]): ExportedLinkPackage | ExportedLink {
  // Check if it's a LinkPackage
  if ('linkIds' in data) {
    const pkg = data as LinkPackage;
    const packageLinks = allLinks
      .filter(link => pkg.linkIds.includes(link.id))
      .map((link): ExportedLink => ({
        name: link.name,
        href_path_format: link.href_path_format,
        display_name: link.display_name,
        on_xpath: link.on_xpath,
        on_selected_text_regex: link.on_selected_text_regex,
        position: link.position,
        icon: link.icon,
        visibility: link.visibility,
        conditions: link.conditions.map(c => ({
          type: c.type,
          value: c.value,
        })),
      }));
    return {
      name: pkg.name,
      links: packageLinks,
    };
  } else {
    // It's a LinkWithConditions
    const link = data as LinkWithConditions;
    return {
      name: link.name,
      href_path_format: link.href_path_format,
      display_name: link.display_name,
      on_xpath: link.on_xpath,
      on_selected_text_regex: link.on_selected_text_regex,
      position: link.position,
      icon: link.icon,
      visibility: link.visibility,
      conditions: link.conditions.map(c => ({
        type: c.type,
        value: c.value,
      })),
    };
  }
}

/**
 * Export a link or package to base64 string
 * @param data The link or package to export
 * @param allLinks Required for package export - list of all links to filter for the package
 */
export function exportToBase64(data: LinkPackage | LinkWithConditions, allLinks: LinkWithConditions[]): string {
  const exportData = convertToExportFormat(data, allLinks);
  const jsonString = JSON.stringify(exportData);
  return btoa(jsonString);
}

/**
 * Generate export data for a link or package
 * Useful for components that need the export format before encoding
 */
export function generateExportData(data: LinkPackage | LinkWithConditions, allLinks: LinkWithConditions[]): ExportedLinkPackage | ExportedLink {
  return convertToExportFormat(data, allLinks);
}

/**
 * Convert exported link format to internal UnstoredLinkWithConditions format
 */
export function convertExportedLinkToInternal(link: ExportedLink): UnstoredLinkWithConditions {
  return {
    name: link.name,
    href_path_format: link.href_path_format,
    display_name: link.display_name,
    on_xpath: link.on_xpath,
    on_selected_text_regex: link.on_selected_text_regex,
    position: link.position,
    icon: link.icon,
    visibility: link.visibility,
    conditions: link.conditions as any,
  };
}

export function fetchRemoteLinks(id: string) {
  // TODO: Implement remote fetching from Supabase
}

export function publishLinksRemotely(links: LinkPackage | LinkWithConditions) {
  // TODO: Implement remote publishing to Supabase
}
